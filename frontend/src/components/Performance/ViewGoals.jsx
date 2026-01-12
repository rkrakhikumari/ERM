import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../auth/AuthContext';

const ViewGoals = () => {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setEmployeeId(user.id);
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/reviews/goals/${employeeId}`);
      setGoals(response.data);
    } catch (err) {
      setError('No goals found for this employee.');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-sans">
      <h2 className="text-2xl font-bold text-white mb-6">View My Goals</h2>
      <style>
        {`
          /* Hide the number input arrows for Chrome, Safari, Edge, Opera */
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          /* Hide the number input arrows for Firefox */
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}
      </style>
      <div className="bg-[#161B22] border border-white/20 rounded-2xl p-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1">
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-300 mb-2">Employee ID</label>
            <input type="number" id="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent" placeholder="Enter Employee ID" />
          </div>
          <button onClick={fetchGoals} disabled={!employeeId || loading}
            className="px-6 py-2.5 text-base font-semibold bg-[#3B82F6] text-white rounded-xl border border-[#3B82F6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer disabled:opacity-50 disabled:pointer-events-none">
            {loading ? 'Fetching...' : 'Fetch Goals'}
          </button>
        </div>
        {loading && <p className="text-gray-400">Loading goals...</p>}
        {error && <p className="text-red-300">{error}</p>}
        {!loading && goals.length > 0 && (
          <ul className="space-y-4 pt-4">
            {goals.map((goal) => (
              <li key={goal.id} className="bg-[#0D1117] p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-[#3B82F6]">{goal.title}</h3>
                <p className="text-gray-300 mt-2">{goal.description}</p>
                <p className="text-sm text-gray-500 mt-2">Weight: <span className="font-semibold text-gray-400">{goal.weight}</span></p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
export default ViewGoals;
