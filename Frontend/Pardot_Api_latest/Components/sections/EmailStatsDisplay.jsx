import React from "react";

export default function EmailStatsDisplay({ stats, filterType, startDate, endDate }) {
  // If stats is an empty array (backend returned no results), show no emails message
  if (stats && stats.length === 0) {
    return (
      <div style={{
        background: "rgba(30, 41, 59, 0.6)",
        borderRadius: "16px",
        padding: "48px 32px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        textAlign: "center"
      }}>
        <div style={{
          fontSize: "3rem",
          marginBottom: "16px"
        }}>📭</div>
        <h3 style={{
          color: "#f1f5f9",
          fontSize: "1.5rem",
          fontWeight: "600",
          marginBottom: "12px"
        }}>
          No Emails Found
        </h3>
        <p style={{
          color: "#94a3b8",
          fontSize: "1rem"
        }}>
          No email campaigns found for the selected time range.
        </p>
      </div>
    );
  }

  // If stats is null/undefined (no search performed yet), show nothing
  if (!stats) {
    return null;
  }

  // Calculate totals
  const totalSent = stats.reduce((sum, email) => sum + (email.stats?.sent || 0), 0);
  const totalDelivered = stats.reduce((sum, email) => sum + (email.stats?.delivered || 0), 0);
  const totalOpens = stats.reduce((sum, email) => sum + (email.stats?.opens || 0), 0);
  const totalClicks = stats.reduce((sum, email) => sum + (email.stats?.clicks || 0), 0);
  const totalBounces = stats.reduce((sum, email) => sum + (email.stats?.bounces || 0), 0);
  const totalHardBounces = stats.reduce((sum, email) => sum + (email.stats?.hardBounces || 0), 0);
  const totalSoftBounces = stats.reduce((sum, email) => sum + (email.stats?.softBounces || 0), 0);
  const totalUnsubscribes = stats.reduce((sum, email) => sum + (email.stats?.unsubscribes || 0), 0);


  const openRate = totalDelivered > 0 ? (totalOpens / totalDelivered * 100) : 0;
  const clickRate = totalDelivered > 0 ? (totalClicks / totalDelivered * 100) : 0;
  const bounceRate = totalSent > 0 ? (totalBounces / totalSent * 100) : 0;
  const unsubscribeRate = totalDelivered > 0 ? (totalUnsubscribes / totalDelivered * 100) : 0;
  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent * 100) : 0;

  // Get date range display
  const getDateRangeDisplay = () => {
    if (filterType === "custom" && startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    } else if (filterType) {
      return filterType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return "All Time";
  };

  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.6)",
      borderRadius: "16px",
      padding: "32px",
      border: "1px solid rgba(255, 255, 255, 0.05)"
    }}>
      {/* Header with date range */}
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
          color: "#f1f5f9"
        }}>
          📧 Email Campaign Results
        </h2>
        <div style={{
          background: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          borderRadius: "8px",
          padding: "8px 16px",
          color: "#93c5fd",
          fontSize: "0.9rem",
          fontWeight: "500"
        }}>
          📅 {getDateRangeDisplay()}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "12px",
        marginBottom: "32px"
      }}>
        <div style={{
          background: "rgba(59, 130, 246, 0.1)",
          borderRadius: "10px",
          padding: "16px",
          textAlign: "center",
          border: "1px solid rgba(59, 130, 246, 0.2)"
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#3b82f6" }}>
            {stats.length}
          </div>
          <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Campaigns</div>
        </div>
        
        <div style={{
          background: "rgba(16, 185, 129, 0.1)",
          borderRadius: "10px",
          padding: "16px",
          textAlign: "center",
          border: "1px solid rgba(16, 185, 129, 0.2)"
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>
            {totalSent.toLocaleString()}
          </div>
          <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Sent</div>
        </div>

        <div style={{
          background: "rgba(34, 197, 94, 0.1)",
          borderRadius: "10px",
          padding: "16px",
          textAlign: "center",
          border: "1px solid rgba(34, 197, 94, 0.2)"
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#22c55e" }}>
            {deliveryRate.toFixed(1)}%
          </div>
          <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Delivered</div>
        </div>

        <div style={{
          background: "rgba(245, 158, 11, 0.1)",
          borderRadius: "10px",
          padding: "16px",
          textAlign: "center",
          border: "1px solid rgba(245, 158, 11, 0.2)"
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>
            {openRate.toFixed(1)}%
          </div>
          <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Open Rate</div>
        </div>

        <div style={{
          background: "rgba(139, 92, 246, 0.1)",
          borderRadius: "10px",
          padding: "16px",
          textAlign: "center",
          border: "1px solid rgba(139, 92, 246, 0.2)"
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#8b5cf6" }}>
            {clickRate.toFixed(1)}%
          </div>
          <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Click Rate</div>
        </div>

        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          borderRadius: "10px",
          padding: "16px",
          textAlign: "center",
          border: "1px solid rgba(239, 68, 68, 0.2)"
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#ef4444" }}>
            {bounceRate.toFixed(1)}%
          </div>
          <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Bounce Rate</div>
        </div>

        <div style={{
          background: "rgba(251, 146, 60, 0.1)",
          borderRadius: "10px",
          padding: "16px",
          textAlign: "center",
          border: "1px solid rgba(251, 146, 60, 0.2)"
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#fb923c" }}>
            {unsubscribeRate.toFixed(2)}%
          </div>
          <div style={{ color: "#cbd5e1", fontSize: "0.8rem" }}>Unsub Rate</div>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        borderRadius: "12px",
        padding: "24px",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <h3 style={{
          color: "#f1f5f9",
          fontSize: "1.2rem",
          fontWeight: "600",
          marginBottom: "20px"
        }}>
          📊 Campaign Performance Details
        </h3>
        
        <div style={{
          overflowX: "auto",
          maxHeight: "400px",
          overflowY: "auto"
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.85rem"
          }}>
            <thead>
              <tr style={{ background: "rgba(51, 65, 85, 0.8)" }}>
                <th style={{ padding: "10px 6px", textAlign: "left", color: "#f1f5f9", fontWeight: "600", fontSize: "0.8rem" }}>Campaign</th>
                <th style={{ padding: "10px 6px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.8rem" }}>Sent</th>
                <th style={{ padding: "10px 6px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.8rem" }}>Delivered</th>
                <th style={{ padding: "10px 6px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.8rem" }}>Opens</th>
                <th style={{ padding: "10px 6px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.8rem" }}>Clicks</th>
                <th style={{ padding: "10px 6px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.8rem" }}>Hard Bounce</th>
                <th style={{ padding: "10px 6px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.8rem" }}>Soft Bounce</th>
                <th style={{ padding: "10px 6px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.8rem" }}>Unsubs</th>
                <th style={{ padding: "10px 6px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.8rem" }}>Open %</th>
                <th style={{ padding: "10px 6px", textAlign: "center", color: "#f1f5f9", fontWeight: "600", fontSize: "0.8rem" }}>CTR %</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((email, index) => {
                const emailStats = email.stats || {};
                const sent = emailStats.sent || 0;
                const delivered = emailStats.delivered || 0;
                const opens = emailStats.opens || 0;
                const clicks = emailStats.clicks || 0;
                const hardBounces = emailStats.hardBounces || 0;
                const softBounces = emailStats.softBounces || 0;
                const unsubscribes = emailStats.unsubscribes || 0;
                const emailOpenRate = delivered > 0 ? (opens / delivered * 100) : 0;
                const emailClickRate = delivered > 0 ? (clicks / delivered * 100) : 0;

                return (
                  <tr key={index} style={{
                    background: index % 2 === 0 ? "rgba(30, 41, 59, 0.3)" : "rgba(51, 65, 85, 0.2)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                  }}>
                    <td style={{ 
                      padding: "10px 6px", 
                      color: "#e2e8f0",
                      maxWidth: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: "0.8rem"
                    }}>
                      {email.name || email.subject || 'Unknown Campaign'}
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "center", color: "#cbd5e1", fontSize: "0.8rem" }}>
                      {sent.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "center", color: "#cbd5e1", fontSize: "0.8rem" }}>
                      {delivered.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "center", color: "#cbd5e1", fontSize: "0.8rem" }}>
                      {opens.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 6px", textAlign: "center", color: "#cbd5e1", fontSize: "0.8rem" }}>
                      {clicks.toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: "10px 6px", 
                      textAlign: "center", 
                      color: hardBounces > 0 ? "#ef4444" : "#cbd5e1",
                      fontSize: "0.8rem",
                      fontWeight: hardBounces > 0 ? "600" : "normal"
                    }}>
                      {hardBounces.toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: "10px 6px", 
                      textAlign: "center", 
                      color: softBounces > 0 ? "#f59e0b" : "#cbd5e1",
                      fontSize: "0.8rem",
                      fontWeight: softBounces > 0 ? "600" : "normal"
                    }}>
                      {softBounces.toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: "10px 6px", 
                      textAlign: "center", 
                      color: unsubscribes > 0 ? "#fb923c" : "#cbd5e1",
                      fontSize: "0.8rem",
                      fontWeight: unsubscribes > 0 ? "600" : "normal"
                    }}>
                      {unsubscribes.toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: "10px 6px", 
                      textAlign: "center", 
                      color: emailOpenRate > 20 ? "#10b981" : emailOpenRate > 15 ? "#f59e0b" : "#ef4444",
                      fontWeight: "600",
                      fontSize: "0.8rem"
                    }}>
                      {emailOpenRate.toFixed(1)}%
                    </td>
                    <td style={{ 
                      padding: "10px 6px", 
                      textAlign: "center", 
                      color: emailClickRate > 3 ? "#10b981" : emailClickRate > 1.5 ? "#f59e0b" : "#ef4444",
                      fontWeight: "600",
                      fontSize: "0.8rem"
                    }}>
                      {emailClickRate.toFixed(1)}%
                    </td>
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