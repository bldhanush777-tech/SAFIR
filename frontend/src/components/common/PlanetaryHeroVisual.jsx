import React from 'react';

export default function PlanetaryHeroVisual() {
  return (
    <div className="relative w-full h-[340px] lg:h-[400px] flex items-center justify-center overflow-visible select-none pointer-events-none">
      {/* Background Cyan Ambient Haze */}
      <div className="absolute -top-10 -right-10 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#00f0ff]/10 via-[#8b5cf6]/10 to-transparent blur-[70px]" />
      
      {/* Planetary Sphere Body - Holographic Orbital Core */}
      <div className="relative w-[260px] h-[260px] lg:w-[320px] lg:h-[320px] rounded-full overflow-hidden shadow-[inset_-25px_-25px_60px_rgba(2,2,5,0.95),inset_15px_15px_45px_rgba(0,240,255,0.35),0_0_60px_rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.25)]">
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-[#020205] via-[#0a1020] to-[#120826] opacity-90"
        />
        <div 
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            backgroundImage: `radial-gradient(circle at 75% 25%, rgba(0, 240, 255, 0.45) 0%, transparent 60%),
                              linear-gradient(115deg, transparent 40%, rgba(139, 92, 246, 0.3) 50%, transparent 60%)`
          }}
        />
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: 'inset 2px 2px 14px 2px rgba(0, 240, 255, 0.6), inset 8px 8px 24px 3px rgba(139, 92, 246, 0.4)'
          }}
        />
      </div>

      {/* Atmospheric Haze Glow Aura */}
      <div className="absolute w-[290px] h-[290px] lg:w-[360px] lg:h-[360px] rounded-full border border-[rgba(0,240,255,0.25)] bg-[#00f0ff]/[0.02] blur-[1px] animate-pulse" />

      {/* Elliptical SVG Orbit Lines */}
      <svg className="absolute w-[440px] h-[440px] lg:w-[540px] lg:h-[540px] overflow-visible -rotate-12" viewBox="0 0 600 600">
        <ellipse 
          cx="300" 
          cy="300" 
          rx="270" 
          ry="110" 
          fill="none" 
          stroke="rgba(0, 240, 255, 0.2)" 
          strokeWidth="1.2" 
          strokeDasharray="6 8"
        />
        <ellipse 
          cx="300" 
          cy="300" 
          rx="220" 
          ry="70" 
          fill="none" 
          stroke="rgba(139, 92, 246, 0.35)" 
          strokeWidth="1.2"
        />
        <circle cx="480" cy="270" r="3.5" fill="#00f0ff" className="shadow-[0_0_8px_#00f0ff]" />
        <circle cx="120" cy="330" r="2.5" fill="#8b5cf6" />
      </svg>
    </div>
  );
}
