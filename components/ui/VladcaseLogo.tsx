'use client';

import { useId } from 'react';

interface VladcaseLogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  className?: string;
}

export default function VladcaseLogo({ size = 'md', withText = true, className = '' }: VladcaseLogoProps) {
  const gradientId = `logoGrad${useId().replace(/:/g, '')}`;
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  const subSize = size === 'sm' ? 'text-[8px]' : 'text-[9px]';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${iconSize} flex items-center justify-center`}>
        {/* Outer angled frame */}
        <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full" fill="none">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <path
            d="M4 2 L28 2 L28 16 L18 30 L4 30 Z"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.6"
            fill="rgba(139,92,246,0.12)"
          />
        </svg>
        {/* Inner V chevron */}
        <svg viewBox="0 0 32 32" className="relative w-3/4 h-3/4" fill="none">
          <path
            d="M6 8 L16 24 L26 8"
            stroke={`url(#${gradientId})`}
            strokeWidth="3"
            strokeLinecap="square"
            strokeLinejoin="miter"
            fill="none"
          />
        </svg>
      </div>
      {withText && (
        <div className="flex flex-col leading-none">
          <span className={`font-display font-black ${textSize} tracking-[0.04em] text-white`}>
            VLAD<span className="text-brand">CASE</span>
          </span>
          <span className={`font-display font-semibold ${subSize} uppercase tracking-[0.2em] text-text-muted mt-0.5`}>
            Case Opening
          </span>
        </div>
      )}
    </div>
  );
}
