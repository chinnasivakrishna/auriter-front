import React, { useState } from 'react';
import { Plus, X, AlertCircle, CheckCircle2, Loader2, ArrowRight, Edit2 } from 'lucide-react';
import Cookies from 'js-cookie';

const PostJobsContent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    location: '',
    type: 'full-time',
    experience: { min: 0, max: 0 },
    salary: { min: 0, max: 0, currency: 'USD' },
    skills: [''],
    benefits: [''],
    applicationDeadline: '',
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleArrayFieldChange = (field, index, value) => {
    const newArray = [...jobForm[field]];
    newArray[index] = value;
    setJobForm({ ...jobForm, [field]: newArray });
  };

  const addArrayField = (field) => {
    setJobForm({
      ...jobForm,
      [field]: [...jobForm[field], '']
    });
  };

  const removeArrayField = (field, index) => {
    const newArray = jobForm[field].filter((_, i) => i !== index);
    setJobForm({ ...jobForm, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the token from cookies
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch('https://auriter-back.onrender.com/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(jobForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to post job');
      }

      const data = await response.json();
      setSuccess('Job posted successfully!');
      setError('');
      
      // Reset form after successful submission
      setJobForm({
        title: '',
        company: '',
        description: '',
        requirements: [''],
        responsibilities: [''],
        location: '',
        type: 'full-time',
        experience: { min: 0, max: 0 },
        salary: { min: 0, max: 0, currency: 'USD' },
        skills: [''],
        benefits: [''],
        applicationDeadline: '',
        status: 'active'
      });
      setCurrentStep(1);
    } catch (err) {
      setError(err.message || 'Failed to post job');
      setSuccess('');
    }
  };

  const generateJobDetails = async () => {
    try {
      setIsGenerating(true);
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch('https://auriter-back.onrender.com/api/jobs/generate-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: jobForm.title,
          company: jobForm.company,
          type: jobForm.type,
          location: jobForm.location
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate job details');
      }

      const data = await response.json();
      
      setJobForm({
        ...jobForm,
        description: data.description || jobForm.description,
        requirements: data.requirements?.length ? data.requirements : jobForm.requirements,
        responsibilities: data.responsibilities?.length ? data.responsibilities : jobForm.responsibilities,
        skills: data.skills?.length ? data.skills : jobForm.skills,
        benefits: data.benefits?.length ? data.benefits : jobForm.benefits,
        experience: data.experience || jobForm.experience,
        salary: data.salary || jobForm.salary
      });

      setCurrentStep(2);
    } catch (err) {
      setError(err.message || 'Failed to generate job details');
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate first step
      if (!jobForm.title || !jobForm.company || !jobForm.type || !jobForm.location) {
        setError('Please fill all required fields');
        return;
      }
      generateJobDetails();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Render step 1: Basic information
  const renderStepOne = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Job Title*</label>
          <input
            type="text"
            value={jobForm.title}
            onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Company*</label>
          <input
            type="text"
            value={jobForm.company}
            onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Job Type*</label>
          <select
            value={jobForm.type}
            onChange={(e) => setJobForm({...jobForm, type: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            required
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="remote">Remote</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Location*</label>
          <input
            type="text"
            value={jobForm.location}
            onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          disabled={isGenerating}
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Generating Details...
            </>
          ) : (
            <>
              Next <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Render step 2: AI-generated content with edit options
  const renderStepTwo = () => (
    <div className="space-y-6">
      {/* Description */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <span className="text-xs text-purple-600">AI Generated</span>
        </div>
        <textarea
          value={jobForm.description}
          onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
          required
        />
      </div>

      {/* Dynamic Fields Section */}
      {['requirements', 'responsibilities', 'skills', 'benefits'].map((field) => (
        <div key={field} className="bg-gray-50 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-semibold text-gray-700 capitalize">
              {field}
            </label>
            <span className="text-xs text-purple-600">AI Generated</span>
          </div>
          <div className="space-y-3">
            {jobForm[field].map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayFieldChange(field, index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  required
                />
                {jobForm[field].length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField(field, index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayField(field)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
            >
              <Plus size={16} className="mr-2" />
              Add {field.slice(0, -1)}
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-3 text-purple-600 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );

  // Render step 3: Salary, experience and deadline
  const renderStepThree = () => (
    <div className="space-y-6">
      {/* Experience and Salary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Experience Range</h3>
            <span className="text-xs text-purple-600">AI Generated</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Minimum (years)</label>
              <input
                type="number"
                value={jobForm.experience.min}
                onChange={(e) => setJobForm({
                  ...jobForm,
                  experience: { ...jobForm.experience, min: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Maximum (years)</label>
              <input
                type="number"
                value={jobForm.experience.max}
                onChange={(e) => setJobForm({
                  ...jobForm,
                  experience: { ...jobForm.experience, max: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                min="0"
                required
              />
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Salary Range</h3>
            <span className="text-xs text-purple-600">AI Generated</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Minimum</label>
              <input
                type="number"
                value={jobForm.salary.min}
                onChange={(e) => setJobForm({
                  ...jobForm,
                  salary: { ...jobForm.salary, min: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Maximum</label>
              <input
                type="number"
                value={jobForm.salary.max}
                onChange={(e) => setJobForm({
                  ...jobForm,
                  salary: { ...jobForm.salary, max: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                min="0"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Application Deadline */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Application Deadline</label>
        <input
          type="date"
          value={jobForm.applicationDeadline}
          onChange={(e) => setJobForm({...jobForm, applicationDeadline: e.target.value})}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="px-6 py-3 text-purple-600 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200"
        >
          Post Job
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl p-8">
        <h2 className="text-3xl font-bold text-white">Post a New Job</h2>
        <p className="text-purple-100 mt-2">Create an attractive job listing to find the perfect candidate</p>
      </div>
      
      <div className="bg-white rounded-b-xl shadow-xl p-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="w-full flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`h-1 flex-1 ${currentStep > 1 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            </div>
            <div className="w-full flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <div className={`h-1 flex-1 ${currentStep > 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            </div>
            <div className="w-full flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm font-medium text-gray-600">
            <div className="w-full text-center">Basic Info</div>
            <div className="w-full text-center">Job Details</div>
            <div className="w-full text-center">Final Details</div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
            <CheckCircle2 size={20} />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {currentStep === 1 && renderStepOne()}
          {currentStep === 2 && renderStepTwo()}
          {currentStep === 3 && renderStepThree()}
        </form>
      </div>
    </div>
  );
};

export default PostJobsContent;