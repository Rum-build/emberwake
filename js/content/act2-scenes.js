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
    if (!(fire >= 1 && (bolt >= 1 || water >= 1))) return false;
    var plasma = bolt >= 1;
    Emberwake.present({
      lines: plasma
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
        ],
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
              reply: { speaker: 'A clerk', text: 'Signed. You are a witness, not a licence. If a harbor asks who counted the missing storm, the book will say your mouth. The iron does not open for witnesses.' },
            },
            {
              label: 'Refuse the line. Leave the shortage rude.',
              pick: 'refuse',
              reply: { speaker: 'A clerk', text: 'Then it stays rude. Rude shortages feed no one and blame no one, which is how a harbour prefers its theft. The door back to the shale is behind you. The bottles are not.' },
            },
          ],
        },
        { speaker: 'The spark', text: 'Grey work. The coast is still leaking. Kestrel would not put her boots on this floor, and the iron agrees with her.' },
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
})(window.Emberwake);
