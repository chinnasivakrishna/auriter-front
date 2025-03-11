// JobApplicationsContent.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const JobApplicationsContent = ({ jobId }) => {
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = Cookies.get('token');
        
        // Fetch job details
        const jobResponse = await fetch(`https://auriter-back.onrender.com/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!jobResponse.ok) throw new Error('Failed to fetch job details');
        const jobData = await jobResponse.json();
        setJob(jobData);
        
        // Fetch applications for this job
        const applicationsResponse = await fetch(`https://auriter-back.onrender.com/api/applications/job/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!applicationsResponse.ok) throw new Error('Failed to fetch applications');
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
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
      <h1 className="text-2xl font-bold mb-2">Applications for: {job?.title}</h1>
      <p className="text-gray-600 mb-6">Total applications: {applications.length}</p>
      
      {applications.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-700">No applications yet for this job posting.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Applied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-purple-700">{application.applicantName}</div>
                    <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-green-600 hover:text-green-900">Contact</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JobApplicationsContent;