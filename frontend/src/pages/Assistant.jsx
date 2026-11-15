import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  RotateCcw,
  Loader2,
  Orbit,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VerifiedBadge, AIBadge, NotAvailableBadge } from '../components/common/Badges';
import { askAssistant, getSuggestedQueries } from '../api/client';
import PremiumButton from '../components/common/PremiumButton';

export default function Assistant() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [suggestedQueries, setSuggestedQueries] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    getSuggestedQueries()
      .then(setSuggestedQueries)
      .catch(console.error);

    setChatHistory([
      {
        type: 'assistant',
        data: {
          answer: "Welcome to SAFIR Intelligence Kernel. Grounded strictly in verified NASA Physical Sciences Informatics (PSI) flight records (BASS, Saffire, SAME, DAFT, FLEX, ACME, and SoFIE). Inquire regarding microgravity flame propagation, extinction limits, smoke agglomerates, or Exploration Atmospheres.",
          relevant_investigations: ["Saffire-I", "BASS-II", "FLEX-2", "SoFIE"],
          experimental_conditions: {
            sample_material: "SIBAL / PMMA / Heptane",
            oxygen_pct: "14.0% - 34.0%",
            pressure_kpa: "56.5 - 101.3 kPa",
            ambient_flow_cm_s: "0.5 - 25.0 cm/s",
            gravity_g: "0.00g (Microgravity)",
            flame_spread_rate_mm_s: "0.08 - 2.45 mm/s"
          },
          source_document: {
            source_filename: "NASA_PSI_Master_Corpus.pdf",
            page_number: 1,
            citation_str: "NASA Glenn Research Center & Physical Sciences Informatics Flight Archives",
            retrieved_passage: "All responses strictly adhere to the NASA No-Fabrication Policy. Experimental parameters not verified in peer-reviewed documentation are marked 'Not available'."
          },
          limitations: "Indexed flight data primarily encompasses 0g microgravity and 1g terrestrial baselines. Extrapolations to lunar (0.16g) or Martian (0.38g) partial gravity require buoyancy coupling adjustments.",
          missing_information: "None for initial system initialization.",
          confidence_score: 1.0,
          is_verified_psi: true,
          query: "SYSTEM_INITIALIZE"
        }
      }
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userText = query.trim();
    setQuery('');
    setChatHistory((prev) => [...prev, { type: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await askAssistant(userText);
      setChatHistory((prev) => [...prev, { type: 'assistant', data: response }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          type: 'error',
          text: err.message || 'Error retrieving verified NASA documentation.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggested = (qText) => {
    setQuery(qText);
  };

  return (
    <div className="space-y-8">
      {/* Technical Orbital HUD Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(0,240,255,0.15)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <VerifiedBadge label="NASA PSI RETRIEVAL KERNEL" />
            <span className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider">• PGVECTOR 384-DIM</span>
          </div>
          <h1 className="font-telemetry-h1 text-3xl sm:text-4xl text-[#f8fafc]">
            AI_RESEARCH_ASSISTANT
          </h1>
          <p className="text-sm text-[#94a3b8] font-sans mt-1">
            Source-grounded RAG intelligence enforcing the strict 6-part scientific card standard.
          </p>
        </div>

        <button
          onClick={() => setChatHistory([chatHistory[0]])}
          className="px-4 py-1.5 rounded-full border border-[rgba(0,240,255,0.2)] text-xs font-mono uppercase tracking-wider text-[#94a3b8] hover:text-[#00f0ff] hover:border-[#00f0ff] flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET_THREAD</span>
        </button>
      </div>

      {/* Suggested Query Chips: Holographic Pills */}
      {suggestedQueries.length > 0 && (
        <div className="space-y-2">
          <span className="section-header-hud">
            RECOMMENDED_SCIENTIFIC_QUERIES
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSelectSuggested(sq.query)}
                className="px-3.5 py-1.5 rounded-full bg-[rgba(255,255,255,0.02)] hover:bg-[#00f0ff]/10 border border-[rgba(0,240,255,0.18)] hover:border-[#00f0ff] text-xs font-mono text-[#f8fafc]/80 hover:text-[#00f0ff] transition-all text-left flex items-center gap-2"
              >
                <span className="text-[#00f0ff] text-[10px]">[{sq.tag}]</span>
                <span className="truncate max-w-[280px] sm:max-w-md">{sq.query}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Feed */}
      <div className="space-y-8 min-h-[400px]">
        {chatHistory.map((msg, idx) => {
          if (msg.type === 'user') {
            return (
              <div key={idx} className="flex justify-end">
                <div className="max-w-2xl px-5 py-3 rounded-full bg-[#00f0ff] text-[#020205] text-xs font-mono uppercase tracking-wider font-semibold shadow-[0_0_16px_rgba(0,240,255,0.4)]">
                  {msg.text}
                </div>
              </div>
            );
          }

          if (msg.type === 'error') {
            return (
              <div key={idx} className="flex justify-start">
                <div className="p-4 rounded-xl border border-[#ff0055]/40 bg-[#ff0055]/5 text-[#ff0055] text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          }

          // 6-PART SCIENTIFIC RAG CARD
          const card = msg.data;
          const isFallback = !card.is_verified_psi;

          return (
            <div key={idx} className="flex justify-start w-full">
              <div className="w-full anti-gravity-panel overflow-hidden transition-all">
                
                {/* Header Bar */}
                <div className="px-6 py-4 border-b border-[rgba(0,240,255,0.12)] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {card.is_verified_psi ? (
                      <VerifiedBadge label="VERIFIED_NASA_PSI_DATA" />
                    ) : (
                      <AIBadge label="INSUFFICIENT_VERIFIED_EVIDENCE" />
                    )}
                    <span className="text-xs font-mono text-[#94a3b8]">
                      CONFIDENCE: <span className="text-[#00f0ff] font-semibold">{(card.confidence_score * 100).toFixed(1)}%</span>
                    </span>
                  </div>

                  {card.relevant_investigations && card.relevant_investigations.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-[#94a3b8] mr-1">MISSIONS:</span>
                      {card.relevant_investigations.map((code, cIdx) => (
                        <Link
                          key={cIdx}
                          to={`/experiments/${code}`}
                          className="px-2.5 py-0.5 rounded-full border border-[rgba(0,240,255,0.2)] hover:border-[#00f0ff] text-xs font-mono text-[#f8fafc] hover:text-[#00f0ff] transition-colors"
                        >
                          {code}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Body: 6 Sections */}
                <div className="p-6 space-y-6">
                  
                  {/* Part 1: Synthesized Answer */}
                  <div>
                    <div className="section-header-hud mb-1.5 text-[#00f0ff]">
                      01 // SCIENTIFIC_SYNTHESIS
                    </div>
                    <p className={`text-sm sm:text-base leading-relaxed ${isFallback ? 'text-[#fbbf24]' : 'text-[#f8fafc] font-sans'}`}>
                      {card.answer}
                    </p>
                  </div>

                  {/* Part 2: Verified Experimental Conditions Matrix */}
                  <div className="p-4 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)] space-y-3">
                    <div className="section-header-hud">
                      02 // VERIFIED_EXPERIMENTAL_PARAMETERS
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div>
                        <div className="text-[10px] font-mono text-[#94a3b8]">MATERIAL</div>
                        <div className="text-xs font-mono font-medium text-[#f8fafc] truncate mt-0.5">
                          {card.experimental_conditions.sample_material === "Not available" ? (
                            <NotAvailableBadge size="small" />
                          ) : (
                            card.experimental_conditions.sample_material
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono text-[#94a3b8]">OXYGEN_CONC</div>
                        <div className="text-xs font-mono font-medium text-[#f8fafc] mt-0.5">
                          {card.experimental_conditions.oxygen_pct === "Not available" ? (
                            <NotAvailableBadge size="small" />
                          ) : (
                            card.experimental_conditions.oxygen_pct
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono text-[#94a3b8]">PRESSURE</div>
                        <div className="text-xs font-mono font-medium text-[#f8fafc] mt-0.5">
                          {card.experimental_conditions.pressure_kpa === "Not available" ? (
                            <NotAvailableBadge size="small" />
                          ) : (
                            card.experimental_conditions.pressure_kpa
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono text-[#94a3b8]">FLOW_VELOCITY</div>
                        <div className="text-xs font-mono font-medium text-[#f8fafc] mt-0.5">
                          {card.experimental_conditions.ambient_flow_cm_s === "Not available" ? (
                            <NotAvailableBadge size="small" />
                          ) : (
                            card.experimental_conditions.ambient_flow_cm_s
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono text-[#94a3b8]">GRAVITY_REGIME</div>
                        <div className="text-xs font-mono font-medium text-[#f8fafc] mt-0.5">
                          {card.experimental_conditions.gravity_g === "Not available" ? (
                            <NotAvailableBadge size="small" />
                          ) : (
                            card.experimental_conditions.gravity_g
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono text-[#94a3b8]">SPREAD_RATE</div>
                        <div className="text-xs font-mono font-medium text-[#00f0ff] mt-0.5">
                          {card.experimental_conditions.flame_spread_rate_mm_s === "Not available" ? (
                            <NotAvailableBadge size="small" />
                          ) : (
                            card.experimental_conditions.flame_spread_rate_mm_s
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Part 3: Source Document Citation */}
                  <div className="p-4 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#00f0ff]" />
                        <span className="uppercase">03 // SOURCE_PUBLICATION_CITATION</span>
                      </div>
                      <span>PAGE {card.source_document.page_number || 'N/A'}</span>
                    </div>

                    <div className="text-xs font-mono text-[#f8fafc] font-medium">
                      {card.source_document.citation_str}
                    </div>

                    <blockquote className="text-xs text-[#94a3b8] pl-3 border-l-2 border-[#00f0ff] italic leading-relaxed pt-1">
                      "{card.source_document.retrieved_passage}"
                    </blockquote>
                  </div>

                  {/* Part 4 & 5: Limitations & Missing Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)]">
                      <div className="section-header-hud mb-1">
                        04 // BOUNDARY_CONDITIONS_&_LIMITS
                      </div>
                      <p className="text-xs text-[#94a3b8] leading-relaxed font-sans">
                        {card.limitations}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)]">
                      <div className="section-header-hud mb-1 text-[#fbbf24]">
                        05 // RESEARCH_GAPS_&_UNMAPPED_DATA
                      </div>
                      <p className="text-xs text-[#94a3b8] leading-relaxed font-sans">
                        {card.missing_information}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-full border border-[rgba(0,240,255,0.2)] text-xs font-mono text-[#00f0ff] bg-[rgba(0,240,255,0.03)]">
            <Loader2 className="w-4 h-4 animate-spin text-[#00f0ff]" />
            <span>SCANNING_VECTOR_SIMILARITY_INDICES...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Floating Holographic Query Input Box */}
      <div className="sticky bottom-6 z-30 pt-2">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center rounded-full bg-[#020205]/95 border border-[rgba(0,240,255,0.25)] focus-within:border-[#00f0ff] focus-within:shadow-[0_0_24px_rgba(0,240,255,0.3)] shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all p-1.5"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about microgravity flame spread, Saffire fabrics, cool flames, or Exploration Atmospheres..."
            className="flex-1 bg-transparent px-5 py-3 text-xs sm:text-sm text-[#f8fafc] placeholder-[#94a3b8]/50 focus:outline-none font-mono"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-[#00f0ff] text-[#020205] flex items-center justify-center hover:shadow-[0_0_16px_rgba(0,240,255,0.6)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
