'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';

interface EventHeroProps {
  title?: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
  endsAt?: number;
}

export default function EventHero({
  title = 'NEON REBELLION',
  subtitle = 'Season Event',
  ctaHref = '/cases/case-knife-hunt',
  ctaLabel = 'Explore Event',
  endsAt,
}: EventHeroProps) {
  const fallbackEnd = Date.now() + 4 * 86400000 + 13 * 3600000 + 28 * 60000;
  const target = endsAt ?? fallbackEnd;
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const ms = Math.max(0, target - Date.now());
      setRemaining({
        days: Math.floor(ms / 86400000),
        hours: Math.floor((ms % 86400000) / 3600000),
        minutes: Math.floor((ms % 3600000) / 60000),
        seconds: Math.floor((ms % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#1A0E2E] via-[#2A0F35] to-[#3D0F1F]" style={{ minHeight: 360 }} aria-label="Event banner">
      <div className="absolute inset-0 grid-texture opacity-20" />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(236, 72, 153, 0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 70% at 20% 80%, rgba(139, 92, 246, 0.35) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 50% 0%, rgba(245, 182, 66, 0.18) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 stripes-diag opacity-30" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent" />

      <svg viewBox="0 0 600 400" className="absolute right-0 top-0 h-full w-1/2 opacity-40 pointer-events-none" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="weapon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <g fill="url(#weapon-grad)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5">
          <path d="M380 180 L420 180 L420 195 L440 195 L440 215 L460 215 L460 230 L500 230 L500 245 L460 245 L460 250 L440 250 L440 260 L420 260 L420 270 L380 270 Z" />
          <path d="M500 215 L580 215 L580 230 L500 230 Z" />
        </g>
        <circle cx="500" cy="225" r="160" fill="none" stroke="rgba(236, 72, 153, 0.2)" strokeWidth="1" />
        <circle cx="500" cy="225" r="120" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" />
      </svg>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="absolute w-1 h-1 rounded-full bg-magenta-400/60" style={{ left: `${10 + i * 8}%`, top: `${20 + (i % 3) * 25}%`, boxShadow: '0 0 8px rgba(236, 72, 153, 0.8)', animation: `float ${4 + (i % 3)}s ease-in-out ${i * 0.3}s infinite` }} />
        ))}
      </div>

      <div className="relative z-10 p-8 md:p-12 flex flex-col justify-between h-full" style={{ minHeight: 360 }}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-magenta-500/15 border border-magenta-400/40 text-magenta-300 text-[11px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            {subtitle}
          </div>
          <h2 className="mt-6 font-display font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter uppercase leading-none">
            <span className="block metallic-magenta">{title}</span>
          </h2>
          <p className="mt-3 text-sm md:text-base text-text-secondary max-w-md">
            Limited time seasonal case pool. Brand new covert finishes, exclusive knife finishes, and elevated drop rates for high-tier rewards.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-8">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gold-light" />
            <div className="flex items-center gap-2 font-mono">
              <TimeBlock value={remaining.days} label="D" />
              <span className="text-gold text-xl font-bold">:</span>
              <TimeBlock value={remaining.hours} label="H" />
              <span className="text-gold text-xl font-bold">:</span>
              <TimeBlock value={remaining.minutes} label="M" />
              <span className="text-gold text-xl font-bold">:</span>
              <TimeBlock value={remaining.seconds} label="S" />
            </div>
</div>

          <Link href={ctaHref} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-magenta-500 to-brand font-display font-black text-sm uppercase tracking-widest text-white hover:from-magenta-400 hover:to-brand-300 transition-all shadow-[0_0_28px_rgba(236,72,153,0.45)] hover:shadow-[0_0_36px_rgba(236,72,153,0.6)] active:scale-95">
            <span>{ctaLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-brand via-magenta-500 to-gold" />
    </section>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center px-2 py-1 rounded-md bg-black/40 border border-white/10 min-w-[44px]">
      <span suppressHydrationWarning className="text-lg font-black text-white price-display leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-bold text-gold-light uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}