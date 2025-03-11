import React, { useState, useEffect } from 'react';
import { Calendar, Briefcase, MapPin, DollarSign, Clock, Tag, Award, Check, Star } from 'lucide-react';
import Cookies from 'js-cookie';
import { Card, CardHeader, CardTitle, CardContent } from '../UI/Card';

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

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      closed: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold text-purple-700">{job?.title}</CardTitle>
            <StatusBadge status={job?.status || 'active'} />
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center text-gray-600">
              <Briefcase className="h-5 w-5 mr-2 text-purple-500" />
              <span>{job?.company || 'Company Name'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2 text-purple-500" />
              <span>{job?.location || 'Location'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2 text-purple-500" />
              <span>{job?.type || 'Full-time'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2 text-purple-500" />
              <span>Posted on: {new Date(job?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Job Description */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <Tag className="h-5 w-5 mr-2 text-purple-600" />
              Job Description
            </h2>
            <div className="text-gray-700 whitespace-pre-line">{job?.description}</div>
          </div>
          
          {/* Requirements */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <Check className="h-5 w-5 mr-2 text-purple-600" />
              Requirements
            </h2>
            {job?.requirements && Array.isArray(job.requirements) ? (
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-700 whitespace-pre-line">{job?.requirements}</div>
            )}
          </div>
          
          {/* Responsibilities */}
          {job?.responsibilities && (
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <Star className="h-5 w-5 mr-2 text-purple-600" />
                Responsibilities
              </h2>
              {Array.isArray(job.responsibilities) ? (
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-700 whitespace-pre-line">{job.responsibilities}</div>
              )}
            </div>
          )}
          
          {/* Skills */}
          {job?.skills && job.skills.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <Award className="h-5 w-5 mr-2 text-purple-600" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Additional Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Experience */}
              {job?.experience && (
                <div className="border-l-4 border-purple-400 pl-4 py-2">
                  <h3 className="text-sm font-medium text-gray-500">Experience</h3>
                  <p className="text-gray-800 font-medium">
                    {job.experience.min} - {job.experience.max} years
                  </p>
                </div>
              )}
              
              {/* Salary Range */}
              {job?.salary && (
                <div className="border-l-4 border-purple-400 pl-4 py-2">
                  <h3 className="text-sm font-medium text-gray-500">Salary Range</h3>
                  <p className="text-gray-800 font-medium">
                    ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                  </p>
                </div>
              )}
              
              {/* Benefits */}
              {job?.benefits && job.benefits.length > 0 && (
                <div className="border-l-4 border-purple-400 pl-4 py-2 md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Benefits</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job.benefits.map((benefit, index) => (
                      <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewJobContent;