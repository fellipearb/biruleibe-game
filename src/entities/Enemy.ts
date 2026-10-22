import Phaser from 'phaser';
import { Player } from './Player';
import { ProjectilePool } from './Projectile';

export type EnemyKind =
  | 'red_shirt'
  | 'police_car'
  | 'police_heli'
  | 'blonde_robot'
  | 'drone_jet'
  | 'popular_car'
  | 'occupier_militant'
  | 'datena_clone'
  | 'backup_dancer';

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  public hp: number = 30;
  public maxHp: number = 30;
  public scoreValue: number = 100;
  public contactDamage: number = 12;
  public kind: EnemyKind;

  protected player: Player;
  protected enemyProjectiles: ProjectilePool;
  protected actionCooldown: number = 0;
  protected hpBar: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    kind: EnemyKind,
    player: Player,
    enemyProjectiles: ProjectilePool
  ) {
    super(scene, x, y, texture);
    this.kind = kind;
    this.player = player;
    this.enemyProjectiles = enemyProjectiles;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(14);

    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(25);
  }

  public update(time: number, delta: number): void {
    if (!this.active) return;
    this.updateAI(time, delta);
    this.drawHealthBar();
  }

  protected abstract updateAI(time: number, delta: number): void;

  public takeDamage(amount: number): boolean {
    if (!this.active || this.hp <= 0) return false;
    this.hp -= amount;
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(65, () => {
      if (this.active) this.clearTint();
    });

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  protected drawHealthBar(): void {
    this.hpBar.clear();
    if (!this.active || this.hp >= this.maxHp || this.hp <= 0) return;

    const w = 30;
    const h = 4;
    const bx = this.x - w / 2;
    const by = this.y - this.displayHeight / 2 - 10;

    this.hpBar.fillStyle(0x000000, 0.75);
    this.hpBar.fillRect(bx - 1, by - 1, w + 2, h + 2);

    const ratio = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    this.hpBar.fillStyle(0xff3333, 1);
    this.hpBar.fillRect(bx, by, w * ratio, h);
  }

  protected die(): void {
    this.hpBar.clear();
    this.hpBar.destroy();
    // Small explosion particle flash
    const boom = this.scene.add.circle(this.x, this.y, 18, 0xffaa00, 0.9);
    boom.setDepth(30);
    this.scene.tweens.add({
      targets: boom,
      scale: 2.0,
      alpha: 0,
      duration: 220,
      onComplete: () => boom.destroy()
    });
    this.destroy();
  }

  public destroy(fromScene?: boolean): void {
    if (this.hpBar) {
      this.hpBar.clear();
      this.hpBar.destroy();
    }
    super.destroy(fromScene);
  }
}

/**
 * Fase 1: Figura de camiseta vermelha que patrulha e arremessa panfletos/projéteis leves
 */
export class RedShirtEnemy extends Enemy {
  private patrolDir: number = -1;
  private patrolTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool
  ) {
    super(scene, x, y, 'enemy_redshirt', 'red_shirt', player, enemyProjectiles);
    this.maxHp = 35;
    this.hp = 35;
    this.scoreValue = 120;
    this.actionCooldown = Phaser.Math.Between(700, 1500);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(26, 44);
    body.setCollideWorldBounds(true);
  }

  protected updateAI(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const distToPlayer = this.player.x - this.x;

    this.patrolTimer += delta;
    if (Math.abs(distToPlayer) < 280) {
      // Face player and keep moderate distance while throwing pamphlets
      this.setFlipX(distToPlayer < 0);
      if (Math.abs(distToPlayer) > 160) {
        body.setVelocityX(Math.sign(distToPlayer) * 75);
      } else {
        body.setVelocityX(0);
      }
    } else {
      if (this.patrolTimer > 1600) {
        this.patrolDir *= -1;
        this.patrolTimer = 0;
      }
      body.setVelocityX(this.patrolDir * 60);
      this.setFlipX(this.patrolDir < 0);
    }

    this.actionCooldown -= delta;
    if (this.actionCooldown <= 0 && Math.abs(distToPlayer) < 420) {
      this.actionCooldown = Phaser.Math.Between(1400, 2200);
      const dir = Math.sign(distToPlayer) || -1;
      this.enemyProjectiles.spawn({
        x: this.x + dir * 16,
        y: this.y - 8,
        vx: dir * 230,
        vy: -120,
        type: 'pamphlet',
        damage: 10,
        isPlayerOwned: false,
        useGravity: true,
        gravityY: -380
      });
    }
  }
}

/**
 * Fase 1: Viaturas e Helicópteros da Polícia (hazard/obstáculo com padrões de ataque periódicos)
 */
export class PoliceHazardEnemy extends Enemy {
  private isHeli: boolean;
  private hoverPhase: number = 0;
  private baseY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    isHeli: boolean,
    player: Player,
    enemyProjectiles: ProjectilePool
  ) {
    super(
      scene,
      x,
      y,
      isHeli ? 'enemy_police_heli' : 'enemy_police_car',
      isHeli ? 'police_heli' : 'police_car',
      player,
      enemyProjectiles
    );
    this.isHeli = isHeli;
    this.baseY = y;
    this.maxHp = isHeli ? 65 : 80;
    this.hp = this.maxHp;
    this.scoreValue = 250;
    this.contactDamage = 18;
    this.actionCooldown = 1200;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (isHeli) {
      body.setAllowGravity(false);
      body.setSize(68, 34);
    } else {
      body.setImmovable(true);
      body.setSize(74, 38);
    }
  }

  protected updateAI(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.isHeli) {
      this.hoverPhase += delta * 0.003;
      const targetX = this.player.x + Math.sin(this.hoverPhase) * 140;
      body.setVelocityX(Phaser.Math.Clamp((targetX - this.x) * 1.4, -130, 130));
      this.y = this.baseY + Math.sin(this.hoverPhase * 2) * 18;
      this.setFlipX(this.player.x < this.x);
    } else {
      // Police car advances slowly and stops as roadblock hazard
      const dist = this.player.x - this.x;
      if (Math.abs(dist) > 220) {
        body.setVelocityX(Math.sign(dist) * 55);
      } else {
        body.setVelocityX(0);
      }
      this.setFlipX(dist < 0);
    }

    // Periodic burst attack
    this.actionCooldown -= delta;
    if (this.actionCooldown <= 0) {
      this.actionCooldown = this.isHeli ? 1700 : 2000;
      const angle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.player.x,
        this.player.y
      );
      const speed = 280;
      this.enemyProjectiles.spawn({
        x: this.x,
        y: this.y + (this.isHeli ? 14 : -6),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: 'police_bullet',
        damage: 12,
        isPlayerOwned: false
      });
    }
  }
}

/**
 * Fase 1 Summon: Dançarino de apoio invocado pelo Trio Elétrico da Glória Groove
 */
export class BackupDancerEnemy extends Enemy {
  private jumpTimer: number = 600;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool
  ) {
    super(scene, x, y, 'enemy_dancer', 'backup_dancer', player, enemyProjectiles);
    this.maxHp = 25;
    this.hp = 25;
    this.scoreValue = 90;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 42);
    body.setCollideWorldBounds(true);
  }

  protected updateAI(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dir = Math.sign(this.player.x - this.x) || -1;
    body.setVelocityX(dir * 115);
    this.setFlipX(dir < 0);

    this.jumpTimer -= delta;
    if (this.jumpTimer <= 0 && body.blocked.down) {
      body.setVelocityY(-310);
      this.jumpTimer = Phaser.Math.Between(900, 1500);
    }
  }
}

/**
 * Fase 2: Robôs humanoides com perucas loiras que marcham rapidamente em direção ao player
 */
export class BlondeRobotEnemy extends Enemy {
  private marchSpeed: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool
  ) {
    super(scene, x, y, 'enemy_blonde_robot', 'blonde_robot', player, enemyProjectiles);
    this.maxHp = 42;
    this.hp = 42;
    this.scoreValue = 150;
    this.contactDamage = 15;
    this.marchSpeed = Phaser.Math.Between(135, 175);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(28, 46);
    body.setCollideWorldBounds(true);
  }

  protected updateAI(time: number, _delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dir = Math.sign(this.player.x - this.x) || -1;
    body.setVelocityX(dir * this.marchSpeed);
    this.setFlipX(dir < 0);

    // Robotic marching bobbing effect
    this.setAngle(Math.sin(time * 0.02) * 5);
  }
}

/**
 * Fase 2: Jatos e drones sobrevoando e realizando ataques rasantes verticais
 */
export class DroneJetEnemy extends Enemy {
  private stateMode: 'patrol' | 'diving' | 'recovering' = 'patrol';
  private baseAltitude: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool
  ) {
    super(scene, x, y, 'enemy_drone_jet', 'drone_jet', player, enemyProjectiles);
    this.baseAltitude = y;
    this.maxHp = 38;
    this.hp = 38;
    this.scoreValue = 180;
    this.contactDamage = 16;
    this.actionCooldown = Phaser.Math.Between(900, 1800);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(44, 24);
  }

  protected updateAI(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dx = this.player.x - this.x;

    if (this.stateMode === 'patrol') {
      body.setVelocityX(Math.sign(dx || -1) * 160);
      body.setVelocityY((this.baseAltitude - this.y) * 2);
      this.setFlipX(dx < 0);

      this.actionCooldown -= delta;
      if (Math.abs(dx) < 95 && this.actionCooldown <= 0) {
        // Trigger vertical swoop attack (ataque rasante vertical)
        this.stateMode = 'diving';
        body.setVelocityX(Math.sign(dx || -1) * 70);
        body.setVelocityY(320);
      }
    } else if (this.stateMode === 'diving') {
      if (this.y >= 390 || body.blocked.down) {
        this.stateMode = 'recovering';
        body.setVelocityY(-240);
        // Drop a projectile on pull-up
        this.enemyProjectiles.spawn({
          x: this.x,
          y: this.y,
          vx: 0,
          vy: 200,
          type: 'police_bullet',
          damage: 12,
          isPlayerOwned: false
        });
      }
    } else if (this.stateMode === 'recovering') {
      if (this.y <= this.baseAltitude + 10) {
        this.y = this.baseAltitude;
        body.setVelocityY(0);
        this.stateMode = 'patrol';
        this.actionCooldown = 1600;
      }
    }
  }
}

/**
 * Fase 3: Carros populares que avançam em disparada pela pista
 */
export class PopularCarEnemy extends Enemy {
  private dashDir: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool
  ) {
    super(scene, x, y, 'enemy_popular_car', 'popular_car', player, enemyProjectiles);
    this.maxHp = 55;
    this.hp = 55;
    this.scoreValue = 200;
    this.contactDamage = 20;
    this.dashDir = this.player.x < x ? -1 : 1;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(68, 34);
    body.setCollideWorldBounds(true);
    body.setBounce(1, 0);
  }

  protected updateAI(_time: number, _delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left) this.dashDir = 1;
    if (body.blocked.right) this.dashDir = -1;

    body.setVelocityX(this.dashDir * 255);
    this.setFlipX(this.dashDir < 0);
  }
}

/**
 * Fase 3: Militantes do movimento social saindo das portas/janelas dos edifícios abandonados
 */
export class OccupierMilitantEnemy extends Enemy {
  private emergingTimer: number = 450;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool
  ) {
    super(
      scene,
      x,
      y,
      'enemy_militant',
      'occupier_militant',
      player,
      enemyProjectiles
    );
    this.maxHp = 38;
    this.hp = 38;
    this.scoreValue = 140;
    this.actionCooldown = 900;

    // Spawn animation coming out of abandoned building window/door
    this.setScale(0.3);
    this.setAlpha(0.5);
    scene.tweens.add({
      targets: this,
      scale: 1,
      alpha: 1,
      duration: 400
    });

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(26, 44);
    body.setCollideWorldBounds(true);
  }

  protected updateAI(_time: number, delta: number): void {
    if (this.emergingTimer > 0) {
      this.emergingTimer -= delta;
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const dx = this.player.x - this.x;
    const dir = Math.sign(dx) || -1;
    this.setFlipX(dir < 0);

    if (Math.abs(dx) > 130) {
      body.setVelocityX(dir * 95);
    } else {
      body.setVelocityX(0);
    }

    this.actionCooldown -= delta;
    if (this.actionCooldown <= 0 && Math.abs(dx) < 380) {
      this.actionCooldown = Phaser.Math.Between(1300, 1900);
      this.enemyProjectiles.spawn({
        x: this.x + dir * 14,
        y: this.y - 6,
        vx: dir * 250,
        vy: -90,
        type: 'pamphlet',
        damage: 11,
        isPlayerOwned: false,
        useGravity: true,
        gravityY: -350
      });
    }
  }
}

/**
 * Fase 4: Clones do apresentador Datena patrulhando e atacando corpo a corpo com cassetetes/bastões
 */
export class DatenaCloneEnemy extends Enemy {
  private swingTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    player: Player,
    enemyProjectiles: ProjectilePool
  ) {
    super(
      scene,
      x,
      y,
      'enemy_datena_clone',
      'datena_clone',
      player,
      enemyProjectiles
    );
    this.maxHp = 50;
    this.hp = 50;
    this.scoreValue = 175;
    this.contactDamage = 18;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(28, 46);
    body.setCollideWorldBounds(true);
  }

  protected updateAI(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dx = this.player.x - this.x;
    const dir = Math.sign(dx) || -1;

    this.setFlipX(dir < 0);

    // Charge aggressively when close for melee baton attack
    const speed = Math.abs(dx) < 220 ? 155 : 95;
    body.setVelocityX(dir * speed);

    // Melee baton lunge animation when near player
    this.swingTimer -= delta;
    if (Math.abs(dx) < 55 && this.swingTimer <= 0) {
      this.swingTimer = 700;
      this.scene.tweens.add({
        targets: this,
        angle: dir * 25,
        yoyo: true,
        duration: 130
      });
    }
  }
}
