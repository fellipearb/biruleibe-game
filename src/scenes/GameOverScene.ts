import Phaser from 'phaser';
import { ScoreManager } from '../managers/ScoreManager';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const scoreMgr = ScoreManager.getInstance();
    const currentLevel = scoreMgr.getCurrentLevel();

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0505, 1);

    this.add
      .text(width / 2, 140, 'GAME OVER', {
        fontFamily: 'Courier New',
        fontSize: '58px',
        color: '#ff2222',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        215,
        'SUA CAMPANHA FOI INTERROMPIDA PELO CAOS POLÍTICO!',
        {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: '#ffcc00',
          fontStyle: 'bold'
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        275,
        `PONTUAÇÃO FINAL: ${scoreMgr.getScore()} PTS\nRECORDE: ${scoreMgr.getHighScore()} PTS`,
        {
          fontFamily: 'Courier New',
          fontSize: '22px',
          color: '#ffffff',
          align: 'center'
        }
      )
      .setOrigin(0.5);

    const retryText = this.add
      .text(
        width / 2,
        375,
        `[ENTER / ESPAÇO] Tentar Novamente a Fase ${currentLevel}`,
        {
          fontFamily: 'Courier New',
          fontSize: '20px',
          color: '#00ff88',
          fontStyle: 'bold'
        }
      )
      .setOrigin(0.5);

    this.tweens.add({
      targets: retryText,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 500
    });

    this.add
      .text(width / 2, 430, '[M] Voltar ao Menu Principal', {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#cccccc'
      })
      .setOrigin(0.5);

    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-ENTER', () => {
        this.scene.start('LevelScene', { level: currentLevel });
      });
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('LevelScene', { level: currentLevel });
      });
      this.input.keyboard.once('keydown-M', () => {
        this.scene.start('MainMenuScene');
      });
    }
  }
}
