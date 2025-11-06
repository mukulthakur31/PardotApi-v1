import React from "react";
import CustomDateFilter from "./CustomDateFilter";

export default function FormsSection({ 
  formStats, 
  activeInactiveForms, 
  formAbandonmentData,
  activeFormView, 
  setActiveFormView,
  filterType,
  setFilterType,
  startDate,
  setStartDate,
  endDate,
  setEndDate
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
    // Calculate summary statistics
    const totalViews = formStats.reduce((sum, form) => sum + (form.views || 0), 0);
    const totalSubmissions = formStats.reduce((sum, form) => sum + (form.submissions || 0), 0);
    const avgConversionRate = formStats.length > 0 ? 
      (formStats.reduce((sum, form) => sum + (form.conversionRate || 0), 0) / formStats.length).toFixed(2) : 0;
    const topPerformer = formStats.reduce((best, form) => 
      (form.conversionRate || 0) > (best.conversionRate || 0) ? form : best, formStats[0]);

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
            📝 Form Statistics
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
        
        {/* Summary Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "32px"
        }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.05))",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#6366f1", margin: "0 0 8px 0", fontSize: "1rem" }}>Total Views</h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#6366f1" }}>
              {totalViews.toLocaleString()}
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#22c55e", margin: "0 0 8px 0", fontSize: "1rem" }}>Total Submissions</h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#22c55e" }}>
              {totalSubmissions.toLocaleString()}
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#f59e0b", margin: "0 0 8px 0", fontSize: "1rem" }}>Avg Conversion</h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b" }}>
              {avgConversionRate}%
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center"
          }}>
            <h3 style={{ color: "#8b5cf6", margin: "0 0 8px 0", fontSize: "1rem" }}>Top Performer</h3>
            <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#8b5cf6", marginBottom: "4px" }}>
              {topPerformer?.name || 'N/A'}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              {topPerformer?.conversionRate || 0}% conversion
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <div style={{
          background: "rgba(15, 23, 42, 0.8)",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}>
          <h3 style={{ color: "#f1f5f9", margin: "0 0 20px 0", fontSize: "1.25rem" }}>Form Details</h3>
          <div style={{
            display: "grid",
            gap: "16px",
            maxHeight: "400px",
            overflowY: "auto"
          }}>
            {formStats.map((form, index) => {
              const conversionRate = form.conversionRate || 0;
              const getPerformanceColor = (rate) => {
                if (rate >= 15) return { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)", text: "#22c55e" };
                if (rate >= 5) return { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)", text: "#f59e0b" };
                return { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.3)", text: "#ef4444" };
              };
              const colors = getPerformanceColor(conversionRate);
              
              return (
                <div key={index} style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px",
                  padding: "20px",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: "#f1f5f9", margin: "0 0 8px 0", fontSize: "1.1rem", fontWeight: "600" }}>
                        {form.name || `Form ${form.id}`}
                      </h4>
                      <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "8px" }}>
                        ID: {form.id} | Created: {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      {form.embedCode && (
                        <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                          Embed Code Available
                        </div>
                      )}
                    </div>
                    <div style={{
                      background: colors.bg,
                      border: `2px solid ${colors.border}`,
                      borderRadius: "8px",
                      padding: "8px 12px",
                      textAlign: "center",
                      minWidth: "80px"
                    }}>
                      <div style={{ color: colors.text, fontSize: "1.2rem", fontWeight: "700" }}>
                        {conversionRate.toFixed(1)}%
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Conversion</div>
                    </div>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "16px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#6366f1", fontSize: "1.5rem", fontWeight: "700" }}>
                        {(form.views || 0).toLocaleString()}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Views</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#22c55e", fontSize: "1.5rem", fontWeight: "700" }}>
                        {(form.submissions || 0).toLocaleString()}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Submissions</div>
                    </div>
                    {form.errors && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: "#ef4444", fontSize: "1.5rem", fontWeight: "700" }}>
                          {form.errors.toLocaleString()}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Errors</div>
                      </div>
                    )}
                    {form.layout && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ color: "#8b5cf6", fontSize: "1rem", fontWeight: "600" }}>
                          {form.layout}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Layout</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.6)",
      borderRadius: "16px",
      padding: "32px",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      textAlign: "center"
    }}>
      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📝</div>
      <h2 style={{ color: "#f1f5f9", marginBottom: "12px" }}>No Form Data Available</h2>
      <p style={{ color: "#94a3b8", margin: 0 }}>Click "Get Form Stats" to load your form analytics</p>
    </div>
  );
}