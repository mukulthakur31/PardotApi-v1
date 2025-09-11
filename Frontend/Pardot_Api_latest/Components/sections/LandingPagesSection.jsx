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
        }}>Landing Page Analysis</h2>
      </div>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        marginBottom: "24px"
      }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))",
          border: "1px solid rgba(34, 197, 94, 0.3)",
          borderRadius: "12px",
          padding: "20px"
        }}>
          <h3 style={{ color: "#22c55e", margin: "0 0 12px 0" }}>Active Forms</h3>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#22c55e" }}>
            {landingPageStats.active_forms?.length || 0}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            Forms with recent activity
          </div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "12px",
          padding: "20px"
        }}>
          <h3 style={{ color: "#ef4444", margin: "0 0 12px 0" }}>Inactive Forms</h3>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ef4444" }}>
            {landingPageStats.inactive_forms?.length || 0}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            Forms without recent activity
          </div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: "12px",
          padding: "20px"
        }}>
          <h3 style={{ color: "#f59e0b", margin: "0 0 12px 0" }}>Field Issues</h3>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b" }}>
            {landingPageStats.field_mapping_issues?.length || 0}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            Pages with mapping problems
          </div>
        </div>
        
        <div style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.05))",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          borderRadius: "12px",
          padding: "20px"
        }}>
          <h3 style={{ color: "#6366f1", margin: "0 0 12px 0" }}>Total Pages</h3>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#6366f1" }}>
            {landingPageStats.total_landing_pages || 0}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            Landing pages analyzed
          </div>
        </div>
      </div>
      
      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        borderRadius: "12px",
        padding: "24px",
        maxHeight: "400px",
        overflowY: "auto",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <div style={{ display: "grid", gap: "12px" }}>
          {[...(landingPageStats.active_forms || []), ...(landingPageStats.inactive_forms || [])].map((form, index) => (
            <div key={index} style={{
              background: "rgba(30, 41, 59, 0.6)",
              padding: "16px",
              borderRadius: "8px",
              border: `1px solid ${index < (landingPageStats.active_forms?.length || 0) ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "600", color: "#f1f5f9" }}>{form.name}</div>
                  <div style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>ID: {form.id}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>URL: {form.url}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ 
                    color: index < (landingPageStats.active_forms?.length || 0) ? "#22c55e" : "#ef4444", 
                    fontWeight: "600",
                    marginBottom: "4px"
                  }}>
                    {index < (landingPageStats.active_forms?.length || 0) ? "Active" : "Inactive"}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                    Form ID: {form.form_id || 'None'}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {landingPageStats.field_mapping_issues?.length > 0 && (
            <div style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(245, 158, 11, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(245, 158, 11, 0.3)"
            }}>
              <h4 style={{ color: "#f59e0b", margin: "0 0 12px 0" }}>Field Mapping Issues</h4>
              {landingPageStats.field_mapping_issues.map((issue, index) => (
                <div key={index} style={{
                  padding: "8px 12px",
                  background: "rgba(15, 23, 42, 0.6)",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ color: "#f1f5f9", fontWeight: "500" }}>{issue.field_name}</div>
                    <div style={{ color: "#f59e0b", fontSize: "0.8rem" }}>{issue.issue}</div>
                  </div>
                  <div style={{
                    color: issue.severity === 'critical' ? "#ef4444" : issue.severity === 'high' ? "#f59e0b" : "#94a3b8",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    textTransform: "uppercase"
                  }}>
                    {issue.severity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}