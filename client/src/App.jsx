import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import HospitalHomepageRedesign from './components/hospital-homepage-redesign/HospitalHomepageRedesign';
import './App.css';

function App() {
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', role: 'doctor' });
  const [currentUser, setCurrentUser] = useState(null);

  // Enhanced responsive detection and scroll management
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    
    console.log('Login attempt:', { email, role }); // Debug log
    
    // Validate input fields
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    // Find matching staff account
    const matchingAccount = staffAccounts.find(account => 
      account.email === email && 
      account.password === password && 
      account.role === role
    );
    
    console.log('Matching account found:', !!matchingAccount); // Debug log
    
    if (matchingAccount) {
      console.log('Setting current user:', matchingAccount.name); // Debug log
      toast.success(`Welcome back, ${matchingAccount.name}!`);
      setCurrentUser(matchingAccount);
      setShowStaffLogin(false);
      setLoginForm({ email: '', password: '', role: 'doctor' });
    } else {
      console.log('Login failed - no matching account'); // Debug log
      toast.error('Invalid credentials. Please check your email, password, and role selection.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Route to appropriate dashboard based on role
  console.log('Current user state:', currentUser); // Debug log
  if (currentUser) {
    console.log('Routing to dashboard for role:', currentUser.role); // Debug log
    if (currentUser.role === 'admin') {
      return (
        <ErrorBoundary onLogout={handleLogout}>
          <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />
        </ErrorBoundary>
      );
    } else {
      return (
        <ErrorBoundary onLogout={handleLogout}>
          <StaffDashboard currentUser={currentUser} onLogout={handleLogout} />
        </ErrorBoundary>
      );
    }
  }

  // MOBILE-FIRST RESPONSIVE HOSPITAL WEBSITE
  return (
    <div className="app-container">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
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
              <p>Secure login for Thappy Home Hospital medical staff</p>
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

      {/* New Redesigned Hospital Homepage */}
      <HospitalHomepageRedesign
        onBookAppointment={() => {
          toast.success('Appointment booking feature coming soon!');
        }}
        onStaffLogin={() => {
          setShowStaffLogin(true);
        }}
        onNavigate={(section) => {
          console.log(`Navigate to: ${section}`);
        }}
      />
    </div>
  );
}

export default App;