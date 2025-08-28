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

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedToken = urlParams.get("token");
    const googleAuthSuccess = urlParams.get("google_auth");

    if (encodedToken) {
      try {
        const decodedToken = decodeURIComponent(encodedToken);
        setToken(decodedToken);
      } catch (err) {
        console.error("Error decoding token:", err);
      }
    }

    if (googleAuthSuccess === "success") {
      setGoogleAuth(true);
    }

    checkGoogleAuthStatus();
  }, []);

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

  const downloadPDF = () => {
    axios
      .get("http://localhost:4000/download-pdf", {
        headers: { Authorization: token },
        params: { day, month, year },
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "email_stats.pdf");
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

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/export-to-sheets",
        {
          day,
          month,
          year,
          title: `Email Stats ${year || new Date().getFullYear()}`
        },
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
        <div style={{
          fontSize: "4rem",
          marginBottom: "16px",
          animation: "float 3s ease-in-out infinite"
        }}>📊</div>
        <h1 style={{
          fontSize: "3.5rem",
          fontWeight: "800",
          marginBottom: "12px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "fadeInUp 1s ease-out"
        }}>Analytics Hub</h1>
        <p style={{ 
          fontSize: "1.25rem", 
          color: "#cbd5e1",
          animation: "fadeInUp 1.2s ease-out"
        }}>Pardot Marketing Intelligence</p>
        
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
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)" 
                : "rgba(51, 65, 85, 0.8)",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: activeTab === "emails" 
                ? "0 8px 25px rgba(99, 102, 241, 0.3)" 
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
            📧 Emails
          </button>
          <button
            onClick={() => setActiveTab("forms")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: activeTab === "forms" 
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)" 
                : "rgba(51, 65, 85, 0.8)",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              boxShadow: activeTab === "forms" 
                ? "0 8px 25px rgba(99, 102, 241, 0.3)" 
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
            📝 Forms
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
            fontSize: "2.5rem", 
            marginBottom: "16px"
          }}>🔐</div>
          <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "1.1rem" }}>Pardot Status</div>
          <div style={{ 
            color: token ? "#22c55e" : "#ef4444",
            fontWeight: "600",
            fontSize: "1rem"
          }}>
            {token ? "✅ Connected" : "❌ Disconnected"}
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
            fontSize: "2.5rem", 
            marginBottom: "16px"
          }}>📊</div>
          <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "1.1rem" }}>Google Workspace</div>
          <div style={{ 
            color: googleAuth ? "#22c55e" : "#ef4444",
            fontWeight: "600",
            fontSize: "1rem"
          }}>
            {googleAuth ? "✅ Connected" : "❌ Disconnected"}
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
            }}>📅 Filter by Date</h3>
            
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

        {/* Action Buttons */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          marginBottom: "40px"
        }}>
          {/* Data Actions */}
          <div style={{
            background: "rgba(30, 41, 59, 0.6)",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            textAlign: "center"
          }}>
            <h4 style={{ marginBottom: "24px", fontSize: "1.3rem", fontWeight: "700", color: "#f1f5f9" }}>📊 Data Actions</h4>
            {activeTab === "emails" ? (
              <>
                <button
                  onClick={getEmailStats}
                  disabled={!token || loading}
                  style={{
                    ...modernButtonStyle,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    marginBottom: "16px",
                    width: "100%"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #7c3aed, #a855f7)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #6366f1, #8b5cf6)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  📈 Get Email Stats
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={!token || loading}
                  style={{
                    ...modernButtonStyle,
                    background: "linear-gradient(135deg, #ec4899, #f43f5e)",
                    width: "100%"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #db2777, #e11d48)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #ec4899, #f43f5e)";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  📝 Download PDF
                </button>
              </>
            ) : (
              <button
                onClick={getFormStats}
                disabled={!token || loading}
                style={{
                  ...modernButtonStyle,
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  width: "100%"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #16a34a, #15803d)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                📋 Get Form Stats
              </button>
            )}
          </div>

          {/* Google Integration */}
          <div style={{
            background: "rgba(30, 41, 59, 0.6)",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            textAlign: "center"
          }}>
            <h4 style={{ marginBottom: "24px", fontSize: "1.3rem", fontWeight: "700", color: "#f1f5f9" }}>📊 Google Workspace</h4>
            {!googleAuth ? (
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
                🔗 Connect Google
              </button>
            ) : (
              <>
                <button
                  onClick={exportToSheets}
                  disabled={!token || loading}
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
                  📊 Export to Sheets
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
                  💾 Export to Drive
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
            }}>⏳</div>
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
                📊 Email Statistics
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
                📝 Form Statistics
                <span style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
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