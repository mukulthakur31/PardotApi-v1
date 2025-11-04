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

export default function ModernDashboard() {
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
  const [engagementAnalysis, setEngagementAnalysis] = useState(null);
  const [utmAnalysis, setUtmAnalysis] = useState(null);
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

    getTokenFromSession();
    checkGoogleAuthStatus();

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

  const tabs = [
    { id: "emails", label: "Email Campaigns", icon: "📧", color: "#3B82F6" },
    { id: "forms", label: "Forms Analysis", icon: "📝", color: "#10B981" },
    { id: "prospects", label: "Prospect Health", icon: "👥", color: "#F59E0B" },
    { id: "landing-pages", label: "Landing Pages", icon: "🚀", color: "#8B5CF6" },
    { id: "engagement", label: "Engagement", icon: "🎯", color: "#EF4444" },
    { id: "utm", label: "Campaign & UTM", icon: "📊", color: "#06B6D4" }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#ffffff"
    }}>
      {/* Header */}
      <header style={{
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "20px 32px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1400px",
          margin: "0 auto"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px"
            }}>📊</div>
            <div>
              <h1 style={{
                fontSize: "28px",
                fontWeight: "700",
                margin: 0,
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>Pardot Analytics</h1>
              <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>Intelligence Dashboard</p>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "20px",
              background: pardotConnected ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${pardotConnected ? "#22C55E" : "#EF4444"}`,
              fontSize: "12px",
              fontWeight: "600",
              color: pardotConnected ? "#22C55E" : "#EF4444"
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: pardotConnected ? "#22C55E" : "#EF4444"
              }}></div>
              Pardot
            </div>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "20px",
              background: googleAuth ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${googleAuth ? "#22C55E" : "#EF4444"}`,
              fontSize: "12px",
              fontWeight: "600",
              color: googleAuth ? "#22C55E" : "#EF4444"
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: googleAuth ? "#22C55E" : "#EF4444"
              }}></div>
              Google
            </div>
            
            <button
              onClick={downloadComprehensivePDF}
              disabled={!token || pdfLoading}
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                border: "none",
                background: pdfLoading ? "#6B7280" : "linear-gradient(135deg, #059669, #047857)",
                color: "#FFFFFF",
                cursor: pdfLoading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease"
              }}
            >
              {pdfLoading ? "Generating..." : "📄 Full Report"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        maxWidth: "1600px",
        margin: "0 auto",
        padding: "24px",
        display: "flex",
        gap: "24px",
        minHeight: "calc(100vh - 100px)"
      }}>
        {/* Sidebar */}
        <nav style={{
          width: "280px",
          background: "rgba(30, 41, 59, 0.9)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "24px",
          height: "fit-content",
          position: "sticky",
          top: "120px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          flexShrink: 0
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "20px",
            color: "#f1f5f9"
          }}>Modules</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "16px 20px",
                  borderRadius: "16px",
                  border: "none",
                  background: activeTab === tab.id 
                    ? `linear-gradient(135deg, ${tab.color}, ${tab.color}CC)`
                    : "rgba(51, 65, 85, 0.6)",
                  color: activeTab === tab.id ? "#ffffff" : "#cbd5e1",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  border: activeTab === tab.id ? `1px solid ${tab.color}40` : "1px solid transparent"
                }}
              >
                <span style={{ fontSize: "18px" }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main style={{
          flex: 1,
          background: "rgba(30, 41, 59, 0.9)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          padding: "32px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          overflow: "auto"
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
              padding: "60px",
              background: "rgba(0, 0, 0, 0.2)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "32px"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                border: "4px solid rgba(59, 130, 246, 0.3)",
                borderTop: "4px solid #3B82F6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px"
              }}></div>
              <p style={{
                color: "#9CA3AF",
                fontWeight: "500",
                margin: 0,
                fontSize: "16px"
              }}>Processing your request...</p>
            </div>
          )}

          {/* Content Sections */}
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
        </main>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}