import React from 'react'

const Home = () => {
  const handleSalesforceLogin = () => {
    window.location.href = 'http://localhost:4001/login'
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>📊</div>
        
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '0.5rem'
        }}>
          Pardot Analytics
        </h1>
        
        <p style={{
          color: '#666',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Connect your Salesforce account to get started
        </p>
        
        <button
          onClick={handleSalesforceLogin}
          style={{
            background: '#0176d3',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#0056b3'}
          onMouseOut={(e) => e.target.style.background = '#0176d3'}
        >
          🔗 Login with Salesforce
        </button>
      </div>
    </div>
  )
}

export default Home