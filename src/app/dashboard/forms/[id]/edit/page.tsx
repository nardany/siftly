"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import style from "../../create/builder.module.css";

type Question = {
  id: string;
  text: string;
  type: "TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILE" | "CODE" | "URL";
  options?: string[];
};

export default function EditFormBuilder() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [themeColor, setThemeColor] = useState("#0f172a");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aiEvaluationMode, setAiEvaluationMode] = useState("NORMAL");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/forms/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert("Հարցաշարը չի գտնվել");
          router.push("/dashboard/forms");
          return;
        }
        setTitle(data.title);
        setThemeColor(data.themeColor || "#0f172a");
        setJobDescription(data.jobDescription || "");

        const loadedQuestions = data.questions.map((q: any) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.options ? JSON.parse(q.options) : undefined
        }));

        setQuestions(loadedQuestions);
        setLoading(false);
      })
      .catch(() => {
        alert("Սխալ տվյալներ կարդալիս");
        setLoading(false);
      });
  }, [params.id, router]);

  const addQuestion = () => {
    const newId = crypto.randomUUID();
    setQuestions([...questions, { id: newId, text: "", type: "TEXT" }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      return alert("Հարցաշարում պետք է լինի առնվազն 1 հարց:");
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

  const handleUpdate = async () => {
    if (!title.trim()) {
      return alert("Խնդրում ենք գրել հարցաշարի վերնագիրը");
    }

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: (q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && q.options
        ? JSON.stringify(q.options)
        : null
    }));

    const res = await fetch(`/api/forms/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, themeColor, jobDescription, questions: formattedQuestions, aiEvaluationMode })
    });

    if (res.ok) {
      alert("Փոփոխությունները հաջողությամբ պահպանվեցին!");
      router.push("/dashboard/forms");
    } else {
      const data = await res.json();
      alert("Սխալ: " + data.error);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", fontSize: "18px" }}>Բեռնվում է հարցաշարը...</div>;
  }

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
        <textarea
          className={style.jobDescriptionInput}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Հաստիքի նկարագրությունը / պահանջները (Սա կարդալու է միայն AI-ը, դիմորդը չի տեսնելու)"
        />
        <div className={style.selectWrapper}>
          <label className={style.selectLabel}>AI Գնահատման Խստություն</label>
          <select
            value={aiEvaluationMode}
            onChange={(e) => setAiEvaluationMode(e.target.value)}
            className={style.selectInput}
          >
            <option value="LENIENT">Մեղմ</option>
            <option value="NORMAL">Նորմալ</option>
            <option value="STRICT">Խիստ</option>
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
              ⋮⋮(Հարց {index + 1})
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
              🗑️ Ջնջել
            </button>
          </div>

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
              <option value="SINGLE_CHOICE">Միակ ընտրություն (Radio)</option>
              <option value="MULTIPLE_CHOICE">Բազմակի ընտրություն (Checkbox)</option>
              <option value="FILE">Ֆայլ (CV/Resume)</option>
              <option value="CODE">Կոդի Գրառում (Code Editor)</option>
              <option value="URL">Հղում (GitHub / LinkedIn)</option>
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
        <button onClick={handleUpdate} className={style.saveBtn}>
          Թարմացնել Հարցաշարը
        </button>
      </div>
    </div>
  );
}