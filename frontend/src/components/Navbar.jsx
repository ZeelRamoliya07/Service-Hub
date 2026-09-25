import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

const Navbar = ({ onToggleSidebar, activeTitle = 'DASHBOARD' }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="h-16 bg-white border-b-3 border-black px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 border-2 border-black bg-[#FFD600] text-black hover:bg-yellow-400 font-bold"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#B7FF00] border border-black inline-block animate-pulse" />
          <h1 className="text-base lg:text-lg font-black uppercase font-heading tracking-tight text-black">
            {activeTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <span
              className={`hidden sm:inline-block px-2 py-0.5 text-xs font-black uppercase border-2 border-black ${
                isAdmin ? 'bg-[#FF3B30] text-white' : 'bg-[#0057FF] text-white'
              }`}
            >
              {user.role}
            </span>
            <div className="flex items-center gap-1.5 bg-neutral-100 border-2 border-black px-2.5 py-1 text-xs font-bold">
              <UserIcon className="w-3.5 h-3.5 text-black" />
              <span className="truncate max-w-[120px] sm:max-w-none">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 border-2 border-black bg-white hover:bg-[#FF3B30] hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
