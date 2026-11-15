import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Check, 
  GitCompare, 
  FlaskConical,
  Orbit
} from 'lucide-react';
import { VerifiedBadge, CategoryBadge, GravityBadge } from '../components/common/Badges';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import PremiumButton from '../components/common/PremiumButton';
import { getInvestigations } from '../api/client';

export default function Experiments() {
  const navigate = useNavigate();
  const [investigations, setInvestigations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [gravityFilter, setGravityFilter] = useState('All');
  const [facilityFilter, setFacilityFilter] = useState('All');
  const [minCompleteness, setMinCompleteness] = useState(0);

  const [selectedCodes, setSelectedCodes] = useState([]);

  useEffect(() => {
    fetchData();
  }, [categoryFilter, gravityFilter, facilityFilter, minCompleteness]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getInvestigations({
        category: categoryFilter,
        gravity_regime: gravityFilter,
        facility: facilityFilter,
        min_completeness: minCompleteness > 0 ? minCompleteness : undefined,
      });
      setInvestigations(data);
    } catch (err) {
      console.error("Error fetching investigations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompare = (code) => {
    if (selectedCodes.includes(code)) {
      setSelectedCodes(selectedCodes.filter((c) => c !== code));
    } else {
      if (selectedCodes.length >= 4) {
        alert("Maximum 4 experiments can be compared simultaneously.");
        return;
      }
      setSelectedCodes([...selectedCodes, code]);
    }
  };

  const filtered = investigations.filter((inv) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inv.code.toLowerCase().includes(q) ||
      inv.title.toLowerCase().includes(q) ||
      inv.facility.toLowerCase().includes(q) ||
      inv.primary_investigator.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(0,240,255,0.15)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <VerifiedBadge label="NASA PSI FLIGHT MISSIONS" />
            <span className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider">• ZERO_FABRICATION_CORPUS</span>
          </div>
          <h1 className="font-telemetry-h1 text-3xl sm:text-4xl text-[#f8fafc]">
            FLIGHT_INVESTIGATION_MATRIX
          </h1>
          <p className="text-sm text-[#94a3b8] font-sans mt-1">
            Browse verified microgravity and partial-gravity combustion campaigns indexed from NASA repositories.
          </p>
        </div>

        {selectedCodes.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#00f0ff]">
              {selectedCodes.length} SELECTED
            </span>
            <PremiumButton
              variant="primary"
              size="sm"
              onClick={() => navigate('/compare', { state: { initialCodes: selectedCodes } })}
              disabled={selectedCodes.length < 2}
              icon={<GitCompare className="w-3.5 h-3.5" />}
            >
              COMPARE_MISSIONS
            </PremiumButton>
          </div>
        )}
      </div>

      {/* Filter and Search Bar: Anti-gravity panel with Ghost inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl anti-gravity-panel">
        {/* Search Input */}
        <div className="md:col-span-5 relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mission code, title, or investigator..."
            className="ghost-input w-full pl-9 font-mono text-xs"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="ghost-input w-full font-mono text-xs cursor-pointer"
          >
            <option value="All" className="bg-[#020205] text-[#f8fafc]">ALL CATEGORIES</option>
            <option value="Prevention" className="bg-[#020205] text-[#f8fafc]">PREVENTION</option>
            <option value="Detection" className="bg-[#020205] text-[#f8fafc]">DETECTION</option>
            <option value="Suppression" className="bg-[#020205] text-[#f8fafc]">SUPPRESSION</option>
          </select>
        </div>

        {/* Gravity Filter */}
        <div className="md:col-span-3">
          <select
            value={gravityFilter}
            onChange={(e) => setGravityFilter(e.target.value)}
            className="ghost-input w-full font-mono text-xs cursor-pointer"
          >
            <option value="All" className="bg-[#020205] text-[#f8fafc]">ALL GRAVITY REGIMES</option>
            <option value="Microgravity" className="bg-[#020205] text-[#f8fafc]">MICROGRAVITY (0G)</option>
            <option value="Lunar" className="bg-[#020205] text-[#f8fafc]">LUNAR (0.16G)</option>
            <option value="Martian" className="bg-[#020205] text-[#f8fafc]">MARTIAN (0.38G)</option>
          </select>
        </div>

        {/* Reset */}
        <div className="md:col-span-1 flex items-center justify-end">
          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('All');
              setGravityFilter('All');
              setFacilityFilter('All');
              setMinCompleteness(0);
            }}
            className="font-mono text-xs uppercase tracking-wider text-[#94a3b8] hover:text-[#00f0ff] transition-colors"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Grid of Investigation Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={4} /></div>
          <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={4} /></div>
          <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={4} /></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="anti-gravity-panel p-12 text-center space-y-3">
          <Orbit className="w-8 h-8 text-[#94a3b8] mx-auto animate-pulse" />
          <h3 className="font-telemetry-h3 text-lg text-[#f8fafc]">NO_INVESTIGATIONS_MATCHED</h3>
          <p className="text-xs text-[#94a3b8] font-sans">
            Adjust search criteria or reset regime filters to view flight investigations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inv, idx) => {
            const isSelected = selectedCodes.includes(inv.code);
            const levClass = idx % 3 === 1 ? 'levitate-delay-1' : idx % 3 === 2 ? 'levitate-delay-2' : 'levitate-float';

            return (
              <div
                key={inv.id}
                className={`anti-gravity-panel ${levClass} p-6 flex flex-col justify-between transition-all duration-300 ${
                  isSelected
                    ? 'border-[#00f0ff] shadow-[0_0_24px_rgba(0,240,255,0.3)]'
                    : 'hover:border-[#00f0ff]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <CategoryBadge category={inv.category} />
                    <button
                      onClick={() => handleToggleCompare(inv.code)}
                      title="Select for comparison"
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                        isSelected
                          ? 'bg-[#00f0ff] text-[#020205] font-semibold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                          : 'border border-[rgba(0,240,255,0.2)] text-[#94a3b8] hover:text-[#00f0ff]'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{isSelected ? 'SELECTED' : 'COMPARE'}</span>
                    </button>
                  </div>

                  <div className="mb-2">
                    <span className="font-mono text-xs text-[#00f0ff] font-semibold">
                      {inv.code}
                    </span>
                    <h3 className="font-telemetry-h3 text-xl text-[#f8fafc] mt-0.5 leading-snug">
                      {inv.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[11px] font-mono uppercase text-[#94a3b8] px-2.5 py-0.5 rounded-full border border-[rgba(0,240,255,0.15)]">
                      {inv.facility}
                    </span>
                    <GravityBadge regime={inv.gravity_regime} />
                  </div>

                  <p className="text-xs text-[#94a3b8] font-sans leading-relaxed line-clamp-3 mb-4">
                    {inv.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[rgba(0,240,255,0.12)] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#94a3b8]">DATA_COMPLETENESS:</span>
                    <span className="text-[#00f0ff] font-semibold">{inv.data_completeness_score}%</span>
                  </div>
                  <div className="w-full h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00f0ff] to-[#8b5cf6] rounded-full"
                      style={{ width: `${inv.data_completeness_score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-xs text-[#94a3b8]">
                      {inv.runs_count} VERIFIED_RUNS
                    </span>
                    <button
                      onClick={() => navigate(`/experiments/${inv.code}`)}
                      className="font-mono text-xs uppercase tracking-wider text-[#f8fafc] hover:text-[#00f0ff] flex items-center gap-1.5 transition-colors"
                    >
                      <span>EXPLORE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
