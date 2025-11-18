import React, { useState, useEffect } from 'react'

const EmailModule = () => {
  const [emailStats, setEmailStats] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchEmailStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:4001/get-email-stats', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setEmailStats(data)
      }
    } catch (error) {
      console.error('Error fetching email stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          📧 Email Campaigns
        </h2>
        
        <button
          onClick={fetchEmailStats}
          disabled={loading}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {loading ? 'Loading...' : 'Get Email Stats'}
        </button>
      </div>

      {emailStats && (
        <div style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Email Statistics</h3>
          <pre style={{ 
            background: '#1f2937',
            color: '#f9fafb',
            padding: '1rem',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '0.9rem'
          }}>
            {JSON.stringify(emailStats, null, 2)}
          </pre>
        </div>
      )}

      {!emailStats && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <p>Click "Get Email Stats" to load email campaign data</p>
        </div>
      )}
    </div>
  )
}

export default EmailModule