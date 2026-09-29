# Emberwake — production map

Emberwake is a multi-year game. [DESIGN.md](DESIGN.md) is the bible: immortal power, the spark in a host, the Ashen Concord, Vesper, four acts, and the Prime Remnant. Nothing in this repository is a capped “demo” of that bible. Phase 1 is the systems the acts stand on. Later pulls add land, scenes, and merges on top of them.

Tone stays Final Fantasy (party, paths, turn-based set pieces) and The Witcher (grey politics, costs, no clean contract). That pairing is locked in DESIGN.md.

The shell stays a no-build page: Three.js from the CDN, scripts in order, content registered on `window.Emberwake`.

**Platform.** PC is the design target: keyboard and mouse, denser Final Fantasy command windows and a Witcher-weight panel. The field also keeps a stick and an Absorb/Pack pad so a mouse or a finger can walk without a keyboard. On a phone those controls get larger. New scenes and panels follow that order.

## How content is added

| Seam | File | What the next build touches |
|------|------|-----------------------------|
| Regions, pools, landmarks, field beats | `js/content/verdant-isle.js` | New pools, `interior` ids, `beat.scene` |
| Gear, items, spells, bestiary, opening roster | `js/content/catalog.js` | Rows, or `Emberwake.registerGear` / `registerEnemy` / `registerSpell` |
| Scenes that replace a toast | `Emberwake.registerScene(id, fn)` in `js/emberwake.js` | Village argument, patrol, act-end silhouette |
| Inventory, absorb, XP, strain, turn combat | `game.js` | Only when a system itself must grow |

A beat with `scene: null` speaks its `toast`. When `scene` names a registered function, that function runs instead. Act I scenes are registered in `js/content/act1-scenes.js`.

The leaf-village and the root-cellar landmarks set `interior` to a walkable room. Other landmarks still leave that field empty.

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
- A waystone on the ridge. It sleeps until the kiln and the scar; then it wakes into a thermal, not a harbour
- Vesper’s silhouette on the ridge after the village, the patrol, and the first ember. No duel. The scar pool is still a different wound

## Act I, continued (this same branch)

- The leaf-village is a room. The argument happens inside. Nima joins there.
- The root-cellar opens past the mouth: a throat, a jar-room fight, the Kiln Heart, then the buried fire.
- Kestrel crosses once on an eagle after that fire is drunk. She does not land, and she does not join.
- Torren is with the patrol until he refuses the seal, then he fights beside Lira.
- Ilan and Maud stand at Vesper’s scar. Drinking it costs extra strain and their thanks. Leaving it locks the scar and puts rot-ash in the pack. The rot stays.
- Continue on the title reads a browser save. Wake throws that save out. The mouse stick keeps the drag until the button comes up.

## Act I wrap, Act II tease (shipped)

- The waystone wakes only after the buried kiln is drunk and Ilan and Maud have a verdict, drink or leave.
- Kestrel then carries a short sky route over Stormreach Coast. The harbor vault is in the cliff, gold-sealed, leaking lightning. The door does not open. She does not join.

## Act II start (this branch)

- **Land** on the woken waystone puts feet on a walkable Stormreach shelf. The first descent is a short thermal. Later crossings are quieter. **Return** at the roost puts her back by the stone.
- The harbor vault is a face: a clerk, a gold seal, a door that does not open. Walk up to it.
- Two lightning pools, Harbor Leak and Spire Bone, feed the spark the same way the isle pools do. Random fights stay on the isle.
- If she already holds fire and water, or fire and lightning, the shelf speaks steam or plasma. The word leaves. It is not a spell in the combat menu.
- After a coast pool and the vault’s face, Vesper offers a measuring duel. Throw the blow (a little strain) or hold it. She walks away alive.
- Continue stores the coast, the merge word, and the duel, along with the rest of the browser save. The mouse stick and Absorb/Pack stay.

## Still ahead

From DESIGN.md, after this landing:

1. The scar’s debt, counted and not paid.
2. The rest of Act II: the vault interior, merge words that become spells, a longer coast, and a party slot for Kestrel if the road ever offers one.

Combat menus stay Fight / Magic / Item / Flee. New panels stay desktop-first.

## After Act I

The bible’s order, each act a production pull of its own (and as many follow-ups as the act needs):

- **Act II — Bottled Sky.** Stormreach Coast. Eagle and waystone. Lightning pools, Concord vaults. Vesper named in debate and a non-lethal duel. Merge tree opens (Fire+Water and the rest of the tree in DESIGN.md). Party grows. Kestrel’s sky routes.
- **Act III — The Rot That Speaks.** Ashen Marrow. Feeding heals and overfeeding scars the host as the moral weight. Concord digest-engine. Vesper’s method on the table.
- **Act IV — Remnant Wake.** Waystone network. The race for the Prime Remnant. Endings from merges, who lived, and whether Lira is still the host.

Audio stays open-licence and listed in `CREDITS.md` before a cue plays. Phase 1 is silent on purpose.
