import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { FaUsers, FaTasks, FaClipboardList, FaFileAlt, FaCog, FaHistory, FaHeartbeat } from "react-icons/fa";

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/dashboard");
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Employees", value: stats.total_employees, icon: <FaUsers /> },
    { title: "Total Projects", value: stats.total_projects, icon: <FaTasks /> },
    { title: "Total Leave Requests", value: stats.total_leaves, icon: <FaClipboardList /> },
    { title: "Pending Actions", value: stats.pending_actions, icon: <FaFileAlt /> },
  ];

  const adminNavButtons = [
    { title: "Global Settings", to: "/admin/settings", icon: <FaCog /> },
    { title: "Health Metrics", to: "/admin/metrics", icon: <FaHeartbeat /> },
  ];

  if (loading) return <div className="text-white text-center">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="p-8 bg-[#0D1117] min-h-screen text-white font-sans">
      <h1 className="text-4xl font-extrabold mb-8 bg-[#3B82F6] bg-clip-text text-transparent drop-shadow-lg animate-fade-slide">Admin Dashboard</h1>

      {/* Navigation Buttons Section */}
      <div className="flex flex-wrap gap-4 mb-12">
        {adminNavButtons.map((button) => (
          <button
            key={button.to}
            onClick={() => navigate(button.to)}
            className="flex items-center gap-3 px-6 py-3 text-base font-semibold bg-[#161B22] border border-white/20 rounded-xl transition-all duration-300 hover:border-[#3B82F6] hover:bg-[#3B82F6]/20 hover:text-[#3B82F6] hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="text-lg">{button.icon}</div>
            {button.title}
          </button>
        ))}
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-[#161B22] p-6 rounded-2xl shadow-lg border border-white/20 flex flex-col items-center justify-center transition-transform hover:-translate-y-1 hover:border-[#3B82F6] hover:shadow-xl hover:shadow-[#3B82F6]/20"
          >
            <div className="text-5xl mb-4 text-[#3B82F6] bg-gradient-to-r from-[#3B82F6] to-[#2563EB] bg-clip-text">
              {card.icon}
            </div>
            <p className="text-4xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-gray-400 mt-2">{card.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}