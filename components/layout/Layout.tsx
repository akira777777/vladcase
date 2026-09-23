import React from 'react';
import Navbar from '@/components/ui/Navbar';
import { Shield } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-accent/30 flex flex-col justify-between relative overflow-x-hidden">
      <Navbar />
      <main className="pt-20 flex-1">
        {children}
      </main>
      <footer className="border-t border-white/10 py-10 mt-20 bg-surface-dark/80 backdrop-blur-xl relative">
        <div className="max-w-7xl mx-auto px-4 text-center text-text-muted text-xs space-y-3">
          <div className="flex items-center justify-center gap-2 text-white font-bold">
            <Shield className="w-4 h-4 text-accent" />
            <span>VLADCASE Simulator</span>
          </div>
          <p>© {new Date().getFullYear()} VLADCASE. High fidelity CS2 case opening & economy simulator.</p>
          <div>
            <a
              href="https://upgrader.pro/en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-text-secondary transition-colors hover:text-accent py-1 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
            >
              <span>Upgrader</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="text-[11px] text-text-muted/70 max-w-xl mx-auto leading-relaxed">
            Virtual items simulator. All currency and drop simulations are purely for entertainment. Generated artwork is illustrative, not an exact in-game preview.
          </p>
        </div>
      </footer>
    </div>
  );
}
