'use client';
import { formatCurrency, formatCompactCurrency } from '@/lib/utils';

interface PriceTagProps {
  value: number;
  variant?: 'default' | 'gold' | 'success' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  prefix?: string;
  showSign?: boolean;
}

export default function PriceTag({
  value,
  variant = 'default',
  size = 'md',
  className = '',
  prefix,
  showSign,
}: PriceTagProps) {
  const isPositive = value > 0 && showSign;
  const valueClass =
    size === 'lg' ? 'text-base font-black' :
    size === 'sm' ? 'text-[11px] font-bold' :
    'text-sm font-bold';
  const formatted = variant === 'compact' ? formatCompactCurrency(value) : formatCurrency(value);

  const colorClass =
    variant === 'gold' ? 'text-gold-light' :
    variant === 'success' ? (isPositive ? 'text-success' : 'text-danger') :
    variant === 'default' ? 'text-emerald-400' :
    'text-text-primary';

  return (
    <span className={`price-display inline-flex items-baseline gap-1 ${valueClass} ${colorClass} ${className}`}>
      {prefix && <span className="text-[9px] uppercase tracking-wider text-text-muted">{prefix}</span>}
      <span className={variant === 'gold' ? 'metallic-gold' : ''}>
        {isPositive ? '+' : ''}{formatted}
      </span>
    </span>
  );
}