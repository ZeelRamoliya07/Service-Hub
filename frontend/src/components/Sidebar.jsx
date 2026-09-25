import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserCheck,
  Wrench,
  Calendar,
  BarChart3,
  X,
  Zap,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Service Requests', path: '/requests', icon: ClipboardList },
    { label: 'Employees', path: '/employees', icon: UserCheck },
    { label: 'Services', path: '/services', icon: Wrench },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-64 bg-white border-r-3 border-black flex flex-col justify-between transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header Branding */}
          <div className="h-16 border-b-3 border-black px-6 flex items-center justify-between bg-[#FFD600]">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-black fill-black" />
              <span className="text-xl font-black font-heading tracking-wider uppercase text-black">
                SERVICEHUB
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 border-2 border-black bg-black text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Tagline */}
          <div className="bg-black text-white px-6 py-2 text-[10px] font-black tracking-widest uppercase border-b-2 border-black">
            OPERATIONS. TRACKED. DONE.
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 font-extrabold text-sm uppercase tracking-wide border-2 transition-all duration-100 ${
                      isActive
                        ? 'bg-black text-white border-black brutal-shadow-sm translate-x-1'
                        : 'bg-white text-black border-transparent hover:border-black hover:bg-[#FFFDF5]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t-3 border-black bg-[#F5F1E8]">
          <div className="p-3 border-2 border-black bg-white flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider">
              LOGGED IN AS
            </span>
            <span className="text-xs font-black uppercase text-black truncate">
              {user?.name || 'USER'}
            </span>
            <span className="text-[10px] font-bold text-neutral-600 truncate">
              {user?.email}
            </span>
            <div className="mt-1 flex items-center justify-between pt-2 border-t border-black">
              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-black text-white">
                ROLE: {user?.role}
              </span>
              <span className="w-2 h-2 rounded-none bg-[#B7FF00] border border-black" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
