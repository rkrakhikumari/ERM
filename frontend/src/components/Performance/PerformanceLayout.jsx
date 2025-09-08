import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import api from "../../api/api";

const PerformanceLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cycles, setCycles] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCycles = async () => {
    try {
        setLoadingCycles(true);
        const res = await api.get("/reviews/cycles");
        setCycles(res.data || []);
      } catch (err) {
        console.error("Error fetching cycles:", err);
        setError("Failed to load performance cycles.");
       } finally {
       setLoadingCycles(false);
      }
    };

    fetchCycles();
  }, []);

  if (loading) {
    return null;
  }

  const userRole = user?.role?.toLowerCase();
  const isAdmin = userRole === "admin";
  const isEmployee = userRole === "employee";

  const navItems = [
    { name: "Start Cycle", path: "create-cycle", visible: isAdmin },
    { name: "Define Goals", path: "define-goals", visible: isAdmin },
    { name: "View My Goals", path: "view-goals", visible: true },
    { name: "Submit Feedback", path: "submit-feedback", visible: true },
    { name: "Review Summary", path: "summary", visible: isAdmin },
    { name: "Export Review", path: "export", visible: isAdmin },
  ];

  const showTable = location.pathname === "/performance" || location.pathname === "/performance/";

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
             ${
             isActive
                    ? "bg-[#3B82F6] text-white"
                    : "bg-[#161B22] text-gray-300 hover:bg-[#1f262e]"
                   }
                  `} >
                    {item.name}
                </button>
                 );
               })}
               </nav>

      {showTable && (
       <div className="mb-8 bg-[#161B22] rounded-xl border border-white/10 p-6 shadow-lg">
       <h2 className="text-2xl font-bold mb-4 text-[#3B82F6]">Performance Cycles</h2>

       {loadingCycles ? (
       <p className="text-gray-400">Loading cycles...</p>
        ) : error ? (
         <p className="text-red-500">{error}</p>
         ) : cycles.length === 0 ? (
         <p className="text-gray-400">No cycles found.</p>
          ) : (
         <table className="w-full table-auto border-collapse text-left text-gray-300">
         <thead className="bg-[#0D1117] text-gray-400 uppercase text-sm">
         <tr>
         <th className="px-4 py-3">#</th>
        <th className="px-4 py-3">Name</th> 
        <th className="px-4 py-3">Start Date</th>
        <th className="px-4 py-3">End Date</th>
        <th className="px-4 py-3">Created At</th>
        </tr>
         </thead>
         <tbody>
           {cycles.map((cycle, idx) => (
          <tr key={cycle.id} className="border-t border-white/10">
          <td className="px-4 py-3">{idx + 1}</td>
          <td className="px-4 py-3 font-medium">{cycle.name}</td>
           <td className="px-4 py-3">
           {new Date(cycle.start_date).toLocaleDateString("en-IN")}
           </td>
           <td className="px-4 py-3">
           {new Date(cycle.end_date).toLocaleDateString("en-IN")}
           </td>
           <td className="px-4 py-3">
           {new Date(cycle.created_at).toLocaleString("en-IN")}
            </td>
           </tr>
             ))}
           </tbody>
          </table>
           ) }
           </div>
)}

 {/* Nested Routes */}
    <main className="flex-1 overflow-y-auto">
    <Outlet />
     </main>
    </div>
  );
};

export default PerformanceLayout;
