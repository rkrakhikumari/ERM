import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../auth/AuthContext";

const PerformanceLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return null; 
  }

  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === 'admin';
  const isEmployee = userRole === 'employee';

  const navItems = [
    { name: 'Start Cycle', path: 'create-cycle', visible: isAdmin },
    { name: 'Define Goals', path: 'define-goals', visible: isAdmin },
    { name: 'View My Goals', path: 'view-goals', visible: true },
    { name: 'Submit Feedback', path: 'submit-feedback', visible: true },
    { name: 'Review Summary', path: 'summary', visible: isAdmin },
    { name: 'Export Review', path: 'export', visible: isAdmin },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0D1117] text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-2 bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg">
          Performance Management
        </h1>
        <p className="text-lg text-gray-400">
          Manage review cycles, goals, and employee feedback.
        </p>
      </div>
      
      {/* Navigation Tabs */}
      <nav className="mb-6 flex space-x-4 overflow-x-auto">
        {navItems.map((item) => {
          if (!item.visible) return null;
          const isActive = location.pathname.endsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(`/performance/${item.path}`)}
              className={`whitespace-nowrap py-2 px-4 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer
                ${isActive
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[#161B22] text-gray-300 hover:bg-[#1f262e]'}
              `}
            >
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default PerformanceLayout;
