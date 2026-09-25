import React from 'react';
import AppHeader from '@/components/ui/Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900 text-text-primary selection:bg-brand/40 flex flex-col relative overflow-x-hidden">
      <AppHeader />
      <main className="pt-[60px] flex-1">
        {children}
      </main>
      <footer className="border-t border-white/[0.06] mt-20 bg-ink-900/80 relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <h4 className="font-display font-black text-sm text-white mb-2">VLADCASE</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">A free local CS2 case opening simulator with transparent odds, virtual economy, and persistent inventory.</p>
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-text-secondary uppercase tracking-wider mb-2">Game Modes</h4>
              <ul className="space-y-1 text-[11px] text-text-muted">
                <li>Case Opening</li>
                <li>Upgrader</li>
                <li>Contracts / Battles</li>
                <li>Inventory Trades</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-text-secondary uppercase tracking-wider mb-2">Platform</h4>
              <ul className="space-y-1 text-[11px] text-text-muted">
                <li>Transparent Odds</li>
                <li>Fairness &amp; Provability</li>
                <li>Statistics &amp; History</li>
                <li>Local Progress Backup</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-text-secondary uppercase tracking-wider mb-2">Disclaimer</h4>
              <p className="text-[10px] text-text-muted leading-relaxed">All currency and drop simulations are purely for entertainment. No real money. No real items. Generated artwork is illustrative.</p>
            </div>
          </div>
          <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-text-muted">
            <span>© {new Date().getFullYear()} VLADCASE — Local CS2 simulator.</span>
            <span>v1.0 · Built with Next.js</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
