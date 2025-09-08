import React, { useState } from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const Message = ({ message, type }) => {
    if (!message) return null;
  
    const typeStyles = {
      success: "bg-green-500/20 text-green-400 border border-green-500/30",
      error: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    const icon = type === 'success' ? <FaCheckCircle className="w-5 h-5" /> : <FaTimesCircle className="w-5 h-5" />;
  
    return (
      <div className={`p-4 rounded-xl mb-4 transition-opacity duration-300 ${typeStyles[type]}`}>
        <div className="flex items-center gap-2">
          {icon}
          <span>{message}</span>
        </div>
      </div>
    );
  };
const ManualEntryForm = ({ onSubmit, onClose }) => {
    const [clockIn, setClockIn] = useState('');
    const [clockOut, setClockOut] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (new Date(clockIn) >= new Date(clockOut)) {
            setError("Clock-out time must be after clock-in time.");
            return;
        }
        onSubmit({
            clock_in: clockIn,
            clock_out: clockOut,
            reason: reason,
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-[#161B22] text-gray-200 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">Request Manual Entry</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-all hover:translate-y-1 cursor-pointer">
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>
                
                {error && (
                    <div className="p-4 rounded-xl mb-4 bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-2">
                        <FaExclamationTriangle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Clock In</label>
                        <input
                            type="datetime-local"
                            value={clockIn}
                            onChange={(e) => setClockIn(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white shadow-sm focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-colors p-3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Clock Out</label>
                        <input
                            type="datetime-local"
                            value={clockOut}
                            onChange={(e) => setClockOut(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white shadow-sm focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-colors p-3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="3"
                            required
                            className="mt-1 block w-full rounded-lg border-gray-600 bg-gray-800 text-white shadow-sm focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-colors p-3"
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-all hover:translate-y-1 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-lg bg-[#3B82F6] text-white font-semibold hover:bg-[#2563EB] transition-all hover:translate-y-1 cursor-pointer"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default ManualEntryForm;