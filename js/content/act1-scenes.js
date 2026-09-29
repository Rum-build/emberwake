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
          where: 'Leaf-village, inside',
          speaker: 'Sera',
          text: 'The Concord sealed the well and the babies stopped coughing. Say what you like about licences. Coughing is not a theory.',
        },
        {
          speaker: 'Old Joss',
          text: 'They sealed the well and the south furrow went grey. My cousin’s barley died polite. Polite is how they like a famine.',
        },
        {
          speaker: 'Nima',
          text: 'I have been packing leaves for both of them. The cough and the furrow. Neither bundle makes the other one a liar.',
        },
        {
          speaker: 'Lira',
          text: 'They are looking at you. At the thing behind your eyes.',
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
              reply: { speaker: 'Nima', text: 'You will. Hunger judges. It just doesn’t write the verdict in ink.' },
            },
          ],
        },
        {
          speaker: 'Nima',
          text: 'I’m done counting leaves in a room that will not decide. I’ll walk with her. If the spark eats something foul, I want to see the bill.',
        },
      ],
      onDone: function () {
        if (Emberwake.recruit) Emberwake.recruit('nima');
      },
    });
    return true;
  });

  Emberwake.registerScene('cellar-threshold', function () {
    Emberwake.present({
      lines: [
        { where: 'Root-cellar', speaker: 'Lira', text: 'Old fire. Under the jars. It is not a hearth.' },
        { speaker: 'The spark', text: 'This is a mouth, not a road. The door at the back is shut because the isle is not finished with you up here.' },
        { speaker: 'Lira', text: 'Something is burning on the other side. I can smell it in my teeth.' },
        { speaker: 'The spark', text: 'Remember the smell. When this cellar opens downward, it will not be a cellar anymore. Leave before you promise the dark a meal.' },
      ],
    });
    return true;
  });

  Emberwake.registerScene('scar-witnesses', function () {
    Emberwake.present({
      lines: [
        { where: 'Vesper’s scar', speaker: 'Ilan', text: 'She stood where you are standing. Drank until the grass blistered in her shape. Said the land would thank her.' },
        { speaker: 'Maud', text: 'My sister coughed black for three days. The Concord called it a side effect of mercy. Vesper called it cleansing. I call it her name, so someone writes it down.' },
        { speaker: 'Ilan', text: 'If you finish the scar, the ground may green. My sister does not green. If you leave it, the rot stays and walks.' },
        {
          speaker: 'Lira',
          text: 'They will not let this be a private meal.',
          choices: [
            {
              label: 'Drink it. The ground is already screaming.',
              pick: 'drink',
              reply: { speaker: 'Maud', text: 'Then drink in front of us. And do not come to the village afterward asking to be thanked.' },
            },
            {
              label: 'Leave the scar. The rot stays.',
              pick: 'leave',
              reply: { speaker: 'Ilan', text: 'Then take the ash we scraped off her footprint. Sell it, bury it, I don’t care. Don’t you drink it while we are watching.' },
            },
          ],
        },
      ],
      onPick: function (id) {
        if (Emberwake.setScarVerdict) Emberwake.setScarVerdict(id);
      },
    });
    return true;
  });

  Emberwake.registerScene('concord-patrol', function () {
    Emberwake.present({
      lines: [
        { where: 'The leaf-cup', speaker: 'Concord Warden', text: 'Unlicensed water. Cork it before the rot learns the path down to the furrow.' },
        { speaker: 'Concord Scribe', text: 'The licence is mercy. Say it once for the ledger. Mercy.' },
        { speaker: 'Torren', text: 'I wrote these licences. I will not write this one. The coat can stay on my back. The seal does not.' },
        { speaker: 'Concord Warden', text: 'Quartermaster Torren, refusing a cork. Note the witness too. Host-body. Spark behind the eyes.' },
        { speaker: 'Lira', text: 'They see both of you now.' },
      ],
      onDone: function () {
        if (Emberwake.recruit) Emberwake.recruit('torren');
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
