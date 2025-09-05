// Utility functions for leave management components

export const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'approved':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'rejected':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const getLeaveTypeColor = (type) => {
  switch (type) {
    case 'sick':
      return 'bg-red-500/20 text-red-300';
    case 'casual':
      return 'bg-blue-500/20 text-blue-300';
    case 'privilege':
      return 'bg-purple-500/20 text-purple-300';
    case 'wfh':
      return 'bg-green-500/20 text-green-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

export const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end date
  return daysDiff;
};

export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

export const getLeaveTypeDisplay = (type) => {
  switch (type) {
    case 'sick':
      return 'Sick Leave';
    case 'casual':
      return 'Casual Leave';
    case 'privilege':
      return 'Privilege Leave';
    case 'wfh':
      return 'Work From Home';
    default:
      return type;
  }
};

export const getApproverLevelDisplay = (level) => {
  switch (level?.toLowerCase()) {
    case 'manager':
      return 'Manager';
    case 'hr':
      return 'HR';
    case 'admin':
      return 'Admin';
    default:
      return level || 'Unknown';
  }
};