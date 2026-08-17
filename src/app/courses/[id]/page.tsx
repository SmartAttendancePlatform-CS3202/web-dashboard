"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { schedulingApi } from "@/lib/api/services";
import { CourseOffering, Student } from "@/types";
import {
  UsersIcon,
  SearchIcon,
  PlayIcon,
  MapPinIcon,
  ClockIcon,
} from "@/components/ui/Icons";

export default function CourseDetailPage() {
  const params = useParams();
  const offeringId = (params?.id as string) || "off-001";

  const [offering, setOffering] = useState<CourseOffering | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [off, studs] = await Promise.all([
          schedulingApi.getOfferingById(offeringId),
          schedulingApi.getOfferingStudents(offeringId),
        ]);
        setOffering(off);
        setStudents(studs);
      } catch (err) {
        console.error("Failed to load course details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [offeringId]);

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_index_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      title={offering ? `${offering.course_code}: ${offering.course_name}` : "Course Roster"}
      subtitle="Enrolled student directory and attendance compliance history."
    >
      {/* Course Summary Banner */}
      {offering && (
        <div
          className="glass-card"
          style={{
            padding: "24px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: "#818CF8",
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                {offering.course_code}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {offering.academic_year_name} • {offering.semester}
              </span>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {offering.course_name}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <ClockIcon size={14} className="text-indigo-400" /> Every {offering.day} ({offering.start_time} - {offering.end_time})
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPinIcon size={14} className="text-cyan-400" /> {offering.venue_name}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <UsersIcon size={14} /> {students.length} Enrolled
              </span>
            </div>
          </div>

          <Link href={`/session/start?offering_id=${offering.id}`} className="btn-primary">
            <PlayIcon size={16} />
            <span>Launch Live Session</span>
          </Link>
        </div>
      )}

      {/* Roster Table Card */}
      <div className="glass-card" style={{ padding: "24px" }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Enrolled Students ({filteredStudents.length})
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Registered candidates verified for AI vision biometric matching
            </p>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
              <SearchIcon size={16} />
            </div>
            <input
              type="text"
              className="input-control"
              placeholder="Search index or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Index No</th>
                <th>NIC / ID</th>
                <th>Contact</th>
                <th>Attendance Health</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    Loading student directory...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const rate = student.attendance_rate || 88;
                  const isAtRisk = rate < 80;

                  return (
                    <tr key={student.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: "#1E293B",
                              border: "1px solid var(--border-subtle)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: "#818CF8",
                              overflow: "hidden",
                            }}
                          >
                            {student.photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={student.photo_url} alt={student.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              student.full_name.charAt(0)
                            )}
                          </div>
                        <div>
                          <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{student.full_name}</p>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{student.department_name}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: "0.85rem", color: "#818CF8", fontWeight: 700 }}>
                        {student.student_index_no}
                      </code>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                      {student.nic || "N/A"}
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                      {student.contact_number || "N/A"}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: isAtRisk ? "#F87171" : "#34D399",
                            fontSize: "0.85rem",
                          }}
                        >
                          {rate}%
                        </span>
                        {isAtRisk ? (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              backgroundColor: "rgba(239, 68, 68, 0.15)",
                              color: "#F87171",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontWeight: 600,
                            }}
                          >
                            At Risk
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              backgroundColor: "rgba(16, 185, 129, 0.15)",
                              color: "#34D399",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontWeight: 600,
                            }}
                          >
                            Good
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <Link
                        href={`/attendance?student_id=${student.id}`}
                        className="btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                      >
                        View History
                      </Link>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
