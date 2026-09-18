'use client';

import React from 'react';
import Link from 'next/link';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, Package, Shield, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { balance, level, addBalance, isLoaded } = useEconomy();
  const { inventory } = useInventory();

  return (
    <nav className="fixed top-0 w-full z-40 border-b border-white/10 bg-background/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xl font-display font-black tracking-tight text-white">
              VLAD<span className="text-accent">CASE</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-text-secondary hover:text-white transition-colors"
            >
              Cases
            </Link>
            <Link
              href="/inventory"
              className="flex items-center gap-1.5 text-text-secondary hover:text-white transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Inventory</span>
              {inventory.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-accent/20 text-accent border border-accent/30">
                  {inventory.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* User Stats & Balance */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Level Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-text-secondary">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span>LVL {isLoaded ? level : 1}</span>
          </div>

          {/* Balance display with Quick Top-Up */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10 shadow-inner">
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-text-muted leading-tight">
                Balance
              </span>
              <span className="text-sm font-bold text-emerald-400 leading-tight">
                {isLoaded ? formatCurrency(balance) : '$0.00'}
              </span>
            </div>

            <button
              onClick={() => addBalance(500)}
              title="Add $500 for testing"
              className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Inventory Link */}
          <Link
            href="/inventory"
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white"
            title="My Inventory"
          >
            <Package className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
