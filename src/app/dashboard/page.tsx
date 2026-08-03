import Link from "next/link";
import style from "./page.module.css";

export default function DashboardOverview() {
  const forms: any[] = [];

  return (
    <div className={style.container}>
      <h1 className={style.title}>Overview</h1>

      {forms.length === 0 ? (
        <div className={style.emptyState}>
          <h2 className={style.emptyTitle}>Դեռ ոչ մի հարցաշար չկա</h2>
          <p className={style.emptySubtitle}>
            Ստեղծիր առաջին հարցաշարը և սկսիր հավաքագրել թեկնածուներին
          </p>
          <Link href="/dashboard/forms/create" className={style.createBtn}>
            + Ստեղծել նոր հարցաշար
          </Link>
        </div>
      ) : (
        <div>
           <p>Արդյունքների աղյուսակ...</p>
        </div>
      )}
    </div>
  );
}