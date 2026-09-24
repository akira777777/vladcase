'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { playRouletteTick } from '@/lib/sound';

interface UpgradeWheelProps {
  chancePercent: number;
  spinning: boolean;
  outcome: 'win' | 'lose' | null;
  onComplete: () => void;
}

const SPIN_TURNS = 4;
const SPIN_DURATION = 4.2;
// Degrees kept away from the sector borders so the landing is unambiguous.
const EDGE_MARGIN = 1.2;

export const UpgradeWheel: React.FC<UpgradeWheelProps> = ({
  chancePercent,
  spinning,
  outcome,
  onComplete,
}) => {
  const controls = useAnimation();
  const reducedMotion = useReducedMotion();
  const rotationRef = useRef(0);
  const completionRef = useRef(onComplete);
  completionRef.current = onComplete;

  const greenAngle = (chancePercent / 100) * 360;

  useEffect(() => {
    if (!spinning || outcome === null) return;
    let cancelled = false;
    let completed = false;
    let completionTimer: ReturnType<typeof setTimeout> | undefined;
    const tickTimeouts: ReturnType<typeof setTimeout>[] = [];
    const jitter = Math.random();

    // The disc rotates clockwise; a disc point at pre-rotation angle θ ends up
    // under the fixed top needle at θ + rotation. Solve for the landing angle
    // inside the requested sector, then continue from the current rotation.
    let landing: number;
    if (outcome === 'win') {
      const low = Math.min(EDGE_MARGIN, greenAngle / 2);
      const high = Math.max(low, greenAngle - EDGE_MARGIN);
      landing = low + (high - low) * jitter;
    } else {
      const low = Math.min(greenAngle + EDGE_MARGIN, 358 - EDGE_MARGIN);
      const high = Math.max(low, 360 - EDGE_MARGIN);
      landing = low + (high - low) * jitter;
    }
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const delta = (((360 - currentMod - landing) % 360) + 360) % 360;
    const target = rotationRef.current + SPIN_TURNS * 360 + delta;

    const completeSoon = () => {
      if (cancelled || completed) return;
      clearTimeout(completionTimer);
      completionTimer = setTimeout(() => {
        if (cancelled || completed) return;
        completed = true;
        completionRef.current();
      }, 450);
    };

    const run = async () => {
      if (reducedMotion) {
        rotationRef.current = target;
        controls.set({ rotate: target });
        completeSoon();
        return;
      }
      const totalTicks = 24;
      let elapsed = 0;
      for (let i = 0; i < totalTicks; i++) {
        const wait = 70 + i * 10;
        elapsed += wait;
        tickTimeouts.push(
          setTimeout(() => playRouletteTick(1300 - i * 30), elapsed)
        );
      }
      await controls.start({
        rotate: target,
        transition: {
          duration: SPIN_DURATION,
          ease: [0.15, 0.85, 0.25, 1],
        },
      });
      if (!cancelled) {
        rotationRef.current = target;
        completeSoon();
      }
    };
    void run();

    return () => {
      cancelled = true;
      clearTimeout(completionTimer);
      tickTimeouts.forEach(clearTimeout);
    };
  }, [spinning, outcome, chancePercent, greenAngle, controls, reducedMotion]);

  const describeSector = (startAngle: number, endAngle: number): string => {
    const start = ((startAngle - 90) * Math.PI) / 180;
    const end = ((endAngle - 90) * Math.PI) / 180;
    const radius = 47;
    const x1 = 50 + radius * Math.cos(start);
    const y1 = 50 + radius * Math.sin(start);
    const x2 = 50 + radius * Math.cos(end);
    const y2 = 50 + radius * Math.sin(end);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M 50 50 L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
  };

  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto select-none">
      {/* Fixed needle */}
      <div
        aria-hidden="true"
        className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[11px] border-r-[11px] border-t-[20px] border-l-transparent border-r-transparent border-t-accent drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
      />
      <motion.div
        animate={controls}
        className="w-full h-full rounded-full overflow-hidden border-4 border-white/10 shadow-card"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={`Upgrade wheel with ${chancePercent.toFixed(1)} percent win chance`}>
          {/* Base red disc; a full-circle sector path cannot render as one arc. */}
          <circle cx="50" cy="50" r="47" fill="#7f1d1d" opacity={0.55} />
          {greenAngle > 0 && (
            <path d={describeSector(0, greenAngle)} fill="#16a34a" />
          )}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = ((i * 30 - 90) * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={50 + 40 * Math.cos(angle)}
                y1={50 + 40 * Math.sin(angle)}
                x2={50 + 47 * Math.cos(angle)}
                y2={50 + 47 * Math.sin(angle)}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={0.8}
              />
            );
          })}
        </svg>
      </motion.div>
      {/* Center chance display */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-28 h-28 rounded-full bg-surface-dark/95 border border-white/15 flex flex-col items-center justify-center shadow-inner">
          <span className="text-2xl font-black font-display text-white leading-none">
            {chancePercent.toFixed(1)}
            <span className="text-sm text-text-secondary">%</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-text-muted font-bold mt-1">
            Win chance
          </span>
        </div>
      </div>
    </div>
  );
};

export default UpgradeWheel;
