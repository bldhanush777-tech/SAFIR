import React, { useState, useEffect } from 'react';
import { 
  FileCode2, 
  UploadCloud, 
  CheckCircle2, 
  Code2,
  Orbit
} from 'lucide-react';
import { VerifiedBadge } from '../components/common/Badges';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import PremiumButton from '../components/common/PremiumButton';
import UploadModal from '../components/common/UploadModal';
import { getIndexedDocuments, getFleetStats } from '../api/client';

export default function Sources() {
  const [documents, setDocuments] = useState([]);
  const [fleetStats, setFleetStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = () => {
    setIsLoading(true);
    Promise.all([getIndexedDocuments(), getFleetStats()])
      .then(([docs, stats]) => {
        setDocuments(docs);
        setFleetStats(stats);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[rgba(0,240,255,0.15)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <VerifiedBadge label="CORPUS_&_INGESTION_TELEMETRY" />
            <span className="font-mono text-xs text-[#94a3b8] uppercase tracking-wider">• PGVECTOR 384-DIM</span>
          </div>
          <h1 className="font-telemetry-h1 text-3xl sm:text-4xl text-[#f8fafc]">
            SOURCES_&_SCIENTIFIC_DOCUMENTS
          </h1>
          <p className="text-sm text-[#94a3b8] font-sans mt-1 max-w-2xl">
            Inspect verified NASA Technical Memorandums and peer-reviewed flight reports indexed in the semantic pgvector database, or ingest additional PSI data packages.
          </p>
        </div>

        {/* Upload Trigger Button: Floating Holographic Pill */}
        <PremiumButton
          variant="primary"
          onClick={() => setUploadOpen(true)}
          icon={<UploadCloud className="w-4 h-4" />}
        >
          INGEST_DOCUMENT
        </PremiumButton>
      </div>

      {/* Ingested Documents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(0,240,255,0.15)] pb-3">
          <span className="font-mono text-lg text-[#f8fafc] uppercase tracking-wider">
            INDEXED_TECHNICAL_MEMORANDUMS ({documents.length})
          </span>
          <span className="font-mono text-xs text-[#00f0ff]">
            {fleetStats?.live_chunks_indexed || 5} VECTOR_PASSAGES
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={4} /></div>
            <div className="anti-gravity-panel p-6"><LoadingSkeleton lines={4} /></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc, idx) => {
              const levClass = idx % 2 === 1 ? 'levitate-delay-1' : 'levitate-float';

              return (
                <div
                  key={idx}
                  className={`anti-gravity-panel ${levClass} p-6 flex flex-col justify-between transition-all`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.03)] text-[#00f0ff]">
                        {doc.investigation_code}
                      </span>
                      <span className="font-mono text-xs text-[#94a3b8]">
                        {doc.pages_indexed} PAGES • {doc.chunks_count} CHUNKS
                      </span>
                    </div>

                    <h3 className="font-telemetry-h3 text-lg text-[#f8fafc] mb-1">
                      {doc.source_filename}
                    </h3>

                    <p className="text-xs text-[#94a3b8] font-sans italic mb-4">
                      {doc.sample_citation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[rgba(0,240,255,0.12)] flex items-center justify-between font-mono text-xs text-[#94a3b8]">
                    <span className="flex items-center gap-1.5 text-[#00eaa6]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>INDEXED_IN_PGVECTOR</span>
                    </span>
                    <span className="truncate max-w-[200px] text-[11px]">{doc.storage_path}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SYSTEM ARCHITECTURE & DOCUMENTATION SECTION */}
      <div className="anti-gravity-panel p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[rgba(0,240,255,0.12)] pb-4">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-4 h-4 text-[#00f0ff]" />
            <h2 className="font-telemetry-h2 text-xl sm:text-2xl text-[#f8fafc]">
              PLATFORM_ARCHITECTURE_&_DATA_INTEGRITY
            </h2>
          </div>
          <span className="font-mono text-xs text-[#00f0ff]">
            SAFIR // V2.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs text-[#94a3b8] leading-relaxed">
          <div className="space-y-2 p-4 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)]">
            <div className="font-mono font-semibold text-sm text-[#f8fafc] uppercase tracking-wider">
              1. NO_FABRICATION_POLICY
            </div>
            <p className="font-sans text-xs">
              In accordance with NASA scientific standards, no missing parameter is guessed or hallucinated. 
              Unmeasured values (such as LOI or spread rates for non-tested materials) are stored as explicit SQL <code className="text-[#00f0ff]">NULL</code> and displayed as <code className="text-[#f8fafc]">"Not available"</code>.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)]">
            <div className="font-mono font-semibold text-sm text-[#f8fafc] uppercase tracking-wider">
              2. PGVECTOR_SEMANTIC_INDEX
            </div>
            <p className="font-sans text-xs">
              Document text is extracted with PyMuPDF, chunked with semantic overlap, and mapped to a 384-dimensional dense vector space. 
              Cosine similarity is calculated in PostgreSQL, triggering verified source grounding fallbacks when similarity dips.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-[rgba(0,240,255,0.12)] bg-[rgba(255,255,255,0.01)]">
            <div className="font-mono font-semibold text-sm text-[#f8fafc] uppercase tracking-wider">
              3. 6-PART_SCIENTIFIC_CARD
            </div>
            <p className="font-sans text-xs">
              All AI outputs decompose into 6 auditable fields: Synthesized Answer, Relevant Mission Codes, Verified Environmental Conditions, Source Publication Citation, Study Limitations, and Unmapped Missing Information.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={() => fetchDocs()}
      />
    </div>
  );
}
