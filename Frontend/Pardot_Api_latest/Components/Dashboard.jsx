import React, { useState, useEffect } from "react";
import axios from "axios";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

// Add CSS animations
const styles = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-50px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.5); }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [formStats, setFormStats] = useState([]);
  const [token, setToken] = useState("");
  const [googleAuth, setGoogleAuth] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("emails");
  const [prospectHealth, setProspectHealth] = useState(null);
  const [inactiveProspects, setInactiveProspects] = useState(null);
  const [duplicateProspects, setDuplicateProspects] = useState(null);
  const [missingFieldsProspects, setMissingFieldsProspects] = useState(null);
  const [scoringIssuesProspects, setScoringIssuesProspects] = useState(null);
  const [activeProspectView, setActiveProspectView] = useState(null);

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleAuthSuccess = urlParams.get("google_auth");

    if (googleAuthSuccess === "success") {
      setGoogleAuth(true);
    }

    // Get token securely from session
    getTokenFromSession();
    checkGoogleAuthStatus();
  }, []);

  const getTokenFromSession = async () => {
    try {
      const response = await axios.get("http://localhost:4000/get-token");
      setToken(response.data.token);
    } catch (err) {
      console.error("Error getting token:", err);
      // Redirect to setup if no token found
      window.location.href = "/";
    }
  };

  const checkGoogleAuthStatus = async () => {
    try {
      const response = await axios.get("http://localhost:4000/google-auth-status");
      setGoogleAuth(response.data.authenticated);
    } catch (err) {
      console.error("Error checking Google auth status:", err);
    }
  };

  const getEmailStats = () => {
    const params = {};
    if (day) params.day = day;
    if (month) params.month = month;
    if (year) params.year = year;

    setLoading(true);
    axios
      .get("http://localhost:4000/get-email-stats", {
        headers: { Authorization: token },
        params,
      })
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getFormStats = () => {
    setLoading(true);
    axios
      .get("http://localhost:4000/get-form-stats", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setFormStats(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getProspectHealth = () => {
    setLoading(true);
    axios
      .get("http://localhost:4000/get-prospect-health", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setProspectHealth(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getInactiveProspects = () => {
    setLoading(true);
    axios
      .get("http://localhost:4000/get-inactive-prospects", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setInactiveProspects(res.data);
        setActiveProspectView('inactive');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getDuplicateProspects = () => {
    setLoading(true);
    axios
      .get("http://localhost:4000/get-duplicate-prospects", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setDuplicateProspects(res.data);
        setActiveProspectView('duplicates');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getMissingFieldsProspects = () => {
    setLoading(true);
    axios
      .get("http://localhost:4000/get-missing-fields-prospects", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setMissingFieldsProspects(res.data);
        setActiveProspectView('missing-fields');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getScoringIssuesProspects = () => {
    setLoading(true);
    axios
      .get("http://localhost:4000/get-scoring-issues-prospects", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setScoringIssuesProspects(res.data);
        setActiveProspectView('scoring-issues');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const downloadPDF = () => {
    let requestData = {};
    let filename = "report.pdf";
    
    if (activeTab === "emails") {
      requestData = {
        data_type: "emails",
        data: stats,
        filters: { day, month, year }
      };
      filename = "email_campaign_report.pdf";
    } else if (activeTab === "forms") {
      requestData = {
        data_type: "forms",
        data: formStats
      };
      filename = "form_stats_report.pdf";
    } else if (activeTab === "prospects") {
      requestData = {
        data_type: "prospects",
        data: prospectHealth
      };
      filename = "prospect_health_report.pdf";
    }
    
    axios
      .post("http://localhost:4000/download-pdf", requestData, {
        headers: { Authorization: token },
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => console.error(err));
  };

  const authenticateGoogle = async () => {
    try {
      const response = await axios.get("http://localhost:4000/google-auth", {
        headers: { Authorization: token }
      });
      window.location.href = response.data.auth_url;
    } catch (err) {
      console.error("Error initiating Google auth:", err);
    }
  };

  const exportToSheets = async () => {
    if (!googleAuth) {
      alert("Please authenticate with Google first");
      return;
    }

    if (activeTab === "emails" && stats.length === 0) {
      alert("Please get email stats first");
      return;
    }
    if (activeTab === "forms" && formStats.length === 0) {
      alert("Please get form stats first");
      return;
    }

    setLoading(true);
    try {
      let exportData = {};
      
      if (activeTab === "emails") {
        exportData = {
          title: `Email Stats ${year || new Date().getFullYear()}`,
          data_type: "emails",
          data: stats
        };
      } else if (activeTab === "forms") {
        exportData = {
          title: `Form Stats ${new Date().getFullYear()}`,
          data_type: "forms",
          data: formStats
        };
      }

      const response = await axios.post(
        "http://localhost:4000/export-to-sheets",
        exportData,
        {
          headers: { Authorization: token }
        }
      );

      setSpreadsheetId(response.data.spreadsheet_id);
      alert(`Spreadsheet created! View at: ${response.data.url}`);
      window.open(response.data.url, "_blank");
    } catch (err) {
      console.error("Error exporting to sheets:", err);
      alert("Error creating spreadsheet");
    } finally {
      setLoading(false);
    }
  };

  const exportToDrive = async () => {
    if (!spreadsheetId) {
      alert("Please create a spreadsheet first");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/export-to-drive",
        {
          spreadsheet_id: spreadsheetId,
          filename: `email_stats_${year || new Date().getFullYear()}`
        }
      );

      alert(`PDF exported to Drive! View at: ${response.data.url}`);
      window.open(response.data.url, "_blank");
    } catch (err) {
      console.error("Error exporting to drive:", err);
      alert("Error exporting to Drive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "20px"
    }}>
      {/* Header */}
      <div style={{
        textAlign: "center",
        marginBottom: "40px",
        color: "#fff"
      }}>
        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: "800",
          marginBottom: "12px",
          background: "linear-gradient(135deg, #3b82f6, #1e40af)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "fadeInUp 1s ease-out"
        }}>Analytics Hub</h1>
        <p style={{ 
          fontSize: "1.25rem", 
          color: "#cbd5e1",
          animation: "fadeInUp 1.2s ease-out"
        }}>Pardot Marketing Intelligence Platform</p>
        
        {/* Toggle Buttons */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginTop: "32px"
        }}>
          <button
            onClick={() => setActiveTab("emails")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: activeTab === "emails" 
                ? "linear-gradient(135deg, #3b82f6, #1e40af)" 
                : "rgba(51, 65, 85, 0.8)",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: activeTab === "emails" 
                ? "0 8px 25px rgba(59, 130, 246, 0.3)" 
                : "0 4px 15px rgba(0, 0, 0, 0.1)"
            }}
            onMouseOver={(e) => {
              if (activeTab !== "emails") {
                e.target.style.background = "rgba(71, 85, 105, 0.9)";
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "emails") {
                e.target.style.background = "rgba(51, 65, 85, 0.8)";
              }
            }}
          >
            Emails
          </button>
          <button
            onClick={() => setActiveTab("forms")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: activeTab === "forms" 
                ? "linear-gradient(135deg, #475569, #334155)" 
                : "rgba(51, 65, 85, 0.8)",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: activeTab === "forms" 
                ? "0 8px 25px rgba(71, 85, 105, 0.3)" 
                : "0 4px 15px rgba(0, 0, 0, 0.1)"
            }}
            onMouseOver={(e) => {
              if (activeTab !== "forms") {
                e.target.style.background = "rgba(71, 85, 105, 0.9)";
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "forms") {
                e.target.style.background = "rgba(51, 65, 85, 0.8)";
              }
            }}
          >
            Forms
          </button>
          <button
            onClick={() => setActiveTab("prospects")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: activeTab === "prospects" 
                ? "linear-gradient(135deg, #64748b, #475569)" 
                : "rgba(51, 65, 85, 0.8)",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: activeTab === "prospects" 
                ? "0 8px 25px rgba(100, 116, 139, 0.3)" 
                : "0 4px 15px rgba(0, 0, 0, 0.1)"
            }}
            onMouseOver={(e) => {
              if (activeTab !== "prospects") {
                e.target.style.background = "rgba(71, 85, 105, 0.9)";
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== "prospects") {
                e.target.style.background = "rgba(51, 65, 85, 0.8)";
              }
            }}
          >
            Prospects
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div style={{
        display: "flex",
        gap: "24px",
        justifyContent: "center",
        marginBottom: "48px",
        flexWrap: "wrap"
      }}>
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "#fff",
          minWidth: "220px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          animation: "slideInLeft 0.8s ease-out"
        }}>
          <div style={{ 
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: token ? "#22c55e" : "#ef4444",
            marginBottom: "16px"
          }}></div>
          <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "1.1rem" }}>Pardot Status</div>
          <div style={{ 
            color: token ? "#22c55e" : "#ef4444",
            fontWeight: "600",
            fontSize: "1rem"
          }}>
            {token ? "Connected" : "Disconnected"}
          </div>
        </div>
        
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "24px 32px",
          color: "#fff",
          minWidth: "220px",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          animation: "slideInRight 0.8s ease-out"
        }}>
          <div style={{ 
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: googleAuth ? "#22c55e" : "#ef4444",
            marginBottom: "16px"
          }}></div>
          <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "1.1rem" }}>Google Workspace</div>
          <div style={{ 
            color: googleAuth ? "#22c55e" : "#ef4444",
            fontWeight: "600",
            fontSize: "1rem"
          }}>
            {googleAuth ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "20px",
        padding: "48px",
        maxWidth: "1400px",
        margin: "0 auto",
        color: "#fff",
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
        animation: "fadeIn 1.2s ease-out"
      }}>
        {/* Date Filters - Only for emails */}
        {activeTab === "emails" && (
          <div style={{
            background: "rgba(30, 41, 59, 0.6)",
            borderRadius: "16px",
            padding: "32px",
            marginBottom: "32px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            animation: "slideUp 0.6s ease-out"
          }}>
            <h3 style={{
              textAlign: "center",
              marginBottom: "24px",
              fontSize: "1.4rem",
              fontWeight: "700",
              color: "#f1f5f9"
            }}>Date Filters</h3>
            
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap"
            }}>
              <div style={{ textAlign: "center" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "1rem", fontWeight: "600", color: "#cbd5e1" }}>Day</label>
                <input
                  type="number"
                  placeholder="DD"
                  min="1"
                  max="31"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "1rem", fontWeight: "600", color: "#cbd5e1" }}>Month</label>
                <input
                  type="number"
                  placeholder="MM"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "1rem", fontWeight: "600", color: "#cbd5e1" }}>Year</label>
                <input
                  type="number"
                  placeholder="YYYY"
                  min="2000"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Tiles */}
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
                    background: "linear-gradient(135deg, #3b82f6, #1e40af)",
                    marginBottom: "16px",
                    width: "100%"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #2563eb, #1d4ed8)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #3b82f6, #1e40af)";
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
            ) : activeTab === "forms" ? (
              <>
                <button
                  onClick={getFormStats}
                  disabled={!token || loading}
                  style={{
                    ...modernButtonStyle,
                    background: "linear-gradient(135deg, #475569, #334155)",
                    marginBottom: "16px",
                    width: "100%"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #334155, #1e293b)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #475569, #334155)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Get Form Stats
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={!token || loading || formStats.length === 0}
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
            ) : (
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
            )}
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
            ) : !googleAuth ? (
              <button
                onClick={authenticateGoogle}
                disabled={loading}
                style={{
                  ...modernButtonStyle,
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  width: "100%"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #2563eb, #1e40af)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #3b82f6, #1d4ed8)";
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
        
        {loading && (
          <div style={{
            textAlign: "center",
            padding: "32px",
            background: "rgba(30, 41, 59, 0.6)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            marginBottom: "32px"
          }}>
            <div style={{ 
              fontSize: "3rem", 
              marginBottom: "16px",
              animation: "spin 1s linear infinite"
            }}></div>
            <p style={{ 
              color: "#cbd5e1", 
              fontWeight: "600", 
              margin: 0,
              fontSize: "1.1rem",
              animation: "pulse 1.5s ease-in-out infinite"
            }}>Processing your request...</p>
          </div>
        )}

        {/* Stats Display */}
        {activeTab === "emails" && stats.length > 0 && (
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
        )}
        
        {activeTab === "forms" && formStats.length > 0 && (
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
                Form Statistics
                <span style={{
                  background: "linear-gradient(135deg, #475569, #334155)",
                  color: "#ffffff",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}>
                  {formStats.length} forms
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
                {JSON.stringify(formStats, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {activeTab === "prospects" && prospectHealth && (
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
                Prospect Health Analysis
                <span style={{
                  background: "linear-gradient(135deg, #64748b, #475569)",
                  color: "#ffffff",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}>
                  {prospectHealth.total_prospects} prospects
                </span>
              </h2>
            </div>
            
            {/* Health Summary Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginBottom: "32px"
            }}>
              <div style={{
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "16px",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onClick={getDuplicateProspects}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ color: "#ef4444", fontSize: "1.1rem", fontWeight: "600" }}>Duplicate Prospects</div>
                  <div style={{ 
                    backgroundColor: "#ef4444",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    fontWeight: "600"
                  }}>{prospectHealth.duplicates.count}</div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "12px" }}>Prospects with identical email addresses</div>
                <div style={{ 
                  color: "#ef4444", 
                  fontSize: "0.85rem", 
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span>View Details</span>
                  <span style={{ fontSize: "0.7rem" }}>→</span>
                </div>
              </div>
              
              <div style={{
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                borderRadius: "16px",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onClick={getInactiveProspects}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(245, 158, 11, 0.15)";
                e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.2)";
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ color: "#f59e0b", fontSize: "1.1rem", fontWeight: "600" }}>Inactive Prospects</div>
                  <div style={{ 
                    backgroundColor: "#f59e0b",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    fontWeight: "600"
                  }}>{prospectHealth.inactive_prospects.count}</div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "12px" }}>No activity in 90+ days</div>
                <div style={{ 
                  color: "#f59e0b", 
                  fontSize: "0.85rem", 
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span>View Details</span>
                  <span style={{ fontSize: "0.7rem" }}>→</span>
                </div>
              </div>
              
              <div style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                borderRadius: "16px",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onClick={getMissingFieldsProspects}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(139, 92, 246, 0.15)";
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.2)";
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ color: "#8b5cf6", fontSize: "1.1rem", fontWeight: "600" }}>Missing Fields</div>
                  <div style={{ 
                    backgroundColor: "#8b5cf6",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    fontWeight: "600"
                  }}>{prospectHealth.missing_fields.count}</div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "12px" }}>Incomplete prospect profiles</div>
                <div style={{ 
                  color: "#8b5cf6", 
                  fontSize: "0.85rem", 
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span>View Details</span>
                  <span style={{ fontSize: "0.7rem" }}>→</span>
                </div>
              </div>
              
              <div style={{
                background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(8, 145, 178, 0.05))",
                border: "1px solid rgba(6, 182, 212, 0.2)",
                borderRadius: "16px",
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
              onClick={getScoringIssuesProspects}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(6, 182, 212, 0.15)";
                e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.2)";
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ color: "#06b6d4", fontSize: "1.1rem", fontWeight: "600" }}>Scoring Issues</div>
                  <div style={{ 
                    backgroundColor: "#06b6d4",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    fontWeight: "600"
                  }}>{prospectHealth.scoring_issues.count}</div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "12px" }}>Inconsistent scoring patterns</div>
                <div style={{ 
                  color: "#06b6d4", 
                  fontSize: "0.85rem", 
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <span>View Details</span>
                  <span style={{ fontSize: "0.7rem" }}>→</span>
                </div>
              </div>
              
              <div style={{
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                borderRadius: "16px",
                padding: "24px"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ color: "#22c55e", fontSize: "1.1rem", fontWeight: "600" }}>Grading Coverage</div>
                  <div style={{ 
                    backgroundColor: "#22c55e",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    fontWeight: "600"
                  }}>{prospectHealth.grading_analysis.grading_coverage}%</div>
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Prospects with assigned grades</div>
              </div>
            </div>
            
            {/* Detailed Views */}
            {activeProspectView === 'inactive' && inactiveProspects && (
              <div style={{
                background: "rgba(15, 23, 42, 0.8)",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                marginBottom: "16px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <h3 style={{ color: "#f59e0b", margin: 0, fontSize: "1.2rem" }}>Inactive Prospects ({inactiveProspects.total_inactive})</h3>
                  <button
                    onClick={() => setActiveProspectView(null)}
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
                <div style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  display: "grid",
                  gap: "12px"
                }}>
                  {inactiveProspects.inactive_prospects.map((prospect, index) => (
                    <div key={index} style={{
                      background: "rgba(30, 41, 59, 0.6)",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(245, 158, 11, 0.3)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: "600", color: "#f1f5f9" }}>
                            {prospect.firstName} {prospect.lastName}
                          </div>
                          <div style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
                            📧 {prospect.email}
                          </div>
                          <div style={{ color: "#f59e0b", fontSize: "0.8rem", marginTop: "4px" }}>
                            ID: {prospect.id}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#ef4444", fontWeight: "600" }}>
                            {prospect.daysSinceActivity === "Never" ? "No Activity" : `${prospect.daysSinceActivity} days ago`}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                            {prospect.lastActivityAt ? new Date(prospect.lastActivityAt).toLocaleDateString() : "Never"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeProspectView === 'duplicates' && duplicateProspects && (
              <div style={{
                background: "rgba(15, 23, 42, 0.8)",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                marginBottom: "16px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <h3 style={{ color: "#ef4444", margin: 0, fontSize: "1.2rem" }}>Duplicate Prospects ({duplicateProspects.total_duplicate_groups} groups)</h3>
                  <button
                    onClick={() => setActiveProspectView(null)}
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
                <div style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  display: "grid",
                  gap: "16px"
                }}>
                  {duplicateProspects.duplicate_prospects.map((group, index) => (
                    <div key={index} style={{
                      background: "rgba(30, 41, 59, 0.6)",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(239, 68, 68, 0.3)"
                    }}>
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontWeight: "600", color: "#ef4444" }}>{group.email}</div>
                        <div style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>{group.count} duplicates found</div>
                      </div>
                      <div style={{ display: "grid", gap: "8px" }}>
                        {group.prospects.map((prospect, pIndex) => (
                          <div key={pIndex} style={{
                            background: "rgba(15, 23, 42, 0.8)",
                            padding: "12px",
                            borderRadius: "6px",
                            display: "flex",
                            justifyContent: "space-between"
                          }}>
                            <div>
                              <div style={{ color: "#f1f5f9", fontWeight: "500" }}>
                                {prospect.firstName} {prospect.lastName}
                              </div>
                              <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>ID: {prospect.id}</div>
                            </div>
                            <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>
                              Created: {prospect.createdAt ? new Date(prospect.createdAt).toLocaleDateString() : "Unknown"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeProspectView === 'missing-fields' && missingFieldsProspects && (
              <div style={{
                background: "rgba(15, 23, 42, 0.8)",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                marginBottom: "16px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <h3 style={{ color: "#8b5cf6", margin: 0, fontSize: "1.2rem" }}>Missing Fields ({missingFieldsProspects.total_with_missing_fields})</h3>
                  <button
                    onClick={() => setActiveProspectView(null)}
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
                <div style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  display: "grid",
                  gap: "12px"
                }}>
                  {missingFieldsProspects.prospects_missing_fields.map((prospect, index) => (
                    <div key={index} style={{
                      background: "rgba(30, 41, 59, 0.6)",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(139, 92, 246, 0.3)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: "600", color: "#f1f5f9" }}>
                            {prospect.firstName || "[No First Name]"} {prospect.lastName || "[No Last Name]"}
                          </div>
                          <div style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
                            📧 {prospect.email}
                          </div>
                          <div style={{ color: "#8b5cf6", fontSize: "0.8rem", marginTop: "4px" }}>
                            ID: {prospect.id}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#ef4444", fontWeight: "600", marginBottom: "4px" }}>
                            Missing Fields:
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "flex-end" }}>
                            {prospect.missingFields.map((field, fIndex) => (
                              <span key={fIndex} style={{
                                background: "rgba(239, 68, 68, 0.2)",
                                color: "#ef4444",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                border: "1px solid rgba(239, 68, 68, 0.3)"
                              }}>
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeProspectView === 'scoring-issues' && scoringIssuesProspects && (
              <div style={{
                background: "rgba(15, 23, 42, 0.8)",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                marginBottom: "16px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <h3 style={{ color: "#06b6d4", margin: 0, fontSize: "1.2rem" }}>Scoring Issues ({scoringIssuesProspects.total_scoring_issues})</h3>
                  <button
                    onClick={() => setActiveProspectView(null)}
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid #ef4444",
                      color: "#ef4444",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    ✕ Close
                  </button>
                </div>
                <div style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  display: "grid",
                  gap: "12px"
                }}>
                  {scoringIssuesProspects.prospects_with_scoring_issues.map((prospect, index) => (
                    <div key={index} style={{
                      background: "rgba(30, 41, 59, 0.6)",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(6, 182, 212, 0.3)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: "600", color: "#f1f5f9" }}>
                            {prospect.firstName} {prospect.lastName}
                          </div>
                          <div style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
                            📧 {prospect.email}
                          </div>
                          <div style={{ color: "#06b6d4", fontSize: "0.8rem", marginTop: "4px" }}>
                            ID: {prospect.id}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#f59e0b", fontWeight: "600" }}>
                            Score: {prospect.score}
                          </div>
                          <div style={{ color: "#ef4444", fontSize: "0.9rem", marginTop: "4px" }}>
                            {prospect.issue}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                            {prospect.lastActivityAt ? new Date(prospect.lastActivityAt).toLocaleDateString() : "No activity"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!activeProspectView && (
              <div style={{
                background: "rgba(15, 23, 42, 0.8)",
                borderRadius: "12px",
                padding: "24px",
                overflowX: "auto",
                maxHeight: "500px",
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}>
                <div style={{ textAlign: "center", color: "#cbd5e1", padding: "20px" }}>
                  <div style={{ 
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    border: "2px solid #3b82f6",
                    margin: "0 auto 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    color: "#3b82f6"
                  }}>↑</div>
                  <p>Click on any health metric above to view detailed information about those prospects.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  outline: "none",
  width: "120px",
  textAlign: "center",
  fontSize: "1rem",
  fontWeight: "500",
  background: "rgba(51, 65, 85, 0.8)",
  color: "#f1f5f9",
  transition: "all 0.3s ease"
};

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