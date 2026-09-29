# Emberwake — Credits

Audio in Emberwake is **open-licence only**: CC0, CC-BY (with attribution), or a similarly clear public grant.

Every track and sound effect that ships is listed in this file and on the in-game Credits screen. No commercial library audio. If a licence is doubtful, the moment stays silent.

## This slice

The field bed is generated in the browser. No audio file is fetched. On Stormreach the same loop is retuned higher (coast bed). In the remnant claim and the aftermath it is retuned lower (claim bed). Silent still stops it.

## Cue log

Add a row before a file is referenced by the game. Leave the row in place if a cue is removed, and mark it unused.

| Title | Author | Licence | Source | Used for |
|-------|--------|---------|--------|----------|
| Field bed | Emberwake (original, this repository) | CC0 | Procedural. No recording. `game.js` loops filtered noise and two slow tones. | Quiet ambient after Wake or Continue, until Silent is pressed |
| Coast bed | Emberwake (original, this repository) | CC0 | Procedural. No recording. The field bed retuned: higher filter, tones at 92 and 138. | Stormreach Coast, until Silent is pressed |
| Claim bed | Emberwake (original, this repository) | CC0 | Procedural. No recording. The field bed retuned: lower filter, tones at 55 and 82. | Remnant claim and the aftermath, until Silent is pressed |
| Absorb sting | Emberwake (original, this repository) | CC0 | Procedural. No recording. Two short triangle tones and a soft sine in `game.js`. | Plays when a pool is absorbed, if Sound is on |
| Ration bite | Emberwake (original, this repository) | CC0 | Procedural. No recording. Two short sine tones in `game.js`. | Plays when a Concord ration is taken or traded, if Sound is on |
| Merge sting | Emberwake (original, this repository) | CC0 | Procedural. No recording. Three short triangle tones in `game.js`. | Plays when a merge is spent in a fight, if Sound is on |
| Door sting | Emberwake (original, this repository) | CC0 | Procedural. No recording. Two short low sine tones in `game.js`. | Plays when she steps through a door, if Sound is on |
| Combat draw | Emberwake (original, this repository) | CC0 | Procedural. No recording. Two short low triangle tones in `game.js`. | Plays when a fight starts, if Sound is on |

These eight cues are the full set that ships. Telegraphs, the sky pass, and the coast crossing are silent on purpose. They are not missing rows. Magma and Glass show their colour in the fight. That colour is not a cue.

## Attribution rules

- CC-BY tracks must show the title and author on the Credits screen, not only in this file.
- Do not rename a cue in a way that hides its author.
- Edits (cuts, loops, layers) stay under the original licence and say so in the Source column.
