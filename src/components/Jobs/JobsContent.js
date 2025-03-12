// In JobsContent.js
import {Routes, Route} from 'react-router-dom';
import JobDetail from './JobDetail';
import JobListings from './JobListings';

const JobsContent = () => {
  return (
    <Routes>
      <Route path="/" element={<JobListings />} />
      <Route path="/:id" element={<JobDetail />} />  // Changed from /detail/:id
    </Routes>
  );
};

export default JobsContent;