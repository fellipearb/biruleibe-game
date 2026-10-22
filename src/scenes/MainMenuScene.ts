import Phaser from 'phaser';
import { ScoreManager } from '../managers/ScoreManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const scoreMgr = ScoreManager.getInstance();

    // Background gradient style
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a192f, 0x0a192f, 0x1b4332, 0x2d1e2f, 1);
    bg.fillRect(0, 0, width, height);

    // Decorative green-yellow banner
    this.add.rectangle(width / 2, 78, width - 80, 96, 0x009c3b, 0.35).setStrokeStyle(3, 0xffdf00);

    this.add
      .text(width / 2, 58, 'METAL BIRULEIBE', {
        fontFamily: 'Courier New',
        fontSize: '46px',
        color: '#ffdf00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        104,
        'ARCADE RUN-AND-GUN SATÍRICO DA POLÍTICA BRASILEIRA',
        {
          fontFamily: 'Courier New',
          fontSize: '16px',
          color: '#00ffcc',
          fontStyle: 'bold'
        }
      )
      .setOrigin(0.5);

    this.add
      .text(width / 2, 146, `RECORDE HISTÓRICO: ${scoreMgr.getHighScore()} PTS`, {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    // Phase selection buttons (1..5)
    const phases = [
      { num: 1, title: 'FASE 1: Av. Paulista (Chefe: Glória Groove)' },
      { num: 2, title: 'FASE 2: Rua dos Clones (Chefe: Jato Erika Hilton)' },
      { num: 3, title: 'FASE 3: Ocupação Urbana [CTPS] (Chefe: Boulos)' },
      { num: 4, title: 'FASE 4: Debate Caótico [Cadeirada] (Chefe: Datena)' },
      { num: 5, title: 'FASE 5: Confronto Final [Bolsonaro vs Mecha-Lula]' }
    ];

    this.add
      .text(width / 2, 185, 'SELECIONE A FASE (CLIQUE OU TECLAS 1 A 5):', {
        fontFamily: 'Courier New',
        fontSize: '15px',
        color: '#ffcc00',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    phases.forEach((p, idx) => {
      const btnY = 222 + idx * 38;
      const btn = this.add
        .rectangle(width / 2, btnY, 580, 30, 0x1e272e, 0.9)
        .setStrokeStyle(2, 0xffdf00)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(width / 2, btnY, `[${p.num}] ${p.title}`, {
          fontFamily: 'Courier New',
          fontSize: '15px',
          color: '#ffffff',
          fontStyle: 'bold'
        })
        .setOrigin(0.5);

      btn.on('pointerover', () => {
        btn.setFillStyle(0x009c3b, 0.9);
        label.setColor('#ffff00');
      });
      btn.on('pointerout', () => {
        btn.setFillStyle(0x1e272e, 0.9);
        label.setColor('#ffffff');
      });
      btn.on('pointerdown', () => {
        this.startGameAtLevel(p.num);
      });
    });

    // Controls info panel
    const controlsBox = this.add
      .rectangle(width / 2, 442, width - 80, 68, 0x000000, 0.55)
      .setStrokeStyle(1, 0x00ffcc);

    this.add
      .text(
        controlsBox.x,
        controlsBox.y - 14,
        'CONTROLES: [A/D ou Setas] Mover + Mirar 8 Direções | [W/Cima] Mirar Cima | [S/Baixo] Agachar',
        {
          fontFamily: 'Courier New',
          fontSize: '13px',
          color: '#dfe6e9'
        }
      )
      .setOrigin(0.5);

    this.add
      .text(
        controlsBox.x,
        controlsBox.y + 12,
        '[ESPAÇO ou Z] Pular | [J, X ou Mouse] Atirar Contínuo | [E ou C] Pegar/Rebater Cadeira (Fase 4/5)',
        {
          fontFamily: 'Courier New',
          fontSize: '13px',
          color: '#ffd700',
          fontStyle: 'bold'
        }
      )
      .setOrigin(0.5);

    const startPrompt = this.add
      .text(
        width / 2,
        504,
        '>>> PRESSIONE [ENTER] OU [ESPAÇO] PARA INICIAR DO COMEÇO <<<',
        {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: '#00ff88',
          fontStyle: 'bold'
        }
      )
      .setOrigin(0.5);

    this.tweens.add({
      targets: startPrompt,
      alpha: 0.25,
      yoyo: true,
      repeat: -1,
      duration: 550
    });

    if (this.input.keyboard) {
      this.input.keyboard.once('keydown-ENTER', () => this.startGameAtLevel(1));
      this.input.keyboard.once('keydown-SPACE', () => this.startGameAtLevel(1));
      this.input.keyboard.once('keydown-ONE', () => this.startGameAtLevel(1));
      this.input.keyboard.once('keydown-TWO', () => this.startGameAtLevel(2));
      this.input.keyboard.once('keydown-THREE', () => this.startGameAtLevel(3));
      this.input.keyboard.once('keydown-FOUR', () => this.startGameAtLevel(4));
      this.input.keyboard.once('keydown-FIVE', () => this.startGameAtLevel(5));
    }
  }

  private startGameAtLevel(level: number): void {
    const scoreMgr = ScoreManager.getInstance();
    scoreMgr.resetScore();
    scoreMgr.setCurrentLevel(level);
    this.scene.start('LevelScene', { level });
  }
}
