"use client";
import { useState, useEffect } from "react";
import style from "./settings.module.css";
import { useLanguage } from "@/lib/LanguageContext";

export default function SettingsPage() {
  const { t, lang } = useLanguage();
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
      alert(t.settingsSavedSuccess);
    } else {
      alert(lang === "hy" ? "Սխալ տեղի ունեցավ" : "An error occurred");
    }
    setIsSaving(false);
  };

  if (isLoading) return <div style={{ padding: "20px" }}>{lang === "hy" ? "Բեռնվում է..." : "Loading..."}</div>;

  return (
    <div className={style.container}>
      <h1 className={style.title}>{t.settings}</h1>

      <div className={style.card}>
        <h2 className={style.cardTitle}>{t.settingsTitle}</h2>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>{t.settingsSubtitle}</p>

        <form onSubmit={handleSave}>
          <div className={style.formGroup}>
            <label className={style.label}>{t.companyNameLabel}</label>
            <input
              type="text" name="companyName"
              placeholder={t.companyNamePlaceholder}
              value={formData.companyName} onChange={handleChange}
              className={style.inputField} required
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>{t.companyLogoLabel}</label>
            <input
              type="text" name="companyLogo" placeholder={t.companyLogoPlaceholder}
              value={formData.companyLogo} onChange={handleChange}
              className={style.inputField}
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>{t.companyDescLabel}</label>
            <textarea
              name="companyDescription" placeholder={t.companyDescPlaceholder}
              value={formData.companyDescription} onChange={handleChange}
              className={style.textareaField}
            />
          </div>

          <button type="submit" className={style.saveBtn} disabled={isSaving}>
            {isSaving ? t.savingSettings : t.saveSettingsBtn}
          </button>
        </form>
      </div>
    </div>
  );
}