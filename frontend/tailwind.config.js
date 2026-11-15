/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Antigravity / Weightless Holograph Design Tokens
        void: '#020205',
        starlight: '#f8fafc',
        nebula: '#94a3b8',
        'ion-cyan': '#00f0ff',
        'antimatter-violet': '#8b5cf6',
        glass: 'rgba(255, 255, 255, 0.03)',
        'glow-line': 'rgba(0, 240, 255, 0.15)',

        // Status Colors
        safe: '#00eaa6',
        marginal: '#fbbf24',
        danger: '#ff0055',

        // Legacy & Fallback mappings to guarantee seamless rendering across older classes
        ink: '#020205',
        paper: '#f8fafc',
        mute: '#94a3b8',
        ember: '#00f0ff',
        amber: '#8b5cf6',
        line: 'rgba(0, 240, 255, 0.15)',
        'space-black': '#020205',
        'space-card': 'rgba(255, 255, 255, 0.03)',
        'space-border': 'rgba(0, 240, 255, 0.15)',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'accent-sage': '#00f0ff',
        'safir-obsidian': '#020205',
        'safir-slate': 'rgba(255, 255, 255, 0.03)',
        'safir-panel': 'rgba(255, 255, 255, 0.03)',
        'safir-border': 'rgba(0, 240, 255, 0.15)',
        'safir-cyan': '#00f0ff',
        'safir-amber': '#8b5cf6',
        'safir-crimson': '#ff0055',
        'safir-emerald': '#00eaa6',
        'safir-gray': '#94a3b8',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['"JetBrains Mono"', 'monospace'], // Map serif references to JetBrains Mono per HUD spec
        space: ['"Space Grotesk"', 'sans-serif'],
      },
      borderRadius: {
        'panel': '16px',
        'pill': '99px',
        'dropdown': '14px',
      },
      boxShadow: {
        'holo-glow': '0 8px 32px rgba(0, 240, 255, 0.08)',
        'holo-cyan': '0 0 20px rgba(0, 240, 255, 0.35)',
        'holo-violet': '0 0 20px rgba(139, 92, 246, 0.35)',
        'glow-cyan': '0 0 16px rgba(0, 240, 255, 0.4)',
        'glow-ember': '0 0 20px rgba(0, 240, 255, 0.35)',
        'glow-amber': '0 0 20px rgba(139, 92, 246, 0.35)',
      }
    },
  },
  plugins: [],
}
