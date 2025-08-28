import React from "react";

// Add CSS animations
const styles = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6); }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default function Home() {
  const handleAuthClick = () => {
    window.location.href = "http://localhost:4000/login";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Floating background elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "10%",
        width: "120px",
        height: "120px",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        top: "60%",
        right: "15%",
        width: "80px",
        height: "80px",
        background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(244, 63, 94, 0.1))",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite reverse"
      }} />
      <div style={{
        position: "absolute",
        bottom: "20%",
        left: "20%",
        width: "60px",
        height: "60px",
        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))",
        borderRadius: "50%",
        animation: "float 7s ease-in-out infinite"
      }} />
      
      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        padding: "60px 50px",
        textAlign: "center",
        color: "#fff",
        maxWidth: "480px",
        width: "90%",
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
        animation: "fadeInUp 1s ease-out",
        position: "relative"
      }}>
        <div style={{
          fontSize: "4rem",
          marginBottom: "24px",
          animation: "pulse 3s ease-in-out infinite"
        }}>📊</div>
        
        <h1 style={{
          fontSize: "2.75rem",
          fontWeight: "800",
          marginBottom: "16px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "slideInLeft 0.8s ease-out"
        }}>Analytics Hub</h1>
        
        <p style={{
          fontSize: "1.125rem",
          marginBottom: "32px",
          color: "#cbd5e1",
          lineHeight: "1.7",
          animation: "slideInRight 0.8s ease-out"
        }}>
          Transform your Pardot marketing data into actionable insights with powerful analytics and seamless integrations
        </p>
        
        <button
          onClick={handleAuthClick}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none",
            padding: "16px 32px",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#fff",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)",
            animation: "glow 2s ease-in-out infinite",
            transform: "translateY(0)"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 15px 35px rgba(99, 102, 241, 0.4)";
            e.target.style.background = "linear-gradient(135deg, #7c3aed, #a855f7)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 10px 25px rgba(99, 102, 241, 0.3)";
            e.target.style.background = "linear-gradient(135deg, #6366f1, #8b5cf6)";
          }}
        >
          🚀 Connect to Salesforce
        </button>
        
        <div style={{
          marginTop: "24px",
          fontSize: "0.9rem",
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        }}>
          <span>🔒</span>
          <span>Secure OAuth2 Authentication</span>
        </div>
      </div>
    </div>
  );
}