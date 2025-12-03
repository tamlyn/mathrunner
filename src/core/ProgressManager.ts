import { SaveData } from '../types';

const SAVE_KEY = 'mathrunner_save_data';

export class ProgressManager {
  private saveData: SaveData;

  constructor() {
    this.saveData = this.load();
  }

  private getDefaultSaveData(): SaveData {
    return {
      unlockedLevels: [1],
      levelScores: {},
      currentLevel: 1,
    };
  }

  public load(): SaveData {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...this.getDefaultSaveData(), ...parsed };
      }
    } catch (error) {
      console.error('Failed to load save data:', error);
    }
    return this.getDefaultSaveData();
  }

  public save(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.saveData));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  public isLevelUnlocked(levelId: number): boolean {
    return this.saveData.unlockedLevels.includes(levelId);
  }

  public unlockLevel(levelId: number): void {
    if (!this.saveData.unlockedLevels.includes(levelId)) {
      this.saveData.unlockedLevels.push(levelId);
      this.save();
    }
  }

  public setLevelScore(levelId: number, score: number): void {
    const currentScore = this.saveData.levelScores[levelId] || 0;
    if (score > currentScore) {
      this.saveData.levelScores[levelId] = score;
      this.save();
    }
  }

  public getLevelScore(levelId: number): number {
    return this.saveData.levelScores[levelId] || 0;
  }

  public setCurrentLevel(levelId: number): void {
    this.saveData.currentLevel = levelId;
    this.save();
  }

  public getCurrentLevel(): number {
    return this.saveData.currentLevel;
  }

  public getUnlockedLevels(): number[] {
    return [...this.saveData.unlockedLevels];
  }

  public reset(): void {
    this.saveData = this.getDefaultSaveData();
    this.save();
  }
}
