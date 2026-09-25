'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Swords, TrendingUp, Flame, Layers } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';

const MOBILE_TABS = [
  { href: '/', label: 'Cases', icon: Package },
  { href: '/battles', label: 'Battles', icon: Swords, badge: 'HOT' },
  { href: '/upgrade', label: 'Upgrader', icon: TrendingUp },
  { href: '/contracts', label: 'Contracts', icon: Flame },
  { href: '/inventory', label: 'Inventory', icon: Layers, isInventory: true },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { inventory } = useInventory();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 h-[58px] bg-ink-950/95 backdrop-blur-xl border-t border-white/[0.08] px-2 flex items-center justify-around select-none safe-bottom"
    >
      {MOBILE_TABS.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors ${
              active ? 'text-white' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {/* Active top neon indicator */}
            {active && (
              <span className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-brand via-magenta to-brand rounded-full shadow-[0_0_8px_#8B5CF6]" />
            )}

            <div className="relative">
              <Icon className={`w-4 h-4 ${active ? 'text-brand-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : ''}`} />
              {tab.isInventory && inventory.length > 0 && (
                <span className="absolute -top-1.5 -right-3 inline-flex items-center justify-center min-w-[15px] h-[14px] px-0.5 text-[8px] font-black rounded-full bg-brand text-white border border-black leading-none">
                  {inventory.length > 99 ? '99+' : inventory.length}
                </span>
              )}
              {tab.badge && (
                <span className="absolute -top-1.5 -right-3.5 px-1 py-0.2 text-[7px] font-black uppercase rounded bg-red-500 text-white leading-none">
                  {tab.badge}
                </span>
              )}
            </div>

            <span className={`text-[10px] font-bold tracking-tight mt-1 ${active ? 'font-black text-white' : ''}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
