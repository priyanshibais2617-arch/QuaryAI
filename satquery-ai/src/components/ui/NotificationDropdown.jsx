import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';

export default function NotificationDropdown({ onNavigate }) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-500 dark:bg-[#4FD1C5] text-[#080B10] text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151C25] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-[#111820]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Telemetry Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-600 dark:text-[#4FD1C5]">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={markAllAsRead}
                className="text-gray-500 hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors flex items-center gap-1"
                title="Mark all as read"
              >
                <Check className="w-3 h-3" />
                Read all
              </button>
              <button
                onClick={clearAll}
                className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                title="Clear all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No active notifications
              </div>
            ) : (
              notifications.map((n) => {
                let Icon = Info;
                let iconColor = 'text-teal-500 bg-teal-500/10';
                if (n.type === 'success') {
                  Icon = CheckCircle2;
                  iconColor = 'text-emerald-500 bg-emerald-500/10';
                } else if (n.type === 'warning') {
                  Icon = AlertTriangle;
                  iconColor = 'text-amber-500 bg-amber-500/10';
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.title.includes('Report')) onNavigate('reports');
                      else if (n.title.includes('Analysis')) onNavigate('results');
                    }}
                    className={`p-3.5 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                      n.unread ? 'bg-teal-500/5 dark:bg-[#4FD1C5]/5' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 ${iconColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs ${n.unread ? 'font-bold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                        {n.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2 border-t border-gray-100 dark:border-white/10 text-center bg-gray-50/50 dark:bg-[#111820]">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('history');
              }}
              className="text-[11px] font-medium text-teal-600 dark:text-[#4FD1C5] hover:underline"
            >
              View Analysis Log Archive →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
