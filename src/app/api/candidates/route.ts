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
    if (!Array.isArray(repos) || repos.length === 0) return `\n GITHUB ՊՈՐՏՖՈԼԻՈ: @${username} (0 հանրային ռեպոզիտորիա)\n`;

    const repoList = repos
      .map((r: any) => `- ${r.name} (${r.language || "N/A"}, ${r.stargazers_count}): ${r.description || "Առանց նկարագրության"}`)
      .join("\n");

    return `\n🐙 GITHUB ՊՈՐՏՖՈԼԻՈ (Թեկնածուի @${username} էջի ռեպոզիտորիաները):\n${repoList}\n`;
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formId, firstName, lastName, email, phone, answers, trustScore, cheatLogs, timeSpent } = body;
    if (!formId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Պարտադիր դաշտերը լրացված չեն" }, { status: 400 });
    }
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { questions: true }
    });
    if (!form) {
      return NextResponse.json({ error: "Հարցաշարը չի գտնվել" }, { status: 404 });
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
        qaText += `Հարց ${index + 1}: ${q.text}\nԹեկնածուի պատասխանը: [Կցված է CV (PDF ֆայլ)]\n\n`;
      } else {
        const answerStr = typeof candidateAnswer === 'object' ? JSON.stringify(candidateAnswer) : candidateAnswer || "Չի պատասխանել";
        qaText += `Հարց ${index + 1}: ${q.text}\nԹեկնածուի պատասխանը: ${answerStr}\n\n`;
        if (typeof answerStr === "string" && answerStr.includes("github.com")) {
          const ghSummary = await fetchGitHubSummary(answerStr);
          if (ghSummary) githubTextCombined += ghSummary;
        }
      }
    }

    let strictnessPrompt = "";
    if (form.aiEvaluationMode === "STRICT") {
      strictnessPrompt = "Դու ՇԱՏ ԽԻՍՏ գնահատող ես: Ամեն մի փոքր սխալի համար իջեցրու միավորը:";
    } else if (form.aiEvaluationMode === "LENIENT") {
      strictnessPrompt = "Դու ՄԵՂՄ գնահատող ես: Մի իջեցրու միավորը մանր սխալների համար:";
    } else {
      strictnessPrompt = "Դու ՕԲՅԵԿՏԻՎ գնահատող ես: Տուր արդար և ճշգրիտ գնահատական:";
    }

    const systemPrompt = `Դու HR-ի ավագ փորձագետ և տեխնիկական հարցազրուցավար ես:

ՍՏՈՒԳՄԱՆ ՌԵԺԻՄ: ${strictnessPrompt}

ՀԱՍՏԻՔԻ ՆԿԱՐԱԳԻՐՆ ՈՒ ՊԱՀԱՆՋՆԵՐԸ (Job Description):
${form.jobDescription || "Ընդհանուր մասնագիտական հմտություններ"}

ՀՐԱՀԱՆԳՆԵՐ ԳՆԱՀԱՏՄԱՆ ՀԱՄԱՐ:
1. ԽՈՐՈՒԹՅԱՄԲ ՈՒՍՈՒՄՆԱՍԻՐԻՐ թեկնածուի պատասխանները, կցված ռեզյումեն/CV-ն (եթե առկա է) և GitHub ռեպոզիտորիաները:
2. Եթե ռեզյումե/CV է տրամադրված, ՀԱՏՈՒԿ ՈՒՇԱԴՐՈՒԹՅՈՒՆ ԴԱՐՁՐՈՒ ռեզյումեի աշխատանքային փորձին, տեխնոլոգիական stack-ին, նախագծերին և կրթությանը:
3. Տուր ԽՈՐԸ, ԲՈՎԱՆԴԱԿԱԼԻՑ ՈՒ ՄԱՆՐԱՄԱՍՆ HR վերլուծություն (5-7 նախադասություն):
   - 📄 CV & Փորձառության Վերլուծություն: Ինչպիսի՞ն է թեկնածուի աշխատանքային փորձը ռեզյումեում, քանի՞ տարվա փորձ ունի և ինչ stack-ի է տիրապետում:
   - 💻 Պատասխանների & GitHub-ի Վերլուծություն: Ունի՞ իրական նախագծեր GitHub-ում, ինչպե՞ս է պատասխանել տեխնիկական հարցերին:
   - 🎯 Համապատասխանություն & Ուժեղ/Թույլ Կողմեր: Որքանո՞վ է համապատասխանում հաստիքի պահանջներին (Job Description):
   - 📌 Վերջնական HR Եզրակացություն: Արդյո՞ք արժե հրավիրել հարցազրույցի:

ՎԵՐԱԴԱՐՁՐՈՒ ՄԻԱՅՆ JSON (առանց Markdown formatting-ի):
{
  "score": (0-100 ամբողջ թիվ),
  "summary": "(Մանրամասն, բովանդակալից, խորացված HR վերլուծություն 5-7 նախադասությամբ, ներառյալ CV-ի և պատասխանների գնահատականը)"
}`;

    let aiScore = 0;
    let aiSummary = "AI գնահատում չի կատարվել";
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: { responseMimeType: "application/json" }
      });

      const fullPromptText = `${systemPrompt}\n\nԹԵԿՆԱԾՈՒԻ ՏՎՅԱԼՆԵՐԸ ԵՎ ՊԱՏԱՍԽԱՆՆԵՐԸ:\n${qaText}${githubTextCombined}`;
      const contents: any[] = [fullPromptText, ...pdfInlineParts];

      const result = await model.generateContent(contents);
      const text = result.response.text();

      const aiResponse = JSON.parse(text || "{}");
      aiScore = aiResponse.score || 0;
      aiSummary = aiResponse.summary || "Գնահատում հնարավոր չեղավ անել";
    } catch (aiError: any) {
      console.error("Gemini Սխալ:", aiError);
      aiSummary = "AI գնահատումը ձախողվեց: Խնդիր կապի կամ բանալիի հետ:";
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
    return NextResponse.json({ message: "Հաջողությամբ պահպանվեց", candidateId: newCandidate.id }, { status: 201 });
  } catch (error) {
    console.error("Թեկնածուի պահպանման սխալ:", error);
    return NextResponse.json({ error: "Սխալ տվյալների պահպանման ժամանակ" }, { status: 500 });
  }
}