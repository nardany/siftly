import prisma from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ScoreChart from "./ScoreChart";
import style from "./report.module.css";

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

  const aiScore = candidate.aiScore ?? 0;
  const scoreColor = aiScore >= 80 ? "#22c55e" : aiScore >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = aiScore >= 80 ? "Բարձր" : aiScore >= 50 ? "Միջին" : "Ցածր";

  return (
    <div className={style.pageWrapper}>
      <div className={style.header}>
        <div>
          <Link href={`/dashboard/forms/${candidate.formId}/candidates`} className={style.backButton}>
            ← Հետ դեպի Դիմորդներ
          </Link>
          <h1 className={style.title}>{candidate.firstName} {candidate.lastName}</h1>
          <p className={style.subtitle}>{candidate.email} · {candidate.phone || "Հեռ. չկա"}</p>
        </div>
        <div className={style.formTag}>{candidate.form.title}</div>
      </div>
      <div className={style.mainGrid}>
        <div className={style.answersSection}>
          <h2 className={style.sectionTitle}>📋 Հարց-Պատասխան</h2>
          <div className={style.answersList}>
            {candidate.answers.map((ans, idx) => (
              <div key={ans.id} className={style.answerCard}>
                <div className={style.questionHeader}>
                  <span className={style.questionIndex}>Հ{idx + 1}</span>
                  <span className={style.questionText}>{ans.question?.text || `Հարց #${idx + 1}`}</span>
                </div>
                <div className={style.answerBox}>
                  {ans.value || <span className={style.noAnswer}>Պատասխան չի տրվել</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={style.sidebar}>
          <div className={style.sideCard}>
            <div className={style.sideCardTitle}>🤖 AI Գնահատական</div>
            <ScoreChart score={aiScore} />
            <div className={style.scoreLabelRow}>
              <span className={style.scoreLabel} style={{ backgroundColor: scoreColor + "20", color: scoreColor }}>
                {scoreLabel} մակարդակ
              </span>
            </div>
          </div>
          <div className={style.sideCard}>
            <div className={style.sideCardTitle}>💬 AI Ամփոփում</div>
            <p className={style.summaryText}>{candidate.aiSummary}</p>
          </div>
          {cheatLogs.length > 0 && (
            <div className={`${style.sideCard} ${style.dangerCard}`}>
              <div className={style.sideCardTitle}>⚠️ Anti-Cheat Լոգեր</div>
              <ul className={style.logsList}>
                {cheatLogs.map((log, i) => (
                  <li key={i} className={style.logItem}>{log}</li>
                ))}
              </ul>
            </div>
          )}
          <div className={style.sideCard}>
            <div className={style.sideCardTitle}>📊 Ստատուս</div>
            <div className={style.metaRow}>
              <span className={style.metaLabel}>Ուղարկման ամսաթիվ</span>
              <span className={style.metaValue}>{new Date(candidate.createdAt).toLocaleDateString("hy-AM")}</span>
            </div>
            <div className={style.metaRow}>
              <span className={style.metaLabel}>Ծախսված ժամ.</span>
              <span className={style.metaValue}>{candidate.timeSpent ? `${Math.round(candidate.timeSpent / 60)} ր.` : "—"}</span>
            </div>
            <div className={style.metaRow}>
              <span className={style.metaLabel}>AI Ռեժիմ</span>
              <span className={style.metaValue}>{candidate.form.aiEvaluationMode || "NORMAL"}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
