import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";

export default function Layout() {
  return (
    <div className="flex h-full overflow-hidden bg-[#0D1117]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <Outlet />  
      </main>
    </div>
  );
}
