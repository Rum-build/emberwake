# Emberwake

A mobile-friendly epic 3D RPG slice — you are a **spark** inside host **Lira**. Absorb elemental pools, grow, and fight with Warrior / Mage / Ranged paths. Tone: Final Fantasy + The Witcher. No build step.

## How to open

```bash
cd /workspace/emberwake
python3 -m http.server 8766
```

Then visit **http://localhost:8766**.

## How to play

1. Tap **Start Adventure**.
2. **Overworld (Verdant Isle)**
   - **Touch:** joystick (bottom-left). **Desktop:** WASD / arrows.
   - **I** or **Inv** button — Lira's pack (items, equipment, pool-shards).
   - Walk near a glowing **pool** → **E** or **Absorb** to digest Fire / Water / Lightning.
   - Absorbing heals the land tint, grants spark XP, adds host strain, and may leave a shard.
3. **HUD** — gold, spark level/XP, element counts, host strain meter.
4. **Combat (turn-based)** — party: **Lira**, **Torren**, **Nima**.
   - **Fight** → choose **Warrior / Mage / Ranged** path, then target.
   - **Magic** — Ember / Tide / Sparkbolt / Mend (costs MP **and** absorbed elements).
   - **Item** — Potion / Ether from Lira's inventory.
   - **Flee** — chance to escape.
5. Victory grants spark XP and gold. Wipe → Game Over → Retry.

## Files

| File | Role |
|------|------|
| `index.html` | Shell, HUD, inventory, combat menus |
| `style.css` | Mobile-friendly UI |
| `game.js` | Overworld, pools, combat, inventory |
| `DESIGN.md` | Design bible |
| `STORY.md` | Player-facing synopsis |
| `README.md` | This file |

## Tech

- Three.js **r128** via unpkg CDN
- No bundler / npm
- Portrait-first; landscape supported
