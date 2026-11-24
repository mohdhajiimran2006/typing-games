// ========================================================
// CYBER AQUA WORD COMBAT SHOOTER (MATCHING REFERENCE UI)
// Letter-Group Word Capsules, Smart & Dangerous Railgun, Combat Log
// ========================================================

// 8 Rich Cyberpunk Neon Color Palettes for Falling Words
const POD_COLOR_PALETTES = [
  {
    name: "Cyber Pink",
    primary: "#ff007f",
    secondary: "#f43f5e",
    glow: "rgba(255, 0, 127, 0.75)",
    boxBg: "rgba(255, 0, 127, 0.16)",
    typedBg: "#ff007f",
    textLight: "#ffd1dc",
    icon: "⚡",
    badge: "OVERDRIVE"
  },
  {
    name: "Radiant Cyan",
    primary: "#00f0ff",
    secondary: "#0284c7",
    glow: "rgba(0, 240, 255, 0.75)",
    boxBg: "rgba(0, 240, 255, 0.16)",
    typedBg: "#00f0ff",
    textLight: "#cffafe",
    icon: "💠",
    badge: "QUANTUM"
  },
  {
    name: "Solar Gold",
    primary: "#fbbf24",
    secondary: "#f59e0b",
    glow: "rgba(251, 191, 36, 0.75)",
    boxBg: "rgba(251, 191, 36, 0.16)",
    typedBg: "#f59e0b",
    textLight: "#fef3c7",
    icon: "🔥",
    badge: "SOLAR"
  },
  {
    name: "Matrix Emerald",
    primary: "#10b981",
    secondary: "#059669",
    glow: "rgba(16, 185, 129, 0.75)",
    boxBg: "rgba(16, 185, 129, 0.16)",
    typedBg: "#10b981",
    textLight: "#d1fae5",
    icon: "✦",
    badge: "BIO-NET"
  },
  {
    name: "Cosmic Violet",
    primary: "#c084fc",
    secondary: "#9333ea",
    glow: "rgba(192, 132, 252, 0.75)",
    boxBg: "rgba(147, 51, 234, 0.18)",
    typedBg: "#9333ea",
    textLight: "#f3e8ff",
    icon: "🔮",
    badge: "VORTEX"
  },
  {
    name: "Sunset Crimson",
    primary: "#ff3366",
    secondary: "#e11d48",
    glow: "rgba(255, 51, 102, 0.75)",
    boxBg: "rgba(255, 51, 102, 0.18)",
    typedBg: "#e11d48",
    textLight: "#ffe4e6",
    icon: "💥",
    badge: "INFERNO"
  },
  {
    name: "Acid Neon Lime",
    primary: "#a3e635",
    secondary: "#65a30d",
    glow: "rgba(163, 230, 53, 0.75)",
    boxBg: "rgba(163, 230, 53, 0.16)",
    typedBg: "#65a30d",
    textLight: "#ecfccb",
    icon: "☣",
    badge: "KINETIC"
  },
  {
    name: "Electric Azure",
    primary: "#38bdf8",
    secondary: "#2563eb",
    glow: "rgba(56, 189, 248, 0.75)",
    boxBg: "rgba(37, 99, 235, 0.18)",
    typedBg: "#2563eb",
    textLight: "#e0f2fe",
    icon: "⭐",
    badge: "CHRONO"
  }
];

class CyberWordShooterGame {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.canvas = null;
    this.ctx = null;
    this.animId = null;

    // Game State
    this.state = "idle"; // "idle", "playing", "gameover", "paused"
    this.score = 0;
    this.kills = 0;
    this.multiplier = 1.0;
    this.streak = 0;
    this.accuracy = 100;
    this.totalStrokes = 0;
    this.correctStrokes = 0;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.currentWpm = 0;
    this.gameSpeedMultiplier = 1.0;

    // Word Pods & Targeting
    this.words = [];
    this.activeTarget = null; // Currently locked-on word pod
    this.lockedLetterProgress = 0; // Index of next letter to type in locked word
    this.projectiles = [];
    this.particles = [];
    this.combatLogs = []; // Right-side stream

    // Spawning parameters
    this.spawnTimer = 0;
    this.spawnInterval = 2.4;
    this.wave = 1;

    // Wallpaper Themes (Default is Satoru Gojo Limitless Moon)
    this.wallpapers = ["gojo_moon", "blood_moon", "anime_eye", "deep_ocean", "cyber_matrix"];
    this.currentWallpaperIdx = 0;

    // 1. Satoru Gojo Limitless Full Moon Wallpaper (User Uploaded Image)
    this.gojoMoonImg = new Image();
    this.gojoMoonImg.src = "assets/gojo_moon.jpg";
    this.gojoMoonLoaded = false;
    this.gojoMoonImg.onload = () => {
      this.gojoMoonLoaded = true;
    };

    // 2. Blood Red Moon Wallpaper
    this.bloodMoonImg = new Image();
    this.bloodMoonImg.src = "assets/blood_moon.jpg";
    this.bloodMoonLoaded = false;
    this.bloodMoonImg.onload = () => {
      this.bloodMoonLoaded = true;
    };

    // Curated Word Dictionary grouped by length
    this.wordBank = {
      short: ["glow", "surf", "wave", "reef", "dive", "aqua", "tide", "beam", "bolt", "grid", "core", "neon", "drop", "flow", "apex"],
      medium: ["plant", "touch", "cyber", "laser", "drive", "limit", "piece", "batch", "found", "surge", "spark", "matrix", "stream", "vortex", "shadow", "photon"],
      long: ["velocity", "terminal", "quantum", "protocol", "overdrive", "hyperion", "radiance", "perimeter", "cyberpunk", "synchrony"]
    };

    // Smart & Dangerous Railgun Turret Physics & Visual Systems
    this.cannonX = 0;
    this.cannonY = 0;
    this.cannonAngle = -Math.PI / 2;
    this.targetCannonAngle = -Math.PI / 2;
    this.recoil = 0;
    this.muzzleFlash = 0;
    this.heat = 0;
    this.reactorSpin = 0;
    this.screenShake = 0;
    this.barrelSmoke = [];
    this.lightningArcs = [];
    this.lastLockedTarget = null;

    // Glowing Background Atmospheric Cursed Embers
    this.cursedEmbers = [];
    for (let i = 0; i < 28; i++) {
      this.cursedEmbers.push({
        x: Math.random() * (window.innerWidth || 1200),
        y: Math.random() * (window.innerHeight || 800),
        size: 1.5 + Math.random() * 3.2,
        speed: 18 + Math.random() * 30,
        swaySpeed: 1.2 + Math.random() * 1.8,
        swayAmp: 14 + Math.random() * 22,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.65 ? "#00f0ff" : (Math.random() < 0.85 ? "#38bdf8" : "#c084fc")
      });
    }

    this.init();
    this.fetchPythonWords();
  }

  async fetchPythonWords(category = "medium") {
    try {
      const res = await fetch(`/api/random-words?count=18&category=${encodeURIComponent(category)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.words && data.words.length > 0) {
          data.words.forEach(w => {
            const word = w.toLowerCase().trim();
            if (word.length <= 4 && !this.wordBank.short.includes(word)) this.wordBank.short.push(word);
            else if (word.length <= 7 && !this.wordBank.medium.includes(word)) this.wordBank.medium.push(word);
            else if (!this.wordBank.long.includes(word)) this.wordBank.long.push(word);
          });
        }
      }
    } catch (e) {
      // Quiet fallback to built-in dictionary
    }
  }

  init() {
    if (!this.container) return;

    this.canvas = document.createElement("canvas");
    this.canvas.className = "cyber-word-canvas";
    this.container.innerHTML = "";
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    this.onResize();
    window.addEventListener("resize", () => this.onResize());

    this.bindInputEvents();
    this.animate(0);
  }

  onResize() {
    if (!this.container || !this.canvas) return;
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || (window.innerHeight - 52);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.cannonX = this.width / 2;
    this.cannonY = this.height - 65;
  }

  cycleWallpaper() {
    this.currentWallpaperIdx = (this.currentWallpaperIdx + 1) % this.wallpapers.length;
    const name = this.wallpapers[this.currentWallpaperIdx].replace("_", " ").toUpperCase();
    this.addCombatLog(`SYSTEM: WALLPAPER CHANGED TO ${name}`, "#38bdf8");
  }

  bindInputEvents() {
    window.addEventListener("keydown", (e) => {
      // Only process when bubble game screen is visible
      const screen = document.getElementById("screen-bubble-game");
      if (!screen || screen.classList.contains("hidden")) return;

      // Ignore if typing inside input fields in modals
      if (e.target && e.target.tagName === "INPUT" && !e.target.classList.contains("hidden-key-input")) {
        return;
      }

      if (e.key === " " && (this.state === "idle" || this.state === "gameover")) {
        e.preventDefault();
        this.startGame();
        return;
      }

      if (e.key === "Escape") {
        if (this.state === "playing") this.pauseGame();
        else if (this.state === "paused") this.resumeGame();
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        this.startGame();
        return;
      }

      if (this.state === "playing" && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.handleKeyStroke(e.key.toLowerCase());
      }
    });

    this.canvas.addEventListener("click", () => {
      if (this.state === "idle" || this.state === "gameover") {
        this.startGame();
      }
    });
  }

  startGame() {
    this.state = "playing";
    this.score = 0;
    this.kills = 0;
    this.multiplier = 1.0;
    this.streak = 0;
    this.accuracy = 100;
    this.totalStrokes = 0;
    this.correctStrokes = 0;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    this.currentWpm = 0;
    this.gameSpeedMultiplier = 1.0;

    this.words = [];
    this.activeTarget = null;
    this.lockedLetterProgress = 0;
    this.projectiles = [];
    this.particles = [];
    this.combatLogs = [];

    this.spawnTimer = 1.8; // spawn first word quickly
    this.spawnInterval = 2.4;
    this.wave = 1;

    this.addCombatLog("SYSTEM: PERIMETER DEFENSE INITIALIZED", "#10b981");
    this.addCombatLog("TARGET LOCK-ON READY - TYPE INCOMING WORD", "#00f0ff");

    if (window.soundEngine) {
      window.soundEngine.playSpecialBubble();
    }
  }

  pauseGame() {
    this.state = "paused";
  }

  resumeGame() {
    this.state = "playing";
  }

  // ==========================================
  // WORD POD SPAWNING & TARGETING LOGIC
  // ==========================================

  spawnWordPod() {
    let pool;
    if (this.wave === 1) pool = this.wordBank.short;
    else if (this.wave === 2) pool = [...this.wordBank.short, ...this.wordBank.medium];
    else pool = [...this.wordBank.medium, ...this.wordBank.long];

    // Pick a word not currently on screen
    const available = pool.filter(w => !this.words.some(existing => existing.text === w));
    const wordText = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : pool[Math.floor(Math.random() * pool.length)];

    // Calculate pod dimensions
    const letterBoxW = 28;
    const letterBoxH = 34;
    const padding = 10;
    const podWidth = wordText.length * (letterBoxW + 4) + padding * 2;
    const podHeight = letterBoxH + padding * 2;

    // Distribute X safely within bounds (accounting for right combat log panel)
    const maxX = Math.max(100, this.width - 320 - podWidth);
    const minX = 40;
    const x = minX + Math.random() * (maxX - minX);
    const y = -podHeight;

    const baseSpeed = 22 + (this.wave * 4) + Math.random() * 8;

    // Assign one of 8 distinct vibrant cyberpunk color palettes
    const palette = POD_COLOR_PALETTES[Math.floor(Math.random() * POD_COLOR_PALETTES.length)];

    this.words.push({
      text: wordText,
      x: x,
      y: y,
      width: podWidth,
      height: podHeight,
      letterBoxW: letterBoxW,
      letterBoxH: letterBoxH,
      speed: baseSpeed * this.gameSpeedMultiplier,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 1.2 + Math.random() * 1.5,
      isTargeted: false,
      palette: palette,
      pulse: Math.random() * Math.PI * 2
    });
  }

  handleKeyStroke(char) {
    this.totalStrokes++;

    // 1. If we already have a locked target word:
    if (this.activeTarget && this.words.includes(this.activeTarget)) {
      const expectedChar = this.activeTarget.text[this.lockedLetterProgress];
      if (char === expectedChar) {
        // Hit next character
        this.correctStrokes++;
        this.lockedLetterProgress++;
        this.streak++;
        this.multiplier = Math.min(5.0, 1.0 + Math.floor(this.streak / 4) * 0.5);

        // Fire smart plasma railgun bolt into this letter box
        this.firePlasmaBolt(this.activeTarget, this.lockedLetterProgress - 1);

        // Check if full word completed
        if (this.lockedLetterProgress >= this.activeTarget.text.length) {
          this.destroyWord(this.activeTarget);
        }
      } else {
        // Typing mistake on locked target
        this.streak = 0;
        this.multiplier = 1.0;
        if (window.soundEngine) {
          window.soundEngine.playKeyClick(false);
        }
      }
    } 
    // 2. Otherwise find a new target whose FIRST letter matches
    else {
      // Find all incoming words starting with char, prioritize lowest on screen
      const matching = this.words.filter(w => w.text.startsWith(char));
      if (matching.length > 0) {
        matching.sort((a, b) => (b.y + b.height) - (a.y + a.height));
        const target = matching[0];

        this.activeTarget = target;
        target.isTargeted = true;
        this.lockedLetterProgress = 1; // first character typed
        this.correctStrokes++;
        this.streak++;
        this.multiplier = Math.min(5.0, 1.0 + Math.floor(this.streak / 4) * 0.5);

        // Play high-tech smart acquisition lock chirp
        if (this.lastLockedTarget !== target) {
          this.lastLockedTarget = target;
          if (window.soundEngine && window.soundEngine.playTargetLocked) {
            window.soundEngine.playTargetLocked();
          }
          this.addCombatLog(`SMART LOCK: "${target.text.toUpperCase()}"`, target.palette ? target.palette.primary : "#00f0ff");
        }

        this.firePlasmaBolt(target, 0);

        if (this.lockedLetterProgress >= target.text.length) {
          this.destroyWord(target);
        }
      } else {
        // Missed keystroke
        this.streak = 0;
        this.multiplier = 1.0;
        if (window.soundEngine) {
          window.soundEngine.playKeyClick(false);
        }
      }
    }

    // Recalculate Accuracy
    this.accuracy = this.totalStrokes > 0
      ? Math.round((this.correctStrokes / this.totalStrokes) * 100)
      : 100;
  }

  firePlasmaBolt(targetWord, letterIdx) {
    const pal = targetWord.palette || POD_COLOR_PALETTES[0];
    const letterCenterX = targetWord.x + 14 + letterIdx * (targetWord.letterBoxW + 4) + targetWord.letterBoxW / 2;
    const letterCenterY = targetWord.y + targetWord.height / 2;

    this.projectiles.push({
      x: this.cannonX,
      y: this.cannonY,
      tx: letterCenterX,
      ty: letterCenterY,
      speed: 1800,
      color: pal.primary,
      trail: []
    });

    // Smart & Dangerous Gun Firing Physics
    this.recoil = 13.0; // heavy mechanical barrel kickback
    this.muzzleFlash = 0.95; // dual muzzle flash flare
    this.heat = Math.min(1.0, this.heat + 0.12);
    this.cannonAngle = Math.atan2(letterCenterY - this.cannonY, letterCenterX - this.cannonX);

    // Audio: Heavy Plasma Railgun Fire
    if (window.soundEngine && window.soundEngine.playRailgunFire) {
      window.soundEngine.playRailgunFire(1.0 + Math.min(0.5, this.streak * 0.04));
    } else if (window.soundEngine) {
      window.soundEngine.playHydroBlast();
    }
  }

  destroyWord(word) {
    const idx = this.words.indexOf(word);
    if (idx !== -1) {
      this.words.splice(idx, 1);
    }

    const pal = word.palette || POD_COLOR_PALETTES[0];
    this.kills++;
    const basePts = word.text.length * 15;
    const totalPts = Math.round(basePts * this.multiplier);
    this.score += totalPts;

    // Heavy Annihilation Shockwave & Recoil
    this.screenShake = 9.0;
    this.recoil = 18.0;
    this.muzzleFlash = 1.0;
    this.heat = Math.min(1.0, this.heat + 0.25);
    this.emitBarrelSmoke();

    // Add to combat log stream in the word's colorful theme!
    this.addCombatLog(`OBLITERATED: "${word.text.toUpperCase()}" (+${totalPts} pts)`, pal.primary);

    // Audio: Devastating Annihilation Blast
    if (window.soundEngine && window.soundEngine.playDevastatingExplosion) {
      window.soundEngine.playDevastatingExplosion(1.1);
    } else if (window.soundEngine) {
      window.soundEngine.playBubblePop(1.1 + (this.streak * 0.04));
    }

    // Explosion Particles in the word's vivid color theme
    this.createExplosionParticles(word.x + word.width / 2, word.y + word.height / 2, pal);

    // Wave Progression
    if (this.kills % 8 === 0) {
      this.wave++;
      this.spawnInterval = Math.max(1.2, 2.4 - this.wave * 0.18);
      this.addCombatLog(`ALERT: ADVANCING TO WAVE ${this.wave}`, "#fbbf24");
      this.fetchPythonWords(this.wave > 2 ? "long" : "medium");
      if (window.soundEngine) window.soundEngine.playSpecialBubble();
    }

    // Reset current locked target
    this.activeTarget = null;
    this.lockedLetterProgress = 0;
  }

  emitBarrelSmoke() {
    const rad = this.cannonAngle;
    const barrelLen = 65;
    const tipX = this.cannonX + Math.cos(rad) * barrelLen;
    const tipY = this.cannonY + Math.sin(rad) * barrelLen;

    for (let i = 0; i < 5; i++) {
      this.barrelSmoke.push({
        x: tipX + (Math.random() - 0.5) * 12,
        y: tipY + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 20 + Math.cos(rad) * 25,
        vy: -25 - Math.random() * 25,
        radius: 4 + Math.random() * 5,
        alpha: 0.75,
        decay: 1.5 + Math.random() * 1.0
      });
    }
  }

  addCombatLog(text, color = "#e2e8f0") {
    this.combatLogs.unshift({ text, color, time: Date.now() });
    if (this.combatLogs.length > 9) {
      this.combatLogs.pop();
    }
  }

  createExplosionParticles(x, y, palette) {
    const pal = palette || POD_COLOR_PALETTES[0];
    for (let i = 0; i < 36; i++) {
      const angle = (Math.PI * 2 * i) / 36 + (Math.random() - 0.5) * 0.35;
      const spd = 80 + Math.random() * 240;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: 2 + Math.random() * 4.5,
        color: Math.random() < 0.65 ? pal.primary : (Math.random() < 0.85 ? pal.secondary : "#ffffff"),
        alpha: 1.0,
        decay: 1.6 + Math.random() * 1.6
      });
    }

    // Double Shockwave rings in vibrant palette color
    this.particles.push({
      x: x,
      y: y,
      isRing: true,
      radius: 14,
      maxRadius: 85,
      color: pal.primary,
      alpha: 1.0,
      decay: 2.2
    });
    this.particles.push({
      x: x,
      y: y,
      isRing: true,
      radius: 6,
      maxRadius: 110,
      color: "#ffffff",
      alpha: 0.9,
      decay: 2.8
    });
  }

  // ==========================================
  // BREACH & GAME OVER
  // ==========================================

  triggerPerimeterBreach(word) {
    this.addCombatLog(`CRITICAL BREACH: "${word.text.toUpperCase()}"`, "#ef4444");
    if (window.soundEngine) {
      window.soundEngine.playWaterSplash();
    }
    this.gameOver();
  }

  gameOver() {
    this.state = "gameover";

    // Save Record to Firebase & LocalStorage
    if (window.firebaseSync) {
      window.firebaseSync.saveBubbleRecord({
        score: this.score,
        level: this.wave,
        poppedCount: this.kills,
        accuracy: this.accuracy,
        maxCombo: Math.round(this.multiplier * 5)
      });
    }

    const modal = document.getElementById("modal-bubble-gameover");
    if (modal) {
      document.getElementById("bg-final-score").textContent = this.score;
      document.getElementById("bg-final-wave").textContent = `Wave ${this.wave}`;
      document.getElementById("bg-final-popped").textContent = this.kills;
      document.getElementById("bg-final-accuracy").textContent = `${this.accuracy}%`;
      modal.classList.remove("hidden");
    }
  }

  // ==========================================
  // 60 FPS RENDER LOOP
  // ==========================================

  animate(timestamp) {
    this.animId = requestAnimationFrame((t) => this.animate(t));
    if (!this.ctx) return;

    const delta = 0.016; // approx 60fps delta

    this.update(delta);
    this.draw();
  }

  update(delta) {
    if (this.state !== "playing") return;

    // Elapsed timer & WPM calculation
    const elapsedMs = Date.now() - this.startTime;
    this.elapsedSeconds = Math.floor(elapsedMs / 1000);
    const elapsedMinutes = elapsedMs / 60000;
    if (elapsedMinutes > 0.01) {
      this.currentWpm = Math.round((this.correctStrokes / 5) / elapsedMinutes);
    }

    // Spawning words
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnWordPod();
    }

    // Update Word Pods
    const breachLineY = this.height - 75; // Red warning line position
    for (let i = this.words.length - 1; i >= 0; i--) {
      const w = this.words[i];
      w.y += w.speed * delta;
      w.wobble += delta * w.wobbleSpeed;
      w.x += Math.sin(w.wobble) * 0.4;

      // Check breach
      if (w.y + w.height >= breachLineY) {
        this.triggerPerimeterBreach(w);
        return;
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 30) {
        this.projectiles.splice(i, 1);
      } else {
        const step = p.speed * delta;
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;

        p.trail.push({ x: p.x, y: p.y, alpha: 0.8 });
        if (p.trail.length > 6) p.trail.shift();
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.alpha -= pt.decay * delta;
      if (pt.isRing) {
        pt.radius += 80 * delta;
      } else {
        pt.x += pt.vx * delta;
        pt.y += pt.vy * delta;
      }
      if (pt.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Smart Cannon Auto-Aiming & Sentry Tracking
    let targetX, targetY;
    if (this.activeTarget && this.words.includes(this.activeTarget)) {
      const letterIdx = Math.min(this.lockedLetterProgress, this.activeTarget.text.length - 1);
      targetX = this.activeTarget.x + 14 + letterIdx * (this.activeTarget.letterBoxW + 4) + this.activeTarget.letterBoxW / 2;
      targetY = this.activeTarget.y + this.activeTarget.height / 2;
    } else {
      // Find lowest incoming word closest to perimeter breach line
      const threats = this.words.filter(w => w.y > -20).sort((a, b) => (b.y + b.height) - (a.y + a.height));
      if (threats.length > 0) {
        targetX = threats[0].x + threats[0].width / 2;
        targetY = threats[0].y + threats[0].height / 2;
      } else {
        targetX = this.cannonX;
        targetY = 0;
      }
    }

    const desiredAngle = Math.atan2(targetY - this.cannonY, targetX - this.cannonX);
    let angleDiff = desiredAngle - this.cannonAngle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    this.cannonAngle += angleDiff * Math.min(1.0, delta * 16);

    // Physics & Reactor cooldown
    this.recoil = Math.max(0, this.recoil - delta * 45);
    this.muzzleFlash = Math.max(0, this.muzzleFlash - delta * 6);
    this.heat = Math.max(0, this.heat - delta * 0.28);
    this.reactorSpin += delta * (2.8 + this.streak * 0.45);
    this.screenShake = Math.max(0, this.screenShake - delta * 22);

    // Update Barrel Smoke
    for (let i = this.barrelSmoke.length - 1; i >= 0; i--) {
      const sm = this.barrelSmoke[i];
      sm.alpha -= sm.decay * delta;
      sm.x += sm.vx * delta;
      sm.y += sm.vy * delta;
      sm.radius += 12 * delta;
      if (sm.alpha <= 0) {
        this.barrelSmoke.splice(i, 1);
      }
    }

    // Generate crackling electrical arcs on the reactor core
    if (Math.random() < 0.45) {
      const arcAngle = Math.random() * Math.PI * 2;
      const arcLen = 14 + Math.random() * 16;
      this.lightningArcs.push({
        x: this.cannonX + Math.cos(arcAngle) * 14,
        y: this.cannonY + Math.sin(arcAngle) * 14,
        tx: this.cannonX + Math.cos(arcAngle) * arcLen + (Math.random() - 0.5) * 10,
        ty: this.cannonY + Math.sin(arcAngle) * arcLen + (Math.random() - 0.5) * 10,
        color: this.multiplier >= 4 ? "#ef4444" : (this.multiplier >= 2.5 ? "#a855f7" : "#00f0ff"),
        life: 0.08
      });
    }

    // Update Lightning Arcs
    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      this.lightningArcs[i].life -= delta;
      if (this.lightningArcs[i].life <= 0) {
        this.lightningArcs.splice(i, 1);
      }
    }

    // Update Glowing Background Cursed Embers
    const timeSec = performance.now() * 0.001;
    this.cursedEmbers.forEach(em => {
      em.y -= em.speed * delta;
      em.x += Math.sin(timeSec * em.swaySpeed + em.phase) * (em.swayAmp * delta);
      if (em.y < -15) {
        em.y = this.height + 15;
        em.x = Math.random() * this.width;
      }
    });
  }

  // ==========================================
  // DRAWING SYSTEM (MATCHING IMAGE 1 PIXEL-FOR-PIXEL)
  // ==========================================

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    // Screen impact punch shake when dangerous annihilator cannon fires
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // 1. Draw Themed Background
    this.drawWallpaperBackground(ctx, w, h);

    // 2. Animated Caustics & Ambient Plankton
    this.drawWaterCaustics(ctx, w, h);

    // 3. Draw Laser Targeting Beam to Locked Word (Smart & Dangerous)
    if (this.activeTarget && this.words.includes(this.activeTarget)) {
      this.drawLaserTargetingBeam(ctx);
    }

    // 4. Projectiles
    this.drawProjectiles(ctx);

    // 5. Word Pods (Floating Letter Capsules)
    this.words.forEach(word => this.drawWordPod(ctx, word));

    // 6. Explosion Particles
    this.drawParticles(ctx);

    // 7. Red Perimeter Breach Hazard Line (Image 1 style)
    this.drawPerimeterBreachLine(ctx, w, h);

    // 8. Bottom Turret / Shooter Cannon & Locked Bar (Smart & Dangerous Railgun)
    this.drawBottomTurretAndLockHUD(ctx, w, h);

    // 9. Right-Side COMBAT LOG Panel (Image 1 style)
    this.drawCombatLogPanel(ctx, w, h);

    // 10. Top Cyber HUD Bar (Image 1 style)
    this.drawTopCyberHud(ctx, w);

    // 11. Start Overlay
    if (this.state === "idle") {
      this.drawIdleOverlay(ctx, w, h);
    } else if (this.state === "paused") {
      this.drawPausedOverlay(ctx, w, h);
    }

    ctx.restore();
  }

  // Backgrounds: Satoru Gojo Limitless Moon / Blood Red Moon / Cosmic Eyes / Deep Ocean / Cyber Grid
  drawWallpaperBackground(ctx, w, h) {
    const currentTheme = this.wallpapers[this.currentWallpaperIdx];

    if (currentTheme === "gojo_moon") {
      // 1. Satoru Gojo Limitless Moon Wallpaper (User Uploaded)
      const isLoaded = this.gojoMoonLoaded || (this.gojoMoonImg.complete && this.gojoMoonImg.naturalWidth > 0);
      if (isLoaded) {
        const imgRatio = this.gojoMoonImg.width / this.gojoMoonImg.height;
        const canvasRatio = w / h;
        let dw, dh, dx, dy;
        if (canvasRatio > imgRatio) {
          dw = w;
          dh = w / imgRatio;
          dx = 0;
          dy = (h - dh) / 2;
        } else {
          dh = h;
          dw = h * imgRatio;
          dx = (w - dw) / 2;
          dy = 0;
        }
        ctx.drawImage(this.gojoMoonImg, dx, dy, dw, dh);
      } else {
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.35, 10, w * 0.5, h * 0.5, w * 0.8);
        grad.addColorStop(0, "#0369a1");
        grad.addColorStop(0.4, "#0f172a");
        grad.addColorStop(1, "#020617");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    } else if (currentTheme === "blood_moon") {
      // 2. User Uploaded Itachi Blood Red Moon Wallpaper
      const isBloodLoaded = this.bloodMoonLoaded || (this.bloodMoonImg.complete && this.bloodMoonImg.naturalWidth > 0);
      if (isBloodLoaded) {
        const imgRatio = this.bloodMoonImg.width / this.bloodMoonImg.height;
        const canvasRatio = w / h;
        let dw, dh, dx, dy;
        if (canvasRatio > imgRatio) {
          dw = w;
          dh = w / imgRatio;
          dx = 0;
          dy = (h - dh) / 2;
        } else {
          dh = h;
          dw = h * imgRatio;
          dx = (w - dw) / 2;
          dy = 0;
        }
        ctx.drawImage(this.bloodMoonImg, dx, dy, dw, dh);
      } else {
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.35, 10, w * 0.5, h * 0.5, w * 0.8);
        grad.addColorStop(0, "#7f1d1d");
        grad.addColorStop(0.4, "#2d080a");
        grad.addColorStop(1, "#0a0204");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    } else if (currentTheme === "anime_eye") {
      // Deep cyber anime blue eye background matching Image 1
      const grad = ctx.createRadialGradient(w * 0.55, h * 0.45, 20, w * 0.5, h * 0.5, w * 0.8);
      grad.addColorStop(0, "#082f49"); // Eye pupil center glow
      grad.addColorStop(0.3, "#041728"); // Iris ring
      grad.addColorStop(0.7, "#020a14"); // Dark anime shadow
      grad.addColorStop(1, "#01050a");   // Deep void
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Stylized Eye Iris Arc Highlights (Image 1 glowing aesthetic)
      ctx.save();
      ctx.strokeStyle = "rgba(0, 240, 255, 0.28)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(w * 0.55, h * 0.45, 90, 50, -0.2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(14, 165, 233, 0.18)";
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.ellipse(w * 0.55, h * 0.45, 130, 80, -0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (currentTheme === "deep_ocean") {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#031e38");
      grad.addColorStop(0.6, "#021124");
      grad.addColorStop(1, "#010811");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      // Cyber Matrix Grid
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ==========================================
  // RADIANT WALLPAPER GLOW EFFECTS (GOJO MOON)
  // ==========================================
  drawGojoWallpaperGlow(ctx, dx, dy, dw, dh, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    const time = performance.now() * 0.002;
    const pulse = 1.0 + Math.sin(time * 2.2) * 0.16;
    const streakBoost = Math.min(0.5, this.streak * 0.04);

    // 1. Radiant Lunar Bloom (Around the giant Full Moon behind Gojo)
    const mx = dx + dw * 0.285;
    const my = dy + dh * 0.235;
    const mr = dw * 0.16;

    const moonBloom = ctx.createRadialGradient(mx, my, mr * 0.15, mx, my, mr * (1.75 * pulse));
    moonBloom.addColorStop(0, "rgba(224, 242, 254, 0.75)");  // Blinding white-blue lunar core
    moonBloom.addColorStop(0.35, "rgba(56, 189, 248, 0.55)"); // Celestial electric cyan
    moonBloom.addColorStop(0.7, "rgba(2, 132, 199, 0.35)");   // Deep azure infinity aura
    moonBloom.addColorStop(1, "transparent");

    ctx.fillStyle = moonBloom;
    ctx.beginPath();
    ctx.arc(mx, my, mr * (1.75 * pulse), 0, Math.PI * 2);
    ctx.fill();

    // 2. Gojo's "Six Eyes" (Rikugan) Blinding Cyan Eye Flare & Laser Streak
    const ex = dx + dw * 0.588;
    const ey = dy + dh * 0.352;

    // Concentrated Eye Flare
    const eyeGlow = ctx.createRadialGradient(ex, ey, 1, ex, ey, 42 * pulse);
    eyeGlow.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    eyeGlow.addColorStop(0.25, "rgba(0, 240, 255, 0.9)");
    eyeGlow.addColorStop(0.6, "rgba(14, 165, 233, 0.45)");
    eyeGlow.addColorStop(1, "transparent");

    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(ex, ey, 42 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal Anamorphic Laser Flare Streak Across Gaze
    const flareW = dw * 0.32;
    const flareGrad = ctx.createLinearGradient(ex - flareW, ey, ex + flareW, ey);
    flareGrad.addColorStop(0, "transparent");
    flareGrad.addColorStop(0.35, "rgba(0, 240, 255, 0.3)");
    flareGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
    flareGrad.addColorStop(0.65, "rgba(0, 240, 255, 0.3)");
    flareGrad.addColorStop(1, "transparent");

    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.ellipse(ex, ey, flareW, 4.5 * pulse, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cross Starburst Diamond on Eye
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ex - 22, ey); ctx.lineTo(ex + 22, ey);
    ctx.moveTo(ex, ey - 22); ctx.lineTo(ex, ey + 22);
    ctx.stroke();

    // 3. Glowing Neon Japanese Kanji Pillar ("五条 悟 SATORU GOJO")
    const kx = dx + dw * 0.912;
    const ky = dy + dh * 0.38;
    const kanjiGlow = ctx.createRadialGradient(kx, ky, 8, kx, ky, dw * 0.22);
    kanjiGlow.addColorStop(0, "rgba(0, 240, 255, 0.55)");
    kanjiGlow.addColorStop(0.4, "rgba(37, 99, 235, 0.3)");
    kanjiGlow.addColorStop(1, "transparent");

    ctx.fillStyle = kanjiGlow;
    ctx.beginPath();
    ctx.arc(kx, ky, dw * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // 4. Floating Cursed Energy Embers / Luminous Atmospheric Motes
    this.cursedEmbers.forEach(em => {
      const emberGrad = ctx.createRadialGradient(em.x, em.y, 0, em.x, em.y, em.size * 3.5);
      emberGrad.addColorStop(0, "#ffffff");
      emberGrad.addColorStop(0.35, em.color);
      emberGrad.addColorStop(1, "transparent");

      ctx.fillStyle = emberGrad;
      ctx.beginPath();
      ctx.arc(em.x, em.y, em.size * 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Dynamic Limitless Ethereal Edge Vignette Glow
    const rimGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
    rimGrad.addColorStop(0, "transparent");
    rimGrad.addColorStop(0.7, "rgba(2, 132, 199, 0.14)");
    rimGrad.addColorStop(1, `rgba(0, 240, 255, ${0.32 + streakBoost * 0.4})`);

    ctx.fillStyle = rimGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  // ==========================================
  // RADIANT WALLPAPER GLOW EFFECTS (BLOOD MOON)
  // ==========================================
  drawBloodMoonWallpaperGlow(ctx, dx, dy, dw, dh, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    const time = performance.now() * 0.002;
    const pulse = 1.0 + Math.sin(time * 2.2) * 0.14;

    // Glowing Blood Moon Corona
    const mx = dx + dw * 0.5;
    const my = dy + dh * 0.28;
    const mr = dw * 0.18;

    const redMoonGrad = ctx.createRadialGradient(mx, my, mr * 0.2, mx, my, mr * (1.6 * pulse));
    redMoonGrad.addColorStop(0, "rgba(254, 202, 202, 0.75)"); // White-crimson core
    redMoonGrad.addColorStop(0.35, "rgba(239, 68, 68, 0.6)");  // Blood red corona
    redMoonGrad.addColorStop(0.7, "rgba(153, 27, 27, 0.35)");  // Deep eclipse aura
    redMoonGrad.addColorStop(1, "transparent");

    ctx.fillStyle = redMoonGrad;
    ctx.beginPath();
    ctx.arc(mx, my, mr * (1.6 * pulse), 0, Math.PI * 2);
    ctx.fill();

    // Floating Blood Embers
    this.cursedEmbers.forEach(em => {
      const emberGrad = ctx.createRadialGradient(em.x, em.y, 0, em.x, em.y, em.size * 3.0);
      emberGrad.addColorStop(0, "#ffffff");
      emberGrad.addColorStop(0.4, "#ef4444");
      emberGrad.addColorStop(1, "transparent");

      ctx.fillStyle = emberGrad;
      ctx.beginPath();
      ctx.arc(em.x, em.y, em.size * 3.0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Crimson Vignette Edge Glow
    const rimGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    rimGrad.addColorStop(0, "transparent");
    rimGrad.addColorStop(0.75, "rgba(185, 28, 28, 0.16)");
    rimGrad.addColorStop(1, "rgba(239, 68, 68, 0.32)");

    ctx.fillStyle = rimGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  drawWaterCaustics(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const time = performance.now() * 0.0012;

    for (let i = 0; i < 3; i++) {
      const sweep = Math.sin(time + i * 2.1) * (w * 0.2);
      const grad = ctx.createLinearGradient(w * 0.2 + i * (w * 0.3) + sweep, 0, w * 0.4 + sweep, h);
      grad.addColorStop(0, "rgba(0, 240, 255, 0.09)");
      grad.addColorStop(0.5, "rgba(16, 185, 129, 0.03)");
      grad.addColorStop(1, "transparent");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(w * 0.15 + i * (w * 0.3) + sweep, 0);
      ctx.lineTo(w * 0.35 + i * (w * 0.3) + sweep, 0);
      ctx.lineTo(w * 0.55 + i * (w * 0.25) + sweep, h);
      ctx.lineTo(w * 0.25 + i * (w * 0.25) + sweep, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // High-Voltage Plasma Lightning Beam & Smart Holographic Reticle (Smart & Dangerous)
  drawLaserTargetingBeam(ctx) {
    if (!this.activeTarget) return;

    const pal = this.activeTarget.palette || POD_COLOR_PALETTES[0];
    const letterIdx = Math.min(this.lockedLetterProgress, this.activeTarget.text.length - 1);
    const targetX = this.activeTarget.x + 14 + letterIdx * (this.activeTarget.letterBoxW + 4) + this.activeTarget.letterBoxW / 2;
    const targetY = this.activeTarget.y + this.activeTarget.height / 2;

    const angle = this.cannonAngle;
    const barrelLen = 60 - this.recoil;
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);

    // Left and Right barrel tips in world coordinates
    const leftTipX = this.cannonX + Math.cos(angle) * barrelLen + perpX * 9;
    const leftTipY = this.cannonY + Math.sin(angle) * barrelLen + perpY * 9;
    const rightTipX = this.cannonX + Math.cos(angle) * barrelLen - perpX * 9;
    const rightTipY = this.cannonY + Math.sin(angle) * barrelLen - perpY * 9;
    const centerTipX = this.cannonX + Math.cos(angle) * barrelLen;
    const centerTipY = this.cannonY + Math.sin(angle) * barrelLen;

    ctx.save();

    // 1. Dual Outer Laser Sighting Beams (Smart laser guide)
    ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);

    ctx.beginPath();
    ctx.moveTo(leftTipX, leftTipY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightTipX, rightTipY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    // 2. High-Voltage Ionized Plasma Lightning Beam (Dangerous central bolt)
    ctx.setLineDash([]);
    ctx.strokeStyle = pal.primary;
    ctx.lineWidth = 3.6;
    ctx.shadowColor = pal.primary;
    ctx.shadowBlur = 18;

    const segments = 6;
    ctx.beginPath();
    ctx.moveTo(centerTipX, centerTipY);
    for (let i = 1; i < segments; i++) {
      const frac = i / segments;
      const jx = centerTipX + (targetX - centerTipX) * frac + (Math.random() - 0.5) * 10;
      const jy = centerTipY + (targetY - centerTipY) * frac + (Math.random() - 0.5) * 10;
      ctx.lineTo(jx, jy);
    }
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    // Blinding core white lightning strand
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Smart Reticle Brackets over Target Letter
    const reticleSize = 22;
    const time = performance.now() * 0.0035;
    ctx.strokeStyle = pal.primary;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = pal.primary;
    ctx.shadowBlur = 14;

    ctx.save();
    ctx.translate(targetX, targetY);
    ctx.rotate(time);
    const s = reticleSize;
    ctx.beginPath();
    // 4 Corner brackets
    ctx.moveTo(-s, -s + 7); ctx.lineTo(-s, -s); ctx.lineTo(-s + 7, -s);
    ctx.moveTo(s - 7, -s); ctx.lineTo(s, -s); ctx.lineTo(s, -s + 7);
    ctx.moveTo(s, s - 7); ctx.lineTo(s, s); ctx.lineTo(s - 7, s);
    ctx.moveTo(-s + 7, s); ctx.lineTo(-s, s); ctx.lineTo(-s, s - 7);
    ctx.stroke();
    ctx.restore();

    // Central crosshair pip
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(targetX, targetY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Distance and Lock Telemetry Readout
    const dist = Math.hypot(targetX - this.cannonX, targetY - this.cannonY);
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillStyle = pal.primary;
    ctx.textAlign = "center";
    ctx.fillText(`⌖ SMART LOCK 100% // ${Math.round(dist / 10)}M`, targetX, targetY - reticleSize - 6);

    ctx.restore();
  }

  // Floating Word Capsule Pod with Letter Boxes in Rich Saturated Colors
  drawWordPod(ctx, pod) {
    ctx.save();
    const isLocked = pod === this.activeTarget;
    const pal = pod.palette || POD_COLOR_PALETTES[0];

    // 1. Pod Outer Container (Rounded Cyber Glass Capsule in Vibrant Neon Palette)
    ctx.shadowColor = isLocked ? "#ffffff" : pal.glow;
    ctx.shadowBlur = isLocked ? 24 : 14;

    // Background Gradient with subtle color wash
    const bgGrad = ctx.createLinearGradient(pod.x, pod.y, pod.x, pod.y + pod.height);
    bgGrad.addColorStop(0, "rgba(8, 14, 26, 0.94)");
    bgGrad.addColorStop(1, pal.boxBg);

    ctx.fillStyle = bgGrad;
    ctx.strokeStyle = isLocked ? "#ffffff" : pal.primary;
    ctx.lineWidth = isLocked ? 2.8 : 1.8;

    ctx.beginPath();
    ctx.roundRect(pod.x, pod.y, pod.width, pod.height, 10);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Futuristic Top Badge / Tag
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillStyle = pal.primary;
    ctx.textAlign = "left";
    ctx.fillText(`${pal.icon} ${pal.badge}`, pod.x + 8, pod.y - 5);

    // 2. Individual Letter Boxes inside Pod
    const paddingX = 10;
    const startY = pod.y + (pod.height - pod.letterBoxH) / 2;

    for (let i = 0; i < pod.text.length; i++) {
      const char = pod.text[i];
      const boxX = pod.x + paddingX + i * (pod.letterBoxW + 4);
      const isTyped = isLocked && i < this.lockedLetterProgress;
      const isNextChar = isLocked && i === this.lockedLetterProgress;

      // Letter Box Background & Border
      if (isTyped) {
        ctx.fillStyle = pal.typedBg; // Completed vibrant theme fill
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.shadowColor = pal.primary;
        ctx.shadowBlur = 10;
      } else if (isNextChar) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)"; // Active target highlight
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = pal.primary;
        ctx.shadowBlur = 18;
      } else {
        ctx.fillStyle = "rgba(10, 16, 28, 0.88)";
        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 1.2;
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.roundRect(boxX, startY, pod.letterBoxW, pod.letterBoxH, 5);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Active Indicator Caret below box
      if (isNextChar) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(boxX + pod.letterBoxW / 2 - 4, startY + pod.letterBoxH + 4);
        ctx.lineTo(boxX + pod.letterBoxW / 2 + 4, startY + pod.letterBoxH + 4);
        ctx.lineTo(boxX + pod.letterBoxW / 2, startY + pod.letterBoxH);
        ctx.closePath();
        ctx.fill();
      }

      // Letter Character (Vibrant & Colorful)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 19px 'JetBrains Mono', monospace";

      if (isTyped) {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 6;
      } else if (isNextChar) {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = pal.primary;
        ctx.shadowBlur = 14;
      } else {
        // Untyped letters glow with the word pod's vibrant theme color!
        ctx.fillStyle = pal.primary;
        ctx.shadowColor = pal.primary;
        ctx.shadowBlur = 8;
      }

      ctx.fillText(char, boxX + pod.letterBoxW / 2, startY + pod.letterBoxH / 2);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  drawProjectiles(ctx) {
    ctx.save();
    this.projectiles.forEach(p => {
      p.trail.forEach((t, idx) => {
        ctx.fillStyle = `rgba(0, 240, 255, ${(idx / p.trail.length) * 0.5})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 3 * (idx / p.trail.length), 0, Math.PI * 2);
        ctx.fill();
      });

      const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 7);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.5, p.color);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawParticles(ctx) {
    ctx.save();
    this.particles.forEach(pt => {
      if (pt.isRing) {
        ctx.strokeStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  // Red Perimeter Breach Hazard Line (Image 1 style)
  drawPerimeterBreachLine(ctx, w, h) {
    const lineY = h - 75;
    ctx.save();

    // Hazard striped line
    ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(w - 300, lineY); // leaves room for log panel
    ctx.stroke();

    // Glowing red glow underneath
    ctx.strokeStyle = "rgba(239, 68, 68, 0.2)";
    ctx.lineWidth = 8;
    ctx.setLineDash([]);
    ctx.stroke();

    // Warning Badge Text
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ef4444";
    ctx.fillText("⚠ PERIMETER BREACH LINE", 20, lineY - 8);

    ctx.textAlign = "right";
    ctx.fillText("CRITICAL PERIMETER: BREACH = FAIL", w - 320, lineY - 8);
    ctx.restore();
  }

  // ==========================================
  // SMART & DANGEROUS HEAVY RAILGUN TURRET
  // ==========================================
  drawSmartDangerousTurret(ctx) {
    const cx = this.cannonX;
    const cy = this.cannonY;
    const angle = this.cannonAngle;
    const multColor = this.multiplier >= 4 ? "#ef4444" : (this.multiplier >= 2.5 ? "#a855f7" : "#00f0ff");

    ctx.save();

    // 1. INDUSTRIAL TURRET BASE MOUNT
    const baseW = 96;
    const baseH = 26;
    const baseY = cy + 12;

    const baseGrad = ctx.createLinearGradient(cx - baseW / 2, baseY, cx + baseW / 2, baseY + baseH);
    baseGrad.addColorStop(0, "#0b1324");
    baseGrad.addColorStop(0.5, "#1e293b");
    baseGrad.addColorStop(1, "#0b1324");

    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - baseW / 2, baseY, baseW, baseH, [8, 8, 4, 4]);
    ctx.fill();
    ctx.stroke();

    // Hazard Safety Striping on Base
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - baseW / 2 + 4, baseY + 4, baseW - 8, 8, 2);
    ctx.clip();
    for (let x = cx - baseW / 2; x < cx + baseW / 2 + 20; x += 14) {
      ctx.fillStyle = (Math.floor(x / 14) % 2 === 0) ? "rgba(251, 191, 36, 0.85)" : "#0f172a";
      ctx.beginPath();
      ctx.moveTo(x, baseY + 4);
      ctx.lineTo(x + 8, baseY + 4);
      ctx.lineTo(x - 2, baseY + 12);
      ctx.lineTo(x - 10, baseY + 12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Hydraulic Anchoring Struts
    ctx.fillStyle = "#334155";
    ctx.fillRect(cx - baseW / 2 - 8, baseY + 8, 8, baseH - 8);
    ctx.fillRect(cx + baseW / 2, baseY + 8, 8, baseH - 8);

    // 2. HOLOGRAPHIC SMART GYRO ARC HUD
    const hudRadius = 70;
    ctx.save();
    ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, hudRadius, -Math.PI * 0.9, -Math.PI * 0.1);
    ctx.stroke();
    ctx.setLineDash([]);

    // Degree Ticks
    for (let a = -Math.PI * 0.85; a <= -Math.PI * 0.15; a += Math.PI * 0.12) {
      const tx1 = cx + Math.cos(a) * (hudRadius - 4);
      const ty1 = cy + Math.sin(a) * (hudRadius - 4);
      const tx2 = cx + Math.cos(a) * (hudRadius + 4);
      const ty2 = cy + Math.sin(a) * (hudRadius + 4);
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.stroke();
    }

    // Smart Angle Readout
    ctx.font = "bold 9px 'JetBrains Mono', monospace";
    ctx.fillStyle = multColor;
    ctx.textAlign = "center";
    const deg = Math.round((angle * 180) / Math.PI);
    ctx.fillText(`[ SERVO TRK: ${deg}° ]`, cx, cy - hudRadius - 6);
    ctx.restore();

    // 3. RECOILING TWIN RAILGUN BARRELS
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle + Math.PI / 2); // points along -PI/2 by default

    const recoilY = this.recoil;
    const barrelL = 62;
    const barrelW = 8;
    const barrelGap = 18;

    const leftBarrelX = -barrelGap / 2 - barrelW;
    const rightBarrelX = barrelGap / 2;
    const barrelStartY = -recoilY - barrelL;

    // Armor Mantlet Mount
    ctx.fillStyle = "#090d16";
    ctx.beginPath();
    ctx.roundRect(-18, -recoilY - 18, 36, 26, 4);
    ctx.fill();

    const barrelGrad = ctx.createLinearGradient(-15, 0, 15, 0);
    barrelGrad.addColorStop(0, "#1e293b");
    barrelGrad.addColorStop(0.5, "#475569");
    barrelGrad.addColorStop(1, "#1e293b");

    // Draw Left & Right Barrels
    [leftBarrelX, rightBarrelX].forEach(bx => {
      ctx.fillStyle = barrelGrad;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, barrelStartY, barrelW, barrelL, 2);
      ctx.fill();
      ctx.stroke();

      // Serrated Muzzle Brake at tip
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(bx - 1.5, barrelStartY - 4, barrelW + 3, 5);
      ctx.strokeStyle = multColor;
      ctx.strokeRect(bx - 1.5, barrelStartY - 4, barrelW + 3, 5);

      // Heat Vents glowing with thermal heat
      if (this.heat > 0.08) {
        ctx.fillStyle = `rgba(255, 68, 0, ${this.heat * 0.85})`;
        ctx.shadowColor = "#ff4400";
        ctx.shadowBlur = 8;
        for (let vy = barrelStartY + 14; vy < barrelStartY + 44; vy += 9) {
          ctx.fillRect(bx + 1.5, vy, barrelW - 3, 3);
        }
        ctx.shadowBlur = 0;
      }
    });

    // Central Plasma Acceleration Rail
    const tubeGrad = ctx.createLinearGradient(0, barrelStartY, 0, 0);
    tubeGrad.addColorStop(0, multColor);
    tubeGrad.addColorStop(1, "#ffffff");
    ctx.strokeStyle = tubeGrad;
    ctx.lineWidth = 3;
    ctx.shadowColor = multColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, barrelStartY + 4);
    ctx.lineTo(0, -recoilY - 10);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3 Electromagnetic Acceleration Coils
    const coilYs = [barrelStartY + 12, barrelStartY + 28, barrelStartY + 46];
    coilYs.forEach((cyCoil) => {
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = multColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = multColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-barrelGap / 2 - barrelW - 3, cyCoil, barrelGap + barrelW * 2 + 6, 7, 3);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Muzzle Flash Flare
    if (this.muzzleFlash > 0.08) {
      [leftBarrelX + barrelW / 2, rightBarrelX + barrelW / 2].forEach(fx => {
        const fy = barrelStartY - 4;
        const fgrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, 26);
        fgrad.addColorStop(0, "#ffffff");
        fgrad.addColorStop(0.3, multColor);
        fgrad.addColorStop(1, "transparent");
        ctx.fillStyle = fgrad;
        ctx.beginPath();
        ctx.arc(fx, fy, 26, 0, Math.PI * 2);
        ctx.fill();

        // Cross Starburst lines
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx - 22, fy); ctx.lineTo(fx + 22, fy);
        ctx.moveTo(fx, fy - 22); ctx.lineTo(fx, fy + 22);
        ctx.stroke();
      });
    }

    ctx.restore();

    // 4. ROTATING MAGNETIC CONFINEMENT RINGS
    ctx.save();
    // Outer slotted ring
    ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 26, this.reactorSpin, this.reactorSpin + Math.PI * 1.5);
    ctx.stroke();

    // Inner counter-rotating ring
    ctx.strokeStyle = multColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, -this.reactorSpin * 0.85, -this.reactorSpin * 0.85 + Math.PI * 1.3);
    ctx.stroke();
    ctx.restore();

    // 5. PULSING FUSION REACTOR CORE & CRACKLING ARCS
    ctx.save();
    const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 18);
    coreGrad.addColorStop(0, "#ffffff");
    coreGrad.addColorStop(0.4, multColor);
    coreGrad.addColorStop(1, "transparent");
    ctx.fillStyle = coreGrad;
    ctx.shadowColor = multColor;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Crackling Lightning Arcs on Core
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.4;
    this.lightningArcs.forEach(arc => {
      ctx.beginPath();
      ctx.moveTo(arc.x, arc.y);
      const mx = (arc.x + arc.tx) / 2 + (Math.random() - 0.5) * 8;
      const my = (arc.y + arc.ty) / 2 + (Math.random() - 0.5) * 8;
      ctx.lineTo(mx, my);
      ctx.lineTo(arc.tx, arc.ty);
      ctx.stroke();
    });
    ctx.restore();

    // 6. BARREL STEAM & SMOKE PARTICLES
    ctx.save();
    this.barrelSmoke.forEach(sm => {
      ctx.fillStyle = `rgba(148, 163, 184, ${Math.max(0, sm.alpha * 0.45)})`;
      ctx.beginPath();
      ctx.arc(sm.x, sm.y, sm.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    ctx.restore();
  }

  // Bottom Turret & Locked-On Tracker Bar
  drawBottomTurretAndLockHUD(ctx, w, h) {
    // 1. Render the Heavy Smart & Dangerous Railgun Cannon
    this.drawSmartDangerousTurret(ctx);

    // 2. Render the Bottom Lock-on Bar (Image 1 style)
    ctx.save();
    const barW = Math.min(480, w - 80);
    const barH = 34;
    const barX = (w - barW) / 2;
    const barY = h - 42;

    const lockedPal = (this.activeTarget && this.activeTarget.palette)
      ? this.activeTarget.palette
      : { primary: "#00f0ff", typedBg: "#10b981" };

    ctx.fillStyle = "rgba(10, 15, 26, 0.94)";
    ctx.strokeStyle = this.activeTarget ? lockedPal.primary : "rgba(0, 240, 255, 0.35)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    if (this.activeTarget) {
      ctx.fillStyle = lockedPal.primary;
      ctx.fillText("SMART LOCK:", barX + 16, barY + barH / 2);

      // Render letter boxes for locked word
      let lx = barX + 116;
      for (let i = 0; i < this.activeTarget.text.length; i++) {
        const char = this.activeTarget.text[i].toUpperCase();
        const isTyped = i < this.lockedLetterProgress;
        ctx.fillStyle = isTyped ? lockedPal.typedBg : "#64748b";
        ctx.fillText(`[ ${char} ]`, lx, barY + barH / 2);
        lx += 38;
      }
    } else {
      ctx.fillStyle = "#64748b";
      ctx.fillText("SMART SENTRY: SCANNING (TYPE ANY INCOMING WORD)", barX + 16, barY + barH / 2);
    }

    ctx.textAlign = "right";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px 'Inter', sans-serif";
    ctx.fillText("[Tab] Restart  [Esc] Pause", barX + barW - 14, barY + barH / 2);

    ctx.restore();
  }

  // Right-Side COMBAT LOG Panel (Directly Matching Image 1)
  drawCombatLogPanel(ctx, w, h) {
    ctx.save();
    const panelW = 280;
    const panelH = 340;
    const panelX = w - panelW - 18;
    const panelY = 56;

    // Panel Glass Backdrop
    ctx.fillStyle = "rgba(7, 13, 25, 0.88)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 10);
    ctx.fill();
    ctx.stroke();

    // Header: `⏣ COMBAT LOG`
    ctx.font = "bold 12px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#e2e8f0";
    ctx.textAlign = "left";
    ctx.fillText("⏣ COMBAT LOG", panelX + 16, panelY + 24);

    // DMG MULTIPLIER Block
    ctx.fillStyle = "#64748b";
    ctx.font = "10px 'Inter', sans-serif";
    ctx.fillText("DMG MULTIPLIER", panelX + 16, panelY + 52);

    ctx.font = "bold 20px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#00f0ff";
    ctx.fillText(`${this.multiplier.toFixed(1)}x`, panelX + 16, panelY + 76);

    // Electric icon next to multiplier
    ctx.font = "14px sans-serif";
    ctx.fillText("⚡", panelX + 70, panelY + 74);

    // Speed & Accuracy Sub-blocks
    const statBoxY = panelY + 95;
    // Speed
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(panelX + 16, statBoxY, 116, 44, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("SPEED", panelX + 24, statBoxY + 16);
    ctx.font = "bold 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`${this.currentWpm} WPM`, panelX + 24, statBoxY + 34);

    // Accuracy
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.beginPath();
    ctx.roundRect(panelX + 144, statBoxY, 120, 44, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("ACCURACY", panelX + 152, statBoxY + 16);
    ctx.font = "bold 14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#10b981";
    ctx.fillText(`${this.accuracy}%`, panelX + 152, statBoxY + 34);

    // LIVE COMBAT STREAM Section
    const streamY = statBoxY + 62;
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("LIVE COMBAT STREAM", panelX + 16, streamY);

    // Divider line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(panelX + 16, streamY + 6);
    ctx.lineTo(panelX + panelW - 16, streamY + 6);
    ctx.stroke();

    // Stream lines
    let logLineY = streamY + 22;
    ctx.font = "11px 'JetBrains Mono', monospace";
    this.combatLogs.slice(0, 6).forEach(item => {
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, panelX + 16, logLineY);
      logLineY += 18;
    });

    ctx.restore();
  }

  // Top Cyber HUD Bar (Image 1 style: Score, Multiplier, Kills, Mode, Speed, Wallpaper, Elapsed)
  drawTopCyberHud(ctx, w) {
    ctx.save();
    const barH = 46;

    ctx.fillStyle = "rgba(10, 14, 24, 0.95)";
    ctx.fillRect(0, 0, w, barH);
    ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barH);
    ctx.lineTo(w, barH);
    ctx.stroke();

    ctx.textBaseline = "middle";
    let curX = 18;

    // 1. Score
    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("SCORE", curX, barH / 2 - 8);
    ctx.font = "bold 18px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#00f0ff";
    ctx.fillText(this.score.toString().padStart(4, "0"), curX, barH / 2 + 8);
    curX += 90;

    // 2. Multiplier
    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("MULTIPLIER", curX, barH / 2 - 8);
    ctx.font = "bold 15px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`x${this.multiplier.toFixed(1)}`, curX, barH / 2 + 8);
    curX += 80;

    // 3. Kills
    ctx.font = "9px 'Inter', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("KILLS", curX, barH / 2 - 8);
    ctx.font = "bold 15px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(this.kills.toString(), curX, barH / 2 + 8);
    curX += 70;

    // 4. Mode Badge: SURVIVAL
    ctx.fillStyle = "rgba(14, 165, 233, 0.2)";
    ctx.strokeStyle = "#0284c7";
    ctx.beginPath();
    ctx.roundRect(curX, barH / 2 - 12, 85, 24, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.textAlign = "center";
    ctx.fillText("SURVIVAL", curX + 42, barH / 2);
    curX += 95;

    // 5. Speed Badge
    ctx.fillStyle = "rgba(251, 191, 36, 0.15)";
    ctx.strokeStyle = "#fbbf24";
    ctx.beginPath();
    ctx.roundRect(curX, barH / 2 - 12, 90, 24, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`SPEED x${this.gameSpeedMultiplier.toFixed(1)}`, curX + 45, barH / 2);
    curX += 105;

    // 6. Right Side Items: Elapsed Timer & Wallpaper Changer
    ctx.textAlign = "right";
    const minutes = Math.floor(this.elapsedSeconds / 60);
    const seconds = this.elapsedSeconds % 60;
    const timeStr = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    ctx.font = "bold 15px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`⏱ ${timeStr}`, w - 18, barH / 2);

    // Wallpaper Switch Button (Image 1 style)
    const btnW = 100;
    const btnX = w - 18 - 90 - btnW;
    ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.roundRect(btnX, barH / 2 - 12, btnW, 24, 4);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.font = "bold 10px 'Inter', sans-serif";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("🎨 WALLPAPER", btnX + btnW / 2, barH / 2);

    // Save bounds for click listener
    this.wallpaperBtnBounds = { x: btnX, y: barH / 2 - 12, w: btnW, h: 24 };

    ctx.restore();
  }

  drawIdleOverlay(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = "rgba(3, 7, 18, 0.75)";
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = "center";
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 34px 'Inter', sans-serif";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 18;
    ctx.fillText("⚡ CYBER WORD DEFENSE", w / 2, h / 2 - 35);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "16px 'Inter', sans-serif";
    ctx.shadowBlur = 0;
    ctx.fillText("Type incoming letter capsules to lock laser targets before they breach the red line!", w / 2, h / 2 + 8);

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 16px 'Inter', sans-serif";
    ctx.fillText("👉 CLICK OR PRESS SPACEBAR TO ENGAGE 👈", w / 2, h / 2 + 55);
    ctx.restore();
  }

  drawPausedOverlay(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = "rgba(3, 7, 18, 0.8)";
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = "center";
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 36px 'Inter', sans-serif";
    ctx.fillText("PAUSED", w / 2, h / 2 - 15);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "15px 'Inter', sans-serif";
    ctx.fillText("Press [Escape] to Resume", w / 2, h / 2 + 30);
    ctx.restore();
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

window.CyberWordShooterGame = CyberWordShooterGame;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CyberWordShooterGame };
}
