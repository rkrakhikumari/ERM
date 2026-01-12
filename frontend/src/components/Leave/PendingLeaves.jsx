import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Users, CheckCircle, XCircle, RefreshCw, User, Clock } from 'lucide-react';
import api from '../../api/api';
import { getStatusColor, getLeaveTypeColor, formatDate } from './utils';

export default function PendingLeaves() {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/leaves/pending');
      setPendingLeaves(response.data);
    } catch (err) {
      setError('Failed to fetch pending leaves');
      console.error('Error fetching pending leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId, status) => {
    try {
      setActionLoading(prev => ({ ...prev, [leaveId]: true }));
      await api.put(`/leaves/approve/${leaveId}`, { status });
      await fetchPendingLeaves(); 
      alert(`Leave ${status} successfully!`);
    } catch (err) {
      alert('Failed to update leave status');
      console.error('Error updating leave status:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
        <button
          onClick={fetchPendingLeaves}
          className="flex items-center gap-2 px-4 py-2 bg-[#161B22] border border-white/20 rounded-xl text-gray-400 hover:text-white transition-all duration-300 hover:border-[#3B82F6] cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {pendingLeaves.map((leave) => (
          <div
            key={leave.id}
            className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:border-[#3B82F6] hover:shadow-xl hover:shadow-[#3B82F6]/20"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3B82F6] rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>
                    {leave.leave_type.toUpperCase()}
                  </span>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-full border ${getStatusColor(leave.status)}`}>
                {leave.status}
              </span>
            </div>

            {/* Leave Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-sm">Employee : {leave.employee_name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-sm">
                  {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                </span>
              </div>
              <div className="flex items-start gap-2 text-gray-400">
                <FileText className="w-4 h-4 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                <span className="text-sm">{leave.reason}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => handleApproveLeave(leave.id, 'approved')}
                disabled={actionLoading[leave.id]}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl font-semibold transition-all duration-300 hover:bg-green-500/30 hover:-translate-y-0.5 disabled:opacity-50 flex-1 justify-center cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading[leave.id] ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => handleApproveLeave(leave.id, 'rejected')}
                disabled={actionLoading[leave.id]}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold transition-all duration-300 hover:bg-red-500/30 hover:-translate-y-0.5 disabled:opacity-50 flex-1 justify-center cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                {actionLoading[leave.id] ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingLeaves.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No pending leave requests</p>
          <p className="text-sm">All leave requests have been processed</p>
        </div>
      )}
    </div>
  );
}