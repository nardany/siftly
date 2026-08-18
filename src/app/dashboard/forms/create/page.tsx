"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import style from "./builder.module.css";
import { useLanguage } from "@/lib/LanguageContext";

type Question = {
  id: string;
  text: string;
  type: "TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILE" | "CODE" | "URL";
  options?: string[];
};

export default function FormBuilder() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [title, setTitle] = useState(lang === "hy" ? "Անանուն Հարցաշար" : "Untitled Form");
  const [themeColor, setThemeColor] = useState("#0f172a");
  const [jobDescription, setJobDescription] = useState("");
  const [aiEvaluationMode, setAiEvaluationMode] = useState("NORMAL");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "", type: "TEXT" }
  ]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addQuestion = () => {
    const newId = crypto.randomUUID();
    setQuestions([...questions, { id: newId, text: "", type: "TEXT" }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      return alert(lang === "hy" ? "Հարցաշարում պետք է լինի առնվազն 1 հարց:" : "Form must have at least 1 question.");
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newQuestions = [...questions];
    const item = newQuestions.splice(draggedIndex, 1)[0];
    newQuestions.splice(index, 0, item);
    setDraggedIndex(index);
    setQuestions(newQuestions);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const updatedQuestion = { ...q, [field]: value };
        if (field === "type" && (value === "SINGLE_CHOICE" || value === "MULTIPLE_CHOICE") && !q.options) {
          updatedQuestion.options = [
            lang === "hy" ? "Տարբերակ 1" : "Option 1",
            lang === "hy" ? "Տարբերակ 2" : "Option 2"
          ];
        }
        return updatedQuestion;
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, newValue: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = newValue;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const optLabel = lang === "hy" ? `Տարբերակ ${q.options.length + 1}` : `Option ${q.options.length + 1}`;
        return { ...q, options: [...q.options, optLabel] };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return alert(lang === "hy" ? "Խնդրում ենք գրել հարցաշարի վերնագիրը" : "Please enter a form title");
    }

    const formattedQuestions = questions.map(q => ({
      text: q.text,
      type: q.type,
      options: (q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && q.options
        ? JSON.stringify(q.options)
        : null
    }));

    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, themeColor, jobDescription, questions: formattedQuestions, aiEvaluationMode })
    });

    const data = await res.json();

    if (res.ok) {
      alert(lang === "hy" ? "Հարցաշարը հաջողությամբ պահպանվեց!" : "Form saved successfully!");
      router.push("/dashboard/forms");
    } else {
      alert("Error: " + data.error);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.header} style={{ borderTopColor: themeColor }}>
        <input
          type="text"
          className={style.titleInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.formTitlePlaceholder}
        />
        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "14px", color: "#64748b" }}>{t.selectThemeColor}</label>
          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            style={{ border: "none", width: "30px", height: "30px", cursor: "pointer" }}
          />
        </div>

        <textarea
          className={style.jobDescriptionInput}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder={t.jobDescriptionPlaceholder}
        />
        <div className={style.selectWrapper}>
          <label className={style.selectLabel}>{t.aiStrictness}</label>
          <select
            value={aiEvaluationMode}
            onChange={(e) => setAiEvaluationMode(e.target.value)}
            className={style.selectInput}
          >
            <option value="LENIENT">{t.lenient}</option>
            <option value="NORMAL">{t.normal}</option>
            <option value="STRICT">{t.strict}</option>
          </select>
        </div>
      </div>

      {questions.map((q, index) => (
        <div
          key={q.id}
          className={style.questionCard}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          style={{
            opacity: draggedIndex === index ? 0.4 : 1,
            cursor: "grab",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", cursor: "grab" }}>
              {t.dragAndDrop} ({lang === "hy" ? `Հարց #${index + 1}` : `Question #${index + 1}`})
            </span>
            <button
              onClick={() => removeQuestion(q.id)}
              style={{
                background: "none",
                border: "none",
                color: "#ef4444",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              {t.delete}
            </button>
          </div>

          <div className={style.questionRow}>
            <input
              type="text"
              className={style.questionTextInput}
              placeholder={lang === "hy" ? `Հարց ${index + 1}` : `Question ${index + 1}`}
              value={q.text}
              onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
            />
            <select
              className={style.typeSelect}
              value={q.type}
              onChange={(e) => updateQuestion(q.id, "type", e.target.value)}
            >
              <option value="TEXT">{t.shortText}</option>
              <option value="SINGLE_CHOICE">{t.singleChoice}</option>
              <option value="MULTIPLE_CHOICE">{t.multipleChoice}</option>
              <option value="FILE">{t.fileUpload}</option>
              <option value="CODE">{t.codeEditor}</option>
              <option value="URL">{t.urlLink}</option>
            </select>
          </div>

          {(q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && q.options && (
            <div className={style.optionsContainer}>
              <p className={style.optionsTitle}>
                {t.optionsTitle}
                <span style={{ fontWeight: "normal", color: "#94a3b8", marginLeft: "8px" }}>
                  {q.type === "SINGLE_CHOICE" ? t.singleChoiceNote : t.multipleChoiceNote}
                </span>
              </p>

              {q.options.map((opt, i) => (
                <div key={i} className={style.optionRow}>
                  <div style={{
                    width: "16px", height: "16px",
                    border: "2px solid #cbd5e1",
                    borderRadius: q.type === "SINGLE_CHOICE" ? "50%" : "4px"
                  }}></div>

                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(q.id, i, e.target.value)}
                    className={style.optionInput}
                  />
                </div>
              ))}

              <button onClick={() => addOption(q.id)} className={style.addOptionBtn}>
                {t.addOption}
              </button>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
        <button onClick={addQuestion} className={style.addBtn}>
          {t.addQuestion}
        </button>
        <button onClick={handleSave} className={style.saveBtn}>
          {t.saveForm}
        </button>
      </div>
    </div>
  );
}