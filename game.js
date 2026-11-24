// ========================================================
// TYPING ARCADE - MASTER CONTROLLER & GAME ENGINE
// Login Page, Callsign Setup, Hub Dashboard, TypeRush & Cyber Combat
// ========================================================

class GameEngine {
  constructor() {
    this.renderer = null;
    this.audio = window.soundEngine;
    this.sync = window.firebaseSync;

    // Current Active Screen: "screen-auth", "screen-name-setup", "screen-hub", "screen-car-game", "screen-bubble-game"
    this.currentScreen = "screen-auth";

    // Car Racing State
    this.currentLevel = 1;
    this.gameState = "idle"; // "idle", "countdown", "racing", "finished"
    this.mode = "career"; // "career", "quick", "duel"
    this.duelRole = null; // "host", "guest"

    // Car Typing State
    this.currentText = "";
    this.charIndex = 0;
    this.mistakes = 0;
    this.totalTyped = 0;
    this.startTime = null;
    this.finishTime = null;
    this.timerInterval = null;
    this.currentWpm = 0;

    // AI Racers simulation
    this.aiProgress = [0, 0, 0, 0];
    this.aiSpeeds = [0, 0, 0, 0];
    this.aiInterval = null;

    // Achievements Definition
    this.achievements = [
      { id: "ach_first_win", icon: "🏆", title: "First Victory", desc: "Complete any car racing level.", unlocked: false },
      { id: "ach_speed_50", icon: "⚡", title: "Hyper Sprinter", desc: "Reach 50+ WPM in car racing.", unlocked: false },
      { id: "ach_speed_80", icon: "🚀", title: "Supersonic Pilot", desc: "Reach 80+ WPM in car racing.", unlocked: false },
      { id: "ach_bubble_10", icon: "🎯", title: "Word Sniper", desc: "Destroy 10 cyber word pods.", unlocked: false },
      { id: "ach_bubble_score_1000", icon: "💎", title: "Matrix Defense", desc: "Score 1,000+ points in Cyber Combat.", unlocked: false },
      { id: "ach_multi_duel", icon: "⚔️", title: "Gladiator", desc: "Host or join a 1v1 online duel.", unlocked: false }
    ];

    // Callsign generator pool
    this.callsignPool = [
      "CyberPhantom", "ApexPredator", "NeonViper", "AeroStrike", "QuantumPulse",
      "ShadowRacer", "SolarFlare", "VortexGTR", "TitaniumEcho", "OmegaDrift",
      "StarlightX", "HyperWave", "ZeroGravity", "MachMaster", "VelocityGod"
    ];

    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.bindAuthAndScreenFlow();

    // Initialize 3D Race Renderer
    try {
      this.renderer = new RaceRenderer3D("race-canvas-container");
    } catch (e) {
      console.error("Error creating 3D renderer:", e);
    }

    // Initialize Cyber Word Combat
    try {
      window.cyberShooterGame = new CyberWordShooterGame("cyber-shooter-canvas-container");
    } catch (e) {
      console.error("Error creating Cyber Word Shooter:", e);
    }

    // Listen to Firebase Auth changes to route to proper screen
    this.sync.onAuthChanged((user, name) => {
      this.handleAuthRoute(user, name);
    });

    // Load initial level
    const savedLevel = parseInt(localStorage.getItem("nitro_current_level") || "1", 10);
    this.setLevel(savedLevel);
  }

  cacheDom() {
    this.dom = {
      // Screens
      masterNavbar: document.getElementById("master-navbar"),
      screenAuth: document.getElementById("screen-auth"),
      screenNameSetup: document.getElementById("screen-name-setup"),
      screenHub: document.getElementById("screen-hub"),
      screenCarGame: document.getElementById("screen-car-game"),
      screenBubbleGame: document.getElementById("screen-bubble-game"),

      // Master Nav items
      btnBackToHub: document.getElementById("btn-back-to-hub"),
      userChipName: document.getElementById("user-chip-name"),
      btnUserLogout: document.getElementById("btn-user-logout"),
      btnMute: document.getElementById("btn-mute"),

      // Nav Links
      navBtnPlay: document.getElementById("nav-btn-play"),
      navBtnStats: document.getElementById("nav-btn-stats"),
      navBtnAchievements: document.getElementById("nav-btn-achievements"),
      navBtnGarage: document.getElementById("nav-btn-garage"),
      navBtnLevels: document.getElementById("nav-btn-levels"),
      navBtnRecords: document.getElementById("nav-btn-records"),
      navBtnDuel: document.getElementById("nav-btn-duel"),

      // Hub Cards
      cardLaunchCar: document.getElementById("card-launch-car"),
      cardLaunchBubble: document.getElementById("card-launch-bubble"),
      hubBestWpm: document.getElementById("hub-best-wpm"),
      hubTotalRaces: document.getElementById("hub-total-races"),
      hubBestBubble: document.getElementById("hub-best-bubble"),
      hubBubbleAcc: document.getElementById("hub-bubble-acc"),

      // Car Game Top HUD
      hudWpm: document.getElementById("hud-wpm"),
      hudTimer: document.getElementById("hud-timer"),
      hudLevelBadge: document.getElementById("hud-level-badge"),
      hudAccuracy: document.getElementById("hud-accuracy"),
      btnReset: document.getElementById("btn-reset"),

      // 3D Canvas
      countdownOverlay: document.getElementById("countdown-overlay"),
      countdownText: document.getElementById("countdown-text"),

      // Cockpit Dock
      speedoNeedle: document.getElementById("speedo-needle"),
      speedoValue: document.getElementById("speedo-value"),
      textBox: document.getElementById("text-display-box"),
      hiddenInput: document.getElementById("hidden-input"),
      nitroGlow: document.getElementById("nitro-glow-indicator"),

      // Modals
      modalAchievements: document.getElementById("modal-achievements"),
      modalStats: document.getElementById("modal-stats"),
      modalGarage: document.getElementById("modal-garage"),
      modalLevels: document.getElementById("modal-levels"),
      modalLeaderboard: document.getElementById("modal-leaderboard"),
      modalMultiplayer: document.getElementById("modal-multiplayer"),
      modalVictory: document.getElementById("modal-victory"),
      modalBubbleGameOver: document.getElementById("modal-bubble-gameover"),

      // Victory Elements
      vicWpm: document.getElementById("vic-wpm"),
      vicAccuracy: document.getElementById("vic-accuracy"),
      vicTime: document.getElementById("vic-time"),
      vicStars: document.getElementById("vic-stars"),
      vicNextBtn: document.getElementById("vic-btn-next"),
      vicRetryBtn: document.getElementById("vic-btn-retry")
    };
  }

  // ==========================================
  // MULTI-SCREEN NAVIGATION (FROM USER SKETCH)
  // ==========================================

  showScreen(screenId) {
    this.currentScreen = screenId;

    const screens = [
      this.dom.screenAuth,
      this.dom.screenNameSetup,
      this.dom.screenHub,
      this.dom.screenCarGame,
      this.dom.screenBubbleGame
    ];

    screens.forEach(s => {
      if (s) {
        if (s.id === screenId) s.classList.remove("hidden");
        else s.classList.add("hidden");
      }
    });

    // Top Master Navbar visibility
    if (screenId === "screen-auth" || screenId === "screen-name-setup") {
      this.dom.masterNavbar.classList.add("hidden");
    } else {
      this.dom.masterNavbar.classList.remove("hidden");
    }

    // Specific screen entry hooks
    if (screenId === "screen-hub") {
      this.updateHubDashboardStats();
    } else if (screenId === "screen-car-game") {
      if (this.renderer) {
        this.renderer.onResize();
        this.renderer.updateCameraImmediate();
      }
      if (this.dom.hiddenInput) this.dom.hiddenInput.focus();
    } else if (screenId === "screen-bubble-game") {
      this.audio.stopEngine();
      if (window.cyberShooterGame) {
        window.cyberShooterGame.onResize();
      }
    }
  }

  handleAuthRoute(user, name) {
    if (this.dom.userChipName) {
      this.dom.userChipName.textContent = name || (user ? (user.email ? user.email.split('@')[0] : "Player") : "Guest");
    }

    if (!user) {
      // Check if user was already playing as guest
      const isGuest = localStorage.getItem("nitro_guest_mode") === "true";
      if (isGuest) {
        this.showScreen("screen-hub");
      } else {
        this.showScreen("screen-auth");
      }
      return;
    }

    // User is logged in
    const savedName = localStorage.getItem("nitro_driver_name");
    if (!savedName || savedName === "Cyber Racer") {
      this.showScreen("screen-name-setup");
    } else {
      // Route to hub if on auth/name screens
      if (this.currentScreen === "screen-auth" || this.currentScreen === "screen-name-setup") {
        this.showScreen("screen-hub");
      }
    }
  }

  bindAuthAndScreenFlow() {
    let authMode = "login";
    const tabLogin = document.getElementById("tab-auth-login");
    const tabRegister = document.getElementById("tab-auth-register");
    const groupRegisterName = document.getElementById("auth-group-register-name");
    const btnSubmit = document.getElementById("btn-auth-submit");
    const btnGuest = document.getElementById("btn-auth-guest");
    const feedbackBox = document.getElementById("auth-feedback-msg");

    // 1. Auth Tabs Switch
    if (tabLogin && tabRegister) {
      tabLogin.onclick = () => {
        authMode = "login";
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        if (groupRegisterName) groupRegisterName.style.display = "none";
        btnSubmit.textContent = "Sign In ➔";
        feedbackBox.classList.remove("visible");
      };

      tabRegister.onclick = () => {
        authMode = "register";
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        if (groupRegisterName) groupRegisterName.style.display = "flex";
        btnSubmit.textContent = "Create Account ➔";
        feedbackBox.classList.remove("visible");
      };
    }

    // 2. Auth Form Submit
    if (btnSubmit) {
      btnSubmit.onclick = async () => {
        const email = document.getElementById("input-auth-email").value;
        const password = document.getElementById("input-auth-password").value;
        const name = document.getElementById("input-auth-name") ? document.getElementById("input-auth-name").value : "";

        if (!email || !password) {
          feedbackBox.textContent = "Please enter your email and password.";
          feedbackBox.classList.add("visible");
          return;
        }

        btnSubmit.disabled = true;
        btnSubmit.textContent = "Verifying...";

        try {
          if (authMode === "register") {
            await this.sync.registerWithEmail(email, password, name);
          } else {
            await this.sync.loginWithEmail(email, password);
          }

          localStorage.removeItem("nitro_guest_mode");
          btnSubmit.disabled = false;
          btnSubmit.textContent = authMode === "register" ? "Create Account ➔" : "Sign In ➔";

          if (name) {
            await this.sync.setDriverName(name);
            this.showScreen("screen-hub");
          } else {
            this.showScreen("screen-name-setup");
          }
        } catch (err) {
          feedbackBox.textContent = err.message || "Authentication error.";
          feedbackBox.classList.add("visible");
          btnSubmit.disabled = false;
          btnSubmit.textContent = authMode === "register" ? "Create Account ➔" : "Sign In ➔";
        }
      };
    }

    // 3. Guest Login
    if (btnGuest) {
      btnGuest.onclick = async () => {
        localStorage.setItem("nitro_guest_mode", "true");
        await this.sync.loginAsGuest();
        this.showScreen("screen-hub");
      };
    }

    // 4. Enter Name Screen (Screen 2)
    const btnConfirmName = document.getElementById("btn-confirm-name");
    const inputCallsign = document.getElementById("input-setup-callsign");
    const btnRandomCallsign = document.getElementById("btn-random-callsign");

    if (btnRandomCallsign && inputCallsign) {
      btnRandomCallsign.onclick = () => {
        const rand = this.callsignPool[Math.floor(Math.random() * this.callsignPool.length)];
        inputCallsign.value = `${rand}_${Math.floor(10 + Math.random() * 89)}`;
      };
    }

    if (btnConfirmName && inputCallsign) {
      btnConfirmName.onclick = async () => {
        const name = (inputCallsign.value || "CyberRacer").trim();
        await this.sync.setDriverName(name);
        this.showScreen("screen-hub");
      };
    }

    // 5. Hub Game Cards (Screen 3)
    if (this.dom.cardLaunchCar) {
      this.dom.cardLaunchCar.onclick = () => this.showScreen("screen-car-game");
    }
    if (this.dom.cardLaunchBubble) {
      this.dom.cardLaunchBubble.onclick = () => this.showScreen("screen-bubble-game");
    }

    // 6. Master Navbar Actions
    if (this.dom.btnBackToHub) {
      this.dom.btnBackToHub.onclick = () => {
        this.closeAllModals();
        this.showScreen("screen-hub");
      };
    }

    if (this.dom.btnUserLogout) {
      this.dom.btnUserLogout.onclick = async () => {
        if (confirm("Log out of your typing account?")) {
          localStorage.removeItem("nitro_guest_mode");
          await this.sync.logout();
          this.showScreen("screen-auth");
        }
      };
    }

    // Canvas click listeners for wallpaper cycling in Cyber Shooter
    const bubbleContainer = document.getElementById("cyber-shooter-canvas-container");
    if (bubbleContainer) {
      bubbleContainer.addEventListener("click", (e) => {
        const shooter = window.cyberShooterGame;
        if (shooter && shooter.wallpaperBtnBounds) {
          const rect = bubbleContainer.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;
          const b = shooter.wallpaperBtnBounds;
          if (clickX >= b.x && clickX <= b.x + b.w && clickY >= b.y && clickY <= b.y + b.h) {
            shooter.cycleWallpaper();
          }
        }
      });
    }

    // Restart button in Cyber Word Combat Game Over
    const btnBubblePlayAgain = document.getElementById("btn-bubble-play-again");
    if (btnBubblePlayAgain) {
      btnBubblePlayAgain.onclick = () => {
        this.closeAllModals();
        if (window.cyberShooterGame) window.cyberShooterGame.startGame();
      };
    }
  }

  updateHubDashboardStats() {
    const bestWpm = localStorage.getItem("nitro_highest_wpm") || "0";
    const totalRaces = localStorage.getItem("nitro_total_races") || "0";
    const bestBubble = localStorage.getItem("aqua_bubble_high_score") || "0";

    if (this.dom.hubBestWpm) this.dom.hubBestWpm.textContent = `${bestWpm} WPM`;
    if (this.dom.hubTotalRaces) this.dom.hubTotalRaces.textContent = totalRaces;
    if (this.dom.hubBestBubble) this.dom.hubBestBubble.textContent = bestBubble;
  }

  // ==========================================
  // CAR RACING EVENTS & ENGINE
  // ==========================================

  bindEvents() {
    // Hidden Input for mobile & keyboard capture
    if (this.dom.textBox) {
      this.dom.textBox.addEventListener("click", () => {
        if (this.dom.hiddenInput) this.dom.hiddenInput.focus();
      });
    }

    if (this.dom.hiddenInput) {
      this.dom.hiddenInput.addEventListener("input", (e) => {
        if (this.currentScreen !== "screen-car-game") return;

        if (this.gameState === "idle") {
          this.startCountdown();
          return;
        }
        if (this.gameState !== "racing") return;

        const val = this.dom.hiddenInput.value;
        if (val.length > 0) {
          const char = val[val.length - 1];
          this.handleCharacterInput(char);
          this.dom.hiddenInput.value = "";
        }
      });
    }

    window.addEventListener("keydown", (e) => {
      if (this.currentScreen !== "screen-car-game") return;
      if (e.target && e.target.tagName === "INPUT" && !e.target.classList.contains("hidden-key-input")) {
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        this.resetRace();
        return;
      }

      if (e.key === "Escape") {
        this.closeAllModals();
        return;
      }

      if (this.gameState === "idle") {
        if (e.key.length === 1 || e.key === "Enter") {
          this.startCountdown();
        }
        return;
      }

      if (this.gameState !== "racing") return;

      if (e.key.length === 1) {
        e.preventDefault();
        this.handleCharacterInput(e.key);
      }
    });

    // Top bar menu navigation
    if (this.dom.navBtnPlay) {
      this.dom.navBtnPlay.onclick = () => this.showScreen("screen-car-game");
    }
    if (this.dom.navBtnStats) {
      this.dom.navBtnStats.onclick = () => this.openStatsModal();
    }
    if (this.dom.navBtnAchievements) {
      this.dom.navBtnAchievements.onclick = () => this.openAchievementsModal();
    }
    if (this.dom.navBtnGarage) {
      this.dom.navBtnGarage.onclick = () => this.openGarageModal();
    }
    if (this.dom.navBtnLevels) {
      this.dom.navBtnLevels.onclick = () => this.openLevelsModal();
    }
    if (this.dom.navBtnRecords) {
      this.dom.navBtnRecords.onclick = () => this.openLeaderboardModal();
    }
    if (this.dom.navBtnDuel) {
      this.dom.navBtnDuel.onclick = () => this.openMultiplayerModal();
    }

    if (this.dom.btnReset) {
      this.dom.btnReset.onclick = () => this.resetRace();
    }

    if (this.dom.btnMute) {
      this.dom.btnMute.onclick = () => {
        const isMuted = this.audio.toggleMute();
        this.dom.btnMute.textContent = isMuted ? "🔇" : "🔊";
      };
      if (this.audio.isMuted) this.dom.btnMute.textContent = "🔇";
    }

    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.onclick = () => this.closeAllModals();
    });

    if (this.dom.vicRetryBtn) {
      this.dom.vicRetryBtn.onclick = () => {
        this.closeAllModals();
        this.resetRace();
      };
    }
    if (this.dom.vicNextBtn) {
      this.dom.vicNextBtn.onclick = () => {
        this.closeAllModals();
        this.nextLevel();
      };
    }
  }

  // ==========================================
  // CAR RACE LEVEL & LOGIC
  // ==========================================

  async setLevel(levelNum) {
    this.currentLevel = Math.max(1, Math.min(100, parseInt(levelNum, 10) || 1));
    localStorage.setItem("nitro_current_level", this.currentLevel.toString());

    if (this.dom.hudLevelBadge) {
      this.dom.hudLevelBadge.textContent = `LVL ${this.currentLevel}`;
    }

    if (typeof fetchPythonRandomText === "function") {
      this.currentText = await fetchPythonRandomText(this.currentLevel);
    } else {
      this.currentText = getTextForLevel(this.currentLevel);
    }
    this.resetRace();
  }

  async resetRace() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.aiInterval) clearInterval(this.aiInterval);
    this.audio.stopEngine();

    this.gameState = "idle";
    this.charIndex = 0;
    this.mistakes = 0;
    this.totalTyped = 0;
    this.startTime = null;
    this.finishTime = null;
    this.currentWpm = 0;

    // Refresh dynamic random text from Python backend if available
    if (this.mode !== "duel" && typeof fetchPythonRandomText === "function") {
      this.currentText = await fetchPythonRandomText(this.currentLevel);
    }

    if (this.dom.hudWpm) this.dom.hudWpm.textContent = "0 WPM";
    if (this.dom.hudTimer) this.dom.hudTimer.textContent = "0:00.0";
    if (this.dom.hudAccuracy) this.dom.hudAccuracy.textContent = "100%";
    if (this.dom.countdownOverlay) this.dom.countdownOverlay.classList.add("hidden");

    this.updateSpeedometer(0);
    this.renderText();
    this.setup3DRace();

    if (this.dom.hiddenInput) {
      this.dom.hiddenInput.value = "";
      this.dom.hiddenInput.focus();
    }
  }

  setup3DRace() {
    if (!this.renderer) return;

    const playerCar = getPlayerCar();
    const driverName = this.sync.getDriverName();

    const rivals = AI_RACERS.map(ai => ({
      id: ai.name,
      name: ai.name,
      lane: ai.lane,
      baseColor: ai.baseColor,
      neonColor: ai.neonColor
    }));

    this.renderer.setupRace(playerCar, driverName, rivals);
  }

  startCountdown() {
    if (this.gameState !== "idle") return;
    this.gameState = "countdown";

    if (this.dom.countdownOverlay && this.dom.countdownText) {
      this.dom.countdownOverlay.classList.remove("hidden");
    }

    let count = 3;
    this.dom.countdownText.textContent = count;
    this.audio.playCountdown(count);

    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.dom.countdownText.textContent = count;
        this.audio.playCountdown(count);
      } else if (count === 0) {
        this.dom.countdownText.textContent = "GO!";
        this.audio.playCountdown(0);
      } else {
        clearInterval(countInterval);
        if (this.dom.countdownOverlay) {
          this.dom.countdownOverlay.classList.add("hidden");
        }
        this.beginRace();
      }
    }, 850);
  }

  beginRace() {
    this.gameState = "racing";
    this.startTime = Date.now();
    this.audio.startEngine();

    this.timerInterval = setInterval(() => this.updateTimer(), 100);
    this.startAiSimulation();
  }

  updateTimer() {
    if (!this.startTime) return;
    const elapsedMs = Date.now() - this.startTime;
    const totalSec = elapsedMs / 1000;
    const minutes = Math.floor(totalSec / 60);
    const seconds = Math.floor(totalSec % 60);
    const tenths = Math.floor((elapsedMs % 1000) / 100);

    const formatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}.${tenths}`;
    if (this.dom.hudTimer) {
      this.dom.hudTimer.textContent = formatted;
    }

    const speedRatio = Math.min(1.0, this.currentWpm / 120);
    this.audio.updateEngine(speedRatio);
  }

  renderText() {
    if (!this.dom.textBox) return;

    let html = "";
    for (let i = 0; i < this.currentText.length; i++) {
      const char = this.currentText[i];
      const displayChar = char === " " ? "&nbsp;" : char;

      if (i < this.charIndex) {
        html += `<span class="char done">${displayChar}</span>`;
      } else if (i === this.charIndex) {
        html += `<span class="char cursor">${displayChar}</span>`;
      } else {
        html += `<span class="char pending">${displayChar}</span>`;
      }
    }

    this.dom.textBox.innerHTML = html;
  }

  handleCharacterInput(char) {
    if (this.charIndex >= this.currentText.length) return;

    const expectedChar = this.currentText[this.charIndex];
    this.totalTyped++;

    if (char === expectedChar) {
      this.charIndex++;
      this.audio.playKeyClick(true);

      const elapsedMin = (Date.now() - this.startTime) / 60000;
      if (elapsedMin > 0.01) {
        this.currentWpm = Math.round((this.charIndex / 5) / elapsedMin);
      }

      const progressRatio = this.charIndex / this.currentText.length;

      if (this.dom.hudWpm) this.dom.hudWpm.textContent = `${this.currentWpm} WPM`;
      this.updateSpeedometer(this.currentWpm);

      if (this.renderer) {
        this.renderer.updateCarProgress("player", progressRatio, this.currentWpm);
      }

      if (this.dom.nitroGlow) {
        if (this.currentWpm > 70) {
          this.dom.nitroGlow.classList.add("active");
        } else {
          this.dom.nitroGlow.classList.remove("active");
        }
      }

      if (this.mode === "duel" && this.sync) {
        this.sync.broadcastProgress(this.duelRole, progressRatio, this.currentWpm, false);
      }

      if (this.charIndex >= this.currentText.length) {
        this.finishRace();
      }
    } else {
      this.mistakes++;
      this.audio.playKeyClick(false);

      const cursorEl = this.dom.textBox.querySelector(".char.cursor");
      if (cursorEl) {
        cursorEl.classList.add("error");
        setTimeout(() => cursorEl.classList.remove("error"), 150);
      }
    }

    const accuracy = this.totalTyped > 0
      ? Math.max(0, Math.round(((this.totalTyped - this.mistakes) / this.totalTyped) * 100))
      : 100;
    if (this.dom.hudAccuracy) {
      this.dom.hudAccuracy.textContent = `${accuracy}%`;
    }

    this.renderText();
  }

  updateSpeedometer(wpm) {
    const clampedWpm = Math.max(0, Math.min(160, wpm));
    const angle = -120 + (clampedWpm / 160) * 240;

    if (this.dom.speedoNeedle) {
      this.dom.speedoNeedle.style.transform = `rotate(${angle}deg)`;
    }
    if (this.dom.speedoValue) {
      this.dom.speedoValue.textContent = clampedWpm;
    }
  }

  startAiSimulation() {
    const levelConfig = getLevelConfig(this.currentLevel);
    const targetWpm = levelConfig.targetWpm;

    this.aiSpeeds = AI_RACERS.map(ai => targetWpm * ai.speedFactor);
    this.aiProgress = [0, 0, 0, 0];

    this.aiInterval = setInterval(() => {
      if (this.gameState !== "racing") return;

      const elapsedSec = (Date.now() - this.startTime) / 1000;
      const textLen = this.currentText.length;

      AI_RACERS.forEach((ai, idx) => {
        const charsPerSec = (this.aiSpeeds[idx] * 5) / 60;
        const simulatedChars = elapsedSec * charsPerSec;
        const progress = Math.min(1.0, simulatedChars / textLen);
        this.aiProgress[idx] = progress;

        if (this.renderer) {
          this.renderer.updateCarProgress(ai.name, progress, Math.round(this.aiSpeeds[idx]));
        }
      });
    }, 200);
  }

  finishRace() {
    this.gameState = "finished";
    this.finishTime = Date.now();
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.aiInterval) clearInterval(this.aiInterval);

    this.audio.stopEngine();
    this.audio.playVictory();

    const elapsedMs = this.finishTime - this.startTime;
    const elapsedSec = (elapsedMs / 1000).toFixed(1);
    const elapsedMin = elapsedMs / 60000;
    const finalWpm = Math.round((this.currentText.length / 5) / elapsedMin);
    const finalAccuracy = this.totalTyped > 0
      ? Math.max(0, Math.round(((this.totalTyped - this.mistakes) / this.totalTyped) * 100))
      : 100;

    const levelConfig = getLevelConfig(this.currentLevel);
    let stars = 1;
    if (finalWpm >= levelConfig.starCriteria.threeStars && finalAccuracy >= 95) {
      stars = 3;
    } else if (finalWpm >= levelConfig.starCriteria.twoStars && finalAccuracy >= 90) {
      stars = 2;
    }

    const savedStarsKey = `nitro_level_${this.currentLevel}_stars`;
    const prevStars = parseInt(localStorage.getItem(savedStarsKey) || "0", 10);
    if (stars > prevStars) {
      localStorage.setItem(savedStarsKey, stars.toString());
    }

    this.sync.saveRaceRecord({
      wpm: finalWpm,
      accuracy: finalAccuracy,
      timeSeconds: elapsedSec,
      level: this.currentLevel,
      carId: getSavedPlayerCarId()
    });

    if (this.mode === "duel" && this.sync) {
      this.sync.broadcastProgress(this.duelRole, 1.0, finalWpm, true);
    }

    this.showVictoryModal(finalWpm, finalAccuracy, elapsedSec, stars);
  }

  showVictoryModal(wpm, accuracy, timeSec, stars) {
    if (this.dom.vicWpm) this.dom.vicWpm.textContent = `${wpm} WPM`;
    if (this.dom.vicAccuracy) this.dom.vicAccuracy.textContent = `${accuracy}%`;
    if (this.dom.vicTime) this.dom.vicTime.textContent = `${timeSec}s`;

    if (this.dom.vicStars) {
      let starsHtml = "";
      for (let i = 1; i <= 3; i++) {
        starsHtml += `<span class="star ${i <= stars ? 'active' : ''}">★</span>`;
      }
      this.dom.vicStars.innerHTML = starsHtml;
    }

    if (this.dom.modalVictory) {
      this.dom.modalVictory.classList.remove("hidden");
    }
  }

  nextLevel() {
    this.setLevel(this.currentLevel + 1);
  }

  closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.add("hidden"));
    if (this.currentScreen === "screen-car-game" && this.dom.hiddenInput) {
      this.dom.hiddenInput.focus();
    }
  }

  // ==========================================
  // MODALS & EXTRA FEATURES
  // ==========================================

  // 1. Stats Modal
  openStatsModal() {
    this.closeAllModals();
    if (this.dom.modalStats) {
      const bestWpm = localStorage.getItem("nitro_highest_wpm") || "0";
      const totalRaces = localStorage.getItem("nitro_total_races") || "0";
      const bestBubble = localStorage.getItem("aqua_bubble_high_score") || "0";

      document.getElementById("stats-best-wpm").textContent = `${bestWpm} WPM`;
      document.getElementById("stats-total-races").textContent = totalRaces;
      document.getElementById("stats-bubble-score").textContent = bestBubble;

      this.dom.modalStats.classList.remove("hidden");
    }
  }

  // 2. Achievements Modal
  openAchievementsModal() {
    this.closeAllModals();
    if (this.dom.modalAchievements) {
      const bestWpm = parseInt(localStorage.getItem("nitro_highest_wpm") || "0", 10);
      const totalRaces = parseInt(localStorage.getItem("nitro_total_races") || "0", 10);
      const bubbleScore = parseInt(localStorage.getItem("aqua_bubble_high_score") || "0", 10);

      const grid = document.getElementById("achievements-grid");
      if (grid) {
        grid.innerHTML = "";
        this.achievements.forEach(ach => {
          let isUnlocked = false;
          if (ach.id === "ach_first_win" && totalRaces > 0) isUnlocked = true;
          if (ach.id === "ach_speed_50" && bestWpm >= 50) isUnlocked = true;
          if (ach.id === "ach_speed_80" && bestWpm >= 80) isUnlocked = true;
          if (ach.id === "ach_bubble_score_1000" && bubbleScore >= 1000) isUnlocked = true;
          if (ach.id === "ach_bubble_10" && bubbleScore > 500) isUnlocked = true;

          const card = document.createElement("div");
          card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
          card.innerHTML = `
            <div class="achieve-icon">${ach.icon}</div>
            <div class="achieve-info">
              <h4>${ach.title} ${isUnlocked ? '✓' : '🔒'}</h4>
              <p>${ach.desc}</p>
            </div>
          `;
          grid.appendChild(card);
        });
      }

      this.dom.modalAchievements.classList.remove("hidden");
    }
  }

  // 3. Garage Modal
  openGarageModal() {
    this.closeAllModals();
    if (this.dom.modalGarage) {
      this.dom.modalGarage.classList.remove("hidden");
      this.renderGarageShowroom();
    }
  }

  renderGarageShowroom() {
    const listContainer = document.getElementById("garage-car-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";
    const activeCarId = getSavedPlayerCarId();

    FUTURISTIC_CARS.forEach(car => {
      const isSelected = car.id === activeCarId;
      const isUnlocked = this.currentLevel >= car.unlockedAtLevel;

      const card = document.createElement("div");
      card.className = `car-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
      card.innerHTML = `
        <div class="car-card-header">
          <span class="car-name">${car.name}</span>
          <span class="car-badge" style="background:${car.neonColor}; color:#000;">${car.tier}</span>
        </div>
        <div class="car-stats">
          <div class="stat-row"><span>Speed</span><div class="bar"><div style="width:${car.stats.speed}%"></div></div></div>
          <div class="stat-row"><span>Accel</span><div class="bar"><div style="width:${car.stats.accel}%"></div></div></div>
          <div class="stat-row"><span>Nitro</span><div class="bar"><div style="width:${car.stats.nitro}%"></div></div></div>
        </div>
        <button class="btn-select-car" ${!isUnlocked ? 'disabled' : ''}>
          ${isSelected ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : `UNLOCK AT LVL ${car.unlockedAtLevel}`}
        </button>
      `;

      card.querySelector(".btn-select-car").addEventListener("click", () => {
        if (isUnlocked) {
          savePlayerCarId(car.id);
          this.renderGarageShowroom();
          this.setup3DRace();
          if (window.garageShowroom) {
            window.garageShowroom.displayCar(car);
          }
        }
      });

      card.addEventListener("click", () => {
        if (window.garageShowroom) {
          window.garageShowroom.displayCar(car);
        }
      });

      listContainer.appendChild(card);
    });

    if (!window.garageShowroom) {
      window.garageShowroom = new GarageShowroom3D("garage-3d-canvas");
    }
    window.garageShowroom.displayCar(getPlayerCar());
  }

  // 4. 100 Levels Modal
  openLevelsModal() {
    this.closeAllModals();
    if (this.dom.modalLevels) {
      this.dom.modalLevels.classList.remove("hidden");
      this.renderLevelsGrid();
    }
  }

  renderLevelsGrid() {
    const grid = document.getElementById("levels-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const highestUnlocked = parseInt(localStorage.getItem("nitro_highest_unlocked_lvl") || "1", 10);

    GAME_LEVELS.forEach(lvl => {
      const isCurrent = lvl.level === this.currentLevel;
      const isUnlocked = lvl.level <= Math.max(highestUnlocked, this.currentLevel);
      const savedStars = parseInt(localStorage.getItem(`nitro_level_${lvl.level}_stars`) || "0", 10);

      const btn = document.createElement("button");
      btn.className = `level-node ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}`;
      btn.innerHTML = `
        <span class="lvl-num">${lvl.level}</span>
        <div class="lvl-stars">${savedStars > 0 ? '★'.repeat(savedStars) : '☆☆☆'}</div>
        <span class="lvl-target">${lvl.targetWpm} WPM</span>
      `;

      if (isUnlocked) {
        btn.addEventListener("click", () => {
          this.closeAllModals();
          this.showScreen("screen-car-game");
          this.setLevel(lvl.level);
        });
      }

      grid.appendChild(btn);
    });
  }

  // 5. Dual Leaderboards Modal
  async openLeaderboardModal() {
    this.closeAllModals();
    if (this.dom.modalLeaderboard) {
      this.dom.modalLeaderboard.classList.remove("hidden");

      const tabCar = document.getElementById("lead-tab-car");
      const tabBubble = document.getElementById("lead-tab-bubble");

      if (tabCar && tabBubble) {
        tabCar.onclick = () => {
          tabCar.classList.add("active");
          tabBubble.classList.remove("active");
          this.renderCarLeaderboard();
        };

        tabBubble.onclick = () => {
          tabBubble.classList.add("active");
          tabCar.classList.remove("active");
          this.renderBubbleLeaderboard();
        };
      }

      if (this.currentScreen === "screen-bubble-game" && tabBubble) {
        tabBubble.click();
      } else {
        this.renderCarLeaderboard();
      }
    }
  }

  async renderCarLeaderboard() {
    const list = document.getElementById("leaderboard-list");
    if (!list) return;
    list.innerHTML = "<div style='color:#94a3b8; text-align:center; padding:15px;'>Loading Speedway Records...</div>";

    const records = await this.sync.getLeaderboard(15);
    list.innerHTML = "";

    records.forEach((rec, idx) => {
      const row = document.createElement("div");
      row.className = `lead-row ${idx < 3 ? 'podium-' + (idx + 1) : ''}`;
      row.innerHTML = `
        <span class="lead-rank">#${idx + 1}</span>
        <span class="lead-name">${rec.driverName || 'Racer'}</span>
        <span class="lead-wpm">${rec.wpm || 0} WPM</span>
        <span class="lead-acc">${rec.accuracy || 100}%</span>
        <span class="lead-level">LVL ${rec.level || 1}</span>
      `;
      list.appendChild(row);
    });
  }

  async renderBubbleLeaderboard() {
    const list = document.getElementById("leaderboard-list");
    if (!list) return;
    list.innerHTML = "<div style='color:#94a3b8; text-align:center; padding:15px;'>Loading Cyber Combat Records...</div>";

    const records = await this.sync.getBubbleLeaderboard(15);
    list.innerHTML = "";

    records.forEach((rec, idx) => {
      const row = document.createElement("div");
      row.className = `lead-row ${idx < 3 ? 'podium-' + (idx + 1) : ''}`;
      row.innerHTML = `
        <span class="lead-rank">#${idx + 1}</span>
        <span class="lead-name">${rec.playerName || 'Pilot'}</span>
        <span class="lead-wpm" style="color:#00f0ff;">${rec.score || 0} PTS</span>
        <span class="lead-acc" style="color:#38bdf8;">Wave ${rec.level || 1}</span>
        <span class="lead-level">${rec.poppedCount || 0} ⚡</span>
      `;
      list.appendChild(row);
    });
  }

  // 6. 1v1 Online Duel Modal
  openMultiplayerModal() {
    this.closeAllModals();
    if (this.dom.modalMultiplayer) {
      this.dom.modalMultiplayer.classList.remove("hidden");
      this.bindMultiplayerUi();
    }
  }

  bindMultiplayerUi() {
    const btnCreate = document.getElementById("mp-btn-create");
    const btnJoin = document.getElementById("mp-btn-join");
    const inputCode = document.getElementById("mp-room-input");
    const roomInfo = document.getElementById("mp-room-info");

    if (btnCreate) {
      btnCreate.onclick = async () => {
        btnCreate.disabled = true;
        btnCreate.textContent = "Creating Room...";
        const raceText = getRandomText();
        const code = await this.sync.createRoom(raceText);
        btnCreate.textContent = `Room Code: ${code}`;
        if (roomInfo) {
          roomInfo.innerHTML = `Waiting for rival to join code: <b style="color:#00f0ff; font-size:1.4rem;">${code}</b>`;
        }

        this.sync.onRoomUpdate = (roomData) => {
          if (roomData.status === "racing") {
            this.mode = "duel";
            this.duelRole = "host";
            this.currentText = roomData.raceText;
            this.showScreen("screen-car-game");
            this.closeAllModals();
            this.resetRace();
            this.startCountdown();
          }
        };
      };
    }

    if (btnJoin && inputCode) {
      btnJoin.onclick = async () => {
        const code = inputCode.value.trim().toUpperCase();
        if (!code) return;

        btnJoin.disabled = true;
        btnJoin.textContent = "Joining...";

        try {
          const res = await this.sync.joinRoom(code, (roomData) => {
            if (this.renderer && roomData) {
              const rivalProgress = this.duelRole === "host" ? roomData.guestProgress : roomData.hostProgress;
              const rivalWpm = this.duelRole === "host" ? roomData.guestWpm : roomData.hostWpm;
              this.renderer.updateCarProgress("rival_duel", rivalProgress || 0, rivalWpm || 0);
            }
          });

          if (res.success) {
            this.mode = "duel";
            this.duelRole = "guest";
            this.currentText = res.data.raceText;
            this.showScreen("screen-car-game");
            this.closeAllModals();
            this.resetRace();
            this.startCountdown();
          }
        } catch (err) {
          alert("Could not join room: " + err.message);
          btnJoin.disabled = false;
          btnJoin.textContent = "Join Match";
        }
      };
    }
  }
}

// Global bootstrap
window.addEventListener("DOMContentLoaded", () => {
  window.gameEngine = new GameEngine();
  window.gameEngine.init();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameEngine };
}
