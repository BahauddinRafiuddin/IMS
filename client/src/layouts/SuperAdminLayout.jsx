import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";

const SuperAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-indigo-50 text-gray-800">
      
      {/* ================= Sidebar (Desktop) ================= */}
      <div className="hidden md:block bg-indigo-100 border-r border-indigo-200">
        <Sidebar />
      </div>

      {/* ================= Mobile Sidebar ================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* overlay */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />

          {/* drawer */}
          <div className="relative w-64 bg-indigo-100 shadow-xl border-r border-indigo-200">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ================= Main Content ================= */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Topbar */}
        <div className="bg-white border-b border-indigo-200 shadow-sm">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-indigo-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;