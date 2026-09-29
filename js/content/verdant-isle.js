/**
 * Verdant Isle — Act I field data.
 * Pools, landmarks, and field beats. Scenes live in act1-scenes.js.
 * Village and root-cellar interiors are entered from their doors.
 */
(function (Emberwake) {
  'use strict';

  Emberwake.registerRegion({
    id: 'verdant-isle',
    act: 1,
    title: 'Ember in the Leaf',
    name: 'Verdant Isle',
    landmarks: [
      { id: 'spawn', kind: 'spawn', x: 0, z: 0, clear: 3.2 },
      { id: 'leaf-village', kind: 'village', x: -8, z: -10, clear: 4.2, interior: 'leaf-village' },
      { id: 'concord-banner', kind: 'banner', x: -6.2, z: -11.6, clear: 1.6 },
      { id: 'root-cellar', kind: 'cellar', x: 10, z: 8, clear: 3.6, interior: 'root-cellar' },
      { id: 'sleeping-waystone', kind: 'waystone', x: 0, z: 18, clear: 3.4 },
      { id: 'vesper-ridge', kind: 'silhouette', x: 8, z: 20.5, clear: 2.6 },
    ],
    pools: [
      {
        id: 'ember', element: 'fire', name: 'Dying Ember Pool', short: 'Ember',
        x: 5.4, z: 2.4, xp: 48, rot: 0.75, strain: 14,
        hint: 'The pool that woke the spark. It is still dying, and still offering.',
        line: 'You drink the dying ember. It hurts Lira, and the scar greens. That is the bargain.',
      },
      {
        id: 'vesper', element: 'fire', name: 'Vesper’s Scar', short: 'Scar',
        x: 14.2, z: -5.5, xp: 30, rot: 1, strain: 20, vesper: true,
        hint: 'Someone drank without digesting. The ground blistered in their shape.',
        line: 'You finish what Vesper left. The ground cools. Somewhere a rival spark goes briefly hungry.',
      },
      {
        id: 'well', element: 'water', name: 'Sealed Wellspring', short: 'Well',
        x: -14, z: -15.2, xp: 34, rot: 0.45, strain: 12, concord: true,
        hint: 'A Concord seal keeps the water polite. Polite water still rots downstream.',
        line: 'The sealed well gives up its water. The licence cracks into the pack. A harbor clerk will call this theft.',
      },
      {
        id: 'tide', element: 'water', name: 'Tide Cup', short: 'Tide',
        x: -15.5, z: 11, xp: 28, rot: 0.5, strain: 11,
        hint: 'Sea-memory, left above the tide line to sour.',
        line: 'You take the sea-memory. The cup in the grass fills with living green.',
      },
      {
        id: 'storm', element: 'lightning', name: 'Storm Bone', short: 'Storm',
        x: 1.2, z: -16.4, xp: 40, rot: 0.7, strain: 16,
        hint: 'A shattered stone. Lightning still lives in the crack.',
        line: 'Lightning nests in the spark. Lira tastes storms. The stone stops screaming.',
      },
      {
        id: 'copse', element: 'fire', name: 'Ash Copse', short: 'Copse',
        x: -18, z: -2, xp: 26, rot: 0.6, strain: 12,
        hint: 'A grove that burned with no sky above it. The heat stayed in the roots.',
        line: 'You take the root-fire. Leaves that were ash remember green. Lira’s hands smell of smoke.',
      },
      {
        id: 'leaf-cup', element: 'water', name: 'Leaf Cup', short: 'Cup',
        x: -4, z: 8, xp: 22, rot: 0.4, strain: 10, patrol: true,
        hint: 'A lesser spring, clear enough to lie. Someone with a licence is already walking toward it.',
        line: 'The cup was never yours to finish.',
      },
      {
        id: 'ridge', element: 'lightning', name: 'Ridge Vein', short: 'Ridge',
        x: -6, z: 16, xp: 32, rot: 0.55, strain: 14,
        hint: 'The stone under the north ridge still argues with the weather.',
        line: 'You drink the argument. Lightning sits behind Lira’s eyes. The vein goes quiet.',
      },
    ],
    beats: [
      {
        id: 'scar',
        scene: 'scar-witnesses',
        x: 14.2, z: -5.5, r: 5.4,
        toast: 'People are standing at Vesper’s scar. They are not here for the view.',
      },
      {
        id: 'patrol',
        scene: 'concord-patrol',
        x: -4, z: 8, r: 5.2,
        toast: 'A Concord patrol stands over a lesser spring with a seal in hand.',
      },
      {
        id: 'waystone',
        scene: 'waystone-tease',
        x: 0, z: 18, r: 3.2,
        toast: 'A ring of stones. The road inside them is shut.',
      },
      {
        id: 'silhouette',
        scene: 'vesper-silhouette',
        x: 8, z: 20.5, r: 3.1,
        toast: 'The ridge is empty. Lira’s mouth tastes iron anyway.',
      },
    ],
  });
})(window.Emberwake);
