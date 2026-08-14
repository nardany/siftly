import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import style from "./page.module.css";
import OverviewCharts from "./OverviewCharts";

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
    <div className={style.container}>
      <div className={style.header}>
        <div>
          <h1 className={style.title}>Բարի գալուստ, {user.email} 👋</h1>
          <p className={style.subtitle}>Ահա քո Siftly հարթակի ընդհանուր վիճակն այսօր</p>
        </div>
        <Link href="/dashboard/forms/create" className={style.createBtn}>
          + Նոր Հարցաշար
        </Link>
      </div>

      <div className={style.statsGrid}>
        <div className={style.statCard}>
          <div className={style.statIcon}>📋</div>
          <div className={style.statInfo}>
            <div className={style.statValue}>{totalForms}</div>
            <div className={style.statLabel}>Ակտիվ Հաստիք</div>
          </div>
        </div>
        <div className={style.statCard}>
          <div className={style.statIcon}>👥</div>
          <div className={style.statInfo}>
            <div className={style.statValue}>{totalCandidates}</div>
            <div className={style.statLabel}>Ընդհանուր Դիմորդ</div>
          </div>
        </div>
        <div className={style.statCard}>
          <div className={style.statIcon}>🤖</div>
          <div className={style.statInfo}>
            <div className={style.statValue} style={{ color: avgScore >= 70 ? "#22c55e" : avgScore >= 40 ? "#f59e0b" : "#ef4444" }}>
              {avgScore}
            </div>
            <div className={style.statLabel}>Միջին AI Գնահատական</div>
          </div>
        </div>
      </div>
      {totalForms === 0 ? (
        <div className={style.emptyState}>
          <div className={style.emptyIcon}>🎯</div>
          <h2 className={style.emptyTitle}>Դեռ ոչ մի հարցաշար չկա</h2>
          <p className={style.emptySubtitle}>
            Ստեղծիր առաջին հարցաշարը և սկսիր հավաքագրել թեկնածուներ AI-ի օգնությամբ
          </p>
          <Link href="/dashboard/forms/create" className={style.createBtn}>
            + Ստեղծել Հարցաշար
          </Link>
        </div>
      ) : (
        <OverviewCharts chartData={chartData} dailyData={dailyData} />
      )}

      {forms.length > 0 && (
        <div className={style.formsList}>
          <h2 className={style.sectionTitle}>Հաստիքներ</h2>
          <div className={style.formsTable}>
            {forms.map(f => {
              const avg = f.candidates.length > 0
                ? Math.round(f.candidates.reduce((a, c) => a + (c.aiScore || 0), 0) / f.candidates.length)
                : null;
              return (
                <Link href={`/dashboard/forms/${f.id}/candidates`} key={f.id} className={style.formRow}>
                  <div className={style.formDot} style={{ backgroundColor: f.themeColor || "#3b82f6" }} />
                  <span className={style.formName}>{f.title}</span>
                  <span className={style.formCount}>{f.candidates.length} դիմորդ</span>
                  {avg !== null && (
                    <span className={style.formAvg} style={{
                      color: avg >= 70 ? "#16a34a" : avg >= 40 ? "#d97706" : "#dc2626",
                      backgroundColor: avg >= 70 ? "#dcfce7" : avg >= 40 ? "#fef9c3" : "#fee2e2"
                    }}>
                      Avg {avg}
                    </span>
                  )}
                  <span className={style.formArrow}>→</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}