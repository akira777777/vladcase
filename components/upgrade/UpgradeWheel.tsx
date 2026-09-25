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

const EDGE_MARGIN = 2.0;

/**
 * Builds an SVG path for an annular sector (donut slice).
 * Angles: 0° is 12 o'clock, increasing clockwise.
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

  // Preserve last valid positive chance and multiplier so wheel graphics NEVER drop to 0% mid-spin or transition
  const lastChanceRef = useRef(chancePercent > 0 ? chancePercent : 20);
  if (chancePercent > 0) {
    lastChanceRef.current = chancePercent;
  }
  const displayChance = chancePercent > 0 ? chancePercent : lastChanceRef.current;
  const clampedChance = Math.max(0, Math.min(100, displayChance));
  const greenAngle = (clampedChance / 100) * 360;

  const lastMultiplierRef = useRef(targetMultiplier);
  if (targetMultiplier && targetMultiplier > 0) {
    lastMultiplierRef.current = targetMultiplier;
  }
  const displayMultiplier = targetMultiplier || lastMultiplierRef.current;

  // Track geometry (viewBox 0 0 400 400)
  const CX = 200;
  const CY = 200;
  const R_OUTER = 178;
  const R_INNER = 114;

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

    // The wheel stays static. The needle rotates clockwise from its current angle.
    // 0° is 12 o'clock (the start of the green zone).
    // Green zone is [0, greenAngle]. Loss zone is [greenAngle, 360].
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

    // Solve for target angle continuing from the needle's current rotation
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const delta = (((landing - currentMod) % 360) + 360) % 360;
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
      const totalTicks = isTurbo ? 16 : 32;
      let accumulatedTime = 0;
      for (let i = 0; i < totalTicks; i++) {
        const progress = i / totalTicks;
        const stepDelay = (isTurbo ? 28 : 42) + Math.pow(progress, 2.4) * (isTurbo ? 220 : 380);
        accumulatedTime += stepDelay;

        if (accumulatedTime >= (spinDuration - 0.1) * 1000) break;

        const pitch = 1.25 - progress * 0.55; // Drops from 1.25 to 0.70
        tickTimeouts.push(
          setTimeout(() => {
            if (!cancelled) {
              playRouletteTick(pitch);
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

  // Tick graduation marks (100 ticks = 1% per tick, totally stationary on the wheel)
  const ticks = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const angleDeg = i * 3.6;
      const angleRad = ((angleDeg - 90) * Math.PI) / 180;
      const isMajor = i % 10 === 0;
      const isMedium = i % 5 === 0;
      const tickLength = isMajor ? 13 : isMedium ? 9 : 5;
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

  // Win Sector path (starts at 0° / 12 o'clock and stays in place!)
  const winSectorPath = useMemo(() => {
    if (greenAngle <= 0.05) return null;
    return getAnnularSectorPath(CX, CY, R_INNER, R_OUTER, 0, greenAngle);
  }, [greenAngle]);

  // Loss Sector path (starts at greenAngle and completes to 360°)
  const loseSectorPath = useMemo(() => {
    if (greenAngle >= 359.95) return null;
    return getAnnularSectorPath(CX, CY, R_INNER, R_OUTER, greenAngle, 360);
  }, [greenAngle]);

  // Laser boundary at greenAngle
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
        className={`absolute inset-[-10%] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          spinState === 'won'
            ? 'bg-emerald-500/35 scale-105'
            : spinState === 'lost'
            ? 'bg-rose-500/25 scale-95'
            : spinState === 'spinning'
            ? 'bg-cyan-500/20 animate-pulse'
            : 'bg-brand/15'
        }`}
      />

      {/* Outer Tactical Bezel Chassis */}
      <div className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-b from-white/15 via-white/5 to-black/70 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)]">
        <div className="w-full h-full rounded-full bg-[#0a0c13] relative overflow-hidden border border-white/[0.08]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:12px_12px]" />
        </div>
      </div>

      {/* STATIC Base Wheel: Green Win Sector and Dark Loss Sector stay fixed in place! */}
      <div className="relative w-[92%] h-[92%] rounded-full overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.95)]">
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
              <stop offset="0%" stopColor="#161822" />
              <stop offset="50%" stopColor="#0f1118" />
              <stop offset="100%" stopColor="#13151f" />
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

          {/* Loss Sector (Stationary) */}
          {loseSectorPath && (
            <path
              d={loseSectorPath}
              fill="url(#loseGradient)"
              stroke="#27272a"
              strokeWidth="1"
            />
          )}

          {/* Win Sector (Stationary at 0° to greenAngle!) */}
          {winSectorPath && (
            <path
              d={winSectorPath}
              fill="url(#winGradient)"
              filter="url(#neonGlow)"
              opacity="0.95"
            />
          )}

          {/* Track rail rings */}
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

          {/* Stationary graduation ticks */}
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

          {/* Stationary Start Laser Line (12 o'clock, 0°) */}
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

          {/* Stationary End Laser Line (at greenAngle) */}
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
      </div>

      {/* ROTATING LASER NEEDLE: Sweeps around the circle and stops at the random outcome! */}
      <motion.div
        animate={controls}
        className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center"
        style={{ transformOrigin: '50% 50%' }}
      >
        {/* Needle indicator arm positioned at 12 o'clock (0°), pointing outwards across the track */}
        <div className="absolute top-[4.5%] left-1/2 -translate-x-1/2 flex flex-col items-center">
          {/* Laser Pointer Head */}
          <div className="relative flex flex-col items-center filter drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]">
            {/* Arrowhead diamond touching the outer track */}
            <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
              {/* Outer metallic pointer arrow */}
              <path
                d="M 11 26 L 2 6 Q 11 1 20 6 Z"
                fill="url(#needleMetalGradient)"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.2"
              />
              {/* Glowing neon core */}
              <path
                d="M 11 23 L 5 8 Q 11 4 17 8 Z"
                fill={
                  spinState === 'won'
                    ? '#34d399'
                    : spinState === 'lost'
                    ? '#f43f5e'
                    : '#22d3ee'
                }
              />
              {/* Laser focal dot */}
              <circle cx="11" cy="22" r="2.5" fill="#ffffff" />

              <defs>
                <linearGradient id="needleMetalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing laser ray beam spanning the donut track */}
            <div
              className="w-[3px] h-14 -mt-1 rounded-full"
              style={{
                background: `linear-gradient(to bottom, ${
                  spinState === 'won'
                    ? '#34d399'
                    : spinState === 'lost'
                    ? '#f43f5e'
                    : '#22d3ee'
                }, transparent)`,
                boxShadow: `0 0 8px ${
                  spinState === 'won'
                    ? '#34d399'
                    : spinState === 'lost'
                    ? '#f43f5e'
                    : '#22d3ee'
                }`,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Cybernetic Center HUD Display (Stationary, clear & high-contrast) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-[2px] bg-gradient-to-b from-white/20 via-brand/40 to-black/80 shadow-[0_10px_35px_rgba(0,0,0,0.9),inset_0_0_25px_rgba(0,0,0,0.8)]">
          <div className="w-full h-full rounded-full bg-[#0d0f17]/95 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center p-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18)_0%,transparent_75%)]" />

            {/* Multiplier / Target Tag */}
            {displayMultiplier ? (
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 mb-1">
                {displayMultiplier.toFixed(2)}× MULTIPLIER
              </span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                WIN PROBABILITY
              </span>
            )}

            {/* Percentage Display */}
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

            {/* Status Pill */}
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
