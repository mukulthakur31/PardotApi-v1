import React from "react";

export default function EmailSection({ stats, loading }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.6)",
      borderRadius: "16px",
      padding: "32px",
      border: "1px solid rgba(255, 255, 255, 0.05)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <h2 style={{
          fontSize: "1.75rem",
          fontWeight: "700",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "#f1f5f9"
        }}>
          Email Statistics
          <span style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#ffffff",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "600"
          }}>
            {stats.length} emails
          </span>
        </h2>
      </div>
      
      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        borderRadius: "12px",
        padding: "24px",
        overflowX: "auto",
        maxHeight: "500px",
        overflowY: "auto",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <pre style={{
          whiteSpace: "pre-wrap",
          margin: 0,
          fontSize: "0.9rem",
          lineHeight: "1.6",
          color: "#e2e8f0"
        }}>
          {JSON.stringify(stats, null, 2)}
        </pre>
      </div>
    </div>
  );
}