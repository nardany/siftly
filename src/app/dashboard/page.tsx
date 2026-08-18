import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardOverviewClient from "./DashboardOverviewClient";

export default async function DashboardOverview() {
  const user = await getUserFromToken();
  if (!user) return redirect("/login");

  const forms = await prisma.form.findMany({
    where: { userId: user.id },
    include: {
      candidates: {
        select: { aiScore: true, createdAt: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const totalForms = forms.length;
  const allCandidates = forms.flatMap(f => f.candidates);
  const totalCandidates = allCandidates.length;
  const avgScore = totalCandidates > 0
    ? Math.round(allCandidates.reduce((a, c) => a + (c.aiScore || 0), 0) / totalCandidates)
    : 0;

  const chartData = forms.map(f => ({
    name: f.title.length > 16 ? f.title.slice(0, 16) + "…" : f.title,
    count: f.candidates.length,
    avg: f.candidates.length > 0
      ? Math.round(f.candidates.reduce((a, c) => a + (c.aiScore || 0), 0) / f.candidates.length)
      : 0,
  }));

  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const dailyData = last7Days.map(day => ({
    day: day.slice(5),
    count: allCandidates.filter(c => c.createdAt.toISOString().slice(0, 10) === day).length
  }));

  return (
    <DashboardOverviewClient
      userEmail={user.email}
      totalForms={totalForms}
      totalCandidates={totalCandidates}
      avgScore={avgScore}
      chartData={chartData}
      dailyData={dailyData}
      forms={forms}
    />
  );
}