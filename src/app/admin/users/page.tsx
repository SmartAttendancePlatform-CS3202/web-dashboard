"use client";

import React, { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { adminApi } from "@/lib/api/services";
import { UserWithProfile, UserRole, Department } from "@/types";
import {
  SearchIcon,
  ShieldAlertIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "@/components/ui/Icons";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("student");
  const [editStatus, setEditStatus] = useState<string>("active");
  const [editDeptId, setEditDeptId] = useState<string>("");
  const [editDisplayName, setEditDisplayName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const handleApproval = async (id: string, approve: boolean) => {
    try {
      if (approve) await adminApi.approveUser(id); else await adminApi.rejectUser(id);
      const fresh = await adminApi.getUsers(selectedRole, selectedStatus);
      setUsers(fresh);
      setToastMessage(approve ? "User approved." : "User rejected.");
    } catch (e) { setToastMessage(e instanceof Error ? e.message : "Approval action failed"); }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [usersData, deptsData] = await Promise.all([
          adminApi.getUsers(selectedRole, selectedStatus),
          adminApi.getDepartments(),
        ]);
        setUsers(usersData);
        setDepartments(deptsData);
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedRole, selectedStatus]);

  const handleEditClick = (u: UserWithProfile) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditStatus(u.status || "active");
    setEditDeptId(u.department_id || departments[0]?.id || "");
    setEditDisplayName(u.display_name || "");
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    try {
      const updated = await adminApi.updateUserRole(editingUser.id, {
        role: editRole,
        status: editStatus,
        display_name: editDisplayName,
        department_id: editDeptId,
      });

      if (updated) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
        setToastMessage(`Successfully updated permissions for ${updated.email}`);
        setTimeout(() => setToastMessage(null), 4000);
      }
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered in-memory for search input
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      u.email.toLowerCase().includes(q) ||
      (u.display_name && u.display_name.toLowerCase().includes(q)) ||
      (u.identifier && u.identifier.toLowerCase().includes(q)) ||
      (u.department_name && u.department_name.toLowerCase().includes(q));
    return matchesQuery;
  });

  return (
    <AdminDashboardLayout
      title="User Directory & RBAC Management"
      subtitle="Institutional identity governance, role provisioning, and biometric registration status"
    >
      {/* Toast alert */}
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

      {/* Control Bar: Search & Filter Tabs */}
      <div
        className="glass-card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: "300px", flex: 1 }}>
          <SearchIcon
            size={16}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            className="input-control"
            style={{ paddingLeft: "40px" }}
            placeholder="Search by name, student index, email or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {["all", "student", "lecturer", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.78rem",
                fontWeight: 600,
                textTransform: "capitalize",
                backgroundColor: selectedRole === r ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.03)",
                border: selectedRole === r ? "1px solid #22D3EE" : "1px solid var(--border-subtle)",
                color: selectedRole === r ? "#22D3EE" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
            >
              {r === "all" ? "All Roles" : r}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Status:</span>
          <select
            className="input-control"
            style={{ padding: "6px 12px", width: "auto", fontSize: "0.78rem" }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User & Identity</th>
              <th>Identifier / Index</th>
              <th>Assigned Department</th>
              <th>RBAC Role</th>
              <th>Biometric Face Status</th>
              <th>Account Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  Loading university user directory...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  No users found matching the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isStudent = u.role === "student";
                const isLecturer = u.role === "lecturer";
                const isAdmin = u.role === "admin";

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: isAdmin
                              ? "linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)"
                              : isLecturer
                              ? "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
                              : "linear-gradient(135deg, #3B82F6 0%, #10B981 100%)",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {(u.display_name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.88rem" }}>
                            {u.display_name || "Unassigned"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {u.identifier || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        {u.department_name || "Academic Affairs"}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "capitalize",
                          padding: "2px 8px",
                          borderRadius: "999px",
                          backgroundColor: isAdmin
                            ? "rgba(6, 182, 212, 0.15)"
                            : isLecturer
                            ? "rgba(99, 102, 241, 0.15)"
                            : "rgba(16, 185, 129, 0.15)",
                          color: isAdmin ? "#22D3EE" : isLecturer ? "#818CF8" : "#34D399",
                          border: `1px solid ${
                            isAdmin
                              ? "rgba(6, 182, 212, 0.3)"
                              : isLecturer
                              ? "rgba(99, 102, 241, 0.3)"
                              : "rgba(16, 185, 129, 0.3)"
                          }`,
                        }}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td>
                      {isStudent || isLecturer ? (
                        u.has_face_enrolled !== false ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#34D399", fontSize: "0.78rem" }}>
                            <CheckCircleIcon size={14} />
                            <span>128-d Vector Enrolled</span>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F87171", fontSize: "0.78rem" }}>
                            <AlertCircleIcon size={14} />
                            <span>Pending Face Biometrics</span>
                          </div>
                        )
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>N/A (Console Admin)</span>
                      )}
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor:
                            u.status === "active"
                              ? "rgba(16, 185, 129, 0.1)"
                              : u.status === "suspended"
                              ? "rgba(239, 68, 68, 0.1)"
                              : "rgba(245, 158, 11, 0.1)",
                          color:
                            u.status === "active"
                              ? "#34D399"
                              : u.status === "suspended"
                              ? "#F87171"
                              : "#FBBF24",
                        }}
                      >
                        {u.status || "active"}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleEditClick(u)}
                        className="btn-secondary"
                        style={{ padding: "5px 10px", fontSize: "0.75rem" }}
                      >
                        Edit Permissions
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
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
              maxWidth: "500px",
              padding: "28px",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldAlertIcon size={20} className="text-cyan" />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Edit User RBAC & Privileges
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Account Email
                </label>
                <input type="text" className="input-control" value={editingUser.email} disabled />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Display Name
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    RBAC Role
                  </label>
                  <select
                    className="input-control"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                  >
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer (Faculty)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Account Status
                  </label>
                  <select
                    className="input-control"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Academic Department
                </label>
                <select
                  className="input-control"
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  disabled={isSaving}
                >
                  {isSaving ? "Updating RBAC..." : "Save Privileges"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
