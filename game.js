/**
 * Emberwake — Final Fantasy–style 3D RPG (mobile-friendly)
 * Three.js r128 via CDN — no build step
 */
(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────
  const WORLD_SIZE = 40;
  const PLAYER_SPEED = 6;
  const ENCOUNTER_STEPS_MIN = 40;
  const ENCOUNTER_CHANCE = 0.012;
  const CAMERA_DIST = 8;
  const CAMERA_HEIGHT = 5;
  const CAMERA_LAG = 0.08;

  // ─── State ────────────────────────────────────────────────
  const State = {
    TITLE: 'title',
    OVERWORLD: 'overworld',
    COMBAT: 'combat',
    VICTORY: 'victory',
    GAMEOVER: 'gameover',
  };

  let gameState = State.TITLE;
  let gold = 50;
  let potions = 3;
  let ethers = 1;
  let stepsSinceEncounter = 0;
  let encounterLocked = false;

  // Party definitions
  function makeParty() {
    return [
      { id: 'warrior', name: 'Cecil', role: 'Warrior', maxHp: 120, hp: 120, maxMp: 20, mp: 20, atk: 18, def: 10, color: 0x4a90d9, magAtk: 4 },
      { id: 'whitemage', name: 'Rosa', role: 'White Mage', maxHp: 80, hp: 80, maxMp: 60, mp: 60, atk: 8, def: 6, color: 0xf0f0f0, magAtk: 14 },
      { id: 'blackmage', name: 'Rydia', role: 'Black Mage', maxHp: 70, hp: 70, maxMp: 70, mp: 70, atk: 7, def: 5, color: 0x9b59b6, magAtk: 20 },
    ];
  }
  let party = makeParty();

  // Enemy templates
  const ENEMY_TYPES = [
    { name: 'Goblin', color: 0x2ecc71, maxHp: 45, atk: 10, def: 4, xp: 18, gold: 12, shape: 'box' },
    { name: 'Cactuar', color: 0x27ae60, maxHp: 35, atk: 14, def: 3, xp: 22, gold: 8, shape: 'cactus' },
    { name: 'Bomb', color: 0xe74c3c, maxHp: 55, atk: 12, def: 5, xp: 25, gold: 15, shape: 'sphere' },
    { name: 'Imp', color: 0x8e44ad, maxHp: 40, atk: 11, def: 3, xp: 16, gold: 10, shape: 'box' },
  ];

  // ─── DOM ──────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const canvas = $('#game-canvas');
  const titleScreen = $('#title-screen');
  const hud = $('#hud');
  const joystickZone = $('#joystick-zone');
  const joystickBase = $('#joystick-base');
  const joystickKnob = $('#joystick-knob');
  const encounterFlash = $('#encounter-flash');
  const combatUI = $('#combat-ui');
  const enemyPanel = $('#enemy-panel');
  const partyPanel = $('#party-panel');
  const mainMenu = $('#main-menu');
  const magicMenu = $('#magic-menu');
  const itemMenu = $('#item-menu');
  const targetMenu = $('#target-menu');
  const targetButtons = $('#target-buttons');
  const combatLog = $('#combat-log');
  const turnIndicator = $('#turn-indicator');
  const toast = $('#toast');
  const gameoverScreen = $('#gameover-screen');
  const victoryOverlay = $('#victory-overlay');
  const victoryText = $('#victory-text');

  // ─── Three.js core ────────────────────────────────────────
  let renderer, scene, camera, clock;
  let overworldGroup, combatGroup;
  let playerMesh, playerTargetY = 0;
  let keys = {};
  let joy = { active: false, dx: 0, dy: 0, id: null };
  let camOffset = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DIST);
  let camLook = new THREE.Vector3();

  // Combat 3D
  let combatPartyMeshes = [];
  let combatEnemyMeshes = [];
  let combatCameraAngle = 0;

  // Combat logic
  let enemies = [];
  let combatTurnIndex = 0; // index into turnQueue
  let turnQueue = []; // { type:'party'|'enemy', index }
  let pendingAction = null; // { kind, magic?, item? }
  let combatBusy = false;
  let inputEnabled = true;

  function initThree() {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87b5d9);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87b5d9, 18, 55);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, CAMERA_HEIGHT, CAMERA_DIST);

    clock = new THREE.Clock();

    overworldGroup = new THREE.Group();
    combatGroup = new THREE.Group();
    combatGroup.visible = false;
    scene.add(overworldGroup);
    scene.add(combatGroup);

    buildOverworld();
    buildCombatArena();

    window.addEventListener('resize', onResize);
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // ─── Overworld build ──────────────────────────────────────
  function buildOverworld() {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(WORLD_SIZE * 1.5, WORLD_SIZE * 1.5, 32, 32);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const n = Math.sin(x * 0.3) * Math.cos(y * 0.25) * 0.15;
      pos.setZ(i, n);
    }
    groundGeo.computeVertexNormals();
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x4a9c4a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    overworldGroup.add(ground);

    // Grass patches (darker green for encounter zones — whole island is field)
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x3d8b3d });
    for (let i = 0; i < 28; i++) {
      const g = new THREE.Mesh(new THREE.CircleGeometry(1.2 + Math.random() * 1.5, 8), grassMat);
      g.rotation.x = -Math.PI / 2;
      g.position.set((Math.random() - 0.5) * WORLD_SIZE * 0.9, 0.02, (Math.random() - 0.5) * WORLD_SIZE * 0.9);
      overworldGroup.add(g);
    }

    // Water ring (island edge)
    const waterGeo = new THREE.RingGeometry(WORLD_SIZE * 0.72, WORLD_SIZE * 1.1, 48);
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x2a6fad, transparent: true, opacity: 0.85 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.15;
    overworldGroup.add(water);

    // Beach ring
    const beachGeo = new THREE.RingGeometry(WORLD_SIZE * 0.62, WORLD_SIZE * 0.74, 48);
    const beach = new THREE.Mesh(beachGeo, new THREE.MeshLambertMaterial({ color: 0xd4c48a }));
    beach.rotation.x = -Math.PI / 2;
    beach.position.y = 0.01;
    overworldGroup.add(beach);

    // Trees
    for (let i = 0; i < 22; i++) {
      const tx = (Math.random() - 0.5) * WORLD_SIZE * 0.7;
      const tz = (Math.random() - 0.5) * WORLD_SIZE * 0.7;
      if (Math.hypot(tx, tz) < 4) continue;
      overworldGroup.add(makeTree(tx, tz));
    }

    // Rocks
    for (let i = 0; i < 14; i++) {
      const rx = (Math.random() - 0.5) * WORLD_SIZE * 0.65;
      const rz = (Math.random() - 0.5) * WORLD_SIZE * 0.65;
      if (Math.hypot(rx, rz) < 3) continue;
      overworldGroup.add(makeRock(rx, rz));
    }

    // Village marker (simple houses)
    const village = new THREE.Group();
    village.position.set(-8, 0, -10);
    for (let i = 0; i < 3; i++) {
      const house = makeHouse();
      house.position.set(i * 2.2 - 2.2, 0, (i % 2) * 1.5);
      village.add(house);
    }
    // Sign / crystal
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.6, 0),
      new THREE.MeshLambertMaterial({ color: 0x66ccff, emissive: 0x224466 })
    );
    crystal.position.set(0, 1.5, 2.5);
    village.add(crystal);
    overworldGroup.add(village);

    // Dungeon entrance
    const dungeon = new THREE.Group();
    dungeon.position.set(10, 0, 8);
    const arch = new THREE.Mesh(
      new THREE.BoxGeometry(3, 2.5, 1.5),
      new THREE.MeshLambertMaterial({ color: 0x555560 })
    );
    arch.position.y = 1.25;
    dungeon.add(arch);
    const hole = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x111118 })
    );
    hole.position.set(0, 1, 0.7);
    dungeon.add(hole);
    // Torches
    [-1.3, 1.3].forEach((x) => {
      const torch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.8, 6),
        new THREE.MeshLambertMaterial({ color: 0x8b4513 })
      );
      torch.position.set(x, 1.5, 0.9);
      dungeon.add(torch);
      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff6600 })
      );
      flame.position.set(x, 2.0, 0.9);
      dungeon.add(flame);
    });
    overworldGroup.add(dungeon);

    // Lighting
    const ambient = new THREE.AmbientLight(0xb0c4de, 0.55);
    overworldGroup.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff5e0, 0.85);
    sun.position.set(20, 30, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -25;
    sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25;
    sun.shadow.camera.bottom = -25;
    overworldGroup.add(sun);
    const hemi = new THREE.HemisphereLight(0x87b5d9, 0x3d6b3d, 0.35);
    overworldGroup.add(hemi);

    // Player
    playerMesh = makeCharacter(0x4a90d9, 0.9);
    playerMesh.position.set(0, 0, 0);
    overworldGroup.add(playerMesh);
  }

  function makeTree(x, z) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.22, 1.2, 6),
      new THREE.MeshLambertMaterial({ color: 0x6b4226 })
    );
    trunk.position.y = 0.6;
    trunk.castShadow = true;
    g.add(trunk);
    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(0.9, 1.8, 7),
      new THREE.MeshLambertMaterial({ color: 0x228b22 })
    );
    leaves.position.y = 1.8;
    leaves.castShadow = true;
    g.add(leaves);
    const leaves2 = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 1.3, 7),
      new THREE.MeshLambertMaterial({ color: 0x2eaa2e })
    );
    leaves2.position.y = 2.5;
    leaves2.castShadow = true;
    g.add(leaves2);
    g.position.set(x, 0, z);
    return g;
  }

  function makeRock(x, z) {
    const geo = new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.4, 0);
    const mat = new THREE.MeshLambertMaterial({ color: 0x888890 });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, 0.3, z);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    m.scale.y = 0.6 + Math.random() * 0.4;
    m.castShadow = true;
    return m;
  }

  function makeHouse() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 1.4),
      new THREE.MeshLambertMaterial({ color: 0xc4a574 })
    );
    body.position.y = 0.6;
    body.castShadow = true;
    g.add(body);
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.3, 0.9, 4),
      new THREE.MeshLambertMaterial({ color: 0xb5452a })
    );
    roof.position.y = 1.65;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
    return g;
  }

  function makeCharacter(color, scale) {
    // Cylinder + sphere (r128-safe; CapsuleGeometry needs r133+)
    const g = new THREE.Group();

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28 * scale, 0.32 * scale, 0.7 * scale, 8),
      new THREE.MeshLambertMaterial({ color })
    );
    torso.position.y = 0.55 * scale;
    torso.castShadow = true;
    g.add(torso);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22 * scale, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xffdbac })
    );
    head.position.y = 1.05 * scale;
    head.castShadow = true;
    g.add(head);

    // Simple "face" direction marker
    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * scale, 0.08 * scale, 0.12 * scale),
      new THREE.MeshLambertMaterial({ color: 0xe0a080 })
    );
    nose.position.set(0, 1.05 * scale, 0.2 * scale);
    g.add(nose);

    return g;
  }

  // ─── Combat arena ─────────────────────────────────────────
  function buildCombatArena() {
    // Stage floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 14),
      new THREE.MeshLambertMaterial({ color: 0x3a5a3a })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    combatGroup.add(floor);

    // Checker / platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(20, 0.3, 10),
      new THREE.MeshLambertMaterial({ color: 0x4a6a4a })
    );
    platform.position.y = 0.1;
    combatGroup.add(platform);

    // Backdrop hills
    for (let i = 0; i < 5; i++) {
      const hill = new THREE.Mesh(
        new THREE.SphereGeometry(3 + Math.random() * 2, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0x2d5a2d })
      );
      hill.position.set(-8 + i * 4, -1, -8);
      hill.scale.y = 0.5;
      combatGroup.add(hill);
    }

    // Sky-ish back plane
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 20),
      new THREE.MeshBasicMaterial({ color: 0x6a9fd4 })
    );
    back.position.set(0, 8, -12);
    combatGroup.add(back);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    combatGroup.add(ambient);
    const light = new THREE.DirectionalLight(0xfff0dd, 0.8);
    light.position.set(5, 15, 8);
    combatGroup.add(light);
  }

  function makeEnemyMesh(type) {
    const g = new THREE.Group();
    let mesh;
    if (type.shape === 'sphere') {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 10, 10),
        new THREE.MeshLambertMaterial({ color: type.color })
      );
      mesh.position.y = 0.55;
      // Fuse
      const fuse = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.35, 4),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee })
      );
      fuse.position.y = 1.2;
      g.add(fuse);
    } else if (type.shape === 'cactus') {
      mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 1.2, 8),
        new THREE.MeshLambertMaterial({ color: type.color })
      );
      mesh.position.y = 0.6;
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.5, 6),
        new THREE.MeshLambertMaterial({ color: type.color })
      );
      arm.position.set(0.35, 0.8, 0);
      arm.rotation.z = -0.6;
      g.add(arm);
      // Face dots
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      [-0.1, 0.1].forEach((ex) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), eyeMat);
        eye.position.set(ex, 0.9, 0.3);
        g.add(eye);
      });
    } else {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.9, 0.5),
        new THREE.MeshLambertMaterial({ color: type.color })
      );
      mesh.position.y = 0.45;
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 8),
        new THREE.MeshLambertMaterial({ color: type.color })
      );
      head.position.y = 1.05;
      g.add(head);
      // Ears for goblin
      [-0.3, 0.3].forEach((ex) => {
        const ear = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.3, 4),
          new THREE.MeshLambertMaterial({ color: type.color })
        );
        ear.position.set(ex, 1.25, 0);
        g.add(ear);
      });
    }
    mesh.castShadow = true;
    g.add(mesh);
    return g;
  }

  // ─── Joystick ─────────────────────────────────────────────
  function setupJoystick() {
    const onStart = (e) => {
      if (gameState !== State.OVERWORLD) return;
      e.preventDefault();
      const t = e.changedTouches ? e.changedTouches[0] : e;
      joy.active = true;
      joy.id = t.identifier !== undefined ? t.identifier : 'mouse';
      updateJoy(t.clientX, t.clientY);
    };
    const onMove = (e) => {
      if (!joy.active) return;
      e.preventDefault();
      const touches = e.changedTouches || [e];
      for (const t of touches) {
        const id = t.identifier !== undefined ? t.identifier : 'mouse';
        if (id === joy.id) {
          updateJoy(t.clientX, t.clientY);
          break;
        }
      }
    };
    const onEnd = (e) => {
      if (!joy.active) return;
      const touches = e.changedTouches || [e];
      for (const t of touches) {
        const id = t.identifier !== undefined ? t.identifier : 'mouse';
        if (id === joy.id) {
          joy.active = false;
          joy.dx = 0;
          joy.dy = 0;
          joy.id = null;
          joystickKnob.style.transform = 'translate(-50%, -50%)';
          break;
        }
      }
    };

    joystickZone.addEventListener('touchstart', onStart, { passive: false });
    joystickZone.addEventListener('touchmove', onMove, { passive: false });
    joystickZone.addEventListener('touchend', onEnd, { passive: false });
    joystickZone.addEventListener('touchcancel', onEnd, { passive: false });
    joystickZone.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
  }

  function updateJoy(cx, cy) {
    const rect = joystickBase.getBoundingClientRect();
    const cx0 = rect.left + rect.width / 2;
    const cy0 = rect.top + rect.height / 2;
    let dx = cx - cx0;
    let dy = cy - cy0;
    const maxR = rect.width / 2 - 10;
    const len = Math.hypot(dx, dy);
    if (len > maxR) {
      dx = (dx / len) * maxR;
      dy = (dy / len) * maxR;
    }
    joy.dx = dx / maxR;
    joy.dy = dy / maxR;
    joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  // ─── Keyboard ─────────────────────────────────────────────
  function setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  }

  // ─── Overworld update ─────────────────────────────────────
  function updateOverworld(dt) {
    let mx = 0, mz = 0;
    if (keys['KeyW'] || keys['ArrowUp']) mz -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) mz += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
    if (joy.active) {
      mx += joy.dx;
      mz += joy.dy;
    }
    const len = Math.hypot(mx, mz);
    if (len > 0.05) {
      mx /= len;
      mz /= len;
      const speed = PLAYER_SPEED * dt;
      const nx = playerMesh.position.x + mx * speed;
      const nz = playerMesh.position.z + mz * speed;
      const limit = WORLD_SIZE * 0.58;
      playerMesh.position.x = Math.max(-limit, Math.min(limit, nx));
      playerMesh.position.z = Math.max(-limit, Math.min(limit, nz));
      playerMesh.rotation.y = Math.atan2(mx, mz);

      // Bob
      playerMesh.position.y = Math.abs(Math.sin(performance.now() * 0.012)) * 0.08;

      stepsSinceEncounter += speed * 8;
      if (!encounterLocked && stepsSinceEncounter > ENCOUNTER_STEPS_MIN) {
        if (Math.random() < ENCOUNTER_CHANCE * (1 + stepsSinceEncounter / 100)) {
          triggerEncounter();
        }
      }
    } else {
      playerMesh.position.y = 0;
    }

    // Trailing camera
    const ideal = new THREE.Vector3(
      playerMesh.position.x,
      playerMesh.position.y + CAMERA_HEIGHT,
      playerMesh.position.z + CAMERA_DIST
    );
    camera.position.lerp(ideal, CAMERA_LAG * (dt * 60));
    camLook.set(playerMesh.position.x, playerMesh.position.y + 1, playerMesh.position.z);
    camera.lookAt(camLook);

    scene.fog.color.set(0x87b5d9);
    renderer.setClearColor(0x87b5d9);
  }

  // ─── Encounter ────────────────────────────────────────────
  function triggerEncounter() {
    encounterLocked = true;
    stepsSinceEncounter = 0;
    encounterFlash.classList.add('active');
    setTimeout(() => {
      encounterFlash.classList.remove('active');
      startCombat();
    }, 700);
  }

  function startCombat() {
    gameState = State.COMBAT;
    hud.classList.add('hidden');
    joystickZone.classList.add('hidden');
    combatUI.classList.remove('hidden');

    overworldGroup.visible = false;
    combatGroup.visible = true;
    scene.fog.near = 30;
    scene.fog.far = 80;
    scene.fog.color.set(0x6a9fd4);
    renderer.setClearColor(0x6a9fd4);

    // Spawn 1–3 enemies
    const count = 1 + Math.floor(Math.random() * 3);
    enemies = [];
    // Clear old enemy meshes
    combatEnemyMeshes.forEach((m) => combatGroup.remove(m));
    combatEnemyMeshes = [];
    combatPartyMeshes.forEach((m) => combatGroup.remove(m));
    combatPartyMeshes = [];

    for (let i = 0; i < count; i++) {
      const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
      const e = {
        name: type.name + (count > 1 ? ' ' + String.fromCharCode(65 + i) : ''),
        maxHp: type.maxHp + Math.floor(Math.random() * 10),
        hp: 0,
        atk: type.atk,
        def: type.def,
        xp: type.xp,
        gold: type.gold,
        color: type.color,
        shape: type.shape,
        alive: true,
      };
      e.hp = e.maxHp;
      enemies.push(e);
      const mesh = makeEnemyMesh(type);
      const spacing = 2.2;
      const startX = -((count - 1) * spacing) / 2;
      mesh.position.set(startX + i * spacing, 0, -2.5);
      combatGroup.add(mesh);
      combatEnemyMeshes.push(mesh);
    }

    // Party meshes on right
    party.forEach((p, i) => {
      const mesh = makeCharacter(p.color, 0.85);
      mesh.position.set(4.5, 0, -1.5 + i * 1.6);
      mesh.rotation.y = -Math.PI / 2;
      combatGroup.add(mesh);
      combatPartyMeshes.push(mesh);
      if (p.hp <= 0) mesh.visible = false;
    });

    // Camera for side-view-ish
    camera.position.set(0, 5, 9);
    camera.lookAt(1, 1.5, 0);

    combatBusy = false;
    pendingAction = null;
    buildTurnQueue();
    updateCombatUI();
    showMenus('main');
    beginNextTurn();
  }

  function buildTurnQueue() {
    turnQueue = [];
    party.forEach((p, i) => {
      if (p.hp > 0) turnQueue.push({ type: 'party', index: i });
    });
    enemies.forEach((e, i) => {
      if (e.alive) turnQueue.push({ type: 'enemy', index: i });
    });
    combatTurnIndex = 0;
  }

  function currentTurn() {
    return turnQueue[combatTurnIndex] || null;
  }

  function beginNextTurn() {
    // Skip dead
    while (combatTurnIndex < turnQueue.length) {
      const t = turnQueue[combatTurnIndex];
      if (t.type === 'party' && party[t.index].hp > 0) break;
      if (t.type === 'enemy' && enemies[t.index].alive) break;
      combatTurnIndex++;
    }

    if (combatTurnIndex >= turnQueue.length) {
      // New round
      if (checkCombatEnd()) return;
      buildTurnQueue();
      if (turnQueue.length === 0) { checkCombatEnd(); return; }
    }

    if (checkCombatEnd()) return;

    const t = currentTurn();
    updateCombatUI();
    if (t.type === 'party') {
      combatBusy = false;
      inputEnabled = true;
      turnIndicator.textContent = `${party[t.index].name}'s turn`;
      showMenus('main');
      highlightParty(t.index);
    } else {
      combatBusy = true;
      inputEnabled = false;
      turnIndicator.textContent = `${enemies[t.index].name}'s turn`;
      showMenus('none');
      setTimeout(() => enemyAct(t.index), 600);
    }
  }

  function advanceTurn() {
    combatTurnIndex++;
    setTimeout(() => beginNextTurn(), 450);
  }

  function checkCombatEnd() {
    const partyAlive = party.some((p) => p.hp > 0);
    const enemiesAlive = enemies.some((e) => e.alive);
    if (!enemiesAlive) {
      winCombat();
      return true;
    }
    if (!partyAlive) {
      loseCombat();
      return true;
    }
    return false;
  }

  // ─── Combat actions ───────────────────────────────────────
  function showMenus(which) {
    mainMenu.classList.toggle('hidden', which !== 'main');
    magicMenu.classList.toggle('hidden', which !== 'magic');
    itemMenu.classList.toggle('hidden', which !== 'item');
    targetMenu.classList.toggle('hidden', which !== 'target');
    if (which === 'none') {
      mainMenu.classList.add('hidden');
      magicMenu.classList.add('hidden');
      itemMenu.classList.add('hidden');
      targetMenu.classList.add('hidden');
    }
  }

  function highlightParty(idx) {
    document.querySelectorAll('.party-card').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
  }

  function showTargetSelect(forAlly) {
    targetButtons.innerHTML = '';
    if (forAlly) {
      party.forEach((p, i) => {
        if (p.hp <= 0 && pendingAction?.magic !== 'cure' && pendingAction?.item !== 'potion') return;
        // Allow targeting KO for revive? No revive — only living or all for cure
        const btn = document.createElement('button');
        btn.className = 'btn btn-menu';
        btn.textContent = `${p.name} (${p.hp}/${p.maxHp})`;
        if (p.hp <= 0) btn.disabled = true;
        btn.addEventListener('click', () => executeAction(i));
        targetButtons.appendChild(btn);
      });
    } else {
      enemies.forEach((e, i) => {
        if (!e.alive) return;
        const btn = document.createElement('button');
        btn.className = 'btn btn-menu';
        btn.textContent = `${e.name} (${e.hp}/${e.maxHp})`;
        btn.addEventListener('click', () => executeAction(i));
        targetButtons.appendChild(btn);
      });
    }
    showMenus('target');
  }

  function setupCombatMenus() {
    mainMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn || combatBusy || !inputEnabled) return;
      const action = btn.dataset.action;
      const turn = currentTurn();
      if (!turn || turn.type !== 'party') return;

      if (action === 'fight') {
        pendingAction = { kind: 'fight' };
        showTargetSelect(false);
      } else if (action === 'magic') {
        showMenus('magic');
      } else if (action === 'item') {
        $('#potion-count').textContent = 'x' + potions;
        $('#ether-count').textContent = 'x' + ethers;
        showMenus('item');
      } else if (action === 'flee') {
        attemptFlee();
      }
    });

    magicMenu.addEventListener('click', (e) => {
      const back = e.target.closest('[data-action="back"]');
      if (back) { showMenus('main'); return; }
      const btn = e.target.closest('[data-magic]');
      if (!btn || combatBusy || !inputEnabled) return;
      const magic = btn.dataset.magic;
      const turn = currentTurn();
      const actor = party[turn.index];
      const cost = magic === 'fire' ? 4 : 5;
      if (actor.mp < cost) {
        showLog('Not enough MP!');
        return;
      }
      pendingAction = { kind: 'magic', magic };
      if (magic === 'cure') showTargetSelect(true);
      else showTargetSelect(false);
    });

    itemMenu.addEventListener('click', (e) => {
      const back = e.target.closest('[data-action="back"]');
      if (back) { showMenus('main'); return; }
      const btn = e.target.closest('[data-item]');
      if (!btn || combatBusy || !inputEnabled) return;
      const item = btn.dataset.item;
      if (item === 'potion' && potions <= 0) { showLog('No Potions left!'); return; }
      if (item === 'ether' && ethers <= 0) { showLog('No Ethers left!'); return; }
      pendingAction = { kind: 'item', item };
      showTargetSelect(true);
    });

    targetMenu.addEventListener('click', (e) => {
      const back = e.target.closest('[data-action="back-target"]');
      if (back) {
        if (pendingAction?.kind === 'magic') showMenus('magic');
        else if (pendingAction?.kind === 'item') showMenus('item');
        else showMenus('main');
        pendingAction = null;
      }
    });
  }

  function executeAction(targetIdx) {
    if (combatBusy || !pendingAction) return;
    combatBusy = true;
    inputEnabled = false;
    showMenus('none');

    const turn = currentTurn();
    const actor = party[turn.index];
    const act = pendingAction;
    pendingAction = null;

    if (act.kind === 'fight') {
      const target = enemies[targetIdx];
      if (!target || !target.alive) { combatBusy = false; advanceTurn(); return; }
      const dmg = Math.max(1, actor.atk + rand(0, 6) - target.def);
      target.hp = Math.max(0, target.hp - dmg);
      showLog(`${actor.name} attacks ${target.name} for ${dmg}!`);
      animateAttack(combatPartyMeshes[turn.index], combatEnemyMeshes[targetIdx]);
      if (target.hp <= 0) {
        target.alive = false;
        setTimeout(() => {
          showLog(`${target.name} defeated!`);
          if (combatEnemyMeshes[targetIdx]) combatEnemyMeshes[targetIdx].visible = false;
        }, 400);
      }
    } else if (act.kind === 'magic' && act.magic === 'fire') {
      actor.mp -= 4;
      const target = enemies[targetIdx];
      if (!target || !target.alive) { combatBusy = false; advanceTurn(); return; }
      const dmg = Math.max(1, actor.magAtk + rand(4, 12) - Math.floor(target.def / 2));
      target.hp = Math.max(0, target.hp - dmg);
      showLog(`${actor.name} casts Fire! ${target.name} takes ${dmg}!`);
      flashMesh(combatEnemyMeshes[targetIdx], 0xff4400);
      if (target.hp <= 0) {
        target.alive = false;
        setTimeout(() => {
          showLog(`${target.name} defeated!`);
          if (combatEnemyMeshes[targetIdx]) combatEnemyMeshes[targetIdx].visible = false;
        }, 400);
      }
    } else if (act.kind === 'magic' && act.magic === 'cure') {
      actor.mp -= 5;
      const target = party[targetIdx];
      const heal = 25 + rand(0, 15) + Math.floor(actor.magAtk / 2);
      target.hp = Math.min(target.maxHp, target.hp + heal);
      showLog(`${actor.name} casts Cure! ${target.name} recovers ${heal} HP!`);
      flashMesh(combatPartyMeshes[targetIdx], 0x88ff88);
    } else if (act.kind === 'item' && act.item === 'potion') {
      potions--;
      const target = party[targetIdx];
      const heal = 40;
      target.hp = Math.min(target.maxHp, target.hp + heal);
      showLog(`${actor.name} uses Potion! ${target.name} recovers ${heal} HP!`);
      flashMesh(combatPartyMeshes[targetIdx], 0x88ff88);
    } else if (act.kind === 'item' && act.item === 'ether') {
      ethers--;
      const target = party[targetIdx];
      const restore = 30;
      target.mp = Math.min(target.maxMp, target.mp + restore);
      showLog(`${actor.name} uses Ether! ${target.name} recovers ${restore} MP!`);
      flashMesh(combatPartyMeshes[targetIdx], 0x8888ff);
    }

    updateCombatUI();
    setTimeout(() => {
      if (!checkCombatEnd()) advanceTurn();
    }, 900);
  }

  function enemyAct(idx) {
    const enemy = enemies[idx];
    if (!enemy || !enemy.alive) { advanceTurn(); return; }

    // Target random living party member
    const living = party.map((p, i) => ({ p, i })).filter((x) => x.p.hp > 0);
    if (living.length === 0) { checkCombatEnd(); return; }
    const pick = living[Math.floor(Math.random() * living.length)];
    const dmg = Math.max(1, enemy.atk + rand(0, 5) - pick.p.def);
    pick.p.hp = Math.max(0, pick.p.hp - dmg);
    showLog(`${enemy.name} attacks ${pick.p.name} for ${dmg}!`);
    animateAttack(combatEnemyMeshes[idx], combatPartyMeshes[pick.i]);
    if (pick.p.hp <= 0) {
      setTimeout(() => showLog(`${pick.p.name} was defeated!`), 400);
      if (combatPartyMeshes[pick.i]) {
        // Tip over
        combatPartyMeshes[pick.i].rotation.z = Math.PI / 2;
      }
    }
    updateCombatUI();
    setTimeout(() => {
      if (!checkCombatEnd()) advanceTurn();
    }, 900);
  }

  function attemptFlee() {
    combatBusy = true;
    inputEnabled = false;
    showMenus('none');
    if (Math.random() < 0.55) {
      showLog('Got away safely!');
      setTimeout(() => endCombatReturn(), 800);
    } else {
      showLog('Couldn\'t escape!');
      setTimeout(() => advanceTurn(), 800);
    }
  }

  function winCombat() {
    gameState = State.VICTORY;
    let xp = 0, g = 0;
    enemies.forEach((e) => { xp += e.xp; g += e.gold; });
    gold += g;
    // Soft heal a bit of MP/HP as reward feel
    party.forEach((p) => {
      if (p.hp > 0) {
        p.hp = Math.min(p.maxHp, p.hp + 5);
        p.mp = Math.min(p.maxMp, p.mp + 3);
      }
    });
    victoryText.textContent = `Gained ${xp} XP and ${g} Gold!`;
    victoryOverlay.classList.remove('hidden');
    turnIndicator.textContent = '';
    setTimeout(() => {
      victoryOverlay.classList.add('hidden');
      endCombatReturn();
    }, 2200);
  }

  function loseCombat() {
    gameState = State.GAMEOVER;
    combatUI.classList.add('hidden');
    gameoverScreen.classList.remove('hidden');
  }

  function endCombatReturn() {
    combatUI.classList.add('hidden');
    victoryOverlay.classList.add('hidden');
    overworldGroup.visible = true;
    combatGroup.visible = false;
    scene.fog.near = 18;
    scene.fog.far = 55;
    scene.fog.color.set(0x87b5d9);
    renderer.setClearColor(0x87b5d9);

    // Clear combat meshes
    combatEnemyMeshes.forEach((m) => combatGroup.remove(m));
    combatPartyMeshes.forEach((m) => combatGroup.remove(m));
    combatEnemyMeshes = [];
    combatPartyMeshes = [];

    gameState = State.OVERWORLD;
    hud.classList.remove('hidden');
    joystickZone.classList.remove('hidden');
    updateHUD();
    encounterLocked = false;
    stepsSinceEncounter = 0;

    // Reset camera near player
    camera.position.set(
      playerMesh.position.x,
      playerMesh.position.y + CAMERA_HEIGHT,
      playerMesh.position.z + CAMERA_DIST
    );
  }

  // ─── Visual helpers ───────────────────────────────────────
  function showLog(msg) {
    combatLog.textContent = msg;
    combatLog.classList.add('show');
    clearTimeout(showLog._t);
    showLog._t = setTimeout(() => combatLog.classList.remove('show'), 1200);
  }

  function animateAttack(fromMesh, toMesh) {
    if (!fromMesh || !toMesh) return;
    const orig = fromMesh.position.clone();
    const dir = toMesh.position.clone().sub(fromMesh.position).normalize().multiplyScalar(0.6);
    fromMesh.position.add(dir);
    setTimeout(() => { fromMesh.position.copy(orig); }, 200);
  }

  function flashMesh(mesh, color) {
    if (!mesh) return;
    mesh.traverse((c) => {
      if (c.isMesh && c.material) {
        const old = c.material.emissive ? c.material.emissive.getHex() : 0;
        if (c.material.emissive) c.material.emissive.setHex(color);
        setTimeout(() => {
          if (c.material.emissive) c.material.emissive.setHex(0);
        }, 250);
      }
    });
  }

  function rand(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  // ─── Combat UI render ─────────────────────────────────────
  function updateCombatUI() {
    // Enemies
    enemyPanel.innerHTML = enemies.map((e) => `
      <div class="enemy-card ${e.alive ? '' : 'dead'}">
        <div class="name">${e.name}</div>
        <div class="bar-wrap"><div class="bar-hp" style="width:${(e.hp / e.maxHp) * 100}%"></div></div>
      </div>
    `).join('');

    // Party
    partyPanel.innerHTML = party.map((p) => `
      <div class="party-card ${p.hp <= 0 ? 'dead' : ''}">
        <div class="name">${p.name}</div>
        <div class="role">${p.role}</div>
        <div class="bar-row">
          <span class="label">HP</span>
          <div class="bar-wrap"><div class="bar-hp" style="width:${(p.hp / p.maxHp) * 100}%"></div></div>
          <span class="nums">${p.hp}/${p.maxHp}</span>
        </div>
        <div class="bar-row">
          <span class="label">MP</span>
          <div class="bar-wrap"><div class="bar-mp" style="width:${(p.mp / p.maxMp) * 100}%"></div></div>
          <span class="nums">${p.mp}/${p.maxMp}</span>
        </div>
      </div>
    `).join('');

    $('#potion-count').textContent = 'x' + potions;
    $('#ether-count').textContent = 'x' + ethers;
  }

  function updateHUD() {
    $('#hud-gold').textContent = gold;
    $('#hud-location').textContent = 'Verdant Isle';
  }

  // ─── Combat camera drift ──────────────────────────────────
  function updateCombatCamera(dt) {
    combatCameraAngle += dt * 0.15;
    camera.position.x = Math.sin(combatCameraAngle) * 0.8;
    camera.position.y = 5 + Math.sin(combatCameraAngle * 0.7) * 0.2;
    camera.position.z = 9;
    camera.lookAt(1, 1.5, 0);
  }

  // ─── Game flow ────────────────────────────────────────────
  function startGame() {
    party = makeParty();
    gold = 50;
    potions = 3;
    ethers = 1;
    stepsSinceEncounter = 0;
    encounterLocked = false;
    if (playerMesh) playerMesh.position.set(0, 0, 0);

    titleScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    combatUI.classList.add('hidden');
    victoryOverlay.classList.add('hidden');
    hud.classList.remove('hidden');
    joystickZone.classList.remove('hidden');

    overworldGroup.visible = true;
    combatGroup.visible = false;
    gameState = State.OVERWORLD;
    updateHUD();
  }

  function setupUI() {
    $('#btn-start').addEventListener('click', startGame);
    $('#btn-retry').addEventListener('click', () => {
      gameoverScreen.classList.add('hidden');
      // Restore party and return to title-ish restart
      party = makeParty();
      gold = Math.max(0, gold - 20);
      potions = 3;
      ethers = 1;
      endCombatReturn();
      // Soft reset position
      if (playerMesh) playerMesh.position.set(0, 0, 0);
    });
    setupCombatMenus();
  }

  // ─── Main loop ────────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);

    if (gameState === State.OVERWORLD) {
      updateOverworld(dt);
    } else if (gameState === State.COMBAT || gameState === State.VICTORY) {
      updateCombatCamera(dt);
    }

    renderer.render(scene, camera);
  }

  // ─── Boot ─────────────────────────────────────────────────
  function boot() {
    if (typeof THREE === 'undefined') {
      document.body.innerHTML = '<p style="color:#fff;padding:2rem;font-family:sans-serif">Failed to load Three.js. Check your network connection.</p>';
      return;
    }
    initThree();
    setupJoystick();
    setupKeyboard();
    setupUI();
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
