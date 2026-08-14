"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SyncButtonProps {
  formId: string;
  googleFormUrl?: string | null;
}

export default function SyncButton({ formId, googleFormUrl }: SyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(!googleFormUrl);
  const [manualUrl, setManualUrl] = useState("");
  const router = useRouter();

  const effectiveUrl = googleFormUrl || manualUrl;

  const handleSync = async () => {
    if (!effectiveUrl) {
      setMessage("❌ Google Forms edit URL-ը paste արա");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/google-forms/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formUrl: effectiveUrl,
          aiEvaluationMode: "NORMAL",
          jobDescription: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`❌ ${data.error || "Sync-ը ձախողվեց"}`);
      } else {
        setMessage(
          data.importedCount > 0
            ? `✅ ${data.importedCount} նոր դիմորդ ավելացավ`
            : "✅ Արդեն թարմ է — նոր պատասխաններ չկան"
        );
        if (data.importedCount > 0) {
          router.refresh();
        }
      }
    } catch {
      setMessage("❌ Կապի սխալ — կրկին փորձեք");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
      {showInput && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://docs.google.com/forms/d/.../edit"
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1.5px solid #cbd5e1",
              fontSize: "13px",
              width: "300px",
              outline: "none",
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {googleFormUrl && (
          <button
            onClick={() => setShowInput((v) => !v)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1.5px solid #cbd5e1",
              background: "transparent",
              color: "#64748b",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {showInput ? "✕ Փակել" : "Փոխել URL"}
          </button>
        )}

        <button
          onClick={handleSync}
          disabled={loading || (!effectiveUrl)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background:
              loading || !effectiveUrl
                ? "#94a3b8"
                : "linear-gradient(135deg, #4285f4, #0f62d4)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            cursor: loading || !effectiveUrl ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(66,133,244,0.3)",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              display: "inline-block",
              animation: loading ? "spin 1s linear infinite" : "none",
            }}
          >
            🔄
          </span>
          {loading ? "Sync-ը կատարվում է..." : "Sync Google Forms"}
        </button>
      </div>

      {message && (
        <span
          style={{
            fontSize: "13px",
            color: message.startsWith("✅") ? "#22c55e" : "#ef4444",
            fontWeight: 500,
          }}
        >
          {message}
        </span>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
