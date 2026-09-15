import React, { useState } from 'react';

export default function Tooltip({ children, text, position = 'top' }) {
  const [visible, setVisible] = useState(false);

  let posClass = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
  if (position === 'bottom') posClass = 'top-full left-1/2 -translate-x-1/2 mt-2';
  if (position === 'right') posClass = 'left-full top-1/2 -translate-y-1/2 ml-2';
  if (position === 'left') posClass = 'right-full top-1/2 -translate-y-1/2 mr-2';

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && text && (
        <div className={`absolute z-50 px-2.5 py-1 text-xs font-medium text-white dark:text-gray-200 bg-gray-900 dark:bg-[#151C25] rounded-md shadow-lg whitespace-nowrap pointer-events-none border border-white/10 ${posClass}`}>
          {text}
        </div>
      )}
    </div>
  );
}
