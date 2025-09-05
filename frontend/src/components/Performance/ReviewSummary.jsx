import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const ReviewSummary = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    if (!employeeId) {
      setError('Please enter an Employee ID.');
      return;
    }
    setLoading(true);
    setError('');
    setSummary(null); // Clear previous summary
    try {
      const response = await api.get(`/reviews/summary/${employeeId}`);
      setSummary(response.data);
    } catch (err) {
      setError('No feedback found for this employee.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans">
      <h2 className="text-2xl font-bold text-white mb-6">Review Summary</h2>
      <div className="bg-[#161B22] border border-white/20 rounded-2xl p-8 space-y-4">
        {/* Input and button */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="flex-1 px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all duration-200"
          />
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="w-full md:w-auto px-6 py-3 text-base font-semibold bg-[#3B82F6] text-white rounded-xl border border-[#3B82F6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Fetching Summary...' : 'View Summary'}
          </button>
        </div>

        {/* Error message display */}
        {error && (
          <div className="p-4 bg-red-900/30 text-red-300 border border-red-600/50 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Summary display */}
        {summary && (
          <div className="bg-[#0D1117] p-6 rounded-xl border border-white/10">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">Average Rating</dt>
                <dd className="mt-1 text-lg font-bold text-[#3B82F6]">{summary.average_rating.toFixed(2)}</dd>
              </div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">Feedback Count</dt>
                <dd className="mt-1 text-lg font-bold text-gray-300">{summary.feedback_count}</dd>
              </div>
              <div className="py-2 col-span-1 md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Comments</dt>
                <dd className="mt-1">
                  <ul className="list-disc list-inside space-y-2">
                    {summary.comments.map((comment, index) => (
                      <li key={index} className="text-gray-400">{comment}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSummary;
