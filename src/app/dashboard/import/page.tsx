"use client";
import { useState } from "react";
import style from "./import.module.css";

export default function ImportPage() {
  const [formUrl, setFormUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [aiMode, setAiMode] = useState("NORMAL");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

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

      <div className={style.card}>
        <div className={style.stepBadge}>Քայլ 1</div>
        <h2 className={style.cardTitle}>Google Forms Հղումը (URL)</h2>
        <p className={style.cardDesc}>
          Պատճենիր հղումը Google Forms-ի էջից (օրինակ՝ https://docs.google.com/forms/d/e/.../viewform կամ /edit):
        </p>
        <input
          type="url"
          value={formUrl}
          onChange={(e) => setFormUrl(e.target.value)}
          placeholder="https://docs.google.com/forms/d/..."
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

      {error && <div className={style.errorBox}>{error}</div>}

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
