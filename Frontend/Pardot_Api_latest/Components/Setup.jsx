import React, { useState } from "react";

export default function Setup() {
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
    businessUnitId: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Basic input sanitization
    const sanitizedValue = value.trim().replace(/[<>"'&]/g, '');
    setFormData({
      ...formData,
      [name]: sanitizedValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${apiUrl}/setup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest' // CSRF protection
        },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({
          client_id: formData.clientId,
          client_secret: formData.clientSecret,
          business_unit_id: formData.businessUnitId
        })
      });
      
      clearTimeout(timeoutId);

      const result = await response.json();

      if (response.ok) {
        setMessage('Setup successful! Redirecting to login...');
        setTimeout(() => {
          window.location.href = `${apiUrl}/login`;
        }, 2000);
      } else {
        // Don't expose detailed error messages
        setMessage('Setup failed. Please check your credentials and try again.');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessage('Request timeout. Please try again.');
      } else {
        setMessage('Connection failed. Please check your network and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "20px"
    }}>
      <div style={{
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        padding: "40px",
        color: "#fff",
        maxWidth: "500px",
        width: "100%",
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)"
      }}>
        <div style={{
          textAlign: "center",
          marginBottom: "30px"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔗</div>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: "700",
            marginBottom: "8px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Connect to Pardot</h1>
          <p style={{
            color: "#cbd5e1",
            fontSize: "0.9rem"
          }}>Enter your Salesforce Connected App credentials</p>
        </div>

        <div style={{
          background: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "24px",
          fontSize: "0.85rem",
          color: "#93c5fd"
        }}>
          <strong>Setup Instructions:</strong><br/>
          1. Create a Connected App in Salesforce<br/>
          2. Callback URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000'}/callback<br/>
          3. Scopes: pardot_api, full
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#e2e8f0"
            }}>Client ID:</label>
            <input
              type="text"
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              placeholder="Enter your Client ID"
              maxLength="100"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#e2e8f0"
            }}>Client Secret:</label>
            <input
              type="password"
              name="clientSecret"
              value={formData.clientSecret}
              onChange={handleInputChange}
              placeholder="Enter your Client Secret"
              maxLength="200"
              autoComplete="new-password"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#e2e8f0"
            }}>Business Unit ID:</label>
            <input
              type="text"
              name="businessUnitId"
              value={formData.businessUnitId}
              onChange={handleInputChange}
              placeholder="Enter your Business Unit ID"
              maxLength="50"
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontSize: "14px",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              background: isLoading ? "#6b7280" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              padding: "14px",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#fff",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease"
            }}
          >
            {isLoading ? "Connecting..." : "Connect to Pardot"}
          </button>

          {message && (
            <div style={{
              marginTop: "16px",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              background: message.includes('Error') || message.includes('failed') 
                ? "rgba(239, 68, 68, 0.1)" 
                : "rgba(34, 197, 94, 0.1)",
              color: message.includes('Error') || message.includes('failed') 
                ? "#fca5a5" 
                : "#86efac",
              border: `1px solid ${message.includes('Error') || message.includes('failed') 
                ? "rgba(239, 68, 68, 0.2)" 
                : "rgba(34, 197, 94, 0.2)"}`
            }}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}