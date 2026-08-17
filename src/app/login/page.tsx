"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { RadioIcon } from "@/components/ui/Icons";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithSupabase, loginWithDemo } = useAuth();

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
      router.push("/");
    }
  };

  const handleDemoClick = () => {
    loginWithDemo();
    router.push("/");
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
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)",
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
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(0,0,0,0) 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "440px",
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
              width: "48px",
              height: "48px",
              margin: "0 auto 16px auto",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
            }}
          >
            <RadioIcon size={26} className="text-white" />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Lecturer Portal
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Smart Attendance & AI Classroom Verification
          </p>
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
              placeholder="lecturer@university.ac.lk"
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

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
            {loading ? "Authenticating with Supabase..." : "Sign In with University SSO"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "24px 0", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Or Instant Demo</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-subtle)" }} />
        </div>

        {/* Instant Demo Button */}
        <button
          type="button"
          className="btn-secondary"
          onClick={handleDemoClick}
          style={{ width: "100%", justifyContent: "center", borderColor: "rgba(99, 102, 241, 0.4)", color: "#818CF8" }}
        >
          ⚡ Enter as Dr. Arthur Vance (Demo Evaluator)
        </button>

        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "20px" }}>
          Restricted access. Authorized faculty and academic personnel only.
        </p>
      </div>
    </div>
  );
}
