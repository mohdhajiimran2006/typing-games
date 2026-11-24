// ========================================================
// NITRO TYPER 3D - 100 LEVELS PROGRESSION ENGINE
// ========================================================

const GAME_LEVELS = [];

const LEVEL_TIERS = [
  { maxLevel: 20, name: "ROOKIE CIRCUIT", color: "#00f0ff", baseWpm: 15, maxWpm: 35 },
  { maxLevel: 45, name: "STREET CHALLENGER", color: "#10b981", baseWpm: 36, maxWpm: 60 },
  { maxLevel: 70, name: "PRO RACER", color: "#f59e0b", baseWpm: 61, maxWpm: 85 },
  { maxLevel: 90, name: "HYPER SPEED MASTER", color: "#ef4444", baseWpm: 86, maxWpm: 110 },
  { maxLevel: 100, name: "CYBER GOD OF SPEED", color: "#ec4899", baseWpm: 111, maxWpm: 140 }
];

const LEVEL_TITLES = [
  "Ignition Test", "First Straightaway", "Neon Boulevard", "Coastal Breeze", "Night Prowler",
  "Urban Drift", "Turbine Run", "Asphalt Fever", "Slipstream Drift", "Midnight Sprint",
  "Rookie Cup", "Greenlight Rush", "Velocity Alley", "Twin Turbo Surge", "Downtown Express",
  "Overpass Flight", "Tunnel Echo", "Redline Horizon", "Apex Predator", "First Grand Prix",
  "Street Striker", "Nitro Avenue", "Subway Flyover", "Ghost Rider", "Pulse Jet Run",
  "Cyber Highway", "Valkyrie Test", "Rainstorm Sprint", "Shadow Chaser", "High Stakes",
  "Neon Skylines", "Supersonic Draft", "Underground Showdown", "Mach One Trial", "Laser Grid",
  "Obsidian Pass", "Drift Syndicate", "Electric Avenue", "Solar Flare", "Halfway Champion",
  "Chrome Odyssey", "Hyperlane Apex", "Thunderbolt Straight", "Vortex Drift", "Circuit Monarch",
  "Digital Expressway", "Turbocharger Elite", "Midnight Mirage", "Quantum Leap", "Master Grand Prix",
  "Zero Gravity", "Orbital Runway", "Plasma Burn", "Photon Dash", "Starlight Canyon",
  "Vector Storm", "Gravity Well", "Kinetic Shock", "Supercluster Run", "Galactic Trial",
  "Warp Speed Trial", "Ion Drive", "Dark Matter Pass", "Cosmic Velocity", "Starlight Overdrive",
  "Nebula Highway", "Hyperdrive Engaged", "Neutron Star Sprint", "Singularity Race", "Speed Master Cup",
  "Lightcycle Dash", "Cyberpunk Showdown", "Matrix Breaker", "Apex Legend", "Titanium Heart",
  "Godspeed Run", "Overclocked Drift", "Chronos Sprint", "Time Warp", "Infinity Horizon",
  "Apex Valkyrie", "Supernova Blast", "Event Horizon", "Absolute Zero", "Sound Barrier Shatter",
  "Quantum Overdrive", "Celestial Sprint", "Hyperion Fury", "Zenith Champion", "Titan Grand Prix",
  "Relativity Break", "Multiverse Expressway", "Tachyon Burst", "Omniversal Velocity", "Limitless Surge",
  "Speed Demon Final", "Immortal Racer", "The Final Lap", "Apex Speed God", "Ultimate Legend"
];

for (let i = 1; i <= 100; i++) {
  const tier = LEVEL_TIERS.find(t => i <= t.maxLevel) || LEVEL_TIERS[LEVEL_TIERS.length - 1];
  const progressInTier = (i - (tier.maxLevel - (tier.maxLevel - (i <= 20 ? 0 : LEVEL_TIERS[LEVEL_TIERS.indexOf(tier) - 1].maxLevel)))) / 20;
  
  // Calculate Target WPM smoothly
  const targetWpm = Math.round(15 + (i - 1) * 1.25);
  const minAccuracy = Math.min(98, Math.max(90, Math.round(90 + (i / 100) * 8)));
  
  GAME_LEVELS.push({
    level: i,
    title: LEVEL_TITLES[i - 1] || `Speed Trial ${i}`,
    tierName: tier.name,
    tierColor: tier.color,
    targetWpm: targetWpm,
    minAccuracy: minAccuracy,
    starCriteria: {
      oneStar: Math.max(10, targetWpm - 10),
      twoStars: targetWpm,
      threeStars: targetWpm + 12
    },
    rivalNames: ["Noshi", "Outlander Boy", "Snapdragon", "shukshuka"]
  });
}

function getLevelConfig(levelNumber) {
  const num = Math.max(1, Math.min(100, parseInt(levelNumber, 10) || 1));
  return GAME_LEVELS[num - 1];
}

// Export for browser and node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GAME_LEVELS, LEVEL_TIERS, getLevelConfig };
}
