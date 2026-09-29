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
  let vaultRoom = null;
  let nearDoor = null;
  let nearGate = null;
  let nearReturn = null;
  let nearMarrow = null;
  let scarVerdict = null;
  let regionId = 'verdant-isle';
  let mergeWord = null;
  let merges = {};
  let duelWord = null;
  let kestrelWord = null;
  let hallWord = null;
  let marrowWord = null;
  let scarDebt = 0;
  let scarMarks = {};
  let vesperAsh = null;
  let pipeWord = null;
  let pipeFight = false;
  let pipeLatch = false;
  let pipeRoom = null;
  let nearPipe = null;
  let throatWord = null;
  let throatLatch = false;
  let throatRoom = null;
  let nearThroat = null;
  let kestrelMarrow = null;
  let yardWord = null;
  let yardLatch = false;
  let yardGroup = null;
  let yardStone = null;
  let nearStone = null;
  let nearWarden = null;
  let markWord = null;
  let markLatch = false;
  let markTalk = false;
  let markGroup = null;
  let markStone = null;
  let nearMark = null;
  let naveWord = null;
  let naveLatch = false;
  let naveGroup = null;
  let nearNave = null;
  let galleryWord = null;
  let galleryLatch = false;
  let galleryGroup = null;
  let nearGallery = null;
  let nearStair = null;
  let nearKestrel = null;
  let feedNoted = false;
  let passageNoted = false;
  let feedSpent = false;
  let passageLaid = false;
  let cryptWord = null;
  let cryptLatch = false;
  let cryptTalk = false;
  let cryptGroup = null;
  let nearCrack = null;
  let breachWord = null;
  let breachAsh = false;
  let breachLatch = false;
  let breachTalk = false;
  let breachGroup = null;
  let nearBar = null;
  let claimWord = null;
  let claimLatch = false;
  let claimTalk = false;
  let claimGroup = null;
  let nearPerch = null;
  let kestrelClaim = null;
  let aftermathGroup = null;
  let nearEnd = null;
  let nearCredits = null;
  let creditsFromRun = false;
  let riteTorn = false;
  let lastMergeNote = '';
  let kestrelNave = null;
  let kestrelFly = 0;
  let coverReady = false;
  let assistUsed = {};
  let motes = [];
  let hoods = [];
  let phoneMode = false;
  let nearChest = null;
  let nearNotice = null;
  let nearCord = null;
  let bedWanted = true;
  let motionWanted = true;
  let combatPace = 'steady';
  let audioCtx = null;
  let bedGain = null;
  let bedFilter = null;
  let bedTones = null;
  let bedPlace = 'field';
  let coughPuff = null;
  let marrowVesper = null;
  let marrowStain = null;
  let vesperAshLatch = false;
  let nearWorker = null;
  let nearPorter = null;
  let nearLetter = null;
  let nearMargin = null;
  let nearChalk = null;
  let nearCamp = null;
  let runLive = false;
  const SAVE_KEY = 'emberwake.save.v1';
  let combatsFought = 0;
  let introToastShown = false;
  let pendingBeat = null;
  let victoryTag = null;
  let crawlLatch = false;
  let kilnLatch = false;
  let vaultLatch = false;
  let marrowBusy = false;
  let marrowGroup = null;
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
  let combatKick = 0;
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
      fire: 0, water: 0, lightning: 0, earth: 0, strain: 0, capacity: 3,
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
    return spark.fire + spark.water + spark.lightning + (spark.earth || 0);
  }

  const SCAR_CUT = 5;
  const SCAR_MEND = 3;

  function maxHp(p) {
    let m = p.maxHp;
    if (p.id === 'lira') {
      if (spark.strain >= 80) m -= Math.round(p.maxHp * 0.22);
      else if (spark.strain >= 45) m -= Math.round(p.maxHp * 0.12);
      if (scarDebt > 0) m -= scarDebt * SCAR_CUT;
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
    merges = {};
    duelWord = null;
    kestrelWord = null;
    hallWord = null;
    marrowWord = null;
    scarDebt = 0;
    scarMarks = {};
    vesperAsh = null;
    vesperAshLatch = false;
    pipeWord = null;
    pipeFight = false;
    pipeLatch = false;
    nearPipe = null;
    if (pipeRoom) pipeRoom.visible = false;
    throatWord = null;
    throatLatch = false;
    nearThroat = null;
    kestrelMarrow = null;
    yardWord = null;
    yardLatch = false;
    nearStone = null;
    nearWarden = null;
    markWord = null;
    markLatch = false;
    markTalk = false;
    nearMark = null;
    naveWord = null;
    naveLatch = false;
    nearNave = null;
    galleryWord = null;
    galleryLatch = false;
    nearGallery = null;
    nearStair = null;
    nearKestrel = null;
    feedNoted = false;
    passageNoted = false;
    feedSpent = false;
    passageLaid = false;
    cryptWord = null;
    cryptLatch = false;
    cryptTalk = false;
    nearCrack = null;
    breachWord = null;
    breachAsh = false;
    breachLatch = false;
    breachTalk = false;
    nearBar = null;
    claimWord = null;
    claimLatch = false;
    claimTalk = false;
    nearPerch = null;
    kestrelClaim = null;
    nearEnd = null;
    nearCredits = null;
    creditsFromRun = false;
    riteTorn = false;
    kestrelNave = null;
    kestrelFly = 0;
    coverReady = false;
    assistUsed = {};
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    if (yardStone && yardStone.userData.beamMat) yardStone.userData.beamMat.opacity = 0.12;
    if (throatRoom) throatRoom.visible = false;
    if (marrowStain) marrowStain.visible = false;
    if (coughPuff) {
      coughPuff.visible = false;
      coughPuff.material.opacity = 0;
    }
    nearWorker = null;
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
    vaultLatch = false;
    marrowBusy = false;
    skyPass = null;
    if (eagleGroup) {
      eagleGroup.visible = false;
      if (overworldGroup && eagleGroup.parent && eagleGroup.parent !== overworldGroup) {
        eagleGroup.parent.remove(eagleGroup);
        overworldGroup.add(eagleGroup);
      }
    }
    if (coastGroup) coastGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    if (stormreachGroup) stormreachGroup.visible = false;
    if (coastVesper) coastVesper.visible = false;
    if (vaultRoom) vaultRoom.visible = false;
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
    placeFog('verdant');
    inventoryOpen = false;
    inventoryPanel.classList.add('hidden');
    tintHost();
  }

  // ─── Three build ──────────────────────────────────────────
  function phoneGpu() {
    return window.matchMedia('(pointer: coarse)').matches || Math.min(window.innerWidth, window.innerHeight) < 700;
  }

  function initThree() {
    const phone = phoneGpu();
    phoneMode = phone;
    renderer = new THREE.WebGLRenderer({
      canvas, antialias: !phone, alpha: false, powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.25 : 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x7eafd4);
    renderer.shadowMap.enabled = !phone;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x7eafd4, 22, 92);
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
    buildMarrow();
    buildYard();
    buildMark();
    buildNave();
    buildGallery();
    buildCrypt();
    buildBreach();
    buildClaim();
    buildAftermath();
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

  function placeFog(place) {
    if (!scene || !scene.fog) return;
    if (place === 'stormreach') {
      scene.fog.color.set(0x6e7e90);
      scene.fog.near = 20;
      scene.fog.far = 86;
      if (renderer) renderer.setClearColor(0x6e7e90);
    } else if (place === 'marrow') {
      scene.fog.color.set(0x4a2018);
      scene.fog.near = 14;
      scene.fog.far = 64;
      if (renderer) renderer.setClearColor(0x4a2018);
    } else if (place === 'vault') {
      scene.fog.color.set(0x1a222c);
      scene.fog.near = 18;
      scene.fog.far = 55;
      if (renderer) renderer.setClearColor(0x1a222c);
    } else if (place === 'pipe') {
      scene.fog.color.set(0x1a1412);
      scene.fog.near = 6;
      scene.fog.far = 18;
      if (renderer) renderer.setClearColor(0x1a1412);
    } else if (place === 'throat') {
      scene.fog.color.set(0x120c10);
      scene.fog.near = 7;
      scene.fog.far = 20;
      if (renderer) renderer.setClearColor(0x120c10);
    } else if (place === 'yard') {
      scene.fog.color.set(0x3a3428);
      scene.fog.near = 16;
      scene.fog.far = 50;
      if (renderer) renderer.setClearColor(0x3a3428);
    } else if (place === 'mark') {
      scene.fog.color.set(0x241820);
      scene.fog.near = 9;
      scene.fog.far = 38;
      if (renderer) renderer.setClearColor(0x241820);
    } else if (place === 'nave') {
      scene.fog.color.set(0x1c1618);
      scene.fog.near = 8;
      scene.fog.far = 48;
      if (renderer) renderer.setClearColor(0x1c1618);
    } else if (place === 'gallery') {
      scene.fog.color.set(0x140e12);
      scene.fog.near = 5;
      scene.fog.far = 22;
      if (renderer) renderer.setClearColor(0x140e12);
    } else if (place === 'crypt') {
      scene.fog.color.set(0x070506);
      scene.fog.near = 4;
      scene.fog.far = 16;
      if (renderer) renderer.setClearColor(0x070506);
    } else if (place === 'breach') {
      scene.fog.color.set(0x12080c);
      scene.fog.near = 8;
      scene.fog.far = 32;
      if (renderer) renderer.setClearColor(0x12080c);
    } else if (place === 'claim') {
      scene.fog.color.set(0x14080e);
      scene.fog.near = 10;
      scene.fog.far = 42;
      if (renderer) renderer.setClearColor(0x14080e);
    } else if (place === 'aftermath') {
      syncAftermath();
    } else if (place === 'cellar') {
      scene.fog.color.set(0x1a1410);
      scene.fog.near = 8;
      scene.fog.far = 28;
      if (renderer) renderer.setClearColor(0x1a1410);
    } else if (place === 'village') {
      scene.fog.color.set(0x3a342c);
      scene.fog.near = 8;
      scene.fog.far = 22;
      if (renderer) renderer.setClearColor(0x3a342c);
    } else {
      scene.fog.color.set(0x7eafd4);
      scene.fog.near = 22;
      scene.fog.far = 92;
      if (renderer) renderer.setClearColor(0x7eafd4);
    }
    tuneBed(place === 'stormreach' ? 'coast' : (place === 'claim' || place === 'aftermath') ? 'claim' : 'field');
  }

  function raisePlane(geo, heightAt) {
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, heightAt(pos.getX(i), pos.getY(i)));
    }
    geo.computeVertexNormals();
  }

  function tintPlane(geo, colorAt) {
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      colorAt(c, pos.getX(i), pos.getY(i), pos.getZ(i));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  }

  function makeSky(hex, highHex) {
    const geo = new THREE.SphereGeometry(64, 22, 16);
    const low = new THREE.Color(hex);
    const high = highHex ? new THREE.Color(highHex) : low.clone().lerp(new THREE.Color(0xfff0d4), 0.55);
    const zenith = high.clone().lerp(new THREE.Color(0xffffff), 0.18);
    const horizon = low.clone().lerp(high, 0.35).lerp(new THREE.Color(0xffe6c4), 0.22);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = Math.max(0, Math.min(1, (y + 22) / 58));
      const lift = t * t * (3 - 2 * t);
      c.copy(low).lerp(high, lift).lerp(zenith, Math.max(0, lift - 0.72) * 1.4);
      const band = Math.exp(-Math.pow((t - 0.34) * 7.5, 2));
      c.lerp(horizon, band * 0.62);
      const x = pos.getX(i);
      const warm = Math.max(0, Math.sin(x * 0.04) * 0.5 + 0.15);
      if (t < 0.5) c.lerp(new THREE.Color(0xffd2a8), warm * (0.5 - t) * 0.35);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      vertexColors: true, side: THREE.BackSide, depthWrite: false, fog: false,
    }));
  }

  function groundGrain(x, y) {
    return Math.sin(x * 3.2) * Math.cos(y * 2.6) * 0.55 + Math.sin(x * 7.4 + y * 5.2) * 0.28;
  }

  function layCloth(parent, x, z, radius, color, opacity) {
    const cloth = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 10),
      new THREE.MeshLambertMaterial({ color, transparent: opacity < 1, opacity })
    );
    cloth.rotation.x = -Math.PI / 2;
    cloth.position.set(x, 0.03, z);
    parent.add(cloth);
    return cloth;
  }

  function buildOverworld() {
    const groundGeo = new THREE.PlaneGeometry(WORLD_SIZE * 1.5, WORLD_SIZE * 1.5, 40, 40);
    raisePlane(groundGeo, (x, y) => (
      Math.sin(x * 0.3) * Math.cos(y * 0.25) * 0.34
      + Math.sin(x * 0.82 + 1.4) * Math.cos(y * 0.66) * 0.09
    ));
    const low = new THREE.Color(0x24562c);
    const high = new THREE.Color(0x9cb85a);
    const soil = new THREE.Color(0x6a5838);
    tintPlane(groundGeo, (c, x, y, h) => {
      const t = Math.max(0, Math.min(1, (h + 0.28) / 0.5));
      c.copy(low).lerp(high, t);
      const patch = Math.sin(x * 0.47) * Math.cos(y * 0.41);
      if (patch > 0.72) c.lerp(soil, 0.45);
      const grit = groundGrain(x, y);
      if (grit > 0.45) c.lerp(soil, 0.22);
      else if (grit < -0.55) c.lerp(high, 0.18);
    });
    const ground = new THREE.Mesh(groundGeo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 7, specular: new THREE.Color(0x243018),
    }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    overworldGroup.add(ground);
    overworldGroup.add(makeWaysideChest(-2.2, 3.6));
    overworldGroup.add(makeSaltCord(3.2, -8));
    overworldGroup.add(makeSky(0x6ea0c8, 0xf3e2c0));

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
      new THREE.MeshPhongMaterial({
        color: 0x1d629e, shininess: 48, specular: new THREE.Color(0xd4ecff), transparent: true, opacity: 0.92,
      })
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
    ringHills(overworldGroup, 31, 16, 0x1a4552);

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

    overworldGroup.add(new THREE.AmbientLight(0xb0c4de, 0.7));
    const sun = new THREE.DirectionalLight(0xfff5e0, 0.85);
    sun.position.set(20, 30, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const sc = sun.shadow.camera;
    sc.near = 1; sc.far = 80; sc.left = -25; sc.right = 25; sc.top = 25; sc.bottom = -25;
    overworldGroup.add(sun);
    const fill = new THREE.DirectionalLight(0x9eb4d0, 0.32);
    fill.position.set(-18, 12, -14);
    overworldGroup.add(fill);
    overworldGroup.add(new THREE.HemisphereLight(0x87b5d9, 0x3d6b3d, 0.42));

    const spawnPin = landmark('spawn');
    playerMesh = makeCharacter(0xc47a4a, 0.95);
    if (playerMesh.userData.ember) playerMesh.userData.ember.visible = true;
    playerMesh.position.set(spawnPin.x, 0, spawnPin.z);
    coughPuff = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xc5d0bc, transparent: true, opacity: 0, depthWrite: false })
    );
    coughPuff.position.set(0.08, 1.16, 0.32);
    coughPuff.visible = false;
    playerMesh.add(coughPuff);
    overworldGroup.add(playerMesh);
  }

  function buildInteriors() {
    interiorGroup = new THREE.Group();
    interiorGroup.visible = false;
    interiorGroup.add(new THREE.AmbientLight(0xc8bba8, 0.45));
    interiorGroup.add(new THREE.HemisphereLight(0x8a7a68, 0x2a241c, 0.35));
    villageRoom = buildRoom({
      floor: 0x6a5344,
      floorAlt: 0x8d6b42,
      wall: 0x8a6a48,
      light: 0xffc48a,
      intensity: 0.85,
      phong: true,
    });
    layCloth(villageRoom, -1.1, 0.4, 1.35, 0x6a3030, 0.92);
    layCloth(villageRoom, 1.6, -1.4, 0.9, 0x3e4a38, 0.88);
    const hearth = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.45, 0.7),
      new THREE.MeshPhongMaterial({ color: 0x4a3428, shininess: 6, specular: new THREE.Color(0x2a1810) })
    );
    hearth.position.set(2.4, 0.22, 1.6);
    villageRoom.add(hearth);
    const coals = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff6a2a })
    );
    coals.position.set(2.4, 0.5, 1.6);
    villageRoom.add(coals);
    const windowGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.9),
      new THREE.MeshBasicMaterial({ color: 0xffc48a })
    );
    windowGlow.position.set(-4.2, 1.5, -1.2);
    windowGlow.rotation.y = Math.PI / 2;
    villageRoom.add(windowGlow);
    const hearthLight = new THREE.PointLight(0xff8844, 0.7, 7);
    hearthLight.position.set(2.2, 1.4, 1.4);
    villageRoom.add(hearthLight);
    makeMotes(villageRoom, 28, 0xd8c4a4, { x: 6, y: 1.4, z: 6 });
    [[-1.4, -1.1, 0xc47a6a], [1.3, -0.8, 0x6a5a48], [0.1, 0.4, 0x6aa8a0]].forEach((spec) => {
      const fig = makeCharacter(spec[2], 0.9);
      fig.position.set(spec[0], 0, spec[1]);
      fig.rotation.y = Math.PI;
      villageRoom.add(fig);
    });
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.14, 0.52),
      new THREE.MeshLambertMaterial({ color: 0x6a5840 })
    );
    tray.position.set(-2.15, 0.22, 1.45);
    villageRoom.add(tray);
    const barley = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.08, 0.36),
      new THREE.MeshLambertMaterial({ color: 0x8a8a78 })
    );
    barley.position.set(-2.15, 0.32, 1.45);
    villageRoom.add(barley);
    const furrow = makeCountPage('GREY FURROW', ['South field', 'Sealed well', 'Not weather']);
    furrow.position.set(-2.15, 1.05, 1.12);
    furrow.rotation.x = -0.38;
    villageRoom.add(furrow);
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.16, 0.28, 7),
      new THREE.MeshLambertMaterial({ color: 0x8a6a38 })
    );
    basket.position.set(-1.35, 0.16, 1.15);
    villageRoom.add(basket);
    const beamMat = new THREE.MeshLambertMaterial({ color: 0x4a3428 });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.22, 0.28), beamMat);
    beam.position.set(0, 2.42, 0.4);
    villageRoom.add(beam);
    const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.18, 0.22), beamMat);
    crossbeam.rotation.y = Math.PI / 2;
    crossbeam.position.set(0, 2.28, 0.2);
    villageRoom.add(crossbeam);
    [-3.55, 3.55].forEach((x) => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 2.45, 0.16),
        new THREE.MeshLambertMaterial({ color: 0x3a2a22 })
      );
      post.position.set(x, 1.22, 1.5);
      villageRoom.add(post);
    });
    const soot = new THREE.Mesh(
      new THREE.CircleGeometry(0.9, 12),
      new THREE.MeshBasicMaterial({ color: 0x1a100c, transparent: true, opacity: 0.5 })
    );
    soot.rotation.x = -Math.PI / 2;
    soot.position.set(2.35, 0.045, 1.5);
    villageRoom.add(soot);
    const margin = makeCountPage('MARGIN', ['Not the clerk', 'Vesper walked them', 'The furrow paid']);
    margin.position.set(-1.35, 0.95, 0.82);
    margin.rotation.x = -0.42;
    margin.scale.set(0.7, 0.7, 1);
    villageRoom.add(margin);
    cellarRoom = buildCellar();
    cellarRoom.visible = false;
    vaultRoom = buildVaultRoom();
    pipeRoom = buildPipe();
    throatRoom = buildThroat();
    interiorGroup.add(villageRoom);
    interiorGroup.add(cellarRoom);
    interiorGroup.add(vaultRoom);
    interiorGroup.add(pipeRoom);
    interiorGroup.add(throatRoom);
    pools.forEach((p) => {
      if (p.interior === 'root-cellar' && p.group) cellarRoom.add(p.group);
    });
    scene.add(interiorGroup);
  }

  function buildCellar() {
    const g = buildRoom({
      floor: 0x3a322c,
      floorAlt: 0x2a201c,
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

  function buildVaultRoom() {
    const g = buildRoom({
      floor: 0x3e4550,
      floorAlt: 0x6a6258,
      wall: 0x2c3138,
      light: 0xd4c08a,
      intensity: 0.72,
      openNorth: true,
      phong: true,
    });
    layCloth(g, 0.15, 1.2, 1.7, 0x3a2418, 0.9);
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.7, 0.7),
      new THREE.MeshPhongMaterial({ color: 0x4a4034, shininess: 8, specular: new THREE.Color(0x3a3020) })
    );
    desk.position.set(-1.2, 0.35, -0.4);
    g.add(desk);
    const ledger = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.07, 0.42),
      new THREE.MeshPhongMaterial({ color: 0xd2c09a, shininess: 3 })
    );
    ledger.position.set(-1.05, 0.74, -0.32);
    g.add(ledger);
    const countPage = makeCountPage('THE COUNT', ['Four storms', 'Three bottled', 'One sold']);
    countPage.position.set(0.7, 1.22, 0.95);
    countPage.rotation.x = -0.38;
    countPage.scale.set(0.82, 0.82, 1);
    g.add(countPage);
    const ironBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.35, 0.08, 0.08),
      new THREE.MeshPhongMaterial({ color: 0x2a241c, shininess: 22, specular: new THREE.Color(0x8a8478) })
    );
    ironBar.position.set(0, 0.62, -4.15);
    g.add(ironBar);
    const clerk = makeCharacter(0x3a3532, 0.92);
    clerk.position.set(-1.2, 0, -1.5);
    clerk.rotation.y = Math.PI;
    g.add(clerk);
    const guard = makeCharacter(0x2a3038, 0.95);
    guard.position.set(2.2, 0, -1.1);
    guard.rotation.y = Math.PI * 0.85;
    g.add(guard);
    [-1.35, 1.35].forEach((x) => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 2.2, 0.18),
        new THREE.MeshLambertMaterial({ color: 0x14181e })
      );
      post.position.set(x, 1.1, -4.2);
      g.add(post);
    });

    const throat = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 3.2),
      new THREE.MeshLambertMaterial({ color: 0x2a3038 })
    );
    throat.rotation.x = -Math.PI / 2;
    throat.position.set(0, 0.02, -5.6);
    g.add(throat);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x24282e });
    [[-1.35, -5.6], [1.35, -5.6]].forEach((spot) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.4, 3.2), wallMat);
      wall.position.set(spot[0], 1.2, spot[1]);
      g.add(wall);
    });

    const hallFloor = variedFloor(7.4, 10.2, 10, 8, 0x1c2430, 0x4a463c, 0.04);
    hallFloor.position.set(0, 0.03, -11);
    g.add(hallFloor);
    layCloth(g, -1.4, -10.2, 1.1, 0x2a2418, 0.8);
    layCloth(g, 1.6, -12.4, 0.85, 0x243038, 0.72);
    [[-3.7, -11, 10.2, 0.3], [3.7, -11, 10.2, 0.3]].forEach((spec) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(spec[3], 2.6, spec[2]), wallMat);
      wall.position.set(spec[0], 1.3, spec[1]);
      g.add(wall);
    });
    const endWallL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 0.3), wallMat);
    endWallL.position.set(-2.5, 1.3, -15.9);
    const endWallR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 0.3), wallMat);
    endWallR.position.set(2.5, 1.3, -15.9);
    g.add(endWallL);
    g.add(endWallR);

    const bottleColors = [0xff6a1a, 0x3ec6ff, 0xd2b4ff, 0xff6a1a, 0x3ec6ff, 0xd2b4ff];
    bottleColors.forEach((color, i) => {
      const col = i < 3 ? -1.7 : 1.5;
      const row = -8.2 - (i % 3) * 1.5;
      const jar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.26, 0.9, 8),
        new THREE.MeshLambertMaterial({ color: color, emissive: new THREE.Color(color).multiplyScalar(0.25) })
      );
      jar.position.set(col, 0.5, row);
      g.add(jar);
      const seal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.12, 0),
        new THREE.MeshLambertMaterial({ color: 0xe2c878, emissive: new THREE.Color(0x6a5010) })
      );
      seal.position.set(col, 1.05, row);
      g.add(seal);
    });
    const earthJar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.34, 1.05, 8),
      new THREE.MeshLambertMaterial({ color: 0x8a5a32, emissive: new THREE.Color(0x3a2410) })
    );
    earthJar.position.set(-0.2, 0.55, -9.4);
    g.add(earthJar);
    const earthSeal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.16, 0),
      new THREE.MeshLambertMaterial({ color: 0xe2c878, emissive: new THREE.Color(0x6a5010) })
    );
    earthSeal.position.set(-0.2, 1.2, -9.4);
    g.add(earthSeal);
    const marrowJar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.4, 1.3, 8),
      new THREE.MeshLambertMaterial({ color: 0x4a1814, emissive: new THREE.Color(0x2a0808) })
    );
    marrowJar.position.set(0, 0.7, -14.4);
    g.add(marrowJar);
    const inlandFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.62),
      new THREE.MeshBasicMaterial({ color: 0xe2c878, fog: false })
    );
    inlandFace.position.set(0, 0.78, -14.72);
    inlandFace.rotation.y = Math.PI;
    g.add(inlandFace);
    const inland = makeCountPage('INLAND', ['Not the harbor', 'Ashen Marrow', 'The cork stays']);
    inland.position.set(1.45, 1.55, -13.35);
    inland.rotation.x = -0.32;
    g.add(inland);
    const rope = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.045, 6, 16),
      new THREE.MeshLambertMaterial({ color: 0xe2c878, emissive: new THREE.Color(0x6a5010) })
    );
    rope.rotation.x = Math.PI / 2;
    rope.position.set(-0.2, 0.06, -8.45);
    g.add(rope);
    const shaft = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 6.2),
      new THREE.MeshBasicMaterial({ color: 0xe6d2a4, transparent: true, opacity: 0.14, depthWrite: false })
    );
    shaft.position.set(-0.4, 1.6, -11);
    shaft.rotation.z = 0.35;
    g.add(shaft);
    const deskLamp = new THREE.PointLight(0xffe0a8, 0.55, 6);
    deskLamp.position.set(-1.2, 1.6, -0.2);
    g.add(deskLamp);
    makeMotes(g, 32, 0xc8b89a, { x: 5, y: 1.6, z: 8 });
    const hallLight = new THREE.PointLight(0xd4c08a, 0.9, 16);
    hallLight.position.set(0, 2.4, -10);
    g.add(hallLight);
    const marrowLight = new THREE.PointLight(0xff5530, 0.7, 10);
    marrowLight.position.set(0, 1.8, -14.2);
    g.add(marrowLight);
    g.userData.marrowLight = marrowLight;
    const hallClerk = makeCharacter(0x3a3532, 0.9);
    hallClerk.position.set(1.8, 0, -8.6);
    hallClerk.rotation.y = Math.PI * 0.5;
    g.add(hallClerk);
    g.visible = false;
    return g;
  }

  function buildPipe() {
    const g = new THREE.Group();
    g.visible = false;
    const floor = variedFloor(3.4, 7.6, 6, 10, 0x2a2422, 0x4a3830, 0.035, true);
    floor.position.set(0, 0, -0.3);
    g.add(floor);
    layCloth(g, 0.2, -1.4, 0.85, 0x3a1814, 0.7);
    layCloth(g, 0.1, 1.55, 0.55, 0x1a100c, 0.55);
    const pipeLamp = new THREE.PointLight(0xff8844, 0.45, 7);
    pipeLamp.position.set(0, 1.8, 0.4);
    g.add(pipeLamp);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x2c2826 });
    [[-1.55, -0.3], [1.55, -0.3]].forEach((spot) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.3, 7.4), wallMat);
      wall.position.set(spot[0], 1.15, spot[1]);
      g.add(wall);
    });
    const end = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.3, 0.28), wallMat);
    end.position.set(0, 1.15, -3.85);
    g.add(end);
    const iron = new THREE.MeshLambertMaterial({ color: 0x4a453c });
    [-1.05, 1.05].forEach((x) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 6.2, 7), iron);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(x, 1.55, -0.4);
      g.add(pipe);
    });
    const valve = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.07, 6, 12),
      new THREE.MeshLambertMaterial({ color: 0xc4a46a, emissive: new THREE.Color(0x3a2810) })
    );
    valve.position.set(0, 1.15, -3.35);
    g.add(valve);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6),
      iron
    );
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0, 1.15, -3.2);
    g.add(hub);
    const stoker = makeCharacter(0x4a4038, 0.9);
    stoker.position.set(0.35, 0, -2.55);
    stoker.rotation.y = Math.PI;
    g.add(stoker);
    const lamp = new THREE.PointLight(0xff7744, 0.85, 10);
    lamp.position.set(0, 2.1, -2.2);
    g.add(lamp);
    const drip = layCloth(g, -0.2, -2.7, 0.7, 0x3a1814, 0.85);
    drip.position.y = 0.04;
    const bracket = new THREE.Mesh(
      new THREE.BoxGeometry(2.35, 0.08, 0.12),
      new THREE.MeshPhongMaterial({ color: 0x5a5348, shininess: 16, specular: new THREE.Color(0x2a2418) })
    );
    bracket.position.set(0, 1.18, 0.85);
    g.add(bracket);
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.09, 0.16, 6),
      new THREE.MeshPhongMaterial({ color: 0x3a3028, shininess: 8 })
    );
    cup.position.set(-0.48, 0.1, 1.25);
    g.add(cup);
    const feed = makeCountPage('THE FEED', ['Harbor shortage', 'Ashen engine', 'The valve is a choice']);
    feed.position.set(0, 1.42, 1.72);
    feed.scale.set(0.58, 0.58, 1);
    g.add(feed);
    return g;
  }

  function buildThroat() {
    const g = new THREE.Group();
    g.visible = false;
    const floor = variedFloor(5.2, 7.2, 8, 8, 0x1c1416, 0x3a2824, 0.03);
    floor.position.set(0, 0, -0.2);
    g.add(floor);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x241c1c });
    [[-2.4, -0.2, 0.28, 7], [2.4, -0.2, 0.28, 7]].forEach((spec) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(spec[2], 2.4, spec[3]), wallMat);
      wall.position.set(spec[0], 1.2, spec[1]);
      g.add(wall);
    });
    const end = new THREE.Mesh(new THREE.BoxGeometry(5.1, 2.4, 0.28), wallMat);
    end.position.set(0, 1.2, -3.55);
    g.add(end);
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.35, 0.8),
      new THREE.MeshLambertMaterial({ color: 0x3a3028 })
    );
    plinth.position.set(0, 0.18, -2.15);
    g.add(plinth);
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 0.95, 8),
      new THREE.MeshLambertMaterial({ color: 0x2a1018, emissive: new THREE.Color(0x3a1014) })
    );
    bottle.position.set(0, 0.8, -2.15);
    g.add(bottle);
    const seal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      new THREE.MeshLambertMaterial({ color: 0xe2c878, emissive: new THREE.Color(0x6a5010) })
    );
    seal.position.set(0, 1.35, -2.15);
    g.add(seal);
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 1.15, 0.22),
      new THREE.MeshLambertMaterial({ color: 0x2c2a28 })
    );
    slab.position.set(1.35, 0.58, -1.15);
    g.add(slab);
    const slabCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.12, 0.36),
      new THREE.MeshLambertMaterial({ color: 0x3a3834 })
    );
    slabCap.position.set(1.35, 1.18, -1.15);
    g.add(slabCap);
    const lamp = new THREE.PointLight(0xff5530, 0.75, 8);
    lamp.position.set(0, 2.1, -1.8);
    g.add(lamp);
    makeMotes(g, 24, 0xc45a3a, { x: 3.2, y: 1.4, z: 5 });
    return g;
  }

  function throatFits(x, z) {
    if (z > 3.1 || z < -3.2) return false;
    if (Math.abs(x) > 2.05) return false;
    return true;
  }

  function pipeFits(x, z) {
    if (z > 3.15 || z < -3.55) return false;
    if (Math.abs(x) > 1.25) return false;
    return true;
  }

  function vaultFits(x, z) {
    if (z > 3.45) return false;
    if (z >= -3.2 && Math.abs(x) <= 3.45) return true;
    if (!seenBeats['vault-ledger']) return false;
    if (z <= -3.05 && z >= -6.4 && Math.abs(x) <= 1.15) return true;
    if (z <= -6.15 && z >= -15.6 && Math.abs(x) <= 3.25) return true;
    return false;
  }

  function buildMarrow() {
    const g = new THREE.Group();
    g.visible = false;
    g.add(new THREE.AmbientLight(0x6a4030, 0.45));
    g.add(new THREE.HemisphereLight(0x8a4030, 0x1a100c, 0.35));
    const ashGeo = new THREE.PlaneGeometry(36, 28, 22, 16);
    raisePlane(ashGeo, (x, y) => (
      Math.sin(x * 0.38) * Math.cos(y * 0.33) * 0.26
      + Math.sin(x * 1.15 + y * 0.4) * 0.07
    ));
    const ashDark = new THREE.Color(0x241410);
    const ashRed = new THREE.Color(0x6a3424);
    const cinder = new THREE.Color(0x3a3834);
    const sootAsh = new THREE.Color(0x100806);
    tintPlane(ashGeo, (c, x, y, h) => {
      const t = Math.max(0, Math.min(1, (h + 0.2) / 0.36));
      c.copy(ashDark).lerp(ashRed, t);
      if (Math.sin(x * 0.9) * Math.cos(y * 0.7) > 0.55) c.lerp(cinder, 0.4);
      if (Math.hypot(x, y - 2) < 3.4) c.lerp(sootAsh, 0.5);
      if (groundGrain(x, y) > 0.4) c.lerp(sootAsh, 0.28);
    });
    const ash = new THREE.Mesh(ashGeo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 4, specular: new THREE.Color(0x3a2018),
    }));
    ash.rotation.x = -Math.PI / 2;
    g.add(ash);
    g.add(makeSky(0x4a2018, 0xd08048));
    [[1.7, 2.35, 0.85], [-1.85, 0.55, 0.65], [0.55, -1.05, 0.5]].forEach((spot) => {
      const drift = new THREE.Mesh(
        new THREE.SphereGeometry(spot[2], 8, 6),
        new THREE.MeshLambertMaterial({ color: 0x2a1814 })
      );
      drift.scale.y = 0.28;
      drift.position.set(spot[0], 0.06, spot[1]);
      g.add(drift);
    });
    const engine = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.4, 2.2),
      new THREE.MeshPhongMaterial({ color: 0x3a3532, shininess: 12, specular: new THREE.Color(0x4a4038) })
    );
    engine.position.set(0, 1.2, -2);
    g.add(engine);
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 1.05, 1.15, 8),
      new THREE.MeshLambertMaterial({ color: 0x4a4038 })
    );
    drum.position.set(0, 2.65, -2);
    g.add(drum);
    const maw = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.4, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x1a0808 })
    );
    maw.position.set(0, 1.1, -0.8);
    g.add(maw);
    const seal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28, 0),
      new THREE.MeshLambertMaterial({ color: 0xe2c878, emissive: new THREE.Color(0x6a3010) })
    );
    seal.position.set(0, 2.5, -2);
    g.add(seal);
    const leak = new THREE.PointLight(0xff4420, 1.3, 18);
    leak.position.set(0, 1.4, 1.2);
    g.add(leak);
    g.userData.leak = leak;
    const tender = makeCharacter(0x4a4038, 0.92);
    tender.position.set(4.2, 0, 1.8);
    tender.rotation.y = Math.PI * 0.85;
    g.add(tender);
    const gateL = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 2.2, 0.35),
      new THREE.MeshLambertMaterial({ color: 0x3a3532 })
    );
    gateL.position.set(-1.5, 1.1, 4.55);
    const gateR = gateL.clone();
    gateR.position.x = 1.5;
    g.add(gateL);
    g.add(gateR);
    marrowVesper = makeSilhouette(-4.2, -3.6);
    marrowVesper.visible = true;
    marrowVesper.rotation.y = 0.9;
    g.add(marrowVesper);
    marrowStain = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 14),
      new THREE.MeshLambertMaterial({ color: 0x1a0814, transparent: true, opacity: 0.92 })
    );
    marrowStain.rotation.x = -Math.PI / 2;
    marrowStain.position.set(-3.3, 0.05, -2.9);
    marrowStain.visible = false;
    g.add(marrowStain);
    yardStone = makeWaystone(-5.4, 0.15);
    yardStone.scale.setScalar(0.72);
    if (yardStone.userData.beamMat) yardStone.userData.beamMat.opacity = 0.12;
    if (yardStone.userData.glow) yardStone.userData.glow.intensity = 0.2;
    g.add(yardStone);
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.28, 0.28),
      new THREE.MeshLambertMaterial({ color: 0x6e675c })
    );
    lintel.position.set(0, 2.2, 4.55);
    g.add(lintel);
    const throatMouth = new THREE.Group();
    throatMouth.position.set(0, 0, -3.45);
    const jambMat = new THREE.MeshLambertMaterial({ color: 0x3a3532 });
    [-0.7, 0.7].forEach((x) => {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.1, 0.28), jambMat);
      jamb.position.set(x, 1.05, 0);
      throatMouth.add(jamb);
    });
    const throatLintel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.22, 0.28), jambMat);
    throatLintel.position.set(0, 2.05, 0);
    throatMouth.add(throatLintel);
    const throatHole = new THREE.Mesh(
      new THREE.PlaneGeometry(1.05, 1.6),
      new THREE.MeshBasicMaterial({ color: 0x10080c })
    );
    throatHole.position.set(0, 1.05, 0.02);
    throatMouth.add(throatHole);
    g.add(throatMouth);
    [[0.35, 2.15], [-0.28, 1.35], [0.22, 0.5], [-0.18, -0.35]].forEach((spot) => {
      const print = new THREE.Mesh(
        new THREE.CircleGeometry(0.22, 8),
        new THREE.MeshBasicMaterial({ color: 0x140c0a, transparent: true, opacity: 0.82 })
      );
      print.rotation.x = -Math.PI / 2;
      print.position.set(spot[0], 0.06, spot[1]);
      g.add(print);
    });
    const bill = makeCountPage('THE BILL', ['What leaked', 'What she ate', 'What the engine kept']);
    bill.position.set(1.35, 1.55, 1.05);
    bill.rotation.x = -0.34;
    g.add(bill);
    makeMotes(g, 40, 0xc45a3a, { x: 10, y: 1.8, z: 8 });
    const pipeMouth = new THREE.Group();
    pipeMouth.position.set(5.55, 0, -3.15);
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.78, 1.5, 8),
      new THREE.MeshLambertMaterial({ color: 0x3a3532 })
    );
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0, 0.72, 0);
    pipeMouth.add(tube);
    const lip = new THREE.Mesh(
      new THREE.TorusGeometry(0.62, 0.1, 6, 12),
      new THREE.MeshLambertMaterial({ color: 0x6e675c })
    );
    lip.position.set(0, 0.72, 0.72);
    pipeMouth.add(lip);
    const hole = new THREE.Mesh(
      new THREE.CircleGeometry(0.46, 10),
      new THREE.MeshBasicMaterial({ color: 0x100c0c })
    );
    hole.position.set(0, 0.72, 0.78);
    pipeMouth.add(hole);
    g.add(pipeMouth);
    pools.forEach((pool) => {
      if (pool.id === 'marrow-leak' && pool.group) {
        pool.group.scale.setScalar(0.55);
        g.add(pool.group);
      }
    });
    g.userData.leak = leak;
    marrowGroup = g;
    scene.add(g);
  }

  function marrowFits(x, z) {
    if (z > 4.7 || z < -5.4) return false;
    if (Math.abs(x) > 6.2) return false;
    return true;
  }

  function buildYard() {
    const g = new THREE.Group();
    g.visible = false;
    g.add(new THREE.AmbientLight(0x8a7a62, 0.58));
    g.add(new THREE.HemisphereLight(0xc4a878, 0x2a2418, 0.46));
    const sun = new THREE.DirectionalLight(0xffe0b0, 0.88);
    sun.position.set(-8, 14, 6);
    g.add(sun);
    const yardFill = new THREE.DirectionalLight(0x8aa0c0, 0.28);
    yardFill.position.set(6, 8, -10);
    g.add(yardFill);
    const geo = new THREE.PlaneGeometry(32, 24, 18, 14);
    raisePlane(geo, (x, y) => Math.sin(x * 0.45) * Math.cos(y * 0.4) * 0.16);
    const iron = new THREE.Color(0x3a342c);
    const ash = new THREE.Color(0x6a5438);
    const soot = new THREE.Color(0x241c18);
    tintPlane(geo, (c, x, y, h) => {
      c.copy(iron).lerp(ash, Math.max(0, Math.min(1, (h + 0.1) / 0.28)));
      if (Math.sin(x * 0.8) * Math.cos(y * 0.6) < -0.4) c.lerp(soot, 0.45);
    });
    const ground = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 5, specular: new THREE.Color(0x2a241c),
    }));
    ground.rotation.x = -Math.PI / 2;
    g.add(ground);
    g.add(makeSky(0x4a4034, 0xe4c48a));
    const fenceMat = new THREE.MeshLambertMaterial({ color: 0x3a3530 });
    [[-6.2, 0, 0.28, 9], [6.2, 0, 0.28, 9]].forEach((spec) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(spec[2], 1.4, spec[3]), fenceMat);
      wall.position.set(spec[0], 0.7, spec[1]);
      g.add(wall);
    });
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 1.3),
      new THREE.MeshLambertMaterial({ color: 0xc4a46a, side: THREE.DoubleSide })
    );
    banner.position.set(4.4, 1.6, 2.4);
    g.add(banner);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.2, 5),
      fenceMat
    );
    pole.position.set(4.8, 1.1, 2.4);
    g.add(pole);
    const warden = makeCharacter(0x4a453c, 0.92);
    warden.position.set(3.5, 0, 1.5);
    warden.rotation.y = Math.PI * 0.8;
    g.add(warden);
    const vesper = makeSilhouette(-3.8, -2.4);
    vesper.visible = true;
    vesper.rotation.y = 0.6;
    g.add(vesper);
    [-1.4, 1.4].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.8, 0.28), fenceMat);
      post.position.set(x, 0.9, 4.55);
      g.add(post);
    });
    const yardLintel = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, 0.22), new THREE.MeshLambertMaterial({ color: 0x6e675c }));
    yardLintel.position.set(0, 1.8, 4.55);
    g.add(yardLintel);
    pools.forEach((pool) => {
      if (pool.id === 'yard-slag' && pool.group) {
        pool.group.scale.setScalar(0.5);
        g.add(pool.group);
      }
    });
    markStone = makeWaystone(4.55, -3.85);
    markStone.scale.setScalar(0.55);
    if (markStone.userData.beamMat) markStone.userData.beamMat.opacity = 0.34;
    if (markStone.userData.glow) markStone.userData.glow.intensity = 0.55;
    g.add(markStone);
    makeMotes(g, 36, 0xd8c49a, { x: 10, y: 1.6, z: 8 });
    const rest = new THREE.Group();
    const restRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.08, 6, 14),
      new THREE.MeshLambertMaterial({ color: 0x3a3028 })
    );
    restRing.rotation.x = Math.PI / 2;
    restRing.position.y = 0.06;
    rest.add(restRing);
    for (let i = 0; i < 6; i++) {
      const stone = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.11, 0),
        new THREE.MeshLambertMaterial({ color: 0x5c5248 })
      );
      const a = (i / 6) * Math.PI * 2;
      stone.position.set(Math.cos(a) * 0.62, 0.1, Math.sin(a) * 0.62);
      rest.add(stone);
    }
    const restEmber = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.26, 5),
      new THREE.MeshBasicMaterial({ color: 0xff7a3a })
    );
    restEmber.position.y = 0.2;
    rest.add(restEmber);
    const bedroll = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.05, 0.36),
      new THREE.MeshLambertMaterial({ color: 0x6a4030 })
    );
    bedroll.position.set(0.95, 0.04, 0.12);
    rest.add(bedroll);
    rest.position.set(-4.15, 0, 2.55);
    g.add(rest);
    yardGroup = g;
    scene.add(g);
  }

  function yardFits(x, z) {
    if (z > 4.7 || z < -4.6) return false;
    if (Math.abs(x) > 5.8) return false;
    return true;
  }

  function buildMark() {
    const g = new THREE.Group();
    g.visible = false;
    g.add(new THREE.AmbientLight(0x6a5848, 0.52));
    g.add(new THREE.HemisphereLight(0xc4a888, 0x1a1218, 0.62));
    const sun = new THREE.DirectionalLight(0xffd2a0, 1.05);
    sun.position.set(8, 16, 4);
    g.add(sun);
    const fill = new THREE.DirectionalLight(0x7a8cb8, 0.36);
    fill.position.set(-10, 8, -6);
    g.add(fill);
    const geo = new THREE.PlaneGeometry(30, 26, 16, 14);
    raisePlane(geo, (x, y) => Math.sin(x * 0.35) * Math.cos(y * 0.5) * 0.22 + (y < -1.2 ? 0.08 : 0));
    const ash = new THREE.Color(0x3a2e32);
    const bone = new THREE.Color(0x6a5848);
    const soot = new THREE.Color(0x1a1418);
    tintPlane(geo, (c, x, y, h) => {
      c.copy(ash).lerp(bone, Math.max(0, Math.min(1, (h + 0.08) / 0.3)));
      if (Math.hypot(x, y + 2.4) < 2.4) c.lerp(new THREE.Color(0x8a7860), 0.55);
      if (Math.sin(x * 1.1) * Math.cos(y * 0.7) < -0.35) c.lerp(soot, 0.4);
    });
    const ground = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 6, specular: new THREE.Color(0x2a2018),
    }));
    ground.rotation.x = -Math.PI / 2;
    g.add(ground);
    g.add(makeSky(0x241c28, 0xc4a07a));
    const stone = new THREE.MeshPhongMaterial({
      color: 0x2a2428, shininess: 8, specular: new THREE.Color(0x3a3030),
    });
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.42, 3.4, 0.7), stone);
    left.position.set(-0.28, 1.7, -2.4);
    left.rotation.z = 0.08;
    g.add(left);
    const right = new THREE.Mesh(new THREE.BoxGeometry(0.38, 2.8, 0.62), stone);
    right.position.set(0.34, 1.4, -2.35);
    right.rotation.z = -0.12;
    g.add(right);
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.12, 0.78),
      new THREE.MeshPhongMaterial({ color: 0xc4a46a, emissive: new THREE.Color(0x3a2a10), shininess: 18 })
    );
    band.position.set(0.02, 1.15, -2.38);
    g.add(band);
    const lamp = new THREE.PointLight(0xffb060, 0.85, 11);
    lamp.position.set(0.1, 2.4, -2.2);
    g.add(lamp);
    const vesper = makeSilhouette(-2.4, -2.55);
    vesper.visible = true;
    vesper.rotation.y = 0.4;
    g.add(vesper);
    [-1.2, 1.2].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.6, 0.26), stone);
      post.position.set(x, 0.8, 4.2);
      g.add(post);
    });
    pools.forEach((pool) => {
      if (pool.id === 'mark-weep' && pool.group) {
        pool.group.scale.setScalar(0.5);
        g.add(pool.group);
      }
    });
    const naveRoad = makeWaystone(0, -3.65);
    naveRoad.scale.setScalar(0.42);
    if (naveRoad.userData.beamMat) naveRoad.userData.beamMat.opacity = 0.22;
    if (naveRoad.userData.glow) naveRoad.userData.glow.intensity = 0.35;
    g.add(naveRoad);
    makeMotes(g, 28, 0xd2b48a, { x: 9, y: 1.8, z: 8 });
    markGroup = g;
    scene.add(g);
  }

  function markFits(x, z) {
    if (z > 4.4 || z < -4.2) return false;
    if (Math.abs(x) > 5.4) return false;
    return true;
  }

  function buildNave() {
    const g = new THREE.Group();
    g.visible = false;
    g.add(new THREE.AmbientLight(0x4a3a34, 0.42));
    g.add(new THREE.HemisphereLight(0x8a6848, 0x120c10, 0.55));
    const sun = new THREE.DirectionalLight(0xffc090, 0.72);
    sun.position.set(-6, 14, 8);
    g.add(sun);
    const fill = new THREE.DirectionalLight(0x6a7898, 0.22);
    fill.position.set(8, 6, -4);
    g.add(fill);
    const geo = new THREE.PlaneGeometry(28, 28, 14, 16);
    raisePlane(geo, (x, y) => Math.sin(x * 0.4) * 0.08 + (Math.abs(x) < 1.6 ? -0.04 : 0.06));
    const ash = new THREE.Color(0x2a2224);
    const path = new THREE.Color(0x5a4638);
    const soot = new THREE.Color(0x140e10);
    tintPlane(geo, (c, x, y) => {
      c.copy(ash);
      if (Math.abs(x) < 1.5) c.lerp(path, 0.55);
      if (y < -1.5) c.lerp(soot, 0.35);
    });
    const ground = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 4, specular: new THREE.Color(0x221810),
    }));
    ground.rotation.x = -Math.PI / 2;
    g.add(ground);
    g.add(makeSky(0x1a1216, 0x8a6040));
    const stone = new THREE.MeshPhongMaterial({ color: 0x3a302c, shininess: 6, specular: new THREE.Color(0x2a2018) });
    const bannerMat = new THREE.MeshLambertMaterial({ color: 0x6a3030, side: THREE.DoubleSide });
    [[-2.4, 1.2], [-2.4, -0.6], [2.4, 1.2], [2.4, -0.6]].forEach((spot) => {
      const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.4, 0.7), stone);
      buttress.position.set(spot[0], 1.2, spot[1]);
      g.add(buttress);
    });
    const banners = [];
    [-3.1, 3.1].forEach((x) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.2, 5), stone);
      pole.position.set(x, 1.6, -1.4);
      g.add(pole);
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.5), bannerMat);
      banner.position.set(x > 0 ? x - 0.35 : x + 0.35, 2.1, -1.4);
      g.add(banner);
      banners.push(banner);
    });
    g.userData.banners = banners;
    const doorMat = new THREE.MeshPhongMaterial({ color: 0x241c1c, shininess: 10, specular: new THREE.Color(0x3a2820) });
    [-0.55, 0.55].forEach((x) => {
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.8, 0.22), doorMat);
      door.position.set(x, 1.4, -2.55);
      g.add(door);
    });
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.28, 0.4), stone);
    lintel.position.set(0, 2.9, -2.55);
    g.add(lintel);
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.12, 0.16),
      new THREE.MeshPhongMaterial({ color: 0xc4a46a, emissive: new THREE.Color(0x5a4010), shininess: 20 })
    );
    bar.position.set(0, 1.55, -2.42);
    g.add(bar);
    const gateLight = new THREE.PointLight(0xffb060, 0.9, 12);
    gateLight.position.set(0, 2.2, -1.6);
    g.add(gateLight);
    const massMat = new THREE.MeshLambertMaterial({ color: 0x1a1416 });
    const naveMass = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4.2, 2.2), massMat);
    naveMass.position.set(0, 2.4, -6.2);
    g.add(naveMass);
    [-2.6, 2.6].forEach((x) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.3, 6.4, 1.3), massMat);
      tower.position.set(x, 3.2, -6.4);
      g.add(tower);
      const slit = new THREE.Mesh(
        new THREE.PlaneGeometry(0.18, 0.7),
        new THREE.MeshBasicMaterial({ color: 0xffb060, fog: false })
      );
      slit.position.set(x, 4.2, -5.7);
      g.add(slit);
    });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.6, 4), massMat);
    roof.position.set(0, 5.1, -6.2);
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
    const watcher = makeSilhouette(-2.6, -5.5);
    watcher.visible = true;
    watcher.position.y = 3.4;
    watcher.scale.setScalar(1.15);
    watcher.traverse((child) => {
      if (child.material && child.material.isMeshBasicMaterial) child.material.fog = false;
    });
    g.add(watcher);
    const rimCard = new THREE.Mesh(
      new THREE.PlaneGeometry(7.4, 5.6),
      new THREE.MeshBasicMaterial({
        color: 0xc4a070, transparent: true, opacity: 0.22, depthWrite: false, fog: false,
      })
    );
    rimCard.position.set(0, 2.7, -4.85);
    g.add(rimCard);
    const stainPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.35, 2.05),
      new THREE.MeshBasicMaterial({
        color: 0xc45a48, transparent: true, opacity: 0.7, depthWrite: false, fog: false,
      })
    );
    stainPlane.position.set(0, 2.55, -5.02);
    g.add(stainPlane);
    const stainLight = new THREE.PointLight(0xc45a48, 1.05, 18);
    stainLight.position.set(0, 2.3, -3.2);
    g.add(stainLight);
    g.userData.stain = stainLight;
    g.userData.stainPlane = stainPlane;
    const sideDoor = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.15, 0.95), doorMat);
    sideDoor.position.set(3.85, 1.08, 0.15);
    g.add(sideDoor);
    const sideBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.1, 0.72),
      new THREE.MeshPhongMaterial({ color: 0xc4a46a, emissive: new THREE.Color(0x5a4010), shininess: 18 })
    );
    sideBar.position.set(3.74, 1.15, 0.15);
    g.add(sideBar);
    const bird = new THREE.Group();
    const birdBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 6, 5),
      new THREE.MeshLambertMaterial({ color: 0x2c2418 })
    );
    birdBody.scale.set(2.1, 0.5, 0.65);
    bird.add(birdBody);
    const wingMat = new THREE.MeshLambertMaterial({ color: 0x3a3024, side: THREE.DoubleSide });
    const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.18), wingMat);
    wingL.position.set(0, 0.04, 0.22);
    const wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.18), wingMat);
    wingR.position.set(0, 0.04, -0.22);
    bird.add(wingL);
    bird.add(wingR);
    bird.visible = false;
    bird.position.set(-8, 3.8, -0.6);
    g.add(bird);
    g.userData.bird = bird;
    g.userData.wings = [wingL, wingR];
    [-1.1, 1.1].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.5, 0.24), stone);
      post.position.set(x, 0.75, 4.05);
      g.add(post);
    });
    makeMotes(g, 96, 0xc4b4a4, { x: 12, y: 3.4, z: 14 }, { fall: true });
    const chalk = makeCountPage('CHALK', ['The host is numbered', 'Before the door', 'Not a key']);
    chalk.position.set(-2.85, 1.22, 1.82);
    chalk.scale.set(0.48, 0.48, 1);
    g.add(chalk);
    layCloth(g, -2.85, 1.7, 0.55, 0x1a100c, 0.55);
    naveGroup = g;
    scene.add(g);
  }

  function tuckCathedral() {
    if (naveGroup) naveGroup.visible = false;
    if (galleryGroup) galleryGroup.visible = false;
    if (cryptGroup) cryptGroup.visible = false;
    if (breachGroup) breachGroup.visible = false;
    if (claimGroup) claimGroup.visible = false;
    if (aftermathGroup) aftermathGroup.visible = false;
    if (naveGroup && naveGroup.userData.bird && kestrelFly <= 0) naveGroup.userData.bird.visible = false;
  }

  function buildGallery() {
    const g = new THREE.Group();
    g.visible = false;
    g.add(new THREE.AmbientLight(0x3a2824, 0.5));
    g.add(new THREE.HemisphereLight(0x6a4030, 0x100c10, 0.42));
    const lamp = new THREE.PointLight(0xffb070, 0.8, 12);
    lamp.position.set(0.2, 2.3, 0.6);
    g.add(lamp);
    g.add(variedFloor(8, 8, 8, 8, 0x2a201c, 0x161210, 0.03, true));
    const wall = new THREE.MeshLambertMaterial({ color: 0x3a2c28 });
    function addWall(w, d, x, z) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 2.8, d), wall);
      mesh.position.set(x, 1.4, z);
      g.add(mesh);
    }
    addWall(2.15, 0.28, -2.35, -3.2);
    addWall(2.15, 0.28, 2.35, -3.2);
    addWall(2.35, 0.28, -2.55, 3.2);
    addWall(2.35, 0.28, 2.55, 3.2);
    addWall(0.28, 6.5, -3.4, 0);
    addWall(0.28, 6.5, 3.4, 0);
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.72, 0.72),
      new THREE.MeshPhongMaterial({ color: 0x4a3428, shininess: 8, specular: new THREE.Color(0x2a1810) })
    );
    desk.position.set(0, 0.36, -0.15);
    g.add(desk);
    const page = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 0.48),
      new THREE.MeshBasicMaterial({ color: 0xe8d8b0, fog: false })
    );
    page.rotation.x = -Math.PI / 2;
    page.position.set(0, 0.74, -0.12);
    g.add(page);
    const ink = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.06),
      new THREE.MeshBasicMaterial({ color: 0x2a1810, fog: false })
    );
    ink.rotation.x = -Math.PI / 2;
    ink.position.set(0, 0.75, -0.1);
    g.add(ink);
    const stepMat = new THREE.MeshLambertMaterial({ color: 0x241c1a });
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.16, 0.38), stepMat);
      step.position.set(0, 0.1 + i * 0.16, -1.85 - i * 0.26);
      g.add(step);
    }
    const grate = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 1.7, 0.08),
      new THREE.MeshPhongMaterial({ color: 0xc4a46a, emissive: new THREE.Color(0x3a2810), shininess: 16 })
    );
    grate.position.set(0, 0.95, -2.62);
    g.add(grate);
    g.userData.grate = grate;
    const stain = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 1.35),
      new THREE.MeshBasicMaterial({
        color: 0xc45a48, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false, fog: false,
      })
    );
    stain.position.set(-3.24, 1.65, 0.4);
    stain.rotation.y = Math.PI / 2;
    g.add(stain);
    const stainLight = new THREE.PointLight(0xc45a48, 0.65, 8);
    stainLight.position.set(-2.2, 1.6, 0.4);
    g.add(stainLight);
    g.userData.stain = stainLight;
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.16, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x2a201c })
    );
    beam.position.set(0, 2.58, 0.35);
    g.add(beam);
    const shelfMat = new THREE.MeshPhongMaterial({ color: 0x3a2a22, shininess: 6 });
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 1.55), shelfMat);
    shelf.position.set(3.02, 0.92, 1.2);
    g.add(shelf);
    [0.7, 1.15, 1.6].forEach((z, i) => {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.36, 0.28), shelfMat);
      book.position.set(2.98, 1.14, z);
      book.rotation.z = i === 1 ? 0.08 : 0;
      g.add(book);
    });
    const filed = makeCountPage('FILED COPY', ['Village seal', 'Called mercy', 'Not the stair']);
    filed.position.set(2.48, 1.55, 1.35);
    filed.rotation.y = -Math.PI / 2;
    filed.scale.set(0.52, 0.52, 1);
    g.add(filed);
    layCloth(g, 0.2, 0.85, 0.72, 0x1a100c, 0.42);
    galleryGroup = g;
    scene.add(g);
  }

  function paintCountPage(ctx, tex, title, lines) {
    ctx.fillStyle = '#f0e2c4';
    ctx.fillRect(0, 0, 512, 320);
    ctx.strokeStyle = '#2a140c';
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 12, 488, 296);
    ctx.fillStyle = '#1a0c08';
    ctx.font = 'bold 58px Georgia, serif';
    ctx.fillText(title, 36, 88);
    ctx.font = '32px Georgia, serif';
    lines.forEach((line, i) => ctx.fillText(line, 36, 150 + i * 46));
    tex.needsUpdate = true;
  }

  function makeCountPage(title, lines) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    paintCountPage(ctx, tex, title, lines);
    const page = new THREE.Mesh(
      new THREE.PlaneGeometry(1.85, 1.16),
      new THREE.MeshBasicMaterial({ map: tex, fog: false })
    );
    page.userData.retitle = function (nextTitle, nextLines) {
      paintCountPage(ctx, tex, nextTitle, nextLines);
    };
    return page;
  }

  function buildCrypt() {
    const g = new THREE.Group();
    g.visible = false;
    g.add(new THREE.AmbientLight(0x1a1214, 0.16));
    g.add(new THREE.HemisphereLight(0x3a2418, 0x050304, 0.22));
    const geo = new THREE.PlaneGeometry(8, 8, 6, 6);
    const dust = new THREE.Color(0x14100e);
    const soot = new THREE.Color(0x070506);
    tintPlane(geo, (c, x, y) => {
      c.copy(dust);
      if (y < -0.4) c.lerp(soot, 0.45);
    });
    const floor = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 2, specular: new THREE.Color(0x100808),
    }));
    floor.rotation.x = -Math.PI / 2;
    g.add(floor);
    const wall = new THREE.MeshLambertMaterial({ color: 0x1c1412 });
    function addWall(w, d, x, z) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 3.1, d), wall);
      mesh.position.set(x, 1.55, z);
      g.add(mesh);
    }
    addWall(1.7, 0.28, -1.85, -2.35);
    addWall(1.7, 0.28, 1.85, -2.35);
    addWall(1.9, 0.28, -2.05, 2.85);
    addWall(1.9, 0.28, 2.05, 2.85);
    addWall(0.28, 5.4, -2.7, 0.2);
    addWall(0.28, 5.4, 2.7, 0.2);
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1.05, 0.45),
      new THREE.MeshPhongMaterial({ color: 0x3a2a22, shininess: 6 })
    );
    stand.position.set(0, 0.52, 0.05);
    g.add(stand);
    const page = makeCountPage('LICENCE ZERO', ['Prime Remnant', 'Not for issue', 'The bar stays shut']);
    page.position.set(0, 1.42, 0.22);
    page.rotation.x = -0.42;
    g.add(page);
    const lamp = new THREE.PointLight(0xffc080, 1.35, 7);
    lamp.position.set(0.15, 2.05, 0.85);
    g.add(lamp);
    const crack = new THREE.PointLight(0xff5a28, 0.35, 9);
    crack.position.set(0, 1.3, -1.7);
    g.add(crack);
    g.userData.crack = crack;
    [-0.22, 0.18].forEach((x, i) => {
      const seam = new THREE.Mesh(
        new THREE.PlaneGeometry(0.06, 1.5),
        new THREE.MeshBasicMaterial({ color: 0xff6a2a, transparent: true, opacity: 0.85, fog: false })
      );
      seam.position.set(x, 1.15, -2.18);
      g.add(seam);
    });
    const slit = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 1.7),
      new THREE.MeshBasicMaterial({ color: 0x100806, fog: false })
    );
    slit.position.set(0, 1.2, -2.2);
    g.add(slit);
    const watcher = makeSilhouette(0, -2.55);
    watcher.visible = true;
    watcher.position.y = 0.15;
    watcher.scale.setScalar(1.25);
    watcher.traverse((child) => {
      if (child.material && child.material.isMeshBasicMaterial) child.material.fog = false;
    });
    g.add(watcher);
    g.userData.watcher = watcher;
    function cryptPile(x, z, s) {
      const pile = new THREE.Mesh(
        new THREE.SphereGeometry(s, 6, 5),
        new THREE.MeshLambertMaterial({ color: 0x2a221c })
      );
      pile.scale.y = 0.32;
      pile.position.set(x, s * 0.18, z);
      g.add(pile);
    }
    cryptPile(-1.55, 1.2, 0.36);
    cryptPile(1.35, 0.7, 0.26);
    const floorCrack = new THREE.Mesh(
      new THREE.PlaneGeometry(0.07, 1.7),
      new THREE.MeshBasicMaterial({ color: 0x0a0604, fog: false })
    );
    floorCrack.rotation.x = -Math.PI / 2;
    floorCrack.position.set(0.08, 0.04, 0.15);
    g.add(floorCrack);
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.07, 0.1),
      new THREE.MeshPhongMaterial({ color: 0xc4b4a0, shininess: 8 })
    );
    rib.position.set(-0.9, 0.06, 0.95);
    rib.rotation.y = 0.45;
    g.add(rib);
    cryptGroup = g;
    scene.add(g);
  }

  function buildBreach() {
    const g = new THREE.Group();
    g.visible = false;
    g.add(new THREE.AmbientLight(0x1a1014, 0.28));
    g.add(new THREE.HemisphereLight(0x6a4030, 0x08060a, 0.35));
    const geo = new THREE.PlaneGeometry(16, 18, 8, 8);
    const ash = new THREE.Color(0x1a1412);
    const ember = new THREE.Color(0x6a3018);
    tintPlane(geo, (c, x, y) => {
      c.copy(ash);
      if (y < -1.2) c.lerp(ember, 0.55);
      else if (Math.abs(x) < 1.2) c.lerp(ember, 0.18);
    });
    const floor = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 4, specular: new THREE.Color(0x2a1810),
    }));
    floor.rotation.x = -Math.PI / 2;
    g.add(floor);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x241816 });
    function addWall(w, d, x, z, h) {
      const height = h || 5.2;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), wallMat);
      mesh.position.set(x, height / 2, z);
      g.add(mesh);
    }
    addWall(4.2, 0.4, -4.6, -6.5);
    addWall(4.2, 0.4, 4.6, -6.5);
    addWall(3.6, 0.4, -5.2, 5.7);
    addWall(3.6, 0.4, 5.2, 5.7);
    addWall(0.4, 12.2, -6.4, -0.4);
    addWall(0.4, 12.2, 6.4, -0.4);
    const ribMat = new THREE.MeshPhongMaterial({ color: 0x4a3834, shininess: 8, specular: new THREE.Color(0x2a1810) });
    [-4.2, -1.6, 1.2, 3.6].forEach((z, i) => {
      [-3.6, 3.6].forEach((x) => {
        const h = 3.2 + i * 0.45;
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.45, h, 0.45), ribMat);
        rib.position.set(x, h / 2, z);
        g.add(rib);
      });
    });
    const shafts = [];
    [[-1.6, -1.2], [1.4, -3.1], [0.2, 1.8]].forEach((spot, i) => {
      const shaft = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15, 6.4),
        new THREE.MeshBasicMaterial({
          color: i === 1 ? 0xff6a2a : 0xffe2b0,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
          fog: false,
          side: THREE.DoubleSide,
        })
      );
      shaft.position.set(spot[0], 3.3, spot[1]);
      shaft.rotation.y = i * 0.35;
      g.add(shaft);
      const light = new THREE.PointLight(i === 1 ? 0xff6a2a : 0xffd8a0, 1.15, 14);
      light.position.set(spot[0], 4.6, spot[1]);
      g.add(light);
      shafts.push(light);
    });
    g.userData.shafts = shafts;
    const plaque = makeCountPage('THRESHOLD', ['Licence Zero', 'Not the door', 'The bar stays shut']);
    plaque.position.set(0, 2.35, -5.55);
    plaque.scale.set(1.35, 1.35, 1);
    g.add(plaque);
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(1.7, 24),
      new THREE.MeshBasicMaterial({ color: 0xff5a28, fog: false })
    );
    disc.position.set(0, 2.5, -5.85);
    g.add(disc);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.75, 2.15, 24),
      new THREE.MeshBasicMaterial({ color: 0x2a140c, side: THREE.DoubleSide, fog: false })
    );
    ring.position.set(0, 2.5, -5.82);
    g.add(ring);
    const watcher = makeSilhouette(2.2, -5.35);
    watcher.visible = true;
    watcher.position.y = 0.15;
    watcher.scale.setScalar(2.15);
    watcher.traverse((child) => {
      if (child.material && child.material.isMeshBasicMaterial) child.material.fog = false;
    });
    g.add(watcher);
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.9, 0.35),
      new THREE.MeshPhongMaterial({ color: 0x4a3428, shininess: 8 })
    );
    bar.position.set(0, 0.45, 0.6);
    g.add(bar);
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 1.5),
      new THREE.MeshBasicMaterial({ color: 0x8a3028, side: THREE.DoubleSide, fog: false })
    );
    banner.position.set(-2.4, 1.7, 0.4);
    g.add(banner);
    g.userData.banner = banner;
    function breachPile(x, z, s) {
      const pile = new THREE.Mesh(
        new THREE.SphereGeometry(s, 6, 5),
        new THREE.MeshLambertMaterial({ color: 0x2a221c })
      );
      pile.scale.y = 0.3;
      pile.position.set(x, s * 0.16, z);
      g.add(pile);
    }
    breachPile(-2.35, 3.15, 0.55);
    breachPile(2.15, 2.55, 0.42);
    breachPile(3.1, -1.35, 0.48);
    const aisle = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 2.4),
      new THREE.MeshBasicMaterial({ color: 0x0a0604, fog: false })
    );
    aisle.rotation.x = -Math.PI / 2;
    aisle.position.set(0.05, 0.04, 2.85);
    g.add(aisle);
    const fallen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 0.42),
      new THREE.MeshBasicMaterial({ color: 0x6a2820, side: THREE.DoubleSide, fog: false })
    );
    fallen.rotation.x = -Math.PI / 2;
    fallen.rotation.z = 0.4;
    fallen.position.set(-1.7, 0.05, 3.35);
    g.add(fallen);
    makeMotes(g, 80, 0xc4b4a4, { x: 12, y: 4.2, z: 14 }, { fall: true });
    breachGroup = g;
    scene.add(g);
  }

  function buildClaim() {
    const g = new THREE.Group();
    g.visible = false;
    g.add(new THREE.AmbientLight(0x140c10, 0.1));
    g.add(new THREE.HemisphereLight(0x8a4030, 0x060408, 0.16));
    const claimFill = new THREE.PointLight(0xffd0a8, 0.7, 18);
    claimFill.position.set(0, 2.6, 4.4);
    g.add(claimFill);
    const geo = new THREE.PlaneGeometry(22, 24, 16, 14);
    const ash = new THREE.Color(0x120e10);
    const ember = new THREE.Color(0xc44a18);
    const stone = new THREE.Color(0x1a1412);
    tintPlane(geo, (c, x, y) => {
      c.copy(ash);
      const core = Math.hypot(x, y + 6);
      if (core < 3.2) c.lerp(ember, 0.82);
      else if (core < 5.2) c.lerp(ember, 0.4);
      else if (y < 0) c.lerp(ember, 0.22);
      else c.lerp(stone, 0.45);
      if (groundGrain(x, y) > 0.35) c.lerp(stone, 0.25);
    });
    const floor = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 6, specular: new THREE.Color(0x3a2010),
    }));
    floor.rotation.x = -Math.PI / 2;
    g.add(floor);
    const crack = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 9.2),
      new THREE.MeshBasicMaterial({ color: 0x070406 })
    );
    crack.rotation.x = -Math.PI / 2;
    crack.position.set(0.2, 0.05, -1.4);
    g.add(crack);
    [[2.35, 3.4], [-2.55, 1.5]].forEach((spot) => {
      const pile = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0x1a1210 })
      );
      pile.scale.y = 0.32;
      pile.position.set(spot[0], 0.06, spot[1]);
      g.add(pile);
    });
    const dais = new THREE.Mesh(
      new THREE.RingGeometry(3.55, 4.35, 28),
      new THREE.MeshPhongMaterial({ color: 0x140e0c, shininess: 4, side: THREE.DoubleSide })
    );
    dais.rotation.x = -Math.PI / 2;
    dais.position.set(0, 0.04, -6.05);
    g.add(dais);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x1c1214 });
    function addWall(w, d, x, z, h) {
      const height = h || 7.2;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), wallMat);
      mesh.position.set(x, height / 2, z);
      g.add(mesh);
    }
    addWall(6.2, 0.5, -5.4, -8.6);
    addWall(6.2, 0.5, 5.4, -8.6);
    addWall(5.4, 0.5, -6.2, 8.1);
    addWall(5.4, 0.5, 6.2, 8.1);
    addWall(0.5, 16.4, -8.2, -0.2);
    addWall(0.5, 16.4, 8.2, -0.2);
    const ribMat = new THREE.MeshPhongMaterial({ color: 0x3a2824, shininess: 8, specular: new THREE.Color(0x2a1814) });
    [-6.2, -3.2, -0.2, 2.8, 5.4].forEach((z, i) => {
      [-5.2, 5.2].forEach((x) => {
        const h = 3.6 + i * 0.55;
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.55, h, 0.55), ribMat);
        rib.position.set(x, h / 2, z);
        g.add(rib);
      });
    });
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.45, 0.55),
      new THREE.MeshPhongMaterial({ color: 0x4a3028, shininess: 10 })
    );
    lintel.position.set(0, 3.4, 6.6);
    g.add(lintel);
    [[-1.7, 6.6], [1.7, 6.6]].forEach((pair) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.42, 3.2, 0.42), ribMat);
      post.position.set(pair[0], 1.6, pair[1]);
      g.add(post);
    });
    const shafts = [];
    [[-2.4, -2.2], [2.2, -5.4], [0, -6.4], [-0.6, 2.4]].forEach((spot, i) => {
      const shaft = new THREE.Mesh(
        new THREE.PlaneGeometry(1.35, 8.2),
        new THREE.MeshBasicMaterial({
          color: i === 2 ? 0xff5a28 : 0xffe6c0,
          transparent: true,
          opacity: i === 2 ? 0.46 : 0.28,
          depthWrite: false,
          fog: false,
          side: THREE.DoubleSide,
        })
      );
      shaft.position.set(spot[0], 4.2, spot[1]);
      g.add(shaft);
      const light = new THREE.PointLight(i === 2 ? 0xff5a28 : 0xffd0a0, i === 2 ? 1.8 : 0.9, 18);
      light.position.set(spot[0], 5.4, spot[1]);
      g.add(light);
      shafts.push(light);
    });
    g.userData.shafts = shafts;
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.85, 1),
      new THREE.MeshBasicMaterial({ color: 0xff6a2a, fog: false })
    );
    core.position.set(0, 2.55, -6.15);
    core.scale.setScalar(1.15);
    g.add(core);
    g.userData.core = core;
    const heart = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.62, 0),
      new THREE.MeshBasicMaterial({ color: 0xffe2b0, fog: false })
    );
    heart.position.set(0, 2.55, -6.15);
    g.add(heart);
    const massMat = new THREE.MeshBasicMaterial({ color: 0x3a1810, fog: false });
    for (let i = 0; i < 7; i++) {
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 1.35 + (i % 3) * 0.55, 0.22),
        massMat
      );
      const a = (i / 7) * Math.PI * 2;
      slab.position.set(Math.cos(a) * 1.35, 2.15 + (i % 2) * 0.4, -6.15 + Math.sin(a) * 1.05);
      slab.rotation.y = -a;
      g.add(slab);
    }
    const massWash = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 5.6),
      new THREE.MeshBasicMaterial({
        color: 0xff6a2a, transparent: true, opacity: 0.28, fog: false, depthWrite: false, side: THREE.DoubleSide,
      })
    );
    massWash.position.set(0, 2.7, -7.15);
    g.add(massWash);
    const stage = new THREE.Mesh(
      new THREE.CircleGeometry(3.4, 28),
      new THREE.MeshBasicMaterial({ color: 0xff5a28, transparent: true, opacity: 0.28, fog: false })
    );
    stage.rotation.x = -Math.PI / 2;
    stage.position.set(0, 0.06, -6.05);
    g.add(stage);
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(2.3, 2.7, 28),
      new THREE.MeshBasicMaterial({ color: 0xffe2b0, side: THREE.DoubleSide, transparent: true, opacity: 0.55, fog: false })
    );
    halo.position.set(0, 2.55, -6.05);
    g.add(halo);
    const plaque = makeCountPage('THE CLAIM', ['Prime Remnant', 'Not a licence', 'Lira is the host']);
    plaque.position.set(0, 4.15, -5.15);
    plaque.scale.set(1.55, 1.55, 1);
    g.add(plaque);
    const watcher = makeSilhouette(-3.4, -5.6);
    watcher.visible = true;
    watcher.position.y = 0.2;
    watcher.scale.setScalar(2.65);
    watcher.traverse((child) => {
      if (child.material && child.material.isMeshBasicMaterial) child.material.fog = false;
    });
    g.add(watcher);
    g.userData.watcher = watcher;
    const landed = makeCharacter(0x6a5348, 0.92);
    landed.position.set(0, 0, 0.2);
    landed.visible = false;
    g.add(landed);
    g.userData.landed = landed;
    makeMotes(g, 120, 0xd0b8a4, { x: 16, y: 5.5, z: 18 }, { fall: true });
    claimGroup = g;
    scene.add(g);
  }

  function buildAftermath() {
    const g = new THREE.Group();
    g.visible = false;
    const amb = new THREE.AmbientLight(0x3a2414, 0.42);
    g.add(amb);
    const hemi = new THREE.HemisphereLight(0xc08040, 0x100806, 0.38);
    g.add(hemi);
    const geo = new THREE.PlaneGeometry(14, 12, 8, 8);
    const ash = new THREE.Color(0x14100e);
    const ember = new THREE.Color(0x6a3018);
    tintPlane(geo, (c, x, y) => {
      c.copy(ash);
      if (Math.hypot(x, y + 2.4) < 2.2) c.lerp(ember, 0.45);
    });
    const floor = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 5, specular: new THREE.Color(0x2a1810),
    }));
    floor.rotation.x = -Math.PI / 2;
    g.add(floor);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0x1a1214 });
    function addWall(w, d, x, z, h) {
      const height = h || 5.6;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), wallMat);
      mesh.position.set(x, height / 2, z);
      g.add(mesh);
    }
    addWall(4.2, 0.4, -3.6, -3.85);
    addWall(4.2, 0.4, 3.6, -3.85);
    addWall(3.4, 0.4, -4.2, 5.15);
    addWall(3.4, 0.4, 4.2, 5.15);
    addWall(0.4, 9.2, -5.5, 0.6);
    addWall(0.4, 9.2, 5.5, 0.6);
    const ribMat = new THREE.MeshLambertMaterial({ color: 0x322420 });
    [-2.2, 0.4, 2.8].forEach((z, i) => {
      [-3.6, 3.6].forEach((x) => {
        const h = 2.8 + i * 0.45;
        const rib = new THREE.Mesh(new THREE.BoxGeometry(0.38, h, 0.38), ribMat);
        rib.position.set(x, h / 2, z);
        g.add(rib);
      });
    });
    const shafts = [];
    const shaftPlanes = [];
    [[-1.5, -1.6], [1.6, -2.4], [0.1, 1.2]].forEach((spot, i) => {
      const shaft = new THREE.Mesh(
        new THREE.PlaneGeometry(1.05, 6.2),
        new THREE.MeshBasicMaterial({
          color: 0xffe0a0,
          transparent: true,
          opacity: 0.2,
          depthWrite: false,
          fog: false,
          side: THREE.DoubleSide,
        })
      );
      shaft.position.set(spot[0], 3.1, spot[1]);
      g.add(shaft);
      shaftPlanes.push(shaft);
      const light = new THREE.PointLight(0xffe0a0, 1.1, 14);
      light.position.set(spot[0], 4.4, spot[1]);
      g.add(light);
      shafts.push(light);
    });
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 1),
      new THREE.MeshBasicMaterial({ color: 0xffc080, fog: false })
    );
    core.position.set(0, 2.05, -2.65);
    g.add(core);
    const twin = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.72, 1),
      new THREE.MeshBasicMaterial({ color: 0xc080ff, fog: false })
    );
    twin.position.set(1.15, 1.65, -2.35);
    twin.visible = false;
    g.add(twin);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.08, 8, 28),
      new THREE.MeshBasicMaterial({ color: 0xffe2b0, fog: false })
    );
    ring.position.set(0, 2.05, -2.65);
    g.add(ring);
    const rot = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 24),
      new THREE.MeshBasicMaterial({ color: 0x3a5a32, transparent: true, opacity: 0.4, fog: false })
    );
    rot.rotation.x = -Math.PI / 2;
    rot.position.set(0, 0.04, -1.5);
    g.add(rot);
    const plaques = {
      claim: makeCountPage('CLAIM', ['No number', 'Rot slows', 'Still hungry']),
      refuse: makeCountPage('REFUSAL', ['Licence Zero', 'Rot continues', 'Name kept']),
      share: makeCountPage('SHARED', ['Two sparks', 'No page', 'Both hungry']),
      burn: makeCountPage('THE BURN', ['Scar echo', 'They rewrite', 'Debt in the host']),
    };
    Object.keys(plaques).forEach((key) => {
      const page = plaques[key];
      page.position.set(0, 3.55, -1.45);
      page.scale.set(1.25, 1.25, 1);
      page.visible = key === 'claim';
      g.add(page);
    });
    const vesper = makeSilhouette(-3.1, -1.15);
    vesper.visible = true;
    vesper.position.y = 0.1;
    vesper.scale.setScalar(2.15);
    vesper.traverse((child) => {
      if (child.material && child.material.isMeshBasicMaterial) child.material.fog = false;
    });
    g.add(vesper);
    const clerk = makeCharacter(0x6a2420, 0.95);
    clerk.position.set(2.55, 0, 0.35);
    g.add(clerk);
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 1.55),
      new THREE.MeshBasicMaterial({ color: 0x3a2418, side: THREE.DoubleSide, fog: false })
    );
    banner.position.set(2.55, 1.85, 0.15);
    g.add(banner);
    const landed = makeCharacter(0x6a5348, 0.92);
    landed.position.set(1.4, 0, 2.15);
    landed.visible = false;
    g.add(landed);
    makeMotes(g, 72, 0xd0b8a4, { x: 10, y: 4.2, z: 10 }, { fall: true });
    function endImage(kind) {
      const image = new THREE.Group();
      if (kind === 'claim') {
        const frame = new THREE.Mesh(
          new THREE.TorusGeometry(0.58, 0.07, 6, 18),
          new THREE.MeshBasicMaterial({ color: 0xe8d2a0, fog: false })
        );
        frame.position.set(2.15, 1.2, 0.9);
        image.add(frame);
        const sprig = new THREE.Mesh(
          new THREE.ConeGeometry(0.14, 0.48, 5),
          new THREE.MeshBasicMaterial({ color: 0x6ed36a, fog: false })
        );
        sprig.position.set(0.4, 0.26, -1.05);
        image.add(sprig);
      } else if (kind === 'refuse') {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.11, 0.8, 6),
          new THREE.MeshLambertMaterial({ color: 0x3a3530 })
        );
        post.position.set(-1.75, 0.4, 1.05);
        image.add(post);
        const seal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.24, 0),
          new THREE.MeshBasicMaterial({ color: 0xe0cc8a, fog: false })
        );
        seal.position.set(-1.75, 0.95, 1.05);
        image.add(seal);
        const dead = new THREE.Mesh(
          new THREE.CircleGeometry(0.85, 12),
          new THREE.MeshBasicMaterial({ color: 0x3a2430, transparent: true, opacity: 0.92, fog: false })
        );
        dead.rotation.x = -Math.PI / 2;
        dead.position.set(0.15, 0.05, -0.35);
        image.add(dead);
      } else if (kind === 'share') {
        [-0.32, 0.32].forEach((x, i) => {
          const half = new THREE.Mesh(
            new THREE.PlaneGeometry(0.62, 0.9),
            new THREE.MeshBasicMaterial({
              color: i ? 0xc080ff : 0xffb060, side: THREE.DoubleSide, fog: false,
            })
          );
          half.position.set(x, 0.75, -0.2);
          half.rotation.y = i ? -0.45 : 0.45;
          image.add(half);
        });
      } else {
        const gash = new THREE.Mesh(
          new THREE.PlaneGeometry(0.18, 2.6),
          new THREE.MeshBasicMaterial({ color: 0xff2a10, fog: false })
        );
        gash.rotation.x = -Math.PI / 2;
        gash.position.set(0.2, 0.07, 0.55);
        image.add(gash);
        const heap = new THREE.Mesh(
          new THREE.SphereGeometry(0.62, 8, 6),
          new THREE.MeshBasicMaterial({ color: 0x140806, fog: false })
        );
        heap.scale.y = 0.32;
        heap.position.set(-0.85, 0.14, 0.2);
        image.add(heap);
      }
      image.visible = kind === 'claim';
      g.add(image);
      return image;
    }
    const images = {
      claim: endImage('claim'),
      refuse: endImage('refuse'),
      share: endImage('share'),
      burn: endImage('burn'),
    };
    g.userData.amb = amb;
    g.userData.hemi = hemi;
    g.userData.shafts = shafts;
    g.userData.shaftPlanes = shaftPlanes;
    g.userData.core = core;
    g.userData.twin = twin;
    g.userData.ring = ring;
    g.userData.rot = rot;
    g.userData.plaques = plaques;
    g.userData.vesper = vesper;
    g.userData.clerk = clerk;
    g.userData.banner = banner;
    g.userData.landed = landed;
    g.userData.images = images;
    aftermathGroup = g;
    scene.add(g);
  }

  function naveFits(x, z) {
    if (z > 4.15 || z < -3.15) return false;
    if (Math.abs(x) > 4.3) return false;
    return true;
  }

  function galleryFits(x, z) {
    if (z > 3.1 || z < -2.9) return false;
    if (Math.abs(x) > 3.2) return false;
    return true;
  }

  function cryptFits(x, z) {
    if (z > 2.7 || z < -2.15) return false;
    if (Math.abs(x) > 2.55) return false;
    return true;
  }

  function breachFits(x, z) {
    if (z > 5.4 || z < -6.15) return false;
    if (Math.abs(x) > 5.8) return false;
    return true;
  }

  function claimFits(x, z) {
    if (z > 7.55 || z < -8.15) return false;
    if (Math.abs(x) > 7.5) return false;
    return true;
  }

  function aftermathFits(x, z) {
    if (z > 5.05 || z < -3.55) return false;
    if (Math.abs(x) > 5.2) return false;
    return true;
  }

  function cellarFits(x, z) {
    if (z > 3.45 || z < -23.4) return false;
    if (z >= -4.7 && Math.abs(x) <= 3.45) return true;
    if (z <= -3.9 && z >= -11.0 && Math.abs(x) <= 1.25) return true;
    if (z <= -10.0 && z >= -17.0 && Math.abs(x) <= 2.85) return true;
    if (z <= -16.4 && Math.abs(x) <= 3.15) return true;
    return false;
  }

  function variedFloor(w, h, sx, sy, baseHex, altHex, amp, phong) {
    const geo = new THREE.PlaneGeometry(w, h, sx, sy);
    raisePlane(geo, (x, y) => Math.sin(x * 1.25 + y * 0.35) * Math.cos(y * 1.05) * (amp || 0.045));
    const base = new THREE.Color(baseHex);
    const alt = new THREE.Color(altHex);
    tintPlane(geo, (c, x, y) => {
      const n = Math.sin(x * 1.55) * Math.cos(y * 1.2);
      c.copy(base);
      if (n > 0.12) c.lerp(alt, 0.55);
      else if (n < -0.4) c.lerp(alt, 0.28);
    });
    const mesh = new THREE.Mesh(geo, phong
      ? new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 10, specular: new THREE.Color(0x3a3024) })
      : new THREE.MeshLambertMaterial({ vertexColors: true }));
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  function buildRoom(opts) {
    const g = new THREE.Group();
    const floor = variedFloor(9, 9, 8, 8, opts.floor, opts.floorAlt || opts.wall, 0.05, !!opts.phong);
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

  function nearestLetter() {
    if (!playerMesh || locale !== 'leaf-village') return null;
    if (Math.hypot(-1.35 - playerMesh.position.x, 1.15 - playerMesh.position.z) > 1.05) return null;
    if (seenBeats['furrow-letter']) {
      return {
        title: 'Cousin’s letter',
        hint: 'It is already in the pack. Vesper walked them to the well. Press E to hear it again. The road did not change.',
      };
    }
    return {
      title: 'A folded letter',
      hint: 'It sits in the basket by the grey furrow. Press E. It is not the door.',
    };
  }

  function nearestMargin() {
    if (!playerMesh || locale !== 'watch-gallery') return null;
    if (Math.hypot(2.15 - playerMesh.position.x, 1.35 - playerMesh.position.z) > 0.95) return null;
    if (seenBeats['gallery-margin']) {
      return {
        title: 'Filed copy',
        hint: 'It was already read. The stair did not change. Press E to hear it again.',
      };
    }
    return {
      title: 'A filed copy',
      hint: 'East wall. Not the count and not the stair. Press E.',
    };
  }

  function nearestChalk() {
    if (!playerMesh || locale !== 'ash-nave') return null;
    if (Math.hypot(-2.85 - playerMesh.position.x, 1.55 - playerMesh.position.z) > 0.95) return null;
    if (seenBeats['nave-pressure']) {
      return {
        title: 'West chalk',
        hint: 'It was already read. The bar did not open. Press E to hear it again.',
      };
    }
    return {
      title: 'West chalk',
      hint: 'A line on the wall. Not the door and not the gallery. Press E.',
    };
  }

  function nearestCamp() {
    if (!playerMesh || locale !== 'concord-yard' || skyPass) return null;
    if (Math.hypot(-4.15 - playerMesh.position.x, 2.55 - playerMesh.position.z) > 1.0) return null;
    if (seenBeats['yard-camp']) {
      return {
        title: 'A rest',
        hint: 'They already sat. The slag is still the road. Press E to hear it again.',
      };
    }
    return {
      title: 'A rest',
      hint: 'Stones and a bedroll, west of the south gate. Press E. It is not the slag and not the mark.',
    };
  }

  function nearestChest() {
    if (!playerMesh || locale !== 'field' || regionId !== 'verdant-isle' || skyPass) return null;
    if (Math.hypot(-2.2 - playerMesh.position.x, 3.6 - playerMesh.position.z) > 1.15) return null;
    if (seenBeats['wayside-chest']) {
      return {
        title: 'Wayside chest',
        hint: 'It is empty. One tonic already left it. Press E. The kiln is still the road.',
      };
    }
    return {
      title: 'Wayside chest',
      hint: 'Off the path. No seal. Press E. It is not a pool and not a door.',
    };
  }

  function nearestNotice() {
    if (!playerMesh || locale !== 'field' || regionId !== 'stormreach' || skyPass) return null;
    if (Math.hypot(-3.15 - playerMesh.position.x, 4.55 - playerMesh.position.z) > 1.15) return null;
    if (seenBeats['coast-notice']) {
      return {
        title: 'Posted notice',
        hint: 'It was already read. The vault door did not change. Press E to hear it again.',
      };
    }
    return {
      title: 'Posted notice',
      hint: 'A board on the shale. Not the porter and not the door. Press E.',
    };
  }

  function nearestCord() {
    if (!playerMesh || locale !== 'field' || regionId !== 'verdant-isle' || skyPass) return null;
    if (Math.hypot(3.2 - playerMesh.position.x, -8 - playerMesh.position.z) > 1.05) return null;
    if (seenBeats['salt-cord']) {
      return {
        title: 'Salt cord',
        hint: 'The coil is gone. The cord is in the pack. Press E to hear it again. The road did not change.',
      };
    }
    return {
      title: 'A waxed cord',
      hint: 'In the grass, north of the ember. Press E. It is not a pool and not a licence.',
    };
  }

  function nearestPorter() {
    if (!playerMesh || locale !== 'field' || regionId !== 'stormreach' || skyPass) return null;
    if (Math.hypot(2.45 - playerMesh.position.x, 2.55 - playerMesh.position.z) > 1.45) return null;
    if (seenBeats['vault-porter']) {
      return {
        title: 'A porter',
        hint: 'He is still wet. The book is still dry. The vault door is the other way.',
      };
    }
    return {
      title: 'A porter',
      hint: 'He is dripping on dry shale. Press E. He is not the door.',
    };
  }

  function nearestVaultDoor() {
    if (!playerMesh || locale !== 'field' || regionId !== 'stormreach' || !seenBeats['vault-face']) return null;
    if (skyPass) return null;
    if (Math.hypot(0.2 - playerMesh.position.x, 1.15 - playerMesh.position.z) > 1.7) return null;
    return {
      id: 'harbor-vault',
      title: 'Harbor vault',
      hint: seenBeats['vault-ledger']
        ? 'The count is behind you. The bottle-hall is through the north iron. Press E.'
        : 'The counting room is uncorked. The bottles stay behind iron. Press E.',
    };
  }

  function nearestDoor() {
    if (!playerMesh || locale !== 'field') return null;
    if (regionId === 'stormreach') return nearestVaultDoor();
    if (regionId !== 'verdant-isle') return null;
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
      hint: seenBeats['bottle-hall']
        ? 'Press E to take the thermal back to the isle. The hall stays behind you. The inland road does not.'
        : 'Press E to take the thermal back to the isle. The bottle-hall stays corked.',
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
      hint: 'The thermal will put your feet on the shale. Press E to land. The counting room is a door. The bottles are not.',
    };
  }

  function enterInterior(id, opts) {
    const silent = opts && opts.silent;
    locale = id;
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    interiorGroup.add(playerMesh);
    const resumeX = silent && opts.pos && opts.pos.x != null ? opts.pos.x : 0;
    const resumeZ = silent && opts.pos && opts.pos.z != null ? opts.pos.z : 3.05;
    playerMesh.position.set(resumeX, 0, resumeZ);
    overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    interiorGroup.visible = true;
    villageRoom.visible = id === 'leaf-village';
    cellarRoom.visible = id === 'root-cellar';
    if (vaultRoom) vaultRoom.visible = id === 'harbor-vault';
    if (pipeRoom) pipeRoom.visible = id === 'marrow-pipe';
    if (throatRoom) throatRoom.visible = id === 'engine-throat';
    beatHold = {};
    const locLabel = $('#hud-location');
    if (id === 'engine-throat') {
      placeFog('throat');
      if (locLabel) locLabel.textContent = 'Sealed throat';
      if (!silent) playerMesh.position.set(0, 0, 2.15);
    } else if (id === 'marrow-pipe') {
      placeFog('pipe');
      if (locLabel) locLabel.textContent = 'Engine pipe';
      if (!silent) playerMesh.position.set(0, 0, 2.2);
    } else if (id === 'harbor-vault') {
      placeFog('vault');
      if (locLabel) locLabel.textContent = 'Harbor Vault';
      if (!silent && !seenBeats['vault-ledger']) {
        const fn = EW.scenes['vault-ledger'];
        if (typeof fn === 'function') {
          const played = fn();
          if (played !== false && dialogueOpen) pendingBeat = 'vault-ledger';
        }
      }
    } else {
      placeFog(id === 'root-cellar' ? 'cellar' : 'village');
      if (locLabel && id === 'leaf-village') locLabel.textContent = 'Leaf-village';
      else if (locLabel && id === 'root-cellar') locLabel.textContent = 'Root-cellar';
      const beatKey = id === 'leaf-village' ? 'village' : 'cellar';
      const sceneId = id === 'leaf-village' ? 'village-argument' : 'cellar-threshold';
      if (!seenBeats[beatKey]) {
        const fn = EW.scenes[sceneId];
        if (typeof fn === 'function') fn();
      }
    }
    refreshRumor();
    saveGame();
  }

  function exitInterior() {
    const fromVault = locale === 'harbor-vault';
    const pinId = locale === 'root-cellar' ? 'root-cellar' : 'leaf-village';
    const pin = landmark(pinId);
    locale = 'field';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    if (fromVault) {
      locale = 'field';
      regionId = 'stormreach';
      stormreachGroup.add(playerMesh);
      playerMesh.position.set(0.2, 0, 1.7);
      interiorGroup.visible = false;
      if (vaultRoom) vaultRoom.visible = false;
      overworldGroup.visible = false;
      stormreachGroup.visible = true;
      placeFog('stormreach');
      const coastLabel = $('#hud-location');
      if (coastLabel) coastLabel.textContent = 'Stormreach Coast';
      saveGame();
      return;
    }
    overworldGroup.add(playerMesh);
    playerMesh.position.set(pin.x, 0, pin.z + 2.4);
    interiorGroup.visible = false;
    overworldGroup.visible = true;
    if (stormreachGroup) stormreachGroup.visible = false;
    regionId = 'verdant-isle';
    placeFog('verdant');
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

    g.add(makeSky(0x5e7c90, 0xe4d2b8));
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshPhongMaterial({ color: 0x14344e, shininess: 64, specular: new THREE.Color(0xd0e8ff) })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.35;
    g.add(water);
    const shallows = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 7),
      new THREE.MeshLambertMaterial({ color: 0x2c6278, transparent: true, opacity: 0.88 })
    );
    shallows.rotation.x = -Math.PI / 2;
    shallows.position.set(0, -0.28, 12.2);
    g.add(shallows);

    const shelfGeo = new THREE.PlaneGeometry(24, 16, 18, 12);
    raisePlane(shelfGeo, (x, y) => (
      Math.sin(x * 0.42) * Math.cos(y * 0.36) * 0.32
      + Math.sin(x * 1.25 + y * 0.5) * 0.08
    ));
    const stone = new THREE.Color(0x6a6258);
    const wetStone = new THREE.Color(0x314048);
    const pale = new THREE.Color(0x8d8578);
    tintPlane(shelfGeo, (c, x, y, h) => {
      c.copy(stone);
      if (y < -2) c.lerp(wetStone, 0.55);
      if (h > 0.1) c.lerp(pale, 0.35);
      const grit = groundGrain(x, y);
      if (grit > 0.42) c.lerp(wetStone, 0.35);
      else if (grit < -0.5) c.lerp(pale, 0.2);
    });
    const shelf = new THREE.Mesh(shelfGeo, new THREE.MeshPhongMaterial({
      vertexColors: true, shininess: 10, specular: new THREE.Color(0x3a4038),
    }));
    shelf.rotation.x = -Math.PI / 2;
    shelf.position.set(0, 0, 6);
    g.add(shelf);
    layCloth(g, -3.2, 6.5, 1.5, 0x243038, 0.62);
    layCloth(g, 2.6, 4.4, 1.15, 0x1c2c34, 0.55);
    layCloth(g, 6.2, 8.6, 1.7, 0x2a3c46, 0.5);
    [[-8.2, 8.1], [7.6, 6.4], [-6.4, 3.2], [8.4, 3.6]].forEach((spot) => {
      g.add(makeRock(spot[0], spot[1]));
    });

    const beachGeo = new THREE.PlaneGeometry(22, 5, 12, 4);
    raisePlane(beachGeo, (x, y) => Math.sin(x * 0.8) * 0.04 + Math.cos(y * 1.4) * 0.03);
    const sand = new THREE.Color(0xc2b48c);
    const damp = new THREE.Color(0x8a7a58);
    tintPlane(beachGeo, (c, x, y) => {
      c.copy(sand);
      if (y > 1.2) c.lerp(damp, 0.4);
    });
    const beach = new THREE.Mesh(beachGeo, new THREE.MeshLambertMaterial({ vertexColors: true }));
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(0, 0.02, 9.2);
    g.add(beach);

    const cliff = new THREE.Mesh(
      new THREE.BoxGeometry(26, 8, 8),
      new THREE.MeshLambertMaterial({ color: 0x5a5148 })
    );
    cliff.position.set(0, 3.2, -4.2);
    g.add(cliff);
    [[-8.4, 6.4, -5.1], [0.2, 7.6, -6.2], [7.2, 5.8, -4.6]].forEach((spot, i) => {
      const tooth = new THREE.Mesh(
        new THREE.ConeGeometry(0.7 + i * 0.15, 2.4 + i * 0.4, 5),
        new THREE.MeshLambertMaterial({ color: 0x3a342e })
      );
      tooth.position.set(spot[0], spot[1], spot[2]);
      g.add(tooth);
    });
    const cliffFace = new THREE.Mesh(
      new THREE.BoxGeometry(14, 5.2, 1.4),
      new THREE.MeshLambertMaterial({ color: 0x3e3832 })
    );
    cliffFace.position.set(1.2, 2.6, -2.4);
    g.add(cliffFace);

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
    const porter = makeCharacter(0x4a4038, 0.92);
    porter.position.set(2.45, 0, 2.55);
    porter.rotation.y = -0.6;
    g.add(porter);
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(0.48, 10),
      new THREE.MeshBasicMaterial({ color: 0x2a4458, transparent: true, opacity: 0.78 })
    );
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(2.45, 0.04, 2.55);
    g.add(puddle);
    const drip = makeCountPage('SHORT', ['Fourth storm', 'Sold as weather', 'He stays wet']);
    drip.position.set(3.55, 1.42, 2.2);
    drip.rotation.x = -0.36;
    g.add(drip);
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
    g.add(makeSky(0x5e7c90, 0xe8dcc4));
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
    g.add(makeCoastNotice(-3.15, 4.55));
    scene.add(g);
    coastGroup = g;
  }

  function makeSilhouette(x, z) {
    const g = new THREE.Group();
    const fig = makeCharacter(0x100c10, 1.42);
    fig.traverse((c) => {
      if (!c.isMesh || !c.material) return;
      if (c.userData && c.userData.rim) {
        c.material = c.material.clone();
        c.material.color.setHex(0x4a2018);
        c.material.opacity = 0.5;
        return;
      }
      c.material = c.material.clone();
      c.material.transparent = true;
      c.material.opacity = 0.94;
      if (c.material.emissive) c.material.emissive.setHex(0x14080c);
    });
    const hood = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 0.5, 6),
      new THREE.MeshLambertMaterial({ color: 0x0c080c })
    );
    hood.position.y = 1.62;
    fig.add(hood);
    g.add(fig);
    const veil = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.95),
      new THREE.MeshBasicMaterial({
        color: 0x140c10, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false, fog: false,
      })
    );
    veil.position.set(0, 0.85, 0.22);
    g.add(veil);
    const ribbon = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 1.05),
      new THREE.MeshBasicMaterial({
        color: 0xc45a28, transparent: true, opacity: 0.82, side: THREE.DoubleSide, fog: false,
      })
    );
    ribbon.position.set(0.32, 0.72, 0.08);
    g.add(ribbon);
    g.userData.ribbon = ribbon;
    g.userData.homeY = 0;
    g.visible = false;
    g.position.set(x, 0, z);
    hoods.push(g);
    return g;
  }

  function makePool(def) {
    const g = new THREE.Group();
    g.position.set(def.x, 0, def.z);
    const elColor = new THREE.Color(ELEMENT_COLOR[def.element]);
    const rotColor = new THREE.Color(def.vesper ? 0x2a1022 : 0x3a2432);
    const healColor = new THREE.Color(0x2f7a3e);

    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(3.25, 2.45, 0.42, 14),
      new THREE.MeshLambertMaterial({ color: 0x161014 })
    );
    bowl.position.y = -0.08;
    g.add(bowl);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(3.5, 0.2, 6, 18),
      new THREE.MeshLambertMaterial({ color: def.vesper ? 0x4a3040 : 0x6e675c })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.16;
    g.add(rim);
    const rotMat = new THREE.MeshLambertMaterial({ color: rotColor.clone(), transparent: true, opacity: 0.94 });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(3.35, 22), rotMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.08;
    g.add(disc);
    const neckMat = new THREE.MeshLambertMaterial({
      color: elColor.clone(),
      transparent: true,
      opacity: 0.26,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.78, 1.15, 8, 1, true), neckMat);
    neck.position.y = 0.85;
    g.add(neck);

    const lifeMat = new THREE.MeshBasicMaterial({
      color: 0x6ed36a, transparent: true, opacity: 0, depthWrite: false,
    });
    const life = new THREE.Mesh(new THREE.CircleGeometry(3.2, 22), lifeMat);
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
      rotMat, rotColor, healColor, elColor, lifeMat, coreMat, core, beamMat, neck,
      spikes, flowers, motes, figure, seal, sealRing, rim, phase: Math.random() * 6,
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
    pool.burst = 0;
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
    const t = motionWanted ? performance.now() * 0.001 : 0;
    pools.forEach((pool) => {
      if (pool.healing && pool.heal < 1) pool.heal = Math.min(1, pool.heal + dt * 0.5);
      if (pool.burst > 0) pool.burst = Math.max(0, pool.burst - dt * 0.85);
      const h = pool.absorbed ? pool.heal : 0;
      const burst = pool.burst || 0;
      pool.rotMat.color.copy(pool.rotColor).lerp(pool.healColor, h);
      pool.lifeMat.opacity = h * 0.9;
      pool.coreMat.emissive.copy(pool.elColor).multiplyScalar(0.25 + h * 0.95);
      pool.core.position.y = 1.2 + Math.sin(t * 2 + pool.phase) * 0.12;
      pool.core.rotation.y += dt * 0.7;
      pool.core.scale.setScalar((1 + Math.sin(t * 3 + pool.phase) * 0.08) * (1 + burst * 0.9));
      if (pool.rim) pool.rim.scale.setScalar((1 + Math.sin(t * 1.4 + pool.phase) * 0.035) * (1 + burst * 0.42));
      const pulse = 0.16 + Math.sin(t * 2.1 + pool.phase) * 0.06;
      pool.beamMat.opacity = pulse * (1 - h) + 0.07 * h + burst * 0.72;
      if (pool.neck) pool.neck.material.opacity = (0.22 + Math.sin(t * 2.4 + pool.phase) * 0.08) * (1 - h * 0.85);
      pool.spikes.forEach((s) => {
        s.scale.y = Math.max(0.001, 1 - h);
        s.visible = h < 0.97;
      });
      pool.flowers.forEach((f) => { f.scale.y = Math.max(0.001, h); });
      pool.motes.forEach((m, i) => {
        const a = t * (0.7 + h) + i * 1.25 + pool.phase;
        const rad = 1.05 + (i % 3) * 0.5 + burst * (1.6 + (i % 3) * 0.45);
        m.position.set(Math.cos(a) * rad, 0.7 + Math.sin(a * 1.6) * 0.45 + h * 0.3 + burst * 0.85, Math.sin(a) * rad);
        m.scale.setScalar((0.65 + Math.sin(a * 2.4) * 0.35) * (1 + burst * 2.4));
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

  function ringHills(parent, radius, count, color) {
    const mat = new THREE.MeshLambertMaterial({ color });
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.15;
      const hill = new THREE.Mesh(new THREE.SphereGeometry(2.2 + (i % 4) * 0.85, 7, 5), mat);
      hill.scale.set(1.55, 0.42 + (i % 3) * 0.1, 1.1);
      hill.position.set(Math.cos(a) * radius, -0.85, Math.sin(a) * radius);
      parent.add(hill);
    }
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
    const clothMat = new THREE.MeshPhongMaterial({
      color,
      emissive: new THREE.Color(0x1a100c),
      shininess: 12,
      specular: new THREE.Color(0x3a2a22),
    });
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26 * scale, 0.32 * scale, 0.62 * scale, 7),
      clothMat
    );
    torso.position.y = 0.58 * scale;
    g.add(torso);
    const shoulder = new THREE.Mesh(
      new THREE.BoxGeometry(0.7 * scale, 0.12 * scale, 0.32 * scale),
      clothMat
    );
    shoulder.position.y = 0.86 * scale;
    g.add(shoulder);
    const cloak = new THREE.Mesh(
      new THREE.BoxGeometry(0.46 * scale, 0.55 * scale, 0.08 * scale),
      clothMat
    );
    cloak.position.set(0, 0.62 * scale, -0.18 * scale);
    g.add(cloak);
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(0.5 * scale, 0.08 * scale, 0.34 * scale),
      new THREE.MeshLambertMaterial({ color: 0x2a2218 })
    );
    belt.position.y = 0.42 * scale;
    g.add(belt);
    const skin = new THREE.MeshPhongMaterial({
      color: 0xffdbac,
      emissive: new THREE.Color(0x1a0c08),
      shininess: 16,
      specular: new THREE.Color(0x4a3028),
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 8, 7), skin);
    head.position.y = 1.08 * scale;
    g.add(head);
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.22 * scale, 6, 5),
      new THREE.MeshLambertMaterial({ color: 0x241810 })
    );
    hair.scale.y = 0.5;
    hair.position.y = 1.2 * scale;
    g.add(hair);
    const rimColor = new THREE.Color(color).lerp(new THREE.Color(0xffe6c8), 0.62);
    const rim = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62 * scale, 1.25 * scale),
      new THREE.MeshBasicMaterial({
        color: rimColor, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide, fog: false,
      })
    );
    rim.position.set(0, 0.72 * scale, -0.26 * scale);
    rim.userData.rim = true;
    g.add(rim);
    [-0.07, 0.07].forEach((x) => {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.032 * scale, 5, 4),
        new THREE.MeshBasicMaterial({ color: 0x140c0a, fog: false })
      );
      eye.position.set(x * scale, 1.1 * scale, 0.17 * scale);
      g.add(eye);
    });
    const sashColor = new THREE.Color(color).offsetHSL(0, 0.05, 0.18);
    const sash = new THREE.Mesh(
      new THREE.BoxGeometry(0.5 * scale, 0.1 * scale, 0.12 * scale),
      new THREE.MeshBasicMaterial({ color: sashColor, fog: false })
    );
    sash.position.set(0, 0.74 * scale, 0.2 * scale);
    g.add(sash);
    const ember = new THREE.Mesh(
      new THREE.SphereGeometry(0.075 * scale, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xff8a3a, fog: false })
    );
    ember.position.set(0.1 * scale, 0.78 * scale, 0.22 * scale);
    ember.visible = false;
    g.add(ember);
    g.userData.ember = ember;
    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(0.06 * scale, 0.06 * scale, 0.08 * scale),
      new THREE.MeshLambertMaterial({ color: 0xe0a080 })
    );
    nose.position.set(0, 1.06 * scale, 0.18 * scale);
    g.add(nose);
    const legs = [];
    [-0.11, 0.11].forEach((x) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07 * scale, 0.08 * scale, 0.36 * scale, 5),
        new THREE.MeshLambertMaterial({ color: 0x2a241c })
      );
      leg.position.set(x * scale, 0.18 * scale, 0);
      g.add(leg);
      legs.push(leg);
    });
    g.userData.legs = legs;
    g.userData.cloth = clothMat;
    return g;
  }

  function makeMotes(parent, count, color, box, opts) {
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      base[i * 3] = (Math.random() - 0.5) * box.x;
      base[i * 3 + 1] = 0.25 + Math.random() * box.y;
      base[i * 3 + 2] = (Math.random() - 0.5) * box.z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      color,
      size: 0.055,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      sizeAttenuation: true,
    }));
    pts.userData.base = base;
    pts.userData.fall = !!(opts && opts.fall);
    if (pts.userData.fall) {
      pts.material.size = 0.11;
      pts.material.opacity = 0.62;
    }
    parent.add(pts);
    motes.push(pts);
    return pts;
  }

  function makeWaysideChest(x, z) {
    const g = new THREE.Group();
    const wood = new THREE.MeshLambertMaterial({ color: 0x6a4a32 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.38, 0.46), wood);
    box.position.y = 0.22;
    g.add(box);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.1, 0.52), new THREE.MeshLambertMaterial({ color: 0x8a6240 }));
    lid.position.y = 0.44;
    g.add(lid);
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.06, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xc4a060, fog: false })
    );
    band.position.set(0, 0.28, 0.24);
    g.add(band);
    g.position.set(x, 0, z);
    return g;
  }

  function makeSaltCord(x, z) {
    const g = new THREE.Group();
    const coil = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.06, 6, 12),
      new THREE.MeshLambertMaterial({ color: 0xd8d0c4 })
    );
    coil.rotation.x = Math.PI / 2;
    coil.position.y = 0.08;
    g.add(coil);
    const wax = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xe0c878, fog: false })
    );
    wax.position.set(0.12, 0.1, 0.08);
    g.add(wax);
    g.position.set(x, 0, z);
    return g;
  }

  function makeCoastNotice(x, z) {
    const g = new THREE.Group();
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 1.15, 5),
      new THREE.MeshLambertMaterial({ color: 0x4a4038 })
    );
    post.position.y = 0.55;
    g.add(post);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.48),
      new THREE.MeshBasicMaterial({ color: 0xf0e2c4, fog: false, side: THREE.DoubleSide })
    );
    board.position.set(0, 1.05, 0);
    g.add(board);
    const nail = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 5, 4),
      new THREE.MeshBasicMaterial({ color: 0x2a2418, fog: false })
    );
    nail.position.set(0, 1.22, 0.02);
    g.add(nail);
    g.position.set(x, 0, z);
    return g;
  }

  function bobHoods() {
    if (!motionWanted || !hoods.length) return;
    const t = performance.now() * 0.001;
    hoods.forEach((g, i) => {
      if (!g.visible) return;
      g.position.y = Math.sin(t * 1.25 + i * 0.7) * 0.055;
      if (g.userData.ribbon) g.userData.ribbon.rotation.z = Math.sin(t * 1.5 + i) * 0.28;
    });
  }

  function driftMotes() {
    if (!motes.length || !motionWanted) return;
    if (phoneMode && ((Math.floor(performance.now() / 40) % 2) === 0)) return;
    const t = performance.now() * 0.001;
    motes.forEach((pts) => {
      let node = pts;
      while (node) {
        if (node.visible === false) return;
        node = node.parent;
      }
      const arr = pts.geometry.attributes.position.array;
      const base = pts.userData.base;
      for (let i = 0; i < base.length; i += 3) {
        arr[i] = base[i] + Math.sin(t * 0.6 + i) * 0.06;
        if (pts.userData.fall) {
          const span = 3.4;
          const speed = 0.32 + (i % 5) * 0.05;
          arr[i] = base[i] + Math.sin(t * 0.28 + i * 0.17) * 0.24;
          arr[i + 1] = span - ((base[i + 1] + t * speed) % span);
          arr[i + 2] = base[i + 2] + Math.cos(t * 0.22 + i * 0.13) * 0.18;
          pts.material.opacity = 0.42 + Math.sin(t * 1.15) * 0.16;
          pts.material.size = 0.1 + Math.sin(t * 0.65) * 0.02;
        } else {
          arr[i + 1] = 0.2 + ((base[i + 1] + t * 0.18) % 1.5);
          arr[i + 2] = base[i + 2] + Math.cos(t * 0.4 + i) * 0.05;
        }
      }
      pts.geometry.attributes.position.needsUpdate = true;
    });
  }

  function poseHost(mode) {
    if (!playerMesh) return;
    if (!motionWanted && mode === 'idle') mode = 'still';
    const legs = playerMesh.userData.legs;
    const t = performance.now();
    if (mode === 'walk') {
      const step = Math.sin(t * 0.012);
      playerMesh.position.y = Math.abs(step) * 0.08;
      playerMesh.rotation.x = 0;
      if (legs) {
        legs[0].rotation.x = step * 0.4;
        legs[1].rotation.x = -step * 0.4;
      }
    } else if (mode === 'idle') {
      const breath = Math.sin(t * 0.0024);
      playerMesh.position.y = (breath + 1) * 0.012;
      playerMesh.rotation.x = breath * 0.04;
      if (legs) {
        legs[0].rotation.x = breath * 0.06;
        legs[1].rotation.x = breath * 0.04;
      }
    } else {
      playerMesh.position.y = 0;
      playerMesh.rotation.x = 0;
      if (legs) {
        legs[0].rotation.x = 0;
        legs[1].rotation.x = 0;
      }
    }
  }

  function tintHost() {
    const mat = playerMesh && playerMesh.userData.cloth;
    if (!mat || !spark) return;
    if (spark.strain >= 80) mat.emissive.setHex(0x6a2010);
    else if (spark.strain >= 45) mat.emissive.setHex(0x3a140c);
    else mat.emissive.setHex(0x000000);
    pulseHost();
  }

  function pulseHost() {
    const meshes = [];
    if (playerMesh) meshes.push(playerMesh);
    combatPartyMeshes.forEach((mesh) => meshes.push(mesh));
    const scale = 0.82 + Math.sin(performance.now() * 0.006) * 0.22;
    meshes.forEach((mesh) => {
      const ember = mesh && mesh.userData.ember;
      if (ember && ember.visible) ember.scale.setScalar(scale);
    });
  }

  function buildCombatArena() {
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(10, 28),
      new THREE.MeshPhongMaterial({ color: 0x242c28, shininess: 10, specular: new THREE.Color(0x304038) })
    );
    floor.rotation.x = -Math.PI / 2;
    combatGroup.add(floor);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(6.4, 6.75, 36),
      new THREE.MeshBasicMaterial({ color: 0xc4a06a, side: THREE.DoubleSide, fog: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    combatGroup.add(ring);
    for (let i = 0; i < 5; i++) {
      const hill = new THREE.Mesh(
        new THREE.SphereGeometry(2.6 + (i % 3) * 0.4, 8, 6),
        new THREE.MeshLambertMaterial({ color: 0x1a2428 })
      );
      hill.position.set(-8 + i * 4, -0.8, -7.5);
      hill.scale.y = 0.45;
      combatGroup.add(hill);
    }
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 18),
      new THREE.MeshBasicMaterial({ color: 0x1c2832 })
    );
    back.position.set(0, 7, -11);
    combatGroup.add(back);
    combatGroup.add(new THREE.AmbientLight(0xc8c0b8, 0.28));
    const light = new THREE.DirectionalLight(0xfff0dd, 0.55);
    light.position.set(4, 14, 8);
    combatGroup.add(light);
    const warm = new THREE.PointLight(0xffb070, 1.25, 16);
    warm.position.set(4.4, 3.1, 0.4);
    combatGroup.add(warm);
    const cold = new THREE.PointLight(0x7aa0d8, 1.05, 16);
    cold.position.set(-3.4, 3.2, -1.4);
    combatGroup.add(cold);
  }

  function makeEnemyMesh(enemy) {
    if (enemy.shape === 'human') return makeCharacter(enemy.color, 0.9);
    if (enemy.shape === 'rite') {
      const figure = makeCharacter(enemy.color, 1.12);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.08, 6, 16),
        new THREE.MeshBasicMaterial({ color: 0xffb060, fog: false })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 1.15;
      figure.add(ring);
      return figure;
    }
    if (enemy.shape === 'banner') {
      const figure = makeCharacter(enemy.color, 1.05);
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85, 1.15),
        new THREE.MeshBasicMaterial({ color: 0x8a3028, side: THREE.DoubleSide, fog: false })
      );
      cloth.position.set(0.15, 1.15, 0.28);
      figure.add(cloth);
      return figure;
    }
    if (enemy.shape === 'ledger') {
      const figure = makeCharacter(enemy.color, 0.92);
      const board = new THREE.Mesh(
        new THREE.PlaneGeometry(0.78, 0.95),
        new THREE.MeshBasicMaterial({ color: 0xf0e2c4, fog: false })
      );
      board.position.set(0, 0.95, 0.32);
      figure.add(board);
      return figure;
    }
    if (enemy.shape === 'cowl') {
      const figure = makeCharacter(enemy.color, 1.02);
      const hood = new THREE.Mesh(
        new THREE.ConeGeometry(0.34, 0.42, 6),
        new THREE.MeshLambertMaterial({ color: 0x140c10 })
      );
      hood.position.y = 1.32;
      figure.add(hood);
      const ash = new THREE.Mesh(
        new THREE.PlaneGeometry(0.08, 0.7),
        new THREE.MeshBasicMaterial({ color: 0xc45a28, fog: false, side: THREE.DoubleSide })
      );
      ash.position.set(0.28, 0.7, 0.12);
      figure.add(ash);
      return figure;
    }
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
  function showToast(msg, ms) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.add('hidden'), ms || 4600);
  }

  function showLog(msg) {
    combatLog.textContent = msg;
    combatLog.classList.add('show');
    clearTimeout(showLog._t);
    showLog._t = setTimeout(() => combatLog.classList.remove('show'), 1400);
    combatUI.classList.remove('hit');
    void combatUI.offsetWidth;
    combatUI.classList.add('hit');
  }

  function punchNumber(n, kind) {
    const el = $('#hit-float');
    if (!el || !n) return;
    el.textContent = (kind === 'heal' ? '+' : '−') + n;
    el.classList.remove('show', 'harm', 'heal');
    void el.offsetWidth;
    el.classList.add('show', kind === 'heal' ? 'heal' : 'harm');
    if (kind !== 'heal') combatKick = 0.46;
  }

  function questLine() {
    if (!spark || !spark.path) return 'Choose how she fights.';
    const slag = pools.find((p) => p.id === 'yard-slag');
    const weep = pools.find((p) => p.id === 'mark-weep');
    if (locale === 'aftermath') {
      if (!seenBeats.aftermath) return 'Hear the ending. Then the room stays.';
      if (seenBeats.rematchTease) return 'The rite remembers. Wake starts a new host and throws this save out. The scar stays here. South is the claim.';
      if (claimWord === 'burn') return 'The ending is written. The scar is the echo. Scar debt ' + scarDebt + '. Credits are north. South is the claim.';
      if (claimWord === 'refuse') return 'The ending is written. Licence Zero kept its number. Credits are north. South is the claim.';
      if (claimWord === 'share') return 'The ending is written. Two hungers remain. Credits are north. South is the claim.';
      return 'The ending is written. Lira still wears it. Credits are north. South is the claim.';
    }
    if (locale === 'remnant-claim') {
      if (!seenBeats.claimFight) return 'Past the bar. A Concord last rite stands before the claim.';
      if (!claimWord) return 'Vesper is at the remnant. Claim, refuse, share, or burn. North writes it after.';
      if (!seenBeats.aftermath) {
        if (claimWord === 'claim') return 'The spark claimed the remnant. North is the aftermath.';
        if (claimWord === 'refuse') return 'The remnant was refused. North is the aftermath.';
        if (claimWord === 'share') return 'The claim is shared. North is the aftermath.';
        return 'The claim was burned. North is the aftermath.';
      }
      if (claimWord === 'claim') return 'The ending is written. Lira still wears it. South is the breach.';
      if (claimWord === 'refuse') return 'The ending is written. The licence kept its number. South is the breach.';
      if (claimWord === 'share') return 'The ending is written. Two hungers remain. South is the breach.';
      return 'The ending is written. The scar is the echo. South is the breach.';
    }
    if (locale === 'first-breach') {
      if (!seenBeats.breachFight) return 'Licence Zero opened a breach. A Concord last stand holds the threshold.';
      if (!breachWord) return 'Vesper is in the light. Hold the threshold, take the scar, or step back. The bar stays shut.';
      if (breachWord === 'mouth') return 'The scar is not Held Threshold. The bar stays shut. South is the crypt.';
      if (breachWord === 'hold' && !claimWord) return 'Held Threshold. North, past the bar, is the remnant claim.';
      if (breachWord === 'hold' && seenBeats.aftermath) return 'The ending is written. South is the crypt.';
      if (breachWord === 'hold') return 'The claim was set. North of the mass is the aftermath. South is the crypt.';
      return 'You stepped back. Holding the threshold opens the bar. South is the crypt.';
    }
    if (locale === 'count-crypt') {
      if (!seenBeats.cryptFight) return 'An auditor keeps the ledger under Licence Zero.';
      if (!cryptWord) return 'The crack is north. Spend a digit, take the scar, or leave it. The bar stays shut.';
      if (cryptWord === 'mouth') return 'The crack has your mouth on it. It is not Cracked Zero. South is the gallery.';
      if (cryptWord === 'digit' && !breachWord) return 'Cracked Zero widened the crack. North is the first breach. The bar stays shut.';
      if (cryptWord === 'digit') return 'The first breach was walked. The bar stayed shut. South is the gallery.';
      return 'You left the crack. A pressed digit would widen it. South is the gallery.';
    }
    if (locale === 'watch-gallery') {
      if (!galleryWord) return 'The ledger numbers the cathedral. Read the count, or file the hinge. The stair stays shut until then.';
      if (!cryptWord) return 'The grate is up. The count-stair goes down. The cathedral bar stays shut.';
      return 'The crypt is under the stair. The cathedral bar stayed shut. South is the nave.';
    }
    if (locale === 'ash-nave') {
      if (!galleryWord) return 'East of the sealed door, the Concord keeps a watch gallery. The cathedral bar stays shut.';
      if (!cryptWord) return 'Licence Zero is counted. East, the stair under the gallery goes down. South is the mark.';
      if (breachWord) return 'The first breach was walked. The cathedral bar stayed shut. South is the mark.';
      if (cryptWord === 'digit') return 'Cracked Zero is in the pack. The stair under the gallery goes down. South is the mark.';
      return 'The crack under Licence Zero was faced. The cathedral bar stayed shut. South is the mark.';
    }
    if (locale === 'remnant-mark') {
      if (!seenBeats.markFight) return 'A counter stands on the road to the pillar.';
      if (!seenBeats.naveStep) return 'North of the pillar, the road goes on to a sealed door.';
      if (naveWord === 'name') return 'The nave is named and shut. South is the yard.';
      if (naveWord === 'turn') return 'You left the cathedral seal. South is the yard.';
      if (weep && weep.absorbed) return 'The weep is in the spark. North, the nave is still a door.';
      if (weep && weep.bottled) return 'They numbered the weep. North, the nave is still a door.';
      return 'The weep is at the pillar. North, the road goes on.';
    }
    if (locale === 'concord-yard') {
      if (!seenBeats.markStep && (slag && (slag.absorbed || slag.bottled) || yardWord)) {
        return 'North of the yard, a stone opens the Remnant Mark.';
      }
      if (!seenBeats.markStep && slag && !slag.absorbed && !slag.bottled) {
        return 'The slag is in the yard. North, a stone opens the Remnant Mark.';
      }
      if (seenBeats.markStep && weep && weep.absorbed) return 'The weep is digested. South is the ash. North is the mark.';
      if (slag && slag.absorbed) return 'The slag is in the spark. North is the Remnant Mark.';
      if (slag && slag.bottled) return 'The warden sealed the slag. North is the Remnant Mark.';
      return 'The slag is in the yard. Drink it, or let the warden seal it.';
    }
    if (seenBeats.markStep && weep && weep.absorbed) return 'The weep is digested. The remnant is still ahead of the pillar.';
    if (slag && slag.absorbed && !seenBeats.markStep) return 'The slag is digested. North of the yard, the mark is still shut from here.';
    if (yardWord === 'seal') return 'The yard is licensed. The slag stayed bottled.';
    if (locale === 'ashen-marrow' || seenBeats.yardStep || seenBeats.marrowStep) {
      if (locale === 'engine-throat') return 'The bottle is north. Name it, or cork it.';
      if (locale === 'marrow-pipe' && !pipeWord) return 'The valve is north. Crack the feed, or leave the cork.';
      if (locale === 'ashen-marrow' && !seenBeats.yardStep) return 'West of the engine, a stone opens the Concord yard.';
      if (locale === 'ashen-marrow') return 'The yard stone is west. South of the shelf is the hall.';
    }
    if (throatWord === 'name') return 'The name is in the spark. The yard stone is west of the engine.';
    if (throatWord === 'cork') return 'The name stayed corked. The yard stone is still west of the engine.';
    if (locale === 'harbor-vault' && !seenBeats['bottle-hall']) return 'The bottle-hall is north of the count.';
    if (locale === 'field' && regionId === 'stormreach' && !seenBeats['vault-face']) return 'The harbor vault is in the cliff.';
    if (locale === 'leaf-village' && !seenBeats['furrow-letter']) return 'A letter sits in the basket by the furrow. It is not the road. South is the isle.';
    if (locale === 'field' && regionId === 'verdant-isle' && !seenBeats.village) return 'The leaf-village is on the isle. The argument is inside.';
    if (locale === 'root-cellar' && !seenBeats.kiln) return 'The kiln is north. It still has a tenant.';
    if (!seenBeats['waystone-wake']) return 'The kiln, then the scar. The waystone stays shut until both.';
    if (!seenBeats.marrowStep) return 'The inland road starts in the bottle-hall.';
    return 'The ash shelf is not the end of the rot.';
  }

  function refreshRumor() {
    const vesperDone = pools.some((p) => p.id === 'vesper' && p.absorbed);
    const wellDone = pools.some((p) => p.id === 'well' && p.absorbed);
    const left = pools.filter((p) => !p.absorbed && !p.bottled && !p.interior).length;
    const kilnQuiet = pools.some((p) => p.id === 'kiln' && p.absorbed);
    const mergeNames = earnedMergeNames();
    if (locale === 'aftermath') {
      const bird = kestrelClaim === 'land'
        ? ' Kestrel landed and did not join.'
        : ' Kestrel stayed in the air.';
      rumor = !seenBeats.aftermath
        ? 'The room is the ending. Hear it. Credits are north. South is the claim.' + bird
        : claimWord === 'burn'
          ? 'The claim burned. The licence will be rewritten. The scar is the echo. Scar debt ' + scarDebt + '. Credits are north.' + bird
          : claimWord === 'refuse'
            ? 'She kept her name. Licence Zero kept its number. The rot goes on. Credits are north.' + bird
            : claimWord === 'share'
              ? 'Two sparks. The page cannot hold both. The rot hesitates. Credits are north.' + bird
              : 'She still wears it. The licence has no number. The hunger is quieter. Credits are north.' + bird;
    } else if (locale === 'remnant-claim') {
      rumor = !seenBeats.claimFight
        ? 'A last rite stands under the remnant. A merge tears the ward. A knife spends itself. Kestrel is on a rib, not in the pack.'
        : !claimWord
          ? 'The rite is down. Vesper is at the mass. Claim, refuse, share, or burn. North writes the ending after.'
          : !seenBeats.aftermath
            ? 'The flag is set. North is the aftermath. She did not enter the host. South is the breach.'
            : claimWord === 'burn'
              ? 'The ending is written. The scar is the echo. South is the breach.'
              : 'The ending is written. South is the breach.';
    } else if (locale === 'first-breach') {
      rumor = !seenBeats.breachFight
        ? 'A Concord captain holds the threshold under Licence Zero. The light ahead is not a door. Kestrel is not in it.'
        : breachWord === 'hold'
          ? (claimWord
            ? (seenBeats.aftermath
              ? 'The ending is written past the bar. South is the crypt.'
              : 'The claim was set past the bar. North of the mass is the aftermath. South is the crypt.')
            : 'Held Threshold. North, past the bar, is the remnant claim. The ending is written after the flag. South is the crypt.')
          : breachWord === 'mouth'
            ? 'You set a mouth on the light. The scar took the step. Vesper did not enter the host. South is the crypt.'
            : breachWord === 'back'
              ? 'You stepped back. The room stays open. The bar stayed shut. South is the crypt.'
              : 'The last stand is down. Vesper is in the light and will not duel. She will not enter the host.';
    } else if (locale === 'count-crypt') {
      rumor = !seenBeats.cryptFight
        ? 'Under Licence Zero, an auditor keeps the page. The remnant is a crack, not a door. Kestrel is not down here.'
        : cryptWord === 'digit'
          ? (breachWord
            ? 'The first breach was walked. The names stayed in the pack. The bar stayed shut. South is the gallery.'
            : 'Cracked Zero widened the crack. North is one room of the remnant. The bar stayed shut. South is the gallery.')
          : cryptWord === 'mouth'
            ? 'You put a mouth on the crack. The scar took what the pack did not. The bar stayed shut. Vesper did not enter the host.'
            : cryptWord === 'leave'
              ? 'You left the crack. The remnant stayed a light in the stone. The bar stayed shut. South is the gallery.'
              : 'The ledger is readable. North, the remnant breathes through a crack. Vesper is the pressure. She will not enter the host.';
    } else if (seenBeats.gallery && locale === 'watch-gallery') {
      rumor = galleryWord === 'read'
        ? 'Licence Zero. The Concord numbered the Prime Remnant. The grate lifts after the count. The bar stays shut. South is the nave.'
        : galleryWord === 'file'
          ? 'The nave’s word is filed into Licence Zero. The stair goes down. The cathedral bar stayed shut. South is the nave.'
          : 'A watch gallery. The ledger is still a choice. The count-stair stays shut until the count is made. Kestrel is not the road.';
      if (!seenBeats['gallery-margin']) rumor += ' East, a filed copy is not the stair.';
    } else if (seenBeats.naveStep && locale === 'ash-nave') {
      rumor = galleryWord
        ? (cryptWord
          ? 'The crypt under Licence Zero was walked. The cathedral bar stayed shut. South is the pillar.'
          : 'Licence Zero is on the page. The stair under the gallery goes down. The cathedral bar stayed shut. South is the pillar.')
        : naveWord === 'name'
          ? 'You named the hinge. The cathedral door stayed shut. East, the Concord keeps a count. South is the pillar.'
          : naveWord === 'turn'
            ? 'You left the seal. The ash cathedral is still there. East, the Concord keeps a count. South is the pillar.'
            : 'Ash falls on a sealed cathedral. East of the bar, a watch gallery keeps the count. Vesper is on the roof. She will not enter the host. Kestrel is not the road.';
      if (!seenBeats['nave-pressure']) rumor += ' West, chalk on the wall is not the door.';
    } else if (seenBeats.markStep && locale === 'remnant-mark') {
      const weep = pools.find((p) => p.id === 'mark-weep');
      rumor = !seenBeats.markFight
        ? 'A counter was left to number the leak. The pillar is north. Kestrel did not carry you.'
        : weep && weep.absorbed
          ? 'The weep is in the spark. The Prime Remnant is not this pillar. South is the yard.'
          : weep && weep.bottled
            ? 'They numbered the weep. The pillar stayed. South is the yard.'
            : 'The Remnant Mark. The rumour has a stone. The weep is still a mouth. Vesper will not enter the host.';
    } else if (seenBeats.marrowStep && locale === 'concord-yard') {
      const slag = pools.find((p) => p.id === 'yard-slag');
      rumor = slag && slag.absorbed
        ? 'The yard slag is in the spark. The warden has the name. South is the stone.'
        : slag && slag.bottled
          ? 'The warden sealed the slag. The rot stayed in the yard. South is the ash.'
          : 'Concord yard. The slag is licensed and leaking. Vesper wants a mouth on it. Kestrel did not carry you.';
      if (!seenBeats['yard-camp']) rumor += ' West of the south gate, a rest is not the road.';
    } else if (seenBeats.marrowStep && locale === 'engine-throat') {
      rumor = throatWord === 'name'
        ? 'The name is in her teeth. South is the ash. The next stone is not here.'
        : throatWord === 'cork'
          ? 'The bottle kept the word. South is the ash.'
          : 'A sealed bottle. The word is older than the glass. Name it, or cork it.';
    } else if (seenBeats.marrowStep && locale === 'marrow-pipe') {
      rumor = pipeWord === 'crack'
        ? 'The feed is cracked. The engine is hungrier. South of this iron is the ash.'
        : pipeWord === 'leave'
          ? 'The feed stayed corked. The name is in the pack. South of this iron is the ash.'
          : 'Iron. The valve is north. The ash is south.';
    } else if (seenBeats.marrowStep) {
      const vesperBit = seenBeats['marrow-vesper']
        ? (vesperAsh === 'taste'
          ? 'Vesper tasted the scar and did not step in. '
          : 'You refused Vesper’s mouth. The stain is on the ash. ')
        : '';
      const coughBit = scarDebt >= 2 ? ' Lira coughs. The feet go slower.' : '';
      const pipeBit = pipeWord === 'crack'
        ? ' The engine pipe is cracked.'
        : pipeWord === 'leave'
          ? ' The engine pipe stayed corked.'
          : '';
      const throatBit = throatWord === 'name'
        ? ' The name is in the spark.'
        : throatWord === 'cork'
          ? ' The name stayed corked.'
          : '';
      rumor = vesperBit + (marrowWord === 'bank'
        ? 'You walked the ash and banked the leak. Scar debt is ' + scarDebt + '. The hall is south of the engine.'
        : scarMarks.leak
          ? 'You fed the digest-engine. The scar took the mouthful. Scar debt is ' + scarDebt + '.'
          : 'Your feet are on Ashen Marrow. The engine eats what the harbor would not keep. The hall is south.') + coughBit + pipeBit + throatBit;
    } else if (seenBeats.marrowRoad) {
      rumor = 'You looked down the corked road. Ashen Marrow is inland, where a bottle already leaked. Your feet stayed in the hall.';
    } else if (seenBeats['bottle-hall']) {
      rumor = hallWord === 'crack'
        ? 'The earth cork cracked. The spectacle is poorer by a mouthful. The inland leak remains, and so does the marrow bottle.'
        : 'You walked the bottle-hall and left the corks. The inland bottle still faces Ashen Marrow.';
    } else if (seenBeats['kestrel-ask'] && !seenBeats['vesper-duel']) {
      rumor = kestrelWord === 'ask'
        ? 'You asked Kestrel to land. She refused. The thermal is still hers, and the pack is still without her.'
        : 'You left Kestrel the air. She did not join. The roost is still the way home.';
    } else if (seenBeats['vesper-duel']) {
      rumor = duelWord === 'press'
        ? 'Vesper turned the blow on the shale. Nobody fell. The vault is still corked, and the wrist has a number.'
        : 'You held the blow on the shale. Vesper counted the hold and walked away alive. The vault is still corked.';
    } else if (mergeNames.length === 1) {
      rumor = mergeNames[0] + ' is on the magic list. It spends what it names, and then those elements are gone.';
    } else if (mergeNames.length) {
      rumor = mergeNames.join(', ') + ' sit on the magic list. They spend what they name, and then those elements are gone.';
    } else if (seenBeats['vault-ledger']) {
      const signed = seals.some((seal) => seal.name === 'Witness Line');
      rumor = signed
        ? 'Lira’s name is on the harbor shortage. The bottles stayed behind iron. The shale is still drinking the difference.'
        : 'You refused the harbor’s shortage line. The book stays polite. The bottles stayed behind iron.';
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
    const earthEl = $('#el-earth');
    if (earthEl) earthEl.textContent = String(spark.earth || 0);
    const scarEl = $('#hud-scar');
    if (scarEl) {
      scarEl.classList.remove('hidden');
      scarEl.classList.toggle('quiet', scarDebt <= 0);
      scarEl.textContent = scarDebt > 0
        ? 'Scar ' + scarDebt + ' · max HP −' + (scarDebt * SCAR_CUT)
        : 'Scar 0';
    }
    const strainWord = spark.strain >= 70 ? 'tearing' : spark.strain >= 40 ? 'taxed' : 'steady';
    $('#strain-nums').textContent = spark.strain + '/100 · ' + strainWord;
    const bar = $('#strain-bar');
    bar.style.width = spark.strain + '%';
    bar.classList.toggle('warn', spark.strain >= 40 && spark.strain < 70);
    bar.classList.toggle('danger', spark.strain >= 70);
    const lira = findMember('lira');
    const cap = maxHp(lira);
    $('#hud-hp').textContent = 'Lira ' + lira.hp + '/' + cap;
    const hpBar = $('#hp-bar');
    if (hpBar) hpBar.style.width = Math.max(0, Math.min(100, Math.round((lira.hp / cap) * 100))) + '%';
    $('#hud-path').textContent = 'Path ' + (spark.path ? PATH_LABEL[spark.path] : '—');
    $('#hud-rumor').textContent = rumor;
    const questEl = $('#hud-quest');
    if (questEl) questEl.textContent = questLine();
    const bedBtn = $('#btn-bed');
    if (bedBtn) {
      bedBtn.textContent = bedWanted ? 'Sound' : 'Silent';
      bedBtn.setAttribute('aria-pressed', bedWanted ? 'true' : 'false');
    }
    const absorbBtn = $('#btn-absorb');
    const idle = gameState === State.OVERWORLD && !inventoryOpen && !encounterLocked && !dialogueOpen;
    const atExit = idle && atInteriorExit();
    const kilnGuarded = !!(nearPool && nearPool.id === 'kiln' && !seenBeats.kiln && !nearPool.absorbed);
    const poolReady = !!(nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld && !kilnGuarded);
    const showAbsorb = idle && poolReady && (locale === 'field' ? !nearPool.interior : !atExit);
    const showDoor = idle && locale === 'field' && nearDoor && !showAbsorb;
    const showGate = idle && locale === 'field' && nearGate && !showAbsorb && !showDoor;
    const showReturn = idle && locale === 'field' && nearReturn && !showAbsorb && !showDoor && !showGate;
    const showLook = idle && nearMarrow && !showAbsorb && !atExit;
    const showPipe = idle && nearPipe && !showAbsorb && !atExit && !showLook;
    const showThroat = idle && nearThroat && !showAbsorb && !atExit && !showLook && !showPipe;
    const showStone = idle && nearStone && !showAbsorb && !atExit && !showLook && !showPipe && !showThroat;
    const showTalk = idle && (nearWorker || nearWarden) && !showAbsorb && !atExit && !showLook && !showPipe && !showThroat && !showStone && !nearMark;
    const showMark = idle && nearMark && !showAbsorb && !atExit && !showLook && !showPipe && !showThroat && !showStone;
    const showNave = idle && nearNave && seenBeats.markFight && !showAbsorb && !atExit && !showLook && !showPipe && !showThroat && !showStone && !showMark;
    const showGallery = idle && nearGallery && !showAbsorb && !atExit && !showNave;
    const showStair = idle && nearStair && !showAbsorb && !atExit;
    const showCrack = idle && nearCrack && !showAbsorb && !atExit;
    const showBar = idle && nearBar && !showAbsorb && !atExit;
    const showEnd = idle && nearEnd && !showAbsorb && !atExit && !showBar;
    const showCredits = idle && nearCredits && !showAbsorb && !atExit;
    const showPerch = idle && nearPerch && !showAbsorb && !atExit && !showBar && !showEnd;
    const showKestrel = idle && nearKestrel && !showAbsorb && !atExit && !showGallery;
    const showPorter = idle && locale === 'field' && nearPorter && !showAbsorb && !showDoor && !showGate && !showReturn;
    const showLetter = idle && nearLetter && !atExit && !showAbsorb;
    const showMargin = idle && nearMargin && !atExit && !showStair;
    const showChalk = idle && nearChalk && !atExit && !showGallery && !showKestrel;
    const showCamp = idle && nearCamp && !showAbsorb && !atExit && !showTalk && !showMark;
    const showChest = idle && nearChest && !showAbsorb && !showDoor && !showGate && !showReturn;
    const showNotice = idle && nearNotice && !showAbsorb && !showDoor && !showGate && !showReturn && !showPorter && !showChest;
    const showCord = idle && nearCord && !showAbsorb && !showDoor && !showChest;
    absorbBtn.classList.toggle('hidden', !showAbsorb && !showDoor && !atExit && !showGate && !showReturn && !showLook && !showPipe && !showThroat && !showStone && !showTalk && !showMark && !showNave && !showGallery && !showStair && !showCrack && !showBar && !showEnd && !showCredits && !showPerch && !showKestrel && !showPorter && !showLetter && !showMargin && !showChalk && !showCamp && !showChest && !showNotice && !showCord);
    if (atExit) absorbBtn.textContent = 'Leave';
    else if (showDoor) absorbBtn.textContent = 'Enter';
    else if (showReturn) absorbBtn.textContent = 'Return';
    else if (showGate) absorbBtn.textContent = 'Land';
    else if (showStair) absorbBtn.textContent = galleryWord ? 'Enter' : 'Look';
    else if (showCrack) absorbBtn.textContent = nearCrack.open ? 'Enter' : 'Look';
    else if (showBar) absorbBtn.textContent = nearBar.open ? 'Enter' : 'Look';
    else if (showCredits) absorbBtn.textContent = 'Credits';
    else if (showEnd) absorbBtn.textContent = 'Enter';
    else if (showPorter) absorbBtn.textContent = 'Speak';
    else if (showPerch || showKestrel) absorbBtn.textContent = 'Speak';
    else if (showLook || showPipe || showThroat || showStone || showMark || showNave || showGallery) absorbBtn.textContent = 'Enter';
    else if (showTalk) absorbBtn.textContent = 'Speak';
    else if (showChest) absorbBtn.textContent = seenBeats['wayside-chest'] ? 'Look' : 'Open';
    else if (showLetter || showMargin || showChalk || showCamp || showNotice || showCord) absorbBtn.textContent = 'Look';
    else if (showAbsorb) absorbBtn.textContent = 'Absorb ' + nearPool.short;
  }

  function updatePrompt() {
    const atExit = atInteriorExit();
    if (gameState !== State.OVERWORLD || inventoryOpen || encounterLocked || dialogueOpen || creditsCovering() || (!nearPool && !nearDoor && !nearGate && !nearReturn && !nearMarrow && !nearWorker && !nearWarden && !nearPipe && !nearThroat && !nearStone && !nearMark && !nearNave && !nearGallery && !nearStair && !nearMargin && !nearChalk && !nearCamp && !nearCrack && !nearBar && !nearEnd && !nearCredits && !nearPerch && !nearKestrel && !nearPorter && !nearLetter && !nearChest && !nearNotice && !nearCord && !atExit)) {
      interactPrompt.classList.add('hidden');
      return;
    }
    interactPrompt.classList.remove('hidden');
    if (locale !== 'field' && nearPool && !atInteriorExit()) {
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
      $('#interact-title').textContent = locale === 'aftermath' ? 'The claim' : locale === 'remnant-claim' ? 'The breach' : locale === 'first-breach' ? 'The crypt' : locale === 'root-cellar' ? 'The mouth' : locale === 'ashen-marrow' ? 'The hall' : locale === 'concord-yard' ? 'The ash' : locale === 'remnant-mark' ? 'The yard' : locale === 'ash-nave' ? 'The mark' : locale === 'watch-gallery' ? 'The nave' : locale === 'count-crypt' ? 'The gallery' : locale === 'marrow-pipe' ? 'The ash' : locale === 'engine-throat' ? 'The ash' : locale === 'harbor-vault' ? 'The shale' : 'The door';
      $('#interact-detail').textContent = locale === 'root-cellar'
        ? 'Press E to step back onto the isle. The throat stays open behind you.'
        : locale === 'ashen-marrow'
          ? 'Press E to step back into the bottle-hall. The engine stays on the ash.'
          : locale === 'concord-yard'
            ? 'Press E to step back through the stone. The yard stays licensed or leaking as you left it.'
          : locale === 'remnant-mark'
            ? 'Press E to step back into the yard. The pillar stays numbered. Kestrel is not waiting.'
          : locale === 'ash-nave'
            ? 'Press E to step back to the pillar. The cathedral door stays shut.'
          : locale === 'watch-gallery'
            ? 'Press E to step back to the nave. The count-stair stays where you left it.'
          : locale === 'aftermath'
            ? 'Press E to step back into the claim. The ending stays written. Credits are north.'
          : locale === 'remnant-claim'
            ? 'Press E to step back into the breach. The claim stays. North of the mass is the aftermath, once a flag is set.'
          : locale === 'first-breach'
            ? 'Press E to step back into the crypt. The threshold stays. The bar, if you held it, is still north.'
          : locale === 'count-crypt'
            ? 'Press E to step back to the gallery. The crack stays. The cathedral bar stays shut.'
          : locale === 'marrow-pipe'
            ? 'Press E to step back onto the ash. The feed stays where you left it.'
          : locale === 'engine-throat'
            ? 'Press E to step back onto the ash. The bottle stays in the throat.'
          : locale === 'harbor-vault'
          ? (seenBeats['bottle-hall']
            ? 'Press E to step back onto the coast. The hall stays lit. The inland road does not come with you.'
            : 'Press E to step back onto the coast. The iron stays shut.')
          : 'Press E to step back onto the isle.';
      return;
    }
    if (nearLetter) {
      $('#interact-title').textContent = nearLetter.title;
      $('#interact-detail').textContent = nearLetter.hint;
      return;
    }
    if (nearDoor && !(nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld)) {
      $('#interact-title').textContent = nearDoor.title;
      $('#interact-detail').textContent = nearDoor.hint;
      return;
    }
    if (nearPorter && !(nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld)) {
      $('#interact-title').textContent = nearPorter.title;
      $('#interact-detail').textContent = nearPorter.hint;
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
    if (nearMarrow) {
      $('#interact-title').textContent = nearMarrow.title;
      $('#interact-detail').textContent = nearMarrow.hint;
      return;
    }
    if (nearPipe) {
      $('#interact-title').textContent = nearPipe.title;
      $('#interact-detail').textContent = nearPipe.hint;
      return;
    }
    if (nearThroat) {
      $('#interact-title').textContent = nearThroat.title;
      $('#interact-detail').textContent = nearThroat.hint;
      return;
    }
    if (nearStone) {
      $('#interact-title').textContent = nearStone.title;
      $('#interact-detail').textContent = nearStone.hint;
      return;
    }
    if (nearMark) {
      $('#interact-title').textContent = nearMark.title;
      $('#interact-detail').textContent = nearMark.hint;
      return;
    }
    if (nearNave) {
      $('#interact-title').textContent = nearNave.title;
      $('#interact-detail').textContent = nearNave.hint;
      return;
    }
    if (nearGallery) {
      $('#interact-title').textContent = nearGallery.title;
      $('#interact-detail').textContent = nearGallery.hint;
      return;
    }
    if (nearStair) {
      $('#interact-title').textContent = nearStair.title;
      $('#interact-detail').textContent = nearStair.hint;
      return;
    }
    if (nearMargin) {
      $('#interact-title').textContent = nearMargin.title;
      $('#interact-detail').textContent = nearMargin.hint;
      return;
    }
    if (nearChalk) {
      $('#interact-title').textContent = nearChalk.title;
      $('#interact-detail').textContent = nearChalk.hint;
      return;
    }
    if (nearCamp) {
      $('#interact-title').textContent = nearCamp.title;
      $('#interact-detail').textContent = nearCamp.hint;
      return;
    }
    if (nearChest && !(nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld)) {
      $('#interact-title').textContent = nearChest.title;
      $('#interact-detail').textContent = nearChest.hint;
      return;
    }
    if (nearNotice) {
      $('#interact-title').textContent = nearNotice.title;
      $('#interact-detail').textContent = nearNotice.hint;
      return;
    }
    if (nearCord && !(nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld)) {
      $('#interact-title').textContent = nearCord.title;
      $('#interact-detail').textContent = nearCord.hint;
      return;
    }
    if (nearCrack) {
      $('#interact-title').textContent = nearCrack.title;
      $('#interact-detail').textContent = nearCrack.hint;
      return;
    }
    if (nearBar) {
      $('#interact-title').textContent = nearBar.title;
      $('#interact-detail').textContent = nearBar.hint;
      return;
    }
    if (nearEnd) {
      $('#interact-title').textContent = nearEnd.title;
      $('#interact-detail').textContent = nearEnd.hint;
      return;
    }
    if (nearCredits) {
      $('#interact-title').textContent = nearCredits.title;
      $('#interact-detail').textContent = nearCredits.hint;
      return;
    }
    if (nearPerch) {
      $('#interact-title').textContent = nearPerch.title;
      $('#interact-detail').textContent = nearPerch.hint;
      return;
    }
    if (nearKestrel) {
      $('#interact-title').textContent = nearKestrel.title;
      $('#interact-detail').textContent = nearKestrel.hint;
      return;
    }
    if (nearWorker || nearWarden) {
      $('#interact-title').textContent = (nearWarden || nearWorker).title;
      $('#interact-detail').textContent = (nearWarden || nearWorker).hint;
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
    const questCard = $('#inv-quest');
    if (questCard) questCard.textContent = questLine();
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
      if (seenBeats['furrow-letter']) waiting.push('A cousin’s letter says Vesper walked the Concord to the well. The furrow was the price. The road did not change.');
      if (seenBeats['wayside-chest']) waiting.push('The wayside chest gave one tonic. It is empty. The kiln is still the road.');
      if (seenBeats['salt-cord']) waiting.push('A salt cord is in the pack. The vault does not count rope. The road did not change.');
      if (seenBeats['coast-notice']) waiting.push('A notice on the shale says mouths are numbered. It is not the vault door.');
      if (seenBeats['gallery-margin']) {
        waiting.push(seals.some((seal) => seal.name === 'Cousin’s Margin')
          ? 'The gallery’s filed copy matches the cousin’s letter. The stair did not change.'
          : 'The gallery filed the village seal as mercy. The furrow is not in the count.');
      }
      if (seenBeats['nave-pressure']) waiting.push('West chalk in the nave numbered the host. It did not open the bar.');
      if (seenBeats['yard-camp']) waiting.push('They rested west of the yard’s south gate. The slag and the mark stayed where they were.');
      if (!findMember('nima')) waiting.push('Nima is still in the leaf-village.');
      if (!findMember('torren')) waiting.push('Torren has not refused the Concord yet.');
      if (seenBeats['kestrel-ask']) {
        waiting.push(kestrelWord === 'ask'
          ? 'You asked Kestrel to land. She refused. She is still the road, not the company.'
          : 'You left Kestrel the air. She did not join.');
      } else if (kestrelNave) {
        waiting.push(kestrelNave === 'ask'
          ? 'You asked Kestrel to land over the nave. She refused. She is not in the pack.'
          : 'A bird crossed the nave. You left her the air. She did not join.');
      } else if (seenBeats['nave-fly']) {
        waiting.push('A bird crossed the nave and did not land. She is not in the pack.');
      } else if (seenBeats['coast-landing']) {
        waiting.push('Kestrel set you on the Stormreach shale and stayed in the air. She did not join.');
      } else if (seenBeats.coastRoute) {
        waiting.push('Kestrel opened a thermal to Stormreach. She did not join. The harbor vault stayed corked.');
      } else if (seenBeats.kestrel) {
        waiting.push('Kestrel crossed overhead. She did not join.');
      } else {
        waiting.push('Kestrel is not on this road.');
      }
      if (seenBeats['bottle-hall']) {
        waiting.push(hallWord === 'crack'
          ? 'The earth cork is cracked. The marrow bottle stayed. Kestrel still did not join.'
          : 'You walked the bottle-hall and left the corks. Kestrel still did not join.');
      } else if (seenBeats['vault-ledger']) {
        const signed = seals.some((seal) => seal.name === 'Witness Line');
        waiting.push(signed
          ? 'The harbor count has Lira’s name on the shortage. The bottles stayed behind iron.'
          : 'You refused the harbor’s shortage line. The bottles stayed behind iron.');
      }
      if (seenBeats.marrowStep) {
        waiting.push(marrowWord === 'bank'
          ? 'You walked the ash and banked the engine leak.'
          : scarMarks.leak
            ? 'You fed the digest-engine. The mouthful stayed in the scar.'
            : 'You stepped onto Ashen Marrow. The hall is the way back.');
      } else if (seenBeats.marrowRoad) waiting.push('You looked down Ashen Marrow from the hall. The digest-engine is inland. Your feet stayed.');
      if (feedNoted || passageNoted) {
        waiting.push(feedSpent || passageLaid
          ? 'In the crypt those names went into the crack and stayed in the pack. They did not open the cathedral bar.'
          : 'In the watch gallery those names read as digits of Licence Zero. They do not open the cathedral bar.');
      }
      if (claimWord) {
        waiting.push(seenBeats.aftermath
          ? (claimWord === 'burn'
            ? 'The ending is written. The scar is the echo. Scar debt ' + scarDebt + '. Lira’s max HP is cut by ' + (scarDebt * SCAR_CUT) + '.'
            : claimWord === 'refuse'
              ? 'The ending is written. She kept her name. Licence Zero kept its number.'
              : claimWord === 'share'
                ? 'The ending is written. Two sparks. Vesper did not enter the host.'
                : 'The ending is written. Lira still wears the remnant. The hunger is quieter.')
          : (claimWord === 'claim'
            ? 'The spark claimed the remnant. Lira is still the host. North is the aftermath.'
            : claimWord === 'refuse'
              ? 'The remnant was refused. North is the aftermath.'
              : claimWord === 'share'
                ? 'The claim is shared. Vesper did not enter the host. North is the aftermath.'
                : 'The claim was burned. The scar took the ash. North is the aftermath.'));
      } else if (breachWord === 'hold') {
        waiting.push('Held Threshold. North, past the bar, is the remnant claim.');
      }
      if (kestrelClaim) {
        waiting.push(kestrelClaim === 'land'
          ? 'Kestrel landed in the claim chamber. She did not join.'
          : 'Kestrel stayed on the rib in the claim chamber. She did not join.');
      }
      if (breachWord) {
        waiting.push(breachWord === 'hold'
          ? 'The first breach is held. Remnant ash is in the teeth.'
          : breachWord === 'mouth'
            ? 'A mouth is on the breach light. The scar took the step. The bar stays shut.'
            : 'You stepped back from the breach light. Holding the threshold opens the bar.');
      } else if (cryptWord === 'digit') {
        waiting.push('Cracked Zero widened the crypt crack. North of it, the first breach is still a room.');
      }
      if (scarDebt >= 2) waiting.push('Scar debt ' + scarDebt + ' has reached the walk. Lira coughs, and the feet go slower. Each point still cuts max HP by ' + SCAR_CUT + '.');
      else if (scarDebt > 0) waiting.push('Scar debt ' + scarDebt + '. Each point cuts Lira’s max HP by ' + SCAR_CUT + '. The kiln, the earth cork, and a fed engine add a point. Banking the marrow leak eases one.');
      if (seenBeats['marrow-vesper']) {
        waiting.push(vesperAsh === 'taste'
          ? 'Vesper tasted the scar on the ash and did not step into the host.'
          : 'You refused Vesper’s mouth. A stain stayed on the ash. She did not enter.');
      }
      if (pipeWord === 'crack') waiting.push('You cracked the engine feed. The stoker’s coat was the licence. Kestrel still did not join.');
      else if (pipeWord === 'leave') waiting.push('You left the engine feed corked and named the theft. Kestrel still did not join.');
      if (throatWord === 'name') waiting.push('You spoke the bottle’s name into the spark. It scarred. The next stone is not on this shelf.');
      else if (throatWord === 'cork') waiting.push('You corked the name. The bottle kept the word.');
      if (kestrelMarrow === 'ask') waiting.push('You asked Kestrel to walk as far as the next stone. She refused. She is still not in the pack.');
      else if (kestrelMarrow === 'air') waiting.push('You left Kestrel the air above the ash. She did not join.');
      if (seenBeats.yardStep) {
        const slag = pools.find((p) => p.id === 'yard-slag');
        if (slag && slag.absorbed) waiting.push('You drank the yard slag. The stone carried you. Kestrel did not join.');
        else if (yardWord === 'seal') waiting.push('You let the warden seal the yard slag. Kestrel did not join.');
        else waiting.push('You stepped into the Concord yard. The stone carried you. Kestrel did not join.');
      }
      if (seenBeats.markStep) {
        const weep = pools.find((p) => p.id === 'mark-weep');
        if (weep && weep.absorbed) waiting.push('You drank the remnant weep. The pillar is not the Prime Remnant. Kestrel did not join.');
        else if (markWord === 'seal') waiting.push('You let them number the weep. The pillar stayed. Kestrel did not join.');
        else if (!seenBeats.markFight) waiting.push('The Remnant Mark is open. A counter is still on the road. Kestrel did not join.');
        else waiting.push('You stood at the Remnant Mark. The weep is still a mouth. Kestrel did not join.');
      }
      if (seenBeats.naveStep) {
        if (naveWord === 'name') waiting.push('You named the cathedral hinge. The door stayed shut. Kestrel did not join.');
        else if (naveWord === 'turn') waiting.push('You left the cathedral seal. The door stayed shut. Kestrel did not join.');
        else waiting.push('You walked the ash nave. The door is still a choice. Kestrel did not join.');
      }
      const heldMerges = earnedMergeNames();
      if (heldMerges.length) waiting.push(heldMerges.join(', ') + (heldMerges.length === 1 ? ' is' : ' are') + ' on the magic list.');
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
    $('#inv-seals').innerHTML = keys.map((k) => `<li class="inv-card" title="${esc(k.desc)}"><div class="name">${esc(k.name)}</div><div class="desc">${esc(k.desc)}</div></li>`).join('');

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
    const scarInv = $('#inv-scar');
    if (scarInv) scarInv.textContent = 'Scar ' + scarDebt + (scarDebt > 0 ? ' · −' + (scarDebt * SCAR_CUT) + ' HP' : '');
    $('#inv-fire').textContent = String(spark.fire);
    $('#inv-water').textContent = String(spark.water);
    $('#inv-lightning').textContent = String(spark.lightning);
    const earthInv = $('#inv-earth');
    if (earthInv) earthInv.textContent = String(spark.earth || 0);
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
      closePlaces();
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
      const atMouth = atInteriorExit();
      if (nearMarrow && locale === 'harbor-vault') {
        cross(enterMarrow);
        return;
      }
      if (nearPool && !atMouth) {
        tryAbsorb();
        return;
      }
      if (nearLetter && locale === 'leaf-village' && !atMouth) {
        talkLetter();
        return;
      }
      if (nearPipe && locale === 'ashen-marrow' && !atMouth) {
        cross(enterPipe);
        return;
      }
      if (nearThroat && locale === 'ashen-marrow' && !atMouth) {
        cross(enterThroat);
        return;
      }
      if (nearStone && locale === 'ashen-marrow' && !atMouth) {
        cross(enterYard);
        return;
      }
      if (nearWarden && locale === 'concord-yard' && !atMouth) {
        talkWarden();
        return;
      }
      if (nearMark && locale === 'concord-yard' && !atMouth) {
        cross(enterMark);
        return;
      }
      if (nearCamp && locale === 'concord-yard' && !atMouth) {
        talkCamp();
        return;
      }
      if (nearNave && locale === 'remnant-mark' && seenBeats.markFight && !atMouth) {
        cross(enterNave);
        return;
      }
      if (nearGallery && locale === 'ash-nave' && !atMouth) {
        cross(enterGallery);
        return;
      }
      if (nearStair && locale === 'watch-gallery' && !atMouth) {
        cross(() => { if (galleryWord) enterCrypt(); else lookStair(); });
        return;
      }
      if (nearMargin && locale === 'watch-gallery' && !atMouth) {
        talkMargin();
        return;
      }
      if (nearCrack && locale === 'count-crypt' && !atMouth) {
        cross(() => { if (nearCrack.open) enterBreach(); else lookCrack(); });
        return;
      }
      if (nearBar && locale === 'first-breach' && !atMouth) {
        cross(() => { if (nearBar.open) enterClaim(); else lookBar(); });
        return;
      }
      if (nearEnd && locale === 'remnant-claim' && !atMouth) {
        cross(enterAftermath);
        return;
      }
      if (nearCredits && locale === 'aftermath' && !atMouth) {
        openRunCredits();
        return;
      }
      if (nearPerch && locale === 'remnant-claim' && !atMouth) {
        talkKestrelClaim();
        return;
      }
      if (nearKestrel && locale === 'ash-nave' && !atMouth) {
        talkKestrelNave();
        return;
      }
      if (nearChalk && locale === 'ash-nave' && !atMouth) {
        talkChalk();
        return;
      }
      if (nearWorker && !atMouth) {
        talkMarrow();
        return;
      }
      if (atMouth) {
        cross(() => {
          if (locale === 'ashen-marrow') exitMarrow();
          else if (locale === 'concord-yard') exitYard();
          else if (locale === 'remnant-mark') exitMark();
          else if (locale === 'ash-nave') exitNave();
          else if (locale === 'watch-gallery') exitGallery();
          else if (locale === 'count-crypt') exitCrypt();
          else if (locale === 'first-breach') exitBreach();
          else if (locale === 'remnant-claim') exitClaim();
          else if (locale === 'aftermath') exitAftermath();
          else if (locale === 'marrow-pipe') exitPipe();
          else if (locale === 'engine-throat') exitThroat();
          else exitInterior();
        });
      }
      return;
    }
    const poolReady = nearPool && !nearPool.absorbed && !nearPool.bottled && !nearPool.withheld;
    if (poolReady || (nearPool && !nearDoor && !nearGate && !nearReturn)) {
      tryAbsorb();
      return;
    }
    if (nearDoor) {
      cross(() => enterInterior(nearDoor.id));
      return;
    }
    if (nearPorter) {
      talkPorter();
      return;
    }
    if (nearNotice) {
      talkNotice();
      return;
    }
    if (nearChest) {
      talkChest();
      return;
    }
    if (nearCord) {
      talkCord();
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
    pool.burst = 1;
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
    if (pool.concord && pool.id !== 'mark-weep') {
      seals.push({
        name: 'Cracked Well Seal',
        desc: 'Ashen Concord licence, split. Cracking it further in the open is how rot learns your name.',
      });
    }
    if (pool.id === 'mark-weep' && !seals.some((seal) => seal.name === 'Remnant Weep')) {
      seals.push({
        name: 'Remnant Weep',
        desc: 'Earth from the numbered pillar. The Prime Remnant is not this stone. The count will still write the mouth.',
      });
    }
    const levels = grantSparkXp(pool.xp);
    const gained = grantReadyMerges({ quiet: true });
    suppressEncountersUntil = performance.now() + 3400;
    let msg = pool.line + ' +' + pool.xp + ' XP. Strain ' + spark.strain + '/100.';
    if (over) msg += ' Beyond what she can hold — the excess scorches.';
    if (levels) msg += ' Spark level ' + spark.level + '. Capacity ' + spark.capacity + '.';
    msg += strainWarning(before) + bite;
    if (gained.length) msg += ' ' + gained.join(', ') + (gained.length === 1 ? ' stays' : ' stay') + ' on the magic list.';
    if (!seenBeats.fedOnce) {
      seenBeats.fedOnce = true;
      msg += ' Strain cuts her while it is high. A scar is a separate cut to max life. The kiln under the arch is the first that scars.';
    }
    if (pool.id === 'kiln' && addScar('kiln')) msg += scarDebtLine();
    if (pool.id === 'marrow-leak' && addScar('leak')) {
      if (marrowWord !== 'bank') marrowWord = 'fed';
      msg += scarDebtLine();
    }
    if (pool.id === 'yard-slag' && addScar('yard')) msg += scarDebtLine();
    if (pool.id === 'mark-weep' && addScar('mark')) msg += scarDebtLine();
    playSting();
    showToast(msg, seenBeats.fedOnce && msg.indexOf('A scar is a separate cut') >= 0 ? 7200 : 4600);
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

  function nearestMarrow() {
    if (!playerMesh || locale !== 'harbor-vault' || !seenBeats['bottle-hall'] || skyPass) return null;
    if (playerMesh.position.z > -13.2 || Math.abs(playerMesh.position.x) > 2.4) return null;
    return {
      title: 'Ashen Marrow',
      hint: 'The inland road. Press E to step onto the ash. The hall stays behind you until you walk back.',
    };
  }

  function nearestPipe() {
    if (!playerMesh || locale !== 'ashen-marrow' || skyPass) return null;
    if (Math.hypot(5.55 - playerMesh.position.x, -3.15 - playerMesh.position.z) > 1.65) return null;
    if (pipeWord === 'crack') {
      return {
        title: 'Engine pipe',
        hint: 'The feed is cracked. Press E. South of the iron is the ash.',
      };
    }
    if (pipeWord === 'leave') {
      return {
        title: 'Engine pipe',
        hint: 'The feed stayed corked. Press E if you mean to look again. The name is already in the pack.',
      };
    }
    return {
      title: 'Engine pipe',
      hint: 'A Concord pipe leaves the engine. Press E. The feed inside is a choice.',
    };
  }

  function nearestWorker() {
    if (!playerMesh || locale !== 'ashen-marrow' || skyPass) return null;
    if (Math.hypot(4.2 - playerMesh.position.x, 1.8 - playerMesh.position.z) > 1.7) return null;
    if (marrowWord === 'bank') {
      return {
        title: 'Concord tender',
        hint: 'She already banked the leak. The engine is still hungry. The hall is south.',
      };
    }
    if (scarMarks.leak) {
      return {
        title: 'Concord tender',
        hint: 'The leak is already in Lira. Press E. She cannot pull a mouthful back.',
      };
    }
    return {
      title: 'Concord tender',
      hint: scarDebt >= 2
      ? 'She can hear the cough. Press E. Banking eases one point. The leak is the other choice.'
      : 'She keeps the digest-engine fed. Press E. Banking eases one point of scar debt. The leak itself is the other choice.',
    };
  }

  function atInteriorExit() {
    if (!playerMesh || locale === 'field') return false;
    if (locale === 'ashen-marrow') return playerMesh.position.z > 4.15;
    if (locale === 'concord-yard') return playerMesh.position.z > 4.05;
    if (locale === 'remnant-mark') return playerMesh.position.z > 3.85;
    if (locale === 'ash-nave') return playerMesh.position.z > 3.7;
    if (locale === 'watch-gallery') return playerMesh.position.z > 2.65;
    if (locale === 'count-crypt') return playerMesh.position.z > 2.45;
    if (locale === 'first-breach') return playerMesh.position.z > 4.85;
    if (locale === 'remnant-claim') return playerMesh.position.z > 7.15;
    if (locale === 'aftermath') return playerMesh.position.z > 4.65;
    return playerMesh.position.z > 2.55;
  }

  function enterPipe() {
    if (locale !== 'ashen-marrow' || dialogueOpen || skyPass || encounterLocked) return;
    enterInterior('marrow-pipe');
    showToast('Iron. The harbor’s shortage has a throat.');
  }

  function exitPipe() {
    if (locale !== 'marrow-pipe' || !playerMesh || !marrowGroup) return;
    locale = 'ashen-marrow';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    marrowGroup.add(playerMesh);
    playerMesh.position.set(5.15, 0, -1.55);
    if (interiorGroup) interiorGroup.visible = false;
    if (pipeRoom) pipeRoom.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    marrowGroup.visible = true;
    placeFog('marrow');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Ashen Marrow';
    camera.position.set(5.15, CAMERA_HEIGHT, -1.55 + CAMERA_DIST);
    camera.lookAt(5.15, 1, -1.55);
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function updatePipeTrigger() {
    if (locale !== 'marrow-pipe' || !playerMesh || dialogueOpen || encounterLocked || skyPass) return;
    if (playerMesh.position.z > -1.2) pipeLatch = false;
    if (pipeWord || seenBeats['pipe-feed'] || pipeLatch) return;
    if (playerMesh.position.z > -2.35) return;
    pipeLatch = true;
    const fn = EW.scenes['pipe-feed'];
    if (typeof fn === 'function') fn();
  }

  function notePipe(id) {
    if (pipeWord) return;
    if (id !== 'crack') {
      pipeWord = 'leave';
      pipeFight = false;
      seenBeats['pipe-feed'] = true;
      if (!seals.some((seal) => seal.name === 'Named Feed')) {
        seals.push({
          name: 'Named Feed',
          desc: 'You left the engine pipe corked. The harbor’s shortage comes inland as hunger. It is a name in the pack, not a weapon.',
        });
      }
      showToast('You leave the feed corked. The engine keeps drinking. The name is in the pack.');
      refreshRumor();
      updateHUD();
      saveGame();
      return;
    }
    pipeFight = true;
  }

  function maybeStartPipeFight() {
    if (!pipeFight || pipeWord) return;
    pipeFight = false;
    beginScriptedFight(['stoker'], 'pipe-stoker');
  }

  function nearestThroat() {
    if (!playerMesh || locale !== 'ashen-marrow' || skyPass) return null;
    if (Math.hypot(0 - playerMesh.position.x, -4.25 - playerMesh.position.z) > 1.45) return null;
    if (throatWord === 'name') {
      return {
        title: 'Sealed throat',
        hint: 'The name is already in the spark. Press E if you mean to look at the glass again.',
      };
    }
    if (throatWord === 'cork') {
      return {
        title: 'Sealed throat',
        hint: 'The word stayed in the bottle. Press E if you mean to look again.',
      };
    }
    return {
      title: 'Sealed throat',
      hint: 'Behind the engine, a bottle the Concord could not drink. Press E. Naming it scars. Corking it leaves the word.',
    };
  }

  function enterThroat() {
    if (locale !== 'ashen-marrow' || dialogueOpen || skyPass || encounterLocked) return;
    enterInterior('engine-throat');
    showToast('The iron is warm. Something in the glass has a name.');
  }

  function exitThroat() {
    if (locale !== 'engine-throat' || !playerMesh || !marrowGroup) return;
    locale = 'ashen-marrow';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    marrowGroup.add(playerMesh);
    playerMesh.position.set(2.2, 0, -2.7);
    if (interiorGroup) interiorGroup.visible = false;
    if (throatRoom) throatRoom.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    marrowGroup.visible = true;
    placeFog('marrow');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Ashen Marrow';
    camera.position.set(2.2, CAMERA_HEIGHT, -2.7 + CAMERA_DIST);
    camera.lookAt(2.2, 1, -2.7);
    refreshRumor();
    updateHUD();
    saveGame();
    if (throatWord && !seenBeats['kestrel-marrow'] && !dialogueOpen) {
      const fn = EW.scenes['kestrel-marrow'];
      if (typeof fn === 'function') fn();
    }
  }

  function updateThroatTrigger() {
    if (locale !== 'engine-throat' || !playerMesh || dialogueOpen || encounterLocked || skyPass) return;
    if (playerMesh.position.z > -0.6) throatLatch = false;
    if (throatWord || seenBeats['throat-name'] || throatLatch) return;
    if (playerMesh.position.z > -1.7) return;
    throatLatch = true;
    const fn = EW.scenes['throat-name'];
    if (typeof fn === 'function') fn();
  }

  function noteThroat(id) {
    if (throatWord) return;
    const speak = id === 'name';
    throatWord = speak ? 'name' : 'cork';
    seenBeats['throat-name'] = true;
    if (speak) {
      addScar('throat-name', { quiet: true });
      applyStrain(8);
      if (!seals.some((seal) => seal.name === 'Spoken Name')) {
        seals.push({
          name: 'Spoken Name',
          desc: 'The word in the sealed bottle is in the spark now. It scarred. It is not a spell. The next stone is not on this shelf.',
        });
      }
      showToast('You speak the name. It scars.' + scarDebtLine());
    } else if (!seals.some((seal) => seal.name === 'Corked Name')) {
      seals.push({
        name: 'Corked Name',
        desc: 'The bottle behind the engine kept its word. You did not drink it. The scar did not take this one.',
      });
      showToast('You cork the name. The bottle keeps the word.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function noteKestrelMarrow(id) {
    if (kestrelMarrow) return;
    kestrelMarrow = id === 'ask' ? 'ask' : 'air';
    seenBeats['kestrel-marrow'] = true;
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function nearestStone() {
    if (!playerMesh || locale !== 'ashen-marrow' || skyPass) return null;
    if (Math.hypot(-5.4 - playerMesh.position.x, 0.15 - playerMesh.position.z) > 1.55) return null;
    return {
      title: 'Yard stone',
      hint: throatWord === 'name'
        ? 'The stone heard the name. Press E. The Concord yard is through it. Kestrel is not the road.'
        : 'A dark stone west of the engine. The yard is already leaking. Press E. The name is not required.',
    };
  }

  function nearestWarden() {
    if (!playerMesh || locale !== 'concord-yard' || skyPass) return null;
    if (Math.hypot(3.5 - playerMesh.position.x, 1.5 - playerMesh.position.z) > 1.6) return null;
    const pool = pools.find((p) => p.id === 'yard-slag');
    if (pool && pool.absorbed) {
      return { title: 'Yard warden', hint: 'He has your name. Press E. The slag is already in her.' };
    }
    if (pool && pool.bottled) {
      return { title: 'Yard warden', hint: 'The licence is on. Press E. The slag is quiet and still hungry.' };
    }
    return { title: 'Yard warden', hint: 'He keeps the books on the slag. Press E. Vesper is the one arguing.' };
  }

  function enterYard(opts) {
    const silent = opts && opts.silent;
    if (!yardGroup || !playerMesh) return;
    if (!silent && (locale !== 'ashen-marrow' || dialogueOpen || skyPass || encounterLocked)) return;
    locale = 'concord-yard';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    yardGroup.add(playerMesh);
    const px = silent && opts.pos && opts.pos.x != null ? opts.pos.x : 0;
    const pz = silent && opts.pos && opts.pos.z != null ? opts.pos.z : 3.2;
    playerMesh.position.set(px, 0, pz);
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    yardGroup.visible = true;
    placeFog('yard');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Concord Yard';
    camera.position.set(px, CAMERA_HEIGHT, pz + CAMERA_DIST);
    camera.lookAt(px, 1, pz);
    if (!silent) {
      seenBeats.yardStep = true;
      showToast('Concord yard. The stone carried you. Kestrel did not.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function exitYard() {
    if (locale !== 'concord-yard' || !playerMesh || !marrowGroup) return;
    locale = 'ashen-marrow';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    marrowGroup.add(playerMesh);
    playerMesh.position.set(-5.4, 0, 1.9);
    yardGroup.visible = false;
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    marrowGroup.visible = true;
    placeFog('marrow');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Ashen Marrow';
    camera.position.set(-5.4, CAMERA_HEIGHT, 1.9 + CAMERA_DIST);
    camera.lookAt(-5.4, 1, 1.9);
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function updateYardVesper() {
    if (locale !== 'concord-yard' || !playerMesh || dialogueOpen || skyPass || encounterLocked) return;
    if (seenBeats['yard-vesper']) return;
    const d = Math.hypot(-3.8 - playerMesh.position.x, -2.4 - playerMesh.position.z);
    if (d > 2.05) {
      yardLatch = false;
      return;
    }
    if (yardLatch) return;
    yardLatch = true;
    const fn = EW.scenes['yard-vesper'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'yard-vesper';
    }
  }

  function nearestMark() {
    if (!playerMesh || locale !== 'concord-yard' || skyPass) return null;
    if (Math.hypot(4.55 - playerMesh.position.x, -3.85 - playerMesh.position.z) > 1.4) return null;
    return {
      title: 'Remnant Mark',
      hint: seenBeats.markStep
        ? 'The pillar is through. Press E. It is a rumour with a stone, not the remnant. Kestrel is not the road.'
        : 'North of the yard, a stone the count could not cork. Press E. The Prime Remnant is not this pillar.',
    };
  }

  function enterMark(opts) {
    const silent = opts && opts.silent;
    if (!markGroup || !playerMesh) return;
    if (!silent && (locale !== 'concord-yard' || dialogueOpen || skyPass || encounterLocked)) return;
    locale = 'remnant-mark';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    markGroup.add(playerMesh);
    const px = silent && opts.pos && opts.pos.x != null ? opts.pos.x : 0;
    const pz = silent && opts.pos && opts.pos.z != null ? opts.pos.z : 3.15;
    playerMesh.position.set(px, 0, pz);
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    markGroup.visible = true;
    placeFog('mark');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Remnant Mark';
    camera.position.set(px, CAMERA_HEIGHT, pz + CAMERA_DIST);
    camera.lookAt(px, 1, pz);
    if (!silent) {
      seenBeats.markStep = true;
      showToast('The Remnant Mark. A pillar they numbered and could not cork. Kestrel did not carry you.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function exitMark() {
    if (locale !== 'remnant-mark' || !playerMesh || !yardGroup) return;
    locale = 'concord-yard';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    yardGroup.add(playerMesh);
    playerMesh.position.set(4.55, 0, -2.2);
    markGroup.visible = false;
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    yardGroup.visible = true;
    placeFog('yard');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Concord Yard';
    camera.position.set(4.55, CAMERA_HEIGHT, -2.2 + CAMERA_DIST);
    camera.lookAt(4.55, 1, -2.2);
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function updateMarkFight() {
    if (locale !== 'remnant-mark' || !playerMesh || dialogueOpen || encounterLocked || skyPass) return;
    if (seenBeats.markFight) return;
    if (playerMesh.position.z > 0.55) {
      markLatch = false;
      return;
    }
    if (markLatch) return;
    markLatch = true;
    beginScriptedFight(['counter'], 'mark-counter');
  }

  function updateMarkVesper() {
    if (locale !== 'remnant-mark' || !playerMesh || !seenBeats.markFight || dialogueOpen || encounterLocked || skyPass) return;
    if (seenBeats['mark-vesper']) return;
    const d = Math.hypot(-2.4 - playerMesh.position.x, -2.55 - playerMesh.position.z);
    if (d > 2.1) {
      markTalk = false;
      return;
    }
    if (markTalk) return;
    markTalk = true;
    const fn = EW.scenes['mark-vesper'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'mark-vesper';
    }
  }

  function noteMark(id) {
    if (markWord) return;
    const pool = pools.find((p) => p.id === 'mark-weep');
    seenBeats['mark-vesper'] = true;
    if (id === 'seal') {
      markWord = 'seal';
      if (pool && !pool.absorbed) bottlePool('mark-weep');
      if (!seals.some((seal) => seal.name === 'Counted Mouth')) {
        seals.push({
          name: 'Counted Mouth',
          desc: 'The Concord numbered the weep at the Remnant Mark. You left it. The pillar is not the Prime Remnant. The count is still hungry.',
        });
      }
      showToast('You let them number the weep. The pillar stays. The remnant is not here.');
    } else {
      markWord = 'drink';
      showToast('The weep stays a mouth. Drink it. She will not step into Lira to take it.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function nearestNave() {
    if (!playerMesh || locale !== 'remnant-mark' || skyPass) return null;
    if (Math.hypot(0 - playerMesh.position.x, -3.65 - playerMesh.position.z) > 1.3) return null;
    if (!seenBeats.markFight) {
      return {
        title: 'Ash road',
        hint: 'The counter is still on the road. The cathedral door is not this stone.',
      };
    }
    return {
      title: 'Ash nave',
      hint: seenBeats.naveStep
        ? 'The sealed cathedral is through. Press E. The door does not open. Kestrel is not the road.'
        : 'North of the pillar, the road goes on. Press E. You will see the door. You will not pass it.',
    };
  }

  function enterNave(opts) {
    const silent = opts && opts.silent;
    if (!naveGroup || !playerMesh) return;
    if (!silent && (locale !== 'remnant-mark' || !seenBeats.markFight || dialogueOpen || skyPass || encounterLocked)) return;
    locale = 'ash-nave';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    naveGroup.add(playerMesh);
    const px = silent && opts.pos ? (opts.pos.x || 0) : 0;
    const pz = silent && opts.pos ? (opts.pos.z == null ? 3.05 : opts.pos.z) : 3.05;
    playerMesh.position.set(px, 0, pz);
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    naveGroup.visible = true;
    placeFog('nave');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Ash Nave';
    camera.position.set(px, CAMERA_HEIGHT, pz + CAMERA_DIST);
    camera.lookAt(px, 1.4, pz);
    if (!silent) {
      seenBeats.naveStep = true;
      showToast('Ash nave. The cathedral is ahead and sealed. Kestrel did not carry you.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function exitNave() {
    if (locale !== 'ash-nave' || !playerMesh || !markGroup) return;
    locale = 'remnant-mark';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    markGroup.add(playerMesh);
    playerMesh.position.set(0, 0, -2.15);
    naveGroup.visible = false;
    if (galleryGroup) galleryGroup.visible = false;
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    markGroup.visible = true;
    placeFog('mark');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Remnant Mark';
    camera.position.set(0, CAMERA_HEIGHT, -2.15 + CAMERA_DIST);
    camera.lookAt(0, 1, -2.15);
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function updateNaveGate() {
    if (locale !== 'ash-nave' || !playerMesh || dialogueOpen || encounterLocked || skyPass) return;
    if (naveWord || seenBeats['nave-gate']) return;
    if (playerMesh.position.z > -1.35 || Math.abs(playerMesh.position.x) > 2.2) {
      naveLatch = false;
      return;
    }
    if (naveLatch) return;
    naveLatch = true;
    const fn = EW.scenes['nave-gate'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'nave-gate';
    }
  }

  function noteNave(id) {
    if (naveWord) return;
    seenBeats['nave-gate'] = true;
    if (id === 'name') {
      naveWord = 'name';
      addScar('nave', { quiet: true });
      if (!seals.some((seal) => seal.name === 'Named Hinge')) {
        seals.push({
          name: 'Named Hinge',
          desc: 'You put a mouth on the sealed cathedral door. It did not open. The Prime Remnant is behind the bar. The road has your name now.',
        });
      }
      showToast('You name the hinge. The door stays shut. The road has your mouth on it.' + scarDebtLine());
    } else {
      naveWord = 'turn';
      if (!seals.some((seal) => seal.name === 'Sealed Nave')) {
        seals.push({
          name: 'Sealed Nave',
          desc: 'You saw the ash cathedral and left the bar. The Prime Remnant is behind it. You did not name the hinge.',
        });
      }
      showToast('You leave the seal. The cathedral stays. The door was never going to open today.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function nearestGallery() {
    if (!playerMesh || locale !== 'ash-nave' || skyPass) return null;
    if (Math.hypot(3.55 - playerMesh.position.x, 0.15 - playerMesh.position.z) > 1.2) return null;
    return {
      title: 'Watch gallery',
      hint: galleryWord
        ? 'The count is on the page. The stair under it goes down. Press E. The cathedral bar stays shut.'
        : 'East of the bar, the Concord keeps a ledger. Press E. You will read a number. The stair stays shut until then.',
    };
  }

  function nearestStair() {
    if (!playerMesh || locale !== 'watch-gallery' || skyPass) return null;
    if (playerMesh.position.z > -1.7 || Math.abs(playerMesh.position.x) > 1.5) return null;
    return {
      title: 'Count-stair',
      hint: galleryWord
        ? 'The grate is up. Press E. One room under Licence Zero. The cathedral does not open.'
        : 'A grate. The stair under Licence Zero stays shut until the count is made. Press E to look.',
    };
  }

  function nearestCrack() {
    if (!playerMesh || locale !== 'count-crypt' || !cryptWord || skyPass) return null;
    if (playerMesh.position.z > -1.25 || Math.abs(playerMesh.position.x) > 1.35) return null;
    const open = cryptWord === 'digit';
    return {
      title: open ? 'The breach' : 'The crack',
      open: open,
      hint: open
        ? 'Cracked Zero widened the stone. Press E. One room of the remnant. The cathedral bar stays shut.'
        : cryptWord === 'mouth'
          ? 'The scar breathes. Cracked Zero was the digit that widens this. Press E to look.'
          : 'You left the light. A pressed digit would widen it. Press E to look.',
    };
  }

  function nearestKestrel() {
    if (!playerMesh || locale !== 'ash-nave' || skyPass || kestrelNave || !seenBeats['nave-fly']) return null;
    if (Math.hypot(0 - playerMesh.position.x, 1.8 - playerMesh.position.z) > 1.35) return null;
    return {
      title: 'The crossing',
      hint: 'She crossed and did not land. Press E if you mean to ask. The answer is still no.',
    };
  }

  function enterGallery(opts) {
    const silent = opts && opts.silent;
    if (!galleryGroup || !playerMesh || !naveGroup) return;
    if (!silent && (locale !== 'ash-nave' || dialogueOpen || skyPass || encounterLocked)) return;
    locale = 'watch-gallery';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    galleryGroup.add(playerMesh);
    const px = silent && opts.pos ? (opts.pos.x || 0) : 0;
    const pz = silent && opts.pos ? (opts.pos.z == null ? 2.2 : opts.pos.z) : 2.2;
    playerMesh.position.set(px, 0, pz);
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    galleryGroup.visible = true;
    placeFog('gallery');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Watch Gallery';
    camera.position.set(px, CAMERA_HEIGHT, pz + CAMERA_DIST);
    camera.lookAt(px, 1.2, pz);
    if (!silent) {
      seenBeats.gallery = true;
      showToast(galleryWord
        ? 'Watch gallery. The grate is up. The stair goes down. Kestrel did not carry you.'
        : 'Watch gallery. The ledger is ahead. The stair stays shut until the count is made.');
    }
    syncGrate();
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function exitGallery() {
    if (locale !== 'watch-gallery' || !playerMesh || !naveGroup) return;
    locale = 'ash-nave';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    naveGroup.add(playerMesh);
    playerMesh.position.set(2.2, 0, 0.15);
    if (galleryGroup) galleryGroup.visible = false;
    if (cryptGroup) cryptGroup.visible = false;
    if (breachGroup) breachGroup.visible = false;
    naveGroup.visible = true;
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    placeFog('nave');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Ash Nave';
    camera.position.set(2.2, CAMERA_HEIGHT, 0.15 + CAMERA_DIST);
    camera.lookAt(2.2, 1.2, 0.15);
    if (galleryWord && !seenBeats['nave-fly']) {
      kestrelFly = 0.01;
      seenBeats['nave-fly'] = true;
      if (naveGroup.userData.bird) {
        naveGroup.userData.bird.visible = true;
        naveGroup.userData.bird.position.set(-8, 3.8, -0.6);
      }
      showToast('A bird crosses the nave and does not land. Kestrel is not the company.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function lookStair() {
    showToast(galleryWord
      ? 'The grate is up. The stair goes down. The cathedral bar stays shut.'
      : 'The count-stair is grated and shut. Make the count first. The cathedral bar stays shut.');
  }

  function syncGrate() {
    const grate = galleryGroup && galleryGroup.userData.grate;
    if (!grate) return;
    grate.position.y = galleryWord ? 2.05 : 0.95;
    grate.rotation.z = galleryWord ? -0.55 : 0;
  }

  function syncCryptCrack() {
    if (!cryptGroup || !cryptGroup.userData.crack) return;
    const open = cryptWord === 'digit' || cryptWord === 'mouth';
    cryptGroup.userData.crack.intensity = open ? 1.55 : cryptWord === 'leave' ? 0.55 : 0.32;
    cryptGroup.userData.crack.color.setHex(cryptWord === 'mouth' ? 0xff3a18 : 0xff6a2a);
    if (cryptGroup.userData.watcher) cryptGroup.userData.watcher.visible = true;
  }

  function enterCrypt(opts) {
    const silent = opts && opts.silent;
    if (!cryptGroup || !galleryGroup || !playerMesh) return;
    if (!silent && (locale !== 'watch-gallery' || !galleryWord || dialogueOpen || skyPass || encounterLocked)) return;
    locale = 'count-crypt';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    cryptGroup.add(playerMesh);
    const px = silent && opts.pos ? (opts.pos.x || 0) : 0;
    const pz = silent && opts.pos ? (opts.pos.z == null ? 1.85 : opts.pos.z) : 1.85;
    playerMesh.position.set(px, 0, pz);
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    cryptGroup.visible = true;
    placeFog('crypt');
    syncCryptCrack();
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Count Crypt';
    camera.position.set(px, CAMERA_HEIGHT, pz + CAMERA_DIST);
    camera.lookAt(px, 1.2, pz);
    if (!silent) {
      seenBeats.cryptStep = true;
      showToast('Count crypt. The ledger is ahead. The remnant is a crack, not a door. Kestrel did not carry you.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function exitCrypt() {
    if (locale !== 'count-crypt' || !playerMesh || !galleryGroup) return;
    locale = 'watch-gallery';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    galleryGroup.add(playerMesh);
    playerMesh.position.set(0, 0, -1.15);
    if (cryptGroup) cryptGroup.visible = false;
    if (breachGroup) breachGroup.visible = false;
    galleryGroup.visible = true;
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    if (naveGroup) naveGroup.visible = false;
    placeFog('gallery');
    syncGrate();
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Watch Gallery';
    camera.position.set(0, CAMERA_HEIGHT, -1.15 + CAMERA_DIST);
    camera.lookAt(0, 1.2, -1.15);
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function lookCrack() {
    showToast(cryptWord === 'mouth'
      ? 'The scar breathes in the crack. It is not Cracked Zero. The stone does not widen. The bar stays shut.'
      : 'You left this light. Pressing a digit would have opened the first breach. It stays a rumour.');
  }

  function syncBreachLight() {
    if (!breachGroup || !breachGroup.userData.shafts) return;
    const hot = breachWord === 'hold' || breachWord === 'mouth';
    breachGroup.userData.shafts.forEach((light, i) => {
      light.intensity = hot ? 1.75 : breachWord === 'back' ? 0.65 : 1.05;
      if (i === 1) light.color.setHex(breachWord === 'mouth' ? 0xff3a18 : 0xff6a2a);
    });
  }

  function enterBreach(opts) {
    const silent = opts && opts.silent;
    if (!breachGroup || !cryptGroup || !playerMesh) return;
    if (!silent && (locale !== 'count-crypt' || cryptWord !== 'digit' || dialogueOpen || skyPass || encounterLocked)) return;
    locale = 'first-breach';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    breachGroup.add(playerMesh);
    const px = silent && opts.pos ? (opts.pos.x || 0) : 0;
    const pz = silent && opts.pos ? (opts.pos.z == null ? 4.35 : opts.pos.z) : 4.35;
    playerMesh.position.set(px, 0, pz);
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    breachGroup.visible = true;
    placeFog('breach');
    syncBreachLight();
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'First Breach';
    camera.position.set(px, CAMERA_HEIGHT, pz + CAMERA_DIST);
    camera.lookAt(px, 1.6, pz);
    if (!silent) {
      seenBeats.breachStep = true;
      showToast('First breach. A Concord last stand is ahead. The light is not a door. Kestrel did not carry you.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function exitBreach() {
    if (locale !== 'first-breach' || !playerMesh || !cryptGroup) return;
    locale = 'count-crypt';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    cryptGroup.add(playerMesh);
    playerMesh.position.set(0, 0, -0.15);
    if (breachGroup) breachGroup.visible = false;
    cryptGroup.visible = true;
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (naveGroup) naveGroup.visible = false;
    if (galleryGroup) galleryGroup.visible = false;
    placeFog('crypt');
    syncCryptCrack();
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Count Crypt';
    camera.position.set(0, CAMERA_HEIGHT, -0.15 + CAMERA_DIST);
    camera.lookAt(0, 1.2, -0.15);
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function updateBreachFight() {
    if (locale !== 'first-breach' || !playerMesh || dialogueOpen || encounterLocked || skyPass) return;
    if (seenBeats.breachFight) return;
    if (playerMesh.position.z > 1.6) {
      breachLatch = false;
      return;
    }
    if (breachLatch) return;
    breachLatch = true;
    beginScriptedFight(['captain', 'scribe'], 'breach-stand');
  }

  function updateBreachVesper() {
    if (locale !== 'first-breach' || !playerMesh || !seenBeats.breachFight || dialogueOpen || encounterLocked || skyPass) return;
    if (breachWord || seenBeats['breach-threshold']) return;
    if (playerMesh.position.z > -3.2 || Math.abs(playerMesh.position.x) > 2.2) {
      breachTalk = false;
      return;
    }
    if (breachTalk) return;
    breachTalk = true;
    const fn = EW.scenes['breach-threshold'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'breach-threshold';
    }
  }

  function noteBreach(id) {
    if (breachWord) return;
    seenBeats['breach-threshold'] = true;
    if (id === 'mouth') {
      breachWord = 'mouth';
      addScar('breach', { quiet: true });
      if (!seals.some((seal) => seal.name === 'Scarred Threshold')) {
        seals.push({
          name: 'Scarred Threshold',
          desc: 'You set a mouth on the light past Cracked Zero. The scar took the step. The cathedral bar stayed shut. Vesper did not enter the host.',
        });
      }
      showToast('You set a mouth on the light. The scar takes the step. The bar stays shut.' + scarDebtLine());
    } else if (id === 'back') {
      breachWord = 'back';
      if (!seals.some((seal) => seal.name === 'Seen Threshold')) {
        seals.push({
          name: 'Seen Threshold',
          desc: 'You walked the first breach and stepped back from the light. No new scar. The cathedral bar stayed shut.',
        });
      }
      showToast('You step back. The room stays. The remnant is closer and still not yours.');
    } else {
      breachWord = 'hold';
      if (!seals.some((seal) => seal.name === 'Held Threshold')) {
        seals.push({
          name: 'Held Threshold',
          desc: 'You held the first breach under Licence Zero. North, past the bar, is the remnant claim. The ending is not written. Vesper did not enter the host.',
        });
      }
      showToast('Held Threshold. North, past the bar, is the remnant claim. It is not the ending.');
    }
    syncBreachLight();
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function nearestBar() {
    if (!playerMesh || locale !== 'first-breach' || !breachWord || skyPass) return null;
    if (playerMesh.position.z > -3.2 || Math.abs(playerMesh.position.x) > 2.2) return null;
    const open = breachWord === 'hold';
    return {
      title: open ? 'Past the bar' : 'The bar',
      open: open,
      hint: open
        ? 'Held Threshold. Press E. The nave interior is the claim, not the ending.'
        : breachWord === 'mouth'
          ? 'The scar breathed. Held Threshold is what opens the bar. Press E to look.'
          : 'You stepped back. Holding the threshold opens the bar. Press E to look.',
    };
  }

  function nearestPerch() {
    if (!playerMesh || locale !== 'remnant-claim' || !seenBeats.claimFight || kestrelClaim || skyPass) return null;
    if (Math.hypot(playerMesh.position.x, playerMesh.position.z - 0.2) > 2.1) return null;
    return {
      title: 'Kestrel',
      hint: 'She is on the rib, not in the pack. Press E. Landing is not a joining.',
    };
  }

  function lookBar() {
    showToast(breachWord === 'mouth'
      ? 'The scar opened a breath, not the bar. Held Threshold is the step past it.'
      : 'You stepped back from the light. Holding the threshold is what opens the bar.');
  }

  function syncClaimLight() {
    if (!claimGroup || !claimGroup.userData.shafts) return;
    const hot = claimWord === 'claim' || claimWord === 'share';
    claimGroup.userData.shafts.forEach((light, i) => {
      light.intensity = claimWord === 'burn' ? 1.9 : hot ? 1.55 : claimWord === 'refuse' ? 0.55 : 1.05;
      if (i === 2) light.color.setHex(claimWord === 'burn' ? 0xff2a10 : 0xff5a28);
    });
    if (claimGroup.userData.landed) claimGroup.userData.landed.visible = kestrelClaim === 'land';
  }

  function enterClaim(opts) {
    const silent = opts && opts.silent;
    if (!claimGroup || !breachGroup || !playerMesh) return;
    if (!silent && (locale !== 'first-breach' || breachWord !== 'hold' || dialogueOpen || skyPass || encounterLocked)) return;
    locale = 'remnant-claim';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    claimGroup.add(playerMesh);
    const px = silent && opts.pos ? (opts.pos.x || 0) : 0;
    const pz = silent && opts.pos ? (opts.pos.z == null ? 6.4 : opts.pos.z) : 6.4;
    playerMesh.position.set(px, 0, pz);
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    claimGroup.visible = true;
    placeFog('claim');
    syncClaimLight();
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Remnant Claim';
    camera.position.set(px, CAMERA_HEIGHT, pz + CAMERA_DIST);
    camera.lookAt(px, 2.2, pz);
    if (!silent) {
      seenBeats.claimStep = true;
      showToast('Past the bar. A last rite is ahead. The mass is not a licence. Kestrel did not carry you.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function exitClaim() {
    if (locale !== 'remnant-claim' || !playerMesh || !breachGroup) return;
    locale = 'first-breach';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    breachGroup.add(playerMesh);
    playerMesh.position.set(0, 0, -1.05);
    if (claimGroup) claimGroup.visible = false;
    breachGroup.visible = true;
    if (interiorGroup) interiorGroup.visible = false;
    if (naveGroup) naveGroup.visible = false;
    if (cryptGroup) cryptGroup.visible = false;
    if (galleryGroup) galleryGroup.visible = false;
    placeFog('breach');
    syncBreachLight();
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'First Breach';
    camera.position.set(0, CAMERA_HEIGHT, -1.05 + CAMERA_DIST);
    camera.lookAt(0, 1.4, -1.05);
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function updateClaimFight() {
    if (locale !== 'remnant-claim' || !playerMesh || dialogueOpen || encounterLocked || skyPass) return;
    if (seenBeats.claimFight || claimWord) return;
    if (playerMesh.position.z > 2.4 || Math.abs(playerMesh.position.x) > 3.2) {
      claimLatch = false;
      return;
    }
    if (claimLatch) return;
    claimLatch = true;
    riteTorn = false;
    beginScriptedFight(['celebrant'], 'claim-rite');
  }

  function updateClaimVesper() {
    if (locale !== 'remnant-claim' || !playerMesh || !seenBeats.claimFight || dialogueOpen || encounterLocked || skyPass) return;
    if (claimWord || seenBeats['claim-approach']) return;
    if (playerMesh.position.z > -4.6 || Math.abs(playerMesh.position.x) > 2.8) {
      claimTalk = false;
      return;
    }
    if (claimTalk) return;
    claimTalk = true;
    const fn = EW.scenes['claim-approach'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'claim-approach';
    }
  }

  function noteClaim(id) {
    if (claimWord) return;
    seenBeats['claim-approach'] = true;
    if (id === 'refuse') {
      claimWord = 'refuse';
      if (!seals.some((seal) => seal.name === 'Refused Remnant')) {
        seals.push({
          name: 'Refused Remnant',
          desc: 'You refused the Prime Remnant past the bar. The room stays. North is the aftermath. Vesper did not enter the host.',
        });
      }
      showToast('You refuse the remnant. North is the aftermath.');
    } else if (id === 'share') {
      claimWord = 'share';
      if (!seals.some((seal) => seal.name === 'Shared Remnant')) {
        seals.push({
          name: 'Shared Remnant',
          desc: 'You offered the remnant to both sparks. Vesper did not step into Lira. North is the aftermath.',
        });
      }
      showToast('You offer the light to both sparks. She does not enter the host. North is the aftermath.');
    } else if (id === 'burn') {
      claimWord = 'burn';
      addScar('claim', { quiet: true });
      if (!seals.some((seal) => seal.name === 'Burned Claim')) {
        seals.push({
          name: 'Burned Claim',
          desc: 'You set the rite’s ash against the remnant. The scar took it. North is the aftermath. Vesper did not enter the host.',
        });
      }
      showToast('You burn the claim. The scar takes the ash.' + scarDebtLine() + ' North is the aftermath.');
    } else {
      claimWord = 'claim';
      if (!seals.some((seal) => seal.name === 'Remnant Claim')) {
        seals.push({
          name: 'Remnant Claim',
          desc: 'The spark named the Prime Remnant hers. Lira is still the host. North is the aftermath. Vesper did not enter.',
        });
      }
      showToast('The spark claims the remnant. Lira is still the host. North is the aftermath.');
    }
    syncClaimLight();
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function talkKestrelClaim() {
    if (locale !== 'remnant-claim' || dialogueOpen || kestrelClaim || !seenBeats.claimFight) return;
    const fn = EW.scenes['claim-kestrel'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'claim-kestrel';
    }
  }

  function noteKestrelClaim(id) {
    if (kestrelClaim) return;
    kestrelClaim = id === 'land' ? 'land' : 'air';
    seenBeats['claim-kestrel'] = true;
    syncClaimLight();
    showToast(kestrelClaim === 'land'
      ? 'She lands on the stone. She is still not in the pack.'
      : 'You leave her the rib. She does not join.');
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function creditsCovering() {
    return !!(creditsFromRun && creditsScreen && !creditsScreen.classList.contains('hidden'));
  }

  function nearestEnd() {
    if (!playerMesh || locale !== 'remnant-claim' || !claimWord || skyPass) return null;
    if (playerMesh.position.z > -4.6 || Math.abs(playerMesh.position.x) > 2.8) return null;
    return {
      title: 'The aftermath',
      hint: 'The flag is set. Press E. North writes the ending.',
    };
  }

  function nearestCredits() {
    if (!playerMesh || locale !== 'aftermath' || skyPass) return null;
    if (playerMesh.position.z > -2.15 || Math.abs(playerMesh.position.x) > 2.4) return null;
    return {
      title: 'Credits',
      hint: 'The ending is written. Press E. Return brings you back to this room.',
    };
  }

  function syncAftermath() {
    if (!scene || !scene.fog) return;
    const word = claimWord === 'refuse' || claimWord === 'share' || claimWord === 'burn' ? claimWord : 'claim';
    const table = {
      claim: { fog: 0x1a1008, near: 8, far: 28, amb: 0x3a2414, ambI: 0.5, hemi: 0xc08040, core: 0xffc080, twin: 0xffe0a0, ring: 0x2a140c, shaft: 0xffe0a0, shaftI: 1.35, rot: 0x3a5a32, rotOp: 0.38, banner: 0x3a2418 },
      refuse: { fog: 0x0c1014, near: 7, far: 24, amb: 0x141820, ambI: 0.2, hemi: 0x304058, core: 0x3a3028, twin: 0x304058, ring: 0xffe2b0, shaft: 0x8aa4c0, shaftI: 0.42, rot: 0x3a2438, rotOp: 0.55, banner: 0xc4a060 },
      share: { fog: 0x180e14, near: 8, far: 26, amb: 0x2a1828, ambI: 0.36, hemi: 0x8060a0, core: 0xffb060, twin: 0xc080ff, ring: 0xd0a0ff, shaft: 0xffc0e0, shaftI: 1.05, rot: 0x5a4060, rotOp: 0.32, banner: 0x8060a0 },
      burn: { fog: 0x100604, near: 6, far: 22, amb: 0x1a0806, ambI: 0.16, hemi: 0x401008, core: 0xff2a10, twin: 0x3a1008, ring: 0x140806, shaft: 0xff3018, shaftI: 1.65, rot: 0x1a0806, rotOp: 0.72, banner: 0x1a0808 },
    };
    const look = table[word];
    scene.fog.color.setHex(look.fog);
    scene.fog.near = look.near;
    scene.fog.far = look.far;
    if (renderer) renderer.setClearColor(look.fog);
    if (!aftermathGroup) return;
    const data = aftermathGroup.userData;
    if (data.amb) {
      data.amb.color.setHex(look.amb);
      data.amb.intensity = look.ambI;
    }
    if (data.hemi) data.hemi.color.setHex(look.hemi);
    if (data.core) {
      data.core.material.color.setHex(look.core);
      data.core.position.set(word === 'share' ? -0.45 : 0, word === 'burn' ? 1.55 : 2.05, -2.65);
      data.core.scale.setScalar(word === 'burn' ? 0.72 : 1);
    }
    if (data.twin) {
      data.twin.visible = word === 'share';
      data.twin.material.color.setHex(look.twin);
    }
    if (data.ring) {
      data.ring.material.color.setHex(look.ring);
      data.ring.material.opacity = 1;
      data.ring.rotation.z = word === 'claim' ? 0.55 : word === 'burn' ? 0.2 : 0;
      data.ring.scale.setScalar(word === 'claim' ? 1.2 : word === 'burn' ? 0.85 : 1);
      data.ring.position.y = word === 'burn' ? 1.55 : 2.05;
    }
    if (data.rot && data.rot.material) {
      data.rot.material.color.setHex(look.rot);
      data.rot.material.opacity = look.rotOp;
    }
    if (data.shafts) {
      data.shafts.forEach((light, i) => {
        light.color.setHex(word === 'share' && i === 1 ? 0xc080ff : look.shaft);
        light.intensity = look.shaftI * (i === 2 ? 0.7 : 1);
      });
    }
    if (data.shaftPlanes) {
      data.shaftPlanes.forEach((plane, i) => {
        plane.material.color.setHex(word === 'share' && i === 1 ? 0xc080ff : look.shaft);
        plane.material.opacity = word === 'refuse' ? 0.08 : 0.22;
      });
    }
    if (data.plaques) {
      Object.keys(data.plaques).forEach((key) => {
        data.plaques[key].visible = key === word;
      });
      if (word === 'burn' && data.plaques.burn && data.plaques.burn.userData.retitle) {
        data.plaques.burn.userData.retitle('THE BURN', ['Scar echo', 'Debt ' + scarDebt, '−' + (scarDebt * SCAR_CUT) + ' HP']);
      }
    }
    if (data.vesper) {
      const spot = word === 'share' ? [2.15, -2.15] : word === 'refuse' ? [-3.35, -2.05] : word === 'burn' ? [-3.15, -0.35] : [-3.05, -1.1];
      data.vesper.position.x = spot[0];
      data.vesper.position.z = spot[1];
    }
    if (data.banner) {
      data.banner.material.color.setHex(look.banner);
      data.banner.rotation.z = word === 'claim' || word === 'burn' ? 1.05 : 0.04;
      data.banner.position.y = word === 'burn' ? 0.55 : 1.85;
    }
    if (data.clerk) {
      data.clerk.rotation.z = word === 'burn' ? 1.3 : 0;
      data.clerk.position.y = word === 'burn' ? 0.2 : 0;
    }
    if (data.landed) data.landed.visible = kestrelClaim === 'land';
    if (data.images) {
      Object.keys(data.images).forEach((key) => {
        data.images[key].visible = key === word;
      });
    }
  }

  function playAftermathScene() {
    if (seenBeats.aftermath || dialogueOpen) return;
    const fn = EW.scenes.aftermath;
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'aftermath';
      else seenBeats.aftermath = true;
    } else seenBeats.aftermath = true;
  }

  function enterAftermath(opts) {
    const silent = opts && opts.silent;
    if (!aftermathGroup || !claimGroup || !playerMesh) return;
    if (!silent && (locale !== 'remnant-claim' || !claimWord || dialogueOpen || skyPass || encounterLocked)) return;
    locale = 'aftermath';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    aftermathGroup.add(playerMesh);
    const px = silent && opts.pos && opts.pos.x != null ? opts.pos.x : 0;
    const pz = silent && opts.pos && opts.pos.z != null ? opts.pos.z : 3.35;
    playerMesh.position.set(px, 0, pz);
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    aftermathGroup.visible = true;
    placeFog('aftermath');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Aftermath';
    camera.position.set(px, CAMERA_HEIGHT, pz + CAMERA_DIST);
    camera.lookAt(px, 1.8, pz);
    seenBeats.endStep = true;
    if (!silent) {
      showToast(claimWord === 'burn'
        ? 'Aftermath. The scar is the echo.' + scarDebtLine()
        : claimWord === 'refuse'
          ? 'Aftermath. Her name stayed. Licence Zero stayed.'
          : claimWord === 'share'
            ? 'Aftermath. Two sparks. The page cannot hold both.'
            : 'Aftermath. She still wears it. The licence has no number for this.');
    }
    if (!seenBeats.aftermath) playAftermathScene();
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function exitAftermath() {
    if (locale !== 'aftermath' || !playerMesh || !claimGroup) return;
    locale = 'remnant-claim';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    claimGroup.add(playerMesh);
    playerMesh.position.set(0, 0, -2.4);
    if (aftermathGroup) aftermathGroup.visible = false;
    claimGroup.visible = true;
    if (interiorGroup) interiorGroup.visible = false;
    if (naveGroup) naveGroup.visible = false;
    if (breachGroup) breachGroup.visible = false;
    if (cryptGroup) cryptGroup.visible = false;
    if (galleryGroup) galleryGroup.visible = false;
    placeFog('claim');
    syncClaimLight();
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Remnant Claim';
    camera.position.set(0, CAMERA_HEIGHT, -2.4 + CAMERA_DIST);
    camera.lookAt(0, 1.8, -2.4);
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function openRunCredits() {
    if (locale !== 'aftermath' || dialogueOpen || encounterLocked) return;
    creditsFromRun = true;
    if (titleScreen) titleScreen.classList.add('hidden');
    creditsScreen.classList.remove('hidden');
    saveGame();
  }

  function updateCryptFight() {
    if (locale !== 'count-crypt' || !playerMesh || dialogueOpen || encounterLocked || skyPass) return;
    if (seenBeats.cryptFight) return;
    if (playerMesh.position.z > 0.85) {
      cryptLatch = false;
      return;
    }
    if (cryptLatch) return;
    cryptLatch = true;
    beginScriptedFight(['auditor'], 'crypt-auditor');
  }

  function updateCryptVesper() {
    if (locale !== 'count-crypt' || !playerMesh || !seenBeats.cryptFight || dialogueOpen || encounterLocked || skyPass) return;
    if (cryptWord || seenBeats['crypt-crack']) return;
    if (playerMesh.position.z > -0.85 || Math.abs(playerMesh.position.x) > 1.5) {
      cryptTalk = false;
      return;
    }
    if (cryptTalk) return;
    cryptTalk = true;
    const fn = EW.scenes['crypt-crack'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'crypt-crack';
    }
  }

  function thinSeal(name, extra) {
    seals.forEach((seal) => {
      if (seal.name === name && seal.desc.indexOf(extra.slice(0, 24)) < 0) seal.desc += extra;
    });
  }

  function noteCrypt(id) {
    if (cryptWord) return;
    seenBeats['crypt-crack'] = true;
    const hasFeed = seals.some((seal) => seal.name === 'Named Feed');
    const hasPass = seals.some((seal) => seal.name === 'Unwritten Passage');
    if (id === 'digit' && (hasFeed || hasPass)) {
      cryptWord = 'digit';
      if (hasFeed) {
        feedSpent = true;
        thinSeal('Named Feed', ' Pressed into the crypt crack. The name is thinner. It is still in the pack, and it is still not a weapon.');
      }
      if (hasPass) {
        passageLaid = true;
        thinSeal('Unwritten Passage', ' Laid on the crypt crack. It is still in the pack. It is still not a key.');
      }
      if (!seals.some((seal) => seal.name === 'Cracked Zero')) {
        seals.push({
          name: 'Cracked Zero',
          desc: 'A digit of Licence Zero was pressed into the crypt crack. The remnant showed through. The names stayed in the pack. The cathedral bar stayed shut.',
        });
      }
      showToast('The digit goes into the crack. The remnant shows. The names stay in the pack. The cathedral bar stays shut.');
    } else if (id === 'mouth') {
      cryptWord = 'mouth';
      addScar('crypt', { quiet: true });
      if (!seals.some((seal) => seal.name === 'Scarred Crack')) {
        seals.push({
          name: 'Scarred Crack',
          desc: 'You put a mouth on the crack under Licence Zero. The scar took the digit. The cathedral bar stayed shut. Vesper did not enter the host.',
        });
      }
      showToast('You put a mouth on the crack. The remnant breathes. The bar stays shut.' + scarDebtLine());
    } else {
      cryptWord = 'leave';
      if (!seals.some((seal) => seal.name === 'Counted Crack')) {
        seals.push({
          name: 'Counted Crack',
          desc: 'You saw the remnant through the crack under Licence Zero and left it. No new scar. The cathedral bar stayed shut.',
        });
      }
      showToast('You leave the crack. It stays a light in the stone. The cathedral does not open.');
    }
    syncCryptCrack();
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function updateGalleryLedger() {
    if (locale !== 'watch-gallery' || !playerMesh || dialogueOpen || encounterLocked || skyPass) return;
    if (galleryWord || seenBeats['gallery-count']) return;
    if (playerMesh.position.z > 0.2 || Math.abs(playerMesh.position.x) > 1.6) {
      galleryLatch = false;
      return;
    }
    if (galleryLatch) return;
    galleryLatch = true;
    const fn = EW.scenes['gallery-count'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'gallery-count';
    }
  }

  function noteGallery(id) {
    if (galleryWord) return;
    seenBeats['gallery-count'] = true;
    seenBeats.gallery = true;
    const hasFeed = seals.some((seal) => seal.name === 'Named Feed');
    const hasPass = seals.some((seal) => seal.name === 'Unwritten Passage');
    if (id === 'read') {
      galleryWord = 'read';
      if (hasFeed) feedNoted = true;
      if (hasPass) passageNoted = true;
      seals.forEach((seal) => {
        if (seal.name === 'Named Feed' && feedNoted && seal.desc.indexOf('digit of hunger') < 0) {
          seal.desc += ' In the watch gallery it reads as a digit of hunger on Licence Zero. It is still not a weapon.';
        }
        if (seal.name === 'Unwritten Passage' && passageNoted && seal.desc.indexOf('blank digit') < 0) {
          seal.desc += ' In the watch gallery it is the blank digit. It still does not open a door.';
        }
      });
      if (!seals.some((seal) => seal.name === 'Licence Zero')) {
        seals.push({
          name: 'Licence Zero',
          desc: 'The Concord numbers the Prime Remnant as Licence Zero. Every later bottle is a digit of that zero. The count turns the stair. The cathedral bar stays shut.'
            + (feedNoted ? ' Named Feed is a digit of hunger.' : '')
            + (passageNoted ? ' The Unwritten Passage is the blank digit.' : ''),
        });
      }
      let msg = 'Licence Zero. The count turns the stair. The grate lifts. The cathedral bar stays shut.';
      if (feedNoted) msg += ' Named Feed is a digit of hunger. It can go into the crack. It is still not a weapon.';
      if (passageNoted) msg += ' The Unwritten Passage is the blank digit. It can lie on the crack. It does not open the bar.';
      showToast(msg);
    } else {
      galleryWord = 'file';
      let msg = 'The page stays hungry. The grate lifts anyway. The bar hinge is still a choice. The stair goes down.';
      if (naveWord === 'name') msg = 'The named hinge is written into Licence Zero. The grate lifts. The cathedral bar stays shut.';
      else if (naveWord === 'turn') msg = 'The refusal is a blank digit on Licence Zero. The grate lifts. The bar stays theirs.';
      if (!seals.some((seal) => seal.name === 'Filed Count')) {
        seals.push({
          name: 'Filed Count',
          desc: msg + ' Neither door opened.',
        });
      }
      showToast(msg);
    }
    syncGrate();
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function talkKestrelNave() {
    if (locale !== 'ash-nave' || dialogueOpen || kestrelNave || !seenBeats['nave-fly']) return;
    const fn = EW.scenes['nave-kestrel'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'nave-kestrel';
    }
  }

  function noteKestrelNave(id) {
    if (kestrelNave) return;
    kestrelNave = id === 'ask' ? 'ask' : 'air';
    seenBeats['nave-kestrel'] = true;
    showToast(kestrelNave === 'ask'
      ? 'You ask her to land. She does not. She is not in the pack.'
      : 'You leave her the air. She does not join.');
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function driftNave(dt) {
    if (!motionWanted) return;
    const t = performance.now() * 0.001;
    if (naveGroup && naveGroup.userData.banners) {
      naveGroup.userData.banners.forEach((banner, i) => {
        banner.rotation.y = Math.sin(t * 1.35 + i * 1.7) * 0.22;
      });
    }
    if (naveGroup && naveGroup.userData.stain) {
      naveGroup.userData.stain.intensity = 0.75 + Math.sin(t * 1.6) * 0.35;
    }
    if (naveGroup && naveGroup.userData.stainPlane && naveGroup.userData.stainPlane.material) {
      naveGroup.userData.stainPlane.material.opacity = 0.55 + Math.sin(t * 1.6) * 0.16;
    }
    if (galleryGroup && galleryGroup.userData.stain) {
      galleryGroup.userData.stain.intensity = 0.4 + Math.sin(t * 1.2) * 0.22;
    }
    if (cryptGroup && cryptGroup.visible && cryptGroup.userData.crack && !cryptWord) {
      cryptGroup.userData.crack.intensity = 0.28 + Math.abs(Math.sin(t * 1.8)) * 0.22;
    }
    if (breachGroup && breachGroup.visible && breachGroup.userData.shafts && !breachWord) {
      breachGroup.userData.shafts.forEach((light, i) => {
        light.intensity = 0.85 + Math.abs(Math.sin(t * 1.4 + i)) * 0.45;
      });
    }
    if (breachGroup && breachGroup.visible && breachGroup.userData.banner) {
      breachGroup.userData.banner.rotation.y = Math.sin(t * 1.2) * 0.18;
    }
    if (vaultRoom && vaultRoom.visible && vaultRoom.userData.marrowLight) {
      vaultRoom.userData.marrowLight.intensity = 0.45 + Math.abs(Math.sin(t * 1.7)) * 0.5;
    }
    if (claimGroup && claimGroup.visible && claimGroup.userData.core) {
      claimGroup.userData.core.rotation.y = t * 0.35;
      const pulse = claimWord === 'burn' ? 1.15 : 1 + Math.sin(t * 1.5) * 0.06;
      claimGroup.userData.core.scale.setScalar(pulse);
    }
    if (claimGroup && claimGroup.visible && claimGroup.userData.shafts && !claimWord) {
      claimGroup.userData.shafts.forEach((light, i) => {
        light.intensity = (i === 2 ? 1.4 : 0.7) + Math.abs(Math.sin(t * 1.3 + i)) * 0.35;
      });
    }
    if (aftermathGroup && aftermathGroup.visible && aftermathGroup.userData.core) {
      const core = aftermathGroup.userData.core;
      core.rotation.y = t * (claimWord === 'burn' ? 0.15 : 0.4);
      const base = claimWord === 'burn' ? 0.72 : 1;
      core.scale.setScalar(base * (1 + Math.sin(t * (claimWord === 'burn' ? 6 : 1.4)) * (claimWord === 'burn' ? 0.08 : 0.05)));
      if (aftermathGroup.userData.twin && aftermathGroup.userData.twin.visible) {
        aftermathGroup.userData.twin.rotation.y = -t * 0.55;
      }
    }
    if (kestrelFly > 0 && naveGroup && naveGroup.userData.bird) {
      kestrelFly += dt || 0;
      const bird = naveGroup.userData.bird;
      const u = Math.min(1, kestrelFly / 4);
      bird.visible = u < 1 && naveGroup.visible;
      bird.position.set(-8 + u * 16, 3.5 + Math.sin(u * 9) * 0.28, -0.5);
      if (naveGroup.userData.wings) {
        naveGroup.userData.wings.forEach((wing, i) => {
          wing.rotation.x = Math.sin(t * 16) * 0.55 * (i ? -1 : 1);
        });
      }
      if (u >= 1) {
        kestrelFly = 0;
        bird.visible = false;
      }
    }
  }

  function talkCamp() {
    if (locale !== 'concord-yard' || dialogueOpen) return;
    if (seenBeats['yard-camp']) {
      showToast('The stones stay warm. The road did not move.');
      return;
    }
    const fn = EW.scenes['yard-camp'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'yard-camp';
    }
  }

  function noteCamp() {
    seenBeats['yard-camp'] = true;
    showToast('They sat. The slag, the warden, and the north stone stayed as they were.');
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function talkChalk() {
    if (locale !== 'ash-nave' || dialogueOpen) return;
    if (seenBeats['nave-pressure']) {
      showToast('The chalk stays on the wall. The bar did not open.');
      return;
    }
    const fn = EW.scenes['nave-pressure'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'nave-pressure';
    }
  }

  function notePressure() {
    seenBeats['nave-pressure'] = true;
    showToast('The chalk is read. The bar stays shut. She did not enter the host.');
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function talkMargin() {
    if (locale !== 'watch-gallery' || dialogueOpen) return;
    if (seenBeats['gallery-margin']) {
      showToast('The filed copy stays on the wall. The stair did not change.');
      return;
    }
    const fn = EW.scenes['gallery-margin'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'gallery-margin';
    }
  }

  function noteMargin() {
    seenBeats['gallery-margin'] = true;
    showToast('The filing is read. The grate and the stair stay as they were.');
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function talkLetter() {
    if (locale !== 'leaf-village' || dialogueOpen) return;
    if (seenBeats['furrow-letter']) {
      showToast('The cousin’s letter is in the pack. Vesper walked them to the well. The road did not change.');
      return;
    }
    const fn = EW.scenes['furrow-letter'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'furrow-letter';
    }
  }

  function hasMargin() {
    return seals.some((seal) => seal.name === 'Cousin’s Margin');
  }

  function talkChest() {
    if (locale !== 'field' || regionId !== 'verdant-isle' || dialogueOpen) return;
    if (seenBeats['wayside-chest']) {
      showToast('The wayside chest stays empty. The tonic is already in the pack.');
      return;
    }
    const fn = EW.scenes['wayside-chest'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'wayside-chest';
    }
  }

  function noteChest() {
    seenBeats['wayside-chest'] = true;
    const stack = items.find((row) => row.id === 'tonic');
    if (stack) stack.count += 1;
    else items.push({ id: 'tonic', count: 1 });
    showToast('One verdant tonic. The chest is empty. The kiln is still the road.');
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function talkCord() {
    if (locale !== 'field' || regionId !== 'verdant-isle' || dialogueOpen) return;
    if (seenBeats['salt-cord']) {
      showToast('The salt cord is in the pack. The vault does not count rope. The road did not change.');
      return;
    }
    const fn = EW.scenes['salt-cord'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'salt-cord';
    }
  }

  function noteCord() {
    seenBeats['salt-cord'] = true;
    if (!seals.some((seal) => seal.name === 'Salt Cord')) {
      seals.push({
        name: 'Salt Cord',
        desc: 'A waxed cord from the isle grass. The coast ties rope like this. The vault does not count rope. It does not open a door.',
      });
    }
    showToast('The cord is in the pack. The scar is still the other way.');
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function talkNotice() {
    if (locale !== 'field' || regionId !== 'stormreach' || dialogueOpen) return;
    if (seenBeats['coast-notice']) {
      showToast('The notice stays posted. Mouths are numbered. The door did not change.');
      return;
    }
    const fn = EW.scenes['coast-notice'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'coast-notice';
    }
  }

  function noteNotice() {
    seenBeats['coast-notice'] = true;
    showToast('The board is read. The vault door is still the count.');
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function noteLetter() {
    seenBeats['furrow-letter'] = true;
    if (!seals.some((seal) => seal.name === 'Cousin’s Margin')) {
      seals.push({
        name: 'Cousin’s Margin',
        desc: 'A letter from the basket. Vesper walked a clerk to the well and called the cork mercy. The grey furrow was the price, paid where the licence does not look. It does not open a door.',
      });
    }
    showToast('The letter is in the pack. The kiln is still the road.');
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function talkPorter() {
    if (locale !== 'field' || regionId !== 'stormreach' || dialogueOpen) return;
    if (seenBeats['vault-porter']) {
      showToast('The porter stays wet. The fourth storm is still sold.');
      return;
    }
    const fn = EW.scenes['vault-porter'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'vault-porter';
    }
  }

  function talkWarden() {
    if (locale !== 'concord-yard' || dialogueOpen) return;
    const pool = pools.find((p) => p.id === 'yard-slag');
    if (pool && pool.absorbed) showToast('The warden has your name on a page. The slag is already in her. Kestrel is not here to argue it.');
    else if (pool && pool.bottled) showToast('The licence is on. The slag is quiet and still hungry.');
    else showToast('The warden says the slag is on the books. Vesper is west of it, arguing. The pool is still a mouth.');
  }

  function noteYard(id) {
    if (yardWord) return;
    const pool = pools.find((p) => p.id === 'yard-slag');
    if (id === 'seal') {
      yardWord = 'seal';
      seenBeats['yard-vesper'] = true;
      if (pool && !pool.absorbed) bottlePool('yard-slag');
      if (!seals.some((seal) => seal.name === 'Yard Licence')) {
        seals.push({
          name: 'Yard Licence',
          desc: 'The Concord sealed the yard slag. You did not drink it. The leak stayed on their page, and it is still hungry.',
        });
      }
      showToast('The warden seals the slag. Your name is not on the drink. The rot stays in the yard.');
    } else {
      yardWord = 'drink';
      seenBeats['yard-vesper'] = true;
      showToast('The slag stays a mouth. Drink it if you mean to. The warden will write the theft.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function updateMarrowVesper() {
    if (locale !== 'ashen-marrow' || !playerMesh || dialogueOpen || skyPass) return;
    if (!seenBeats.marrowStep || seenBeats['marrow-vesper']) return;
    const d = Math.hypot(-4.2 - playerMesh.position.x, -3.6 - playerMesh.position.z);
    if (d > 2.15) {
      vesperAshLatch = false;
      return;
    }
    if (vesperAshLatch) return;
    vesperAshLatch = true;
    const fn = EW.scenes['marrow-vesper'];
    if (typeof fn === 'function') {
      const played = fn();
      if (played !== false && dialogueOpen) pendingBeat = 'marrow-vesper';
    }
  }

  function updateVaultTriggers() {
    if (locale !== 'harbor-vault' || !playerMesh || dialogueOpen) return;
    const z = playerMesh.position.z;
    if (z > -6) vaultLatch = false;
    if (!seenBeats['bottle-hall'] && !vaultLatch && z < -8.2) {
      vaultLatch = true;
      const fn = EW.scenes['bottle-hall'];
      if (typeof fn === 'function') {
        const played = fn();
        if (played !== false && dialogueOpen) pendingBeat = 'bottle-hall';
      }
    }
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
    lastMergeNote = '';
    if (tag === 'cellar-crawl') seenBeats.cellarCrawl = true;
    if (tag === 'kiln-heart') seenBeats.kiln = true;
    if (tag === 'mark-counter') seenBeats.markFight = true;
    if (tag === 'crypt-auditor') seenBeats.cryptFight = true;
    if (tag === 'breach-stand') {
      seenBeats.breachFight = true;
      if (!breachAsh) {
        breachAsh = true;
        spark.earth = (spark.earth || 0) + 1;
        applyStrain(6);
      }
      const gained = grantReadyMerges({ quiet: true });
      lastMergeNote = gained.length
        ? ' ' + gained.join(', ') + (gained.length === 1 ? ' stays' : ' stay') + ' on the magic list.'
        : ' No new merge was waiting.';
    }
    if (tag === 'claim-rite') {
      seenBeats.claimFight = true;
      lastMergeNote = riteTorn
        ? ' The merge spent the rite.'
        : ' The rite frayed under the knife.';
    }
    if (tag === 'pipe-stoker') {
      pipeWord = 'crack';
      seenBeats['pipe-feed'] = true;
      applyStrain(4);
      if (!seals.some((seal) => seal.name === 'Cracked Feed')) {
        seals.push({
          name: 'Cracked Feed',
          desc: 'The pipe into the digest-engine was opened. The stoker’s coat was the licence. The engine is hungrier. The shelf is not cleaner.',
        });
      }
    }
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
    const coasting = skyHoldsFeet();
    if (marrowGroup && marrowGroup.visible && marrowGroup.userData.leak) {
      marrowGroup.userData.leak.intensity = 1.05 + Math.abs(Math.sin(performance.now() * 0.003)) * 0.7;
    }
    if (yardStone && yardStone.userData.beamMat) {
      const named = throatWord === 'name';
      const pulse = 0.5 + Math.sin(performance.now() * 0.003) * 0.5;
      yardStone.userData.beamMat.opacity = (named ? 0.28 : 0.08) + pulse * (named ? 0.22 : 0.06);
      if (yardStone.userData.glow) yardStone.userData.glow.intensity = named ? 0.35 + pulse * 0.4 : 0.12;
    }
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
      nearMarrow = null;
      nearWorker = null;
      nearPipe = null;
      nearThroat = null;
      nearStone = null;
      nearWarden = null;
      nearMark = null;
      nearNave = null;
      nearGallery = null;
      nearStair = null;
      nearCrack = null;
      nearBar = null;
      nearEnd = null;
      nearCredits = null;
      nearPerch = null;
      nearKestrel = null;
      nearPorter = null;
      nearLetter = null;
      nearMargin = null;
      nearChalk = null;
      nearCamp = null;
      nearChest = null;
      nearNotice = null;
      nearCord = null;
      joy.active = false;
      joy.dx = 0;
      joy.dy = 0;
    } else if (!inventoryOpen && !encounterLocked && !dialogueOpen && !creditsCovering()) {
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
        const drag = scarDebt >= 2 ? 0.78 : 1;
        const speed = PLAYER_SPEED * drag * dt;
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
        } else if (locale === 'harbor-vault') {
          if (vaultFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (vaultFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'ashen-marrow') {
          if (marrowFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (marrowFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'concord-yard') {
          if (yardFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (yardFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'remnant-mark') {
          if (markFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (markFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'ash-nave') {
          if (naveFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (naveFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'watch-gallery') {
          if (galleryFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (galleryFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'count-crypt') {
          if (cryptFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (cryptFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'first-breach') {
          if (breachFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (breachFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'remnant-claim') {
          if (claimFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (claimFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'aftermath') {
          if (aftermathFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (aftermathFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'marrow-pipe') {
          if (pipeFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (pipeFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else if (locale === 'engine-throat') {
          if (throatFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (throatFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        } else {
          if (cellarFits(nx, playerMesh.position.z)) playerMesh.position.x = nx;
          if (cellarFits(playerMesh.position.x, nz)) playerMesh.position.z = nz;
        }
        playerMesh.rotation.y = Math.atan2(mx, mz);
        poseHost('walk');
        stepsSinceEncounter += speed * 10;
        nearPool = nearestPool();
        nearDoor = nearestDoor();
        nearGate = nearestGate();
        nearReturn = nearestReturn();
        nearMarrow = nearestMarrow();
        nearWorker = nearestWorker();
        nearPipe = nearestPipe();
        nearThroat = nearestThroat();
        nearStone = nearestStone();
        nearWarden = nearestWarden();
        nearMark = nearestMark();
        nearNave = nearestNave();
        nearGallery = nearestGallery();
        nearStair = nearestStair();
        nearCrack = nearestCrack();
        nearBar = nearestBar();
        nearEnd = nearestEnd();
        nearCredits = nearestCredits();
        nearPerch = nearestPerch();
        nearKestrel = nearestKestrel();
        nearPorter = nearestPorter();
        nearLetter = nearestLetter();
        nearMargin = nearestMargin();
        nearChalk = nearestChalk();
        nearCamp = nearestCamp();
        nearChest = nearestChest();
        nearNotice = nearestNotice();
        nearCord = nearestCord();
        const safe = nearPool && !nearPool.absorbed;
        const cooled = performance.now() < suppressEncountersUntil;
        const onField = locale === 'field' && (regionId === 'verdant-isle' || regionId === 'stormreach');
        const onAsh = locale === 'ashen-marrow';
        const onApproach = (locale === 'ash-nave' || locale === 'first-breach' || (locale === 'remnant-claim' && !claimWord))
          && !nearNave && !nearGallery && !nearBar && !nearEnd && !nearPerch && !nearKestrel;
        const stepsNeed = onApproach ? ENCOUNTER_STEPS * 1.8 : ENCOUNTER_STEPS;
        if ((onField || onAsh || onApproach) && !safe && !nearPipe && !nearThroat && !nearStone && !cooled && stepsSinceEncounter > stepsNeed) {
          const pressure = rotPressure();
          const chancePerSec = onApproach ? 0.1 : onAsh ? 0.18 + pressure * 0.35 : 0.32 + pressure * 0.7;
          if (Math.random() < chancePerSec * dt) triggerEncounter();
        }
      } else {
        nearPool = nearestPool();
        nearDoor = nearestDoor();
        nearGate = nearestGate();
        nearReturn = nearestReturn();
        nearMarrow = nearestMarrow();
        nearWorker = nearestWorker();
        nearPipe = nearestPipe();
        nearThroat = nearestThroat();
        nearStone = nearestStone();
        nearWarden = nearestWarden();
        nearMark = nearestMark();
        nearNave = nearestNave();
        nearGallery = nearestGallery();
        nearStair = nearestStair();
        nearCrack = nearestCrack();
        nearBar = nearestBar();
        nearEnd = nearestEnd();
        nearCredits = nearestCredits();
        nearPerch = nearestPerch();
        nearKestrel = nearestKestrel();
        nearPorter = nearestPorter();
        nearLetter = nearestLetter();
        nearMargin = nearestMargin();
        nearChalk = nearestChalk();
        nearCamp = nearestCamp();
        nearChest = nearestChest();
        nearNotice = nearestNotice();
        nearCord = nearestCord();
        poseHost('idle');
      }

      updateCellarTriggers();
      updateVaultTriggers();
      updateMarrowVesper();
      updatePipeTrigger();
      updateThroatTrigger();
      updateYardVesper();
      updateMarkFight();
      updateMarkVesper();
      updateNaveGate();
      updateGalleryLedger();
      updateCryptFight();
      updateCryptVesper();
      updateBreachFight();
      updateBreachVesper();
      updateClaimFight();
      updateClaimVesper();
      driftMotes();
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
      nearMarrow = nearestMarrow();
      nearWorker = nearestWorker();
      nearPipe = nearestPipe();
      nearThroat = nearestThroat();
      nearStone = nearestStone();
      nearWarden = nearestWarden();
      nearMark = nearestMark();
      nearNave = nearestNave();
      nearGallery = nearestGallery();
      nearStair = nearestStair();
      nearCrack = nearestCrack();
      nearBar = nearestBar();
      nearEnd = nearestEnd();
      nearCredits = nearestCredits();
      nearPerch = nearestPerch();
      nearKestrel = nearestKestrel();
      nearPorter = nearestPorter();
      nearLetter = nearestLetter();
      nearMargin = nearestMargin();
      nearChalk = nearestChalk();
      nearCamp = nearestCamp();
        nearChest = nearestChest();
        nearNotice = nearestNotice();
        nearCord = nearestCord();
      poseHost('still');
    }

    bobHoods();
    driftNave(dt);
    if (skyPass) updateSkyPass(dt);
    else {
      const ideal = new THREE.Vector3(camTarget.x, camTarget.y + CAMERA_HEIGHT, camTarget.z + CAMERA_DIST);
      camera.position.lerp(ideal, CAMERA_LAG * (dt * 60));
      camera.lookAt(camTarget.x, camTarget.y + 1, camTarget.z);
    }
    tintHost();
    syncCough();
    updateHUD();
    updatePrompt();
  }

  function syncCough() {
    if (!coughPuff) return;
    const sick = scarDebt >= 2;
    coughPuff.visible = sick;
    if (!sick) {
      coughPuff.material.opacity = 0;
      return;
    }
    if (!motionWanted) {
      coughPuff.material.opacity = 0.7;
      coughPuff.scale.setScalar(1);
      return;
    }
    const pulse = Math.sin(performance.now() * 0.007) * 0.5 + 0.5;
    coughPuff.material.opacity = 0.55 + pulse * 0.35;
    coughPuff.scale.setScalar(0.85 + pulse * 0.7);
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
    }, Math.round(700 * paceScale()));
  }

  // ─── Combat ───────────────────────────────────────────────
  function paceScale() {
    if (combatPace === 'slow') return 1.7;
    if (combatPace === 'brisk') return 0.62;
    return 1;
  }

  function later(fn, ms) {
    const epoch = combatEpoch;
    setTimeout(() => {
      if (epoch !== combatEpoch) return;
      fn();
    }, Math.max(40, Math.round(ms * paceScale())));
  }

  function rollEncounter() {
    if (locale === 'ash-nave' || locale === 'first-breach' || locale === 'remnant-claim') return [spawnEnemy('penitent')];
    if (locale === 'ashen-marrow') return rollMarrowEncounter();
    if (regionId === 'stormreach') return rollCoastEncounter();
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

  function rollCoastEncounter() {
    const pressure = rotPressure();
    const echoReady = spark.strain >= 28 || !!duelWord || combatsFought >= 2;
    if (echoReady && Math.random() < 0.16) return [spawnEnemy('echo')];
    const n = 1 + (Math.random() < (pressure > 0.45 ? 0.6 : 0.3) ? 1 : 0);
    const table = pressure > 0.4
      ? ['wisp', 'wisp', 'clerk', 'brine', 'scribe']
      : ['wisp', 'brine', 'clerk', 'scribe', 'wisp'];
    const list = [];
    for (let i = 0; i < n; i++) list.push(table[rand(0, table.length - 1)]);
    const counts = {};
    return list.map((id) => {
      counts[id] = (counts[id] || 0) + 1;
      const dup = list.filter((x) => x === id).length > 1;
      return spawnEnemy(id, dup ? ' ' + counts[id] : '');
    });
  }

  function rollMarrowEncounter() {
    const id = Math.random() < 0.16 ? 'stoker' : 'cinder';
    const n = id === 'stoker' ? 1 : (Math.random() < 0.45 ? 2 : 1);
    const list = [];
    for (let i = 0; i < n; i++) list.push(id);
    const counts = {};
    return list.map((kind) => {
      counts[kind] = (counts[kind] || 0) + 1;
      const dup = list.filter((x) => x === kind).length > 1;
      return spawnEnemy(kind, dup ? ' ' + counts[kind] : '');
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
    if (id === 'auditor') e.page = true;
    if (id === 'captain') e.licence = true;
    if (id === 'celebrant') e.rite = true;
    return e;
  }

  function clearAsh() {
    if (!party) return;
    party.forEach((member) => { if (member) member.ash = 0; });
  }

  function startCombat() {
    combatEpoch++;
    combatsFought += 1;
    clearAsh();
    coverReady = false;
    assistUsed = {};
    gameState = State.COMBAT;
    hud.classList.add('hidden');
    setFieldControls(false);
    interactPrompt.classList.add('hidden');
    combatUI.classList.remove('hidden', 'juice-cleave', 'juice-channel', 'juice-aim', 'hit');
    overworldGroup.visible = false;
    if (interiorGroup) interiorGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    if (coastGroup) coastGroup.visible = false;
    combatGroup.visible = true;
    scene.fog.near = 22;
    scene.fog.far = 70;
    scene.fog.color.set(0x1c2832);
    renderer.setClearColor(0x1c2832);

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
      if (p.id === 'lira' && mesh.userData.ember) mesh.userData.ember.visible = true;
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
    const teach = enemies.some((e) => e.id === 'penitent')
      ? 'An ash penitent on the approach. It kneels once. Ash sits in the teeth and coughs on the next turn. It is not a scar.'
      : enemies.some((e) => e.id === 'celebrant')
      ? 'A Concord last rite. The ward drinks a knife. A merge on the list tears it. A shoulder still stands in front.'
      : enemies.some((e) => e.id === 'captain')
      ? 'A Concord last stand. The captain’s licence hits once, hard, unless a shoulder is already in front. Nima’s steady keeps the line.'
      : enemies.some((e) => e.id === 'stoker')
      ? 'Corked iron. A knife spends itself on the coat. Magma stays on them. Glass looks for the seam.'
      : enemies.some((e) => e.id === 'cinder')
        ? 'Ash that learned to crawl. The shelf is not empty.'
        : enemies.some((e) => e.id === 'counter')
        ? 'A counter left to number a leak. He counts blows the same way.'
      : enemies.some((e) => e.id === 'brine')
          ? 'The coast grew a thing with too many legs. The wet is not only water.'
      : enemies.some((e) => e.id === 'echo')
      ? 'Vesper is not on this field. Something that remembers her mouth is.'
      : enemies.some((e) => e.id === 'scribe')
        ? 'A Concord scribe reaches for a bottle. You are already inside the moment they meant to cork.'
        : combatInRot
          ? 'The rot noticed you. Fight, spend what you digested, or try to leave.'
          : 'Your people act, then theirs. Fight, magic, item, or flee.';
    let mergeBit = '';
    if (!seenBeats.mergeTip && earnedMergeNames().length) {
      seenBeats.mergeTip = true;
      mergeBit = ' A merge is on the list. Magic spends it. A knife will not.';
      saveGame();
    }
    later(() => showLog(teach + mergeBit), 280);
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
      const coughing = party[t.index];
      if (coughing && coughing.ash) {
        const bite = 6;
        coughing.ash = 0;
        coughing.hp = Math.max(0, coughing.hp - bite);
        showLog('Ash in the teeth. ' + coughing.name + ' loses ' + bite + '.');
        updateCombatUI();
        if (coughing.hp <= 0) {
          later(() => { if (!checkCombatEnd()) advanceTurn(); }, 420);
          return;
        }
      }
      if (partyAssist(t.index)) return;
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
      later(() => enemyAct(t.index), 340);
    }
  }

  function partyAssist(index) {
    const actor = party[index];
    if (!actor || actor.hp <= 0 || assistUsed[actor.id]) return false;
    if (actor.id !== 'torren' && actor.id !== 'nima') return false;
    assistUsed[actor.id] = true;
    combatBusy = true;
    inputEnabled = false;
    showMenus('none');
    turnIndicator.textContent = actor.name;
    if (actor.id === 'torren') {
      coverReady = true;
      showLog('Torren sets his shoulder in front of the line. The next blow lands lighter.');
    } else {
      const hurt = party.filter((member) => member.hp > 0).sort((a, b) => (a.hp / maxHp(a)) - (b.hp / maxHp(b)))[0];
      const before = hurt.hp;
      hurt.hp = Math.min(maxHp(hurt), hurt.hp + 14);
      const gained = hurt.hp - before;
      showLog(gained
        ? 'Nima steadies ' + hurt.name + '. ' + gained + ' HP. It is still not her real work.'
        : 'Nima steadies the line. Nobody was open enough to take it.');
      if (gained) punchNumber(gained, 'heal');
    }
    updateCombatUI();
    later(() => advanceTurn(), 640);
    return true;
  }

  function advanceTurn() {
    combatTurnIndex++;
    later(() => beginNextTurn(), 260);
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
      if (!seenBeats.jobLesson && spark && spark.path) {
        seenBeats.jobLesson = true;
        const job = spark.path === 'mage' ? 'Channel' : spark.path === 'ranged' ? 'Aim' : 'Cleave';
        showLog(job + ' is the job. The other two land thin.');
        saveGame();
      }
    }
    if (which === 'magic') {
      refreshMagicButtons();
      if (!seenBeats.mergeMenu && earnedMergeNames().length) {
        seenBeats.mergeMenu = true;
        showLog('A merge spends two elements. The button names what it does. A knife will not.');
        saveGame();
      }
    }
    if (which === 'item') renderCombatItems();
    const open = [mainMenu, pathMenu, magicMenu, itemMenu, targetMenu].find((menu) => menu && !menu.classList.contains('hidden'));
    if (open) tagCommandKeys(open);
  }

  function tagCommandKeys(root) {
    const buttons = Array.from(root.querySelectorAll('button')).filter((btn) => {
      return btn.dataset.action !== 'back' && btn.dataset.action !== 'back-target' && !btn.classList.contains('hidden');
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
      return btn.dataset.action !== 'back' && btn.dataset.action !== 'back-target' && !btn.classList.contains('hidden');
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

  function elementLabel(id) {
    if (id === 'lightning') return 'Bolt';
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  function refreshMagicButtons() {
    const turn = currentTurn();
    const actor = turn && turn.type === 'party' ? party[turn.index] : null;
    magicMenu.querySelectorAll('[data-magic]').forEach((btn) => {
      const sp = SPELLS[btn.dataset.magic];
      const locked = !!(sp.merge && !merges[sp.merge]);
      btn.classList.toggle('hidden', locked);
      if (locked) {
        btn.disabled = true;
        return;
      }
      const have = spark[sp.element] || 0;
      const alsoNeed = sp.also ? (sp.alsoCost || 1) : 0;
      const alsoHave = sp.also ? (spark[sp.also] || 0) : alsoNeed;
      const costEl = btn.querySelector('.cost');
      if (costEl) {
        const cost = sp.also
          ? elementLabel(sp.also) + ' ' + alsoNeed + ' + ' + elementLabel(sp.element) + ' ' + sp.cost
          : elementLabel(sp.element) + ' ' + sp.cost;
        const held = sp.also ? 'have ' + alsoHave + '/' + have : 'have ' + have;
        const feel = {
          plasma: 'cooks armor',
          steam: 'softens the swing',
          storm: 'chains',
          magma: 'burns on their turn',
          glass: 'pierces',
        }[btn.dataset.magic];
        costEl.textContent = cost + ' · ' + sp.mp + ' MP · ' + held + (feel ? ' · ' + feel : '');
      }
      btn.disabled = !actor || actor.mp < sp.mp || have < sp.cost || alsoHave < alsoNeed;
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

  function noteAir(target, dmg, text) {
    if (!target || !target.air) return { dmg: dmg, text: text };
    target.air = false;
    return { dmg: 1, text: text + ' The hare is in the air. The blow finds almost nothing.' };
  }

  function noteStamp(target, dmg, text) {
    if (!target || !target.stamp) return { dmg: dmg, text: text };
    target.stamp = false;
    if (dmg <= 1) return { dmg: 1, text: text + ' The clerk’s stamp holds. The blow lands thin.' };
    const needle = String(dmg);
    const at = text.lastIndexOf(needle);
    const rewritten = at < 0 ? text : text.slice(0, at) + '1' + text.slice(at + needle.length);
    return { dmg: 1, text: rewritten + ' The clerk’s stamp holds. The blow lands thin.' };
  }

  function pathStrike(actor, target, path) {
    const s = actorStats(actor);
    if (actor.id !== 'lira' || !path) {
      let dmg = Math.max(1, s.atk + rand(0, 5) - target.def);
      if (target.rite) dmg = Math.max(1, Math.floor(dmg * 0.4));
      let text;
      if (actor.id === 'torren') text = 'Torren puts a quartermaster’s weight into ' + target.name + '. ' + dmg + '.';
      else if (actor.id === 'nima') text = 'Nima’s rod finds ' + target.name + ' for ' + dmg + '. It is not her real work.';
      else text = actor.name + ' strikes ' + target.name + ' for ' + dmg + '.';
      if (target.rite) text += ' The rite holds.';
      const thinAir = noteAir(target, dmg, text);
      const stamped = noteStamp(target, thinAir.dmg, thinAir.text);
      return { dmg: stamped.dmg, text: stamped.text, pathXp: 0, mpGain: 0 };
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
    if (target.page) {
      dmg = Math.max(1, Math.floor(dmg * 0.5));
      target.page = false;
      text += ' The ledger page takes the edge. The next blow lands on the person.';
    }
    if (target.rite) {
      dmg = Math.max(1, Math.floor(dmg * 0.4));
      text += ' The last rite takes the edge. ' + dmg + ' lands. A merge would tear the ward.';
    }
    const thinAir = noteAir(target, dmg, text);
    const stamped = noteStamp(target, thinAir.dmg, thinAir.text);
    return { dmg: stamped.dmg, text: stamped.text, pathXp: thin ? 0 : 7, mpGain };
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
      punchNumber(result.dmg, 'harm');
      if (act.path) strikeJuice(act.path, combatPartyMeshes[turn.index], combatEnemyMeshes[targetIdx]);
      animateAttack(combatPartyMeshes[turn.index], combatEnemyMeshes[targetIdx]);
      if (target.hp <= 0) markDead(targetIdx);
    } else if (act.kind === 'magic') {
      const sp = SPELLS[act.magic];
      const alsoNeed = sp && sp.also ? (sp.alsoCost || 1) : 0;
      if (!sp || (sp.merge && !merges[sp.merge]) || spark[sp.element] < sp.cost || (sp.also && spark[sp.also] < alsoNeed) || actor.mp < sp.mp) {
        showLog('The spark has not digested enough, or the mind is dry.');
        combatBusy = false;
        inputEnabled = true;
        showMenus('magic');
        return;
      }
      spark[sp.element] -= sp.cost;
      if (sp.also) spark[sp.also] -= alsoNeed;
      actor.mp -= sp.mp;
      const stats = actorStats(actor);
      const mageBonus = actor.id === 'lira' && spark.path === 'mage' ? 6 : 0;
      if (sp.kind === 'heal') {
        const target = party[targetIdx];
        const kept = scarDebt * SCAR_MEND;
        const heal = Math.max(1, 22 + Math.floor(stats.mag / 2) + mageBonus + rand(0, 8) - kept);
        const before = target.hp;
        target.hp = Math.min(maxHp(target), target.hp + heal);
        showLog(actor.name + ' lays digested water on ' + target.name + '. ' + (target.hp - before) + ' HP returns.' + (kept ? ' The scar keeps ' + kept + '.' : ''));
        punchNumber(target.hp - before, 'heal');
        flashMesh(combatPartyMeshes[targetIdx], sp.flash);
        if (actor.id === 'lira' && spark.path === 'mage' && grantPathXp(6)) {
          later(() => showLog('Mage attunement deepens.'), 600);
        }
      } else {
        const target = enemies[targetIdx];
        if (!target || !target.alive) { combatBusy = false; advanceTurn(); return; }
        const usualCut = Math.floor(target.def / 3);
        const defCut = act.magic === 'glass' ? Math.floor(target.def * 0.08) : usualCut;
        let dmg = Math.max(1, stats.mag + sp.power + mageBonus + rand(0, 6) - defCut);
        let extra = '';
        let toreRite = false;
        if (target.rite && sp.merge) {
          target.rite = false;
          riteTorn = true;
          toreRite = true;
          dmg += 12;
        }
        target.hp = Math.max(0, target.hp - dmg);
        if (act.magic === 'plasma') {
          target.def = Math.max(0, target.def - 2);
          applyStrain(1);
          extra = ' The guard cooks. Strain ' + spark.strain + '.';
        } else if (act.magic === 'steam') {
          target.atk = Math.max(1, target.atk - 2);
          extra = ' The swing softens.';
        } else if (act.magic === 'storm') {
          const others = enemies.filter((enemy) => enemy.alive && enemy !== target);
          if (others.length) {
            others.forEach((other) => {
              const splash = Math.max(1, Math.floor(dmg * 0.45));
              other.hp = Math.max(0, other.hp - splash);
              extra += ' The bolt walks to ' + other.name + ' for ' + splash + '.';
              if (other.hp <= 0) markDead(enemies.indexOf(other));
            });
          } else if (target.hp > 0) {
            target.hp = Math.max(0, target.hp - 5);
            extra = ' The bolt has nowhere else to go. Another 5.';
          }
        } else if (act.magic === 'magma' && target.hp > 0) {
          target.burn = (target.burn || 0) + 8;
          extra = ' It stays on them.';
        } else if (act.magic === 'glass') {
          extra = ' The guard does not hold.';
          if (target.hp > 0 && Math.random() < 0.45) {
            target.hp = Math.max(0, target.hp - 8);
            extra = ' The seam gives.';
          }
        }
        if (toreRite) extra += ' The merge spends the rite. The ward comes off.';
        const lines = {
          fire: actor.name + ' spends a coal of fire. ' + target.name + ' takes ' + dmg + '.',
          water: actor.name + ' turns held water into a hard tide. ' + dmg + ' to ' + target.name + '.',
          lightning: 'Lightning the spark kept in the teeth. ' + target.name + ' takes ' + dmg + '.',
          plasma: 'Plasma. Fire and lightning spend together. ' + target.name + ' takes ' + dmg + '.' + extra,
          steam: 'Steam scalds the air between them. ' + target.name + ' takes ' + dmg + '.' + extra,
          storm: 'Storm. Water and lightning spend together. ' + target.name + ' takes ' + dmg + '.' + extra,
          magma: 'Magma. Fire and earth spend together. ' + target.name + ' takes ' + dmg + '.' + extra,
          glass: 'Glass. The blow is bright and brittle. ' + target.name + ' takes ' + dmg + '.' + extra,
        };
        showLog(lines[act.magic] || (actor.name + ' spends a held word. ' + target.name + ' takes ' + dmg + '.'));
        punchNumber(dmg, 'harm');
        if (sp.merge) playMergeSting();
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
    }, 520);
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
    if (enemy.burn) {
      const bite = enemy.burn;
      enemy.burn = 0;
      enemy.hp = Math.max(0, enemy.hp - bite);
      showLog('Magma bites ' + enemy.name + ' for ' + bite + '.');
      flashMesh(combatEnemyMeshes[idx], 0xff6a2a);
      if (enemy.hp <= 0) {
        markDead(idx);
        updateCombatUI();
        later(() => { if (!checkCombatEnd()) advanceTurn(); }, 420);
        return;
      }
    }
    const living = party.map((p, i) => ({ p, i })).filter((x) => x.p.hp > 0);
    if (!living.length) { checkCombatEnd(); return; }
    if (enemy.id === 'hare' && !enemy.bolted && enemy.hp < enemy.maxHp / 2) {
      enemy.bolted = true;
      enemy.air = true;
      showLog('The hare bolts. The next blow finds almost nothing.');
      updateCombatUI();
      later(() => { if (!checkCombatEnd()) advanceTurn(); }, 520);
      return;
    }
    if (enemy.id === 'penitent' && !enemy.knelt) {
      enemy.knelt = true;
      const livingNow = party.map((p, i) => ({ p, i })).filter((x) => x.p.hp > 0);
      const host = livingNow.find((x) => x.p.id === 'lira') || livingNow[0];
      if (host && !host.p.ash) host.p.ash = 1;
      showLog('The penitent kneels. Ash sits in ' + (host ? host.p.name : 'the line') + '’s teeth.');
      updateCombatUI();
      later(() => { if (!checkCombatEnd()) advanceTurn(); }, 520);
      return;
    }
    if (enemy.id === 'clerk' && !enemy.stamped) {
      enemy.stamped = true;
      enemy.stamp = true;
      showLog('The clerk stamps the page. The next blow lands thin.');
      updateCombatUI();
      later(() => { if (!checkCombatEnd()) advanceTurn(); }, 520);
      return;
    }
    let pick = living[rand(0, living.length - 1)];
    if (enemy.id === 'echo') {
      const lira = living.find((x) => x.p.id === 'lira');
      if (lira && Math.random() < 0.7) pick = lira;
    }
    let dmg = Math.max(1, enemy.atk + rand(0, 4) - actorStats(pick.p).def);
    let coverNote = '';
    if (enemy.licence) {
      enemy.licence = false;
      if (coverReady) coverNote = ' Torren’s shoulder tears the licence. The blow lands lighter.';
      else {
        dmg += 5;
        coverNote = ' The licence comes down hard. A shoulder in front would have torn it.';
      }
    }
    if (coverReady) {
      const cut = Math.min(8, Math.max(0, dmg - 1));
      dmg -= cut;
      coverReady = false;
      coverNote += cut
        ? ' Torren’s shoulder takes ' + cut + '.'
        : ' Torren’s shoulder meets a blow that was already thin.';
    }
    if (enemy.id === 'scribe' && Math.random() < 0.5) {
      const drain = Math.min(6, pick.p.mp);
      pick.p.mp -= drain;
      pick.p.hp = Math.max(0, pick.p.hp - dmg);
      showLog(enemy.name + ' tries to cork ' + pick.p.name + '. ' + dmg + ' harm, and ' + drain + ' of the mind sealed away.' + coverNote);
    } else if (enemy.id === 'echo') {
      const before = spark.strain;
      applyStrain(4);
      pick.p.hp = Math.max(0, pick.p.hp - dmg);
      showLog('The echo strikes ' + pick.p.name + ' for ' + dmg + ' and leaves a thumbprint of Vesper’s hunger. Strain ' + spark.strain + '.' + strainWarning(before) + coverNote);
    } else {
      pick.p.hp = Math.max(0, pick.p.hp - dmg);
      let splashNote = '';
      if (enemy.id === 'brine') {
        const other = living.find((x) => x.p !== pick.p && x.p.hp > 0);
        if (other) {
          const splash = Math.max(1, Math.floor(dmg / 2));
          other.p.hp = Math.max(0, other.p.hp - splash);
          splashNote = ' The brine splashes. The wet hits two.';
          if (other.p.hp <= 0) {
            const mesh = combatPartyMeshes[other.i];
            if (mesh) mesh.rotation.z = 1.15;
          }
        }
      }
      showLog(enemy.name + ' hits ' + pick.p.name + ' for ' + dmg + '.' + coverNote + splashNote);
    }
    punchNumber(dmg, 'harm');
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
    later(() => { if (!checkCombatEnd()) advanceTurn(); }, 520);
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
        : regionId === 'stormreach'
          ? 'You break contact. The shale takes you back.'
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
          : tag === 'pipe-stoker'
          ? ' The feed is cracked. The coat did not save him. The engine is hungrier, and the shelf is not cleaner.'
          : tag === 'mark-counter'
          ? ' The counter is down. The pillar is still numbered. The weep is still a mouth.'
          : tag === 'crypt-auditor'
          ? ' The auditor is down. The page tore. The ledger and the crack are still ahead.'
          : tag === 'breach-stand'
          ? ' The last stand breaks. Remnant ash stays in the teeth.' + lastMergeNote + ' The light is still ahead. The bar stays shut.'
          : tag === 'claim-rite'
          ? ' The last rite is down.' + lastMergeNote + ' The remnant is ahead. This is not the ending.'
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
    clearAsh();
    combatUI.classList.add('hidden');
    victoryOverlay.classList.add('hidden');
    gameoverScreen.classList.add('hidden');
    const onCoast = locale === 'field' && regionId === 'stormreach';
    const onMarrow = locale === 'ashen-marrow';
    const onYard = locale === 'concord-yard';
    const onMark = locale === 'remnant-mark';
    const onNave = locale === 'ash-nave';
    const onGallery = locale === 'watch-gallery';
    const onCrypt = locale === 'count-crypt';
    const onBreach = locale === 'first-breach';
    const onClaim = locale === 'remnant-claim';
    const onAftermath = locale === 'aftermath';
    overworldGroup.visible = locale === 'field' && !onCoast;
    if (stormreachGroup) stormreachGroup.visible = onCoast;
    if (coastGroup) coastGroup.visible = false;
    if (marrowGroup) marrowGroup.visible = onMarrow;
    if (yardGroup) yardGroup.visible = onYard;
    if (markGroup) markGroup.visible = onMark;
    if (naveGroup) naveGroup.visible = onNave;
    if (galleryGroup) galleryGroup.visible = onGallery;
    if (cryptGroup) cryptGroup.visible = onCrypt;
    if (breachGroup) breachGroup.visible = onBreach;
    if (claimGroup) claimGroup.visible = onClaim;
    if (aftermathGroup) aftermathGroup.visible = onAftermath;
    if (interiorGroup) interiorGroup.visible = locale !== 'field' && !onMarrow && !onYard && !onMark && !onNave && !onGallery && !onCrypt && !onBreach && !onClaim && !onAftermath;
    if (vaultRoom) vaultRoom.visible = locale === 'harbor-vault';
    if (villageRoom) villageRoom.visible = locale === 'leaf-village';
    if (cellarRoom) cellarRoom.visible = locale === 'root-cellar';
    if (pipeRoom) pipeRoom.visible = locale === 'marrow-pipe';
    if (throatRoom) throatRoom.visible = locale === 'engine-throat';
    combatGroup.visible = false;
    if (onMarrow) placeFog('marrow');
    else if (onYard) placeFog('yard');
    else if (onMark) placeFog('mark');
    else if (onNave) placeFog('nave');
    else if (onGallery) placeFog('gallery');
    else if (onCrypt) placeFog('crypt');
    else if (onBreach) placeFog('breach');
    else if (onClaim) placeFog('claim');
    else if (onAftermath) placeFog('aftermath');
    else if (locale === 'root-cellar') placeFog('cellar');
    else if (locale === 'harbor-vault') placeFog('vault');
    else if (locale === 'marrow-pipe') placeFog('pipe');
    else if (locale === 'engine-throat') placeFog('throat');
    else if (locale !== 'field') placeFog('village');
    else if (onCoast) placeFog('stormreach');
    else placeFog('verdant');
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
    function statusMarkup(bits) {
      if (!bits.length) return '';
      return '<div class="status-row">' + bits.map((bit) => `<span class="status-icon status-${bit.kind}">${esc(bit.label)}</span>`).join('') + '</div>';
    }
    enemyPanel.innerHTML = enemies.map((e) => {
      const pct = Math.max(0, Math.min(100, (e.hp / e.maxHp) * 100));
      const bits = [];
      if (e.burn) bits.push({ kind: 'burn', label: 'Burn ' + e.burn });
      if (e.stamp) bits.push({ kind: 'stamp', label: 'Stamp' });
      if (e.air) bits.push({ kind: 'air', label: 'Air' });
      if (e.licence) bits.push({ kind: 'stamp', label: 'Licence' });
      if (e.page) bits.push({ kind: 'stamp', label: 'Page' });
      if (e.rite) bits.push({ kind: 'burn', label: 'Rite' });
      if (e.knelt) bits.push({ kind: 'ash', label: 'Knelt' });
      return `<div class="enemy-card ${e.alive ? '' : 'dead'}"><div class="name">${esc(e.name)}</div>${statusMarkup(bits)}<div class="bar-wrap"><div class="bar-hp" style="width:${pct}%"></div></div></div>`;
    }).join('');
    partyPanel.innerHTML = party.map((p, i) => {
      const cap = maxHp(p);
      const hpPct = Math.max(0, Math.min(100, (p.hp / cap) * 100));
      const mpPct = p.maxMp ? Math.max(0, Math.min(100, (p.mp / p.maxMp) * 100)) : 0;
      const bits = [];
      if (p.ash) bits.push({ kind: 'ash', label: 'Ash' });
      if (p.id === 'lira' && scarDebt > 0) bits.push({ kind: 'stamp', label: 'Scar ' + scarDebt });
      return `<div class="party-card ${p.hp <= 0 ? 'dead' : ''} ${i === active ? 'active' : ''}">
        <div class="name">${esc(p.name)}</div>
        <div class="role">${esc(p.role)}</div>
        ${statusMarkup(bits)}
        <div class="bar-row"><span class="label">HP</span><div class="bar-wrap"><div class="bar-hp" style="width:${hpPct}%"></div></div><span class="nums">${p.hp}/${cap}</span></div>
        <div class="bar-row"><span class="label">MP</span><div class="bar-wrap"><div class="bar-mp" style="width:${mpPct}%"></div></div><span class="nums">${p.mp}/${p.maxMp}</span></div>
      </div>`;
    }).join('');
    const order = $('#turn-order');
    if (order) {
      const chips = turnQueue.map((t, i) => {
        const name = t.type === 'party' ? party[t.index].name : enemies[t.index].name;
        const dead = t.type === 'party' ? party[t.index].hp <= 0 : !enemies[t.index].alive;
        if (dead) return '';
        const side = t.type === 'party' ? ' ally' : ' foe';
        const now = i === combatTurnIndex;
        return `<span class="turn-chip${side}${now ? ' now' : ''}">${now ? 'Now · ' : ''}${esc(name)}</span>`;
      }).join('');
      order.innerHTML = '<span class="turn-label">Order</span>' + chips;
    }
    const held = $('#combat-held');
    if (held && spark) {
      held.textContent = 'Held · Fire ' + spark.fire + ' · Water ' + spark.water + ' · Bolt ' + spark.lightning + ' · Earth ' + (spark.earth || 0)
        + (scarDebt > 0 ? ' · Scar ' + scarDebt + ' (−' + (scarDebt * SCAR_CUT) + ' HP, Mend keeps ' + (scarDebt * SCAR_MEND) + ')' : '');
    }
  }

  function strikeJuice(path, fromMesh, toMesh) {
    if (!path || !combatUI) return;
    combatUI.classList.remove('juice-cleave', 'juice-channel', 'juice-aim');
    const hit = $('#hit-float');
    if (hit) hit.classList.remove('juice-cleave', 'juice-channel', 'juice-aim');
    const cls = path === 'warrior' ? 'juice-cleave' : path === 'mage' ? 'juice-channel' : 'juice-aim';
    combatUI.classList.add(cls);
    if (hit) hit.classList.add(cls);
    if (path === 'warrior') flashMesh(toMesh, 0xff6a2a);
    else if (path === 'mage') flashMesh(fromMesh, 0x7ec8e8);
    else flashMesh(toMesh, 0xd8c8ff);
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
    }, 340);
  }

  function bobParty(on) {
    combatPartyMeshes.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.y = on && mesh.visible ? Math.sin(performance.now() * 0.0022 + i * 0.8) * 0.045 : 0;
    });
  }

  function updateCombatCamera(dt) {
    if (!motionWanted) {
      combatKick = 0;
      bobParty(false);
      camera.position.set(0.4, 4.8, 8.4);
      camera.lookAt(0.2, 1.2, -0.4);
      return;
    }
    bobParty(true);
    combatCameraAngle += dt * 0.12;
    combatKick = Math.max(0, combatKick - dt * 1.6);
    const kick = combatKick * 0.42;
    camera.position.x = 0.4 + Math.sin(combatCameraAngle) * 0.45 + kick;
    camera.position.y = 4.8 + Math.sin(combatCameraAngle * 0.7) * 0.12 - kick * 0.35;
    camera.position.z = 8.4 - kick;
    camera.lookAt(0.2, 1.2 - kick * 0.15, -0.4);
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
    if (reply) {
      const extra = Array.isArray(reply) ? reply : [reply];
      dialogueLines.splice.apply(dialogueLines, [dialogueIndex + 1, 0].concat(extra));
    }
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
    if (gameState === State.OVERWORLD && !inventoryOpen && !encounterLocked && !skyHoldsFeet()) {
      setFieldControls(true);
    }
    const done = dialogueOnDone;
    dialogueOnDone = null;
    dialogueOnPick = null;
    saveGame();
    updateHUD();
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
    creditsFromRun = false;
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
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    combatGroup.visible = false;
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Verdant Isle';
    camera.position.set(playerMesh.position.x, CAMERA_HEIGHT, playerMesh.position.z + CAMERA_DIST);
    runLive = true;
    ensureBed();
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

  function playSting() {
    if (!bedWanted) return;
    ensureBed();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    [392, 588].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = now + i * 0.07;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.055, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  }

  function playDoorSting() {
    if (!bedWanted) return;
    ensureBed();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    [196, 146].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.045;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.04, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.18);
    });
  }

  function cross(fn) {
    const before = locale;
    fn();
    if (locale !== before) playDoorSting();
  }

  function playMergeSting() {
    if (!bedWanted) return;
    ensureBed();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    [311, 466, 622].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = now + i * 0.06;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.05, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.32);
    });
  }

  function readBedPref() {
    try { bedWanted = localStorage.getItem('emberwake.bed') !== 'off'; } catch (err) { bedWanted = true; }
  }

  function ensureBed() {
    if (!bedWanted) {
      if (bedGain) bedGain.gain.value = 0;
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) {
      audioCtx = new AC();
      bedGain = audioCtx.createGain();
      bedGain.gain.value = 0.04;
      bedGain.connect(audioCtx.destination);
      const seconds = 2;
      const rate = audioCtx.sampleRate;
      const buffer = audioCtx.createBuffer(1, Math.floor(rate * seconds), rate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.4;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 240;
      bedFilter = filter;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.value = 0.4;
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(bedGain);
      noise.start();
      bedTones = [78, 117].map((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const tone = audioCtx.createGain();
        tone.gain.value = i === 0 ? 0.07 : 0.035;
        osc.connect(tone);
        tone.connect(bedGain);
        osc.start();
        return osc;
      });
      tuneBed(bedPlace);
    }
    if (bedWanted) bedGain.gain.value = 0.04;
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function tuneBed(place) {
    bedPlace = place === 'coast' ? 'coast' : place === 'claim' ? 'claim' : 'field';
    if (!bedFilter || !bedTones) return;
    const spec = bedPlace === 'coast'
      ? { cut: 520, freqs: [92, 138] }
      : bedPlace === 'claim'
        ? { cut: 140, freqs: [55, 82] }
        : { cut: 240, freqs: [78, 117] };
    bedFilter.frequency.value = spec.cut;
    bedTones.forEach((osc, i) => { osc.frequency.value = spec.freqs[i]; });
  }

  function syncMotion() {
    document.body.classList.toggle('still-motion', !motionWanted);
    const label = motionWanted ? 'Motion' : 'Still';
    ['#btn-motion', '#btn-pack-motion'].forEach((sel) => {
      const btn = $(sel);
      if (!btn) return;
      btn.textContent = label;
      btn.setAttribute('aria-pressed', motionWanted ? 'true' : 'false');
    });
  }

  function syncPace() {
    const btn = $('#btn-pace');
    const word = combatPace === 'slow' ? 'Slow' : combatPace === 'brisk' ? 'Brisk' : 'Steady';
    if (btn) btn.textContent = 'Pace · ' + word;
  }

  function loadEase() {
    let stored = null;
    let pace = null;
    try {
      stored = localStorage.getItem('emberwake.motion');
      pace = localStorage.getItem('emberwake.pace');
    } catch (err) { /* ignore */ }
    if (stored === 'off') motionWanted = false;
    else if (stored === 'on') motionWanted = true;
    else motionWanted = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pace === 'slow' || pace === 'brisk' || pace === 'steady') combatPace = pace;
    syncMotion();
    syncPace();
  }

  function setMotion(on) {
    motionWanted = !!on;
    try { localStorage.setItem('emberwake.motion', motionWanted ? 'on' : 'off'); } catch (err) { /* ignore */ }
    syncMotion();
    saveGame();
  }

  function cyclePace() {
    combatPace = combatPace === 'steady' ? 'brisk' : combatPace === 'brisk' ? 'slow' : 'steady';
    try { localStorage.setItem('emberwake.pace', combatPace); } catch (err) { /* ignore */ }
    syncPace();
    saveGame();
  }

  function setBed(on) {
    bedWanted = !!on;
    try { localStorage.setItem('emberwake.bed', bedWanted ? 'on' : 'off'); } catch (err) { /* ignore */ }
    if (!bedWanted && bedGain) bedGain.gain.value = 0;
    else ensureBed();
    updateHUD();
  }

  function knownPlaces() {
    const rows = [{ name: 'Verdant Isle', note: 'Where she woke.' }];
    if (seenBeats.village) rows.push({ name: 'Leaf-village', note: 'The argument about the seal.' });
    if (seenBeats.cellar || seenBeats.kiln) rows.push({ name: 'Root-cellar', note: 'The kiln under the arch.' });
    if (seenBeats.coastRoute || seenBeats['vault-face'] || regionId === 'stormreach') rows.push({ name: 'Stormreach Coast', note: 'Shale, lightning, the harbor vault.' });
    if (seenBeats['vault-ledger'] || seenBeats['bottle-hall']) rows.push({ name: 'Harbor vault', note: 'The count and the bottle-hall.' });
    if (seenBeats.marrowStep) rows.push({ name: 'Ashen Marrow', note: 'The digest-engine and the ash shelf.' });
    if (pipeWord || seenBeats['pipe-feed']) {
      rows.push({ name: 'Engine pipe', note: pipeWord === 'crack' ? 'The feed is cracked.' : pipeWord === 'leave' ? 'The feed stayed corked.' : 'The valve is a choice.' });
    }
    if (throatWord || seenBeats['throat-name']) {
      rows.push({ name: 'Sealed throat', note: throatWord === 'name' ? 'The name is in the spark.' : 'The word stayed in the glass.' });
    }
    if (seenBeats.yardStep) {
      const slag = pools.find((p) => p.id === 'yard-slag');
      const yardNote = slag && !slag.absorbed && !slag.bottled
        ? 'Walked. The slag is still a mouth.'
        : 'Through the stone west of the engine. Kestrel did not carry you.';
      rows.push({ name: 'Concord yard', note: yardNote });
    } else if (seenBeats.marrowStep) rows.push({ name: 'Concord yard', note: 'Not walked yet. The stone is west of the engine.' });
    if (seenBeats.markStep) {
      const weep = pools.find((p) => p.id === 'mark-weep');
      let note = 'The rumour has a pillar. Kestrel did not carry you.';
      if (!seenBeats.markFight) note = 'Walked. A counter is still on the road.';
      else if (weep && weep.absorbed) note = 'The weep is in the spark. The remnant is not this pillar.';
      else if (weep && weep.bottled) note = 'The weep was numbered. The pillar stayed.';
      else note = 'Walked. The weep is still a mouth.';
      rows.push({ name: 'Remnant Mark', note: note });
    } else if (seenBeats.yardStep) {
      rows.push({ name: 'Remnant Mark', note: 'Not walked yet. North of the yard. The list does not carry you.' });
    }
    if (seenBeats.naveStep) {
      const note = naveWord === 'name'
        ? 'The hinge is named. The door stayed shut.'
        : naveWord === 'turn'
          ? 'The seal was left. The cathedral stayed.'
          : 'Walked. The door is still a choice.';
      rows.push({ name: 'Ash nave', note: note });
    } else if (seenBeats.markFight) {
      rows.push({ name: 'Ash nave', note: 'Not walked yet. North of the pillar. The list does not carry you.' });
    }
    if (seenBeats.gallery || galleryWord) {
      const galleryNote = galleryWord === 'read'
        ? 'Licence Zero is read. The stair goes down.'
        : galleryWord === 'file'
          ? 'The hinge is filed. The stair goes down.'
          : 'Walked. The count is still a choice.';
      rows.push({ name: 'Watch gallery', note: galleryNote });
    } else if (seenBeats.naveStep) {
      rows.push({ name: 'Watch gallery', note: 'Not walked yet. East of the sealed door. The list does not carry you.' });
    }
    if (seenBeats.cryptStep || cryptWord) {
      const cryptNote = cryptWord === 'digit'
        ? 'A digit is in the crack. The bar stayed shut.'
        : cryptWord === 'mouth'
          ? 'The crack took a scar. The bar stayed shut.'
          : cryptWord === 'leave'
            ? 'The crack was left. The bar stayed shut.'
            : 'Walked. The auditor or the crack is still ahead.';
      rows.push({ name: 'Count crypt', note: cryptNote });
    } else if (galleryWord) {
      rows.push({ name: 'Count crypt', note: 'Not walked yet. Down the count-stair. The list does not carry you.' });
    }
    if (seenBeats.breachStep || breachWord) {
      const breachNote = breachWord === 'hold'
        ? 'The threshold is held. The bar stayed shut.'
        : breachWord === 'mouth'
          ? 'The light took a scar. The bar stayed shut.'
          : breachWord === 'back'
            ? 'You stepped back. The bar stayed shut.'
            : 'Walked. The last stand or the light is still ahead.';
      rows.push({ name: 'First breach', note: breachNote });
    } else if (cryptWord === 'digit') {
      rows.push({ name: 'First breach', note: 'Not walked yet. North of the widened crack. The list does not carry you.' });
    }
    if (seenBeats.claimStep || claimWord) {
      const claimNote = seenBeats.aftermath
        ? 'The flag was set. The ending is written north of it.'
        : claimWord === 'claim'
          ? 'The spark claimed it. North is the aftermath.'
          : claimWord === 'refuse'
            ? 'Refused. North is the aftermath.'
            : claimWord === 'share'
              ? 'Shared. She did not enter. North is the aftermath.'
              : claimWord === 'burn'
                ? 'Burned. The scar took the ash. North is the aftermath.'
                : 'Walked. The rite or the claim is still ahead.';
      rows.push({ name: 'Remnant claim', note: claimNote });
    } else if (breachWord === 'hold') {
      rows.push({ name: 'Remnant claim', note: 'Not walked yet. North, past the bar. The list does not carry you.' });
    }
    if (seenBeats.endStep || seenBeats.aftermath) {
      const endNote = !seenBeats.aftermath
        ? 'Walked. The ending is still being heard.'
        : claimWord === 'burn'
          ? 'Written. The scar is the echo. Scar debt ' + scarDebt + '.'
          : claimWord === 'refuse'
            ? 'Written. The licence kept its number.'
            : claimWord === 'share'
              ? 'Written. Two hungers remain.'
              : 'Written. Lira still wears it.';
      rows.push({ name: 'Aftermath', note: endNote });
    } else if (claimWord) {
      rows.push({ name: 'Aftermath', note: 'Not walked yet. North of the mass, after the flag. The list does not carry you.' });
    }
    return rows;
  }

  function openPlaces() {
    if (gameState !== State.OVERWORLD || encounterLocked || dialogueOpen) return;
    const panel = $('#places-panel');
    const list = $('#places-list');
    if (!panel || !list) return;
    list.innerHTML = knownPlaces().map((place) => `<li><strong>${esc(place.name)}</strong><span>${esc(place.note)}</span></li>`).join('');
    panel.classList.remove('hidden');
  }

  function closePlaces() {
    const panel = $('#places-panel');
    if (panel) panel.classList.add('hidden');
  }

  function setupUI() {
    readBedPref();
    function beginWake() {
      try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
      runLive = false;
      resetRun();
      const confirm = $('#wake-confirm');
      if (confirm) confirm.classList.add('hidden');
      titleScreen.classList.add('hidden');
      creditsScreen.classList.add('hidden');
      pathScreen.classList.remove('hidden');
      gameState = State.PATH;
    }
    $('#btn-start').addEventListener('click', () => {
      ensureBed();
      const confirm = $('#wake-confirm');
      if (readSave() && confirm) {
        confirm.classList.remove('hidden');
        return;
      }
      beginWake();
    });
    const wakeYes = $('#btn-wake-yes');
    if (wakeYes) wakeYes.addEventListener('click', () => {
      ensureBed();
      beginWake();
    });
    const wakeStay = $('#btn-wake-stay');
    if (wakeStay) wakeStay.addEventListener('click', () => {
      const confirm = $('#wake-confirm');
      if (confirm) confirm.classList.add('hidden');
    });
    const continueBtn = $('#btn-continue');
    if (continueBtn) continueBtn.addEventListener('click', () => {
      ensureBed();
      continueRun();
    });
    const bedBtn = $('#btn-bed');
    if (bedBtn) bedBtn.addEventListener('click', () => setBed(!bedWanted));
    const motionBtn = $('#btn-motion');
    if (motionBtn) motionBtn.addEventListener('click', () => setMotion(!motionWanted));
    const packMotion = $('#btn-pack-motion');
    if (packMotion) packMotion.addEventListener('click', () => setMotion(!motionWanted));
    const paceBtn = $('#btn-pace');
    if (paceBtn) paceBtn.addEventListener('click', () => cyclePace());
    const placesBtn = $('#btn-places');
    if (placesBtn) placesBtn.addEventListener('click', () => {
      const panel = $('#places-panel');
      if (panel && !panel.classList.contains('hidden')) closePlaces();
      else openPlaces();
    });
    const placesClose = $('#btn-places-close');
    if (placesClose) placesClose.addEventListener('click', closePlaces);
    const locBtn = $('#hud-location');
    if (locBtn) {
      let placeTimer = null;
      locBtn.addEventListener('pointerdown', () => {
        placeTimer = setTimeout(() => {
          placeTimer = null;
          openPlaces();
        }, 420);
      });
      const endHold = () => {
        if (placeTimer) {
          clearTimeout(placeTimer);
          placeTimer = null;
          openPlaces();
        }
      };
      locBtn.addEventListener('pointerup', endHold);
      locBtn.addEventListener('pointercancel', () => {
        if (placeTimer) clearTimeout(placeTimer);
        placeTimer = null;
      });
    }
    $('#btn-credits').addEventListener('click', () => {
      creditsFromRun = false;
      titleScreen.classList.add('hidden');
      creditsScreen.classList.remove('hidden');
    });
    $('#btn-credits-close').addEventListener('click', () => {
      creditsScreen.classList.add('hidden');
      if (creditsFromRun) {
        creditsFromRun = false;
        titleScreen.classList.add('hidden');
        if (locale === 'aftermath' && !seenBeats.rematchTease) {
          seenBeats.rematchTease = true;
          showToast('The rite remembers the ward. A second walk is not this save. Wake throws the ending out. The scar stays on Lira.');
          updateHUD();
          saveGame();
        }
        return;
      }
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
    else if (gameState === State.COMBAT || gameState === State.VICTORY) {
      updateCombatCamera(dt);
      pulseHost();
    }
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
        merges: Object.keys(merges).filter((key) => merges[key]),
        hallWord: hallWord,
        marrowWord: marrowWord,
        scarDebt: scarDebt,
        scarMarks: scarMarks,
        vesperAsh: vesperAsh,
        pipeWord: pipeWord,
        throatWord: throatWord,
        kestrelMarrow: kestrelMarrow,
        yardWord: yardWord,
        markWord: markWord,
        naveWord: naveWord,
        galleryWord: galleryWord,
        feedNoted: !!feedNoted,
        passageNoted: !!passageNoted,
        feedSpent: !!feedSpent,
        passageLaid: !!passageLaid,
        cryptWord: cryptWord,
        breachWord: breachWord,
        breachAsh: !!breachAsh,
        claimWord: claimWord,
        kestrelClaim: kestrelClaim,
        kestrelNave: kestrelNave,
        duelWord: duelWord,
        kestrelWord: kestrelWord,
        motion: motionWanted,
        pace: combatPace,
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
    merges = {};
    (data.merges || []).forEach((id) => {
      if (MERGE_OK[id]) merges[id] = true;
    });
    if (data.mergeWord && MERGE_OK[data.mergeWord]) merges[data.mergeWord] = true;
    const held = Object.keys(merges).filter((key) => merges[key]);
    mergeWord = data.mergeWord && MERGE_OK[data.mergeWord] ? data.mergeWord : (held.length ? held[held.length - 1] : null);
    hallWord = data.hallWord === 'crack' || data.hallWord === 'leave' ? data.hallWord : null;
    marrowWord = data.marrowWord === 'bank' || data.marrowWord === 'leave' || data.marrowWord === 'fed' ? data.marrowWord : null;
    scarDebt = typeof data.scarDebt === 'number' ? Math.max(0, data.scarDebt) : 0;
    scarMarks = data.scarMarks && typeof data.scarMarks === 'object' ? data.scarMarks : {};
    vesperAsh = data.vesperAsh === 'taste' || data.vesperAsh === 'refuse' ? data.vesperAsh : null;
    pipeWord = data.pipeWord === 'crack' || data.pipeWord === 'leave' ? data.pipeWord : null;
    throatWord = data.throatWord === 'name' || data.throatWord === 'cork' ? data.throatWord : null;
    kestrelMarrow = data.kestrelMarrow === 'ask' || data.kestrelMarrow === 'air' ? data.kestrelMarrow : null;
    yardWord = data.yardWord === 'drink' || data.yardWord === 'seal' ? data.yardWord : null;
    markWord = data.markWord === 'drink' || data.markWord === 'seal' ? data.markWord : null;
    naveWord = data.naveWord === 'name' || data.naveWord === 'turn' ? data.naveWord : null;
    galleryWord = data.galleryWord === 'read' || data.galleryWord === 'file' ? data.galleryWord : null;
    feedNoted = !!data.feedNoted;
    passageNoted = !!data.passageNoted;
    feedSpent = !!data.feedSpent;
    passageLaid = !!data.passageLaid;
    cryptWord = data.cryptWord === 'digit' || data.cryptWord === 'mouth' || data.cryptWord === 'leave' ? data.cryptWord : null;
    breachWord = data.breachWord === 'hold' || data.breachWord === 'mouth' || data.breachWord === 'back' ? data.breachWord : null;
    breachAsh = !!data.breachAsh;
    claimWord = data.claimWord === 'claim' || data.claimWord === 'refuse' || data.claimWord === 'share' || data.claimWord === 'burn' ? data.claimWord : null;
    kestrelClaim = data.kestrelClaim === 'land' || data.kestrelClaim === 'air' ? data.kestrelClaim : null;
    kestrelNave = data.kestrelNave === 'ask' || data.kestrelNave === 'air' ? data.kestrelNave : null;
    if (marrowStain) marrowStain.visible = vesperAsh === 'refuse';
    if (typeof spark.earth !== 'number') spark.earth = 0;
    duelWord = data.duelWord === 'press' || data.duelWord === 'hold' ? data.duelWord : null;
    kestrelWord = data.kestrelWord === 'ask' || data.kestrelWord === 'leave' ? data.kestrelWord : null;
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
    const kilnPool = pools.find((pool) => pool.id === 'kiln');
    if (kilnPool && kilnPool.absorbed && !scarMarks.kiln) {
      scarMarks.kiln = true;
      scarDebt += 1;
    }
    if (hallWord === 'crack' && !scarMarks.cork) {
      scarMarks.cork = true;
      scarDebt += 1;
    }
    const leakPool = pools.find((pool) => pool.id === 'marrow-leak');
    if (leakPool && leakPool.absorbed && !scarMarks.leak) {
      scarMarks.leak = true;
      scarDebt += 1;
      if (marrowWord !== 'bank') marrowWord = 'fed';
    }
    if (marrowWord === 'bank' && leakPool && !leakPool.absorbed) leakPool.withheld = true;
    clampHostHp();
    grantReadyMerges({ quiet: true });
    if (typeof data.motion === 'boolean') motionWanted = data.motion;
    if (data.pace === 'slow' || data.pace === 'brisk' || data.pace === 'steady') combatPace = data.pace;
    try {
      localStorage.setItem('emberwake.motion', motionWanted ? 'on' : 'off');
      localStorage.setItem('emberwake.pace', combatPace);
    } catch (err) { /* ignore */ }
    syncMotion();
    syncPace();
    refreshRumor();
  }

  function savePlaceName(data) {
    const names = {
      field: data.region === 'stormreach' ? 'Stormreach Coast' : 'Verdant Isle',
      'leaf-village': 'Leaf-village',
      'root-cellar': 'Root-cellar',
      'harbor-vault': 'Harbor Vault',
      'marrow-pipe': 'Engine pipe',
      'engine-throat': 'Sealed throat',
      'ashen-marrow': 'Ashen Marrow',
      'concord-yard': 'Concord Yard',
      'remnant-mark': 'Remnant Mark',
      'ash-nave': 'Ash Nave',
      'watch-gallery': 'Watch Gallery',
      'count-crypt': 'Count Crypt',
      'first-breach': 'First Breach',
      'remnant-claim': 'Remnant Claim',
      aftermath: 'Aftermath',
    };
    return names[data.locale] || names.field;
  }

  function saveBlurb(data) {
    const beats = data.seenBeats || {};
    if (data.locale === 'aftermath' || beats.aftermath) return 'The ending is written on this save. Wake throws it out and starts another host.';
    if (beats['furrow-letter']) return 'The cousin’s letter is in the pack. One save in this browser.';
    if (beats['gallery-margin']) return 'The gallery’s filed copy was read. One save in this browser.';
    if (beats['nave-pressure']) return 'The nave chalk was read. One save in this browser.';
    if (beats['yard-camp']) return 'They rested in the Concord yard. One save in this browser.';
    return 'One save in this browser. Wake throws it out.';
  }

  function refreshTitle() {
    const btn = $('#btn-continue');
    const note = $('#continue-note');
    const data = readSave();
    if (btn) {
      btn.classList.toggle('hidden', !data);
      btn.textContent = data ? ('Continue — ' + savePlaceName(data)) : 'Continue';
    }
    if (note) {
      note.textContent = data ? saveBlurb(data) : '';
      note.classList.toggle('hidden', !data);
    }
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
    if (data.locale === 'ashen-marrow') enterMarrow({ silent: true, pos: data.pos });
    else if (data.locale === 'concord-yard') enterYard({ silent: true, pos: data.pos });
    else if (data.locale === 'remnant-mark') enterMark({ silent: true, pos: data.pos });
    else if (data.locale === 'ash-nave') enterNave({ silent: true, pos: data.pos });
    else if (data.locale === 'watch-gallery') enterGallery({ silent: true, pos: data.pos });
    else if (data.locale === 'count-crypt') enterCrypt({ silent: true, pos: data.pos });
    else if (data.locale === 'first-breach') enterBreach({ silent: true, pos: data.pos });
    else if (data.locale === 'remnant-claim') enterClaim({ silent: true, pos: data.pos });
    else if (data.locale === 'aftermath') enterAftermath({ silent: true, pos: data.pos });
    else if (resumeInterior) enterInterior(data.locale, { silent: true, pos: data.pos });
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
    if (skyHoldsFeet()) return;
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
    if (skyHoldsFeet()) return;
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
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
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
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    if (locale === 'field' && overworldGroup) {
      overworldGroup.visible = true;
      placeFog('verdant');
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
        desc: 'The thermal from the woken waystone to Stormreach. Not a Concord licence. It does not open a door by itself.',
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
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    if (interiorGroup) interiorGroup.visible = false;
    placeFog(regionId === 'stormreach' ? 'stormreach' : 'verdant');
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
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    skyPass = null;
    enterRegion('stormreach');
    if (gameState === State.OVERWORLD && !dialogueOpen && !inventoryOpen && !encounterLocked) {
      setFieldControls(true);
    }
  }

  const MERGE_OK = { plasma: 1, steam: 1, storm: 1, magma: 1, glass: 1 };
  const MERGE_NAMES = { plasma: 'Plasma', steam: 'Steam', storm: 'Storm', magma: 'Magma', glass: 'Glass' };
  const MERGE_RULES = [
    { id: 'plasma', need: { fire: 1, lightning: 1 } },
    { id: 'steam', need: { fire: 1, water: 1 } },
    { id: 'storm', need: { water: 1, lightning: 1 } },
    { id: 'magma', need: { fire: 1, earth: 1 } },
    { id: 'glass', need: { lightning: 1, earth: 1 } },
  ];

  function earnedMergeNames() {
    return Object.keys(MERGE_NAMES).filter((id) => merges[id]).map((id) => MERGE_NAMES[id]);
  }

  function mergeReady(rule) {
    const need = rule.need;
    return Object.keys(need).every((el) => (spark[el] || 0) >= need[el]);
  }

  function grantReadyMerges(opts) {
    const gained = [];
    MERGE_RULES.forEach((rule) => {
      if (merges[rule.id] || !mergeReady(rule)) return;
      merges[rule.id] = true;
      mergeWord = rule.id;
      gained.push(MERGE_NAMES[rule.id]);
    });
    if (!gained.length) return gained;
    if (!(opts && opts.quiet)) {
      showToast(gained.join(', ') + (gained.length === 1 ? ' stays' : ' stay') + ' on the magic list.');
    }
    refreshRumor();
    saveGame();
    return gained;
  }

  function noteMerge() {
    seenBeats['merge-tease'] = true;
    grantReadyMerges({ quiet: true });
  }

  function noteHall(id) {
    hallWord = id === 'crack' ? 'crack' : 'leave';
    seenBeats['bottle-hall'] = true;
    let gained = [];
    if (hallWord === 'crack') {
      spark.earth = (spark.earth || 0) + 1;
      applyStrain(14);
      if (!seals.some((seal) => seal.name === 'Cracked Earth Cork')) {
        seals.push({
          name: 'Cracked Earth Cork',
          desc: 'Not a licence. A mouthful of sealed earth from the harbor spectacle. The marrow bottle did not move.',
        });
      }
      gained = grantReadyMerges({ quiet: true });
      addScar('cork');
    }
    if (hallWord === 'crack') {
      const spellBit = gained.length
        ? ' ' + gained.join(', ') + (gained.length === 1 ? ' stays' : ' stay') + ' on the magic list.'
        : '';
      showToast('The earth cork cracks. A mouthful stays in the teeth. Strain ' + spark.strain + '/100.' + spellBit + scarDebtLine());
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function skyHoldsFeet() {
    return !!(skyPass && (skyPass.mode === 'coast' || skyPass.mode === 'land' || skyPass.mode === 'marrow'));
  }

  function scarDebtLine() {
    return ' Scar debt ' + scarDebt + '. Lira’s max HP is cut by ' + (scarDebt * SCAR_CUT) + '.';
  }

  function addScar(source, opts) {
    if (!source || scarMarks[source]) return false;
    const before = scarDebt;
    scarMarks[source] = true;
    scarDebt += 1;
    clampHostHp();
    if (!(opts && opts.quiet) && before < 2 && scarDebt >= 2) {
      showToast('The scar reaches the walk. Lira coughs. The feet go slower.');
    }
    return true;
  }

  function noteVesperAsh(id) {
    if (vesperAsh) return;
    vesperAsh = id === 'taste' ? 'taste' : 'refuse';
    seenBeats['marrow-vesper'] = true;
    const before = scarDebt;
    if (vesperAsh === 'taste') {
      addScar('vesper-taste', { quiet: true });
      applyStrain(6);
      if (!seals.some((seal) => seal.name === "Vesper's Thumb")) {
        seals.push({
          name: "Vesper's Thumb",
          desc: 'She breathed across the scar and did not step in. The rot in the teeth thickened. The host is still Lira.',
        });
      }
      const cough = before < 2 && scarDebt >= 2 ? ' Lira coughs. The feet go slower.' : '';
      showToast('Vesper tastes the scar and does not enter. The rot thickens.' + cough + scarDebtLine());
    } else {
      applyStrain(3);
      if (marrowStain) marrowStain.visible = true;
      if (!seals.some((seal) => seal.name === 'Refused Mouth')) {
        seals.push({
          name: 'Refused Mouth',
          desc: 'Lira refused Vesper’s mouth on the ash. The stain stayed. Refusal is not a cleaning. She did not take the host.',
        });
      }
      showToast('You refuse her mouth. A stain stays on the ash. She does not enter.');
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function enterMarrow(opts) {
    const silent = opts && opts.silent;
    if (!marrowGroup || !playerMesh) return;
    if (!silent && (skyPass || dialogueOpen || !seenBeats['bottle-hall'])) return;
    locale = 'ashen-marrow';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    marrowGroup.add(playerMesh);
    const px = silent && opts.pos && opts.pos.x != null ? opts.pos.x : 0;
    const pz = silent && opts.pos && opts.pos.z != null ? opts.pos.z : 3.1;
    playerMesh.position.set(px, 0, pz);
    if (interiorGroup) interiorGroup.visible = false;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    if (coastGroup) coastGroup.visible = false;
    marrowGroup.visible = true;
    placeFog('marrow');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Ashen Marrow';
    camera.position.set(px, CAMERA_HEIGHT, pz + CAMERA_DIST);
    camera.lookAt(px, 1, pz);
    if (!silent && !seenBeats.marrowStep) {
      const fn = EW.scenes['marrow-road'];
      if (typeof fn === 'function') {
        const played = fn();
        if (played !== false && dialogueOpen) pendingBeat = 'marrow-road';
      }
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function exitMarrow() {
    if (locale !== 'ashen-marrow' || !playerMesh || !interiorGroup) return;
    locale = 'harbor-vault';
    if (playerMesh.parent) playerMesh.parent.remove(playerMesh);
    interiorGroup.add(playerMesh);
    playerMesh.position.set(0, 0, -14.2);
    marrowGroup.visible = false;
    interiorGroup.visible = true;
    if (vaultRoom) vaultRoom.visible = true;
    if (overworldGroup) overworldGroup.visible = false;
    if (stormreachGroup) stormreachGroup.visible = false;
    placeFog('vault');
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Harbor Vault';
    camera.position.set(0, CAMERA_HEIGHT, -14.2 + CAMERA_DIST);
    camera.lookAt(0, 1, -14.2);
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function talkMarrow() {
    if (locale !== 'ashen-marrow' || dialogueOpen || skyPass) return;
    const leak = pools.find((pool) => pool.id === 'marrow-leak');
    if (marrowWord === 'bank') {
      showToast('The leak is banked. The engine is still hungry, and the hall is south. Scar debt ' + scarDebt + '.');
      return;
    }
    if (leak && leak.absorbed) {
      if (marrowWord !== 'bank') marrowWord = 'fed';
      showToast('The mouthful is already in her. The tender cannot pull it back.' + scarDebtLine());
      saveGame();
      return;
    }
    const fn = EW.scenes['marrow-tender'];
    if (typeof fn === 'function') fn();
  }

  function noteMarrowStep() {
    seenBeats.marrowStep = true;
    seenBeats.marrowRoad = true;
    if (!seals.some((seal) => seal.name === 'Walked Marrow')) {
      seals.push({
        name: 'Walked Marrow',
        desc: 'Not a licence. Feet left the bottle-hall onto the ash. The digest-engine is real. South is the hall.',
      });
    }
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function noteMarrowChoice(id) {
    if (id !== 'bank') {
      marrowWord = marrowWord || 'leave';
      refreshRumor();
      saveGame();
      return;
    }
    const leak = pools.find((pool) => pool.id === 'marrow-leak');
    if (leak && leak.absorbed) {
      marrowWord = 'fed';
      showToast('The leak is already in her. Banking cannot pull it back.' + scarDebtLine());
      saveGame();
      return;
    }
    if (leak) leak.withheld = true;
    marrowWord = 'bank';
    scarMarks.bank = true;
    const beforeDebt = scarDebt;
    if (scarDebt > 0) {
      scarDebt -= 1;
      clampHostHp();
    }
    if (!seals.some((seal) => seal.name === 'Banked Leak')) {
      seals.push({
        name: 'Banked Leak',
        desc: 'The tender corked the engine’s mouth. One point of scar debt eased, if there was a point to ease. The engine is still there.',
      });
    }
    const easedWalk = beforeDebt >= 2 && scarDebt < 2;
    showToast(beforeDebt > 0
      ? 'The tender banks the leak. Scar debt ' + scarDebt + '. Lira’s max HP is cut by ' + (scarDebt * SCAR_CUT) + '.'
        + (easedWalk ? ' The cough eases. The feet remember their pace.' : '')
      : 'The tender banks the leak. There was no scar debt to give back. The mouth stays corked.');
    refreshRumor();
    updateHUD();
    saveGame();
  }

  function playMarrowLook() {
    enterMarrow();
  }

  function updateMarrowPass(dt) {
    if (!skyPass || skyPass.mode !== 'marrow') return;
    skyPass.t += dt;
    if (marrowGroup && marrowGroup.userData.leak) {
      marrowGroup.userData.leak.intensity = 1.1 + Math.abs(Math.sin(skyPass.t * 3)) * 0.8;
    }
    camera.position.lerp(new THREE.Vector3(4, 4.2, 6), 0.08);
    camera.lookAt(0, 1.4, -2);
    if (skyPass.t >= skyPass.dur && !dialogueOpen) finishMarrow();
  }

  function finishMarrow() {
    if (locale === 'ashen-marrow') {
      exitMarrow();
      return;
    }
    if (marrowBusy) return;
    marrowBusy = true;
    skyPass = null;
    if (marrowGroup) marrowGroup.visible = false;
    if (yardGroup) yardGroup.visible = false;
    if (markGroup) markGroup.visible = false;
    tuckCathedral();
    if (interiorGroup) interiorGroup.visible = locale !== 'field';
    if (vaultRoom) vaultRoom.visible = locale === 'harbor-vault';
    if (villageRoom) villageRoom.visible = locale === 'leaf-village';
    if (cellarRoom) cellarRoom.visible = locale === 'root-cellar';
    scene.fog.color.set(0x1a222c);
    scene.fog.near = 18;
    scene.fog.far = 55;
    renderer.setClearColor(0x1a222c);
    const locLabel = $('#hud-location');
    if (locLabel) locLabel.textContent = 'Harbor Vault';
    if (playerMesh) {
      camera.position.set(playerMesh.position.x, playerMesh.position.y + CAMERA_HEIGHT, playerMesh.position.z + CAMERA_DIST);
      camera.lookAt(playerMesh.position.x, playerMesh.position.y + 1, playerMesh.position.z);
    }
    if (!seenBeats.marrowRoad) {
      seenBeats.marrowRoad = true;
      if (!seals.some((seal) => seal.name === 'Unwalked Marrow')) {
        seals.push({
          name: 'Unwalked Marrow',
          desc: 'Not a road. A look from the bottle-hall at the inland leak and the digest-engine. The feet stayed.',
        });
      }
    }
    refreshRumor();
    updateHUD();
    saveGame();
    if (gameState === State.OVERWORLD && !dialogueOpen && !inventoryOpen && !encounterLocked) {
      setFieldControls(true);
    }
  }

  function noteLedger(id) {
    seenBeats['vault-ledger'] = true;
    if (id === 'sign' && !seals.some((seal) => seal.name === 'Witness Line')) {
      seals.push({
        name: 'Witness Line',
        desc: 'Not a licence. Lira’s name on the harbor vault’s short count. The bottles did not move. A clerk will remember the signature.',
      });
    }
    refreshRumor();
    saveGame();
  }

  function noteKestrelAsk(id) {
    kestrelWord = id === 'ask' ? 'ask' : 'leave';
    seenBeats['kestrel-ask'] = true;
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
    if (skyPass.mode === 'marrow') updateMarrowPass(dt);
    else if (skyPass.mode === 'coast' || skyPass.mode === 'land') updateCoastPass(dt);
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
  EW.noteLedger = noteLedger;
  EW.seenLedger = function () { return !!seenBeats['vault-ledger']; };
  EW.noteKestrelAsk = noteKestrelAsk;
  EW.noteLetter = noteLetter;
  EW.hasMargin = hasMargin;
  EW.noteChest = noteChest;
  EW.noteCord = noteCord;
  EW.noteNotice = noteNotice;
  EW.noteMargin = noteMargin;
  EW.notePressure = notePressure;
  EW.noteCamp = noteCamp;
  EW.breachWord = function () { return breachWord; };
  EW.noteHall = noteHall;
  EW.finishMarrow = finishMarrow;
  EW.noteMarrowStep = noteMarrowStep;
  EW.noteMarrowChoice = noteMarrowChoice;
  EW.noteVesperAsh = noteVesperAsh;
  EW.scarCount = function () { return scarDebt; };
  EW.scarCut = function () { return SCAR_CUT; };
  EW.notePipe = notePipe;
  EW.maybeStartPipeFight = maybeStartPipeFight;
  EW.noteThroat = noteThroat;
  EW.throatNamed = function () { return throatWord === 'name'; };
  EW.noteKestrelMarrow = noteKestrelMarrow;
  EW.noteYard = noteYard;
  EW.noteMark = noteMark;
  EW.noteNave = noteNave;
  EW.noteGallery = noteGallery;
  EW.noteCrypt = noteCrypt;
  EW.noteBreach = noteBreach;
  EW.noteClaim = noteClaim;
  EW.noteKestrelClaim = noteKestrelClaim;
  EW.claimWord = function () { return claimWord; };
  EW.kestrelClaimWord = function () { return kestrelClaim; };
  EW.feedThin = function () { return !!feedSpent; };
  EW.passageLaid = function () { return !!passageLaid; };
  EW.noteKestrelNave = noteKestrelNave;
  EW.packHas = function (name) { return !!(seals && seals.some((seal) => seal.name === name)); };
  EW.naveChoice = function () { return naveWord; };
  EW.poolMark = function (id) {
    const pool = pools.find((p) => p.id === id);
    if (!pool) return 'gone';
    if (pool.absorbed) return 'drunk';
    if (pool.bottled || pool.withheld) return 'sealed';
    return 'open';
  };
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
    loadEase();
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
