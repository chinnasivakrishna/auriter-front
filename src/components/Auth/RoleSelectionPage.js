import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building, Globe, User, ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';

// Role Selection component
const RoleSelection = ({ onRoleSelect }) => {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Choose Your Role
        </h2>
        <div className="space-y-4">
          <button
            onClick={() => onRoleSelect('jobSeeker')}
            className="w-full p-6 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors duration-200 flex flex-col items-center justify-center"
          >
            <User className="mb-3 text-purple-600" size={40} />
            <span className="text-lg font-medium text-gray-800">I'm a Job Seeker</span>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Looking for new opportunities and want to showcase your skills
            </p>
          </button>
          
          <button
            onClick={() => onRoleSelect('recruiter')}
            className="w-full p-6 border border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors duration-200 flex flex-col items-center justify-center"
          >
            <Building className="mb-3 text-purple-600" size={40} />
            <span className="text-lg font-medium text-gray-800">I'm a Recruiter</span>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Looking to hire talented individuals for your company
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

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
    const params = new URLSearchParams(location.search);
    const stateToken = location.state?.token;
    const queryToken = params.get('token');
    const cookieToken = Cookies.get('token');
    
    if (stateToken) {
      setToken(stateToken);
    } else if (queryToken) {
      setToken(queryToken);
      // Also set the token in cookies for future use
      Cookies.set('token', queryToken, { expires: 7 });
    } else if (cookieToken) {
      setToken(cookieToken);
    } else {
      // No token found, redirect to auth
      navigate('/auth');
    }
  }, [location, navigate]);

  const handleRoleSelect = async (role) => {
    try {
      setError('');
      
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

      // Successfully set role
      onAuthSuccess(role);
      navigate('/');
    } catch (error) {
      setError(error.message || 'An error occurred');
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    
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

      // Successfully set role as recruiter with company info
      onAuthSuccess('recruiter');
      navigate('/');
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
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded max-w-md">
          {error}
        </div>
      )}
      {renderCurrentStep()}
    </div>
  );
};

export default RoleSelectionPage;