import Phaser from 'phaser';
import { ScoreManager } from '../managers/ScoreManager';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const scoreMgr = ScoreManager.getInstance();

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x004b23, 0x004b23, 0x007200, 0x38b000, 1);
    bg.fillRect(0, 0, width, height);

    this.add
      .text(width / 2, 110, 'VITÓRIA HISTÓRICA!', {
        fontFamily: 'Courier New',
        fontSize: '52px',
        color: '#ffdf00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        185,
        'VOCÊ SOBREVIVEU À POLARIZAÇÃO MÁXIMA E ZEROU O METAL BIRULEIBE!',
        {
          fontFamily: 'Courier New',
          fontSize: '17px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        265,
        `PONTUAÇÃO TOTAL: ${scoreMgr.getScore()} PTS\nRECORDE SUPREMO: ${scoreMgr.getHighScore()} PTS`,
        {
          fontFamily: 'Courier New',
          fontSize: '26px',
          color: '#00ffcc',
          fontStyle: 'bold',
          align: 'center',
          stroke: '#000',
          strokeThickness: 4
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        355,
        'Chefes Derrotados:\n✓ Trio da Glória Groove  ✓ Jato da Erika Hilton  ✓ Boulos\n✓ Datena Supremo  ✓ Mecha-Lula (Cúpula de Energia)',
        {
          fontFamily: 'Courier New',
          fontSize: '15px',
          color: '#ffdf00',
          align: 'center'
        }
      )
      .setOrigin(0.5);

    const menuPrompt = this.add
      .text(width / 2, 455, '[ENTER / ESPAÇO] VOLTAR AO MENU PRINCIPAL', {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: menuPrompt,
      scale: 1.06,
      yoyo: true,
      repeat: -1,
      duration: 500
    });

    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-ENTER', () => {
        this.scene.start('MainMenuScene');
      });
      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.start('MainMenuScene');
      });
    }
  }
}
