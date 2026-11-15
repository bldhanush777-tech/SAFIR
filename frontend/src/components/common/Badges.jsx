import React from 'react';
import { ShieldCheck, Sparkles, HelpCircle, AlertTriangle } from 'lucide-react';

export function VerifiedBadge({ label = "Verified NASA PSI Data", size = "normal" }) {
  const isSmall = size === "small";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-[#00eaa6]/30 bg-[#00eaa6]/5 backdrop-blur-md ${isSmall ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'} font-mono uppercase tracking-wider text-[#00eaa6]`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#00eaa6] animate-pulse shadow-[0_0_6px_#00eaa6]" />
      <ShieldCheck className={isSmall ? "w-3 h-3 stroke-[1.5]" : "w-3.5 h-3.5 stroke-[1.5]"} />
      <span>{label}</span>
    </span>
  );
}

export function AIBadge({ label = "AI Synthesis Model", size = "normal" }) {
  const isSmall = size === "small";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#8b5cf6]/40 bg-[#8b5cf6]/5 backdrop-blur-md ${isSmall ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'} font-mono uppercase tracking-wider text-[#8b5cf6]`}>
      <Sparkles className={isSmall ? "w-3 h-3 stroke-[1.5]" : "w-3.5 h-3.5 stroke-[1.5]"} />
      <span>{label}</span>
    </span>
  );
}

export function NotAvailableBadge({ label = "Not Available", size = "normal" }) {
  const isSmall = size === "small";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-[rgba(148,163,184,0.2)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md ${isSmall ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'} font-mono uppercase tracking-wider text-[#94a3b8] italic`}>
      <HelpCircle className="w-3 h-3 stroke-[1.5]" />
      <span>{label}</span>
    </span>
  );
}

export function CategoryBadge({ category }) {
  let colorClass = "text-[#00eaa6] border-[#00eaa6]/30 bg-[#00eaa6]/5";
  if (category === "Detection") {
    colorClass = "text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/5";
  } else if (category === "Suppression") {
    colorClass = "text-[#00f0ff] border-[#00f0ff]/30 bg-[#00f0ff]/5";
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider border backdrop-blur-md ${colorClass}`}>
      {category}
    </span>
  );
}

export function GravityBadge({ regime }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.04)] backdrop-blur-md text-[#00f0ff]">
      {regime}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  let color = "text-[#00eaa6] border-[#00eaa6]/30 bg-[#00eaa6]/5";
  if (severity === "Critical" || severity === "High") {
    color = "text-[#ff0055] border-[#ff0055]/30 bg-[#ff0055]/5 shadow-[0_0_8px_rgba(255,0,85,0.2)]";
  } else if (severity === "Medium" || severity === "Transitional") {
    color = "text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/5";
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider border backdrop-blur-md ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_4px_currentColor]" />
      <span>{severity}</span>
    </span>
  );
}
