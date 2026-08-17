"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { alertsApi } from "@/lib/api/services";
import { SystemAlert } from "@/types";
import {
  ShieldAlertIcon,
  AlertTriangleIcon,
  ClockIcon,
  ChevronRightIcon,
} from "@/components/ui/Icons";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await alertsApi.getAlerts();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to load alerts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const handleMarkRead = async (alertId: string) => {
    try {
      await alertsApi.markAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
      );
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const filteredAlerts = alerts.filter((a) => (filter === "unread" ? !a.is_read : true));

  return (
    <DashboardLayout
      title="Security & Anomaly Alerts"
      subtitle="Audit real-time proxy detection events, geofence boundary anomalies, and AI biometric mismatch flags."
    >
      <div className="glass-card" style={{ padding: "24px" }}>
        {/* Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "btn-primary" : "btn-secondary"}
              style={{ padding: "6px 14px", fontSize: "0.8rem" }}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={filter === "unread" ? "btn-primary" : "btn-secondary"}
              style={{ padding: "6px 14px", fontSize: "0.8rem" }}
            >
              Unresolved ({alerts.filter((a) => !a.is_read).length})
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Loading security alerts...
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              ✓ No security alerts found matching this filter.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isProxy = alert.type === "proxy_flagged";

              return (
                <div
                  key={alert.id}
                  style={{
                    padding: "18px 20px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: alert.is_read ? "rgba(255, 255, 255, 0.02)" : isProxy ? "rgba(236, 72, 153, 0.08)" : "rgba(245, 158, 11, 0.08)",
                    border: alert.is_read ? "1px solid var(--border-subtle)" : isProxy ? "1px solid rgba(236, 72, 153, 0.35)" : "1px solid rgba(245, 158, 11, 0.35)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1 }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: isProxy ? "rgba(236, 72, 153, 0.2)" : "rgba(245, 158, 11, 0.2)",
                        color: isProxy ? "#F472B6" : "#FBBF24",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isProxy ? <AlertTriangleIcon size={20} /> : <ShieldAlertIcon size={20} />}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {alert.title}
                        </h4>
                        {!alert.is_read && (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              backgroundColor: "#EF4444",
                              color: "#FFFFFF",
                              padding: "1px 6px",
                              borderRadius: "9999px",
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: "8px" }}>
                        {alert.message}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <ClockIcon size={12} /> {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {alert.details?.session_id && (
                      <Link
                        href={`/attendance?session_id=${alert.details.session_id}`}
                        className="btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                      >
                        Inspect Attempt <ChevronRightIcon size={12} />
                      </Link>
                    )}

                    {!alert.is_read && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleMarkRead(alert.id)}
                        style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
