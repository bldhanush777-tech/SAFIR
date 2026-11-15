import React from 'react';

export default function NasaInsigniaLogo({ variant = "nav", className = "" }) {
  if (variant === "hero") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        {/* Holographic HUD Insignia */}
        <div className="relative w-12 h-12 rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.03)] backdrop-blur-md flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(0,240,255,0.2)]">
          <svg viewBox="0 0 100 100" className="w-8 h-8">
            <defs>
              <filter id="logoGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="6 3" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="50" cy="50" r="14" fill="#00f0ff" filter="url(#logoGlow)" opacity="0.9" />
          </svg>
        </div>

        {/* Text Presentation */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-semibold tracking-wider text-[#f8fafc]">
              SAFIR
            </span>
            <span className="text-[10px] text-[#00f0ff] border border-[#00f0ff]/30 bg-[#00f0ff]/5 px-2 py-0.5 rounded-full font-mono uppercase tracking-widest">
              NASA PSI // 0G
            </span>
          </div>
          <p className="text-xs text-[#94a3b8] font-sans">
            Next-Gen Orbital Station Microgravity Intelligence
          </p>
        </div>
      </div>
    );
  }

  // Nav variant
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-8 h-8 rounded-full border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.03)] backdrop-blur-md flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.25)]">
        <svg viewBox="0 0 100 100" className="w-5 h-5">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#00f0ff" strokeWidth="2" strokeDasharray="5 3" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="12" fill="#00f0ff" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="font-mono text-lg font-semibold tracking-[0.15em] text-[#f8fafc] leading-none">
          SAFIR
        </span>
        <span className="font-mono text-[9px] tracking-[0.2em] text-[#00f0ff] leading-tight uppercase">
          ORBITAL HUD
        </span>
      </div>
    </div>
  );
}
