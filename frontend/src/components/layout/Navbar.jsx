import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  UploadCloud, 
  Menu,
  X,
  Compass
} from 'lucide-react';
import NasaInsigniaLogo from '../common/NasaInsigniaLogo';
import PremiumButton from '../common/PremiumButton';

export default function Navbar({ onOpenUpload }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'OVERVIEW' },
    { to: '/assistant', label: 'AI_ASSISTANT' },
    { to: '/experiments', label: 'EXPERIMENTS' },
    { to: '/compare', label: 'COMPARE' },
    { to: '/habitat-ranking', label: 'HABITATS' },
    { to: '/research-gaps', label: 'GAPS' },
    { to: '/visualizations', label: 'TELEMETRY' },
    { to: '/earth-applications', label: 'SPINOFFS' },
    { to: '/sources', label: 'SOURCES' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full flex justify-center px-4 mt-6 mb-4">
      {/* Detached Floating Top Bar: margin-top 24px (mt-6), Pill-shaped, bg-black/40 with blur(24px), glowing border */}
      <div className="w-full max-w-[1400px] flex items-center justify-between px-6 py-2.5 rounded-full border border-[rgba(0,240,255,0.2)] bg-black/40 backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,240,255,0.08)] transition-all duration-300">
        
        {/* Left: Holographic Logo */}
        <NavLink to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <NasaInsigniaLogo variant="nav" />
        </NavLink>

        {/* Center: Desktop Navigation Links in Space Grotesk / JetBrains Mono Uppercase Tracked */}
        <nav className="hidden xl:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full font-mono text-[11px] tracking-[0.1em] uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-[#00f0ff] text-[#020205] font-semibold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'text-[#94a3b8] hover:text-[#00f0ff] hover:bg-[#00f0ff]/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Ingest PDF action */}
          <button
            onClick={onOpenUpload}
            className="hidden sm:inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase px-4 py-1.5 rounded-full text-[#94a3b8] hover:text-[#00f0ff] border border-[rgba(0,240,255,0.18)] hover:border-[#00f0ff] bg-[rgba(0,240,255,0.02)] transition-all"
            title="Ingest NASA PSI PDF documents"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="hidden md:inline">INGEST_DATA</span>
          </button>

          {/* Holographic Launch Simulator Button (/app) */}
          <PremiumButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/app')}
            icon={<Compass className="w-3.5 h-3.5" />}
          >
            LAUNCH_SIMULATOR
          </PremiumButton>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 text-[#94a3b8] hover:text-[#00f0ff] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-x-4 top-24 z-50 anti-gravity-panel p-5 space-y-2 border border-[rgba(0,240,255,0.3)] shadow-[0_16px_40px_rgba(0,0,0,0.8)]">
          <div className="section-header-hud border-b border-[rgba(0,240,255,0.15)] pb-2 mb-3">
            ORBITAL_NAVIGATION
          </div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-[#00f0ff] text-[#020205] font-semibold'
                    : 'text-[#94a3b8] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-[rgba(0,240,255,0.15)] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenUpload();
              }}
              className="w-full py-2.5 font-mono text-xs uppercase tracking-wider text-center text-[#94a3b8] border border-[rgba(0,240,255,0.2)] rounded-lg hover:text-[#00f0ff]"
            >
              INGEST_NASA_PDF
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/app');
              }}
              className="w-full py-2.5 font-mono text-xs uppercase tracking-wider font-semibold text-center bg-[#00f0ff] text-[#020205] rounded-lg shadow-[0_0_12px_rgba(0,240,255,0.4)]"
            >
              LAUNCH_SIMULATOR (/app)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
