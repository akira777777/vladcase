'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { formatCurrency, getRankTitle } from '@/lib/utils';
import { isSoundMuted, setSoundMuted, playCashSound } from '@/lib/sound';
import {
  ExternalLink,
  Flame,
  Package,
  PlusCircle,
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const { balance, level, addBalance, isLoaded } = useEconomy();
  const { inventory } = useInventory();
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isSoundMuted());
  }, []);

  const toggleSound = () => {
    const nextState = !muted;
    setMutedState(nextState);
    setSoundMuted(nextState);
  };

  const handleAddBalance = () => {
    playCashSound();
    void addBalance(500);
  };

  const rank = getRankTitle(isLoaded ? level : 1);

  return (
    <nav className="fixed top-0 w-full z-40 border-b border-white/10 bg-background/90 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-base sm:text-xl font-display font-black tracking-tight text-white">
              VLAD<span className="text-accent text-glow">CASE</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors py-1 px-2 rounded-lg ${
                pathname === '/'
                  ? 'text-white font-bold bg-white/10'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              Cases
            </Link>
            <Link
              href="/inventory"
              className={`flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg ${
                pathname === '/inventory'
                  ? 'text-white font-bold bg-white/10'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <span>Inventory</span>
              {inventory.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-accent/20 text-accent border border-accent/30">
                  {inventory.length}
                </span>
              )}
            </Link>
            <Link
              href="/contracts"
              className={`flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg ${
                pathname === '/contracts'
                  ? 'text-white font-bold bg-white/10'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span>Contracts</span>
            </Link>
            <a
              href="https://upgrader.pro/en"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-text-secondary hover:text-accent transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
            >
              <span>Upgrader</span>
              <ExternalLink className="w-3 h-3 text-text-muted" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* User Stats, Audio Toggle, & Balance */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            title={muted ? 'Unmute unboxing audio' : 'Mute audio'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/5 transition-all"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-text-muted" />
            ) : (
              <Volume2 className="w-4 h-4 text-accent" />
            )}
          </button>

          {/* Level & Rank Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-dark/80 border border-white/10 text-xs font-semibold text-text-secondary shadow-sm"
            title={`Current rank: ${rank.title}`}
          >
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span className="text-white">LVL {isLoaded ? level : 1}</span>
            <span
              className="hidden lg:inline text-[10px] uppercase font-bold tracking-wider"
              style={{ color: rank.color }}
            >
              • {rank.title}
            </span>
          </div>

          {/* Balance display with Quick Top-Up */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 shadow-inner">
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase font-bold text-text-muted leading-tight tracking-wider">
                Balance
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 leading-tight">
                {isLoaded ? formatCurrency(balance) : '$0.00'}
              </span>
            </div>

            <button
              disabled={!isLoaded}
              aria-label="Add $500 free credits"
              onClick={handleAddBalance}
              title="Add $500 for testing"
              className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
