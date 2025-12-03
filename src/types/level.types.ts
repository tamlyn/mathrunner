import { Equation, ThemeConfig } from './game.types';

export interface LevelConfig {
  id: number;
  name: string;
  target: number;
  speed: number;
  segmentCount: number;
  gapFrequency: number;
  theme: ThemeConfig;
}

export interface PathSegment {
  id: string;
  startZ: number;
  endZ: number;
  length: number;
  hasGap: boolean;
  gap?: GapConfig;
}

export interface GapConfig {
  position: number;
  equation: Equation;
}

export interface SaveData {
  unlockedLevels: number[];
  levelScores: Record<number, number>;
  currentLevel: number;
}
