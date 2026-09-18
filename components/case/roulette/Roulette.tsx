'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Item } from '@/types';
import { getRarityColor, getRarityBadgeClass } from '@/lib/utils';

interface RouletteProps {
  items: Item[];
  winningItem: Item;
  isSpinning: boolean;
  onComplete: () => void;
}

const ITEM_WIDTH = 180;
const ITEM_GAP = 12;
const TOTAL_ITEM_SPACE = ITEM_WIDTH + ITEM_GAP;
const TARGET_INDEX = 42; // Index where the winning item is placed

export const Roulette: React.FC<RouletteProps> = ({
  items,
  winningItem,
  isSpinning,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play synthetic mechanical tick sound
  const playTick = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === 'running') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.035);
      }
    } catch {
      // Audio autoplay restrictions or unsupported
    }
  };

  // Build reel items array with winningItem securely placed at TARGET_INDEX
  const reelItems = useMemo(() => {
    const list: Item[] = [];
    if (!items || items.length === 0) return [winningItem];

    // Seed items before winningItem
    for (let i = 0; i < TARGET_INDEX; i++) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      list.push(randomItem);
    }

    // Place the predetermined winner
    list.push(winningItem);

    // Seed items after winningItem
    for (let i = 0; i < 18; i++) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      list.push(randomItem);
    }

    return list;
  }, [items, winningItem]);

  useEffect(() => {
    if (!isSpinning) {
      controls.set({ x: 0 });
      return;
    }

    // Resume AudioContext on user interaction if suspended
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const containerWidth = containerRef.current?.offsetWidth || 800;
    // Calculate position so TARGET_INDEX item is centered under the pointer
    // Random jitter between -45px and +45px within the 180px card
    const jitter = (Math.random() - 0.5) * 80;
    const targetOffset = (TARGET_INDEX * TOTAL_ITEM_SPACE) + (ITEM_WIDTH / 2) - (containerWidth / 2) + jitter;

    controls.start({
      x: -targetOffset,
      transition: {
        duration: 4.8,
        ease: [0.15, 0.85, 0.25, 1], // CS2-style cubic-bezier deceleration
      },
    }).then(() => {
      setTimeout(() => {
        onComplete();
      }, 500);
    });

    // Play periodic audio ticks with increasing intervals as reel slows down
    const tickTimeouts: NodeJS.Timeout[] = [];
    const totalTicks = 35;
    for (let i = 0; i < totalTicks; i++) {
      // Non-linear progression matching the deceleration curve
      const progress = i / totalTicks;
      const delay = Math.pow(progress, 2.2) * 4400;
      const t = setTimeout(() => {
        playTick();
      }, delay);
      tickTimeouts.push(t);
    }

    return () => {
      tickTimeouts.forEach(clearTimeout);
    };
  }, [isSpinning, controls, onComplete]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-52 bg-surface-dark border-y-2 border-white/10 overflow-hidden shadow-2xl rounded-2xl select-none"
    >
      {/* Top Center Needle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="w-1 h-8 bg-gradient-to-b from-accent to-accent/90 shadow-[0_0_15px_#22d3ee]" />
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-accent shadow-[0_0_10px_#22d3ee]" />
      </div>

      {/* Bottom Center Needle */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-accent shadow-[0_0_10px_#22d3ee]" />
        <div className="w-1 h-8 bg-gradient-to-t from-accent to-accent/90 shadow-[0_0_15px_#22d3ee]" />
      </div>

      {/* Center Vertical Guide Line */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-accent/30 z-10 pointer-events-none shadow-[0_0_8px_#22d3ee]" />

      {/* Edge Shadow Vignette */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface-dark via-surface-dark/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface-dark via-surface-dark/80 to-transparent z-10 pointer-events-none" />

      {/* Reel strip */}
      <motion.div
        animate={controls}
        className="flex items-center h-full px-4"
        style={{ gap: `${ITEM_GAP}px`, width: 'max-content' }}
      >
        {reelItems.map((item, idx) => {
          const rarityColor = getRarityColor(item.rarity);
          return (
            <div
              key={`${item.id}-${idx}`}
              style={{
                width: `${ITEM_WIDTH}px`,
                borderColor: `${rarityColor}40`,
              }}
              className="h-44 flex-shrink-0 flex flex-col items-center justify-between bg-surface border rounded-xl p-3 relative overflow-hidden transition-all group"
            >
              {/* Rarity ambient top glow */}
              <div
                className="absolute top-0 inset-x-0 h-1"
                style={{ backgroundColor: rarityColor, boxShadow: `0 0 10px ${rarityColor}` }}
              />

              {/* Weapon type */}
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider self-start">
                {item.weaponType}
              </span>

              {/* Weapon Image */}
              <div className="relative w-full h-24 flex items-center justify-center my-1">
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-20 max-w-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    // Fallback to stylized SVG placeholder if external URL fails
                    (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90' viewBox='0 0 160 90'><rect width='160' height='90' fill='%2311151C'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%238E96A3' font-family='sans-serif' font-size='11' font-weight='bold'>${encodeURIComponent(item.name)}</text></svg>`;
                  }}
                />
              </div>

              {/* Weapon Name and Rarity */}
              <div className="w-full text-center">
                <p className="text-xs font-bold text-white truncate px-1">
                  {item.name}
                </p>
                <p 
                  className="text-[10px] font-medium uppercase tracking-wider truncate"
                  style={{ color: rarityColor }}
                >
                  {item.rarity}
                </p>
              </div>

              {/* Bottom rarity bar */}
              <div 
                className="absolute bottom-0 inset-x-0 h-[2px]"
                style={{ backgroundColor: rarityColor }}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Roulette;
