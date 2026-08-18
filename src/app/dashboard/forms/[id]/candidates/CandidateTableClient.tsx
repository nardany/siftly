"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import style from "./candidates.module.css";
import OutreachModal from "./OutreachModal";
import { useLanguage } from "@/lib/LanguageContext";

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
  const { t, lang } = useLanguage();
  const [candidates, setCandidates] = useState<CandidateItem[]>(initialCandidates);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);
  const [outreachType, setOutreachType] = useState<"INVITE" | "REJECT">("INVITE");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const filteredCandidates = useMemo(() => {
    if (!searchTerm.trim()) return candidates;
    const term = searchTerm.toLowerCase();
    return candidates.filter(
      (c) =>
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        (c.email && c.email.toLowerCase().includes(term))
    );
  }, [candidates, searchTerm]);

  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage]);

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
    if (candidates.length === 0) return alert(lang === "hy" ? "Դեռ դիմորդներ չկան CSV արտահանելու համար" : "No candidates available to export");

    const headers = [t.name, t.email, t.score, t.status, t.date, t.aiSummary];
    const rows = candidates.map((c) => [
      `"${c.firstName || ""} ${c.lastName || ""}"`,
      `"${c.email || ""}"`,
      c.aiScore ?? 0,
      `"${c.status || "PENDING"}"`,
      `"${new Date(c.createdAt).toLocaleDateString(lang === "hy" ? "hy-AM" : "en-US")}"`,
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={t.searchPlaceholder}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            width: "280px",
            outline: "none",
          }}
        />

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
          {t.exportCsv}
        </button>
      </div>

      <div className={style.tableContainer}>
        <table className={style.table}>
          <thead>
            <tr>
              <th>{t.name}</th>
              <th>{t.email}</th>
              <th>{t.score}</th>
              <th>{t.status}</th>
              <th>{t.date}</th>
              <th>{t.action}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} className={style.emptyState}>
                  {lang === "hy" ? "Դեռ ոչ մի դիմորդ չկա այս հաստիքի համար:" : "No applicants found for this position."}
                </td>
              </tr>
            ) : (
              paginatedCandidates.map((candidate) => {
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
                          ? t.invited
                          : currentStatus === "REJECTED"
                          ? t.rejected
                          : t.pending}
                      </span>
                    </td>
                    <td className={style.textMuted}>
                      {new Date(candidate.createdAt).toLocaleDateString(lang === "hy" ? "hy-AM" : "en-US")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <Link href={`/dashboard/candidates/${candidate.id}`} className={style.viewButton}>
                          {t.viewReport}
                        </Link>
                        <button
                          onClick={() => handleOpenModal(candidate, "INVITE")}
                          title="Invite"
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
                          {t.invite}
                        </button>
                        <button
                          onClick={() => handleOpenModal(candidate, "REJECT")}
                          title="Reject"
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
                          {t.reject}
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

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            {t.prevPage}
          </button>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>
            {t.page} {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            {t.nextPage}
          </button>
        </div>
      )}

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
