import React, { useState } from "react";

export default function EngagementSection({ 
  engagementAnalysis,
  getEngagementAnalysis
}) {
  const [activeView, setActiveView] = useState(null);

  if (!engagementAnalysis) {
    return (
      <div style={{
        background: "rgba(30, 41, 59, 0.6)",
        borderRadius: "16px",
        padding: "32px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        textAlign: "center"
      }}>
        <h2 style={{ color: "#f1f5f9", marginBottom: "24px" }}>Engagement Programs</h2>
        <p style={{ color: "#94a3b8", fontSize: "1rem", fontStyle: "italic" }}>
          Use the "Get Engagement Programs" button in the Data Actions section above
        </p>
      </div>
    );
  }

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
          color: "#f1f5f9"
        }}>
          Engagement Programs
        </h2>
        
        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap"
        }}>
          <button
            onClick={getEngagementAnalysis}
            style={{
              background: "linear-gradient(135deg, #059669, #047857)",
              border: "none",
              color: "#ffffff",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "500"
            }}
          >
            🎯 Refresh Programs
          </button>
        </div>
      </div>

      {/* Summary Card */}
      {engagementAnalysis && (
        <div style={{
          background: "linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(4, 120, 87, 0.05))",
          border: "1px solid rgba(5, 150, 105, 0.3)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "32px"
        }}>
          <h3 style={{ color: "#059669", margin: "0 0 12px 0" }}>Engagement Programs</h3>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#059669" }}>
            {engagementAnalysis.summary.total_programs}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "8px" }}>
            Active: {engagementAnalysis.summary.active_count} | 
            Inactive: {engagementAnalysis.summary.inactive_count}
          </div>
          <div style={{ color: "#f59e0b", fontSize: "0.8rem" }}>
            Programs with no entries: {engagementAnalysis.summary.no_entry_count}
          </div>
        </div>
      )}

      {/* Programs List */}
      {engagementAnalysis && engagementAnalysis.active_programs && (
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          <h3 style={{ color: "#059669", margin: "0 0 16px 0" }}>Engagement Programs</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            {[...engagementAnalysis.active_programs, ...engagementAnalysis.inactive_programs].map((program, index) => (
              <div key={index} style={{
                background: "rgba(30, 41, 59, 0.6)",
                padding: "16px",
                borderRadius: "8px",
                border: `1px solid ${program.status === 'Running' ? 'rgba(5, 150, 105, 0.3)' : program.status === 'Paused' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "600", color: "#f1f5f9" }}>{program.name}</div>
                    <div style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>ID: {program.id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ 
                      color: program.status === "Running" ? "#059669" : program.status === "Paused" ? "#f59e0b" : "#ef4444", 
                      fontWeight: "600",
                      marginBottom: "4px"
                    }}>
                      {program.status || "Unknown"}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      Created: {program.createdAt ? new Date(program.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}