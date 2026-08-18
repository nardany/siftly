"use client";

import { useState, useEffect, useRef } from "react";
import style from "./apply.module.css";

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ApplyClient({ form }: { form: any }) {
  const [lang, setLang] = useState<"hy" | "en">("hy");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [startTime] = useState(Date.now());
  const trustScoreRef = useRef(100);
  const cheatLogsRef = useRef<string[]>([]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trustScoreRef.current = Math.max(0, trustScoreRef.current - 15);
        cheatLogsRef.current.push(`Tab switched at: ${new Date().toLocaleTimeString()}`);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handlePaste = () => {
    trustScoreRef.current = Math.max(0, trustScoreRef.current - 20);
    cheatLogsRef.current.push(`Copy-pasted code at: ${new Date().toLocaleTimeString()}`);
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      return alert(lang === "hy" ? "Խնդրում ենք լրացնել ձեր անձնական տվյալները" : "Please fill out all personal details");
    }

    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const formattedAnswers: Record<string, any> = {};
    for (const [qId, val] of Object.entries(answers)) {
      if (val instanceof File) {
        try {
          formattedAnswers[qId] = await readFileAsBase64(val);
        } catch {
          formattedAnswers[qId] = "[File Attachment Error]";
        }
      } else {
        formattedAnswers[qId] = val;
      }
    }

    const payload = {
      formId: form.id,
      firstName,
      lastName,
      email,
      phone,
      answers: formattedAnswers,
      trustScore: trustScoreRef.current,
      cheatLogs: cheatLogsRef.current.join(" | "),
      timeSpent
    };

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) setIsSuccess(true);
      else alert(lang === "hy" ? "Տեղի ունեցավ սխալ տվյալներն ուղարկելիս:" : "An error occurred while submitting.");
    } catch {
      alert(lang === "hy" ? "Կապի սխալ: Խնդրում ենք կրկին փորձել:" : "Connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={style.pageWrapper} style={{ alignItems: "center" }}>
        <div className={style.formContainer} style={{ textAlign: "center", padding: "60px 20px" }}>
          <h1 style={{ fontSize: "32px", color: "#10b981", marginBottom: "16px" }}>
            {lang === "hy" ? "Շնորհակալություն!" : "Thank You!"}
          </h1>
          <p style={{ fontSize: "18px", color: "#64748b" }}>
            {lang === "hy" ? "Ձեր պատասխանները հաջողությամբ ուղարկվել են:" : "Your responses have been successfully submitted."}
          </p>
          <p style={{ fontSize: "16px", color: "#94a3b8", marginTop: "8px" }}>
            {lang === "hy" ? "HR թիմը կկապնվի ձեզ հետ արդյունքների համար:" : "The HR team will reach out to you with the results."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={style.pageWrapper}>
      <div className={style.formContainer} style={{ borderTop: `6px solid ${form.themeColor || "#3b82f6"}` }}>
        <div className={style.header} style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img src={form.user?.companyLogo || "/siftlylogoblack.png"} className={style.logo} alt="Logo" />
            <div>
              <h1 className={style.formTitle}>{form.title}</h1>
              {form.user?.companyName && <p className={style.companyName}>{form.user.companyName}</p>}
              {form.user?.companyDescription && <p className={style.companyName}>{form.user.companyDescription}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLang(lang === "hy" ? "en" : "hy")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#0f172a",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            {lang === "hy" ? "🇦🇲 HY" : "🇬🇧 EN"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className={style.questionList}>
          <div className={style.questionBlock}>
            <label className={style.questionText}>{lang === "hy" ? "Անուն *" : "First Name *"}</label>
            <input
              type="text"
              placeholder={lang === "hy" ? "Ձեր անունը" : "Your first name"}
              required
              className={style.input}
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>

          <div className={style.questionBlock}>
            <label className={style.questionText}>{lang === "hy" ? "Ազգանուն *" : "Last Name *"}</label>
            <input
              type="text"
              placeholder={lang === "hy" ? "Ձեր ազգանունը" : "Your last name"}
              required
              className={style.input}
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>

          <div className={style.questionBlock}>
            <label className={style.questionText}>{lang === "hy" ? "Էլեկտրոնային հասցե *" : "Email Address *"}</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              required
              className={style.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className={style.questionBlock}>
            <label className={style.questionText}>{lang === "hy" ? "Հեռախոսահամար *" : "Phone Number *"}</label>
            <input
              type="tel"
              placeholder="+374 __ ______"
              required
              className={style.input}
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <hr style={{ border: "0", borderTop: "1px dashed #cbd5e1", margin: "20px 0" }} />

          {form.questions.map((q: any, index: number) => {
            const qTypeUpper = (q.type || "").toUpperCase();
            return (
              <div key={q.id} className={style.questionBlock}>
                <label className={style.questionText}>{index + 1}. {q.text}</label>

                {qTypeUpper === "TEXT" && (
                  <textarea
                    className={style.input}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    placeholder={lang === "hy" ? "Ձեր պատասխանը..." : "Your response..."}
                  />
                )}
                {qTypeUpper === "URL" && (
                  <input
                    type="url"
                    className={style.input}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    placeholder="https://..."
                  />
                )}
                {qTypeUpper === "CODE" && (
                  <textarea
                    className={style.codeEditor}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    onPaste={handlePaste}
                    placeholder={lang === "hy" ? "// Գրեք Ձեր կոդը այստեղ..." : "// Write your code here..."}
                    spellCheck={false}
                  />
                )}
                {qTypeUpper === "SINGLE_CHOICE" && q.options && JSON.parse(q.options).map((opt: string, i: number) => (
                  <label key={i} className={style.choiceLabel}>
                    <input type="radio" name={q.id} value={opt} onChange={e => handleAnswerChange(q.id, e.target.value)} />
                    <span>{opt}</span>
                  </label>
                ))}
                {qTypeUpper === "MULTIPLE_CHOICE" && q.options && JSON.parse(q.options).map((opt: string, i: number) => (
                  <label key={i} className={style.choiceLabel}>
                    <input
                      type="checkbox"
                      value={opt}
                      onChange={e => {
                        const currentAnswers = answers[q.id] || [];
                        if (e.target.checked) handleAnswerChange(q.id, [...currentAnswers, opt]);
                        else handleAnswerChange(q.id, currentAnswers.filter((a: string) => a !== opt));
                      }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
                {(qTypeUpper === "FILE" || qTypeUpper === "CV" || qTypeUpper === "RESUME") && (
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className={style.fileInput}
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleAnswerChange(q.id, e.target.files[0]);
                      }
                    }}
                  />
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={isSubmitting}
            className={style.submitBtn}
            style={{ backgroundColor: form.themeColor || "#3b82f6" }}
          >
            {isSubmitting
              ? (lang === "hy" ? "Ուղարկվում է..." : "Submitting...")
              : (lang === "hy" ? "Ավարտել և Ուղարկել" : "Submit Application")}
          </button>
        </form>
      </div>
    </div>
  );
}