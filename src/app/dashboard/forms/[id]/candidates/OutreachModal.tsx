"use client";

import { useState } from "react";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  aiScore: number | null;
  status?: string;
}

interface OutreachModalProps {
  candidate: Candidate;
  jobTitle: string;
  type: "INVITE" | "REJECT";
  customTemplate?: string | null;
  onClose: () => void;
  onStatusChange: (candidateId: string, newStatus: string) => void;
}

export default function OutreachModal({
  candidate,
  jobTitle,
  type,
  customTemplate,
  onClose,
  onStatusChange,
}: OutreachModalProps) {
  const isInvite = type === "INVITE";

  const defaultInviteTemplate = `Բարև Ձեզ {firstName} {lastName} ջան,

Շնորհավորում ենք: Դուք հաջողությամբ անցել եք {jobTitle} հաստիքի նախնական փուլը:

Խնդրում ենք պատասխանել այս նամակին՝ հարցազրույցի օրը և ժամը հաստատելու համար:

Հարգանքներով,
HR Թիմ`;

  const defaultRejectTemplate = `Բարև Ձեզ {firstName} {lastName} ջան,

Շնորհակալություն {jobTitle} հաստիքին դիմելու և մեր հարցաշարը լրացնելու համար:

Ցավոք, այս անգամ ընտրությունը կանգ է առել այլ թեկնածուների վրա: Ձեր տվյալները կպահպանվեն մեր բազայում ապագա հաստիքների համար:

Մաղթում ենք հաջողություն:

Հարգանքներով,
HR Թիմ`;

  const templateToUse = customTemplate?.trim() || (isInvite ? defaultInviteTemplate : defaultRejectTemplate);

  const formattedBody = templateToUse
    .replaceAll("{firstName}", candidate.firstName || "Դիմորդ")
    .replaceAll("{lastName}", candidate.lastName || "")
    .replaceAll("{jobTitle}", jobTitle || "Հաստիք")
    .replaceAll("{score}", (candidate.aiScore ?? 0).toString());

  const subject = isInvite
    ? `Հարցազրույցի հրավեր — ${jobTitle}`
    : `Տեղեկացում դիմումի վերաբերյալ — ${jobTitle}`;

  const [bodyText, setBodyText] = useState(formattedBody);
  const [copied, setCopied] = useState(false);

  const handleSendViaGmail = async () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      candidate.email || ""
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    const newStatus = isInvite ? "INVITED" : "REJECTED";
    await fetch(`/api/candidates/${candidate.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    onStatusChange(candidate.id, newStatus);
    window.open(gmailUrl, "_blank");
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "560px",
          padding: "28px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            {isInvite ? "📩 Հարցազրույցի Հրավեր" : "✉️ Մերժման Նամակ"} — {candidate.firstName} {candidate.lastName}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              color: "#94a3b8",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>
            ԷԼ․ ՓՈՍՏ
          </label>
          <input
            type="text"
            readOnly
            value={candidate.email || "Էլ. փոստ չկա"}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              fontSize: "14px",
              color: "#0f172a",
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>
            ՆԱՄԱԿԻ ՏԵՔՍՏ (ԿԱՐՈՂ ԵՍ ՓՈԽԵԼ ՆԱԽՔԱՆ ՈՒՂԱՐԿԵԼԸ)
          </label>
          <textarea
            rows={8}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#0f172a",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
          <button
            onClick={handleSendViaGmail}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: isInvite ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            ✉️ Ուղարկել Gmail-ով →
          </button>
        </div>
      </div>
    </div>
  );
}
