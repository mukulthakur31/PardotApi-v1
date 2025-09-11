import React from "react";

export default function ProspectsSection({ 
  prospectHealth,
  activeProspectView,
  setActiveProspectView,
  inactiveProspects,
  duplicateProspects,
  missingFieldsProspects,
  scoringIssuesProspects,
  getDuplicateProspects,
  getInactiveProspects,
  getMissingFieldsProspects,
  getScoringIssuesProspects
}) {
  if (!prospectHealth) return null;

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
  );
}