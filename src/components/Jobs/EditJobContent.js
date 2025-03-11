import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Save, Clock, DollarSign, Star, Briefcase, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../UI/Card';

const EditJobContent = ({ jobId }) => {
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formState, setFormState] = useState({
    title: '',
    company: '',
    type: 'full-time',
    location: '',
    description: '',
    requirements: '',
    responsibilities: '',
    skills: '',
    benefits: '',
    experience: {
      min: 0,
      max: 5
    },
    salary: {
      min: 0,
      max: 100000
    },
    status: 'active'
  });

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
        
        // Format the job data for the form
        setFormState({
          title: data.title || '',
          company: data.company || '',
          type: data.type || 'full-time',
          location: data.location || '',
          description: data.description || '',
          requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : '',
          responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.join('\n') : '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          benefits: Array.isArray(data.benefits) ? data.benefits.join('\n') : '',
          experience: {
            min: data.experience?.min || 0,
            max: data.experience?.max || 5
          },
          salary: {
            min: data.salary?.min || 0,
            max: data.salary?.max || 100000
          },
          status: data.status || 'active'
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [jobId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormState({
        ...formState,
        [parent]: {
          ...formState[parent],
          [child]: parseInt(value, 10)
        }
      });
    } else {
      setFormState({
        ...formState,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError(null);
    
    try {
      // Format data for submission
      const formattedData = {
        ...formState,
        requirements: formState.requirements.split('\n').filter(item => item.trim() !== ''),
        responsibilities: formState.responsibilities.split('\n').filter(item => item.trim() !== ''),
        skills: formState.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
        benefits: formState.benefits.split('\n').filter(item => item.trim() !== '')
      };
      
      const token = Cookies.get('token');
      const response = await fetch(`https://auriter-back.onrender.com/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update job');
      }
      
      setSuccessMessage('Job updated successfully!');
      
      // Navigate back to job listings after 2 seconds
      setTimeout(() => {
        navigate('/my-listings');
      }, 2000);
    } catch (err) {
      setError(err.message);
      window.scrollTo(0, 0);
    } finally {
      setSubmitLoading(false);
    }
  };

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'closed', label: 'Closed' },
    { value: 'expired', label: 'Expired' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800">Edit Job: {job?.title}</CardTitle>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formState.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Company */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company*
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formState.company}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Job Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Job Type*
                </label>
                <select
                  id="type"
                  name="type"
                  value={formState.type}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  required
                >
                  {jobTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location*
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formState.location}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="City, Country or Remote"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status*
                </label>
                <select
                  id="status"
                  name="status"
                  value={formState.status}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  required
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Experience (years)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="experience.min" className="block text-xs text-gray-500 mb-1">
                      Minimum
                    </label>
                    <input
                      type="number"
                      id="experience.min"
                      name="experience.min"
                      value={formState.experience.min}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="experience.max" className="block text-xs text-gray-500 mb-1">
                      Maximum
                    </label>
                    <input
                      type="number"
                      id="experience.max"
                      name="experience.max"
                      value={formState.experience.max}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Salary Range (USD)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="salary.min" className="block text-xs text-gray-500 mb-1">
                      Minimum
                    </label>
                    <input
                      type="number"
                      id="salary.min"
                      name="salary.min"
                      value={formState.salary.min}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="salary.max" className="block text-xs text-gray-500 mb-1">
                      Maximum
                    </label>
                    <input
                      type="number"
                      id="salary.max"
                      name="salary.max"
                      value={formState.salary.max}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Provide a detailed description of the role and responsibilities.
                </p>
              </div>

              {/* Requirements */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formState.requirements}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter each requirement on a new line"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  List each requirement on a new line.
                </p>
              </div>

              {/* Responsibilities */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 mb-1">
                  Responsibilities
                </label>
                <textarea
                  id="responsibilities"
                  name="responsibilities"
                  value={formState.responsibilities}
                  onChange={handleInputChange}
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter each responsibility on a new line"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  List each responsibility on a new line.
                </p>
              </div>

              {/* Skills */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                  <Star className="h-4 w-4 inline mr-1" />
                  Skills
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  value={formState.skills}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. JavaScript, React, Node.js"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  Enter skills separated by commas.
                </p>
              </div>

              {/* Benefits */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits
                </label>
                <textarea
                  id="benefits"
                  name="benefits"
                  value={formState.benefits}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter each benefit on a new line"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  List each benefit on a new line.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/my-listings')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center"
              >
                {submitLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Job
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
 
export default EditJobContent;