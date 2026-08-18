"use client";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import style from "./candidates.module.css";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  aiScore: number;
}

interface Props {
  passCount: number;
  failCount: number;
  total: number;
  topCandidates: Candidate[];
}

export default function CandidateCharts({ passCount, failCount, total, topCandidates }: Props) {
  const { t, lang } = useLanguage();
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;
  const passColor = passRate >= 60 ? "#22c55e" : passRate >= 30 ? "#f59e0b" : "#ef4444";

  const gaugeData = [
    { value: 100, fill: "#f1f5f9" },
    { value: passRate, fill: passColor },
  ];

  return (
    <div className={style.chartsRow}>
      <div className={style.chartCard}>
        <div className={style.chartTitle}>✅ Pass Rate</div>
        <div className={style.passRateWrapper}>
          <div className={style.gaugeContainer}>
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                cx="50%" cy="55%"
                innerRadius="65%" outerRadius="90%"
                startAngle={220} endAngle={-40}
                data={gaugeData}
                barSize={16}
              >
                <RadialBar dataKey="value" cornerRadius={10} background={false} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className={style.gaugeCenter}>
              <div className={style.gaugeValue} style={{ color: passColor }}>{passRate}%</div>
              <div className={style.gaugeLabel}>{t.passedPercentSuffix}</div>
            </div>
          </div>
          <div className={style.passStats}>
            <div className={style.passStatRow}>
              <span className={style.passStatDot} style={{ backgroundColor: "#22c55e" }} />
              <span className={style.passStatText}>{t.passedRangeLabel}</span>
              <strong>{passCount}</strong>
            </div>
            <div className={style.passStatRow}>
              <span className={style.passStatDot} style={{ backgroundColor: "#ef4444" }} />
              <span className={style.passStatText}>{t.failedRangeLabel}</span>
              <strong>{failCount}</strong>
            </div>
            <div className={style.passStatRow}>
              <span className={style.passStatDot} style={{ backgroundColor: "#94a3b8" }} />
              <span className={style.passStatText}>{t.totalLabel}</span>
              <strong>{total}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className={style.chartCard}>
        <div className={style.chartTitle}>{t.leaderboardTitle}</div>
        {topCandidates.length === 0 ? (
          <div className={style.chartEmpty}>{lang === "hy" ? "Դեռ տվյալ չկա" : "No data yet"}</div>
        ) : (
          <div className={style.leaderboard}>
            {topCandidates.map((c, i) => {
              const pct = c.aiScore;
              const barColor = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
              return (
                <Link href={`/dashboard/candidates/${c.id}`} key={c.id} className={style.leaderRow}>
                  <span className={style.leaderMedal}>{medal}</span>
                  <span className={style.leaderName}>{c.firstName} {c.lastName}</span>
                  <div className={style.leaderBarWrap}>
                    <div
                      className={style.leaderBar}
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <span className={style.leaderScore} style={{ color: barColor }}>{pct}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
