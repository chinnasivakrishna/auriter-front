import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, Users, List, Calendar, Tag, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../Alerts/AlertDialog';
import { Card, CardHeader, CardTitle, CardContent } from '../UI/Card';
import Cookies from 'js-cookie';

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

const JobCard = ({ job, onView, onEdit, onDelete, onViewApplications }) => {
  const date = new Date(job.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-purple-700 mb-2">{job.title}</h3>
            <div className="flex items-center text-gray-500 mb-1">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">Posted on {date}</span>
            </div>
            <div className="flex items-center text-gray-500 mb-3">
              <Tag className="h-4 w-4 mr-2" />
              <StatusBadge status={job.status} />
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => onView(job._id)}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
              title="View Job"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onEdit(job._id)}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-green-50 text-green-500 hover:bg-green-100 transition-colors"
              title="Edit Job"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onDelete(job._id)}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              title="Delete Job"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button 
          onClick={() => onViewApplications(job._id)}
          className="mt-4 flex items-center text-purple-600 hover:text-purple-800 font-medium"
        >
          <Users className="h-4 w-4 mr-2" />
          View Applicants
        </button>
      </CardContent>
    </Card>
  );
};

const MyListingsContent = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteJobId, setDeleteJobId] = useState(null);
  const [viewType, setViewType] = useState('cards'); // 'cards' or 'table'
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const response = await fetch('https://auriter-back.onrender.com/api/jobs/my-jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch listings');
      
      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteJobId) return;

    try {
      const token = Cookies.get('token');
      const response = await fetch(`https://auriter-back.onrender.com/api/jobs/${deleteJobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete job');
      
      setListings(listings.filter(job => job._id !== deleteJobId));
      setDeleteJobId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleEditJob = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleViewApplications = (jobId) => {
    navigate(`/applications/${jobId}`);
  };

  const handlePostJob = () => {
    navigate('/post-jobs');
  };

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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-bold text-gray-800">My Job Listings</CardTitle>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePostJob} 
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </button>
            <button 
              onClick={() => setViewType('cards')} 
              className={`p-2.5 rounded-md ${viewType === 'cards' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Card View"
            >
              <List className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setViewType('table')} 
              className={`p-2.5 rounded-md ${viewType === 'table' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Table View"
            >
              <Users className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
              <p className="font-medium">{error}</p>
              <button 
                onClick={() => setError('')} 
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {listings.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-gray-700 mb-2">No job listings yet</h3>
              <p className="text-gray-500 mb-4">Post your first job to get started</p>
              <button 
                onClick={handlePostJob} 
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Post a Job
              </button>
            </div>
          ) : viewType === 'cards' ? (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
              {listings.map((job) => (
                <JobCard 
                  key={job._id} 
                  job={job} 
                  onView={handleViewJob}
                  onEdit={handleEditJob}
                  onDelete={setDeleteJobId}
                  onViewApplications={handleViewApplications}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listings.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-purple-700">{job.title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewApplications(job._id)}
                          className="flex items-center text-purple-600 hover:text-purple-800"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          View Applicants
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <Eye 
                            className="h-5 w-5 text-blue-500 cursor-pointer hover:text-blue-700" 
                            onClick={() => handleViewJob(job._id)}
                          />
                          <Edit2 
                            className="h-5 w-5 text-green-500 cursor-pointer hover:text-green-700" 
                            onClick={() => handleEditJob(job._id)}
                          />
                          <Trash2 
                            className="h-5 w-5 text-red-500 cursor-pointer hover:text-red-700" 
                            onClick={() => setDeleteJobId(job._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job listing
              and remove all associated applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyListingsContent;