'use client';

import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { usePreferences } from '@/hooks/usePreferences';
import { ArrowLeft, Check, Download, RotateCcw, Settings2, Upload, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';

export default function SettingsPage() {
  const { preferences, setPreference } = usePreferences();
  const { resetEconomy, isLoaded } = useApp();
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const exportProgress = () => {
    const raw = localStorage.getItem('vladcase_state_v2') ?? localStorage.getItem('vladcase_state_v1') ?? '{}';
    const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'vladcase-progress.json'; anchor.click(); URL.revokeObjectURL(url); setMessage('Progress export downloaded.');
  };
  const importProgress = async (file: File) => {
    try { const value = JSON.parse(await file.text()); if (value.version !== 2) throw new Error('Unsupported version'); localStorage.setItem('vladcase_state_v2', JSON.stringify(value)); setMessage('Progress imported. Reloading…'); window.location.reload(); } catch { setMessage('That file is not a valid v2 progress snapshot.'); }
  };
  return <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8"><div><Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white"><ArrowLeft className="h-4 w-4" />Back to cases</Link><h1 className="mt-6 text-4xl sm:text-6xl font-black font-display text-white">Settings</h1><p className="mt-2 text-sm text-text-secondary">Tune your local simulator without changing your saved collection.</p></div>
    <section className="rounded-3xl border border-white/10 bg-surface/80 divide-y divide-white/10 overflow-hidden"><div className="p-5"><h2 className="flex items-center gap-2 font-bold text-white"><Volume2 className="h-4 w-4 text-accent" />Sound</h2><label className="mt-4 flex items-center justify-between gap-4 text-sm text-text-secondary"><span>Roulette and drop audio</span><button role="switch" aria-checked={preferences.soundEnabled} onClick={() => setPreference('soundEnabled', !preferences.soundEnabled)} className={`relative h-6 w-11 rounded-full transition-colors ${preferences.soundEnabled ? 'bg-accent' : 'bg-white/15'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${preferences.soundEnabled ? 'left-6' : 'left-1'}`} /></button></label></div>
      <div className="p-5"><h2 className="flex items-center gap-2 font-bold text-white"><Settings2 className="h-4 w-4 text-accent" />Reveal mode</h2><div className="mt-4 grid grid-cols-3 gap-2">{(['full', 'fast', 'instant'] as const).map((mode) => <button key={mode} onClick={() => setPreference('revealMode', mode)} className={`rounded-xl border px-3 py-3 text-xs font-bold capitalize ${preferences.revealMode === mode ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 text-text-secondary hover:text-white'}`}>{mode}{preferences.revealMode === mode && <Check className="mx-auto mt-1 h-3 w-3" />}</button>)}</div></div>
      <div className="p-5 space-y-4"><h2 className="font-bold text-white">Confirmations</h2><label className="flex items-center justify-between text-sm text-text-secondary"><span>Confirm sales</span><input type="checkbox" checked={preferences.confirmSales} onChange={(event) => setPreference('confirmSales', event.target.checked)} /></label><label className="flex items-center justify-between text-sm text-text-secondary"><span>Confirm item removal</span><input type="checkbox" checked={preferences.confirmDeletes} onChange={(event) => setPreference('confirmDeletes', event.target.checked)} /></label></div>
    </section>
    <section className="rounded-3xl border border-white/10 bg-surface/80 p-5 space-y-4"><h2 className="font-bold text-white">Progress backup</h2><p className="text-xs text-text-muted">Exports contain your local simulated items and virtual balance. Never treat this file as real money.</p><div className="flex flex-wrap gap-2"><button onClick={exportProgress} className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-bold hover:bg-white/10"><Download className="h-4 w-4" />Export</button><button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-bold hover:bg-white/10"><Upload className="h-4 w-4" />Import</button><input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importProgress(file); }} /></div>{message && <p role="status" className="text-xs text-accent">{message}</p>}</section>
    <section className="rounded-3xl border border-red-400/20 bg-red-950/20 p-5"><h2 className="font-bold text-red-200">Danger zone</h2><p className="mt-1 text-xs text-red-200/70">Reset deletes your local collection, history, stats, and virtual balance.</p><button disabled={!isLoaded} onClick={() => { if (window.confirm('Reset all local progress?')) { void resetEconomy(); setMessage('Progress reset.'); } }} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-400/30 px-4 py-2.5 text-xs font-bold text-red-200 hover:bg-red-500/20"><RotateCcw className="h-4 w-4" />Reset progress</button></section>
  </div>;
}
