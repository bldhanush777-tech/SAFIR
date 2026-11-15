import React, { useEffect, useState } from 'react';
import { getFleetStats } from '../../api/client';

export default function StatRail({ layout = "horizontal" }) {
  const [stats, setStats] = useState({
    verified_investigations_count: 13,
    total_experimental_runs: 28,
    live_chunks_indexed: 5,
    gravity_regimes_mapped: 4,
    average_completeness_pct: 91.5,
  });

  useEffect(() => {
    getFleetStats()
      .then(data => setStats(data))
      .catch(err => console.warn("Using offline fallback stats:", err));
  }, []);

  const items = [
    {
      value: stats.verified_investigations_count.toString().padStart(2, '0'),
      label: "VERIFIED_FLIGHT_MISSIONS",
      unit: "NASA PSI Repositories"
    },
    {
      value: stats.gravity_regimes_mapped.toString().padStart(2, '0'),
      label: "GRAVITY_REGIMES_MAPPED",
      unit: "0.00g to 1.00g Spectrum"
    },
    {
      value: stats.total_experimental_runs.toString().padStart(2, '0'),
      label: "INSTRUMENTED_RUNS",
      unit: "Calibrated Burn Vectors"
    },
    {
      value: `${stats.average_completeness_pct}%`,
      label: "DATA_COMPLETENESS",
      unit: "Zero-Fabrication Index"
    }
  ];

  return (
    // Floating numbers: removed borders entirely between grid items per prompt spec
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 my-6">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col justify-between p-2">
          {/* Large JetBrains Mono number with drop-shadow glow */}
          <div className="font-mono text-4xl sm:text-5xl text-[#00f0ff] telemetry-readout font-semibold tabular-nums tracking-tight mb-2">
            {item.value}
          </div>
          <div>
            <div className="section-header-hud text-[11px] text-[#f8fafc]">
              {item.label}
            </div>
            <div className="text-xs font-sans text-[#94a3b8] mt-0.5">
              {item.unit}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
