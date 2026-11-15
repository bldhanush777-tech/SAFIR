import React, { useState } from 'react';
import Navbar from './Navbar';
import SidebarDrawer from './SidebarDrawer';
import UploadModal from '../common/UploadModal';
import ScrollProgressBar from '../common/ScrollProgressBar';
import IntroSplash from '../common/IntroSplash';
import { ArrowUp, RotateCcw, Compass, Radio } from 'lucide-react';

export default function ConsoleFrame({ children }) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash once on initial load (or user can replay)
    return !sessionStorage.getItem('safir_intro_seen');
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('safir_intro_seen', 'true');
  };

  const handleReplayIntro = () => {
    setShowSplash(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#020205] text-[#f8fafc] flex flex-col justify-between selection:bg-[#00f0ff]/25 selection:text-[#00f0ff]">
      {/* 2px Fixed Glowing Scroll Progress Bar at the Top */}
      <ScrollProgressBar />

      {/* Intro Splash Modal on open */}
      {showSplash && <IntroSplash onComplete={handleSplashComplete} />}

      {/* Centered Max-Width 1400px Frame with clamp(20px, 5vw, 64px) Side Padding - Zero Clipping */}
      <div className="w-full max-w-[1400px] mx-auto px-[clamp(20px,5vw,64px)] flex-1 flex flex-col pt-1">
        {/* Detached Floating Top Bar */}
        <Navbar onOpenUpload={() => setUploadModalOpen(true)} />

        {/* Collapsible Index Drawer */}
        <SidebarDrawer />

        {/* Main Content Viewport */}
        <main className="flex-1 w-full py-4">
          {children}
        </main>

        {/* Technical Orbital HUD Footer */}
        <footer className="w-full pt-16 pb-12 mt-16 border-t border-[rgba(0,240,255,0.15)] flex flex-col gap-10">
          
          {/* Top Row: Mission Information & Action Links */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]" />
                <span className="font-mono text-sm tracking-wider uppercase text-[#f8fafc] font-medium">
                  SAFIR // SPACEFIRE DECISION PLATFORM
                </span>
              </div>
              <p className="font-sans text-xs text-[#94a3b8] max-w-lg">
                NASA Space Apps Challenge 2026 • Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion.
              </p>
            </div>

            {/* Replay Intro and Back to Top Actions */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <button
                onClick={handleReplayIntro}
                className="inline-flex items-center gap-1.5 text-[#94a3b8] hover:text-[#00f0ff] border border-[rgba(0,240,255,0.15)] hover:border-[#00f0ff] px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>REPLAY_INTRO</span>
              </button>

              <button
                onClick={handleScrollToTop}
                className="inline-flex items-center gap-1.5 text-[#94a3b8] hover:text-[#00f0ff] border border-[rgba(0,240,255,0.15)] hover:border-[#00f0ff] px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>TOP</span>
              </button>
            </div>
          </div>

          {/* Bottom Wordmark: Giant Faded SAFIR Hologram */}
          <div className="w-full flex justify-center items-center pointer-events-none select-none opacity-[0.06] overflow-hidden -my-6">
            <span className="font-mono text-[clamp(60px,16vw,190px)] font-bold tracking-[0.2em] uppercase text-center leading-none text-[#00f0ff]">
              SAFIR
            </span>
          </div>

          {/* Bottom Sub-row: Telemetry Compliance */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#94a3b8] pt-4 border-t border-[rgba(0,240,255,0.08)]">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-[#00eaa6]" />
              <span>ORBITAL_TELEMETRY: SYNCHRONIZED</span>
              <span className="opacity-40">•</span>
              <span>ZERO_FABRICATION_POLICY_ACTIVE</span>
            </div>
            <div>
              <span>GROUNDED_IN_NASA_PSI_EXPERIMENTS</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Scientific Document Ingestion Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
}
