// ViewJobContent.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const ViewJobContent = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
      </div>
    );
  }
  
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-purple-700 mb-2">{job?.title}</h1>
        <div className="mb-4 text-gray-600">
          <p>Posted on: {new Date(job?.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Job Description</h2>
          <p className="text-gray-700">{job?.description}</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Requirements</h2>
          <p className="text-gray-700">{job?.requirements}</p>
        </div>
        
        {/* Add more job details as needed */}
      </div>
    </div>
  );
};

export default ViewJobContent;

