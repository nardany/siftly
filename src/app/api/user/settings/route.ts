import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getUserFromToken } from "../../../../lib/auth";

export async function GET() {
  const userPayload = await getUserFromToken();
  if (!userPayload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: userPayload.id },
    select: { companyName: true, companyLogo: true, companyDescription: true }
  });

  return NextResponse.json(dbUser);
}

export async function PUT(request: Request) {
  const userPayload = await getUserFromToken();
  if (!userPayload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { companyName, companyLogo, companyDescription } = body;

  await prisma.user.update({
    where: { id: userPayload.id },
    data: { companyName, companyLogo, companyDescription }
  });

  return NextResponse.json({ message: "Կարգավորումները պահպանված են" });
}