import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  ShieldAlert, 
  AlertTriangle,
  Sparkles,
  Orbit
} from 'lucide-react';
import RadarScanVisual from '../components/common/RadarScanVisual';
import { SeverityBadge } from '../components/common/Badges';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { getResearchGaps, getRadarScanData } from '../api/client';

export default function ResearchGaps() {
  const [gaps, setGaps] = useState([]);
  const [radarData, setRadarData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGap, setActiveGap] = useState(null);

  useEffect(() => {
    Promise.all([getResearchGaps(), getRadarScanData()])
      .then(([gapsData, rData]) => {
        setGaps(gapsData);
        setRadarData(rData);
        if (gapsData.length > 0) setActiveGap(gapsData[0]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[rgba(0,240,255,0.15)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff0055]/40 bg-[#ff0055]/5 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider text-[#ff0055]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff0055] animate-ping" />
              CRITICAL_HAZARD_INTELLIGENCE
            </span>
            <span className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider">• PARTIAL-G_RADAR</span>
          </div>
          <h1 className="font-telemetry-h1 text-3xl sm:text-4xl text-[#f8fafc]">
            RESEARCH_GAP_DETECTOR
          </h1>
          <p className="text-sm text-[#94a3b8] font-sans mt-1 max-w-2xl">
            Identifying high-risk knowledge voids in NASA PSI: the physical inability of 0g and 1g combustion data to safely interpolate Lunar (0.16g) and Martian (0.38g) flammability thresholds.
          </p>
        </div>

        <div className="px-4 py-1.5 rounded-full border border-[rgba(0,240,255,0.2)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md text-xs font-mono text-[#f8fafc]">
          <span className="text-[#ff0055] font-mono text-lg font-bold mr-1">{radarData?.critical_gaps_count || 3}</span> CRITICAL VOIDS DETECTED
        </div>
      </div>

      {/* Top Radar Visual & Physics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Animated Concentric-Ring Radar Scan Visual */}
        <div className="lg:col-span-5 anti-gravity-panel levitate-float p-6 flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="section-header-hud text-[#00f0ff]">
              ACTIVE_SCANNER: 0.00g – 1.00g
            </span>
            <span className="font-mono text-xs text-[#94a3b8]">SWEEP: 6 RPM</span>
          </div>

          <RadarScanVisual
            blips={radarData?.blips || []}
            onBlipClick={(blip) => {
              const matched = gaps.find((g) => g.id === blip.id || g.gap_title.toLowerCase().includes(blip.label.toLowerCase().slice(0, 5)));
              if (matched) setActiveGap(matched);
            }}
          />

          <div className="w-full pt-4 border-t border-[rgba(0,240,255,0.12)] flex items-center justify-between font-mono text-[10px] text-[#94a3b8]">
            <span>1G ➔ 56.5 kPa ➔ 0.16G / 0.38G ➔ UNMAPPED</span>
          </div>
        </div>

        {/* Partial Gravity Peak Hazard Physics Explanation */}
        <div className="lg:col-span-7 anti-gravity-panel levitate-delay-1 p-6 space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#00f0ff]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE_PARTIAL-GRAVITY_FLAMMABILITY_PARADOX</span>
          </div>

          <h2 className="font-telemetry-h2 text-xl sm:text-2xl text-[#f8fafc] leading-snug">
            Why 0g and 1g cannot interpolate Lunar (0.16g) or Martian (0.38g) fire behavior
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-[#94a3b8] font-sans leading-relaxed">
            <p>
              In <strong className="text-[#f8fafc]">Earth gravity (1g)</strong>, buoyant upward convection is intense (~30–60 cm/s). This supplies ample oxygen, but strong upward momentum also accelerates thermal heat loss and blows out delicate flame bases near extinction.
            </p>
            <p>
              In <strong className="text-[#f8fafc]">Microgravity (0g)</strong>, natural buoyancy is zero. Flames rely solely on molecular diffusion and gentle ventilation drafts (&lt; 5 cm/s). Without airflow, flames self-extinguish as combustion products accumulate.
            </p>
            <div className="caution-striped-border p-4 rounded-xl text-[#f8fafc] space-y-1 font-mono">
              <strong className="text-[#fbbf24] block font-semibold text-xs uppercase tracking-wider">CRITICAL PARTIAL-G HAZARD PEAK:</strong>
              <p className="text-xs text-[#94a3b8] font-sans">
                In lunar (0.16g) and Martian (0.38g) gravity, sluggish buoyancy (~5–12 cm/s) delivers continuous fresh oxidizer without causing aerodynamic blow-off. Consequently, flames burn hotter and spread faster than in both 0g and 1g!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Research Gaps Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(0,240,255,0.15)] pb-3">
          <span className="font-mono text-lg text-[#f8fafc] uppercase tracking-wider">
            UNMAPPED_NASA_PSI_DOMAINS ({gaps.length})
          </span>
          <span className="font-mono text-xs text-[#94a3b8]">
            SELECT TO INSPECT MITIGATIONS
          </span>
        </div>

        {isLoading ? (
          <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={4} /></div>
        ) : (
          <div className="space-y-4">
            {gaps.map((gap, idx) => {
              const isSelected = activeGap?.id === gap.id;
              const levClass = idx % 2 === 1 ? 'levitate-delay-1' : 'levitate-float';

              return (
                <div
                  key={gap.id}
                  onClick={() => setActiveGap(gap)}
                  className={`anti-gravity-panel ${levClass} p-6 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#00f0ff] shadow-[0_0_24px_rgba(0,240,255,0.25)]'
                      : 'hover:border-[#00f0ff]/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <SeverityBadge severity={gap.severity} />
                      <span className="font-mono text-xs text-[#94a3b8]">{gap.missing_regime}</span>
                    </div>
                    <span className="font-mono text-xs text-[#fbbf24] uppercase tracking-wider">
                      UNTESTED_IN_FLIGHT
                    </span>
                  </div>

                  <h3 className="font-telemetry-h3 text-xl text-[#f8fafc] mb-2">
                    {gap.gap_title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#94a3b8] font-sans leading-relaxed mb-4">
                    {gap.physical_explanation}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="font-mono text-xs text-[#94a3b8] mr-1">MISSING_TELEMETRY:</span>
                    {gap.missing_parameters?.map((param, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2.5 py-0.5 rounded-full border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.02)] font-mono text-xs text-[#f8fafc]/80"
                      >
                        {param}
                      </span>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)] text-xs text-[#f8fafc] flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-[#00f0ff] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[#00f0ff] uppercase tracking-wider font-semibold">RECOMMENDED_MITIGATION: </span>
                      <span className="font-sans text-[#94a3b8]">{gap.recommended_experiments}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
