'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Backpack, TrendingUp, History, ShieldCheck } from 'lucide-react';

const TABS = [
  { href: '/', icon: Package, label: 'Cases' },
  { href: '/inventory', icon: Backpack, label: 'Inventory' },
  { href: '/upgrade', icon: TrendingUp, label: 'Upgrader' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/settings', icon: ShieldCheck, label: 'Profile' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/[0.06] bg-ink-900/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-[60px]">
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
                active ? 'text-white' : 'text-text-muted hover:text-white'
              }`}
            >
              <span className={`relative flex items-center justify-center ${active ? 'text-brand-300' : ''}`}>
                <Icon className="w-5 h-5" />
                {active && <span className="absolute -bottom-1.5 w-6 h-0.5 rounded-full bg-brand shadow-glow-brand" />}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

