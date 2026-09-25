'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CASES } from '@/data/mockData';
import { Case, Item } from '@/types';
import ItemImage from '@/components/ui/ItemImage';
import PriceTag from '@/components/ui/PriceTag';
import { useEconomy } from '@/hooks/useEconomy';
import { formatCurrency, getRarityColor } from '@/lib/utils';
import { playClickSound, playWinSound, playRouletteTick } from '@/lib/sound';
import {
  Swords,
  Trophy,
  ArrowLeft,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  Flame,
  XCircle,
} from 'lucide-react';

interface BattlePreset {
  id: string;
  name: string;
  cases: Case[];
  entryCost: number;
  tag: string;
}

const BOT_NAMES = [
  's1mple_fan',
  'shadow_apex',
  'zywoo_clutch',
  'm0nesy_flick',
  'donk_peek',
  'niko_deagle',
];

export default function BattlesPage() {
  const { balance, isLoaded, startBattle: commitBattle } = useEconomy();

  const presets: BattlePreset[] = useMemo(() => {
    const starter = CASES.find((c) => c.id === 'case-starter-militia') || CASES[0];
    const ak = CASES.find((c) => c.id === 'case-ak-legends') || CASES[1];
    const sniper = CASES.find((c) => c.id === 'case-sniper-elite') || CASES[2];
    const covert = CASES.find((c) => c.id === 'case-covert-hunt') || CASES[3];
    const knife = CASES.find((c) => c.id === 'case-knife-hunt') || CASES[4];
    const highRoller = CASES.find((c) => c.id === 'case-contraband-gods') || CASES[5];

    return [
      {
        id: 'budget-brawl',
        name: 'Budget Brawl',
        cases: [starter, starter, ak],
        entryCost: starter.price * 2 + ak.price,
        tag: 'POPULAR',
      },
      {
        id: 'sniper-duel',
        name: 'Sniper & Rifle War',
        cases: [ak, sniper],
        entryCost: ak.price + sniper.price,
        tag: 'HOT',
      },
      {
        id: 'covert-clash',
        name: 'Covert Showdown',
        cases: [covert, sniper],
        entryCost: covert.price + sniper.price,
        tag: 'HIGH ROLLER',
      },
      {
        id: 'knife-colosseum',
        name: 'Doppler Knife Arena',
        cases: [knife, knife],
        entryCost: knife.price * 2,
        tag: 'LEGENDARY',
      },
      {
        id: 'god-tier-battle',
        name: 'God Tier Showdown',
        cases: [highRoller, knife],
        entryCost: highRoller.price + knife.price,
        tag: 'MAX VALUE',
      },
    ];
  }, []);

  const [selectedPreset, setSelectedPreset] = useState<BattlePreset>(presets[0]);
  const [battleState, setBattleState] = useState<'idle' | 'battling' | 'finished'>('idle');
  const [currentRound, setCurrentRound] = useState(0);
  const [userDrops, setUserDrops] = useState<Item[]>([]);
  const [botDrops, setBotDrops] = useState<Item[]>([]);
  const [botName, setBotName] = useState('s1mple_bot');
  const [activeRoll, setActiveRoll] = useState(false);
  const [winner, setWinner] = useState<'user' | 'bot' | 'draw' | null>(null);
  const [battleError, setBattleError] = useState('');
  const startingRef = useRef(false);

  // Custom lineups are represented by presets until arbitrary battle entries
  // are supported by the atomic economy transition.
  const customCases: Case[] = [];
  const isCustomMode = false;

  const activeCases = isCustomMode ? customCases : selectedPreset.cases;
  const totalCost = activeCases.reduce((sum, c) => sum + c.price, 0);
  const canAfford = isLoaded && balance >= totalCost;

  const userTotalValue = userDrops.reduce((sum, item) => sum + item.demoValue, 0);
  const botTotalValue = botDrops.reduce((sum, item) => sum + item.demoValue, 0);

  const startBattle = async () => {
    if (
      !canAfford ||
      activeCases.length === 0 ||
      battleState === 'battling' ||
      startingRef.current
    )
      return;

    startingRef.current = true;
    playClickSound();
    setBattleError('');
    const result = await commitBattle(activeCases);
    startingRef.current = false;
    if (!result.ok || !result.battle) {
      setBattleError(result.ok ? 'Battle result was unavailable. Please retry.' : result.message);
      return;
    }

    setBotName(BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);
    setUserDrops([]);
    setBotDrops([]);
    setCurrentRound(0);
    setWinner(null);
    setBattleState('battling');
    setActiveRoll(true);

    void runBattleRounds(
      activeCases,
      result.battle.userDrops,
      result.battle.botDrops,
      result.battle.winner
    );
  };

  const runBattleRounds = async (
    casesToOpen: Case[],
    committedUserDrops: Item[],
    committedBotDrops: Item[],
    committedWinner: 'user' | 'bot' | 'draw'
  ) => {
    const collectedUser: Item[] = [];
    const collectedBot: Item[] = [];

    for (let r = 0; r < casesToOpen.length; r++) {
      setCurrentRound(r);
      setActiveRoll(true);

      // Play audio ticks
      for (let t = 0; t < 12; t++) {
        setTimeout(() => playRouletteTick(1 + t * 0.1), t * 120);
      }

      await new Promise((res) => setTimeout(res, 2200));

      const uDrop = committedUserDrops[r];
      const bDrop = committedBotDrops[r];

      collectedUser.push(uDrop);
      collectedBot.push(bDrop);

      setUserDrops([...collectedUser]);
      setBotDrops([...collectedBot]);
      setActiveRoll(false);

      if (r < casesToOpen.length - 1) {
        await new Promise((res) => setTimeout(res, 1200));
      }
    }

    // Finished all rounds
    if (committedWinner === 'user') {
      playWinSound('Special Item');
      // Fire celebration confetti
      void import('canvas-confetti').then(({ default: confetti }) => {
        void confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#8B5CF6', '#EC4899', '#FFD700', '#10B981'],
        });
      });
    }

    setWinner(committedWinner);
    setBattleState('finished');
  };

  const resetBattle = () => {
    setBattleState('idle');
    setUserDrops([]);
    setBotDrops([]);
    setCurrentRound(0);
    setWinner(null);
    setActiveRoll(false);
    setBattleError('');
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cases
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
              PVP ARENA
            </span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              1v1 Case Battle Showdown
            </span>
          </div>
          <h1 className="mt-1 text-3xl sm:text-5xl font-display font-black text-white tracking-tighter uppercase leading-none">
            Case <span className="text-brand-300 glow-brand">Battles</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-2xl">
            Simulate high-stakes CS2 case battles against AI opponents. Both players unbox the same cases side-by-side in real-time. The player with the highest total unboxed value wins all drops!
          </p>
        </div>

        <div className="flex items-center gap-3 panel p-3">
          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Mode</span>
            <p className="text-xs font-bold text-white uppercase">Winner Takes All</p>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-right">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Persistence</span>
            <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Atomic Result
            </p>
          </div>
        </div>
      </div>

      {/* Main Battle Stage */}
      {battleState !== 'idle' ? (
        <section aria-label="Battle in progress" className="space-y-6">
          {/* Status Header */}
          <div className="panel p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/20 border border-brand/40 flex items-center justify-center">
                <Swords className="w-5 h-5 text-brand-300 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">
                  Round {currentRound + 1} of {activeCases.length}
                </p>
                <p className="text-[11px] text-text-muted">
                  Opening: <span className="text-white font-bold">{activeCases[currentRound]?.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <span className="text-[10px] font-black text-text-muted uppercase">Your Total</span>
                <p className="text-lg font-display font-black text-emerald-400 price-display">
                  {formatCurrency(userTotalValue)}
                </p>
              </div>
              <span className="text-sm font-black text-text-muted">VS</span>
              <div className="text-center">
                <span className="text-[10px] font-black text-text-muted uppercase">{botName}&apos;s Total</span>
                <p className="text-lg font-display font-black text-gold price-display">
                  {formatCurrency(botTotalValue)}
                </p>
              </div>
            </div>

            {battleState === 'finished' && (
              <button
                type="button"
                onClick={resetBattle}
                className="btn-primary flex items-center gap-2 text-xs font-black uppercase tracking-wider px-5 py-2.5"
              >
                <RotateCcw className="w-4 h-4" /> Battle Again
              </button>
            )}
          </div>

          {/* Winner Banner if Finished */}
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
                winner === 'user'
                  ? 'bg-gradient-to-r from-emerald-950/60 via-brand-900/60 to-emerald-950/60 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                  : 'bg-gradient-to-r from-red-950/60 via-surface-dark to-red-950/60 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.25)]'
              }`}
            >
              <div className="relative z-10">
                {winner === 'user' ? (
                  <>
                    <Trophy className="w-12 h-12 text-gold mx-auto mb-2 drop-shadow-[0_0_15px_#FFD700]" />
                    <h2 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
                      VICTORY! YOU WIN ALL DROPS!
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-300 mt-1 max-w-lg mx-auto">
                      You outvalued {botName} by {formatCurrency(Math.abs(userTotalValue - botTotalValue))}. All drops from this battle belong to you!
                    </p>
                  </>
                ) : winner === 'bot' ? (
                  <>
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                    <h2 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
                      DEFEAT! {botName.toUpperCase()} TAKES THE LOOT
                    </h2>
                    <p className="text-xs sm:text-sm text-red-300 mt-1 max-w-lg mx-auto">
                      Opponent won by {formatCurrency(Math.abs(botTotalValue - userTotalValue))}. Better luck in the next duel!
                    </p>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-12 h-12 text-brand-300 mx-auto mb-2" />
                    <h2 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-tight">
                      DRAW — YOUR DROPS ARE RETURNED
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-200 mt-1 max-w-lg mx-auto">
                      Both sides finished with the same value. Your own drops stay in your inventory.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Dual Combatants Arenas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Player Column */}
            <div className={`panel p-4 space-y-4 border transition-colors ${winner === 'user' ? 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)]' : 'border-white/[0.08]'}`}>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand/30 border border-brand/50 flex items-center justify-center text-brand-300">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white uppercase">You (Player)</span>
                    <span className="block text-[10px] text-text-muted">Unboxed {userDrops.length} items</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-400 font-mono price-display">
                    {formatCurrency(userTotalValue)}
                  </span>
                </div>
              </div>

              {/* Current Active Spin Indicator */}
              <div className="relative aspect-[16/7] rounded-xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden">
                {activeRoll ? (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full border-2 border-brand border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-black uppercase tracking-wider text-brand-300 animate-pulse">
                      Rolling {activeCases[currentRound]?.name}...
                    </p>
                  </div>
                ) : userDrops[currentRound] ? (
                  <div className="text-center p-3 animate-fade-in">
                    <ItemImage
                      src={userDrops[currentRound].image}
                      alt={userDrops[currentRound].name}
                      width={120}
                      height={90}
                      className="h-20 max-w-full object-contain mx-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                    />
                    <p className="mt-2 text-xs font-bold text-white truncate max-w-[200px] mx-auto">
                      {userDrops[currentRound].name}
                    </p>
                    <p
                      className="text-[11px] font-black font-mono mt-0.5"
                      style={{ color: getRarityColor(userDrops[currentRound].rarity) }}
                    >
                      {formatCurrency(userDrops[currentRound].demoValue)}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-text-muted font-bold">Waiting for round...</span>
                )}
              </div>

              {/* Loot History list */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Your Drops</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {userDrops.map((drop, idx) => (
                    <div
                      key={`u-drop-${idx}`}
                      className="p-2 rounded-lg bg-surface-dark/80 border text-center relative overflow-hidden"
                      style={{ borderColor: `${getRarityColor(drop.rarity)}40` }}
                    >
                      <ItemImage src={drop.image} alt={drop.name} width={50} height={40} className="h-10 w-full object-contain mx-auto" />
                      <p className="text-[9px] font-bold text-white truncate mt-1">{drop.name}</p>
                      <p className="text-[9px] font-black text-emerald-400 price-display">{formatCurrency(drop.demoValue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Opponent Column */}
            <div className={`panel p-4 space-y-4 border transition-colors ${winner === 'bot' ? 'border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.2)]' : 'border-white/[0.08]'}`}>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/30 border border-gold/50 flex items-center justify-center text-gold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white uppercase">{botName} (Bot)</span>
                    <span className="block text-[10px] text-text-muted">Unboxed {botDrops.length} items</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-gold font-mono price-display">
                    {formatCurrency(botTotalValue)}
                  </span>
                </div>
              </div>

              {/* Current Active Spin Indicator */}
              <div className="relative aspect-[16/7] rounded-xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden">
                {activeRoll ? (
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-black uppercase tracking-wider text-gold-light animate-pulse">
                      Opponent Rolling...
                    </p>
                  </div>
                ) : botDrops[currentRound] ? (
                  <div className="text-center p-3 animate-fade-in">
                    <ItemImage
                      src={botDrops[currentRound].image}
                      alt={botDrops[currentRound].name}
                      width={120}
                      height={90}
                      className="h-20 max-w-full object-contain mx-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                    />
                    <p className="mt-2 text-xs font-bold text-white truncate max-w-[200px] mx-auto">
                      {botDrops[currentRound].name}
                    </p>
                    <p
                      className="text-[11px] font-black font-mono mt-0.5"
                      style={{ color: getRarityColor(botDrops[currentRound].rarity) }}
                    >
                      {formatCurrency(botDrops[currentRound].demoValue)}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs text-text-muted font-bold">Waiting for round...</span>
                )}
              </div>

              {/* Loot History list */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Opponent Drops</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {botDrops.map((drop, idx) => (
                    <div
                      key={`b-drop-${idx}`}
                      className="p-2 rounded-lg bg-surface-dark/80 border text-center relative overflow-hidden"
                      style={{ borderColor: `${getRarityColor(drop.rarity)}40` }}
                    >
                      <ItemImage src={drop.image} alt={drop.name} width={50} height={40} className="h-10 w-full object-contain mx-auto" />
                      <p className="text-[9px] font-bold text-white truncate mt-1">{drop.name}</p>
                      <p className="text-[9px] font-black text-gold-light price-display">{formatCurrency(drop.demoValue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Battle Lobby / Setup */
        <section aria-label="Battle presets and lobby" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              Featured Battle Arenas
            </h2>
            <span className="text-xs font-bold text-text-muted">Pick a preset arena</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => {
              const selected = selectedPreset.id === preset.id && !isCustomMode;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset);
                  }}
                  aria-pressed={selected}
                  className={`group relative w-full text-left rounded-xl border p-5 cursor-pointer transition-transform transition-colors duration-200 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brand ${
                    selected
                      ? 'border-brand bg-gradient-to-b from-brand/15 to-surface-dark shadow-[0_0_30px_rgba(139,92,246,0.3)]'
                      : 'border-white/[0.08] bg-surface-dark hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/10">
                      {preset.tag}
                    </span>
                    <PriceTag value={preset.entryCost} size="sm" />
                  </div>

                  <h3 className="mt-3 font-display font-black text-lg text-white group-hover:text-brand-300 transition-colors">
                    {preset.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {preset.cases.length} Rounds · 1v1 Battle
                  </p>

                  {/* Cases Preview Strip */}
                  <div className="mt-4 flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/5">
                    {preset.cases.map((c, i) => (
                      <div key={`${preset.id}-case-${i}`} className="relative w-10 h-10 flex-shrink-0" title={c.name}>
                        <ItemImage src={c.image} alt={c.name} width={40} height={40} className="w-full h-full object-contain" />
                      </div>
                    ))}
                    <span className="text-[10px] font-bold text-text-muted ml-auto">
                      {preset.cases.length}x Cases
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                      Duel Instant Bot
                    </span>
                    <span
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
                        selected
                          ? 'btn-primary'
                          : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      {selected ? 'READY TO FIGHT' : 'SELECT'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Callout */}
          <div className="panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute inset-0 grid-texture opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-300">
                Selected Arena: {isCustomMode ? 'Custom Lineup' : selectedPreset.name}
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-white uppercase mt-1">
                Entry: {formatCurrency(totalCost)}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Both players deposit {formatCurrency(totalCost)}. Highest total drop takes all!
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                disabled={!canAfford}
                onClick={startBattle}
                className="w-full sm:w-auto btn-primary px-8 py-3.5 font-display font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.4)] disabled:opacity-40"
              >
                <Swords className="w-4 h-4" />
                Start 1v1 Battle
              </button>
            </div>
          </div>
          {battleError && (
            <p role="alert" className="text-sm font-bold text-red-300">
              {battleError}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
