import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ApplyClient from "./ApplyClient";

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const form = await prisma.form.findUnique({
    where: { slug: slug },
    include: {
      questions: true,
      user: true,
    },
  });

  if (!form) {
    return notFound();
  }

  return <ApplyClient form={form} />;
}