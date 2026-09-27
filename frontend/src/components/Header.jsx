import React from 'react';
import { Link } from 'react-router-dom';
import './styles/index.css';

const Header = ({ title, subtitle }) => {
  return (
    <header className="border-bottom py-4 bg-white shadow-sm">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <Link to="/" className="d-flex align-items-center mb-0 text-decoration-none">
              <span className="me-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20V20H4V4Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 8H16V16H8V8Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </span>
              <div>
                <h3 className="mb-0">NMIG Platform</h3>
                <p className="mb-0 text-muted">National Material Intelligence & Harmonization</p>
              </div>
            </Link>
          </div>

          {title && (
            <div className="text-end">
              {title && (
                <h2 className="mb-1">{title}</h2>
              )}
              {subtitle && (
                <p className="mb-0 text-muted">{subtitle}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;