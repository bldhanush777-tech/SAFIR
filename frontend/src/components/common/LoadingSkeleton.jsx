import React from 'react';

export default function LoadingSkeleton({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-[rgba(0,240,255,0.06)] border border-[rgba(0,240,255,0.12)] rounded-md"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
