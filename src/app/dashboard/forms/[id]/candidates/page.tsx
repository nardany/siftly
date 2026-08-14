import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import style from "./candidates.module.css";
import CandidateCharts from "./CandidateCharts";
import SyncButton from "./SyncButton";
import CandidateTableClient from "./CandidateTableClient";

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
    <div className={style.pageWrapper}>
      {/* HEADER */}
      <div className={style.header}>
        <div>
          <h1 className={style.title}>{form.title}</h1>
          <p className={style.subtitle}>Այս հաստիքի համար դիմել է {total} հոգի</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {(form.googleFormId || form.slug.startsWith("gf-")) && (
            <SyncButton
              formId={form.id}
              googleFormUrl={form.googleFormId ? `https://docs.google.com/forms/d/${form.googleFormId}/edit` : null}
            />
          )}

          <Link href="/dashboard/forms" className={style.backButton}>
            ← Հետ դեպի Հարցաշարեր
          </Link>
        </div>
      </div>

      <div className={style.statsGrid}>
        <div className={style.statCard}>
          <div className={style.statLabel}>👥 Ընդհանուր Դիմորդներ</div>
          <div className={style.statValue}>{total}</div>
        </div>
        <div className={style.statCard}>
          <div className={style.statLabel}>🤖 Միջին AI Գնահատական</div>
          <div className={style.statValue} style={{
            color: avgScore >= 70 ? "#22c55e" : avgScore >= 40 ? "#f59e0b" : "#ef4444"
          }}>{avgScore} / 100</div>
        </div>
        <div className={style.statCard}>
          <div className={style.statLabel}>🏆 Լավագույն Դիմորդ</div>
          <div className={style.statValueName}>
            {topCandidate ? `${topCandidate.firstName} ${topCandidate.lastName}` : "—"}
          </div>
          {topCandidate && (
            <div className={style.statSubValue}>{topCandidate.aiScore} / 100</div>
          )}
        </div>
      </div>

      {total > 0 && (
        <CandidateCharts
          passCount={passCount}
          failCount={failCount}
          total={total}
          topCandidates={topCandidates}
        />
      )}

      <CandidateTableClient
        initialCandidates={candidates}
        jobTitle={form.title}
        inviteTemplate={form.inviteTemplate}
        rejectTemplate={form.rejectTemplate}
      />
    </div>
  );
}