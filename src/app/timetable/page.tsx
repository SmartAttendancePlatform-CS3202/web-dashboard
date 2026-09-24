"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { attendanceApi, schedulingApi } from "@/lib/api/services";
import { CourseOffering } from "@/types";
import { ClockIcon, MapPinIcon, PlayIcon, UsersIcon } from "@/components/ui/Icons";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimetablePage() {
  const router = useRouter();
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openingOfferingId, setOpeningOfferingId] = useState<string | null>(null);
  
  // Set default active day to today's day
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; 
  const [activeDay, setActiveDay] = useState<string>(DAYS[todayIndex]);

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

  const handleOpenSession = async (offering: CourseOffering) => {
    setOpeningOfferingId(offering.id);
    try {
      const sessions = await attendanceApi.getActiveScheduledSessions(offering.id);
      const session = sessions[0];
      if (!session) {
        alert("This lecture is not in its attendance window yet. Attendance opens 15 minutes before the scheduled start time.");
        return;
      }
      router.push(`/session/live?session_id=${session.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Could not open the scheduled lecture session.");
    } finally {
      setOpeningOfferingId(null);
    }
  };

  const activeDayOfferings = offerings.filter((o) => o.day?.toLowerCase() === activeDay.toLowerCase());

  return (
    <DashboardLayout
      title="Teaching Timetable"
      subtitle="Your scheduled lecture periods and assigned classroom venues for this semester."
    >
      {loading ? (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading weekly teaching timetable...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Horizontal Tabs */}
          <div style={{ 
            display: "flex", 
            gap: "12px", 
            overflowX: "auto", 
            paddingBottom: "8px", 
            borderBottom: "1px solid var(--border-subtle)" 
          }}>
            {DAYS.map((day) => {
              const count = offerings.filter((o) => o.day?.toLowerCase() === day.toLowerCase()).length;
              const isActive = activeDay === day;
              // Dim the days that have no classes
              const opacity = count === 0 && !isActive ? 0.5 : 1;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "9999px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    opacity,
                    border: isActive ? "1px solid rgba(99, 102, 241, 0.5)" : "1px solid transparent",
                    backgroundColor: isActive ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#818CF8" : "var(--text-secondary)",
                    transition: "all 0.2s"
                  }}
                >
                  {day} 
                  {count > 0 && (
                    <span style={{ 
                      marginLeft: "8px", 
                      fontSize: "0.75rem", 
                      background: isActive ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.1)", 
                      padding: "2px 8px", 
                      borderRadius: "12px" 
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Day Content */}
          <div className="glass-card" style={{ padding: "24px", minHeight: "400px" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "20px" }}>
              {activeDay}&apos;s Schedule
            </h3>

            {activeDayOfferings.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  padding: "60px 20px",
                  border: "1px dashed var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                No lectures scheduled for {activeDay}.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                {activeDayOfferings.map((offering) => (
                  <div
                    key={offering.id}
                    style={{
                      padding: "20px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "rgba(99, 102, 241, 0.04)",
                      border: "1px solid rgba(99, 102, 241, 0.15)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#818CF8", backgroundColor: "rgba(99, 102, 241, 0.1)", padding: "2px 8px", borderRadius: "6px" }}>
                        {offering.course_code}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {offering.semester}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
                      {offering.course_name}
                    </h4>

                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px", margin: "8px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ClockIcon size={14} className="text-indigo-400" />
                        <span>{offering.start_time} - {offering.end_time}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MapPinIcon size={14} className="text-cyan-400" />
                        <span>{offering.venue_name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <UsersIcon size={14} />
                        <span>{offering.enrolled_count} Enrolled</span>
                      </div>
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenSession(offering)}
                        className="btn-primary"
                        style={{ flex: 1, padding: "8px", fontSize: "0.85rem" }}
                        disabled={openingOfferingId === offering.id}
                      >
                        <PlayIcon size={14} /> {openingOfferingId === offering.id ? "Opening..." : "Open Session"}
                      </button>
                      <Link
                        href={`/courses/${offering.id}`}
                        className="btn-secondary"
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      >
                        Roster
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
