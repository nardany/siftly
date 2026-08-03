"use client";
import Link from "next/link";
import style from "./auth.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Մուտքը հաջողվեց։ Բարի գալուստ, " + data.user.fullName);
      router.push("/dashboard");
    } else {
      alert("Սխալ: " + data.message);
    }
  } catch (error) {
    console.error("Խնդիր կապի հետ:", error);
    alert("Խնդիր կապի հետ");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className={style.container}>
      <div className={style.authCard}>
        <div className={style.logoBox}></div>
        <h2 className={style.title}>Siftly</h2>

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <div className={style.formGroup}>
            <label>Email</label>
            <input
              className={style.inputField}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="hr@company.com"
              required
            />
          </div>

          <div className={style.formGroup}>
            <label>Password</label>
            <input
              className={style.inputField}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <span className={style.forgotPassword}>Forgot Password?</span>
          <button type="submit" className={style.submitBtn} disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <span className={style.switchPage}>
          Don't have an account? <Link href="/register">Create Account</Link>
        </span>
      </div>
    </div>
  );
}