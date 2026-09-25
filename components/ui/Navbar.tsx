'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus, X, Volume2, VolumeX, Settings, Shield } from 'lucide-react';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { usePreferences } from '@/hooks/usePreferences';
import { formatCurrency, getRankTitle } from '@/lib/utils';
import { playCashSound } from '@/lib/sound';
import VladcaseLogo from './VladcaseLogo';

const PRIMARY_NAV = [
  { href: '/', label: 'Cases' },
  { href: '/battles', label: 'Battles', badge: 'HOT' },
  { href: '/upgrade', label: 'Upgrader' },
  { href: '/contracts', label: 'Contracts' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/history', label: 'History' },
];

const SECONDARY_NAV = [
  { href: '/stats', label: 'Rewards' },
  { href: '/settings', label: 'Fairness' },
];

export default function AppHeader() {
  const pathname = usePathname();
  const { balance, level, addBalance, isLoaded } = useEconomy();
  const { inventory } = useInventory();
  const { preferences, setPreference } = usePreferences();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const rank = getRankTitle(isLoaded ? level : 1);

  useEffect(() => { setMobileOpen(false); setSettingsOpen(false); }, [pathname]);

  const navClass = (href: string) =>
    `relative px-3 py-1.5 text-[13px] font-bold tracking-tight rounded-md transition-colors ${
      pathname === href ? 'text-white bg-white/[0.08]' : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
    }`;

  const handleAddBalance = () => { playCashSound(); void addBalance(500); };

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-ink-900/85 backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between gap-4">
        <Link href="/" aria-label="VLADCASE home" className="flex-shrink-0"><VladcaseLogo size="md" /></Link>
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {PRIMARY_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={navClass(item.href)}>
              {item.label}
              {item.badge && (
                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded bg-red-500/20 text-red-400 border border-red-500/40">
                  {item.badge}
                </span>
              )}
              {item.href === '/inventory' && inventory.length > 0 && <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[16px] px-1 text-[9px] font-black rounded bg-brand/20 text-brand-300 border border-brand/40">{inventory.length}</span>}
            </Link>
          ))}
          <div className="w-px h-5 bg-white/10 mx-2" />
          {SECONDARY_NAV.map((item) => <Link key={item.href} href={item.href} className={navClass(item.href)}>{item.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-dark border border-white/[0.06]">
            <div className="flex flex-col leading-none">
              <span className="text-[8px] uppercase font-black tracking-widest text-text-muted leading-none">Balance</span>
              <span className="text-[13px] font-display font-black text-emerald-400 price-display leading-none mt-0.5">{isLoaded ? formatCurrency(balance) : '$0.00'}</span>
            </div>
            <button type="button" disabled={!isLoaded} onClick={handleAddBalance} aria-label="Add $500 free credits" className="ml-1 p-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-surface-dark border border-white/[0.06]">
            <Shield className="w-3.5 h-3.5 text-brand-300" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-black text-white leading-none">LVL {isLoaded ? level : 1}</span>
              <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5" style={{ color: rank.color }}>{rank.title}</span>
            </div>
          </div>
          <div className="relative">
            <button type="button" onClick={() => setSettingsOpen((s) => !s)} aria-label="Open settings menu" aria-expanded={settingsOpen} className="w-9 h-9 rounded-lg bg-surface-dark border border-white/[0.06] flex items-center justify-center text-text-secondary hover:text-white hover:border-white/20 transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 top-full mt-2 z-20 w-56 rounded-lg bg-surface-dark border border-white/10 shadow-2xl overflow-hidden">
                  <div className="p-2 space-y-1">
                    <button type="button" onClick={() => setPreference('soundEnabled', !preferences.soundEnabled)} className="w-full flex items-center justify-between px-3 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded">
                      <span className="flex items-center gap-2">{preferences.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-brand-300" /> : <VolumeX className="w-3.5 h-3.5" />}Sound</span>
                      <span className="text-[10px] font-bold uppercase">{preferences.soundEnabled ? 'On' : 'Off'}</span>
                    </button>
                    <Link href="/settings" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded"><Settings className="w-3.5 h-3.5" />Settings</Link>
                    <Link href="/history" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded">History</Link>
                    <Link href="/stats" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-white hover:bg-white/5 rounded">Statistics</Link>
                  </div>
                </div>
              </>
            )}
          </div>
          <button type="button" onClick={() => setMobileOpen((o) => !o)} aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen} className="lg:hidden w-9 h-9 rounded-lg bg-surface-dark border border-white/[0.06] flex items-center justify-center text-white">
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-ink-900/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-bold ${pathname === item.href ? 'bg-white/[0.08] text-white' : 'text-text-secondary hover:bg-white/[0.04] hover:text-white'}`}>
                <span>{item.label}</span>
                {item.href === '/inventory' && inventory.length > 0 && <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1 text-[10px] font-black rounded bg-brand/20 text-brand-300 border border-brand/40">{inventory.length}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}