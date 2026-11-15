import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowRight, 
  Flame, 
  ShieldCheck, 
  Bot, 
  FlaskConical, 
  Globe2, 
  Radio, 
  LineChart, 
  Sparkles,
  ExternalLink,
  Compass,
  Orbit
} from 'lucide-react';

import FlameCanvas from '../components/common/FlameCanvas';
import PinnedGravityStory from '../components/common/PinnedGravityStory';
import StatRail from '../components/layout/StatRail';
import PremiumButton from '../components/common/PremiumButton';
import { VerifiedBadge } from '../components/common/Badges';
import { getFleetStats, getFlammabilityEnvelope } from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [fleetStats, setFleetStats] = useState(null);
  const [flammabilityData, setFlammabilityData] = useState(null);

  useEffect(() => {
    getFleetStats().then(setFleetStats).catch(console.error);
    getFlammabilityEnvelope().then(setFlammabilityData).catch(console.error);

    // Scroll reveal observer for weightless materialization
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const missionPresets = [
    {
      id: 'iss',
      name: 'ISS Columbus & MSG Baseline',
      specs: '21% O2 • 14.7 psi • 0.00g microgravity',
      regime: 'Pure diffusion spherical flame',
      gravity: 0.0,
      flow: 0.1
    },
    {
      id: 'artemis',
      name: 'Artemis Lunar Surface Habitat',
      specs: '34% O2 • 8.2 psi • 0.165g lunar gravity',
      regime: 'Peak low-buoyancy flammability risk',
      gravity: 0.165,
      flow: 0.2
    },
    {
      id: 'spacesuit',
      name: 'Lunar EVA Exploration Spacesuit',
      specs: '100% O2 • 4.3 psi • 0.165g lunar gravity',
      regime: 'Hypobaric pure oxygen reaction rate',
      gravity: 0.165,
      flow: 0.15
    },
    {
      id: 'mars',
      name: 'Mars Surface Exploration Habitat',
      specs: '26% O2 • 10.2 psi • 0.378g Martian gravity',
      regime: 'Transitional buoyancy and dome geometry',
      gravity: 0.378,
      flow: 0.18
    },
    {
      id: 'earth',
      name: 'Terrestrial 1g Calibration Facility',
      specs: '21% O2 • 14.7 psi • 1.00g sea-level',
      regime: 'Buoyancy-dominated flickering teardrop',
      gravity: 1.0,
      flow: 0.2
    }
  ];

  return (
    <div className="relative space-y-28">
      {/* =========================================================================
          FIXED BACKGROUND FLAME CANVAS
          Locked strictly behind the UI so it never pushes DOM elements down.
          position: fixed; inset: 0; z-index: -10; pointer-events: none;
         ========================================================================= */}
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30 select-none"
        style={{ position: 'fixed', inset: 0, zIndex: -10, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <FlameCanvas
          gravityG={0.0}
          flowMs={0.06}
          intensity={0.85}
          width={700}
          height={700}
        />
      </div>

      {/* =========================================================================
          HERO SECTION: CENTERED "FIRE HAS NO UP" MANIFESTO
          Massive, high-contrast Space Grotesk typography
         ========================================================================= */}
      <section className="relative pt-16 pb-20 flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8">
        
        {/* Top Mission Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(0,240,255,0.25)] bg-black/40 backdrop-blur-md shadow-[0_0_16px_rgba(0,240,255,0.15)] animate-in fade-in duration-700">
          <VerifiedBadge label="NASA PSI COMBUSTION SI KERNEL" />
          <span className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider">• 2026 SPACE APPS</span>
        </div>

        {/* Centered Massive Manifesto Headline in Space Grotesk */}
        <h1 className="font-heading text-[clamp(44px,9vw,108px)] font-bold text-[#f8fafc] leading-[0.95] tracking-tight uppercase">
          FIRE HAS NO <span className="text-[#00f0ff] telemetry-readout font-extrabold italic">UP.</span>
        </h1>

        {/* Narrative Manifesto Paragraph */}
        <p className="text-base sm:text-lg md:text-xl text-[#94a3b8] font-sans font-normal leading-relaxed max-w-2xl mx-auto">
          In microgravity, buoyant upward convection vanishes. Combustion turns into a silent, spherical blue nebula governed solely by molecular diffusion. SAFIR grounds spacecraft fire safety decisions in verified NASA Physical Sciences Informatics telemetry.
        </p>

        {/* Action Buttons: Centered Floating Holographic Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <PremiumButton
            variant="primary"
            size="lg"
            onClick={() => navigate('/app')}
            icon={<Compass className="w-4 h-4" />}
          >
            LAUNCH_SIMULATOR (/app)
          </PremiumButton>

          <PremiumButton
            variant="secondary"
            size="lg"
            onClick={() => navigate('/assistant')}
            icon={<Bot className="w-4 h-4" />}
          >
            RAG_ASSISTANT
          </PremiumButton>

          <PremiumButton
            variant="secondary"
            size="lg"
            onClick={() => navigate('/experiments')}
            icon={<FlaskConical className="w-4 h-4" />}
          >
            FLIGHT_MATRIX
          </PremiumButton>
        </div>

        {/* Bottom Floating Scroll Cue */}
        <div className="pt-10 flex flex-col items-center gap-2 text-xs font-mono text-[#94a3b8]/70">
          <span className="uppercase tracking-[0.2em]">SCROLL_DOWN_TO_REMOVE_GRAVITY</span>
          <div className="w-4 h-7 rounded-full border border-[rgba(0,240,255,0.3)] flex items-start justify-center p-1">
            <span className="w-1 h-2 rounded-full bg-[#00f0ff] animate-bounce" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          OPEN READOUT STAT RAIL (JetBrains Mono numbers, borderless floating cells)
         ========================================================================= */}
      <section className="reveal-on-scroll">
        <StatRail layout="horizontal" />
      </section>

      {/* =========================================================================
          THE SIGNATURE MOMENT: PINNED GRAVITY JOURNEY (400vh Vertical Scroll)
          Starts at 1.00g (heavy, elements bottom-pinned) -> drops to 0.00g (floating weightless)
         ========================================================================= */}
      <section className="reveal-on-scroll">
        <PinnedGravityStory />
      </section>

      {/* =========================================================================
          MISSION ENVIRONMENT PRESETS WITH HOLOGRAPHIC GLOW INTERACTIONS
         ========================================================================= */}
      <section className="reveal-on-scroll space-y-6 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[rgba(0,240,255,0.15)] pb-4">
          <div>
            <span className="section-header-hud block mb-1">
              EXPLORATION_ENVIRONMENTS
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl text-[#f8fafc]">
              Flight Telemetry Baselines
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94a3b8] max-w-xs">
            Select any flight baseline to inspect combustion limits and fire spread behavior.
          </p>
        </div>

        {/* List Rows with Holographic Hover Glow */}
        <div className="divide-y divide-[rgba(0,240,255,0.12)] border-b border-[rgba(0,240,255,0.12)]">
          {missionPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => navigate('/app')}
              className="py-4 px-3 flex items-center justify-between cursor-pointer group transition-all duration-300 hover:bg-[rgba(0,240,255,0.03)] rounded-lg"
            >
              <div className="space-y-1">
                <div className="font-heading text-lg text-[#f8fafc] group-hover:text-[#00f0ff] group-hover:translate-x-1.5 transition-all">
                  {preset.name}
                </div>
                <div className="text-xs text-[#94a3b8] font-sans">
                  {preset.specs} • <span className="font-mono text-[#00f0ff]/80">{preset.regime}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="opacity-0 group-hover:opacity-100 font-mono text-xs uppercase tracking-wider text-[#00f0ff] transition-opacity">
                  LOAD_SIMULATOR
                </span>
                <div className="w-8 h-8 rounded-full border border-[rgba(0,240,255,0.2)] flex items-center justify-center text-[#94a3b8] group-hover:border-[#00f0ff] group-hover:text-[#00f0ff] group-hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          HOLOGRAPHIC SCIENTIFIC MODULES & NAVIGATION SHORTCUTS
         ========================================================================= */}
      <section className="reveal-on-scroll grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Module 1: AI Assistant */}
        <div 
          onClick={() => navigate('/assistant')}
          className="anti-gravity-panel levitate-float p-6 flex flex-col justify-between transition-all cursor-pointer group bg-black/40 backdrop-blur-md"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <Bot className="w-5 h-5 text-[#00f0ff]" />
              <ArrowUpRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#00f0ff] transition-colors" />
            </div>
            <h3 className="font-heading text-xl text-[#f8fafc] mb-2 group-hover:text-[#00f0ff] transition-colors">
              RAG Reasoning Engine
            </h3>
            <p className="text-xs text-[#94a3b8] font-sans leading-relaxed">
              Ground your fire safety questions strictly in verified NASA PSI papers, technical reports, and experimental runs without hallucination.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-[rgba(0,240,255,0.12)] font-mono text-xs uppercase tracking-wider text-[#00f0ff] flex items-center justify-between">
            <span>OPEN_RAG_ASSISTANT</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Module 2: Habitat Scorer */}
        <div 
          onClick={() => navigate('/habitat-ranking')}
          className="anti-gravity-panel levitate-delay-1 p-6 flex flex-col justify-between transition-all cursor-pointer group bg-black/40 backdrop-blur-md"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <Globe2 className="w-5 h-5 text-[#00eaa6]" />
              <ArrowUpRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#00eaa6] transition-colors" />
            </div>
            <h3 className="font-heading text-xl text-[#f8fafc] mb-2 group-hover:text-[#00eaa6] transition-colors">
              Habitat Scorer
            </h3>
            <p className="text-xs text-[#94a3b8] font-sans leading-relaxed">
              Dynamically re-rank flight experiments against Artemis Lunar, Mars, or custom cabin atmospheres using transparent multi-factor weighting.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-[rgba(0,240,255,0.12)] font-mono text-xs uppercase tracking-wider text-[#00eaa6] flex items-center justify-between">
            <span>SCORE_HABITATS</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Module 3: Research Gaps Radar */}
        <div 
          onClick={() => navigate('/research-gaps')}
          className="anti-gravity-panel levitate-delay-2 p-6 flex flex-col justify-between transition-all cursor-pointer group bg-black/40 backdrop-blur-md"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <Radio className="w-5 h-5 text-[#8b5cf6]" />
              <ArrowUpRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#8b5cf6] transition-colors" />
            </div>
            <h3 className="font-heading text-xl text-[#f8fafc] mb-2 group-hover:text-[#8b5cf6] transition-colors">
              Partial-Gravity Radar
            </h3>
            <p className="text-xs text-[#94a3b8] font-sans leading-relaxed">
              Detect critical empirical voids between 0g freefall and 1g earth testing where low-buoyancy flammability peaks without flight benchmarks.
            </p>
          </div>
          <div className="pt-6 mt-6 border-t border-[rgba(0,240,255,0.12)] font-mono text-xs uppercase tracking-wider text-[#8b5cf6] flex items-center justify-between">
            <span>SCAN_RADAR</span>
            <span>&rarr;</span>
          </div>
        </div>
      </section>
    </div>
  );
}
