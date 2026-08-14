"use client";

import { useState } from "react";
import Link from "next/link";
import style from "./candidates.module.css";
import OutreachModal from "./OutreachModal";

interface CandidateItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  aiScore: number | null;
  aiSummary: string | null;
  status?: string;
  createdAt: any;
}

interface CandidateTableClientProps {
  initialCandidates: CandidateItem[];
  jobTitle: string;
  inviteTemplate?: string | null;
  rejectTemplate?: string | null;
}

export default function CandidateTableClient({
  initialCandidates,
  jobTitle,
  inviteTemplate,
  rejectTemplate,
}: CandidateTableClientProps) {
  const [candidates, setCandidates] = useState<CandidateItem[]>(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);
  const [outreachType, setOutreachType] = useState<"INVITE" | "REJECT">("INVITE");

  const handleOpenModal = (candidate: CandidateItem, type: "INVITE" | "REJECT") => {
    setSelectedCandidate(candidate);
    setOutreachType(type);
  };

  const handleStatusChange = (candidateId: string, newStatus: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );
  };

  const handleExportCSV = () => {
    if (candidates.length === 0) return alert("Դեռ դիմորդներ չկան CSV արտահանելու համար");

    const headers = ["Անուն", "Ազգանուն", "Էլ. Փոստ", "AI Գնահատական", "Կարգավիճակ", "Ամսաթիվ", "AI Ամփոփում"];
    const rows = candidates.map((c) => [
      `"${c.firstName || ""}"`,
      `"${c.lastName || ""}"`,
      `"${c.email || ""}"`,
      c.aiScore ?? 0,
      `"${c.status || "PENDING"}"`,
      `"${new Date(c.createdAt).toLocaleDateString("hy-AM")}"`,
      `"${(c.aiSummary || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `siftly_candidates_${jobTitle.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button
          onClick={handleExportCSV}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          📥 Export CSV (Excel)
        </button>
      </div>

      <div className={style.tableContainer}>
        <table className={style.table}>
          <thead>
            <tr>
              <th>Անուն Ազգանուն</th>
              <th>Էլ. Փոստ</th>
              <th>AI Գնահատական</th>
              <th>Կարգավիճակ</th>
              <th>Ամսաթիվ</th>
              <th>Գործողություն</th>
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={6} className={style.emptyState}>
                  Դեռ ոչ մի դիմորդ չկա այս հաստիքի համար:
                </td>
              </tr>
            ) : (
              candidates.map((candidate) => {
                const cScore = candidate.aiScore ?? 0;
                const isHigh = cScore >= 80;
                const isMid = cScore >= 50 && cScore < 80;
                const aiColorClass = isHigh ? style.badgeGreen : isMid ? style.badgeYellow : style.badgeRed;

                const currentStatus = candidate.status || "PENDING";

                return (
                  <tr key={candidate.id}>
                    <td className={style.fw500}>
                      {candidate.firstName} {candidate.lastName}
                    </td>
                    <td className={style.textMuted}>{candidate.email || "—"}</td>
                    <td>
                      <span className={`${style.badge} ${aiColorClass}`}>{cScore} / 100</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "12px",
                          backgroundColor:
                            currentStatus === "INVITED"
                              ? "#dcfce7"
                              : currentStatus === "REJECTED"
                              ? "#fee2e2"
                              : "#f1f5f9",
                          color:
                            currentStatus === "INVITED"
                              ? "#166534"
                              : currentStatus === "REJECTED"
                              ? "#991b1b"
                              : "#475569",
                        }}
                      >
                        {currentStatus === "INVITED"
                          ? "🟢 Հրավիրված"
                          : currentStatus === "REJECTED"
                          ? "🔴 Մերժված"
                          : "🟡 Սպասման մեջ"}
                      </span>
                    </td>
                    <td className={style.textMuted}>
                      {new Date(candidate.createdAt).toLocaleDateString("hy-AM")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <Link href={`/dashboard/candidates/${candidate.id}`} className={style.viewButton}>
                          Ռեփորթ →
                        </Link>
                        <button
                          onClick={() => handleOpenModal(candidate, "INVITE")}
                          title="Հրավիրել Հարցազրույցի"
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#dcfce7",
                            color: "#15803d",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          📩 Հրավիրել
                        </button>
                        <button
                          onClick={() => handleOpenModal(candidate, "REJECT")}
                          title="Մերժել"
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#fee2e2",
                            color: "#b91c1c",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          ✉️ Մերժել
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedCandidate && (
        <OutreachModal
          candidate={selectedCandidate}
          jobTitle={jobTitle}
          type={outreachType}
          customTemplate={outreachType === "INVITE" ? inviteTemplate : rejectTemplate}
          onClose={() => setSelectedCandidate(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
