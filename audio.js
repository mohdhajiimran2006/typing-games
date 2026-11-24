// ========================================================
// NITRO TYPER 3D - PROCEDURAL WEB AUDIO SYNTHESIZER
// 100% Procedural Web Audio API - Zero External Audio Files
// ========================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.engineGain = null;
    this.engineOsc = null;
    this.engineSubOsc = null;
    this.engineRunning = false;
    this.masterGain = null;
    this.unlocked = false;

    // Read initial mute state from storage
    try {
      this.isMuted = localStorage.getItem("nitro_audio_muted") === "true";
    } catch (e) {
      this.isMuted = false;
    }

    // Bind auto-unlock on any user interaction
    this.setupAutoUnlock();
  }

  setupAutoUnlock() {
    const unlockHandler = () => {
      this.initContext();
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().then(() => {
          this.unlocked = true;
        }).catch(err => console.warn("Audio unlock pending:", err));
      } else if (this.ctx && this.ctx.state === "running") {
        this.unlocked = true;
      }
    };

    window.addEventListener("pointerdown", unlockHandler, { once: false, passive: true });
    window.addEventListener("touchstart", unlockHandler, { once: false, passive: true });
    window.addEventListener("keydown", unlockHandler, { once: false, passive: true });
    window.addEventListener("click", unlockHandler, { once: false, passive: true });
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn("Web Audio API not supported in this browser.");
        return;
      }
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  ensureReady() {
    this.initContext();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return !!this.ctx && !this.isMuted;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem("nitro_audio_muted", this.isMuted.toString());
    } catch (e) {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  // --- SOUND: Mechanical Keyboard Click ---
  playKeyClick(isCorrect = true) {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;

    if (isCorrect) {
      // Crisp mechanical key switch snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800 + Math.random() * 300, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } else {
      // Dull low error buzzer
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    }
  }

  // --- SOUND: Race Engine Synthesizer ---
  startEngine() {
    if (!this.ensureReady() || this.engineRunning) return;

    const now = this.ctx.currentTime;
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.001, now);
    this.engineGain.gain.linearRampToValueAtTime(0.12, now + 0.5);

    // Primary engine rumble (Sawtooth)
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency.setValueAtTime(45, now); // Idle ~45Hz

    // Sub-bass harmonics (Triangle)
    this.engineSubOsc = this.ctx.createOscillator();
    this.engineSubOsc.type = "triangle";
    this.engineSubOsc.frequency.setValueAtTime(30, now);

    // Filter to soften the harsh sawtooth edge
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(420, now);

    this.engineOsc.connect(lowpass);
    this.engineSubOsc.connect(lowpass);
    lowpass.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc.start(now);
    this.engineSubOsc.start(now);
    this.engineRunning = true;
  }

  updateEngine(speedRatio = 0) {
    if (!this.engineRunning || !this.ctx || !this.engineOsc) return;

    // speedRatio: 0.0 (idle) to 1.0 (top speed)
    const clamped = Math.max(0, Math.min(1.5, speedRatio));
    const now = this.ctx.currentTime;

    // Dynamic pitch: 45Hz idle up to 260Hz redline
    const targetFreq = 45 + clamped * 215;
    const targetSub = 30 + clamped * 120;
    const targetVol = 0.1 + clamped * 0.14;

    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineSubOsc.frequency.setTargetAtTime(targetSub, now, 0.08);
    if (this.engineGain) {
      this.engineGain.gain.setTargetAtTime(this.isMuted ? 0 : targetVol, now, 0.08);
    }
  }

  stopEngine() {
    if (!this.engineRunning || !this.ctx || !this.engineGain) return;

    const now = this.ctx.currentTime;
    this.engineGain.gain.linearRampToValueAtTime(0.001, now + 0.4);

    setTimeout(() => {
      if (this.engineOsc) {
        try { this.engineOsc.stop(); this.engineOsc.disconnect(); } catch (e) {}
        this.engineOsc = null;
      }
      if (this.engineSubOsc) {
        try { this.engineSubOsc.stop(); this.engineSubOsc.disconnect(); } catch (e) {}
        this.engineSubOsc = null;
      }
      this.engineRunning = false;
    }, 450);
  }

  // --- SOUND: Countdown Beeps ---
  playCountdown(step) {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (step > 0) {
      // Beep 3, 2, 1
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      // GO! High vibrant chord
      [880, 1320].forEach(freq => {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.35, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        o.connect(g);
        g.connect(this.masterGain);
        o.start(now);
        o.stop(now + 0.55);
      });
    }
  }

  // --- SOUND: Nitro Boost Whoosh ---
  playNitro() {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.48);
  }

  // --- SOUND: Victory Fanfare ---
  playVictory() {
    if (!this.ensureReady()) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.38);
    });
  }

  // --- SOUND: Aquatic Bubble Pop (Bloop / Water Chime) ---
  playBubblePop(pitchMod = 1.0) {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;

    // Resonant water bubble envelope (pitch chirp upwards then drops)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    const startFreq = (400 + Math.random() * 120) * pitchMod;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.8, now + 0.14);

    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // --- SOUND: Hydro Cannon Torpedo Blast ---
  playHydroBlast() {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(200, now + 0.22);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  // --- SOUND: Special Magic Bubble / Pearl ---
  playSpecialBubble() {
    if (!this.ensureReady()) return;
    const freqs = [659.25, 880, 1174.66, 1760]; // E5, A5, D6, A6
    freqs.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.28);
    });
  }

  // --- SOUND: Water Splash / Freeze ---
  playWaterSplash() {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // --- SOUND: Heavy Plasma Railgun Fire (Dangerous & Smart Gun) ---
  playRailgunFire(intensity = 1.0) {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;

    // 1. Heavy Low-End Punch (Down-ramping Sub Bass)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(240, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.22);
    subGain.gain.setValueAtTime(0.35 * intensity, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.23);

    // 2. High-Voltage Ionized Electric Snap
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = "sawtooth";
    snapOsc.frequency.setValueAtTime(1400, now);
    snapOsc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
    snapGain.gain.setValueAtTime(0.22 * intensity, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.13);
  }

  // --- SOUND: Smart Lock-On Acquisition Chirp ---
  playTargetLocked() {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;
    [1100, 1650].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.14, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.06);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.07);
    });
  }

  // --- SOUND: Devastating Annihilation Blast (Dangerous Word Disintegration) ---
  playDevastatingExplosion(scale = 1.0) {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;

    // Heavy deep detonation shockwave
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = "sawtooth";
    boomOsc.frequency.setValueAtTime(120, now);
    boomOsc.frequency.exponentialRampToValueAtTime(24, now + 0.38);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.38);

    boomGain.gain.setValueAtTime(0.38 * scale, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    boomOsc.connect(filter);
    filter.connect(boomGain);
    boomGain.connect(this.masterGain);

    boomOsc.start(now);
    boomOsc.stop(now + 0.42);

    // High frequency particle shatter resonance
    const shatterOsc = this.ctx.createOscillator();
    const shatterGain = this.ctx.createGain();
    shatterOsc.type = "sine";
    shatterOsc.frequency.setValueAtTime(1800, now + 0.02);
    shatterOsc.frequency.exponentialRampToValueAtTime(400, now + 0.28);
    shatterGain.gain.setValueAtTime(0.18 * scale, now + 0.02);
    shatterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    shatterOsc.connect(shatterGain);
    shatterGain.connect(this.masterGain);
    shatterOsc.start(now + 0.02);
    shatterOsc.stop(now + 0.32);
  }
}

// Global singleton instance
window.soundEngine = new SoundEngine();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SoundEngine };
}
