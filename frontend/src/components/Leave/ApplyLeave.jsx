import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../api/api';

export default function ApplyLeave({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leaveForm, setLeaveForm] = useState({
    start_date: '',
    end_date: '',
    leave_type: 'casual',
    reason: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await api.post('/leaves/apply', leaveForm);
      setLeaveForm({ start_date: '', end_date: '', leave_type: 'casual', reason: '' });
      onSuccess && onSuccess();
      alert('Leave application submitted successfully!');
    } catch (err) {
      setError('Failed to apply for leave');
      console.error('Error applying for leave:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLeaveForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Apply for Leave</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              value={leaveForm.start_date}
              onChange={(e) => handleInputChange('start_date', e.target.value)}
              className="w-full px-4 py-3 bg-[#0D1117] border border-white/20 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-all duration-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              value={leaveForm.end_date}
              onChange={(e) => handleInputChange('end_date', e.target.value)}
              className="w-full px-4 py-3 bg-[#0D1117] border border-white/20 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-all duration-300"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Leave Type</label>
          <select
            value={leaveForm.leave_type}
            onChange={(e) => handleInputChange('leave_type', e.target.value)}
            className="w-full px-4 py-3 bg-[#0D1117] border border-white/20 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-all duration-300"
          >
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="privilege">Privilege Leave</option>
            <option value="wfh">Work From Home</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Reason</label>
          <textarea
            value={leaveForm.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            className="w-full px-4 py-3 bg-[#0D1117] border border-white/20 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none h-32 resize-none transition-all duration-300"
            placeholder="Please provide a reason for your leave request..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Submitting...' : 'Apply for Leave'}
        </button>
      </form>
    </div>
  );
}