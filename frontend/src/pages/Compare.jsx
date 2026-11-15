import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  GitCompare, 
  Trash2, 
  ArrowRight, 
  Sparkles,
  Orbit
} from 'lucide-react';
import { VerifiedBadge, NotAvailableBadge, CategoryBadge, GravityBadge } from '../components/common/Badges';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import PremiumButton from '../components/common/PremiumButton';
import { compareInvestigations, getInvestigations } from '../api/client';

export default function Compare() {
  const location = useLocation();
  const navigate = useNavigate();

  const [availableList, setAvailableList] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState(
    location.state?.initialCodes || ["BASS", "Saffire-I", "SoFIE"]
  );
  const [compareData, setCompareData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getInvestigations().then(setAvailableList).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCodes.length >= 2) {
      runComparison(selectedCodes);
    }
  }, [selectedCodes]);

  const runComparison = async (codes) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await compareInvestigations(codes);
      setCompareData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExperiment = (code) => {
    if (!code || selectedCodes.includes(code)) return;
    if (selectedCodes.length >= 4) {
      alert("Maximum 4 experiments can be compared simultaneously.");
      return;
    }
    setSelectedCodes([...selectedCodes, code]);
  };

  const handleRemoveExperiment = (code) => {
    if (selectedCodes.length <= 2) {
      alert("At least 2 experiments are required for comparison.");
      return;
    }
    setSelectedCodes(selectedCodes.filter((c) => c !== code));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[rgba(0,240,255,0.15)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <VerifiedBadge label="CROSS-INVESTIGATION MATRIX" />
            <span className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider">• BENCHMARKING_KERNEL</span>
          </div>
          <h1 className="font-telemetry-h1 text-3xl sm:text-4xl text-[#f8fafc]">
            COMPARE_INVESTIGATIONS
          </h1>
          <p className="text-sm text-[#94a3b8] font-sans mt-1 max-w-2xl">
            Directly benchmark sample dimensions, atmospheric test limits, flame spread rates, and suppression outcomes across spaceflight investigations.
          </p>
        </div>

        {/* Experiment Selector Dropdown - Ghost Input Style */}
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              handleAddExperiment(e.target.value);
              e.target.value = "";
            }}
            defaultValue=""
            className="ghost-input font-mono text-xs cursor-pointer rounded-full px-4 py-2 border border-[rgba(0,240,255,0.2)] bg-[rgba(255,255,255,0.02)]"
          >
            <option value="" disabled className="bg-[#020205] text-[#94a3b8]">+ ADD_INVESTIGATION...</option>
            {availableList
              .filter((inv) => !selectedCodes.includes(inv.code))
              .map((inv) => (
                <option key={inv.code} value={inv.code} className="bg-[#020205] text-[#f8fafc]">
                  {inv.code} ({inv.category})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Synthesis Analytical Callout Card */}
      {compareData?.synthesis && (
        <div className="anti-gravity-panel p-6 space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#00f0ff]">
            <Sparkles className="w-4 h-4" />
            <span>CROSS-SCALE_COMBUSTION_SYNTHESIS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-xs">
            <div className="p-4 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)]">
              <div className="text-[10px] text-[#94a3b8] mb-1 uppercase tracking-wider">SCALE_DISCREPANCY</div>
              <p className="text-xs text-[#94a3b8] font-sans leading-relaxed">{compareData.synthesis.scale_comparison}</p>
            </div>
            <div className="p-4 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)]">
              <div className="text-[10px] text-[#94a3b8] mb-1 uppercase tracking-wider">ENVIRONMENTAL_CONTRAST</div>
              <p className="text-xs text-[#94a3b8] font-sans leading-relaxed">{compareData.synthesis.environmental_contrast}</p>
            </div>
            <div className="p-4 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)]">
              <div className="text-[10px] text-[#fbbf24] mb-1 uppercase tracking-wider">PARTIAL_G_RELEVANCE</div>
              <p className="text-xs text-[#94a3b8] font-sans leading-relaxed">{compareData.synthesis.partial_g_relevance}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Grid Matrix */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={6} /></div>
          <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={6} /></div>
        </div>
      ) : error ? (
        <div className="anti-gravity-panel p-8 text-center text-xs font-mono text-[#ff0055]">
          COMPARISON_ERROR: {error}
        </div>
      ) : compareData ? (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-flow-col auto-cols-[minmax(300px,1fr)] gap-6">
            {compareData.compared_investigations.map((item, idx) => {
              const levClass = idx % 2 === 1 ? 'levitate-delay-1' : 'levitate-float';

              return (
                <div
                  key={item.code}
                  className={`anti-gravity-panel ${levClass} p-6 flex flex-col justify-between space-y-6`}
                >
                  {/* Header */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <CategoryBadge category={item.category} />
                      <button
                        onClick={() => handleRemoveExperiment(item.code)}
                        title="Remove from comparison"
                        className="w-7 h-7 rounded-full border border-[rgba(0,240,255,0.2)] flex items-center justify-center text-[#94a3b8] hover:text-[#ff0055] hover:border-[#ff0055]/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-mono text-xs text-[#00f0ff] font-semibold">
                      {item.code}
                    </span>
                    <h3 className="font-telemetry-h3 text-xl text-[#f8fafc] mt-0.5">
                      {item.title}
                    </h3>
                    <div className="font-mono text-xs text-[#94a3b8] mt-1">
                      FACILITY: {item.facility}
                    </div>
                  </div>

                  {/* Attributes Table */}
                  <div className="space-y-4 font-mono text-xs divide-y divide-[rgba(0,240,255,0.08)]">
                    <div className="pt-2">
                      <div className="text-[10px] text-[#94a3b8] mb-1 uppercase tracking-wider">GRAVITY_REGIME</div>
                      <GravityBadge regime={item.gravity_regime} />
                    </div>

                    <div className="pt-3">
                      <div className="text-[10px] text-[#94a3b8] mb-1 uppercase tracking-wider">TESTED_MATERIALS</div>
                      <div className="text-[#f8fafc]">
                        {item.sample_materials.join(', ')}
                      </div>
                    </div>

                    <div className="pt-3">
                      <div className="text-[10px] text-[#94a3b8] mb-1 uppercase tracking-wider">OXYGEN_RANGE</div>
                      <div className="text-[#00f0ff] font-semibold">
                        {item.oxygen_range || <NotAvailableBadge size="small" />}
                      </div>
                    </div>

                    <div className="pt-3">
                      <div className="text-[10px] text-[#94a3b8] mb-1 uppercase tracking-wider">PRESSURE_RANGE</div>
                      <div className="text-[#f8fafc]">
                        {item.pressure_range || <NotAvailableBadge size="small" />}
                      </div>
                    </div>

                    <div className="pt-3">
                      <div className="text-[10px] text-[#94a3b8] mb-1 uppercase tracking-wider">FLAME_SPREAD_RANGE</div>
                      <div className="text-[#00eaa6] font-semibold">
                        {item.spread_rate_range || <NotAvailableBadge size="small" />}
                      </div>
                    </div>

                    <div className="pt-3">
                      <div className="text-[10px] text-[#94a3b8] mb-1 uppercase tracking-wider">DATA_COMPLETENESS</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#f8fafc] font-semibold">{item.completeness_score}%</span>
                        <div className="flex-1 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6]" style={{ width: `${item.completeness_score}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-4 border-t border-[rgba(0,240,255,0.12)]">
                    <button
                      onClick={() => navigate(`/experiments/${item.code}`)}
                      className="w-full py-2 rounded-full font-mono text-xs uppercase tracking-wider text-center text-[#00f0ff] border border-[rgba(0,240,255,0.25)] hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>VIEW_MISSION_DETAIL</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
