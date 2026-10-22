export class ScoreManager {
  private static instance: ScoreManager;
  private score: number = 0;
  private highScore: number = 0;
  private currentLevel: number = 1;
  private chairsCaught: number = 0;

  private constructor() {
    const saved = localStorage.getItem('biruleibe_highscore');
    if (saved) {
      this.highScore = parseInt(saved, 10) || 0;
    }
  }

  public static getInstance(): ScoreManager {
    if (!ScoreManager.instance) {
      ScoreManager.instance = new ScoreManager();
    }
    return ScoreManager.instance;
  }

  public addScore(points: number): void {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('biruleibe_highscore', String(this.highScore));
    }
  }

  public getScore(): number {
    return this.score;
  }

  public getHighScore(): number {
    return this.highScore;
  }

  public resetScore(): void {
    this.score = 0;
    this.chairsCaught = 0;
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public setCurrentLevel(level: number): void {
    this.currentLevel = Phaser.Math.Clamp(level, 1, 5);
  }

  public addChairAmmo(amount: number = 1): void {
    this.chairsCaught = Math.min(this.chairsCaught + amount, 5);
  }

  public consumeChairAmmo(): boolean {
    if (this.chairsCaught > 0) {
      this.chairsCaught--;
      return true;
    }
    return false;
  }

  public getChairAmmo(): number {
    return this.chairsCaught;
  }

  public resetChairAmmo(): void {
    this.chairsCaught = 0;
  }
}
