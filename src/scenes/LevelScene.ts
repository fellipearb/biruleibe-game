import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { ProjectilePool } from '../entities/Projectile';
import { ScoreManager } from '../managers/ScoreManager';
import { WaveManager } from '../managers/WaveManager';
import { CollisionManager } from '../managers/CollisionManager';

interface LevelTheme {
  title: string;
  subtitle: string;
  skyTop: number;
  skyBottom: number;
  buildingColor: number;
  accentColor: number;
  weaponLabel: string;
}

const LEVEL_THEMES: Record<number, LevelTheme> = {
  1: {
    title: 'FASE 1: AVENIDA PAULISTA',
    subtitle: 'Manifestação & Paredão Sonoro',
    skyTop: 0x1e3c72,
    skyBottom: 0x2a5298,
    buildingColor: 0x2c3e50,
    accentColor: 0xe74c3c,
    weaponLabel: 'Fuzil Padrão (Munição Rápida)'
  },
  2: {
    title: 'FASE 2: RUA DOS CLONES & BATALHA AÉREA',
    subtitle: 'Marcha das Perucas & Esquadrilha Fashion',
    skyTop: 0x240b36,
    skyBottom: 0xc31432,
    buildingColor: 0x1e272e,
    accentColor: 0xffea00,
    weaponLabel: 'Fuzil Padrão (Anti-Aéreo)'
  },
  3: {
    title: 'FASE 3: OCUPAÇÃO URBANA',
    subtitle: 'Prédios Abandonados & Pão com Mortadela',
    skyTop: 0x232526,
    skyBottom: 0x414345,
    buildingColor: 0x3d3d3d,
    accentColor: 0x0055cc,
    weaponLabel: 'Carteira de Trabalho - CTPS (Perfurante!)'
  },
  4: {
    title: 'FASE 4: O DEBATE CAÓTICO',
    subtitle: 'Estúdio de TV - Rebata Cadeiras com [E] ou [C]!',
    skyTop: 0x0f2027,
    skyBottom: 0x203a43,
    buildingColor: 0x192a56,
    accentColor: 0xffd700,
    weaponLabel: 'Fuzil + Pegar/Atirar Cadeira [E/C]'
  },
  5: {
    title: 'FASE 5: CONFRONTO FINAL - POLARIZAÇÃO MÁXIMA',
    subtitle: 'Bolsonaro (Arminha Laser) vs Mecha-Lula (3 Fases)',
    skyTop: 0x3b0000,
    skyBottom: 0x003b18,
    buildingColor: 0x222222,
    accentColor: 0x00ffcc,
    weaponLabel: 'Gesto da Arminha Laser 👉'
  }
};

export class LevelScene extends Phaser.Scene {
  private levelNumber: number = 1;
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemiesGroup!: Phaser.Physics.Arcade.Group;
  private playerProjectiles!: ProjectilePool;
  private enemyProjectiles!: ProjectilePool;
  private waveManager!: WaveManager;
  private collisionManager!: CollisionManager;
  private isTransitioning: boolean = false;

  // HUD Elements
  private hudGraphics!: Phaser.GameObjects.Graphics;
  private hudInfoText!: Phaser.GameObjects.Text;
  private hudScoreText!: Phaser.GameObjects.Text;
  private hudBossNameText!: Phaser.GameObjects.Text;
  private hudGoText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LevelScene' });
  }

  public init(data: { level?: number }): void {
    this.levelNumber = data?.level || ScoreManager.getInstance().getCurrentLevel() || 1;
    ScoreManager.getInstance().setCurrentLevel(this.levelNumber);
    ScoreManager.getInstance().resetChairAmmo();
    this.isTransitioning = false;
  }

  public create(): void {
    const theme = LEVEL_THEMES[this.levelNumber] || LEVEL_THEMES[1];
    const levelWidth = 2560;
    const levelHeight = 540;

    // 1. Build Satirical Background Scenery
    this.createLevelBackground(levelWidth, levelHeight, theme);

    // 2. Create Ground and Elevated Platforms
    this.platforms = this.physics.add.staticGroup();
    for (let gx = 32; gx < levelWidth; gx += 64) {
      this.platforms.create(gx, 488, 'ground_tile');
    }

    // Add tactical platforms across the level for verticality & dodging
    const platformPositions = [
      { x: 460, y: 365 },
      { x: 740, y: 330 },
      { x: 1220, y: 360 },
      { x: 1520, y: 320 },
      { x: 2040, y: 355 },
      { x: 2260, y: 300 }
    ];
    for (const pos of platformPositions) {
      this.platforms.create(pos.x, pos.y, 'platform_tile');
    }

    // 3. Create Object Pools for Projectiles & Enemy Group
    this.playerProjectiles = new ProjectilePool(this, 80);
    this.enemyProjectiles = new ProjectilePool(this, 140);
    this.enemiesGroup = this.physics.add.group({ runChildUpdate: true });

    // 4. Spawn Player
    this.player = new Player(
      this,
      100,
      400,
      this.playerProjectiles,
      this.levelNumber
    );

    // 5. Configure Camera
    this.cameras.main.setBounds(0, 0, 960, levelHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // 6. Initialize WaveManager & CollisionManager
    this.waveManager = new WaveManager(
      this,
      this.levelNumber,
      this.player,
      this.enemiesGroup,
      this.enemyProjectiles,
      {
        onWaveUnlocked: () => this.showGoPrompt(),
        onBossSpawned: (boss) => this.announceBoss(boss),
        onLevelVictory: () => this.handleLevelVictory()
      }
    );

    this.collisionManager = new CollisionManager(
      this,
      this.player,
      this.platforms,
      this.enemiesGroup,
      this.playerProjectiles,
      this.enemyProjectiles,
      () => this.waveManager.getActiveBoss(),
      (x, y, text, color) => this.spawnFloatingText(x, y, text, color)
    );

    // 7. Create HUD
    this.createHUD(theme);
    this.showStageIntroBanner(theme);
  }

  public update(time: number, delta: number): void {
    if (this.isTransitioning) return;

    this.player.update(time, delta);
    this.waveManager.update();
    this.collisionManager.update();

    const activeBoss = this.waveManager.getActiveBoss();
    if (activeBoss && activeBoss.active) {
      activeBoss.update(time, delta);
    }

    this.updateHUD();

    // Check Player Death
    if (this.player.hp <= 0 && !this.isTransitioning) {
      this.isTransitioning = true;
      this.cameras.main.shake(300, 0.02);
      this.time.delayedCall(900, () => {
        this.scene.start('GameOverScene');
      });
    }
  }

  private createLevelBackground(
    levelWidth: number,
    levelHeight: number,
    theme: LevelTheme
  ): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      theme.skyTop,
      theme.skyTop,
      theme.skyBottom,
      theme.skyBottom,
      1
    );
    bg.fillRect(0, 0, levelWidth, levelHeight);

    // Draw thematic buildings / landmarks along the 2560px width
    const sc = this.add.graphics();
    for (let bx = 40; bx < levelWidth; bx += 220) {
      const bHeight = Phaser.Math.Between(160, 290);
      const bWidth = 150;
      const by = 456 - bHeight;

      sc.fillStyle(theme.buildingColor, 0.9);
      sc.fillRect(bx, by, bWidth, bHeight);
      sc.lineStyle(2, theme.accentColor, 0.6);
      sc.strokeRect(bx, by, bWidth, bHeight);

      // Windows / details
      for (let wy = by + 20; wy < 430; wy += 36) {
        for (let wx = bx + 18; wx < bx + bWidth - 25; wx += 36) {
          sc.fillStyle(this.levelNumber === 3 ? 0x111111 : 0xfdcb6e, 0.65);
          sc.fillRect(wx, wy, 20, 22);
        }
      }

      // Phase-specific satirical billboards/details
      if (this.levelNumber === 1 && bx === 480) {
        // MASP-inspired red pillars on Avenida Paulista
        sc.fillStyle(0xd63031, 1);
        sc.fillRect(bx - 10, 260, 14, 196);
        sc.fillRect(bx + bWidth - 4, 260, 14, 196);
      } else if (this.levelNumber === 3) {
        // Boarded door/window for Urban Occupation
        sc.fillStyle(0x6d4c41, 1);
        sc.fillRect(bx + 50, 396, 46, 60);
      } else if (this.levelNumber === 4) {
        // TV Studio Stage screens
        sc.fillStyle(0x00a8ff, 0.35);
        sc.fillRect(bx + 15, by + 30, bWidth - 30, 60);
      } else if (this.levelNumber === 5 && bx > 1800) {
        // Brasília Congress twin domes silhouette in Final Arena
        sc.fillStyle(0xdfe6e9, 0.5);
        sc.fillCircle(bx + 70, 380, 48);
      }
    }
  }

  private createHUD(theme: LevelTheme): void {
    this.hudGraphics = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.hudInfoText = this.add
      .text(16, 12, '', {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setScrollFactor(0)
      .setDepth(101);

    this.hudScoreText = this.add
      .text(16, 58, '', {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ffdf00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setScrollFactor(0)
      .setDepth(101);

    this.hudBossNameText = this.add
      .text(this.scale.width - 18, 12, '', {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#ff4444',
        fontStyle: 'bold',
        align: 'right',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(101);

    this.hudGoText = this.add
      .text(this.scale.width - 110, 120, 'AVANCE! >>>', {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#00ff88',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 5
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(102)
      .setVisible(false);

    // Subtle bottom bar showing current phase weapon & controls
    this.add
      .text(
        this.scale.width / 2,
        this.scale.height - 14,
        `${theme.title} | Arma: ${theme.weaponLabel} | [E/C] Pegar/Atirar Cadeira`,
        {
          fontFamily: 'Courier New',
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 8, y: 2 }
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  private updateHUD(): void {
    this.hudGraphics.clear();

    // Player Health Bar
    const pRatio = Phaser.Math.Clamp(this.player.hp / this.player.maxHp, 0, 1);
    this.hudGraphics.fillStyle(0x000000, 0.75);
    this.hudGraphics.fillRect(16, 34, 214, 18);
    this.hudGraphics.fillStyle(pRatio > 0.35 ? 0x00e676 : 0xff1744, 1);
    this.hudGraphics.fillRect(18, 36, 210 * pRatio, 14);

    const charName = this.player.isBolsonaroMode
      ? 'BOLSONARO (ARMINHA)'
      : 'SOLDADO CAMUFLADO';
    this.hudInfoText.setText(
      `${charName} | HP: ${this.player.hp}/${this.player.maxHp} | Mira: [${this.player.aimDirName}]`
    );

    const scoreMgr = ScoreManager.getInstance();
    const chairs = scoreMgr.getChairAmmo();
    const chairText = chairs > 0 ? ` | 🪑 CADEIRAS: ${chairs} [E/C]` : '';
    this.hudScoreText.setText(`PONTOS: ${scoreMgr.getScore()}${chairText}`);

    // Boss Health Bar if active
    const boss = this.waveManager.getActiveBoss();
    if (boss && boss.active && !boss.isDefeated) {
      const bRatio = Phaser.Math.Clamp(boss.hp / boss.maxHp, 0, 1);
      const barW = 320;
      const barX = this.scale.width - barW - 18;

      this.hudGraphics.fillStyle(0x000000, 0.8);
      this.hudGraphics.fillRect(barX - 2, 52, barW + 4, 18);
      this.hudGraphics.fillStyle(0xff1744, 1);
      this.hudGraphics.fillRect(barX, 54, barW * bRatio, 14);

      this.hudBossNameText.setVisible(true);
      this.hudBossNameText.setText(`${boss.bossName}\n${boss.subtitle}`);
    } else {
      this.hudBossNameText.setVisible(false);
    }
  }

  private showGoPrompt(): void {
    this.hudGoText.setVisible(true);
    this.tweens.add({
      targets: this.hudGoText,
      alpha: 0.2,
      yoyo: true,
      repeat: 5,
      duration: 240,
      onComplete: () => {
        this.hudGoText.setAlpha(1);
        this.hudGoText.setVisible(false);
      }
    });
  }

  private announceBoss(boss: Boss): void {
    const warn = this.add
      .text(
        this.scale.width / 2,
        155,
        `⚠️ ALERTA DE CHEFE ⚠️\n${boss.bossName}\n"${boss.subtitle}"`,
        {
          fontFamily: 'Courier New',
          fontSize: '24px',
          color: '#ffdd00',
          fontStyle: 'bold',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 6
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(105);

    this.tweens.add({
      targets: warn,
      scale: 1.08,
      yoyo: true,
      repeat: 3,
      duration: 320,
      onComplete: () => warn.destroy()
    });
  }

  private showStageIntroBanner(theme: LevelTheme): void {
    const banner = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 - 40,
        `${theme.title}\n${theme.subtitle}`,
        {
          fontFamily: 'Courier New',
          fontSize: '26px',
          color: '#ffdf00',
          fontStyle: 'bold',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 6
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(110);

    this.tweens.add({
      targets: banner,
      alpha: 0,
      delay: 1900,
      duration: 600,
      onComplete: () => banner.destroy()
    });
  }

  private spawnFloatingText(
    x: number,
    y: number,
    text: string,
    color: string = '#ffff00'
  ): void {
    const t = this.add
      .text(x, y, text, {
        fontFamily: 'Courier New',
        fontSize: '15px',
        color,
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(90);

    this.tweens.add({
      targets: t,
      y: y - 35,
      alpha: 0,
      duration: 750,
      onComplete: () => t.destroy()
    });
  }

  private handleLevelVictory(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const clearBanner = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        `FASE ${this.levelNumber} CONCLUÍDA!\nMISSÃO CUMPRIDA!`,
        {
          fontFamily: 'Courier New',
          fontSize: '36px',
          color: '#00ff88',
          fontStyle: 'bold',
          align: 'center',
          stroke: '#000000',
          strokeThickness: 6
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(120);

    this.tweens.add({
      targets: clearBanner,
      scale: 1.1,
      yoyo: true,
      repeat: 2,
      duration: 350
    });

    this.time.delayedCall(2600, () => {
      if (this.levelNumber < 5) {
        const nextLevel = this.levelNumber + 1;
        ScoreManager.getInstance().setCurrentLevel(nextLevel);
        this.scene.restart({ level: nextLevel });
      } else {
        this.scene.start('VictoryScene');
      }
    });
  }
}
