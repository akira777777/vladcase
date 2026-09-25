import React from 'react';
import AppHeader from '@/components/ui/Navbar';
import MobileBottomNav from '@/components/ui/MobileBottomNav';
import Link from 'next/link';
import VladcaseLogo from '@/components/ui/VladcaseLogo';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900 text-text-primary selection:bg-brand/40 flex flex-col relative overflow-x-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        Skip to main content
      </a>
      <AppHeader />
      <main id="main-content" className="pt-[60px] pb-[72px] lg:pb-0 flex-1">
        {children}
      </main>
      <footer className="border-t border-white/[0.06] mt-16 bg-[#0A0C12] relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
        <div className="absolute inset-0 grid-texture opacity-20 pointer-events-none" />
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <VladcaseLogo size="md" />
              <p className="mt-3 text-[11px] text-text-muted leading-relaxed max-w-xs">Premium CS2 case-opening simulator. Transparent odds, local virtual economy, persistent inventory — no real money, ever.</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> All systems live
                </span>
                <span className="text-[10px] font-mono text-text-muted">v1.0 · simulator</span>
              </div>
            </div>
            <div>
              <h4 className="font-display font-black text-[11px] text-white uppercase tracking-widest mb-3">Play</h4>
              <ul className="space-y-2 text-[12px] text-text-secondary">
                <li><Link href="/" className="hover:text-white transition-colors">Case Opening</Link></li>
                <li><Link href="/upgrade" className="hover:text-white transition-colors">Upgrader</Link></li>
                <li><Link href="/contracts" className="hover:text-white transition-colors">Contracts</Link></li>
                <li><Link href="/inventory" className="hover:text-white transition-colors">Inventory</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-black text-[11px] text-white uppercase tracking-widest mb-3">Account</h4>
              <ul className="space-y-2 text-[12px] text-text-secondary">
                <li><Link href="/history" className="hover:text-white transition-colors">History</Link></li>
                <li><Link href="/stats" className="hover:text-white transition-colors">Rewards &amp; Stats</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors">Fairness</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-black text-[11px] text-white uppercase tracking-widest mb-3">Fair play</h4>
              <p className="text-[10px] text-text-muted leading-relaxed">All currency and drops are simulated locally for entertainment. No real money. No real items. Artwork is illustrative.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-text-muted">
            <span>© {new Date().getFullYear()} VLADCASE — Local CS2 simulator.</span>
            <span className="font-mono">transparent odds · atomic actions · local saves</span>
          </div>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  );
}
