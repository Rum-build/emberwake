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
- Fights show chips for burn, stamp, air, licence, page, rite, knelt, ash in the teeth, and scar debt on Lira. Walking the ash nave, the first breach, or the remnant claim before the flag can meet an ash penitent. It kneels once. Ash coughs for 6 on that person’s next turn and does not add scar debt. After the flag, the claim stays quiet.
- Still freezes the nave banners and the cough pulse. On a phone the ash motes update every other tick. Credits still return to the aftermath when motion is stilled and pace is slow. Continue stores both.
- Phone controls, Absorb, Pack, and Continue stay.

## Chamber and cord (shipped)

- The isle sun is harder and the fill is thinner. The coast and the ash sit darker, so day and night are not the same wash. Room walls catch the lamp they already have. The remnant floor and the chamber walls take a hotter specular from the fire that is already there. No new light was added.
- A living pool wears its element on a brighter rim and a taller column. A drunk or bottled mouth goes quiet.
- The salt cord can be bound once from the pack. Torren and Nima speak if they came. If they did not, Lira still ties it. Ash in the teeth then coughs for 4, not 6. It does not open a door, add a scar, or change a claim flag.
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

## Face and weather (this branch)

- Hair reads as a cap, a fringe, and a fall. Concord hair stays cropped. Vesper’s falls past the shoulder. A brow and a mouth sit on the face that already had eyes and a nose. No new light was added.
- The harbor vault and the Concord yard carry licence piers and a gold beam. They sit off the walk. They are not doors.
- Light rain falls on the isle and the shale when Motion is on. An ash gust falls on the marrow, the yard, the claim, and the aftermath, unless Ash fall is Thin. Still hides both. On a phone the fall skips every other tick.
- East dust in the count crypt holds a folded notice. It calls the crack weather. It does not open the crack or the bar.
- A spare green off the west path of the isle is a second verdant tonic. The wayside chest is still the first. Neither opens the kiln.
- The fight order is a ribbon: Now, then the names, with a mark between them.
- Ash fall names Thin, Steady, or Thick, and says whether that is fewer motes, the usual fall, or more.
- On a phone the place list starts under the HUD. The stick, Absorb, and Enter stay live.
- If she has named the dusk, corked the leaf-cup, or provoked the shale patrol, Vesper says so when she meets Lira on the ash. She still does not enter the host.
- Phone controls, Absorb, Pack, and Continue stay.

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
