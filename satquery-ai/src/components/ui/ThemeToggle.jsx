import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export default function ThemeToggle({ showDropdown = false, className = '' }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!showDropdown) {
    // Quick toggle between dark and light
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme mode"
        className={`relative p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-[#4FD1C5] hover:border-teal-500/30 transition-all duration-200 shadow-sm ${className}`}
        title={`Current: ${theme}. Click to switch.`}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600" />
        )}
      </button>
    );
  }

  // Dropdown selector with Light, Dark, System
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111820] text-gray-700 dark:text-gray-200 hover:border-teal-500/40 transition-colors"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-3.5 h-3.5 text-[#4FD1C5]" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
        <span className="capitalize">{theme}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151C25] shadow-xl py-1 z-50 text-xs">
          {[
            { key: 'light', label: 'Light', icon: Sun, color: 'text-amber-500' },
            { key: 'dark', label: 'Dark', icon: Moon, color: 'text-[#4FD1C5]' },
            { key: 'system', label: 'System', icon: Laptop, color: 'text-indigo-400' },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => {
                setTheme(key);
                setIsOpen(false);
              }}
              className={`flex items-center justify-between w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#111820] transition-colors ${
                theme === key ? 'font-semibold text-teal-600 dark:text-[#4FD1C5]' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                {label}
              </span>
              {theme === key && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
