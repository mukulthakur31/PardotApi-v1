import React from "react";

export default function StatusCards({ token, googleAuth }) {
  return (
    <div style={{
      display: "flex",
      gap: "24px",
      justifyContent: "center",
      marginBottom: "48px",
      flexWrap: "wrap"
    }}>
      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        padding: "24px 32px",
        color: "#fff",
        minWidth: "220px",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        animation: "slideInLeft 0.8s ease-out"
      }}>
        <div style={{ 
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: token ? "#22c55e" : "#ef4444",
          marginBottom: "16px"
        }}></div>
        <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "1.1rem" }}>Pardot Status</div>
        <div style={{ 
          color: token ? "#22c55e" : "#ef4444",
          fontWeight: "600",
          fontSize: "1rem"
        }}>
          {token ? "Connected" : "Disconnected"}
        </div>
      </div>
      
      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "16px",
        padding: "24px 32px",
        color: "#fff",
        minWidth: "220px",
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        animation: "slideInRight 0.8s ease-out"
      }}>
        <div style={{ 
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: googleAuth ? "#22c55e" : "#ef4444",
          marginBottom: "16px"
        }}></div>
        <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "1.1rem" }}>Google Workspace</div>
        <div style={{ 
          color: googleAuth ? "#22c55e" : "#ef4444",
          fontWeight: "600",
          fontSize: "1rem"
        }}>
          {googleAuth ? "Connected" : "Disconnected"}
        </div>
      </div>
    </div>
  );
}