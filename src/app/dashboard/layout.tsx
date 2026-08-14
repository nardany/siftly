"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import style from "./layout.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/forms", label: "My Forms", icon: "📋" },
    { href: "/dashboard/import", label: "Google Forms Import", icon: "🔗" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className={style.dashboardContainer}>
      <header className={style.mobileHeader}>
        <div className={style.mobileLogo}>
          <img src="/siftlylogo.png" alt="Siftly" className={style.logoImage} />
          <span className={style.logoText}>Siftly</span>
        </div>
        <button
          className={style.hamburger}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>

      {mobileOpen && (
        <div className={style.overlay} onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`${style.sidebar} ${mobileOpen ? style.sidebarOpen : ""}`}>
        <div className={style.logo}>
          <img src="/siftlylogo.png" alt="Siftly" className={style.logoImage} />
          <span className={style.logoText}>Siftly</span>
        </div>

        <nav className={style.navLinks}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${style.navItem} ${isActive ? style.activeNavItem : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <span className={style.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={style.sidebarFooter}>
          <button
            className={style.logoutBtn}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
          >
            <span className={style.navIcon}>🚪</span>
            <span>Դուրս գալ</span>
          </button>
        </div>
      </aside>

      <main className={style.mainContent}>
        {children}
      </main>
    </div>
  );
}