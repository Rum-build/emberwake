/**
 * Emberwake — shared namespace.
 * No build step. Later acts register content here; Phase 1 systems read it.
 *
 * Final Fantasy turn structure, Witcher-grey consequences.
 * Production target is the full bible in DESIGN.md (Acts I–IV and the systems
 * that carry them). Phase 1 is the foundation, not a reduced game.
 *
 * Next content drop (Year 1 vertical slice) extends this object:
 *   Emberwake.registerRegion(...)     — another tract of land
 *   Emberwake.registerScene(id, fn)   — replace a field toast with a scene
 *   Emberwake.registerGear / registerEnemy / registerSpell
 * See ROADMAP.md for the Act I beats that drop owns.
 */
(function (root) {
  'use strict';

  var Emberwake = root.Emberwake || {};
  root.Emberwake = Emberwake;

  Emberwake.phase = {
    id: 'phase-1',
    name: 'Systems',
    ships: ['inventory', 'elements', 'spark-xp', 'host-strain', 'combat-paths'],
  };

  Emberwake.content = Emberwake.content || {
    gear: {},
    items: {},
    spells: {},
    enemies: {},
    pathStats: {},
    pathLabel: {},
    whoName: {},
    elementColor: {},
    shardName: {},
    openingParty: [],
  };

  Emberwake.regions = Emberwake.regions || {};
  Emberwake.scenes = Emberwake.scenes || {};

  Emberwake.registerRegion = function (region) {
    if (!region || !region.id) throw new Error('Emberwake.registerRegion requires an id');
    Emberwake.regions[region.id] = region;
    return region;
  };

  Emberwake.registerScene = function (id, run) {
    Emberwake.scenes[id] = run;
  };

  Emberwake.registerGear = function (id, gear) {
    Emberwake.content.gear[id] = gear;
  };

  Emberwake.registerEnemy = function (id, enemy) {
    Emberwake.content.enemies[id] = enemy;
  };

  Emberwake.registerSpell = function (id, spell) {
    Emberwake.content.spells[id] = spell;
  };
})(window);
