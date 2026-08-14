import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

export async function GET() {
  const user = await getUserFromToken();
  if (!user) return NextResponse.json({ isConnected: false });

  const tokenRecord = await prisma.googleToken.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ isConnected: !!tokenRecord });
}
