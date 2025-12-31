import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hospital-homepage footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-info">
            <p className="copyright">
              © {currentYear} CareWell Medical Center. All rights reserved.
            </p>
          </div>
          
          <div className="footer-links">
            <a 
              href="/privacy-policy" 
              className="footer-link"
              aria-label="Read our Privacy Policy"
            >
              Privacy Policy
            </a>
            <span className="footer-separator" aria-hidden="true">|</span>
            <a 
              href="/terms-conditions" 
              className="footer-link"
              aria-label="Read our Terms and Conditions"
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;