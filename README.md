# Emberwake

A 3D RPG, designed for PC and still playable on a phone. You are a spark inside Lira, a border scout. Power pools in the land; you grow by absorbing it, and the ground heals as a side effect. Final Fantasy turn structure, Witcher-grey consequences.

[DESIGN.md](DESIGN.md) is the production bible (four acts, no reduced ending). [ROADMAP.md](ROADMAP.md) says what is playable now and what the next pull request builds. This page is **Phase 1**: the systems, played on the Verdant Isle field. Year 1’s vertical slice — full Act I, **Ember in the Leaf** — follows on the same shell.

Single page. No build step.

## How to open

From the repository root (the folder that contains `index.html`):

```bash
python3 -m http.server 8766
```

Visit **http://localhost:8766** in a desktop browser. That is the layout this page is designed for. On a phone sharing the network, use this machine’s address on port 8766 — the joystick and the large buttons take over.

Three.js **r128** loads from the unpkg CDN, so the first launch needs a network.

## How to play

1. **Wake** on the title, then choose how Lira fights: **Warrior**, **Mage**, or **Ranged**. The choice can be wrenched later from the pack. That costs host strain.
2. **Verdant Isle**
   - **PC:** WASD or arrow keys to walk, or drag the stick at the bottom-left. Absorb and Pack sit at the bottom-right; the mouse can use those, the menus, and battle commands. In battle, **1–4** pick the open command and **Esc** steps back.
   - **Phone:** the same stick and the large Absorb and Pack buttons. Battle commands are full-width taps.
   - **E** absorbs a pool, enters the leaf-village, the root-cellar, or the harbor counting room, walks north through the iron into the bottle-hall after the count, steps from the north arch onto Ashen Marrow, leaves those places, lands on Stormreach from the woken waystone, or takes the roost back to the isle. **I** opens the pack. **Esc** closes it.
   - **Continue** on the title restores this browser’s save: spark, strain, scar debt, inventory, path, who has joined, which pools are quiet, which coast, vault, or ash shelf you were standing on, the hall choice, earth, and which scenes have played. **Wake** starts over.
   - **Enter** or click advances a scene. Number keys pick a line when someone asks you to answer.
3. **Pools** (fire, water, lightning) are columns of light over sick ground. Absorbing one feeds the spark (**XP**, an element, **host strain**) and the scar visibly greens. Overfilling her capacity scorches harder. Strain cuts Lira’s max HP.
4. **Pack** (host and party — the spark carries nothing): equipment, tonics and phials, pool-shards (digest cleanly, or dump them in a fight), Concord seals, the border badge. Lira starts alone. Nima joins inside the leaf-village. Torren joins when he refuses the patrol’s seal. Kestrel can be asked to land after the harbor count. She does not join.
5. **Encounters** happen after you walk Verdant Isle or Stormreach Coast. On the coast they are charged wisps, licence clerks, and scribes. Rot near an undigested pool raises the rate. Standing in a pool to feed is quiet. The counting room does not throw random fights.
6. **Combat** is turn-based. Order is your party, then the enemy, shown as chips.
   - **Fight** — Lira chooses **Cleave** (Warrior), **Channel** (Mage), or **Aim** (Ranged). The committed path hits true; the others land thin. Torren and Nima simply strike.
   - **Magic** — **Ember**, **Tide**, **Sparkbolt**, **Mend**. Each spends digested element and MP. Once the elements are held, the list can also show **Plasma** (fire and lightning, cooks armor), **Steam** (fire and water, softens the swing), **Storm** (water and lightning, chains), **Magma** (fire and earth, burns on their turn), and **Glass** (lightning and earth, pierces and can find a seam). Earth comes from cracking the bottle-hall cork and shows on the HUD. In a fight the held counts and those costs sit on the combat UI. **Mend** returns less while scar debt is on her.
   - **Item** — tonic, phial, or a dumped shard (power now, strain after — Vesper’s habit, small).
   - **Flee** — harder in rot, and against Vesper’s echo.
7. Victory pays spark XP and Concord **marks**. Defeat drops the body; **Drag her up** restores HP and MP, keeps what the spark already ate, and loses 12 marks.

The Ashen Concord and the rival spark **Vesper** are on the road, not only in rumors. After you wake, step into the leaf-village: the argument about the seal does not settle, and Nima walks out with Lira. The root-cellar under the arch opens into a throat: jar mites, then the Kiln Heart, then the buried fire. Drink it, and Kestrel crosses on an eagle without landing. A patrol bottles a lesser spring in sight; Torren refuses the licence and the fight starts with him in it. Ilan and Maud stand at Vesper’s scar. Drink it in front of them, or leave it and keep the rot. More pools burn, pool, and storm in the open. The waystone on the ridge stays shut until that kiln is drunk and the scar has a verdict. Then the stones wake, and Kestrel carries a thermal over a corked harbor vault. Press **Land** on that stone to put your feet on Stormreach shale. She stays in the air. Walk the cliff: a clerk names the vault, and the counting room past the seam can be walked. Sign the shortage or refuse it. Either way the north iron opens onto the bottle-hall, a sealed-magic spectacle with a clerk who will remember you. Crack the earth cork or leave every cork. The marrow bottle stays. Cracking the cork, and drinking the buried kiln, put scar debt on the HUD: each point cuts Lira’s max HP. At the north arch, **Enter** steps onto Ashen Marrow. The ash, the digest-engine, a tender, and one leak are walkable. Feed the leak and the debt worsens. Tell the tender to bank it and one point eases, if there is a point to ease. South of the engine, **Leave** returns to the bottle-hall. Two lightning pools sit on the shelf, and walking the shale can start a fight. Held pairs become spells: plasma, steam, storm, and, after the earth cork, magma and glass. After a coast pool and the vault’s face, Vesper is on the shale with a knife at measuring distance. Throw the blow or hold it. She does not die. Under the wing, after the count, you can ask Kestrel to land. She refuses. **Return** at the roost takes the thermal home. When the village, the patrol, and the first ember are done, her silhouette also stands on the Verdant ridge and does not offer that duel yet.

## Files

| File | Role |
|------|------|
| `index.html` | Shell, HUD, combat menus, inventory |
| `style.css` | Desktop command UI; phone layout under a coarse pointer or a narrow window |
| `js/emberwake.js` | Namespace: phase, regions, scenes, content registers |
| `js/content/catalog.js` | Paths, gear, items, spells, bestiary, opening roster |
| `js/content/verdant-isle.js` | Act I field: landmarks, pools, beats |
| `js/content/act1-scenes.js` | Wake, village argument, cellar threshold, scar witnesses, patrol, waystone, the coast glimpse, Vesper on the ridge |
| `js/content/stormreach.js` | Act II shelf: roost, harbor vault face, lightning pools |
| `js/content/act2-scenes.js` | Descent, landing, vault clerk, bottle-hall, marrow look, merge words, the measuring duel |
| `game.js` | Overworld, absorb, inventory, turn-based combat |
| `DESIGN.md` | Design bible (canon) |
| `STORY.md` | Player-facing synopsis (canon) |
| `ROADMAP.md` | Production map: Phase 1, then Act I, then the later acts |
| `CREDITS.md` | Open-licence audio log |
| `README.md` | This file |

## Tech

- Three.js **r128** via unpkg
- No bundler, no npm install
- Desktop first (keyboard and mouse, denser windows). Phone second (joystick, large taps)

## Still ahead

Listed in [ROADMAP.md](ROADMAP.md). The field slice does not close Act I.

- Kestrel does not join. Asking her after the count is the tease. The answer is no. The earth cork does not hire her.
- Scar debt is visible and cuts max HP. It is not paid off by the witness line. Banking the marrow leak eases one point. The rest of the debt stays.
- Ashen Marrow is a short shelf, not the inland region. Wind merges (ice, thunder, and the rest that need wind or a later act) are still ahead.
- No music or SFX. See `CREDITS.md`. The Credits button on the title repeats that policy.
- Encounters are tuned so a short walk can start a fight after the first pool. The patrol is a separate, scripted fight.
- Low-poly placeholders. Three.js must load from the CDN once.

## Play on your phone

Open **https://rum-build.github.io/emberwake/** in Safari or Chrome. Use the on-screen MOVE stick, Pack, and Absorb.
