// ViewJobContent.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ArrowLeft, Calendar, MapPin, Clock, Briefcase, DollarSign, Edit2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../UI/Card';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    closed: 'bg-red-100 text-red-800',
    expired: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ViewJobContent = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const token = Cookies.get('token');
        const response = await fetch(`https://auriter-back.onrender.com/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch job details');
        
        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [jobId]);
  
  const handleGoBack = () => {
    navigate('/my-listings');
  };
  
  const handleEdit = () => {
    navigate(`/edit-job/${jobId}`);
  };
  
  const handleViewApplications = () => {
    navigate(`/applications/${jobId}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
        <p className="font-medium">Error: {error}</p>
        <button 
          onClick={() => setError(null)} 
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Dismiss
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button 
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </button>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-purple-700 mb-2">{job?.title}</h1>
          <div className="flex items-center">
            <StatusBadge status={job?.status || 'active'} />
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-600">
              Posted on {new Date(job?.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={handleEdit}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Job
          </button>
          <button 
            onClick={handleViewApplications}
            className="flex items-center px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition-colors"
          >
            <Users className="h-4 w-4 mr-2" />
            View Applicants
          </button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {job?.location && (
              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-gray-700">{job.location}</p>
                </div>
              </div>
            )}
            
            {job?.type && (
              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Job Type</p>
                  <p className="text-gray-700">{job.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                </div>
              </div>
            )}
            
            {job?.salary && (
              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Salary Range</p>
                  <p className="text-gray-700">{job.salary}</p>
                </div>
              </div>
            )}
            
            {job?.deadline && (
              <div className="flex items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Apply Before</p>
                  <p className="text-gray-700">{new Date(job.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h2>
              <div className="prose max-w-none text-gray-700">
                {job?.description.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Requirements</h2>
              <div className="prose max-w-none text-gray-700">
                {job?.requirements.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </div>
            
            {job?.category && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Category</h2>
                <p className="text-gray-700">{job.category}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <button 
          onClick={handleGoBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to Listings
        </button>
        
        <div className="flex space-x-3">
          <button 
            onClick={handleEdit}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Job
          </button>
          <button 
            onClick={handleViewApplications}
            className="flex items-center px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition-colors"
          >
            <Users className="h-4 w-4 mr-2" />
            View Applicants
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewJobContent;