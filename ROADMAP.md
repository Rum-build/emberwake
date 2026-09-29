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

## Ground, Vesper on the ash, scar in the walk (shipped)

- Verdant Isle, Stormreach shelf, and the ash shelf use height and vertex color: grass and soil, wet stone, red ash. Each place has a sky. Pool mouths have a bowl, a stone rim, and a glass neck. The figures stay simple. The page stays one Three.js file.
- On the ash, after the arrival, walk to Vesper. Taste the scar or refuse her mouth. She does not step into the host and she does not die. Taste adds one scar debt and strain. Refusal leaves a dark stain and a little strain. Both keep the rot.
- When scar debt is 2 or more, Lira coughs and the walk slows. The tender can hear it. Banking back under 2 eases the cough and the pace. Continue stores the choice and the debt.
- No music. Kestrel still does not join.

## Engine pipe (shipped)

- East of the digest-engine, **Enter** opens a short Concord pipe. At the valve, crack the feed or leave it corked. Cracking starts a fight with a Pipe Stoker whose coat shrugs off a plain knife. Magma stays on him. Glass looks for the seam. Leaving the cork puts a name in the pack and no fight. **Leave** at the south of the pipe returns to the ash. Continue stores the pipe and the choice.
- If Torren is in the company he reads the quartermaster marks. If Nima is, she names the air, and the cough when the debt is already two. Kestrel is not in the pipe. She still does not join.
- The coast can throw a Brine Skitter. The ash shelf can throw a Cinder Mite, and rarely another stoker. The pipe itself does not throw random fights.
- The leaf-village floor and the bottle-hall floor have grain. The mouse stick, Absorb, and Pack stay.

## Sealed throat (shipped)

- North of the digest-engine, **Enter** opens a short sealed room. Speak the bottle’s name into the spark, which adds one scar debt, or cork it and leave the word. **Leave** at the south returns to the ash. Continue stores the choice.
- After either choice, Kestrel is overhead. Ask her to walk as far as the next stone, or leave her the air. Both answers keep her out of the pack.
- A quest line under the place name says the next step. Seals in the pack, including Named Feed and Unwritten Passage, keep their meaning on the card and in the tooltip. The first fight after a merge is on the list says Magic spends it.
- People have hair, shoulders, and a cloak. Ash, the village, and the vault carry a few motes. The village has a hearth. The bottle-hall has a shaft of light. The field bed is a quiet original loop. Silent stops it.
- The mouse stick, Absorb, and Pack stay.

## Concord yard (shipped)

- West of the digest-engine, a stone opens the Concord yard. Drink the slag pool, which scars, or let the warden seal it. Vesper argues in the yard and does not enter the host. **Leave** at the south stone-gate returns to the ash. Continue stores the yard and the choice. Kestrel does not join and does not carry the crossing.
- Tap or hold the place name, or press Places, for a list of where the feet have been. It does not travel. Lira’s health is a bar as well as a number. Fights step a little faster, and a hit brightens the combat frame.
- Skies grade from the ground color toward a lighter horizon. The pipe has a stain and a lamp. The field bed stays. An absorb sting, original and CC0, plays when a pool is drunk and Sound is on.
- The mouse stick, Absorb, and Pack stay.

## Remnant Mark (shipped)

- North of the Concord yard, a stone opens the Remnant Mark. It is a numbered pillar, not the Prime Remnant. A Concord counter stands on the road. After him, the weep can be drunk, which scars, or left for the count to number. Vesper names the rumour and does not enter the host. **Leave** at the south returns to the yard. Continue stores the mark and the choice. Kestrel does not join and does not carry the crossing.
- Places names unfinished beats — a slag still open, a counter still on the road, a weep still a mouth — and does not travel. Scar stays on the HUD at zero. Strain says steady, taxed, or tearing. A hit shows a number as well as the log.
- The isle has a cooler fill light beside the sun. Characters and the yard and mark ground take a low shine. The mark fog sits close. An original CC0 merge sting plays when a merge is spent and Sound is on.
- The mouse stick, Absorb, and Pack stay.

## Ash nave (shipped)

- North of the Remnant Mark, after the counter, a stone opens the ash nave. The cathedral is in sight and sealed. Name the hinge, which scars, or leave the seal. The door does not open. Vesper is on the roof and does not enter the host. **Leave** at the south returns to the pillar. Continue stores the nave and the choice. Kestrel does not join and does not carry the crossing.
- Ash architecture, Concord banners, and falling ash sit on that road. Figures in the distance read as cutouts. The path screen says which strike is true and that the other two land thin. If Torren is in a fight, his first action sets his shoulder in front of the next blow. If Nima is, hers steadies whoever is lowest.
- The mouse stick, Absorb, and Pack stay.

## Watch gallery (shipped)

- East of the sealed cathedral door, **Enter** opens a Concord watch gallery. Read the count, which names the Prime Remnant as Licence Zero, or file the nave’s hinge into that count. Named Feed and the Unwritten Passage, if they are in the pack, are called digits and are not spent. The count turns the stair. The cathedral bar stays shut. **Leave** at the south returns to the nave, just outside the gallery door. Continue stores the gallery, the count, and those notes.
- After the count, a bird crosses the nave and does not land. Speak only if you walk to that crossing; ask or leave the air, and she still does not join. Stained light, denser ashfall, and banner wind sit on the nave. The remnant mass keeps a rim that reads through the fog. Cleave, Channel, and Aim each flash their own color.
- The mouse stick, Absorb, and Pack stay.

## Count crypt (shipped)

- Under the count-stair, **Enter** opens one crypt. A Concord ledger stands in a dark room. A Count Auditor meets you; the page on his arm takes the first physical blow, and the next lands on him. North, a crack shows the remnant. Vesper is the pressure and does not enter the host.
- Press Named Feed and the Unwritten Passage into the crack and they stay in the pack, thinner. Put a mouth on the crack and take one scar. Leave the crack and take nothing. The cathedral bar stays shut. **Leave** at the south returns to the gallery, short of the stair. Continue stores the crypt, the choice, and whether the names were pressed.
- Kestrel is not in the crypt and does not join. The mouse stick, Absorb, and Pack stay.

## First breach (shipped)

- If the crypt choice is Cracked Zero, **Enter** on the widened crack opens one threshold room. A mouth on the crack, or leaving the light, does not widen it; Look says so, and **Leave** / Continue stay safe. A Concord captain and a scribe hold the room. The captain’s licence hits once, harder, unless Torren’s shoulder is already in front. Nima’s first action still steadies the line. Victory puts remnant ash in the teeth and grants any merge those elements already name.
- After the stand, Vesper is in the light and will not duel. Hold the threshold, set a mouth on the light (one scar), or step back. None of the three opens the cathedral bar. **Leave** at the south returns to the crypt, short of the crack. Continue stores the breach, the choice, and the ash. Kestrel is not in the light and does not join.
- The room is taller than the crypt: ribs, light shafts, falling ash, a readable threshold plaque, and the remnant mass beside the light. The mouse stick, Absorb, and Pack stay.

## Remnant claim (shipped)

- If the breach choice is Held Threshold, **Enter** on the north light opens the nave interior past the bar. A mouth on that light, or stepping back, does not; Look and the quest line say Held Threshold is the gate. **Leave** and Continue stay safe.
- A Rite Celebrant holds the chamber. Physical blows land thin while the ward is up. A merge spell tears it. Torren’s shoulder and Nima’s steady still happen on their first actions. After the rite, Vesper is at the mass. Claim, refuse, share, or burn. She does not enter the host. Burn costs one scar. The other three do not. After the flag, north is the aftermath.
- Kestrel can be spoken to on a rib after the rite. Ask her to land, or leave her the rib. Landing puts her on the stone. She does not join.
- **Leave** at the south returns to the breach, short of the bar. Continue stores the claim, the flag, and whether she landed. The chamber is larger than the breach: a bar you have passed, ribs, light shafts, ash, a readable claim plaque, and Vesper’s silhouette beside the mass.
- The mouse stick, Absorb, and Pack stay.

## Aftermath (shipped)

- After a claim flag is set, **Enter** on the north mass opens one coda room. The quest line names it. Without a flag, that door is not there. **Leave** and Continue stay safe.
- The room resolves the flag. Claim: Lira still wears it, Licence Zero has no number, Vesper stays outside, the rot slows and does not die, the spark is fed and still hungry. Refuse: her name stays, the licence and the rot stay. Share: Vesper stands beside the mass, the page fails for two, both hungers remain. Burn: the scar is the echo, debt and the HP cut are spoken, they will write another licence, the rot roots deeper, the spark is angrier. She does not enter the host.
- Light, fog, the core, the licence ring, and her silhouette change with the path. The plaque is readable. Burn’s plaque names the debt and the cut. If Kestrel landed, she stands in the room and is still not in the pack. If she stayed in the air, she is not in the room.
- **Credits** are north and open the credits card. **Return** comes back to the aftermath, not the title. **Leave** south returns to the claim, short of the door. Continue stores the aftermath. The quest line completes when the ending has been heard.
- The mouse stick, Absorb, and Pack stay.

## Visual pass (this branch)

- Figures have a rim, eyes, and a sash so they separate from the grass and from a dark room. Lira’s chest holds a spark ember in the field and in a fight. Vesper’s silhouette keeps a thin rim and does not gain the ember.
- Verdant Isle has a far hill line and a sea that takes the sun. Stormreach’s water does the same, and the cliff carries teeth against the sky. The ash shelf catches a little highlight.
- The remnant claim is darker so the mass, the shafts, and the floor light own the room. A fill keeps the host readable. The fight stands on a ring: warm light on her side, cold light on theirs.
- Phone controls, Absorb, Pack, and Continue are unchanged.

## Still ahead

From DESIGN.md, after these endings:

1. The rest of the scar’s debt. The kiln, the earth cork, a fed leak, Vesper’s taste, the spoken name, a drunk yard slag, a drunk remnant weep, a named cathedral hinge, a mouth on the crypt crack, a mouth on the breach light, and a burned claim each add a point. Banking the marrow leak eases one. Pressing a digit, holding the threshold, and claiming, refusing, or sharing the remnant do not. Hearing the ending does not add a point. The burn’s debt is echoed in that room and is not charged twice.
2. The wider waystone network, the wind merges (ice, thunder, tide, root), and a party slot for Kestrel if she ever takes one.

Combat menus stay Fight / Magic / Item / Flee. New panels stay desktop-first.

## After Act I

The bible’s order, each act a production pull of its own (and as many follow-ups as the act needs):

- **Act II — Bottled Sky.** Stormreach Coast. Eagle and waystone. Lightning pools, Concord vaults. Vesper named in debate and a non-lethal duel. Merge tree opens (Fire+Water and the rest of the tree in DESIGN.md). Party grows. Kestrel’s sky routes.
- **Act III — The Rot That Speaks.** Ashen Marrow. Feeding heals and overfeeding scars the host as the moral weight. Concord digest-engine. Vesper’s method on the table.
- **Act IV — Remnant Wake.** Waystone network. The race for the Prime Remnant. Endings from merges, who lived, and whether Lira is still the host.

Audio stays open-licence and listed in `CREDITS.md` before a cue plays. The field bed is the first cue. It is original and CC0.
