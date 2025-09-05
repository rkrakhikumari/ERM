import React, { useState } from 'react';
import api from '../../api/api';

const ExportReview = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!employeeId) {
      setMessage('Please enter an Employee ID to export the review.');
      return;
    }
    setMessage('');
    setLoading(true);

    try {
      const response = await api.get(`/reviews/export?employee_id=${employeeId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `review_employee_${employeeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage('Error downloading PDF. Please check the Employee ID.');
      console.error('Download error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl p-8 font-sans">
      <h2 className="text-2xl font-bold text-white mb-6">Export Review as PDF</h2>
      <div className="bg-[#161B22] border border-white/20 rounded-2xl p-8 space-y-4">
        <p className="text-gray-400">
          Enter an Employee ID to generate and download their performance review as a PDF.
        </p>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-300 mb-2">Employee ID</label>
            <input 
              type="text" 
              id="employeeId" 
              value={employeeId} 
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-4 py-2 bg-[#0D1117] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent" 
              placeholder="Enter Employee ID" 
            />
          </div>
          <button 
            onClick={handleDownload} 
            disabled={!employeeId || loading}
            className="px-6 py-2.5 text-base font-semibold bg-[#3B82F6] text-white rounded-xl border border-[#3B82F6] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3B82F6]/30 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-red-300">{message}</p>}
      </div>
    </div>
  );
};

export default ExportReview;