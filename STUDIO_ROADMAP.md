# Emberwake — Studio Roadmap

> A multi-year production plan for **Emberwake**, a party-driven turn-based RPG with Final Fantasy-style jobs, menus, set-piece battles, and emotional spectacle, set in the Witcher-like moral mud of a world damaged by bottled magic. This is **not a Zelda-style shrine, gadget, or puzzle-box open-world plan**.

This roadmap turns [`DESIGN.md`](./DESIGN.md) into an executable production sequence while preserving its fixed premise: the player is a spark inside Lira, elemental power pools after death, digestion heals as a side effect, and every gain can cost the host, the land, or the conscience.

## Production north stars

1. **Party and consequence first.** Lira, Torren, Nima, Kestrel, and Vesper must drive the emotional arc; systems exist to make their choices legible.
2. **Turn-based RPG readability.** Clear party turns, path identity, elemental resources, status effects, and deliberate set-piece encounters take priority over action-game spectacle.
3. **The world remembers feeding.** Absorbing pools changes rot, host strain, faction responses, routes, and endings; it is never only an XP pickup.
4. **Content follows the design bible.** Verdant Isle, Stormreach Coast, Ashen Marrow, and the Prime Remnant remain the spine. New material must reinforce the pool/rot/Concord conflict.
5. **Open-licence by default.** Music and SFX are CC0, CC-BY, or a similarly permissive licence with complete attribution. If provenance is uncertain, ship the scene silent until cleared.
6. **Mobile-friendly, no-build shell until proven otherwise.** Protect the current browser slice and its low-friction development loop while measuring when a more formal pipeline is justified.

## Definition of done for the full production

- A complete playable Acts I–IV campaign, from Lira's awakening on Verdant Isle through the Prime Remnant and faction-dependent endings.
- A stable party RPG loop: exploration, contracts/quests, turn-based encounters, camp/inventory, equipment, pool digestion, merge knowledge, and meaningful consequences.
- Warrior, Mage, and Ranged paths with hybrid elemental expression; the merge tree in `DESIGN.md` is implemented with clear unlocks and costs.
- Waystones and eagle routes connect the world without turning traversal into a gadget collection.
- Vesper's recurring mirror encounters support rivalry, optional redemption, or final ruin.
- Accessibility, mobile controls, save/load, performance, and recovery from soft-locks are production requirements, not postscript polish.
- `CREDITS.md` and an in-game credits roll identify every music and SFX asset, author, licence, and source URL.
- A reproducible release build, smoke-test checklist, attribution audit, and rollback plan exist for every public milestone.

## Schedule at a glance

| Phase | Primary outcome | Content boundary | Release gate |
|---|---|---|---|
| **Year 0 — Prototype systems** | Prove the core loop and technical risks | One small Verdant Isle test map; representative combat only | A stranger can learn, fight, digest, strain, save, and recover without assistance |
| **Year 1 — Vertical slice: Act I** | Prove the complete player-facing experience | Full Act I, **Verdant Isle**, including opening, village, rot patch, dungeon mouth, patrol, party seed, and Vesper silhouette | A polished beginning-to-end slice demonstrates the final tone, loop, UX, and audio-credit practice |
| **Year 2 — World expansion: Acts II–III** | Build the middle game and systemic breadth | **Stormreach Coast** and **Ashen Marrow**; waystones, eagle routes, merges, Concord vault/digest-engine, Vesper reveal | External playtesters can complete the middle game and understand the consequences of overfeeding |
| **Year 3 — Finale, polish, and release readiness** | Deliver Act IV and make the whole campaign shippable | **Prime Remnant**, endings, final balance, accessibility, optimization, credits, certification/release work | Campaign-complete candidate passes regression, performance, content, licence, and release sign-off |
| **Ongoing — Art, audio, and open-licence stewardship** | Keep quality and legal provenance healthy throughout production | All phases and post-launch maintenance | No uncleared asset enters a milestone build; credits remain auditable and current |

---

## What plays now

This is the player map of the current browser build. It is not the Year 2–3 campaign. Wind merges, the wider waystone network, and a party slot for Kestrel are still ahead. One save lives in the browser. **Leave** walks south. **Continue** restores the room. **Wake** throws that save out.

| Stretch | What the feet can do |
|---|---|
| **Act I — Verdant Isle** | Wake and choose Warrior, Mage, or Ranged. The title sits in a cooler dusk. A light leaf-fall and a green haze hang on the isle field. A dusk fight’s enemy bar reads one notch clearer. Before the village, the quest says it is north-west and a letter is in the basket. Enter the leaf-village (Nima can join; a cousin’s letter in the basket is optional and does not open a door). After she leaves, and before the letter, the quest says Nima walks with her and the letter is still in the basket. After the letter, and before the patrol, it says the leaf-cup is south-west of the wake. The path line names who walks with her. The cup has two licence stakes and a wax cloth off the mouth. The scar has an ash pile and two short posts off the mouth. An ash veil hangs off that mouth. After the verdict, and before the waystone, the quest says Vesper farms the rot there. A warden fight with Torren in the line opens on the coat. Before the village, the field says the spark is in Lira. The Concord patrol fight names the Concord, and ash sits on that floor. The blow is unchanged. No new cue. The bottle-hall keeps a cork row, seal dust, and a cooler lamp off the walk. Continue glows when a save is there. No new cue. The buried kiln keeps an ember glow, a soot rim, and a little smoke off the mouth. The leaf-cup keeps a cooler rim, a wax sheen, and a scatter of leaves off the mouth. A hit washes hotter. The drink and the blow are unchanged. No new cue. The shale keeps a foam rim, wet sand, and a licence-post glow off the walk. The waystone keeps a carved rim, ash grit, and a cooler light off the mouth. Places names that stone. No new cue. Ashen Marrow keeps bone ribs, cooler dust, and a marrow lamp off the south step. The leaf-village door keeps a lamp, a leaf wreath, and a dusk rim off the walk. Places names the bone-ash crypt. No new cue. The Remnant Mark keeps a carved rim, ember grit, and cooler stones off the south step. The field bed opens its filter on the Verdant Isle and starts on the first touch of the title. That is the same cue. Places names the mark bed. No new cue. Torren and Nima speak once when their assists fire. The heal stays 14. The harbor keeps a wire, a spark tick, and a cooler lamp off the walk. Places names that post. No new cue. Each aftermath board wears an ash frame and a cooler lamp, and one prop for the flag. The four closing lines stay. Credits sits further apart, with a clearer thank-you and a little ember grit. Places names that scroll. South still steps back. No new cue. On a phone, Fight and the three strikes sit on taller buttons. Warrior, Mage, and Ranged stay named. The blows are unchanged. The debt number reads clearer, with an ash rim, and Places names that debt. A battle line from her side reads cool, and a line from theirs reads warm. No new cue. Wake, Continue, Motion, and Ash wear an ash frame, and the lit ones read clearer. On a phone the taps sit a little taller. Continue still glows when a save is there. The cousin’s letter keeps a cooler rim and a little ember grit. The words stay. Places names the basket before the letter is read. No new cue. The Concord yard keeps a cooler dusk haze, cork grain on the seal stake, and seal-dust near the lantern. On the scar, the leaf-cup, and the kiln, the pale ring pulses a little brighter and a few more sparks rise when the drink lands. The cost stays. Places names the stake. No new cue. The root-cellar arch keeps an ash lintel, a few embers, and a cooler lamp. The crawl keeps wax on the jars and a small lamp. The step in and the drink stay. Places names the mouth. No new cue. The ash nave keeps cooler dust shafts, ash on the near pews, and a few ember motes in the colonnade. The step back to the mark keeps a small catch-light. The doors stay. Places names the colonnade. No new cue. The counting room keeps cooler salt dust, a rim on the ledger lamp, and ash on the counter. The vault door keeps a little seal-dust. The clerk and the door stay. Places names the counting room. No new cue. The eagle roost keeps cooler night haze, rope grain, and ember grit on the perch beam. The harbor pier keeps a wet sheen and a cooler lamp. The climb stays. Places names the roost. No new cue. The bottle-hall keeps cork grain on the near row, cooler dust shafts, and seal grit on the floor. The crypt keeps cooler dust and a lamp rim. The walks stay. Places names the hall. No new cue. The isle path keeps a few more near-field leaves and cooler dusk haze. The village door keeps wreath grain and ash on the sill. The walk stays. Places names the path. No new cue. Vesper’s scar keeps smoke, ash, and a rot film on the blister. The walk stays. Places names the farm. No new cue. The harbor pier keeps plank grain and salt on the near boards, and cooler spray beside the lamp. The sheen stays. Places names the pier. No new cue. The claim’s south mouth keeps lintel grain, sill ash, and a cooler catch on the open post. The south step stays. Places names the lintel after the claim is walked. No new cue. The first breach keeps mortar grain, cooler dust, and a cooler catch on the open rib. The south step stays. Places names the dust after the breach is walked. No new cue. The marrow crypt keeps bone grain, cooler sill grit, and a cooler catch on the open rib. The south step stays. Places names the sill once the marrow is walked. No new cue. On the harbor pier, a look at the salt lets Lira say Concord counted the weather and left the tide. Vesper does not stand there. The telegraph stays. No new cue. South of the scar farm, a look lets Lira say Concord named the cough mercy. Vesper farms the rot and does not take the host. The drink stays the blister. No new cue. West of the Concord yard’s quiet stand, a look at the south gate lets Lira say Concord licensed the leak. Vesper farms the rot and does not take the host. The slag stays the drink. No new cue. On the ash nave’s east pews, a look lets Lira say Concord numbered the host and left the door shut. Vesper is on the roof and does not take the host. The dust is not a drink. No new cue. In the counting room, a look at the ledger lamp lets Lira say Concord called the shortage a courtesy. Vesper farms the rot inland and does not take the host. The lamp is not a drink. No new cue. At the cellar mouth, a look at the arch lets Lira say Concord left the heat under the jars. Vesper farms the rot above the mouth and does not take the host. The kiln stays the drink. No new cue. In the bottle-hall, a look at the near corks lets Lira say Concord gilded the shelf and left the dark bottle corked. Vesper farms the rot past the hall and does not take the host. The corks are not a drink. No new cue. Beside the eagle roost, a look at the perch lets Lira say Concord licensed the cliff and left the wing in the air. Vesper does not take the thermal. The climb stays the way home. No new cue. At the harbor telegraph, a look at the wire lets Lira say Concord sold the weather and left the post counting. Vesper does not stand there. The tick stays. No new cue. South of the waystone, a look at the grit lets Lira say Concord counted the ring and left it cold. Vesper farms the rot off the ridge and does not take the host. The stones stay cold. No new cue. On the village path, a look at the dusk lets Lira say Concord licensed the wreath and left the door half shut. Vesper farms the rot past the door and does not take the host. The path stays. No new cue. Lira, Nima, Torren, and Vesper’s silhouette keep hands, cuffs, and boots, and each keeps a hip kit. The village approach keeps dusk flagstones and grass tufts. The door and the quiet stand stay. No new cue. The buried kiln keeps a varied brick floor, a hearth lip, and ash on the back wall. The drink stays the kiln. No new cue. Lira, Nima, and Torren keep a jaw, a brow, and an eye glint, with hair, a scarf fold, and a coat seam. Vesper stays a dark cloth shape. No new cue. Lira, Nima, and Torren keep a nose bridge and a cheek plane, with a fuller scarf hem and a little more hair. Vesper stays dark. No new cue. Lira’s equipped weapon sits on her body in the field and in a fight: scout knife on the hip, ashwood blade longer and warmer, wellwood staff in the hand, reed bow across the chest. The quilted jerkin adds padded shoulders and a stitched chest; stowing it thins the silhouette. No new cue. A road cloak on a stake east of the wake can be worn with the jerkin; stowing it drops the wool. The knife sheath shows grain, the ashwood edge glows, the staff gem is faceted, and the bow quiver has straps. No new cue. Nima’s rod and Torren’s cudgel show grain and metal in the field and in a fight. Her shawl and his coat change the silhouette when equipped. Road bracers south of the wake widen Lira’s forearms and do not replace the cloak, the jerkin, or the weapon. No new cue. Around the wake, grass clumps, dirt patches, small stones, and root ridges sit in a soft dusk wash. The path stones and the take spots stay readable. Around the leaf-cup, moss, damp dirt, stones, and root curls sit in a soft green wash. The drink and the stakes stay. On the scar-farm approach, cracked earth, ash grit, weeds, and scorched stones sit in a soft smoke tint. The smoke and the drink stay. Inside the Concord yard’s south gate, worn cobbles, chalk, and weeds sit under a gate shadow and a soft dusk wash. The gate and the stake stay. On the harbor pier, warped planks, salt crystals, wet puddles, and a rope-worn edge sit under a cooler lamp wash. The salt markers and the lamp stay. At the messenger roost, perch grit, rope wear, night haze, and feathers sit under a cooler lamp rim. The hanging rope and the wing look stay. A wayside chest, a spare green, a salt cord, a snapped mile post, and a cold ring in the grass are optional. The spare green is a second tonic. The cord can be bound once from the pack and does not open a door. Enter the root-cellar kiln. The kiln mouth has a brick ring, a pan, and a poker off the fire. Stand at the scar. Meet the patrol, where Torren can refuse the licence. After that fight, Lira and the spark name the cork. The cup keeps a waxed stake. The furrow does not open. The waystone opens after the kiln and a scar verdict. || **Act II — Stormreach Coast** | Land on the shale. Before the hall, the quest names the harbor vault and the tally clerk east of the door. A light mist sits on the shale. A coast fight with a clerk and a warden opens on the licence. After the clerk, the quest names the hall of corks. The board has crates, rope, lanterns, a gull perch, and wet cobble off the door, the clerk, and the roost. Drink lightning pools. Speak to a porter. Read a posted notice. Speak to a tally clerk, who reacts to a bound cord, Cousin’s Margin, a numbered scrap read once, or salt from a spire mite, and does not open the door. Trade rot-ash at a ration stall. The ration closes HP or returns mind. It does not open the door. A west-shale patrol can name a bound cord, Cousin’s Margin, a ration, or a corked leaf-cup. If provoked, the coats fight. Neither look nor fight opens the door. A shelf gull can cry once and spend mind. A ration’s mind can break that cry. Enter the harbor vault and the bottle-hall. The hall has a side colonnade, small vials, a side shelf of bottles, a tally slate, and a grate shadow off the walk. After that vault has been seen, a spire mite on the shale can lift salt before the bite. Ask Kestrel to land. She refuses. |
| **Act III — Ashen Marrow** | Walk the ash, the digest-engine, the tender, and the leak. The ash shelf has a plank and stakes off those mouths. A closer dusk, a grate, a sack, and a cinder bowl sit off the tender, the pipe, the yard stone, and the south step. The sealed throat has an iron coil. The yard has a drift, a lantern’s smoke, and a seal stake off the slag and the south step. In a fight, Torren’s shoulder and Nima’s steady show as a chip, and a hit flashes hotter. On a phone, owed scar debt reads as Debt. The first dusk is one inner line from Lira and the spark. It does not scar. Meet Vesper and do not let her into the host. If the dusk was named, the leaf-cup was corked, or the shale patrol was provoked, she says so and still does not enter. If a spire mite has salted her teeth, she names that weather and still does not enter. Enter the pipe and the sealed throat. Enter the Concord yard and drink the slag or let the warden seal it. West of the south gate, an optional rest: Torren and Nima speak if they came, and Lira speaks if they did not. Short of the north stone, Torren or Nima can speak once in private. It does not open the mark. North of the yard is the Remnant Mark: before the numbered scrap is taken, the quest names it east of the aisle. The mark wears more ash and a cooler rim. Lira’s scarf reads against the dusk. The scrap is optional and can be read once from the pack, and a bird on the west pier can be asked to keep company. She still refuses. Reading the scrap does not open the nave. If Torren or Nima is there, they answer once. If neither is, the spark says the page stays in the pack. After it is read, the quest says the clerk can see the count and the nave stays shut. |
| **Act IV — remnant through aftermath** | Ash nave (west chalk is optional; a fallen pew, an ash drift, and iron stubs sit off that chalk), watch gallery (a filed copy is optional), count crypt (a folded notice in the east dust is optional and does not open the crack; a standing slate and a grate shadow sit off that notice; if the numbered scrap is still on the peg, the crypt names it), first breach (a cracked column, an ash drift, and iron stubs sit off the bar), remnant claim (a plinth scrap sits off the mass), and the aftermath. The nave and the breach are denser rooms, and a fight’s light matches the place. A fight there opens on ember grit, and the foe wears a clearer rim. The breach fight names the breach. Torren’s face keeps a scar and a red scarf. Nima’s face keeps a herb scarf. Before the breach is walked, Places names it. The blow is unchanged. The walk into the Remnant Claim wears an ash rim and a cooler light. Places names the Claim before it is walked. Lira speaks once before the choice. The four endings stay. The claim bed sits a little under the field. That is the same cue. On a phone, the pack’s rows keep the stack apart from the name, and Close sits across the top. A pool in range wears one brighter ring. The harbor roost keeps a rope, a lamp, and a mist rim off the walk. The drink is unchanged. No new cue. The count crypt has urns off the aisle. Walking the nave, the breach, or the claim before the flag can meet an ash penitent whose cough is 5, or 4 if the cord is bound. The claim is claim, refuse, share, or burn. Each ending shows one fuller object with the plaque. If Torren or Nima is in the aftermath, they speak for that flag. The remnant mass has a plinth and a column. Plasma, Steam, Storm, Magma, and Glass show their colour in a fight. That colour is not a cue. The pack shows item stacks. Credits are north of that room. Each flag keeps a short closing line and a side board. On Share, Vesper stays beside the mass and does not enter. Credits names the engine and thanks the walk. The claim bed sits quieter there. That is the same cue. Each board wears an ash frame and a cooler lamp, and one prop for the flag. The scroll sits further apart, with ember grit on the thank-you. Places names that scroll. South still steps back. On a phone, Fight and the three strikes sit on taller buttons. The debt number reads clearer, and Places names that debt. The blows are unchanged. Leave returns to the claim. |

Phone controls stay MOVE, Pack, and Absorb / Enter / Leave / Look / Speak. A fight’s Use 1 takes one from a stack. Places shows the quest, and the lines wrap. Motion can be stilled from the title or the pack. A fight has a pace: slow, steady, or brisk. Open **https://rum-build.github.io/emberwake/**.

## Year 0 — Prototype systems

### Objective
Answer the highest-risk questions before content production: does absorbing a pool feel like growth with a cost, does turn-based combat make the three paths distinct, and can the no-build mobile web shell support a larger RPG without becoming fragile?

### Scope
Build a deliberately small, disposable test route rather than a mini-campaign:

- Lira as host/spark with one ember pool, one rot patch, and a visible host-strain consequence.
- A three-member test party using Lira, Torren, and Nima; Kestrel can remain a stub until the travel prototype.
- Fight / Magic / Item / Flee, target selection, turn order, victory rewards, defeat, retry, and a small encounter table.
- One representative ability for Warrior, Mage, and Ranged, plus Fire, Water, and Lightning resource costs.
- Inventory categories from `DESIGN.md`: consumables, equipment, pool-shards, seals, and key items; validate that the spark itself carries nothing.
- A first-pass merge data model, even if only Fire+Water and Fire+Earth are exposed.
- Save/load, reset, versioned save data, and a safe recovery path after a failed encounter.
- Input parity for touch and keyboard, portrait-first layout, readable menus, and a basic performance budget on a representative mobile device.

### Milestones

- **Quarter 1 — Foundations:** document data schemas and scene boundaries; isolate game state from rendering; establish test fixtures, debug overlays, and a content-authoring convention.
- **Quarter 2 — Core loop:** implement exploration, pool absorption, XP, host strain, combat turn flow, inventory, and save/load with placeholder art/audio.
- **Quarter 3 — System proof:** prototype path abilities, elemental costs, one merge, rot-state changes, and a controlled Vesper-style rival encounter; run usability tests.
- **Quarter 4 — Prototype gate:** freeze the system contract for Year 1, remove failed experiments, record technical debt, and produce a short internal build review.

### Exit criteria

- New testers can identify Lira's role as host and the spark's role without a verbal explanation.
- A complete 15–30 minute loop works: explore → encounter → fight or flee → absorb → observe a land/strain change → spend/recover → save and reload.
- Warrior, Mage, and Ranged choices are mechanically different, not only renamed attacks.
- Core state is deterministic enough to reproduce reported bugs; no critical save corruption, unwinnable soft-lock, or input dead end remains.
- A measured mobile performance baseline and a list of deferred optimizations exist.

### Explicit non-goals
No full overworld, deep crafting, final voice acting, large quest graph, online features, or final asset production. Prototype breadth must not consume the time needed to validate the core loop.

---

## Year 1 — Vertical slice: Act I, Verdant Isle

### Objective
Produce a polished, self-contained vertical slice that demonstrates the eventual game rather than a collection of prototypes. It should begin with the spark waking in Lira and end with the first clear Vesper silhouette, matching Act I in `DESIGN.md`.

### Act I content

- Opening sequence: Lira, the dying ember-pool, and the spark awakening.
- Verdant Isle overworld with soft beauty, village life, first rot scars, readable landmarks, and a dungeon mouth.
- First absorption and the player-facing explanation that healing is a side effect of feeding, not charity.
- Village reaction, a small contract/quest with a grey outcome, and a party seed for Torren and Nima.
- Concord patrol bottling a lesser pool in sight of the player; establish the Empire as bureaucratic and consequential rather than cartoon evil.
- Tutorial and showcase encounters, one dungeon set piece, one boss or elite, and a short aftermath that records a choice or state change.
- Camp, shared party inventory, basic equipment affinity, gold, pool-shards, seals, and rest/recovery rules.
- Act-end Vesper silhouette and a promise of the Stormreach crossing; do not resolve the rival early.

### Production milestones

- **Q1 — Slice lock and pre-production:** lock Act I beats, encounter matrix, map plan, UI flows, art direction, accessibility targets, and asset list. Convert Year 0 schemas into content tools or documented data files.
- **Q2 — Greybox complete:** playable Verdant Isle route, village, dungeon, combat arenas, camera/collision, quest flags, save points, and complete Act I scripting in placeholder presentation.
- **Q3 — Content and presentation pass:** final or near-final environments, characters, VFX, encounter tuning, cutscene beats, mobile UI, music/SFX integration, and first attribution ledger.
- **Q4 — Vertical-slice polish:** accessibility and usability pass, performance pass, external playtest, bug burn-down, credits verification, and a review build suitable for greenlighting Year 2.

### Vertical-slice gate

The slice is complete when an external player can finish Act I without staff intervention, understand the spark/host/rot conflict, make at least one consequential choice, see a meaningful difference between two combat paths, and describe why the Concord and Vesper are not simple good/evil opponents. The build must run on supported mobile and desktop browsers with no known release-blocking save, input, or attribution defects.

### Year 1 discipline

- Keep the playable route compact; polish the beginning-to-end experience instead of expanding Verdant Isle indefinitely.
- Use placeholder content only when it is clearly labelled and tracked for replacement.
- Establish naming, localization keys, UI copy style, and a content review cadence before more regions multiply the cost of change.

---

## Year 2 — Stormreach Coast and Ashen Marrow

### Objective
Expand from the Act I promise into the middle game: travel, party growth, the first real merge choices, and the moral consequences of Concord bottling. This year covers Acts II and III, not the finale.

### Act II — Stormreach Coast

- Eagle routes and waystones as authored traversal choices, with Kestrel's introduction and sky-route unlock.
- Cliffs, storm weather, lightning pools, Concord harbor vaults, roosts, and a route structure that supports backtracking without becoming a checklist.
- First Warrior/Mage/Ranged branch choice with clear respec or consequence policy.
- Vesper named; recurring mirror encounters and a non-lethal debate/duel.
- Party expansion and camp/inventory depth; introduce lend/trade-at-rest rules.
- Open the merge tree with Fire+Water, Fire+Earth, Water+Lightning, and a deliberately paced set of follow-on combinations.

### Act III — Ashen Marrow

- Inland blight, volcano ashfields, fire/earth merges, and contracts where feeding helps one group while harming another.
- Concord digest-engine dungeon: a mechanically legible, story-critical set piece rather than a puzzle shrine.
- Overfeeding consequences: host strain, temporary debuffs, story flags, faction responses, and visible land changes.
- Reveal Vesper's method and sharpen the question of digestion versus dominion without resolving the Prime Remnant choice.
- End with the world map/waystone network ready for Act IV and a clear set of surviving/changed relationships.

### Production milestones

- **Q1 — Systems expansion:** finalize travel graph, encounter taxonomy, status/strain rules, merge tree data, party progression, and narrative state model; run a middle-game economy pass.
- **Q2 — Stormreach alpha:** complete greybox region, quests, eagle/waystone travel, party beats, vault, and first Vesper duel; begin focused playtests for navigation and combat clarity.
- **Q3 — Ashen Marrow alpha:** complete greybox region, rot set pieces, digest-engine, moral contracts, and Vesper reveal; test how overfeeding changes subsequent scenes.
- **Q4 — Middle-game beta:** art/audio integration, tuning, accessibility, performance, save migration, external playtest, and a full campaign continuity review from Act I through Act III.

### Year 2 exit criteria

- Players can travel between regions with understandable route choices and no required knowledge of the developer's map.
- The merge tree is desirable but not mandatory for one correct build; each path has viable choices and readable costs.
- Stormreach and Ashen Marrow have distinct visual, mechanical, and political identities.
- At least two choices produce persistent, testable consequences across quests or encounters.
- Full Act I–III progression can be completed from a clean save and from representative migrated saves.
- All middle-game assets have known owners, status, replacement dates, and licence records.

---

## Year 3 — Prime Remnant, polish, and audio credits

### Objective
Finish Act IV, integrate the whole campaign, and spend the second half of the year removing friction and uncertainty rather than adding unbounded features.

### Act IV — Remnant Wake

- World map and waystone network become the staging ground for the final race.
- Prime Remnant: the first death that taught the world that power is immortal; present it as a continent-scale pool with systemic and narrative weight.
- Rival race with Vesper, including the consequences of prior rivalry encounters and the player's digestion choices.
- Final choice between true digestion and dominion, with faction and relationship state affecting outcomes.
- Endings that account for merges, who lived, the land's condition, and whether Lira remains host or becomes something else.
- Final battle/sequence designed around party roles and consequence, not a one-off mechanical exception.
- Credits roll with complete open-licence attribution and an in-game reference to the full `CREDITS.md` record where appropriate.

### Polish tracks

**Campaign and narrative**

- Continuity audit for names, flags, inventory, world-state changes, Vesper's arc, and all four acts.
- Dialogue edit for grounded, consequential Witcher-like moral ambiguity and concise Final Fantasy-style emotional beats.
- Quest failure/recovery, party survival states, ending permutations, and localization-ready text review.

**Combat and progression**

- Balance XP, gold, pool capacity, host strain, equipment affinity, merge costs, encounter pacing, flee odds, and boss readability.
- Ensure no single element, path, merge, or inventory strategy trivializes the campaign.
- Add combat telemetry in development builds only; remove or protect it before release.

**UX, accessibility, and performance**

- Keyboard, touch, focus order, readable type, contrast, reduced-motion option, timing alternatives, captions/text treatment, and non-audio cues.
- Loading, error, save migration, low-memory recovery, and clear feedback for every irreversible-feeling choice.
- Profile supported browsers/devices; optimize draw calls, asset size, audio loading, and scene transitions against the Year 0 budget.

**Audio and credits**

- Replace temporary tracks and SFX only with verified open-licence assets or original work with documented ownership.
- For every asset, record title, author, source URL, licence, required attribution text, modification status, and where it is used.
- Run a release audit against the build, `CREDITS.md`, in-game credits, store/readme copy, and any bundled archive.
- If a licence, author, or URL cannot be verified, remove the asset or leave the relevant moment silent; do not ship an assumption.

### Production milestones

- **Q1 — Act IV alpha:** Prime Remnant, final race, endings, final Vesper resolution, and all major state dependencies playable in greybox.
- **Q2 — Campaign complete:** full Acts I–IV content integrated, save migration stable, ending matrix exercised, and feature scope frozen.
- **Q3 — Release candidate 1:** art, audio, UI, accessibility, performance, credits, regression, and external playtest passes; no new features without a documented release-blocking reason.
- **Q4 — Final release readiness:** bug burn-down, licence/attribution sign-off, supported-browser/device verification, backup and rollback rehearsal, final credits capture, and release decision.

### Year 3 release gate

A release candidate must support a clean campaign completion and representative alternate routes, pass all critical regression and save tests, meet the agreed performance/accessibility baseline, contain no unverified audio, and provide a complete credits trail. “Content complete” is not enough; the campaign must be understandable and recoverable for a first-time player.

---

## Ongoing — Art, audio, and open-licence stewardship

These are continuous production lanes, not a final-year cleanup task.

### Art direction and production

- Maintain a visual bible for Verdant Isle's soft beauty, Stormreach's charged coast, Ashen Marrow's blight, and the Prime Remnant's scale.
- Keep silhouettes and colour language readable on small screens; test scenes at actual mobile display sizes.
- Track every environment, character, VFX, UI, and illustration through concept → greybox → in-game → polish → approved.
- Prefer authored landmarks, party staging, and political spaces over generic collectible density or puzzle-box filler.
- Review new art against the fixed spark/host/rot premise and the Final Fantasy + Witcher tone before production approval.

### Audio stewardship

- Maintain a source-of-truth audio ledger from the first placeholder track onward.
- Tag assets by scene, mood, loop/one-shot behaviour, loudness, licence, attribution, and replacement status.
- Provide silence/fallback behaviour so missing or blocked audio never prevents play.
- Re-run the attribution audit at every milestone, after every asset swap, and before every public build.
- Keep credits legible in-game and in repository documentation; preserve URLs and licence text in case a source page changes.

### Open-licence and release hygiene

- Do not import commercial libraries, ripped game assets, unverified “free” packs, or generative outputs with unclear rights.
- Store licence evidence and attribution metadata with the project record; never rely on memory or a bookmarked page alone.
- Flag any asset with incompatible share-alike, editorial-only, non-commercial, or missing attribution terms before it reaches a milestone branch.
- Maintain a release manifest listing code/content version, supported browsers, known issues, audio assets, and credits revision.

### Quality and team cadence

- Weekly: playable build, blocker triage, content/engineering review, and asset provenance updates.
- Per milestone: external playtest, accessibility pass, performance sample, save compatibility check, and credits audit.
- Per release: clean checkout/rebuild test, backup/rollback rehearsal, smoke test, full regression sweep, and sign-off from design, engineering, art, audio, and production.

---

## Scope guardrails and decision policy

- **Protect the spine:** Lira → Verdant Isle → Stormreach → Ashen Marrow → Prime Remnant. Side content must support character, faction, pool, or rot themes.
- **No feature without a player-facing reason:** proposed systems must improve party identity, consequence, exploration between authored beats, or turn-based combat clarity.
- **Cut breadth before coherence:** if schedule slips, cut optional quests, enemy variants, and traversal branches before cutting save reliability, accessibility, credits, or the main emotional arc.
- **Prototype risky work early:** multiplayer, voice acting, large procedural worlds, complex crafting, and a build migration are separate proposals, not assumed scope.
- **Respect the fixed tone:** Final Fantasy party/jobs/turns/set pieces plus Witcher moral ambiguity/politics/consequences; explicitly reject Zelda-like shrine/gadget/open-world framing.
- **Document changes:** every change to a fixed premise, act boundary, licence policy, or release gate gets a short design note and a link from the relevant milestone review.

## Reference map

- `DESIGN.md` — fixed premise, story spine, acts, party, rival, regions, systems, audio policy, implementation snapshot, and tone constraints.
- `STORY.md` — player-facing synopsis and core vocabulary.
- `README.md` — current no-build web slice, controls, supported loop, and technical shell.
- `CREDITS.md` — required source of truth for open-licence music and SFX as soon as audio production begins.
