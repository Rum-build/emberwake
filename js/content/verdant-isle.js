/**
 * Verdant Isle — Act I field data.
 * Phase 1 plays this as an overworld: pools, landmarks, toast beats.
 * Year 1's vertical slice fills the reserved scene ids and interior flags
 * without rewriting combat. Register those scenes with Emberwake.registerScene
 * and point beat.scene at them. See ROADMAP.md.
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
      { id: 'leaf-village', kind: 'village', x: -8, z: -10, clear: 4.2, interior: null },
      { id: 'concord-banner', kind: 'banner', x: -6.2, z: -11.6, clear: 1.6 },
      { id: 'root-cellar', kind: 'cellar', x: 10, z: 8, clear: 3.6, interior: null },
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
    ],
    beats: [
      {
        id: 'village',
        scene: null,
        x: -8, z: -10, r: 4.3,
        toast: 'The leaf-village keeps its doors half shut. They have heard the Ashen Concord bottles wells and calls the quiet safety.',
      },
      {
        id: 'cellar',
        scene: null,
        x: 10, z: 8, r: 3.5,
        toast: 'The root-cellar breathes old fire. Lira is not ready to go down. Pools still rot in the open air.',
      },
    ],
  });
})(window.Emberwake);
