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
        { speaker: 'Lira', text: 'We are not going in. We are learning the shape of the refusal.' },
        { speaker: 'A clerk', text: 'Then learn it from the shale. The cork does not open for hunger. Hunger is how rot gets a name.' },
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
          { speaker: 'Lira', text: 'It burns the air and goes out. I almost had a name for it.' },
          { speaker: 'The spark', text: 'Plasma. Remember the shape. It is not a spell yet. A spell would stay when you opened your hands.' },
          { speaker: 'Lira', text: 'Then we carry the almost. The vault can wait for a word that holds.' },
        ]
        : [
          { where: 'Between her hands', speaker: 'The spark', text: 'Fire she already swallowed, and water. They meet and fog the shale.' },
          { speaker: 'Lira', text: 'Steam. Then nothing. My palms are only warm.' },
          { speaker: 'The spark', text: 'A merge is a memory until the host can keep it. This one left. The next one may not be so polite.' },
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
})(window.Emberwake);
