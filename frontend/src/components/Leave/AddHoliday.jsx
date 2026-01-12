import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../api/api';

export default function AddHoliday() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    department: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = {
        name: holidayForm.name,
        date: holidayForm.date,
        department: holidayForm.department || null
      };
      await api.post('/leaves/holiday', payload);
      setHolidayForm({ name: '', date: '', department: '' });
      alert('Holiday added successfully!');
    } catch (err) {
      setError('Failed to add holiday');
      console.error('Error adding holiday:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setHolidayForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Add Company Holiday</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Holiday Name</label>
          <input
            type="text"
            value={holidayForm.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-[#0D1117] border border-white/20 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-all duration-300"
            placeholder="e.g., Diwali, Christmas, Independence Day"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Date</label>
          <input
            type="date"
            value={holidayForm.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-4 py-3 bg-[#0D1117] border border-white/20 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-all duration-300"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Department (Optional)</label>
          <input
            type="text"
            value={holidayForm.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="w-full px-4 py-3 bg-[#0D1117] border border-white/20 rounded-xl text-white focus:border-[#3B82F6] focus:outline-none transition-all duration-300"
            placeholder="Leave blank for company-wide holiday"
          />
          <p className="text-xs text-gray-500 mt-2">
            Specify a department if this holiday only applies to certain teams
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Adding Holiday...' : 'Add Holiday'}
        </button>
      </form>
    </div>
  );
}