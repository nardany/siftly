"use client";
import { useState, useEffect } from "react";
import style from "./settings.module.css";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: "",
    companyDescription: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/settings")
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFormData({
            companyName: data.companyName || "",
            companyLogo: data.companyLogo || "",
            companyDescription: data.companyDescription || ""
          });
        }
        setIsLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await fetch("/api/user/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert("Հաջողությամբ պահպանվեց");
    } else {
      alert("Սխալ տեղի ունեցավ");
    }
    setIsSaving(false);
  };

  if (isLoading) return <div style={{ padding: "20px" }}>Բեռնվում է...</div>;

  return (
    <div className={style.container}>
      <h1 className={style.title}>Կարգավորումներ</h1>

      <div className={style.card}>
        <h2 className={style.cardTitle}>Ընկերության Պրոֆիլը</h2>

        <form onSubmit={handleSave}>
          
          <div className={style.formGroup}>
            <label className={style.label}>Ընկերության Անունը</label>
            <input
              type="text" name="companyName"
              value={formData.companyName} onChange={handleChange}
              className={style.inputField} required
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>Լոգո (URL հղում)</label>
            <input
              type="text" name="companyLogo" placeholder="https://..."
              value={formData.companyLogo} onChange={handleChange}
              className={style.inputField}
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>Մեր մասին</label>
            <textarea
              name="companyDescription" placeholder="Կարճ նկարագրություն..."
              value={formData.companyDescription} onChange={handleChange}
              className={style.textareaField}
            />
          </div>

          <button type="submit" className={style.saveBtn} disabled={isSaving}>
            {isSaving ? "Պահպանվում է..." : "Պահպանել փոփոխությունները"}
          </button>
        </form>
      </div>
    </div>
  );
}