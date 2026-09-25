'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { usePreferences } from '@/hooks/usePreferences';
import { parseSnapshot } from '@/lib/economy';
import {
  ArrowLeft,
  Download,
  RotateCcw,
  Settings2,
  Upload,
  Volume2,
  ShieldCheck,
} from 'lucide-react';

export default function SettingsPage() {
  const { preferences, setPreference } = usePreferences();
  const { resetEconomy, isLoaded } = useApp();
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const exportProgress = () => {
    const raw =
      localStorage.getItem('vladcase_state_v2') ??
      localStorage.getItem('vladcase_state_v1') ??
      '{}';
    const url = URL.createObjectURL(
      new Blob([raw], { type: 'application/json' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'vladcase-progress.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Progress export downloaded successfully.');
  };

  const importProgress = async (file: File) => {
    try {
      const value = parseSnapshot(JSON.parse(await file.text()));
      localStorage.setItem('vladcase_state_v2', JSON.stringify(value));
      setMessage('Progress imported. Reloading application...');
      setTimeout(() => window.location.reload(), 600);
    } catch {
      setMessage('The file is not a valid VLADCASE progress snapshot.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cases
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-brand/20 text-brand-300 border border-brand/40">
              PREFERENCES &amp; FAIRNESS
            </span>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
              System Settings
            </span>
          </div>
          <h1 className="mt-1 text-3xl sm:text-5xl font-display font-black text-white tracking-tighter uppercase leading-none">
            Settings &amp; <span className="text-brand-300 glow-brand">Fairness</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-2xl">
            Configure audio effects, spinner reveal speed, confirmation dialogs, and local snapshot backups.
          </p>
        </div>
      </div>

      {/* Transparency & persistence banner */}
      <section className="panel p-6 space-y-3 relative overflow-hidden" aria-label="Transparent local simulation">
        <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-display font-black text-white uppercase tracking-wider">
            Transparent Odds &amp; Atomic Saves
          </h2>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Every unboxing action on VLADCASE executes under an origin-wide browser Web Lock (<code className="text-brand-300 font-mono">navigator.locks</code>).
          The item reward and wallet state are committed together to browser local storage before the roulette begins. Local data is validated, but it is not encrypted.
          Leaving the page or refreshing will never forfeit an item or duplicate virtual balance.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-surface-dark border border-white/[0.06]">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Storage Lock</span>
            <p className="text-white font-bold mt-0.5">Origin Web Lock</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-dark border border-white/[0.06]">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">State Version</span>
            <p className="text-emerald-400 font-bold mt-0.5 font-mono">vladcase_state_v2</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-dark border border-white/[0.06]">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Upgrader Edge</span>
            <p className="text-gold font-bold mt-0.5 font-mono">5.0% Fixed</p>
          </div>
        </div>
      </section>

      {/* Simulator Audio & Controls */}
      <section className="panel divide-y divide-white/[0.06] overflow-hidden" aria-label="Audio and gameplay options">
        {/* Audio */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-brand-300" />
              Sound Effects &amp; Audio Ticks
            </h3>
            <p className="text-xs text-text-muted">
              CS2 roulette ticks, cash register chimes, and win celebration audio.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.soundEnabled}
            onClick={() => setPreference('soundEnabled', !preferences.soundEnabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              preferences.soundEnabled ? 'bg-brand' : 'bg-white/15'
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                preferences.soundEnabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Reveal Mode */}
        <div className="p-5 space-y-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-brand-300" />
              Roulette Reveal Mode
            </h3>
            <p className="text-xs text-text-muted">
              Adjust the pacing of case roll animations.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['full', 'fast', 'instant'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreference('revealMode', mode)}
                className={`rounded-xl border py-2.5 px-3 text-xs font-black uppercase tracking-wider transition-all ${
                  preferences.revealMode === mode
                    ? 'border-brand bg-brand/15 text-white shadow-glow-brand'
                    : 'border-white/[0.08] bg-surface-dark text-text-secondary hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Confirmations */}
        <div className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Confirmation Dialogs</h3>
          <div className="space-y-2 text-xs text-text-secondary">
            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer">
              <span>Ask confirmation before selling individual skins</span>
              <input
                type="checkbox"
                checked={preferences.confirmSales}
                onChange={(e) => setPreference('confirmSales', e.target.checked)}
                className="rounded border-white/20 accent-brand w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer">
              <span>Ask confirmation before resetting simulator progress</span>
              <input
                type="checkbox"
                checked={preferences.confirmDeletes}
                onChange={(e) => setPreference('confirmDeletes', e.target.checked)}
                className="rounded border-white/20 accent-brand w-4 h-4"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Backup and Restore */}
      <section className="panel p-6 space-y-4" aria-label="Progress backup">
        <h2 className="text-sm font-display font-black text-white uppercase tracking-wider">
          Progress Backup &amp; Migration
        </h2>
        <p className="text-xs text-text-muted leading-relaxed">
          Your inventory, virtual balance, and lifetime opening stats can be exported as a JSON snapshot to transfer between browsers or back up your collection.
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={exportProgress}
            className="btn-ghost inline-flex items-center gap-2 text-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export Progress (.json)
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-ghost inline-flex items-center gap-2 text-xs"
          >
            <Upload className="w-3.5 h-3.5" /> Import Progress (.json)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importProgress(file);
            }}
          />
        </div>

        {message && (
          <p role="status" className="text-xs font-bold text-brand-300 animate-fade-in">
            {message}
          </p>
        )}
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl border border-red-500/25 bg-red-950/20 p-6 space-y-3" aria-label="Danger zone">
        <h2 className="text-sm font-display font-black text-red-200 uppercase tracking-wider">
          Danger Zone
        </h2>
        <p className="text-xs text-red-200/70">
          Resetting will wipe your local inventory, unboxing history, and virtual balance back to default. This cannot be undone.
        </p>
        <button
          type="button"
          disabled={!isLoaded}
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all local progress? All saved inventory items will be erased.')) {
              void resetEconomy();
              setMessage('Simulator progress reset to default.');
            }
          }}
          className="btn-danger inline-flex items-center gap-2 text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset All Progress
        </button>
      </section>
    </div>
  );
}
