import React from 'react';

export default function Skeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-gray-200 dark:bg-white/5 rounded-xl ${className}`}
        />
      ))}
    </>
  );
}
