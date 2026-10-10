/**
 * Web Audio API synthesizer for luxury notification chimes
 * Zero external audio files, works offline, 100% reliable
 */
class SoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Play a soft luxury bell chime (e.g. on order placed, Noa reply, or status update)
  public playChime(type: 'order' | 'notification' | 'tap' = 'notification') {
    if (!this.soundEnabled) return;

    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (type === 'order') {
        // High harmonic 3-note celebration chime (C6 -> E6 -> G6)
        const notes = [1046.5, 1318.51, 1567.98];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.85);
        });
      } else if (type === 'tap') {
        // Subtle micro-tap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
      } else {
        // Two-tone bell ding-dong
        const freqs = [880, 1174.66]; // A5 -> D6
        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);

          gain.gain.setValueAtTime(0, now + idx * 0.15);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.15 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.65);
        });
      }
    } catch {
      // AudioContext might be blocked until user gesture, safely ignore
    }
  }
}

export const soundService = new SoundService();
