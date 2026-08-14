import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const updatedCandidate = await prisma.candidate.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ success: true, candidate: updatedCandidate });
}
