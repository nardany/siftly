"use client";
import { useState } from "react";
import style from "./builder.module.css";

type Question = {
  id: string;
  text: string;

  type: "TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILE";
  options?: string[];
};

export default function FormBuilder() {
  const [title, setTitle] = useState("Անանուն Հարցաշար");
  const [themeColor, setThemeColor] = useState("#0f172a");
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", text: "", type: "TEXT" }
  ]);

  const addQuestion = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    setQuestions([...questions, { id: newId, text: "", type: "TEXT" }]);
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const updatedQuestion = { ...q, [field]: value };
        if (field === "type" && (value === "SINGLE_CHOICE" || value === "MULTIPLE_CHOICE") && !q.options) {
          updatedQuestion.options = ["Տարբերակ 1", "Տարբերակ 2"];
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
        return { ...q, options: [...q.options, `Տարբերակ ${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return alert("Խնդրում ենք գրել հարցաշարի վերնագիրը");
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
      body: JSON.stringify({ title, themeColor, questions: formattedQuestions })
    });

    const data = await res.json();

    if (res.ok) {
      alert("🎉 Հարցաշարը հաջողությամբ պահպանվեց բազայում!\nՁեր հղումը՝ /apply/" + data.slug);
    } else {
      alert("Սխալ: " + data.error);
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
          placeholder="Հարցաշարի վերնագիրը"
        />
        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "14px", color: "#64748b" }}>Ընտրիր գույնը:</label>
          <input
            type="color"
            value={themeColor}
            onChange={(e) => setThemeColor(e.target.value)}
            style={{ border: "none", width: "30px", height: "30px", cursor: "pointer" }}
          />
        </div>
      </div>

      {questions.map((q, index) => (
        <div key={q.id} className={style.questionCard}>
          <div className={style.questionRow}>
            <input
              type="text"
              className={style.questionTextInput}
              placeholder={`Հարց ${index + 1}`}
              value={q.text}
              onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
            />
            <select
              className={style.typeSelect}
              value={q.type}
              onChange={(e) => updateQuestion(q.id, "type", e.target.value)}
            >
              <option value="TEXT">Կարճ Տեքստ</option>
              <option value="SINGLE_CHOICE">Միակ ընտրություն</option>
              <option value="MULTIPLE_CHOICE">Բազմակի ընտրություն</option>
              <option value="FILE">Ֆայլ (CV)</option>
            </select>
          </div>

          {(q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && q.options && (
            <div className={style.optionsContainer}>
              <p className={style.optionsTitle}>
                Պատասխանի տարբերակներ
                <span style={{ fontWeight: "normal", color: "#94a3b8", marginLeft: "8px" }}>
                  {q.type === "SINGLE_CHOICE" ? "(Դիմորդը կընտրի միայն 1 հատ)" : "(Դիմորդը կարող է ընտրել մի քանի հատ)"}
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
                + Ավելացնել տարբերակ
              </button>
            </div>
          )}

        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
        <button onClick={addQuestion} className={style.addBtn}>
          + Ավելացնել Հարց
        </button>
        <button onClick={handleSave} className={style.saveBtn}>
          Պահպանել Հարցաշարը
        </button>
      </div>
    </div>
  );
}