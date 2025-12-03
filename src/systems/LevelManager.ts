import { LevelConfig } from '../types';
import { LEVELS } from '../config/levels';

export class LevelManager {
  private currentLevel: LevelConfig | null = null;
  private currentLevelId: number = 1;
  private gapsAnsweredCorrectly: number = 0;
  private totalGaps: number = 0;

  public loadLevel(levelId: number): LevelConfig | null {
    const level = LEVELS.find((l) => l.id === levelId);
    if (level) {
      this.currentLevel = level;
      this.currentLevelId = levelId;
      this.gapsAnsweredCorrectly = 0;
      this.totalGaps = 0;
      return level;
    }
    return null;
  }

  public getCurrentLevel(): LevelConfig | null {
    return this.currentLevel;
  }

  public getCurrentLevelId(): number {
    return this.currentLevelId;
  }

  public incrementCorrectAnswers(): void {
    this.gapsAnsweredCorrectly++;
    this.totalGaps++;
  }

  public incrementTotalGaps(): void {
    this.totalGaps++;
  }

  public calculateScore(): number {
    if (this.totalGaps === 0) return 0;
    return Math.floor((this.gapsAnsweredCorrectly / this.totalGaps) * 100);
  }

  public getNextLevelId(): number | null {
    const currentIndex = LEVELS.findIndex((l) => l.id === this.currentLevelId);
    if (currentIndex < LEVELS.length - 1) {
      return LEVELS[currentIndex + 1].id;
    }
    return null;
  }

  public getAllLevels(): LevelConfig[] {
    return LEVELS;
  }

  public reset(): void {
    this.currentLevel = null;
    this.currentLevelId = 1;
    this.gapsAnsweredCorrectly = 0;
    this.totalGaps = 0;
  }
}
