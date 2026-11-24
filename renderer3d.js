// ========================================================
// NITRO TYPER 3D - COLORFUL CYBER HIGHWAY 3D RENDERER
// Three.js 60 FPS 5-Lane Highway, Pastel Sunset Clouds & Supercars
// ========================================================

class RaceRenderer3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error("3D Container element not found:", containerId);
      return;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = null;
    this.animId = null;

    // Track parameters
    this.laneWidth = 3.2;
    this.numLanes = 5;
    this.trackLength = 650;
    this.lanePositions = [-6.4, -3.2, 0, 3.2, 6.4];

    // Cars & Environmental elements
    this.cars = [];
    this.playerCarEntry = null;
    this.roadDashes = [];
    this.finishArch = null;
    this.clouds = [];
    this.roadsidePillars = [];
    this.overheadArches = [];
    this.sunMesh = null;

    // State
    this.isInitialized = false;
    this.pendingRaceSetup = null;

    this.init();
  }

  init() {
    if (typeof THREE === "undefined") {
      setTimeout(() => this.init(), 100);
      return;
    }

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || (window.innerHeight * 0.45);

    // 1. Scene with Transparent Sky (Allowing Blood Red Moon CSS Background)
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent so Blood Red Moon background shines through!
    this.scene.fog = new THREE.FogExp2(0x1a0508, 0.0025);

    // 2. Camera (Chase view looking down 5 lanes)
    this.camera = new THREE.PerspectiveCamera(58, width / height, 0.5, 1400);
    this.camera.position.set(0, 4.2, -9);
    this.camera.lookAt(0, 1.5, 14);

    // 3. WebGL Renderer with Alpha enabled
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = false;
    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // 4. Lighting & Colorful Atmosphere
    this.setupLighting();
    this.buildColorfulSkyAndClouds();
    this.buildHighway();
    this.buildRoadsideScenery();
    this.buildFinishArch();

    window.addEventListener("resize", () => this.onResize());

    this.isInitialized = true;
    if (this.pendingRaceSetup) {
      this.setupRace(
        this.pendingRaceSetup.playerCarDef,
        this.pendingRaceSetup.playerName,
        this.pendingRaceSetup.rivals
      );
      this.pendingRaceSetup = null;
    }

    this.animate();
  }

  setupLighting() {
    // Warm sunset ambient
    const ambient = new THREE.AmbientLight(0x7c3aed, 0.95); // Violet-indigo ambient
    this.scene.add(ambient);

    // Warm golden sunset sun light from the horizon
    const sunLight = new THREE.DirectionalLight(0xfb923c, 1.3);
    sunLight.position.set(0, 30, this.trackLength + 100);
    this.scene.add(sunLight);

    // Soft cyan & magenta cross-lights for vehicle chrome reflections
    const cyanLight = new THREE.DirectionalLight(0x06b6d4, 0.7);
    cyanLight.position.set(-25, 20, -10);
    this.scene.add(cyanLight);

    const pinkLight = new THREE.DirectionalLight(0xf43f5e, 0.6);
    pinkLight.position.set(25, 20, -10);
    this.scene.add(pinkLight);
  }

  // ==========================================
  // GOJO LIMITLESS MOON & SKY BACKDROP & CLOUDS
  // ==========================================
  buildColorfulSkyAndClouds() {
    // 1. Giant Horizon Backdrop (User Uploaded Satoru Gojo Limitless Moon / Blood Red Moon)
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("assets/gojo_moon.jpg", (texture) => {
      const backdropGeom = new THREE.PlaneGeometry(380, 215);
      const backdropMat = new THREE.MeshBasicMaterial({
        map: texture,
        depthWrite: false
      });
      this.backdropMesh = new THREE.Mesh(backdropGeom, backdropMat);
      this.backdropMesh.position.set(0, 80, this.trackLength + 120);
      this.scene.add(this.backdropMesh);
    }, undefined, (err) => {
      console.warn("Gojo moon fallback to blood moon:", err);
      textureLoader.load("assets/blood_moon.jpg", (bTex) => {
        const backdropGeom = new THREE.PlaneGeometry(380, 215);
        const backdropMat = new THREE.MeshBasicMaterial({
          map: bTex,
          depthWrite: false
        });
        this.backdropMesh = new THREE.Mesh(backdropGeom, backdropMat);
        this.backdropMesh.position.set(0, 80, this.trackLength + 120);
        this.scene.add(this.backdropMesh);
      });
    });

    // 2. Giant Glowing Celestial Moon Mesh at Horizon with Radiant Corona
    const sunGeom = new THREE.SphereGeometry(26, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
    this.sunMesh = new THREE.Mesh(sunGeom, sunMat);
    this.sunMesh.position.set(-36, 48, this.trackLength + 150);
    this.scene.add(this.sunMesh);

    // Outer radiant cyan/azure corona ring with Additive Blending for celestial glow
    const ringGeom = new THREE.RingGeometry(27, 44, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.sunRing = new THREE.Mesh(ringGeom, ringMat);
    this.sunRing.position.set(-36, 48, this.trackLength + 145);
    this.scene.add(this.sunRing);

    // 2. Procedural Colorful Puffy Clouds
    // Palette of dreamy sunset pastel tones
    const cloudColors = [
      0xf472b6, // Pastel Pink / Coral
      0xfb923c, // Sunset Apricot / Orange
      0xc084fc, // Lavender Purple
      0x38bdf8, // Dreamy Cyan
      0xfde047  // Soft Gold
    ];

    const numClouds = 28;
    for (let i = 0; i < numClouds; i++) {
      const cloudGroup = new THREE.Group();
      const color = cloudColors[i % cloudColors.length];
      const cloudMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
      });

      // Cluster of 4-6 overlapping spheres per cloud
      const puffCount = 4 + Math.floor(Math.random() * 3);
      for (let p = 0; p < puffCount; p++) {
        const radius = 3.5 + Math.random() * 4.5;
        const puffGeom = new THREE.SphereGeometry(radius, 12, 12);
        const puff = new THREE.Mesh(puffGeom, cloudMat);
        puff.position.set(
          (p - puffCount / 2) * 3.5 + (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 4
        );
        puff.scale.set(1.4, 0.7, 1); // Flatten slightly for natural cloud shape
        cloudGroup.add(puff);
      }

      // Spread clouds across the sky above and around the highway
      const x = (Math.random() - 0.5) * 160;
      const y = 22 + Math.random() * 35;
      const z = -40 + (i / numClouds) * (this.trackLength + 220);

      cloudGroup.position.set(x, y, z);
      this.scene.add(cloudGroup);
      this.clouds.push({
        group: cloudGroup,
        driftSpeed: 0.3 + Math.random() * 0.4,
        initialX: x
      });
    }
  }

  buildHighway() {
    const roadWidth = this.numLanes * this.laneWidth + 4;
    const roadGeom = new THREE.PlaneGeometry(roadWidth, this.trackLength + 120);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0f111a, // Dark asphalt with subtle blue reflection
      roughness: 0.8,
      metalness: 0.25
    });

    const roadMesh = new THREE.Mesh(roadGeom, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, (this.trackLength + 120) / 2 - 30);
    this.scene.add(roadMesh);

    // Colorful Neon Guardrails (Left: Magenta, Right: Cyan)
    const railGeom = new THREE.BoxGeometry(0.35, 0.8, this.trackLength + 120);
    const leftRailMat = new THREE.MeshBasicMaterial({ color: 0xff007f }); // Hot Pink/Magenta
    const rightRailMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff }); // Neon Cyan

    const leftRail = new THREE.Mesh(railGeom, leftRailMat);
    leftRail.position.set(-roadWidth / 2 + 0.2, 0.4, (this.trackLength + 120) / 2 - 30);
    this.scene.add(leftRail);

    const rightRail = new THREE.Mesh(railGeom, rightRailMat);
    rightRail.position.set(roadWidth / 2 - 0.2, 0.4, (this.trackLength + 120) / 2 - 30);
    this.scene.add(rightRail);

    // Dashed Lane Lines
    const dashLength = 4.0;
    const gapLength = 4.0;
    const numDashes = Math.floor(this.trackLength / (dashLength + gapLength));
    const dashGeom = new THREE.PlaneGeometry(0.22, dashLength);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });

    for (let laneDiv = 1; laneDiv < this.numLanes; laneDiv++) {
      const xPos = -roadWidth / 2 + 2 + laneDiv * this.laneWidth;
      for (let i = 0; i < numDashes; i++) {
        const dash = new THREE.Mesh(dashGeom, dashMat);
        dash.rotation.x = -Math.PI / 2;
        dash.position.set(xPos, 0.02, i * (dashLength + gapLength) + dashLength / 2);
        this.scene.add(dash);
        this.roadDashes.push(dash);
      }
    }

    // Glowing Neon Cyber Grid Ground
    const gridHelper = new THREE.GridHelper(360, 36, 0xff00aa, 0x06b6d4);
    gridHelper.position.set(0, -0.05, this.trackLength / 2);
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  // Colorful roadside synthwave palms / glowing pillars & overhead neon arches
  buildRoadsideScenery() {
    const roadWidth = this.numLanes * this.laneWidth + 4;
    const pillarColors = [0x00f0ff, 0xff007f, 0xfbbf24, 0x10b981, 0xa855f7];

    // Roadside Cyber Pillars
    for (let z = 20; z < this.trackLength; z += 35) {
      [-roadWidth / 2 - 2.5, roadWidth / 2 + 2.5].forEach((x, sideIdx) => {
        const pillarGroup = new THREE.Group();
        const color = pillarColors[(Math.floor(z / 35) + sideIdx) % pillarColors.length];

        // Stem
        const stemGeom = new THREE.CylinderGeometry(0.18, 0.24, 6, 8);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.8, roughness: 0.2 });
        const stem = new THREE.Mesh(stemGeom, stemMat);
        stem.position.y = 3;
        pillarGroup.add(stem);

        // Glowing crystal crown
        const crownGeom = new THREE.OctahedronGeometry(0.8, 0);
        const crownMat = new THREE.MeshBasicMaterial({ color: color });
        const crown = new THREE.Mesh(crownGeom, crownMat);
        crown.position.y = 6.4;
        pillarGroup.add(crown);

        pillarGroup.position.set(x, 0, z);
        this.scene.add(pillarGroup);
        this.roadsidePillars.push(pillarGroup);
      });
    }

    // Overhead Cyber Arches every 130 meters
    for (let z = 130; z < this.trackLength - 50; z += 130) {
      const arch = new THREE.Group();
      const archW = roadWidth + 3;

      const beamGeom = new THREE.BoxGeometry(archW, 0.6, 0.6);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const beam = new THREE.Mesh(beamGeom, beamMat);
      beam.position.set(0, 6.2, 0);
      arch.add(beam);

      [-archW / 2, archW / 2].forEach(px => {
        const pGeom = new THREE.BoxGeometry(0.6, 6.5, 0.6);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        pMesh.position.set(px, 3.2, 0);
        arch.add(pMesh);
      });

      arch.position.set(0, 0, z);
      this.scene.add(arch);
      this.overheadArches.push(arch);
    }
  }

  buildFinishArch() {
    const archGroup = new THREE.Group();
    const archWidth = this.numLanes * this.laneWidth + 6;

    const pillarGeom = new THREE.BoxGeometry(0.9, 6.5, 0.9);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.2 });

    const leftPillar = new THREE.Mesh(pillarGeom, pillarMat);
    leftPillar.position.set(-archWidth / 2, 3.25, 0);
    archGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeom, pillarMat);
    rightPillar.position.set(archWidth / 2, 3.25, 0);
    archGroup.add(rightPillar);

    const barGeom = new THREE.BoxGeometry(archWidth + 0.8, 1.4, 0.9);
    const barMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const crossbar = new THREE.Mesh(barGeom, barMat);
    crossbar.position.set(0, 6.2, 0);
    archGroup.add(crossbar);

    // Finish Banner
    const bannerCanvas = document.createElement("canvas");
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const bctx = bannerCanvas.getContext("2d");
    bctx.fillStyle = "#10b981";
    bctx.fillRect(0, 0, 512, 128);
    bctx.fillStyle = "#ffffff";
    bctx.font = "bold 58px 'Arial Black', sans-serif";
    bctx.textAlign = "center";
    bctx.textBaseline = "middle";
    bctx.fillText("🏁 FINISH LINE 🏁", 256, 64);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex, transparent: true });
    const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(archWidth - 1, 1.1), bannerMat);
    bannerMesh.position.set(0, 6.2, -0.47);
    archGroup.add(bannerMesh);

    // Finish Line road checkering
    const lineGeom = new THREE.PlaneGeometry(archWidth, 3.0);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const finishLine = new THREE.Mesh(lineGeom, lineMat);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(0, 0.03, 0);
    archGroup.add(finishLine);

    archGroup.position.set(0, 0, this.trackLength);
    this.scene.add(archGroup);
    this.finishArch = archGroup;
  }

  // ==========================================
  // PROCEDURAL 3D SUPERCAR MODEL BUILDER
  // Enhanced with racing stripes & underglow
  // ==========================================

  create3DCar(carDef, isPlayer = false, driverName = "Driver") {
    const carGroup = new THREE.Group();
    const wheels = [];
    const exhaustFlames = [];

    const baseHex = parseInt((carDef.baseColor || "#111827").replace("#", "0x"), 16);
    const stripeHex = parseInt((carDef.stripeColor || "#00f0ff").replace("#", "0x"), 16);
    const neonHex = parseInt((carDef.neonColor || "#00f0ff").replace("#", "0x"), 16);
    const wheelHex = parseInt((carDef.wheelColor || "#1f2937").replace("#", "0x"), 16);
    const rimNeonHex = parseInt((carDef.rimNeonColor || carDef.neonColor || "#00f0ff").replace("#", "0x"), 16);

    // 1. Lower Body Chassis
    const bodyGeom = new THREE.BoxGeometry(1.72, 0.44, 3.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: baseHex,
      metalness: 0.75,
      roughness: 0.25
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.position.set(0, 0.38, 0);
    carGroup.add(bodyMesh);

    // 2. Vibrant Center Racing Stripe across hood & roof
    const stripeGeom = new THREE.BoxGeometry(0.38, 0.46, 3.82);
    const stripeMat = new THREE.MeshBasicMaterial({ color: stripeHex });
    const stripeMesh = new THREE.Mesh(stripeGeom, stripeMat);
    stripeMesh.position.set(0, 0.38, 0);
    carGroup.add(stripeMesh);

    // 3. Cockpit Canopy (Dark Tinted Glass)
    const cabinGeom = new THREE.BoxGeometry(1.24, 0.4, 1.8);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x05070d,
      roughness: 0.08,
      metalness: 0.95
    });
    const cabinMesh = new THREE.Mesh(cabinGeom, cabinMat);
    cabinMesh.position.set(0, 0.69, -0.2);
    carGroup.add(cabinMesh);

    // 4. Neon Edge Trim / Pinstripes
    const pinstripeGeom = new THREE.BoxGeometry(1.74, 0.06, 3.82);
    const pinstripeMat = new THREE.MeshBasicMaterial({ color: neonHex });
    const pinstripeMesh = new THREE.Mesh(pinstripeGeom, pinstripeMat);
    pinstripeMesh.position.set(0, 0.24, 0);
    carGroup.add(pinstripeMesh);

    // 5. Underglow Neon Light Plate
    const underglowGeom = new THREE.PlaneGeometry(1.6, 3.4);
    const underglowMat = new THREE.MeshBasicMaterial({
      color: neonHex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    const underglow = new THREE.Mesh(underglowGeom, underglowMat);
    underglow.rotation.x = -Math.PI / 2;
    underglow.position.set(0, 0.05, 0);
    carGroup.add(underglow);

    // 6. Rear Spoiler / Wing
    const wingGeom = new THREE.BoxGeometry(1.82, 0.08, 0.45);
    const wingMat = new THREE.MeshStandardMaterial({ color: baseHex, metalness: 0.8, roughness: 0.3 });
    const wingMesh = new THREE.Mesh(wingGeom, wingMat);
    wingMesh.position.set(0, 0.95, -1.6);
    carGroup.add(wingMesh);

    // Spoiler Endplates in Neon Accent
    [-0.92, 0.92].forEach(x => {
      const epGeom = new THREE.BoxGeometry(0.04, 0.28, 0.5);
      const epMat = new THREE.MeshBasicMaterial({ color: stripeHex });
      const ep = new THREE.Mesh(epGeom, epMat);
      ep.position.set(x, 0.95, -1.6);
      carGroup.add(ep);
    });

    // Spoiler Struts
    [-0.5, 0.5].forEach(x => {
      const strutGeom = new THREE.BoxGeometry(0.08, 0.35, 0.15);
      const strutMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
      const strut = new THREE.Mesh(strutGeom, strutMat);
      strut.position.set(x, 0.75, -1.6);
      carGroup.add(strut);
    });

    // 7. Headlights (+Z front)
    const headGeom = new THREE.BoxGeometry(0.35, 0.12, 0.1);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xecfeff });
    [-0.6, 0.6].forEach(x => {
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.set(x, 0.42, 1.91);
      carGroup.add(head);
    });

    // 8. Taillights (-Z rear)
    const tailGeom = new THREE.BoxGeometry(0.4, 0.1, 0.1);
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    [-0.6, 0.6].forEach(x => {
      const tail = new THREE.Mesh(tailGeom, tailMat);
      tail.position.set(x, 0.46, -1.91);
      carGroup.add(tail);
    });

    // 9. 4 Alloy Wheels with Neon Rims
    const wheelRadius = 0.34;
    const wheelWidth = 0.28;
    const wheelGeom = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: wheelHex, roughness: 0.6 });
    const rimMat = new THREE.MeshBasicMaterial({ color: rimNeonHex });

    const wheelPositions = [
      [-0.88, wheelRadius, 1.1],
      [0.88, wheelRadius, 1.1],
      [-0.88, wheelRadius, -1.1],
      [0.88, wheelRadius, -1.1]
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(x, y, z);

      const tire = new THREE.Mesh(wheelGeom, wheelMat);
      tire.rotation.z = Math.PI / 2;
      wheelGroup.add(tire);

      // Neon Rim Ring
      const rimRingGeom = new THREE.TorusGeometry(wheelRadius * 0.72, 0.032, 8, 16);
      const rimRing = new THREE.Mesh(rimRingGeom, rimMat);
      rimRing.rotation.y = Math.PI / 2;
      wheelGroup.add(rimRing);

      carGroup.add(wheelGroup);
      wheels.push(wheelGroup);
    });

    // 10. Dual Exhaust Flames (Vibrant Neon Flame Cones)
    const flameGeom = new THREE.ConeGeometry(0.13, 0.65, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: neonHex, transparent: true, opacity: 0.85 });

    [-0.35, 0.35].forEach(x => {
      const flame = new THREE.Mesh(flameGeom, flameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0.3, -2.18);
      flame.visible = false;
      carGroup.add(flame);
      exhaustFlames.push(flame);
    });

    // 11. Player Glowing Green Box / Aura & Typerush Green Rank Bubble (Image 2)
    let auraBox = null;
    let rankTagSprite = null;
    if (isPlayer) {
      const auraGeom = new THREE.PlaneGeometry(2.3, 4.6);
      const auraCanvas = document.createElement("canvas");
      auraCanvas.width = 256;
      auraCanvas.height = 256;
      const actx = auraCanvas.getContext("2d");
      actx.strokeStyle = "#10b981";
      actx.lineWidth = 14;
      actx.strokeRect(8, 8, 240, 240);
      actx.fillStyle = "rgba(16, 185, 129, 0.2)";
      actx.fillRect(8, 8, 240, 240);

      const auraTex = new THREE.CanvasTexture(auraCanvas);
      const auraMat = new THREE.MeshBasicMaterial({
        map: auraTex,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      auraBox = new THREE.Mesh(auraGeom, auraMat);
      auraBox.rotation.x = -Math.PI / 2;
      auraBox.position.set(0, 0.04, 0);
      carGroup.add(auraBox);

      // Typerush #1 Green Speech Bubble Tag (Image 2)
      rankTagSprite = this.createRankTagSprite("#1");
      rankTagSprite.position.set(-1.65, 1.25, -0.6);
      carGroup.add(rankTagSprite);
    }

    // 12. Floating Name Tag
    const nameTag = this.createNameTagSprite(driverName, isPlayer);
    nameTag.position.set(0, 1.85, 0);
    carGroup.add(nameTag);

    return {
      group: carGroup,
      wheels: wheels,
      exhaustFlames: exhaustFlames,
      auraBox: auraBox,
      nameTag: nameTag,
      rankTagSprite: rankTagSprite
    };
  }

  // TypeRush Style Green Rank Callout Bubble (Image 2)
  createRankTagSprite(rankText) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 80;
    this.drawRankTagCanvas(canvas, rankText);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.88, 1);
    sprite.userData = { canvas: canvas, texture: texture, currentRank: rankText };
    return sprite;
  }

  drawRankTagCanvas(canvas, rankText) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bright Green bubble body (Matching Image 2 #1 Tag)
    ctx.fillStyle = "#22c55e";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(6, 6, 116, 52, 10);
    ctx.fill();
    ctx.stroke();

    // Callout arrow pointing towards the car
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.moveTo(96, 56);
    ctx.lineTo(116, 74);
    ctx.lineTo(106, 56);
    ctx.closePath();
    ctx.fill();

    // White bold rank text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(rankText || "#1", 64, 32);
  }

  updatePlayerRankTag(rankNum) {
    if (!this.playerCarEntry || !this.playerCarEntry.rankTagSprite) return;
    const sprite = this.playerCarEntry.rankTagSprite;
    const rankStr = `#${rankNum}`;
    if (sprite.userData && sprite.userData.currentRank !== rankStr) {
      sprite.userData.currentRank = rankStr;
      this.drawRankTagCanvas(sprite.userData.canvas, rankStr);
      sprite.userData.texture.needsUpdate = true;
    }
  }

  createNameTagSprite(name, isPlayer) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = isPlayer ? "rgba(16, 185, 129, 0.9)" : "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = isPlayer ? "#10b981" : "#00f0ff";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(6, 6, 244, 52, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((name || "Racer").substring(0, 14), 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.0, 0.75, 1);
    return sprite;
  }

  setupRace(playerCarDef, playerName = "You", rivals = []) {
    if (!this.isInitialized || !this.scene) {
      this.pendingRaceSetup = { playerCarDef, playerName, rivals };
      return;
    }

    // Clear previous cars
    this.cars.forEach(c => {
      this.scene.remove(c.group);
    });
    this.cars = [];
    this.playerCarEntry = null;

    // 1. Create Player Car in Center Lane 2
    const player3D = this.create3DCar(playerCarDef, true, playerName);
    player3D.group.position.set(this.lanePositions[2], 0, 0);
    this.scene.add(player3D.group);

    this.playerCarEntry = {
      id: "player",
      name: playerName,
      lane: 2,
      group: player3D.group,
      wheels: player3D.wheels,
      exhaustFlames: player3D.exhaustFlames,
      auraBox: player3D.auraBox,
      rankTagSprite: player3D.rankTagSprite,
      isPlayer: true,
      progress: 0.0,
      targetProgress: 0.0,
      wpm: 0,
      finished: false
    };
    this.cars.push(this.playerCarEntry);

    // 2. Create Rival Cars in lanes 0, 1, 3, 4
    const defaultRivalDefs = [
      { name: "Noshi", lane: 0, baseColor: "#312e81", stripeColor: "#a855f7", neonColor: "#a855f7" },
      { name: "Outlander Boy", lane: 1, baseColor: "#9a3412", stripeColor: "#fbbf24", neonColor: "#f97316" },
      { name: "Snapdragon", lane: 3, baseColor: "#991b1b", stripeColor: "#fef08a", neonColor: "#ef4444" },
      { name: "shukshuka", lane: 4, baseColor: "#065f46", stripeColor: "#38bdf8", neonColor: "#10b981" }
    ];

    const rivalList = rivals && rivals.length > 0 ? rivals : defaultRivalDefs;

    rivalList.forEach(rival => {
      const rivalDef = {
        baseColor: rival.baseColor || "#1e293b",
        stripeColor: rival.stripeColor || rival.neonColor || "#00f0ff",
        neonColor: rival.neonColor || "#00f0ff",
        wheelColor: "#111827",
        rimNeonColor: rival.neonColor || "#00f0ff"
      };

      const laneIdx = rival.lane !== undefined ? rival.lane : 0;
      const xPos = this.lanePositions[laneIdx] || 0;

      const rival3D = this.create3DCar(rivalDef, false, rival.name);
      rival3D.group.position.set(xPos, 0, 0);
      this.scene.add(rival3D.group);

      this.cars.push({
        id: rival.id || rival.name,
        name: rival.name,
        lane: laneIdx,
        group: rival3D.group,
        wheels: rival3D.wheels,
        exhaustFlames: rival3D.exhaustFlames,
        auraBox: null,
        isPlayer: false,
        progress: 0.0,
        targetProgress: 0.0,
        wpm: 0,
        finished: false
      });
    });

    this.updateCameraImmediate();
  }

  updateCarProgress(carId, progressRatio, currentWpm = 0) {
    const car = this.cars.find(c => c.id === carId || (c.isPlayer && carId === "player"));
    if (car) {
      car.targetProgress = Math.max(0, Math.min(1.0, progressRatio));
      car.wpm = currentWpm;
    }
  }

  updateCameraImmediate() {
    if (!this.playerCarEntry) return;
    const pz = this.playerCarEntry.group.position.z;
    const px = this.playerCarEntry.group.position.x;
    this.camera.position.set(px * 0.4, 3.8, pz - 9.0);
    this.camera.lookAt(px * 0.2, 1.4, pz + 14.0);
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());
    if (!this.isInitialized) return;

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 1. Gently drift colorful clouds across the sky
    this.clouds.forEach(cloud => {
      cloud.group.position.x += delta * cloud.driftSpeed;
      if (cloud.group.position.x > 90) {
        cloud.group.position.x = -90;
      }
    });

    // 2. Pulse Celestial Moon & Corona Glow
    if (this.sunMesh) {
      this.sunMesh.scale.setScalar(1 + Math.sin(time * 1.5) * 0.04);
    }
    if (this.sunRing) {
      this.sunRing.scale.setScalar(1 + Math.sin(time * 2.2) * 0.08);
      this.sunRing.material.opacity = 0.55 + Math.sin(time * 2.2) * 0.2;
    }

    // 3. Update each car's position along track
    this.cars.forEach(car => {
      car.progress += (car.targetProgress - car.progress) * 0.12;
      const targetZ = car.progress * this.trackLength;
      const speedDiff = (targetZ - car.group.position.z);
      car.group.position.z += speedDiff * 0.15;

      const wheelSpeed = Math.max(0.5, speedDiff * 6.0);
      car.wheels.forEach(w => {
        w.rotation.x += delta * wheelSpeed;
      });

      const isBlasting = car.wpm > 25 && car.progress < 0.99;
      car.exhaustFlames.forEach(f => {
        f.visible = isBlasting;
        if (isBlasting) {
          f.scale.set(1 + Math.sin(time * 30) * 0.3, 1 + Math.cos(time * 25) * 0.4, 1);
        }
      });

      if (car.auraBox) {
        car.auraBox.material.opacity = 0.75 + Math.sin(time * 4) * 0.2;
      }
    });

    // 4. Dynamic Smooth Chase Camera
    if (this.playerCarEntry) {
      const pz = this.playerCarEntry.group.position.z;
      const px = this.playerCarEntry.group.position.x;

      const targetCamX = px * 0.35;
      const targetCamY = 3.6 + Math.min(2.0, (this.playerCarEntry.wpm / 120));
      const targetCamZ = pz - 8.8;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.1;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.1;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.1;

      const lookTargetZ = pz + 16.0;
      this.camera.lookAt(px * 0.15, 1.4, lookTargetZ);

      // 5. Dynamic Race Rankings (Typerush Image 2 #1 Tag)
      const sorted = [...this.cars].sort((a, b) => b.progress - a.progress);
      const playerRank = sorted.findIndex(c => c.isPlayer) + 1;
      if (playerRank > 0) {
        this.updatePlayerRankTag(playerRank);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

window.RaceRenderer3D = RaceRenderer3D;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RaceRenderer3D };
}
