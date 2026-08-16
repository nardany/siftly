"use client";
import { useState, useEffect } from "react";
import style from "./import.module.css";

export default function ImportPage() {
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
      setError("Խնդրում ենք լրացնել Google Forms URL-ը");
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
        setError(data.error || "Import-ի սխալ");
        return;
      }
      setResult(data);
    } catch {
      setError("Կապի սխալ — կրկին փորձեք");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <h1 className={style.title}>Google Forms Import 🚀</h1>
      <p className={style.subtitle}>
        Կպցրու Google Forms-ի հղումը, և Siftly-ն ավտոմատ կներմուծի հարցաշարն ու դիմորդներին AI գնահատմամբ:
      </p>

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
              ? "Ստուգվում է Google հաշվի կապը..."
              : isConnected
              ? "🟢 Google հաշիվը կապված է Siftly-ին"
              : "⚠️ Google հաշիվը դեռ կապված չէ"}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            Google Forms-ից տվյալներ կարդալու համար անհրաժեշտ է 1 անգամ կապել Google հաշիվը:
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
          {isConnected ? "🔄 Կրկին Կապել Google" : "🔗 Connect with Google"}
        </button>
      </div>

      <div className={style.card}>
        <div className={style.stepBadge}>Քայլ 1</div>
        <h2 className={style.cardTitle}>Google Forms Հղումը (URL)</h2>
        <p className={style.cardDesc}>
          Պատճենիր հղումը Google Forms-ի Edit էջից (browser-ի tab-ի հղումը, որն ավարտվում է /edit-ով, օրինակ՝ https://docs.google.com/forms/d/.../edit):
        </p>
        <input
          type="url"
          value={formUrl}
          onChange={(e) => setFormUrl(e.target.value)}
          placeholder="https://docs.google.com/forms/d/YOUR_FORM_ID/edit"
          className={style.input}
        />
      </div>

      <div className={style.card}>
        <div className={style.stepBadge}>Քայլ 2</div>
        <h2 className={style.cardTitle}>Հաստիքի Նկարագիր (Job Description) և AI Ռեժիմ</h2>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Նկարագրիր հաստիքի պահանջները, որպեսզի AI-ն ճշգրիտ գնահատի դիմորդներին..."
          className={style.textarea}
          rows={4}
        />
        <div style={{ marginTop: "12px" }}>
          <label className={style.selectLabel}>AI Գնահատման Ռեժիմ</label>
          <select value={aiMode} onChange={(e) => setAiMode(e.target.value)} className={style.select}>
            <option value="LENIENT">Մեղմ (Junior level)</option>
            <option value="NORMAL">Նորմալ (Standard)</option>
            <option value="STRICT">Խիստ (Senior level)</option>
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <button onClick={handleImport} disabled={isLoading || !formUrl} className={style.importBtn}>
        {isLoading ? "Ներմուծվում և գնահատվում է..." : "🚀 Ներմուծել և Գնահատել AI-ով"}
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
              🔗 Connect with Google Now
            </button>
          )}
        </div>
      )}

      {result && (
        <div className={style.successBox}>
          <h3>🎉 {result.message}</h3>
          <p>Հարցաշարը հաջողությամբ ներմուծվել է Siftly</p>
          <a href={`/dashboard/forms/${result.formId}/candidates`} className={style.viewResultBtn}>
            Տեսնել Դիմորդներին →
          </a>
        </div>
      )}
    </div>
  );
}
