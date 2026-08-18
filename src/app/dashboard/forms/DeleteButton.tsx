"use client";
import { useRouter } from "next/navigation";
import style from "./forms.module.css";
import { useLanguage } from "@/lib/LanguageContext";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const handleDelete = async () => {
    if (!confirm(lang === "hy" ? "Համոզվա՞ծ եք, որ ցանկանում եք ջնջել այս հարցաշարը:" : "Are you sure you want to delete this form?")) return;

    const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });

    if (res.ok) {
      router.refresh();
    } else {
      alert(lang === "hy" ? "Սխալ ջնջելիս" : "Error deleting form");
    }
  };

  return (
    <button onClick={handleDelete} className={style.deleteBtn}>
      {t.deleteFormBtn}
    </button>
  );
}