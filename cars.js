// ========================================================
// NITRO TYPER 3D - CARS & AI RACERS REPOSITORY
// High-tech procedural supercars with vibrant cyber liveries
// ========================================================

const FUTURISTIC_CARS = [
  {
    id: "car_phantom",
    name: "Cyber Phantom GT",
    tagline: "Midnight Cyberpunk Hyper-Cruiser",
    tier: "Rookie",
    baseColor: "#0f172a",     // Deep Midnight Obsidian
    stripeColor: "#00f0ff",   // Bright Cyan Racing Stripe
    neonColor: "#00f0ff",     // Cyber Cyan Underglow
    accentColor: "#38bdf8",   // Light Sky Blue
    wheelColor: "#020617",    // Onyx Alloy
    rimNeonColor: "#00f0ff",  // Cyan Rim Ring
    stats: { speed: 85, accel: 82, handling: 90, nitro: 85 },
    unlockedAtLevel: 1,
    description: "Equipped with dual active aerodynamics, glowing cyan underglow, and lightweight carbon composite."
  },
  {
    id: "car_itachi",
    name: "Akatsuki Blood-Moon GT",
    tagline: "Tsukuyomi Redline Supercar",
    tier: "Special",
    baseColor: "#050508",     // Obsidian Black
    stripeColor: "#dc2626",   // Blood Crimson Racing Stripe
    neonColor: "#ef4444",     // Neon Blood-Moon Underglow
    accentColor: "#b91c1c",   // Crimson Red
    wheelColor: "#000000",    // Matte Black Alloy
    rimNeonColor: "#dc2626",  // Crimson Rim Ring
    stats: { speed: 96, accel: 94, handling: 95, nitro: 97 },
    unlockedAtLevel: 1,       // Free unlocked for player!
    description: "Inspired by the Blood Red Moon, featuring midnight obsidian composite and crimson plasma turbines."
  },
  {
    id: "car_phoenix",
    name: "Sunset Phoenix LM",
    tagline: "Blazing Sunset Sky Racer",
    tier: "Challenger",
    baseColor: "#e11d48",     // Vibrant Sunset Coral/Crimson
    stripeColor: "#fbbf24",   // Golden Amber Stripe
    neonColor: "#f97316",     // Neon Flame Orange
    accentColor: "#f43f5e",   // Rose Magenta
    wheelColor: "#1e1b4b",    // Deep Indigo Alloy
    rimNeonColor: "#fbbf24",  // Amber Rim Ring
    stats: { speed: 89, accel: 86, handling: 88, nitro: 88 },
    unlockedAtLevel: 8,
    description: "A colorful speedster painted in warm twilight gradients with fire-breathing twin turbines."
  },
  {
    id: "car_aurora",
    name: "Cyber Aurora GT",
    tagline: "Northern Lights Iridescent Hypercar",
    tier: "Pro",
    baseColor: "#1e1b4b",     // Deep Cosmic Violet
    stripeColor: "#10b981",   // Emerald Aurora Stripe
    neonColor: "#a855f7",     // Vibrant Neon Purple
    accentColor: "#06b6d4",   // Aquamarine
    wheelColor: "#09090b",    // Gloss Black
    rimNeonColor: "#10b981",  // Emerald Rim Ring
    stats: { speed: 92, accel: 90, handling: 92, nitro: 91 },
    unlockedAtLevel: 18,
    description: "Iridescent violet-to-emerald pearlescent bodywork inspired by celestial auroras."
  },
  {
    id: "car_valkyrie",
    name: "Apex Valkyrie LM",
    tagline: "Le Mans Prototype of 2088",
    tier: "Pro",
    baseColor: "#09090b",     // Carbon Black
    stripeColor: "#ff0055",   // Hot Magenta Stripe
    neonColor: "#ff0055",     // Neon Magenta / Crimson
    accentColor: "#f43f5e",   // Rose Pink
    wheelColor: "#1e293b",    // Dark Slate
    rimNeonColor: "#ff0055",  // Magenta Rim Ring
    stats: { speed: 94, accel: 92, handling: 88, nitro: 93 },
    unlockedAtLevel: 30,
    description: "Carbon monocoque construction with massive downforce rear wing and twin diffuser."
  },
  {
    id: "car_aquastorm",
    name: "Hydro Wave-X",
    tagline: "Oceanic Bioluminescent Speedcraft",
    tier: "Elite",
    baseColor: "#0369a1",     // Deep Sea Blue
    stripeColor: "#38bdf8",   // Electric Aqua Stripe
    neonColor: "#06b6d4",     // Radiant Teal Glow
    accentColor: "#67e8f9",   // Crystal Cyan
    wheelColor: "#082f49",    // Marine Onyx
    rimNeonColor: "#38bdf8",  // Aqua Rim Ring
    stats: { speed: 96, accel: 94, handling: 94, nitro: 95 },
    unlockedAtLevel: 45,
    description: "Infused with fluid-dynamics technology and vivid ocean lighting for high-speed stability."
  },
  {
    id: "car_solaris",
    name: "Solaris Hyper-Spyder",
    tagline: "Raw Solar Kinetic Overdrive",
    tier: "Master",
    baseColor: "#d97706",     // Radiant Solar Gold
    stripeColor: "#ffffff",   // Pure Xenon White Stripe
    neonColor: "#fbbf24",     // Solar Gold / Electric Amber
    accentColor: "#f59e0b",   // Amber
    wheelColor: "#18181b",    // Onyx
    rimNeonColor: "#fbbf24",  // Gold rim ring
    stats: { speed: 98, accel: 96, handling: 93, nitro: 98 },
    unlockedAtLevel: 60,
    description: "An open-canopy speed demon with solar collectors and magnetic levitation dampers."
  },
  {
    id: "car_italia",
    name: "Rosso Corsa 458-X",
    tagline: "Italian Passion Reimagined in Neon",
    tier: "Legendary",
    baseColor: "#dc2626",     // Rosso Corsa Red
    stripeColor: "#fef08a",   // Bright Canary Yellow Stripe
    neonColor: "#ffffff",     // Ultra White Xenon Glow
    accentColor: "#ef4444",   // Red
    wheelColor: "#111827",    // Gloss Black
    rimNeonColor: "#fbbf24",  // Golden Yellow
    stats: { speed: 100, accel: 99, handling: 96, nitro: 100 },
    unlockedAtLevel: 80,
    description: "Naturally aspirated screaming V8 paired with futuristic kinetic energy recovery."
  }
];

// 4 AI Rival Racers matching user's reference image
const AI_RACERS = [
  {
    name: "Noshi",
    lane: 0,
    carId: "car_aurora",
    baseColor: "#312e81",
    neonColor: "#a855f7",     // Electric Purple
    speedFactor: 0.95,
    avatar: "🟣"
  },
  {
    name: "Outlander Boy",
    lane: 1,
    carId: "car_phoenix",
    baseColor: "#9a3412",
    neonColor: "#f97316",     // Sunset Orange
    speedFactor: 0.98,
    avatar: "🟠"
  },
  {
    name: "Snapdragon",
    lane: 3,
    carId: "car_italia",
    baseColor: "#991b1b",
    neonColor: "#ef4444",     // Crimson Red
    speedFactor: 1.02,
    avatar: "🔴"
  },
  {
    name: "shukshuka",
    lane: 4,
    carId: "car_aquastorm",
    baseColor: "#065f46",
    neonColor: "#10b981",     // Emerald Aqua
    speedFactor: 0.93,
    avatar: "🟢"
  }
];

function getCarById(id) {
  return FUTURISTIC_CARS.find(c => c.id === id) || FUTURISTIC_CARS[0];
}

function getSavedPlayerCarId() {
  try {
    return localStorage.getItem("nitro_selected_car") || "car_phantom";
  } catch (e) {
    return "car_phantom";
  }
}

function savePlayerCarId(id) {
  try {
    localStorage.setItem("nitro_selected_car", id);
  } catch (e) {
    console.warn("Storage not available");
  }
}

function getPlayerCar() {
  return getCarById(getSavedPlayerCarId());
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FUTURISTIC_CARS, AI_RACERS, getCarById, getPlayerCar, getSavedPlayerCarId, savePlayerCarId };
}
