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
  const [searchTerm, setSearchTerm] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");

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

  const filteredOfferings = offerings.filter(o => {
    const matchSearch = (o.course_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                        (o.course_code?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchSem = semesterFilter === "all" || o.semester === semesterFilter;
    const matchDay = dayFilter === "all" || o.day === dayFilter;
    return matchSearch && matchSem && matchDay;
  });

  const semesters = Array.from(new Set(offerings.map(o => o.semester).filter(Boolean)));
  const days = Array.from(new Set(offerings.map(o => o.day).filter(Boolean)));

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
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Search and Filters Bar */}
          <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", gap: "16px", padding: "16px", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
              <input 
                type="text" 
                placeholder="Search by course code or name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="all" style={{ color: "black" }}>All Semesters</option>
                {semesters.map(sem => <option key={sem} value={sem} style={{ color: "black" }}>{sem}</option>)}
              </select>
              
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="all" style={{ color: "black" }}>All Days</option>
                {days.map(day => <option key={day} value={day} style={{ color: "black" }}>{day}</option>)}
              </select>
            </div>
          </div>

          {filteredOfferings.length === 0 ? (
            <div className="glass-card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
              No courses found matching &quot;{searchTerm}&quot;.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
              {filteredOfferings.map((offering) => (
                <div
                  key={offering.id}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    border: "1px solid var(--bg-surface)",
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
                            color: "var(--accent-blue)",
                            backgroundColor: "var(--bg-surface-recess)",
                            padding: "4px 10px",
                            borderRadius: "6px",
                          }}
                        >
                          {offering.course_code}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "10px" }}>
                          {offering.academic_year_name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "#34D399",
                          backgroundColor: "rgba(16, 185, 129, 0.12)",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                        }}
                      >
                        ACTIVE
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px", lineHeight: 1.3 }}>
                      {offering.course_name}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
                      Offering: <code style={{ color: "var(--accent-blue)", background: "var(--bg-surface-recess)", padding: "2px 6px", borderRadius: "4px" }}>{offering.offering_code}</code>
                    </p>

                    {/* Specs */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <ClockIcon size={16}  />
                        <span>Every {offering.day} ({offering.start_time} - {offering.end_time})</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <MapPinIcon size={16}  />
                        <span>{offering.venue_name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <UsersIcon size={16} />
                        <span>{offering.enrolled_count} / {offering.max_students} Students Enrolled</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid var(--bg-surface)", paddingTop: "20px" }}>
                    <Link
                      href="/session/live"
                      className="btn-primary"
                      style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}
                    >
                      <PlayIcon size={14} />
                      <span>Open Session</span>
                    </Link>
                    <Link
                      href={`/courses/${offering.id}`}
                      className="btn-secondary"
                      style={{ padding: "10px 16px", fontSize: "0.85rem" }}
                    >
                      <span>View Roster</span>
                      <ChevronRightIcon size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
