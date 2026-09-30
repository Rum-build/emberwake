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

## Visual pass (shipped)

- Figures have a rim, eyes, and a sash so they separate from the grass and from a dark room. Lira’s chest holds a spark ember in the field and in a fight. Vesper’s silhouette keeps a thin rim and does not gain the ember.
- Verdant Isle has a far hill line and a sea that takes the sun. Stormreach’s water does the same, and the cliff carries teeth against the sky. The ash shelf catches a little highlight.
- The remnant claim is darker so the mass, the shafts, and the floor light own the room. A fill keeps the host readable. The fight stands on a ring: warm light on her side, cold light on theirs.
- Phone controls, Absorb, Pack, and Continue are unchanged.

## Midgame flesh (shipped)

- The leaf-village keeps a grey-furrow tray. Old Joss names it. The argument still recruits Nima.
- A porter stands short of the Stormreach vault door, wet because the book is not. Speak once. The door stays Enter. Continue stores the beat.
- The bottle-hall’s dark bottle faces inland, with a gold rope on the earth cork and a plaque that names Ashen Marrow. The crack-or-leave choice is unchanged.
- The ash shelf has footprints into the engine and a bill the tender could have written.
- A hit number kicks and reads larger. Opening Magic, once a merge is earned, says a merge spends two elements and a knife will not. The first Fight menu names the job.
- A Hollow Hare below half health bolts. The next physical blow finds almost nothing. A Brine Skitter splashes a second living person.
- The first absorb says strain cuts her while it is high, and a scar is a separate cut to max life. The kiln is named as the first scar.
- Stormreach retunes the bed higher. The remnant claim and the aftermath retune it lower. Both are the original loop. Silent still stops it. CREDITS names them.
- Phone controls, Absorb, Pack, and Continue stay.

## Place and letter (shipped)

- The leaf-village has beams, posts, and hearth soot. The counting room has a rug, a ledger, an iron bar, and a readable count. The ash has drifts and engine soot. The remnant claim has a floor crack, ash piles, and a stone ring under the mass. No new lights.
- A cousin’s letter in the village basket is missable. It says Vesper walked the Concord to the well. Look once and it sits in the pack as Cousin’s Margin. It does not open a door or change the kiln.
- The pack repeats the quest line. On a phone the quest under the place name stays to three lines.
- Continue names the saved place. One line under it says this browser keeps one save, and that Wake throws an ending out.
- After Aftermath credits, one toast says the rite remembers and a second walk is not this save. Wake still starts a new host.
- Phone controls, Absorb, Pack, and Continue stay.

## Deeper rooms (shipped)

- The pipe walk, the watch gallery, the count crypt, and the first breach read as places: a feed plaque and a drip cup, a shelf of ledgers, dust and a rib, ash piles and a crack in the aisle. No new lights.
- A filed copy on the gallery’s east wall is optional. If Cousin’s Margin is in the pack, the handwriting matches. If it is not, the village seal is filed as mercy and the furrow is not in the count. Look once. It does not open the stair, spend a seal, or block Leave.
- The quest under the place name is labeled. On a phone it still stays to three lines. A licence clerk spends a turn stamping the page. The next blow lands thin.
- Wake asks before it throws out a save that is already there. With no save, Wake still starts at once.
- Phone controls, Absorb, Pack, and Continue stay.

## Wake and pressure (shipped)

- The title lifts ash. The wake says the mouth stays hers. A pool’s core and rim breathe. Ash flickers as it falls. Standing still, she shifts her weight.
- West chalk in the ash nave is one optional Look. It names scar debt, Held Threshold if the bar was held, and Cousin’s Margin if the letter is in the pack. Otherwise it still pressures the host. It does not open the bar, add a scar, or block Leave.
- A scar cuts 5 max HP, and Mend keeps 3 of that instead of 4. The count auditor, the Concord captain, and the rite celebrant have a little more life. A merge still spends the two elements it names, and costs one mind less.
- A door sting, original and CC0, plays when she steps through. CREDITS names it. Silent stops it.
- Phone controls, Absorb, Pack, and Continue stay.

## Spine and camp (shipped)

- Continue keeps a saved step whose height is zero in the village, the cellar, the vault, the pipe, the throat, the ash, the yard, and the mark. The pack names the scar cut that the HUD already uses.
- On a phone the held-elements line wraps, and the scar chip stays inside the quest column.
- Drinking a pool throws the motes and the rim out for a moment. Ash falls a little wider. A blow flashes warmer and the number kicks a little harder.
- West of the Concord yard’s south gate, a rest is one optional Look. Torren speaks if he came. Nima speaks if she came. If neither came, Lira says the road is still hers. It does not drink the slag, set the yard’s word, add a scar, or block Leave. Continue stores the beat.
- Phone controls, Absorb, Pack, and Continue stay.

## Sky and aftermath (shipped)

- Skies carry a horizon band. Isle grass, coast shale, and ash take a finer grain. Fog sits closer on the mark and opens up on the isle, the coast, and the ash. The remnant mass is a column of stone around a fire, readable without another light.
- Each aftermath shows one object with the plaque: an empty ring and a living sprig, a sealed number over dead ground, a page split in two colors, or a red scar and a heap of ash. The burn line uses the same scar cut as the HUD.
- If Torren or Nima is in the party, they speak after a claim flag. If they are not, the choice is still Vesper’s. It does not change the flag.
- Motion can be stilled from the title or the pack. A fight’s Pace button runs slow, steady, or brisk. On a phone the command taps and the stick are larger, and the picture skips shadows and a full-resolution buffer.
- Credits still return to the aftermath. Leave still returns to the claim, short of the door. Continue stores motion and pace.
- Phone controls, Absorb, Pack, and Continue stay.

## Cast and notices (shipped)

- Vesper’s silhouette is a hood and an ash ribbon, and it lifts a little when motion is on. In a fight the party does the same. Still holds them quiet. The command window and the dialogue frame take a gold inner line. The turn ribbon names who is Now, and party and foe chips sit in different colors.
- A wayside chest on the isle gives one tonic and then stays empty. A waxed salt cord in the grass north of the ember goes in the pack and does not open a door. A posted notice on the shale says mouths are numbered. If Cousin’s Margin is already held, it names the furrow. It does not open the vault.
- Fights show chips for burn, stamp, air, licence, page, rite, knelt, ash in the teeth, and scar debt on Lira. Walking the ash nave, the first breach, or the remnant claim before the flag can meet an ash penitent. It kneels once. Ash coughs for 5 on that person’s next turn, or 4 if the salt cord is bound, and does not add scar debt. After the flag, the claim stays quiet.
- Still freezes the nave banners and the cough pulse. On a phone the ash motes update every other tick. Credits still return to the aftermath when motion is stilled and pace is slow. Continue stores both.
- Phone controls, Absorb, Pack, and Continue stay.

## Chamber and cord (shipped)

- The isle sun is harder and the fill is thinner. The coast and the ash sit darker, so day and night are not the same wash. Room walls catch the lamp they already have. The remnant floor and the chamber walls take a hotter specular from the fire that is already there. No new light was added.
- A living pool wears its element on a brighter rim and a taller column. A drunk or bottled mouth goes quiet.
- The salt cord can be bound once from the pack. Torren and Nima speak if they came. If they did not, Lira still ties it. Ash in the teeth then coughs for 4, not 5. It does not open a door, add a scar, or change a claim flag.
- The ash penitent is a shorter fight: less life, a lighter blow. Status chips are filled, and on a phone they are larger.
- Phone controls, Absorb, Pack, and Continue stay.

## Title and tally (shipped)

- The title, the path, and the credits sit in a gold frame. When a save is waiting, Continue is the gold action and Wake stays quiet until it asks. Lira’s ember is a core, a glow, and three motes. Still parks the motes. On a phone they skip every other orbit.
- A snapped mile post and a cold ring on the isle are optional looks. They do not open the kiln, drink a pool, or add a scar. A shelf gull can meet her on the coast. It cries once, spends up to 4 mind, and the cry fades on that person’s next turn. It does not add scar debt.
- A tally clerk on the east shale counts weather. If the bound cord is held, he says the knot is not a licence. If Cousin’s Margin is held, he says the furrow is already filed. If both are held, he says neither opens the door. He is not the porter. The vault stays shut.
- Phone controls, Absorb, Pack, and Continue stay. A phone-width walk from the claim into the aftermath still works with motion stilled.

## Ground and ration (shipped)

- The isle, the shale, and the ash sit a little higher in places. A mound, a log, a cairn, driftwood, and ash ribs are props, not doors. Ash streaks on the marrow and weather streaks on the shale when motion is on. Still holds them. The claim figure keeps a foot ring and a hotter edge.
- A verdant tonic and a wellwater phial say, on the pack and in a fight, how much HP or mind they return, and the toast names the new total. A stall on the west shale trades one rot-ash for a Concord ration that closes up to 22 HP. It does not take marks and it does not open the vault.
- Short of the yard’s north stone, a bench is a private word. Torren speaks if he came. If he did not and Nima did, she speaks. If neither came, Lira says so. It does not open the mark or drink the slag.
- Phone controls, Absorb, Pack, and Continue stay. Enter, Leave, and Continue still keep a claim flag.

## Foam and Nima (shipped)

- The isle sea and the shale water carry a slow foam when motion is on. Still holds the foam. On a phone the foam skips every other tick. The leaf-village has a cart, crates, a fence, and a rack, all outside the door. The remnant shafts wear a stained pane. The fight ring has posts and an inner line. No new lights were added.
- Drinking a pool whose rot is heavy puts one rot-ash in the pack. Brine, cinder mites, and the shelf gull can also drop it. The stall still trades one rot-ash for a ration and does not open the vault.
- A Concord ration can close up to 22 HP or return 12 mind, in the pack and in a fight. If that wound or that mind is already full, it stays in the pack.
- East of the Concord yard, a dry bundle is Nima’s private word. If Torren is there, they answer each other. On the bench short of the north stone, if both came, Nima answers Torren. Neither word opens the mark or drinks the slag. The new props do not sit on Enter.
- Phone controls, Absorb, Pack, and Continue stay.

## Cloth and patrol (shipped)

- Figures separate cloth, leather, and metal. A Concord coat wears a seal plate. Vesper’s hood keeps a dull iron pin. The ash shelf and the Concord yard use a dusk sky. Drinking a pool washes the screen. When motion is on, the camera dips. Still holds the dip and keeps the wash as a flat flash.
- West of the shale roost, two Concord coats look once. If a bound cord, Cousin’s Margin, or a ration is in the pack, they say so. None of those opens the vault. Torren answers if he came.
- Places lists Enter, Absorb, Look, and Closer. A pool inside a wider ring says Closer and brightens its rim before Absorb appears. The village fence sits further outside the door.
- The absorb sting adds a soft sine. A ration bite plays when the biscuit is traded or taken, if Sound is on. Both are original and listed in CREDITS.md.
- Phone controls, Absorb, Pack, and Continue stay.

## Dusk claim (shipped)

- The remnant claim and the aftermath retint the lights already in the room. Claim is gold and fed. Refusal is a cold licence. Share splits warm and violet. Burn drops the room and heats the scar. The door does not move.
- Ash is Thin, Steady, or Thick from the title and the pack. Still holds the motes. The count follows the setting. On a phone the motes still skip every other tick.
- A fight draws a Concord coat with the same cloth, leather, and seal plate as the field. A beast, a mite, a wisp, the kiln, and the gull take a rim and the same metal.
- West of the roost, the patrol can be provoked. The coats fight. Leaving them does not. The vault door does not open either way.
- A gull’s cry stays through that person’s turn. Mind from a ration breaks it. The wound side does not. If the mind was already thin and not steadied, the cry costs 4 HP when the turn ends. A ration still closes 22 HP or returns 12 mind. A steadied mind holds the next cry to 2.
- The first dusk on the ash is one inner line from Lira and the spark. It does not scar, and it does not open the engine.
- Places leaves the stick, Absorb, and Enter live. Closer still means step in. The village door still says Enter.
- Phone controls, Absorb, Pack, and Continue stay.

## Leaf-cup after (shipped)

- After the leaf-cup patrol, one inner beat: Lira, the spark, and Torren if he refused the seal. The cork is in. They named the spark. The furrow does not open, and the well stays polite. Winning the fight says the coats are down. Leaving the fight does not.
- The bottled cup keeps a waxed stake and a brass plate. The coats leave the grass. It is not a door, and it is not Absorb.
- In a fight, a Concord warden lifts the seal before the licence lands. It costs more life unless a shoulder is already in front. A scribe wets the pen before the next line takes mind, and the cut is still HP. The chips say Licence and Ink.
- A fight starts with a short draw, if Sound is on. It is original and listed in CREDITS.md.
- Phone controls, Absorb, Pack, and Continue stay.

## Face and weather (shipped)

- Hair reads as a cap, a fringe, and a fall. Concord hair stays cropped. Vesper’s falls past the shoulder. A brow and a mouth sit on the face that already had eyes and a nose. No new light was added.
- The harbor vault and the Concord yard carry licence piers and a gold beam. They sit off the walk. They are not doors.
- Light rain falls on the isle and the shale when Motion is on. An ash gust falls on the marrow, the yard, the claim, and the aftermath, unless Ash fall is Thin. Still hides both. On a phone the fall skips every other tick.
- East of the crypt aisle, a folded notice on a peg calls the crack weather. It does not open the crack or the bar.
- A spare green off the west path of the isle is a second verdant tonic. The wayside chest is still the first. Neither opens the kiln.
- The fight order is a ribbon: Now, then the names, with a mark between them.
- Ash fall names Thin, Steady, or Thick, and says whether that is fewer motes, the usual fall, or more.
- On a phone the place list starts under the HUD. The stick, Absorb, and Enter stay live.
- If she has named the dusk, corked the leaf-cup, or provoked the shale patrol, Vesper says so when she meets Lira on the ash. She still does not enter the host.

## Remnant night (shipped)

- The Remnant Mark carries broken piers, brass beams, and a night sky with an ember horizon. The nave uses the same night. The coast skies use dusk. Day on the isle stays day.
- A pool shows a ripple and a sheen while it is still a mouth. A bottled cup stays quiet.
- East of the mark aisle, a numbered scrap goes in the pack. It does not open the nave or the weep.
- A bird sits on the west pier. Leave her the air, or ask her to keep company. Both end in a refusal. She is not in the pack.
- A brine wets the stone before the splash. A stoker opens the plate before the heat. A mite lifts a jaw before the second bite. The chips say Wet, Heat, and Jaw, and on a phone they are large enough to read.
- Wake says the first pool is behind her. Flat stones lead to it. Absorb is named. Credits lists the eight cues that ship and says telegraphs stay silent.
- Phone controls, Absorb, Pack, and Continue stay.

## Nave and scrap (shipped)

- The ash nave has pews, choir stalls, and a brass inlay off the aisle. The first breach has fallen voussoirs, a side colonnade, and more ash. Neither sits on the door, the bar, or the south step.
- Walking swings the arms and shifts the weight. Standing breathes. Still freezes both.
- A fight’s floor and lights follow the place: day on the isle, dusk on the shale and in the vault, night-ember on the ash and the remnant rooms.
- The numbered scrap can be read once from the pack. Reading it does not open the nave, the weep, or the vault. A tally clerk on the shale can see that count, and the door stays the other board.
- A Concord counter lifts a bead before his next blow, and that blow lands thin. A cinder splits before a small spark. The chips say Bead and Flare.
- An ash penitent still kneels. The cough is 5, or 4 if the cord is bound, and the swing is lighter. A brine’s splash on a second body is a nick of at most 3.
- Places lists the numbered scrap once it is in the pack. On a phone the place list still starts under the HUD.
- Phone controls, Absorb, Pack, and Continue stay.

## Crypt and hall (shipped)

- The count crypt has urns, side posts, and a brass tally off the aisle, the notice, and the south step. The bottle-hall has a side colonnade, small vials, a wax circle, and a gold chain. The center walk, the earth jar, and the marrow jar stay clear.
- Each aftermath object is a little fuller: a stand and a cup under the claim, a plate under the refuse number, a seam between the share halves, a coal beside the burn. The words and the lights do not change.
- The title carries a ring, a spark, and a bottle. Still and reduced motion hold the pulse.
- If Torren or Nima is in the company when the scrap is read, they answer once. If neither is, the spark says the page stays in the pack. Reading it still does not open the nave.
- Magma and Glass show their colour in the fight. That colour is not a cue. The eight sounds stay the set in CREDITS.
- After the harbor vault has been seen, a spire mite can meet her on the shale. It lifts salt. The next bite costs a little life and a little mind. The chip says Salt. It does not appear on the first coast walks.
- Phone controls, Absorb, Pack, and Continue stay.

## Coast and claim (this branch)

- The shale water carries buoys, a broken hull, and a net, past the walk. The isle’s north rim carries the same buoys. They are not doors.
- The counting room has a shelf, ink, a spare ledger, a stool, and a brass tally off the aisle and off the north iron.
- The remnant mass sits on a plinth, with a bright column through it, so the claim reads from the south step.
- Ash motes carry a little colour of their own. Still still holds them.
- After the scrap is read, the quest says a tally clerk can see the count and the nave stays shut.
- A tally clerk names salt if a spire mite has bitten. If the scrap is also read, he names both, and the door stays the other board. On the ash, Vesper names the salt and still does not enter.
- The pack stacks items, sorts them, and says the stack count. Shards stay one each, sorted by element. Seals sit in name order under the badge.
- Plasma, Steam, and Storm show their colour the way Magma and Glass do. That colour is not a cue. The eight sounds stay the set in CREDITS.
- Phone controls, Absorb, Pack, and Continue stay.

## Village, kiln, and the ash shelf (this branch)

- The leaf-village has a table, cups, a bench, a shawl, and herbs off the letter basket and off the south step.
- The buried kiln has a brick ring, an ash pan, a poker, and grate bars. They do not cover the mouth.
- The ash shelf has a plank and three stakes off the tender, the pipe, the yard stone, the leak, and the south step.
- A fight’s camera sits a little farther back and frames both ranks. Still holds that frame.
- West of the roost, a Concord coat names the corked leaf-cup. The vault stays the other board.
- In the aftermath, Torren and Nima speak for the claim flag if they are there. Vesper still does not enter.
- In a fight, Use 1 names the stack. The log says what remains.
- Places shows the quest in full, and the lines wrap on a phone.
- Phone controls, Absorb, Pack, and Continue stay.

## Harbor board, hall, and crypt (this branch)

- The shale has crates, a rope coil, two lantern posts, a gull perch, and wet cobble. They sit off the vault door, the tally clerk, the roost, the porter, the notice, the stall, the patrol, and the pools.
- The bottle-hall has a side shelf of bottles, a tally slate, and an iron grate shadow off the aisle, the earth jar, and the marrow jar.
- The count crypt has a standing tally slate and a grate shadow off the notice and the south step.
- A telegraph draws a coloured ring at the enemy’s feet and a brighter chip. That ring is not a cue.
- Magma and Glass already wash the way Plasma, Steam, and Storm do. The absorb sting and the merge sting already play. No ninth cue. The eight sounds stay the set in CREDITS.
- Phone controls, Absorb, Pack, and Continue stay.

## Nave, breach, claim, and the first hour (this branch)

- The ash nave has a fallen pew, an ash drift, and iron candle stubs off the west chalk, the gallery door, and the south step.
- The first breach has a cracked column base, an ash drift, and iron candle stubs off the bar and the south step.
- The remnant claim has a plinth scrap, a cracked column base, an ash drift, and iron candle stubs off the mass and the south step.
- Before the village, the quest and Places say the leaf-village is north-west and a letter is in the basket. That line does not name the kiln or the road past it.
- Drinking a pool throws a ground ring and a short burst of embers. The ring is not a cue. The eight sounds stay the set in CREDITS.
- Phone controls, Absorb, Pack, and Continue stay.

## Marrow dusk, the assist, and the debt (this branch)

- The ash shelf, the sealed throat, and the Concord yard sit in a closer dusk. A grate, a sack, a cinder bowl, an iron coil, and a yard drift sit off the tender, the pipe, the yard stone, the leak, and the south steps.
- In a fight, Torren’s shoulder and Nima’s steady show on the turn ribbon and on their card. The licence ring at an enemy’s feet stays. A hit flashes hotter. The numbers of the blows stay where they were. Neither the chip nor the flash is a cue.
- On a phone, scar debt reads as Debt and takes a warmer chip when a point is owed. Places and the stick stay clear.
- The eight sounds stay the set in CREDITS.

## Isle company, the cup, and the scar (this branch)

- After the village, and before the letter, the quest and Places say Nima walks with her and the letter is still in the basket. They do not name the kiln.
- After the letter, and before the patrol, the quest and Places say the leaf-cup is south-west of the wake and a licence is already there. They do not name the kiln.
- The path line names who walks with her. Alone, it stays the path.
- The leaf-cup has two licence stakes and a wax cloth off the mouth. Vesper’s scar has an ash pile and two short posts off the mouth.
- A fight that has a warden, and Torren in the line, opens on the coat and the seal. The blow is unchanged.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Coast vault, mist, and the licence (this branch)

- After the waystone, and before the bottle-hall, the quest and Places name the harbor vault and the tally clerk east of the door. They do not open a tutorial.
- After the vault is named, and before the clerk, the line stays on the clerk. The hall waits.
- Stormreach wears a closer mist. A light rain hangs on the shale even when Motion is off, and it falls when Motion is on. The vault door, the clerk, the roost, and the porter stay clear.
- A coast fight with a clerk and a warden opens on the licence. The blow’s numbers stay where they were. That line is not a cue.
- Phone controls, Absorb, Pack, and Continue stay.

## Hall of corks, the scrap, and Lira (this branch)

- After the clerk, and before the bottle-hall, the quest and Places name the hall of corks. That is the bottled monopoly. They do not open a tutorial.
- On the Remnant Mark, before the scrap is taken, the quest and Places name the numbered scrap east of the aisle. The count crypt names that scrap if it is still on the peg.
- The mark wears more ash, a cooler rim, and a few stones off the scrap, the weep, the nave stone, the perched wing, and the south step.
- Lira’s coat keeps a cooler scarf and a clearer face so she reads on the dusk boards. Concord coats and Vesper stay as they were.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Aftermath boards and the credits (this branch)

- Each ending keeps a short closing line. Claim: she still wears it. Refuse: her name stayed and the number stayed. Share: she stands beside the mass and does not enter. Burn: the scar is the echo.
- The room wears a side board, a rim, and a few stones off the credits and the south step. On Share, Vesper stays beside the mass.
- Credits names the browser engine and thanks the walk. The claim bed sits quieter in that room. That quieter seat is the same cue.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Title dusk, isle leaves, and the fight bar (this branch)

- The title sits in a cooler dusk, with a second ember on the mark and one short line under the spark. Continue still names the save. The phone buttons stay clear of each other.
- The Verdant Isle field wears a light green haze and a leaf-fall. The leaves hang when Motion is off and drift when it is on. The letter, the village door, the ember, the leaf-cup, and the kiln stay clear.
- A dusk fight’s enemy bar and the foe chip on the ribbon read one notch clearer. The numbers stay where they were.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Vesper at the scar, and the yard (this branch)

- After the scar verdict, and before the waystone, the quest and Places say Vesper farms the rot. An ash veil hangs off that mouth. The absorb there still answers. She does not enter the aftermath.
- The Concord yard keeps a lantern’s smoke and a seal stake off the slag, the warden, the mark stone, and the south step. The dusk rim that was already there stays.
- A fight that remembers her mouth says she farms the rot. The blow is unchanged.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Breach grit and company faces (this branch)

- A fight in the first breach or the ash nave opens on ember grit. The foe wears a clearer rim. The breach fight names the breach. The blow is unchanged.
- Torren keeps a scar and a red scarf. Nima keeps a herb scarf. Their chips on the ribbon match. Lira’s scarf stays as it was. Assist chips stay.
- Before the breach is walked, Places names it north of the widened crack. The letter, the kiln, and the leaf-cup stay as they were.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Claim approach (this branch)

- The walk into the Remnant Claim wears an ash rim and a cooler light, off the south step. The quest and Places name the Claim before the choice.
- Lira speaks once before that board. The spark listens. Claim, refuse, share, and burn stay the same choices. She does not enter.
- The claim bed sits a little under the field so the low tones read. The aftermath seat stays quieter. That is the same cue.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Pack, absorb, and the roost (this branch)

- On a phone, the pack’s item rows keep the stack apart from the name, and Close sits across the top so it does not cover the stick or Places.
- A pool in range wears one brighter ring. The prompt puts Absorb in front of the pool’s own name. The drink, the radius, and the scar stay as they were.
- The harbor roost keeps a rope, a lamp, and a mist rim off the roost, the door, the clerk, and the south walk.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Wake host, and the Concord patrol (this branch)

- Before the village, the field and Places say the spark is in Lira and the mouth stays hers. The letter, the kiln, and the leaf-cup stay where they were.
- The Concord patrol fight names the Concord. Ash sits on that floor, and the coats wear a pale rim. The blow is unchanged.
- On a phone, Lira’s ribbon chip and the strike names Warrior, Mage, or Ranged one notch clearer. Assist chips stay.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Bottle-hall, and the save (this branch)

- The bottle-hall keeps a cork row, seal dust, and a cooler lamp off the aisle, the earth jar, and the inland bottle. The hall of corks and the scrap stay as they were.
- Continue on the title glows when a save is there, and the note says it was saved here. The button still names the place.
- After the hall is walked, Places names the bottled hall north of the count. It does not repeat the cork quest.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Kiln heat, and the leaf-cup (this branch)

- The buried kiln keeps an ember glow, a soot rim, and a little smoke off the mouth. The ash shelf in the cellar keeps a soot mark and one ember. The drink is unchanged.
- The leaf-cup keeps a cooler rim, a wax sheen, and a scatter of leaves off the mouth. The letter and the cup stay in the same order.
- A hit washes hotter. The numbers of the blows stay where they were. The wash is not a cue.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Coast shore, and the waystone (this branch)

- The shale keeps a foam rim, wet sand, and a licence-post glow off the roost, the door, the clerk, and the pools. The mist and the licence fight stay as they were.
- The waystone keeps a carved rim, ash grit, and a cooler light off the mouth. Vesper’s lines stay as they were.
- After the scar, Places names the north ridge stone. It does not repeat that she farms the rot.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Marrow crypt, and the village door (this branch)

- Ashen Marrow keeps bone ribs, cooler dust, and a marrow lamp in the south corridor, off the leak, the tender, the yard stone, the pipe, and the south step. The bottle-hall stays as it was.
- The leaf-village door keeps a lamp, a leaf wreath, and a dusk rim off the door, the kiln, and the leaf-cup.
- After the marrow is walked, Places names the bone-ash crypt. It does not repeat the cork quest or the scrap.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Remnant Mark, and the isle bed (this branch)

- The Remnant Mark keeps a carved rim, ember grit, and cooler stones on the night aisle, off the weep, the scrap, the perch, the nave stone, and the south step. The ash and the cooler light stay as they were. The Claim choice stays as it was.
- The field bed is the same loop. On the Verdant Isle its filter opens to 380, and it starts on the first touch of the title. Coast, claim, and aftermath keep their own cuts. Motion does not stop it. Silent still does. No new cue.
- After the mark is walked, Places names that carved rim. It does not repeat the Claim.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Assist lines, and the harbor telegraph (this branch)

- When Torren’s shoulder fires, he says the coat stays on him. When Nima’s steady fires, she says to hold, and that the herb is not a door. The heal is still 14. The chips stay Torren · shoulder and Nima · steady.
- The harbor keeps a signal post: a wire, a spark tick, and a cooler lamp, off the roost, the vault door, the clerk, and the pools. The telegraph ring in a fight stays as it was.
- Places names that post. It does not repeat the roost or the corks.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Ending boards, and the credits scroll (this branch)

- Each aftermath board keeps an ash frame and a cooler lamp. Claim wears a gold ring, refuse a cool bar, share two halves, and burn an ember. The four closing lines stay. Vesper does not enter the company.
- Credits keeps the same eight cues and the same thank-you. The lines sit further apart, the thank-you block reads clearer, and a little ember grit sits on the scroll. No new cue.
- After the ending is heard, Places names Credits north of the room. South still steps back to the claim.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Strike labels, and the debt number (this branch)

- On a phone, Fight and the three strikes sit on taller buttons. Warrior, Mage, and Ranged stay named on their own row. The blows are unchanged. The stick stays clear once the fight is over.
- The debt chip keeps its place. The number reads clearer, and an ash rim sits outside the chip. Places names the Concord debt. The cut per point stays 5.
- A line from her side reads cool. A line from theirs reads warm. The words stay as they were.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Title buttons, and the cousin’s letter (this branch)

- Wake, Continue, Motion, and Ash wear an ash frame. Motion and Ash read lit while they are on. On a phone the taps sit a little taller. Continue still glows when a save is there. The buttons do the same work.
- The cousin’s letter keeps a cooler ash rim and a little ember grit on the paper. The body reads a notch clearer. The words and the quest stay as they were.
- Before it is read, Places names the letter in the basket. It does not say what the letter says. South still leaves the village.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Yard haze, and a brighter drink (this branch)

- The Concord yard keeps a cooler dusk ash haze, cork grain on the seal stake, and a little seal-dust near the lantern. The lantern, the smoke, and the stake stay where they were. The walks stay the same.
- On the scar, the leaf-cup, and the kiln, the pale ring pulses a little brighter, and a few more sparks rise when the drink lands. The cost, the strain, and the amount in the pool stay as they were.
- Places names the Concord stake in the yard. It does not say what the slag will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Cellar mouth, and the jar crawl (this branch)

- The root-cellar arch on the east grass keeps an ash lintel, a few embers, and a cooler lamp. The step in stays the same.
- The crawl keeps an ash beam, cooler dust, wax on the jars, and a small lamp. The mites, the kiln, and the drink stay as they were.
- Places names the cellar mouth. It does not say what the kiln will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Nave dust, and the mark catch-light (this branch)

- The ash nave keeps cooler dust shafts, ash on the near pews, and a few ember motes in the colonnade. The doors and the south step stay where they were.
- The step back toward the Remnant Mark keeps a small carved rim and a catch-light. It does not open a new door.
- Places names the colonnade. It does not say what the claim will do. South still steps back to the mark.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Counting room, and the vault seal-dust (this branch)

- The counting room keeps cooler salt dust, a clearer rim on the ledger lamp, and ash on the counter. The clerk and the door stay where they were.
- The vault door keeps a little cooler seal-dust. It does not add a lock or a key.
- Places names the counting room. It does not say what the claim will do. South still steps back to the shale.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Roost night, and the pier lamp (this branch)

- The eagle roost keeps a cooler night haze, grain on the rope, and a little ember grit on the perch beam. The rope, the lamp, and the mist stay where they were. The climb stays the same.
- The harbor pier keeps a wet sheen and a cooler lamp. The telegraph stays. No new person stands there.
- Places names the roost. It does not say what the claim will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Bottle-hall dust, and the crypt lamp (this branch)

- The bottle-hall keeps cork grain on the near row, cooler dust shafts, and a little more seal grit on the floor. The walks stay.
- The marrow crypt keeps cooler dust and a clearer rim on the lamp. The ribs stay. No new fight.
- Places names the bottle-hall. It does not say what the claim will do. South still steps back to the count.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Village path, and the door sill (this branch)

- The isle path keeps a few more near-field leaves and cooler dusk haze. The walk stays the same.
- The leaf-village door keeps clearer grain on the wreath and a little ash on the sill. The lamp, the wreath, and the dusk rim stay. The step in stays.
- Places names the village path. It does not say what the claim will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Scar farm, smoke and rot (this branch)

- Vesper’s scar keeps a little smoke, ash on the near ground, and a rot film on the blister. The ash pile, the posts, and the veil stay. The walk stays.
- Places names the scar farm. It does not say what the claim will do. She does not enter.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Harbor pier boards, and the salt (this branch)

- The harbor pier keeps plank grain and salt on the near boards, and a little cooler spray beside the lamp. The wet sheen and the cooler lamp stay. No new person stands there.
- Places names the pier. It does not say what the claim will do. The telegraph stays.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Claim approach lintel (this branch)

- The south mouth of the remnant claim keeps grain on the lintel, ash on the sill, and a cooler catch on the open post. The approach ring stays. The south step stays.
- Places names that lintel only after the claim is walked. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Breach dust, and the near stones (this branch)

- The first breach keeps mortar grain on the near stones, cooler dust beside them, and a cooler catch on the open rib. The shafts, the bar, and the piles stay. The south step stays.
- Places names that dust only after the breach is walked. It does not say what the claim will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Crypt sill grit (this branch)

- The marrow crypt keeps bone grain on the near ribs, cooler grit on the sill, and a cooler catch on the open rib. The lamp and the rim stay. The south step stays.
- Places names that sill once the marrow is walked. It does not say what the claim will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Harbor pier, the salt line (this branch)

- On the near boards, Lira says Concord counted the weather and left the tide. Torren, when he walks with her, names the short bottle they called a licence. The spark says Vesper farms the rot inland and does not stand on the pier. The telegraph stays.
- The look is on the salt. The quiet stand off the boards stays quiet. The walk stays.
- Places still names the pier. It does not say what the claim will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Scar farm, the smoke line (this branch)

- South of the blister, a look lets Lira say Concord named the cough mercy and the grass kept the footprint. Torren, when he walks with her, says the stamp did not stop the cough. The spark says Vesper farms the rot and does not take the host. The drink stays the blister.
- The absorb on the scar stays the drink. The walk stays.
- Places still names the scar farm. It does not say what the claim will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Concord yard, the gate cork (this branch)

- West of the quiet stand, a look at the south gate lets Lira say Concord licensed the leak and left the yard open. Torren, when he walks with her, says the stamp held the book and did not hold the rot. The spark says Vesper farms the rot past the gate and does not take the host. The slag stays the drink.
- The rest, the warden, and the quiet stand stay where they were. The south step stays.
- Places still names the stake. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Ash nave, the pew dust (this branch)

- On the east pews, a look lets Lira say Concord numbered the host and left the door shut. Torren, when he walks with her, says the number held the book and did not open the bar. The spark says Vesper is on the roof and does not take the host. The dust is not a drink.
- The west chalk, the gallery door, and the quiet stand stay where they were. The south step stays.
- Places still names the colonnade. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Counting room, the ledger lamp (this branch)

- West of the quiet stand, a look at the ledger lamp lets Lira say Concord called the shortage a courtesy and the book stayed dry. Torren, when he walks with her, says the stamp held the page and did not stop the leak. The spark says Vesper farms the rot inland and does not take the host. The lamp is not a drink.
- The quiet stand stays empty. The south step stays.
- Places still names the counting room. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Cellar mouth, the arch ash (this branch)

- In the mouth room, a look at the arch lets Lira say Concord left the heat under the jars and called the field safe. Torren, when he walks with her, says the stamp held the licence and did not hold the heat. The spark says Vesper farms the rot above the mouth and does not take the host. The kiln stays the drink.
- The kiln, the crawl, and the field door stay where they were. The south step stays.
- Places still names the cellar mouth. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Bottle-hall, the near corks (this branch)

- On the near row, a look lets Lira say Concord gilded the shelf and left the dark bottle corked. Torren, when he walks with her, says the stamp held the show and did not hold the leak. The spark says Vesper farms the rot past the hall and does not take the host. The corks are not a drink.
- The quiet stand stays empty. The inland step stays.
- Places still names the bottle-hall. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Eagle roost, the perch night (this branch)

- Beside the climb, a look lets Lira say Concord licensed the cliff and left the wing in the air. Torren, when he walks with her, says the stamp held the licence and did not hold the bird. The spark says Vesper farms the rot inland and does not take the thermal. The climb stays the way home.
- The roost button, the quiet stand, and the pier stay where they were.
- Places still names the roost. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Harbor telegraph, the wire tick (this branch)

- At the post, a look lets Lira say Concord sold the weather and left the post counting. Torren, when he walks with her, says the stamp held the count and did not hold the storm. The spark says Vesper farms the rot inland and does not stand at the wire. The tick stays.
- The pier, the vault door, and the quiet stand off the door stay where they were.
- Places still names the telegraph. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Waystone, the south stones (this branch)

- South of the ring, a look lets Lira say Concord counted the ring and left it cold. Torren, when he walks with her, says the stamp held the count and did not warm the stone. The spark says Vesper farms the rot off the ridge and does not take the host. The stones stay cold.
- The land through the ring stays. The tease and the wake stay on the stone.
- Places still names the waystone. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Village path, the dusk (this branch)

- South of the leaf-village, a look lets Lira say Concord licensed the wreath and left the door half shut. Torren, when he walks with her, says the stamp held the licence and did not hold the argument. The spark says Vesper farms the rot past the door and does not take the host. The path stays.
- The door stays Enter. The letter stays in the basket.
- Places still names the village path. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Party kit, and the path stones (this branch)

- Lira, Nima, Torren, and Vesper’s silhouette keep hands, leather cuffs, and boots. Lira wears a hip blade, Nima a green rod, Torren a cudgel, and Vesper a dark shard. The walk stays the same.
- The village approach keeps dusk flagstones, grit, and grass tufts, with a small cool lamp. They sit off the door, the quiet stand, and the path look.
- Places still names the village path. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Kiln floor, the hearth grain (this branch)

- The buried kiln keeps a varied brick floor, a raised hearth lip, three courses on the back wall, ash heaps, and heat cracks. A warm fill sits over the back of the room.
- The drink stays the kiln. The cellar mouth, the crawl, and the south step stay.
- Places still names the cellar mouth. It does not say what the ending will do.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Party faces, the cloth read (this branch)

- Lira, Nima, and Torren keep a jaw, a brow, and an eye glint. Lira’s hair sweeps to one side. Nima wears a braid and a cloth placket. Torren keeps a beard, a crop, and a metal coat seam. Each scarf has a hanging fold.
- Vesper’s silhouette keeps a darker cloth mass and a hair lock. She does not take a lit face. She does not enter Aftermath.
- The hands, boots, and hip kits stay. The walk stays. No new cue.

## Party faces, the nearer read (this branch)

- Lira, Nima, and Torren keep a nose bridge and a cheek plane on each side, in the field and in a fight. Scarf cloth has another fold and a hanging hem. Lira’s sweep, Nima’s braid, and Torren’s crop and beard sit a little fuller.
- Hands, boots, hip kits, and the leather and metal seams stay.
- Vesper stays a darker cloth mass and a hair lock. She does not take a lit face. She does not enter Aftermath.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Gear on the body (this branch)

- Lira’s equipped weapon is on her body in the field and in a fight. The scout knife stays on the hip. The ashwood blade is longer, with an ember edge. The wellwood staff is in the right hand. The reed bow crosses the chest, with a quiver. Stow the weapon and the hands are empty.
- The quilted jerkin adds padded shoulders, side gussets, and a stitched chest. Stow it and that bulk leaves. Pack text and the body match.
- Hands, boots, faces, and the other hip kits stay. Nima’s rod and Torren’s cudgel stay. Vesper stays a darker cloth mass and a hair lock. She does not take a lit face. She does not enter Aftermath.
- Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Road cloak, and the weapon grain (this branch)

- East of the wake, a stake holds a road cloak. Take it. Equip it from the pack and Lira’s shoulders widen, with wool hanging past the hips and a clasp at the throat. Stow it and that shape leaves. The quilted jerkin can stay on under it.
- The scout knife’s sheath shows grain and a strap. The ashwood blade keeps an ember glow. The wellwood staff’s gem is faceted. The reed bow’s quiver has straps. Nima’s rod and Torren’s cudgel stay.
- Hands, boots, and faces stay. Vesper stays a darker cloth mass and a hair lock. She does not take a lit face. She does not enter Aftermath.
- The stake is off the door, the quiet stand, and the path look. The kiln stays the road. Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Party kits, and the road bracers (this branch)

- Nima and Torren walk beside Lira once they have joined. In the field and in a fight, her rod shows grain, a wrap, a ferrule, and a cut herb tip. His cudgel shows grain, two bands, a wrap, and a scorched head.
- Equipping the herb shawl hangs leaf cloth on Nima. Equipping the quartermaster coat hangs scorched cloth on Torren. Stow either one and that shape leaves. The weapons leave when they are stowed.
- South of the wake, a pair of road bracers lies in the grass. Equip them and Lira’s forearms widen. They do not replace the cloak, the jerkin, or the weapon. Stow them and the forearms slim.
- Faces, hands, boots, the cloak, the jerkin, and Lira’s weapons stay. Vesper stays a darker cloth mass and a hair lock. She does not take a lit face. She does not enter Aftermath.
- The bracers sit off the cord, the cloak stake, the door, and the quiet stand. The kiln stays the road. Phone controls, Absorb, Pack, and Continue stay. No new cue.

## Shipped in the wake ground pass

Around the wake and the path approach, the ground now carries layered grass clumps, dirt patches, small stones, root ridges, and a soft dusk wash. The village path stones, the kiln, the cloak stake, and the bracers take spots are the same meshes as before. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the leaf-cup grove pass

Around the leaf-cup, the bank now carries layered moss, damp dirt, small stones, root curls, and a soft green wash at the water edge. The drink, the licence stakes, and the wax cloth are the same. The wake ground, the path stones, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the scar-farm ground pass

On the approach to Vesper’s scar, the ground now carries cracked earth plates, ash grit, weed tufts, scorched stones, and a soft smoke tint. The farm-smoke columns, the ash caps, and the drink are the same meshes as before. Wake ground, the leaf-cup bank, the path stones, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the yard approach pass

Inside the Concord yard’s south gate, the ground now carries worn cobble plates, chalk grit, weeds in the joints, a gate shadow, and a soft dusk wash. The gate posts, the cork look, the seal stake, and the lantern haze are the same. Wake ground, the leaf-cup bank, the scar approach, the path stones, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the pier board pass

On the harbor pier, the wet edge now carries warped plank grain, salt crystals, wet sheen puddles, a rope-worn edge, and a cooler lamp wash. The salt markers, the pier lamp, and the spray stay where they were. Wake ground, the leaf-cup bank, the scar approach, the yard cobbles, the path stones, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the roost ground pass

At the messenger roost, the perch and the rope walk now carry grit, rope grain wear, night haze on the boards, feather grit, and a cooler lamp rim. The hanging rope, the night shafts, and the wing look stay where they were. The pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the waystone south pass

South of the sleeping waystone, the approach now carries layered flagstone plates, lichen grit, moss in the joints, a soft dusk wash, and worn edge chips. The waystone ring, the rim grit, and the south-stone look stay where they were. The roost ground, the pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the village path pass

On the village path, the ground now carries packed dirt plates, layered leaf litter, small stone chips, and a soft dusk wash. Ash grit sits beyond the door wreath. The dusk flagstones, the path look, and the wreath stay where they were. The waystone approach, the roost ground, the pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the nave floor pass

In the ash nave, the floor now carries worn flagstone courses, dust grit in the joints, a soft dust wash, pew-shadow fill, and scuff marks. The east pew dust, the brass inlays, and the colonnade shafts stay where they were. The village path, the waystone approach, the roost ground, the pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the bottle-hall floor pass

In the bottle-hall, the floor now carries cork grit underfoot, a seal-dust wash, worn tile plates, shelf-shadow fill, and scuff marks toward the cork racks. The near corks, the seal grit, and the rack dust stay where they were. The nave floor, the village path, the waystone approach, the roost ground, the pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the cellar mouth pass

At the cellar mouth, the floor now carries ash grit plates, damp stone courses, a mouth-ash wash, threshold scuffs, and a cooler lamp rim on the stones. The mouth ash, the door, and the arch lamp stay where they were. The bottle-hall floor, the nave floor, the village path, the waystone approach, the roost ground, the pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the counting-room floor pass

In the counting room, the floor now carries worn ledger-board grain, chalk grit, a lamp-warm wash on the boards, desk-shadow fill, and scuff marks toward the clerk desk. The ledger lamp, the rug, and the salt shafts stay where they were. The cellar mouth, the bottle-hall floor, the nave floor, the village path, the waystone approach, the roost ground, the pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the telegraph approach pass

On the walk up to the harbor telegraph, the ground now carries packed dirt plates, wire-pole grit, sparse grass tufts, a soft dusk wash, and scuff marks under the wire. The tick, the post, and the cooler lamp stay where they were. The counting room, the cellar mouth, the bottle-hall floor, the nave floor, the village path, the waystone approach, the roost ground, the pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the vault sill pass

At the harbor vault door, the threshold now carries worn stone courses, seal grit, a cooler lamp wash on the sill, threshold scuffs, and a soft shadow under the vault lip. The door, the seal, and the lamp stay where they were. The telegraph approach, the counting room, the cellar mouth, the bottle-hall floor, the nave floor, the village path, the waystone approach, the roost ground, the pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the clerk desk pass

Beside the counting-room clerk desk, the floor now carries worn ledger-side planks, stone courses, ink grit near the desk legs, a cooler lamp wash on the walk, scuff marks from standing, and a soft shadow under the desk lip. The clerk, the ledger lamp, and the rug stay where they were. The vault sill, the telegraph approach, the counting-room aisle, the cellar mouth, the bottle-hall floor, the nave floor, the village path, the waystone approach, the roost ground, the pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the cellar door pass

At the root-cellar door, the threshold now carries worn mouth stones, damp grit at the sill, a cooler ash wash from the mouth lamp, threshold scuffs, and a soft shadow under the door lip. The door, the arch lamp, and the interior mouth floor stay where they were. The clerk desk, the vault sill, the telegraph approach, the counting-room aisle, the cellar mouth, the bottle-hall floor, the nave floor, the village path, the waystone approach, the roost ground, the pier boards, the yard cobbles, the scar approach, the leaf-cup bank, the wake ground, and the kiln are unchanged. Gear on the body is unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the Lira face pass

Lira’s face now carries softer cheek and jaw volume, finer hair strands with a parting catchlight, clearer eye catchlights, and a subtle cloth fold on the base tunic where it meets the gear. Equipped clothes, armour, and weapons stay on the body and stay readable. The cellar door, the clerk desk, the vault sill, and the earlier ground passes are unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the Torren face pass

Torren’s face now carries softer cheek and jaw volume, finer crop strands with a parting catchlight, clearer eye catchlights, and a subtle cloth fold on the base tunic where it meets the coat. His ledger cudgel and seal coat stay on the body and stay readable. Lira’s face, the cellar door, and the earlier ground passes are unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the spark haze pass

The spark near Lira now carries a layered ember core, a softer outer haze, a faint heat rim, and denser motes. Her face, Torren’s face, and equipped gear stay readable. The cellar door and the earlier ground passes are unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the Lira gear grain pass

Lira’s quilted jerkin now carries extra stitch rows and leather grain, the ashwood blade carries a fuller and an edge catch, and the road bracers carry straps and buckles. They stay on the body when equipped. Her face, Torren’s face, and the spark stay readable. The earlier ground passes are unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the Torren gear grain pass

Torren’s seal coat now carries seam and collar grain and a seal stamp catch. His ledger cudgel carries extra wood grain and an iron band. They stay on the body when equipped. Lira’s gear, both faces, and the spark stay readable. The earlier ground passes are unchanged. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the yard gate pass

The Concord yard gate now carries worn timber grain on the posts and the crossbar, iron hinge and strap plates, a bolt catch, and a cooler dusk wash on the uprights. The gate cork and the yard cobbles stay where they were. Lira’s gear, Torren’s gear, both faces, and the spark stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the kiln mouth pass

The kiln mouth now carries fired brick courses, ash soot streaks, an iron rim, a cooler ember wash in the throat, and a soft shadow under the lip. The kiln drink and the back-wall grain stay where they were. The yard gate, both faces, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the leaf-cup pass

The leaf-cup now carries a veined leaf rim, a damp interior, a water meniscus catch, soft moss at the base, and a cooler grove wash. The drink and the water-edge ground stay where they were. The kiln mouth, the yard gate, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the harbor wire pass

The harbor telegraph now carries timber grain on the post, iron bands, a taut wire, glass insulators, a stone footing, and packed dirt at the base. The tick and the approach stay where they were. The leaf-cup, the kiln mouth, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the scar marker pass

The scar farm now carries weathered timber on the marker, iron fittings, an ash-rot stain, footing grit, and a crop edge at the base. The smoke and the blister stay where they were. The harbor telegraph, the leaf-cup, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the roost perch pass

The cliff roost now carries weathered timber beams, rope lashings, nest bedding, iron pegs, and grit at the footing. The climb and the wing stay where they were. The scar farm, the harbor telegraph, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the waystone face pass

The waystone now carries carved faces on the ring, lichen, crack lines, grit at the footing, and a worn path edge. The south stones and the wake stay where they were. The cliff roost, the scar farm, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the vault door pass

The harbor vault door now carries iron bands, rivets, a seal etch, hinge wear, and an ash wash on the face. The threshold and the count stay where they were. The waystone, the cliff roost, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the clerk desk body pass

The counting-room desk now carries timber grain, an ink-stained ledge, drawer seams, brass fittings, and a paper stack on the top. The clerk and the ledger-side floor stay where they were. The vault door, the waystone, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the cellar door face pass

The root-cellar door now carries weathered plank grain, iron straps, hinge rust, latch wear, and a damp ash wash on the face. The threshold and the mouth stay where they were. The counting-room desk, the vault door, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the leaf house pass

The leaf-village houses now carry timber posts, a lit window, thatch courses, stone footing, and soot under the eave. The door and the path stay where they were. The root-cellar door, the counting-room desk, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the kiln exterior pass

The buried kiln now carries exterior brick courses, a heat wash, an ash shelf rim, and mouth soot on the approach, with ash plates on the path. The drink and the throat stay where they were. The leaf-village houses, the root-cellar door, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the pier frame pass

The harbor pier now carries weathered plank grain, iron cleats, rope wraps, wet-dark pilings, and spray grit on the frame. The salt boards and the pier ground stay where they were. The buried kiln, the leaf-village houses, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the letter fold pass

The leaf-village letter now carries cream paper grain, ink bleed, a wax seal, a folded crease, and a soft shadow in the basket. The step in and the furrow stay where they were. The harbor pier, the buried kiln, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the starter stick pass

Lira’s starter stick now carries bark grain, a worn grip wrap, and tip scuffs, and it sits in the hand beside the scout knife. The knife, the other weapons, and the move stick stay where they were. The letter, the harbor pier, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the hearable bed pass

The field bed and the existing stings were nearly silent: the loop sat under a 0.04 gain, and the sources could start while the context was still suspended. The same loop and the same stings now sit high enough to hear, and the first tap or move resumes them. Silent still stops the bed. The eight cues stay the set. No new cue.

## Shipped in the pack back pass

Lira’s pack now carries canvas weave, strap buckles, and worn seams, and it sits on her back. The pack panel and the move stick stay where they were. The bed, the stings, and the equipped gear stay readable. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the aftermath step pass

The aftermath south steps now carry worn stone grain, edge chips, moss in the joints, and a soft ash wash. The step back stays where it was. Vesper stays out of the company. The pack, the bed, and the equipped gear stay readable. No new cue.

## Shipped in the Continue glow pass

- A saved Continue keeps the ember rim (`#ffe1a8` and `rgba(255, 176, 80, …)`) and pulses only while motion is on. Still motion leaves the rim steady. Save, Continue, and the eight cues stay as they are.

## Shipped in the bottle-hall shelf pass

The bottle-hall shelves now carry timber grain, glass catchlights, dust on the lips, and iron brackets. The near corks, the earth jar, and the walk stay where they were. Vesper stays a dark cloth with a hair lock. No new cue.

## Shipped in the Places card pass

The Places list now sits on a parchment card with a clearer rim. The place underfoot wears an ember mark. Open, close, and the stick stay as they were. No new cue.

## Shipped in the wake field pass

Around the wake, the ground now carries layered grass tufts, soil grit, a soft shadow under the blades, and warmer colour in the grass and soil. The spawn, the letter, and the leaf-village door stay where they were. No new cue.

## Shipped in the path flagstone pass

The walk from the wake to the leaf-village now carries worn flagstone grain, moss in the joints, a dusk shadow wash, and edge chips. The village door and the path look stay where they were. No new cue.

## Shipped in the scar soil pass

Under the farm marker, the ground now carries cracked rot soil, ash grit, a sickly moss fringe, and darker fissure lines. The marker, the smoke look, and the scar drink stay where they were. Vesper stays a dark cloth with a hair lock. No new cue.

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

Audio stays open-licence and listed in `CREDITS.md` before a cue plays. The field bed is the first cue. The coast and the claim are that same loop, retuned. It is original and CC0.
