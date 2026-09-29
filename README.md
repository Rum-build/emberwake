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
   - **Continue** on the title restores this browser’s save: spark, strain, scar debt, inventory, path, who has joined, which pools are quiet, which coast, vault, ash shelf, engine pipe, sealed throat, Concord yard, Remnant Mark, ash nave, watch gallery, count crypt, first breach, remnant claim, or aftermath you were standing in, the hall choice, the pipe choice, the throat choice, the yard choice, the mark choice, the nave choice, the gallery count, the crypt choice, the breach choice, the claim flag, earth, Vesper’s ash choice, and which scenes have played. **Wake** starts over.
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

The Ashen Concord and the rival spark **Vesper** are on the road, not only in rumors. After you wake, step into the leaf-village: the argument about the seal does not settle, and Nima walks out with Lira. The root-cellar under the arch opens into a throat: jar mites, then the Kiln Heart, then the buried fire. Drink it, and Kestrel crosses on an eagle without landing. A patrol bottles a lesser spring in sight; Torren refuses the licence and the fight starts with him in it. Ilan and Maud stand at Vesper’s scar. Drink it in front of them, or leave it and keep the rot. More pools burn, pool, and storm in the open. The waystone on the ridge stays shut until that kiln is drunk and the scar has a verdict. Then the stones wake, and Kestrel carries a thermal over a corked harbor vault. Press **Land** on that stone to put your feet on Stormreach shale. She stays in the air. Walk the cliff: a clerk names the vault, and the counting room past the seam can be walked. Sign the shortage or refuse it. Either way the north iron opens onto the bottle-hall, a sealed-magic spectacle with a clerk who will remember you. Crack the earth cork or leave every cork. The marrow bottle stays. Cracking the cork, and drinking the buried kiln, put scar debt on the HUD: each point cuts Lira’s max HP. At the north arch, **Enter** steps onto Ashen Marrow. The ash, the digest-engine, a tender, and one leak are walkable. Feed the leak and the debt worsens. Tell the tender to bank it and one point eases, if there is a point to ease. When the debt is two or more, Lira coughs and walks slower, and the tender says so. West of the engine, Vesper is on the ash. Let her taste the scar, or refuse her mouth. She does not step into the host. Taste adds a point. Refusal leaves a stain. West of the engine, **Enter** on the stone opens the Concord yard. Drink the slag or let the warden seal it. Vesper is in the yard and does not step into the host. The stone carries you. Kestrel does not. North of that yard, **Enter** opens the Remnant Mark: a numbered pillar, a counter on the road, and a weep. Drink the weep or let them number it. Vesper names the rumour. She does not step into the host. The pillar is not the Prime Remnant. **Leave** south returns to the yard. North of the pillar, after the counter, **Enter** opens the ash nave. The cathedral is sealed. Name the hinge or leave the seal. The door does not open. Vesper is on the roof. East of that door, **Enter** opens the watch gallery. Read the Concord’s count — Licence Zero — or file the hinge into it. The grate lifts. **Enter** on the count-stair opens one crypt. An auditor keeps the page; the ledger page takes the first physical blow. North, Vesper stands at a crack that is the remnant and not a door. Press Named Feed and the Unwritten Passage into it and they stay in the pack, put a mouth on the crack and take a scar, or leave the light. The cathedral bar stays shut. If the digit was pressed, **Enter** on the widened crack opens a first breach. A Concord captain and a scribe hold the threshold. The licence hits once, harder, unless a shoulder is already in front. Remnant ash stays in the teeth and can complete a merge. Vesper is in the light and will not duel. Hold the threshold, set a mouth on the light, or step back. The bar stays shut until the threshold is held. Then **Enter** on that light opens the remnant claim, past the bar. A Concord celebrant keeps a last rite; a knife spends itself on the ward, and a merge tears it. Vesper is at the mass. Claim it, refuse it, share the light, or burn it. **Enter** on the north mass after that flag opens the aftermath: one room, four lights. Claim leaves Lira wearing a thing Licence Zero cannot number, the rot slowed and not dead, the spark fed and still hungry. Refuse keeps her name and leaves the licence and the rot in place. Share puts Vesper beside the mass, not inside the host, and the page fails for two owners. Burn echoes the scar: the debt and the cut to her max HP, a licence they will rewrite, rot rooting deeper, a spark that ate ash and is angrier. She does not enter the host on any path. Kestrel, if she landed, stands in that room and still does not join. If she stayed in the air, she is not there. **Credits** are north. **Return** comes back to the room. **Leave** south returns to the claim, short of that door, then the breach, then the crypt, then the gallery, then the nave. A bird may cross the nave and does not land. **Leave** south of the nave returns to the pillar. North of the engine, **Enter** opens the sealed throat. Speak the bottle’s name and take the scar, or cork it and leave the word. Kestrel crosses after, and she still does not join. East of the engine, **Enter** opens the Concord pipe. Crack the feed and fight the stoker, or leave the cork and keep the name. Torren reads the marks if he came. Nima names the air if she came. **Leave** at the south of the pipe returns to the ash. South of the engine on the shelf, **Leave** returns to the bottle-hall. Two lightning pools sit on the shelf, and walking the shale can start a fight. Held pairs become spells: plasma, steam, storm, and, after the earth cork, magma and glass. After a coast pool and the vault’s face, Vesper is on the shale with a knife at measuring distance. Throw the blow or hold it. She does not die. Under the wing, after the count, you can ask Kestrel to land. She refuses. **Return** at the roost takes the thermal home. When the village, the patrol, and the first ember are done, her silhouette also stands on the Verdant ridge and does not offer that duel yet.

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
- Scar debt is visible and cuts max HP. At two points she coughs and the walk slows. It is not paid off by the witness line. Banking the marrow leak eases one point. The rest of the debt stays.
- Ashen Marrow is a shelf, a pipe, a sealed throat, a Concord yard, the Remnant Mark, the sealed ash nave, the watch gallery, the count crypt under that stair, after Cracked Zero, a first breach, after Held Threshold a remnant claim past the bar, and after a claim flag the aftermath. The four flags write four endings. The wider waystone network is still ahead. Wind merges are still ahead. Burn already paid its scar when the flag was set. The ending echoes that debt and does not add another point.
- The field bed, the coast bed, the claim bed, the absorb sting, and the merge sting are original CC0 cues generated in the browser. The coast and the claim are the same loop, retuned. See `CREDITS.md`. Press Silent to stop them. No other music or effects.
- The first drink says strain is not a scar. The first Fight menu names Cleave, Channel, or Aim. A wounded hare bolts. Brine hits two. The village shows the grey furrow, a porter stands short of the vault, the bottle-hall faces inland, and the ash writes the engine’s bill.
- Encounters are tuned so a short walk can start a fight after the first pool. The patrol is a separate, scripted fight.
- The isle, the coast, the ash, the remnant claim, and the fight have a stronger light: figures read at a distance, Lira carries a spark ember, and the claim mass sits in a darker room. The village, the counting room, the ash, and the claim read more as rooms than as boxes. People and the engine are still simple meshes. Three.js must load from the CDN once.
- A missable letter in the leaf-village says Vesper walked the Concord to the well. It goes in the pack and does not change the road. Continue names the saved place. After the aftermath credits, Wake still throws that save out. Wake asks first if a save is already there.
- The pipe, the gallery, the crypt, and the breach read as rooms. A filed copy in the gallery uses Cousin’s Margin if it is held, and a different line if it is not. The stair stays a separate choice. A clerk stamps the next blow thin.

## Play on your phone

Open **https://rum-build.github.io/emberwake/** in Safari or Chrome. Use the on-screen MOVE stick, Pack, and Absorb.
