import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  ArrowRight,
  Orbit
} from 'lucide-react';
import { VerifiedBadge } from '../components/common/Badges';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { getEarthApplications } from '../api/client';

export default function EarthApplications() {
  const [apps, setApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getEarthApplications()
      .then(setApps)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[rgba(0,240,255,0.15)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <VerifiedBadge label="TERRESTRIAL_TECHNOLOGY_SPINOFFS" />
            <span className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider">• NASA TECHNOLOGY TRANSFER</span>
          </div>
          <h1 className="font-telemetry-h1 text-3xl sm:text-4xl text-[#f8fafc]">
            EARTH_APPLICATIONS_&_SPINOFFS
          </h1>
          <p className="text-sm text-[#94a3b8] font-sans mt-1 max-w-2xl">
            How microgravity combustion breakthroughs in droplet kinetics, aerosol coagulation, and flame extinction directly advance terrestrial decarbonization, wildfire sentinels, and commercial aviation safety.
          </p>
        </div>
      </div>

      {/* Grid of Earth Spin-off Modules */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={5} /></div>
          <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={5} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app, idx) => {
            const levClass = idx % 2 === 1 ? 'levitate-delay-1' : 'levitate-float';

            return (
              <div
                key={app.id}
                className={`anti-gravity-panel ${levClass} p-6 flex flex-col justify-between space-y-6 transition-all group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] uppercase tracking-wider border border-[#00f0ff]/30 text-[#00f0ff] bg-[#00f0ff]/5">
                      {app.technology_readiness_level}
                    </span>
                    <span className="font-mono text-xs text-[#94a3b8]">
                      {app.terrestrial_domain}
                    </span>
                  </div>

                  <h3 className="font-telemetry-h3 text-xl sm:text-2xl text-[#f8fafc] group-hover:text-[#00f0ff] transition-colors mb-2">
                    {app.title}
                  </h3>

                  <div className="p-2.5 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)] font-mono text-xs text-[#94a3b8] mb-4 flex items-center gap-2">
                    <span className="text-[#00f0ff]">ORIGIN_MISSION:</span>
                    <span className="text-[#f8fafc]">{app.microgravity_origin}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#94a3b8] font-sans leading-relaxed mb-4">
                    {app.summary}
                  </p>

                  <div className="p-4 rounded-xl border border-[rgba(0,240,255,0.1)] bg-[rgba(0,240,255,0.02)] space-y-1">
                    <span className="section-header-hud text-[#00eaa6] block">
                      TERRESTRIAL_IMPACT_METRIC
                    </span>
                    <p className="font-mono text-xs text-[#f8fafc]">
                      {app.terrestrial_impact}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[rgba(0,240,255,0.12)] flex items-center justify-between font-mono text-xs text-[#94a3b8]">
                  <span>TRL LEVEL {app.technology_readiness_level?.replace(/\D/g, '') || '6'} OF 9</span>
                  <span className="text-[#00f0ff] group-hover:underline flex items-center gap-1">
                    <span>CASE_STUDY</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
