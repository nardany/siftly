"use client";

import Link from "next/link";
import style from "./forms.module.css";
import DeleteButton from "./DeleteButton";
import CopyLinkButton from "./CopyLinkButton";
import { useLanguage } from "@/lib/LanguageContext";

interface FormItem {
  id: string;
  title: string;
  slug: string;
  themeColor: string;
  _count: { candidates: number };
}

export default function FormsClient({ myForms }: { myForms: FormItem[] }) {
  const { t, lang } = useLanguage();

  return (
    <div className={style.container}>
      <div className={style.header}>
        <h1 className={style.title}>{t.myForms}</h1>
        <Link href="/dashboard/forms/create" className={style.createBtn}>
          {t.createNewForm}
        </Link>
      </div>

      {myForms.length === 0 ? (
        <p style={{ color: "#64748b" }}>{t.noForms}</p>
      ) : (
        <div className={style.grid}>
          {myForms.map((form) => (
            <div key={form.id} className={style.card} style={{ borderTop: `4px solid ${form.themeColor}` }}>
              <h3 className={style.cardTitle}>{form.title}</h3>

              <p className={style.cardStat}>
                {lang === "hy" ? `Դիմորդներ: ${form._count.candidates}` : `Applicants: ${form._count.candidates}`}
              </p>

              <div className={style.cardActions}>
                <CopyLinkButton slug={form.slug} />
                <Link href={`/dashboard/forms/${form.id}/candidates`} className={style.editBtn}>
                  👥 {lang === "hy" ? `Դիմորդներ (${form._count.candidates})` : `Applicants (${form._count.candidates})`}
                </Link>
                {!form.slug.startsWith("gf-") && (
                  <Link href={`/dashboard/forms/${form.id}/edit`} className={style.editBtn} style={{ textAlign: "center", textDecoration: "none" }}>
                    {lang === "hy" ? "Փոփոխել" : "Edit"}
                  </Link>
                )}
                {form.slug.startsWith("gf-") && (
                  <span className={style.editBtn} style={{ textAlign: "center", textDecoration: "none" }}>
                    Google Forms
                  </span>
                )}
                <DeleteButton id={form.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
