import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationDropdown from '../ui/NotificationDropdown';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({
  onOpenMobileMenu,
  onOpenSearch,
  onNavigate,
  onOpenLogout,
}) {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-[#080B10]/80 backdrop-blur-md border-b border-gray-200/80 dark:border-white/10 px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left Area: Mobile Hamburger & Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#39D98A] text-xs font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>FastAPI Live (:8000)</span>
        </div>
      </div>

      {/* Right Area: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Menu */}
        {user ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-colors"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-teal-500/30"
              />
              <span className="hidden md:inline-block text-xs font-semibold text-gray-800 dark:text-gray-200">
                {user.name}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden md:inline-block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151C25] shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{user.fullName}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-teal-500/10 text-teal-600 dark:text-[#4FD1C5]">
                    {user.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Profile & Organization
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400" />
                    System Preferences
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('landing');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    Marketing Landing Page
                  </button>
                </div>

                <div className="pt-1 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onNavigate('signin')}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
