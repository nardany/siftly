import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import FormsClient from "./FormsClient";

export default async function MyFormsPage() {
  const user = await getUserFromToken();

  const myForms = user ? await prisma.form.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { candidates: true } }
    },
    orderBy: { createdAt: "desc" }
  }) : [];

  return <FormsClient myForms={myForms} />;
}