import React from "react";

const selectStyle = {
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  outline: "none",
  fontSize: "1rem",
  fontWeight: "500",
  background: "rgba(51, 65, 85, 0.8)",
  color: "#f1f5f9",
  transition: "all 0.3s ease",
  cursor: "pointer"
};

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  outline: "none",
  fontSize: "1rem",
  fontWeight: "500",
  background: "rgba(51, 65, 85, 0.8)",
  color: "#f1f5f9",
  transition: "all 0.3s ease"
};

export default function CustomDateFilter({ 
  filterType, 
  setFilterType, 
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate 
}) {
  const handleFilterTypeChange = (e) => {
    const newFilterType = e.target.value;
    setFilterType(newFilterType);
    
    // Clear custom dates when switching away from custom
    if (newFilterType !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.6)",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "24px",
      border: "1px solid rgba(255, 255, 255, 0.05)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap"
      }}>
        {/* Filter Type Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <label style={{ 
            fontSize: "0.9rem", 
            fontWeight: "600", 
            color: "#cbd5e1",
            whiteSpace: "nowrap"
          }}>
            📅 Date Filter:
          </label>
          <select
            value={filterType}
            onChange={handleFilterTypeChange}
            style={{...selectStyle, minWidth: "180px"}}
          >
            <option value="">Select Filter</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {/* Custom Date Range - Only show when custom is selected */}
        {filterType === "custom" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ 
                fontSize: "0.85rem", 
                fontWeight: "500", 
                color: "#cbd5e1",
                whiteSpace: "nowrap"
              }}>
                From:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{...inputStyle, width: "140px"}}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ 
                fontSize: "0.85rem", 
                fontWeight: "500", 
                color: "#cbd5e1",
                whiteSpace: "nowrap"
              }}>
                To:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{...inputStyle, width: "140px"}}
              />
            </div>
          </>
        )}

        {/* Instruction Message */}
        <div style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "8px",
          padding: "8px 12px",
          color: "#6ee7b7",
          fontSize: "0.8rem",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          💡 Select a date range and click "Get Email Stats" to fetch results
        </div>
      </div>
    </div>
  );
}