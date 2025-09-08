import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import api from '../../api/api';

export default function LeaveBalance({ refreshTrigger }) {
  const [balance, setBalance] = useState({ leaves_taken: 0, remaining: 30 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get('/leaves/balance/me');
        const data = response.data;

        setBalance({
          leaves_taken: data.leaves_taken,
          remaining: data.remaining,
        });

      } catch (err) {
        setError('Failed to fetch leave balance.');
        console.error("Failed to fetch leave balance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  const totalAllowed = balance.leaves_taken + balance.remaining;
  const progressPercentage = (balance.leaves_taken / totalAllowed) * 100;

  return (
    <div className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#3B82F6]" />
        Your Leave Balance
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center p-4 bg-[#0D1117] rounded-xl border border-white/10">
          <div className="text-3xl font-bold text-[#3B82F6] mb-1">{balance.remaining}</div>
          <div className="text-sm text-gray-400 font-medium">Days Remaining</div>
        </div>
        <div className="text-center p-4 bg-[#0D1117] rounded-xl border border-white/10">
          <div className="text-3xl font-bold text-red-400 mb-1">{balance.leaves_taken}</div>
          <div className="text-sm text-gray-400 font-medium">Days Used</div>
        </div>
        <div className="text-center p-4 bg-[#0D1117] rounded-xl border border-white/10">
          <div className="text-3xl font-bold text-green-400 mb-1">{totalAllowed}</div>
          <div className="text-sm text-gray-400 font-medium">Total Allowed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-300">Leave Usage</span>
          <span className="text-sm font-bold text-[#3B82F6]">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progressPercentage > 80
                ? 'bg-red-500'
                : progressPercentage > 60
                ? 'bg-yellow-500'
                : 'bg-[#3B82F6]'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{balance.leaves_taken} days</span>
          <span>{totalAllowed} days</span>
        </div>
      </div>
    </div>
  );
}
