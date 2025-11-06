import React, { useState, useEffect } from "react";
import axios from "axios";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

function LandingPageStatsWithFilter({ landingPageStats }) {
  const [filteredStats, setFilteredStats] = useState(landingPageStats);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const applyDateFilter = async () => {
    if (!startDate && !endDate) {
      setFilteredStats(landingPageStats);
      return;
    }

    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axios.get("http://localhost:4001/get-active-inactive-landing-pages", {
        params
      });
      setFilteredStats(response.data);
    } catch (error) {
      console.error("Error filtering landing page stats:", error);
      alert("Error applying filters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilteredStats(landingPageStats);
  };

  if (!filteredStats) return null;

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
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "#f1f5f9"
        }}>
          Landing Page Activity Analysis
          <span style={{
            background: "linear-gradient(135deg, #475569, #334155)",
            color: "#ffffff",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "600"
          }}>
            {(filteredStats.active_pages?.count || 0) + (filteredStats.inactive_pages?.count || 0)} pages
          </span>
        </h2>
      </div>

      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "24px",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <h3 style={{
          color: "#f1f5f9",
          fontSize: "1.1rem",
          fontWeight: "600",
          marginBottom: "16px",
          margin: 0
        }}>📅 Filter by Creation Date</h3>
        
        <div style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: "16px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "500" }}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(30, 41, 59, 0.8)",
                color: "#f1f5f9",
                fontSize: "0.9rem"
              }}
            />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "500" }}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(30, 41, 59, 0.8)",
                color: "#f1f5f9",
                fontSize: "0.9rem"
              }}
            />
          </div>
          
          <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
            <button
              onClick={applyDateFilter}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: loading ? "rgba(99, 102, 241, 0.5)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "0.9rem"
              }}
            >
              {loading ? "Filtering..." : "Apply Filter"}
            </button>
            
            <button
              onClick={clearFilters}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem"
              }}
            >
              Clear
            </button>
          </div>
        </div>
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
          {filteredStats.criteria || "Landing pages with visitor activity (views, clicks, submissions) in last 3 months are considered active"}
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
            {filteredStats.active_pages?.count || 0}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            {filteredStats.summary?.active_percentage || 0}% of total
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
            {filteredStats.inactive_pages?.count || 0}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            {filteredStats.summary?.inactive_percentage || 0}% of total
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
            {filteredStats.summary?.total_activities || 0}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            Recent: {filteredStats.summary?.total_recent_activities || 0}
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
            {filteredStats.active_pages?.description || "Pages with visitor activity in the last 3 months"}
          </div>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {(filteredStats.active_pages?.pages || []).map((page, index) => (
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
            {filteredStats.inactive_pages?.description || "Pages with no visitor activity in the last 3 months"}
          </div>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {(filteredStats.inactive_pages?.pages || []).map((page, index) => (
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

export default function LandingPagesSection({ landingPageStats }) {
  if (!landingPageStats) return null;

  return (
    <LandingPageStatsWithFilter landingPageStats={landingPageStats} />
  );
}