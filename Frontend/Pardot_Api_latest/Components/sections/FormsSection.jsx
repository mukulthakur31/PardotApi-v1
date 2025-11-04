import React, { useState, useEffect } from "react";
import axios from "axios";

// Configure axios to include credentials
axios.defaults.withCredentials = true;

function FormStatsWithFilter({ formStats }) {
  const [filteredStats, setFilteredStats] = useState(formStats);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const applyDateFilter = async () => {
    if (!startDate && !endDate) {
      setFilteredStats(formStats);
      return;
    }

    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axios.get("http://localhost:4001/get-filtered-form-stats", {
        params
      });
      setFilteredStats(response.data);
    } catch (error) {
      console.error("Error filtering form stats:", error);
      alert("Error applying filters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilteredStats(formStats);
  };

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
          Form Statistics
          <span style={{
            background: "linear-gradient(135deg, #475569, #334155)",
            color: "#ffffff",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "600"
          }}>
            {filteredStats.length} forms
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
      
      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        borderRadius: "8px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        overflow: "hidden"
      }}>
        <div style={{
          maxHeight: "600px",
          overflowY: "auto"
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9rem"
          }}>
            <thead>
              <tr style={{
                background: "rgba(30, 41, 59, 0.8)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <th style={{ padding: "12px 8px", textAlign: "left", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Form Name</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Status</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Views</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Unique Views</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Submissions</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Unique Subs</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Abandoned</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Abandon %</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Convert %</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Clicks</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Conversions</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Created</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.85rem" }}>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((form, index) => {
                const formatDate = (dateStr) => {
                  if (!dateStr) return "N/A";
                  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2-digit' });
                };

                return (
                  <tr key={index} style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    transition: "background-color 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.5)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}>
                    <td style={{ padding: "10px 8px", color: "#e2e8f0" }}>
                      <div style={{ fontWeight: "500" }}>{form.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>ID: {form.id}</div>
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "center" }}>
                      <span style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        background: form.is_active ? "rgba(34, 197, 94, 0.2)" : "rgba(107, 114, 128, 0.2)",
                        color: form.is_active ? "#22c55e" : "#9ca3af"
                      }}>
                        {form.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 8px", textAlign: "center", color: "#e2e8f0", fontWeight: "500" }}>{form.views}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center", color: "#e2e8f0" }}>{form.unique_views}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center", color: "#e2e8f0", fontWeight: "500" }}>{form.submissions}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center", color: "#e2e8f0" }}>{form.unique_submissions}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center", color: "#e2e8f0" }}>{form.abandoned}</td>
                    <td style={{ 
                      padding: "10px 8px", 
                      textAlign: "center", 
                      color: form.abandonment_rate >= 70 ? "#ef4444" : form.abandonment_rate >= 40 ? "#f59e0b" : "#e2e8f0",
                      fontWeight: "500"
                    }}>{form.abandonment_rate}%</td>
                    <td style={{ 
                      padding: "10px 8px", 
                      textAlign: "center", 
                      color: form.conversion_rate >= 50 ? "#22c55e" : "#e2e8f0",
                      fontWeight: "500"
                    }}>{form.conversion_rate}%</td>
                    <td style={{ padding: "10px 8px", textAlign: "center", color: "#e2e8f0" }}>{form.clicks}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center", color: "#e2e8f0", fontWeight: "500" }}>{form.conversions}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>{formatDate(form.created_at)}</td>
                    <td style={{ padding: "10px 8px", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>{formatDate(form.last_activity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function FormsSection({ 
  formStats, 
  activeInactiveForms, 
  formAbandonmentData,
  activeFormView, 
  setActiveFormView 
}) {
  if (activeFormView === "abandonment" && formAbandonmentData) {
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
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontSize: "1.75rem",
            fontWeight: "700",
            margin: 0,
            color: "#f1f5f9"
          }}>Form Abandonment Analysis</h2>
          <button
            onClick={() => setActiveFormView(null)}
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
        
        {/* Summary Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px"
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#ef4444", margin: "0 0 8px 0", fontSize: "1rem" }}>Total Abandoned</h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ef4444" }}>
              {formAbandonmentData.summary.total_abandoned.toLocaleString()}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              {formAbandonmentData.summary.overall_abandonment_rate}% rate
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#22c55e", margin: "0 0 8px 0", fontSize: "1rem" }}>Submissions</h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#22c55e" }}>
              {formAbandonmentData.summary.total_submissions.toLocaleString()}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              {formAbandonmentData.summary.overall_conversion_rate}% conversion
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.05))",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#6366f1", margin: "0 0 8px 0", fontSize: "1rem" }}>Total Views</h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#6366f1" }}>
              {formAbandonmentData.summary.total_views.toLocaleString()}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              Across {formAbandonmentData.summary.total_forms} forms
            </div>
          </div>
        </div>

        {/* Abandonment Categories */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "24px",
          marginBottom: "24px"
        }}>
          {/* High Abandonment */}
          <div style={{
            background: "rgba(15, 23, 42, 0.8)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid rgba(239, 68, 68, 0.3)"
          }}>
            <h4 style={{ color: "#ef4444", margin: "0 0 16px 0" }}>🚨 High Abandonment ({formAbandonmentData.categories.high_abandonment.threshold})</h4>
            <div style={{ color: "#94a3b8", marginBottom: "12px" }}>
              {formAbandonmentData.categories.high_abandonment.count} forms need immediate attention
            </div>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {formAbandonmentData.categories.high_abandonment.forms.map((form, index) => (
                <div key={index} style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  border: "1px solid rgba(239, 68, 68, 0.2)"
                }}>
                  <div style={{ fontWeight: "600", color: "#f1f5f9", fontSize: "0.9rem" }}>{form.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
                    <span>Views: {form.views}</span>
                    <span>Submissions: {form.submissions}</span>
                    <span style={{ color: "#ef4444", fontWeight: "600" }}>Abandoned: {form.abandonment_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Performers */}
          <div style={{
            background: "rgba(15, 23, 42, 0.8)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid rgba(34, 197, 94, 0.3)"
          }}>
            <h4 style={{ color: "#22c55e", margin: "0 0 16px 0" }}>✅ Best Performers ({formAbandonmentData.categories.low_abandonment.threshold})</h4>
            <div style={{ color: "#94a3b8", marginBottom: "12px" }}>
              {formAbandonmentData.categories.low_abandonment.count} forms performing well
            </div>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {formAbandonmentData.categories.low_abandonment.forms.map((form, index) => (
                <div key={index} style={{
                  background: "rgba(34, 197, 94, 0.1)",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  border: "1px solid rgba(34, 197, 94, 0.2)"
                }}>
                  <div style={{ fontWeight: "600", color: "#f1f5f9", fontSize: "0.9rem" }}>{form.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>
                    <span>Views: {form.views}</span>
                    <span>Submissions: {form.submissions}</span>
                    <span style={{ color: "#22c55e", fontWeight: "600" }}>Abandoned: {form.abandonment_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          <h4 style={{ color: "#f1f5f9", margin: "0 0 16px 0" }}>📊 Key Insights</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Average Abandonment Rate</div>
              <div style={{ color: "#f1f5f9", fontSize: "1.2rem", fontWeight: "600" }}>
                {formAbandonmentData.insights.avg_abandonment_rate}%
              </div>
            </div>
            <div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Forms Needing Attention</div>
              <div style={{ color: "#ef4444", fontSize: "1.2rem", fontWeight: "600" }}>
                {formAbandonmentData.insights.forms_needing_attention}
              </div>
            </div>
            {formAbandonmentData.insights.best_performing_form && (
              <div>
                <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Best Performer</div>
                <div style={{ color: "#22c55e", fontSize: "1rem", fontWeight: "600" }}>
                  {formAbandonmentData.insights.best_performing_form.name}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                  {formAbandonmentData.insights.best_performing_form.abandonment_rate}% abandonment
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeFormView === "active-inactive" && activeInactiveForms) {
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
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontSize: "1.75rem",
            fontWeight: "700",
            margin: 0,
            color: "#f1f5f9"
          }}>Active vs Inactive Forms</h2>
          <button
            onClick={() => setActiveFormView(null)}
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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "24px"
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <h3 style={{ color: "#22c55e", margin: "0 0 12px 0" }}>Active Forms</h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#22c55e" }}>
              {activeInactiveForms.active_forms.count}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Avg Conversion: {activeInactiveForms.summary.avg_conversion_rate_active}%
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <h3 style={{ color: "#ef4444", margin: "0 0 12px 0" }}>Inactive Forms</h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ef4444" }}>
              {activeInactiveForms.inactive_forms.count}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Avg Conversion: {activeInactiveForms.summary.avg_conversion_rate_inactive}%
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.05))",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "12px",
            padding: "20px"
          }}>
            <h3 style={{ color: "#6366f1", margin: "0 0 12px 0" }}>Active Rate</h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#6366f1" }}>
              {activeInactiveForms.summary.active_percentage}%
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Forms with recent activity
            </div>
          </div>
        </div>
        
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          borderRadius: "12px",
          padding: "24px",
          maxHeight: "400px",
          overflowY: "auto",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          <div style={{ display: "grid", gap: "12px" }}>
            {[...activeInactiveForms.active_forms.forms, ...activeInactiveForms.inactive_forms.forms].map((form, index) => (
              <div key={index} style={{
                background: "rgba(30, 41, 59, 0.6)",
                padding: "16px",
                borderRadius: "8px",
                border: `1px solid ${form.is_active ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "600", color: "#f1f5f9" }}>{form.name}</div>
                    <div style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>ID: {form.id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ 
                      color: form.is_active ? "#22c55e" : "#ef4444", 
                      fontWeight: "600",
                      marginBottom: "4px"
                    }}>
                      {form.is_active ? "Active" : "Inactive"}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      Conversion: {form.conversion_rate}%
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      Views: {form.views} | Submissions: {form.submissions}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (formStats && formStats.length > 0 && !activeFormView) {
    return (
      <FormStatsWithFilter formStats={formStats} />
    );
  }

  return null;
}