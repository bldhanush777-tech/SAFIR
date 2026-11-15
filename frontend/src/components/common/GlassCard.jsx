import React from 'react';

export default function GlassCard({
  children,
  className = '',
  hoverEffect = false,
  onClick = null,
  header = null,
  action = null,
  levitate = false,
  levitateDelay = 0 // 0, 1, 2, 3
}) {
  const levitateClass = levitate 
    ? (levitateDelay === 1 ? 'levitate-delay-1' : levitateDelay === 2 ? 'levitate-delay-2' : levitateDelay === 3 ? 'levitate-delay-3' : 'levitate-float')
    : '';

  const baseClasses = "anti-gravity-panel";

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${levitateClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {(header || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(0,240,255,0.12)]">
          {typeof header === 'string' ? (
            <span className="section-header-hud">
              {header}
            </span>
          ) : (
            header
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
}
