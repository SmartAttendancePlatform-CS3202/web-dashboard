"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { schedulingApi, attendanceApi } from "@/lib/api/services";
import { CourseOffering, Venue, VerificationMethod } from "@/types";
import { PlayIcon } from "@/components/ui/Icons";

export default function StartSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultOfferingId = searchParams.get("offering_id") || "";

  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(defaultOfferingId);
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [durationMins, setDurationMins] = useState<number>(90);
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>("gps_geofence");
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadFormSpecs() {
      try {
        const [offs, vens] = await Promise.all([
          schedulingApi.getAllOfferings(),
          schedulingApi.getVenues(),
        ]);
        setOfferings(offs);
        setVenues(vens);

        const initialOfferingId = defaultOfferingId || (offs.length > 0 ? offs[0].id : "");
        setSelectedOfferingId(initialOfferingId);

        const chosenOffering = offs.find((o) => o.id === initialOfferingId);
        if (chosenOffering && chosenOffering.venue_id) {
          setSelectedVenueId(chosenOffering.venue_id);
        } else if (vens.length > 0) {
          setSelectedVenueId(vens[0].id);
        }
      } catch (err) {
        console.error("Failed to load session launcher options:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFormSpecs();
  }, [defaultOfferingId]);

  // Update venue default when offering changes
  const handleOfferingChange = (offId: string) => {
    setSelectedOfferingId(offId);
    const chosen = offerings.find((o) => o.id === offId);
    if (chosen && chosen.venue_id) {
      setSelectedVenueId(chosen.venue_id);
    }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLaunching(true);

    try {
      const session = await attendanceApi.startSession({
        course_offering_id: selectedOfferingId,
        venue_id: selectedVenueId,
        verification_method_override: verificationMethod,
        scheduled_at: new Date().toISOString(),
        duration_mins: durationMins,
        notes: sessionNotes,
      });

      router.push(`/session/live?session_id=${session.id}`);
    } catch (err) {
      console.error("Failed to launch live session:", err);
      setIsLaunching(false);
    }
  };

  const currentOffering = offerings.find((o) => o.id === selectedOfferingId);
  const currentVenue = venues.find((v) => v.id === selectedVenueId);

  return (
    <DashboardLayout
      title="Launch Live Lecture Session"
      subtitle="Initialize geofenced attendance windows and AI face verification for today's lecture."
    >
      <div style={{ maxWidth: "780px", margin: "0 auto" }}>
        {loading ? (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading course schedule and classroom venues...
          </div>
        ) : (
          <div className="glass-card" style={{ padding: "32px" }}>
            <form onSubmit={handleLaunch} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Step 1: Course Selection */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                1. Select Course Offering <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                className="input-control"
                value={selectedOfferingId}
                onChange={(e) => handleOfferingChange(e.target.value)}
                required
              >
                {offerings.map((off) => (
                  <option key={off.id} value={off.id} style={{ backgroundColor: "#111827" }}>
                    {off.course_code} - {off.course_name} ({off.day} {off.start_time})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Venue Verification */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                2. Classroom Venue & Geofence Boundary <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                className="input-control"
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
                required
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id} style={{ backgroundColor: "#111827" }}>
                    {v.name} ({v.building} - Radius: {v.boundary_data.radius_meters || 30}m)
                  </option>
                ))}
              </select>

              {currentVenue && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "12px 14px",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>📍 GPS Radius: <strong>{currentVenue.boundary_data.radius_meters}m</strong></span>
                  <span>📶 Campus WiFi SSID: <strong>{currentVenue.wifi_ssid || "UOC_Campus"}</strong></span>
                  <span>👥 Capacity: <strong>{currentVenue.capacity || 100} seats</strong></span>
                </div>
              )}
            </div>

            {/* Step 3: Verification Method & Parameters */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  3. Verification Method
                </label>
                <select
                  className="input-control"
                  value={verificationMethod}
                  onChange={(e) => setVerificationMethod(e.target.value as VerificationMethod)}
                >
                  <option value="gps_geofence" style={{ backgroundColor: "#111827" }}>GPS Geofence + AI Vision</option>
                  <option value="wifi_ap" style={{ backgroundColor: "#111827" }}>WiFi AP Match + AI Vision</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  className="input-control"
                  min={15}
                  max={240}
                  step={15}
                  value={durationMins}
                  onChange={(e) => setDurationMins(parseInt(e.target.value) || 90)}
                  required
                />
              </div>
            </div>

            {/* Step 4: Lecture Topic / Notes */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
                Lecture Topic / Session Notes (Optional)
              </label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g., Consensus Protocols & Distributed State Machines"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
              />
            </div>

            {/* Verification Window Preview */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#818CF8", marginBottom: "8px" }}>
                ⚡ Verification Window Automation:
              </h4>
              <ul style={{ paddingLeft: "20px", fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
                <li><strong>First Check-in Window:</strong> Opens automatically upon launch for 15 minutes (GPS Geofence).</li>
                {currentOffering?.random_check_enabled && (
                  <li><strong>Random AI Face Check:</strong> Will automatically trigger during the second half of the class.</li>
                )}
                <li><strong>Security:</strong> All check-ins undergo background proxy anomaly detection.</li>
              </ul>
            </div>

            {/* Launch Action */}
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: "14px", fontSize: "1rem", marginTop: "8px" }}
              disabled={isLaunching}
            >
              <PlayIcon size={18} />
              <span>{isLaunching ? "Initializing Live Attendance Server..." : "Launch Live Session & Open Window"}</span>
            </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
