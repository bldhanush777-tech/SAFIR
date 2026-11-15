import React from 'react';

export default function PremiumButton({
  children,
  onClick = null,
  variant = "primary", // primary, secondary, glass, selected, laser
  size = "md",
  icon = null,
  className = "",
  disabled = false,
  type = "button"
}) {
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2 text-xs sm:text-sm",
    lg: "px-7 py-3 text-sm sm:text-base",
  }[size] || "px-5 py-2 text-xs sm:text-sm";

  // Base pill shape (radius 99px) with visible cyan focus ring and sensor glow
  const basePill = "inline-flex items-center justify-center gap-2 rounded-full font-mono uppercase tracking-wider font-medium transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020205] disabled:opacity-30 disabled:cursor-not-allowed";

  // 1. PRIMARY: Floating holographic pill. Transparent with a 1px --ion-cyan border and inset cyan glow, filling with solid --ion-cyan on hover (text becomes --void).
  if (variant === "primary") {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`${basePill} bg-transparent text-[#00f0ff] border border-[#00f0ff] shadow-[inset_0_0_12px_rgba(0,240,255,0.2),0_0_12px_rgba(0,240,255,0.15)] hover:bg-[#00f0ff] hover:text-[#020205] hover:shadow-[0_0_24px_rgba(0,240,255,0.5)] ${sizeClasses} ${className}`}
      >
        <span>{children}</span>
        {icon}
      </button>
    );
  }

  // 2. SELECTED PRESET: Solid --ion-cyan background with --void text.
  if (variant === "selected") {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`${basePill} bg-[#00f0ff] text-[#020205] font-semibold shadow-[0_0_16px_rgba(0,240,255,0.45)] border border-[#00f0ff] ${sizeClasses} ${className}`}
      >
        <span>{children}</span>
        {icon}
      </button>
    );
  }

  // 3. SECONDARY / GLASS / LASER: Transparent with hairline glow-line border, starlight text, cyan highlight on hover
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${basePill} bg-[rgba(255,255,255,0.02)] text-[#f8fafc] border border-[rgba(0,240,255,0.18)] backdrop-blur-md hover:border-[#00f0ff] hover:text-[#00f0ff] hover:shadow-[0_0_16px_rgba(0,240,255,0.25)] hover:backdrop-blur-xl ${sizeClasses} ${className}`}
    >
      <span>{children}</span>
      {icon}
    </button>
  );
}
