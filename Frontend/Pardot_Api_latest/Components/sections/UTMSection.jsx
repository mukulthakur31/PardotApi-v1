import React, { useState } from "react";

export default function UTMSection({ utmAnalysis, campaignEngagement }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  
  if (!utmAnalysis && !campaignEngagement) {
    return (
      <div style={{
        textAlign: "center",
        padding: "60px",
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
        borderRadius: "24px",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Animated background elements */}
        <div style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "100px",
          height: "100px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent)",
          borderRadius: "50%",
          animation: "float 3s ease-in-out infinite"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          width: "80px",
          height: "80px",
          background: "radial-gradient(circle, rgba(34, 197, 94, 0.1), transparent)",
          borderRadius: "50%",
          animation: "float 3s ease-in-out infinite reverse"
        }}></div>
        
        <div style={{ 
          fontSize: "4rem", 
          marginBottom: "24px",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "pulse 2s ease-in-out infinite"
        }}>🎯</div>
        <h3 style={{ 
          color: "#f1f5f9", 
          marginBottom: "16px", 
          fontSize: "2rem",
          fontWeight: "700",
          background: "linear-gradient(135deg, #f1f5f9, #cbd5e1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Campaign and UTM Analysis
        </h3>
        <p style={{ 
          color: "#94a3b8", 
          fontSize: "1.2rem",
          lineHeight: "1.6",
          maxWidth: "500px",
          margin: "0 auto"
        }}>
          Ready to analyze campaign and UTM parameter consistency and engagement? 
          <br />
          <span style={{ color: "#3b82f6", fontWeight: "600" }}>Use the action buttons</span> in the Data Actions panel.
        </p>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.8s ease-out" }}>


      {/* UTM Analysis Section */}
      {utmAnalysis && (
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{
            color: "#f1f5f9",
            fontSize: "1.8rem",
            fontWeight: "700",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{
              fontSize: "2rem",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              padding: "8px",
              borderRadius: "12px"
            }}>🎯</span>
            UTM Parameter Analysis
          </h2>
          
          {/* UTM Summary Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px",
            marginBottom: "40px"
          }}>
            <div 
              style={{
                background: hoveredCard === 'total' 
                  ? "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 41, 59, 0.8))" 
                  : "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
                borderRadius: "20px",
                padding: "32px",
                border: hoveredCard === 'total' 
                  ? "1px solid rgba(59, 130, 246, 0.3)" 
                  : "1px solid rgba(255, 255, 255, 0.08)",
                textAlign: "center",
                transform: hoveredCard === 'total' ? "translateY(-8px)" : "translateY(0)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={() => setHoveredCard('total')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{
                position: "absolute",
                top: "-50%",
                right: "-50%",
                width: "100px",
                height: "100px",
                background: "radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent)",
                borderRadius: "50%"
              }}></div>
              <div style={{ 
                fontSize: "3rem", 
                marginBottom: "16px",
                filter: hoveredCard === 'total' ? "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))" : "none",
                transition: "all 0.3s ease"
              }}>👥</div>
              <div style={{ 
                fontSize: "2.5rem", 
                fontWeight: "800", 
                color: "#3b82f6", 
                marginBottom: "12px",
                textShadow: hoveredCard === 'total' ? "0 0 20px rgba(59, 130, 246, 0.5)" : "none"
              }}>
                {utmAnalysis.utm_analysis?.total_prospects_analyzed?.toLocaleString() || 0}
              </div>
              <div style={{ color: "#e2e8f0", fontSize: "1.1rem", fontWeight: "500" }}>Total Prospects Analyzed</div>
            </div>

            <div 
              style={{
                background: hoveredCard === 'issues' 
                  ? "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(30, 41, 59, 0.8))" 
                  : "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
                borderRadius: "20px",
                padding: "32px",
                border: hoveredCard === 'issues' 
                  ? "1px solid rgba(239, 68, 68, 0.3)" 
                  : "1px solid rgba(255, 255, 255, 0.08)",
                textAlign: "center",
                transform: hoveredCard === 'issues' ? "translateY(-8px)" : "translateY(0)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={() => setHoveredCard('issues')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{
                position: "absolute",
                top: "-50%",
                right: "-50%",
                width: "100px",
                height: "100px",
                background: "radial-gradient(circle, rgba(239, 68, 68, 0.1), transparent)",
                borderRadius: "50%"
              }}></div>
              <div style={{ 
                fontSize: "3rem", 
                marginBottom: "16px",
                filter: hoveredCard === 'issues' ? "drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))" : "none",
                transition: "all 0.3s ease"
              }}>⚠️</div>
              <div style={{ 
                fontSize: "2.5rem", 
                fontWeight: "800", 
                color: "#ef4444", 
                marginBottom: "12px",
                textShadow: hoveredCard === 'issues' ? "0 0 20px rgba(239, 68, 68, 0.5)" : "none"
              }}>
                {utmAnalysis.utm_analysis?.prospects_with_utm_issues?.toLocaleString() || 0}
              </div>
              <div style={{ color: "#e2e8f0", fontSize: "1.1rem", fontWeight: "500" }}>Prospects with UTM Issues</div>
            </div>

            <div 
              style={{
                background: hoveredCard === 'clean' 
                  ? "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(30, 41, 59, 0.8))" 
                  : "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
                borderRadius: "20px",
                padding: "32px",
                border: hoveredCard === 'clean' 
                  ? "1px solid rgba(34, 197, 94, 0.3)" 
                  : "1px solid rgba(255, 255, 255, 0.08)",
                textAlign: "center",
                transform: hoveredCard === 'clean' ? "translateY(-8px)" : "translateY(0)",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={() => setHoveredCard('clean')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{
                position: "absolute",
                top: "-50%",
                right: "-50%",
                width: "100px",
                height: "100px",
                background: "radial-gradient(circle, rgba(34, 197, 94, 0.1), transparent)",
                borderRadius: "50%"
              }}></div>
              <div style={{ 
                fontSize: "3rem", 
                marginBottom: "16px",
                filter: hoveredCard === 'clean' ? "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))" : "none",
                transition: "all 0.3s ease"
              }}>✅</div>
              <div style={{ 
                fontSize: "2.5rem", 
                fontWeight: "800", 
                color: "#22c55e", 
                marginBottom: "12px",
                textShadow: hoveredCard === 'clean' ? "0 0 20px rgba(34, 197, 94, 0.5)" : "none"
              }}>
                {((utmAnalysis.utm_analysis?.total_prospects_analyzed || 0) - (utmAnalysis.utm_analysis?.prospects_with_utm_issues || 0)).toLocaleString()}
              </div>
              <div style={{ color: "#e2e8f0", fontSize: "1.1rem", fontWeight: "500" }}>Clean UTM Data</div>
            </div>
          </div>

          {/* UTM Summary */}
          <div style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            marginBottom: "40px",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              height: "4px",
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
              borderRadius: "20px 20px 0 0"
            }}></div>
            <h3 style={{ 
              color: "#f1f5f9", 
              marginBottom: "20px", 
              fontSize: "1.5rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <span style={{
                fontSize: "1.8rem",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                padding: "8px",
                borderRadius: "12px",
                display: "inline-block"
              }}>📋</span>
              Analysis Summary
            </h3>
            <p style={{ 
              color: "#e2e8f0", 
              fontSize: "1.2rem", 
              lineHeight: "1.7",
              fontWeight: "400"
            }}>
              {utmAnalysis.utm_analysis?.summary}
            </p>
          </div>

          {/* UTM Issues Table */}
          {utmAnalysis.utm_analysis?.utm_issues && utmAnalysis.utm_analysis.utm_issues.length > 0 && (
            <div style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
              borderRadius: "24px",
              padding: "32px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              position: "relative",
              overflow: "hidden",
              marginBottom: "40px"
            }}>
              <div style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                height: "4px",
                background: "linear-gradient(90deg, #ef4444, #f97316, #eab308)",
                borderRadius: "24px 24px 0 0"
              }}></div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <h3 style={{ 
                  color: "#f1f5f9", 
                  fontSize: "1.6rem", 
                  margin: 0,
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <span style={{
                    fontSize: "2rem",
                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                    padding: "8px",
                    borderRadius: "12px",
                    display: "inline-block",
                    filter: "drop-shadow(0 0 10px rgba(239, 68, 68, 0.3))"
                  }}>🚨</span>
                  Campaign and UTM Parameter Issues
                  <span style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    color: "#fca5a5",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    border: "1px solid rgba(239, 68, 68, 0.3)"
                  }}>Showing first 20</span>
                </h3>
              </div>
              
              {utmAnalysis.utm_analysis?.prospects_with_utm_issues > 20 && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 41, 59, 0.5))",
                  border: "1px solid rgba(59, 130, 246, 0.4)",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "28px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    width: "200%",
                    height: "200%",
                    background: "radial-gradient(circle, rgba(59, 130, 246, 0.05), transparent 70%)",
                    animation: "pulse 3s ease-in-out infinite"
                  }}></div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    marginBottom: "8px"
                  }}>
                    <span style={{ fontSize: "1.5rem" }}>📊</span>
                    <span style={{ color: "#93c5fd", fontSize: "1.1rem", fontWeight: "600" }}>
                      Found {utmAnalysis.utm_analysis?.prospects_with_utm_issues.toLocaleString()} prospects with campaign and UTM issues
                    </span>
                  </div>
                  <p style={{ color: "#bfdbfe", margin: 0, fontSize: "1rem" }}>
                    Use the <strong>Google Sheets export</strong> in the action panel to download the complete list.
                  </p>
                </div>
              )}
              
              <div style={{ 
                overflowX: "auto",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(15, 23, 42, 0.5)"
              }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.95rem"
                }}>
                  <thead>
                    <tr style={{ 
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(30, 41, 59, 0.8))",
                      borderBottom: "2px solid rgba(59, 130, 246, 0.3)"
                    }}>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "left", 
                        color: "#f1f5f9", 
                        fontWeight: "700",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        🎯 Prospect ID
                      </th>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "left", 
                        color: "#f1f5f9", 
                        fontWeight: "700",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        📧 Email
                      </th>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "left", 
                        color: "#f1f5f9", 
                        fontWeight: "700",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        ❌ Missing Fields
                      </th>
                      <th style={{ 
                        padding: "20px 16px", 
                        textAlign: "left", 
                        color: "#f1f5f9", 
                        fontWeight: "700",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        ⚠️ Invalid Fields
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {utmAnalysis.utm_analysis?.utm_issues.map((issue, index) => (
                      <tr key={index} style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        transition: "all 0.3s ease",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(30, 41, 59, 0.6))";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}>
                        <td style={{ padding: "16px", color: "#cbd5e1" }}>
                          {issue.prospect_id}
                        </td>
                        <td style={{ padding: "16px", color: "#cbd5e1" }}>
                          {issue.email}
                        </td>
                        <td style={{ padding: "18px 16px" }}>
                          {issue.missing_fields && issue.missing_fields.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {issue.missing_fields.map((field, idx) => (
                                <span key={idx} style={{
                                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.15))",
                                  color: "#fca5a5",
                                  padding: "6px 12px",
                                  borderRadius: "20px",
                                  fontSize: "0.8rem",
                                  border: "1px solid rgba(239, 68, 68, 0.4)",
                                  fontWeight: "600",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.2)"
                                }}>
                                  {field}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ 
                              color: "#64748b",
                              fontStyle: "italic",
                              fontSize: "0.9rem"
                            }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: "18px 16px" }}>
                          {issue.invalid_fields && issue.invalid_fields.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {issue.invalid_fields.map((field, idx) => (
                                <span key={idx} style={{
                                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))",
                                  color: "#fbbf24",
                                  padding: "6px 12px",
                                  borderRadius: "20px",
                                  fontSize: "0.8rem",
                                  border: "1px solid rgba(245, 158, 11, 0.4)",
                                  fontWeight: "600",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  boxShadow: "0 2px 8px rgba(245, 158, 11, 0.2)"
                                }}>
                                  {field}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ 
                              color: "#64748b",
                              fontStyle: "italic",
                              fontSize: "0.9rem"
                            }}>None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}



      {/* Campaign Engagement Section */}
      {campaignEngagement && (
        <div>
          <h2 style={{
            color: "#f1f5f9",
            fontSize: "1.8rem",
            fontWeight: "700",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{
              fontSize: "2rem",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              padding: "8px",
              borderRadius: "12px"
            }}>📈</span>
            Campaign Engagement Analysis
          </h2>
          
          {/* Status Criteria Info */}
          <div style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(30, 41, 59, 0.8))",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ fontSize: "1.5rem" }}>ℹ️</span>
            <div>
              <p style={{ 
                color: "#93c5fd", 
                margin: 0, 
                fontSize: "1.1rem", 
                fontWeight: "600" 
              }}>
                Campaign Status Criteria
              </p>
              <p style={{ 
                color: "#bfdbfe", 
                margin: "4px 0 0 0", 
                fontSize: "1rem" 
              }}>
                <strong>Active:</strong> Has prospects, emails, or forms created in last {campaignEngagement.campaign_engagement_analysis?.months_analyzed || 6} months • <strong>Inactive:</strong> No activity in timeframe
              </p>
            </div>
          </div>

          {/* Campaign Engagement Summary Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "32px"
          }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📊</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#3b82f6", marginBottom: "8px" }}>
                {campaignEngagement.campaign_engagement_analysis?.total_campaigns_analyzed || 0}
              </div>
              <div style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "500" }}>Total Campaigns</div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✅</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#22c55e", marginBottom: "8px" }}>
                {campaignEngagement.campaign_engagement_analysis?.active_campaigns_count || 0}
              </div>
              <div style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "500" }}>Active Campaigns</div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#ef4444", marginBottom: "8px" }}>
                {campaignEngagement.campaign_engagement_analysis?.inactive_campaigns_count || 0}
              </div>
              <div style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "500" }}>Inactive Campaigns</div>
            </div>
          </div>

          {/* Active Campaigns Table */}
          {campaignEngagement.campaign_engagement_analysis?.active_campaigns && campaignEngagement.campaign_engagement_analysis.active_campaigns.length > 0 && (
            <div style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
              borderRadius: "20px",
              padding: "28px",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              marginBottom: "32px"
            }}>
              <h3 style={{
                color: "#f1f5f9",
                fontSize: "1.4rem",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <span style={{ fontSize: "1.6rem" }}>✅</span>
                Active Campaigns (With Engagement)
              </h3>
              
              <div style={{
                overflowX: "auto",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem"
                }}>
                  <thead>
                    <tr style={{
                      background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(30, 41, 59, 0.8))",
                      borderBottom: "2px solid rgba(34, 197, 94, 0.3)"
                    }}>
                      <th style={{
                        padding: "16px 12px",
                        textAlign: "left",
                        color: "#f1f5f9",
                        fontWeight: "600",
                        fontSize: "0.9rem"
                      }}>Campaign ID</th>
                      <th style={{
                        padding: "16px 12px",
                        textAlign: "left",
                        color: "#f1f5f9",
                        fontWeight: "600",
                        fontSize: "0.9rem"
                      }}>Campaign Name</th>
                      <th style={{
                        padding: "16px 12px",
                        textAlign: "left",
                        color: "#f1f5f9",
                        fontWeight: "600",
                        fontSize: "0.9rem"
                      }}>Status</th>
                      <th style={{
                        padding: "16px 12px",
                        textAlign: "left",
                        color: "#f1f5f9",
                        fontWeight: "600",
                        fontSize: "0.9rem"
                      }}>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignEngagement.campaign_engagement_analysis.active_campaigns.slice(0, 10).map((campaign, index) => (
                      <tr key={index} style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(34, 197, 94, 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{campaign.id}</td>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{campaign.name}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            background: "rgba(34, 197, 94, 0.2)",
                            color: "#86efac",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: "600"
                          }}>
                            Active
                          </span>
                        </td>
                        <td style={{ padding: "12px", color: "#94a3b8" }}>
                          {campaign.updated_at ? new Date(campaign.updated_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {campaignEngagement.campaign_engagement_analysis.active_campaigns.length > 10 && (
                <div style={{
                  textAlign: "center",
                  marginTop: "16px",
                  padding: "12px",
                  background: "rgba(34, 197, 94, 0.1)",
                  borderRadius: "8px",
                  color: "#86efac"
                }}>
                  Showing 10 of {campaignEngagement.campaign_engagement_analysis.active_campaigns.length} active campaigns
                </div>
              )}
            </div>
          )}

          {/* Inactive Campaigns Table */}
          {campaignEngagement.campaign_engagement_analysis?.inactive_campaigns && campaignEngagement.campaign_engagement_analysis.inactive_campaigns.length > 0 && (
            <div style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
              borderRadius: "20px",
              padding: "28px",
              border: "1px solid rgba(239, 68, 68, 0.2)"
            }}>
              <h3 style={{
                color: "#f1f5f9",
                fontSize: "1.4rem",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <span style={{ fontSize: "1.6rem" }}>🚨</span>
                Inactive Campaigns (No Engagement)
              </h3>
              
              <div style={{
                overflowX: "auto",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem"
                }}>
                  <thead>
                    <tr style={{
                      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(30, 41, 59, 0.8))",
                      borderBottom: "2px solid rgba(239, 68, 68, 0.3)"
                    }}>
                      <th style={{
                        padding: "16px 12px",
                        textAlign: "left",
                        color: "#f1f5f9",
                        fontWeight: "600",
                        fontSize: "0.9rem"
                      }}>Campaign ID</th>
                      <th style={{
                        padding: "16px 12px",
                        textAlign: "left",
                        color: "#f1f5f9",
                        fontWeight: "600",
                        fontSize: "0.9rem"
                      }}>Campaign Name</th>
                      <th style={{
                        padding: "16px 12px",
                        textAlign: "left",
                        color: "#f1f5f9",
                        fontWeight: "600",
                        fontSize: "0.9rem"
                      }}>Status</th>
                      <th style={{
                        padding: "16px 12px",
                        textAlign: "left",
                        color: "#f1f5f9",
                        fontWeight: "600",
                        fontSize: "0.9rem"
                      }}>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignEngagement.campaign_engagement_analysis.inactive_campaigns.slice(0, 10).map((campaign, index) => (
                      <tr key={index} style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        transition: "background 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(59, 130, 246, 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{campaign.id}</td>
                        <td style={{ padding: "12px", color: "#cbd5e1" }}>{campaign.name}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            background: "rgba(239, 68, 68, 0.2)",
                            color: "#fca5a5",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: "600"
                          }}>
                            Inactive
                          </span>
                        </td>
                        <td style={{ padding: "12px", color: "#94a3b8" }}>
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {campaignEngagement.campaign_engagement_analysis.inactive_campaigns.length > 10 && (
                <div style={{
                  textAlign: "center",
                  marginTop: "16px",
                  padding: "12px",
                  background: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "8px",
                  color: "#93c5fd"
                }}>
                  Showing 10 of {campaignEngagement.campaign_engagement_analysis.inactive_campaigns.length} inactive campaigns
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}