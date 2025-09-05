import { LayoutDashboard, User, Users, Briefcase, DollarSign, Calendar, Settings, Bell, BarChart2, HardDrive } from "lucide-react";
import { NavLink } from "react-router-dom";
import { FaClockRotateLeft } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { GoPlusCircle } from "react-icons/go";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const isEmployee = user?.role === 'Employee';

  const menuItems = [
    { name: "Profile", path: "/profile", visible: true, icon: <CgProfile size={20} /> },
    { name: "Dashboard", path: "/admin/dashboard", visible: isAdmin, icon: <LayoutDashboard size={20} /> },
    { name: "Employees", path: "/employees", visible: isAdmin, icon: <User size={20} /> },
    { name: "Projects", path: "/projects", visible: isAdmin, icon: <Briefcase size={20} /> },
    { name: "Teams", path: "/teams", visible: isAdmin, icon: <Users size={20} /> },
    { name: "Attendance", path: "/attendance", visible: true, icon: <FaClockRotateLeft size={20} /> },
    { name: "Timesheet", path: "/timesheets", visible: isAdmin, icon: <Calendar size={20} /> },
    { name: "Payroll", path: "/payroll", visible: isAdmin, icon: <DollarSign size={20} /> },
    { name: "Leaves", path: "/leaves", visible: true, icon: <Calendar size={20} /> },
    { name: "Asset Inventory", path: "/assets", visible: isAdmin, icon: <HardDrive size={20} /> },
    { name: "Asset Request", path: "/assets/request", visible: isEmployee, icon: <GoPlusCircle size={20} /> },
    { name: "Performance", path: "/performance", visible: true, icon: <BarChart2 size={20} /> },
    { name: "Notifications", path: "/notification", visible: true, icon: <Bell size={20} /> },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#0D1117] shadow-xl flex flex-col border-r border-gray-700">
      {/* ERM Logo Section */}
      <div className="h-16 flex items-center justify-center pt-8 pb-4">
        <span className="font-extrabold text-4xl tracking-widest bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#2563EB] text-transparent bg-clip-text drop-shadow-lg">
          ERM
        </span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex- p-4 flex flex-col gap-2 pt-6">
        {menuItems.map((item, idx) => {
          if (!item.visible) return null;

          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `p-3 rounded-lg flex items-center gap-4 font-medium transition-all duration-200 ${
                  isActive 
                    ? "text-white shadow-lg bg-[#3B82F6] hover:translate-y-1" 
                    : "text-gray-400 hover:text-[#3B82F6] bg-white/5 hover:translate-y-1"
                }`
              }
            >
              <div className={`p-1.5 rounded-full transition-all duration-200 ${({ isActive }) => isActive ? 'bg-[#161B22]' : 'bg-transparent'}`}>
                {item.icon}
              </div>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
