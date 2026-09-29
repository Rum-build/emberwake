/**
 * Act I scenes on Verdant Isle.
 * Field beats in verdant-isle.js point here. The combat runtime plays them
 * through Emberwake.present. Tone: Final Fantasy set pieces, Witcher arguments.
 */
(function (Emberwake) {
  'use strict';

  Emberwake.registerScene('wake-spark', function (ctx) {
    var gear = (ctx && ctx.gearHint) || '';
    Emberwake.present({
      lines: [
        { where: 'Inside Lira', speaker: 'Lira', text: 'I touched it. I should be ash. I am not ash.' },
        { speaker: 'The spark', text: 'You are the one awake in her teeth. She is the body. The ember is still dying, and it is still offering.' },
        { speaker: 'Lira', text: 'Get out of my mouth.' },
        { speaker: 'The spark', text: 'Walk to the orange column. Drink. The ground heals because you were hungry. That is not kindness.' + gear },
      ],
    });
    return true;
  });

  Emberwake.registerScene('village-argument', function () {
    Emberwake.present({
      lines: [
        {
          where: 'Leaf-village',
          speaker: 'Sera',
          text: 'The Concord sealed the well and the babies stopped coughing. Say what you like about licences. Coughing is not a theory.',
        },
        {
          speaker: 'Old Joss',
          text: 'They sealed the well and the south furrow went grey. My cousin’s barley died polite. Polite is how they like a famine.',
        },
        {
          speaker: 'Torren',
          text: 'I signed papers like that. The seal is real. The quiet is a debt. Don’t ask me which of them is lying. Both kept their hands clean.',
        },
        {
          speaker: 'Lira',
          text: 'They are looking at you. Not at him. At the thing behind your eyes.',
          choices: [
            {
              label: 'The seal is a theft.',
              reply: { speaker: 'Sera', text: 'Then bring the coughing back and call yourself honest. My sister will want your name.' },
            },
            {
              label: 'The seal kept them alive.',
              reply: { speaker: 'Old Joss', text: 'Alive for a season. Come back when the furrow answers you. It will not be grateful.' },
            },
            {
              label: 'I didn’t come to judge a village.',
              reply: { speaker: 'Torren', text: 'You will. The spark eats, and a clerk writes it down. Judgment is just the slower paperwork.' },
            },
          ],
        },
        {
          speaker: 'Nima',
          text: 'Both of them are telling the truth. That is the part that rots. Leave them the argument. The pools are still in the open.',
        },
      ],
    });
    return true;
  });

  Emberwake.registerScene('concord-patrol', function () {
    Emberwake.present({
      lines: [
        { where: 'The leaf-cup', speaker: 'Concord Warden', text: 'Unlicensed water. Cork it before the rot learns the path down to the furrow.' },
        { speaker: 'Concord Scribe', text: 'The licence is mercy. Say it once for the ledger. Mercy.' },
        { speaker: 'Concord Warden', text: 'Witness on the road. Host-body. Spark behind the eyes. Note the face. Note the hunger.' },
        { speaker: 'The spark', text: 'They are not digesting it. They are moving the wound and calling the pus elsewhere.' },
        { speaker: 'Lira', text: 'They see us.' },
      ],
      onDone: function () {
        if (Emberwake.bottlePool) Emberwake.bottlePool('leaf-cup');
        if (Emberwake.beginEncounter) Emberwake.beginEncounter(['warden', 'scribe']);
      },
    });
    return true;
  });

  Emberwake.registerScene('waystone-tease', function () {
    Emberwake.present({
      lines: [
        { where: 'A sleeping stone', speaker: 'Lira', text: 'Riders call these waystones. Doors, if you carry the right death.' },
        { speaker: 'The spark', text: 'This one is shut. Stormreach is a name on the other side of a road that has not woken. There is no toll, because there is no passage.' },
        { speaker: 'Lira', text: 'Something with wings crossed the sun once and did not land. She laughed. I do not know her.' },
        { speaker: 'The spark', text: 'Remember the shape of the stones. When the road opens, it will not open here out of pity.' },
      ],
    });
    return true;
  });

  Emberwake.registerScene('vesper-silhouette', function () {
    if (!Emberwake.actReady || !Emberwake.actReady()) {
      if (Emberwake.whisper) Emberwake.whisper('The ridge is empty. Lira’s mouth tastes iron anyway.');
      return false;
    }
    if (Emberwake.revealSilhouette) Emberwake.revealSilhouette();
    Emberwake.present({
      lines: [
        { where: 'The ridge', speaker: 'A voice', text: 'You drink slower than I did. The isle looks grateful. Gratitude is a soft word for leftovers.' },
        { speaker: 'Lira', text: 'Vesper.' },
        { speaker: 'Vesper', text: 'Don’t finish my scraps and call it healing. The Concord will bottle whatever you leave polite. I will be on the coast when you are brave enough to be ugly.' },
        { speaker: 'The spark', text: 'She does not offer a duel. She offers a mirror, and steps out of it. The scar in the grass is still a different wound.' },
      ],
      onDone: function () {
        if (Emberwake.dismissSilhouette) Emberwake.dismissSilhouette();
      },
    });
    return true;
  });
})(window.Emberwake);
