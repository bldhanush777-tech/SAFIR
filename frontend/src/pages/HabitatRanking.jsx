import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe2, 
  RotateCcw, 
  ArrowRight,
  Sliders,
  Orbit
} from 'lucide-react';
import { VerifiedBadge } from '../components/common/Badges';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import PremiumButton from '../components/common/PremiumButton';
import { getTargetHabitats, recalculateHabitatRankings } from '../api/client';

export default function HabitatRanking() {
  const navigate = useNavigate();
  const [targetHabitats, setTargetHabitats] = useState([]);
  const [selectedHabitat, setSelectedHabitat] = useState("Artemis Lunar Surface (0.16g)");

  // Weight Sliders
  const [weights, setWeights] = useState({
    weight_atmospheric: 35,
    weight_gravity: 35,
    weight_material: 15,
    weight_scale: 15,
  });

  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTargetHabitats()
      .then((habs) => {
        setTargetHabitats(habs);
        if (habs.length > 0) setSelectedHabitat(habs[1].name);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchRecalculated();
  }, [selectedHabitat, weights]);

  const fetchRecalculated = async () => {
    setIsLoading(true);
    try {
      const res = await recalculateHabitatRankings({
        target_habitat: selectedHabitat,
        weight_atmospheric: weights.weight_atmospheric / 100,
        weight_gravity: weights.weight_gravity / 100,
        weight_material: weights.weight_material / 100,
        weight_scale: weights.weight_scale / 100,
      });
      setRankings(res.rankings);
    } catch (err) {
      console.error("Error calculating habitat rankings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetWeights = () => {
    setWeights({
      weight_atmospheric: 35,
      weight_gravity: 35,
      weight_material: 15,
      weight_scale: 15,
    });
  };

  const currentHabInfo = targetHabitats.find((h) => h.name === selectedHabitat) || {
    pressure_kpa: 56.5,
    oxygen_pct: 34.0,
    gravity_g: 0.16,
    type: "Partial-gravity surface habitat",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[rgba(0,240,255,0.15)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <VerifiedBadge label="TRANSPARENT_SCORING_ENGINE" />
            <span className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider">• MULTI-ATTRIBUTE UTILITY</span>
          </div>
          <h1 className="font-telemetry-h1 text-3xl sm:text-4xl text-[#f8fafc]">
            HABITAT_RELEVANCE_RANKING
          </h1>
          <p className="text-sm text-[#94a3b8] font-sans mt-1 max-w-2xl">
            Rank microgravity combustion experiments against real mission habitats (Artemis Moon, Gateway Orbit, Mars Transit, and ISS) with adjustable criteria weights.
          </p>
        </div>

        {/* Target Habitat Selector: Floating Holographic Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {targetHabitats.map((hab) => (
            <PremiumButton
              key={hab.name}
              variant={selectedHabitat === hab.name ? "selected" : "secondary"}
              size="sm"
              onClick={() => setSelectedHabitat(hab.name)}
            >
              {hab.name}
            </PremiumButton>
          ))}
        </div>
      </div>

      {/* Target Habitat Baseline & Weight Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Target Habitat Specs */}
        <div className="lg:col-span-5 anti-gravity-panel levitate-float p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="section-header-hud text-[#00f0ff]">
                TARGET_FLIGHT_ENVIRONMENT
              </span>
              <span className="font-mono text-xs text-[#94a3b8]">{currentHabInfo.type}</span>
            </div>
            <h2 className="font-telemetry-h2 text-2xl text-[#f8fafc]">
              {selectedHabitat}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3 my-6 text-center divide-x divide-[rgba(0,240,255,0.12)]">
            <div className="px-2">
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">OXYGEN_CONC</div>
              <div className="font-mono text-3xl text-[#00f0ff] telemetry-readout mt-1 font-semibold tabular-nums">
                {currentHabInfo.oxygen_pct}%
              </div>
            </div>
            <div className="px-2">
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">PRESSURE</div>
              <div className="font-mono text-3xl text-[#f8fafc] telemetry-readout mt-1 font-semibold tabular-nums">
                {currentHabInfo.pressure_kpa}
              </div>
              <div className="text-[10px] font-mono text-[#94a3b8]">kPa</div>
            </div>
            <div className="px-2">
              <div className="text-[10px] font-mono text-[#94a3b8] uppercase">GRAVITY</div>
              <div className="font-mono text-3xl text-[#8b5cf6] telemetry-readout mt-1 font-semibold tabular-nums">
                {currentHabInfo.gravity_g}g
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)] font-mono text-xs text-[#94a3b8]">
            Score = w_atm · Match_atm + w_grav · Match_grav + w_mat · Match_mat + w_scale · Match_scale
          </div>
        </div>

        {/* Interactive Weight Sliders */}
        <div className="lg:col-span-7 anti-gravity-panel levitate-delay-1 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(0,240,255,0.12)] pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00f0ff]" />
              <span className="font-mono text-sm uppercase tracking-wider text-[#f8fafc] font-medium">
                SCORING_WEIGHT_DISTRIBUTION
              </span>
            </div>
            <button
              onClick={handleResetWeights}
              className="font-mono text-xs uppercase tracking-wider text-[#94a3b8] hover:text-[#00f0ff] flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET_DEFAULTS</span>
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {/* Atmospheric Match Slider */}
            <div>
              <div className="flex items-baseline justify-between">
                <span className="section-header-hud text-[10px]">ATMOSPHERIC_MATCH (P & O2)</span>
                <span className="font-mono text-xs text-[#00f0ff] font-semibold">{weights.weight_atmospheric}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.weight_atmospheric}
                onChange={(e) => setWeights({ ...weights, weight_atmospheric: Number(e.target.value) })}
                className="slider-holo"
              />
            </div>

            {/* Gravity Regime Match Slider */}
            <div>
              <div className="flex items-baseline justify-between">
                <span className="section-header-hud text-[10px]">GRAVITY_REGIME_MATCH</span>
                <span className="font-mono text-xs text-[#8b5cf6] font-semibold">{weights.weight_gravity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.weight_gravity}
                onChange={(e) => setWeights({ ...weights, weight_gravity: Number(e.target.value) })}
                className="slider-holo"
              />
            </div>

            {/* Material Match Slider */}
            <div>
              <div className="flex items-baseline justify-between">
                <span className="section-header-hud text-[10px]">MATERIAL_COMPOSITION_MATCH</span>
                <span className="font-mono text-xs text-[#00f0ff] font-semibold">{weights.weight_material}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.weight_material}
                onChange={(e) => setWeights({ ...weights, weight_material: Number(e.target.value) })}
                className="slider-holo"
              />
            </div>

            {/* Geometry Scale Match Slider */}
            <div>
              <div className="flex items-baseline justify-between">
                <span className="section-header-hud text-[10px]">GEOMETRY_&_VEHICLE_SCALE_MATCH</span>
                <span className="font-mono text-xs text-[#00eaa6] font-semibold">{weights.weight_scale}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.weight_scale}
                onChange={(e) => setWeights({ ...weights, weight_scale: Number(e.target.value) })}
                className="slider-holo"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Recalculated Rankings Table */}
      <div className="anti-gravity-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(0,240,255,0.12)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#00f0ff]" />
            <span className="font-mono text-sm sm:text-base tracking-wider uppercase text-[#f8fafc] font-medium">
              DYNAMIC_RELEVANCE_LEADERBOARD // {selectedHabitat}
            </span>
          </div>
          <span className="font-mono text-xs text-[#94a3b8]">
            {rankings.length} MISSIONS SCORED
          </span>
        </div>

        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton lines={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-[rgba(0,240,255,0.12)] text-[#94a3b8] text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6 font-medium">RANK</th>
                  <th className="py-3.5 px-4 font-medium">EXPERIMENT_CODE</th>
                  <th className="py-3.5 px-4 font-medium">RELEVANCE_SCORE</th>
                  <th className="py-3.5 px-6 font-medium">SCORE_BREAKDOWN</th>
                  <th className="py-3.5 px-6 font-medium">ENGINEERING_JUSTIFICATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,240,255,0.08)]">
                {rankings.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[rgba(0,240,255,0.03)] transition-colors">
                    <td className="py-4 px-6 text-[#00f0ff] font-bold text-sm">
                      #{idx + 1}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#f8fafc]">
                      {r.investigation_code}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[#00eaa6] telemetry-readout font-bold text-base">
                        {(r.relevance_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#94a3b8] text-[11px]">
                      Atm: {(r.sub_scores.atmospheric * 100).toFixed(0)}% • Grav: {(r.sub_scores.gravity * 100).toFixed(0)}% • Mat: {(r.sub_scores.material * 100).toFixed(0)}%
                    </td>
                    <td className="py-4 px-6 text-[#94a3b8] font-sans text-xs">
                      {r.rationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
