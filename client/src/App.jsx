import { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';
import './App.css';

function App() {
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', role: 'doctor' });
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Enhanced responsive detection and scroll management
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    // Prevent body scroll when mobile menu is open
    const handleBodyScroll = () => {
      if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    };

    window.addEventListener('resize', handleResize);
    handleBodyScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Demo staff accounts
  const staffAccounts = [
    {
      email: 'admin@thappy.com',
      password: 'admin123',
      role: 'admin',
      name: 'Dr. Sarah Johnson',
      title: 'Chief Administrator',
      department: 'Administration'
    },
    {
      email: 'doctor@thappy.com',
      password: 'doctor123',
      role: 'doctor',
      name: 'Dr. Michael Adebayo',
      title: 'Senior Physician',
      department: 'Internal Medicine'
    },
    {
      email: 'nurse@thappy.com',
      password: 'nurse123',
      role: 'nurse',
      name: 'Nurse Fatima Okafor',
      title: 'Head Nurse',
      department: 'ICU'
    },
    {
      email: 'receptionist@thappy.com',
      password: 'reception123',
      role: 'receptionist',
      name: 'Grace Adeola',
      title: 'Reception Manager',
      department: 'Front Desk'
    }
  ];

  const handleStaffLogin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const email = loginForm.email.trim();
    const password = loginForm.password.trim();
    const role = loginForm.role.trim();
    
    // Find matching staff account
    const matchingAccount = staffAccounts.find(account => 
      account.email === email && 
      account.password === password && 
      account.role === role
    );
    
    if (matchingAccount) {
      setCurrentUser(matchingAccount);
      setShowStaffLogin(false);
      setLoginForm({ email: '', password: '', role: 'doctor' });
    } else {
      alert(`Demo Login - Available accounts:\n\nAdmin: admin@thappy.com / admin123\nDoctor: doctor@thappy.com / doctor123\nNurse: nurse@thappy.com / nurse123\nReceptionist: receptionist@thappy.com / reception123\n\nMake sure to select the correct role!`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Route to appropriate dashboard based on role
  if (currentUser) {
    if (currentUser.role === 'admin') {
      return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
    } else {
      return <StaffDashboard currentUser={currentUser} onLogout={handleLogout} />;
    }
  }

  // MOBILE-FIRST RESPONSIVE HOSPITAL WEBSITE
  return (
    <div className="app-container">
      {/* Staff Login Modal */}
      {showStaffLogin && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowStaffLogin(false)}
              className="modal-close"
            >
              ×
            </button>

            <div className="modal-header">
              <h2>Staff Portal Access</h2>
              <p>Secure login for T-Happy medical staff</p>
              <div className="demo-info">
                <p><strong>Demo Accounts:</strong></p>
                <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  <p>Admin: admin@thappy.com / admin123</p>
                  <p>Doctor: doctor@thappy.com / doctor123</p>
                  <p>Nurse: nurse@thappy.com / nurse123</p>
                  <p>Reception: receptionist@thappy.com / reception123</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleStaffLogin} className="login-form">
              <div className="form-group">
                <label>Department Role</label>
                <select
                  value={loginForm.role}
                  onChange={(e) => setLoginForm({...loginForm, role: e.target.value})}
                  className="form-input"
                >
                  <option value="doctor">Medical Doctor</option>
                  <option value="nurse">Registered Nurse</option>
                  <option value="admin">Administrator</option>
                  <option value="receptionist">Reception Staff</option>
                </select>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" className="login-button">
                Access Portal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="main-header">
        <div className="header-container">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-icon">T+</div>
            <div className="logo-text">
              <div className="logo-title">T-HAPPY</div>
              <div className="logo-subtitle">HOME HOSPITAL</div>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            style={{ display: isMobile ? 'flex' : 'none' }}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation */}
          <nav className={`main-nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
            <a href="#home" className="nav-link active" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
            <a href="#about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
            <a href="#services" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
            <a href="#blog" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Blog</a>
            <a href="#contact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            
            {/* Emergency Phone Number */}
            <div className="emergency-contact">
              <span className="emergency-text">Emergency: +234 810 314 6408</span>
            </div>
            
            {/* Staff Login Button */}
            <button
              onClick={() => {
                setShowStaffLogin(true);
                setIsMobileMenuOpen(false);
              }}
              className="staff-login-button"
            >
              <span className="login-icon">👨‍⚕️</span>
              <span className="login-text">Staff Login</span>
            </button>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">🏥</span>
              <span className="badge-text">Trusted Healthcare Since 2010</span>
            </div>
            
            <h1 className="hero-title">
              Expert Care in<br />
              <span className="hero-subtitle">ICU Services</span>
            </h1>
            
            <p className="hero-text">
              Welcome to T-Happy Home Hospital, where every patient receives world-class medical care with a compassionate, personal touch. Our team is here to guide you on your journey to recovery, health and wellness.
            </p>
            
            <div className="hero-actions">
              <button className="hero-button primary">
                Book an Appointment
              </button>
              <button 
                className="hero-button secondary"
                onClick={() => setShowStaffLogin(true)}
              >
                👨‍⚕️ Staff Portal
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">3,247</div>
                <div className="stat-label">Patients Treated</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">156</div>
                <div className="stat-label">Medical Staff</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Emergency Care</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61A5.5 5.5 0 0 0 16.5 2.03A5.5 5.5 0 0 0 12 4.17A5.5 5.5 0 0 0 7.5 2.03A5.5 5.5 0 0 0 3.16 4.61C1.84 5.95 1.84 8.05 3.16 9.39L12 18.23L20.84 9.39C22.16 8.05 22.16 5.95 20.84 4.61Z"/>
                  </svg>
                </div>
                <h3>ICU Excellence</h3>
              </div>
              <div className="card-content">
                <div className="feature-list">
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Advanced Life Support</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>24/7 Monitoring</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>Expert Medical Team</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>State-of-Art Equipment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section">
        <div className="section-container">
          {/* Hospital Image */}
          <div className="about-image">
            <div className="hospital-facility-image">
              <svg viewBox="0 0 350 250" className="facility-illustration">
                {/* Background */}
                <rect width="350" height="250" fill="url(#facilityGradient)" rx="15"/>
                
                {/* Gradient Definitions */}
                <defs>
                  <linearGradient id="facilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc"/>
                    <stop offset="100%" stopColor="#e2e8f0"/>
                  </linearGradient>
                  <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#f1f5f9"/>
                  </linearGradient>
                </defs>
                
                {/* Hospital Building */}
                <g transform="translate(50, 40)">
                  {/* Main Building */}
                  <rect x="0" y="60" width="120" height="80" fill="url(#buildingGradient)" stroke="#cbd5e1" strokeWidth="1"/>
                  
                  {/* Building Floors */}
                  <line x1="0" y1="100" x2="120" y2="100" stroke="#e2e8f0" strokeWidth="1"/>
                  <line x1="0" y1="120" x2="120" y2="120" stroke="#e2e8f0" strokeWidth="1"/>
                  
                  {/* Windows */}
                  <rect x="15" y="75" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="35" y="75" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="55" y="75" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="75" y="75" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="95" y="75" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  
                  <rect x="15" y="105" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="35" y="105" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="55" y="105" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="75" y="105" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="95" y="105" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  
                  <rect x="15" y="125" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="35" y="125" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="55" y="125" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="75" y="125" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  <rect x="95" y="125" width="12" height="15" fill="#dbeafe" stroke="#3b82f6" strokeWidth="0.5"/>
                  
                  {/* Entrance */}
                  <rect x="45" y="125" width="30" height="15" fill="#4338ca"/>
                  <rect x="50" y="130" width="20" height="10" fill="white"/>
                  <text x="60" y="137" fontSize="6" fill="#4338ca" textAnchor="middle" fontWeight="bold">T+</text>
                  
                  {/* Hospital Cross */}
                  <g transform="translate(130, 20)">
                    <circle cx="15" cy="15" r="12" fill="#dc2626"/>
                    <rect x="12" y="9" width="6" height="3" fill="white"/>
                    <rect x="13.5" y="7.5" width="3" height="6" fill="white"/>
                    <rect x="12" y="18" width="6" height="3" fill="white"/>
                    <rect x="13.5" y="16.5" width="3" height="6" fill="white"/>
                  </g>
                  
                  {/* Medical Equipment Icons */}
                  <g transform="translate(140, 60)">
                    {/* Ambulance */}
                    <rect x="0" y="15" width="25" height="12" fill="white" stroke="#dc2626" strokeWidth="1"/>
                    <rect x="20" y="12" width="8" height="6" fill="white" stroke="#dc2626" strokeWidth="1"/>
                    <circle cx="5" cy="30" r="3" fill="#374151"/>
                    <circle cx="20" cy="30" r="3" fill="#374151"/>
                    <rect x="8" y="18" width="3" height="1" fill="#dc2626"/>
                    <rect x="9" y="17" width="1" height="3" fill="#dc2626"/>
                  </g>
                  
                  {/* Trees/Landscaping */}
                  <g transform="translate(10, 145)">
                    <circle cx="0" cy="0" r="8" fill="#10b981"/>
                    <rect x="-1" y="0" width="2" height="8" fill="#92400e"/>
                  </g>
                  
                  <g transform="translate(140, 145)">
                    <circle cx="0" cy="0" r="8" fill="#10b981"/>
                    <rect x="-1" y="0" width="2" height="8" fill="#92400e"/>
                  </g>
                </g>
                
                {/* Medical Staff Silhouettes */}
                <g transform="translate(200, 120)" opacity="0.7">
                  {/* Doctor */}
                  <circle cx="15" cy="15" r="8" fill="#4338ca"/>
                  <rect x="10" y="20" width="10" height="20" fill="white"/>
                  <rect x="8" y="25" width="4" height="10" fill="#4338ca"/>
                  <rect x="18" y="25" width="4" height="10" fill="#4338ca"/>
                  
                  {/* Nurse */}
                  <circle cx="40" cy="15" r="8" fill="#10b981"/>
                  <rect x="35" y="20" width="10" height="20" fill="white"/>
                  <rect x="33" y="25" width="4" height="10" fill="#10b981"/>
                  <rect x="43" y="25" width="4" height="10" fill="#10b981"/>
                </g>
                
                {/* Technology Elements */}
                <g transform="translate(250, 180)">
                  {/* Heart Monitor */}
                  <rect x="0" y="0" width="30" height="20" fill="#1f2937" rx="2"/>
                  <rect x="2" y="2" width="26" height="12" fill="#10b981" rx="1"/>
                  <path d="M6 8 L10 8 L12 4 L14 12 L16 6 L18 10 L22 8" 
                        stroke="white" strokeWidth="1" fill="none"/>
                  
                  {/* Stethoscope */}
                  <circle cx="40" cy="10" r="4" fill="#4338ca"/>
                  <path d="M40 14 Q45 20 50 25" stroke="#4338ca" strokeWidth="2" fill="none"/>
                  <circle cx="50" cy="25" r="2" fill="#4338ca"/>
                </g>
              </svg>
              
              <div className="facility-image-caption">
                <h3>Modern Medical Facility</h3>
                <p>State-of-the-art equipment and compassionate care</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="about-content">
            <div className="section-label">About Us</div>
            
            <h2 className="section-title">
              Specialized Experts<br />
              Dedicated to Saving Lives
            </h2>
            
            <div className="about-text">
              <p>
                At T-Happy Home Hospital, we deliver specialized intensive care with compassion to all our patients. Our areas of expertise include <strong>Neurosurgery</strong>, <strong>Brain & Spine</strong>, <strong>Dialysis</strong>, and <strong>ICU Services</strong>; we've been a trusted name for years.
              </p>

              <p>
                Our dedicated team uses cutting-edge technology and high-level professionalism to provide tailored, life-saving treatments.
              </p>

              <p>
                Choosing us means choosing a partner committed to your recovery and well-being. Experience care that transforms lives.
              </p>
            </div>

            <button className="section-button">Learn More</button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-container">
          {/* Section Header */}
          <div className="services-header">
            <div className="section-label">Our Services</div>
            
            <h2 className="section-title">
              Comprehensive Healthcare Services
            </h2>
            
            <p className="section-description">
              We offer a full range of medical services with state-of-the-art technology and experienced healthcare professionals.
            </p>
          </div>

          {/* Services Grid */}
          <div className="services-grid">
            {[
              {
                title: 'Emergency Care',
                description: '24/7 emergency medical services with rapid response team and advanced life support.',
                iconType: 'emergency',
                color: '#dc2626'
              },
              {
                title: 'ICU Services',
                description: 'Intensive care unit with specialized monitoring and life support systems.',
                iconType: 'icu',
                color: '#4338ca'
              },
              {
                title: 'Surgical Services',
                description: 'Advanced surgical procedures with minimally invasive techniques and expert surgeons.',
                iconType: 'surgery',
                color: '#059669'
              },
              {
                title: 'Cardiology',
                description: 'Comprehensive heart care including diagnostics, treatment, and cardiac rehabilitation.',
                iconType: 'cardiology',
                color: '#dc2626'
              },
              {
                title: 'Neurology',
                description: 'Specialized care for brain, spine, and nervous system disorders.',
                iconType: 'neurology',
                color: '#7c3aed'
              },
              {
                title: 'Pediatrics',
                description: 'Dedicated healthcare services for infants, children, and adolescents.',
                iconType: 'pediatrics',
                color: '#0891b2'
              }
            ].map((service, idx) => (
              <div key={idx} className="service-card">
                <div 
                  className="service-icon"
                  style={{ backgroundColor: `${service.color}15` }}
                >
                  <svg viewBox="0 0 24 24" className="service-icon-svg">
                    {service.iconType === 'emergency' && (
                      <g>
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill={service.color}/>
                        <circle cx="12" cy="12" r="8" stroke={service.color} strokeWidth="1.5" fill="none"/>
                        <path d="M12 8V12L15 15" stroke={service.color} strokeWidth="1.5" fill="none"/>
                      </g>
                    )}
                    {service.iconType === 'icu' && (
                      <g>
                        <rect x="3" y="4" width="18" height="16" rx="2" stroke={service.color} strokeWidth="1.5" fill="none"/>
                        <path d="M7 8H17M7 12H17M7 16H13" stroke={service.color} strokeWidth="1.5"/>
                        <circle cx="12" cy="12" r="2" fill={service.color}/>
                        <path d="M8 2V6M16 2V6" stroke={service.color} strokeWidth="1.5"/>
                      </g>
                    )}
                    {service.iconType === 'surgery' && (
                      <g>
                        <path d="M12 2V22" stroke={service.color} strokeWidth="1.5"/>
                        <path d="M2 12H22" stroke={service.color} strokeWidth="1.5"/>
                        <circle cx="12" cy="12" r="3" stroke={service.color} strokeWidth="1.5" fill="none"/>
                        <path d="M12 1L13 5L17 4L16 8L20 9L16 10L17 14L13 13L12 17L11 13L7 14L8 10L4 9L8 8L7 4L11 5L12 1Z" fill={service.color} opacity="0.3"/>
                      </g>
                    )}
                    {service.iconType === 'cardiology' && (
                      <g>
                        <path d="M20.84 4.61A5.5 5.5 0 0 0 16.5 2.03A5.5 5.5 0 0 0 12 4.17A5.5 5.5 0 0 0 7.5 2.03A5.5 5.5 0 0 0 3.16 4.61C1.84 5.95 1.84 8.05 3.16 9.39L12 18.23L20.84 9.39C22.16 8.05 22.16 5.95 20.84 4.61Z" fill={service.color}/>
                        <path d="M6 10L8 12L10 8L12 14L14 6L16 10L18 8" stroke="white" strokeWidth="1.5" fill="none"/>
                      </g>
                    )}
                    {service.iconType === 'neurology' && (
                      <g>
                        <circle cx="12" cy="12" r="9" stroke={service.color} strokeWidth="1.5" fill="none"/>
                        <path d="M12 3C12 3 8 6 8 12S12 21 12 21" stroke={service.color} strokeWidth="1.5" fill="none"/>
                        <path d="M12 3C12 3 16 6 16 12S12 21 12 21" stroke={service.color} strokeWidth="1.5" fill="none"/>
                        <circle cx="12" cy="12" r="2" fill={service.color}/>
                        <circle cx="8" cy="8" r="1" fill={service.color}/>
                        <circle cx="16" cy="8" r="1" fill={service.color}/>
                        <circle cx="8" cy="16" r="1" fill={service.color}/>
                        <circle cx="16" cy="16" r="1" fill={service.color}/>
                      </g>
                    )}
                    {service.iconType === 'pediatrics' && (
                      <g>
                        <circle cx="12" cy="8" r="4" stroke={service.color} strokeWidth="1.5" fill="none"/>
                        <path d="M8 14V20H16V14" stroke={service.color} strokeWidth="1.5" fill="none"/>
                        <path d="M12 12V20" stroke={service.color} strokeWidth="1.5"/>
                        <circle cx="9" cy="9" r="1" fill={service.color}/>
                        <circle cx="15" cy="9" r="1" fill={service.color}/>
                        <path d="M10 11C10 11 11 12 12 12S14 11 14 11" stroke={service.color} strokeWidth="1.5" fill="none"/>
                        <path d="M6 18H18" stroke={service.color} strokeWidth="1.5"/>
                      </g>
                    )}
                  </svg>
                </div>
                
                <h3 className="service-title">{service.title}</h3>
                
                <p className="service-description">{service.description}</p>
                
                <button 
                  className="service-button"
                  style={{ 
                    borderColor: service.color,
                    color: service.color 
                  }}
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">T+</div>
                <div className="footer-logo-text">
                  <div className="footer-brand-name">T-Happy</div>
                  <div className="footer-brand-subtitle">Home Hospital</div>
                </div>
              </div>
              <p className="footer-description">
                Providing exceptional healthcare services with compassion, 
                innovation, and excellence since 2010. Your health is our priority.
              </p>
            </div>

            <div className="footer-contact">
              <h4 className="footer-title">Contact Information</h4>
              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-icon-wrapper">
                    <svg viewBox="0 0 24 24" className="contact-icon-svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="#64748b"/>
                    </svg>
                  </div>
                  <div className="contact-details">
                    <div className="contact-label">Address</div>
                    <div className="contact-value">123 Medical Center Drive<br />Healthcare City, HC 12345</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon-wrapper emergency-icon">
                    <svg viewBox="0 0 24 24" className="contact-icon-svg">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#ef4444"/>
                      <circle cx="12" cy="12" r="8" stroke="#ef4444" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                  <div className="contact-details">
                    <div className="contact-label">Emergency</div>
                    <div className="contact-value emergency">(555) 123-4567</div>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-icon-wrapper appointments-icon">
                    <svg viewBox="0 0 24 24" className="contact-icon-svg">
                      <path d="M6.62 10.79C6.21 10.38 5.56 10.38 5.15 10.79S4.74 11.74 5.15 12.15L8.79 15.79C9.2 16.2 9.85 16.2 10.26 15.79L18.85 7.2C19.26 6.79 19.26 6.14 18.85 5.73S17.9 5.32 17.49 5.73L9.53 13.69L6.62 10.79Z" fill="#10b981"/>
                      <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                  <div className="contact-details">
                    <div className="contact-label">Appointments</div>
                    <div className="contact-value appointments">(555) 123-4568</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              © 2024 T-Happy Home Hospital. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;