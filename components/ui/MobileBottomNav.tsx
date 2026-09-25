'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Swords, TrendingUp, Flame, Backpack } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';

const TABS = [
  { href: '/', icon: Package, label: 'Cases' },
  { href: '/battles', icon: Swords, label: 'Battles' },
  { href: '/upgrade', icon: TrendingUp, label: 'Upgrader' },
  { href: '/contracts', icon: Flame, label: 'Contracts' },
  { href: '/inventory', icon: Backpack, label: 'Inventory', isInventory: true },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { inventory } = useInventory();
  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/[0.06] bg-ink-900/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-[60px]">
        {TABS.map(({ href, icon: Icon, label, isInventory }) => {
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
                {isInventory && inventory.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[14px] px-1 flex items-center justify-center rounded-full bg-brand text-white text-[8px] font-black leading-none">
                    {inventory.length > 99 ? '99+' : inventory.length}
                  </span>
                )}
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

