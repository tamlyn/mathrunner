import { LevelConfig } from '../types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Making 10",
    target: 10,
    speed: 5,
    segmentCount: 10,
    gapFrequency: 1,
    theme: {
      pathColor: 0x7B68EE,
      skyColor: 0x87CEEB,
      accentColor: 0xFFD700,
    }
  },
  {
    id: 2,
    name: "Making 10 - Faster",
    target: 10,
    speed: 7,
    segmentCount: 15,
    gapFrequency: 1.2,
    theme: {
      pathColor: 0x9370DB,
      skyColor: 0x98D8C8,
      accentColor: 0xFF6B6B,
    }
  },
  {
    id: 3,
    name: "Making 20",
    target: 20,
    speed: 5,
    segmentCount: 12,
    gapFrequency: 1,
    theme: {
      pathColor: 0x20B2AA,
      skyColor: 0xFFE4E1,
      accentColor: 0xFFB347,
    }
  },
  {
    id: 4,
    name: "Making 20 - Challenge",
    target: 20,
    speed: 8,
    segmentCount: 18,
    gapFrequency: 1.5,
    theme: {
      pathColor: 0xDA70D6,
      skyColor: 0xE6E6FA,
      accentColor: 0x00CED1,
    }
  },
  {
    id: 5,
    name: "Mixed Practice",
    target: 10,
    speed: 6,
    segmentCount: 20,
    gapFrequency: 1.3,
    theme: {
      pathColor: 0xFF69B4,
      skyColor: 0xFFFACD,
      accentColor: 0x32CD32,
    }
  },
];
