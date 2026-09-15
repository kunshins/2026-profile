import * as THREE from 'three';

export class GhibliWorld {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Theme states: 'day' | 'sunset' | 'night'
    this.theme = 'day';
    this.scrollProgress = 0;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.clock = new THREE.Clock();

    // Palettes
    this.themes = {
      day: {
        skyTop: new THREE.Color(0x62a8de),
        skyBottom: new THREE.Color(0xd7efff),
        fog: new THREE.Color(0xc9e5fc),
        sunLight: new THREE.Color(0xfff7e0),
        ambient: new THREE.Color(0x9bd0ff),
        sunIntensity: 1.4,
        ambientIntensity: 0.75,
        fireflies: false
      },
      sunset: {
        skyTop: new THREE.Color(0x452c5c),
        skyBottom: new THREE.Color(0xff9966),
        fog: new THREE.Color(0xf69f7c),
        sunLight: new THREE.Color(0xffaa66),
        ambient: new THREE.Color(0xff7a6d),
        sunIntensity: 1.6,
        ambientIntensity: 0.8,
        fireflies: true
      },
      night: {
        skyTop: new THREE.Color(0x0a1026),
        skyBottom: new THREE.Color(0x182952),
        fog: new THREE.Color(0x0e1730),
        sunLight: new THREE.Color(0x9ec5fc),
        ambient: new THREE.Color(0x233866),
        sunIntensity: 0.9,
        ambientIntensity: 0.55,
        fireflies: true
      }
    };

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.themes.day.fog, 0.038);

    this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 0.1, 150);
    this.camera.position.set(0, 2.5, 9.5);
    this.cameraTarget = new THREE.Vector3(0, 1.3, 0);
    this.currentTarget = new THREE.Vector3(0, 1.3, 0);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 3. Sky Dome
    this.createSkyDome();

    // 4. Lights
    this.setupLighting();

    // 5. World Elements
    this.createFloatingIsland();
    this.createWindmill();
    this.createSootSprite();
    this.createAnimeClouds();
    this.createParticles();
    this.createPaperAirplane();

    // 6. Listeners
    this.setupEventListeners();

    // 7. Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createSkyDome() {
    const skyGeo = new THREE.SphereGeometry(70, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: this.themes.day.skyTop.clone() },
        bottomColor: { value: this.themes.day.skyBottom.clone() },
        offset: { value: 5.0 },
        exponent: { value: 0.7 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);
  }

  setupLighting() {
    this.ambientLight = new THREE.HemisphereLight(
      this.themes.day.ambient,
      0x403020,
      this.themes.day.ambientIntensity
    );
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(this.themes.day.sunLight, this.themes.day.sunIntensity);
    this.sunLight.position.set(12, 18, 10);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 40;
    this.sunLight.shadow.camera.left = -8;
    this.sunLight.shadow.camera.right = 8;
    this.sunLight.shadow.camera.top = 8;
    this.sunLight.shadow.camera.bottom = -8;
    this.sunLight.shadow.bias = -0.001;
    this.scene.add(this.sunLight);

    // Warm lantern light on windmill
    this.lanternLight = new THREE.PointLight(0xffa834, 2.0, 6);
    this.lanternLight.position.set(-1.1, 2.2, 0.9);
    this.scene.add(this.lanternLight);
  }

  createFloatingIsland() {
    this.islandGroup = new THREE.Group();

    // Top grassy hill (organic curved low poly surface)
    const hillGeo = new THREE.CylinderGeometry(5.2, 4.4, 1.8, 32, 4);
    const hillPos = hillGeo.attributes.position;
    for (let i = 0; i < hillPos.count; i++) {
      const x = hillPos.getX(i);
      const y = hillPos.getY(i);
      const z = hillPos.getZ(i);
      // add gentle undulation
      const noise = Math.sin(x * 1.2) * 0.25 + Math.cos(z * 1.4) * 0.25;
      if (y > 0.4) {
        hillPos.setY(i, y + noise + Math.max(0, 1.0 - (x * x + z * z) * 0.05));
      }
    }
    hillGeo.computeVertexNormals();

    const grassMat = new THREE.MeshToonMaterial({
      color: 0x5ab874,
      roughness: 0.8
    });
    this.grassMat = grassMat;

    const hillMesh = new THREE.Mesh(hillGeo, grassMat);
    hillMesh.position.y = 0.4;
    hillMesh.receiveShadow = true;
    hillMesh.castShadow = true;
    this.islandGroup.add(hillMesh);

    // Earthy rock underbelly
    const rockGeo = new THREE.ConeGeometry(4.3, 4.5, 18);
    const rockMat = new THREE.MeshToonMaterial({
      color: 0x54463a,
      roughness: 0.9
    });
    const rockMesh = new THREE.Mesh(rockGeo, rockMat);
    rockMesh.rotation.x = Math.PI;
    rockMesh.position.y = -2.6;
    rockMesh.castShadow = true;
    this.islandGroup.add(rockMesh);

    // Instanced Grass Blades for animated anime meadow
    this.createInstancedGrass();

    // Cobblestone path
    this.createPath();

    // Wildflowers
    this.createFlowers();

    // Mini floating satellite islands
    this.createSubIslands();

    this.scene.add(this.islandGroup);
  }

  createInstancedGrass() {
    const bladeGeo = new THREE.ConeGeometry(0.04, 0.45, 3);
    bladeGeo.translate(0, 0.225, 0);

    const bladeMat = new THREE.MeshToonMaterial({
      color: 0x76c97a,
      roughness: 0.9
    });

    const count = 450;
    this.grassInstanced = new THREE.InstancedMesh(bladeGeo, bladeMat, count);
    this.grassInstanced.receiveShadow = true;
    this.grassInstanced.castShadow = true;

    const dummy = new THREE.Object3D();
    this.grassData = [];

    for (let i = 0; i < count; i++) {
      // Scatter on the island surface
      const radius = Math.random() * 4.2;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 1.25 + Math.sin(x * 1.2) * 0.15 + Math.cos(z * 1.4) * 0.15;

      const scale = 0.7 + Math.random() * 0.6;
      dummy.position.set(x, y, z);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.z = (Math.random() - 0.5) * 0.2;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      this.grassInstanced.setMatrixAt(i, dummy.matrix);
      this.grassData.push({
        basePos: dummy.position.clone(),
        baseRot: dummy.rotation.clone(),
        scale,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.grassInstanced.instanceMatrix.needsUpdate = true;
    this.islandGroup.add(this.grassInstanced);
  }

  createPath() {
    const stoneMat = new THREE.MeshToonMaterial({ color: 0xb5ab9a });
    const stoneGeo = new THREE.DodecahedronGeometry(0.2, 0);

    for (let i = 0; i < 16; i++) {
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      const t = (i / 16) * 3.5 - 1.0;
      stone.position.set(
        Math.sin(t * 1.2) * 0.5 + 0.5,
        1.32,
        t + 1.2
      );
      stone.scale.set(1.2, 0.25, 0.9);
      stone.rotation.y = Math.random() * Math.PI;
      stone.castShadow = true;
      stone.receiveShadow = true;
      this.islandGroup.add(stone);
    }
  }

  createFlowers() {
    const flowerColors = [0xffd166, 0xff70a6, 0xffffff, 0x8ecae6];
    const flowerGeo = new THREE.SphereGeometry(0.08, 5, 4);

    flowerColors.forEach((col) => {
      const mat = new THREE.MeshToonMaterial({ color: col });
      for (let i = 0; i < 18; i++) {
        const flower = new THREE.Mesh(flowerGeo, mat);
        const r = 1.0 + Math.random() * 3.2;
        const a = Math.random() * Math.PI * 2;
        flower.position.set(
          Math.cos(a) * r,
          1.4 + Math.random() * 0.1,
          Math.sin(a) * r
        );
        flower.scale.set(1, 1.2, 1);
        this.islandGroup.add(flower);
      }
    });
  }

  createSubIslands() {
    // 2 mini islands floating gently nearby
    const miniMatGrass = new THREE.MeshToonMaterial({ color: 0x62c079 });
    const miniMatRock = new THREE.MeshToonMaterial({ color: 0x54463a });

    this.subIslands = [];

    const configs = [
      { x: -5.5, y: -0.5, z: -3.0, scale: 0.9, speed: 0.8 },
      { x: 5.8, y: 1.2, z: -4.5, scale: 0.7, speed: 1.1 }
    ];

    configs.forEach(cfg => {
      const group = new THREE.Group();
      group.position.set(cfg.x, cfg.y, cfg.z);

      const top = new THREE.Mesh(new THREE.CylinderGeometry(1.4 * cfg.scale, 1.0 * cfg.scale, 0.7, 12), miniMatGrass);
      top.position.y = 0.3;
      top.receiveShadow = true;
      group.add(top);

      const bot = new THREE.Mesh(new THREE.ConeGeometry(1.0 * cfg.scale, 1.6 * cfg.scale, 10), miniMatRock);
      bot.rotation.x = Math.PI;
      bot.position.y = -0.8 * cfg.scale;
      group.add(bot);

      // tiny tree on sub-island
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6), new THREE.MeshToonMaterial({ color: 0x5a3d28 }));
      trunk.position.y = 0.8;
      group.add(trunk);

      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 1), new THREE.MeshToonMaterial({ color: 0x389154 }));
      foliage.position.y = 1.25;
      group.add(foliage);

      this.scene.add(group);
      this.subIslands.push({ group, initialY: cfg.y, speed: cfg.speed });
    });
  }

  createWindmill() {
    this.windmillGroup = new THREE.Group();
    this.windmillGroup.position.set(-1.2, 1.3, -0.6);

    // Stone base tower
    const towerGeo = new THREE.CylinderGeometry(0.7, 0.95, 2.4, 12);
    const towerMat = new THREE.MeshToonMaterial({ color: 0xded2c1 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 1.2;
    tower.castShadow = true;
    tower.receiveShadow = true;
    this.windmillGroup.add(tower);

    // Conical roof
    const roofGeo = new THREE.ConeGeometry(0.85, 1.1, 12);
    const roofMat = new THREE.MeshToonMaterial({ color: 0xb34d38 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.95;
    roof.castShadow = true;
    this.windmillGroup.add(roof);

    // Windmill sails hub
    this.sailsHub = new THREE.Group();
    this.sailsHub.position.set(0, 2.3, 0.75);

    const hubGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.25, 8);
    const hubMat = new THREE.MeshToonMaterial({ color: 0x3d2b1f });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.x = Math.PI / 2;
    this.sailsHub.add(hub);

    // 4 Sails
    const bladeGeo = new THREE.BoxGeometry(0.24, 1.7, 0.03);
    bladeGeo.translate(0, 0.85, 0);
    const bladeMat = new THREE.MeshToonMaterial({ color: 0xfdf7eb });
    const woodSparsMat = new THREE.MeshToonMaterial({ color: 0x473224 });

    for (let i = 0; i < 4; i++) {
      const sailArm = new THREE.Group();
      sailArm.rotation.z = (Math.PI / 2) * i;

      // Wooden spar
      const spar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 0.05), woodSparsMat);
      spar.position.y = 0.9;
      sailArm.add(spar);

      // Canvas sail cloth
      const cloth = new THREE.Mesh(bladeGeo, bladeMat);
      cloth.position.x = 0.12;
      cloth.castShadow = true;
      sailArm.add(cloth);

      this.sailsHub.add(sailArm);
    }

    this.windmillGroup.add(this.sailsHub);

    // Vintage lantern mesh
    const lanternGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffcd58 });
    this.lanternMesh = new THREE.Mesh(lanternGeo, lanternMat);
    this.lanternMesh.position.set(0.1, 1.0, 0.95);
    this.windmillGroup.add(this.lanternMesh);

    this.islandGroup.add(this.windmillGroup);
  }

  createSootSprite() {
    // Susuwatari (Ghibli Soot Sprite companion)
    this.sootGroup = new THREE.Group();
    this.sootGroup.position.set(1.4, 1.65, 1.2);

    // Fluffy body
    const bodyGeo = new THREE.DodecahedronGeometry(0.26, 2);
    const bodyMat = new THREE.MeshToonMaterial({ color: 0x111116, roughness: 1.0 });
    this.sootBody = new THREE.Mesh(bodyGeo, bodyMat);
    this.sootBody.castShadow = true;
    this.sootGroup.add(this.sootBody);

    // Spikes/fuzz bristles
    for (let i = 0; i < 24; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.04, 0.14, 4);
      spikeGeo.translate(0, 0.22, 0);
      const spike = new THREE.Mesh(spikeGeo, bodyMat);
      spike.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      this.sootGroup.add(spike);
    }

    // Cute big round eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });

    // Left Eye
    this.leftEye = new THREE.Group();
    this.leftEye.position.set(-0.09, 0.06, 0.22);
    const leftSclera = new THREE.Mesh(eyeGeo, eyeMat);
    this.leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    this.leftPupil.position.z = 0.05;
    this.leftEye.add(leftSclera);
    this.leftEye.add(this.leftPupil);
    this.sootGroup.add(this.leftEye);

    // Right Eye
    this.rightEye = new THREE.Group();
    this.rightEye.position.set(0.09, 0.06, 0.22);
    const rightSclera = new THREE.Mesh(eyeGeo, eyeMat);
    this.rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    this.rightPupil.position.z = 0.05;
    this.rightEye.add(rightSclera);
    this.rightEye.add(this.rightPupil);
    this.sootGroup.add(this.rightEye);

    this.islandGroup.add(this.sootGroup);
    this.sootBasePos = this.sootGroup.position.clone();
    this.blinkTimer = 0;
  }

  createAnimeClouds() {
    this.clouds = [];
    const cloudMat = new THREE.MeshToonMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      roughness: 0.6
    });

    for (let c = 0; c < 7; c++) {
      const cloudGroup = new THREE.Group();
      const puffCount = 5 + Math.floor(Math.random() * 4);

      for (let p = 0; p < puffCount; p++) {
        const radius = 0.8 + Math.random() * 0.9;
        const puffGeo = new THREE.DodecahedronGeometry(radius, 1);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set(
          (p - puffCount / 2) * 1.0 + (Math.random() - 0.5) * 0.4,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.6
        );
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 35,
        4.0 + Math.random() * 6.5,
        -10 - Math.random() * 18
      );
      const scale = 0.8 + Math.random() * 0.7;
      cloudGroup.scale.set(scale, scale * 0.8, scale);

      this.scene.add(cloudGroup);
      this.clouds.push({
        group: cloudGroup,
        speed: 0.4 + Math.random() * 0.6
      });
    }
  }

  createParticles() {
    // Sakura petals and dandelion fluffs (day) & glowing fireflies (sunset/night)
    const particleCount = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: -0.01 - Math.random() * 0.02,
        z: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2
      });

      // Default soft pink / dandelion white
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.88 + Math.random() * 0.12;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circle particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.28,
      map: texture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.particleVelocities = velocities;
    this.scene.add(this.particles);
  }

  createPaperAirplane() {
    // 3D folded paper airplane that soars upon contact submission
    this.airplaneGroup = new THREE.Group();

    const planeGeo = new THREE.BufferGeometry();
    // Low-poly paper airplane folded vertices
    // Nose, left wing tip, right wing tip, keel top, keel bottom
    const vertices = new Float32Array([
      // Left wing triangle: Nose (0, 0, 0.8), Wingtip (-0.6, 0.1, -0.6), Keel Top (0, 0.1, -0.6)
      0, 0, 0.8,   -0.65, 0.1, -0.6,   0, 0.1, -0.6,
      // Right wing triangle: Nose (0,0,0.8), Keel Top (0,0.1,-0.6), Wingtip (0.6, 0.1, -0.6)
      0, 0, 0.8,   0, 0.1, -0.6,   0.65, 0.1, -0.6,
      // Keel body left: Nose (0,0,0.8), Keel Top (0,0.1,-0.6), Keel Bottom (0, -0.2, -0.5)
      0, 0, 0.8,   0, 0.1, -0.6,   0, -0.2, -0.5,
      // Keel body right
      0, 0, 0.8,   0, -0.2, -0.5,   0, 0.1, -0.6
    ]);

    planeGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    planeGeo.computeVertexNormals();

    const paperMat = new THREE.MeshToonMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });

    const planeMesh = new THREE.Mesh(planeGeo, paperMat);
    planeMesh.castShadow = true;
    this.airplaneGroup.add(planeMesh);

    // Initial state: hidden off-screen or scaled down
    this.airplaneGroup.position.set(0, -10, 0);
    this.airplaneGroup.scale.set(0.6, 0.6, 0.6);
    this.scene.add(this.airplaneGroup);
    this.airplaneFlying = false;
    this.airplaneProgress = 0;
  }

  launchPaperAirplane() {
    this.airplaneFlying = true;
    this.airplaneProgress = 0;
    // Position plane right in front of camera
    this.airplaneGroup.position.copy(this.camera.position).add(new THREE.Vector3(0.5, -0.4, -1.5));
    this.airplaneGroup.rotation.set(0.1, 0.2, 0);
    this.airplaneGroup.scale.set(0.7, 0.7, 0.7);
  }

  setTheme(themeName) {
    if (!this.themes[themeName]) return;
    this.theme = themeName;
    const t = this.themes[themeName];

    // Smooth transition
    this.skyMesh.material.uniforms.topColor.value.set(t.skyTop);
    this.skyMesh.material.uniforms.bottomColor.value.set(t.skyBottom);
    this.scene.fog.color.set(t.fog);
    this.ambientLight.color.set(t.ambient);
    this.ambientLight.intensity = t.ambientIntensity;
    this.sunLight.color.set(t.sunLight);
    this.sunLight.intensity = t.sunIntensity;

    // Adjust lantern glow
    if (themeName === 'night') {
      this.lanternLight.intensity = 3.5;
      this.lanternMesh.material.color.set(0xffeb60);
    } else if (themeName === 'sunset') {
      this.lanternLight.intensity = 2.4;
      this.lanternMesh.material.color.set(0xffab40);
    } else {
      this.lanternLight.intensity = 1.0;
      this.lanternMesh.material.color.set(0xffdb7d);
    }

    // Update particle colors
    const colors = this.particles.geometry.attributes.color.array;
    for (let i = 0; i < colors.length / 3; i++) {
      if (themeName === 'night' || themeName === 'sunset') {
        // Glowing yellow-green firefly
        colors[i * 3] = 0.5 + Math.random() * 0.4;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 0.4 + Math.random() * 0.3;
      } else {
        // Sakura petal / dandelion fluff
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 2] = 0.9;
      }
    }
    this.particles.geometry.attributes.color.needsUpdate = true;
  }

  updateScroll(progress) {
    this.scrollProgress = Math.max(0, Math.min(1, progress));
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
      this.mouse.targetY = -(e.clientY / this.height) * 2 + 1;
    });

    // Tap or click on Soot Sprite to bounce
    window.addEventListener('click', (e) => {
      if (!this.sootGroup) return;
      const raycaster = new THREE.Raycaster();
      const mouseVec = new THREE.Vector2(
        (e.clientX / this.width) * 2 - 1,
        -(e.clientY / this.height) * 2 + 1
      );
      raycaster.setFromCamera(mouseVec, this.camera);
      const intersects = raycaster.intersectObject(this.sootBody);
      if (intersects.length > 0) {
        this.sootHop = 1.0;
      }
    });
  }

  animate() {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Mouse Lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // 2. Camera Choreography based on scrollProgress
    // Section 1 (0.0): Hero
    // Section 2 (0.33): About
    // Section 3 (0.66): Projects
    // Section 4 (1.0): Contact
    let targetCamPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();

    if (this.scrollProgress < 0.33) {
      const factor = this.scrollProgress / 0.33;
      targetCamPos.lerpVectors(
        new THREE.Vector3(0, 2.5, 9.5),
        new THREE.Vector3(-2.2, 2.1, 6.4),
        factor
      );
      targetLookAt.lerpVectors(
        new THREE.Vector3(0, 1.3, 0),
        new THREE.Vector3(0.5, 1.5, 0),
        factor
      );
    } else if (this.scrollProgress < 0.66) {
      const factor = (this.scrollProgress - 0.33) / 0.33;
      targetCamPos.lerpVectors(
        new THREE.Vector3(-2.2, 2.1, 6.4),
        new THREE.Vector3(2.6, 4.4, 7.8),
        factor
      );
      targetLookAt.lerpVectors(
        new THREE.Vector3(0.5, 1.5, 0),
        new THREE.Vector3(-0.6, 1.8, 0),
        factor
      );
    } else {
      const factor = (this.scrollProgress - 0.66) / 0.34;
      targetCamPos.lerpVectors(
        new THREE.Vector3(2.6, 4.4, 7.8),
        new THREE.Vector3(0, 1.9, 5.8),
        factor
      );
      targetLookAt.lerpVectors(
        new THREE.Vector3(-0.6, 1.8, 0),
        new THREE.Vector3(0, 1.4, -4.0),
        factor
      );
    }

    // Add gentle mouse parallax to camera
    targetCamPos.x += this.mouse.x * 0.45;
    targetCamPos.y += this.mouse.y * 0.35;

    this.camera.position.lerp(targetCamPos, 0.05);
    this.currentTarget.lerp(targetLookAt, 0.05);
    this.camera.lookAt(this.currentTarget);

    // 3. Windmill Rotation
    if (this.sailsHub) {
      this.sailsHub.rotation.z -= delta * 0.85;
    }

    // 4. Subtle Island floating hover
    if (this.islandGroup) {
      this.islandGroup.position.y = Math.sin(elapsedTime * 0.9) * 0.08;
      this.islandGroup.rotation.y = Math.sin(elapsedTime * 0.3) * 0.02;
    }

    // Mini sub-islands bobbing
    if (this.subIslands) {
      this.subIslands.forEach(sub => {
        sub.group.position.y = sub.initialY + Math.sin(elapsedTime * sub.speed + sub.initialY) * 0.15;
      });
    }

    // 5. Instanced Grass swaying
    if (this.grassInstanced && this.grassData) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.grassData.length; i++) {
        const item = this.grassData[i];
        const wind = Math.sin(elapsedTime * 2.5 + item.phase + item.basePos.x * 0.8) * 0.2;
        dummy.position.copy(item.basePos);
        dummy.rotation.set(
          item.baseRot.x + wind * 0.4,
          item.baseRot.y,
          item.baseRot.z + wind
        );
        dummy.scale.set(item.scale, item.scale, item.scale);
        dummy.updateMatrix();
        this.grassInstanced.setMatrixAt(i, dummy.matrix);
      }
      this.grassInstanced.instanceMatrix.needsUpdate = true;
    }

    // 6. Soot Sprite animations & pupil gaze
    if (this.sootGroup) {
      if (!this.sootHop) this.sootHop = 0;
      this.sootHop = Math.max(0, this.sootHop - delta * 2.0);

      const hopY = Math.sin(this.sootHop * Math.PI) * 0.45;
      const breathe = Math.sin(elapsedTime * 4.0) * 0.04;
      this.sootGroup.position.y = this.sootBasePos.y + hopY + breathe;

      // Look towards mouse
      if (this.leftPupil && this.rightPupil) {
        this.leftPupil.position.x = this.mouse.x * 0.025;
        this.leftPupil.position.y = this.mouse.y * 0.025;
        this.rightPupil.position.x = this.mouse.x * 0.025;
        this.rightPupil.position.y = this.mouse.y * 0.025;
      }

      // Blinking
      this.blinkTimer += delta;
      if (this.blinkTimer > 3.8) {
        const blinkProgress = (this.blinkTimer - 3.8) / 0.25;
        if (blinkProgress < 1.0) {
          const eyeScaleY = Math.abs(Math.sin(blinkProgress * Math.PI - Math.PI / 2));
          this.leftEye.scale.y = eyeScaleY;
          this.rightEye.scale.y = eyeScaleY;
        } else {
          this.leftEye.scale.y = 1.0;
          this.rightEye.scale.y = 1.0;
          this.blinkTimer = 0;
        }
      }
    }

    // 7. Clouds drifting
    if (this.clouds) {
      this.clouds.forEach(cloud => {
        cloud.group.position.x += cloud.speed * delta;
        if (cloud.group.position.x > 28) {
          cloud.group.position.x = -28;
        }
      });
    }

    // 8. Particles drifting
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < this.particleVelocities.length; i++) {
        const vel = this.particleVelocities[i];
        pos[i * 3] += Math.sin(elapsedTime + vel.phase) * 0.015 + 0.008;
        pos[i * 3 + 1] += vel.y * 0.6;
        pos[i * 3 + 2] += Math.cos(elapsedTime + vel.phase) * 0.012;

        // Reset if below floor
        if (pos[i * 3 + 1] < -2.0) {
          pos[i * 3 + 1] = 9.0;
          pos[i * 3] = (Math.random() - 0.5) * 20;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    // 9. Paper Airplane Flight
    if (this.airplaneFlying) {
      this.airplaneProgress += delta * 0.7;
      const t = this.airplaneProgress;

      // Arc path soaring away into the sky
      const currentPos = this.airplaneGroup.position;
      currentPos.x += Math.sin(t * 3.0) * 0.06 - 0.03;
      currentPos.y += Math.cos(t * 2.5) * 0.04 + 0.06;
      currentPos.z -= 0.28; // Fly into the horizon

      this.airplaneGroup.rotation.z = Math.sin(t * 4.0) * 0.25;
      this.airplaneGroup.rotation.x = -0.15 + Math.sin(t * 2.0) * 0.08;

      if (currentPos.z < -35) {
        this.airplaneFlying = false;
        this.airplaneGroup.position.set(0, -10, 0);
      }
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  }
}
