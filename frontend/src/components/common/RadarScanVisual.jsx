import React, { useState } from 'react';

export default function RadarScanVisual({ blips = [], onBlipClick = null, compact = false }) {
  const [hoveredBlip, setHoveredBlip] = useState(null);

  const defaultBlips = [
    { id: 1, label: "0.16g Lunar flame spread", x: 68, y: 32, severity: "Critical" },
    { id: 2, label: "0.38g Mars natural convection", x: 30, y: 68, severity: "Critical" },
    { id: 3, label: "56.5 kPa Hypobaric LOI", x: 74, y: 72, severity: "High" },
    { id: 4, label: "SAME supermicron smoke", x: 26, y: 28, severity: "Critical" },
  ];

  const activeBlips = blips.length > 0 ? blips : defaultBlips;

  return (
    <div className={`relative flex flex-col items-center justify-center ${compact ? 'h-[160px]' : 'h-[260px]'} w-full overflow-hidden select-none`}>
      <svg className="w-full h-full max-w-[260px] max-h-[260px]" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0, 240, 255, 0)" />
            <stop offset="85%" stopColor="rgba(0, 240, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(0, 240, 255, 0.35)" />
          </radialGradient>
        </defs>

        {/* Outer Ring */}
        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" />
        {/* Mid-Outer Ring */}
        <circle cx="100" cy="100" r="65" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" strokeDasharray="3 4" />
        {/* Mid-Inner Ring */}
        <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1" />
        {/* Center Ring */}
        <circle cx="100" cy="100" r="15" fill="none" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1" />
        {/* Center Origin Dot */}
        <circle cx="100" cy="100" r="2.5" fill="#00f0ff" className="shadow-[0_0_6px_#00f0ff]" />

        {/* Crosshairs */}
        <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
        <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />

        {/* Rotating Radar Sweep */}
        <g className="origin-center animate-spin" style={{ animationDuration: '6s' }}>
          <path
            d="M 100 100 L 100 10 A 90 90 0 0 1 190 100 Z"
            fill="url(#radarSweepGrad)"
            opacity="0.8"
          />
          <line x1="100" y1="100" x2="100" y2="10" stroke="#00f0ff" strokeWidth="1.5" opacity="0.9" />
        </g>
      </svg>

      {/* Target Blips */}
      {activeBlips.map((blip, idx) => {
        const posX = blip.x !== undefined ? blip.x : 50;
        const posY = blip.y !== undefined ? blip.y : 50;
        const isCritical = blip.severity === "Critical";

        return (
          <button
            key={idx}
            onClick={() => onBlipClick && onBlipClick(blip)}
            onMouseEnter={() => setHoveredBlip(blip)}
            onMouseLeave={() => setHoveredBlip(null)}
            style={{ left: `${posX}%`, top: `${posY}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
          >
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isCritical ? 'bg-[#ff0055]' : 'bg-[#fbbf24]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 border border-[#020205] ${
                  isCritical ? 'bg-[#ff0055]' : 'bg-[#fbbf24]'
                }`}
              />
            </span>

            {/* Hover Tooltip */}
            {hoveredBlip?.id === blip.id && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-5 px-2.5 py-1 rounded-full bg-[#020205] border border-[rgba(0,240,255,0.3)] text-[10px] font-mono uppercase tracking-wider text-[#f8fafc] whitespace-nowrap shadow-[0_0_12px_rgba(0,240,255,0.25)] z-30">
                {blip.label}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
