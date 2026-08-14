"use client";
import { useRouter } from "next/navigation";
import style from "./forms.module.css";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Համոզվա՞ծ եք, որ ցանկանում եք ջնջել այս հարցաշարը:")) return;

    const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Սխալ ջնջելիս");
    }
  };

  return (
    <button onClick={handleDelete} className={style.deleteBtn}>
      Ջնջել
    </button>
  );
}