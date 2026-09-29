/**
 * Stormreach Coast — Act II field data.
 * A walkable cliff after the Verdant waystone. The harbor vault is a face,
 * not a door you can open. Scenes live in act2-scenes.js.
 */
(function (Emberwake) {
  'use strict';

  Emberwake.registerRegion({
    id: 'stormreach',
    act: 2,
    title: 'Bottled Sky',
    name: 'Stormreach Coast',
    landmarks: [
      { id: 'landing', kind: 'roost', x: 0, z: 9, clear: 2.6 },
      { id: 'harbor-vault', kind: 'vault', x: 0.2, z: 0.15, clear: 3.2 },
    ],
    pools: [
      {
        id: 'harbor-leak',
        element: 'lightning',
        name: 'Harbor Leak',
        short: 'Leak',
        region: 'stormreach',
        x: 5.6,
        z: 3.4,
        xp: 38,
        rot: 0.8,
        strain: 16,
        hint: 'Lightning the vault failed to cork. It pools on the shale and looks for a mouth.',
        line: 'You drink the leak. The seal on the door does not notice. Lira’s teeth taste of copper and clerks.',
      },
      {
        id: 'spire-bone',
        element: 'lightning',
        name: 'Spire Bone',
        short: 'Spire',
        region: 'stormreach',
        x: -6.4,
        z: 6.6,
        xp: 32,
        rot: 0.55,
        strain: 14,
        hint: 'A rib of the cliff that still argues with the weather.',
        line: 'The spire gives up its lightning. The argument moves behind her eyes. The cliff keeps the scar.',
      },
    ],
    beats: [
      {
        id: 'vault-face',
        scene: 'vault-face',
        x: 0.2,
        z: 2.15,
        r: 2.3,
        toast: 'The harbor vault looks back.',
      },
      {
        id: 'merge-tease',
        scene: 'merge-tease',
        x: 0,
        z: 5.4,
        r: 2.5,
        toast: 'Two elements try to share a word.',
      },
      {
        id: 'vesper-duel',
        scene: 'vesper-duel',
        x: 7.4,
        z: 8.1,
        r: 2.8,
        toast: 'Someone on the shale already knows your hunger.',
      },
      {
        id: 'kestrel-ask',
        scene: 'kestrel-ask',
        x: -2.4,
        z: 8.4,
        r: 2.2,
        toast: 'A wing holds over the roost.',
      },
    ],
  });
})(window.Emberwake);
