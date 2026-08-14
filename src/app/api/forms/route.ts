import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getUserFromToken } from "../../../lib/auth";

export async function POST(request: Request) {
  const userPayload = await getUserFromToken();
  if (!userPayload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, themeColor, questions, jobDescription, aiEvaluationMode, inviteTemplate, rejectTemplate } = body;

  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const slug = `${baseSlug || "form"}-${Math.random().toString(36).substring(2, 7)}`;

  try {
    const newForm = await prisma.form.create({
      data: {
        title: title,
        slug: slug,
        themeColor: themeColor,
        jobDescription: jobDescription,
        aiEvaluationMode: aiEvaluationMode || "NORMAL",
        inviteTemplate: inviteTemplate || null,
        rejectTemplate: rejectTemplate || null,
        userId: userPayload.id,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            type: q.type,
            options: q.options || null
          }))
        }
      }
    });

    return NextResponse.json({ message: "Հարցաշարը ստեղծվեց", slug: newForm.slug }, { status: 201 });
  } catch (error) {
    console.error("Հարցաշարի պահպանման սխալ:", error);
    return NextResponse.json({ error: "Սխալ տվյալների պահպանման ժամանակ" }, { status: 500 });
  }
}