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

A beat with `scene: null` speaks its `toast`. When `scene` names a registered function, that function runs instead. Phase 1 leaves every Verdant beat on the toast.

Landmarks carry `interior: null` until a build gives the village and the root-cellar a place to walk into.

## Phase 1 — systems (this branch)

Playable on the Verdant Isle field:

- Host and party inventory: equipment, consumables, pool-shards, seals
- Fire, Water, Lightning absorption: spark XP, host strain, the scar greens
- Path commitment: Warrior, Mage, Ranged, with Fight / Magic / Item / Flee
- Concord and Vesper present in rumors, a sealed well, a scar, and fights

## Next pull request — Year 1 vertical slice

**Act I — Ember in the Leaf**, the whole act, on Verdant Isle. These are the beats in DESIGN.md (“Timeline (acts)” and “First three regions”). Phase 1 already teaches movement, the first ember, rot on the ground, and a party that can fight. The next pull request stages the act as scenes and places.

1. **Village reaction.** The leaf-village is an interior (`landmarks` → `leaf-village.interior`), not a toast. People argue about the Concord seal. No clean answer. Witcher contract texture: who benefits, who is afraid, who is lying.
2. **Party seed, met.** Nima is found in that village. Torren is found because of the patrol below, an ex-quartermaster with the coat still on his back. They join. They are not a silent trio at the first step. Kestrel stays the eagle-rider in `content.recruits` until sky routes exist; Act I may show her once, in the air, and not hand over the bow yet.
3. **A Concord patrol bottles a lesser pool in sight.** Scripted, on the field. The player watches a seal go on. Absorbing the sealed well afterward is the system Phase 1 already has; the patrol is the act.
4. **The rot has witnesses.** Vesper’s scar is already a pool. Act I gives it villagers who will say what passed there, and a consequence that is not optional flavor text.
5. **Rival silhouette at the act’s end.** A closing scene after the isle’s work, distinct from the scar the spark can already drink. Vesper is seen. The duel is not this act (that is Act II in the bible).
6. **The root-cellar is a threshold.** `root-cellar.interior` opens. The mouth is part of Act I. How deep the first dungeon runs is part of this slice if the scene needs a room on the other side of the door; it does not invent a second region.
7. **Continue.** A save, because the act is longer than one sitting. Spark, strain, inventory, path, which pools are quiet, and which scenes have played.

Still this tone. Still no shrine-gadget framing.

Systems to extend, not replace: `registerScene` for the beats above, `interior` on the two landmarks, opening roster moved from “already walking” to “joined in scene” inside `catalog.js`. Combat menus stay Fight / Magic / Item / Flee.

## After Act I

The bible’s order, each act a production pull of its own (and as many follow-ups as the act needs):

- **Act II — Bottled Sky.** Stormreach Coast. Eagle and waystone. Lightning pools, Concord vaults. Vesper named in debate and a non-lethal duel. Merge tree opens (Fire+Water and the rest of the tree in DESIGN.md). Party grows. Kestrel’s sky routes.
- **Act III — The Rot That Speaks.** Ashen Marrow. Feeding heals and overfeeding scars the host as the moral weight. Concord digest-engine. Vesper’s method on the table.
- **Act IV — Remnant Wake.** Waystone network. The race for the Prime Remnant. Endings from merges, who lived, and whether Lira is still the host.

Audio stays open-licence and listed in `CREDITS.md` before a cue plays. Phase 1 is silent on purpose.
