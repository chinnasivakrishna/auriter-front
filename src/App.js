import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { HMSRoomProvider } from '@100mslive/react-sdk';
import SidebarLayout from './components/SidebarLayout';
import AuthFlow from './components/Auth/AuthFlow';
import InterviewRoom from './AI/InterviewRoom';
import Cookies from 'js-cookie';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in cookies
    const token = Cookies.get('token');
    if (token) {
      // Validate the token
      validateToken(token);
    } else {
      setIsLoading(false);
      setIsAuthenticated(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await fetch('https://auriter-back.onrender.com/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setUserRole(data.role);
      } else {
        // Token is invalid, remove it
        Cookies.remove('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error validating token:', error);
      Cookies.remove('token');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    // Remove the token cookie
    Cookies.remove('token');
    
    // Update application state
    setIsAuthenticated(false);
    setUserRole(null);
    
    // Navigate to auth page
    window.location.href = '/auth';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <HMSRoomProvider>
        <div>
          <Routes>
            {/* Public Interview Room route - accessible without authentication */}
            <Route path="/interview/:roomId" element={<InterviewRoom />} />
            
            {/* Auth callback route for Google OAuth */}
            <Route path="/auth/callback" element={
              isAuthenticated 
                ? <Navigate to="/" replace /> 
                : <AuthFlow onAuthSuccess={handleAuthSuccess} />
            } />
            
            {isAuthenticated ? (
              <>
                {/* Main layout with sidebar for authenticated users */}
                <Route path="/*" element={<SidebarLayout onLogout={handleLogout} userRole={userRole} />} />
                
                {/* Redirect to dashboard if authenticated user tries to access auth page */}
                <Route path="/auth" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                {/* Auth page for unauthenticated users */}
                <Route path="/auth" element={<AuthFlow onAuthSuccess={handleAuthSuccess} />} />
                
                {/* Redirect to auth if unauthenticated user tries to access protected routes */}
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </>
            )}
          </Routes>
        </div>
      </HMSRoomProvider>
    </Router>
  );
};

export default App;