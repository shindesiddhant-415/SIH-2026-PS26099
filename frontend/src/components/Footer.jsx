import React from 'react';
import './styles/index.css';

const Footer = () => {
  return (
    <footer className="border-top mt-5 py-4 bg-white">
      <div className="container-fluid px-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="text-muted">
            <small>
              NMIG Platform • Developed for CPCL & MoPNG • SIH 26099 • Smart Automation Theme
            </small>
          </div>
          <div className="text-muted small">
            <span>© 2026 Chennai Petroleum Corporation Limited</span>
            <span className="mx-2">|</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;