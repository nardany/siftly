"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart
} from "recharts";
import style from "./page.module.css";

interface Props {
  chartData: { name: string; count: number; avg: number }[];
  dailyData: { day: string; count: number }[];
}

export default function OverviewCharts({ chartData, dailyData }: Props) {
  return (
    <div className={style.chartsGrid}>
      <div className={style.chartCard}>
        <div className={style.chartTitle}>👥 Դիմորդներ ըստ Հաստիքի</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
              formatter={(val: any) => [val, "Դիմորդ"]}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={style.chartCard}>
        <div className={style.chartTitle}>🤖 Միջին AI Score ըստ Հաստիքի</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
              formatter={(val: any) => [val, "Avg Score"]}
            />
            <Bar dataKey="avg" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`${style.chartCard} ${style.chartCardFull}`}>
        <div className={style.chartTitle}>📈 Վերջին 7 Օրվա Ակտիվություն</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={dailyData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
              formatter={(val: any) => [val, "Դիմորդ"]}
            />
            <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCount)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
