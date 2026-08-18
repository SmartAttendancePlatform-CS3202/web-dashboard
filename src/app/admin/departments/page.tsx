"use client";

import React, { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { adminApi } from "@/lib/api/services";
import { Department, AcademicYear } from "@/types";
import {
  CalendarIcon,
  CheckCircleIcon,
  PlusIcon,
} from "@/components/ui/Icons";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  // Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptHead, setDeptHead] = useState("");
  const [deptDesc, setDeptDesc] = useState("");

  // Academic Year Modal State
  const [showYearModal, setShowYearModal] = useState(false);
  const [yearName, setYearName] = useState("");
  const [yearCode, setYearCode] = useState("");
  const [yearSemester, setYearSemester] = useState("Semester 1");
  const [yearIsActive, setYearIsActive] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [depts, years] = await Promise.all([
          adminApi.getDepartments(),
          adminApi.getAcademicYears(),
        ]);
        setDepartments(depts);
        setAcademicYears(years);
      } catch (err) {
        console.error("Error loading departments data:", err);
      }
    }
    loadData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await adminApi.createDepartment({
        name: deptName,
        code: deptCode,
        faculty_head: deptHead,
        description: deptDesc,
      });
      setDepartments((prev) => [...prev, created]);
      setShowDeptModal(false);
      setDeptName("");
      setDeptCode("");
      setDeptHead("");
      setDeptDesc("");
      setToastMessage(`Department '${created.name}' created successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to create department:", err);
    }
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await adminApi.createAcademicYear({
        name: yearName,
        year_code: yearCode,
        semester: yearSemester,
        is_active: yearIsActive,
      });
      setAcademicYears((prev) => [created, ...prev]);
      setShowYearModal(false);
      setYearName("");
      setYearCode("");
      setToastMessage(`Academic term '${created.year_code}' created successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to create academic term:", err);
    }
  };

  return (
    <AdminDashboardLayout
      title="Academic Structure & Semesters"
      subtitle="Configure university faculties, departments, active academic years, and semester schedules"
      actions={
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowYearModal(true)}
            className="btn-secondary"
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
          >
            <PlusIcon size={14} />
            <span>Add Term / Year</span>
          </button>
          <button
            onClick={() => setShowDeptModal(true)}
            className="btn-primary"
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
          >
            <PlusIcon size={14} />
            <span>New Department</span>
          </button>
        </div>
      }
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "#34D399",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          <CheckCircleIcon size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Academic Years & Terms Ribbon */}
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CalendarIcon size={18} className="text-cyan" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Academic Terms & Active Cohorts
            </h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Used for timetable offerings & semester rollups
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
          {academicYears.map((ay) => (
            <div
              key={ay.id}
              style={{
                padding: "14px 18px",
                borderRadius: "var(--radius-md)",
                backgroundColor: ay.is_active ? "rgba(6, 182, 212, 0.08)" : "rgba(255, 255, 255, 0.02)",
                border: ay.is_active ? "1px solid rgba(6, 182, 212, 0.35)" : "1px solid var(--border-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, color: "#22D3EE" }}>
                  {ay.year_code}
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: ay.is_active ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    color: ay.is_active ? "#34D399" : "var(--text-muted)",
                  }}
                >
                  {ay.is_active ? "Active Term" : "Archived"}
                </span>
              </div>
              <h4 style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {ay.name}
              </h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{ay.semester}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Departments Grid */}
      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
        University Departments & Academic Units ({departments.length})
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="glass-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(99, 102, 241, 0.15)",
                      border: "1px solid rgba(99, 102, 241, 0.3)",
                      color: "#818CF8",
                    }}
                  >
                    CODE: {dept.code}
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px" }}>
                    {dept.name}
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
                {dept.description || "Academic department delivering undergraduate and postgraduate modules."}
              </p>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-subtle)",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Head of Department / Dean:</span>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                  {dept.faculty_head || "Prof. Ananda Dharmaratne"}
                </p>
              </div>
            </div>

            {/* Department Metric Rollups */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                paddingTop: "14px",
                borderTop: "1px solid var(--border-subtle)",
                textAlign: "center",
              }}
            >
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Courses</p>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#22D3EE" }}>{dept.course_count || 12}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Lecturers</p>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#818CF8" }}>{dept.lecturer_count || 16}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Students</p>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#34D399" }}>{dept.student_count || 380}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Department Modal */}
      {showDeptModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div className="glass-card" style={{ width: "100%", maxWidth: "500px", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Register New Department
              </h3>
              <button
                onClick={() => setShowDeptModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDept} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Department Name
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Department of Mechanical Engineering"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Dept Code
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. MECH"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Head of Department
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Prof. / Dr. Full Name"
                    value={deptHead}
                    onChange={(e) => setDeptHead(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Description / Focus Area
                </label>
                <textarea
                  className="input-control"
                  rows={3}
                  placeholder="Summary of research areas and curriculum scope..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Academic Term Modal */}
      {showYearModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div className="glass-card" style={{ width: "100%", maxWidth: "500px", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Add Academic Term / Cohort
              </h3>
              <button
                onClick={() => setShowYearModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateYear} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Academic Term Title
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. 2026/2027 Academic Year - Year 1 (Semester 2)"
                  value={yearName}
                  onChange={(e) => setYearName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Year Code
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. 2026-Y1-S2"
                    value={yearCode}
                    onChange={(e) => setYearCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Semester
                  </label>
                  <select
                    className="input-control"
                    value={yearSemester}
                    onChange={(e) => setYearSemester(e.target.value)}
                  >
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Special Term">Special Term</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="termActive"
                  checked={yearIsActive}
                  onChange={(e) => setYearIsActive(e.target.checked)}
                />
                <label htmlFor="termActive" style={{ fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
                  Mark this academic term as Currently Active
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Add Academic Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
