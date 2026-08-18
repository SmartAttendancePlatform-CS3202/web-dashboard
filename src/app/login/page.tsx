"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { RadioIcon, ShieldAlertIcon, UserCheckIcon, SparklesIcon } from "@/components/ui/Icons";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithSupabase, loginWithLecturerDemo, loginWithAdminDemo } = useAuth();

  const [email, setEmail] = useState("arthur.vance@university.ac.lk");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await loginWithSupabase(email, password);
    if (res.error) {
      setErrorMessage(res.error);
      setLoading(false);
    } else {
      if (res.role === "admin" || email.includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  };

  const handleLecturerDemo = () => {
    loginWithLecturerDemo();
    router.push("/");
  };

  const handleAdminDemo = () => {
    loginWithAdminDemo();
    router.push("/admin");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "var(--bg-main)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "20%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(0,0,0,0) 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "20%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(0,0,0,0) 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "36px 32px",
          borderRadius: "var(--radius-xl)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 16px auto",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 24px rgba(99, 102, 241, 0.5)",
            }}
          >
            <RadioIcon size={28} className="text-white" />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.55rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Smart Attendance Portal
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            University AI Biometric & Faculty Command Center
          </p>
        </div>

        {/* Quick Role Fill Buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => {
              setEmail("arthur.vance@university.ac.lk");
              setPassword("password123");
            }}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 600,
              backgroundColor: email.includes("arthur") ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.03)",
              border: email.includes("arthur") ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
              color: email.includes("arthur") ? "#818CF8" : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <UserCheckIcon size={14} /> Lecturer SSO
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("admin@university.ac.lk");
              setPassword("adminpass123");
            }}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: 600,
              backgroundColor: email.includes("admin") ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.03)",
              border: email.includes("admin") ? "1px solid var(--accent-secondary)" : "1px solid var(--border-subtle)",
              color: email.includes("admin") ? "#22D3EE" : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <ShieldAlertIcon size={14} /> Admin SSO
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              University Email Address
            </label>
            <input
              type="email"
              className="input-control"
              placeholder="user@university.ac.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              className="input-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage && (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                color: "#F87171",
                fontSize: "0.8rem",
              }}
            >
              {errorMessage}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "6px", justifyContent: "center" }} disabled={loading}>
            {loading ? "Authenticating with Supabase..." : "Sign In with University SSO"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "22px 0", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Instant Demo Access
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
        </div>

        {/* Dual Instant Demo Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleLecturerDemo}
            style={{ width: "100%", justifyContent: "center", borderColor: "rgba(99, 102, 241, 0.4)", color: "#818CF8" }}
          >
            <SparklesIcon size={16} />
            <span>Enter as Dr. Arthur Vance (Lecturer)</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleAdminDemo}
            style={{ width: "100%", justifyContent: "center", borderColor: "rgba(6, 182, 212, 0.4)", color: "#22D3EE" }}
          >
            <ShieldAlertIcon size={16} />
            <span>Enter as University Administrator</span>
          </button>
        </div>

        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "20px" }}>
          Smart Attendance Enterprise System • Secured by Supabase JWT & FastApi RBAC
        </p>
      </div>
    </div>
  );
}

