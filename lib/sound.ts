// Web Audio API Synthesizer for VLADCASE
// Zero external network dependencies, instant playback, zero lag.

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vladcase_sound_muted');
        this.isMuted = saved === 'true';
      } catch {
        this.isMuted = false;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public get muted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('vladcase_sound_muted', String(muted));
    } catch {}
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    if (!this.isMuted) {
      this.playClick();
    }
    return this.isMuted;
  }

  // Soft UI click
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  // Case opening start: deep bass whoosh + mechanical unlock
  public playCaseOpen() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Deep bass drop
      const bass = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(140, now);
      bass.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      bassGain.gain.setValueAtTime(0.15, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      bass.connect(bassGain);
      bassGain.connect(ctx.destination);
      bass.start(now);
      bass.stop(now + 0.36);

      // Metallic latch click
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(880, now + 0.05);
      click.frequency.exponentialRampToValueAtTime(220, now + 0.12);

      clickGain.gain.setValueAtTime(0.08, now + 0.05);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      click.connect(clickGain);
      clickGain.connect(ctx.destination);
      click.start(now + 0.05);
      click.stop(now + 0.13);
    } catch {}
  }

  // Roulette tick
  public playTick(pitchMultiplier: number = 1.0) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 340 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.028);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.032);
    } catch {}
  }

  // Winner Fanfare based on skin rarity!
  public playWin(rarity: string) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (rarity === 'Special Item') {
        // GOLD / KNIFE: Epic heavenly shimmer + triumphant fanfare
        const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.08, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.85);
        });

        // Sub bass impact
        const boom = ctx.createOscillator();
        const boomGain = ctx.createGain();
        boom.type = 'sine';
        boom.frequency.setValueAtTime(90, now);
        boom.frequency.exponentialRampToValueAtTime(35, now + 0.7);
        boomGain.gain.setValueAtTime(0.2, now);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        boom.connect(boomGain);
        boomGain.connect(ctx.destination);
        boom.start(now);
        boom.stop(now + 0.75);
      } else if (rarity === 'Covert') {
        // COVERT RED: Dramatic brass-like minor/major 9th fanfare
        const notes = [329.63, 440, 523.25, 659.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.07;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.09, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.65);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.7);
        });
      } else if (rarity === 'Classified') {
        // CLASSIFIED PINK: Rising bright arpeggio
        const notes = [392, 493.88, 587.33, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.07, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.55);
        });
      } else {
        // RESTRICTED / MIL-SPEC: Snappy cheerful chime
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = now + idx * 0.05;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.06, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.45);
        });
      }
    } catch {}
  }

  // Sell item: Cash register / coin drop jingle
  public playCash() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High coin ping
      const coin = ctx.createOscillator();
      const coinGain = ctx.createGain();
      coin.type = 'sine';
      coin.frequency.setValueAtTime(987.77, now); // B5
      coin.frequency.setValueAtTime(1318.51, now + 0.06); // E6

      coinGain.gain.setValueAtTime(0.09, now);
      coinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      coin.connect(coinGain);
      coinGain.connect(ctx.destination);
      coin.start(now);
      coin.stop(now + 0.36);
    } catch {}
  }

  // Deposit free credits / level up ping
  public playDeposit() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chord = [523.25, 659.25, 1046.5]; // C5, E5, C6
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.48);
      });
    } catch {}
  }
  // Wheel spin whoosh
  public playWheelWhoosh() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.8);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.9);
    } catch {}
  }

  // Wheel upgrade lose sound: dramatic metallic thud
  public playLose() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }
}

export const sound = new SoundManager();
export const playRouletteTick = (pitch?: number) => sound.playTick(pitch);
export const playWinSound = (rarity: string) => sound.playWin(rarity);
export const playLoseSound = () => sound.playLose();
export const playWheelWhoosh = () => sound.playWheelWhoosh();
export const playCaseOpenSound = () => sound.playCaseOpen();
export const playCashSound = () => sound.playCash();
export const playDepositSound = () => sound.playDeposit();
export const playClickSound = () => sound.playClick();
export const isSoundMuted = (): boolean => sound.muted;
export const setSoundMuted = (muted: boolean): void => sound.setMuted(muted);
export const toggleSound = (): boolean => sound.toggleMute();
