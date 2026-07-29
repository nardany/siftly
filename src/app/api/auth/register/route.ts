import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcrypt";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, companyName, email, password } = body;

    if (!fullName || !companyName || !email || !password) {
      return NextResponse.json(
        { message: "Բոլոր դաշտերը պարտադիր են" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Այս էլ. հասցեով օգտատեր արդեն գոյություն ունի" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName,
        companyName: companyName,
        email: email,
        password: hashedPassword,
      }
    });

    return NextResponse.json({
      message: "Գրանցումը հաջողությամբ ավարտվեց",
      user: { id: newUser.id, email: newUser.email }
    }, { status: 201 });

  } catch (error) {
    console.error("Գրանցման սխալ:", error);
    return NextResponse.json(
      { message: "Սերվերի սխալ" },
      { status: 500 }
    );
  }
}