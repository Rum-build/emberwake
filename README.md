# Emberwake

A mobile-friendly 3D RPG slice. You are a spark inside Lira, a border scout on Verdant Isle. Power pools in the land; you grow by absorbing it, and the ground heals as a side effect. Final Fantasy turn structure, Witcher-grey consequences.

Single self-contained page. No build step.

## How to open

From the repository root (the folder that contains `index.html`):

```bash
python3 -m http.server 8766
```

Visit **http://localhost:8766**. On a phone sharing the network, use this machine’s address on port 8766.

You can also open `index.html` in a desktop browser. Three.js **r128** loads from the unpkg CDN, so the first launch needs a network.

## How to play

1. **Wake** on the title, then choose how Lira fights: **Warrior**, **Mage**, or **Ranged**. The choice can be wrenched later from the pack. That costs host strain.
2. **Verdant Isle**
   - **Touch:** virtual joystick (bottom-left).
   - **Desktop:** WASD or arrow keys.
   - **E** or the **Absorb** button, when you stand in a pool.
   - **I** or **Pack** opens the party inventory. **Esc** closes it.
3. **Pools** (fire, water, lightning) are columns of light over sick ground. Absorbing one feeds the spark (**XP**, an element, **host strain**) and the scar visibly greens. Overfilling her capacity scorches harder. Strain cuts Lira’s max HP.
4. **Pack** (host and party — the spark carries nothing): equipment, tonics and phials, pool-shards (digest cleanly, or dump them in a fight), Concord seals, the border badge. Torren and Nima walk with Lira. Kestrel, the eagle-rider, is not here yet.
5. **Encounters** happen after you walk the field. Rot near an undigested pool raises the rate. Standing in a pool to feed is quiet.
6. **Combat** is turn-based. Order is your party, then the enemy, shown as chips.
   - **Fight** — Lira chooses **Cleave** (Warrior), **Channel** (Mage), or **Aim** (Ranged). The committed path hits true; the others land thin. Torren and Nima simply strike.
   - **Magic** — **Ember**, **Tide**, **Sparkbolt**, **Mend**. Each spends digested element and MP.
   - **Item** — tonic, phial, or a dumped shard (power now, strain after — Vesper’s habit, small).
   - **Flee** — harder in rot, and against Vesper’s echo.
7. Victory pays spark XP and Concord **marks**. Defeat drops the body; **Drag her up** restores HP and MP, keeps what the spark already ate, and loses 12 marks.

The Ashen Concord and the rival spark **Vesper** are present in the isle’s rumors, a sealed well, a scar, and some fights. They are not yet bosses.

## Files

| File | Role |
|------|------|
| `index.html` | Shell, HUD, combat menus, inventory |
| `style.css` | Portrait-first UI, desktop and landscape tweaks |
| `game.js` | Overworld, pools, inventory, turn-based combat |
| `DESIGN.md` | Design bible (canon) |
| `STORY.md` | Player-facing synopsis (canon) |
| `CREDITS.md` | Open-licence audio log |
| `README.md` | This file |

## Tech

- Three.js **r128** via unpkg
- No bundler, no npm install
- Portrait-first; landscape supported

## Known limitations

- One island. No village or cellar interior, no save, no element-merge crafting yet.
- Kestrel is mentioned, not recruited. Waystones and eagles are not in this slice.
- No music or SFX. See `CREDITS.md`. The Credits button on the title repeats that policy.
- Encounters are tuned so a short walk can start a fight after the first pool.
- Low-poly placeholders. Three.js must load from the CDN once.
