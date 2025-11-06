import React, { useState, useEffect } from "react";
import axios from "axios";
import EmailStatsDisplay from "./sections/EmailStatsDisplay";
import FormsSection from "./sections/FormsSection";
import LandingPagesSection from "./sections/LandingPagesSection";
import ProspectsSection from "./sections/ProspectsSection";
import EngagementSection from "./sections/EngagementSection";
import UTMSection from "./sections/UTMSection";
import StatusCards from "./sections/StatusCards";
import CustomDateFilter from "./sections/CustomDateFilter";
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
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: background 0.3s ease;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
/* Prevent content jumping during loading */
.content-container {
  min-height: 400px;
  position: relative;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [formStats, setFormStats] = useState([]);
  const [activeInactiveForms, setActiveInactiveForms] = useState(null);
  const [formAbandonmentData, setFormAbandonmentData] = useState(null);
  const [landingPageStats, setLandingPageStats] = useState(null);


  const [token, setToken] = useState("");
  const [pardotConnected, setPardotConnected] = useState(false);
  const [googleAuth, setGoogleAuth] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("emails");
  const [prospectHealth, setProspectHealth] = useState(null);
  const [inactiveProspects, setInactiveProspects] = useState(null);
  const [duplicateProspects, setDuplicateProspects] = useState(null);
  const [missingFieldsProspects, setMissingFieldsProspects] = useState(null);

  const [activeProspectView, setActiveProspectView] = useState(null);
  const [activeFormView, setActiveFormView] = useState(null);
  const [activeLandingPageView, setActiveLandingPageView] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Engagement states
  const [engagementAnalysis, setEngagementAnalysis] = useState(null);
  
  // UTM states
  const [utmAnalysis, setUtmAnalysis] = useState(null);
  
  // Campaign engagement states
  const [campaignEngagement, setCampaignEngagement] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Clear stats when filter changes
  useEffect(() => {
    setStats(null);
  }, [filterType, startDate, endDate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleAuthSuccess = urlParams.get("google_auth");

    if (googleAuthSuccess === "success") {
      setGoogleAuth(true);
    }

    // Get token and validate it
    getTokenFromSession();
    checkGoogleAuthStatus();

    // Listen for custom events from UTM section buttons
    const handleAnalyzeUTM = () => {
      if (token) {
        getUTMAnalysis();
      }
    };

    const handleAnalyzeCampaigns = () => {
      if (token) {
        getCampaignEngagementAnalysis();
      }
    };

    window.addEventListener('analyzeUTM', handleAnalyzeUTM);
    window.addEventListener('analyzeCampaigns', handleAnalyzeCampaigns);

    return () => {
      window.removeEventListener('analyzeUTM', handleAnalyzeUTM);
      window.removeEventListener('analyzeCampaigns', handleAnalyzeCampaigns);
    };
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await axios.get("http://localhost:4001/validate-token", {
        headers: { Authorization: token }
      });

      if (response.data.valid) {
        setPardotConnected(true);
      } else {
        setPardotConnected(false);
        setToken("");
        window.location.href = "/";
      }
    } catch (error) {
      setPardotConnected(false);
      setToken("");
      if (error.response?.status === 401) {
        window.location.href = "/";
      }
    }
  };

  // Validate token when it changes
  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);



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
    if (filterType) params.filter_type = filterType;
    if (startDate) params.start_date = startDate + "T00:00:00Z";
    if (endDate) params.end_date = endDate + "T23:59:59Z";

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

  // Engagement functions
  const getEngagementAnalysis = () => {
    setLoading(true);
    axios
      .get("http://localhost:4001/get-engagement-programs-analysis", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setEngagementAnalysis(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getUTMAnalysis = () => {
    setLoading(true);
    axios
      .get("http://localhost:4001/get-utm-analysis", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setUtmAnalysis(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const getCampaignEngagementAnalysis = () => {
    setLoading(true);
    axios
      .get("http://localhost:4001/get-campaign-engagement-analysis", {
        headers: { Authorization: token }
      })
      .then((res) => {
        setCampaignEngagement(res.data);
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
        filters: { filterType, startDate, endDate }
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
    if (activeTab === "utm" && (!utmAnalysis?.utm_analysis?.export_data?.length && !campaignEngagement?.campaign_engagement_analysis)) {
      alert("Please run UTM or Campaign analysis first");
      return;
    }
    
    console.log('UTM Analysis:', utmAnalysis);
    console.log('Campaign Engagement:', campaignEngagement);

    setLoading(true);
    try {
      let exportData = {};
      
      if (activeTab === "emails") {
        exportData = {
          title: `Email Stats ${filterType ? filterType.replace('_', ' ').toUpperCase() : new Date().getFullYear()}`,
          data_type: "emails",
          data: stats
        };
      } else if (activeTab === "forms") {
        exportData = {
          title: `Form Stats ${new Date().getFullYear()}`,
          data_type: "forms",
          data: formStats
        };
      } else if (activeTab === "utm") {
        if (utmAnalysis?.utm_analysis?.export_data?.length) {
          exportData = {
            title: `UTM Issues Analysis ${new Date().getFullYear()}`,
            data_type: "utm",
            data: utmAnalysis.utm_analysis.export_data
          };
        } else if (campaignEngagement?.campaign_engagement_analysis) {
          const campaignData = [];
          const analysis = campaignEngagement.campaign_engagement_analysis;
          
          console.log('Processing campaign data:', analysis);
          
          // Add active campaigns
          if (analysis.active_campaigns && analysis.active_campaigns.length > 0) {
            analysis.active_campaigns.forEach(campaign => {
              campaignData.push({
                "Campaign ID": campaign.id,
                "Campaign Name": campaign.name,
                "Status": "Active",
                "Created Date": campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'N/A',
                "Engagement Score": campaign.engagement_score || 0
              });
            });
          }
          
          // Add inactive campaigns
          if (analysis.inactive_campaigns && analysis.inactive_campaigns.length > 0) {
            analysis.inactive_campaigns.forEach(campaign => {
              campaignData.push({
                "Campaign ID": campaign.id,
                "Campaign Name": campaign.name,
                "Status": "Inactive",
                "Created Date": campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'N/A',
                "Engagement Score": campaign.engagement_score || 0
              });
            });
          }
          
          console.log('Campaign data to export:', campaignData);
          
          if (campaignData.length === 0) {
            alert('No campaign data available to export');
            return;
          }
          
          exportData = {
            title: `Campaign Engagement Analysis ${new Date().getFullYear()}`,
            data_type: "campaigns",
            data: campaignData
          };
        } else {
          alert('No data available to export. Please run an analysis first.');
          return;
        }
      }

      console.log('Exporting data:', exportData);
      
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
          filename: `email_stats_${filterType || new Date().getFullYear()}`
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
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)",
      fontFamily: "'SF Pro Display', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        background: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        {/* Analytics Hub - Top Left */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            animation: "glow 2s ease-in-out infinite alternate"
          }}>📊</div>
          <div>
            <h1 style={{
              fontSize: "2.2rem",
              fontWeight: "700",
              letterSpacing: "-0.025em",
              margin: 0,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "fadeInUp 1s ease-out"
            }}>Analytics Hub</h1>
            <p style={{ 
              fontSize: "0.9rem", 
              color: "#94a3b8",
              fontWeight: "500",
              letterSpacing: "0.025em",
              margin: 0,
              fontWeight: "500"
            }}>Pardot Intelligence</p>
          </div>
        </div>

        {/* Connection Status - Top Right */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          {/* Pardot Status */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "20px",
            background: pardotConnected 
              ? "rgba(34, 197, 94, 0.1)" 
              : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${pardotConnected ? "#22c55e" : "#ef4444"}`,
            fontSize: "0.8rem",
            fontWeight: "600",
            color: pardotConnected ? "#22c55e" : "#ef4444",
            animation: "pulse 2s ease-in-out infinite"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: pardotConnected ? "#22c55e" : "#ef4444",
              animation: "pulse 1s ease-in-out infinite"
            }}></div>
            Pardot
          </div>

          {/* Google Status */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "20px",
            background: googleAuth 
              ? "rgba(34, 197, 94, 0.1)" 
              : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${googleAuth ? "#22c55e" : "#ef4444"}`,
            fontSize: "0.8rem",
            fontWeight: "600",
            color: googleAuth ? "#22c55e" : "#ef4444",
            animation: "pulse 2s ease-in-out infinite"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: googleAuth ? "#22c55e" : "#ef4444",
              animation: "pulse 1s ease-in-out infinite"
            }}></div>
            Google
          </div>

          {/* Full Report Button */}
          <button
            onClick={downloadComprehensivePDF}
            disabled={!token || pdfLoading}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              background: pdfLoading 
                ? "linear-gradient(135deg, #64748b, #475569)" 
                : "linear-gradient(135deg, #059669, #047857)",
              color: "#ffffff",
              cursor: pdfLoading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "0.8rem",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)"
            }}
            onMouseOver={(e) => {
              if (!pdfLoading) {
                e.target.style.background = "linear-gradient(135deg, #047857, #065f46)";
                e.target.style.transform = "translateY(-1px)";
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
                  width: "12px",
                  height: "12px",
                  border: "2px solid #ffffff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                Generating...
              </>
            ) : (
              <>
                📄 Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: "flex",
        padding: "20px",
        gap: "20px"
      }}>
        {/* Sidebar Navigation */}
        <div style={{
          width: "280px",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          padding: "24px",
          height: "fit-content",
          position: "sticky",
          top: "120px"
        }}>
          <h3 style={{
            color: "#f8fafc",
            fontSize: "1.25rem",
            fontWeight: "600",
            letterSpacing: "-0.025em",
            marginBottom: "20px",
            textAlign: "center"
          }}>Modules</h3>
          
          <div style={{
            display: "grid",
            gap: "12px"
          }}>
            {[
              { id: "emails", label: "📧 Email Campaigns", color: "linear-gradient(135deg, #6366f1, #4f46e5)" },
              { id: "forms", label: "📝 Forms Analysis", color: "linear-gradient(135deg, #10b981, #059669)" },
              { id: "prospects", label: "👥 Prospect Health", color: "linear-gradient(135deg, #f59e0b, #d97706)" },
              { id: "landing-pages", label: "🚀 Landing Pages", color: "linear-gradient(135deg, #8b5cf6, #7c3aed)" },
              { id: "engagement", label: "🎯 Engagement", color: "linear-gradient(135deg, #ef4444, #dc2626)" },
              { id: "utm", label: "📊 Campaign & UTM Analysis", color: "linear-gradient(135deg, #06b6d4, #0891b2)" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: "none",
                  background: activeTab === tab.id 
                    ? tab.color
                    : "rgba(30, 41, 59, 0.4)",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  letterSpacing: "0.025em",
                  transition: "all 0.3s ease",
                  textAlign: "left",
                  width: "100%",
                  boxShadow: activeTab === tab.id 
                    ? "0 8px 25px rgba(0, 0, 0, 0.3)" 
                    : "0 2px 10px rgba(0, 0, 0, 0.1)",
                  transform: activeTab === tab.id ? "translateY(-2px)" : "translateY(0)"
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = "rgba(59, 130, 246, 0.2)";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = "rgba(30, 41, 59, 0.4)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="content-container" style={{
          flex: 1,
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          padding: "32px",
          color: "#fff",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
          animation: "fadeIn 1.2s ease-out",
          overflow: "hidden",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255, 255, 255, 0.3) transparent",
          minHeight: "calc(100vh - 200px)"
        }}>
        {/* Custom Date Filter - Only for emails */}
        {activeTab === "emails" && (
          <CustomDateFilter 
            filterType={filterType}
            setFilterType={setFilterType}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
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
          utmAnalysis={utmAnalysis}
          spreadsheetId={spreadsheetId}
          getEmailStats={getEmailStats}
          getFormStats={getFormStats}
          getActiveInactiveForms={getActiveInactiveForms}
          getFormAbandonmentAnalysis={getFormAbandonmentAnalysis}
          getLandingPageStats={getLandingPageStats}
          getProspectHealth={getProspectHealth}
          campaignEngagement={campaignEngagement}
          getEngagementPrograms={getEngagementAnalysis}
          getUTMAnalysis={getUTMAnalysis}
          getCampaignEngagementAnalysis={getCampaignEngagementAnalysis}
          downloadPDF={downloadPDF}
          authenticateGoogle={authenticateGoogle}
          exportToSheets={exportToSheets}
        />


        
        {loading && (
          <div style={{
            textAlign: "center",
            padding: "32px",
            background: "rgba(30, 41, 59, 0.6)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            marginBottom: "32px",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ 
              width: "40px",
              height: "40px",
              border: "4px solid rgba(255, 255, 255, 0.1)",
              borderTop: "4px solid #6366f1",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite"
            }}></div>
            <p style={{ 
              color: "#cbd5e1", 
              fontWeight: "600", 
              margin: 0,
              fontSize: "1.1rem"
            }}>Processing your request...</p>
          </div>
        )}

        {/* Stats Display */}
        {activeTab === "emails" && (
          <EmailStatsDisplay 
            stats={stats} 
            filterType={filterType}
            startDate={startDate}
            endDate={endDate}
          />
        )}
        
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
            getDuplicateProspects={getDuplicateProspects}
            getInactiveProspects={getInactiveProspects}
            getMissingFieldsProspects={getMissingFieldsProspects}
          />
        )}
        
        {activeTab === "engagement" && (
          <EngagementSection 
            engagementAnalysis={engagementAnalysis}
            getEngagementAnalysis={getEngagementAnalysis}
          />
        )}
        
        {activeTab === "utm" && (
          <UTMSection 
            utmAnalysis={utmAnalysis}
            campaignEngagement={campaignEngagement}
          />
        )}
        </div>
      </div>
    </div>
  );
}

