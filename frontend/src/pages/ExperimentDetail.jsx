import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  FlaskConical, 
  FileText,
  Orbit
} from 'lucide-react';
import { VerifiedBadge, NotAvailableBadge, CategoryBadge, GravityBadge } from '../components/common/Badges';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import PremiumButton from '../components/common/PremiumButton';
import { getInvestigationDetail } from '../api/client';

export default function ExperimentDetail() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [inv, setInv] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    getInvestigationDetail(code)
      .then(setInv)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [code]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-[rgba(0,240,255,0.1)] rounded-full animate-pulse" />
        <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={5} /></div>
      </div>
    );
  }

  if (error || !inv) {
    return (
      <div className="py-12">
        <div className="anti-gravity-panel p-12 text-center space-y-4">
          <Orbit className="w-8 h-8 text-[#00f0ff] mx-auto animate-pulse" />
          <h3 className="font-telemetry-h3 text-xl text-[#f8fafc]">
            INVESTIGATION_NOT_FOUND: {code}
          </h3>
          <p className="text-xs text-[#94a3b8] font-sans">
            {error || "Could not retrieve experimental flight records for this mission."}
          </p>
          <div className="pt-2">
            <PremiumButton
              variant="primary"
              onClick={() => navigate('/experiments')}
            >
              BACK_TO_EXPERIMENTS
            </PremiumButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Back Navigation & Mission Header */}
      <div>
        <button
          onClick={() => navigate('/experiments')}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#94a3b8] hover:text-[#00f0ff] mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK_TO_MATRIX</span>
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[rgba(0,240,255,0.15)]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <VerifiedBadge label="VERIFIED_NASA_PSI_FLIGHT_DATA" />
              <CategoryBadge category={inv.category} />
              <GravityBadge regime={inv.gravity_regime} />
            </div>
            <h1 className="font-telemetry-h1 text-2xl sm:text-3xl md:text-4xl text-[#f8fafc]">
              {inv.code} // {inv.title}
            </h1>
            <p className="font-mono text-xs text-[#94a3b8] mt-1">
              FACILITY: {inv.facility} • PI: {inv.principal_investigator || "Not available"}
            </p>
          </div>

          {inv.psi_record_url && (
            <a
              href={inv.psi_record_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00f0ff] text-[#020205] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] font-mono text-xs uppercase tracking-wider font-semibold transition-all"
            >
              <span>NASA_PSI_PORTAL</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Investigation Summary & Completeness Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 anti-gravity-panel levitate-float p-6 space-y-4">
          <span className="section-header-hud text-[#00f0ff] block">
            SCIENCE_OBJECTIVES_&_SUMMARY
          </span>
          <p className="text-sm text-[#94a3b8] font-sans leading-relaxed">
            {inv.summary}
          </p>
        </div>

        <div className="anti-gravity-panel levitate-delay-1 p-6 flex flex-col justify-between">
          <div>
            <span className="section-header-hud block">
              TELEMETRY_INTEGRITY
            </span>
            <div className="font-mono text-5xl text-[#00f0ff] telemetry-readout mt-2 font-bold tabular-nums">
              {inv.data_completeness_score}%
            </div>
            <div className="text-xs font-mono text-[#94a3b8] mt-1">
              VERIFIED PARAMETER COMPLETENESS
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="w-full h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] rounded-full"
                style={{ width: `${inv.data_completeness_score}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-[10px] text-[#94a3b8]">
              <span>ZERO FABRICATION INDEX</span>
              <span>NASA PSI VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFIED EXPERIMENTAL RUNS TABLE */}
      <div className="anti-gravity-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(0,240,255,0.12)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#00f0ff]" />
            <span className="font-mono text-sm sm:text-base tracking-wider uppercase text-[#f8fafc] font-medium">
              DOCUMENTED_EXPERIMENTAL_RUNS ({inv.runs?.length || 0})
            </span>
          </div>
          <span className="font-mono text-xs text-[#94a3b8]">
            TABULAR_TELEMETRY
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-[rgba(0,240,255,0.12)] text-[#94a3b8] text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 font-medium">SAMPLE_MATERIAL</th>
                <th className="py-3.5 px-4 font-medium">OXYGEN_%</th>
                <th className="py-3.5 px-4 font-medium">PRESSURE</th>
                <th className="py-3.5 px-4 font-medium">FORCED_FLOW</th>
                <th className="py-3.5 px-4 font-medium">GRAVITY</th>
                <th className="py-3.5 px-4 font-medium">SPREAD_RATE</th>
                <th className="py-3.5 px-4 font-medium">SUPPRESSION</th>
                <th className="py-3.5 px-6 font-medium">SOURCE_REF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,240,255,0.08)]">
              {inv.runs?.map((run) => (
                <tr key={run.id} className="hover:bg-[rgba(0,240,255,0.03)] transition-colors">
                  <td className="py-4 px-6 font-medium text-[#f8fafc]">
                    {run.sample_material || <NotAvailableBadge size="small" />}
                  </td>
                  <td className="py-4 px-4 text-[#f8fafc]">
                    {run.oxygen_concentration_pct !== null ? `${run.oxygen_concentration_pct}%` : <NotAvailableBadge size="small" />}
                  </td>
                  <td className="py-4 px-4 text-[#94a3b8]">
                    {run.pressure_kpa !== null ? `${run.pressure_kpa} kPa` : <NotAvailableBadge size="small" />}
                  </td>
                  <td className="py-4 px-4 text-[#94a3b8]">
                    {run.flow_velocity_cm_s !== null ? `${run.flow_velocity_cm_s} cm/s` : <NotAvailableBadge size="small" />}
                  </td>
                  <td className="py-4 px-4 text-[#00f0ff]">
                    {run.gravity_level_g !== null ? `${run.gravity_level_g}g` : <NotAvailableBadge size="small" />}
                  </td>
                  <td className="py-4 px-4 text-[#00eaa6] font-semibold">
                    {run.flame_spread_rate_mm_s !== null ? `${run.flame_spread_rate_mm_s} mm/s` : <NotAvailableBadge size="small" />}
                  </td>
                  <td className="py-4 px-4 text-[#94a3b8]">
                    {run.suppression_agent || <NotAvailableBadge size="small" />}
                  </td>
                  <td className="py-4 px-6 text-[#94a3b8] text-[11px] truncate max-w-xs">
                    {run.data_source_reference || 'NASA PSI'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
