'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { playRouletteTick, playWheelWhoosh } from '@/lib/sound';

interface UpgradeWheelProps {
  chancePercent: number;
  spinning: boolean;
  outcome: 'win' | 'lose' | null;
  onComplete: () => void;
  targetMultiplier?: number;
  isTurbo?: boolean;
}

const EDGE_MARGIN = 1.5;

/**
 * Builds an SVG path for an annular sector (donut slice).
 */
function getAnnularSectorPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number
): string {
  const span = Math.min(359.99, Math.max(0.01, endDeg - startDeg));
  const startRad = ((startDeg - 90) * Math.PI) / 180;
  const endRad = ((startDeg + span - 90) * Math.PI) / 180;

  const x1Outer = cx + rOuter * Math.cos(startRad);
  const y1Outer = cy + rOuter * Math.sin(startRad);
  const x2Outer = cx + rOuter * Math.cos(endRad);
  const y2Outer = cy + rOuter * Math.sin(endRad);

  const x2Inner = cx + rInner * Math.cos(endRad);
  const y2Inner = cy + rInner * Math.sin(endRad);
  const x1Inner = cx + rInner * Math.cos(startRad);
  const y1Inner = cy + rInner * Math.sin(startRad);

  const largeArc = span > 180 ? 1 : 0;

  return [
    `M ${x1Outer.toFixed(2)} ${y1Outer.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2Outer.toFixed(2)} ${y2Outer.toFixed(2)}`,
    `L ${x2Inner.toFixed(2)} ${y2Inner.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x1Inner.toFixed(2)} ${y1Inner.toFixed(2)}`,
    'Z',
  ].join(' ');
}

export const UpgradeWheel: React.FC<UpgradeWheelProps> = ({
  chancePercent,
  spinning,
  outcome,
  onComplete,
  targetMultiplier,
  isTurbo = false,
}) => {
  const controls = useAnimation();
  const reducedMotion = useReducedMotion();
  const rotationRef = useRef(0);
  const completionRef = useRef(onComplete);
  completionRef.current = onComplete;

  const [spinState, setSpinState] = useState<'idle' | 'spinning' | 'won' | 'lost'>('idle');
  const [needleTick, setNeedleTick] = useState(false);

  const clampedChance = Math.max(0, Math.min(100, chancePercent));
  const greenAngle = (clampedChance / 100) * 360;

  // Track geometry (viewBox 0 0 400 400)
  const CX = 200;
  const CY = 200;
  const R_OUTER = 178;
  const R_INNER = 112;

  // Spin parameters
  const spinDuration = isTurbo ? 1.8 : 3.8;
  const spinTurns = isTurbo ? 3 : 5;

  useEffect(() => {
    if (!spinning || outcome === null) {
      if (!spinning && outcome === null) {
        setSpinState('idle');
      }
      return;
    }

    setSpinState('spinning');
    playWheelWhoosh();

    let cancelled = false;
    let completed = false;
    let completionTimer: ReturnType<typeof setTimeout> | undefined;
    const tickTimeouts: ReturnType<typeof setTimeout>[] = [];
    const jitter = Math.random();

    // Calculate exact landing angle on the disc so the top needle points to it.
    let landing: number;
    if (outcome === 'win') {
      const low = Math.min(EDGE_MARGIN, greenAngle * 0.1);
      const high = Math.max(low, greenAngle - EDGE_MARGIN);
      landing = low + (high - low) * jitter;
    } else {
      const low = Math.min(greenAngle + EDGE_MARGIN, 358 - EDGE_MARGIN);
      const high = Math.max(low, 360 - EDGE_MARGIN);
      landing = low + (high - low) * jitter;
    }

    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const delta = (((360 - currentMod - landing) % 360) + 360) % 360;
    const target = rotationRef.current + spinTurns * 360 + delta;

    const completeSoon = () => {
      if (cancelled || completed) return;
      clearTimeout(completionTimer);
      completionTimer = setTimeout(() => {
        if (cancelled || completed) return;
        completed = true;
        setSpinState(outcome === 'win' ? 'won' : 'lost');
        completionRef.current();
      }, 350);
    };

    const run = async () => {
      if (reducedMotion) {
        rotationRef.current = target;
        controls.set({ rotate: target });
        completeSoon();
        return;
      }

      // Schedule realistic decelerating ratchet ticks synchronized with spin curve
      const totalTicks = isTurbo ? 16 : 30;
      let accumulatedTime = 0;
      for (let i = 0; i < totalTicks; i++) {
        // Cubic deceleration step
        const progress = i / totalTicks;
        const stepDelay = (isTurbo ? 30 : 45) + Math.pow(progress, 2.5) * (isTurbo ? 220 : 380);
        accumulatedTime += stepDelay;

        if (accumulatedTime >= (spinDuration - 0.1) * 1000) break;

        const pitch = 1.25 - progress * 0.55; // 1.25 down to 0.70
        tickTimeouts.push(
          setTimeout(() => {
            if (!cancelled) {
              playRouletteTick(pitch);
              setNeedleTick((prev) => !prev);
            }
          }, accumulatedTime)
        );
      }

      await controls.start({
        rotate: target,
        transition: {
          duration: spinDuration,
          ease: [0.12, 0.8, 0.2, 1], // Realistic mechanical deceleration
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
  }, [spinning, outcome, clampedChance, greenAngle, controls, reducedMotion, isTurbo, spinDuration, spinTurns]);

  // Tick graduation marks (100 ticks = 1% per tick)
  const ticks = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const angleDeg = i * 3.6;
      const angleRad = ((angleDeg - 90) * Math.PI) / 180;
      const isMajor = i % 10 === 0;
      const isMedium = i % 5 === 0;
      const tickLength = isMajor ? 14 : isMedium ? 10 : 6;
      const r1 = R_OUTER;
      const r2 = R_OUTER - tickLength;

      return {
        key: i,
        x1: CX + r1 * Math.cos(angleRad),
        y1: CY + r1 * Math.sin(angleRad),
        x2: CX + r2 * Math.cos(angleRad),
        y2: CY + r2 * Math.sin(angleRad),
        isMajor,
        isMedium,
        angleDeg,
      };
    });
  }, []);

  const winSectorPath = useMemo(() => {
    if (greenAngle <= 0.05) return null;
    return getAnnularSectorPath(CX, CY, R_INNER, R_OUTER, 0, greenAngle);
  }, [greenAngle]);

  const loseSectorPath = useMemo(() => {
    if (greenAngle >= 359.95) return null;
    return getAnnularSectorPath(CX, CY, R_INNER, R_OUTER, greenAngle, 360);
  }, [greenAngle]);

  // End boundary laser position
  const laserEndCoord = useMemo(() => {
    const rad = ((greenAngle - 90) * Math.PI) / 180;
    return {
      x1: CX + R_INNER * Math.cos(rad),
      y1: CY + R_INNER * Math.sin(rad),
      x2: CX + (R_OUTER + 2) * Math.cos(rad),
      y2: CY + (R_OUTER + 2) * Math.sin(rad),
    };
  }, [greenAngle]);

  return (
    <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto select-none flex items-center justify-center">
      {/* Dynamic ambient energy backglow */}
      <div
        className={`absolute inset-[-12%] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          spinState === 'won'
            ? 'bg-emerald-500/35 scale-105'
            : spinState === 'lost'
            ? 'bg-rose-500/25 scale-95'
            : spinState === 'spinning'
            ? 'bg-brand/30 animate-pulse'
            : 'bg-brand/15'
        }`}
      />

      {/* Outer Tactical Bezel Chassis */}
      <div className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-b from-white/15 via-white/5 to-black/60 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)]">
        <div className="w-full h-full rounded-full bg-[#0a0c13] relative overflow-hidden border border-white/[0.08]">
          {/* Carbon texture simulation */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:12px_12px]" />
        </div>
      </div>

      {/* Rotating Disc Track */}
      <motion.div
        animate={controls}
        className="relative w-[92%] h-[92%] rounded-full overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.95)]"
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          role="img"
          aria-label={`Upgrade wheel with ${clampedChance.toFixed(1)} percent win chance`}
        >
          <defs>
            {/* Win sector gradient: Emerald to Cyan */}
            <linearGradient id="winGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>

            {/* Lose sector gradient: Carbon obsidian */}
            <linearGradient id="loseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#171923" />
              <stop offset="50%" stopColor="#0f1118" />
              <stop offset="100%" stopColor="#141722" />
            </linearGradient>

            {/* Glowing laser filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Loss Sector */}
          {loseSectorPath && (
            <path
              d={loseSectorPath}
              fill="url(#loseGradient)"
              stroke="#27272a"
              strokeWidth="1"
            />
          )}

          {/* Win Sector */}
          {winSectorPath && (
            <path
              d={winSectorPath}
              fill="url(#winGradient)"
              filter="url(#neonGlow)"
              opacity="0.95"
            />
          )}

          {/* Inner & Outer track rail rings */}
          <circle
            cx={CX}
            cy={CY}
            r={R_OUTER}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
          />
          <circle
            cx={CX}
            cy={CY}
            r={R_INNER}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.5"
          />

          {/* Precision graduation ticks */}
          {ticks.map((t) => {
            const inWinZone = t.angleDeg <= greenAngle;
            return (
              <line
                key={t.key}
                x1={t.x1.toFixed(2)}
                y1={t.y1.toFixed(2)}
                x2={t.x2.toFixed(2)}
                y2={t.y2.toFixed(2)}
                stroke={
                  t.isMajor
                    ? inWinZone
                      ? '#ffffff'
                      : 'rgba(255, 255, 255, 0.7)'
                    : t.isMedium
                    ? inWinZone
                      ? 'rgba(255, 255, 255, 0.8)'
                      : 'rgba(255, 255, 255, 0.35)'
                    : inWinZone
                    ? 'rgba(255, 255, 255, 0.4)'
                    : 'rgba(255, 255, 255, 0.12)'
                }
                strokeWidth={t.isMajor ? 2 : t.isMedium ? 1.5 : 1}
              />
            );
          })}

          {/* Laser boundary at 0° (Start) */}
          {greenAngle > 0 && (
            <line
              x1={CX}
              y1={CY - R_INNER}
              x2={CX}
              y2={CY - R_OUTER - 2}
              stroke="#34d399"
              strokeWidth="2.5"
              filter="url(#neonGlow)"
            />
          )}

          {/* Laser boundary at greenAngle (End) */}
          {greenAngle > 0 && greenAngle < 360 && (
            <line
              x1={laserEndCoord.x1.toFixed(2)}
              y1={laserEndCoord.y1.toFixed(2)}
              x2={laserEndCoord.x2.toFixed(2)}
              y2={laserEndCoord.y2.toFixed(2)}
              stroke="#22d3ee"
              strokeWidth="2.5"
              filter="url(#neonGlow)"
            />
          )}
        </svg>
      </motion.div>

      {/* Fixed High-Precision Needle at Top (12 o'clock) */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
        {/* Needle Housing & Pivot */}
        <motion.div
          animate={
            spinning
              ? {
                  y: needleTick ? [-1.5, 0] : [0, -1.5],
                  rotate: needleTick ? [-2, 2, 0] : [2, -2, 0],
                }
              : { y: 0, rotate: 0 }
          }
          transition={{ duration: 0.06 }}
          className="flex flex-col items-center filter drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]"
        >
          {/* Mechanical Needle Anchor */}
          <div className="w-5 h-2 rounded-full bg-gradient-to-r from-zinc-300 via-white to-zinc-300 border border-zinc-500 shadow-md" />

          {/* Needle Arrowhead */}
          <svg width="26" height="34" viewBox="0 0 26 34" fill="none">
            {/* Outer metallic pointer */}
            <path
              d="M 13 32 L 2 6 Q 13 2 24 6 Z"
              fill="url(#needleMetal)"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="1.2"
            />
            {/* Luminous Neon Core */}
            <path
              d="M 13 29 L 5 8 Q 13 5 21 8 Z"
              fill="#22d3ee"
              opacity="0.9"
            />
            {/* Laser focal tip */}
            <circle cx="13" cy="27" r="2.5" fill="#ffffff" />

            <defs>
              <linearGradient id="needleMetal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Downward laser projection beam */}
        <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-400 via-cyan-400/80 to-transparent -mt-1 blur-[0.5px]" />
      </div>

      {/* Cybernetic Center HUD Display */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-[2px] bg-gradient-to-b from-white/20 via-brand/40 to-black/80 shadow-[0_10px_35px_rgba(0,0,0,0.9),inset_0_0_25px_rgba(0,0,0,0.8)]">
          <div className="w-full h-full rounded-full bg-[#0d0f17]/95 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center p-3 relative overflow-hidden">
            {/* Subtle radar sweep or pulse */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18)_0%,transparent_75%)]" />

            {/* Multiplier / Target Tag */}
            {targetMultiplier ? (
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 mb-1">
                {targetMultiplier.toFixed(2)}× MULTIPLIER
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                WIN PROBABILITY
              </span>
            )}

            {/* Hero Percentage Display */}
            <div className="flex items-baseline justify-center gap-0.5">
              <span
                className={`text-4xl sm:text-5xl font-black font-display tracking-tight transition-colors duration-300 ${
                  spinState === 'won'
                    ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                    : spinState === 'lost'
                    ? 'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.7)]'
                    : 'text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                }`}
              >
                {clampedChance.toFixed(1)}
              </span>
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-display">
                %
              </span>
            </div>

            {/* Dynamic Status Pill */}
            <div className="mt-2">
              {spinState === 'spinning' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/20 border border-brand/50 text-[10px] font-black uppercase tracking-wider text-brand-300 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Rolling…
                </div>
              ) : spinState === 'won' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                  <span>✦ Success ✦</span>
                </div>
              ) : spinState === 'lost' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/60 text-[10px] font-black uppercase tracking-wider text-rose-300">
                  <span>Missed</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-text-muted tracking-wider uppercase">
                  <span>Target Zone</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeWheel;
