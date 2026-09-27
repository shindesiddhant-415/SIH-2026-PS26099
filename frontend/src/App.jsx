import React from 'react';
import { Routes, Route, Location, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import components
import Layout from './components/Layout';
import Home from './components/Home';
import Matching from './components/Matching';
import DuplicateDetection from './components/DuplicateDetection';
import Clustering from './components/Clustering';
import APIExplorer from './components/APIExplorer';
import Documentation from './components/Documentation';
import './styles/index.css';

function App() {
  const [apiStatus, setApiStatus] = useState({
    isConnected: false,
    isChecking: true,
    error: null
  });

  // Check API health on mount and periodically
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        setApiStatus(prev => ({ ...prev, isChecking: true }));
        const response = await fetch('http://localhost:8000/health');
        if (response.ok) {
          const data = await response.json();
          setApiStatus({
            isConnected: true,
            isChecking: false,
            error: null
          });
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        setApiStatus({
          isConnected: false,
          isChecking: false,
          error: error.message
        });
      }
    };

    // Initial check
    checkApiHealth();

    // Set up interval for periodic checks (every 30 seconds)
    const intervalId = setInterval(checkApiHealth, 30000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Redirect to home if API is not connected and trying to access protected routes
  const requireApi = () => {
    if (!apiStatus.isConnected && apiStatus.isChecking === false) {
      return <Navigate to="/" replace state={{ apiError: apiStatus.error }} />;
    }
    return null;
  };

  return (
    <Layout apiStatus={apiStatus}>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Home apiStatus={apiStatus} />} />

        {/* Protected routes that require API connection */}
        <Route
          path="/matching"
          element={
            apiStatus.isConnected
              ? <Matching />
              : <Navigate to="/" replace state={{ apiError: apiStatus.error }} />
          }
        />

        <Route
          path="/duplicates"
          element={
            apiStatus.isConnected
              ? <DuplicateDetection />
              : <Navigate to="/" replace state={{ apiError: apiStatus.error }} />
          }
        />

        <Route
          path="/clustering"
          element={
            apiStatus.isConnected
              ? <Clustering />
              : <Navigate to="/" replace state={{ apiError: apiStatus.error }} />
          }
        />

        <Route
          path="/api-explorer"
          element={
            apiStatus.isConnected
              ? <APIExplorer />
              : <Navigate to="/" replace state={{ apiError: apiStatus.error }} />
          }
        />

        {/* Documentation is always accessible */}
        <Route path="/documentation" element={<Documentation />} />

        {/* Catch-all for 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;