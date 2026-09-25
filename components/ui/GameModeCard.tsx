'use client';
import Link from 'next/link';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface GameModeCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: 'brand' | 'magenta' | 'gold' | 'success';
  count?: string;
  disabled?: boolean;
}

const ACCENT_STYLES = {
  brand: { from: 'rgba(139, 92, 246, 0.18)', to: 'rgba(139, 92, 246, 0.04)', glow: 'rgba(139, 92, 246, 0.45)', icon: 'text-brand-300', border: 'rgba(139, 92, 246, 0.35)' },
  magenta: { from: 'rgba(236, 72, 153, 0.18)', to: 'rgba(236, 72, 153, 0.04)', glow: 'rgba(236, 72, 153, 0.45)', icon: 'text-magenta-400', border: 'rgba(236, 72, 153, 0.35)' },
  gold: { from: 'rgba(245, 182, 66, 0.18)', to: 'rgba(245, 182, 66, 0.04)', glow: 'rgba(245, 182, 66, 0.45)', icon: 'text-gold-light', border: 'rgba(245, 182, 66, 0.35)' },
  success: { from: 'rgba(16, 185, 129, 0.18)', to: 'rgba(16, 185, 129, 0.04)', glow: 'rgba(16, 185, 129, 0.45)', icon: 'text-emerald-400', border: 'rgba(16, 185, 129, 0.35)' },
};

export default function GameModeCard({ href, title, description, icon: Icon, accent, count, disabled }: GameModeCardProps) {
  const styles = ACCENT_STYLES[accent];
  if (disabled) {
    return (
      <div
        aria-disabled="true"
        className="relative flex flex-col gap-2 p-4 rounded-xl border border-white/[0.06] bg-gradient-to-b from-surface-raised to-surface-dark overflow-hidden opacity-70 cursor-not-allowed"
        style={{ backgroundImage: `linear-gradient(180deg, ${styles.from} 0%, ${styles.to} 100%)` }}
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/10">
            <Icon className={`w-5 h-5 ${styles.icon}`} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-text-muted">Soon</span>
        </div>
        <div className="mt-1">
          <h3 className="font-display font-black text-base text-white tracking-tight">{title}</h3>
          <p className="text-xs text-text-secondary mt-0.5 leading-snug line-clamp-2">{description}</p>
        </div>
        {count && (
          <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
            {count}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, transparent 0%, ${styles.border} 50%, transparent 100%)` }} />
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-2 p-4 rounded-xl border border-white/[0.06] bg-gradient-to-b from-surface-raised to-surface-dark overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-card-elevated"
      style={{ backgroundImage: `linear-gradient(180deg, ${styles.from} 0%, ${styles.to} 100%)` }}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/10 group-hover:scale-110 transition-transform" style={{ boxShadow: `0 0 16px ${styles.glow}` }}>
          <Icon className={`w-5 h-5 ${styles.icon}`} />
        </div>
        <ArrowUpRight className={`w-4 h-4 text-text-muted group-hover:${styles.icon} group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all`} />
      </div>
      <div className="mt-1">
        <h3 className="font-display font-black text-base text-white tracking-tight">{title}</h3>
        <p className="text-xs text-text-secondary mt-0.5 leading-snug line-clamp-2">{description}</p>
      </div>
      {count && (
        <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          {count}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: `linear-gradient(90deg, transparent 0%, ${styles.border} 50%, transparent 100%)` }} />
    </Link>
  );
}