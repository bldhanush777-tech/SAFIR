import React, { useEffect, useState } from 'react';

export default function IntroSplash({ onComplete }) {
  // Stages:
  // 0: Point of light in center
  // 1: Expanding glowing zero-g sphere
  // 2: Telemetry HUD rings building around it in circular sweeps
  // 3: "SAFIR // INITIATED" types out in monospace
  // 4: Sphere disperses into particles and UI fades in
  const [stage, setStage] = useState(0);
  const [typedText, setTypedText] = useState('');
  const fullText = "SAFIR // INITIATED";

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      onComplete?.();
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onComplete?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Timeline:
    // 0ms: single cyan point
    // 500ms: expand into glowing sphere
    const t1 = setTimeout(() => setStage(1), 500);

    // 1200ms: HUD rings sweep
    const t2 = setTimeout(() => setStage(2), 1200);

    // 1800ms: type "SAFIR // INITIATED"
    const t3 = setTimeout(() => {
      setStage(3);
      let i = 0;
      const interval = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 55);
    }, 1800);

    // 3300ms: dispersion & fade out
    const t4 = setTimeout(() => setStage(4), 3300);

    // 4000ms: complete
    const t5 = setTimeout(() => {
      onComplete?.();
    }, 4000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020205] text-[#f8fafc] transition-opacity duration-700 ${
        stage === 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Skip button top-right */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-8 text-xs font-mono tracking-widest text-[#94a3b8] hover:text-[#00f0ff] border border-[rgba(0,240,255,0.15)] hover:border-[#00f0ff] px-4 py-1.5 rounded-full backdrop-blur-md transition-all duration-300"
      >
        SKIP_SEQUENCE <span className="text-[10px] opacity-60 ml-1">[ESC]</span>
      </button>

      {/* Holographic Centerpiece */}
      <div className="relative flex flex-col items-center justify-center w-80 h-80">
        
        {/* Telemetry HUD Rings */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        >
          <defs>
            <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="sphereGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#00f0ff" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#0055ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Dashed HUD Ring */}
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="0.8"
            strokeDasharray="4 8"
            opacity={stage >= 2 ? "0.6" : "0"}
            className="transition-opacity duration-1000 origin-center"
            style={{
              transform: stage >= 2 ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 8s linear, opacity 1s ease"
            }}
          />

          {/* Calibrated Sweep HUD Ring */}
          <circle
            cx="100"
            cy="100"
            r="72"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="1.2"
            strokeDasharray="452"
            strokeDashoffset={stage >= 2 ? "0" : "452"}
            filter="url(#cyanGlow)"
            className="transition-all duration-1000 ease-out origin-center"
          />

          {/* Inner Coordinate Ring */}
          <circle
            cx="100"
            cy="100"
            r="54"
            fill="none"
            stroke="rgba(0, 240, 255, 0.25)"
            strokeWidth="0.75"
            strokeDasharray="2 4"
            opacity={stage >= 2 ? "0.8" : "0"}
            className="transition-opacity duration-700"
          />

          {/* Crosshair ticks */}
          {stage >= 2 && (
            <g stroke="#00f0ff" strokeWidth="0.8" opacity="0.5">
              <line x1="100" y1="20" x2="100" y2="28" />
              <line x1="100" y1="172" x2="100" y2="180" />
              <line x1="20" y1="100" x2="28" y2="100" />
              <line x1="172" y1="100" x2="180" y2="100" />
            </g>
          )}

          {/* Expanding Glowing Sphere (Zero-g Flame) */}
          <circle
            cx="100"
            cy="100"
            r={stage === 0 ? "2" : stage >= 4 ? "48" : "32"}
            fill="url(#sphereGrad)"
            filter="url(#cyanGlow)"
            opacity={stage >= 4 ? "0" : stage === 0 ? "0.8" : "1"}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Monospace Telemetry Typing */}
        <div className="absolute -bottom-12 flex flex-col items-center">
          <div className="font-mono text-sm sm:text-base tracking-[0.2em] text-[#00f0ff] h-6 flex items-center">
            {typedText}
            {stage === 3 && typedText.length < fullText.length && (
              <span className="inline-block w-2 h-4 bg-[#00f0ff] ml-1.5 animate-pulse" />
            )}
          </div>
          <div className="font-mono text-[10px] tracking-[0.15em] text-[#94a3b8]/70 mt-1 uppercase">
            Microgravity Combustion Intelligence Platform
          </div>
        </div>
      </div>
    </div>
  );
}
