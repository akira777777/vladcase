'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Flame, History, Menu, Package, PlusCircle, Settings, Shield, Sparkles, TrendingUp, Volume2, VolumeX, X } from 'lucide-react';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { usePreferences } from '@/hooks/usePreferences';
import { formatCurrency, getRankTitle } from '@/lib/utils';
import { playCashSound } from '@/lib/sound';

export const Navbar = () => {
  const pathname = usePathname();
  const { balance, level, addBalance, isLoaded } = useEconomy();
  const { inventory } = useInventory();
  const { preferences, setPreference } = usePreferences();
  const [menuOpen, setMenuOpen] = useState(false);
  const rank = getRankTitle(isLoaded ? level : 1);

  useEffect(() => setMenuOpen(false), [pathname]);

  const navClass = (href: string) => `transition-colors py-1.5 px-2 rounded-lg ${pathname === href ? 'text-white font-bold bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'}`;
  const handleAddBalance = () => { playCashSound(); void addBalance(500); };
  const soundEnabled = preferences.soundEnabled;

  return (
    <nav className="fixed top-0 w-full z-40 border-b border-white/10 bg-background/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 sm:gap-8 min-w-0">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0" aria-label="VLADCASE home">
            <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent group-hover:scale-105 transition-transform"><Sparkles className="w-4 h-4" /></span>
            <span className="text-base sm:text-xl font-display font-black tracking-tight text-white">VLAD<span className="text-accent text-glow">CASE</span></span>
          </Link>
          <div className="hidden lg:flex items-center gap-4 text-sm font-medium">
            <Link href="/" className={navClass('/')}>Cases</Link>
            <Link href="/inventory" className={navClass('/inventory')}><Package className="w-4 h-4 text-purple-400" />Inventory {inventory.length > 0 && <span className="ml-1 text-[10px] text-accent">{inventory.length}</span>}</Link>
            <Link href="/stats" className={navClass('/stats')}><BarChart3 className="w-4 h-4" />Stats</Link>
            <Link href="/history" className={navClass('/history')}><History className="w-4 h-4" />History</Link>
            <Link href="/contracts" className={navClass('/contracts')}><Flame className="w-4 h-4 text-amber-400" />Contracts</Link>
            <Link href="/upgrade" className={navClass('/upgrade')}><TrendingUp className="w-4 h-4 text-emerald-400" />Upgrader</Link>
            <Link href="/settings" className={navClass('/settings')}><Settings className="w-4 h-4" />Settings</Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreference('soundEnabled', !soundEnabled)} aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'} className="hidden sm:inline-flex p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary border border-white/5" title={soundEnabled ? 'Mute audio' : 'Unmute audio'}>{soundEnabled ? <Volume2 className="w-4 h-4 text-accent" /> : <VolumeX className="w-4 h-4" />}</button>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-dark/80 border border-white/10 text-xs font-semibold"><Shield className="w-3.5 h-3.5 text-accent" /><span className="text-white">LVL {isLoaded ? level : 1}</span><span className="hidden lg:inline text-[10px] font-bold uppercase tracking-wider" style={{ color: rank.color }}>• {rank.title}</span></div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-dark border border-white/10"><div className="flex flex-col text-right"><span className="text-[9px] uppercase font-bold text-text-muted leading-tight">Balance</span><span className="text-xs font-bold text-emerald-400 leading-tight">{isLoaded ? formatCurrency(balance) : '$0.00'}</span></div><button disabled={!isLoaded} aria-label="Add $500 free credits" onClick={handleAddBalance} className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30"><PlusCircle className="w-4 h-4" /></button></div>
          <button onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white">{menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
      </div>
      {menuOpen && <div className="lg:hidden border-t border-white/10 bg-background/95 px-4 py-3 shadow-2xl"><div className="grid grid-cols-2 gap-2">{[['/', 'Cases'], ['/inventory', `Inventory (${inventory.length})`], ['/upgrade', 'Upgrader'], ['/stats', 'Statistics'], ['/history', 'History'], ['/contracts', 'Contracts'], ['/settings', 'Settings']].map(([href, label]) => <Link key={href} href={href} className={navClass(href)}>{label}</Link>)}<button onClick={() => setPreference('soundEnabled', !soundEnabled)} className="col-span-2 flex items-center gap-2 text-text-secondary px-2 py-2 text-left">{soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}{soundEnabled ? 'Mute sounds' : 'Unmute sounds'}</button></div></div>}
    </nav>
  );
};

export default Navbar;
