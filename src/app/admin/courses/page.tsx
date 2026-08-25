"use client";

import React, { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { adminApi } from "@/lib/api/services";
import {
  Course,
  CourseOffering,
  Department,
  Venue,
  AcademicYear,
  UserWithProfile,
  Enrollment,
} from "@/types";
import {
  MapPinIcon,
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
  TrashIcon,
} from "@/components/ui/Icons";

export default function AdminCoursesPage() {
  const [activeTab, setActiveTab] = useState<"offerings" | "courses">("offerings");
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [rosterOffering, setRosterOffering] = useState<CourseOffering | null>(null);
  const [rosterEnrollments, setRosterEnrollments] = useState<Enrollment[]>([]);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState<string>("");

  // Course Form
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCredits, setCourseCredits] = useState(3);
  const [courseDeptId, setCourseDeptId] = useState("");
  const [courseDesc, setCourseDesc] = useState("");

  // Offering Form
  const [offCourseId, setOffCourseId] = useState("");
  const [offLecturerId, setOffLecturerId] = useState("");
  const [offVenueId, setOffVenueId] = useState("");
  const [offYearId, setOffYearId] = useState("");
  const [offDay, setOffDay] = useState("Monday");
  const [offStart, setOffStart] = useState("09:00");
  const [offEnd, setOffEnd] = useState("11:00");
  const [offLateMin, setOffLateMin] = useState(15);
  const [offRandomCheck, setOffRandomCheck] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [offs, crss, depts, vens, years, usrs] = await Promise.all([
          adminApi.getAllOfferings(),
          adminApi.getCourses(),
          adminApi.getDepartments(),
          adminApi.getVenues(),
          adminApi.getAcademicYears(),
          adminApi.getUsers(),
        ]);
        setOfferings(offs);
        setCourses(crss);
        setDepartments(depts);
        setVenues(vens);
        setAcademicYears(years);
        setUsers(usrs);

        if (depts.length > 0) setCourseDeptId(depts[0].id);
        if (crss.length > 0) setOffCourseId(crss[0].id);
        if (vens.length > 0) setOffVenueId(vens[0].id);
        if (years.length > 0) setOffYearId(years[0].id);
        const lecs = usrs.filter((u) => u.role === "lecturer");
        if (lecs.length > 0) setOffLecturerId(lecs[0].id);
      } catch (err) {
        console.error("Error loading curriculum data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await adminApi.createCourse({
        code: courseCode,
        name: courseName,
        credits: courseCredits,
        department_id: courseDeptId,
        description: courseDesc,
      });
      setCourses((prev) => [...prev, created]);
      setShowCourseModal(false);
      setCourseCode("");
      setCourseName("");
      setCourseDesc("");
      setToastMessage(`Master Course ${created.course_code || created.code} created successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to create course:", err);
    }
  };

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCourse = courses.find((c) => c.id === offCourseId);
      const selectedLec = users.find((u) => u.id === offLecturerId);
      const selectedVen = venues.find((v) => v.id === offVenueId);
      const selectedYr = academicYears.find((y) => y.id === offYearId);

      const created = await adminApi.createOffering({
        course_id: offCourseId,
        course_code: selectedCourse?.course_code || selectedCourse?.code,
        course_name: selectedCourse?.name,
        credits: selectedCourse?.credits,
        lecturer_id: offLecturerId,
        lecturer_name: selectedLec?.display_name,
        venue_id: offVenueId,
        venue_name: selectedVen?.name,
        academic_year_id: offYearId,
        academic_year_name: selectedYr?.name,
        day: offDay,
        start_time: offStart,
        end_time: offEnd,
        late_threshold_minutes: offLateMin,
        random_check_enabled: offRandomCheck,
      });

      if (!created) {
        throw new Error("Failed to create course offering");
      }

      setOfferings((prev) => [...prev, created]);
      setShowOfferingModal(false);
      setToastMessage(`Course offering scheduled for ${created.course_code}.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to schedule offering:", err);
    }
  };

  const handleOpenRoster = async (offering: CourseOffering) => {
    setRosterOffering(offering);
    const enrollments = await adminApi.getEnrollments(offering.id);
    setRosterEnrollments(enrollments);
    const students = users.filter((u) => u.role === "student");
    if (students.length > 0) setSelectedStudentToEnroll(students[0].id);
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterOffering || !selectedStudentToEnroll) return;

    try {
      const newEnr = await adminApi.enrollStudent(selectedStudentToEnroll, rosterOffering.id);
      setRosterEnrollments((prev) => [...prev, newEnr]);
      setOfferings((prev) =>
        prev.map((o) =>
          o.id === rosterOffering.id ? { ...o, enrolled_count: (o.enrolled_count || 0) + 1 } : o
        )
      );
    } catch (err) {
      console.error("Failed to enroll student:", err);
    }
  };

  const handleRemoveEnrollment = async (enrollmentId: string) => {
    if (!rosterOffering) return;
    try {
      await adminApi.removeEnrollment(rosterOffering.id, enrollmentId);
      setRosterEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
      setOfferings((prev) =>
        prev.map((o) =>
          o.id === rosterOffering.id
            ? { ...o, enrolled_count: Math.max(0, (o.enrolled_count || 1) - 1) }
            : o
        )
      );
    } catch (err) {
      console.error("Failed to remove enrollment:", err);
    }
  };

  const availableStudents = users.filter((u) => u.role === "student");
  const lecturers = users.filter((u) => u.role === "lecturer");

  return (
    <AdminDashboardLayout
      title="Curriculum & Course Offerings"
      subtitle="Manage university master course catalog, semester timetable offerings, and student enrollment rosters"
      actions={
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowCourseModal(true)}
            className="btn-secondary"
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
          >
            <PlusIcon size={14} />
            <span>New Master Course</span>
          </button>
          <button
            onClick={() => setShowOfferingModal(true)}
            className="btn-primary"
            style={{ padding: "8px 14px", fontSize: "0.85rem" }}
          >
            <PlusIcon size={14} />
            <span>Schedule Course Offering</span>
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("offerings")}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            fontWeight: 700,
            backgroundColor: activeTab === "offerings" ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.03)",
            border: activeTab === "offerings" ? "1px solid #22D3EE" : "1px solid var(--border-subtle)",
            color: activeTab === "offerings" ? "#22D3EE" : "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          Active Semester Offerings ({offerings.length})
        </button>
        <button
          onClick={() => setActiveTab("courses")}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            fontWeight: 700,
            backgroundColor: activeTab === "courses" ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.03)",
            border: activeTab === "courses" ? "1px solid #22D3EE" : "1px solid var(--border-subtle)",
            color: activeTab === "courses" ? "#22D3EE" : "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          Master Course Catalog ({courses.length})
        </button>
      </div>

      {activeTab === "offerings" ? (
        /* Course Offerings Table */
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Details</th>
                <th>Academic Term</th>
                <th>Assigned Faculty</th>
                <th>Venue & Slot</th>
                <th>Enrolled Roster</th>
                <th>Verification Config</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    Loading active offerings...
                  </td>
                </tr>
              ) : (
                offerings.map((off) => (
                  <tr key={off.id}>
                    <td>
                      <div>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#818CF8",
                            backgroundColor: "rgba(99, 102, 241, 0.12)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {off.course_code}
                        </span>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.88rem", marginTop: "4px" }}>
                          {off.course_name}
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {off.credits} Credits
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {off.academic_year_name || "2025/2026 Year 4"}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(99, 102, 241, 0.2)",
                            color: "#818CF8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {(off.lecturer_name || "Faculty").charAt(0)}
                        </div>
                        <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-primary)" }}>
                          {off.lecturer_name || "Unassigned"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--text-primary)" }}>
                          <MapPinIcon size={13} className="text-cyan" />
                          <span>{off.venue_name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          <ClockIcon size={12} />
                          <span>{off.day} {off.start_time} - {off.end_time}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#22D3EE" }}>
                          {off.enrolled_count || 0}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>students</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.72rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Late cutoff: {off.late_threshold_minutes}m</span>
                        <span style={{ color: off.random_check_enabled ? "#34D399" : "var(--text-muted)" }}>
                          {off.random_check_enabled ? "✓ Random 2-step active" : "Single check-in"}
                        </span>
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenRoster(off)}
                        className="btn-secondary"
                        style={{ padding: "5px 12px", fontSize: "0.75rem" }}
                      >
                        Manage Roster
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Master Courses Catalog Table */
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code & Course Title</th>
                <th>Credits</th>
                <th>Academic Department</th>
                <th>Course Description</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((crs) => (
                <tr key={crs.id}>
                  <td>
                    <div>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#22D3EE",
                        }}
                      >
                        {crs.course_code || crs.code}
                      </span>
                      <h4 style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>
                        {crs.name}
                      </h4>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {crs.credits} Credits
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {crs.department_name || "Computing Faculty"}
                    </span>
                  </td>
                  <td>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", maxWidth: "450px" }}>
                      {crs.description || "Core curricular university module."}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Master Course Modal */}
      {showCourseModal && (
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
                Add Master Course
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Course Code
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. CS4050"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Credits
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="input-control"
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Course Title
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Distributed Cloud Computing & Microservices"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Academic Department
                </label>
                <select
                  className="input-control"
                  value={courseDeptId}
                  onChange={(e) => setCourseDeptId(e.target.value)}
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Syllabus Overview
                </label>
                <textarea
                  className="input-control"
                  rows={3}
                  placeholder="Course learning outcomes and modular topics..."
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Save Master Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Course Offering Modal */}
      {showOfferingModal && (
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
          <div className="glass-card" style={{ width: "100%", maxWidth: "560px", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Schedule Timetable Offering
              </h3>
              <button
                onClick={() => setShowOfferingModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOffering} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Select Master Course
                </label>
                <select
                  className="input-control"
                  value={offCourseId}
                  onChange={(e) => setOffCourseId(e.target.value)}
                >
                  {courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>
                      {crs.course_code || crs.code} - {crs.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Lead Lecturer
                  </label>
                  <select
                    className="input-control"
                    value={offLecturerId}
                    onChange={(e) => setOffLecturerId(e.target.value)}
                  >
                    {lecturers.map((lec) => (
                      <option key={lec.id} value={lec.id}>
                        {lec.display_name || lec.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Academic Term
                  </label>
                  <select
                    className="input-control"
                    value={offYearId}
                    onChange={(e) => setOffYearId(e.target.value)}
                  >
                    {academicYears.map((yr) => (
                      <option key={yr.id} value={yr.id}>
                        {yr.year_code} ({yr.semester})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Venue & Geofence
                  </label>
                  <select
                    className="input-control"
                    value={offVenueId}
                    onChange={(e) => setOffVenueId(e.target.value)}
                  >
                    {venues.map((ven) => (
                      <option key={ven.id} value={ven.id}>
                        {ven.name} ({ven.building})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Day of Week
                  </label>
                  <select
                    className="input-control"
                    value={offDay}
                    onChange={(e) => setOffDay(e.target.value)}
                  >
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="input-control"
                    value={offStart}
                    onChange={(e) => setOffStart(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    className="input-control"
                    value={offEnd}
                    onChange={(e) => setOffEnd(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Late Cutoff (Mins)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    className="input-control"
                    value={offLateMin}
                    onChange={(e) => setOffLateMin(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="randomCheck"
                  checked={offRandomCheck}
                  onChange={(e) => setOffRandomCheck(e.target.checked)}
                />
                <label htmlFor="randomCheck" style={{ fontSize: "0.85rem", color: "var(--text-primary)", cursor: "pointer" }}>
                  Enable Automated AI 2-Step Mid-Session Random Verification
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowOfferingModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Provision Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Roster Modal */}
      {rosterOffering && (
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
          <div
            className="glass-card"
            style={{
              width: "100%",
              maxWidth: "680px",
              padding: "28px",
              borderRadius: "var(--radius-lg)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#22D3EE", fontWeight: 700 }}>
                  {rosterOffering.course_code}
                </span>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Enrolled Students ({rosterEnrollments.length})
                </h3>
              </div>
              <button
                onClick={() => setRosterOffering(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Enroll New Student Inline Bar */}
            <form
              onSubmit={handleEnrollStudent}
              style={{
                display: "flex",
                gap: "10px",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "16px",
              }}
            >
              <select
                className="input-control"
                style={{ flex: 1 }}
                value={selectedStudentToEnroll}
                onChange={(e) => setSelectedStudentToEnroll(e.target.value)}
              >
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.identifier} - {s.display_name} ({s.department_name})
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary" style={{ padding: "8px 16px", whiteSpace: "nowrap" }}>
                <PlusIcon size={14} />
                <span>Enroll Student</span>
              </button>
            </form>

            {/* Students List */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {rosterEnrollments.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                  No students currently enrolled in this offering.
                </div>
              ) : (
                rosterEnrollments.map((enr) => (
                  <div
                    key={enr.id}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(6, 182, 212, 0.15)",
                          color: "#22D3EE",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {(enr.student_name || enr.student_index || "Student").charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                          {enr.student_name || enr.student_index || "Enrolled Student"}
                        </h4>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {enr.student_index || "ID"} • {enr.department_name || "General"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveEnrollment(enr.id)}
                      title="Remove student from roster"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "6px",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#F87171")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
              <button
                onClick={() => setRosterOffering(null)}
                className="btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Close Roster Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
