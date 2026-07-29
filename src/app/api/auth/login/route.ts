import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Բոլոր դաշտերը պարտադիր են" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json({ message: "Սխալ էլ. հասցե կամ գաղտնաբառ" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Սխալ էլ. հասցե կամ գաղտնաբառ" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const jwt = await new SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({
      message: "Մուտքը հաջողվեց",
      user: { id: user.id, email: user.email, fullName: user.fullName }
    }, { status: 200 });

    response.cookies.set("siftly_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Մուտքի սխալ:", error);
    return NextResponse.json({ message: "Սերվերի սխալ" }, { status: 500 });
  }
}