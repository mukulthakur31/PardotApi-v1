import React from "react";

export default function LandingPagesSection({ landingPageStats }) {
  if (!landingPageStats) return null;

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
        marginBottom: "24px"
      }}>
        <h2 style={{
          fontSize: "1.75rem",
          fontWeight: "700",
          margin: 0,
          color: "#f1f5f9"
        }}>Landing Page Activity Analysis (3 Months)</h2>
      </div>
      
      {/* Criteria Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))",
        border: "1px solid rgba(59, 130, 246, 0.3)",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "24px",
        textAlign: "center"
      }}>
        <h3 style={{ color: "#3b82f6", margin: "0 0 8px 0", fontSize: "1.1rem" }}>📊 Activity Criteria</h3>
        <div style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "500" }}>
          {landingPageStats.criteria}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "32px"
      }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center"
        }}>
          <h3 style={{ color: "#22c55e", margin: "0 0 8px 0", fontSize: "1rem" }}>Active Pages</h3>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#22c55e" }}>
            {landingPageStats.active_pages.count}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            {landingPageStats.summary.active_percentage}% of total
          </div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center"
        }}>
          <h3 style={{ color: "#ef4444", margin: "0 0 8px 0", fontSize: "1rem" }}>Inactive Pages</h3>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ef4444" }}>
            {landingPageStats.inactive_pages.count}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            {landingPageStats.summary.inactive_percentage}% of total
          </div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.05))",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center"
        }}>
          <h3 style={{ color: "#6366f1", margin: "0 0 8px 0", fontSize: "1rem" }}>Total Activities</h3>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#6366f1" }}>
            {landingPageStats.summary.total_activities}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            Recent: {landingPageStats.summary.total_recent_activities}
          </div>
        </div>
      </div>

      {/* Active and Inactive Pages Lists */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "24px"
      }}>
        {/* Active Pages */}
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid rgba(34, 197, 94, 0.3)"
        }}>
          <h4 style={{ color: "#22c55e", margin: "0 0 16px 0" }}>✅ Active Pages</h4>
          <div style={{ color: "#94a3b8", marginBottom: "12px", fontSize: "0.9rem" }}>
            {landingPageStats.active_pages.description}
          </div>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {landingPageStats.active_pages.pages.map((page, index) => (
              <div key={index} style={{
                background: "rgba(34, 197, 94, 0.1)",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "8px",
                border: "1px solid rgba(34, 197, 94, 0.2)"
              }}>
                <div style={{ fontWeight: "600", color: "#f1f5f9", fontSize: "0.9rem" }}>{page.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
                  <span>Views: {page.views}</span>
                  <span>Clicks: {page.clicks}</span>
                  <span>Submissions: {page.submissions}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                  Recent Activities: {page.recent_activities}
                </div>
                {page.last_activity && (
                  <div style={{ fontSize: "0.75rem", color: "#22c55e", marginTop: "2px" }}>
                    Last: {new Date(page.last_activity).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Inactive Pages */}
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid rgba(239, 68, 68, 0.3)"
        }}>
          <h4 style={{ color: "#ef4444", margin: "0 0 16px 0" }}>⚠️ Inactive Pages</h4>
          <div style={{ color: "#94a3b8", marginBottom: "12px", fontSize: "0.9rem" }}>
            {landingPageStats.inactive_pages.description}
          </div>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {landingPageStats.inactive_pages.pages.map((page, index) => (
              <div key={index} style={{
                background: "rgba(239, 68, 68, 0.1)",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "8px",
                border: "1px solid rgba(239, 68, 68, 0.2)"
              }}>
                <div style={{ fontWeight: "600", color: "#f1f5f9", fontSize: "0.9rem" }}>{page.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
                  <span>Views: {page.views}</span>
                  <span>Clicks: {page.clicks}</span>
                  <span>Submissions: {page.submissions}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                  Total Activities: {page.total_activities}
                </div>
                {page.last_activity ? (
                  <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "2px" }}>
                    Last: {new Date(page.last_activity).toLocaleDateString()}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "2px" }}>
                    No activity recorded
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}