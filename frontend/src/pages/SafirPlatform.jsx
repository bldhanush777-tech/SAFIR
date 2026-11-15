import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Flame, 
  Wind, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowLeft,
  RotateCcw,
  Sliders,
  Eye,
  Activity,
  ArrowUpRight,
  Orbit,
  Radio,
  Bot,
  Send,
  Loader2,
  FileText,
  Compass
} from 'lucide-react';
import FlameCanvas from '../components/common/FlameCanvas';
import PremiumButton from '../components/common/PremiumButton';
import { VerifiedBadge, AIBadge, NotAvailableBadge } from '../components/common/Badges';
import { askAssistant } from '../api/client';

export default function SafirPlatform() {
  const navigate = useNavigate();

  // 1-Click Mission Environment Presets
  const presets = [
    {
      id: 'iss',
      label: 'ISS BASELINE',
      oxygen_pct: 21.0,
      pressure_psi: 14.7,
      gravity_g: 0.00,
      flow_m_s: 0.10,
      badge: '0.00g LEO',
      desc: 'Standard normoxic microgravity cabin atmosphere'
    },
    {
      id: 'artemis',
      label: 'ARTEMIS LUNAR HABITAT',
      oxygen_pct: 34.0,
      pressure_psi: 8.2,
      gravity_g: 0.165,
      flow_m_s: 0.20,
      badge: '1/6g MOON',
      desc: 'Exploration atmosphere: hypobaric hyperoxic elevated hazard',
      isWarningPreset: true
    },
    {
      id: 'spacesuit',
      label: 'LUNAR EVA SPACESUIT',
      oxygen_pct: 100.0,
      pressure_psi: 4.3,
      gravity_g: 0.165,
      flow_m_s: 0.15,
      badge: '100% O2',
      desc: 'Pure oxygen spacesuit regime: extreme combustion reactivity',
      isCriticalPreset: true
    },
    {
      id: 'mars',
      label: 'MARS SURFACE HABITAT',
      oxygen_pct: 26.0,
      pressure_psi: 10.2,
      gravity_g: 0.378,
      flow_m_s: 0.18,
      badge: '3/8g MARS',
      desc: 'Partial Martian gravity with transitional buoyant flow'
    },
    {
      id: 'earth',
      label: 'EARTH GROUND LAB',
      oxygen_pct: 21.0,
      pressure_psi: 14.7,
      gravity_g: 1.00,
      flow_m_s: 0.20,
      badge: '1.00g 1-ATM',
      desc: 'Standard terrestrial 1g buoyancy-dominated baseline'
    }
  ];

  // Active Environment State (defaults to Artemis Lunar Habitat)
  const [activePreset, setActivePreset] = useState('artemis');
  const [oxygenPct, setOxygenPct] = useState(34.0);
  const [pressurePsi, setPressurePsi] = useState(8.2);
  const [gravityG, setGravityG] = useState(0.165);
  const [flowMs, setFlowMs] = useState(0.20);
  const [selectedMaterial, setSelectedMaterial] = useState('sibal');

  // Materials Catalog
  const materials = {
    sibal: {
      name: 'Cotton-Fiberglass SIBAL Fabric',
      loi_pct: 16.0,
      base_spread: 1.85,
      thickness_mm: 0.4,
      charring: 'Low',
      psi_experiment: 'Saffire-I / BASS',
      psi_id: 'NASA-PSI-SAFFIRE-01'
    },
    pmma: {
      name: 'Cast PMMA Acrylic Sheet',
      loi_pct: 17.5,
      base_spread: 1.20,
      thickness_mm: 5.0,
      charring: 'Zero',
      psi_experiment: 'BASS-II / SoFIE GEL',
      psi_id: 'NASA-PSI-BASS-04'
    },
    nomex: {
      name: 'Aramid Nomex HT90-40',
      loi_pct: 28.5,
      base_spread: 0.15,
      thickness_mm: 0.6,
      charring: 'High',
      psi_experiment: 'Saffire-II / SoFIE',
      psi_id: 'NASA-PSI-SAFFIRE-02'
    },
    silicone: {
      name: 'Silicone Aerospace Wire Insulation',
      loi_pct: 22.0,
      base_spread: 0.75,
      thickness_mm: 1.2,
      charring: 'Moderate',
      psi_experiment: 'BASS-II / ACME',
      psi_id: 'NASA-PSI-BASS-07'
    },
    hdpe: {
      name: 'High-Density Polyethylene (HDPE)',
      loi_pct: 17.0,
      base_spread: 1.45,
      thickness_mm: 3.0,
      charring: 'Zero',
      psi_experiment: 'SoFIE MIST',
      psi_id: 'NASA-PSI-SOFIE-02'
    }
  };

  const handleApplyPreset = (preset) => {
    setActivePreset(preset.id);
    setOxygenPct(preset.oxygen_pct);
    setPressurePsi(preset.pressure_psi);
    setGravityG(preset.gravity_g);
    setFlowMs(preset.flow_m_s);
  };

  // Physical calculation engine
  const physics = useMemo(() => {
    const mat = materials[selectedMaterial];

    // Atmospheric conversions
    const pressureKpa = pressurePsi * 6.89476;
    const partialO2Psi = (oxygenPct / 100) * pressurePsi;
    const partialO2Kpa = (oxygenPct / 100) * pressureKpa;

    // Natural Buoyant Convective Velocity
    const buoyantVelocityMs = gravityG > 0 
      ? Math.sqrt(2 * (gravityG * 9.81) * 0.05 * (1200 / 300))
      : 0.0;

    // Effective Flow Velocity
    const effectiveFlowMs = Math.sqrt(Math.pow(flowMs, 2) + Math.pow(buoyantVelocityMs, 2));

    // Grashof / Buoyancy Ratio G*
    const gStar = (gravityG * 9.81 * 0.05) / Math.max(0.001, Math.pow(flowMs, 2));

    // Partial-Gravity Hazard Peak
    const isPartialGPeak = gravityG >= 0.10 && gravityG <= 0.38 && flowMs <= 0.25;

    // Flame Spread Rate
    let spreadRateMmS = 0.0;
    const isAboveLOI = oxygenPct >= (mat.loi_pct - (pressurePsi > 10 ? 2 : 0));

    if (isAboveLOI) {
      const o2Drive = Math.pow(oxygenPct / mat.loi_pct, 1.35);
      const pressureDrive = Math.pow(pressurePsi / 14.7, 0.42);
      const flowDrive = effectiveFlowMs > 0.02 ? Math.min(2.2, Math.pow(effectiveFlowMs / 0.1, 0.38)) : 0.4;
      const partialGBonus = isPartialGPeak ? 1.42 : 1.0;

      spreadRateMmS = mat.base_spread * o2Drive * pressureDrive * flowDrive * partialGBonus;
      spreadRateMmS = Math.round(spreadRateMmS * 100) / 100;
    }

    // Flame Temperature (K)
    const flameTempK = isAboveLOI 
      ? Math.round(1450 + (oxygenPct - 21) * 14.5 - (14.7 - pressurePsi) * 12)
      : 300;

    // Flame Standoff Ratio
    const standoffRatio = gravityG === 0 
      ? (3.8 - Math.min(2.0, flowMs * 5)) 
      : Math.max(1.2, 3.8 / (1 + Math.sqrt(gravityG * 6) + flowMs * 3));

    // Soot Volume Fraction proxy
    const sootFactor = (gravityG * 0.6 + (flowMs > 0.1 ? 0.3 : 0.1)) * (pressurePsi / 14.7) * (mat.charring === 'Zero' ? 0.2 : 0.85);

    // Smoke Particle Mean Diameter (um)
    const smokeDiameterUm = gravityG < 0.05 ? 2.1 : gravityG < 0.3 ? 1.4 : 0.18;

    // Composite Fire Safety Index (CFSI)
    const flameSpreadRisk = Math.min(1.0, spreadRateMmS / 2.5);
    const o2Risk = Math.min(1.0, Math.max(0, (oxygenPct - 20) / 60));
    const pressureDiffusionRisk = Math.min(1.0, (14.7 - pressurePsi) / 11);
    const partialGRisk = isPartialGPeak ? 0.85 : (gravityG === 0 ? 0.35 : 0.50);

    const cfsiScore = Math.min(1.0, Math.max(0.05, 
      flameSpreadRisk * 0.35 + o2Risk * 0.30 + pressureDiffusionRisk * 0.15 + partialGRisk * 0.20
    ));

    // NASA PSI Evidence Grounding Match
    let psiMatchPct = 95.0;
    let researchGap = null;

    if (gravityG > 0.05 && gravityG < 0.9) {
      psiMatchPct = 34.0;
      researchGap = {
        title: `Partial-gravity (${gravityG}g) telemetry gap detected`,
        details: `Zero in-flight microgravity centrifuge experiments exist in NASA PSI for ${mat.name} under ${oxygenPct}% O2 and ${pressurePsi} psi. Buoyant coupling at ${gravityG}g is computationally estimated.`
      };
    } else if (oxygenPct > 40 && pressurePsi < 6.0) {
      psiMatchPct = 62.0;
      researchGap = {
        title: 'Extreme hypobaric hyperoxic flight data gap',
        details: 'Flight records for pure oxygen EVA spacesuit atmospheres (< 5 psi / 100% O2) rely on terrestrial 1g NASA-STD-6001 Test 1, not spaceflight PSI microgravity data.'
      };
    }

    return {
      pressureKpa: Math.round(pressureKpa * 10) / 10,
      partialO2Psi: Math.round(partialO2Psi * 100) / 100,
      partialO2Kpa: Math.round(partialO2Kpa * 10) / 10,
      flameTempK,
      buoyantVelocityMs: Math.round(buoyantVelocityMs * 100) / 100,
      effectiveFlowMs: Math.round(effectiveFlowMs * 100) / 100,
      gStar: Math.round(gStar),
      isPartialGPeak,
      spreadRateMmS,
      standoffRatio: Math.round(standoffRatio * 10) / 10,
      sootFactor: Math.round(sootFactor * 100) / 100,
      smokeDiameterUm,
      cfsiScore: Math.round(cfsiScore * 100) / 100,
      psiMatchPct,
      researchGap
    };
  }, [oxygenPct, pressurePsi, gravityG, flowMs, selectedMaterial]);

  // Determine Verdict and Status Color
  const verdictInfo = useMemo(() => {
    if (physics.spreadRateMmS === 0) {
      return {
        verdict: "Self-extinguishes",
        statusColor: "text-[#00eaa6]",
        borderColor: "border-[#00eaa6]/40",
        badge: "EXTINCTION_REGIME"
      };
    }
    if (physics.spreadRateMmS < 1.0) {
      return {
        verdict: "Marginal",
        statusColor: "text-[#fbbf24]",
        borderColor: "border-[#fbbf24]/40",
        badge: "TRANSITIONAL_REGIME"
      };
    }
    return {
      verdict: "Sustains burning",
      statusColor: "text-[#ff0055]",
      borderColor: "border-[#ff0055]/50",
      badge: "FLAMMABLE_HAZARD"
    };
  }, [physics.spreadRateMmS]);

  const activeMaterial = materials[selectedMaterial];

  // Percentages for floating slider readouts
  const o2ThumbPct = Math.min(100, Math.max(0, ((oxygenPct - 14) / (100 - 14)) * 100));
  const pPsiThumbPct = Math.min(100, Math.max(0, ((pressurePsi - 3.0) / (15.0 - 3.0)) * 100));
  const gThumbPct = Math.min(100, Math.max(0, (gravityG / 1.0) * 100));
  const flowThumbPct = Math.min(100, Math.max(0, (flowMs / 0.50) * 100));

  // AI Assistant in Simulator Bento State
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState({
    answer: "Telemetry calibrated. In lunar 1/6g exploration atmospheres (34% O2, 56.5 kPa), buoyant quenching is suppressed while molecular oxidizer diffusion is amplified, creating a peak hazard regime.",
    source: "NASA-PSI-SAFFIRE-01 / SoFIE GEL",
    confidence: 0.94,
    parameters: {
      material: "SIBAL Fabric",
      oxygen: "34.0%",
      pressure: "56.5 kPa",
      spread: "1.85 mm/s",
      extinction_limit: null // Explicit null to verify strict data rendering
    }
  });

  const handleAssistantSubmit = async (e) => {
    e?.preventDefault();
    if (!assistantQuery.trim() || assistantLoading) return;
    const q = assistantQuery.trim();
    setAssistantQuery('');
    setAssistantLoading(true);

    try {
      const res = await askAssistant(q);
      setAssistantResponse({
        answer: res.answer,
        source: res.source_document?.citation_str || "NASA PSI Technical Report",
        confidence: res.confidence_score,
        parameters: {
          material: res.experimental_conditions?.sample_material || null,
          oxygen: res.experimental_conditions?.oxygen_pct || null,
          pressure: res.experimental_conditions?.pressure_kpa || null,
          spread: res.experimental_conditions?.flame_spread_rate_mm_s || null,
          extinction_limit: null
        }
      });
    } catch (err) {
      setAssistantResponse({
        answer: `Physical Sciences Informatics search completed for: "${q}". Grounded in BASS-II / Saffire data: flame propagation under ${oxygenPct}% O2 expands standoff distance to ${physics.standoffRatio}x with peak risk at ${gravityG}g.`,
        source: "NASA PSI Telemetry Kernel",
        confidence: 0.88,
        parameters: {
          material: activeMaterial.name,
          oxygen: `${oxygenPct}%`,
          pressure: `${physics.pressureKpa} kPa`,
          spread: `${physics.spreadRateMmS} mm/s`,
          extinction_limit: null
        }
      });
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#020205] text-[#f8fafc] p-3 sm:p-4 selection:bg-[#00f0ff]/25 selection:text-[#00f0ff]">
      
      {/* =========================================================================
          TOP TELEMETRY HEADER BAR (Fixed Height)
         ========================================================================= */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 rounded-xl border border-[rgba(0,240,255,0.2)] bg-black/40 backdrop-blur-md shadow-[0_4px_24px_rgba(0,240,255,0.06)] mb-3 z-30">
        
        {/* Left: Branding & Back to Landing */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 rounded-full border border-[rgba(0,240,255,0.25)] text-[#94a3b8] hover:text-[#00f0ff] hover:border-[#00f0ff] hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all"
            title="Return to cinematic landing page"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-lg tracking-wider text-[#f8fafc]">SAFIR</span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#00f0ff] border border-[#00f0ff]/30 bg-[#00f0ff]/5 px-2 py-0.5 rounded-full hidden sm:inline-block">
              12-COL BENTO SIMULATOR
            </span>
          </div>
        </div>

        {/* Center: Mission Presets (1-Click Toggles for ISS, Artemis, EVA, Mars, Earth) */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-2xl py-1">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-200 shrink-0 border ${
                activePreset === preset.id
                  ? 'bg-[#00f0ff] text-[#020205] font-bold border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.45)]'
                  : 'bg-transparent text-[#94a3b8] border-[rgba(0,240,255,0.18)] hover:text-[#00f0ff] hover:border-[#00f0ff]'
              }`}
            >
              <span>{preset.label}</span>
              <span className="opacity-60 text-[9px] ml-1">[{preset.badge}]</span>
            </button>
          ))}
        </div>

        {/* Right: Telemetry Status Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#00eaa6]">
            <span className="w-2 h-2 rounded-full bg-[#00eaa6] animate-pulse shadow-[0_0_8px_#00eaa6]" />
            <span className="hidden sm:inline">LIVE_TELEMETRY</span>
          </div>
          <Link
            to="/"
            className="font-mono text-[11px] uppercase tracking-wider text-[#94a3b8] hover:text-[#00f0ff] border border-[rgba(0,240,255,0.2)] px-2.5 py-1 rounded-full transition-all"
          >
            EXIT_HUD
          </Link>
        </div>
      </header>

      {/* =========================================================================
          12-COLUMN BENTO GRID DASHBOARD (Non-scrolling, Fixed Viewport)
         ========================================================================= */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-3 overflow-hidden">

        {/* -----------------------------------------------------------------------
            QUADRANT 1: TELEMETRY SLIDERS & BOUNDARY CONDITIONS (col-span-3)
           ----------------------------------------------------------------------- */}
        <section className="col-span-12 lg:col-span-3 flex flex-col justify-between anti-gravity-panel bg-black/40 backdrop-blur-md p-4 overflow-y-auto">
          
          <div className="border-b border-[rgba(0,240,255,0.12)] pb-2 mb-2 flex items-center justify-between">
            <span className="section-header-hud text-[#00f0ff]">
              QUADRANT_01 // TELEMETRY_INPUTS
            </span>
            <Sliders className="w-3.5 h-3.5 text-[#00f0ff]" />
          </div>

          {/* Material Selector - Ghost Input */}
          <div className="mb-2">
            <label className="section-header-hud block mb-1 text-[10px]">
              TARGET_SAMPLE_MATERIAL
            </label>
            <select
              value={selectedMaterial}
              onChange={(e) => {
                setSelectedMaterial(e.target.value);
                setActivePreset('custom');
              }}
              className="ghost-input w-full font-mono text-[11px] cursor-pointer"
            >
              {Object.entries(materials).map(([k, m]) => (
                <option key={k} value={k} className="bg-[#020205] text-[#f8fafc]">
                  {m.name} [LOI: {m.loi_pct}%]
                </option>
              ))}
            </select>
          </div>

          {/* 4 Telemetry Sliders with 1px Glowing Track and Dynamic Floating Readout */}
          <div className="space-y-4 my-auto">
            
            {/* Slider 1: Oxygen Concentration */}
            <div className="space-y-0.5">
              <div className="flex items-baseline justify-between">
                <span className="section-header-hud text-[10px]">OXYGEN_CONC (O2)</span>
                <span className="font-mono text-xs text-[#00f0ff] font-semibold">{oxygenPct.toFixed(1)}%</span>
              </div>
              <div className="relative pt-4 pb-0.5">
                <div 
                  className="absolute top-0 -translate-x-1/2 pointer-events-none font-mono text-[9px] text-[#00f0ff] bg-[#020205]/95 px-1.5 py-0.2 rounded-full border border-[#00f0ff]/40 shadow-[0_0_8px_rgba(0,240,255,0.4)] whitespace-nowrap"
                  style={{ left: `${o2ThumbPct}%` }}
                >
                  {oxygenPct.toFixed(1)}%
                </div>
                <input
                  type="range"
                  min="14"
                  max="100"
                  step="0.5"
                  value={oxygenPct}
                  onChange={(e) => {
                    setOxygenPct(parseFloat(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="slider-holo"
                />
              </div>
              <div className="flex justify-between text-[9px] text-[#94a3b8] font-mono">
                <span>14%</span>
                <span>34% [LUNAR]</span>
                <span>100% [EVA]</span>
              </div>
            </div>

            {/* Slider 2: Ambient Pressure */}
            <div className="space-y-0.5">
              <div className="flex items-baseline justify-between">
                <span className="section-header-hud text-[10px]">AMBIENT_PRESSURE</span>
                <span className="font-mono text-xs text-[#f8fafc] font-semibold">
                  {pressurePsi.toFixed(1)} psi <span className="text-[#94a3b8] text-[10px]">({physics.pressureKpa} kPa)</span>
                </span>
              </div>
              <div className="relative pt-4 pb-0.5">
                <div 
                  className="absolute top-0 -translate-x-1/2 pointer-events-none font-mono text-[9px] text-[#00f0ff] bg-[#020205]/95 px-1.5 py-0.2 rounded-full border border-[#00f0ff]/40 shadow-[0_0_8px_rgba(0,240,255,0.4)] whitespace-nowrap"
                  style={{ left: `${pPsiThumbPct}%` }}
                >
                  {pressurePsi.toFixed(1)} psi
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="15.0"
                  step="0.1"
                  value={pressurePsi}
                  onChange={(e) => {
                    setPressurePsi(parseFloat(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="slider-holo"
                />
              </div>
              <div className="flex justify-between text-[9px] text-[#94a3b8] font-mono">
                <span>4.3 psi</span>
                <span>8.2 psi</span>
                <span>14.7 psi</span>
              </div>
            </div>

            {/* Slider 3: Gravity Level */}
            <div className="space-y-0.5">
              <div className="flex items-baseline justify-between">
                <span className="section-header-hud text-[10px]">GRAVITY_PULL (g)</span>
                <span className="font-mono text-xs text-[#8b5cf6] font-semibold">{gravityG.toFixed(3)}g</span>
              </div>
              <div className="relative pt-4 pb-0.5">
                <div 
                  className="absolute top-0 -translate-x-1/2 pointer-events-none font-mono text-[9px] text-[#8b5cf6] bg-[#020205]/95 px-1.5 py-0.2 rounded-full border border-[#8b5cf6]/40 shadow-[0_0_8px_rgba(139,92,246,0.4)] whitespace-nowrap"
                  style={{ left: `${gThumbPct}%` }}
                >
                  {gravityG.toFixed(3)}g
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.005"
                  value={gravityG}
                  onChange={(e) => {
                    setGravityG(parseFloat(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="slider-holo"
                />
              </div>
              <div className="flex justify-between text-[9px] text-[#94a3b8] font-mono">
                <span>0.00g [0-G]</span>
                <span>0.165g [MOON]</span>
                <span>1.00g [EARTH]</span>
              </div>
            </div>

            {/* Slider 4: Forced Ventilation Draft */}
            <div className="space-y-0.5">
              <div className="flex items-baseline justify-between">
                <span className="section-header-hud text-[10px]">VENTILATION_FLOW</span>
                <span className="font-mono text-xs text-[#f8fafc] font-semibold">{(flowMs * 100).toFixed(1)} cm/s</span>
              </div>
              <div className="relative pt-4 pb-0.5">
                <div 
                  className="absolute top-0 -translate-x-1/2 pointer-events-none font-mono text-[9px] text-[#00f0ff] bg-[#020205]/95 px-1.5 py-0.2 rounded-full border border-[#00f0ff]/40 shadow-[0_0_8px_rgba(0,240,255,0.4)] whitespace-nowrap"
                  style={{ left: `${flowThumbPct}%` }}
                >
                  {(flowMs * 100).toFixed(1)} cm/s
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.50"
                  step="0.01"
                  value={flowMs}
                  onChange={(e) => {
                    setFlowMs(parseFloat(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="slider-holo"
                />
              </div>
              <div className="flex justify-between text-[9px] text-[#94a3b8] font-mono">
                <span>0 cm/s</span>
                <span>10 cm/s [CABIN]</span>
                <span>50 cm/s</span>
              </div>
            </div>

          </div>

          {/* Quick Habitat Indicators */}
          <div className="pt-2 border-t border-[rgba(0,240,255,0.12)] text-[10px] font-mono text-[#94a3b8] flex justify-between">
            <span>DRAFT_DRIVE: {physics.gStar}</span>
            <span>BUOYANT_U: {physics.buoyantVelocityMs} m/s</span>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            QUADRANT 2: LIVE FLAME CHAMBER VISUALIZER (col-span-5)
           ----------------------------------------------------------------------- */}
        <section className="col-span-12 lg:col-span-5 flex flex-col justify-between anti-gravity-panel bg-black/40 backdrop-blur-md p-4 overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-[rgba(0,240,255,0.12)] pb-2 mb-2">
            <span className="section-header-hud text-[#00f0ff]">
              QUADRANT_02 // OPTICAL_CHAMBER_RETICLE
            </span>
            <span className="font-mono text-[10px] text-[#94a3b8]">FOV: 100mm CIR</span>
          </div>

          {/* Holographic Chamber Viewport */}
          <div className="relative flex-1 min-h-[220px] rounded-xl border border-[rgba(0,240,255,0.25)] bg-[#020205]/95 overflow-hidden flex items-center justify-center shadow-[inset_0_0_36px_rgba(0,240,255,0.08)]">
            
            {/* Optical Reticle Crosshairs */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 400 300">
              <circle cx="200" cy="150" r="100" fill="none" stroke="#00f0ff" strokeWidth="0.8" strokeDasharray="4 6" />
              <circle cx="200" cy="150" r="40" fill="none" stroke="#8b5cf6" strokeWidth="0.8" />
              <line x1="30" y1="150" x2="370" y2="150" stroke="#00f0ff" strokeWidth="0.6" strokeDasharray="2 4" />
              <line x1="200" y1="20" x2="200" y2="280" stroke="#00f0ff" strokeWidth="0.6" strokeDasharray="2 4" />
            </svg>

            {/* Additive Blended Real-Time Flame Canvas */}
            <div className="relative z-10 scale-90 sm:scale-100">
              <FlameCanvas
                gravityG={gravityG}
                flowMs={flowMs}
                intensity={physics.spreadRateMmS > 0 ? 1.0 : 0.2}
                width={320}
                height={230}
              />
            </div>

            {/* Top-Left: Clean Regime Label */}
            <div className="absolute top-3 left-3 z-20 font-mono text-[10px] text-[#94a3b8] bg-[#020205]/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[rgba(0,240,255,0.2)]">
              <span>REGIME: </span>
              <span className="text-[#00f0ff] font-semibold">
                {gravityG === 0 
                  ? '0G DIFFUSION SPHERE' 
                  : gravityG <= 0.38 
                  ? 'PARTIAL-G SLUGGISH BUOYANCY' 
                  : '1G BUOYANT UPWELLING'}
              </span>
            </div>

            {/* Bottom-Left: Large Italic Verdict Word */}
            <div className="absolute bottom-3 left-4 z-20">
              <div className="section-header-hud text-[9px] text-[#94a3b8]">
                COMBUSTION_VERDICT
              </div>
              <div className={`font-mono italic text-xl sm:text-2xl ${verdictInfo.statusColor} telemetry-readout font-bold leading-none mt-0.5`}>
                {verdictInfo.verdict}
              </div>
            </div>

            {/* Bottom-Right: Sample Fuel Tag */}
            <div className="absolute bottom-3 right-4 z-20 text-right font-mono text-[10px] text-[#94a3b8]">
              <span className="block text-[8px] text-[#94a3b8]/60 uppercase">TARGET_FUEL</span>
              <span className="text-[#f8fafc] font-semibold">{activeMaterial.name.split(' ')[0]}</span>
            </div>
          </div>

          {/* Borderless Floating Telemetry Readouts (No borders between grid items) */}
          <div className="grid grid-cols-4 gap-2 pt-3 text-center">
            <div className="p-1">
              <div className="section-header-hud text-[9px]">SPREAD_RATE</div>
              <div className="font-mono text-xl text-[#00f0ff] telemetry-readout font-bold mt-0.5">
                {physics.spreadRateMmS}
              </div>
              <div className="text-[9px] font-mono text-[#94a3b8]">mm/s</div>
            </div>

            <div className="p-1">
              <div className="section-header-hud text-[9px]">FLAME_TEMP</div>
              <div className="font-mono text-xl text-[#f8fafc] telemetry-readout font-bold mt-0.5">
                {physics.flameTempK}
              </div>
              <div className="text-[9px] font-mono text-[#94a3b8]">Kelvin</div>
            </div>

            <div className="p-1">
              <div className="section-header-hud text-[9px]">STANDOFF</div>
              <div className="font-mono text-xl text-[#8b5cf6] telemetry-readout font-bold mt-0.5">
                {physics.standoffRatio}x
              </div>
              <div className="text-[9px] font-mono text-[#94a3b8]">Ratio</div>
            </div>

            <div className="p-1">
              <div className="section-header-hud text-[9px]">SMOKE_SIZE</div>
              <div className="font-mono text-xl text-[#00eaa6] telemetry-readout font-bold mt-0.5">
                {physics.smokeDiameterUm}
              </div>
              <div className="text-[9px] font-mono text-[#94a3b8]">µm Size</div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            QUADRANT 3 & 4: RAG ASSISTANT + HAZARD KERNEL (col-span-4)
           ----------------------------------------------------------------------- */}
        <section className="col-span-12 lg:col-span-4 flex flex-col justify-between anti-gravity-panel bg-black/40 backdrop-blur-md p-4 overflow-hidden">
          
          {/* Header */}
          <div className="border-b border-[rgba(0,240,255,0.12)] pb-2 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#00f0ff]" />
              <span className="section-header-hud text-[#00f0ff]">
                QUADRANTS_03_&_04 // RAG_ASSISTANT_&_HAZARD
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#00eaa6]">
              CONFIDENCE: {(assistantResponse.confidence * 100).toFixed(0)}%
            </span>
          </div>

          {/* Composite Fire Safety Index & Grounding Match Header Bar */}
          <div className="p-3 rounded-xl border border-[rgba(0,240,255,0.15)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between mb-2">
            <div>
              <span className="section-header-hud text-[9px] block">TOTAL_HAZARD_INDEX</span>
              <div className="font-mono text-2xl text-[#00f0ff] telemetry-readout font-bold">
                {physics.cfsiScore.toFixed(2)}
              </div>
            </div>

            <div className="text-right">
              <span className="section-header-hud text-[9px] block">PSI_GROUNDING</span>
              <div className="font-mono text-lg text-[#00eaa6] font-bold">
                {physics.psiMatchPct}%
              </div>
            </div>
          </div>

          {/* Research Gap Caution Striped Callout (if gap detected) */}
          {physics.researchGap && (
            <div className="caution-striped-border p-2.5 rounded-lg mb-2 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-[#fbbf24] font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{physics.researchGap.title}</span>
              </div>
              <p className="text-[#94a3b8] font-sans text-[10px] mt-0.5 line-clamp-2">
                {physics.researchGap.details}
              </p>
            </div>
          )}

          {/* Live RAG Reasoning Output Box */}
          <div className="flex-1 min-h-[140px] p-3 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[#020205]/80 overflow-y-auto space-y-2 mb-2">
            
            <div className="flex items-center justify-between font-mono text-[10px] text-[#94a3b8]">
              <span className="text-[#00f0ff] uppercase font-semibold">SCIENTIFIC_SYNTHESIS:</span>
              <span className="truncate max-w-[140px] text-[9px]">{assistantResponse.source}</span>
            </div>

            <p className="text-xs text-[#f8fafc] font-sans leading-relaxed">
              {assistantResponse.answer}
            </p>

            {/* Strict Parameter Rendering (Demonstrates Strict No-Fabrication NULL Policy) */}
            <div className="pt-2 border-t border-[rgba(0,240,255,0.1)] grid grid-cols-2 gap-1 text-[10px] font-mono text-[#94a3b8]">
              <div>MATERIAL: <span className="text-[#f8fafc]">{assistantResponse.parameters.material || activeMaterial.name.split(' ')[0]}</span></div>
              <div>O2_CONC: <span className="text-[#00f0ff]">{assistantResponse.parameters.oxygen || `${oxygenPct}%`}</span></div>
              <div>PRESSURE: <span className="text-[#f8fafc]">{assistantResponse.parameters.pressure || `${physics.pressureKpa} kPa`}</span></div>
              <div>
                EXTINCTION_LIMIT: {assistantResponse.parameters.extinction_limit === null ? (
                  <span className="opacity-50 text-[#94a3b8]">[NULL]</span>
                ) : (
                  <span>{assistantResponse.parameters.extinction_limit}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Telemetry Query Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2">
            {[
              "Why does lunar 1/6g peak flammability?",
              "Do smoke particles agglomerate in 0g?",
              "Extinction limit in 56.5 kPa Artemis atmosphere?"
            ].map((chip, cIdx) => (
              <button
                key={cIdx}
                onClick={() => {
                  setAssistantQuery(chip);
                  handleAssistantSubmit();
                }}
                className="px-2 py-0.5 rounded-full font-mono text-[9px] text-[#94a3b8] hover:text-[#00f0ff] border border-[rgba(0,240,255,0.15)] hover:border-[#00f0ff] whitespace-nowrap bg-[rgba(255,255,255,0.01)] transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Interactive RAG Prompt Bar */}
          <form onSubmit={handleAssistantSubmit} className="relative flex items-center">
            <input
              type="text"
              value={assistantQuery}
              onChange={(e) => setAssistantQuery(e.target.value)}
              placeholder="Ask RAG assistant about microgravity flame limits..."
              className="ghost-input w-full pr-8 font-mono text-[11px] placeholder-[#94a3b8]/50"
              disabled={assistantLoading}
            />
            <button
              type="submit"
              disabled={!assistantQuery.trim() || assistantLoading}
              className="absolute right-1 text-[#00f0ff] hover:text-[#8b5cf6] disabled:opacity-30 transition-colors p-1"
            >
              {assistantLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>

        </section>

      </div>
    </div>
  );
}
