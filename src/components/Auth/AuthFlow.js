import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Building, Globe } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import Cookies from 'js-cookie';
import RoleSelection from './RoleSelection';

// Separate components for each step in the auth flow
const AuthFlow = ({ onAuthSuccess }) => {
  const [currentStep, setCurrentStep] = useState('auth'); // auth, roleSelection, companyInfo
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: '',
    token: null,
    isGoogle: false,
  });
  const [companyData, setCompanyData] = useState({
    name: '',
    position: '',
    website: '',
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  
  // Check URL params for Google callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');
    
    if (token) {
      // Google auth callback
      Cookies.set('token', token, { expires: 7 });
      setAuthData(prev => ({
        ...prev,
        token: token,
        isGoogle: true
      }));
      
      if (role && role !== 'undefined') {
        // User already has a role, complete auth flow
        onAuthSuccess(role);
      } else {
        // User needs to select a role
        setCurrentStep('roleSelection');
      }
    }
  }, [onAuthSuccess]);

  const handleRegisterOrLogin = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`https://auriter-back.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: authData.name,
          email: authData.email,
          password: authData.password
        }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      if (data.token) {
        Cookies.set('token', data.token, { expires: 7 });
        setAuthData(prev => ({
          ...prev,
          token: data.token
        }));
        
        if (!isLogin && data.requiresRole) {
          setCurrentStep('roleSelection');
        } else {
          onAuthSuccess(data.role);
        }
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
  };

  const handleRoleSelect = async (role) => {
    try {
      if (role === 'recruiter') {
        setCurrentStep('companyInfo');
        return;
      }

      const response = await fetch('https://auriter-back.onrender.com/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token || Cookies.get('token')}`
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      onAuthSuccess(role);
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://auriter-back.onrender.com/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token || Cookies.get('token')}`
        },
        body: JSON.stringify({
          role: 'recruiter',
          company: companyData
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      onAuthSuccess('recruiter');
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://auriter-back.onrender.com/api/auth/google';
  };

  // Render the appropriate step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'roleSelection':
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
      case 'companyInfo':
        return (
          <CompanyInfoForm 
            companyData={companyData} 
            setCompanyData={setCompanyData}
            onSubmit={handleCompanySubmit}
            error={error}
          />
        );
      case 'auth':
      default:
        return (
          <AuthForm 
            isLogin={isLogin} 
            setIsLogin={setIsLogin}
            authData={authData}
            setAuthData={setAuthData}
            onSubmit={handleRegisterOrLogin}
            onGoogleLogin={handleGoogleLogin}
            error={error}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      {renderCurrentStep()}
    </div>
  );
};

// Login/Register form component
const AuthForm = ({ isLogin, setIsLogin, authData, setAuthData, onSubmit, onGoogleLogin, error }) => {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={authData.name}
                  onChange={(e) => setAuthData({...authData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={authData.email}
                onChange={(e) => setAuthData({...authData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
          >
            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="ml-2" size={20} />
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoogleLogin}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
          >
            <FcGoogle className="mr-2" size={20} />
            <span>Google</span>
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-purple-600 hover:underline focus:outline-none"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Company information form for recruiters
const CompanyInfoForm = ({ companyData, setCompanyData, onSubmit, error }) => {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Company Details
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={companyData.name}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  name: e.target.value
                })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter company name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Position
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={companyData.position}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  position: e.target.value
                })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter your position"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                value={companyData.website}
                onChange={(e) => setCompanyData({
                  ...companyData,
                  website: e.target.value
                })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="Enter company website"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
          >
            <span>Complete Registration</span>
            <ArrowRight className="ml-2" size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthFlow;