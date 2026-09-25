import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const titleMap = {
  '/dashboard': 'CONTROL ROOM DASHBOARD',
  '/customers': 'CUSTOMER DIRECTORY',
  '/requests': 'SERVICE REQUEST MANAGEMENT',
  '/employees': 'EMPLOYEE & PERSONNEL ROSTER',
  '/services': 'SERVICES & OFFERINGS CATALOG',
  '/appointments': 'SCHEDULED APPOINTMENTS',
  '/analytics': 'ANALYTICS & METRICS REPORT',
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  let activeTitle = 'SERVICEHUB';
  for (const [path, title] of Object.entries(titleMap)) {
    if (location.pathname.startsWith(path)) {
      activeTitle = title;
      break;
    }
  }

  return (
    <div className="flex h-screen bg-[#F5F1E8] text-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          activeTitle={activeTitle}
        />

        {/* Page Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
