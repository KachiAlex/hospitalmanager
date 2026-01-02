import React, { useState } from 'react';
import { HeaderProps } from '../types';
import { getIcon } from '../utils/iconMap';
import './Header.css';

const Header: React.FC<HeaderProps> = ({
  logo,
  navigationItems,
  onBookAppointment,
  onStaffLogin,
  onNavigate
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="hospital-homepage header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="header-logo">
            <img src={logo} alt="Hospital Logo" className="logo-image" />
          </div>

          {/* Desktop Navigation */}
          <nav className="header-nav desktop-nav" aria-label="Main navigation">
            <ul className="nav-list">
              {navigationItems.map((item) => (
                <li key={item.label} className="nav-item">
                  <a 
                    href={item.href} 
                    className={`nav-link ${item.active ? 'active' : ''}`}
                    aria-current={item.active ? 'page' : undefined}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate(item);
                      }
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Action Buttons */}
          <div className="header-actions">
            <button 
              className="btn btn-secondary staff-login-btn"
              onClick={onStaffLogin}
              aria-label="Staff Login"
            >
              Staff Login
            </button>
            <button 
              className="btn btn-primary book-appointment-btn"
              onClick={onBookAppointment}
              aria-label="Book Appointment"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {getIcon(isMobileMenuOpen ? 'FaTimes' : 'FaBars', { size: 24 })}
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav 
          className={`header-nav mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}
          aria-label="Mobile navigation"
        >
          <ul className="nav-list">
            {navigationItems.map((item) => (
              <li key={item.label} className="nav-item">
                <a 
                  href={item.href} 
                  className={`nav-link ${item.active ? 'active' : ''}`}
                  aria-current={item.active ? 'page' : undefined}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate(item);
                    }
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          
          {/* Mobile Action Buttons */}
          <div className="mobile-actions">
            <button 
              className="btn btn-secondary staff-login-btn"
              onClick={() => {
                onStaffLogin();
                setIsMobileMenuOpen(false);
              }}
            >
              Staff Login
            </button>
            <button 
              className="btn btn-primary book-appointment-btn"
              onClick={() => {
                onBookAppointment();
                setIsMobileMenuOpen(false);
              }}
            >
              Book Appointment
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;