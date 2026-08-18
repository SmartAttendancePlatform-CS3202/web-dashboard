"use client";

import React, { useEffect, useState } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { adminApi } from "@/lib/api/services";
import { Venue } from "@/types";
import {
  MapPinIcon,
  PlusIcon,
  CheckCircleIcon,
  RadioIcon,
} from "@/components/ui/Icons";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form Fields
  const [vName, setVName] = useState("");
  const [vBuilding, setVBuilding] = useState("");
  const [vFloor, setVFloor] = useState("Level 1");
  const [vCapacity, setVCapacity] = useState(120);
  const [vLat, setVLat] = useState(6.9022);
  const [vLng, setVLng] = useState(79.8608);
  const [vRadius, setVRadius] = useState(35);
  const [vMethod, setVMethod] = useState("gps_geofence");
  const [vWifiSsid, setVWifiSsid] = useState("UOC-SECURE-WIFI");
  const [vWifiBssid, setVWifiBssid] = useState("00:14:22:01:23:45");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const vens = await adminApi.getVenues();
        setVenues(vens);
        if (vens.length > 0) setSelectedVenue(vens[0]);
      } catch (err) {
        console.error("Error loading venues:", err);
      }
    }
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setVName("");
    setVBuilding("");
    setVFloor("Level 1");
    setVCapacity(120);
    setVLat(6.9022);
    setVLng(79.8608);
    setVRadius(35);
    setVMethod("gps_geofence");
    setVWifiSsid("UOC-SECURE-WIFI");
    setVWifiBssid("00:14:22:01:23:45");
    setShowModal(true);
  };

  const handleOpenEdit = (venue: Venue) => {
    setIsEditing(true);
    setEditId(venue.id);
    setVName(venue.name);
    setVBuilding(venue.building || "");
    setVFloor(venue.floor || "Level 1");
    setVCapacity(venue.capacity || 100);
    setVLat(venue.boundary_data?.latitude ?? 6.9022);
    setVLng(venue.boundary_data?.longitude ?? 79.8608);
    setVRadius(venue.boundary_data?.radius_meters ?? 30);
    setVMethod(venue.default_verification_method || "gps_geofence");
    setVWifiSsid(venue.wifi_ssid || "UOC-SECURE-WIFI");
    setVWifiBssid(venue.wifi_bssid || "00:14:22:01:23:45");
    setShowModal(true);
  };

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Venue> = {
        name: vName,
        building: vBuilding,
        floor: vFloor,
        capacity: vCapacity,
        shape_type: "circle",
        boundary_data: {
          latitude: Number(vLat),
          longitude: Number(vLng),
          radius_meters: Number(vRadius),
        },
        default_verification_method: vMethod as Venue["default_verification_method"],
        wifi_ssid: vWifiSsid,
        wifi_bssid: vWifiBssid,
      };

      if (isEditing && editId) {
        const updated = await adminApi.updateVenue(editId, payload);
        if (updated) {
          setVenues((prev) => prev.map((v) => (v.id === editId ? updated : v)));
          setSelectedVenue(updated);
          setToastMessage(`Geofence boundary for '${updated.name}' updated.`);
        }
      } else {
        const created = await adminApi.createVenue(payload);
        setVenues((prev) => [...prev, created]);
        setSelectedVenue(created);
        setToastMessage(`Venue '${created.name}' configured with ${created.boundary_data?.radius_meters ?? 0}m GPS geofence.`);
      }

      setShowModal(false);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Failed to save venue:", err);
    }
  };

  return (
    <AdminDashboardLayout
      title="Venues & Geofencing Command"
      subtitle="Configure physical classroom coordinates, GPS boundary radiuses, and multi-factor WiFi/BLE verification policies"
      actions={
        <button onClick={handleOpenCreate} className="btn-primary" style={{ padding: "8px 14px", fontSize: "0.85rem" }}>
          <PlusIcon size={14} />
          <span>Provision New Venue</span>
        </button>
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

      {/* Main Grid: Venue List & Visual Radar Simulator */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        {/* Venue Cards List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Configured Campus Locations ({venues.length})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {venues.map((venue) => {
              const isSelected = selectedVenue?.id === venue.id;

              return (
                <div
                  key={venue.id}
                  onClick={() => setSelectedVenue(venue)}
                  className="glass-card"
                  style={{
                    padding: "18px 20px",
                    cursor: "pointer",
                    border: isSelected ? "1px solid #22D3EE" : "1px solid var(--border-subtle)",
                    backgroundColor: isSelected ? "rgba(6, 182, 212, 0.08)" : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: isSelected ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.05)",
                        color: isSelected ? "#22D3EE" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MapPinIcon size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {venue.name}
                      </h4>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {venue.building} • {venue.floor} • Capacity: {venue.capacity}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          GPS: {(venue.boundary_data?.latitude ?? 0).toFixed(4)}, {(venue.boundary_data?.longitude ?? 0).toFixed(4)}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(6, 182, 212, 0.15)",
                            color: "#22D3EE",
                          }}
                        >
                          Radius: {venue.boundary_data?.radius_meters ?? 0}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(venue);
                    }}
                    className="btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  >
                    Configure
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Venue Geofence Radar Visualizer */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <RadioIcon size={18} className="text-cyan" />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                Geofence Verification Radar
              </h3>
            </div>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#34D399",
                padding: "2px 8px",
                borderRadius: "999px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              Anti-Spoofing Active
            </span>
          </div>

          {selectedVenue ? (
            <div>
              {/* Visual Simulated Satellite Radar */}
              <div
                style={{
                  height: "260px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(10, 15, 30, 0.95)",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  marginBottom: "20px",
                }}
              >
                {/* Background Grid Lines */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "linear-gradient(rgba(6, 182, 212, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.08) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Outer Radius Boundary Circle */}
                <div
                  style={{
                    width: "190px",
                    height: "190px",
                    borderRadius: "50%",
                    border: "2px dashed rgba(6, 182, 212, 0.6)",
                    backgroundColor: "rgba(6, 182, 212, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {/* Inner safe perimeter */}
                  <div
                    style={{
                      width: "110px",
                      height: "110px",
                      borderRadius: "50%",
                      border: "1px solid rgba(16, 185, 129, 0.5)",
                      backgroundColor: "rgba(16, 185, 129, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Venue Center Beacon */}
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: "#22D3EE",
                        boxShadow: "0 0 16px #22D3EE",
                      }}
                    />
                  </div>

                  <span
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      color: "#22D3EE",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {selectedVenue.boundary_data?.radius_meters ?? 0}m PERIMETER
                  </span>
                </div>
              </div>

              {/* Venue Boundary Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Target Coordinates:</span>
                  <span style={{ fontFamily: "monospace", color: "var(--text-primary)", fontWeight: 600 }}>
                    Lat: {(selectedVenue.boundary_data?.latitude ?? 0).toFixed(6)}, Lng: {(selectedVenue.boundary_data?.longitude ?? 0).toFixed(6)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Default Method:</span>
                  <span style={{ textTransform: "capitalize", color: "#22D3EE", fontWeight: 600 }}>
                    {selectedVenue.default_verification_method?.replace("_", " ")}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Campus WiFi BSSID:</span>
                  <span style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>
                    {selectedVenue.wifi_bssid || "00:14:22:01:23:45"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Max Hall Capacity:</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {selectedVenue.capacity} Seats
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Select a venue to inspect its GPS boundaries
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Venue Modal */}
      {showModal && (
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
          <div className="glass-card" style={{ width: "100%", maxWidth: "540px", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {isEditing ? "Configure Venue Geofence" : "Provision New Classroom Venue"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVenue} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Venue Name
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Auditorium Hall A"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Building
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Main Complex"
                    value={vBuilding}
                    onChange={(e) => setVBuilding(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Floor Level
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Level 2"
                    value={vFloor}
                    onChange={(e) => setVFloor(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    className="input-control"
                    value={vCapacity}
                    onChange={(e) => setVCapacity(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    className="input-control"
                    value={vLat}
                    onChange={(e) => setVLat(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    className="input-control"
                    value={vLng}
                    onChange={(e) => setVLng(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Radius (Meters)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    className="input-control"
                    value={vRadius}
                    onChange={(e) => setVRadius(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Verification Mode
                  </label>
                  <select
                    className="input-control"
                    value={vMethod}
                    onChange={(e) => setVMethod(e.target.value)}
                  >
                    <option value="gps_geofence">GPS Geofence</option>
                    <option value="ble_beacon">BLE Beacon Perimeter</option>
                    <option value="wifi_bssid">Campus WiFi BSSID</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                    Campus WiFi SSID
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    value={vWifiSsid}
                    onChange={(e) => setVWifiSsid(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  {isEditing ? "Update Geofence" : "Provision Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminDashboardLayout>
  );
}
