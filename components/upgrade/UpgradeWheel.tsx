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
  const circumference = 2 * Math.PI * 42;
  const progressOffset = circumference - (chancePercent / 100) * circumference;

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
    <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto select-none">
      {/* Fixed needle with enhanced glow */}
      <div
        aria-hidden="true"
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
        style={{
          filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.9))',
        }}
      >
        <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-brand" />
      </div>

      {/* Outer glow ring with pulse */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 60%, rgba(139, 92, 246, 0.16) 70%, transparent 80%)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />
      {/* Main wheel with 3D depth */}
      <motion.div
        animate={controls}
        className="relative w-full h-full rounded-full overflow-hidden"
        style={{
          boxShadow: `
            0 0 0 4px rgba(139, 92, 246, 0.3),
            0 0 30px rgba(139, 92, 246, 0.4),
            inset 0 0 60px rgba(0, 0, 0, 0.8),
            0 10px 40px rgba(0, 0, 0, 0.6)
          `,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={`Upgrade wheel with ${chancePercent.toFixed(1)} percent win chance`}>
          <defs>
            <radialGradient id="winGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
              <stop offset="70%" stopColor="#16a34a" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#15803d" stopOpacity="0.9" />
            </radialGradient>
            <radialGradient id="loseGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#991b1b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* Base lose sector */}
          <circle cx="50" cy="50" r="47" fill="url(#loseGradient)" />

          {/* Win sector with gradient */}
          {greenAngle > 0 && (
            <path
              d={describeSector(0, greenAngle)}
              fill="url(#winGradient)"
              style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))' }}
            />
          )}

          {/* Enhanced tick marks */}
          {Array.from({ length: 24 }, (_, i) => {
            const angle = ((i * 15 - 90) * Math.PI) / 180;
            const isMajor = i % 6 === 0;
            return (
              <line
                key={i}
                x1={50 + (isMajor ? 38 : 42) * Math.cos(angle)}
                y1={50 + (isMajor ? 38 : 42) * Math.sin(angle)}
                x2={50 + 47 * Math.cos(angle)}
                y2={50 + 47 * Math.sin(angle)}
                stroke={isMajor ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'}
                strokeWidth={isMajor ? 1.2 : 0.6}
              />
            );
          })}

          {/* Inner ring border */}
          <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(139, 92, 246, 0.35)" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Center display with animated counter and progress ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-32 h-32 sm:w-36 sm:h-36">
          {/* Circular progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="3" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: progressOffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))' }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-dark/95 rounded-full border border-white/10 backdrop-blur-sm">
            <motion.span
              className="text-3xl sm:text-4xl font-black font-display leading-none bg-gradient-to-r from-white to-brand-300 bg-clip-text text-transparent"
              style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))' }}
            >
              {chancePercent.toFixed(1)}
              <span className="text-base text-text-secondary">%</span>
            </motion.span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-text-muted font-bold mt-2">
              Win chance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeWheel;
