"use client";

import { useState } from "react";
import Link from "next/link";
import style from "../login/auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Գաղտնաբառը հաջողությամբ թարմացվեց! Կարող եք մուտք գործել:");
      } else {
        setError(data.message || "Սխալ տվյալների թարմացման ժամանակ:");
      }
    } catch {
      setError("Կապի սխալ — կրկին փորձեք:");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.authCard}>
        <img src="/siftlylogoblack.png" alt="Siftly" className={style.logoImage} />
        <h2 className={style.title}>Reset Password</h2>

        <form onSubmit={handleReset} style={{ width: "100%" }}>
          <div className={style.formGroup}>
            <label>Work Email</label>
            <input
              className={style.inputField}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hr@company.com"
              required
            />
          </div>

          <div className={style.formGroup}>
            <label>New Password</label>
            <input
              className={style.inputField}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {message && <div style={{ color: "#16a34a", fontSize: "14px", marginBottom: "16px", fontWeight: 600 }}>{message}</div>}
          {error && <div style={{ color: "#dc2626", fontSize: "14px", marginBottom: "16px", fontWeight: 600 }}>{error}</div>}

          <button type="submit" className={style.submitBtn} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <span className={style.switchPage}>
          Remember your password? <Link href="/login">Sign In</Link>
        </span>
      </div>
    </div>
  );
}
