import { Sparkles } from 'lucide-react';
export default function HeroIntro() {
  return (
    <>
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Next-Gen Counter-Strike Case Simulator</span>
      </div>

      <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tighter mb-6 uppercase">
        UNLOCK THE <span className="text-accent text-glow">RARE</span>
      </h1>

      <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
        Authentic weighted drop chances, realistic CS2 skin collections,
        interactive roulette spin animations, and instant inventory management.
      </p>
    </>
  );
}
