import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import CandidateReportClient from "./CandidateReportClient";

export default async function CandidateReportPage({ params }: { params: Promise<{ candidateId: string }> }) {
  const { candidateId } = await params;
  const user = await getUserFromToken();
  if (!user) return redirect("/login");

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      answers: {
        include: { question: true }
      },
      form: true
    }
  });

  if (!candidate || candidate.form.userId !== user.id) {
    return redirect("/dashboard/forms");
  }

  const cheatLogs: string[] = candidate.cheatLogs
    ? candidate.cheatLogs.split(" | ").filter(Boolean)
    : [];

  return <CandidateReportClient candidate={candidate} cheatLogs={cheatLogs} />;
}
