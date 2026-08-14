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

    await prisma.question.deleteMany({
      where: { formId: id }
    });

    const updatedForm = await prisma.form.update({
      where: { id: id },
      data: {
        title: body.title,
        themeColor: body.themeColor,
        jobDescription: body.jobDescription,
        aiEvaluationMode: body.aiEvaluationMode || "NORMAL",
        inviteTemplate: body.inviteTemplate || null,
        rejectTemplate: body.rejectTemplate || null,
        questions: {
          create: body.questions.map((q: any) => ({
            text: q.text,
            type: q.type,
            options: typeof q.options === "string" ? q.options : q.options ? JSON.stringify(q.options) : null
          }))
        }
      }
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error("PUT սխալ բազայում:", error);
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