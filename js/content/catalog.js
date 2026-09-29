/**
 * Phase 1 catalogs: paths, gear, consumables, spells, bestiary.
 * Act I and later acts add rows through Emberwake.registerGear / registerEnemy
 * / registerSpell, or by editing these tables. Combat reads Emberwake.content.
 */
(function (Emberwake) {
  'use strict';

  var content = Emberwake.content;

  content.elementColor = { fire: 0xff6a1a, water: 0x3ec6ff, lightning: 0xd2b4ff };
  content.pathLabel = { warrior: 'Warrior', mage: 'Mage', ranged: 'Ranged' };
  content.whoName = { lira: 'Lira', torren: 'Torren', nima: 'Nima' };
  content.shardName = { fire: 'Cinder Shard', water: 'Tide Shard', lightning: 'Storm Shard' };

  content.pathStats = {
    warrior: { maxHp: 118, maxMp: 24, atk: 16, def: 10, magAtk: 6 },
    mage: { maxHp: 86, maxMp: 64, atk: 8, def: 6, magAtk: 18 },
    ranged: { maxHp: 100, maxMp: 36, atk: 14, def: 7, magAtk: 10 },
  };

  content.gear = {
    'scout-knife': { name: 'Scout Knife', slot: 'weapon', who: 'lira', atk: 3, desc: 'Honest road iron. It does not pretend to be a relic.' },
    'ashwood-blade': { name: 'Ashwood Blade', slot: 'weapon', who: 'lira', atk: 7, path: 'warrior', affinity: 'fire', desc: 'Fire in the grain. Hits harder once the spark has eaten ember.' },
    'wellwood-staff': { name: 'Wellwood Staff', slot: 'weapon', who: 'lira', atk: 1, mag: 6, path: 'mage', affinity: 'water', desc: 'Cut from the well-copse. Water answers it.' },
    'reed-bow': { name: 'Reed Bow', slot: 'weapon', who: 'lira', atk: 5, path: 'ranged', affinity: 'lightning', desc: 'A spare string from an eagle-rider. It hums before storms.' },
    'quilt-jerkin': { name: 'Quilted Jerkin', slot: 'armor', who: 'lira', def: 3, desc: 'Village stitchwork. Stops a claw, not a verdict.' },
    'ledger-cudgel': { name: 'Ledger Cudgel', slot: 'weapon', who: 'torren', atk: 5, desc: 'Torren kept the weight and burned the insignia.' },
    'seal-coat': { name: 'Quartermaster Coat', slot: 'armor', who: 'torren', def: 5, desc: 'Concord cloth, insignia scorched off. It still remembers ranks.' },
    'herb-rod': { name: 'Herb Rod', slot: 'weapon', who: 'nima', atk: 2, mag: 3, desc: 'A walking stick that happens to be medicine.' },
    'herb-shawl': { name: 'Herb Shawl', slot: 'armor', who: 'nima', def: 2, mag: 2, desc: 'Wet leaves and mercy. Both cling.' },
  };

  content.items = {
    tonic: { name: 'Verdant Tonic', desc: 'Nima’s bitter green. Closes a wound. Does not answer a question.', heal: 42, field: true, combat: true },
    phial: { name: 'Wellwater Phial', desc: 'A mouthful of the deep well. Steadies the reserve behind the eyes.', mp: 28, field: true, combat: true },
    rotash: { name: 'Rot-ash', desc: 'A curdled pool, pocketed. Coast vendors trade it. This isle has no such stall.', field: false, combat: false },
  };

  content.spells = {
    fire: { element: 'fire', cost: 1, mp: 4, kind: 'dmg', power: 10, flash: 0xff4d1a },
    water: { element: 'water', cost: 1, mp: 4, kind: 'dmg', power: 9, flash: 0x2a9adf },
    lightning: { element: 'lightning', cost: 1, mp: 5, kind: 'dmg', power: 14, flash: 0xd2b4ff },
    cure: { element: 'water', cost: 1, mp: 5, kind: 'heal', flash: 0x9dffc8 },
  };

  content.enemies = {
    hare: { name: 'Hollow Hare', color: 0x6e5b48, maxHp: 40, atk: 9, def: 3, xp: 14, gold: 8, shape: 'beast' },
    weevil: { name: 'Blight Weevil', color: 0x44502e, maxHp: 34, atk: 8, def: 2, xp: 12, gold: 6, shape: 'bug' },
    whelp: { name: 'Ash Whelp', color: 0xc45c28, maxHp: 50, atk: 11, def: 4, xp: 18, gold: 11, shape: 'sphere' },
    scribe: { name: 'Concord Scribe', color: 0x3e4550, maxHp: 54, atk: 10, def: 5, xp: 20, gold: 18, shape: 'human' },
    warden: { name: 'Concord Warden', color: 0x2a3038, maxHp: 72, atk: 13, def: 6, xp: 26, gold: 20, shape: 'human' },
    echo: { name: "Vesper's Echo", color: 0x2a2030, maxHp: 80, atk: 14, def: 5, xp: 36, gold: 24, shape: 'echo' },
    mite: { name: 'Jar Mite', color: 0x3a4030, maxHp: 38, atk: 9, def: 2, xp: 14, gold: 7, shape: 'bug' },
    'kiln-heart': { name: 'Kiln Heart', color: 0x8a2410, maxHp: 98, atk: 15, def: 6, xp: 42, gold: 28, shape: 'kiln' },
  };

  content.roster = {
    lira: { id: 'lira', name: 'Lira', role: 'Host', maxHp: 100, hp: 100, maxMp: 30, mp: 30, atk: 10, def: 7, magAtk: 8, color: 0xc47a4a },
    torren: { id: 'torren', name: 'Torren', role: 'Anchor · ex-Concord', maxHp: 128, hp: 128, maxMp: 18, mp: 18, atk: 13, def: 11, magAtk: 4, color: 0x5c6b5a },
    nima: { id: 'nima', name: 'Nima', role: 'Heart · herbalist', maxHp: 82, hp: 82, maxMp: 64, mp: 64, atk: 7, def: 5, magAtk: 15, color: 0x6aa8a0 },
  };

  // Act I opens with Lira alone. Nima joins in the leaf-village. Torren joins at the patrol.
  content.openingParty = [content.roster.lira];

  content.joinKits = {
    nima: { weapon: 'herb-rod', armor: 'herb-shawl' },
    torren: { weapon: 'ledger-cudgel', armor: 'seal-coat' },
  };

  content.recruits = [
    {
      id: 'kestrel',
      name: 'Kestrel',
      role: 'Edge · eagle-rider',
      joins: 'sky-routes',
      note: 'Crosses once, after the buried kiln. She does not land, and she does not join.',
    },
  ];
})(window.Emberwake);
