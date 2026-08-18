import { NextResponse } from "next/server";
import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function fetchGitHubSummary(text: string): Promise<string> {
  const match = text.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
  if (!match) return "";
  const username = match[1];
  const reserved = ["about", "features", "pricing", "login", "signup", "explore", "trending", "orgs", "settings"];
  if (reserved.includes(username.toLowerCase())) return "";

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
      headers: { "User-Agent": "Siftly-App" },
    });
    if (!res.ok) return "";
    const repos = await res.json();
    if (!Array.isArray(repos) || repos.length === 0) return `\n GITHUB PORTFOLIO: @${username} (0 public repositories)\n`;

    const repoList = repos
      .map((r: any) => `- ${r.name} (${r.language || "N/A"}, ⭐${r.stargazers_count}): ${r.description || "No description"}`)
      .join("\n");

    return `\nGITHUB PORTFOLIO (@${username}):\n${repoList}\n`;
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { formUrl, aiEvaluationMode, jobDescription, forceReevaluate } = await req.json();

  if (!formUrl) {
    return NextResponse.json({ error: "Google Forms URL is required" }, { status: 400 });
  }

  // Google Forms API strictly requires the internal Edit Form ID
  const editMatch = formUrl.match(/\/forms\/d\/([a-zA-Z0-9_-]+)\/edit/);
  const genericMatch = formUrl.match(/\/forms\/d\/(?!e\/)([a-zA-Z0-9_-]+)/);
  const googleFormId = editMatch ? editMatch[1] : genericMatch ? genericMatch[1] : null;

  if (!googleFormId || formUrl.includes("/forms/d/e/")) {
    return NextResponse.json(
      {
        error:
          "Please copy the Google Forms Edit URL from your browser address bar (ending in /edit, e.g. https://docs.google.com/forms/d/.../edit). Google Forms API requires the Edit ID.",
      },
      { status: 400 }
    );
  }

  const tokenRecord = await prisma.googleToken.findUnique({ where: { userId: user.id } });
  if (!tokenRecord) {
    return NextResponse.json(
      { error: "Please connect your Google account first (Connect with Google)" },
      { status: 401 }
    );
  }

  let title = "Google Form";
  let rawQuestions: any[] = [];
  let allResponses: any[] = [];
  let driveClient: any = null;

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
    );

    if (new Date() > tokenRecord.expiresAt) {
      oauth2Client.setCredentials({ refresh_token: tokenRecord.refreshToken });
      const { credentials } = await oauth2Client.refreshAccessToken();
      await prisma.googleToken.update({
        where: { userId: user.id },
        data: {
          accessToken: credentials.access_token!,
          expiresAt: new Date(credentials.expiry_date ?? Date.now() + 3600_000),
        },
      });
      oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: tokenRecord.refreshToken,
      });
    } else {
      oauth2Client.setCredentials({
        access_token: tokenRecord.accessToken,
        refresh_token: tokenRecord.refreshToken,
      });
    }

    const forms = google.forms({ version: "v1", auth: oauth2Client });
    driveClient = google.drive({ version: "v3", auth: oauth2Client });

    const formData = await forms.forms.get({ formId: googleFormId });
    title = formData.data.info?.title || "Google Form";
    rawQuestions = (formData.data.items || []).filter((i: any) => i.questionItem);

    let pageToken: string | undefined = undefined;
    do {
      const resp: any = await forms.forms.responses.list({
        formId: googleFormId,
        pageSize: 500,
        ...(pageToken ? { pageToken } : {}),
      });
      if (resp.data.responses) allResponses.push(...resp.data.responses);
      pageToken = resp.data.nextPageToken ?? undefined;
    } while (pageToken);

  } catch (apiErr: any) {
    console.error("Google Forms API Error:", apiErr);
    return NextResponse.json(
      { error: `Google Forms API error: ${apiErr.message || "Form not found"}` },
      { status: 400 }
    );
  }

  // Get or create Form in DB
  let formRecord = await prisma.form.findFirst({
    where: {
      userId: user.id,
      OR: [
        { googleFormId },
        { slug: { startsWith: `gf-${googleFormId.slice(0, 8)}` } },
      ],
    },
    include: { questions: true },
  });

  if (!formRecord) {
    const slug = `gf-${googleFormId.slice(0, 8)}-${Math.random().toString(36).slice(2, 6)}`;

    formRecord = await prisma.form.create({
      data: {
        title,
        slug,
        themeColor: "#4285f4",
        jobDescription: jobDescription || "",
        aiEvaluationMode: aiEvaluationMode || "NORMAL",
        userId: user.id,
        googleFormId,
        questions: {
          create: rawQuestions.map((item: any) => ({
            text: item.title || "Question",
            type: "text",
          })),
        },
      },
      include: { questions: true },
    });
  }

  let responsesToProcess = allResponses;

  if (!forceReevaluate) {
    const existingResponseIds = new Set(
      (await prisma.candidate.findMany({
        where: { formId: formRecord.id, googleResponseId: { not: null } },
        select: { googleResponseId: true },
      })).map((c) => c.googleResponseId)
    );

    responsesToProcess = allResponses.filter(
      (r) => r.responseId && !existingResponseIds.has(r.responseId)
    );
  }

  if (responsesToProcess.length === 0) {
    return NextResponse.json({
      success: true,
      formId: formRecord.id,
      importedCount: 0,
      message: "No new responses to import",
    });
  }

  let importedCount = 0;
  let lastResponseId = formRecord.lastGoogleResponseId ?? "";

  for (const response of responsesToProcess) {
    const answers: Record<string, string> = {};
    let qaText = "";
    let extractedEmail: string | null = response.respondentEmail || null;
    let extractedName: string | null = null;
    const pdfInlineParts: any[] = [];
    let githubTextCombined = "";

    let googleFormsResumeUrl: string | null = null;

    for (let idx = 0; idx < rawQuestions.length; idx++) {
      const googleItem = rawQuestions[idx];
      const qText = googleItem.title || `Question ${idx + 1}`;
      const qTextLower = qText.toLowerCase();
      const dbQ = formRecord.questions[idx];
      const gQId = googleItem.questionItem?.question?.questionId;

      const answerObj = gQId ? response.answers?.[gQId] : null;

      const textValues = answerObj?.textAnswers?.answers?.map((a: any) => a.value).filter(Boolean) || [];
      const fileUploadAnswers = answerObj?.fileUploadAnswers?.answers || [];

      let value = textValues.length > 0 ? textValues.join(", ") : "No answer provided";

      if (fileUploadAnswers.length > 0 && driveClient) {
        value = "[PDF CV Attached]";
        for (const fileAns of fileUploadAnswers) {
          if (fileAns.fileId) {
            try {
              const fileRes = await driveClient.files.get(
                { fileId: fileAns.fileId, alt: "media" },
                { responseType: "arraybuffer" }
              );
              const base64Data = Buffer.from(fileRes.data as ArrayBuffer).toString("base64");
              googleFormsResumeUrl = `data:application/pdf;base64,${base64Data}`;
              pdfInlineParts.push({
                inlineData: {
                  data: base64Data,
                  mimeType: "application/pdf"
                }
              });
            } catch (fileErr) {
              console.error("Drive file fetch error:", fileErr);
            }
          }
        }
      }

      if (dbQ) {
        answers[dbQ.id] = value;
      }

      if (!extractedEmail && (qTextLower.includes("email") || qTextLower.includes("mail") || qTextLower.includes("փոստ"))) {
        if (value && value.includes("@")) {
          extractedEmail = value.trim();
        }
      }

      if (!extractedName && (qTextLower.includes("անուն") || qTextLower.includes("name"))) {
        if (value && value !== "No answer provided" && value !== "Չի պատասխանել") {
          extractedName = value.trim();
        }
      }

      if (typeof value === "string" && value.includes("github.com")) {
        const ghSummary = await fetchGitHubSummary(value);
        if (ghSummary) githubTextCombined += ghSummary;
      }

      qaText += `Question ${idx + 1}: ${qText}\nAnswer: ${value}\n\n`;
    }

    const finalEmail = extractedEmail || `anon-${response.responseId?.slice(0, 8)}@import`;
    let firstName = "Applicant";
    let lastName = response.responseId?.slice(0, 6) || "—";

    if (extractedName) {
      const parts = extractedName.split(" ").filter(Boolean);
      firstName = parts[0] || "Applicant";
      lastName = parts.slice(1).join(" ") || "—";
    } else if (extractedEmail && !extractedEmail.startsWith("anon-")) {
      const emailName = extractedEmail.split("@")[0].replace(/[._]/g, " ");
      const parts = emailName.split(" ").filter(Boolean);
      firstName = parts[0] || "Applicant";
      lastName = parts.slice(1).join(" ") || "—";
    }

    let aiScore = 0;
    let aiSummary = "AI evaluation was not performed";
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: { responseMimeType: "application/json" },
      });
      const promptText = `You are a Senior Technical HR Evaluator.
Job Description: ${jobDescription || formRecord.jobDescription || "General professional software development skills"}
Mode: ${aiEvaluationMode || formRecord.aiEvaluationMode || "NORMAL"}

INSTRUCTIONS:
1. Thoroughly analyze candidate answers, attached PDF resume/CV (if available), and GitHub repositories (if available).
2. Pay attention to real projects, technical skills, experience, and stack alignment with the Job Description.
3. Write a detailed HR analytical summary (4-6 sentences). Write the summary in the primary language of the Job Description or applicant responses (English or Armenian).

APPLICANT DATA:
${qaText}${githubTextCombined}

RETURN ONLY VALID JSON (no markdown):
{"score": 0-100, "summary": "(Detailed 4-6 sentence HR analytical summary)"}`;
      const contents: any[] = [promptText, ...pdfInlineParts];
      let result;
      try {
        result = await model.generateContent(contents);
      } catch (pdfErr) {
        console.warn("Retrying Gemini evaluation without inline PDF parts:", pdfErr);
        result = await model.generateContent([promptText]);
      }

      const parsed = JSON.parse(result.response.text());
      aiScore = parsed.score ?? 0;
      aiSummary = parsed.summary ?? "";
    } catch (err: any) {
      console.error("Gemini AI Final Error:", err);
      aiSummary = "AI evaluation failed. Please check your API key or try again.";
    }

    if (forceReevaluate && response.responseId) {
      await prisma.candidate.deleteMany({
        where: { formId: formRecord.id, googleResponseId: response.responseId },
      });
    }

    await prisma.candidate.create({
      data: {
        formId: formRecord.id,
        firstName,
        lastName,
        email: finalEmail,
        phone: null,
        trustScore: 100,
        cheatLogs: null,
        timeSpent: 0,
        aiScore,
        aiSummary,
        resumeUrl: googleFormsResumeUrl,
        googleResponseId: response.responseId,
        answers: {
          create: Object.entries(answers).map(([questionId, value]) => ({
            questionId,
            value,
          })),
        },
      },
    });

    if (!lastResponseId || response.responseId > lastResponseId) {
      lastResponseId = response.responseId;
    }
    importedCount++;
  }

  await prisma.form.update({
    where: { id: formRecord.id },
    data: { lastGoogleResponseId: lastResponseId },
  });

  return NextResponse.json({
    success: true,
    formId: formRecord.id,
    importedCount,
    message: `${importedCount} applicant(s) evaluated successfully`,
  });
}