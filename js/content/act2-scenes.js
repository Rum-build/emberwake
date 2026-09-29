/**
 * Act II opening scenes on Stormreach Coast.
 * The vault is a face. The merge is a word, not a spell. The duel stops.
 */
(function (Emberwake) {
  'use strict';

  Emberwake.registerScene('coast-descent', function () {
    Emberwake.present({
      lines: [
        { where: 'The thermal', speaker: 'Kestrel', text: 'Down. Shale, not my saddle. I am the road. I am not the company.' },
        { speaker: 'Lira', text: 'The door is the same door. It is larger when it can look back.' },
        { speaker: 'The spark', text: 'Lightning is loose on this cliff. Drink it if you are hungry. The vault still does not open.' },
      ],
      onDone: function () {
        if (Emberwake.finishLanding) Emberwake.finishLanding();
      },
    });
    return true;
  });

  Emberwake.registerScene('coast-landing', function () {
    Emberwake.present({
      lines: [
        { where: 'Stormreach Coast', speaker: 'Lira', text: 'Salt in the teeth. The cork is ahead, and it knows we are here.' },
        { speaker: 'Kestrel', text: 'The road has a floor now. I am still above it. When you are done measuring the door, the thermal home is under your heels.' },
        { speaker: 'The spark', text: 'She did not land. The cliff did. That is the difference between a route and a party.' },
      ],
    });
    return true;
  });

  Emberwake.registerScene('vault-face', function () {
    var torren = Emberwake.companyHas && Emberwake.companyHas('torren');
    Emberwake.present({
      lines: [
        { where: 'Harbor vault', speaker: 'A clerk', text: 'Unlicensed feet. The mouth is sealed. State the licence or state the leaving.' },
        torren
          ? { speaker: 'Torren', text: 'I counted doors like this. The bottles inside are always short. The short part is the weather standing on this cliff.' }
          : { speaker: 'The spark', text: 'The seal is gold. The leak beside it is not. They bottled the storm, and the storm refused to be entirely bottled.' },
        { speaker: 'Lira', text: 'The bottle-hall stays shut. If the counting room is a different door, say so.' },
        { speaker: 'A clerk', text: 'The hall is corked. The count is not. Hunger does not get a bottle. A name on the shortage is a different theft, and it is through the seam.' },
      ],
    });
    return true;
  });

  Emberwake.registerScene('merge-tease', function () {
    var fire = Emberwake.elementCount ? Emberwake.elementCount('fire') : 0;
    var bolt = Emberwake.elementCount ? Emberwake.elementCount('lightning') : 0;
    var water = Emberwake.elementCount ? Emberwake.elementCount('water') : 0;
    if (!(fire >= 1 && (bolt >= 1 || water >= 1)) && !(water >= 1 && bolt >= 1)) return false;
    var plasma = bolt >= 1 && fire >= 1;
    var lines = plasma
      ? [
        { where: 'Between her hands', speaker: 'The spark', text: 'The kiln’s fire and this cliff’s lightning are trying to become one word.' },
        { speaker: 'Lira', text: 'It burns the air. This time it does not go out.' },
        { speaker: 'The spark', text: 'Plasma. It stays on the magic list. It spends fire and lightning together. A spell that stays is a debt with a name.' },
        { speaker: 'Lira', text: 'Then we carry it into a fight. The vault’s bottles are still not ours.' },
      ]
      : [
        { where: 'Between her hands', speaker: 'The spark', text: 'Fire she already swallowed, and water. They meet and fog the shale.' },
        { speaker: 'Lira', text: 'Steam. It stayed. My palms are hot, and the air is wet.' },
        { speaker: 'The spark', text: 'Steam is on the magic list. It spends fire and water together. It is not mercy. It is weather you can aim.' },
      ];
    if (water >= 1 && bolt >= 1) {
      lines.push({ speaker: 'The spark', text: 'Water and lightning have a word of their own. Storm. It spends both, and the coast already knows the shape.' });
    }
    Emberwake.present({
      lines: lines,
      onDone: function () {
        if (Emberwake.noteMerge) Emberwake.noteMerge(plasma ? 'plasma' : 'steam');
      },
    });
    return true;
  });

  Emberwake.registerScene('vesper-duel', function () {
    if (!Emberwake.coastFed || !Emberwake.coastFed()) return false;
    if (!Emberwake.seenVault || !Emberwake.seenVault()) return false;
    if (Emberwake.revealCoastVesper) Emberwake.revealCoastVesper();
    Emberwake.present({
      lines: [
        { where: 'The shale', speaker: 'Vesper', text: 'You drank slower again. The coast does not look grateful. Good. Gratitude is what they bottle.' },
        { speaker: 'Lira', text: 'You said you would be here when I was brave enough to be ugly.' },
        { speaker: 'Vesper', text: 'Ugly is a duel. I am not here to bury you. I am here to see if the blow you mean is the blow you throw.' },
        {
          speaker: 'Lira',
          text: 'Her knife is out. It is not a killing distance. It is a measuring one.',
          choices: [
            {
              label: 'Throw the blow. Let her turn it.',
              pick: 'press',
              reply: { speaker: 'Vesper', text: 'There. You meant it. I turned it. Your wrist will remember the angle, and so will I. We are not finished. We are numbered.' },
            },
            {
              label: 'Hold. Make her name the point.',
              pick: 'hold',
              reply: { speaker: 'Vesper', text: 'Holding is also a number. Cowards and clerks hold. So do people who want to see the bill before they eat. I will still be on this coast when you decide which you are.' },
            },
          ],
        },
        { speaker: 'The spark', text: 'She steps out of reach. No one falls. The duel was a measurement, and the vault is still corked behind her.' },
      ],
      onPick: function (id) {
        if (Emberwake.noteDuel) Emberwake.noteDuel(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('vault-ledger', function () {
    var torren = Emberwake.companyHas && Emberwake.companyHas('torren');
    Emberwake.present({
      lines: [
        { where: 'Counting room', speaker: 'A clerk', text: 'You may stand in the count. You may not stand among the bottles. The iron is the honest part of this building.' },
        { speaker: 'A clerk', text: 'The hall is short three storms. The licence says four. The fourth was sold as weather to a ship that paid. The shale outside is drinking the difference.' },
        torren
          ? { speaker: 'Torren', text: 'I wrote shortages like this and called them spoilage. Spoilage is a word that lets a clerk sleep. The leak on the cliff is not sleeping.' }
          : { speaker: 'Lira', text: 'So the people on the shale pay the line you would not put in the book.' },
        { speaker: 'A clerk', text: 'Put your name on the shortage and the book admits it. Refuse, and the shortage stays a courtesy. Neither choice moves a bottle. Both leave a clerk who will remember you.' },
        {
          speaker: 'Lira',
          text: 'The grate hums. The bottles are blue and counted and not hers.',
          choices: [
            {
              label: 'Sign the shortage. Let the book admit it.',
              pick: 'sign',
              reply: { speaker: 'A clerk', text: 'Signed. You are a witness, not a licence. The bottle-hall is the show we give people whose names are already in a book. Walk north. The iron will pretend it was always a door.' },
            },
            {
              label: 'Refuse the line. Leave the shortage rude.',
              pick: 'refuse',
              reply: { speaker: 'A clerk', text: 'Then it stays rude. The hall is still the show. We let refusals look, so they can describe the corks to someone who pays. Walk north. Looking is not a licence.' },
            },
          ],
        },
        { speaker: 'The spark', text: 'Grey work. The iron was a courtesy. The show is north, and Kestrel still will not stand on this floor.' },
      ],
      onPick: function (id) {
        if (Emberwake.noteLedger) Emberwake.noteLedger(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('kestrel-ask', function () {
    if (!Emberwake.seenLedger || !Emberwake.seenLedger()) return false;
    Emberwake.present({
      lines: [
        { where: 'Under the wing', speaker: 'Kestrel', text: 'You have been inside their count. I watched the roof. Roofs are my kind of door.' },
        { speaker: 'Lira', text: 'Come down. The coast is a fight now, and the vault is a ledger. We are short a person who can leave.' },
        { speaker: 'Kestrel', text: 'Leaving is the job. Joining is how a road becomes cargo. I will not be written into your pack beside a tonic.' },
        {
          speaker: 'Lira',
          text: 'The eagle holds the thermal and does not fold it.',
          choices: [
            {
              label: 'Ask her to land anyway.',
              pick: 'ask',
              reply: { speaker: 'Kestrel', text: 'No. If I land, they licence the bird and you lose the way home. I am the road. I am not the company. Look up when you need the sky. Do not save a seat.' },
            },
            {
              label: 'Leave her the air.',
              pick: 'leave',
              reply: { speaker: 'Kestrel', text: 'Good. Count me when you look up. The thermal home is still under the roost. I will not be in the pack when you open it.' },
            },
          ],
        },
        { speaker: 'The spark', text: 'She stays above the count. The party is still the people on the ground.' },
      ],
      onPick: function (id) {
        if (Emberwake.noteKestrelAsk) Emberwake.noteKestrelAsk(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('bottle-hall', function () {
    var torren = Emberwake.companyHas && Emberwake.companyHas('torren');
    Emberwake.present({
      lines: [
        { where: 'Bottle-hall', speaker: 'A clerk', text: 'This is the spectacle. Gold on every cork, light in every glass, and a count that does not match the shelves. Clap if you like. The seals do not clap back.' },
        { speaker: 'Lira', text: 'They bottled weather and called it mercy. The room is beautiful the way a ledger is beautiful.' },
        torren
          ? { speaker: 'Torren', text: 'I have walked a hall like this with a lamp and a lie. The dark bottle at the end does not face the harbor. It faces inland.' }
          : { speaker: 'The spark', text: 'The dark bottle at the end does not face the sea. Something inland is already drinking what this room would not admit.' },
        { speaker: 'A clerk', text: 'That cork is Ashen Marrow. A digest-engine in the ash eats what leaked. The earth bottle beside you is a different theft. Crack it and your mouth keeps a mouthful. Leave it and the show stays intact. Neither choice feeds the inland engine. Both will be remembered.' },
        {
          speaker: 'Lira',
          text: 'The earth bottle is dull brown under a gold seal. The marrow bottle is the color of a closed road.',
          choices: [
            {
              label: 'Crack the earth cork. Take the mouthful.',
              pick: 'crack',
              reply: { speaker: 'A clerk', text: 'Cracked. You are hungrier than the licence, which is how rot learns a new name. Magma and glass, if the other elements are already in her, will sit on the magic list. The marrow bottle stays corked. The north arch is a road. Walk it. The hall will be here when the ash is done with you.' },
            },
            {
              label: 'Leave every cork. Name the inland leak.',
              pick: 'leave',
              reply: { speaker: 'A clerk', text: 'Then the show stays pretty. Ashen Marrow keeps the leak, and you keep your teeth clean of earth. The north arch opens anyway. Walk it if you mean to. Coming back is not a licence.' },
            },
          ],
        },
        { speaker: 'The spark', text: 'Spectacle and shortage in the same room. The inland road is still a cork with a view.' },
      ],
      onPick: function (id) {
        if (Emberwake.noteHall) Emberwake.noteHall(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('marrow-road', function () {
    Emberwake.present({
      lines: [
        { where: 'Ashen Marrow', speaker: 'Lira', text: 'Ash under a red sky. The hall is behind us. My feet are on the bill they sent inland.' },
        { speaker: 'A tender', text: 'The digest-engine eats what the seals failed to hold. I keep it fed. I do not keep it honest. The leak in front of the maw is a mouth. South is the only door back.' },
        { speaker: 'The spark', text: 'Feeding that mouth will scar her. Banking it gives one point of the debt back, if the kiln or the cork already took one. Neither choice is a licence.' },
      ],
      onDone: function () {
        if (Emberwake.noteMarrowStep) Emberwake.noteMarrowStep();
      },
    });
    return true;
  });

  Emberwake.registerScene('marrow-vesper', function () {
    var coughing = Emberwake.scarCount && Emberwake.scarCount() >= 2;
    Emberwake.present({
      lines: [
        { where: 'Ashen Marrow', speaker: 'Vesper', text: 'I am not here for the coat. I will not step into her. The scar in her teeth is already a door, and I only breathe across it.' },
        { speaker: 'Lira', text: coughing
          ? 'She is standing in the ash, not in me. The cough is mine. Her mouth is worse.'
          : 'She is standing in the ash, not in me. Her mouth is still worse than the engine.' },
        { speaker: 'The spark', text: 'She worsens rot. She does not take the host. Kestrel is still in the air. This ash is not a roost. Taste is a debt. Refusal still leaves a stain.' },
        {
          speaker: 'Lira',
          text: coughing ? 'The cough answers before I do.' : 'The ash is quiet enough to hear her.',
          choices: [
            {
              label: 'Let her taste the scar.',
              pick: 'taste',
              reply: { speaker: 'Vesper', text: 'A breath across the mouth. I do not enter. The rot in her teeth thickens, and the ash remembers the favor.' },
            },
            {
              label: 'Refuse her mouth.',
              pick: 'refuse',
              reply: { speaker: 'Vesper', text: 'Refusal is not a cleaning. I leave the stain on the ash and walk. The rot still has my name on it.' },
            },
          ],
        },
      ],
      onPick: function (id) {
        if (Emberwake.noteVesperAsh) Emberwake.noteVesperAsh(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('marrow-tender', function () {
    var coughing = Emberwake.scarCount && Emberwake.scarCount() >= 2;
    Emberwake.present({
      lines: [
        { where: 'The engine', speaker: 'A tender', text: coughing
          ? 'You are coughing on my ash. The engine can smell the debt. The leak is the harbor’s leftover. Feed it and the host pays. Bank it and I cork the mouth. I can ease one point of what is already in her. I cannot invent a debt to forgive.'
          : 'The leak is the harbor’s leftover. Feed the engine and the host pays. Bank it and I cork the mouth. I can ease one point of what is already in her. I cannot invent a debt to forgive.' },
        {
          speaker: 'Lira',
          text: 'The tender’s hands are clean. The engine’s mouth is not.',
          choices: [
            {
              label: 'Bank the leak. Ease one point of the scar.',
              pick: 'bank',
              reply: { speaker: 'A tender', text: 'Banked. The mouth is corked. If she was already carrying the kiln or the earth cork, one point of that cut comes back. If she was not, the cork still holds. Do not call it mercy.' },
            },
            {
              label: 'Leave the leak a mouth.',
              pick: 'leave',
              reply: { speaker: 'A tender', text: 'Then it stays a mouth. Drink it if you mean to. I will still be here, and I will not be grateful.' },
            },
          ],
        },
      ],
      onPick: function (id) {
        if (Emberwake.noteMarrowChoice) Emberwake.noteMarrowChoice(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('pipe-feed', function () {
    var torren = Emberwake.companyHas && Emberwake.companyHas('torren');
    var nima = Emberwake.companyHas && Emberwake.companyHas('nima');
    var coughing = Emberwake.scarCount && Emberwake.scarCount() >= 2;
    Emberwake.present({
      lines: [
        {
          where: 'Engine pipe',
          speaker: torren ? 'Torren' : 'Lira',
          text: torren
            ? 'I kept ledgers for pipes like this. The marks on the iron are a quartermaster’s hand. The harbor’s shortage comes out here as hunger. Cracking it is not a kindness. Leaving it is not either.'
            : 'The marks on the iron are a quartermaster’s hand. I can read the theft without the man who used to sign it. Cracking it is not a kindness. Leaving it is not either.',
        },
        nima
          ? {
            speaker: 'Nima',
            text: coughing
              ? 'The air in this throat is what she has been coughing. I can cool a wound. I cannot cork a province.'
              : 'This air is the engine’s breath. I will not call it weather, and I will not call it medicine.',
          }
          : {
            speaker: 'The spark',
            text: 'Kestrel is not in this pipe. She kept the air. The feed is a choice with dirt on both hands.',
          },
        {
          speaker: 'Lira',
          text: 'The valve is gold on iron. The stoker’s coat is the licence.',
          choices: [
            {
              label: 'Crack the feed. The stoker will answer.',
              pick: 'crack',
              reply: { speaker: 'Lira', text: 'Then the iron opens. The coat on the stoker is the licence. A plain knife will hate it.' },
            },
            {
              label: 'Leave the cork. Name the theft and walk.',
              pick: 'leave',
              reply: { speaker: torren ? 'Torren' : 'Lira', text: 'Then it stays a throat. The engine keeps its meal. We keep the name.' },
            },
          ],
        },
      ],
      onPick: function (id) {
        if (Emberwake.notePipe) Emberwake.notePipe(id);
      },
      onDone: function () {
        if (Emberwake.maybeStartPipeFight) Emberwake.maybeStartPipeFight();
      },
    });
    return true;
  });

  Emberwake.registerScene('throat-name', function () {
    var torren = Emberwake.companyHas && Emberwake.companyHas('torren');
    var nima = Emberwake.companyHas && Emberwake.companyHas('nima');
    Emberwake.present({
      lines: [
        {
          where: 'Sealed throat',
          speaker: torren ? 'Torren' : 'Lira',
          text: torren
            ? 'I have seen this mark on a page I was not allowed to copy. It is not a province. It is the first death they are trying to own.'
            : 'The seal is not a licence. It is a name the Concord could not drink.',
        },
        nima
          ? { speaker: 'Nima', text: 'If she speaks it, I cannot pull the word back out. Cool the wound after. Do not ask me to call the name medicine.' }
          : { speaker: 'The spark', text: 'Prime. The word is older than the bottle. Speaking it will scar. Corking it leaves the word in the glass.' },
        {
          speaker: 'Lira',
          text: 'The stone beside it is dark. It is not a road yet.',
          choices: [
            {
              label: 'Speak the name into the spark. It will scar.',
              pick: 'name',
              reply: { speaker: 'Lira', text: 'Then it is in her teeth. The next stone is not on this shelf. The scar is.' },
            },
            {
              label: 'Cork it. Leave the word in the glass.',
              pick: 'cork',
              reply: { speaker: 'Lira', text: 'Then the bottle keeps it. The engine does not get a new mouth. Neither do we.' },
            },
          ],
        },
      ],
      onPick: function (id) {
        if (Emberwake.noteThroat) Emberwake.noteThroat(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('kestrel-marrow', function () {
    var named = Emberwake.throatNamed && Emberwake.throatNamed();
    Emberwake.present({
      lines: [
        {
          where: 'Above the ash',
          speaker: 'Kestrel',
          text: named
            ? 'I heard the name leave the bottle. The next stone is not on this shelf. I can smell a thermal that does not exist yet.'
            : 'You corked a word. The sky does not owe you a road for that. The next stone is still not here.',
        },
        {
          speaker: 'Lira',
          text: 'Come as far as that stone. Not the pack. The road.',
          choices: [
            {
              label: 'Ask her to walk as far as the next stone.',
              pick: 'ask',
              reply: { speaker: 'Kestrel', text: 'No. If I fold the wing, they licence the bird. I will know the thermal when it is real. I will not be in the company when you open the pack.' },
            },
            {
              label: 'Leave her the air.',
              pick: 'air',
              reply: { speaker: 'Kestrel', text: 'Good. Look up when the stone exists. Do not save a seat.' },
            },
          ],
        },
      ],
      onPick: function (id) {
        if (Emberwake.noteKestrelMarrow) Emberwake.noteKestrelMarrow(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('yard-vesper', function () {
    var mark = Emberwake.poolMark ? Emberwake.poolMark('yard-slag') : 'open';
    var lines = [
      {
        where: 'Concord yard',
        speaker: 'Vesper',
        text: mark === 'drunk'
          ? 'You drank the slag. The warden is already writing your name on a leak they swore was corked. I am not here for the coat.'
          : 'They bottled this yard and it leaked through the licence. Drink it and they will say the rot has your name. Leave it and the yard keeps eating the road.',
      },
    ];
    if (mark === 'open') {
      lines.push({
        speaker: 'Lira',
        text: 'The warden has the book. The pool has the mouth.',
        choices: [
          {
            label: 'Drink it before they cork it.',
            pick: 'drink',
            reply: { speaker: 'Vesper', text: 'Then it stays a mouth. He will write the theft. I will not step into her to take it.' },
          },
          {
            label: 'Let the warden seal it.',
            pick: 'seal',
            reply: { speaker: 'Vesper', text: 'Then the licence goes on. The slag stays. The rot does not leave, and neither do I enter the host.' },
          },
        ],
      });
    } else {
      lines.push({ speaker: 'The spark', text: 'Kestrel is not in this yard. The stone did the carrying.' });
    }
    Emberwake.present({
      lines: lines,
      onPick: function (id) {
        if (Emberwake.noteYard) Emberwake.noteYard(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('mark-vesper', function () {
    var mark = Emberwake.poolMark ? Emberwake.poolMark('mark-weep') : 'open';
    var lines = [
      {
        where: 'Remnant Mark',
        speaker: 'Vesper',
        text: mark === 'drunk'
          ? 'You drank the weep. They will write your name on a pillar and call the remnant answered. It is not answered. I am not here for the coat.'
          : 'This pillar is the rumour. The Prime Remnant is the death that taught the world to keep power. They numbered this mouth and the number rotted. Drink the weep, or let the count finish.',
      },
    ];
    if (mark === 'open') {
      lines.push({
        speaker: 'Lira',
        text: 'The count has a number. The stone has a mouth.',
        choices: [
          {
            label: 'Drink the weep.',
            pick: 'drink',
            reply: { speaker: 'Vesper', text: 'Then the mouth stays open. I will not step into her to take it. Kestrel is not the road here either.' },
          },
          {
            label: 'Let them number it.',
            pick: 'seal',
            reply: { speaker: 'Vesper', text: 'Then the count goes on. The weep stays. The remnant does not arrive, and neither do I enter the host.' },
          },
        ],
      });
    } else {
      lines.push({ speaker: 'The spark', text: 'Kestrel did not carry this crossing. The pillar is not the remnant.' });
    }
    Emberwake.present({
      lines: lines,
      onPick: function (id) {
        if (Emberwake.noteMark) Emberwake.noteMark(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('nave-gate', function () {
    Emberwake.present({
      lines: [
        {
          where: 'Ash nave',
          speaker: 'Vesper',
          text: 'That mass is the cathedral they built on the first death. The Prime Remnant is behind the bar. I am on the roof. I am not coming down, and I will not step into her.',
        },
        {
          speaker: 'Lira',
          text: 'The door is shut. The road is not.',
          choices: [
            {
              label: 'Name the hinge.',
              pick: 'name',
              reply: { speaker: 'Vesper', text: 'Then the road has your mouth on it. The door stays shut. Kestrel is not on this roof, and she is not in the pack.' },
            },
            {
              label: 'Leave the seal.',
              pick: 'turn',
              reply: { speaker: 'Vesper', text: 'Then the bar stays theirs. You saw it. That is enough for the road to keep going, and I still do not enter the host.' },
            },
          ],
        },
      ],
      onPick: function (id) {
        if (Emberwake.noteNave) Emberwake.noteNave(id);
      },
    });
    return true;
  });
})(window.Emberwake);
