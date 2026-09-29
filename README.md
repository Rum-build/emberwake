# Emberwake

A mobile-friendly epic 3D RPG slice — you are a spark in a human host. Single self-contained web game — open in a browser, no build step.

## How to open

```bash
cd /workspace/emberwake
python3 -m http.server 8766
```

Then visit **http://localhost:8766** (or your machine’s IP on port 8766 from a phone on the same network).

You can also open `index.html` directly in a desktop browser; Three.js loads from the unpkg CDN (network required once).

## How to play

1. Tap **Start Adventure** on the title screen.
2. **Overworld (Verdant Isle)**
   - **Touch:** virtual joystick (bottom-left) to move.
   - **Desktop:** WASD or arrow keys.
   - Explore the island — trees, rocks, a village, and a dungeon entrance.
3. **Random encounters** occur after walking in the field. A flash transition leads into battle.
4. **Combat (turn-based)**
   - Party: **Cecil** (Warrior), **Rosa** (White Mage), **Rydia** (Black Mage).
   - Each living party member acts, then enemies — clear turn order.
   - **Fight** — physical attack (pick an enemy).
   - **Magic** — **Fire** (4 MP, damage) or **Cure** (5 MP, heal an ally).
   - **Item** — Potion (heal HP) or Ether (restore MP).
   - **Flee** — chance to escape back to the overworld.
5. Win for XP/gold toast and return to the overworld. Lose shows Game Over → **Retry**.

## Files

| File        | Role                          |
|-------------|-------------------------------|
| `index.html`| Shell, UI overlays, Three.js CDN |
| `style.css` | Mobile-friendly UI            |
| `game.js`   | Overworld, combat, input      |
| `DESIGN.md` | Game bible / design doc       |
| `STORY.md`  | Short player-facing synopsis  |
| `README.md` | This file                     |

## Tech

- Three.js **r128** via unpkg CDN
- No bundler, no npm install
- Portrait-first UI; landscape supported

## Known limitations

- Short playable slice (one island, no town/dungeon interiors).
- No save system; Retry restores the party after a wipe.
- Encounter rate is tuned for a quick demo — short walks can trigger battles.
- Requires network once to load Three.js from CDN.
- Low-poly placeholders only (no external textures/models).
