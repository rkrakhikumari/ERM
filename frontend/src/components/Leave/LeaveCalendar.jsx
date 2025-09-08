import React, { useState, useEffect } from 'react';
import { Calendar, Users, RefreshCw, Filter } from 'lucide-react';
import api from '../../api/api';
import { formatDate, getLeaveTypeColor, calculateLeaveDays } from './utils';

export default function LeaveCalendar() {
  const [calendarLeaves, setCalendarLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchCalendarLeaves();
  }, []);

  const fetchCalendarLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/leaves/calendar');
      setCalendarLeaves(response.data);
    } catch (err) {
      setError('Failed to fetch leave calendar');
      console.error('Error fetching calendar leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaves = calendarLeaves.filter(leave => 
    filterType === 'all' || leave.leave_type === filterType
  );

  // Group leaves by month
  const groupedLeaves = filteredLeaves.reduce((groups, leave) => {
    const month = new Date(leave.start_date).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(leave);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">Team Leave Calendar</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-[#161B22] border border-white/20 rounded-xl text-white text-sm focus:border-[#3B82F6] focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="casual">Casual</option>
              <option value="sick">Sick</option>
              <option value="privilege">Privilege</option>
              <option value="wfh">Work From Home</option>
            </select>
          </div>
          <button
            onClick={fetchCalendarLeaves}
            className="flex items-center gap-2 px-4 py-2 bg-[#161B22] border border-white/20 rounded-xl text-gray-400 hover:text-white transition-all duration-300 hover:border-[#3B82F6] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      {Object.keys(groupedLeaves).length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No approved leaves found</p>
          <p className="text-sm">Team leave calendar will appear here once leaves are approved</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedLeaves)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([month, leaves]) => (
              <div key={month} className="space-y-4">
                <h3 className="text-xl font-bold text-white border-b border-white/20 pb-2">
                  {month}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {leaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-xl p-4 transition-all duration-300 hover:border-[#3B82F6] hover:shadow-lg hover:shadow-[#3B82F6]/10"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>
                          {leave.leave_type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {calculateLeaveDays(leave.start_date, leave.end_date)} day(s)
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-3 h-3 text-[#3B82F6]" />
                          <span className="text-xs">Employee #{leave.employee_id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-3 h-3 text-[#3B82F6]" />
                          <span className="text-xs">
                            {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}