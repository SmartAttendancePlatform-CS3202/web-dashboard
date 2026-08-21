"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { RadioIcon, ShieldAlertIcon, UserCheckIcon, SparklesIcon } from "@/components/ui/Icons";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithSupabase } = useAuth();

  const [selectedRole, setSelectedRole] = useState<"lecturer" | "admin">("lecturer");
  const [email, setEmail] = useState("arthur.vance@university.ac.lk");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (role: "lecturer" | "admin") => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === "lecturer") {
      setEmail("arthur.vance@university.ac.lk");
      setPassword("password123");
    } else {
      setEmail("admin@university.ac.lk");
      setPassword("adminpass123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const res = await loginWithSupabase(email, password);
    if (res.error) {
      setErrorMessage(res.error);
      setLoading(false);
    } else {
      if (selectedRole === "admin" || res.role === "admin" || email.includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
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
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 16px auto",
              borderRadius: "14px",
              background: selectedRole === "admin"
                ? "linear-gradient(135deg, #06B6D4 0%, #2563EB 100%)"
                : "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: selectedRole === "admin"
                ? "0 0 24px rgba(6, 182, 212, 0.4)"
                : "0 0 24px rgba(99, 102, 241, 0.5)",
              transition: "all 0.3s ease",
            }}
          >
            {selectedRole === "admin" ? (
              <ShieldAlertIcon size={28} className="text-white" />
            ) : (
              <RadioIcon size={28} className="text-white" />
            )}
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
            Select your access role to proceed to the system
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: "flex",
            padding: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            borderRadius: "12px",
            border: "1px solid var(--border-subtle)",
            marginBottom: "24px",
            gap: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleSelect("lecturer")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 700,
              backgroundColor: selectedRole === "lecturer" ? "var(--accent-primary)" : "transparent",
              color: selectedRole === "lecturer" ? "#FFFFFF" : "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              boxShadow: selectedRole === "lecturer" ? "0 2px 8px rgba(79, 70, 229, 0.3)" : "none",
            }}
          >
            <UserCheckIcon size={16} />
            <span>Lecturer</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect("admin")}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 700,
              backgroundColor: selectedRole === "admin" ? "var(--accent-cyan)" : "transparent",
              color: selectedRole === "admin" ? "#FFFFFF" : "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              boxShadow: selectedRole === "admin" ? "0 2px 8px rgba(8, 145, 178, 0.3)" : "none",
            }}
          >
            <ShieldAlertIcon size={16} />
            <span>Admin</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
              {selectedRole === "admin" ? "Administrator Email" : "Lecturer Email Address"}
            </label>
            <input
              type="email"
              className="input-control"
              placeholder={selectedRole === "admin" ? "admin@university.ac.lk" : "arthur.vance@university.ac.lk"}
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

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: "6px",
              justifyContent: "center",
              padding: "12px",
              backgroundColor: selectedRole === "admin" ? "var(--accent-cyan)" : "var(--accent-primary)",
              borderColor: selectedRole === "admin" ? "var(--accent-cyan)" : "var(--accent-primary)",
            }}
            disabled={loading}
          >
            {loading
              ? "Authenticating..."
              : selectedRole === "admin"
              ? "Sign In as Administrator"
              : "Sign In as Lecturer"}
          </button>
        </form>

        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "20px" }}>
          Smart Attendance Enterprise System • Secured by Supabase JWT & FastAPI RBAC
        </p>
      </div>
    </div>
  );
}


