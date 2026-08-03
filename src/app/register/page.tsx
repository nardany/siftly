"use client";
import Link from "next/link";
import style from "../login/auth.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
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
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Գրանցումը հաջողվեց։ Բարի գալուստ, " + data.user.email);
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
        <form onSubmit={handleRegister} style={{ width: "100%" }}>
          <div className={style.formGroup}>
            <label>Full Name</label>
            <input
              className={style.inputField}
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className={style.formGroup}>
            <label>Company Name</label>
            <input
              className={style.inputField}
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Google"
              required
            />
          </div>

          <div className={style.formGroup}>
            <label>Work Email</label>
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
          <button type="submit" className={style.submitBtn} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <span className={style.switchPage}>
          Already have an account? <Link href="/login">Sign In</Link>
        </span>
      </div>
    </div>
  );
}