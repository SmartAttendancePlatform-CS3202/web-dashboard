"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { schedulingApi } from "@/lib/api/services";
import { CourseOffering } from "@/types";
import { ClockIcon, MapPinIcon, UsersIcon, PlayIcon, ChevronRightIcon } from "@/components/ui/Icons";

export default function CoursesPage() {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await schedulingApi.getAllOfferings();
        setOfferings(data);
      } catch (err) {
        console.error("Failed to load course offerings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <DashboardLayout
      title="Courses & Offerings"
      subtitle="Manage your assigned lecture offerings, student rosters, and verification rules."
    >
      {loading ? (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading course offerings...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        {offerings.map((offering) => (
          <div
            key={offering.id}
            className="glass-card glass-card-interactive"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "#818CF8",
                      backgroundColor: "rgba(99, 102, 241, 0.15)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                    }}
                  >
                    {offering.course_code}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                    {offering.academic_year_name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#34D399",
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  ACTIVE
                </span>
              </div>

              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                {offering.course_name}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                Offering Code: <code>{offering.offering_code}</code>
              </p>

              {/* Specs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ClockIcon size={14} className="text-indigo-400" />
                  <span>Every {offering.day} ({offering.start_time} - {offering.end_time})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPinIcon size={14} className="text-cyan-400" />
                  <span>{offering.venue_name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <UsersIcon size={14} />
                  <span>{offering.enrolled_count} / {offering.max_students} Students Enrolled</span>
                </div>
              </div>

              {/* Policy Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(255, 255, 255, 0.05)", color: "var(--text-muted)" }}>
                  ⏱️ Late Threshold: {offering.late_threshold_minutes} mins
                </span>
                {offering.random_check_enabled && (
                  <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "rgba(6, 182, 212, 0.1)", color: "#22D3EE" }}>
                    🤖 AI Random Face Check: Enabled
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
              <Link
                href={`/session/start?offering_id=${offering.id}`}
                className="btn-primary"
                style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem" }}
              >
                <PlayIcon size={14} />
                <span>Start Live Session</span>
              </Link>
              <Link
                href={`/courses/${offering.id}`}
                className="btn-secondary"
                style={{ padding: "8px 14px", fontSize: "0.8rem" }}
              >
                <span>View Roster</span>
                <ChevronRightIcon size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      )}
    </DashboardLayout>
  );
}
