"use client";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import style from "./report.module.css";

export default function ScoreChart({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const data = [
    { value: 100, fill: "#f1f5f9" },
    { value: score, fill: color },
  ];

  return (
    <div className={style.chartWrapper}>
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          startAngle={220}
          endAngle={-40}
          data={data}
          barSize={18}
        >
          <RadialBar dataKey="value" cornerRadius={10} background={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className={style.chartCenter}>
        <div className={style.chartScore} style={{ color }}>{score}</div>
        <div className={style.chartLabel}>/ 100</div>
      </div>
    </div>
  );
}
