"use client";

import Link from "next/link";
import style from "./page.module.css";
import OverviewCharts from "./OverviewCharts";
import { useLanguage } from "@/lib/LanguageContext";

interface Props {
  userEmail: string;
  totalForms: number;
  totalCandidates: number;
  avgScore: number;
  chartData: { name: string; count: number; avg: number }[];
  dailyData: { day: string; count: number }[];
  forms: any[];
}

export default function DashboardOverviewClient({
  userEmail,
  totalForms,
  totalCandidates,
  avgScore,
  chartData,
  dailyData,
  forms,
}: Props) {
  const { t, lang } = useLanguage();

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div>
          <h1 className={style.title}>{t.welcome}, {userEmail} 👋</h1>
        </div>
        <Link href="/dashboard/forms/create" className={style.createBtn}>
          {t.newFormBtn}
        </Link>
      </div>

      <div className={style.statsGrid}>
        <div className={style.statCard}>
          <div className={style.statIcon}>📋</div>
          <div className={style.statInfo}>
            <div className={style.statValue}>{totalForms}</div>
            <div className={style.statLabel}>{t.activePositions}</div>
          </div>
        </div>
        <div className={style.statCard}>
          <div className={style.statIcon}>👥</div>
          <div className={style.statInfo}>
            <div className={style.statValue}>{totalCandidates}</div>
            <div className={style.statLabel}>{t.totalApplicantsCount}</div>
          </div>
        </div>
        <div className={style.statCard}>
          <div className={style.statIcon}>🤖</div>
          <div className={style.statInfo}>
            <div className={style.statValue} style={{ color: avgScore >= 70 ? "#22c55e" : avgScore >= 40 ? "#f59e0b" : "#ef4444" }}>
              {avgScore}
            </div>
            <div className={style.statLabel}>{t.avgAiScoreCount}</div>
          </div>
        </div>
      </div>

      {totalForms === 0 ? (
        <div className={style.emptyState}>
          <div className={style.emptyIcon}>🎯</div>
          <h2 className={style.emptyTitle}>{t.noForms}</h2>
          <p className={style.emptySubtitle}>
            {lang === "hy" ? "Ստեղծիր առաջին հարցաշարը և սկսիր հավաքագրել թեկնածուներ AI-ի օգնությամբ" : "Create your first screening form and start recruiting candidates using AI."}
          </p>
          <Link href="/dashboard/forms/create" className={style.createBtn}>
            {t.createNewForm}
          </Link>
        </div>
      ) : (
        <OverviewCharts chartData={chartData} dailyData={dailyData} />
      )}

      {forms.length > 0 && (
        <div className={style.formsList}>
          <h2 className={style.sectionTitle}>{t.positionsList}</h2>
          <div className={style.formsTable}>
            {forms.map(f => {
              const avg = f.candidates.length > 0
                ? Math.round(f.candidates.reduce((a: number, c: any) => a + (c.aiScore || 0), 0) / f.candidates.length)
                : null;
              return (
                <Link href={`/dashboard/forms/${f.id}/candidates`} key={f.id} className={style.formRow}>
                  <div className={style.formDot} style={{ backgroundColor: f.themeColor || "#3b82f6" }} />
                  <span className={style.formName}>{f.title}</span>
                  <span className={style.formCount}>{f.candidates.length} {t.applicantsCountSuffix}</span>
                  {avg !== null && (
                    <span className={style.formAvg} style={{
                      color: avg >= 70 ? "#16a34a" : avg >= 40 ? "#d97706" : "#dc2626",
                      backgroundColor: avg >= 70 ? "#dcfce7" : avg >= 40 ? "#fef9c3" : "#fee2e2"
                    }}>
                      {t.avgScorePrefix} {avg}
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
