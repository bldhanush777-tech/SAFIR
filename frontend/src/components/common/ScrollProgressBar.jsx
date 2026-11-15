import React, { useEffect, useState } from 'react';

export default function ScrollProgressBar() {
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height > 0) {
        setScrollPct(Math.min(100, Math.max(0, (winScroll / height) * 100)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div 
        className="h-full bg-gradient-to-r from-[#00f0ff] via-[#8b5cf6] to-[#00eaa6] transition-all duration-75 ease-out shadow-[0_0_12px_rgba(0,240,255,0.7)]"
        style={{ width: `${scrollPct}%` }}
      />
    </div>
  );
}
