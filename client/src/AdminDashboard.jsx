import { useState, useEffect } from 'react';
import { useDashboardStats, usePatients, useDoctors } from './hooks/useApi';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import EmptyState from './components/common/EmptyState';

const AdminDashboard = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // API data hooks
  const { data: dashboardStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: patients, loading: patientsLoading, error: patientsError, refetch: refetchPatients } = usePatients();
  const { data: doctors, loading: doctorsLoading, error: doctorsError, refetch: refetchDoctors } = useDoctors();

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
      if (isMobile && isSidebarOpen && !event.target.closest('.admin-sidebar') && !event.target.closest('.mobile-menu-toggle')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  // Transform API data for display
  const stats = dashboardStats || {
    totalPatients: 0,
    todayAppointments: 0,
    totalStaff: 0,
    availableBeds: 0,
    revenue: 0,
    emergencyCases: 0
  };

  const [recentActivities] = useState([
    { id: 1, type: 'appointment', message: 'New appointment scheduled - Dr. Smith', time: '2 mins ago', icon: '📅' },
    { id: 2, type: 'emergency', message: 'Emergency case admitted - Room 204', time: '15 mins ago', icon: '🚨' },
    { id: 3, type: 'discharge', message: 'Patient discharged - John Doe', time: '1 hour ago', icon: '✅' },
    { id: 4, type: 'staff', message: 'New nurse registered - Mary Wilson', time: '2 hours ago', icon: '👩‍⚕️' },
    { id: 5, type: 'maintenance', message: 'Equipment maintenance completed - MRI', time: '3 hours ago', icon: '🔧' }
  ]);

  // Transform patients data for display
  const displayPatients = patients ? patients.slice(0, 5).map(patient => ({
    id: patient.id,
    name: `${patient.firstName} ${patient.lastName}`,
    age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
    condition: 'General Checkup', // Placeholder - would come from latest encounter
    doctor: 'Dr. Johnson', // Placeholder - would come from latest encounter
    room: `${100 + patient.id}`, // Placeholder - would come from admission data
    status: 'Stable' // Placeholder - would come from latest encounter
  })) : [];

  // Transform doctors data for staff display
  const displayStaff = doctors ? doctors.slice(0, 5).map(doctor => ({
    id: doctor.id,
    name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
    role: doctor.specialty || 'General Practitioner',
    department: doctor.specialty || 'General Medicine',
    status: 'On Duty', // Placeholder - would come from schedule data
    shift: 'Morning' // Placeholder - would come from schedule data
  })) : [];

  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: '📊' },
    { id: 'patients', label: 'Patient Management', icon: '👥' },
    { id: 'staff', label: 'Staff Management', icon: '👨‍⚕️' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  // Handle refresh for different sections
  const handleRefresh = () => {
    if (activeTab === 'overview') {
      refetchStats();
    } else if (activeTab === 'patients') {
      refetchPatients();
    } else if (activeTab === 'staff') {
      refetchDoctors();
    }
  };

  return (
    <div className="admin-dashboard" style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'Inter', 'Roboto', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
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
              🏥
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>T-Happy Admin Dashboard</h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Hospital Management System</p>
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
        className="admin-sidebar">
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
              </div>
              
              {navigationItems.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.5rem',
                    border: 'none',
                    background: activeTab === tab.id ? 'linear-gradient(135deg, #1e40af, #3b82f6)' : 'transparent',
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
                      e.target.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.15)';
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ 
                      color: '#2d3748', 
                      margin: 0, 
                      fontSize: isMobile ? '1.5rem' : '1.8rem', 
                      fontWeight: '700' 
                    }}>Dashboard Overview</h2>
                    <p style={{ 
                      color: '#64748b', 
                      margin: '0.5rem 0 0 0', 
                      fontSize: isMobile ? '0.85rem' : '0.9rem' 
                    }}>Welcome back, {currentUser.name}</p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    style={{
                      background: 'linear-gradient(135deg, #00d4aa, #00b4d8)',
                      border: 'none',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease'
                    }}
                    disabled={statsLoading}
                  >
                    <span>🔄</span>
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Error State */}
              {statsError && (
                <ErrorMessage 
                  error={statsError}
                  onRetry={refetchStats}
                  title="Failed to load dashboard data"
                />
              )}

              {/* Loading State */}
              {statsLoading && (
                <LoadingSpinner 
                  size="large"
                  text="Loading dashboard statistics..."
                />
              )}

              {/* Stats Grid */}
              {!statsLoading && !statsError && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: isMobile ? '1rem' : '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {[
                    { title: 'Total Patients', value: stats.totalPatients?.toLocaleString() || '0', icon: '👥', color: '#1e40af', change: '+12%' },
                    { title: 'Today\'s Appointments', value: stats.todayAppointments || '0', icon: '📅', color: '#059669', change: '+8%' },
                    { title: 'Total Staff', value: stats.totalDoctors || '0', icon: '👨‍⚕️', color: '#7c3aed', change: '+3%' },
                    { title: 'Available Beds', value: stats.availableBeds || '0', icon: '🛏️', color: '#dc2626', change: '-5%' },
                    { title: 'Monthly Revenue', value: `₦${((stats.revenue || 0) / 1000000).toFixed(1)}M`, icon: '💰', color: '#0891b2', change: '+15%' },
                    { title: 'Emergency Cases', value: stats.emergencyCases || '0', icon: '🚨', color: '#ea580c', change: '+2%' }
                  ].map((stat, index) => (
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
                              background: stat.change.startsWith('+') ? '#10b981' : '#ef4444',
                              animation: 'pulse 2s infinite'
                            }} />
                            <p style={{ 
                              fontSize: '0.8rem', 
                              color: stat.change.startsWith('+') ? '#059669' : '#dc2626',
                              margin: 0,
                              fontWeight: '600'
                            }}>
                              {stat.change} from last month
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
              )}

              {/* Recent Activities */}
              {!statsLoading && !statsError && (
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  border: '1px solid #e5e7eb'
                }}>
                  <h3 style={{ color: '#1f2937', marginBottom: '1.5rem', fontSize: '1.3rem', fontWeight: '700' }}>Recent Activities</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recentActivities.map(activity => (
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
                          background: 'linear-gradient(135deg, #1e40af15, #3b82f625)',
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
                          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                          borderRadius: '2px',
                          opacity: 0.6
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'patients' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <h2 style={{ 
                  color: '#2d3748', 
                  fontSize: isMobile ? '1.5rem' : '1.8rem', 
                  margin: 0 
                }}>Patient Management</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    onClick={refetchPatients}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      border: 'none',
                      color: 'white',
                      padding: isMobile ? '0.6rem 1rem' : '0.75rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: isMobile ? '0.8rem' : '0.85rem',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    disabled={patientsLoading}
                  >
                    <span>🔄</span>
                    <span>Refresh</span>
                  </button>
                  <button style={{
                    background: 'linear-gradient(135deg, #00d4aa, #00b4d8)',
                    border: 'none',
                    color: 'white',
                    padding: isMobile ? '0.6rem 1.2rem' : '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '0.85rem' : '0.9rem',
                    minHeight: '44px'
                  }}>
                    + Add New Patient
                  </button>
                </div>
              </div>

              {/* Error State */}
              {patientsError && (
                <ErrorMessage 
                  error={patientsError}
                  onRetry={refetchPatients}
                  title="Failed to load patients data"
                />
              )}

              {/* Loading State */}
              {patientsLoading && (
                <LoadingSpinner 
                  size="large"
                  text="Loading patients..."
                />
              )}

              {/* Empty State */}
              {!patientsLoading && !patientsError && displayPatients.length === 0 && (
                <EmptyState 
                  title="No patients found"
                  description="There are no patients registered in the system yet."
                  icon="👥"
                  actionText="Add First Patient"
                  onAction={() => console.log('Add patient clicked')}
                />
              )}

              {/* Patients Table */}
              {!patientsLoading && !patientsError && displayPatients.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse', 
                      minWidth: isMobile ? '500px' : '600px' 
                    }}>
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          <th style={{ 
                            padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                            textAlign: 'left', 
                            color: '#374151', 
                            fontWeight: '600', 
                            fontSize: isMobile ? '0.8rem' : '0.85rem' 
                          }}>Patient Name</th>
                          <th style={{ 
                            padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                            textAlign: 'left', 
                            color: '#374151', 
                            fontWeight: '600', 
                            fontSize: isMobile ? '0.8rem' : '0.85rem' 
                          }}>Age</th>
                          <th style={{ 
                            padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                            textAlign: 'left', 
                            color: '#374151', 
                            fontWeight: '600', 
                            fontSize: isMobile ? '0.8rem' : '0.85rem' 
                          }}>Gender</th>
                          <th style={{ 
                            padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                            textAlign: 'left', 
                            color: '#374151', 
                            fontWeight: '600', 
                            fontSize: isMobile ? '0.8rem' : '0.85rem' 
                          }}>Contact</th>
                          <th style={{ 
                            padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                            textAlign: 'left', 
                            color: '#374151', 
                            fontWeight: '600', 
                            fontSize: isMobile ? '0.8rem' : '0.85rem' 
                          }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayPatients.map(patient => (
                          <tr key={patient.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ 
                              padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                              color: '#2d3748', 
                              fontSize: isMobile ? '0.8rem' : '0.9rem',
                              fontWeight: '500'
                            }}>{patient.name}</td>
                            <td style={{ 
                              padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                              color: '#64748b', 
                              fontSize: isMobile ? '0.8rem' : '0.9rem' 
                            }}>{patient.age}</td>
                            <td style={{ 
                              padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                              color: '#64748b', 
                              fontSize: isMobile ? '0.8rem' : '0.9rem' 
                            }}>{patients.find(p => p.id === patient.id)?.gender || 'N/A'}</td>
                            <td style={{ 
                              padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                              color: '#64748b', 
                              fontSize: isMobile ? '0.8rem' : '0.9rem' 
                            }}>{patients.find(p => p.id === patient.id)?.contactInfo || 'N/A'}</td>
                            <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: isMobile ? '0.7rem' : '0.75rem',
                                fontWeight: '600',
                                background: '#dcfce7',
                                color: '#16a34a'
                              }}>
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {patients && patients.length > 5 && (
                    <div style={{
                      padding: '1rem',
                      textAlign: 'center',
                      borderTop: '1px solid #e2e8f0',
                      background: '#f8fafc'
                    }}>
                      <p style={{ 
                        margin: 0, 
                        color: '#6b7280', 
                        fontSize: '0.85rem' 
                      }}>
                        Showing 5 of {patients.length} patients
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'staff' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <h2 style={{ 
                  color: '#2d3748', 
                  fontSize: isMobile ? '1.5rem' : '1.8rem', 
                  margin: 0 
                }}>Staff Management</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    onClick={refetchDoctors}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      border: 'none',
                      color: 'white',
                      padding: isMobile ? '0.6rem 1rem' : '0.75rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: isMobile ? '0.8rem' : '0.85rem',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    disabled={doctorsLoading}
                  >
                    <span>🔄</span>
                    <span>Refresh</span>
                  </button>
                  <button style={{
                    background: 'linear-gradient(135deg, #00d4aa, #00b4d8)',
                    border: 'none',
                    color: 'white',
                    padding: isMobile ? '0.6rem 1.2rem' : '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: isMobile ? '0.85rem' : '0.9rem',
                    minHeight: '44px'
                  }}>
                    + Add New Staff
                  </button>
                </div>
              </div>

              {/* Error State */}
              {doctorsError && (
                <ErrorMessage 
                  error={doctorsError}
                  onRetry={refetchDoctors}
                  title="Failed to load staff data"
                />
              )}

              {/* Loading State */}
              {doctorsLoading && (
                <LoadingSpinner 
                  size="large"
                  text="Loading staff..."
                />
              )}

              {/* Empty State */}
              {!doctorsLoading && !doctorsError && displayStaff.length === 0 && (
                <EmptyState 
                  title="No staff found"
                  description="There are no staff members registered in the system yet."
                  icon="👨‍⚕️"
                  actionText="Add First Staff Member"
                  onAction={() => console.log('Add staff clicked')}
                />
              )}

              {/* Staff Table */}
              {!doctorsLoading && !doctorsError && displayStaff.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse', 
                      minWidth: isMobile ? '500px' : '600px' 
                    }}>
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          <th style={{ 
                            padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                            textAlign: 'left', 
                            color: '#374151', 
                            fontWeight: '600', 
                            fontSize: isMobile ? '0.8rem' : '0.85rem' 
                          }}>Staff Name</th>
                          <th style={{ 
                            padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                            textAlign: 'left', 
                            color: '#374151', 
                            fontWeight: '600', 
                            fontSize: isMobile ? '0.8rem' : '0.85rem' 
                          }}>Specialty</th>
                          <th style={{ 
                            padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                            textAlign: 'left', 
                            color: '#374151', 
                            fontWeight: '600', 
                            fontSize: isMobile ? '0.8rem' : '0.85rem' 
                          }}>Contact</th>
                          <th style={{ 
                            padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                            textAlign: 'left', 
                            color: '#374151', 
                            fontWeight: '600', 
                            fontSize: isMobile ? '0.8rem' : '0.85rem' 
                          }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayStaff.map(member => (
                          <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ 
                              padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                              color: '#2d3748', 
                              fontSize: isMobile ? '0.8rem' : '0.9rem',
                              fontWeight: '500'
                            }}>{member.name}</td>
                            <td style={{ 
                              padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                              color: '#64748b', 
                              fontSize: isMobile ? '0.8rem' : '0.9rem' 
                            }}>{member.role}</td>
                            <td style={{ 
                              padding: isMobile ? '0.75rem 0.5rem' : '1rem', 
                              color: '#64748b', 
                              fontSize: isMobile ? '0.8rem' : '0.9rem' 
                            }}>{doctors.find(d => d.id === member.id)?.contactInfo || 'N/A'}</td>
                            <td style={{ padding: isMobile ? '0.75rem 0.5rem' : '1rem' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: isMobile ? '0.7rem' : '0.75rem',
                                fontWeight: '600',
                                background: '#dcfce7',
                                color: '#16a34a'
                              }}>
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {doctors && doctors.length > 5 && (
                    <div style={{
                      padding: '1rem',
                      textAlign: 'center',
                      borderTop: '1px solid #e2e8f0',
                      background: '#f8fafc'
                    }}>
                      <p style={{ 
                        margin: 0, 
                        color: '#6b7280', 
                        fontSize: '0.85rem' 
                      }}>
                        Showing 5 of {doctors.length} staff members
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Other tabs show placeholder content */}
          {!['overview', 'patients', 'staff'].includes(activeTab) && (
            <div style={{
              background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
              borderRadius: '20px',
              padding: '3rem 2rem',
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
                background: 'linear-gradient(45deg, rgba(30, 64, 175, 0.03), rgba(59, 130, 246, 0.03))',
                opacity: 0.5
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>🚧</div>
                <h3 style={{ color: '#2d3748', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '700' }}>Coming Soon</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>This section is under development and will be available soon.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;