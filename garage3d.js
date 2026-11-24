// ========================================================
// NITRO TYPER 3D - GARAGE & 3D SHOWROOM
// Interactive 3D Turntable for Car Customization
// ========================================================

class GarageShowroom3D {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.carGroup = null;
    this.turntable = null;
    this.isDragging = false;
    this.prevMouseX = 0;
    this.rotationSpeed = 0.006;
    this.animId = null;
    this.currentCarDef = null;

    if (this.container) {
      this.init();
    }
  }

  init() {
    if (typeof THREE === "undefined") {
      setTimeout(() => this.init(), 100);
      return;
    }

    const width = this.container.clientWidth || 320;
    const height = this.container.clientHeight || 240;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090d16);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 2.2, 5.8);
    this.camera.lookAt(0, 0.5, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    dirLight.position.set(5, 10, 5);
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xff007f, 0.8);
    rimLight.position.set(-5, 6, -5);
    this.scene.add(rimLight);

    // Turntable Platform
    this.buildTurntable();

    // Mouse & Touch Orbit Dragging
    this.setupControls();

    // Resize
    window.addEventListener("resize", () => this.onResize());

    this.animate();
  }

  buildTurntable() {
    const tableGeom = new THREE.CylinderGeometry(2.6, 2.7, 0.15, 32);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.8,
      roughness: 0.2
    });
    this.turntable = new THREE.Mesh(tableGeom, tableMat);
    this.turntable.position.set(0, -0.08, 0);
    this.scene.add(this.turntable);

    // Glowing Neon Ring around turntable
    const ringGeom = new THREE.TorusGeometry(2.62, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0, 0);
    this.turntable.add(ring);
  }

  displayCar(carDef) {
    this.currentCarDef = carDef;
    if (this.carGroup) {
      this.scene.remove(this.carGroup);
      this.carGroup = null;
    }

    if (!window.RaceRenderer3D) return;

    // Create car using existing 3D builder
    const carData = RaceRenderer3D.prototype.create3DCar.call(
      { createNameTagSprite: () => new THREE.Group() },
      carDef,
      false,
      ""
    );

    this.carGroup = carData.group;
    this.carGroup.position.set(0, 0, 0);
    this.scene.add(this.carGroup);
  }

  setupControls() {
    const el = this.renderer.domElement;

    const onStart = (clientX) => {
      this.isDragging = true;
      this.prevMouseX = clientX;
    };

    const onMove = (clientX) => {
      if (!this.isDragging || !this.carGroup) return;
      const deltaX = clientX - this.prevMouseX;
      this.carGroup.rotation.y += deltaX * 0.015;
      if (this.turntable) this.turntable.rotation.y += deltaX * 0.015;
      this.prevMouseX = clientX;
    };

    const onEnd = () => {
      this.isDragging = false;
    };

    el.addEventListener("mousedown", (e) => onStart(e.clientX));
    window.addEventListener("mousemove", (e) => onMove(e.clientX));
    window.addEventListener("mouseup", onEnd);

    el.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) onStart(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener("touchend", onEnd);
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    // Slow auto-rotation when user is not manually dragging
    if (!this.isDragging) {
      if (this.carGroup) this.carGroup.rotation.y += this.rotationSpeed;
      if (this.turntable) this.turntable.rotation.y += this.rotationSpeed;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
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
}

window.GarageShowroom3D = GarageShowroom3D;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GarageShowroom3D };
}
