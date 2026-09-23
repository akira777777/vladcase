import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function HeroIntro() {
  return (
    <div className="relative">
      {/* Decorative ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[480px] h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>Next-Gen Counter-Strike Case Simulator</span>
      </div>

      <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tighter mb-6 uppercase leading-tight">
        UNLOCK THE <span className="text-accent text-glow">RARE</span>
      </h1>

      <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-6 leading-relaxed">
        Authentic weighted drop chances, realistic CS2 skin collections,
        interactive roulette spin animations, and instant inventory management.
      </p>

      {/* Feature Micro-Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-text-muted mb-10">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span>Provably Weighted Odds</span>
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Instant Liquidation</span>
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Free Virtual Economy</span>
        </span>
      </div>
    </div>
  );
}
