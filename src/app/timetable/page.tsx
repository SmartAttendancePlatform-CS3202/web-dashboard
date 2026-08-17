"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { schedulingApi } from "@/lib/api/services";
import { CourseOffering } from "@/types";
import { CalendarIcon, ClockIcon, MapPinIcon, PlayIcon, UsersIcon } from "@/components/ui/Icons";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TimetablePage() {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTimetable() {
      try {
        const data = await schedulingApi.getLecturerTimetable();
        setOfferings(data);
      } catch (err) {
        console.error("Failed to load timetable:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, []);

  return (
    <DashboardLayout
      title="Teaching Timetable"
      subtitle="Your scheduled lecture periods and assigned classroom venues for this semester."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Timetable Weekly Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {DAYS.map((day) => {
            const dayOfferings = offerings.filter((o) => o.day?.toLowerCase() === day.toLowerCase());

            return (
              <div
                key={day}
                className="glass-card"
                style={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "450px",
                }}
              >
                <div
                  style={{
                    paddingBottom: "12px",
                    marginBottom: "14px",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {day}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: dayOfferings.length > 0 ? "#818CF8" : "var(--text-muted)",
                      backgroundColor: dayOfferings.length > 0 ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                    }}
                  >
                    {dayOfferings.length} {dayOfferings.length === 1 ? "Class" : "Classes"}
                  </span>
                </div>

                {dayOfferings.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                      border: "1px dashed var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "20px",
                    }}
                  >
                    No lectures scheduled
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {dayOfferings.map((offering) => (
                      <div
                        key={offering.id}
                        style={{
                          padding: "14px",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "rgba(99, 102, 241, 0.08)",
                          border: "1px solid rgba(99, 102, 241, 0.25)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#818CF8" }}>
                            {offering.course_code}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                            {offering.semester}
                          </span>
                        </div>

                        <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                          {offering.course_name}
                        </h4>

                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <ClockIcon size={12} className="text-indigo-400" />
                            <span>{offering.start_time} - {offering.end_time}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <MapPinIcon size={12} className="text-cyan-400" />
                            <span>{offering.venue_name}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <UsersIcon size={12} />
                            <span>{offering.enrolled_count} Enrolled</span>
                          </div>
                        </div>

                        <div style={{ marginTop: "6px", paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", display: "flex", gap: "6px" }}>
                          <Link
                            href={`/session/start?offering_id=${offering.id}`}
                            className="btn-primary"
                            style={{ flex: 1, padding: "6px 10px", fontSize: "0.75rem" }}
                          >
                            <PlayIcon size={12} /> Launch Live
                          </Link>
                          <Link
                            href={`/courses/${offering.id}`}
                            className="btn-secondary"
                            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
                          >
                            Roster
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
