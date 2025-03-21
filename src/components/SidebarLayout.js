import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Bell, User, HelpCircle, Settings, Mic } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import Airuter from '../assets/airuter_logo.png';
import SidebarMenu from './SidebarMenu';
import RecruiterMenu from './Recruiter/RecruiterMenu';
import JobsContent from './Jobs/JobsContent';
import AiTelephonic from './AI/AiTelephonic';
import AiVideo from './AI/AiVideo';
import ExpertVideo from './AI/ExpertVideo';
import CoursesContent from './Courses/CoursesContent';
import NotificationsContent from './Notifications/NotificationsContent';
import DashboardContent from './Dashboard/DashboardContent';
import ChatContent from './Chat/ChatContent';
import ProfileContent from './Profile/ProfileContent';
import SettingsContent from './Settings/SettingsContent';
import HelpContent from './Help/HelpContent';
import VoiceInteraction from './VoiceInteraction';
import ResumeAnalyzerPage from './Resume/ResumeAnalyzerPage';
import AuthPage from './Auth/AuthPage';
import ProfileSetup from './Profile/ProfileSetup';
import PostJobsContent from './Jobs/PostJobsContent';
import MyListingsContent from './Listings/MyListingsContent';
import CandidatesContent from './Candidates/CandidatesContent';
import MessagesContent from './Messages/MessagesContent';
import JobsAppliedContent from './Jobs/JobsAppliedContent';
import EditJobContent from './Jobs/EditJobContent';
import ViewJobContent from './Jobs/ViewJobContent';
import JobApplicationsContent from './Applications/JobApplicationsContent';
import JobDetail from './Jobs/JobDetail';
import Cookies from "js-cookie";

const SidebarLayout = ({ onLogout, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');
  const [profileComplete, setProfileComplete] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const params = useParams();
  const location = useLocation();

  useEffect(() => {
    // Set currentPath based on current location
    setCurrentPath(location.pathname);
  }, [location]);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const response = await fetch('https://auriter-back.onrender.com/api/profile/status', {
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      const data = await response.json();
      setProfileComplete(data.isComplete);
    } catch (error) {
      console.error('Error checking profile status:', error);
    }
  };

  const handleNavigate = (path) => {
    if (path === '/profile-setup') {
      setShowProfileSetup(true);
    } else {
      setShowProfileSetup(false);
    }
    setCurrentPath(path);
  };

  const handleProfileSetupComplete = () => {
    setProfileComplete(true);
    setShowProfileSetup(false);
    setCurrentPath('/');
  };

  const handleSkip = () => {
    setShowProfileSetup(false);
    setCurrentPath('/');
  };

  const handleLogoutClick = () => {
    // Let the parent component handle everything
    onLogout();
  };

  const renderContent = () => {
    if (showProfileSetup) {
      return <ProfileSetup onComplete={handleProfileSetupComplete} onSkip={handleSkip} />;
    }

    // Handle dynamic routes
    if (currentPath.startsWith('/edit-job/')) {
      const jobId = currentPath.split('/')[2];
      return <EditJobContent jobId={jobId} />;
    }
    if (currentPath.startsWith('/my-jobs/')) {
      return <JobsContent />;

    }
    if (currentPath.startsWith('/detail/')) {
      return <JobDetail />;

    }
    if (currentPath.startsWith('/jobs/detail/')) {
      return <JobsContent />;
    }

    if (currentPath.startsWith('/jobs/') && currentPath !== '/jobs') {
      const jobId = currentPath.split('/')[2];
      return <ViewJobContent jobId={jobId} />;
    }
    

    if (currentPath.startsWith('/applications/')) {
      const jobId = currentPath.split('/')[2];
      return <JobApplicationsContent jobId={jobId} />;
    }

    // Recruiter-specific routes
    if (userRole === 'recruiter') {
      switch (currentPath) {
        case '/post-jobs':
          return <PostJobsContent />;
        case '/my-listings':
          return <MyListingsContent />;
        case '/candidates':
          return <CandidatesContent />;
        case '/messages':
          return <MessagesContent />;
      }
    }

    // Common routes
    switch (currentPath) {
      case '/auth':
        return <AuthPage />;
      case '/':
        return <DashboardContent />;
      case '/resume-analyzer':
        return <ResumeAnalyzerPage />;
      case '/chat':
        return <ChatContent />;
      case '/jobs':
        return <JobsContent />;
      case '/ai-telephonic':
        return <AiTelephonic />;
      case '/ai-video':
        return <AiVideo />;
      case '/expert-video':
        return <ExpertVideo />;
      case '/courses':
        return <CoursesContent />;
      case '/notifications':
        return <NotificationsContent />;
      case '/profile':
        return <ProfileContent />;
      case '/settings':
        return <SettingsContent />;
      case '/jobs-applied':
        return <JobsAppliedContent />;
      case '/help':
        return <HelpContent />;
      case '/voice-assistant':
        return <VoiceInteraction />;
      default:
        return <DashboardContent />;
    }
  };

  // Get page title from current path
  const getPageTitle = () => {
    if (currentPath === '/') return '';
    
    if (currentPath.startsWith('/edit-job/')) {
      return 'Edit Job';
    }
    
    if (currentPath.startsWith('/jobs/') && currentPath !== '/jobs') {
      return 'View Job';
    }
    
    if (currentPath.startsWith('/applications/')) {
      return 'Job Applications';
    }
    
    return currentPath.slice(1).split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64' : 'w-20'
        } relative`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center overflow-hidden">
            <img src={Airuter} alt="Logo" className="w-full h-full object-cover" />
          </div>
          {isExpanded && (
            <span className="ml-3 font-semibold text-gray-700 animate-fade-in">
              Airuter
            </span>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-20 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Navigation items based on role */}
        {userRole === 'recruiter' ? (
          <RecruiterMenu
            isExpanded={isExpanded}
            currentPath={currentPath}
            handleNavigate={handleNavigate}
          />
        ) : (
          <SidebarMenu
            isExpanded={isExpanded}
            currentPath={currentPath}
            handleNavigate={handleNavigate}
          />
        )}

        {/* Logout button */}
        <div className="absolute bottom-0 w-full border-t p-4">
          <div 
            onClick={handleLogoutClick}
            className="flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 rounded-full"
          >
            <LogOut size={20} />
            {isExpanded && (
              <span className="ml-4">Log Out</span>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
          <div className="flex items-center">
            {currentPath !== '/' && (
              <div className="mr-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 rounded-full">
                <span className="text-gray-600 font-semibold">
                  {getPageTitle()}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <div 
              onClick={() => handleNavigate('/voice-assistant')}
              className="mr-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 rounded-full"
            >
              <Mic size={20} />
            </div>
            <div 
              onClick={() => handleNavigate('/profile')}
              className="mr-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 rounded-full"
            >
              <User size={20} />
            </div>
            <div 
              onClick={() => handleNavigate('/help')}
              className="mr-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 rounded-full"
            >
              <HelpCircle size={20} />
            </div>
            <div 
              onClick={() => handleNavigate('/settings')}
              className="mr-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 rounded-full"
            >
              <Settings size={20} />
            </div>
            <div 
              onClick={() => handleNavigate('/notifications')}
              className="cursor-pointer hover:bg-gray-50 transition-colors duration-200 p-2 rounded-full"
            >
              <Bell size={20} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;