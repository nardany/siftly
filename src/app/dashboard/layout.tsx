"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import style from "./layout.module.css";
import { LanguageProvider, useLanguage } from "@/lib/LanguageContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  const navItems = [
    { href: "/dashboard", label: t.dashboard, icon: "📊" },
    { href: "/dashboard/forms", label: t.forms, icon: "📋" },
    { href: "/dashboard/import", label: t.importGoogleForms, icon: "🔗" },
    { href: "/dashboard/settings", label: t.settings, icon: "⚙️" },
  ];

  return (
    <div className={style.dashboardContainer}>
      <header className={style.mobileHeader}>
        <div className={style.mobileLogo}>
          <img src="/siftlylogo.png" alt="Siftly" className={style.logoImage} />
          <span className={style.logoText}>Siftly</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setLang(lang === "hy" ? "en" : "hy")}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            {lang === "hy" ? "🇦🇲 HY" : "🇬🇧 EN"}
          </button>
          <button
            className={style.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
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
            onClick={() => setLang(lang === "hy" ? "en" : "hy")}
            style={{
              width: "100%",
              marginBottom: "10px",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <span>🌐</span>
            <span>{lang === "hy" ? "🇦🇲 Armenian (HY)" : "🇬🇧 English (EN)"}</span>
          </button>

          <button
            className={style.logoutBtn}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
          >
            <span className={style.navIcon}>🚪</span>
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      <main className={style.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <DashboardContent>{children}</DashboardContent>
    </LanguageProvider>
  );
}