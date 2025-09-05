import { Outlet, NavLink } from "react-router-dom";
import { FaTachometerAlt, FaCog, FaHistory, FaHeartbeat } from "react-icons/fa";

export default function AdminLayout() {
  const navLinks = [
    { to: "dashboard", icon: <FaTachometerAlt />, text: "Dashboard" },
    { to: "settings", icon: <FaCog />, text: "Settings" },
    { to: "metrics", icon: <FaHeartbeat />, text: "Health Metrics" },
  ];

  return (
    <div className="flex bg-[#0D1117] min-h-screen text-white font-sans">
      <aside className="w-64 bg-[#161B22] backdrop-blur-lg border-r border-white/10 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-[#3B82F6] drop-shadow-lg">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/30"
                    : "text-gray-400 hover:bg-[#3B82F6]/20 hover:text-[#3B82F6] hover:-translate-y-0.5"
                }`
              }
            >
              <div className="text-lg">{link.icon}</div>
              {link.text}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}