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


  const daysWithOfferings = DAYS.filter((day) => 
    offerings.some((o) => o.day?.toLowerCase() === day.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Teaching Timetable"
      subtitle="Your scheduled lecture periods and assigned classroom venues for this semester."
    >
      {loading ? (
        <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading weekly teaching timetable...
        </div>
      ) : offerings.length === 0 ? (
        <div className="glass-card" style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          No lectures scheduled for this semester.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {daysWithOfferings.map((day) => {
            const dayOfferings = offerings.filter((o) => o.day?.toLowerCase() === day.toLowerCase());
            
            // Sort by start time if possible
            dayOfferings.sort((a, b) => {
              if (!a.start_time || !b.start_time) return 0;
              return a.start_time.localeCompare(b.start_time);
            });

            return (
              <div key={day} className="glass-card" style={{ padding: "24px" }}>
                <h3 style={{ 
                  fontSize: "1.3rem", 
                  fontWeight: 800, 
                  color: "var(--text-primary)", 
                  marginBottom: "20px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <div style={{ 
                    width: "8px", 
                    height: "24px", 
                    backgroundColor: "var(--accent-blue)", 
                    borderRadius: "4px" 
                  }} />
                  {day}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                  {dayOfferings.map((offering) => (
                    <div
                      key={offering.id}
                      style={{
                        padding: "20px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "var(--bg-surface-recess)",
                        border: "1px solid var(--bg-surface-recess)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        position: "relative",
                        transition: "transform 0.2s, box-shadow 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--accent-blue)", backgroundColor: "var(--bg-surface-recess)", padding: "4px 10px", borderRadius: "6px" }}>
                          {offering.course_code}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                          {offering.semester}
                        </span>
                      </div>

                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
                        {offering.course_name}
                      </h4>

                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px", margin: "8px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <ClockIcon size={16}  />
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{offering.start_time} - {offering.end_time}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <MapPinIcon size={16}  />
                          <span>{offering.venue_name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <UsersIcon size={16} />
                          <span>{offering.enrolled_count} Enrolled Students</span>
                        </div>
                      </div>

                      <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px dashed var(--border-subtle)", display: "flex", gap: "10px" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenSession(offering)}
                          className="btn-primary"
                          style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}
                          disabled={openingOfferingId === offering.id}
                        >
                          <PlayIcon size={14} /> {openingOfferingId === offering.id ? "Opening..." : "Open Session"}
                        </button>
                        <Link
                          href={`/courses/${offering.id}`}
                          className="btn-secondary"
                          style={{ padding: "10px 16px", fontSize: "0.85rem" }}
                        >
                          Roster
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}