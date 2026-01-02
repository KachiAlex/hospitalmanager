import { useState, useEffect } from 'react';
import { useDashboardStats } from './hooks/useApi';

const StaffDashboard = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // API data hooks
  const { data: dashboardStats } = useDashboardStats();

  // Enhanced responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isSidebarOpen && !event.target.closest('.staff-sidebar') && !event.target.closest('.mobile-menu-toggle')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  // Role-specific navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { id: 'overview', label: 'Dashboard', icon: '📊' },
      { id: 'schedule', label: 'My Schedule', icon: '📅' },
      { id: 'profile', label: 'My Profile', icon: '👤' }
    ];

    switch (currentUser.role) {
      case 'doctor':
        return [
          ...baseItems.slice(0, 2),
          { id: 'patients', label: 'My Patients', icon: '👥' },
          { id: 'appointments', label: 'Appointments', icon: '🩺' },
          { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
          ...baseItems.slice(2)
        ];
      case 'nurse':
        return [
          ...baseItems.slice(0, 2),
          { id: 'patients', label: 'Patient Care', icon: '👥' },
          { id: 'medications', label: 'Medications', icon: '💉' },
          { id: 'vitals', label: 'Vital Signs', icon: '📈' },
          ...baseItems.slice(2)
        ];
      case 'receptionist':
        return [
          ...baseItems.slice(0, 2),
          { id: 'appointments', label: 'Appointments', icon: '📋' },
          { id: 'patients', label: 'Patient Check-in', icon: '✅' },
          { id: 'billing', label: 'Billing', icon: '💳' },
          ...baseItems.slice(2)
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  // Role-specific stats
  const getRoleStats = () => {
    const baseStats = dashboardStats || {};
    
    switch (currentUser.role) {
      case 'doctor':
        return [
          { title: 'Today\'s Patients', value: Math.floor((baseStats.todayAppointments || 0) * 0.6).toString(), icon: '👥', color: '#3b82f6' },
          { title: 'Appointments', value: (baseStats.todayAppointments || 0).toString(), icon: '📅', color: '#10b981' },
          { title: 'Available Beds', value: (baseStats.availableBeds || 0).toString(), icon: '🏥', color: '#f59e0b' },
          { title: 'Total Patients', value: Math.floor((baseStats.totalPatients || 0) / 10).toString(), icon: '🩺', color: '#8b5cf6' }
        ];
      case 'nurse':
        return [
          { title: 'Assigned Patients', value: Math.floor((baseStats.totalPatients || 0) * 0.15).toString(), icon: '👥', color: '#3b82f6' },
          { title: 'Medications Due', value: Math.floor(Math.random() * 10 + 3).toString(), icon: '💊', color: '#ef4444' },
          { title: 'Vitals Recorded', value: Math.floor((baseStats.todayAppointments || 0) * 1.5).toString(), icon: '📈', color: '#10b981' },
          { title: 'Shift Hours', value: '8', icon: '⏰', color: '#8b5cf6' }
        ];
      case 'receptionist':
        return [
          { title: 'Check-ins Today', value: Math.floor((baseStats.todayAppointments || 0) * 1.2).toString(), icon: '✅', color: '#3b82f6' },
          { title: 'Appointments', value: (baseStats.todayAppointments || 0).toString(), icon: '📋', color: '#10b981' },
          { title: 'Calls Handled', value: Math.floor(Math.random() * 30 + 40).toString(), icon: '📞', color: '#f59e0b' },
          { title: 'Billing Processed', value: Math.floor((baseStats.todayAppointments || 0) * 0.8).toString(), icon: '💳', color: '#8b5cf6' }
        ];
      default:
        return [
          { title: 'Active Tasks', value: '5', icon: '📋', color: '#3b82f6' },
          { title: 'Completed Today', value: '12', icon: '✅', color: '#10b981' },
          { title: 'Pending Items', value: '3', icon: '⏳', color: '#f59e0b' },
          { title: 'Total Progress', value: '85%', icon: '📊', color: '#8b5cf6' }
        ];
    }
  };

  const stats = getRoleStats();

  return (
    <div className="staff-dashboard" style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'Inter', 'Roboto', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #4338ca, #6366f1)',
        color: 'white',
        padding: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                display: isMobile ? 'flex' : 'none',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
                minWidth: '44px',
                transition: 'all 0.2s ease'
              }}
              className="mobile-menu-toggle"
            >
              {isSidebarOpen ? '✕' : '☰'}
            </button>
            
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.75rem',
              borderRadius: '12px',
              fontSize: '1.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              {currentUser.role === 'doctor' ? '👨‍⚕️' : 
               currentUser.role === 'nurse' ? '👩‍⚕️' : 
               currentUser.role === 'receptionist' ? '👩‍💼' : '👤'}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                {currentUser.role === 'doctor' ? 'Doctor Portal' :
                 currentUser.role === 'nurse' ? 'Nurse Portal' :
                 currentUser.role === 'receptionist' ? 'Reception Portal' : 'Staff Portal'}
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>T-Happy Home Hospital</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }} className="user-info-desktop">
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{currentUser.title}</div>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              <span>🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', position: 'relative', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 199,
              display: 'none'
            }}
            className="mobile-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <nav style={{
          width: isMobile ? (isSidebarOpen ? '280px' : '0') : '280px',
          background: 'white',
          minHeight: 'calc(100vh - 80px)',
          boxShadow: isMobile ? (isSidebarOpen ? '4px 0 15px rgba(0,0,0,0.15)' : 'none') : '2px 0 8px rgba(0,0,0,0.08)',
          padding: isSidebarOpen || !isMobile ? '1rem 0' : '0',
          position: isMobile ? 'fixed' : 'sticky',
          top: isMobile ? '0' : '80px',
          left: isMobile ? (isSidebarOpen ? '0' : '-280px') : 'auto',
          height: isMobile ? '100vh' : 'auto',
          paddingTop: isMobile ? '6rem' : '1rem',
          transform: 'none',
          transition: isMobile ? 'left 0.3s ease, width 0.3s ease' : 'none',
          zIndex: 200,
          overflow: 'hidden',
          borderRight: isMobile ? 'none' : '1px solid #e5e7eb'
        }}
        className="staff-sidebar">
          {(isSidebarOpen || !isMobile) && (
            <>
              <div style={{ 
                padding: '0 1.5rem 1rem 1.5rem', 
                borderBottom: '1px solid #e5e7eb', 
                marginBottom: '1rem',
                display: isMobile ? 'block' : 'none'
              }}>
                <div style={{ fontWeight: '700', color: '#1f2937', fontSize: '1rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>{currentUser.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{currentUser.department}</div>
              </div>
              
              {navigationItems.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    border: 'none',
                    background: activeTab === tab.id ? 'linear-gradient(135deg, #4338ca, #6366f1)' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#6b7280',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s ease',
                    minHeight: '48px',
                    borderRadius: activeTab === tab.id ? '0 25px 25px 0' : '0',
                    marginRight: activeTab === tab.id ? '0.5rem' : '0',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = 'linear-gradient(135deg, #f8fafc, #f1f5f9)';
                      e.target.style.color = '#374151';
                      e.target.style.transform = 'translateX(8px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(67, 56, 202, 0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#6b7280';
                      e.target.style.transform = 'translateX(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  <span style={{ 
                    fontSize: '1.2rem',
                    transition: 'transform 0.2s ease',
                    transform: activeTab === tab.id ? 'scale(1.1)' : 'scale(1)'
                  }}>{tab.icon}</span>
                  <span className="nav-label">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div style={{
                      position: 'absolute',
                      right: '1rem',
                      width: '4px',
                      height: '20px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '2px'
                    }} />
                  )}
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          padding: isMobile ? '0.75rem' : '1rem',
          minHeight: 'calc(100vh - 80px)',
          overflow: 'auto',
          marginLeft: isMobile ? '0' : '0',
          width: isMobile ? '100%' : 'auto'
        }}>
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  color: '#2d3748', 
                  margin: 0, 
                  fontSize: isMobile ? '1.5rem' : '1.8rem', 
                  fontWeight: '700' 
                }}>Welcome, {currentUser.name.split(' ')[1]}</h2>
                <p style={{ 
                  color: '#64748b', 
                  margin: '0.5rem 0 0 0', 
                  fontSize: isMobile ? '0.85rem' : '0.9rem' 
                }}>{currentUser.title} - {currentUser.department}</p>
                {dashboardStats?.isOffline && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#92400e'
                  }}>
                    <span>⚠️</span>
                    <span>Using offline data - Server connection unavailable</span>
                  </div>
                )}
              </div>
              
              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: isMobile ? '1rem' : '1.5rem',
                marginBottom: '2rem'
              }}>
                {stats.map((stat, index) => (
                  <div key={index} style={{
                    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                    padding: isMobile ? '1.5rem' : '2rem',
                    borderRadius: '20px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = stat.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                  >
                    {/* Background Pattern */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: `linear-gradient(135deg, ${stat.color}08, ${stat.color}15)`,
                      borderRadius: '50%',
                      transform: 'translate(30px, -30px)',
                      opacity: 0.6
                    }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ 
                          color: '#6b7280', 
                          fontSize: isMobile ? '0.85rem' : '0.9rem', 
                          margin: '0 0 0.75rem 0',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>{stat.title}</p>
                        <p style={{ 
                          fontSize: isMobile ? '2rem' : '2.25rem', 
                          fontWeight: '800', 
                          color: '#1f2937', 
                          margin: '0 0 0.5rem 0',
                          background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>{stat.value}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#10b981',
                            animation: 'pulse 2s infinite'
                          }} />
                          <p style={{ 
                            fontSize: '0.8rem', 
                            color: '#059669',
                            margin: 0,
                            fontWeight: '600'
                          }}>
                            Active today
                          </p>
                        </div>
                      </div>
                      <div style={{
                        background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}30)`,
                        color: stat.color,
                        padding: isMobile ? '1rem' : '1.25rem',
                        borderRadius: '16px',
                        fontSize: isMobile ? '1.5rem' : '1.75rem',
                        boxShadow: `0 4px 12px ${stat.color}25`,
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'rotate(10deg) scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
                      }}
                      >
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ color: '#1f2937', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: '700' }}>Quick Actions</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: '1.5rem' 
                }}>
                  {currentUser.role === 'doctor' && (
                    <>
                      <button style={{
                        background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                        border: 'none',
                        color: 'white',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        minHeight: '60px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 6px rgba(67, 56, 202, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px) scale(1.02)';
                        e.target.style.boxShadow = '0 12px 30px rgba(67, 56, 202, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 6px rgba(67, 56, 202, 0.2)';
                      }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), transparent)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease'
                        }} />
                        📋 View Patient Records
                      </button>
                      <button style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: 'white',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        minHeight: '60px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px) scale(1.02)';
                        e.target.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.2)';
                      }}
                      >
                        💊 Write Prescription
                      </button>
                    </>
                  )}
                  {currentUser.role === 'nurse' && (
                    <>
                      <button style={{
                        background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                        border: 'none',
                        color: 'white',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        minHeight: '60px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 6px rgba(67, 56, 202, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px) scale(1.02)';
                        e.target.style.boxShadow = '0 12px 30px rgba(67, 56, 202, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 6px rgba(67, 56, 202, 0.2)';
                      }}
                      >
                        📈 Record Vitals
                      </button>
                      <button style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: 'white',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        minHeight: '60px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px) scale(1.02)';
                        e.target.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.2)';
                      }}
                      >
                        💉 Administer Medication
                      </button>
                    </>
                  )}
                  {currentUser.role === 'receptionist' && (
                    <>
                      <button style={{
                        background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                        border: 'none',
                        color: 'white',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        minHeight: '60px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 6px rgba(67, 56, 202, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px) scale(1.02)';
                        e.target.style.boxShadow = '0 12px 30px rgba(67, 56, 202, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 6px rgba(67, 56, 202, 0.2)';
                      }}
                      >
                        ✅ Patient Check-in
                      </button>
                      <button style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: 'white',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        minHeight: '60px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px) scale(1.02)';
                        e.target.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 6px rgba(16, 185, 129, 0.2)';
                      }}
                      >
                        📅 Schedule Appointment
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Recent Activities */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                marginTop: '2rem'
              }}>
                <h3 style={{ color: '#1f2937', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: '700' }}>Recent Activities</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { id: 1, type: 'task', message: `${currentUser.role === 'doctor' ? 'Patient consultation completed' : currentUser.role === 'nurse' ? 'Medication administered to patient' : 'Patient check-in processed'}`, time: '5 mins ago', icon: currentUser.role === 'doctor' ? '🩺' : currentUser.role === 'nurse' ? '💊' : '✅' },
                    { id: 2, type: 'update', message: `${currentUser.role === 'doctor' ? 'Medical records updated' : currentUser.role === 'nurse' ? 'Vital signs recorded' : 'Appointment scheduled'}`, time: '15 mins ago', icon: currentUser.role === 'doctor' ? '📋' : currentUser.role === 'nurse' ? '📈' : '📅' },
                    { id: 3, type: 'notification', message: `${currentUser.role === 'doctor' ? 'Lab results received' : currentUser.role === 'nurse' ? 'Shift handover completed' : 'Payment processed'}`, time: '1 hour ago', icon: currentUser.role === 'doctor' ? '🔬' : currentUser.role === 'nurse' ? '👥' : '💳' }
                  ].map(activity => (
                    <div key={activity.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.25rem',
                      background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9, #f8fafc)';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.transform = 'translateX(8px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc, #ffffff)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{
                        background: 'linear-gradient(135deg, #4338ca15, #6366f125)',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{activity.icon}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, color: '#1f2937', fontSize: '0.9rem', fontWeight: '600' }}>{activity.message}</p>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem', marginTop: '0.25rem' }}>{activity.time}</p>
                      </div>
                      <div style={{
                        width: '4px',
                        height: '30px',
                        background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                        borderRadius: '2px',
                        opacity: 0.6
                      }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs show placeholder content */}
          {activeTab !== 'overview' && (
            <div style={{
              background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
              borderRadius: '20px',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(67, 56, 202, 0.03), rgba(99, 102, 241, 0.03))',
                opacity: 0.5
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1.5rem',
                  background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>🚧</div>
                <h3 style={{ 
                  color: '#1f2937', 
                  marginBottom: '1rem', 
                  fontSize: '1.5rem', 
                  fontWeight: '700' 
                }}>Coming Soon</h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '1rem', 
                  lineHeight: '1.6', 
                  maxWidth: '400px', 
                  margin: '0 auto 2rem auto' 
                }}>
                  The {navigationItems.find(item => item.id === activeTab)?.label} section is under development and will be available soon.
                </p>
                <div style={{ marginTop: '2rem' }}>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    style={{
                      background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                      border: 'none',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(67, 56, 202, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(67, 56, 202, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(67, 56, 202, 0.3)';
                    }}
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;