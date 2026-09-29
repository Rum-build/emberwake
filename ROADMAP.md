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

## Act II deepen (shipped)

- After the clerk on the shale, **E** at the seam enters the counting room. Sign the shortage or refuse it. Leaving puts her back on the coast, not the isle.
- Once the elements are held, **Plasma** and **Steam** are Magic commands. Plasma spends fire and lightning. Steam spends fire and water.
- Walking the shale can start a fight: charged wisps, licence clerks, scribes, and sometimes Vesper’s echo. The counting room stays quiet.
- After the count, walk under the wing and ask Kestrel to land, or leave her the air. She does not join. Continue stores the vault, the spells, and the refusal.

## Act II bottle-hall (shipped)

- After the count, the north iron is a door. The bottle-hall is the Concord’s sealed-magic show: gold corks, a short shelf, and a clerk who lets a signature or a refusal look.
- Crack the earth cork or leave it. Cracking puts earth on the spark and on the HUD. The marrow bottle does not move. Neither choice is a licence.
- **Storm** (water and lightning), **Magma** (fire and earth), and **Glass** (lightning and earth) join Plasma and Steam on the magic list once those elements are held.
- The mouse stick, Absorb, Pack, and the browser save stay.

## Act III tease (shipped)

- **Enter** at the north arch puts feet on a short ash shelf: digest-engine, a Concord tender, and one leak. **Leave** at the south gate returns to the bottle-hall. Continue restores the shelf.
- In a fight, Plasma cooks armor, Steam softens the swing, Storm chains, Magma burns on the enemy’s turn, and Glass pierces and can find a seam. The combat UI shows what is held and what each spell spends. Mend returns less while scar debt is up.
- Scar debt shows on the HUD and in the pack after the buried kiln, the earth cork, or feeding the engine leak. Each point cuts Lira’s max HP by 6. Banking the leak eases one point. Feeding the leak adds one.
- Kestrel still does not join. The mouse stick, Absorb, and Pack stay.

## Ground, Vesper on the ash, scar in the walk (this branch)

- Verdant Isle, Stormreach shelf, and the ash shelf use height and vertex color: grass and soil, wet stone, red ash. Each place has a sky. Pool mouths have a bowl, a stone rim, and a glass neck. The figures stay simple. The page stays one Three.js file.
- On the ash, after the arrival, walk to Vesper. Taste the scar or refuse her mouth. She does not step into the host and she does not die. Taste adds one scar debt and strain. Refusal leaves a dark stain and a little strain. Both keep the rot.
- When scar debt is 2 or more, Lira coughs and the walk slows. The tender can hear it. Banking back under 2 eases the cough and the pace. Continue stores the choice and the debt.
- No music. Kestrel still does not join.

## Still ahead

From DESIGN.md, after this shelf:

1. The rest of the scar’s debt. One banked leak does not pay the kiln, and Vesper’s taste is another point if you let her.
2. The rest of Ashen Marrow, the wind merges (ice, thunder, tide, root), and a party slot for Kestrel if she ever takes one.

Combat menus stay Fight / Magic / Item / Flee. New panels stay desktop-first.

## After Act I

The bible’s order, each act a production pull of its own (and as many follow-ups as the act needs):

- **Act II — Bottled Sky.** Stormreach Coast. Eagle and waystone. Lightning pools, Concord vaults. Vesper named in debate and a non-lethal duel. Merge tree opens (Fire+Water and the rest of the tree in DESIGN.md). Party grows. Kestrel’s sky routes.
- **Act III — The Rot That Speaks.** Ashen Marrow. Feeding heals and overfeeding scars the host as the moral weight. Concord digest-engine. Vesper’s method on the table.
- **Act IV — Remnant Wake.** Waystone network. The race for the Prime Remnant. Endings from merges, who lived, and whether Lira is still the host.

Audio stays open-licence and listed in `CREDITS.md` before a cue plays. Phase 1 is silent on purpose.
