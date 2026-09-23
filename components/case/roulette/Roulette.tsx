'use client';

import ItemImage from '@/components/ui/ItemImage';

import React, { useEffect, useMemo, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Item } from '@/types';
import { getRarityColor, formatCurrency } from '@/lib/utils';
import { playRouletteTick } from '@/lib/sound';

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
  const completionRef = useRef(onComplete);
  completionRef.current = onComplete;

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

    let cancelled = false;
    let completed = false;
    let started = false;
    let completionTimer: ReturnType<typeof setTimeout> | undefined;
    const tickTimeouts: NodeJS.Timeout[] = [];
    const jitter = (Math.random() - 0.5) * 80;
    let currentWidth = 0;

    const completeSoon = () => {
      if (cancelled || completed) return;
      clearTimeout(completionTimer);
      completionTimer = setTimeout(() => {
        if (cancelled || completed) return;
        completed = true;
        completionRef.current();
      }, 500);
    };

    const startSpin = (width: number) => {
      if (started || cancelled) return;
      started = true;
      currentWidth = width;

      const targetOffset =
        16 +
        TARGET_INDEX * TOTAL_ITEM_SPACE +
        ITEM_WIDTH / 2 -
        width / 2 +
        jitter;

      controls
        .start({
          x: -targetOffset,
          transition: {
            duration: 4.8,
            ease: [0.15, 0.85, 0.25, 1], // CS2-style cubic-bezier deceleration
          },
        })
        .then(() => {
          if (!cancelled) {
            const finalWidth =
              containerRef.current?.offsetWidth || currentWidth;
            const finalTargetOffset =
              16 +
              TARGET_INDEX * TOTAL_ITEM_SPACE +
              ITEM_WIDTH / 2 -
              finalWidth / 2 +
              jitter;
            controls.set({ x: -finalTargetOffset });
            completeSoon();
          }
        });

      // Play periodic audio ticks with increasing intervals as reel slows down
      const totalTicks = 35;
      for (let i = 0; i < totalTicks; i++) {
        const progress = i / totalTicks;
        const delay = Math.pow(progress, 2.2) * 4400;
        const t = setTimeout(() => {
          if (!cancelled) playRouletteTick(1 + (1 - progress) * 0.25);
        }, delay);
        tickTimeouts.push(t);
      }
    };

    const initialWidth = containerRef.current?.offsetWidth || 0;
    if (initialWidth > 0) {
      startSpin(initialWidth);
    }

    const observer = new ResizeObserver((entries) => {
      if (cancelled) return;
      const entry = entries[0];
      const width =
        entry?.contentRect?.width ||
        containerRef.current?.offsetWidth ||
        0;
      if (width <= 0) return;

      if (!started) {
        startSpin(width);
      } else if (completed) {
        // If already completed and user resizes window, keep item centered
        if (Math.abs(width - currentWidth) > 2) {
          currentWidth = width;
          const newTargetOffset =
            16 +
            TARGET_INDEX * TOTAL_ITEM_SPACE +
            ITEM_WIDTH / 2 -
            width / 2 +
            jitter;
          controls.set({ x: -newTargetOffset });
        }
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const fallbackTimer = setTimeout(() => {
      if (!started && !cancelled) {
        const fallbackWidth = containerRef.current?.offsetWidth || 800;
        startSpin(fallbackWidth);
      }
    }, 100);

    return () => {
      cancelled = true;
      observer.disconnect();
      clearTimeout(completionTimer);
      clearTimeout(fallbackTimer);
      tickTimeouts.forEach(clearTimeout);
      controls.stop();
    };
  }, [isSpinning, controls]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-56 bg-surface-dark/95 border-y-2 border-white/10 overflow-hidden shadow-2xl rounded-2xl select-none"
    >
      {/* Top Center Needle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="w-1.5 h-8 bg-gradient-to-b from-accent to-accent/90 shadow-[0_0_15px_#22d3ee]" />
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-accent shadow-[0_0_15px_#22d3ee]" />
      </div>

      {/* Bottom Center Needle */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px] border-b-accent shadow-[0_0_15px_#22d3ee]" />
        <div className="w-1.5 h-8 bg-gradient-to-t from-accent to-accent/90 shadow-[0_0_15px_#22d3ee]" />
      </div>

      {/* Center Vertical Guide Line */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-accent/40 z-10 pointer-events-none shadow-[0_0_10px_#22d3ee]" />

      {/* Edge Shadow Vignette */}
      <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-surface-dark via-surface-dark/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-surface-dark via-surface-dark/90 to-transparent z-10 pointer-events-none" />

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
                boxShadow: `0 4px 15px ${rarityColor}10`,
              }}
              className="h-48 flex-shrink-0 flex flex-col items-center justify-between bg-surface/90 border rounded-2xl p-3 relative overflow-hidden transition-all group"
            >
              {/* Rarity ambient top glow */}
              <div
                className="absolute top-0 inset-x-0 h-1.5"
                style={{
                  backgroundColor: rarityColor,
                  boxShadow: `0 0 12px ${rarityColor}`,
                }}
              />

              {/* Weapon type & estimated value */}
              <div className="w-full flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  {item.weaponType}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 font-display">
                  {formatCurrency(item.demoValue)}
                </span>
              </div>

              {/* Weapon Image */}
              <div className="relative w-full h-24 flex items-center justify-center my-1 bg-surface-dark/40 rounded-xl overflow-hidden p-1">
                <ItemImage
                  loading="eager"
                  src={item.image}
                  alt={item.name}
                  className="max-h-20 max-w-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Weapon Name and Rarity */}
              <div className="w-full text-center">
                <p className="text-xs font-bold text-white truncate px-1" title={item.name}>
                  {item.name}
                </p>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider truncate mt-0.5"
                  style={{ color: rarityColor }}
                >
                  {item.rarity}
                </p>
              </div>

              {/* Bottom rarity bar */}
              <div
                className="absolute bottom-0 inset-x-0 h-[3px]"
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
