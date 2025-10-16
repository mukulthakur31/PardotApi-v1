import React from "react";

const modernButtonStyle = {
  padding: "14px 28px",
  borderRadius: "12px",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: "none",
  transform: "translateY(0)",
  color: "#ffffff",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)"
};

export default function ActionTiles({ 
  activeTab,
  token,
  loading,
  googleAuth,
  stats,
  formStats,
  prospectHealth,
  utmAnalysis,
  campaignEngagement,
  getEmailStats,
  getFormStats,
  getActiveInactiveForms,
  getFormAbandonmentAnalysis,
  getLandingPageStats,
  getProspectHealth,
  getEngagementPrograms,
  getUTMAnalysis,
  getCampaignEngagementAnalysis,
  downloadPDF,
  authenticateGoogle,
  exportToSheets
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
      marginBottom: "48px",
      maxWidth: "800px",
      margin: "0 auto 48px auto"
    }}>
      {/* Data Actions */}
      <div style={{
        background: "rgba(30, 41, 59, 0.7)",
        borderRadius: "20px",
        padding: "40px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        textAlign: "center",
        minHeight: "280px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
      }}>
        <h4 style={{ marginBottom: "24px", fontSize: "1.3rem", fontWeight: "700", color: "#f1f5f9" }}>Data Actions</h4>
        {activeTab === "emails" ? (
          <>
            <button
              onClick={getEmailStats}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: loading ? "linear-gradient(135deg, #64748b, #475569)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                marginBottom: "16px",
                width: "100%",
                fontSize: "1.1rem",
                padding: "16px 28px",
                boxShadow: "0 6px 20px rgba(59, 130, 246, 0.3)"
              }}
            >
              {loading ? "⏳ Loading..." : "📊 Get Email Stats"}
            </button>
            <button
              onClick={downloadPDF}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #94a3b8, #64748b)",
                width: "100%"
              }}
            >
              📝 Download PDF
            </button>
          </>
        ) : activeTab === "forms" ? (
          <>
            <button
              onClick={getFormStats}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #64748b, #475569)",
                marginBottom: "12px",
                width: "100%",
                fontSize: "0.9rem"
              }}
            >
              📊 Basic Stats
            </button>
            <button
              onClick={getActiveInactiveForms}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #059669, #047857)",
                marginBottom: "8px",
                width: "100%",
                fontSize: "0.85rem",
                padding: "10px 20px"
              }}
            >
              🔄 Active/Inactive
            </button>
            <button
              onClick={getFormAbandonmentAnalysis}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                marginBottom: "8px",
                width: "100%",
                fontSize: "0.85rem",
                padding: "10px 20px"
              }}
            >
              ⚠️ Abandonment
            </button>
            <button
              onClick={downloadPDF}
              disabled={!token || loading || formStats.length === 0}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                width: "100%",
                fontSize: "0.85rem",
                padding: "10px 20px"
              }}
            >
              📝 Download PDF
            </button>
          </>
        ) : activeTab === "landing-pages" ? (
          <button
            onClick={getLandingPageStats}
            disabled={!token || loading}
            style={{
              ...modernButtonStyle,
              background: "linear-gradient(135deg, #64748b, #475569)",
              width: "100%"
            }}
          >
            🚀 Analyze Pages
          </button>
        ) : activeTab === "engagement" ? (
          <button
            onClick={getEngagementPrograms}
            disabled={!token || loading}
            style={{
              ...modernButtonStyle,
              background: "linear-gradient(135deg, #64748b, #475569)",
              width: "100%"
            }}
          >
            Get Engagement Programs
          </button>
        ) : activeTab === "utm" ? (
          <>
            <button
              onClick={getUTMAnalysis}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                marginBottom: "12px",
                width: "100%",
                fontSize: "0.9rem"
              }}
            >
              🎯 Analyze UTM Parameters
            </button>
            <button
              onClick={getCampaignEngagementAnalysis}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                width: "100%",
                fontSize: "0.9rem"
              }}
            >
              📈 Analyze Campaign Engagement
            </button>
          </>
        ) : activeTab === "prospects" ? (
          <>
            <button
              onClick={getProspectHealth}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #64748b, #475569)",
                marginBottom: "16px",
                width: "100%"
              }}
            >
              Analyze Database
            </button>
            <button
              onClick={downloadPDF}
              disabled={!token || loading || !prospectHealth}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #64748b, #475569)",
                width: "100%"
              }}
            >
              📝 Download PDF
            </button>
          </>
        ) : null}
      </div>

      {/* Google Integration */}
      <div style={{
        background: "rgba(30, 41, 59, 0.7)",
        borderRadius: "20px",
        padding: "40px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        textAlign: "center",
        minHeight: "280px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
      }}>
        <h4 style={{ marginBottom: "24px", fontSize: "1.3rem", fontWeight: "700", color: "#f1f5f9" }}>Google Workspace</h4>
        {!googleAuth ? (
          <button
            onClick={authenticateGoogle}
            disabled={loading}
            style={{
              ...modernButtonStyle,
              background: "linear-gradient(135deg, #64748b, #475569)",
              width: "100%"
            }}
          >
            Connect Google
          </button>
        ) : (
          <button
            onClick={exportToSheets}
            disabled={!token || loading}
            style={{
              ...modernButtonStyle,
              background: "linear-gradient(135deg, #059669, #047857)",
              width: "100%"
            }}
          >
            📊 Export to Sheets
          </button>
        )}
      </div>
    </div>
  );
}