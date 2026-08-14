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
        cheatLogsRef.current.push(`Դուրս է եկել էջից: ${new Date().toLocaleTimeString()}`);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handlePaste = (e: React.ClipboardEvent) => {
    trustScoreRef.current = Math.max(0, trustScoreRef.current - 20);
    cheatLogsRef.current.push(`Copy-Paste արեց կոդի մեջ: ${new Date().toLocaleTimeString()}`);
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      return alert("Խնդրում ենք լրացնել ձեր անձնական տվյալները");
    }

    setIsSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Convert any File objects in answers to base64 Data URLs
    const formattedAnswers: Record<string, any> = {};
    for (const [qId, val] of Object.entries(answers)) {
      if (val instanceof File) {
        try {
          formattedAnswers[qId] = await readFileAsBase64(val);
        } catch {
          formattedAnswers[qId] = "Ֆայլի կցման սխալ";
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
      else { alert("Տեղի ունեցավ սխալ տվյալներն ուղարկելիս:"); }
    } catch {
      alert("Կապի սխալ: Խնդրում ենք կրկին փորձել:");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={style.pageWrapper} style={{ alignItems: "center" }}>
        <div className={style.formContainer} style={{ textAlign: "center", padding: "60px 20px" }}>
          <h1 style={{ fontSize: "32px", color: "#10b981", marginBottom: "16px" }}>Շնորհակալություն!</h1>
          <p style={{ fontSize: "18px", color: "#64748b" }}>Ձեր պատասխանները հաջողությամբ ուղարկվել են:</p>
          <p style={{ fontSize: "16px", color: "#94a3b8", marginTop: "8px" }}>HR թիմը կկապնվի ձեզ հետ արդյունքների համար:</p>
        </div>
      </div>
    );
  }

  return (
    <div className={style.pageWrapper}>
      <div className={style.formContainer} style={{ borderTop: `6px solid ${form.themeColor || "#3b82f6"}` }}>
        <div className={style.header}>
           <img src={form.user?.companyLogo || "/siftlylogoblack.png"} className={style.logo} alt="Logo" />
           <div>
             <h1 className={style.formTitle}>{form.title}</h1>
             {form.user?.companyName && <p className={style.companyName}>{form.user.companyName}</p>}
             {form.user?.companyDescription && <p className={style.companyName}>{form.user.companyDescription}</p>}
           </div>
        </div>

        <form onSubmit={handleSubmit} className={style.questionList}>

           <div className={style.questionBlock}>
             <label className={style.questionText}>Անուն *</label>
             <input type="text" placeholder="Ձեր անունը" required className={style.input} value={firstName} onChange={e => setFirstName(e.target.value)} />
           </div>

           <div className={style.questionBlock}>
             <label className={style.questionText}>Ազգանուն *</label>
             <input type="text" placeholder="Ձեր ազգանունը" required className={style.input} value={lastName} onChange={e => setLastName(e.target.value)} />
           </div>

           <div className={style.questionBlock}>
             <label className={style.questionText}>Էլեկտրոնային հասցե *</label>
             <input type="email" placeholder="example@gmail.com" required className={style.input} value={email} onChange={e => setEmail(e.target.value)} />
           </div>

           <div className={style.questionBlock}>
             <label className={style.questionText}>Հեռախոսահամար *</label>
             <input type="tel" placeholder="+374 __ ______" required className={style.input} value={phone} onChange={e => setPhone(e.target.value)} />
           </div>

           <hr style={{ border: "0", borderTop: "1px dashed #cbd5e1", margin: "20px 0" }} />

           {form.questions.map((q: any, index: number) => {
             const qTypeUpper = (q.type || "").toUpperCase();
             return (
               <div key={q.id} className={style.questionBlock}>
                  <label className={style.questionText}>{index + 1}. {q.text}</label>

                  {qTypeUpper === "TEXT" && <textarea className={style.input} onChange={e => handleAnswerChange(q.id, e.target.value)} placeholder="Ձեր պատասխանը..." />}
                  {qTypeUpper === "URL" && <input type="url" className={style.input} onChange={e => handleAnswerChange(q.id, e.target.value)} placeholder="https://..." />}
                  {qTypeUpper === "CODE" && <textarea className={style.codeEditor} onChange={e => handleAnswerChange(q.id, e.target.value)} onPaste={handlePaste} placeholder="// Գրեք Ձեր կոդը այստեղ..." spellCheck={false} />}
                  {qTypeUpper === "SINGLE_CHOICE" && q.options && JSON.parse(q.options).map((opt: string, i: number) => (
                     <label key={i} className={style.choiceLabel}><input type="radio" name={q.id} value={opt} onChange={e => handleAnswerChange(q.id, e.target.value)} /> <span>{opt}</span></label>
                  ))}
                  {qTypeUpper === "MULTIPLE_CHOICE" && q.options && JSON.parse(q.options).map((opt: string, i: number) => (
                    <label key={i} className={style.choiceLabel}>
                      <input type="checkbox" value={opt} onChange={e => { const currentAnswers = answers[q.id] || []; if (e.target.checked) handleAnswerChange(q.id, [...currentAnswers, opt]); else handleAnswerChange(q.id, currentAnswers.filter((a: string) => a !== opt)); }} />
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

           <button type="submit" disabled={isSubmitting} className={style.submitBtn} style={{ backgroundColor: form.themeColor || "#3b82f6" }}>
             {isSubmitting ? "Ուղարկվում է..." : "Ավարտել և Ուղարկել"}
           </button>
        </form>
      </div>
    </div>
  );
}