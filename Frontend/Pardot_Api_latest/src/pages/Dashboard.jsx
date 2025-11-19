import React, { useState, useEffect } from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'

const Dashboard = () => {
  const [pardotConnected, setPardotConnected] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get active module from URL
  const activeModule = location.pathname.split('/')[2] || 'emails'

  useEffect(() => {
    // Check authentication on load
    checkAuth()
    checkGoogleAuthStatus()
    
    // Check for Google auth callback
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('google_auth') === 'success') {
      setGoogleConnected(true)
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:4001/check-auth', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        navigate('/')
        return
      }
      
      setPardotConnected(true)
    } catch (error) {
      navigate('/')
    }
  }

  const checkGoogleAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:4001/google-auth-status', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setGoogleConnected(data.authenticated)
      }
    } catch (error) {
      console.error('Error checking Google auth:', error)
    }
  }

  const handleGoogleConnect = async () => {
    if (googleConnected) {
      // Disconnect Google
      try {
        const response = await fetch('http://localhost:4001/google-disconnect', {
          method: 'POST',
          credentials: 'include'
        })
        
        if (response.ok) {
          setGoogleConnected(false)
        }
      } catch (error) {
        console.error('Error disconnecting Google:', error)
      }
    } else {
      // Connect to Google
      try {
        const response = await fetch('http://localhost:4001/google-auth', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          // Redirect to Google auth URL in same tab
          window.location.href = data.auth_url
        }
      } catch (error) {
        console.error('Error connecting to Google:', error)
      }
    }
  }

  const modules = [
    { id: 'emails', name: '📧 Email Campaigns', path: '/dashboard/emails' },
    { id: 'forms', name: '📝 Forms Analysis', path: '/dashboard/forms' },
    { id: 'prospects', name: '👥 Prospect Health', path: '/dashboard/prospects' },
    { id: 'landing-pages', name: '🚀 Landing Pages', path: '/dashboard/landing-pages' },
    { id: 'engagement', name: '🎯 Engagement', path: '/dashboard/engagement' },
    { id: 'utm', name: '📊 UTM Analysis', path: '/dashboard/utm' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ fontSize: '2rem' }}>📊</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
            Pardot Analytics
          </h1>
        </div>

        {/* Connection Status & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Pardot Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            background: pardotConnected ? '#dcfce7' : '#fee2e2',
            color: pardotConnected ? '#166534' : '#dc2626',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: pardotConnected ? '#22c55e' : '#ef4444'
            }}></div>
            Pardot
          </div>

          {/* Google Connect/Disconnect Button */}
          <button
            onClick={handleGoogleConnect}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: googleConnected ? '#22c55e' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: googleConnected ? '#dcfce7' : '#ffffff'
            }}></div>
            {googleConnected ? 'Disconnect Google' : 'Connect Google'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{
          width: '280px',
          background: 'white',
          minHeight: 'calc(100vh - 80px)',
          padding: '2rem 1rem',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Modules
          </h3>

          <nav>
            {modules.map(module => (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  margin: '0.5rem 0',
                  border: 'none',
                  borderRadius: '10px',
                  background: activeModule === module.id ? '#3b82f6' : '#f8fafc',
                  color: activeModule === module.id ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (activeModule !== module.id) {
                    e.target.style.background = '#e5e7eb'
                  }
                }}
                onMouseOut={(e) => {
                  if (activeModule !== module.id) {
                    e.target.style.background = '#f8fafc'
                  }
                }}
              >
                {module.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '2rem',
          background: '#f8fafc'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Dashboard