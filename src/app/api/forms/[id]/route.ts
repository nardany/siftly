import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await prisma.form.findUnique({
      where: { id: id },
      include: { questions: true }
    });

    if (!form || form.userId !== user.id) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const existingForm = await prisma.form.findUnique({ where: { id: id } });
    if (!existingForm || existingForm.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update basic form details
    await prisma.form.update({
      where: { id: id },
      data: {
        title: body.title,
        themeColor: body.themeColor,
        jobDescription: body.jobDescription,
        aiEvaluationMode: body.aiEvaluationMode || "NORMAL",
        inviteTemplate: body.inviteTemplate || null,
        rejectTemplate: body.rejectTemplate || null,
      },
    });

    const currentQuestions = await prisma.question.findMany({ where: { formId: id } });
    const currentQuestionIds = new Set(currentQuestions.map((q) => q.id));
    const submittedQuestionIds = new Set(
      body.questions.map((q: any) => q.id).filter((qid: string) => qid && currentQuestionIds.has(qid))
    );

    // Only delete questions that are no longer in the payload AND have no answers attached
    const questionsToDelete = currentQuestions.filter((q) => !submittedQuestionIds.has(q.id));
    for (const qToDelete of questionsToDelete) {
      const answerCount = await prisma.answer.count({ where: { questionId: qToDelete.id } });
      if (answerCount === 0) {
        await prisma.question.delete({ where: { id: qToDelete.id } });
      }
    }

    // Upsert or create new questions
    for (const q of body.questions) {
      const formattedOptions =
        typeof q.options === "string"
          ? q.options
          : q.options
          ? JSON.stringify(q.options)
          : null;

      if (q.id && currentQuestionIds.has(q.id)) {
        await prisma.question.update({
          where: { id: q.id },
          data: {
            text: q.text,
            type: q.type,
            options: formattedOptions,
          },
        });
      } else {
        await prisma.question.create({
          data: {
            formId: id,
            text: q.text,
            type: q.type,
            options: formattedOptions,
          },
        });
      }
    }

    const updatedForm = await prisma.form.findUnique({
      where: { id },
      include: { questions: true },
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error("PUT database error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const user = await getUserFromToken();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existingForm = await prisma.form.findUnique({ where: { id: id } });
    if (!existingForm || existingForm.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.question.deleteMany({
      where: { formId: id }
    });

    await prisma.form.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}