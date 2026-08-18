import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import CandidatesPageClient from "./CandidatesPageClient";

export default async function FormCandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserFromToken();
  if (!user) return redirect("/login");

  const form = await prisma.form.findUnique({
    where: { id: id },
    include: {
      candidates: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!form || form.userId !== user.id) return redirect("/dashboard/forms");

  const candidates = form.candidates;
  const total = candidates.length;
  const avgScore = total > 0
    ? Math.round(candidates.reduce((acc, c) => acc + (c.aiScore || 0), 0) / total)
    : 0;
  const topCandidate = total > 0
    ? candidates.reduce((best, c) => (c.aiScore ?? 0) > (best.aiScore ?? 0) ? c : best, candidates[0])
    : null;

  const passCount = candidates.filter(c => (c.aiScore ?? 0) >= 70).length;
  const failCount = total - passCount;

  const topCandidates = [...candidates]
    .sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0))
    .slice(0, 5)
    .map(c => ({ id: c.id, firstName: c.firstName, lastName: c.lastName, aiScore: c.aiScore ?? 0 }));

  return (
    <CandidatesPageClient
      form={form}
      candidates={candidates}
      total={total}
      avgScore={avgScore}
      topCandidate={topCandidate}
      passCount={passCount}
      failCount={failCount}
      topCandidates={topCandidates}
    />
  );
}