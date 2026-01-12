import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, RefreshCw } from 'lucide-react';
import api from '../../api/api';
import { formatDate } from './utils';

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/leaves/holiday');
      setHolidays(response.data);
    } catch (err) {
      setError('Failed to fetch holidays');
      console.error('Error fetching holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  const isPast = (date) => {
    return new Date(date) < new Date();
  };

  const isToday = (date) => {
    const today = new Date();
    const holidayDate = new Date(date);
    return today.toDateString() === holidayDate.toDateString();
  };

  const getHolidayStatus = (date) => {
    if (isToday(date)) return { status: 'Today', color: 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30' };
    if (isUpcoming(date)) return { status: 'Upcoming', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    return { status: 'Past', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  };

  // Sort holidays by date
  const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date));

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
        <h2 className="text-2xl font-bold text-white">Company Holidays</h2>
        <button
          onClick={fetchHolidays}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedHolidays.map((holiday) => {
          const holidayStatus = getHolidayStatus(holiday.date);
          
          return (
            <div
              key={holiday.id}
              className="bg-[#161B22] backdrop-blur-lg border border-white/20 rounded-2xl p-6 transition-all duration-300 hover:border-[#3B82F6] hover:shadow-xl hover:shadow-[#3B82F6]/20 hover:-translate-y-1"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-full border ${holidayStatus.color}`}>
                  {holidayStatus.status}
                </span>
              </div>

              {/* Holiday Details */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">{holiday.name}</h3>
                
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-sm font-semibold">
                    {formatDate(holiday.date)}
                  </span>
                </div>

                {holiday.department && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-sm">{holiday.department}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {holidays.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No holidays found</p>
          <p className="text-sm">Check back later for holiday announcements</p>
        </div>
      )}
    </div>
  );
}