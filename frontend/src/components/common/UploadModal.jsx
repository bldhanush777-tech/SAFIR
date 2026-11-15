import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadPsiDocument } from '../../api/client';
import { VerifiedBadge } from './Badges';
import PremiumButton from './PremiumButton';

export default function UploadModal({ isOpen, onClose, onUploadSuccess = null }) {
  const [file, setFile] = useState(null);
  const [investigationCode, setInvestigationCode] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await uploadPsiDocument(file, investigationCode || null);
      setResult(res);
      if (onUploadSuccess) onUploadSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to parse and index document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setInvestigationCode('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020205]/85 backdrop-blur-xl">
      <div 
        className="relative w-full max-w-xl anti-gravity-panel overflow-hidden border border-[rgba(0,240,255,0.3)] shadow-[0_0_36px_rgba(0,240,255,0.15)] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,240,255,0.15)]">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#00f0ff]" />
            <span className="font-mono text-sm tracking-wider uppercase text-[#f8fafc] font-medium">
              INGESTION_PIPELINE // SCIENTIFIC_PDF
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#94a3b8] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-[#00eaa6]/30 bg-[#00eaa6]/5">
                <CheckCircle2 className="w-6 h-6 text-[#00eaa6] shrink-0" />
                <div>
                  <h4 className="font-mono text-sm text-[#00eaa6] font-medium">
                    DOCUMENT_INDEXED_SUCCESSFULLY
                  </h4>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Extracted {result.chunks_indexed || 0} semantic vectors into pgvector store.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[rgba(0,240,255,0.15)] bg-[rgba(255,255,255,0.02)] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">FILE_NAME:</span>
                  <span className="text-[#f8fafc]">{result.file_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">INVESTIGATION:</span>
                  <span className="text-[#00f0ff]">{result.investigation_code || 'AUTODETECTED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">INDEXED_AT:</span>
                  <span className="text-[#94a3b8]">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <PremiumButton variant="secondary" onClick={handleReset}>
                  UPLOAD_ANOTHER
                </PremiumButton>
                <PremiumButton variant="primary" onClick={onClose}>
                  CLOSE_TERMINAL
                </PremiumButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Drop Area */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-8 rounded-xl border border-dashed transition-all cursor-pointer ${
                  file
                    ? 'border-[#00f0ff] bg-[#00f0ff]/5'
                    : 'border-[rgba(0,240,255,0.25)] hover:border-[#00f0ff] bg-[rgba(255,255,255,0.01)]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-[#00f0ff]" />
                    <div className="text-left">
                      <p className="font-mono text-sm text-[#f8fafc] font-medium truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="font-mono text-xs text-[#94a3b8]">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • PDF
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-[#00f0ff]/70 mb-3 animate-pulse" />
                    <p className="font-mono text-xs uppercase tracking-wider text-[#f8fafc] text-center">
                      DROP_NASA_PSI_PDF_OR_CLICK_TO_BROWSE
                    </p>
                    <p className="font-sans text-xs text-[#94a3b8] mt-1 text-center">
                      Extracts tables, parameters, and flight narratives with PyMuPDF
                    </p>
                  </>
                )}
              </div>

              {/* Ghost Input for Investigation Code */}
              <div>
                <label className="section-header-hud block mb-1">
                  OPTIONAL_INVESTIGATION_TAG
                </label>
                <input
                  type="text"
                  value={investigationCode}
                  onChange={(e) => setInvestigationCode(e.target.value)}
                  placeholder="e.g. SAFFIRE-I, BASS-II, FLEX-2..."
                  className="ghost-input w-full font-mono text-xs"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-[#ff0055]/30 bg-[#ff0055]/5 text-xs font-mono text-[#ff0055]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <PremiumButton variant="secondary" onClick={onClose} disabled={isUploading}>
                  CANCEL
                </PremiumButton>
                <PremiumButton 
                  variant="primary" 
                  type="submit" 
                  disabled={!file || isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      PARSING_CHUNKS...
                    </span>
                  ) : (
                    'START_INGESTION'
                  )}
                </PremiumButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
