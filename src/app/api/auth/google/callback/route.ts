import { NextResponse } from "next/server";
import { google } from "googleapis";
import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.redirect("/dashboard/import?error=no_code");

  const user = await getUserFromToken();
  if (!user) return NextResponse.redirect("/login");

  const { tokens } = await oauth2Client.getToken(code);

  const existingToken = await prisma.googleToken.findUnique({ where: { userId: user.id } });

  await prisma.googleToken.upsert({
    where: { userId: user.id },
    update: {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || existingToken?.refreshToken || "",
      expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
    },
    create: {
      userId: user.id,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || "",
      expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
    },
  });

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/import?connected=true`);
}