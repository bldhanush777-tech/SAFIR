import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Flame, 
  Bot, 
  FlaskConical, 
  GitCompare, 
  Globe2, 
  Radio, 
  LineChart, 
  Sparkles, 
  FileCode2, 
  ChevronRight, 
  ChevronLeft,
  SlidersHorizontal,
  Compass,
  X
} from 'lucide-react';

export default function SidebarDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    { to: '/', label: '01 // OVERVIEW', icon: Flame },
    { to: '/assistant', label: '02 // AI_ASSISTANT', icon: Bot },
    { to: '/experiments', label: '03 // EXPERIMENT_MATRIX', icon: FlaskConical },
    { to: '/compare', label: '04 // COMPARISON_TOOL', icon: GitCompare },
    { to: '/habitat-ranking', label: '05 // HABITAT_SCORER', icon: Globe2 },
    { to: '/research-gaps', label: '06 // RESEARCH_RADAR', icon: Radio },
    { to: '/visualizations', label: '07 // TELEMETRY_PLOTS', icon: LineChart },
    { to: '/earth-applications', label: '08 // EARTH_SPINOFFS', icon: Sparkles },
    { to: '/sources', label: '09 // DOCUMENT_SOURCES', icon: FileCode2 },
  ];

  return (
    <>
      {/* Subtle Glowing Scrub Toggle */}
      <div className="hidden xl:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 flex-col items-center">
        <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[rgba(0,240,255,0.2)] to-transparent" />
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Toggle index drawer"
          className="my-3 w-8 h-8 rounded-full bg-[#020205] border border-[rgba(0,240,255,0.25)] flex items-center justify-center text-[#94a3b8] hover:text-[#00f0ff] hover:border-[#00f0ff] hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all"
        >
          {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
        </button>
        <div className="w-[1px] h-20 bg-gradient-to-b from-[rgba(0,240,255,0.2)] via-[rgba(0,240,255,0.06)] to-transparent" />
      </div>

      {/* Collapsible Slide-Out Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 left-0 w-72 z-40 p-6 flex flex-col justify-between anti-gravity-panel rounded-r-2xl border-l-0 shadow-[8px_0_36px_rgba(0,240,255,0.1)] animate-in slide-in-from-left duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,240,255,0.15)] mb-4">
              <span className="section-header-hud">
                SYSTEM_INDEX
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#94a3b8] hover:text-[#00f0ff] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="space-y-1">
              {routes.map((route) => {
                const Icon = route.icon;
                return (
                  <NavLink
                    key={route.to}
                    to={route.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg font-mono text-xs tracking-wider transition-all ${
                        isActive
                          ? 'bg-[#00f0ff] text-[#020205] font-semibold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                          : 'text-[#94a3b8] hover:text-[#00f0ff] hover:bg-[#00f0ff]/5'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{route.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-[rgba(0,240,255,0.15)]">
            <NavLink
              to="/app"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full font-mono text-xs uppercase tracking-wider font-semibold bg-[#00f0ff] text-[#020205] shadow-[0_0_16px_rgba(0,240,255,0.4)] hover:shadow-[0_0_24px_rgba(0,240,255,0.7)] transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>LAUNCH_SIMULATOR (/app)</span>
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
}
