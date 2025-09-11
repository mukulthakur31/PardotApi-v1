import React from "react";

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  outline: "none",
  width: "120px",
  textAlign: "center",
  fontSize: "1rem",
  fontWeight: "500",
  background: "rgba(51, 65, 85, 0.8)",
  color: "#f1f5f9",
  transition: "all 0.3s ease"
};

export default function DateFilters({ day, month, year, setDay, setMonth, setYear }) {
  return (
    <div style={{
      background: "rgba(30, 41, 59, 0.6)",
      borderRadius: "16px",
      padding: "32px",
      marginBottom: "32px",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      animation: "slideUp 0.6s ease-out"
    }}>
      <h3 style={{
        textAlign: "center",
        marginBottom: "24px",
        fontSize: "1.4rem",
        fontWeight: "700",
        color: "#f1f5f9"
      }}>Date Filters</h3>
      
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "24px",
        flexWrap: "wrap"
      }}>
        <div style={{ textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "1rem", fontWeight: "600", color: "#cbd5e1" }}>Day</label>
          <input
            type="number"
            placeholder="DD"
            min="1"
            max="31"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "1rem", fontWeight: "600", color: "#cbd5e1" }}>Month</label>
          <input
            type="number"
            placeholder="MM"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "1rem", fontWeight: "600", color: "#cbd5e1" }}>Year</label>
          <input
            type="number"
            placeholder="YYYY"
            min="2000"
            max="2100"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}