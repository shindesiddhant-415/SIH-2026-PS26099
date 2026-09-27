import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './styles/index.css';

const Layout = ({ children, apiStatus }) => {
  const location = useLocation();

  // Determine if we should show the sidebar (hide on certain pages like documentation maybe)
  const showSidebar = location.pathname !== '/documentation';

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      {showSidebar && (
        <aside className="border-end flex-shrink-0 pe-4">
          <div className="p-4">
            <h2 className="h4 mb-4">NMIG Platform</h2>
            <p className="text-muted mb-4">National Material Intelligence & Harmonization</p>

            {/* Navigation Menu */}
            <nav className="mb-4">
              <Link
                to="/"
                className={`d-flex w-100 align-items-center py-2 text-decoration-none ${
                  location.pathname === '/' ? 'fw-medium text-primary' : 'text-muted'
                }`}
              >
                <span className="me-3">🏠</span>
                <span>Dashboard</span>
              </Link>

              <Link
                to="/matching"
                className={`d-flex w-100 align-items-center py-2 text-decoration-none ${
                  location.pathname === '/matching' ? 'fw-medium text-primary' : 'text-muted'
                }`}
                disabled={!apiStatus.isConnected && apiStatus.isChecking === false}
                title={!apiStatus.isConnected && apiStatus.isChecking === false ? 'API not connected' : undefined}
              >
                <span className="me-3">🔍</span>
                <span>Material Matching</span>
              </Link>

              <Link
                to="/duplicates"
                className={`d-flex w-100 align-items-center py-2 text-decoration-none ${
                  location.pathname === '/duplicates' ? 'fw-medium text-primary' : 'text-muted'
                }`}
                disabled={!apiStatus.isConnected && apiStatus.isChecking === false}
                title={!apiStatus.isConnected && apiStatus.isChecking === false ? 'API not connected' : undefined}
              >
                <span className="me-3">🎯</span>
                <span>Duplicate Detection</span>
              </Link>

              <Link
                to="/clustering"
                className={`d-flex w-100 align-items-center py-2 text-decoration-none ${
                  location.pathname === '/clustering' ? 'fw-medium text-primary' : 'text-muted'
                }`}
                disabled={!apiStatus.isConnected && apiStatus.isChecking === false}
                title={!apiStatus.isConnected && apiStatus.isChecking === false ? 'API not connected' : undefined}
              >
                <span className="me-3">📊</span>
                <span>Material Clustering</span>
              </Link>

              <Link
                to="/api-explorer"
                className={`d-flex w-100 align-items-center py-2 text-decoration-none ${
                  location.pathname === '/api-explorer' ? 'fw-medium text-primary' : 'text-muted'
                }`}
                disabled={!apiStatus.isConnected && apiStatus.isChecking === false}
                title={!apiStatus.isConnected && apiStatus.isChecking === false ? 'API not connected' : undefined}
              >
                <span className="me-3">🧪</span>
                <span>API Explorer</span>
              </Link>
            </nav>

            {/* API Status Indicator */}
            <div className="mt-4 p-3 border rounded">
              <div className="d-flex align-items-center mb-2">
                <div className={`bg-${apiStatus.isConnected ? 'success' : apiStatus.isChecking ? 'warning' : 'danger'}
                             rounded-circle me-2 p-1`}>
                  {apiStatus.isConnected ? (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  ) : apiStatus.isChecking ? (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  ) : (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  )}
                </div>
                <div>
                  <small className="d-block">
                    {apiStatus.isConnected
                      ? 'API Connected'
                      : apiStatus.isChecking
                        ? 'Checking API...'
                        : 'API Disconnected'}
                  </small>
                  <small className="text-muted">
                    {apiStatus.isConnected
                      ? 'Backend is running and responsive'
                      : !apiStatus.isConnected && apiStatus.isChecking === false
                        ? 'Please start the backend: uvicorn backend.api.main:app --reload'
                        : 'Verifying connection...'}
                  </small>
                </div>
              </div>

              {/* Show error if API check failed */}
              {!apiStatus.isConnected && !apiStatus.isChecking && apiStatus.error && (
                <div className="mt-2 p-2 bg-danger-subtle border border-danger rounded text-danger small">
                  ⚠️ {apiStatus.error}
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;