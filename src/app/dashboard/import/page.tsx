"use client";
import { useState, useEffect } from "react";
import style from "./import.module.css";
import { useLanguage } from "@/lib/LanguageContext";

export default function ImportPage() {
  const { t, lang } = useLanguage();
  const [formUrl, setFormUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [aiMode, setAiMode] = useState("NORMAL");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/google/status")
      .then((res) => res.json())
      .then((data) => setIsConnected(data.isConnected))
      .catch(() => setIsConnected(false));
  }, []);

  const handleConnectGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  const handleImport = async () => {
    if (!formUrl) {
      setError(lang === "hy" ? "Խնդրում ենք լրացնել Google Forms URL-ը" : "Please enter a Google Form URL");
      return;
    }
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/google-forms/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formUrl, aiEvaluationMode: aiMode, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (lang === "hy" ? "Import-ի սխալ" : "Import error"));
        return;
      }
      setResult(data);
    } catch {
      setError(lang === "hy" ? "Կապի սխալ — կրկին փորձեք" : "Connection error — please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <h1 className={style.title}>{t.googleImportTitle}</h1>
      <p className={style.subtitle}>{t.googleImportSubtitle}</p>

      {/* Google Connection Status Banner */}
      <div
        className={style.card}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: isConnected ? "#f0fdf4" : "#fefce8",
          borderColor: isConnected ? "#86efac" : "#fef08a",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", color: isConnected ? "#166534" : "#854d0e" }}>
            {isConnected === null
              ? (lang === "hy" ? "Ստուգվում է Google հաշվի կապը..." : "Checking Google account status...")
              : isConnected
              ? t.googleAccountConnected
              : t.googleAccountNotConnected}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            {t.googleConnectionDesc}
          </p>
        </div>

        <button
          onClick={handleConnectGoogle}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            background: isConnected ? "#15803d" : "linear-gradient(135deg, #4285f4, #1a73e8)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "13px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {isConnected ? t.reconnectGoogle : t.connectWithGoogle}
        </button>
      </div>

      <div className={style.card}>
        <div className={style.stepBadge}>{lang === "hy" ? "Քայլ 1" : "Step 1"}</div>
        <h2 className={style.cardTitle}>{t.step1Title}</h2>
        <p className={style.cardDesc}>{t.step1Desc}</p>
        <input
          type="url"
          value={formUrl}
          onChange={(e) => setFormUrl(e.target.value)}
          placeholder="https://docs.google.com/forms/d/YOUR_FORM_ID/edit"
          className={style.input}
        />
      </div>

      <div className={style.card}>
        <div className={style.stepBadge}>{lang === "hy" ? "Քայլ 2" : "Step 2"}</div>
        <h2 className={style.cardTitle}>{t.step2Title}</h2>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder={t.jobDescriptionPlaceholder}
          className={style.textarea}
          rows={4}
        />
        <div style={{ marginTop: "12px" }}>
          <label className={style.selectLabel}>{t.aiStrictness}</label>
          <select value={aiMode} onChange={(e) => setAiMode(e.target.value)} className={style.select}>
            <option value="LENIENT">{t.lenient}</option>
            <option value="NORMAL">{t.normal}</option>
            <option value="STRICT">{t.strict}</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button onClick={handleImport} disabled={isLoading || !formUrl} className={style.importBtn}>
        {isLoading ? t.importingLoading : t.importButton}
      </button>

      {error && (
        <div className={style.errorBox}>
          <div>{error}</div>
          {!isConnected && (
            <button
              onClick={handleConnectGoogle}
              style={{
                marginTop: "8px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                background: "#4285f4",
                color: "#fff",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              {t.connectWithGoogle}
            </button>
          )}
        </div>
      )}

      {result && (
        <div className={style.successBox}>
          <h3>🎉 {result.message}</h3>
          <p>{lang === "hy" ? "Հարցաշարը հաջողությամբ ներմուծվել է Siftly" : "Form imported successfully into Siftly"}</p>
          <a href={`/dashboard/forms/${result.formId}/candidates`} className={style.viewResultBtn}>
            {lang === "hy" ? "Տեսնել Դիմորդներին →" : "View Applicants →"}
          </a>
        </div>
      )}
    </div>
  );
}
