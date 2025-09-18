import React, { useState, useEffect } from "react";
import axios from "axios";
import EmailSection from "./sections/EmailSection";
import FormsSection from "./sections/FormsSection";
import LandingPagesSection from "./sections/LandingPagesSection";
import ProspectsSection from "./sections/ProspectsSection";
import StatusCards from "./sections/StatusCards";
import DateFilters from "./sections/DateFilters";
import ActionTiles from "./sections/ActionTiles";

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
  const [activeInactiveForms, setActiveInactiveForms] = useState(null);
  const [formAbandonmentData, setFormAbandonmentData] = useState(null);
  const [landingPageStats, setLandingPageStats] = useState(null);


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
  const [activeFormView, setActiveFormView] = useState(null);
  const [activeLandingPageView, setActiveLandingPageView] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

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
      const response = await axios.get("http://localhost:4001/get-token");
      setToken(response.data.token);
    } catch (err) {
      console.error("Error getting token:", err);
      // Redirect to setup if no token found
      window.location.href = "/";
    }
  };

  const checkGoogleAuthStatus = async () => {
    try {
      const response = await axios.get("http://localhost:4001/google-auth-status");
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
      .get("http://localhost:4001/get-email-stats", {
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
      .get("http://localhost:4001/get-form-stats", {
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
      .get("http://localhost:4001/get-prospect-health", {
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
      .get("http://localhost:4001/get-inactive-prospects", {
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
      .get("http://localhost:4001/get-duplicate-prospects", {
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
      .get("http://localhost:4001/get-missing-fields-prospects", {
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
      .get("http://localhost:4001/get-scoring-issues-prospects", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setScoringIssuesProspects(res.data);
        setActiveProspectView('scoring-issues');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getActiveInactiveForms = () => {
    setLoading(true);
    axios
      .get("http://localhost:4001/get-active-inactive-forms", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setActiveInactiveForms(res.data);
        setActiveFormView('active-inactive');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getFormAbandonmentAnalysis = () => {
    setLoading(true);
    axios
      .get("http://localhost:4001/get-form-abandonment-analysis", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setFormAbandonmentData(res.data);
        setActiveFormView('abandonment');
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getLandingPageStats = () => {
    setLoading(true);
    axios
      .get("http://localhost:4001/get-landing-page-stats", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setLandingPageStats(res.data);
        setActiveLandingPageView('overview');
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
      .post("http://localhost:4001/download-pdf", requestData, {
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

  const downloadComprehensivePDF = () => {
    setPdfLoading(true);
    axios
      .post("http://localhost:4001/download-summary-pdf", {}, {
        headers: { Authorization: token },
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "pardot_comprehensive_report.pdf");
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => {
        console.error(err);
        alert("Error generating comprehensive report. Please try again.");
      })
      .finally(() => setPdfLoading(false));
  };

  const authenticateGoogle = async () => {
    try {
      const response = await axios.get("http://localhost:4001/google-auth", {
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
        "http://localhost:4001/export-to-sheets",
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
        "http://localhost:4001/export-to-drive",
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
        color: "#fff",
        position: "relative"
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
        
        {/* Comprehensive Report Button */}
        <button
          onClick={downloadComprehensivePDF}
          disabled={!token || pdfLoading}
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            padding: "12px 24px",
            borderRadius: "12px",
            border: "none",
            background: pdfLoading 
              ? "linear-gradient(135deg, #64748b, #475569)" 
              : "linear-gradient(135deg, #059669, #047857)",
            color: "#ffffff",
            cursor: pdfLoading ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "0.95rem",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)"
          }}
          onMouseOver={(e) => {
            if (!pdfLoading) {
              e.target.style.background = "linear-gradient(135deg, #047857, #065f46)";
              e.target.style.transform = "translateY(-2px)";
            }
          }}
          onMouseOut={(e) => {
            if (!pdfLoading) {
              e.target.style.background = "linear-gradient(135deg, #059669, #047857)";
              e.target.style.transform = "translateY(0)";
            }
          }}
        >
          {pdfLoading ? (
            <>
              <div style={{
                width: "16px",
                height: "16px",
                border: "2px solid #ffffff",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              Generating...
            </>
          ) : (
            <>
              📄 Full Report
            </>
          )}
        </button>
      </div>

      {/* Status Cards */}
      <StatusCards token={token} googleAuth={googleAuth} />

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "32px",
        background: "rgba(30, 41, 59, 0.6)",
        borderRadius: "16px",
        padding: "8px",
        maxWidth: "600px",
        margin: "0 auto 32px auto",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        {[
          { id: "emails", label: "📧 Emails" },
          { id: "forms", label: "📝 Forms" },
          { id: "prospects", label: "👥 Prospects" },
          { id: "landing-pages", label: "🚀 Landing Pages" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: activeTab === tab.id 
                ? "linear-gradient(135deg, #3b82f6, #1e40af)" 
                : "transparent",
              color: activeTab === tab.id ? "#ffffff" : "#cbd5e1",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.95rem",
              transition: "all 0.3s ease",
              margin: "0 4px"
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.background = "rgba(59, 130, 246, 0.1)";
                e.target.style.color = "#f1f5f9";
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.background = "transparent";
                e.target.style.color = "#cbd5e1";
              }
            }}
          >
            {tab.label}
          </button>
        ))}
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
          <DateFilters 
            day={day} 
            month={month} 
            year={year} 
            setDay={setDay} 
            setMonth={setMonth} 
            setYear={setYear} 
          />
        )}

        {/* Action Tiles */}
        <ActionTiles 
          activeTab={activeTab}
          token={token}
          loading={loading}
          googleAuth={googleAuth}
          stats={stats}
          formStats={formStats}
          prospectHealth={prospectHealth}
          spreadsheetId={spreadsheetId}
          getEmailStats={getEmailStats}
          getFormStats={getFormStats}
          getActiveInactiveForms={getActiveInactiveForms}
          getFormAbandonmentAnalysis={getFormAbandonmentAnalysis}
          getLandingPageStats={getLandingPageStats}
          getProspectHealth={getProspectHealth}
          downloadPDF={downloadPDF}
          authenticateGoogle={authenticateGoogle}
          exportToSheets={exportToSheets}
          exportToDrive={exportToDrive}
        />


        
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
        {activeTab === "emails" && <EmailSection stats={stats} loading={loading} />}
        
        {activeTab === "forms" && (
          <FormsSection 
            formStats={formStats}
            activeInactiveForms={activeInactiveForms}
            formAbandonmentData={formAbandonmentData}
            activeFormView={activeFormView}
            setActiveFormView={setActiveFormView}
          />
        )}



        {activeTab === "landing-pages" && <LandingPagesSection landingPageStats={landingPageStats} />}
        
        {activeTab === "prospects" && (
          <ProspectsSection 
            prospectHealth={prospectHealth}
            activeProspectView={activeProspectView}
            setActiveProspectView={setActiveProspectView}
            inactiveProspects={inactiveProspects}
            duplicateProspects={duplicateProspects}
            missingFieldsProspects={missingFieldsProspects}
            scoringIssuesProspects={scoringIssuesProspects}
            getDuplicateProspects={getDuplicateProspects}
            getInactiveProspects={getInactiveProspects}
            getMissingFieldsProspects={getMissingFieldsProspects}
            getScoringIssuesProspects={getScoringIssuesProspects}
          />
        )}
      </div>
    </div>
  );
}

