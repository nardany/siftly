import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
      .map((r: any) => `- ${r.name} (${r.language || "N/A"}, ${r.stargazers_count} stars): ${r.description || "No description"}`)
      .join("\n");

    return `\n🐙 GITHUB PORTFOLIO (@${username}):\n${repoList}\n`;
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formId, firstName, lastName, email, phone, answers, trustScore, cheatLogs, timeSpent } = body;
    if (!formId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Required fields are missing" }, { status: 400 });
    }
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { questions: true }
    });
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    let qaText = "";
    const pdfInlineParts: any[] = [];
    let githubTextCombined = "";

    for (let index = 0; index < form.questions.length; index++) {
      const q = form.questions[index];
      const candidateAnswer = answers[q.id];

      if (typeof candidateAnswer === "string" && candidateAnswer.startsWith("data:application/pdf;base64,")) {
        const base64Data = candidateAnswer.replace(/^data:application\/pdf;base64,/, "");
        pdfInlineParts.push({
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf"
          }
        });
        qaText += `Question ${index + 1}: ${q.text}\nCandidate Answer: [Attached CV (PDF file)]\n\n`;
      } else {
        const answerStr = typeof candidateAnswer === 'object' ? JSON.stringify(candidateAnswer) : candidateAnswer || "No answer provided";
        qaText += `Question ${index + 1}: ${q.text}\nCandidate Answer: ${answerStr}\n\n`;
        if (typeof answerStr === "string" && answerStr.includes("github.com")) {
          const ghSummary = await fetchGitHubSummary(answerStr);
          if (ghSummary) githubTextCombined += ghSummary;
        }
      }
    }

    let strictnessPrompt = "";
    if (form.aiEvaluationMode === "STRICT") {
      strictnessPrompt = "You are a STRICT evaluator. Deduct points for every minor flaw or gap.";
    } else if (form.aiEvaluationMode === "LENIENT") {
      strictnessPrompt = "You are a LENIENT evaluator. Do not penalize minor mistakes heavily.";
    } else {
      strictnessPrompt = "You are an OBJECTIVE evaluator. Give a fair and accurate assessment.";
    }

    const systemPrompt = `You are a Senior Technical HR Interviewer and Candidate Evaluator.

EVALUATION MODE: ${strictnessPrompt}

JOB DESCRIPTION & REQUIREMENTS:
${form.jobDescription || "General professional software development skills"}

INSTRUCTIONS:
1. Thoroughly analyze the candidate's answers, attached PDF resume/CV (if available), and GitHub repositories (if available).
2. Pay special attention to real projects, programming languages, experience, and tech stack alignment with the Job Description.
3. Write a detailed, professional HR summary report (4-6 sentences). Write the report in the primary language of the Job Description or candidate responses (English or Armenian).
4. Outline key strengths, potential gaps, and a final recommendation.

RETURN ONLY VALID JSON (no markdown formatting):
{
  "score": (integer 0-100),
  "summary": "(Detailed 4-6 sentence HR analytical summary)"
}`;

    let aiScore = 0;
    let aiSummary = "AI evaluation was not performed";
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: { responseMimeType: "application/json" }
      });

      const fullPromptText = `${systemPrompt}\n\nCANDIDATE DATA & ANSWERS:\n${qaText}${githubTextCombined}`;
      const contents: any[] = [fullPromptText, ...pdfInlineParts];

      const result = await model.generateContent(contents);
      const text = result.response.text();

      const aiResponse = JSON.parse(text || "{}");
      aiScore = aiResponse.score || 0;
      aiSummary = aiResponse.summary || "Could not generate evaluation";
    } catch (aiError: any) {
      console.error("Gemini Error:", aiError);
      aiSummary = "AI evaluation failed. Please check your API key or try again.";
    }

    let resumeUrl: string | null = null;
    const cleanAnswers = { ...answers };
    Object.keys(cleanAnswers).forEach((key) => {
      if (typeof cleanAnswers[key] === "string" && cleanAnswers[key].startsWith("data:application/pdf;base64,")) {
        resumeUrl = cleanAnswers[key];
        cleanAnswers[key] = "[PDF CV Attached]";
      }
    });

    const newCandidate = await prisma.candidate.create({
      data: {
        formId,
        firstName,
        lastName,
        email,
        phone,
        trustScore,
        cheatLogs,
        timeSpent,
        aiScore,
        aiSummary,
        resumeUrl,
        answers: {
          create: Object.entries(cleanAnswers).map(([questionId, value]) => ({
            questionId,
            value: typeof value === "string" ? value : JSON.stringify(value)
          }))
        }
      }
    });
    return NextResponse.json({ message: "Candidate submitted successfully", candidateId: newCandidate.id }, { status: 201 });
  } catch (error) {
    console.error("Candidate save error:", error);
    return NextResponse.json({ error: "Error saving candidate data" }, { status: 500 });
  }
}