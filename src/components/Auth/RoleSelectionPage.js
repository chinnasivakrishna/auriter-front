import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building, Globe, User, ArrowRight, Briefcase, ChevronLeft } from 'lucide-react';
import Cookies from 'js-cookie';

// Role Selection component moved outside
const RoleSelection = ({ onRoleSelect }) => {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Choose Your Role
        </h2>
        
        <div className="space-y-4">
          <button
            onClick={() => onRoleSelect('jobSeeker')}
            className="w-full p-6 border-2 border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 flex flex-col items-center justify-center group"
          >
            <div className="mb-3 p-3 bg-purple-100 rounded-full text-purple-600 group-hover:bg-purple-200 transition-colors">
              <Briefcase size={32} />
            </div>
            <span className="text-lg font-medium text-gray-800">I'm a Job Seeker</span>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Looking for new opportunities and want to showcase your skills
            </p>
          </button>
          
          <button
            onClick={() => onRoleSelect('recruiter')}
            className="w-full p-6 border-2 border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 flex flex-col items-center justify-center group"
          >
            <div className="mb-3 p-3 bg-purple-100 rounded-full text-purple-600 group-hover:bg-purple-200 transition-colors">
              <Building size={32} />
            </div>
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

// Company Info Form component moved outside
const CompanyInfoForm = ({ companyData, setCompanyData, handleCompanySubmit, goBack }) => {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <button 
          onClick={goBack}
          className="flex items-center text-purple-600 mb-6 hover:text-purple-800 transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="ml-1">Back to role selection</span>
        </button>
        
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
                onChange={(e) => setCompanyData(prevData => ({
                  ...prevData,
                  name: e.target.value
                }))}
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
                onChange={(e) => setCompanyData(prevData => ({
                  ...prevData,
                  position: e.target.value
                }))}
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
                onChange={(e) => setCompanyData(prevData => ({
                  ...prevData,
                  website: e.target.value
                }))}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                placeholder="https://yourcompany.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center mt-8"
          >
            <span>Complete Registration</span>
            <ArrowRight className="ml-2" size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

// Main component
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
  const [isLoading, setIsLoading] = useState(false);

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

      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToRoleSelection = () => {
    setCurrentStep('roleSelection');
  };

  // Render the appropriate step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'companyInfo':
        return <CompanyInfoForm 
                 companyData={companyData} 
                 setCompanyData={setCompanyData} 
                 handleCompanySubmit={handleCompanySubmit}
                 goBack={goBackToRoleSelection} 
               />;
      case 'roleSelection':
      default:
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col justify-center items-center p-4">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg max-w-md flex items-start">
          <div className="mr-2 mt-0.5">⚠️</div>
          <div>{error}</div>
        </div>
      )}
      
      {isLoading ? (
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Processing your request...</p>
          </div>
        </div>
      ) : (
        renderCurrentStep()
      )}
    </div>
  );
};

export default RoleSelectionPage;