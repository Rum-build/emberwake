# Emberwake — production map

Emberwake is a multi-year game. [DESIGN.md](DESIGN.md) is the bible: immortal power, the spark in a host, the Ashen Concord, Vesper, four acts, and the Prime Remnant. Nothing in this repository is a capped “demo” of that bible. Phase 1 is the systems the acts stand on. Later pulls add land, scenes, and merges on top of them.

Tone stays Final Fantasy (party, paths, turn-based set pieces) and The Witcher (grey politics, costs, no clean contract). That pairing is locked in DESIGN.md.

The shell stays a no-build page: Three.js from the CDN, scripts in order, content registered on `window.Emberwake`.

**Platform.** PC is the design target: keyboard and mouse, denser Final Fantasy command windows and a Witcher-weight panel. Phones stay playable — a virtual joystick and large taps, switched on by a coarse pointer or a narrow window. New scenes and panels follow that order.

## How content is added

| Seam | File | What the next build touches |
|------|------|-----------------------------|
| Regions, pools, landmarks, field beats | `js/content/verdant-isle.js` | New pools, `interior` ids, `beat.scene` |
| Gear, items, spells, bestiary, opening roster | `js/content/catalog.js` | Rows, or `Emberwake.registerGear` / `registerEnemy` / `registerSpell` |
| Scenes that replace a toast | `Emberwake.registerScene(id, fn)` in `js/emberwake.js` | Village argument, patrol, act-end silhouette |
| Inventory, absorb, XP, strain, turn combat | `game.js` | Only when a system itself must grow |

A beat with `scene: null` speaks its `toast`. When `scene` names a registered function, that function runs instead. Act I scenes are registered in `js/content/act1-scenes.js`.

Landmarks carry `interior: null` until a build gives the village and the root-cellar a place to walk into.

## Phase 1 — systems (in this branch)

Playable on the Verdant Isle field:

- Host and party inventory: equipment, consumables, pool-shards, seals
- Fire, Water, Lightning absorption: spark XP, host strain, the scar greens
- Path commitment: Warrior, Mage, Ranged, with Fight / Magic / Item / Flee
- Desktop-first command UI; joystick and large taps on a phone

## Act I field slice (this same branch)

**Ember in the Leaf**, the beats that can be walked now. Not the whole act.

- Wake as the spark inside Lira, before the first step
- Leaf-village argument about the Concord seal. Three answers. None of them clean
- A patrol bottles the leaf-cup in sight, then fights
- Further pools: ash copse, ridge vein, and the cup they cork
- A sleeping waystone. Stormreach is named. The road does not open
- Vesper’s silhouette on the ridge after the village, the patrol, and the first ember. No duel. The scar pool is still a different wound

## Still ahead on Act I

From DESIGN.md, after this slice:

1. Village and root-cellar as interiors, not only a dialogue on the green.
2. Nima and Torren met in those scenes, instead of already walking. Kestrel once, in the air, still not recruited.
3. Witnesses at Vesper’s scar who will say what passed there, with a consequence.
4. Save and continue: spark, strain, inventory, path, quiet pools, played scenes.

Combat menus stay Fight / Magic / Item / Flee. New panels stay desktop-first.

## After Act I

The bible’s order, each act a production pull of its own (and as many follow-ups as the act needs):

- **Act II — Bottled Sky.** Stormreach Coast. Eagle and waystone. Lightning pools, Concord vaults. Vesper named in debate and a non-lethal duel. Merge tree opens (Fire+Water and the rest of the tree in DESIGN.md). Party grows. Kestrel’s sky routes.
- **Act III — The Rot That Speaks.** Ashen Marrow. Feeding heals and overfeeding scars the host as the moral weight. Concord digest-engine. Vesper’s method on the table.
- **Act IV — Remnant Wake.** Waystone network. The race for the Prime Remnant. Endings from merges, who lived, and whether Lira is still the host.

Audio stays open-licence and listed in `CREDITS.md` before a cue plays. Phase 1 is silent on purpose.
