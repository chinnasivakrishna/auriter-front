// EditJobContent.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const EditJobContent = ({ jobId }) => {
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
      <h1 className="text-2xl font-bold mb-6">Edit Job: {job?.title}</h1>
      
      {/* Add your job editing form here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Job editing form will go here...</p>
        {/* Implement your form with fields pre-populated with job data */}
      </div>
    </div>
  );
};

export default EditJobContent;

