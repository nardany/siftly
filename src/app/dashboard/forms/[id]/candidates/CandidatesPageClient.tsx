"use client";

import Link from "next/link";
import style from "./candidates.module.css";
import CandidateCharts from "./CandidateCharts";
import SyncButton from "./SyncButton";
import CandidateTableClient from "./CandidateTableClient";
import { useLanguage } from "@/lib/LanguageContext";

interface Props {
  form: any;
  candidates: any[];
  total: number;
  avgScore: number;
  topCandidate: any;
  passCount: number;
  failCount: number;
  topCandidates: any[];
}

export default function CandidatesPageClient({
  form,
  candidates,
  total,
  avgScore,
  topCandidate,
  passCount,
  failCount,
  topCandidates,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        <div>
          <h1 className={style.title}>{form.title}</h1>
          <p className={style.subtitle}>
            {t.applicantsAppliedForPos} {total} {t.peopleSuffix}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {(form.googleFormId || form.slug.startsWith("gf-")) && (
            <SyncButton
              formId={form.id}
              googleFormUrl={form.googleFormId ? `https://docs.google.com/forms/d/${form.googleFormId}/edit` : null}
            />
          )}
          <Link href="/dashboard/forms" className={style.backButton}>
            {t.backToForms}
          </Link>
        </div>
      </div>

      <div className={style.statsGrid}>
        <div className={style.statCard}>
          <div className={style.statLabel}>{t.totalApplicantsCard}</div>
          <div className={style.statValue}>{total}</div>
        </div>
        <div className={style.statCard}>
          <div className={style.statLabel}>{t.avgAiScoreCard}</div>
          <div className={style.statValue} style={{
            color: avgScore >= 70 ? "#22c55e" : avgScore >= 40 ? "#f59e0b" : "#ef4444"
          }}>{avgScore} / 100</div>
        </div>
        <div className={style.statCard}>
          <div className={style.statLabel}>{t.topApplicantCard}</div>
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
