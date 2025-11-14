import React from "react";
import './Home.css';

export default function Home() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:4001/login';
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="logo-section">
          <svg className="salesforce-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.006 5.413a4.795 4.795 0 013.53-1.547c1.456 0 2.762.65 3.652 1.68a5.81 5.81 0 013.653-.65 5.814 5.814 0 015.814 5.814c0 .34-.03.67-.088.99a4.465 4.465 0 012.433 3.982c0 2.468-2.002 4.47-4.47 4.47H8.47A4.47 4.47 0 014 15.682c0-1.694.942-3.17 2.334-3.935a5.127 5.127 0 01-.334-1.827c0-2.844 2.307-5.15 5.15-5.15.428 0 .844.052 1.238.15z"/>
          </svg>
          <h1 className="app-title">Pardot Analytics</h1>
        </div>
        
        <p className="app-description">
          Connect your Salesforce Pardot account to access comprehensive analytics, 
          insights, and reporting tools for your marketing campaigns.
        </p>

        <button onClick={handleLogin} className="login-button">
          <svg className="button-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.006 5.413a4.795 4.795 0 013.53-1.547c1.456 0 2.762.65 3.652 1.68a5.81 5.81 0 013.653-.65 5.814 5.814 0 015.814 5.814c0 .34-.03.67-.088.99a4.465 4.465 0 012.433 3.982c0 2.468-2.002 4.47-4.47 4.47H8.47A4.47 4.47 0 014 15.682c0-1.694.942-3.17 2.334-3.935a5.127 5.127 0 01-.334-1.827c0-2.844 2.307-5.15 5.15-5.15.428 0 .844.052 1.238.15z"/>
          </svg>
          Login with Salesforce
        </button>

        <div className="features">
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Email Analytics</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📝</span>
            <span>Form Insights</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <span>Prospect Health</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <span>Campaign Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
}