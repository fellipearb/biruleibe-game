import Phaser from 'phaser';
import { Player } from './Player';
import { ProjectilePool, ProjectileType } from './Projectile';
import { BackupDancerEnemy, Enemy } from './Enemy';

export abstract class Boss extends Phaser.Physics.Arcade.Sprite {
  public bossName: string;
  public subtitle: string;
  public hp: number;
  public maxHp: number;
  public scoreValue: number = 2500;
  public contactDamage: number = 22;
  public isDefeated: boolean = false;

  protected player: Player;
  protected enemyProjectiles: ProjectilePool;
  protected enemiesGroup: Phaser.Physics.Arcade.Group;
  protected attackTimer: number = 1200;
  protected secondaryTimer: number = 2500;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    bossName: string,
    subtitle: string,
    maxHp: number,
    player: Player,
    enemyProjectiles: ProjectilePool,
    enemiesGroup: Phaser.Physics.Arcade.Group
  ) {
    super(scene, x, y, texture);
    this.bossName = bossName;
    this.subtitle = subtitle;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.player = player;
    this.enemyProjectiles = enemyProjectiles;
    this.enemiesGroup = enemiesGroup;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(18);
    this.setCollideWorldBounds(true);
  }

  public update(time: number, delta: number): void {
    if (!this.active || this.isDefeated) return;
    this.updateBossBehavior(time, delta);
  }

  protected abstract updateBossBehavior(time: number, delta: number): void;

  public takeDamage(amount: number): boolean {
    if (!this.active || this.isDefeated) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.active && !this.isDefeated) this.clearTint();
    });

    if (this.hp <= 0) {
      this.isDefeated = true;
      this.playDefeatSequence();
      return true;
    }
    return false;
  }

  protected playDefeatSequence(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.stop();
      body.enable = false;
    }

    // Multiple Metal-Slug style dramatic explosions
    for (let i = 0; i < 8; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        if (!this.scene) return;
        const ox = this.x + Phaser.Math.Between(-50, 50);
        const oy = this.y + Phaser.Math.Between(-40, 40);
        const exp = this.scene.add.circle(ox, oy, 26, 0xff5500, 0.95);
        exp.setDepth(35);
        this.scene.tweens.add({
          targets: exp,
          scale: 2.4,
          alpha: 0,
          duration: 300,
          onComplete: () => exp.destroy()
        });
      });
    }

    this.scene.time.delayedCall(1250, () => {
      this.destroy();
    });
  }
}

/**
 * FASE 1 BOSS: Trio Elétrico da Glória Groove
 * Padrão de ataque: Lança ondas de choque musicais (arcos de som sonoro) e invoca dançarinos de apoio.
 */
export class GloriaGrooveBoss extends Boss {
  private moveDir: number = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool,
    enemiesGroup: Phaser.Physics.Arcade.Group
  ) {
    super(
      scene,
      x,
      y,
      'boss_gloria_trio',
      'TRIO ELÉTRICO DA GLÓRIA GROOVE',
      'Soberana do Paredão Sonoro',
      450,
      player,
      enemyProjectiles,
      enemiesGroup
    );
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(128, 86);
    body.setImmovable(true);
  }

  protected updateBossBehavior(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const cam = this.scene.cameras.main;
    const minX = cam.scrollX + 420;
    const maxX = cam.scrollX + cam.width - 90;

    if (this.x <= minX) this.moveDir = 1;
    if (this.x >= maxX) this.moveDir = -1;
    body.setVelocityX(this.moveDir * 65);

    // Musical shockwave arc attack
    this.attackTimer -= delta;
    if (this.attackTimer <= 0) {
      this.attackTimer = 1550;
      const baseAngle = Phaser.Math.Angle.Between(
        this.x - 40,
        this.y - 10,
        this.player.x,
        this.player.y
      );
      const spreadAngles = [-0.28, 0, 0.28];
      for (const offset of spreadAngles) {
        const ang = baseAngle + offset;
        this.enemyProjectiles.spawn({
          x: this.x - 45,
          y: this.y - 12,
          vx: Math.cos(ang) * 260,
          vy: Math.sin(ang) * 260,
          type: 'sonic_wave',
          damage: 14,
          isPlayerOwned: false,
          lifespan: 3200
        });
      }
    }

    // Summon backup dancers
    this.secondaryTimer -= delta;
    if (this.secondaryTimer <= 0) {
      this.secondaryTimer = 4200;
      if (this.enemiesGroup.countActive(true) < 4) {
        const dancer: Enemy = new BackupDancerEnemy(
          this.scene,
          this.x - 65,
          this.y + 10,
          this.player,
          this.enemyProjectiles
        );
        this.enemiesGroup.add(dancer);
      }
    }
  }
}

/**
 * FASE 2 BOSS: Jato Executivo da Erika Hilton
 * Padrão de ataque: Voo rasante, metralhadoras em leque e lançamento de microfones tele-guiados.
 */
export class ErikaHiltonJetBoss extends Boss {
  private flightPhase: number = 0;
  private swoopTimer: number = 4800;
  private isSwooping: boolean = false;
  private swoopDir: number = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool,
    enemiesGroup: Phaser.Physics.Arcade.Group
  ) {
    super(
      scene,
      x,
      y,
      'boss_erika_jet',
      'JATO EXECUTIVO DA ERIKA HILTON',
      'Esquadrilha Fashionista Supersônica',
      520,
      player,
      enemyProjectiles,
      enemiesGroup
    );
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(118, 52);
  }

  protected updateBossBehavior(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const cam = this.scene.cameras.main;

    this.swoopTimer -= delta;
    if (!this.isSwooping && this.swoopTimer <= 0) {
      this.isSwooping = true;
      this.swoopDir = this.x > this.player.x ? -1 : 1;
      this.swoopTimer = 5000;
    }

    if (this.isSwooping) {
      // Voo rasante (low-altitude high speed pass)
      const targetY = 330;
      body.setVelocityX(this.swoopDir * 340);
      body.setVelocityY((targetY - this.y) * 4);
      this.setFlipX(this.swoopDir < 0);

      if (
        (this.swoopDir < 0 && this.x < cam.scrollX + 110) ||
        (this.swoopDir > 0 && this.x > cam.scrollX + cam.width - 110)
      ) {
        this.isSwooping = false;
      }
    } else {
      // Hovering in air across the arena
      this.flightPhase += delta * 0.0022;
      const centerX = cam.scrollX + cam.width * 0.65;
      const desiredX = centerX + Math.sin(this.flightPhase) * 190;
      const desiredY = 135 + Math.cos(this.flightPhase * 2) * 35;

      body.setVelocityX((desiredX - this.x) * 3);
      body.setVelocityY((desiredY - this.y) * 3);
      this.setFlipX(this.player.x < this.x);
    }

    // Metralhadoras em leque (Fan machine-gun spread)
    this.attackTimer -= delta;
    if (this.attackTimer <= 0) {
      this.attackTimer = 1700;
      const baseAngle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.player.x,
        this.player.y
      );
      const fanAngles = [-0.45, -0.22, 0, 0.22, 0.45];
      for (const offset of fanAngles) {
        const a = baseAngle + offset;
        this.enemyProjectiles.spawn({
          x: this.x,
          y: this.y + 18,
          vx: Math.cos(a) * 290,
          vy: Math.sin(a) * 290,
          type: 'police_bullet',
          damage: 11,
          isPlayerOwned: false
        });
      }
    }

    // Microfones tele-guiados (Homing microphones)
    this.secondaryTimer -= delta;
    if (this.secondaryTimer <= 0) {
      this.secondaryTimer = 3100;
      this.enemyProjectiles.spawn({
        x: this.x,
        y: this.y + 20,
        vx: this.player.x < this.x ? -180 : 180,
        vy: -90,
        type: 'homing_mic',
        damage: 15,
        isPlayerOwned: false,
        homingTarget: this.player,
        homingStrength: 2.2,
        lifespan: 3400
      });
    }
  }
}

/**
 * FASE 3 BOSS: Boulos
 * Padrão de ataque: Pulos altos (ground pound) e arremesso parabólico de "Pão com Mortadela" explosivo.
 */
export class BoulosBoss extends Boss {
  private wasInAir: boolean = false;
  private jumpCooldown: number = 2200;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool,
    enemiesGroup: Phaser.Physics.Arcade.Group
  ) {
    super(
      scene,
      x,
      y,
      'boss_boulos',
      'COMANDANTE BOULOS',
      'O Demolidor de Imóveis Ociosos',
      580,
      player,
      enemyProjectiles,
      enemiesGroup
    );
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(52, 68);
  }

  protected updateBossBehavior(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    const dx = this.player.x - this.x;
    this.setFlipX(dx < 0);

    // Detect Ground Pound landing!
    if (this.wasInAir && onGround) {
      this.wasInAir = false;
      this.scene.cameras.main.shake(220, 0.012);
      // Spawn horizontal ground-pound shockwaves left & right
      for (const dir of [-1, 1]) {
        this.enemyProjectiles.spawn({
          x: this.x + dir * 24,
          y: this.y + 20,
          vx: dir * 320,
          vy: 0,
          type: 'sonic_wave',
          damage: 16,
          isPlayerOwned: false,
          lifespan: 1800
        });
      }
    }

    if (!onGround) {
      this.wasInAir = true;
    } else {
      // Move toward player moderately
      if (Math.abs(dx) > 120) {
        body.setVelocityX(Math.sign(dx) * 110);
      } else {
        body.setVelocityX(0);
      }
    }

    // High Jump Ground Pound
    this.jumpCooldown -= delta;
    if (this.jumpCooldown <= 0 && onGround) {
      this.jumpCooldown = 2800;
      body.setVelocityY(-540);
      body.setVelocityX(Phaser.Math.Clamp(dx * 1.1, -260, 260));
    }

    // Parabolic Explosive "Pão com Mortadela" throw
    this.attackTimer -= delta;
    if (this.attackTimer <= 0) {
      this.attackTimer = 1450;
      const dir = Math.sign(dx) || -1;
      for (let i = 0; i < 2; i++) {
        this.enemyProjectiles.spawn({
          x: this.x + dir * 20,
          y: this.y - 18,
          vx: dir * Phaser.Math.Between(170, 310),
          vy: Phaser.Math.Between(-380, -260),
          type: 'mortadela_bomb',
          damage: 18,
          isPlayerOwned: false,
          useGravity: true,
          gravityY: 0,
          explosiveRadius: 65,
          spinSpeed: 10
        });
      }
    }
  }
}

/**
 * FASE 4 BOSS: Datena Supremo
 * Padrão de ataque: Lança cadeiras em linha reta e em arcos parabólicos.
 * Mecânica especial: O jogador pode pegar e atirar cadeiras de volta para rebater projéteis.
 */
export class DatenaSupremoBoss extends Boss {
  private paceDir: number = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool,
    enemiesGroup: Phaser.Physics.Arcade.Group
  ) {
    super(
      scene,
      x,
      y,
      'boss_datena',
      'DATENA SUPREMO',
      'Mestre das Cadeiradas Ao Vivo ("Bota na Tela!")',
      620,
      player,
      enemyProjectiles,
      enemiesGroup
    );
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(54, 70);
  }

  protected updateBossBehavior(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const cam = this.scene.cameras.main;
    const minX = cam.scrollX + 360;
    const maxX = cam.scrollX + cam.width - 70;

    if (this.x <= minX) this.paceDir = 1;
    if (this.x >= maxX) this.paceDir = -1;

    body.setVelocityX(this.paceDir * 95);
    this.setFlipX(this.player.x < this.x);

    // Straight-line fast chair throw
    this.attackTimer -= delta;
    if (this.attackTimer <= 0) {
      this.attackTimer = 1400;
      const dir = this.player.x < this.x ? -1 : 1;
      this.enemyProjectiles.spawn({
        x: this.x + dir * 26,
        y: this.y - 6,
        vx: dir * 320,
        vy: 0,
        type: 'chair_enemy',
        damage: 16,
        isPlayerOwned: false,
        catchable: true,
        spinSpeed: 12,
        lifespan: 3500
      });
    }

    // Parabolic arc chair volley
    this.secondaryTimer -= delta;
    if (this.secondaryTimer <= 0) {
      this.secondaryTimer = 2400;
      const dir = this.player.x < this.x ? -1 : 1;
      const speeds = [200, 310];
      for (const vxMag of speeds) {
        this.enemyProjectiles.spawn({
          x: this.x + dir * 20,
          y: this.y - 24,
          vx: dir * vxMag,
          vy: -380,
          type: 'chair_enemy',
          damage: 16,
          isPlayerOwned: false,
          useGravity: true,
          gravityY: 0,
          catchable: true,
          spinSpeed: 10,
          lifespan: 3800
        });
      }
    }
  }
}

/**
 * FASE 5 FINAL BOSS: Lula (dentro de uma cúpula/canhão gigante de energia)
 * Padrão de ataque: Canhão rotativo disparando projéteis mistos combinados de todas as fases anteriores
 * (cadeiras voadoras, pães com mortadela, carteiras de trabalho e notas musicais).
 * Três fases de vida com aumento progressivo de velocidade e densidade de balas (bullet-hell leve).
 */
export class LulaFinalBoss extends Boss {
  private cannonAngle: number = Math.PI;
  private turretGraphic: Phaser.GameObjects.Sprite;
  private domeShieldGraphic: Phaser.GameObjects.Arc;
  private currentPhase: 1 | 2 | 3 = 1;
  private hoverClock: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool,
    enemiesGroup: Phaser.Physics.Arcade.Group
  ) {
    super(
      scene,
      x,
      y,
      'boss_lula_dome',
      'MECHA-LULA: CÚPULA DA POLARIZAÇÃO',
      'Fase 1/3: O Canhão do Amor & Imposto',
      900,
      player,
      enemyProjectiles,
      enemiesGroup
    );
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(110, 110);

    // Energy dome aura
    this.domeShieldGraphic = scene.add.circle(x, y, 68, 0xff0033, 0.18);
    this.domeShieldGraphic.setStrokeStyle(3, 0xffdd00, 0.85);
    this.domeShieldGraphic.setDepth(17);

    // Rotating cannon barrel
    this.turretGraphic = scene.add.sprite(x, y, 'boss_lula_cannon');
    this.turretGraphic.setDepth(19);
  }

  protected updateBossBehavior(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const cam = this.scene.cameras.main;

    // Determine Boss Phase (1, 2, or 3) based on HP ratio
    const hpRatio = this.hp / this.maxHp;
    if (hpRatio <= 0.33 && this.currentPhase !== 3) {
      this.currentPhase = 3;
      this.subtitle = 'Fase 3/3: BULLET-HELL SOBERANO MÁXIMO!';
      this.domeShieldGraphic.setFillStyle(0xff00ff, 0.28);
      this.scene.cameras.main.shake(300, 0.015);
    } else if (hpRatio <= 0.66 && hpRatio > 0.33 && this.currentPhase === 1) {
      this.currentPhase = 2;
      this.subtitle = 'Fase 2/3: Sobrecarga Tributária Rotativa!';
      this.domeShieldGraphic.setFillStyle(0xff5500, 0.24);
      this.scene.cameras.main.shake(200, 0.01);
    }

    // Hover movement inside arena
    const speedMult = this.currentPhase === 3 ? 1.8 : this.currentPhase === 2 ? 1.35 : 1.0;
    this.hoverClock += (delta * 0.002) * speedMult;

    const arenaRight = cam.scrollX + cam.width - 130;
    const targetX = arenaRight + Math.sin(this.hoverClock) * 75;
    const targetY = 235 + Math.cos(this.hoverClock * 1.6) * 85;

    body.setVelocityX((targetX - this.x) * 3);
    body.setVelocityY((targetY - this.y) * 3);

    // Update dome and rotating cannon position/angle
    this.domeShieldGraphic.setPosition(this.x, this.y);
    const angleToPlayer = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.player.x,
      this.player.y
    );
    this.cannonAngle = Phaser.Math.Angle.RotateTo(
      this.cannonAngle,
      angleToPlayer,
      (delta / 1000) * (1.8 * speedMult)
    );
    this.turretGraphic.setPosition(this.x, this.y);
    this.turretGraphic.setRotation(this.cannonAngle);

    // Mixed Projectile Barrage (Chairs, Mortadela Bread, CTPS, Musical Notes)
    this.attackTimer -= delta;
    const fireInterval =
      this.currentPhase === 3 ? 650 : this.currentPhase === 2 ? 980 : 1350;

    if (this.attackTimer <= 0) {
      this.attackTimer = fireInterval;
      this.fireMixedBarrage();
    }
  }

  private fireMixedBarrage(): void {
    const mixedTypes: ProjectileType[] = [
      'chair_enemy',
      'mortadela_bomb',
      'ctps',
      'sonic_wave'
    ];

    // Number of projectiles per burst scales with phase (light bullet-hell)
    const count = this.currentPhase === 3 ? 5 : this.currentPhase === 2 ? 3 : 2;
    const spreadStep = this.currentPhase === 3 ? 0.24 : 0.28;
    const bulletSpeed =
      this.currentPhase === 3 ? 310 : this.currentPhase === 2 ? 265 : 225;

    const startOffset = -((count - 1) / 2) * spreadStep;
    for (let i = 0; i < count; i++) {
      const angle = this.cannonAngle + startOffset + i * spreadStep;
      const chosenType =
        mixedTypes[(i + Phaser.Math.Between(0, mixedTypes.length - 1)) % mixedTypes.length];

      this.enemyProjectiles.spawn({
        x: this.x + Math.cos(angle) * 48,
        y: this.y + Math.sin(angle) * 48,
        vx: Math.cos(angle) * bulletSpeed,
        vy: Math.sin(angle) * bulletSpeed,
        type: chosenType,
        damage: 14,
        isPlayerOwned: false,
        catchable: chosenType === 'chair_enemy',
        explosiveRadius: chosenType === 'mortadela_bomb' ? 50 : 0,
        spinSpeed: chosenType === 'sonic_wave' ? 0 : 9,
        lifespan: 3600
      });
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.turretGraphic) this.turretGraphic.destroy();
    if (this.domeShieldGraphic) this.domeShieldGraphic.destroy();
    super.destroy(fromScene);
  }
}
