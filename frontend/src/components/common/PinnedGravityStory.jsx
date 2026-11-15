import React, { useEffect, useRef, useState } from 'react';
import FlameCanvas from './FlameCanvas';
import { Compass, Sparkles, Orbit } from 'lucide-react';

export default function PinnedGravityStory() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalDist = el.offsetHeight - window.innerHeight;
      if (totalDist <= 0) return;
      const currentScroll = -rect.top;
      const normProgress = Math.min(1.0, Math.max(0.0, currentScroll / totalDist));
      setProgress(normProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute continuous gravitational reduction: 1.000g -> 0.000g
  const currentG = Math.max(0, 1.0 - progress);
  const formattedG = currentG.toFixed(3);

  // Gravitational detachment offset (at 1g: +40px pushed down; at 0g: 0px weightless center)
  const heavyOffset = (currentG * 42); 
  const floatingSeparation = (1 - currentG) * 24; // expands out symmetrically

  // Milestone regimes
  let regimeInfo = {
    title: "1.000g Terrestrial Buoyancy",
    badge: "Earth Lab (1.00g)",
    statusColor: "text-[#00f0ff]",
    desc: "Dense atmospheric convection rapidly sweeps upward at 40 cm/s. The flame is drawn into a tall, flickering teardrop.",
    flameState: "Tall yellow teardrop • Rapid buoyant upwelling"
  };

  if (currentG < 0.08) {
    regimeInfo = {
      title: "0.000g Pure Molecular Diffusion",
      badge: "Freefall / ISS (0.00g)",
      statusColor: "text-[#00f0ff]",
      desc: "Buoyancy is completely eliminated. Combustion expands spherically in all 360 degrees—a soft blue globe fueled purely by molecular diffusion.",
      flameState: "Spherical blue ball • Zero soot • Self-limiting oxygen starved"
    };
  } else if (currentG < 0.25) {
    regimeInfo = {
      title: "0.165g Lunar Critical Hazard Peak",
      badge: "Moon Surface (1/6g)",
      statusColor: "text-[#fbbf24]",
      desc: "One-sixth lunar gravity creates a hazard paradox: natural convection is too weak to remove quenching soot, yet strong enough to supply fresh oxidizer.",
      flameState: "Broad dome • High soot retention & peak flammability"
    };
  } else if (currentG < 0.55) {
    regimeInfo = {
      title: "0.378g Martian Transitional Gravity",
      badge: "Mars Surface (3/8g)",
      statusColor: "text-[#8b5cf6]",
      desc: "Sluggish buoyancy allows oxygen to diffuse laterally into the reaction envelope, widening the flame into a violet-fringed dome.",
      flameState: "Widened dome • Lateral oxygen diffusion boundary"
    };
  }

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[400vh] my-12"
    >
      {/* Sticky 100vh Observation Chamber */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between py-8 overflow-hidden">
        
        {/* Top HUD Telemetry Stream */}
        <div className="w-full flex items-center justify-between border-b border-[rgba(0,240,255,0.15)] pb-4 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#00f0ff]">
              PHYSICS_SIM // GRAVITY_DECAY_SEQUENCE
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
              <Orbit className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>G_PULL:</span>
              <span className="text-[#00f0ff] font-semibold telemetry-readout text-sm">
                {formattedG}g
              </span>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
              <span>DETACHMENT:</span>
              <span className="text-[#8b5cf6] font-semibold">
                {Math.round((1 - currentG) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Central Antigravity Arena */}
        <div className="relative flex-1 flex flex-col items-center justify-center my-auto z-10">
          
          {/* Gravitational Grid Field Behind Visual */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-700"
            style={{ opacity: 0.2 + (1 - currentG) * 0.4 }}
          >
            <div 
              className="w-96 h-96 rounded-full border border-dashed border-[#00f0ff]/30 transition-transform duration-500 ease-out"
              style={{ 
                transform: `scale(${0.8 + (1 - currentG) * 0.4}) rotate(${progress * 180}deg)` 
              }}
            />
            <div 
              className="absolute w-72 h-72 rounded-full border border-[rgba(139,92,246,0.25)] transition-transform duration-700 ease-out"
              style={{ 
                transform: `scale(${0.9 + (1 - currentG) * 0.25}) rotate(-${progress * 90}deg)` 
              }}
            />
          </div>

          {/* Upper Detaching HUD Readout */}
          <div 
            className="text-center z-20 transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateY(${heavyOffset * 0.6 - floatingSeparation * 0.4}px)` 
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(0,240,255,0.2)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#00f0ff]">
                {regimeInfo.badge}
              </span>
            </div>
            <h2 className="font-telemetry-h2 text-3xl sm:text-4xl md:text-5xl text-[#f8fafc] font-medium tracking-tight">
              {regimeInfo.title}
            </h2>
          </div>

          {/* Center Weightless Flame Canvas */}
          <div 
            className="my-4 relative transition-transform duration-300 ease-out z-20"
            style={{ 
              transform: `translateY(${heavyOffset * 0.3}px) scale(${0.95 + (1 - currentG) * 0.15})` 
            }}
          >
            <FlameCanvas
              gravityG={currentG}
              flowMs={0.15}
              intensity={1.0}
              width={340}
              height={260}
            />
          </div>

          {/* Lower Detaching Regime Description */}
          <div 
            className="max-w-xl text-center px-4 z-20 transition-transform duration-300 ease-out"
            style={{ 
              transform: `translateY(${-heavyOffset * 0.5 + floatingSeparation * 0.6}px)` 
            }}
          >
            <p className="font-sans text-sm sm:text-base text-[#94a3b8] leading-relaxed">
              {regimeInfo.desc}
            </p>
            <div className="font-mono text-xs text-[#00f0ff]/80 mt-2 tracking-wide">
              {regimeInfo.flameState}
            </div>
          </div>
        </div>

        {/* Bottom Pinned Milestones & Scroll Status Bar */}
        <div className="w-full flex flex-col gap-3 border-t border-[rgba(0,240,255,0.15)] pt-4 z-20">
          <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8]">
            <span className="uppercase tracking-widest">
              G_AXIS: 1.00g (EARTH) ➔ 0.00g (ORBIT)
            </span>
            <span className="text-[#00f0ff] uppercase tracking-widest">
              SCROLL_DEPTH: {Math.round(progress * 100)}%
            </span>
          </div>

          {/* Interactive Progress Track */}
          <div className="relative w-full h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00f0ff] via-[#8b5cf6] to-[#00eaa6] transition-all duration-75"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* 4 Discrete Gravity Milestones */}
          <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[10px] tracking-wider text-center">
            <div className={`p-1.5 rounded border transition-colors ${currentG >= 0.7 ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/5' : 'border-transparent text-[#94a3b8]'}`}>
              1.00g GROUND
            </div>
            <div className={`p-1.5 rounded border transition-colors ${currentG < 0.7 && currentG >= 0.3 ? 'border-[#8b5cf6] text-[#8b5cf6] bg-[#8b5cf6]/5' : 'border-transparent text-[#94a3b8]'}`}>
              0.38g MARS
            </div>
            <div className={`p-1.5 rounded border transition-colors ${currentG < 0.3 && currentG >= 0.08 ? 'border-[#fbbf24] text-[#fbbf24] bg-[#fbbf24]/5' : 'border-transparent text-[#94a3b8]'}`}>
              0.16g MOON
            </div>
            <div className={`p-1.5 rounded border transition-colors ${currentG < 0.08 ? 'border-[#00eaa6] text-[#00eaa6] bg-[#00eaa6]/5' : 'border-transparent text-[#94a3b8]'}`}>
              0.00g FREEFALL
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
