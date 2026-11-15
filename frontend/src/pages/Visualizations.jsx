import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid,
  ComposedChart
} from 'recharts';
import { 
  Flame, 
  Wind, 
  Radio,
  Orbit
} from 'lucide-react';
import { VerifiedBadge } from '../components/common/Badges';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { getFlammabilityEnvelope, getFlameSpreadCurves, getSmokeDistribution } from '../api/client';

export default function Visualizations() {
  const [flammabilityData, setFlammabilityData] = useState(null);
  const [flameSpreadData, setFlameSpreadData] = useState(null);
  const [smokeData, setSmokeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFlammabilityEnvelope(),
      getFlameSpreadCurves(),
      getSmokeDistribution(),
    ])
      .then(([flam, spread, smoke]) => {
        setFlammabilityData(flam);
        setFlameSpreadData(spread);
        setSmokeData(smoke);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[rgba(0,240,255,0.15)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <VerifiedBadge label="INTERACTIVE_SCIENTIFIC_TELEMETRY" />
            <span className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider">• HIGH-FIDELITY MODELS</span>
          </div>
          <h1 className="font-telemetry-h1 text-3xl sm:text-4xl text-[#f8fafc]">
            SCIENTIFIC_VISUALIZATIONS
          </h1>
          <p className="text-sm text-[#94a3b8] font-sans mt-1 max-w-2xl">
            Interactive analytical charts mapping flammability boundaries, partial-gravity velocity sweeps, and aerosol size shifts from verified NASA flight missions.
          </p>
        </div>
      </div>

      {/* CHART 1: Normoxic vs Exploration Atmosphere Flammability Envelope */}
      <div className="anti-gravity-panel levitate-float p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[rgba(0,240,255,0.12)] pb-4">
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-[#00f0ff]" />
            <h2 className="font-telemetry-h2 text-xl sm:text-2xl text-[#f8fafc]">
              ATMOSPHERIC_FLAMMABILITY_ENVELOPE
            </h2>
          </div>
          <span className="font-mono text-xs text-[#94a3b8]">
            NASA-STD-6001 / SOFIE GEL
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-[380px]">
            {flammabilityData ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={flammabilityData.boundary_curve}
                  margin={{ top: 20, right: 30, bottom: 25, left: 10 }}
                >
                  <defs>
                    <linearGradient id="flamGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(0, 240, 255, 0.4)" />
                      <stop offset="95%" stopColor="rgba(139, 92, 246, 0.05)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.08)" />
                  <XAxis 
                    dataKey="pressure_kpa" 
                    unit=" kPa"
                    stroke="rgba(0,240,255,0.3)" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    label={{ value: 'Chamber pressure (kPa)', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Grotesk' }}
                  />
                  <YAxis 
                    unit="%"
                    stroke="rgba(0,240,255,0.3)" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    domain={[10, 45]}
                    label={{ value: 'Limiting oxygen index (% O2)', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Grotesk' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3.5 rounded-xl bg-[#020205]/95 border border-[rgba(0,240,255,0.3)] text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.25)] space-y-1">
                            <div className="text-[#94a3b8]">PRESSURE: {d.pressure_kpa} kPa</div>
                            <div className="text-[#00f0ff] font-bold text-sm">LOI_LIMIT: {d.limiting_oxygen_pct}% O2</div>
                            <div className="text-[10px] text-[#ff0055]">FLAMMABLE DOMAIN ABOVE BOUNDARY</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="limiting_oxygen_pct" 
                    stroke="#00f0ff" 
                    strokeWidth={2}
                    fill="url(#flamGrad)" 
                    name="LOI Limit"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="space-y-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[rgba(0,240,255,0.12)] lg:pl-6 text-xs font-sans">
            <div>
              <span className="section-header-hud text-[#00f0ff] block mb-1">BOUNDARY_PHYSICS</span>
              <p className="text-[#94a3b8] leading-relaxed">
                As chamber pressure drops below 101.3 kPa, molecular diffusion speeds up (D ∝ 1/P). In Artemis Exploration Atmospheres (56.5 kPa, 34% O2), materials burn far more readily than under terrestrial sea-level conditions.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)] font-mono space-y-1 text-xs">
              <div className="text-[#94a3b8]">VERIFIED FLIGHT DATA:</div>
              <div className="text-[#f8fafc]">Saffire-I: 100.5 kPa / 20.9% O2</div>
              <div className="text-[#00f0ff]">SoFIE: 56.5 kPa / 34.0% O2</div>
              <div className="text-[#8b5cf6]">FLEX-2: 70.0 kPa / 21.0% O2</div>
            </div>
          </div>
        </div>
      </div>

      {/* CHART 2: Flame Spread Rate vs Forced Flow Velocity across Gravity Regimes */}
      <div className="anti-gravity-panel levitate-delay-1 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[rgba(0,240,255,0.12)] pb-4">
          <div className="flex items-center gap-2.5">
            <Wind className="w-4 h-4 text-[#8b5cf6]" />
            <h2 className="font-telemetry-h2 text-xl sm:text-2xl text-[#f8fafc]">
              FLAME_SPREAD_VS_VENTILATION_VELOCITY
            </h2>
          </div>
          <span className="font-mono text-xs text-[#ff0055]">
            PARTIAL-G PEAK HAZARD
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-[380px]">
            {flameSpreadData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={flameSpreadData.curves}
                  margin={{ top: 20, right: 30, bottom: 25, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.08)" />
                  <XAxis 
                    dataKey="flow_velocity_cm_s" 
                    unit=" cm/s"
                    stroke="rgba(0,240,255,0.3)" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    label={{ value: 'Forced ventilation draft (cm/s)', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Grotesk' }}
                  />
                  <YAxis 
                    unit=" mm/s"
                    stroke="rgba(0,240,255,0.3)" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    label={{ value: 'Flame spread rate (mm/s)', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Grotesk' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3.5 rounded-xl bg-[#020205]/95 border border-[rgba(0,240,255,0.3)] text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.25)] space-y-1">
                            <div className="text-[#94a3b8]">FLOW: {d.flow_velocity_cm_s} cm/s</div>
                            <div className="text-[#ff0055] font-bold">LUNAR 0.16g: {d.lunar_partial_0_16g} mm/s (PEAK)</div>
                            <div className="text-[#8b5cf6]">MARS 0.38g: {d.martian_partial_0_38g} mm/s</div>
                            <div className="text-[#00eaa6]">EARTH 1g: {d.earth_1g} mm/s</div>
                            <div className="text-[#00f0ff]">0G ORBIT: {d.microgravity_0g} mm/s</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="lunar_partial_0_16g" name="Lunar 0.16g (Peak hazard)" stroke="#ff0055" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="martian_partial_0_38g" name="Martian 0.38g" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="earth_1g" name="Earth 1.00g (Buoyancy)" stroke="#00eaa6" strokeWidth={1.5} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="microgravity_0g" name="Orbit 0.00g (Diffusion)" stroke="#00f0ff" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="space-y-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[rgba(0,240,255,0.12)] lg:pl-6 text-xs font-sans">
            <div>
              <span className="section-header-hud text-[#ff0055] block mb-1">CRITICAL_FINDING</span>
              <p className="text-[#94a3b8] leading-relaxed">
                At ventilation speeds typical of astronaut cabins (2 to 8 cm/s), <strong className="text-[#f8fafc]">lunar partial gravity (0.16g) flame spread exceeds both 0g and 1g</strong> due to weak natural buoyant convection assisting oxygen feed without convective thermal quenching.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-[#ff0055]/30 bg-[#ff0055]/5 text-[#f8fafc] font-mono text-xs">
              Material: Cotton-Fiberglass SIBAL Fabric at 21% O2, 101.3 kPa.
            </div>
          </div>
        </div>
      </div>

      {/* CHART 3: Smoke Particle Size Distribution */}
      <div className="anti-gravity-panel levitate-delay-2 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[rgba(0,240,255,0.12)] pb-4">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-[#00f0ff]" />
            <h2 className="font-telemetry-h2 text-xl sm:text-2xl text-[#f8fafc]">
              SMOKE_PARTICLE_SIZE_DISTRIBUTION
            </h2>
          </div>
          <span className="font-mono text-xs text-[#94a3b8]">
            SAME & DAFT FLIGHT RUNS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-[380px]">
            {smokeData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={smokeData.particle_distribution}
                  margin={{ top: 20, right: 30, bottom: 25, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.08)" />
                  <XAxis 
                    dataKey="label" 
                    stroke="rgba(0,240,255,0.3)" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    label={{ value: 'Smoke particle diameter', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Grotesk' }}
                  />
                  <YAxis 
                    unit=" %"
                    stroke="rgba(0,240,255,0.3)" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    label={{ value: 'Normalized mass fraction', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Grotesk' }}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3.5 rounded-xl bg-[#020205]/95 border border-[rgba(0,240,255,0.3)] text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.25)] space-y-1">
                            <div className="text-[#94a3b8]">DIAMETER: {d.label}</div>
                            <div className="text-[#00f0ff] font-bold">0G MICROGRAVITY: {d.microgravity_0g_relative_mass}%</div>
                            <div className="text-[#f8fafc]">1G TERRESTRIAL: {d.terrestrial_1g_relative_mass}%</div>
                            <div className="text-[#94a3b8] text-[10px] mt-1">IONIZATION SENSITIVITY: {d.ionization_detector_sensitivity}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }} />
                  <Bar dataKey="microgravity_0g_relative_mass" name="Microgravity 0g smoke (SAME agglomerated)" fill="#00f0ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="terrestrial_1g_relative_mass" name="Terrestrial 1g smoke (submicron fine)" fill="rgba(139, 92, 246, 0.4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="space-y-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-[rgba(0,240,255,0.12)] lg:pl-6 text-xs font-sans">
            <div>
              <span className="section-header-hud text-[#00f0ff] block mb-1">SENSOR_CALIBRATION_SHIFT</span>
              <p className="text-[#94a3b8] leading-relaxed">
                In microgravity, long residence times allow smoke aerosols to coagulate into massive multi-micron agglomerates (&gt; 2 µm). Standard ionization detectors calibrated for terrestrial submicron smoke suffer severe detection lag!
              </p>
            </div>
            <div className="p-3.5 rounded-xl border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.02)] font-mono text-xs text-[#00f0ff]">
              NASA Recommendation: Dual-wavelength optical obscuration + laser particle counters for lunar cabins.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
