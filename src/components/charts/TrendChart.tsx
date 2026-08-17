"use client";

import React, { useState } from "react";
import { TrendDataPoint } from "@/types";

interface TrendChartProps {
  data: TrendDataPoint[];
  height?: number;
}

export function TrendChart({ data, height = 260 }: TrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        No attendance trend data available yet.
      </div>
    );
  }

  const width = 650;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const minVal = 50; // Show scale 50% to 100%
  const maxVal = 100;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingX + chartWidth / 2;
    return paddingX + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    const normalized = (clamped - minVal) / (maxVal - minVal);
    return paddingY + chartHeight - normalized * chartHeight;
  };

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.attendance_percentage),
    data: d,
  }));

  const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;

  const thresholdY = getY(80);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[60, 70, 80, 90, 100].map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke={tick === 80 ? "rgba(245, 158, 11, 0.4)" : "rgba(255, 255, 255, 0.06)"}
                strokeDasharray={tick === 80 ? "4 4" : undefined}
                strokeWidth={tick === 80 ? 1.5 : 1}
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                fill={tick === 80 ? "#FBBF24" : "var(--text-muted)"}
                fontSize="10"
                textAnchor="end"
                fontFamily="var(--font-mono)"
                fontWeight={tick === 80 ? 600 : 400}
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* 80% Requirement Label */}
        <text
          x={width - paddingX}
          y={thresholdY - 6}
          fill="#FBBF24"
          fontSize="9"
          textAnchor="end"
          fontWeight="600"
          letterSpacing="0.04em"
        >
          80% MANDATORY THRESHOLD
        </text>

        {/* Area fill */}
        <path d={areaPath} fill="url(#trendGradient)" />

        {/* Line Stroke */}
        <path
          d={linePath}
          fill="none"
          stroke="#818CF8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Data Points */}
        {points.map((p, idx) => {
          const isBelow = p.data.attendance_percentage < 80;
          return (
            <g
              key={idx}
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => {
                const rect = (e.currentTarget.parentElement as any)?.getBoundingClientRect();
                setHoveredPoint(p.data);
                if (rect) {
                  setHoverCoords({
                    x: (p.x / width) * rect.width,
                    y: (p.y / height) * rect.height,
                  });
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={isBelow ? 6 : 5}
                fill={isBelow ? "#EF4444" : "#6366F1"}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Date label at bottom */}
              <text
                x={p.x}
                y={paddingY + chartHeight + 18}
                fill="var(--text-secondary)"
                fontSize="11"
                textAnchor="middle"
                fontWeight="500"
              >
                {p.data.date}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredPoint && hoverCoords && (
        <div
          style={{
            position: "absolute",
            left: `${hoverCoords.x}px`,
            top: `${hoverCoords.y - 65}px`,
            transform: "translateX(-50%)",
            backgroundColor: "#1E293B",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            padding: "8px 12px",
            borderRadius: "8px",
            pointerEvents: "none",
            zIndex: 100,
            whiteSpace: "nowrap",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "2px" }}>
            {hoveredPoint.date} (Session #{hoveredPoint.session_number || 1})
          </p>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: hoveredPoint.attendance_percentage < 80 ? "#F87171" : "#34D399" }}>
            {hoveredPoint.attendance_percentage.toFixed(1)}% Attendance
          </p>
          {hoveredPoint.present_count !== undefined && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {hoveredPoint.present_count} / {hoveredPoint.total_enrolled || 58} students present
            </p>
          )}
        </div>
      )}
    </div>
  );
}
