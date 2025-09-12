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
  spreadsheetId,
  getEmailStats,
  getFormStats,
  getActiveInactiveForms,
  getFormAbandonmentAnalysis,
  getLandingPageStats,
  getProspectHealth,
  getEngagementPrograms,
  downloadPDF,
  authenticateGoogle,
  exportToSheets,
  exportToDrive
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
      gap: "24px",
      marginBottom: "48px",
      maxWidth: "1400px",
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
                background: "linear-gradient(135deg, #64748b, #475569)",
                marginBottom: "16px",
                width: "100%"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #475569, #334155)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #64748b, #475569)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Get Email Stats
            </button>
            <button
              onClick={downloadPDF}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #94a3b8, #64748b)",
                width: "100%"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #64748b, #475569)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #94a3b8, #64748b)";
                e.target.style.transform = "translateY(0)";
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
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #475569, #334155)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #64748b, #475569)";
                e.target.style.transform = "translateY(0)";
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
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #047857, #065f46)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #059669, #047857)";
                e.target.style.transform = "translateY(0)";
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
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #b91c1c, #991b1b)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #dc2626, #b91c1c)";
                e.target.style.transform = "translateY(0)";
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
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #4f46e5, #4338ca)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #6366f1, #4f46e5)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              📝 Download PDF
            </button>
          </>

        ) : activeTab === "landing-pages" ? (
          <>
            <button
              onClick={getLandingPageStats}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #64748b, #475569)",
                marginBottom: "16px",
                width: "100%"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #475569, #334155)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #64748b, #475569)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              🚀 Analyze Pages
            </button>
          </>
        ) : activeTab === "engagement" ? (
          <>
            <button
              onClick={getEngagementPrograms}
              disabled={!token || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #64748b, #475569)",
                width: "100%"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #475569, #334155)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #64748b, #475569)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Get Engagement Programs
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
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #475569, #334155)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #64748b, #475569)";
                e.target.style.transform = "translateY(0)";
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
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #475569, #334155)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #64748b, #475569)";
                e.target.style.transform = "translateY(0)";
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
        {activeTab === "prospects" ? (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#94a3b8", 
            fontSize: "1rem",
            fontStyle: "italic"
          }}>
            Use PDF download for prospects data
          </div>
        ) : activeTab === "landing-pages" ? (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#94a3b8", 
            fontSize: "1rem",
            fontStyle: "italic"
          }}>
            Landing page data analysis only
          </div>
        ) : activeTab === "engagement" ? (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#94a3b8", 
            fontSize: "1rem",
            fontStyle: "italic"
          }}>
            Engagement programs analysis only
          </div>
        ) : !googleAuth ? (
          <button
            onClick={authenticateGoogle}
            disabled={loading}
            style={{
              ...modernButtonStyle,
              background: "linear-gradient(135deg, #64748b, #475569)",
              width: "100%"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "linear-gradient(135deg, #475569, #334155)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "linear-gradient(135deg, #64748b, #475569)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Connect Google
          </button>
        ) : (
          <>
            <button
              onClick={exportToSheets}
              disabled={!token || loading || 
                (activeTab === "emails" && stats.length === 0) ||
                (activeTab === "forms" && formStats.length === 0)
              }
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #059669, #047857)",
                marginBottom: "16px",
                width: "100%"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #047857, #065f46)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #059669, #047857)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Export to Sheets
            </button>
            <button
              onClick={exportToDrive}
              disabled={!spreadsheetId || loading}
              style={{
                ...modernButtonStyle,
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                width: "100%"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "linear-gradient(135deg, #b91c1c, #991b1b)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "linear-gradient(135deg, #dc2626, #b91c1c)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Export to Drive
            </button>
          </>
        )}
      </div>
    </div>
  );
}