'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ExternalLink, Flame, History, Menu, Package, PlusCircle, Settings, Shield, Sparkles, Volume2, VolumeX, X } from 'lucide-react';
import { useEconomy } from '@/hooks/useEconomy';
import { useInventory } from '@/hooks/useInventory';
import { usePreferences } from '@/hooks/usePreferences';
import { formatCurrency, getRankTitle } from '@/lib/utils';
import { playCashSound } from '@/lib/sound';

export const Navbar = () => {
  const pathname = usePathname();
  const { balance, level, addBalance, isLoaded } = useEconomy();
  const { inventory } = useInventory();
  const { preferences, setPreference } = usePreferences();
  const [menuOpen, setMenuOpen] = useState(false);
  const rank = getRankTitle(isLoaded ? level : 1);

  useEffect(() => setMenuOpen(false), [pathname]);

  const navClass = (href: string) => `transition-colors py-1.5 px-2 rounded-lg ${pathname === href ? 'text-white font-bold bg-white/10' : 'text-text-secondary hover:text-white hover:bg-white/5'}`;
  const handleAddBalance = () => { playCashSound(); void addBalance(500); };
  const soundEnabled = preferences.soundEnabled;
