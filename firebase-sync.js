// ========================================================
// NITRO TYPER 3D & AQUA BUBBLE SHOOTER - FIREBASE ENGINE
// Email Authentication, Driver Profile, Cloud Leaderboards & 1v1 Sync
// ========================================================

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAgRqTHDye4LH-E8---YjB2BSll8Ks6V2U",
  authDomain: "typing-game-57606.firebaseapp.com",
  projectId: "typing-game-57606",
  storageBucket: "typing-game-57606.firebasestorage.app",
  messagingSenderId: "726566556480",
  appId: "1:726566556480:web:3d0dfecb490b5f4af760a5",
  measurementId: "G-FPGF9ZSXWP"
};

class FirebaseSyncManager {
  constructor() {
    this.app = null;
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.isConnected = false;
    this.activeRoom = null;
    this.roomUnsubscribe = null;
    this.broadcastChannel = null;
    this.onRoomUpdate = null;
    this.authListeners = [];

    this.init();
  }

  getConfig() {
    try {
      const stored = localStorage.getItem("nitro_firebase_custom_config");
      if (stored) return JSON.parse(stored);
    } catch (e) { }
    return DEFAULT_FIREBASE_CONFIG;
  }

  init() {
    const config = this.getConfig();

    if (typeof firebase === "undefined") {
      console.warn("Firebase SDK script not loaded. Operating in offline/localStorage mode.");
      this.initLocalBroadcast();
      return;
    }

    try {
      if (!firebase.apps || firebase.apps.length === 0) {
        this.app = firebase.initializeApp(config);
      } else {
        this.app = firebase.apps[0];
      }

      this.db = firebase.firestore();
      this.auth = firebase.auth();

      // Listen for authentication changes
      this.auth.onAuthStateChanged(async (user) => {
        this.currentUser = user;
        this.isConnected = !!user;

        if (user) {
          console.log("Firebase Auth active. UID:", user.uid, "Email:", user.email || "guest");

          // Check for saved Firestore driver/player profile
          let cloudName = user.displayName;
          if (this.db) {
            try {
              const doc = await this.db.collection("users").doc(user.uid).get();
              if (doc.exists) {
                const data = doc.data();
                if (data.displayName) cloudName = data.displayName;
              }
            } catch (err) {
              console.warn("User profile fetch notice:", err.message);
            }
          }

          if (cloudName) {
            localStorage.setItem("nitro_driver_name", cloudName);
          }

          this.notifyAuthListeners(user, cloudName);
        } else {
          this.notifyAuthListeners(null, null);
        }
      });

    } catch (err) {
      console.warn("Firebase init notice (running in offline-ready mode):", err.message);
      this.isConnected = false;
    }

    this.initLocalBroadcast();
  }

  onAuthChanged(cb) {
    if (typeof cb === "function") {
      this.authListeners.push(cb);
      if (this.currentUser) {
        cb(this.currentUser, this.getDriverName());
      }
    }
  }

  notifyAuthListeners(user, name) {
    const currentName = name || this.getDriverName();
    this.authListeners.forEach(cb => {
      try { cb(user, currentName); } catch (e) { console.error("Auth listener error:", e); }
    });
  }

  initLocalBroadcast() {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        this.broadcastChannel = new BroadcastChannel("nitro_typer_local_bus");
        this.broadcastChannel.onmessage = (event) => {
          if (this.onRoomUpdate && event.data && event.data.roomId === this.activeRoom) {
            this.onRoomUpdate(event.data);
          }
        };
      }
    } catch (e) { }
  }

  // ==========================================
  // EMAIL AUTHENTICATION METHODS
  // ==========================================

  async registerWithEmail(email, password, chosenName) {
    if (!this.auth) throw new Error("Firebase Auth is not connected.");
    const cleanEmail = email.trim();
    const cleanName = (chosenName || "Cyber Racer").trim().substring(0, 18);

    const cred = await this.auth.createUserWithEmailAndPassword(cleanEmail, password);
    const user = cred.user;

    // Update Auth profile
    try {
      await user.updateProfile({ displayName: cleanName });
    } catch (e) { }

    // Store in Firestore
    if (this.db) {
      await this.db.collection("users").doc(user.uid).set({
        email: cleanEmail,
        displayName: cleanName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        bestWpm: 0,
        bubbleHighScore: 0,
        totalRaces: 0
      }, { merge: true });
    }

    this.setDriverName(cleanName);
    return user;
  }

  async loginWithEmail(email, password) {
    if (!this.auth) throw new Error("Firebase Auth is not connected.");
    const cred = await this.auth.signInWithEmailAndPassword(email.trim(), password);
    return cred.user;
  }

  async loginAsGuest() {
    if (!this.auth) return null;
    try {
      const cred = await this.auth.signInAnonymously();
      return cred.user;
    } catch (e) {
      console.warn("Guest sign-in notice:", e.message);
      return null;
    }
  }

  async logout() {
    if (this.auth) {
      await this.auth.signOut();
    }
  }

  // ==========================================
  // DRIVER & PLAYER PROFILE
  // ==========================================

  getDriverName() {
    try {
      return localStorage.getItem("nitro_driver_name") || "Cyber Racer";
    } catch (e) {
      return "Cyber Racer";
    }
  }

  async setDriverName(name) {
    const cleanName = (name || "Cyber Racer").trim().substring(0, 18);
    try {
      localStorage.setItem("nitro_driver_name", cleanName);
    } catch (e) { }

    if (this.currentUser) {
      try {
        await this.currentUser.updateProfile({ displayName: cleanName });
      } catch (e) { }

      if (this.db) {
        try {
          await this.db.collection("users").doc(this.currentUser.uid).set({
            displayName: cleanName,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          await this.db.collection("drivers").doc(this.currentUser.uid).set({
            driverName: cleanName,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.warn("Firestore profile sync notice:", e.message);
        }
      }
    }

    this.notifyAuthListeners(this.currentUser, cleanName);
    return cleanName;
  }

  // ==========================================
  // SPEED RECORDS (CAR RACE LEADERBOARD)
  // ==========================================

  async saveRaceRecord(record) {
    const safeRecord = {
      driverName: record.driverName || this.getDriverName(),
      wpm: Math.round(record.wpm || 0),
      accuracy: Math.round(record.accuracy || 100),
      timeSeconds: parseFloat(record.timeSeconds || 0).toFixed(1),
      level: parseInt(record.level || 1, 10),
      carId: record.carId || "car_phantom",
      timestamp: Date.now()
    };

    // 1. LocalStorage Cache
    try {
      const highest = parseInt(localStorage.getItem("nitro_highest_wpm") || "0", 10);
      if (safeRecord.wpm > highest) {
        localStorage.setItem("nitro_highest_wpm", safeRecord.wpm.toString());
      }
      const totalRaces = parseInt(localStorage.getItem("nitro_total_races") || "0", 10) + 1;
      localStorage.setItem("nitro_total_races", totalRaces.toString());

      let localRecords = JSON.parse(localStorage.getItem("nitro_records_cache") || "[]");
      localRecords.push(safeRecord);
      localRecords.sort((a, b) => b.wpm - a.wpm);
      localStorage.setItem("nitro_records_cache", JSON.stringify(localRecords.slice(0, 50)));
    } catch (e) { }

    // 2. Cloud Firestore
    if (this.db) {
      try {
        await this.db.collection("speed_records").add({
          ...safeRecord,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid: this.currentUser ? this.currentUser.uid : "guest"
        });

        if (this.currentUser) {
          await this.db.collection("users").doc(this.currentUser.uid).set({
            bestWpm: Math.max(safeRecord.wpm, parseInt(localStorage.getItem("nitro_highest_wpm") || "0", 10)),
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      } catch (err) {
        console.warn("Firestore record save notice:", err.message);
      }
    }

    return safeRecord;
  }

  async getLeaderboard(limitCount = 15) {
    let cloudRecords = [];
    if (this.db) {
      try {
        const snap = await this.db.collection("speed_records")
          .orderBy("wpm", "desc")
          .limit(limitCount)
          .get();

        snap.forEach(doc => {
          cloudRecords.push({ id: doc.id, ...doc.data() });
        });
      } catch (e) {
        console.warn("Firestore leaderboard fetch notice:", e.message);
      }
    }

    let localRecords = [];
    try {
      localRecords = JSON.parse(localStorage.getItem("nitro_records_cache") || "[]");
    } catch (e) { }

    const combined = [...cloudRecords, ...localRecords];
    combined.sort((a, b) => (b.wpm || 0) - (a.wpm || 0));

    if (combined.length === 0) {
      return [
        { driverName: "Snapdragon", wpm: 98, accuracy: 99, level: 75, carId: "car_italia" },
        { driverName: "Apex Valkyrie", wpm: 88, accuracy: 97, level: 50, carId: "car_valkyrie" },
        { driverName: "Outlander Boy", wpm: 76, accuracy: 96, level: 35, carId: "car_phoenix" },
        { driverName: "Noshi", wpm: 68, accuracy: 95, level: 20, carId: "car_aurora" },
        { driverName: "shukshuka", wpm: 62, accuracy: 94, level: 15, carId: "car_aquastorm" }
      ];
    }

    return combined.slice(0, limitCount);
  }

  // ==========================================
  // BUBBLE SHOOTER CLOUD SCORES
  // ==========================================

  async saveBubbleRecord(record) {
    const safeRecord = {
      playerName: this.getDriverName(),
      score: Math.round(record.score || 0),
      level: parseInt(record.level || 1, 10),
      poppedCount: parseInt(record.poppedCount || 0, 10),
      accuracy: Math.round(record.accuracy || 100),
      maxCombo: parseInt(record.maxCombo || 0, 10),
      timestamp: Date.now()
    };

    // Update LocalStorage
    try {
      const best = parseInt(localStorage.getItem("aqua_bubble_high_score") || "0", 10);
      if (safeRecord.score > best) {
        localStorage.setItem("aqua_bubble_high_score", safeRecord.score.toString());
      }
      let cache = JSON.parse(localStorage.getItem("aqua_bubble_cache") || "[]");
      cache.push(safeRecord);
      cache.sort((a, b) => b.score - a.score);
      localStorage.setItem("aqua_bubble_cache", JSON.stringify(cache.slice(0, 50)));
    } catch (e) { }

    // Upload to Firestore
    if (this.db) {
      try {
        await this.db.collection("bubble_records").add({
          ...safeRecord,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          uid: this.currentUser ? this.currentUser.uid : "guest"
        });

        if (this.currentUser) {
          await this.db.collection("users").doc(this.currentUser.uid).set({
            bubbleHighScore: Math.max(safeRecord.score, parseInt(localStorage.getItem("aqua_bubble_high_score") || "0", 10)),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
      } catch (e) {
        console.warn("Bubble record Firestore save notice:", e.message);
      }
    }

    return safeRecord;
  }

  async getBubbleLeaderboard(limitCount = 15) {
    let cloudRecords = [];
    if (this.db) {
      try {
        const snap = await this.db.collection("bubble_records")
          .orderBy("score", "desc")
          .limit(limitCount)
          .get();

        snap.forEach(doc => {
          cloudRecords.push({ id: doc.id, ...doc.data() });
        });
      } catch (e) {
        console.warn("Bubble leaderboard fetch notice:", e.message);
      }
    }

    let local = [];
    try {
      local = JSON.parse(localStorage.getItem("aqua_bubble_cache") || "[]");
    } catch (e) { }

    const combined = [...cloudRecords, ...local];
    combined.sort((a, b) => (b.score || 0) - (a.score || 0));

    if (combined.length === 0) {
      return [
        { playerName: "Marina Abyss", score: 14500, level: 8, poppedCount: 120, maxCombo: 14 },
        { playerName: "Coral Diver", score: 9800, level: 6, poppedCount: 88, maxCombo: 10 },
        { playerName: "Hydro Striker", score: 6200, level: 4, poppedCount: 65, maxCombo: 7 },
        { playerName: "Triton King", score: 4500, level: 3, poppedCount: 45, maxCombo: 5 }
      ];
    }

    return combined.slice(0, limitCount);
  }

  // ==========================================
  // MULTIPLAYER 1V1 ROOM ENGINE
  // ==========================================

  generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async createRoom(raceText) {
    const roomId = this.generateRoomCode();
    const hostName = this.getDriverName();
    const playerCar = localStorage.getItem("nitro_selected_car") || "car_phantom";

    this.activeRoom = roomId;

    const initialData = {
      roomId: roomId,
      hostName: hostName,
      hostCar: playerCar,
      hostProgress: 0,
      hostWpm: 0,
      hostFinished: false,
      guestName: null,
      guestCar: null,
      guestProgress: 0,
      guestWpm: 0,
      guestFinished: false,
      raceText: raceText,
      status: "waiting",
      createdAt: Date.now()
    };

    if (this.db) {
      try {
        await this.db.collection("rooms").doc(roomId).set(initialData);
        this.listenToRoom(roomId);
      } catch (e) {
        console.warn("Firestore create room notice:", e.message);
      }
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: "room_created", data: initialData });
    }

    return roomId;
  }

  async joinRoom(roomId, onUpdate) {
    const safeCode = roomId.toUpperCase().trim();
    this.activeRoom = safeCode;
    this.onRoomUpdate = onUpdate;
    const guestName = this.getDriverName();
    const guestCar = localStorage.getItem("nitro_selected_car") || "car_valkyrie";

    if (this.db) {
      try {
        const roomRef = this.db.collection("rooms").doc(safeCode);
        const doc = await roomRef.get();
        if (!doc.exists) {
          throw new Error("Room code not found!");
        }

        const data = doc.data();
        await roomRef.update({
          guestName: guestName,
          guestCar: guestCar,
          status: "racing"
        });

        this.listenToRoom(safeCode);
        return { success: true, data: { ...data, guestName, guestCar, status: "racing" } };
      } catch (e) {
        console.warn("Firestore join room fallback:", e.message);
        throw e;
      }
    }

    return { success: false, error: "Database not connected" };
  }

  listenToRoom(roomId) {
    if (this.roomUnsubscribe) {
      this.roomUnsubscribe();
    }

    if (this.db) {
      this.roomUnsubscribe = this.db.collection("rooms").doc(roomId).onSnapshot(doc => {
        if (doc.exists && this.onRoomUpdate) {
          this.onRoomUpdate(doc.data());
        }
      }, err => {
        console.warn("Room listener notice:", err);
      });
    }
  }

  async broadcastProgress(role, progress, wpm, finished = false) {
    if (!this.activeRoom) return;

    const updatePayload = role === "host" ? {
      hostProgress: progress,
      hostWpm: Math.round(wpm),
      hostFinished: finished
    } : {
      guestProgress: progress,
      guestWpm: Math.round(wpm),
      guestFinished: finished
    };

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        roomId: this.activeRoom,
        ...updatePayload
      });
    }

    if (this.db) {
      try {
        await this.db.collection("rooms").doc(this.activeRoom).update(updatePayload);
      } catch (e) { }
    }
  }

  leaveRoom() {
    if (this.roomUnsubscribe) {
      this.roomUnsubscribe();
      this.roomUnsubscribe = null;
    }
    this.activeRoom = null;
  }
}

window.firebaseSync = new FirebaseSyncManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FirebaseSyncManager, DEFAULT_FIREBASE_CONFIG };
}
