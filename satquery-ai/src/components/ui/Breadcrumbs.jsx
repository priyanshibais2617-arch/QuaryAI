import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [], onNavigate }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 py-3" aria-label="Breadcrumb">
      <button
        onClick={() => onNavigate && onNavigate('dashboard')}
        className="flex items-center gap-1 hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-600" />
            {isLast ? (
              <span className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</span>
            ) : (
              <button
                onClick={() => item.page && onNavigate && onNavigate(item.page)}
                className="hover:text-teal-600 dark:hover:text-[#4FD1C5] transition-colors"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
