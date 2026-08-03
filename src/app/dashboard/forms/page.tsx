import Link from "next/link";
import style from "./forms.module.css";
import prisma from "../../../lib/prisma";
import { getUserFromToken } from "../../../lib/auth";

export default async function MyFormsPage() {
  const user = await getUserFromToken();

  const myForms = user ? await prisma.form.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { candidates: true } }
    },
    orderBy: { createdAt: "desc" }
  }) : [];

  return (
    <div className={style.container}>
      <div className={style.header}>
        <h1 className={style.title}>Իմ Հարցաշարերը</h1>
        <Link href="/dashboard/forms/create" className={style.createBtn}>
          + Նոր հարցաշար
        </Link>
      </div>

      {myForms.length === 0 ? (
        <p style={{ color: "#64748b" }}>Դուք դեռ հարցաշարեր չունեք:</p>
      ) : (
        <div className={style.grid}>
          {myForms.map((form) => (
            <div key={form.id} className={style.card} style={{ borderTop: `4px solid ${form.themeColor}` }}>
              <h3 className={style.cardTitle}>{form.title}</h3>

              <p className={style.cardStat}>Դիմորդներ: {form._count.candidates}</p>

              <div className={style.cardActions}>
                <Link href={`/dashboard/forms/${form.id}/edit`} className={style.editBtn} style={{ textAlign: "center", textDecoration: "none" }}>
                  Փոփոխել
                </Link>
                <button className={style.deleteBtn}>Ջնջել</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}