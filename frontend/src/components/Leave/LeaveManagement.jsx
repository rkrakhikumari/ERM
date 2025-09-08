import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, User } from 'lucide-react';
import ApplyLeave from './ApplyLeave';
import MyLeaves from './MyLeaves';
import PendingLeaves from './PendingLeaves';
import Holidays from './Holidays';
import AddHoliday from './AddHoliday';
import LeaveBalance from './LeaveBalance';
import LeaveCalendar from './LeaveCalendar';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/api';

export default function LeaveManagement() {
  const [activeTab, setActiveTab] = useState('apply');
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchLeaveBalance(user.id);
    }
  }, [user, refreshTrigger]);

  const fetchLeaveBalance = async (employeeId) => {
    try {
      const response = await api.get(`/leaves/balance/${employeeId}`);
      setLeaveBalance(response.data);
    } catch (err) {
      console.error('Error fetching leave balance:', err);
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
        active
          ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/30'
          : 'bg-[#161B22] text-gray-400 hover:text-white hover:bg-[#1F2937] border border-white/10'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-2 bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg">
          Leave Management
        </h1>
        <p className="text-lg text-gray-400">
          Manage your time off and team leave requests
        </p>
      </div>

      {/* Leave Balance */}
      <LeaveBalance balance={leaveBalance} />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-4 mb-8 cursor-pointer">
        <TabButton
          id="apply"
          label="Apply Leave"
          icon={Plus}
          active={activeTab === 'apply'}
          onClick={setActiveTab}
        />
        <TabButton
          id="my-leaves"
          label="My Leaves"
          icon={User}
          active={activeTab === 'my-leaves'}
          onClick={setActiveTab}
        />
        {(user?.role === 'manager' || user?.role === 'hr' || user?.role === 'Admin') && (
          <TabButton
            id="pending"
            label="Pending Approvals"
            icon={Clock}
            active={activeTab === 'pending'}
            onClick={setActiveTab}
          />
        )}
        <TabButton
          id="calendar"
          label="Team Calendar"
          icon={Calendar}
          active={activeTab === 'calendar'}
          onClick={setActiveTab}
        />
        <TabButton
          id="holidays"
          label="Holidays"
          icon={Calendar}
          active={activeTab === 'holidays'}
          onClick={setActiveTab}
        />
        {(user?.role === 'manager' || user?.role === 'hr' || user?.role === 'Admin') && (
          <TabButton
            id="add-holiday"
            label="Add Holiday"
            icon={Plus}
            active={activeTab === 'add-holiday'}
            onClick={setActiveTab}
          />
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'apply' && (
        <ApplyLeave onSuccess={triggerRefresh} />
      )}

      {activeTab === 'my-leaves' && (
        <MyLeaves refreshTrigger={refreshTrigger} />
      )}

      {activeTab === 'pending' && (
        <PendingLeaves />
      )}

      {activeTab === 'calendar' && (
        <LeaveCalendar />
      )}

      {activeTab === 'holidays' && (
        <Holidays />
      )}

      {activeTab === 'add-holiday' && (
        <AddHoliday />
      )}
    </div>
  );
}
