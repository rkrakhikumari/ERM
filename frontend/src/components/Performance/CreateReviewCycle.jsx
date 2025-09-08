import React, { useState } from 'react';
import api from '../../api/api'; 

const CreateReviewCycle = () => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState(null); 
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/reviews/create-cycle', {
        name,
        start_date: startDate,
        end_date: endDate,
      });

      if (response.status === 200) {
        setStatus('success');
        setMessage(`Review cycle "${response.data.name}" started successfully!`);
        setName('');
        setStartDate('');
        setEndDate('');
      } else {
        setStatus('error');
        setMessage(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating review cycle:', error);
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Error starting review cycle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-2 bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg animate-fade-slide">
          Start a New Review Cycle
        </h1>
        <p className="text-lg text-gray-400">
          Define the period for your next performance review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#161B22] border border-white/20 rounded-2xl p-8 space-y-6">
        {/* Cycle Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Cycle Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200"
            placeholder="e.g., Q4 2023 Performance Review"
            required
          />
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 px-6 py-3 text-base font-semibold bg-[#3B82F6] text-white rounded-xl border border-[#3B82F6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Cycle...
            </>
          ) : (
            'Create Cycle'
          )}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <div className={`mt-6 p-4 rounded-xl text-sm border ${status === 'success' ? 'bg-green-900/30 text-green-300 border-green-600/50' : 'bg-red-900/30 text-red-300 border-red-600/50'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default CreateReviewCycle;