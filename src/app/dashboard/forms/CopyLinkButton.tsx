"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = () => {
    const fullLink = `${window.location.origin}/apply/${slug}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        backgroundColor: copied ? "#10b981" : "#f1f5f9",
        color: copied ? "white" : "#334155",
        padding: "8px 12px",
        border: copied ? "1px solid #10b981" : "1px solid #cbd5e1",
        borderRadius: "6px",
        cursor: "pointer",
        transition: "0.2s",
        fontSize: "14px",
        fontWeight: "500",
        flex: "1"
      }}
    >
      {copied ? t.linkCopied : t.copyLink}
    </button>
  );
}