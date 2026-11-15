import React, { useRef, useEffect } from 'react';

export default function FlameCanvas({
  gravityG = 0.165,
  flowMs = 0.20,
  intensity = 1.0, // 0 (extinct) to 1.0 (sustained)
  width = 400,
  height = 260,
  className = ""
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Observe visibility to pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Particle spark system: morphs between omnidirectional (0g) and upward-rising (1g)
    const sparks = [];
    const sparkCount = 28;
    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: 0.8 + Math.random() * 2.2,
        alpha: Math.random(),
        decay: 0.01 + Math.random() * 0.02
      });
    }

    let time = 0;

    const render = () => {
      if (!isVisibleRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      time += 0.035;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      // In 0g, centered floating; in 1g, slightly lower to allow upward flame stretch
      const cy = height * (0.50 + gravityG * 0.12);

      // Forced ventilation tilt angle (radians)
      const tiltAngle = (flowMs || 0) * 0.20;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tiltAngle);

      // Additive blending for rich combustion luminescence
      ctx.globalCompositeOperation = 'screen';

      if (intensity > 0.02) {
        // G-ratio normalization (0: zero-g, 1: earth 1g)
        const gFactor = Math.min(1.0, Math.max(0.0, gravityG));

        // Flame dimension morphing
        // 0g: Radius ~ 48px spherical nebula
        // 1g: Width ~ 26px, Height ~ 88px stretched teardrop
        const flicker = Math.sin(time * 8.5) * 2.5 * gFactor + Math.cos(time * 12) * 1.5;
        const flameWidth = (46 - gFactor * 22) * intensity;
        const flameHeight = (46 + gFactor * 46 + flicker) * intensity;

        // Render in 3 additive luminescent layers
        // 1. Outer ethereal nebula glow (Violet / Deep Blue)
        const gradOuter = ctx.createRadialGradient(
          0, -flameHeight * 0.25 * gFactor, 4,
          0, -flameHeight * 0.25 * gFactor, flameHeight * 1.35
        );
        gradOuter.addColorStop(0, `rgba(0, 240, 255, ${0.45 * intensity})`);
        gradOuter.addColorStop(0.35, `rgba(139, 92, 246, ${0.35 * intensity})`);
        gradOuter.addColorStop(0.7, `rgba(30, 27, 75, ${0.15 * intensity})`);
        gradOuter.addColorStop(1, 'rgba(2, 2, 5, 0)');

        ctx.fillStyle = gradOuter;
        ctx.beginPath();
        if (gFactor < 0.1) {
          // Pure undisturbed sphere at 0g
          ctx.arc(0, 0, flameHeight * 1.15, 0, Math.PI * 2);
        } else {
          // Stretched envelope at 1g
          ctx.ellipse(0, -flameHeight * 0.3 * gFactor, flameWidth * 1.4, flameHeight * 1.1, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // 2. Mid Reaction Sheet (Electric Ion Cyan transitioning to Amber at 1g tip)
        const gradMid = ctx.createRadialGradient(
          0, -flameHeight * 0.15 * gFactor, 2,
          0, -flameHeight * 0.2 * gFactor, flameHeight * 0.85
        );
        gradMid.addColorStop(0, `rgba(248, 250, 252, ${0.9 * intensity})`);
        gradMid.addColorStop(0.25, `rgba(0, 240, 255, ${0.85 * intensity})`);
        gradMid.addColorStop(0.65, gFactor > 0.4 ? `rgba(251, 191, 36, ${0.65 * intensity})` : `rgba(0, 200, 255, ${0.65 * intensity})`);
        gradMid.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.fillStyle = gradMid;
        ctx.beginPath();
        if (gFactor < 0.1) {
          ctx.arc(0, 0, flameHeight * 0.72, 0, Math.PI * 2);
        } else {
          // Upward stretched teardrop
          ctx.ellipse(0, -flameHeight * 0.35 * gFactor, flameWidth * 0.85, flameHeight * 0.75, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // 3. Ultra-hot luminous core (Starlight White / Cyan)
        const gradCore = ctx.createRadialGradient(
          0, 0, 0,
          0, 0, flameWidth * 0.38
        );
        gradCore.addColorStop(0, `rgba(255, 255, 255, ${0.98 * intensity})`);
        gradCore.addColorStop(0.4, `rgba(0, 240, 255, ${0.8 * intensity})`);
        gradCore.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.fillStyle = gradCore;
        ctx.beginPath();
        ctx.arc(0, -flameHeight * 0.08 * gFactor, flameWidth * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spark / Soot Particles Simulation
      // 0g: Omnidirectional floating drift in full 360 circle
      // 1g: Rapid upward rising sparks
      sparks.forEach((p) => {
        if (intensity > 0.05) {
          // Physics step
          if (gravityG < 0.08) {
            // Omnidirectional float at 0g
            p.x += p.vx * 0.6;
            p.y += p.vy * 0.6;
          } else {
            // Upward rising with gravity acceleration at partial/1g
            p.x += p.vx * (1 - gravityG * 0.5) + (Math.sin(time + p.y * 0.05) * 0.3);
            p.y -= (0.8 + gravityG * 2.2);
          }

          p.alpha -= p.decay;

          // Respawn
          if (p.alpha <= 0 || Math.abs(p.x) > width * 0.45 || Math.abs(p.y) > height * 0.45) {
            p.alpha = 0.5 + Math.random() * 0.5;
            p.decay = 0.01 + Math.random() * 0.02;

            if (gravityG < 0.08) {
              // Spawn from center in all 360 directions
              const angle = Math.random() * Math.PI * 2;
              const dist = 10 + Math.random() * 25;
              p.x = Math.cos(angle) * dist;
              p.y = Math.sin(angle) * dist;
              const speed = 0.3 + Math.random() * 0.7;
              p.vx = Math.cos(angle) * speed;
              p.vy = Math.sin(angle) * speed;
            } else {
              // Spawn from flame base, shooting upward
              p.x = (Math.random() - 0.5) * 20;
              p.y = 5 - Math.random() * 20;
              p.vx = (Math.random() - 0.5) * 0.9;
              p.vy = -(1.2 + Math.random() * 2.0);
            }
          }

          // Draw spark with holographic glow
          ctx.beginPath();
          const sparkColor = gravityG < 0.1 
            ? `rgba(0, 240, 255, ${p.alpha * intensity})`
            : `rgba(251, 191, 36, ${p.alpha * intensity})`;
          ctx.fillStyle = sparkColor;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      observer.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gravityG, flowMs, intensity, width, height]);

  return (
    <div className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="block"
      />
    </div>
  );
}
