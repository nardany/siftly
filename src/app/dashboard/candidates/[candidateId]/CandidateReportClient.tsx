"use client";

import Link from "next/link";
import ScoreChart from "./ScoreChart";
import style from "./report.module.css";
import { useLanguage } from "@/lib/LanguageContext";

interface CandidateReportClientProps {
  candidate: any;
  cheatLogs: string[];
}

export default function CandidateReportClient({ candidate, cheatLogs }: CandidateReportClientProps) {
  const { t, lang } = useLanguage();

  const aiScore = candidate.aiScore ?? 0;
  const scoreColor = aiScore >= 80 ? "#22c55e" : aiScore >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = aiScore >= 80 ? t.highLevel : aiScore >= 50 ? t.midLevel : t.lowLevel;

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        <div>
          <Link href={`/dashboard/forms/${candidate.formId}/candidates`} className={style.backButton}>
            {t.backToCandidates}
          </Link>
          <h1 className={style.title}>{candidate.firstName} {candidate.lastName}</h1>
          <p className={style.subtitle}>{candidate.email} · {candidate.phone || t.noPhone}</p>
        </div>
        <div className={style.formTag}>{candidate.form.title}</div>
      </div>
      <div className={style.mainGrid}>
        <div className={style.answersSection}>
          <h2 className={style.sectionTitle}>{t.qaTitle}</h2>
          <div className={style.answersList}>
            {candidate.answers.map((ans: any, idx: number) => (
              <div key={ans.id} className={style.answerCard}>
                <div className={style.questionHeader}>
                  <span className={style.questionIndex}>Q{idx + 1}</span>
                  <span className={style.questionText}>{ans.question?.text || `Question #${idx + 1}`}</span>
                </div>
                <div className={style.answerBox}>
                  {ans.value || <span className={style.noAnswer}>No answer provided</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={style.sidebar}>
          <div className={style.sideCard}>
            <div className={style.sideCardTitle}>{t.aiScoreTitle}</div>
            <ScoreChart score={aiScore} />
            <div className={style.scoreLabelRow}>
              <span className={style.scoreLabel} style={{ backgroundColor: scoreColor + "20", color: scoreColor }}>
                {scoreLabel}
              </span>
            </div>
          </div>

          <div className={style.sideCard}>
            <div className={style.sideCardTitle}>{t.aiSummary}</div>
            <p className={style.summaryText}>{candidate.aiSummary}</p>
          </div>

          {candidate.resumeUrl && (
            <div className={style.sideCard}>
              <div className={style.sideCardTitle}>{t.attachedCv}</div>
              <a
                href={candidate.resumeUrl}
                download={`${candidate.firstName}_${candidate.lastName}_CV.pdf`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  width: "100%",
                  textAlign: "center",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                }}
              >
                {t.downloadCv}
              </a>
            </div>
          )}

          {cheatLogs.length > 0 && (
            <div className={`${style.sideCard} ${style.dangerCard}`}>
              <div className={style.sideCardTitle}>{t.antiCheatLogs}</div>
              <ul className={style.logsList}>
                {cheatLogs.map((log: string, i: number) => (
                  <li key={i} className={style.logItem}>{log}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={style.sideCard}>
            <div className={style.sideCardTitle}>📊 {t.status}</div>
            <div className={style.metaRow}>
              <span className={style.metaLabel}>{t.submissionDate}</span>
              <span className={style.metaValue}>{new Date(candidate.createdAt).toLocaleDateString(lang === "hy" ? "hy-AM" : "en-US")}</span>
            </div>
            <div className={style.metaRow}>
              <span className={style.metaLabel}>{t.timeSpentLabel}</span>
              <span className={style.metaValue}>{candidate.timeSpent ? `${Math.round(candidate.timeSpent / 60)} min.` : "—"}</span>
            </div>
            <div className={style.metaRow}>
              <span className={style.metaLabel}>AI Mode</span>
              <span className={style.metaValue}>{candidate.form.aiEvaluationMode || "NORMAL"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
