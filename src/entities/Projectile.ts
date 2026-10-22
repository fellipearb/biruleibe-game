import Phaser from 'phaser';

export type ProjectileType =
  | 'bullet'
  | 'ctps'
  | 'arminha_laser'
  | 'pamphlet'
  | 'police_bullet'
  | 'sonic_wave'
  | 'homing_mic'
  | 'mortadela_bomb'
  | 'chair_enemy'
  | 'chair_player';

export interface ProjectileConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: ProjectileType;
  damage: number;
  isPlayerOwned: boolean;
  piercing?: boolean;
  useGravity?: boolean;
  gravityY?: number;
  homingTarget?: Phaser.GameObjects.Components.Transform;
  homingStrength?: number;
  lifespan?: number;
  spinSpeed?: number;
  explosiveRadius?: number;
  catchable?: boolean;
}

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public projType: ProjectileType = 'bullet';
  public damage: number = 10;
  public isPlayerOwned: boolean = true;
  public piercing: boolean = false;
  public explosiveRadius: number = 0;
  public catchable: boolean = false;
  public hitTargets: Set<Phaser.GameObjects.GameObject> = new Set();

  private lifespanTimer: number = 0;
  private maxLifespan: number = 3000;
  private spinSpeed: number = 0;
  private homingTarget?: Phaser.GameObjects.Components.Transform;
  private homingStrength: number = 0;
  private waveTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'proj_bullet');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setActive(false);
    this.setVisible(false);
  }

  public fire(config: ProjectileConfig): void {
    this.projType = config.type;
    this.damage = config.damage;
    this.isPlayerOwned = config.isPlayerOwned;
    this.piercing = Boolean(config.piercing);
    this.explosiveRadius = config.explosiveRadius ?? 0;
    this.catchable = Boolean(config.catchable);
    this.homingTarget = config.homingTarget;
    this.homingStrength = config.homingStrength ?? 0;
    this.maxLifespan = config.lifespan ?? 3500;
    this.lifespanTimer = 0;
    this.waveTime = 0;
    this.hitTargets.clear();

    const textureMap: Record<ProjectileType, string> = {
      bullet: 'proj_bullet',
      ctps: 'proj_ctps',
      arminha_laser: 'proj_laser',
      pamphlet: 'proj_pamphlet',
      police_bullet: 'proj_police',
      sonic_wave: 'proj_sonic',
      homing_mic: 'proj_mic',
      mortadela_bomb: 'proj_mortadela',
      chair_enemy: 'proj_chair',
      chair_player: 'proj_chair_gold'
    };

    this.setTexture(textureMap[config.type] || 'proj_bullet');
    this.setPosition(config.x, config.y);
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(15);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.reset(config.x, config.y);
    body.setAllowGravity(Boolean(config.useGravity));
    body.setGravityY(config.gravityY ?? 0);
    body.setVelocity(config.vx, config.vy);

    // Calibrate hitbox per projectile type
    if (config.type === 'sonic_wave') {
      body.setSize(22, 26);
      this.spinSpeed = 0;
      this.setRotation(Math.atan2(config.vy, config.vx));
    } else if (config.type === 'chair_enemy' || config.type === 'chair_player') {
      body.setSize(22, 22);
      this.spinSpeed = config.spinSpeed ?? 10;
    } else if (config.type === 'mortadela_bomb') {
      body.setSize(18, 18);
      this.spinSpeed = config.spinSpeed ?? 8;
    } else if (config.type === 'ctps') {
      body.setSize(18, 14);
      this.spinSpeed = config.spinSpeed ?? 12;
    } else if (config.type === 'pamphlet') {
      body.setSize(12, 10);
      this.spinSpeed = 6;
    } else if (config.type === 'homing_mic') {
      body.setSize(14, 14);
      this.spinSpeed = 0;
      this.setRotation(Math.atan2(config.vy, config.vx));
    } else {
      body.setSize(12, 8);
      this.spinSpeed = 0;
      this.setRotation(Math.atan2(config.vy, config.vx));
    }
  }

  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.active) return;

    this.lifespanTimer += delta;
    if (this.lifespanTimer >= this.maxLifespan) {
      this.deactivate();
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;

    // Spin visual
    if (this.spinSpeed !== 0) {
      this.rotation += (this.spinSpeed * delta) / 1000;
    }

    // Sonic wave slight oscillation
    if (this.projType === 'sonic_wave') {
      this.waveTime += delta * 0.012;
      const scale = 1 + Math.sin(this.waveTime) * 0.2;
      this.setScale(scale);
    } else {
      this.setScale(1);
    }

    // Homing behavior (e.g. Erika Hilton's guided microphones)
    if (this.homingTarget && this.homingStrength > 0 && this.lifespanTimer < 2200) {
      const targetAngle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        this.homingTarget.x,
        this.homingTarget.y
      );
      const currentSpeed = Math.hypot(body.velocity.x, body.velocity.y) || 220;
      const currentAngle = Math.atan2(body.velocity.y, body.velocity.x);
      const newAngle = Phaser.Math.Angle.RotateTo(
        currentAngle,
        targetAngle,
        (this.homingStrength * delta) / 1000
      );
      body.setVelocity(
        Math.cos(newAngle) * currentSpeed,
        Math.sin(newAngle) * currentSpeed
      );
      this.setRotation(newAngle);
    }

    // Deactivate if far outside camera view
    const cam = this.scene.cameras.main;
    if (
      this.x < cam.scrollX - 180 ||
      this.x > cam.scrollX + cam.width + 180 ||
      this.y < -250 ||
      this.y > cam.height + 100
    ) {
      this.deactivate();
    }
  }

  public deactivate(): void {
    if (!this.active) return;
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.stop();
      body.enable = false;
    }
  }
}

export class ProjectilePool extends Phaser.Physics.Arcade.Group {
  constructor(scene: Phaser.Scene, maxSize: number = 120) {
    super(scene.physics.world, scene, {
      classType: Projectile,
      maxSize,
      runChildUpdate: true
    });
  }

  public spawn(config: ProjectileConfig): Projectile | null {
    const proj = this.getFirstDead(true, config.x, config.y) as Projectile | null;
    if (proj) {
      proj.fire(config);
    }
    return proj;
  }
}
