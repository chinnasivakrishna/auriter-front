import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building, Globe, User, ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';
import RoleSelection from './RoleSelectionPage';

const RoleSelectionPage = ({ onAuthSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [currentStep, setCurrentStep] = useState('roleSelection'); // roleSelection, companyInfo
  const [companyData, setCompanyData] = useState({
    name: '',
    position: '',
    website: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Get token from location state or from cookies
    const stateToken = location.state?.token;
    const cookieToken = Cookies.get('token');
    
    if (stateToken) {
      setToken(stateToken);
    } else if (cookieToken) {
      setToken(cookieToken);
    } else {
      // No token found, redirect to auth
      navigate('/auth');
    }
  }, [location, navigate]);

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
          'Authorization': `Bearer ${token}`
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
          'Authorization': `Bearer ${token}`
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

  // Company information form for recruiters
  const CompanyInfoForm = () => {
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

          <form onSubmit={handleCompanySubmit} className="space-y-6">
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

  // Render the appropriate step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'companyInfo':
        return <CompanyInfoForm />;
      case 'roleSelection':
      default:
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      {renderCurrentStep()}
    </div>
  );
};

export default RoleSelectionPage;