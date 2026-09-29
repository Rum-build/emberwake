/**
 * Emberwake — Phase 1 systems.
 * Inventory, element absorb, spark XP, host strain, FF combat paths.
 * Isle data and catalogs live on window.Emberwake (see ROADMAP.md).
 * Final Fantasy turn structure, Witcher-grey consequences.
 * Three.js r128 via CDN. No build step.
 */
(function () {
  'use strict';

  const EW = window.Emberwake;
  const REGION = EW && EW.regions && EW.regions['verdant-isle'];
  if (!EW || !REGION || !EW.content || !EW.content.gear) {
    const fail = () => {
      document.body.innerHTML = '<p style="color:#f0e6d2;background:#0c1018;padding:2rem;font-family:sans-serif">Emberwake content did not load. js/emberwake.js, js/content/catalog.js, and js/content/verdant-isle.js must run before game.js.</p>';
    };
    if (document.body) fail();
    else document.addEventListener('DOMContentLoaded', fail);
    return;
  }

  const WORLD_SIZE = 40;
  const PLAYER_SPEED = 6.2;
  const CAMERA_DIST = 8;
  const CAMERA_HEIGHT = 5.1;
  const CAMERA_LAG = 0.08;
  const ABSORB_RADIUS = 2.65;
  const ENCOUNTER_STEPS = 120;

  const State = {
    TITLE: 'title',
    PATH: 'path',
    OVERWORLD: 'overworld',
    COMBAT: 'combat',
    VICTORY: 'victory',
    GAMEOVER: 'gameover',
  };

  const ELEMENT_COLOR = EW.content.elementColor;
  const PATH_LABEL = EW.content.pathLabel;
  const WHO_NAME = EW.content.whoName;
  const PATH_STATS = EW.content.pathStats;
  const GEAR = EW.content.gear;
  const ITEM_DEFS = EW.content.items;
  const SHARD_NAME = EW.content.shardName;
  const SPELLS = EW.content.spells;
  function poolDefs() {
    const out = [];
    Object.keys(EW.regions).forEach((id) => {
      (EW.regions[id].pools || []).forEach((pool) => {
        if (!pool.region) pool.region = id;
        out.push(pool);
      });
    });
    return out;
  }
  const POOL_DEFS = poolDefs();
  const ENEMY_TYPES = EW.content.enemies;

  function landmark(id) {
    for (let i = 0; i < REGION.landmarks.length; i++) {
      if (REGION.landmarks[i].id === id) return REGION.landmarks[i];
    }
    return null;
  }

  // ─── Mutable state ────────────────────────────────────────
  let gameState = State.TITLE;
  let spark, party, marks, items, shards, seals, bag, equipped;
  let shardSeq = 1;
  let stepsSinceEncounter = 0;
  let encounterLocked = false;
  let suppressEncountersUntil = 0;
  let inventoryOpen = false;
  let nearPool = null;
  let rumor = '';
  let seenBeats = {};
  let beatHold = {};
  let dialogueOpen = false;
  let dialogueLines = [];
  let dialogueIndex = 0;
  let dialogueOnDone = null;
  let dialogueOnPick = null;
  let dialogueWhere = '';
  let scriptedEncounter = null;
  let silhouetteGone = false;
  let vesperFigure = null;
  let locale = 'field';
  let interiorGroup = null;
  let villageRoom = null;
  let cellarRoom = null;
  let nearDoor = null;
  let nearGate = null;
  let nearReturn = null;
  let scarVerdict = null;
  let regionId = 'verdant-isle';
  let mergeWord = null;
  let duelWord = null;
  let runLive = false;
  const SAVE_KEY = 'emberwake.save.v1';
  let combatsFought = 0;
  let introToastShown = false;
  let pendingBeat = null;
  let victoryTag = null;
  let crawlLatch = false;
  let kilnLatch = false;
  let skyPass = null;
  let eagleGroup = null;
  let waystoneGroup = null;
  let coastGroup = null;
  let stormreachGroup = null;
  let coastVesper = null;
  let combatInRot = false;
  let combatEpoch = 0;
  let enemies = [];
  let turnQueue = [];
  let combatTurnIndex = 0;
  let pendingAction = null;
  let combatBusy = false;
  let inputEnabled = false;

  // ─── DOM ──────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const canvas = $('#game-canvas');
  const titleScreen = $('#title-screen');
  const pathScreen = $('#path-screen');
  const creditsScreen = $('#credits-screen');
  const hud = $('#hud');
  const joystickZone = $('#joystick-zone');
  const joystickBase = $('#joystick-base');
  const joystickKnob = $('#joystick-knob');
  const onscreenActions = $('#onscreen-actions');
  const encounterFlash = $('#encounter-flash');
  const combatUI = $('#combat-ui');
  const enemyPanel = $('#enemy-panel');
  const partyPanel = $('#party-panel');
  const mainMenu = $('#main-menu');
  const pathMenu = $('#path-menu');
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
  const inventoryPanel = $('#inventory-panel');
  const interactPrompt = $('#interact-prompt');

  // ─── Three ────────────────────────────────────────────────
  let renderer, scene, camera, clock;
  let overworldGroup, combatGroup;
  let playerMesh;
  let keys = {};
  let joy = { active: false, dx: 0, dy: 0, id: null };
  let combatPartyMeshes = [];
  let combatEnemyMeshes = [];
  let combatCameraAngle = 0;
  let pools = [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function rand(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  function xpToNext(level) {
    return 28 + level * 16;
  }

  function defaultSpark() {
    return {
      level: 1, xp: 0, path: null, pathXp: 0, pathRank: 1,
      fire: 0, water: 0, lightning: 0, strain: 0, capacity: 3,
    };
  }

  function makeParty() {
    return EW.content.openingParty.map((member) => Object.assign({}, member));
  }

  function joinMember(id) {
    if (findMember(id)) return false;
    const src = EW.content.roster && EW.content.roster[id];
    if (!src) return false;
    const member = Object.assign({}, src);
    member.hp = member.maxHp;
    member.mp = member.maxMp;
    party.push(member);
    const kit = (EW.content.joinKits && EW.content.joinKits[id]) || {};
    equipped[id] = { weapon: kit.weapon || null, armor: kit.armor || null };
    showToast(member.name + ' walks with Lira. The pack is heavier, and more honest.');
    saveGame();
    return true;
  }

  function findMember(id) {
    return party.find((p) => p.id === id);
  }

  function elementTotal() {
    return spark.fire + spark.water + spark.lightning;
  }

  function maxHp(p) {
    let m = p.maxHp;
    if (p.id === 'lira') {
      if (spark.strain >= 80) m -= Math.round(p.maxHp * 0.22);
      else if (spark.strain >= 45) m -= Math.round(p.maxHp * 0.12);
    }
    return Math.max(1, m);
  }

  function clampHostHp() {
    party.forEach((p) => {
      const cap = maxHp(p);
      if (p.hp > cap) p.hp = cap;
    });
  }

  function applyStrain(amount) {
    spark.strain = Math.max(0, Math.min(100, spark.strain + amount));
    clampHostHp();
    tintHost();
  }

  function strainWarning(before) {
    if (before < 90 && spark.strain >= 90) return ' Too much, too fast. The spark is larger than the woman.';
    if (before < 70 && spark.strain >= 70) return ' Her hands shake. Digest slower, or something in her will tear.';
    if (before < 40 && spark.strain >= 40) return ' Her pulse stutters. The host is paying for the meal.';
    return '';
  }

  function grantSparkXp(amount) {
    spark.xp += amount;
    let levels = 0;
    while (spark.level < 12 && spark.xp >= xpToNext(spark.level)) {
      spark.xp -= xpToNext(spark.level);
      spark.level += 1;
      spark.capacity += 1;
      levels += 1;
    }
    return levels;
  }

  function grantPathXp(amount) {
    if (!spark.path || amount <= 0) return false;
    spark.pathXp += amount;
    if (spark.pathXp >= 20) {
      spark.pathXp -= 20;
      spark.pathRank += 1;
      return true;
    }
    return false;
  }

  function gearBonus(id) {
    const eq = equipped[id] || {};
    const out = { atk: 0, def: 0, mag: 0, affinity: null, path: null };
    ['weapon', 'armor'].forEach((slot) => {
      const g = GEAR[eq[slot]];
      if (!g) return;
      out.atk += g.atk || 0;
      out.def += g.def || 0;
      out.mag += g.mag || 0;
      if (g.affinity) out.affinity = g.affinity;
      if (g.path) out.path = g.path;
    });
    return out;
  }

  function actorStats(p) {
    const b = gearBonus(p.id);
    let atk = p.atk + b.atk;
    let def = p.def + b.def;
    let mag = p.magAtk + b.mag;
    if (p.id === 'lira' && b.affinity && spark[b.affinity] > 0) {
      if (b.affinity === 'fire') atk += 4;
      if (b.affinity === 'water') mag += 5;
      if (b.affinity === 'lightning') { atk += 2; mag += 3; }
    }
    if (p.id === 'lira' && b.path && b.path === spark.path) {
      atk += 1;
      mag += 1;
    }
    return { atk, def, mag };
  }

  function commitPath(path, first) {
    const prev = spark.path;
    const stats = PATH_STATS[path];
    const lira = findMember('lira');
    const hpRatio = lira.maxHp > 0 ? lira.hp / lira.maxHp : 1;
    const mpRatio = lira.maxMp > 0 ? lira.mp / lira.maxMp : 1;
    spark.path = path;
    lira.maxHp = stats.maxHp;
    lira.maxMp = stats.maxMp;
    lira.atk = stats.atk;
    lira.def = stats.def;
    lira.magAtk = stats.magAtk;
    lira.role = PATH_LABEL[path] + ' · host';
    if (first) {
      lira.hp = lira.maxHp;
      lira.mp = lira.maxMp;
    } else {
      lira.hp = Math.max(1, Math.round(lira.maxHp * hpRatio));
      lira.mp = Math.round(lira.maxMp * mpRatio);
      if (prev !== path) applyStrain(5);
    }
    clampHostHp();
    return prev !== path;
  }

  function resetRun() {
    spark = defaultSpark();
    party = makeParty();
    marks = 36;
    items = [
      { id: 'tonic', count: 3 },
      { id: 'phial', count: 1 },
      { id: 'rotash', count: 0 },
    ];
    shards = [];
    seals = [];
    shardSeq = 1;
    bag = ['ashwood-blade', 'wellwood-staff', 'reed-bow'];
    equipped = {
      lira: { weapon: 'scout-knife', armor: 'quilt-jerkin' },
    };
    scarVerdict = null;
    regionId = 'verdant-isle';
    mergeWord = null;
    duelWord = null;
    locale = 'field';
    stepsSinceEncounter = 0;
    encounterLocked = false;
    suppressEncountersUntil = 0;
    seenBeats = {};
    beatHold = {};
    dialogueOpen = false;
    dialogueOnDone = null;
    scriptedEncounter = null;
    silhouetteGone = false;
    combatsFought = 0;
    introToastShown = false;
    pendingBeat = null;
    victoryTag = null;
    crawlLatch = false;
    kilnLatch = false;
    skyPass = null;
    if (eagleGroup) {
      eagleGroup.visible = false;
      if (overworldGroup && eagleGroup.parent && eagleGroup.parent !== overworldGroup) {
        eagleGroup.parent.remove(eagleGroup);
        overworldGroup.add(eagleGroup);
      }
    }
    if (coastGroup) coastGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (coastVesper) coastVesper.visible = false;
    sleepWaystone();
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Verdant Isle';
    const dialoguePanel = $('#dialogue');
    if (dialoguePanel) dialoguePanel.classList.add('hidden');
    rumor = 'The leaf-villages pretend the Concord’s seals are mercy.';
    if (playerMesh) {
      playerMesh.position.set(0, 0, 0);
      playerMesh.rotation.set(0, 0, 0);
    }
    pools.forEach(resetPoolVisual);
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = true;
    if (playerMesh && overworldGroup && playerMesh.parent !== overworldGroup) {
      if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
      overworldGroup.add(playerMesh);
    }
    if (scene && scene.fog) {
      scene.fog.color.set(0x87b5d9);
      scene.fog.near = 18;
      scene.fog.far = 55;
    }
    if (renderer) renderer.setClearColor(0x87b5d9);
    inventoryOpen = false;
    inventoryPanel.classList.add('hidden');
    tintHost();
  }

  // ─── Three build ──────────────────────────────────────────
  function initThree() {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x87b5d9);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87b5d9, 18, 55);
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, CAMERA_HEIGHT, CAMERA_DIST);
    clock = new THREE.Clock();

    overworldGroup = new THREE.Group();
    stormreachGroup = new THREE.Group();
    stormreachGroup.visible = false;
    combatGroup = new THREE.Group();
    combatGroup.visible = false;
    scene.add(overworldGroup);
    scene.add(stormreachGroup);
    scene.add(combatGroup);

    buildStormreach();
    buildOverworld();
    buildInteriors();
    buildCoast();
    buildCombatArena();
    window.addEventListener('resize', onResize);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function reservedSpot(x, z) {
    for (let i = 0; i < REGION.landmarks.length; i++) {
      const pin = REGION.landmarks[i];
      if (Math.hypot(x - pin.x, z - pin.z) < pin.clear) return true;
    }
    for (let i = 0; i < POOL_DEFS.length; i++) {
      if (POOL_DEFS[i].interior || POOL_DEFS[i].region !== 'verdant-isle') continue;
      if (Math.hypot(x - POOL_DEFS[i].x, z - POOL_DEFS[i].z) < 4.6) return true;
    }
    return false;
  }

  function buildOverworld() {
    const groundGeo = new THREE.PlaneGeometry(WORLD_SIZE * 1.5, WORLD_SIZE * 1.5, 32, 32);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.3) * Math.cos(y * 0.25) * 0.15);
    }
    groundGeo.computeVertexNormals();
    const ground = new THREE.Mesh(groundGeo, new THREE.MeshLambertMaterial({ color: 0x4a9c4a }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    overworldGroup.add(ground);

    const grassMat = new THREE.MeshLambertMaterial({ color: 0x3d8b3d });
    for (let i = 0; i < 26; i++) {
      const gx = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
      const gz = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
      if (reservedSpot(gx, gz)) continue;
      const g = new THREE.Mesh(new THREE.CircleGeometry(1.1 + Math.random() * 1.4, 8), grassMat);
      g.rotation.x = -Math.PI / 2;
      g.position.set(gx, 0.02, gz);
      overworldGroup.add(g);
    }

    const water = new THREE.Mesh(
      new THREE.RingGeometry(WORLD_SIZE * 0.72, WORLD_SIZE * 1.1, 48),
      new THREE.MeshLambertMaterial({ color: 0x2a6fad, transparent: true, opacity: 0.85 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.15;
    overworldGroup.add(water);

    const beach = new THREE.Mesh(
      new THREE.RingGeometry(WORLD_SIZE * 0.62, WORLD_SIZE * 0.74, 48),
      new THREE.MeshLambertMaterial({ color: 0xd4c48a })
    );
    beach.rotation.x = -Math.PI / 2;
    beach.position.y = 0.01;
    overworldGroup.add(beach);

    for (let i = 0; i < 22; i++) {
      const tx = (Math.random() - 0.5) * WORLD_SIZE * 0.7;
      const tz = (Math.random() - 0.5) * WORLD_SIZE * 0.7;
      if (reservedSpot(tx, tz)) continue;
      overworldGroup.add(makeTree(tx, tz));
    }
    for (let i = 0; i < 12; i++) {
      const rx = (Math.random() - 0.5) * WORLD_SIZE * 0.65;
      const rz = (Math.random() - 0.5) * WORLD_SIZE * 0.65;
      if (reservedSpot(rx, rz)) continue;
      overworldGroup.add(makeRock(rx, rz));
    }

    const villagePin = landmark('leaf-village');
    const village = new THREE.Group();
    village.position.set(villagePin.x, 0, villagePin.z);
    for (let i = 0; i < 3; i++) {
      const house = makeHouse();
      house.position.set(i * 2.2 - 2.2, 0, (i % 2) * 1.5);
      village.add(house);
    }
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.MeshLambertMaterial({ color: 0x88d0c8, emissive: new THREE.Color(0x14302c) })
    );
    crystal.position.set(0, 1.5, 2.4);
    village.add(crystal);
    overworldGroup.add(village);
    const bannerPin = landmark('concord-banner');
    overworldGroup.add(makeConcordBanner(bannerPin.x, bannerPin.z));
    const stonePin = landmark('sleeping-waystone');
    if (stonePin) {
      waystoneGroup = makeWaystone(stonePin.x, stonePin.z);
      overworldGroup.add(waystoneGroup);
    }
    const ridgePin = landmark('vesper-ridge');
    if (ridgePin) {
      vesperFigure = makeSilhouette(ridgePin.x, ridgePin.z);
      overworldGroup.add(vesperFigure);
    }

    const cellarPin = landmark('root-cellar');
    const dungeon = new THREE.Group();
    dungeon.position.set(cellarPin.x, 0, cellarPin.z);
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
    [-1.3, 1.3].forEach((x) => {
      const torch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 0.8, 6),
        new THREE.MeshLambertMaterial({ color: 0x8b4513 })
      );
      torch.position.set(x, 1.5, 0.9);
      dungeon.add(torch);
      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff6600 })
      );
      flame.position.set(x, 2.0, 0.9);
      dungeon.add(flame);
    });
    overworldGroup.add(dungeon);

    POOL_DEFS.forEach((def) => makePool(def));

    overworldGroup.add(new THREE.AmbientLight(0xb0c4de, 0.55));
    const sun = new THREE.DirectionalLight(0xfff5e0, 0.85);
    sun.position.set(20, 30, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const sc = sun.shadow.camera;
    sc.near = 1; sc.far = 80; sc.left = -25; sc.right = 25; sc.top = 25; sc.bottom = -25;
    overworldGroup.add(sun);
    overworldGroup.add(new THREE.HemisphereLight(0x87b5d9, 0x3d6b3d, 0.35));

    const spawnPin = landmark('spawn');
    playerMesh = makeCharacter(0xc47a4a, 0.95);
    playerMesh.position.set(spawnPin.x, 0, spawnPin.z);
    overworldGroup.add(playerMesh);
  }

  function buildInteriors() {
    interiorGroup = new THREE.Group();
    interiorGroup.visible = false;
    interiorGroup.add(new THREE.AmbientLight(0xc8bba8, 0.45));
    interiorGroup.add(new THREE.HemisphereLight(0x8a7a68, 0x2a241c, 0.35));
    villageRoom = buildRoom({
      floor: 0x6a5344,
      wall: 0x8a6a48,
      light: 0xffc48a,
      intensity: 0.85,
    });
    [[-1.4, -1.1, 0xc47a6a], [1.3, -0.8, 0x6a5a48], [0.1, 0.4, 0x6aa8a0]].forEach((spec) => {
      const fig = makeCharacter(spec[2], 0.9);
      fig.position.set(spec[0], 0, spec[1]);
      fig.rotation.y = Math.PI;
      villageRoom.add(fig);
    });
    cellarRoom = buildCellar();
    cellarRoom.visible = false;
    interiorGroup.add(villageRoom);
    interiorGroup.add(cellarRoom);
    pools.forEach((p) => {
      if (p.interior === 'root-cellar' && p.group) cellarRoom.add(p.group);
    });
    scene.add(interiorGroup);
  }

  function buildCellar() {
    const g = buildRoom({
      floor: 0x3a322c,
      wall: 0x4a4038,
      light: 0xff8844,
      intensity: 0.55,
      openNorth: true,
    });
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.4, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x5a4030 })
    );
    shelf.position.set(-2.6, 0.7, -1.2);
    g.add(shelf);
    const coal = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff5500 })
    );
    coal.position.set(0.4, 0.35, -2.4);
    g.add(coal);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x3a322c });
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x2a2420 });
    function box(w, h, d, x, y, z, mat) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      g.add(mesh);
    }
    const throat = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 7.2), floorMat);
    throat.rotation.x = -Math.PI / 2;
    throat.position.set(0, 0.01, -7.6);
    g.add(throat);
    box(0.35, 2.4, 7.2, -1.55, 1.2, -7.6, wallMat);
    box(0.35, 2.4, 7.2, 1.55, 1.2, -7.6, wallMat);
    const throatLight = new THREE.PointLight(0xff6622, 0.4, 9);
    throatLight.position.set(0, 2.1, -7.6);
    g.add(throatLight);

    const crawlFloor = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 7.4), floorMat);
    crawlFloor.rotation.x = -Math.PI / 2;
    crawlFloor.position.set(0, 0.02, -13.6);
    g.add(crawlFloor);
    box(2.2, 2.5, 0.35, -2.1, 1.25, -10.15, wallMat);
    box(2.2, 2.5, 0.35, 2.1, 1.25, -10.15, wallMat);
    box(0.35, 2.5, 7.2, -3.2, 1.25, -13.6, wallMat);
    box(0.35, 2.5, 7.2, 3.2, 1.25, -13.6, wallMat);
    [[-1.8, -12.2], [1.7, -14.1], [-1.3, -15.6], [2.1, -12.8]].forEach((spot) => {
      const jar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.36, 0.72, 8),
        new THREE.MeshLambertMaterial({ color: 0x6a5344 })
      );
      jar.position.set(spot[0], 0.36, spot[1]);
      g.add(jar);
    });
    const crawlLight = new THREE.PointLight(0xff7744, 0.55, 11);
    crawlLight.position.set(0, 2.2, -13.6);
    g.add(crawlLight);

    const kilnFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 7.2),
      new THREE.MeshLambertMaterial({ color: 0x241816 })
    );
    kilnFloor.rotation.x = -Math.PI / 2;
    kilnFloor.position.set(0, 0.03, -20.3);
    g.add(kilnFloor);
    box(2.3, 2.5, 0.35, -2.35, 1.25, -16.75, wallMat);
    box(2.3, 2.5, 0.35, 2.35, 1.25, -16.75, wallMat);
    box(0.35, 2.5, 7.2, -3.55, 1.25, -20.3, wallMat);
    box(0.35, 2.5, 7.2, 3.55, 1.25, -20.3, wallMat);
    box(7.2, 2.5, 0.35, 0, 1.25, -23.75, wallMat);
    const kilnLight = new THREE.PointLight(0xff3300, 1.05, 14);
    kilnLight.position.set(0, 2.1, -21);
    g.add(kilnLight);
    return g;
  }

  function cellarFits(x, z) {
    if (z > 3.45 || z < -23.4) return false;
    if (z >= -4.7 && Math.abs(x) <= 3.45) return true;
    if (z <= -3.9 && z >= -11.0 && Math.abs(x) <= 1.25) return true;
    if (z <= -10.0 && z >= -17.0 && Math.abs(x) <= 2.85) return true;
    if (z <= -16.4 && Math.abs(x) <= 3.15) return true;
    return false;
  }

  function buildRoom(opts) {
    const g = new THREE.Group();
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 9),
      new THREE.MeshLambertMaterial({ color: opts.floor })
    );
    floor.rotation.x = -Math.PI / 2;
    g.add(floor);
    const mat = new THREE.MeshLambertMaterial({ color: opts.wall });
    function addWall(w, d, x, z) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 2.6, d), mat);
      mesh.position.set(x, 1.3, z);
      g.add(mesh);
    }
    if (opts.openNorth) {
      addWall(3.1, 0.35, -2.9, -4.45);
      addWall(3.1, 0.35, 2.9, -4.45);
    } else {
      addWall(9, 0.35, 0, -4.45);
    }
    addWall(3.1, 0.35, -2.9, 4.45);
    addWall(3.1, 0.35, 2.9, 4.45);
    addWall(0.35, 9, -4.45, 0);
    addWall(0.35, 9, 4.45, 0);
    const lamp = new THREE.PointLight(opts.light, opts.intensity, 14);
    lamp.position.set(0, 2.3, -0.4);
    g.add(lamp);
    return g;
  }

  function fieldDoors() {
    const doors = [];
    ['leaf-village', 'root-cellar'].forEach((id) => {
      const pin = landmark(id);
      if (!pin || !pin.interior) return;
      doors.push({
        id: pin.interior,
        x: pin.x,
        z: pin.z,
        title: id === 'leaf-village' ? 'Leaf-village' : 'Root-cellar',
        hint: id === 'leaf-village'
          ? 'Half-shut doors. Smoke, and an argument that will not settle. Press E to go in.'
          : 'The mouth breathes old fire. Press E to step under. The throat at the back is open.',
      });
    });
    return doors;
  }

  function nearestDoor() {
    if (!playerMesh || locale !== 'field' || regionId !== 'verdant-isle') return null;
    let best = null;
    let bestD = 2.8;
    fieldDoors().forEach((door) => {
      const d = Math.hypot(door.x - playerMesh.position.x, door.z - playerMesh.position.z);
      if (d < bestD) { best = door; bestD = d; }
    });
    return best;
  }

  function coastFits(x, z) {
    if (z < 0.55 || z > 11.4) return false;
    if (Math.abs(x) > 10.4) return false;
    if (z < 1.35 && Math.abs(x) > 2.8) return false;
    return true;
  }

  function nearestReturn() {
    if (!playerMesh || locale !== 'field' || regionId !== 'stormreach') return null;
    if (skyPass) return null;
    const pin = coastLandmark('landing');
    if (!pin) return null;
    if (Math.hypot(pin.x - playerMesh.position.x, pin.z - playerMesh.position.z) > 2.5) return null;
    return {
      title: 'The roost',
      hint: 'Press E to take the thermal back to the isle. The vault stays corked.',
    };
  }

  function nearestGate() {
    if (!playerMesh || locale !== 'field' || regionId !== 'verdant-isle' || !seenBeats.coastRoute) return null;
    if (skyPass && skyPass.mode === 'coast') return null;
    const pin = landmark('sleeping-waystone');
    if (!pin) return null;
    const d = Math.hypot(pin.x - playerMesh.position.x, pin.z - playerMesh.position.z);
    if (d > 3.2) return null;
    return {
      title: 'Woken waystone',
      hint: 'The thermal will put your feet on the shale. Press E to land. The vault does not open from the air or the ground.',
    };
  }

  function enterInterior(id, opts) {
    const silent = opts && opts.silent;
    locale = id;
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    interiorGroup.add(playerMesh);
    playerMesh.position.set(0, 0, silent && opts.pos ? opts.pos.z : 3.05);
    if (silent && opts.pos) playerMesh.position.x = opts.pos.x;
    overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    interiorGroup.visible = true;
    villageRoom.visible = id === 'leaf-village';
    cellarRoom.visible = id === 'root-cellar';
    const dusk = id === 'root-cellar' ? 0x1a1410 : 0x3a342c;
    scene.fog.color.set(dusk);
    renderer.setClearColor(dusk);
    beatHold = {};
    const beatKey = id === 'leaf-village' ? 'village' : 'cellar';
    const sceneId = id === 'leaf-village' ? 'village-argument' : 'cellar-threshold';
    if (!seenBeats[beatKey]) {
      const fn = EW.scenes[sceneId];
      if (typeof fn === 'function') fn();
    }
    refreshRumor();
    saveGame();
  }

  function exitInterior() {
    const pinId = locale === 'root-cellar' ? 'root-cellar' : 'leaf-village';
    const pin = landmark(pinId);
    locale = 'field';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    overworldGroup.add(playerMesh);
    playerMesh.position.set(pin.x, 0, pin.z + 2.4);
    interiorGroup.visible = false;
    overworldGroup.visible = true;
    if (stormreachGroup) stormreachGroup.visible = false;
    regionId = 'verdant-isle';
    scene.fog.color.set(0x87b5d9);
    renderer.setClearColor(0x87b5d9);
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Verdant Isle';
    saveGame();
  }

  function regionBeats() {
    const region = EW.regions && EW.regions[regionId];
    return (region && region.beats) || [];
  }

  function makeConcordBanner(x, z) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 2.4, 6),
      new THREE.MeshLambertMaterial({ color: 0x2c2c32 })
    );
    pole.position.y = 1.2;
    g.add(pole);
    const cloth = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.62, 0.06),
      new THREE.MeshLambertMaterial({ color: 0x3a3532 })
    );
    cloth.position.set(0.55, 1.85, 0);
    g.add(cloth);
    const seal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.16, 0),
      new THREE.MeshLambertMaterial({ color: 0xd4c08a, emissive: new THREE.Color(0x443810) })
    );
    seal.position.set(0.55, 1.85, 0.08);
    g.add(seal);
    g.position.set(x, 0, z);
    return g;
  }

  function makeWaystone(x, z) {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 2.15, 0.7),
        new THREE.MeshLambertMaterial({ color: 0x6d727c })
      );
      const a = (i / 3) * Math.PI * 2;
      slab.position.set(Math.cos(a) * 1.25, 1.05, Math.sin(a) * 1.25);
      slab.rotation.y = -a;
      g.add(slab);
    }
    const heartMat = new THREE.MeshLambertMaterial({ color: 0x8aa4b0, emissive: new THREE.Color(0x142028) });
    const heart = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), heartMat);
    heart.position.y = 0.85;
    g.add(heart);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x9fd0ff, transparent: true, opacity: 0, depthWrite: false,
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.22, 3.4, 8), beamMat);
    beam.position.y = 2.5;
    g.add(beam);
    const glow = new THREE.PointLight(0x9ec8ff, 0, 9);
    glow.position.y = 1.5;
    g.add(glow);
    g.userData.heartMat = heartMat;
    g.userData.beamMat = beamMat;
    g.userData.glow = glow;
    g.userData.awake = false;
    g.position.set(x, 0, z);
    return g;
  }

  function wakeWaystone() {
    if (!waystoneGroup) return;
    const data = waystoneGroup.userData;
    data.awake = true;
    if (data.heartMat) {
      data.heartMat.color.setHex(0xd6ecff);
      data.heartMat.emissive.setHex(0x2a6ea8);
    }
    if (data.beamMat) data.beamMat.opacity = 0.8;
    if (data.glow) data.glow.intensity = 1.6;
  }

  function sleepWaystone() {
    if (!waystoneGroup) return;
    const data = waystoneGroup.userData;
    data.awake = false;
    if (data.heartMat) {
      data.heartMat.color.setHex(0x8aa4b0);
      data.heartMat.emissive.setHex(0x142028);
    }
    if (data.beamMat) data.beamMat.opacity = 0;
    if (data.glow) data.glow.intensity = 0;
  }

  function stoneReady() {
    const kiln = pools.find((p) => p.id === 'kiln');
    return !!(kiln && kiln.absorbed && scarVerdict);
  }

  function coastLandmark(id) {
    const region = EW.regions.stormreach;
    if (!region || !region.landmarks) return null;
    for (let i = 0; i < region.landmarks.length; i++) {
      if (region.landmarks[i].id === id) return region.landmarks[i];
    }
    return null;
  }

  function buildStormreach() {
    const g = stormreachGroup;
    g.add(new THREE.AmbientLight(0xc5d0dc, 0.62));
    g.add(new THREE.HemisphereLight(0x9bb0c4, 0x3a3428, 0.38));
    const sun = new THREE.DirectionalLight(0xfff2dc, 0.72);
    sun.position.set(8, 22, 14);
    g.add(sun);

    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshLambertMaterial({ color: 0x163044 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.35;
    g.add(water);

    const shelf = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 16),
      new THREE.MeshLambertMaterial({ color: 0x6a6258 })
    );
    shelf.rotation.x = -Math.PI / 2;
    shelf.position.set(0, 0, 6);
    g.add(shelf);

    const beach = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 5),
      new THREE.MeshLambertMaterial({ color: 0xc2b48c })
    );
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(0, 0.02, 9.2);
    g.add(beach);

    const cliff = new THREE.Mesh(
      new THREE.BoxGeometry(26, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x5a5148 })
    );
    cliff.position.set(0, 3.2, -4.2);
    g.add(cliff);

    const vaultPin = coastLandmark('harbor-vault') || { x: 0.2, z: 0.15 };
    const vault = new THREE.Group();
    vault.position.set(vaultPin.x, 0, vaultPin.z);
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 4.2, 1.2),
      new THREE.MeshBasicMaterial({ color: 0x0c0e14 })
    );
    mouth.position.set(0, 2.3, 0.2);
    vault.add(mouth);
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.48, 0.8),
      new THREE.MeshLambertMaterial({ color: 0x6e675c })
    );
    lintel.position.set(0, 4.5, 0.45);
    vault.add(lintel);
    [-1.55, 1.55].forEach((x) => {
      const jamb = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 4.3, 0.8),
        new THREE.MeshLambertMaterial({ color: 0x6a6258 })
      );
      jamb.position.set(x, 2.2, 0.5);
      vault.add(jamb);
    });
    const seal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.36, 0),
      new THREE.MeshLambertMaterial({ color: 0xe2c878, emissive: new THREE.Color(0x6a5010) })
    );
    seal.position.set(0, 2.5, 0.9);
    vault.add(seal);
    const lamp = new THREE.PointLight(0xd4c08a, 0.95, 16);
    lamp.position.set(0, 3.2, 2.4);
    vault.add(lamp);
    g.add(vault);
    g.add(makeConcordBanner(3.1, 1.4));

    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.4, 3.6, 6),
      new THREE.MeshLambertMaterial({ color: 0x8aa0b8 })
    );
    spire.position.set(-4.8, 1.8, 5.2);
    g.add(spire);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0xd0e8ff, transparent: true, opacity: 0.75 });
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.5, 5), boltMat);
    bolt.position.set(-4.8, 5.4, 5.2);
    g.add(bolt);
    const storm = new THREE.PointLight(0x99c4ff, 1.2, 22);
    storm.position.set(-4.2, 4.2, 6);
    g.add(storm);
    g.userData.boltMat = boltMat;
    g.userData.storm = storm;

    const roostPin = coastLandmark('landing') || { x: 0, z: 9 };
    const roost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.9, 0.35, 8),
      new THREE.MeshLambertMaterial({ color: 0x8a8174 })
    );
    roost.position.set(roostPin.x, 0.2, roostPin.z);
    g.add(roost);

    coastVesper = makeSilhouette(7.4, 8.1);
    g.add(coastVesper);
  }

  function buildCoast() {
    const g = new THREE.Group();
    g.visible = false;
    g.add(new THREE.AmbientLight(0xb7c4d4, 0.62));
    g.add(new THREE.HemisphereLight(0x8aa4c0, 0x2a2418, 0.42));
    const sun = new THREE.DirectionalLight(0xfff0d8, 0.7);
    sun.position.set(12, 20, 16);
    g.add(sun);

    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.MeshLambertMaterial({ color: 0x163044 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.2;
    g.add(water);

    const cliff = new THREE.Mesh(
      new THREE.BoxGeometry(22, 8, 12),
      new THREE.MeshLambertMaterial({ color: 0x5a5148 })
    );
    cliff.position.set(0, 3.4, -11);
    g.add(cliff);
    const shoulder = new THREE.Mesh(
      new THREE.BoxGeometry(8, 5, 7),
      new THREE.MeshLambertMaterial({ color: 0x4a433c })
    );
    shoulder.position.set(-10, 2.2, -6);
    g.add(shoulder);

    const beach = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 9),
      new THREE.MeshLambertMaterial({ color: 0xc2b48c })
    );
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(1, 0.04, -1.5);
    g.add(beach);

    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 4.4, 1.4),
      new THREE.MeshBasicMaterial({ color: 0x0c0e14 })
    );
    mouth.position.set(0.4, 2.5, -4.85);
    g.add(mouth);
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.5, 0.9),
      new THREE.MeshLambertMaterial({ color: 0x6e675c })
    );
    lintel.position.set(0.4, 4.85, -4.6);
    g.add(lintel);
    [-1.7, 2.5].forEach((x) => {
      const jamb = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 4.6, 0.9),
        new THREE.MeshLambertMaterial({ color: 0x6a6258 })
      );
      jamb.position.set(x, 2.4, -4.55);
      g.add(jamb);
    });
    const seal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.38, 0),
      new THREE.MeshLambertMaterial({ color: 0xe2c878, emissive: new THREE.Color(0x6a5010) })
    );
    seal.position.set(0.4, 2.7, -4.05);
    g.add(seal);
    const banner = makeConcordBanner(2.8, -3.2);
    g.add(banner);

    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.38, 3.4, 6),
      new THREE.MeshLambertMaterial({ color: 0x8aa0b8 })
    );
    spire.position.set(-4.6, 8.2, -10);
    g.add(spire);
    const boltMat = new THREE.MeshBasicMaterial({
      color: 0xd0e8ff, transparent: true, opacity: 0.85,
    });
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 7, 5), boltMat);
    bolt.position.set(-4.6, 12.2, -10);
    g.add(bolt);
    const storm = new THREE.PointLight(0x99c4ff, 1.5, 32);
    storm.position.set(-4.2, 9, -6);
    g.add(storm);
    const vaultLamp = new THREE.PointLight(0xd4c08a, 0.9, 14);
    vaultLamp.position.set(0.4, 3.4, -2.2);
    g.add(vaultLamp);
    g.userData.boltMat = boltMat;
    g.userData.storm = storm;
    scene.add(g);
    coastGroup = g;
  }

  function makeSilhouette(x, z) {
    const fig = makeCharacter(0x120c14, 1.35);
    fig.traverse((c) => {
      if (c.isMesh && c.material) {
        c.material = c.material.clone();
        c.material.transparent = true;
        c.material.opacity = 0.88;
      }
    });
    fig.visible = false;
    fig.position.set(x, 0, z);
    return fig;
  }

  function makePool(def) {
    const g = new THREE.Group();
    g.position.set(def.x, 0, def.z);
    const elColor = new THREE.Color(ELEMENT_COLOR[def.element]);
    const rotColor = new THREE.Color(def.vesper ? 0x2a1022 : 0x3a2432);
    const healColor = new THREE.Color(0x2f7a3e);

    const rotMat = new THREE.MeshLambertMaterial({ color: rotColor.clone(), transparent: true, opacity: 0.94 });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(4.3, 28), rotMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.03;
    g.add(disc);

    const lifeMat = new THREE.MeshBasicMaterial({
      color: 0x6ed36a, transparent: true, opacity: 0, depthWrite: false,
    });
    const life = new THREE.Mesh(new THREE.CircleGeometry(4.15, 28), lifeMat);
    life.rotation.x = -Math.PI / 2;
    life.position.y = 0.05;
    g.add(life);

    const coreMat = new THREE.MeshLambertMaterial({
      color: elColor.clone(),
      emissive: elColor.clone().multiplyScalar(0.35),
    });
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), coreMat);
    core.position.y = 1.2;
    g.add(core);

    const beamMat = new THREE.MeshBasicMaterial({
      color: elColor.clone(),
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.62, 8, 10, 1, true), beamMat);
    beam.position.y = 4;
    g.add(beam);

    const spikes = [];
    for (let i = 0; i < 8; i++) {
      const h = 0.6 + (i % 3) * 0.28;
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, h, 5),
        new THREE.MeshLambertMaterial({ color: 0x24141e })
      );
      const a = (i / 8) * Math.PI * 2;
      spike.position.set(Math.cos(a) * 2.2, h / 2, Math.sin(a) * 2.2);
      g.add(spike);
      spikes.push(spike);
    }

    const flowers = [];
    for (let i = 0; i < 11; i++) {
      const flower = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.55, 5),
        new THREE.MeshLambertMaterial({ color: i % 2 ? 0x7dcc6a : 0xe4e08a })
      );
      const a = (i / 11) * Math.PI * 2;
      const rad = 1.15 + (i % 4) * 0.55;
      flower.position.set(Math.cos(a) * rad, 0.28, Math.sin(a) * rad);
      flower.scale.y = 0.001;
      g.add(flower);
      flowers.push(flower);
    }

    const motes = [];
    for (let i = 0; i < 5; i++) {
      const mote = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 6, 6),
        new THREE.MeshBasicMaterial({ color: elColor.clone() })
      );
      g.add(mote);
      motes.push(mote);
    }

    let figure = null;
    if (def.vesper) {
      figure = makeCharacter(0x1a121c, 1.2);
      figure.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.transparent = true;
          c.material.opacity = 0.8;
        }
      });
      g.add(figure);
    }

    let seal = null;
    let sealRing = null;
    if (def.concord || def.patrol) {
      sealRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.12, 6, 14),
        new THREE.MeshLambertMaterial({ color: 0x8d877c })
      );
      sealRing.rotation.x = Math.PI / 2;
      sealRing.position.y = 0.25;
      if (def.patrol) sealRing.visible = false;
      g.add(sealRing);
      seal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.28, 0),
        new THREE.MeshLambertMaterial({ color: 0xe0cc8a, emissive: new THREE.Color(0x554410) })
      );
      seal.position.set(0.15, 1.7, 0.15);
      if (def.patrol) seal.visible = false;
      g.add(seal);
    }

    if (def.patrol) {
      [[1.6, 0.4], [-1.3, 1.1], [0.2, -1.7]].forEach((spot, i) => {
        const fig = makeCharacter(i === 0 ? 0x2a3038 : 0x3e4550, 0.9);
        fig.position.set(spot[0], 0, spot[1]);
        fig.rotation.y = Math.atan2(-spot[0], -spot[1]);
        g.add(fig);
      });
    }

    const pool = {
      id: def.id, element: def.element, name: def.name, short: def.short,
      x: def.x, z: def.z, xp: def.xp, strain: def.strain,
      hint: def.hint, line: def.line, vesper: !!def.vesper, concord: !!def.concord, patrol: !!def.patrol,
      absorbed: false, bottled: false, withheld: false, healing: false, heal: 0,
      interior: def.interior || null,
      region: def.region || 'verdant-isle',
      rotMat, rotColor, healColor, elColor, lifeMat, coreMat, core, beamMat,
      spikes, flowers, motes, figure, seal, sealRing, phase: Math.random() * 6,
      group: g,
    };
    pools.push(pool);
    if (def.interior) g.scale.setScalar(0.42);
    else if (def.region === 'stormreach' && stormreachGroup) stormreachGroup.add(g);
    else overworldGroup.add(g);
    return pool;
  }

  function resetPoolVisual(pool) {
    const def = POOL_DEFS.find((d) => d.id === pool.id);
    pool.absorbed = false;
    pool.healing = false;
    pool.heal = 0;
    if (def) {
      pool.strain = def.strain;
      pool.line = def.line;
      pool.hint = def.hint;
    }
    pool.rotMat.color.copy(pool.rotColor);
    pool.rotMat.opacity = 0.94;
    pool.lifeMat.opacity = 0;
    pool.coreMat.color.copy(pool.elColor);
    pool.coreMat.emissive.copy(pool.elColor).multiplyScalar(0.35);
    pool.beamMat.opacity = 0.2;
    pool.bottled = false;
    pool.withheld = false;
    pool.spikes.forEach((s) => { s.scale.y = 1; s.visible = true; });
    pool.flowers.forEach((f) => { f.scale.y = 0.001; });
    if (pool.figure) {
      pool.figure.visible = true;
      pool.figure.position.y = 0;
      pool.figure.traverse((c) => {
        if (c.isMesh && c.material) c.material.opacity = 0.8;
      });
    }
    if (pool.seal) {
      pool.seal.visible = !pool.patrol;
      pool.seal.rotation.z = 0;
      pool.seal.position.y = 1.7;
    }
    if (pool.sealRing) pool.sealRing.visible = !pool.patrol;
  }

  function updatePools(dt) {
    const t = performance.now() * 0.001;
    pools.forEach((pool) => {
      if (pool.healing && pool.heal < 1) pool.heal = Math.min(1, pool.heal + dt * 0.5);
      const h = pool.absorbed ? pool.heal : 0;
      pool.rotMat.color.copy(pool.rotColor).lerp(pool.healColor, h);
      pool.lifeMat.opacity = h * 0.9;
      pool.coreMat.emissive.copy(pool.elColor).multiplyScalar(0.25 + h * 0.95);
      pool.core.position.y = 1.2 + Math.sin(t * 2 + pool.phase) * 0.12;
      pool.core.rotation.y += dt * 0.7;
      const pulse = 0.16 + Math.sin(t * 2.1 + pool.phase) * 0.06;
      pool.beamMat.opacity = pulse * (1 - h) + 0.07 * h;
      pool.spikes.forEach((s) => {
        s.scale.y = Math.max(0.001, 1 - h);
        s.visible = h < 0.97;
      });
      pool.flowers.forEach((f) => { f.scale.y = Math.max(0.001, h); });
      pool.motes.forEach((m, i) => {
        const a = t * (0.7 + h) + i * 1.25 + pool.phase;
        const rad = 1.05 + (i % 3) * 0.5;
        m.position.set(Math.cos(a) * rad, 0.7 + Math.sin(a * 1.6) * 0.45 + h * 0.3, Math.sin(a) * rad);
      });
      if (pool.figure) {
        pool.figure.position.y = -2.3 * h;
        pool.figure.traverse((c) => {
          if (c.isMesh && c.material) c.material.opacity = 0.8 * (1 - h);
        });
        if (h >= 1) pool.figure.visible = false;
      }
      if (pool.seal && pool.absorbed) {
        pool.seal.rotation.z = 1.35 * h;
        pool.seal.position.y = 1.7 - 1.35 * h;
      }
      if (pool.bottled) {
        pool.beamMat.opacity = 0.04;
        pool.coreMat.emissive.copy(pool.elColor).multiplyScalar(0.04);
      }
    });
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
      new THREE.MeshLambertMaterial({ color: 0x1f7a32 })
    );
    leaves.position.y = 1.8;
    leaves.castShadow = true;
    g.add(leaves);
    const top = new THREE.Mesh(
      new THREE.ConeGeometry(0.65, 1.2, 7),
      new THREE.MeshLambertMaterial({ color: 0x2f9a40 })
    );
    top.position.y = 2.45;
    g.add(top);
    g.position.set(x, 0, z);
    return g;
  }

  function makeRock(x, z) {
    const m = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.4, 0),
      new THREE.MeshLambertMaterial({ color: 0x7e8088 })
    );
    m.position.set(x, 0.28, z);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    m.scale.y = 0.6 + Math.random() * 0.35;
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
      new THREE.MeshLambertMaterial({ color: 0x8e3a28 })
    );
    roof.position.y = 1.65;
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
    return g;
  }

  function makeCharacter(color, scale) {
    const g = new THREE.Group();
    const clothMat = new THREE.MeshLambertMaterial({ color, emissive: new THREE.Color(0x000000) });
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28 * scale, 0.32 * scale, 0.7 * scale, 8),
      clothMat
    );
    torso.position.y = 0.55 * scale;
    torso.castShadow = true;
    g.add(torso);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22 * scale, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0xffdbac, emissive: new THREE.Color(0x000000) })
    );
    head.position.y = 1.05 * scale;
    g.add(head);
    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(0.08 * scale, 0.08 * scale, 0.12 * scale),
      new THREE.MeshLambertMaterial({ color: 0xe0a080 })
    );
    nose.position.set(0, 1.05 * scale, 0.2 * scale);
    g.add(nose);
    g.userData.cloth = clothMat;
    return g;
  }

  function tintHost() {
    const mat = playerMesh && playerMesh.userData.cloth;
    if (!mat || !spark) return;
    if (spark.strain >= 80) mat.emissive.setHex(0x6a2010);
    else if (spark.strain >= 45) mat.emissive.setHex(0x3a140c);
    else mat.emissive.setHex(0x000000);
  }

  function buildCombatArena() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 16),
      new THREE.MeshLambertMaterial({ color: 0x3a4638 })
    );
    floor.rotation.x = -Math.PI / 2;
    combatGroup.add(floor);
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.25, 9),
      new THREE.MeshLambertMaterial({ color: 0x4a5644 })
    );
    platform.position.y = 0.08;
    combatGroup.add(platform);
    for (let i = 0; i < 5; i++) {
      const hill = new THREE.Mesh(
        new THREE.SphereGeometry(2.6 + (i % 3) * 0.4, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0x2a3a30 })
      );
      hill.position.set(-8 + i * 4, -0.8, -7.5);
      hill.scale.y = 0.45;
      combatGroup.add(hill);
    }
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 18),
      new THREE.MeshBasicMaterial({ color: 0x5c6c80 })
    );
    back.position.set(0, 7, -11);
    combatGroup.add(back);
    combatGroup.add(new THREE.AmbientLight(0xe8e0d8, 0.62));
    const light = new THREE.DirectionalLight(0xfff0dd, 0.75);
    light.position.set(4, 14, 8);
    combatGroup.add(light);
  }

  function makeEnemyMesh(enemy) {
    if (enemy.shape === 'human') return makeCharacter(enemy.color, 0.9);
    if (enemy.shape === 'echo') {
      const m = makeCharacter(0x241828, 1.18);
      m.traverse((c) => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          c.material.transparent = true;
          c.material.opacity = 0.84;
          if (c.material.emissive) c.material.emissive.setHex(0x3a1830);
        }
      });
      return m;
    }
    const g = new THREE.Group();
    const color = enemy.color;
    if (enemy.shape === 'kiln') {
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.78, 12, 12),
        new THREE.MeshLambertMaterial({ color, emissive: new THREE.Color(0x6a1808) })
      );
      core.position.y = 0.9;
      g.add(core);
      const crack = new THREE.Mesh(
        new THREE.TorusGeometry(0.46, 0.06, 6, 12),
        new THREE.MeshLambertMaterial({ color: 0xff5500, emissive: new THREE.Color(0x441000) })
      );
      crack.rotation.x = Math.PI / 2;
      crack.position.y = 0.9;
      g.add(crack);
      return g;
    }
    if (enemy.shape === 'sphere') {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.52, 10, 10),
        new THREE.MeshLambertMaterial({ color, emissive: new THREE.Color(0x4a1808) })
      );
      mesh.position.y = 0.55;
      g.add(mesh);
      const horn = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.35, 5),
        new THREE.MeshLambertMaterial({ color: 0x2a120c })
      );
      horn.position.set(0.2, 1.0, 0.1);
      horn.rotation.z = -0.5;
      g.add(horn);
    } else if (enemy.shape === 'bug') {
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.36, 8, 6),
        new THREE.MeshLambertMaterial({ color, emissive: new THREE.Color(0x000000) })
      );
      body.scale.set(1.35, 0.7, 0.95);
      body.position.y = 0.32;
      g.add(body);
      for (let i = 0; i < 6; i++) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 0.4, 4),
          new THREE.MeshLambertMaterial({ color: 0x1c1a14 })
        );
        leg.position.set((i % 2 ? 0.28 : -0.28), 0.2, -0.2 + Math.floor(i / 2) * 0.2);
        leg.rotation.z = i % 2 ? -0.8 : 0.8;
        g.add(leg);
      }
    } else {
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.42, 0.4),
        new THREE.MeshLambertMaterial({ color, emissive: new THREE.Color(0x000000) })
      );
      body.position.set(0, 0.42, 0);
      g.add(body);
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.28, 0.3),
        new THREE.MeshLambertMaterial({ color })
      );
      head.position.set(0.5, 0.58, 0);
      g.add(head);
      [[-0.28, 0.16], [-0.28, -0.16], [0.22, 0.16], [0.22, -0.16]].forEach((pair) => {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.06, 0.32, 5),
          new THREE.MeshLambertMaterial({ color: 0x3a3028 })
        );
        leg.position.set(pair[0], 0.16, pair[1]);
        g.add(leg);
      });
    }
    return g;
  }

  // ─── HUD, toast, inventory ────────────────────────────────
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.add('hidden'), 4600);
  }

  function showLog(msg) {
    combatLog.textContent = msg;
    combatLog.classList.add('show');
    clearTimeout(showLog._t);
    showLog._t = setTimeout(() => combatLog.classList.remove('show'), 1700);
  }

  function refreshRumor() {
    const vesperDone = pools.some((p) => p.id === 'vesper' && p.absorbed);
    const wellDone = pools.some((p) => p.id === 'well' && p.absorbed);
    const left = pools.filter((p) => !p.absorbed && !p.bottled && !p.interior).length;
    const kilnQuiet = pools.some((p) => p.id === 'kiln' && p.absorbed);
    if (seenBeats['vesper-duel']) {
      rumor = duelWord === 'press'
        ? 'Vesper turned the blow on the shale. Nobody fell. The vault is still corked, and the wrist has a number.'
        : 'You held the blow on the shale. Vesper counted the hold and walked away alive. The vault is still corked.';
    } else if (mergeWord === 'plasma') {
      rumor = 'Fire and lightning tried to become plasma between her hands. The word left. It is not a spell.';
    } else if (mergeWord === 'steam') {
      rumor = 'Fire and water fogged the shale and called itself steam. The word left. It is not a spell.';
    } else if (seenBeats['vault-face']) {
      rumor = 'A clerk named the harbor vault and did not open it. The leak beside the door is still weather.';
    } else if (seenBeats['coast-landing'] || regionId === 'stormreach') {
      rumor = 'Feet on Stormreach shale. Kestrel stayed in the air. The cork is ahead, and it knows you are here.';
    } else if (seenBeats.coastRoute) {
      const scarBit = scarVerdict === 'leave'
        ? ' Ilan’s sister still coughs. The vault does not pay that.'
        : scarVerdict === 'drink'
          ? ' The scar’s witnesses will not thank you on the coast either.'
          : '';
      rumor = 'The waystone is awake. Kestrel carried the thermal to a Stormreach vault and did not land. The door stayed corked.' + scarBit;
    } else if (stoneReady() && !seenBeats['waystone-wake']) {
      rumor = 'The kiln is quiet, and the scar has a verdict. The north stones are warm. They have not opened.';
    } else if (scarVerdict === 'leave') {
      rumor = 'Ilan’s sister still coughs at the scar. You left Vesper’s wound in the ground, and took the ash they scraped off it.';
    } else if (scarVerdict === 'drink') {
      rumor = 'You drank the scar in front of Maud and Ilan. The ground may green. They will not thank you.';
    } else if (seenBeats.kestrel) {
      rumor = 'Kestrel crossed the arch and did not land. The waystone is still shut. She will be the road, not the company.';
    } else if (kilnQuiet) {
      rumor = 'The buried kiln is quiet. Something with a wingspan has the ridge.';
    } else if (seenBeats.silhouette) {
      rumor = 'Vesper stood on the ridge and did not offer a fight. She named the coast. The scar in the grass is a different wound.';
    } else if (pools.length && left === 0) {
      rumor = 'Verdant Isle is quieter. The Concord will call this unlicensed, not healed.';
    } else if (vesperDone) {
      rumor = 'Vesper drank here first. You finished the meal. She will notice the absence.';
    } else if (seenBeats.patrol) {
      rumor = 'You watched them cork a spring and call it mercy. The furrow will hear about it.';
    } else if (wellDone) {
      rumor = 'The well-seal is cracked in the pack. Somewhere a clerk is writing your name.';
    } else if (seenBeats.waystone) {
      rumor = 'A waystone sleeps on the north ridge. The road to Stormreach is shut.';
    } else if (seenBeats.village) {
      rumor = 'Inside the leaf-village the argument is still unfinished. Sera wants the seal. Joss wants the furrow.';
    }
    syncSilhouette();
    const el = $('#hud-rumor');
    if (el) el.textContent = rumor;
  }

  function updateHUD() {
    if (!spark || !party) return;
    $('#hud-gold').textContent = String(marks);
    $('#hud-level').textContent = String(spark.level);
    $('#hud-xp').textContent = String(spark.xp);
    $('#hud-xp-next').textContent = String(xpToNext(spark.level));
    $('#el-fire').textContent = String(spark.fire);
    $('#el-water').textContent = String(spark.water);
    $('#el-lightning').textContent = String(spark.lightning);
    $('#strain-nums').textContent = spark.strain + '/100';
    const bar = $('#strain-bar');
    bar.style.width = spark.strain + '%';
    bar.classList.toggle('warn', spark.strain >= 40 && spark.strain < 70);
    bar.classList.toggle('danger', spark.strain >= 70);
    const lira = findMember('lira');
    $('#hud-hp').textContent = 'Lira ' + lira.hp + '/' + maxHp(lira);
    $('#hud-path').textContent = 'Path ' + (spark.path ? PATH_LABEL[spark.path] : '—');
    $('#hud-rumor').textContent = rumor;
    const absorbBtn = $('#btn-absorb');
    const idle = gameState === State.OVERWORLD && !inventoryOpen && !encounterLocked && !dialogueOpen;
    const atExit = idle && locale !== 'field' && playerMesh && playerMesh.position.z > 2.55;
    const kilnGuarded = !!(nearPool && nearPool.id === 'kiln' && !seenBeats.kiln && !nearPool.absorbed);
    const poolReady = !!(nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld && !kilnGuarded);
    const showAbsorb = idle && poolReady && (locale === 'field' ? !nearPool.interior : !atExit);
    const showDoor = idle && locale === 'field' && nearDoor && !showAbsorb;
    const showGate = idle && locale === 'field' && nearGate && !showAbsorb && !showDoor;
    const showReturn = idle && locale === 'field' && nearReturn && !showAbsorb && !showDoor && !showGate;
    absorbBtn.classList.toggle('hidden', !showAbsorb && !showDoor && !atExit && !showGate && !showReturn);
    if (atExit) absorbBtn.textContent = 'Leave';
    else if (showDoor) absorbBtn.textContent = 'Enter';
    else if (showReturn) absorbBtn.textContent = 'Return';
    else if (showGate) absorbBtn.textContent = 'Land';
    else if (showAbsorb) absorbBtn.textContent = 'Absorb ' + nearPool.short;
  }

  function updatePrompt() {
    const atExit = locale !== 'field' && playerMesh && playerMesh.position.z > 2.55;
    if (gameState !== State.OVERWORLD || inventoryOpen || encounterLocked || dialogueOpen || (!nearPool && !nearDoor && !nearGate && !nearReturn && !atExit)) {
      interactPrompt.classList.add('hidden');
      return;
    }
    interactPrompt.classList.remove('hidden');
    if (locale !== 'field' && nearPool && !(playerMesh && playerMesh.position.z > 2.55)) {
      const guarded = nearPool.id === 'kiln' && !seenBeats.kiln && !nearPool.absorbed;
      $('#interact-title').textContent = nearPool.name;
      $('#interact-detail').textContent = guarded
        ? 'Something in the kiln is still feeding. It will not share until it is beaten.'
        : nearPool.absorbed
          ? 'Quiet now. The ground kept what you did not need.'
          : nearPool.hint + ' Tap Absorb (or E).';
      return;
    }
    if (atExit) {
      $('#interact-title').textContent = locale === 'root-cellar' ? 'The mouth' : 'The door';
      $('#interact-detail').textContent = locale === 'root-cellar'
        ? 'Press E to step back onto the isle. The throat stays open behind you.'
        : 'Press E to step back onto the isle.';
      return;
    }
    if (nearDoor && !(nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld)) {
      $('#interact-title').textContent = nearDoor.title;
      $('#interact-detail').textContent = nearDoor.hint;
      return;
    }
    if (nearGate && !(nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld)) {
      $('#interact-title').textContent = nearGate.title;
      $('#interact-detail').textContent = nearGate.hint;
      return;
    }
    if (nearReturn && !(nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld)) {
      $('#interact-title').textContent = nearReturn.title;
      $('#interact-detail').textContent = nearReturn.hint;
      return;
    }
    $('#interact-title').textContent = nearPool.name;
    $('#interact-detail').textContent = nearPool.bottled
      ? 'A Concord seal sits on the mouth. They called this safety while you watched.'
      : nearPool.withheld
      ? 'You told Ilan this scar would stay. The rot stays with it.'
      : nearPool.absorbed
      ? 'Quiet now. The ground kept what you did not need.'
      : nearPool.hint + ' Tap Absorb (or E).';
  }

  function itemCount(id) {
    const stack = items.find((s) => s.id === id);
    return stack ? stack.count : 0;
  }

  function renderInventory() {
    $('#inv-party').innerHTML = party.map((p) => {
      const cap = maxHp(p);
      return `<div class="party-mini"><div><div class="name">${esc(p.name)}</div><div class="role">${esc(p.role)}</div></div><div class="nums">${p.hp}/${cap} HP · ${p.mp}/${p.maxMp} MP</div></div>`;
    }).join('');

    $('#inv-path-row').querySelectorAll('[data-respec]').forEach((btn) => {
      btn.classList.toggle('is-on', btn.dataset.respec === spark.path);
    });

    const roadNote = $('#inv-road-note');
    if (roadNote) {
      const waiting = [];
      if (!findMember('nima')) waiting.push('Nima is still in the leaf-village.');
      if (!findMember('torren')) waiting.push('Torren has not refused the Concord yet.');
      if (seenBeats['coast-landing']) {
        waiting.push('Kestrel set you on the Stormreach shale and stayed in the air. She did not join.');
      } else if (seenBeats.coastRoute) {
        waiting.push('Kestrel opened a thermal to Stormreach. She did not join. The harbor vault stayed corked.');
      } else if (seenBeats.kestrel) {
        waiting.push('Kestrel crossed overhead. She did not join.');
      } else {
        waiting.push('Kestrel is not on this road.');
      }
      if (mergeWord === 'plasma') waiting.push('Plasma tried to exist between her hands. It is not a spell yet.');
      else if (mergeWord === 'steam') waiting.push('Steam tried to exist between her hands. It is not a spell yet.');
      if (seenBeats['vesper-duel']) waiting.push('Vesper measured a blow on the coast and walked away alive.');
      roadNote.textContent = waiting.join(' ');
    }

    $('#equip-slots').innerHTML = party.map((p) => p.id).map((id) => {
      const eq = equipped[id] || { weapon: null, armor: null };
      const weapon = eq.weapon ? GEAR[eq.weapon] : null;
      const armor = eq.armor ? GEAR[eq.armor] : null;
      return `<div class="equip-card">
        <div class="who">${esc(WHO_NAME[id])}</div>
        <div class="line"><span>Weapon: ${weapon ? esc(weapon.name) : 'Empty hands'}</span>${weapon ? `<button class="btn btn-small" type="button" data-act="unequip" data-who="${id}" data-slot="weapon">Stow</button>` : ''}</div>
        <div class="line"><span>Armor: ${armor ? esc(armor.name) : 'None'}</span>${armor ? `<button class="btn btn-small" type="button" data-act="unequip" data-who="${id}" data-slot="armor">Stow</button>` : ''}</div>
      </div>`;
    }).join('');

    $('#inv-gear').innerHTML = bag.length
      ? bag.map((id) => {
        const g = GEAR[id];
        return `<li class="inv-card"><div class="row"><span class="name">${esc(g.name)}</span><button class="btn btn-small" type="button" data-act="equip" data-id="${esc(id)}">Equip on ${esc(WHO_NAME[g.who])}</button></div><div class="desc">${esc(g.desc)}</div></li>`;
      }).join('')
      : '<li class="empty-line">The spare gear is all being worn.</li>';

    $('#inv-items').innerHTML = items.filter((s) => s.count > 0).map((s) => {
      const def = ITEM_DEFS[s.id];
      const use = def.field
        ? `<button class="btn btn-small" type="button" data-act="use" data-id="${esc(s.id)}">Use</button>`
        : '';
      return `<li class="inv-card"><div class="row"><span class="name">${esc(def.name)} ×${s.count}</span>${use}</div><div class="desc">${esc(def.desc)}</div></li>`;
    }).join('') || '<li class="empty-line">No consumables.</li>';

    $('#inv-shards').innerHTML = shards.length
      ? shards.map((sh) => `<li class="inv-card"><div class="row"><span class="name">${esc(sh.name)}</span><button class="btn btn-small" type="button" data-act="digest" data-uid="${esc(sh.uid)}">Digest</button></div><div class="desc">Undigested ${esc(sh.element)}. Clean digestion feeds the spark and strains the host.</div></li>`).join('')
      : '<li class="empty-line">No shards. Whole pools leave none. Fights sometimes do.</li>';

    const keys = [{ name: 'Border Badge', desc: 'Lira’s scout token. The villages still answer to it, for now.' }].concat(seals);
    $('#inv-seals').innerHTML = keys.map((k) => `<li class="inv-card"><div class="name">${esc(k.name)}</div><div class="desc">${esc(k.desc)}</div></li>`).join('');

    $('#inv-level').textContent = String(spark.level);
    $('#inv-xp').textContent = String(spark.xp);
    $('#inv-xp-next').textContent = String(xpToNext(spark.level));
    $('#inv-cap').textContent = String(spark.capacity);
    $('#inv-path').textContent = spark.path ? (PATH_LABEL[spark.path] + ' · rank ' + spark.pathRank) : '—';
    $('#inv-path-xp').textContent = String(spark.pathXp);
    $('#inv-gold').textContent = String(marks);
    let strainText = spark.strain + '/100';
    if (spark.strain >= 80) strainText += ' · Lira’s max HP badly cut';
    else if (spark.strain >= 45) strainText += ' · Lira’s max HP cut';
    $('#inv-strain').textContent = strainText;
    $('#inv-fire').textContent = String(spark.fire);
    $('#inv-water').textContent = String(spark.water);
    $('#inv-lightning').textContent = String(spark.lightning);
  }

  function setFieldControls(visible) {
    const show = !!visible;
    joystickZone.classList.toggle('hidden', !show);
    if (onscreenActions) onscreenActions.classList.toggle('hidden', !show);
    if (!show) {
      joy.active = false;
      joy.dx = 0;
      joy.dy = 0;
      if (joystickKnob) joystickKnob.style.transform = 'translate(-50%, -50%)';
    }
  }

  function setInventory(open) {
    if (open && gameState !== State.OVERWORLD) return;
    inventoryOpen = open;
    inventoryPanel.classList.toggle('hidden', !open);
    if (open) {
      joy.active = false;
      joy.dx = 0;
      joy.dy = 0;
      joystickKnob.style.transform = 'translate(-50%, -50%)';
      setFieldControls(false);
      renderInventory();
    } else if (gameState === State.OVERWORLD && !encounterLocked) {
      setFieldControls(true);
    }
    updateHUD();
    updatePrompt();
  }

  function equipFromBag(gearId) {
    const g = GEAR[gearId];
    if (!g) return;
    const who = g.who;
    const prev = equipped[who][g.slot];
    equipped[who][g.slot] = gearId;
    bag = bag.filter((id) => id !== gearId);
    if (prev) bag.push(prev);
    showToast(WHO_NAME[who] + ' takes up the ' + g.name + '.');
    renderInventory();
  }

  function unequip(who, slot) {
    const id = equipped[who][slot];
    if (!id) return;
    equipped[who][slot] = null;
    bag.push(id);
    showToast(GEAR[id].name + ' goes back in the pack.');
    renderInventory();
  }

  function useFieldItem(id) {
    const stack = items.find((s) => s.id === id);
    const def = ITEM_DEFS[id];
    if (!stack || stack.count <= 0 || !def || !def.field) return;
    if (def.heal) {
      const living = party.filter((p) => p.hp > 0).slice().sort((a, b) => (a.hp / maxHp(a)) - (b.hp / maxHp(b)));
      const t = living[0];
      if (!t || t.hp >= maxHp(t)) { showToast('No one is bleeding.'); return; }
      stack.count -= 1;
      const before = t.hp;
      t.hp = Math.min(maxHp(t), t.hp + def.heal);
      showToast(t.name + ' drinks the ' + def.name + '. ' + (t.hp - before) + ' HP. The bitterness is the point.');
    } else if (def.mp) {
      const living = party.filter((p) => p.hp > 0).slice().sort((a, b) => (a.mp / a.maxMp) - (b.mp / b.maxMp));
      const t = living[0];
      if (!t || t.mp >= t.maxMp) { showToast('Every mind is already full.'); return; }
      stack.count -= 1;
      const before = t.mp;
      t.mp = Math.min(t.maxMp, t.mp + def.mp);
      showToast(t.name + ' takes the ' + def.name + '. ' + (t.mp - before) + ' MP returns.');
    }
    renderInventory();
    updateHUD();
  }

  function digestShard(uid) {
    const idx = shards.findIndex((s) => s.uid === uid);
    if (idx < 0) return;
    const sh = shards[idx];
    shards.splice(idx, 1);
    spark[sh.element] += 1;
    let strain = 8;
    const over = elementTotal() > spark.capacity;
    if (over) strain += 14;
    const before = spark.strain;
    applyStrain(strain);
    const levels = grantSparkXp(12);
    let msg = 'You digest the ' + sh.name + ' cleanly. +1 ' + sh.element + ', +12 XP. Strain ' + spark.strain + '/100.';
    if (over) msg += ' Beyond what she can hold. It scorches.';
    if (levels) msg += ' The spark reaches level ' + spark.level + '. Capacity ' + spark.capacity + '.';
    msg += strainWarning(before);
    showToast(msg);
    renderInventory();
    updateHUD();
  }

  function makeShard(element) {
    const sh = { uid: 's' + (shardSeq++), element, name: SHARD_NAME[element] };
    shards.push(sh);
    return sh;
  }

  function addRotAsh() {
    const stack = items.find((s) => s.id === 'rotash');
    if (stack) stack.count += 1;
  }

  // ─── Overworld ────────────────────────────────────────────
  function poolInLocale(pool) {
    if (pool.interior) return locale === pool.interior;
    if ((pool.region || 'verdant-isle') !== regionId) return false;
    return locale === 'field';
  }

  function nearestPool() {
    if (!playerMesh) return null;
    let best = null;
    let bestD = ABSORB_RADIUS;
    pools.forEach((p) => {
      if (!poolInLocale(p)) return;
      const d = Math.hypot(p.x - playerMesh.position.x, p.z - playerMesh.position.z);
      if (d < bestD) { best = p; bestD = d; }
    });
    return best;
  }

  function rotPressure() {
    if (!playerMesh || locale !== 'field') return 0;
    let pressure = 0;
    pools.forEach((pool) => {
      if (pool.absorbed || pool.interior) return;
      if ((pool.region || 'verdant-isle') !== regionId) return;
      const d = Math.hypot(pool.x - playerMesh.position.x, pool.z - playerMesh.position.z);
      if (d < 8) pressure += (8 - d) / 8;
    });
    return pressure;
  }

  function tryInteract() {
    if (gameState !== State.OVERWORLD || inventoryOpen || encounterLocked || dialogueOpen) return;
    if (locale !== 'field') {
      const atMouth = playerMesh && playerMesh.position.z > 2.55;
      if (nearPool && !atMouth) {
        tryAbsorb();
        return;
      }
      if (atMouth) exitInterior();
      return;
    }
    const poolReady = nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld;
    if (poolReady || (nearPool && !nearDoor && !nearGate && !nearReturn)) {
      tryAbsorb();
      return;
    }
    if (nearDoor) {
      enterInterior(nearDoor.id);
      return;
    }
    if (nearGate) {
      landOnCoast();
      return;
    }
    if (nearReturn) returnToIsle();
  }

  function tryAbsorb() {
    if (gameState !== State.OVERWORLD || inventoryOpen || encounterLocked || dialogueOpen) return;
    if (!nearPool) return;
    if (nearPool.withheld) {
      showToast('You told Ilan the scar would stay. Breaking that in front of the isle is a smaller, uglier theft.');
      return;
    }
    if (nearPool.bottled) {
      showToast('The seal is already on. Cracking it in the open is how rot learns your name. The well in the south is a different theft.');
      return;
    }
    if (nearPool.absorbed) {
      showToast('This pool is quiet. The land already kept the scrap.');
      return;
    }
    if (nearPool.id === 'kiln' && !seenBeats.kiln) {
      showToast('The kiln still has a tenant. It eats before it offers.');
      return;
    }
    const pool = nearPool;
    pool.absorbed = true;
    pool.healing = true;
    pool.heal = 0;
    spark[pool.element] += 1;
    const over = elementTotal() > spark.capacity;
    let strain = pool.strain + (over ? 15 : 0);
    const before = spark.strain;
    applyStrain(strain);
    let bite = '';
    if (spark.strain >= 90) {
      const lira = findMember('lira');
      lira.hp = Math.max(1, lira.hp - 10);
      bite = ' The excess bites. She keeps her feet.';
    }
    if (pool.concord) {
      seals.push({
        name: 'Cracked Well Seal',
        desc: 'Ashen Concord licence, split. Cracking it further in the open is how rot learns your name.',
      });
    }
    const levels = grantSparkXp(pool.xp);
    suppressEncountersUntil = performance.now() + 3400;
    let msg = pool.line + ' +' + pool.xp + ' XP. Strain ' + spark.strain + '/100.';
    if (over) msg += ' Beyond what she can hold — the excess scorches.';
    if (levels) msg += ' Spark level ' + spark.level + '. Capacity ' + spark.capacity + '.';
    msg += strainWarning(before) + bite;
    showToast(msg);
    refreshRumor();
    updateHUD();
    updatePrompt();
    saveGame();
  }

  function fireBeat(b) {
    const sceneFn = b.scene && EW.scenes[b.scene];
    if (typeof sceneFn === 'function') {
      const played = sceneFn(b);
      if (played === false) {
        beatHold[b.id] = true;
        return;
      }
    } else showToast(b.toast);
    if (dialogueOpen) pendingBeat = b.id;
    else seenBeats[b.id] = true;
    refreshRumor();
  }

  function syncSilhouette() {
    if (!vesperFigure) return;
    vesperFigure.visible = actReady() && !silhouetteGone;
  }

  function actReady() {
    const ember = pools.find((p) => p.id === 'ember');
    return !!(seenBeats.village && seenBeats.patrol && ember && ember.absorbed);
  }

  function updateCellarTriggers() {
    if (locale !== 'root-cellar' || !playerMesh) return;
    const z = playerMesh.position.z;
    if (z > -9) crawlLatch = false;
    if (z > -15.5) kilnLatch = false;
    if (!seenBeats.cellarCrawl && !crawlLatch && z < -11.2) {
      crawlLatch = true;
      beginScriptedFight(['mite', 'mite'], 'cellar-crawl');
      return;
    }
    if (seenBeats.cellarCrawl && !seenBeats.kiln && !kilnLatch && z < -18.2) {
      kilnLatch = true;
      beginScriptedFight(['kiln-heart'], 'kiln-heart');
    }
  }

  function beginScriptedFight(ids, tag) {
    scriptedEncounter = ids;
    victoryTag = tag || null;
    triggerEncounter();
  }

  function noteVictory() {
    const tag = victoryTag;
    victoryTag = null;
    if (tag === 'cellar-crawl') seenBeats.cellarCrawl = true;
    if (tag === 'kiln-heart') seenBeats.kiln = true;
    return tag;
  }

  function bottlePool(id) {
    const pool = pools.find((p) => p.id === id);
    if (!pool || pool.bottled) return;
    pool.bottled = true;
    if (pool.seal) pool.seal.visible = true;
    if (pool.sealRing) pool.sealRing.visible = true;
    if (pool.beamMat) pool.beamMat.opacity = 0.04;
    refreshRumor();
  }

  function updateOverworld(dt) {
    const camTarget = playerMesh.position;
    const coasting = !!(skyPass && (skyPass.mode === 'coast' || skyPass.mode === 'land'));
    if (waystoneGroup && waystoneGroup.userData.awake && waystoneGroup.userData.beamMat) {
      waystoneGroup.userData.beamMat.opacity = 0.55 + Math.sin(performance.now() * 0.004) * 0.25;
    }
    if (stormreachGroup && stormreachGroup.visible && stormreachGroup.userData.boltMat) {
      const pulse = Math.abs(Math.sin(performance.now() * 0.006));
      stormreachGroup.userData.boltMat.opacity = 0.35 + pulse * 0.45;
      if (stormreachGroup.userData.storm) stormreachGroup.userData.storm.intensity = 0.7 + pulse * 0.6;
    }
    if (coasting) {
      nearPool = null;
      nearDoor = null;
      nearGate = null;
      nearReturn = null;
      joy.active = false;
      joy.dx = 0;
      joy.dy = 0;
    } else if (!inventoryOpen && !encounterLocked && !dialogueOpen) {
      let mx = 0;
      let mz = 0;
      if (keys.KeyW || keys.ArrowUp) mz -= 1;
      if (keys.KeyS || keys.ArrowDown) mz += 1;
      if (keys.KeyA || keys.ArrowLeft) mx -= 1;
      if (keys.KeyD || keys.ArrowRight) mx += 1;
      if (joy.active) { mx += joy.dx; mz += joy.dy; }
      const len = Math.hypot(mx, mz);
      if (len > 0.08) {
        mx /= len;
        mz /= len;
        const speed = PLAYER_SPEED * dt;
        const nx = playerMesh.position.x + mx * speed;
        const nz = playerMesh.position.z + mz * speed;
        if (locale === 'field' && regionId === 'stormreach') {
          if (coastFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (coastFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'field') {
          const limit = WORLD_SIZE * 0.58;
          playerMesh.position.x = Math.max(-limit, Math.min(limit, nx));
          playerMesh.position.z = Math.max(-limit, Math.min(limit, nz));
        } else if (locale === 'leaf-village') {
          playerMesh.position.x = Math.max(-3.45, Math.min(3.45, nx));
          playerMesh.position.z = Math.max(-3.45, Math.min(3.45, nz));
        } else {
          if (cellarFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (cellarFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        }
        playerMesh.rotation.y = Math.atan2(mx, mz);
        playerMesh.position.y = Math.abs(Math.sin(performance.now() * 0.012)) * 0.08;
        stepsSinceEncounter += speed * 10;
        nearPool = nearestPool();
        nearDoor = nearestDoor();
        nearGate = nearestGate();
        nearReturn = nearestReturn();
        const safe = nearPool && !nearPool.absorbed;
        const cooled = performance.now() < suppressEncountersUntil;
        if (locale === 'field' && regionId === 'verdant-isle' && !safe && !cooled && stepsSinceEncounter > ENCOUNTER_STEPS) {
          const pressure = rotPressure();
          const chancePerSec = 0.32 + pressure * 0.7;
          if (Math.random() < chancePerSec * dt) triggerEncounter();
        }
      } else {
        playerMesh.position.y = 0;
        nearPool = nearestPool();
        nearDoor = nearestDoor();
        nearGate = nearestGate();
        nearReturn = nearestReturn();
      }

      updateCellarTriggers();
      maybeResumeCoast();

      if (locale === 'field') regionBeats().forEach((b) => {
        const inside = Math.hypot(b.x - playerMesh.position.x, b.z - playerMesh.position.z) < b.r;
        if (!inside) {
          beatHold[b.id] = false;
          return;
        }
        if (seenBeats[b.id] || beatHold[b.id]) return;
        fireBeat(b);
      });
    } else if (!coasting) {
      nearPool = nearestPool();
      nearDoor = nearestDoor();
      nearGate = nearestGate();
      nearReturn = nearestReturn();
      playerMesh.position.y = 0;
    }

    if (skyPass) updateSkyPass(dt);
    else {
      const ideal = new THREE.Vector3(camTarget.x, camTarget.y + CAMERA_HEIGHT, camTarget.z + CAMERA_DIST);
      camera.position.lerp(ideal, CAMERA_LAG * (dt * 60));
      camera.lookAt(camTarget.x, camTarget.y + 1, camTarget.z);
    }
    tintHost();
    updateHUD();
    updatePrompt();
  }

  function triggerEncounter() {
    encounterLocked = true;
    stepsSinceEncounter = 0;
    combatInRot = rotPressure() > 0.45;
    if (inventoryOpen) setInventory(false);
    joy.active = false;
    joy.dx = 0;
    joy.dy = 0;
    joystickKnob.style.transform = 'translate(-50%, -50%)';
    encounterFlash.classList.add('active');
    setTimeout(() => {
      encounterFlash.classList.remove('active');
      if (gameState === State.GAMEOVER) return;
      startCombat();
    }, 700);
  }

  // ─── Combat ───────────────────────────────────────────────
  function later(fn, ms) {
    const epoch = combatEpoch;
    setTimeout(() => {
      if (epoch !== combatEpoch) return;
      fn();
    }, ms);
  }

  function rollEncounter() {
    const pressure = rotPressure();
    const echoReady = spark.strain >= 28 || pools.some((p) => p.vesper && p.absorbed) || combatsFought >= 2;
    if (echoReady && Math.random() < 0.14) return [spawnEnemy('echo')];
    const n = 1 + (Math.random() < (pressure > 0.5 ? 0.75 : 0.45) ? 1 : 0) + (pressure > 0.8 && Math.random() < 0.35 ? 1 : 0);
    const table = pressure > 0.35
      ? ['hare', 'weevil', 'weevil', 'whelp', 'scribe']
      : ['hare', 'whelp', 'scribe', 'hare'];
    const list = [];
    for (let i = 0; i < n; i++) list.push(table[rand(0, table.length - 1)]);
    const counts = {};
    return list.map((id) => {
      counts[id] = (counts[id] || 0) + 1;
      const dup = list.filter((x) => x === id).length > 1;
      return spawnEnemy(id, dup ? ' ' + counts[id] : '');
    });
  }

  function spawnEnemy(id, suffix) {
    const type = ENEMY_TYPES[id];
    const e = {
      id,
      name: type.name + (suffix || ''),
      maxHp: type.maxHp + rand(0, 6),
      atk: type.atk,
      def: type.def,
      xp: type.xp,
      gold: type.gold + rand(0, 4),
      color: type.color,
      shape: type.shape,
      alive: true,
    };
    e.hp = e.maxHp;
    return e;
  }

  function startCombat() {
    combatEpoch++;
    combatsFought += 1;
    gameState = State.COMBAT;
    hud.classList.add('hidden');
    setFieldControls(false);
    interactPrompt.classList.add('hidden');
    combatUI.classList.remove('hidden');
    overworldGroup.visible = false;
    combatGroup.visible = true;
    scene.fog.near = 28;
    scene.fog.far = 80;
    scene.fog.color.set(0x5c6c80);
    renderer.setClearColor(0x5c6c80);

    const preset = scriptedEncounter;
    scriptedEncounter = null;
    enemies = preset && preset.length ? preset.map((id) => spawnEnemy(id)) : rollEncounter();
    combatEnemyMeshes.forEach((m) => combatGroup.remove(m));
    combatPartyMeshes.forEach((m) => combatGroup.remove(m));
    combatEnemyMeshes = [];
    combatPartyMeshes = [];

    const spacing = 1.7;
    const startX = -1.6 - ((enemies.length - 1) * spacing) / 2;
    enemies.forEach((e, i) => {
      const mesh = makeEnemyMesh(e);
      mesh.position.set(startX + i * spacing, 0, -1.5);
      mesh.rotation.y = -Math.PI / 2;
      combatGroup.add(mesh);
      combatEnemyMeshes.push(mesh);
    });
    party.forEach((p, i) => {
      const mesh = makeCharacter(p.color, 0.85);
      mesh.position.set(3.6, 0, -1.7 + i * 1.55);
      mesh.rotation.y = Math.PI / 2;
      if (p.hp <= 0) mesh.visible = false;
      combatGroup.add(mesh);
      combatPartyMeshes.push(mesh);
    });

    camera.position.set(0.4, 4.8, 8.4);
    camera.lookAt(0.2, 1.2, -0.4);
    combatCameraAngle = 0;
    combatBusy = false;
    pendingAction = null;
    buildTurnQueue();
    updateCombatUI();
    showMenus('main');
    const teach = enemies.some((e) => e.id === 'echo')
      ? 'Vesper is not on this field. Something that remembers her mouth is.'
      : enemies.some((e) => e.id === 'scribe')
        ? 'A Concord scribe reaches for a bottle. You are already inside the moment they meant to cork.'
        : combatInRot
          ? 'The rot noticed you. Fight, spend what you digested, or try to leave.'
          : 'Your people act, then theirs. Fight, magic, item, or flee.';
    later(() => showLog(teach), 280);
    beginNextTurn();
  }

  function buildTurnQueue() {
    turnQueue = [];
    party.forEach((p, i) => { if (p.hp > 0) turnQueue.push({ type: 'party', index: i }); });
    enemies.forEach((e, i) => { if (e.alive) turnQueue.push({ type: 'enemy', index: i }); });
    combatTurnIndex = 0;
  }

  function currentTurn() {
    return turnQueue[combatTurnIndex] || null;
  }

  function beginNextTurn() {
    if (gameState !== State.COMBAT) return;
    while (combatTurnIndex < turnQueue.length) {
      const t = turnQueue[combatTurnIndex];
      if (t.type === 'party' && party[t.index].hp > 0) break;
      if (t.type === 'enemy' && enemies[t.index].alive) break;
      combatTurnIndex++;
    }
    if (combatTurnIndex >= turnQueue.length) {
      if (checkCombatEnd()) return;
      buildTurnQueue();
      if (!turnQueue.length) { checkCombatEnd(); return; }
    }
    if (checkCombatEnd()) return;
    const t = currentTurn();
    updateCombatUI();
    if (t.type === 'party') {
      combatBusy = false;
      inputEnabled = true;
      const p = party[t.index];
      turnIndicator.textContent = p.name + (p.id === 'lira' && spark.path ? ' · ' + PATH_LABEL[spark.path] : '');
      showMenus('main');
    } else {
      combatBusy = true;
      inputEnabled = false;
      turnIndicator.textContent = enemies[t.index].name;
      showMenus('none');
      later(() => enemyAct(t.index), 560);
    }
  }

  function advanceTurn() {
    combatTurnIndex++;
    later(() => beginNextTurn(), 420);
  }

  function checkCombatEnd() {
    if (gameState === State.VICTORY || gameState === State.GAMEOVER) return true;
    if (!enemies.some((e) => e.alive)) { winCombat(); return true; }
    if (!party.some((p) => p.hp > 0)) { loseCombat(); return true; }
    return false;
  }

  function showMenus(which) {
    mainMenu.classList.toggle('hidden', which !== 'main');
    pathMenu.classList.toggle('hidden', which !== 'path');
    magicMenu.classList.toggle('hidden', which !== 'magic');
    itemMenu.classList.toggle('hidden', which !== 'item');
    targetMenu.classList.toggle('hidden', which !== 'target');
    if (which === 'path') {
      pathMenu.querySelectorAll('[data-path]').forEach((btn) => {
        btn.classList.toggle('is-on', btn.dataset.path === spark.path);
      });
    }
    if (which === 'magic') refreshMagicButtons();
    if (which === 'item') renderCombatItems();
    const open = [mainMenu, pathMenu, magicMenu, itemMenu, targetMenu].find((menu) => menu && !menu.classList.contains('hidden'));
    if (open) tagCommandKeys(open);
  }

  function tagCommandKeys(root) {
    const buttons = Array.from(root.querySelectorAll('button')).filter((btn) => {
      return btn.dataset.action !== 'back' && btn.dataset.action !== 'back-target';
    });
    buttons.forEach((btn, i) => {
      if (i > 8 || btn.querySelector('.pc-key')) return;
      const kbd = document.createElement('kbd');
      kbd.className = 'pc-key';
      kbd.textContent = String(i + 1);
      btn.appendChild(kbd);
    });
  }

  function openCombatMenu() {
    return [mainMenu, pathMenu, magicMenu, itemMenu, targetMenu].find((menu) => menu && !menu.classList.contains('hidden')) || null;
  }

  function pressCombatCommand(index) {
    const open = openCombatMenu();
    if (!open) return;
    const buttons = Array.from(open.querySelectorAll('button')).filter((btn) => {
      return btn.dataset.action !== 'back' && btn.dataset.action !== 'back-target';
    });
    const btn = buttons[index];
    if (btn && !btn.disabled) btn.click();
  }

  function pressCombatBack() {
    const open = openCombatMenu();
    if (!open) return;
    const back = open.querySelector('[data-action="back"], [data-action="back-target"]');
    if (back) back.click();
  }

  function refreshMagicButtons() {
    const turn = currentTurn();
    const actor = turn && turn.type === 'party' ? party[turn.index] : null;
    magicMenu.querySelectorAll('[data-magic]').forEach((btn) => {
      const sp = SPELLS[btn.dataset.magic];
      const have = spark[sp.element];
      const costEl = btn.querySelector('.cost');
      const label = sp.element === 'lightning' ? 'Bolt' : sp.element.charAt(0).toUpperCase() + sp.element.slice(1);
      if (costEl) costEl.textContent = label + ' ' + sp.cost + ' · ' + sp.mp + ' MP · have ' + have;
      btn.disabled = !actor || actor.mp < sp.mp || have < sp.cost;
    });
  }

  function renderCombatItems() {
    itemMenu.innerHTML = '';
    items.forEach((stack) => {
      const def = ITEM_DEFS[stack.id];
      if (!def || !def.combat || stack.count <= 0) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-menu';
      btn.dataset.item = stack.id;
      btn.innerHTML = esc(def.name) + ' <span class="cost">×' + stack.count + '</span>';
      itemMenu.appendChild(btn);
    });
    shards.forEach((sh) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-menu';
      btn.dataset.item = 'shard';
      btn.dataset.uid = sh.uid;
      btn.innerHTML = 'Dump ' + esc(sh.name) + ' <span class="cost">strain</span>';
      itemMenu.appendChild(btn);
    });
    if (!itemMenu.children.length) {
      const p = document.createElement('p');
      p.className = 'menu-label span-2';
      p.textContent = 'Nothing in the pack will help this minute.';
      itemMenu.appendChild(p);
    }
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn btn-menu btn-back span-2';
    back.dataset.action = 'back';
    back.textContent = 'Back';
    itemMenu.appendChild(back);
  }

  function showTargetSelect(forAlly) {
    targetButtons.innerHTML = '';
    if (forAlly) {
      party.forEach((p, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-menu';
        btn.textContent = p.name + '  ' + p.hp + '/' + maxHp(p) + ' HP · ' + p.mp + ' MP';
        btn.disabled = p.hp <= 0;
        btn.addEventListener('click', () => executeAction(i));
        targetButtons.appendChild(btn);
      });
    } else {
      enemies.forEach((e, i) => {
        if (!e.alive) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-menu';
        btn.textContent = e.name + '  ' + e.hp + '/' + e.maxHp;
        btn.addEventListener('click', () => executeAction(i));
        targetButtons.appendChild(btn);
      });
    }
    showMenus('target');
  }

  function pathStrike(actor, target, path) {
    const s = actorStats(actor);
    if (actor.id !== 'lira' || !path) {
      const dmg = Math.max(1, s.atk + rand(0, 5) - target.def);
      let text;
      if (actor.id === 'torren') text = 'Torren puts a quartermaster’s weight into ' + target.name + '. ' + dmg + '.';
      else if (actor.id === 'nima') text = 'Nima’s rod finds ' + target.name + ' for ' + dmg + '. It is not her real work.';
      else text = actor.name + ' strikes ' + target.name + ' for ' + dmg + '.';
      return { dmg, text, pathXp: 0, mpGain: 0 };
    }
    const thin = path !== spark.path;
    let raw = 1;
    let mpGain = 0;
    if (path === 'warrior') {
      raw = s.atk + rand(2, 8) - target.def + (spark.fire > 0 ? 4 : 0);
    } else if (path === 'mage') {
      raw = Math.floor(s.atk * 0.55) + rand(0, 4) - Math.floor(target.def / 2);
      mpGain = 2;
    } else {
      const ignore = spark.lightning > 0 ? Math.floor(target.def * 0.55) : Math.floor(target.def * 0.28);
      raw = s.atk + rand(1, 6) - Math.max(0, target.def - ignore);
    }
    let dmg = Math.max(1, raw);
    if (thin) dmg = Math.max(1, Math.floor(dmg * 0.72));
    let text;
    if (path === 'warrior') {
      text = spark.fire > 0
        ? 'Lira cleaves with digested fire in the steel. ' + target.name + ' takes ' + dmg + '.'
        : 'Lira cleaves. The blade is honest and unlit. ' + dmg + ' to ' + target.name + '.';
    } else if (path === 'mage') {
      text = 'Lira channels a short blow into ' + target.name + ' for ' + dmg + ' and catches a thread of mind back.';
    } else {
      text = spark.lightning > 0
        ? 'Lira aims where the storm already looked. ' + target.name + ' takes ' + dmg + '.'
        : 'Lira takes the pause, then the shot. ' + dmg + ' on ' + target.name + '.';
    }
    if (thin) text += ' Off the committed path, it lands thin.';
    return { dmg, text, pathXp: thin ? 0 : 7, mpGain };
  }

  function executeAction(targetIdx) {
    if (combatBusy || !pendingAction || gameState !== State.COMBAT) return;
    const turn = currentTurn();
    if (!turn || turn.type !== 'party') return;
    combatBusy = true;
    inputEnabled = false;
    showMenus('none');
    const actor = party[turn.index];
    const act = pendingAction;
    pendingAction = null;

    if (act.kind === 'fight') {
      const target = enemies[targetIdx];
      if (!target || !target.alive) { combatBusy = false; advanceTurn(); return; }
      const result = pathStrike(actor, target, act.path);
      if (result.mpGain) actor.mp = Math.min(actor.maxMp, actor.mp + result.mpGain);
      target.hp = Math.max(0, target.hp - result.dmg);
      let text = result.text;
      if (result.pathXp && grantPathXp(result.pathXp)) {
        text += ' ' + PATH_LABEL[spark.path] + ' attunement deepens.';
      }
      showLog(text);
      animateAttack(combatPartyMeshes[turn.index], combatEnemyMeshes[targetIdx]);
      if (target.hp <= 0) markDead(targetIdx);
    } else if (act.kind === 'magic') {
      const sp = SPELLS[act.magic];
      if (!sp || spark[sp.element] < sp.cost || actor.mp < sp.mp) {
        showLog('The spark has not digested enough, or the mind is dry.');
        combatBusy = false;
        inputEnabled = true;
        showMenus('magic');
        return;
      }
      spark[sp.element] -= sp.cost;
      actor.mp -= sp.mp;
      const stats = actorStats(actor);
      const mageBonus = actor.id === 'lira' && spark.path === 'mage' ? 6 : 0;
      if (sp.kind === 'heal') {
        const target = party[targetIdx];
        const heal = 22 + Math.floor(stats.mag / 2) + mageBonus + rand(0, 8);
        const before = target.hp;
        target.hp = Math.min(maxHp(target), target.hp + heal);
        showLog(actor.name + ' lays digested water on ' + target.name + '. ' + (target.hp - before) + ' HP returns.');
        flashMesh(combatPartyMeshes[targetIdx], sp.flash);
        if (actor.id === 'lira' && spark.path === 'mage' && grantPathXp(6)) {
          later(() => showLog('Mage attunement deepens.'), 600);
        }
      } else {
        const target = enemies[targetIdx];
        if (!target || !target.alive) { combatBusy = false; advanceTurn(); return; }
        const dmg = Math.max(1, stats.mag + sp.power + mageBonus + rand(0, 6) - Math.floor(target.def / 3));
        target.hp = Math.max(0, target.hp - dmg);
        const lines = {
          fire: actor.name + ' spends a coal of fire. ' + target.name + ' takes ' + dmg + '.',
          water: actor.name + ' turns held water into a hard tide. ' + dmg + ' to ' + target.name + '.',
          lightning: 'Lightning the spark kept in the teeth. ' + target.name + ' takes ' + dmg + '.',
        };
        showLog(lines[act.magic]);
        flashMesh(combatEnemyMeshes[targetIdx], sp.flash);
        if (target.hp <= 0) markDead(targetIdx);
        if (actor.id === 'lira' && spark.path === 'mage') grantPathXp(8);
      }
    } else if (act.kind === 'item' && act.item === 'shard') {
      const idx = shards.findIndex((s) => s.uid === act.uid);
      const target = enemies[targetIdx];
      if (idx < 0 || !target || !target.alive) { combatBusy = false; advanceTurn(); return; }
      const sh = shards[idx];
      shards.splice(idx, 1);
      const bonus = { fire: 6, water: 5, lightning: 9 }[sh.element] || 4;
      const dmg = 16 + bonus + rand(0, 8);
      target.hp = Math.max(0, target.hp - dmg);
      const before = spark.strain;
      applyStrain(11);
      showLog('You dump the ' + sh.name + ' undigested — Vesper’s habit, small. ' + target.name + ' takes ' + dmg + '. Strain ' + spark.strain + '.' + strainWarning(before));
      flashMesh(combatEnemyMeshes[targetIdx], ELEMENT_COLOR[sh.element]);
      if (target.hp <= 0) markDead(targetIdx);
    } else if (act.kind === 'item') {
      const stack = items.find((s) => s.id === act.item);
      const def = ITEM_DEFS[act.item];
      const target = party[targetIdx];
      if (!stack || stack.count <= 0 || !def || !target || target.hp <= 0) {
        showLog('The pack does not have that.');
        combatBusy = false;
        inputEnabled = true;
        showMenus('item');
        return;
      }
      stack.count -= 1;
      if (def.heal) {
        const before = target.hp;
        target.hp = Math.min(maxHp(target), target.hp + def.heal);
        showLog(actor.name + ' gives ' + target.name + ' the ' + def.name + '. ' + (target.hp - before) + ' HP.');
        flashMesh(combatPartyMeshes[targetIdx], 0x9dffc8);
      } else if (def.mp) {
        const before = target.mp;
        target.mp = Math.min(target.maxMp, target.mp + def.mp);
        showLog(actor.name + ' gives ' + target.name + ' the ' + def.name + '. ' + (target.mp - before) + ' MP.');
        flashMesh(combatPartyMeshes[targetIdx], 0x9ec6e8);
      }
    }

    updateCombatUI();
    later(() => {
      if (!checkCombatEnd()) advanceTurn();
    }, 880);
  }

  function markDead(idx) {
    const target = enemies[idx];
    if (!target || !target.alive) return;
    target.alive = false;
    target.hp = 0;
    later(() => {
      showLog(target.name + ' comes apart.');
      if (combatEnemyMeshes[idx]) combatEnemyMeshes[idx].visible = false;
    }, 360);
  }

  function enemyAct(idx) {
    if (gameState !== State.COMBAT) return;
    const enemy = enemies[idx];
    if (!enemy || !enemy.alive) { advanceTurn(); return; }
    const living = party.map((p, i) => ({ p, i })).filter((x) => x.p.hp > 0);
    if (!living.length) { checkCombatEnd(); return; }
    let pick = living[rand(0, living.length - 1)];
    if (enemy.id === 'echo') {
      const lira = living.find((x) => x.p.id === 'lira');
      if (lira && Math.random() < 0.7) pick = lira;
    }
    const dmg = Math.max(1, enemy.atk + rand(0, 4) - actorStats(pick.p).def);
    if (enemy.id === 'scribe' && Math.random() < 0.5) {
      const drain = Math.min(6, pick.p.mp);
      pick.p.mp -= drain;
      pick.p.hp = Math.max(0, pick.p.hp - dmg);
      showLog(enemy.name + ' tries to cork ' + pick.p.name + '. ' + dmg + ' harm, and ' + drain + ' of the mind sealed away.');
    } else if (enemy.id === 'echo') {
      const before = spark.strain;
      applyStrain(4);
      pick.p.hp = Math.max(0, pick.p.hp - dmg);
      showLog('The echo strikes ' + pick.p.name + ' for ' + dmg + ' and leaves a thumbprint of Vesper’s hunger. Strain ' + spark.strain + '.' + strainWarning(before));
    } else {
      pick.p.hp = Math.max(0, pick.p.hp - dmg);
      showLog(enemy.name + ' hits ' + pick.p.name + ' for ' + dmg + '.');
    }
    animateAttack(combatEnemyMeshes[idx], combatPartyMeshes[pick.i]);
    if (pick.p.hp <= 0) {
      const mesh = combatPartyMeshes[pick.i];
      if (mesh) mesh.rotation.z = 1.15;
      const line = pick.p.id === 'lira'
        ? 'Lira drops. The spark rattles in a body that will not answer.'
        : pick.p.name + ' goes down and does not rise.';
      later(() => showLog(line), 380);
    }
    updateCombatUI();
    later(() => { if (!checkCombatEnd()) advanceTurn(); }, 900);
  }

  function attemptFlee() {
    combatBusy = true;
    inputEnabled = false;
    showMenus('none');
    let chance = 0.6;
    if (combatInRot) chance -= 0.22;
    if (enemies.some((e) => e.id === 'echo' && e.alive)) chance -= 0.34;
    chance = Math.max(0.08, chance);
    if (Math.random() < chance) {
      victoryTag = null;
      showLog(locale === 'root-cellar'
        ? 'You break contact. The dark keeps your place.'
        : 'You break contact. The field takes you back.');
      later(() => endCombatReturn(), 800);
    } else {
      const hard = enemies.some((e) => e.id === 'echo' && e.alive);
      showLog(hard
        ? 'Vesper’s echo smiles with your hunger. You stay.'
        : combatInRot
          ? 'The rot has your ankles. You stay.'
          : 'The field does not let you leave that easily.');
      later(() => advanceTurn(), 800);
    }
  }

  function collectLoot() {
    const names = [];
    enemies.forEach((e) => {
      if (e.id === 'whelp' && Math.random() < 0.7) names.push(makeShard('fire').name);
      else if (e.id === 'hare' && Math.random() < 0.45) names.push(makeShard(Math.random() < 0.5 ? 'fire' : 'water').name);
      else if (e.id === 'weevil' && Math.random() < 0.6) { addRotAsh(); names.push('Rot-ash'); }
      else if (e.id === 'scribe' && Math.random() < 0.55) names.push(makeShard('water').name);
      else if (e.id === 'echo') names.push(makeShard('lightning').name);
      else if (e.id === 'kiln-heart') names.push(makeShard('fire').name);
      else if (e.id === 'mite' && Math.random() < 0.55) { addRotAsh(); names.push('Rot-ash'); }
    });
    return names;
  }

  function winCombat() {
    if (gameState === State.VICTORY) return;
    gameState = State.VICTORY;
    inputEnabled = false;
    showMenus('none');
    let xp = 0;
    let g = 0;
    const hadEcho = enemies.some((e) => e.id === 'echo');
    enemies.forEach((e) => { xp += e.xp; g += e.gold; });
    marks += g;
    const levels = grantSparkXp(xp);
    if (spark.strain > 0) spark.strain = Math.max(0, spark.strain - 3);
    party.forEach((p) => {
      if (p.hp > 0) {
        p.hp = Math.min(maxHp(p), p.hp + 6);
        p.mp = Math.min(p.maxMp, p.mp + 2);
      }
    });
    const loot = collectLoot();
    const tag = noteVictory();
    let msg = 'The spark keeps ' + xp + ' XP and ' + g + ' marks.';
    if (levels) msg += ' Level ' + spark.level + '. Capacity ' + spark.capacity + '.';
    if (loot.length) msg += ' The pack gains ' + loot.join(', ') + '.';
    msg += hadEcho
      ? ' Somewhere Vesper looks up, as if named.'
      : tag === 'kiln-heart'
        ? ' The kiln is unguarded. What they buried is still offering.'
        : ' Lira keeps the bruises.';
    victoryText.textContent = msg;
    victoryOverlay.classList.remove('hidden');
    turnIndicator.textContent = '';
    updateCombatUI();
    later(() => {
      victoryOverlay.classList.add('hidden');
      endCombatReturn();
    }, 2600);
  }

  function loseCombat() {
    if (gameState === State.GAMEOVER) return;
    victoryTag = null;
    combatEpoch++;
    gameState = State.GAMEOVER;
    combatUI.classList.add('hidden');
    victoryOverlay.classList.add('hidden');
    gameoverScreen.classList.remove('hidden');
  }

  function endCombatReturn() {
    combatEpoch++;
    combatUI.classList.add('hidden');
    victoryOverlay.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    const onCoast = locale === 'field' && regionId === 'stormreach';
    overworldGroup.visible = locale === 'field' && !onCoast;
    if (stormreachGroup) stormreachGroup.visible = onCoast;
    if (coastGroup) coastGroup.visible = false;
    if (interiorGroup) interiorGroup.visible = locale !== 'field';
    combatGroup.visible = false;
    scene.fog.near = 18;
    scene.fog.far = 55;
    const sky = locale === 'root-cellar' ? 0x1a1410 : locale !== 'field' ? 0x3a342c : onCoast ? 0x6e7e90 : 0x87b5d9;
    scene.fog.color.set(sky);
    renderer.setClearColor(sky);
    combatEnemyMeshes.forEach((m) => combatGroup.remove(m));
    combatPartyMeshes.forEach((m) => combatGroup.remove(m));
    combatEnemyMeshes = [];
    combatPartyMeshes = [];
    gameState = State.OVERWORLD;
    hud.classList.remove('hidden');
    setFieldControls(true);
    encounterLocked = false;
    stepsSinceEncounter = 0;
    saveGame();
    suppressEncountersUntil = performance.now() + 2200;
    camera.position.set(playerMesh.position.x, playerMesh.position.y + CAMERA_HEIGHT, playerMesh.position.z + CAMERA_DIST);
    updateHUD();
    updatePrompt();
  }

  function updateCombatUI() {
    const turn = currentTurn();
    const active = turn && turn.type === 'party' ? turn.index : -1;
    enemyPanel.innerHTML = enemies.map((e) => {
      const pct = Math.max(0, Math.min(100, (e.hp / e.maxHp) * 100));
      return `<div class="enemy-card ${e.alive ? '' : 'dead'}"><div class="name">${esc(e.name)}</div><div class="bar-wrap"><div class="bar-hp" style="width:${pct}%"></div></div></div>`;
    }).join('');
    partyPanel.innerHTML = party.map((p, i) => {
      const cap = maxHp(p);
      const hpPct = Math.max(0, Math.min(100, (p.hp / cap) * 100));
      const mpPct = p.maxMp ? Math.max(0, Math.min(100, (p.mp / p.maxMp) * 100)) : 0;
      return `<div class="party-card ${p.hp <= 0 ? 'dead' : ''} ${i === active ? 'active' : ''}">
        <div class="name">${esc(p.name)}</div>
        <div class="role">${esc(p.role)}</div>
        <div class="bar-row"><span class="label">HP</span><div class="bar-wrap"><div class="bar-hp" style="width:${hpPct}%"></div></div><span class="nums">${p.hp}/${cap}</span></div>
        <div class="bar-row"><span class="label">MP</span><div class="bar-wrap"><div class="bar-mp" style="width:${mpPct}%"></div></div><span class="nums">${p.mp}/${p.maxMp}</span></div>
      </div>`;
    }).join('');
    const order = $('#turn-order');
    if (order) {
      order.innerHTML = turnQueue.map((t, i) => {
        const name = t.type === 'party' ? party[t.index].name : enemies[t.index].name;
        const dead = t.type === 'party' ? party[t.index].hp <= 0 : !enemies[t.index].alive;
        if (dead) return '';
        return `<span class="turn-chip${i === combatTurnIndex ? ' now' : ''}">${esc(name)}</span>`;
      }).join('');
    }
  }

  function animateAttack(fromMesh, toMesh) {
    if (!fromMesh || !toMesh) return;
    const orig = fromMesh.position.clone();
    const dir = toMesh.position.clone().sub(fromMesh.position);
    if (dir.lengthSq() < 0.0001) return;
    dir.normalize().multiplyScalar(0.55);
    fromMesh.position.add(dir);
    setTimeout(() => { if (fromMesh) fromMesh.position.copy(orig); }, 180);
  }

  function flashMesh(mesh, color) {
    if (!mesh) return;
    const touched = [];
    mesh.traverse((c) => {
      if (c.isMesh && c.material && c.material.emissive) {
        touched.push([c.material, c.material.emissive.getHex()]);
        c.material.emissive.setHex(color);
      }
    });
    setTimeout(() => {
      touched.forEach(([mat, hex]) => { if (mat.emissive) mat.emissive.setHex(hex); });
    }, 240);
  }

  function updateCombatCamera(dt) {
    combatCameraAngle += dt * 0.12;
    camera.position.x = 0.4 + Math.sin(combatCameraAngle) * 0.45;
    camera.position.y = 4.8 + Math.sin(combatCameraAngle * 0.7) * 0.12;
    camera.position.z = 8.4;
    camera.lookAt(0.2, 1.2, -0.4);
  }

  // ─── Input & flow ─────────────────────────────────────────
  function setupJoystick() {
    const endDrag = () => {
      joy.active = false;
      joy.dx = 0;
      joy.dy = 0;
      joy.id = null;
      joystickKnob.style.transform = 'translate(-50%, -50%)';
    };
    const onDown = (e) => {
      if (gameState !== State.OVERWORLD || inventoryOpen || encounterLocked || dialogueOpen) return;
      if (e.isPrimary === false) return;
      if (typeof e.button === 'number' && e.button !== 0) return;
      e.preventDefault();
      joy.active = true;
      joy.id = e.pointerId;
      try { joystickZone.setPointerCapture(e.pointerId); } catch (err) { /* synthetic or already released */ }
      updateJoy(e.clientX, e.clientY);
    };
    const onMove = (e) => {
      if (!joy.active || e.pointerId !== joy.id) return;
      if (e.pointerType === 'mouse' && e.buttons === 0) {
        endDrag();
        return;
      }
      e.preventDefault();
      updateJoy(e.clientX, e.clientY);
    };
    const onUp = (e) => {
      if (!joy.active || e.pointerId !== joy.id) return;
      endDrag();
    };
    joystickZone.addEventListener('pointerdown', onDown);
    joystickZone.addEventListener('pointermove', onMove);
    joystickZone.addEventListener('pointerup', onUp);
    joystickZone.addEventListener('pointercancel', onUp);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  function updateJoy(cx, cy) {
    const rect = joystickBase.getBoundingClientRect();
    const cx0 = rect.left + rect.width / 2;
    const cy0 = rect.top + rect.height / 2;
    let dx = cx - cx0;
    let dy = cy - cy0;
    const maxR = Math.max(24, rect.width / 2 - 8);
    const len = Math.hypot(dx, dy);
    if (len < 14) {
      joy.dx = 0;
      joy.dy = 0;
      joystickKnob.style.transform = 'translate(-50%, -50%)';
      return;
    }
    const clamped = Math.min(len, maxR);
    dx = (dx / len) * clamped;
    dy = (dy / len) * clamped;
    joy.dx = dx / maxR;
    joy.dy = dy / maxR;
    joystickKnob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
  }

  function openDialogue(script, done) {
    dialogueLines = (script.lines || []).slice();
    dialogueIndex = 0;
    dialogueWhere = '';
    dialogueOnDone = (script && script.onDone) || done || null;
    dialogueOnPick = (script && script.onPick) || null;
    dialogueOpen = true;
    if (inventoryOpen) setInventory(false);
    setFieldControls(false);
    const panel = $('#dialogue');
    panel.classList.remove('hidden');
    renderDialogue();
  }

  function renderDialogue() {
    const line = dialogueLines[dialogueIndex];
    if (!line) {
      closeDialogue();
      return;
    }
    if (line.where) dialogueWhere = line.where;
    const whereEl = $('#dialogue-where');
    whereEl.textContent = dialogueWhere;
    whereEl.classList.toggle('hidden', !dialogueWhere);
    $('#dialogue-speaker').textContent = line.speaker || '';
    $('#dialogue-line').textContent = line.text || '';
    const actions = $('#dialogue-actions');
    actions.innerHTML = '';
    if (line.choices && line.choices.length) {
      line.choices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn dialogue-choice';
        btn.innerHTML = '<kbd class="pc-key">' + (i + 1) + '</kbd><span>' + esc(choice.label) + '</span>';
        btn.addEventListener('click', () => chooseDialogue(i));
        actions.appendChild(btn);
      });
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary dialogue-advance';
      const last = dialogueIndex >= dialogueLines.length - 1;
      btn.textContent = last ? 'Leave it' : 'Continue';
      btn.addEventListener('click', advanceDialogue);
      actions.appendChild(btn);
    }
  }

  function advanceDialogue() {
    if (!dialogueOpen) return;
    const line = dialogueLines[dialogueIndex];
    if (line && line.choices && line.choices.length) return;
    dialogueIndex += 1;
    if (dialogueIndex >= dialogueLines.length) closeDialogue();
    else renderDialogue();
  }

  function chooseDialogue(i) {
    if (!dialogueOpen) return;
    const line = dialogueLines[dialogueIndex];
    if (!line || !line.choices || !line.choices[i]) return;
    const choice = line.choices[i];
    const reply = choice.reply;
    if (typeof dialogueOnPick === 'function' && choice.pick) dialogueOnPick(choice.pick);
    dialogueLines[dialogueIndex] = { where: line.where, speaker: line.speaker, text: line.text };
    if (reply) dialogueLines.splice(dialogueIndex + 1, 0, reply);
    advanceDialogue();
  }

  function closeDialogue() {
    if (!dialogueOpen && !$('#dialogue') ) return;
    dialogueOpen = false;
    const panel = $('#dialogue');
    if (panel) panel.classList.add('hidden');
    if (pendingBeat) {
      seenBeats[pendingBeat] = true;
      pendingBeat = null;
    }
    if (locale === 'leaf-village') seenBeats.village = true;
    else if (locale === 'root-cellar') seenBeats.cellar = true;
    if (gameState === State.OVERWORLD && !inventoryOpen && !encounterLocked && !(skyPass && (skyPass.mode === 'coast' || skyPass.mode === 'land'))) {
      setFieldControls(true);
    }
    const done = dialogueOnDone;
    dialogueOnDone = null;
    dialogueOnPick = null;
    saveGame();
    if (typeof done === 'function') done();
  }

  function setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      if (dialogueOpen) {
        if (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter') {
          e.preventDefault();
          advanceDialogue();
        } else if (e.code.indexOf('Digit') === 0 || e.code.indexOf('Numpad') === 0) {
          const digit = Number(e.code.replace(/\D/g, ''));
          if (digit >= 1 && digit <= 9) {
            e.preventDefault();
            chooseDialogue(digit - 1);
          }
        }
        return;
      }
      if (e.code === 'KeyI' && gameState === State.OVERWORLD && !encounterLocked) setInventory(!inventoryOpen);
      if (e.code === 'KeyE' && gameState === State.OVERWORLD) tryInteract();
      if (e.code === 'Escape' && inventoryOpen) setInventory(false);
      if (gameState === State.COMBAT && inputEnabled && !combatBusy) {
        if (e.code === 'Escape' || e.code === 'Backspace') {
          pressCombatBack();
          return;
        }
        let digit = 0;
        if (e.code.indexOf('Digit') === 0) digit = Number(e.code.slice(5));
        else if (e.code.indexOf('Numpad') === 0) digit = Number(e.code.slice(6));
        if (digit >= 1 && digit <= 9) {
          e.preventDefault();
          pressCombatCommand(digit - 1);
        }
      }
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  }

  function setupCombatMenus() {
    mainMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn || combatBusy || !inputEnabled) return;
      const turn = currentTurn();
      if (!turn || turn.type !== 'party') return;
      const action = btn.dataset.action;
      if (action === 'fight') {
        if (party[turn.index].id === 'lira') showMenus('path');
        else {
          pendingAction = { kind: 'fight', path: null };
          showTargetSelect(false);
        }
      } else if (action === 'magic') showMenus('magic');
      else if (action === 'item') showMenus('item');
      else if (action === 'flee') attemptFlee();
    });

    pathMenu.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="back"]')) { showMenus('main'); return; }
      const btn = e.target.closest('[data-path]');
      if (!btn || combatBusy || !inputEnabled) return;
      pendingAction = { kind: 'fight', path: btn.dataset.path };
      showTargetSelect(false);
    });

    magicMenu.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="back"]')) { showMenus('main'); return; }
      const btn = e.target.closest('[data-magic]');
      if (!btn || combatBusy || !inputEnabled || btn.disabled) return;
      const turn = currentTurn();
      if (!turn || turn.type !== 'party') return;
      const magic = btn.dataset.magic;
      const sp = SPELLS[magic];
      const actor = party[turn.index];
      if (actor.mp < sp.mp || spark[sp.element] < sp.cost) {
        showLog('Not enough digested ' + sp.element + ', or not enough mind.');
        return;
      }
      pendingAction = { kind: 'magic', magic };
      showTargetSelect(sp.kind === 'heal');
    });

    itemMenu.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="back"]')) { showMenus('main'); return; }
      const btn = e.target.closest('[data-item]');
      if (!btn || combatBusy || !inputEnabled) return;
      const item = btn.dataset.item;
      if (item === 'shard') {
        pendingAction = { kind: 'item', item: 'shard', uid: btn.dataset.uid };
        showTargetSelect(false);
        return;
      }
      if (itemCount(item) <= 0) { showLog('The pack is out.'); return; }
      pendingAction = { kind: 'item', item };
      showTargetSelect(true);
    });

    targetMenu.addEventListener('click', (e) => {
      if (!e.target.closest('[data-action="back-target"]')) return;
      if (pendingAction && pendingAction.kind === 'magic') showMenus('magic');
      else if (pendingAction && pendingAction.kind === 'item') showMenus('item');
      else if (pendingAction && pendingAction.kind === 'fight' && currentTurn() && party[currentTurn().index].id === 'lira') showMenus('path');
      else showMenus('main');
      pendingAction = null;
    });
  }

  function beginField(opts) {
    gameState = State.OVERWORLD;
    titleScreen.classList.add('hidden');
    pathScreen.classList.add('hidden');
    creditsScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    combatUI.classList.add('hidden');
    hud.classList.remove('hidden');
    setFieldControls(true);
    overworldGroup.visible = true;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (coastGroup) coastGroup.visible = false;
    combatGroup.visible = false;
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Verdant Isle';
    camera.position.set(playerMesh.position.x, CAMERA_HEIGHT, playerMesh.position.z + CAMERA_DIST);
    runLive = true;
    updateHUD();
    if (!(opts && opts.skipSave)) saveGame();
    if (!introToastShown) {
      introToastShown = true;
      const gearHint = spark.path === 'mage'
        ? ' The wellwood staff in the pack suits a mage.'
        : spark.path === 'ranged'
          ? ' The reed bow in the pack suits a focused shot.'
          : ' The ashwood blade in the pack suits a warrior.';
      const wake = EW.scenes['wake-spark'];
      if (typeof wake === 'function') wake({ gearHint: gearHint });
      else showToast('Follow the orange column. Stand in the sick grass and absorb — E, or Absorb. Feeding heals the ground. That is a side effect.' + gearHint);
    }
  }

  function setupUI() {
    $('#btn-start').addEventListener('click', () => {
      try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
      runLive = false;
      resetRun();
      titleScreen.classList.add('hidden');
      creditsScreen.classList.add('hidden');
      pathScreen.classList.remove('hidden');
      gameState = State.PATH;
    });
    const continueBtn = $('#btn-continue');
    if (continueBtn) continueBtn.addEventListener('click', continueRun);
    $('#btn-credits').addEventListener('click', () => {
      titleScreen.classList.add('hidden');
      creditsScreen.classList.remove('hidden');
    });
    $('#btn-credits-close').addEventListener('click', () => {
      creditsScreen.classList.add('hidden');
      titleScreen.classList.remove('hidden');
    });
    pathScreen.querySelectorAll('[data-path]').forEach((btn) => {
      btn.addEventListener('click', () => {
        commitPath(btn.dataset.path, true);
        beginField();
      });
    });
    $('#btn-inventory').addEventListener('click', () => {
      if (gameState === State.OVERWORLD && !encounterLocked && !dialogueOpen) setInventory(!inventoryOpen);
    });
    $('#btn-inv-close').addEventListener('click', () => setInventory(false));
    $('#btn-absorb').addEventListener('click', (e) => {
      e.preventDefault();
      tryInteract();
    });
    inventoryPanel.addEventListener('click', (e) => {
      const respec = e.target.closest('[data-respec]');
      if (respec) {
        const path = respec.dataset.respec;
        if (!commitPath(path, false)) showToast('That path is already hers.');
        else showToast('She wrenches toward ' + PATH_LABEL[path] + '. Strain ' + spark.strain + '/100. The body believes it after the next blows land true.');
        renderInventory();
        updateHUD();
        return;
      }
      const act = e.target.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'equip') equipFromBag(act.dataset.id);
      else if (act.dataset.act === 'unequip') unequip(act.dataset.who, act.dataset.slot);
      else if (act.dataset.act === 'use') useFieldItem(act.dataset.id);
      else if (act.dataset.act === 'digest') digestShard(act.dataset.uid);
    });
    $('#btn-retry').addEventListener('click', () => {
      party.forEach((p) => {
        p.hp = maxHp(p);
        p.mp = p.maxMp;
      });
      marks = Math.max(0, marks - 12);
      if (playerMesh) playerMesh.position.set(0, 0, 0);
      showToast('The spark drags Lira upright. Twelve marks are gone into the grass. The isle does not applaud.');
      endCombatReturn();
    });
    const dialoguePanel = $('#dialogue');
    if (dialoguePanel) {
      dialoguePanel.addEventListener('click', (e) => {
        if (!dialogueOpen) return;
        if (e.target.closest('button')) return;
        const line = dialogueLines[dialogueIndex];
        if (line && line.choices && line.choices.length) return;
        advanceDialogue();
      });
    }
    setupCombatMenus();
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (gameState === State.OVERWORLD) updateOverworld(dt);
    else if (gameState === State.COMBAT || gameState === State.VICTORY) updateCombatCamera(dt);
    if (pools.length) updatePools(dt);
    renderer.render(scene, camera);
  }

  function readSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.v !== 1 || !data.spark || !Array.isArray(data.party)) return null;
      return data;
    } catch (err) {
      return null;
    }
  }

  function saveGame() {
    if (!runLive || !spark || !playerMesh) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        v: 1,
        spark: spark,
        party: party,
        marks: marks,
        items: items,
        shards: shards,
        seals: seals,
        bag: bag,
        equipped: equipped,
        seenBeats: seenBeats,
        silhouetteGone: silhouetteGone,
        scarVerdict: scarVerdict,
        introToastShown: introToastShown,
        combatsFought: combatsFought,
        locale: locale,
        region: regionId,
        mergeWord: mergeWord,
        duelWord: duelWord,
        pos: { x: playerMesh.position.x, z: playerMesh.position.z },
        pools: pools.map((p) => ({
          id: p.id,
          absorbed: !!p.absorbed,
          bottled: !!p.bottled,
          withheld: !!p.withheld,
          strain: p.strain,
          line: p.line,
        })),
      }));
    } catch (err) { /* quota or private mode */ }
  }

  function applySave(data) {
    spark = data.spark;
    party = data.party;
    marks = data.marks;
    items = data.items;
    shards = data.shards || [];
    seals = data.seals || [];
    bag = data.bag || [];
    equipped = data.equipped || { lira: { weapon: 'scout-knife', armor: 'quilt-jerkin' } };
    seenBeats = data.seenBeats || {};
    silhouetteGone = !!data.silhouetteGone;
    scarVerdict = data.scarVerdict || null;
    introToastShown = !!data.introToastShown;
    combatsFought = data.combatsFought || 0;
    regionId = data.region === 'stormreach' ? 'stormreach' : 'verdant-isle';
    mergeWord = data.mergeWord === 'plasma' || data.mergeWord === 'steam' ? data.mergeWord : null;
    duelWord = data.duelWord === 'press' || data.duelWord === 'hold' ? data.duelWord : null;
    shardSeq = shards.reduce((max, shard) => {
      const n = parseInt(String(shard.uid || '').replace(/\D/g, ''), 10) || 0;
      return Math.max(max, n);
    }, 1) + 1;
    (data.pools || []).forEach((saved) => {
      const pool = pools.find((p) => p.id === saved.id);
      if (!pool) return;
      pool.absorbed = !!saved.absorbed;
      pool.bottled = !!saved.bottled;
      pool.withheld = !!saved.withheld;
      if (typeof saved.strain === 'number') pool.strain = saved.strain;
      if (saved.line) pool.line = saved.line;
      if (pool.absorbed) { pool.healing = true; pool.heal = 1; }
      if (pool.bottled) {
        if (pool.seal) pool.seal.visible = true;
        if (pool.sealRing) pool.sealRing.visible = true;
      }
    });
    if (playerMesh && data.pos && (!data.locale || data.locale === 'field')) {
      playerMesh.position.set(data.pos.x || 0, 0, data.pos.z || 0);
    }
    syncSilhouette();
    syncCoastVesper();
    if (seenBeats['waystone-wake']) wakeWaystone();
    refreshRumor();
  }

  function refreshTitle() {
    const btn = $('#btn-continue');
    if (btn) btn.classList.toggle('hidden', !readSave());
  }

  function continueRun() {
    const data = readSave();
    if (!data) return;
    applySave(data);
    runLive = true;
    const resumeInterior = data.locale && data.locale !== 'field';
    if (spark.path) beginField({ skipSave: resumeInterior });
    else {
      titleScreen.classList.add('hidden');
      creditsScreen.classList.add('hidden');
      pathScreen.classList.remove('hidden');
      gameState = State.PATH;
    }
    if (resumeInterior) enterInterior(data.locale, { silent: true, pos: data.pos });
    else if (data.region === 'stormreach') enterRegion('stormreach', { silent: true, pos: data.pos });
  }

  function setScarVerdict(id) {
    if (scarVerdict) return;
    scarVerdict = id === 'leave' ? 'leave' : 'drink';
    const pool = pools.find((p) => p.id === 'vesper');
    if (pool && scarVerdict === 'drink') {
      pool.strain = (pool.strain || 20) + 12;
      pool.line = 'You finish Vesper’s scar while they watch. The ground cools. Ilan’s sister does not. That debt stays in the teeth.';
    } else if (pool && scarVerdict === 'leave') {
      pool.withheld = true;
      addRotAsh();
      addRotAsh();
    }
    refreshRumor();
    saveGame();
  }

  function makeEagle() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 8, 6),
      new THREE.MeshLambertMaterial({ color: 0x2c2418 })
    );
    body.scale.set(2.2, 0.55, 0.7);
    g.add(body);
    const wingMat = new THREE.MeshLambertMaterial({ color: 0x4a3c2c });
    const left = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.05), wingMat);
    left.position.set(0, 0.15, -1.7);
    const right = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.05), wingMat);
    right.position.set(0, 0.15, 1.7);
    g.add(left);
    g.add(right);
    g.userData.wings = [left, right];
    const rider = makeCharacter(0x6a5348, 0.7);
    rider.position.set(-0.15, 0.35, 0);
    g.add(rider);
    g.visible = false;
    overworldGroup.add(g);
    return g;
  }

  function playSkyPass() {
    if (skyPass && (skyPass.mode === 'coast' || skyPass.mode === 'land')) return;
    if (!eagleGroup) eagleGroup = makeEagle();
    if (overworldGroup && eagleGroup.parent !== overworldGroup) {
      if (eagleGroup.parent) eagleGroup.parent.remove(eagleGroup);
      overworldGroup.add(eagleGroup);
    }
    eagleGroup.visible = true;
    skyPass = { t: 0, dur: 8.5, mode: 'cross' };
  }

  function playCoastCrossing() {
    if (locale !== 'field' || regionId !== 'verdant-isle' || dialogueOpen) return;
    if (skyPass && (skyPass.mode === 'coast' || skyPass.mode === 'land')) return;
    beginCoastVisual();
    const fn = EW.scenes['stormreach-glimpse'];
    if (typeof fn === 'function') fn();
  }

  function maybeResumeCoast() {
    if (locale !== 'field' || regionId !== 'verdant-isle' || dialogueOpen || skyPass) return;
    if (!seenBeats['waystone-wake'] || seenBeats.coastRoute) return;
    const pin = landmark('sleeping-waystone');
    if (!pin || !playerMesh) return;
    if (Math.hypot(pin.x - playerMesh.position.x, pin.z - playerMesh.position.z) < 3.4) playCoastCrossing();
  }

  function beginCoastVisual() {
    if (!coastGroup) buildCoast();
    if (!eagleGroup) eagleGroup = makeEagle();
    if (eagleGroup.parent) eagleGroup.parent.remove(eagleGroup);
    coastGroup.add(eagleGroup);
    eagleGroup.visible = true;
    coastGroup.visible = true;
    overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    scene.fog.color.set(0x6e7e90);
    scene.fog.near = 24;
    scene.fog.far = 80;
    renderer.setClearColor(0x6e7e90);
    skyPass = { t: 0, dur: 13, mode: 'coast' };
    eagleGroup.position.set(-16, 6.6, 2.4);
    eagleGroup.rotation.y = -Math.PI / 2;
    eagleGroup.scale.setScalar(1.55);
    camera.position.set(8, 6.3, 14);
    camera.lookAt(0.4, 3.2, -5);
    setFieldControls(false);
  }

  function finishCoast() {
    if (eagleGroup) {
      if (eagleGroup.parent) eagleGroup.parent.remove(eagleGroup);
      if (overworldGroup) overworldGroup.add(eagleGroup);
      eagleGroup.visible = false;
    }
    if (coastGroup) coastGroup.visible = false;
    if (locale === 'field' && overworldGroup) {
      overworldGroup.visible = true;
      scene.fog.color.set(0x87b5d9);
      scene.fog.near = 18;
      scene.fog.far = 55;
      renderer.setClearColor(0x87b5d9);
    }
    skyPass = null;
    if (playerMesh && locale === 'field') {
      camera.position.set(playerMesh.position.x, playerMesh.position.y + CAMERA_HEIGHT, playerMesh.position.z + CAMERA_DIST);
      camera.lookAt(playerMesh.position.x, playerMesh.position.y + 1, playerMesh.position.z);
    }
    suppressEncountersUntil = performance.now() + 2200;
    if (gameState === State.OVERWORLD && !dialogueOpen && !inventoryOpen && !encounterLocked) {
      setFieldControls(true);
    }
    saveGame();
  }

  function noteCoast() {
    seenBeats.coastRoute = true;
    if (!seals.some((seal) => seal.name === 'Unwritten Passage')) {
      seals.push({
        name: 'Unwritten Passage',
        desc: 'Not a licence. The thermal from the woken waystone to the Stormreach harbor vault. The door stayed shut. The route did not.',
      });
    }
    refreshRumor();
    saveGame();
  }

  function syncCoastVesper() {
    if (coastVesper) coastVesper.visible = !!seenBeats['vesper-duel'];
  }

  function enterRegion(id, opts) {
    const silent = opts && opts.silent;
    const target = id === 'stormreach' ? stormreachGroup : overworldGroup;
    if (!target || !playerMesh) return;
    regionId = id === 'stormreach' ? 'stormreach' : 'verdant-isle';
    locale = 'field';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    target.add(playerMesh);
    if (overworldGroup) overworldGroup.visible = regionId === 'verdant-isle';
    if (stormreachGroup) stormreachGroup.visible = regionId === 'stormreach';
    if (coastGroup) coastGroup.visible = false;
    if (interiorGroup) interiorGroup.visible = false;
    const sky = regionId === 'stormreach' ? 0x6e7e90 : 0x87b5d9;
    scene.fog.color.set(sky);
    scene.fog.near = 18;
    scene.fog.far = 55;
    renderer.setClearColor(sky);
    beatHold = {};
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = regionId === 'stormreach' ? 'Stormreach Coast' : 'Verdant Isle';
    let px = 0;
    let pz = 0;
    if (silent && opts.pos) {
      px = opts.pos.x || 0;
      pz = opts.pos.z || 0;
    } else if (regionId === 'stormreach') {
      const pin = coastLandmark('landing');
      px = pin ? pin.x : 0;
      pz = pin ? pin.z : 9;
    } else {
      const pin = landmark('sleeping-waystone');
      px = pin ? pin.x : 0;
      pz = pin ? pin.z + 1.8 : 0;
    }
    playerMesh.position.set(px, 0, pz);
    camera.position.set(px, CAMERA_HEIGHT, pz + CAMERA_DIST);
    camera.lookAt(px, 1, pz);
    syncCoastVesper();
    if (regionId === 'stormreach' && !silent && !seenBeats['coast-landing']) {
      const fn = EW.scenes['coast-landing'];
      if (typeof fn === 'function') {
        const played = fn();
        if (played !== false && dialogueOpen) pendingBeat = 'coast-landing';
      }
    }
    refreshRumor();
    saveGame();
    suppressEncountersUntil = performance.now() + 1800;
  }

  function returnToIsle() {
    if (regionId !== 'stormreach' || dialogueOpen || skyPass) return;
    enterRegion('verdant-isle');
  }

  function landOnCoast() {
    if (locale !== 'field' || regionId !== 'verdant-isle' || dialogueOpen || skyPass) return;
    if (!seenBeats.coastRoute) return;
    beginCoastVisual();
    if (skyPass) {
      skyPass.mode = 'land';
      skyPass.dur = seenBeats['coast-landing'] ? 4.2 : 6.5;
    }
    if (!seenBeats['coast-landing']) {
      const fn = EW.scenes['coast-descent'];
      if (typeof fn === 'function') fn();
    }
  }

  function finishLanding() {
    if (regionId === 'stormreach') return;
    if (eagleGroup) {
      if (eagleGroup.parent) eagleGroup.parent.remove(eagleGroup);
      if (overworldGroup) overworldGroup.add(eagleGroup);
      eagleGroup.visible = false;
    }
    if (coastGroup) coastGroup.visible = false;
    skyPass = null;
    enterRegion('stormreach');
    if (gameState === State.OVERWORLD && !dialogueOpen && !inventoryOpen && !encounterLocked) {
      setFieldControls(true);
    }
  }

  function noteMerge(word) {
    mergeWord = word === 'plasma' ? 'plasma' : 'steam';
    seenBeats['merge-tease'] = true;
    refreshRumor();
    saveGame();
  }

  function noteDuel(id) {
    duelWord = id === 'press' ? 'press' : 'hold';
    seenBeats['vesper-duel'] = true;
    if (duelWord === 'press') applyStrain(4);
    syncCoastVesper();
    refreshRumor();
    saveGame();
  }

  function coastFed() {
    return pools.some((pool) => (pool.region || 'verdant-isle') === 'stormreach' && pool.absorbed);
  }

  function flapEagle(rate) {
    if (!eagleGroup) return;
    const flap = Math.sin((skyPass ? skyPass.t : 0) * rate) * 0.7;
    const wings = eagleGroup.userData.wings || [];
    if (wings[0]) wings[0].rotation.x = flap;
    if (wings[1]) wings[1].rotation.x = -flap;
  }

  function updateSkyPass(dt) {
    if (!skyPass) return;
    if (skyPass.mode === 'coast') updateCoastPass(dt);
    else updateEagleCross(dt);
  }

  function updateEagleCross(dt) {
    if (!eagleGroup || !playerMesh) return;
    skyPass.t += dt;
    const u = Math.min(1, skyPass.t / skyPass.dur);
    const x = playerMesh.position.x - 14 + u * 28;
    const y = 6.5 + Math.sin(u * Math.PI) * 1.6;
    const z = playerMesh.position.z + 2;
    eagleGroup.position.set(x, y, z);
    eagleGroup.rotation.y = -Math.PI / 2;
    eagleGroup.scale.setScalar(1.8);
    flapEagle(8);
    const lift = Math.min(1, skyPass.t / 0.8);
    camera.position.lerp(new THREE.Vector3(
      playerMesh.position.x - 2,
      4.2 + lift * 3.2,
      playerMesh.position.z + 16
    ), 0.14);
    camera.lookAt(x, 2.2, playerMesh.position.z - 2);
    if (skyPass.t >= skyPass.dur && !dialogueOpen) {
      eagleGroup.visible = false;
      skyPass = null;
    }
  }

  function updateCoastPass(dt) {
    if (!eagleGroup || !skyPass) return;
    skyPass.t += dt;
    const u = Math.min(1, skyPass.t / skyPass.dur);
    const landing = skyPass.mode === 'land';
    const x = landing ? -10 + u * 12 : -16 + u * 34;
    const y = landing ? 6.2 - u * 3.4 : 6.6 + Math.sin(u * Math.PI) * 1.3;
    const z = landing ? 4 + u * 4 : 2.4;
    eagleGroup.position.set(x, y, z);
    eagleGroup.rotation.y = -Math.PI / 2;
    eagleGroup.scale.setScalar(1.55);
    flapEagle(7);
    if (coastGroup && coastGroup.userData.boltMat) {
      coastGroup.userData.boltMat.opacity = 0.45 + Math.abs(Math.sin(skyPass.t * 9)) * 0.5;
    }
    if (coastGroup && coastGroup.userData.storm) {
      coastGroup.userData.storm.intensity = 1.1 + Math.abs(Math.sin(skyPass.t * 9)) * 0.8;
    }
    if (landing) {
      camera.position.lerp(new THREE.Vector3(6, 5.2, 12), 0.12);
      camera.lookAt(0, Math.max(1.2, y), 8);
    } else {
      camera.position.lerp(new THREE.Vector3(8 - u * 12, 6.3, 14), 0.1);
      camera.lookAt(0.4, 3.2, -5);
    }
    if (skyPass.t >= skyPass.dur && !dialogueOpen) {
      if (landing) finishLanding();
      else finishCoast();
    }
  }

  EW.present = function (script, done) { openDialogue(script, done); };
  EW.bottlePool = bottlePool;
  EW.beginEncounter = function (ids, tag) {
    beginScriptedFight(ids, tag);
  };
  EW.kilnQuiet = function () {
    const pool = pools.find((p) => p.id === 'kiln');
    return !!(pool && pool.absorbed);
  };
  EW.stoneReady = stoneReady;
  EW.scarWord = function () { return scarVerdict; };
  EW.wakeWaystone = wakeWaystone;
  EW.companyHas = function (id) { return !!(party && party.some((member) => member.id === id)); };
  EW.playSkyPass = playSkyPass;
  EW.playCoastCrossing = playCoastCrossing;
  EW.noteCoast = noteCoast;
  EW.finishLanding = finishLanding;
  EW.elementCount = function (el) { return spark && spark[el] ? spark[el] : 0; };
  EW.noteMerge = noteMerge;
  EW.noteDuel = noteDuel;
  EW.coastFed = coastFed;
  EW.seenVault = function () { return !!seenBeats['vault-face']; };
  EW.revealCoastVesper = function () {
    if (coastVesper) coastVesper.visible = true;
  };
  EW.actReady = actReady;
  EW.whisper = showToast;
  EW.revealSilhouette = function () {
    silhouetteGone = false;
    if (vesperFigure) vesperFigure.visible = true;
  };
  EW.dismissSilhouette = function () {
    silhouetteGone = true;
    syncSilhouette();
  };
  EW.recruit = joinMember;
  EW.setScarVerdict = setScarVerdict;

  window.addEventListener('beforeunload', saveGame);

  function boot() {
    if (typeof THREE === 'undefined') {
      document.body.innerHTML = '<p style="color:#fff;padding:2rem;font-family:sans-serif">Three.js did not load. Emberwake needs the network once, for the CDN.</p>';
      return;
    }
    try {
      initThree();
      resetRun();
      setupJoystick();
      setupKeyboard();
      setupUI();
      refreshTitle();
      animate();
    } catch (err) {
      console.error(err);
      const note = document.createElement('p');
      note.style.cssText = 'position:fixed;inset:0;z-index:200;background:#0c1018;color:#f0e6d2;padding:2rem;font-family:sans-serif';
      note.textContent = 'Emberwake could not start the 3D view. This browser needs WebGL. ' + (err && err.message ? err.message : '');
      document.body.appendChild(note);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
