"use client";
import Link from "next/link";
import style from "./layout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={style.dashboardContainer}>
      
      <aside className={style.sidebar}>
        <div className={style.logo}>Siftly</div>

        <nav className={style.navLinks}>
          <Link href="/dashboard" className={style.navItem}>
            Overview
          </Link>
          <Link href="/dashboard/forms" className={style.navItem}>
            My Forms
          </Link>
          <Link href="/dashboard/settings" className={style.navItem}>
            Settings
          </Link>
        </nav>
      </aside>

      <main className={style.mainContent}>
        {children}
      </main>
    </div>
  );
}