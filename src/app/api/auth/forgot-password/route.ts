import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ message: "Էլ. փոստը և նոր գաղտնաբառը պարտադիր են" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "Այս էլ. հասցեով օգտատեր չգտնվեց" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, message: "Գաղտնաբառը թարմացվեց" });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ message: "Սերվերի սխալ" }, { status: 500 });
  }
}
