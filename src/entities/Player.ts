import Phaser from 'phaser';
import { ProjectilePool, ProjectileType } from './Projectile';
import { ScoreManager } from '../managers/ScoreManager';

export interface PlayerKeys {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  jumpAlt: Phaser.Input.Keyboard.Key;
  fire: Phaser.Input.Keyboard.Key;
  fireAlt: Phaser.Input.Keyboard.Key;
  special: Phaser.Input.Keyboard.Key;
  specialAlt: Phaser.Input.Keyboard.Key;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  public maxHp: number = 100;
  public hp: number = 100;
  public isCrouching: boolean = false;
  public facingRight: boolean = true;
  public aimAngle: number = 0; // Radians (8-directional)
  public aimDirName: string = '→';
  public levelNumber: number = 1;
  public isBolsonaroMode: boolean = false;

  private keys!: PlayerKeys;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private projectilePool: ProjectilePool;
  private fireCooldown: number = 0;
  private fireRateMs: number = 150;
  private invulnerableUntil: number = 0;
  private speed: number = 220;
  private jumpVelocity: number = -470;

  // Visual overlays for gun / "arminha com a mão" / held chair
  private armGraphic: Phaser.GameObjects.Sprite;
  private chairIcon: Phaser.GameObjects.Sprite;
  private muzzleFlashTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    projectilePool: ProjectilePool,
    levelNumber: number
  ) {
    const isBolsonaro = levelNumber === 5;
    super(scene, x, y, isBolsonaro ? 'player_bolsonaro' : 'player_soldier');

    this.levelNumber = levelNumber;
    this.isBolsonaroMode = isBolsonaro;
    this.projectilePool = projectilePool;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(20);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(26, 46);
    body.setOffset(5, 2);

    // Arm / weapon visual attachment
    this.armGraphic = scene.add.sprite(
      x,
      y,
      isBolsonaro ? 'weapon_arminha' : 'weapon_rifle'
    );
    this.armGraphic.setDepth(21);

    // Held chair indicator for Phase 4
    this.chairIcon = scene.add.sprite(x, y - 38, 'proj_chair_gold');
    this.chairIcon.setDepth(22);
    this.chairIcon.setVisible(false);
    this.chairIcon.setScale(0.85);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.keys = {
        left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        jumpAlt: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
        fire: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
        fireAlt: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
        special: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        specialAlt: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C)
      };
    }

    if (this.levelNumber === 3) {
      // Carteira de Trabalho has slightly slower cadence but pierces & deals high damage
      this.fireRateMs = 230;
    } else if (this.isBolsonaroMode) {
      // Arminha laser rapid fire
      this.fireRateMs = 135;
    } else {
      this.fireRateMs = 150;
    }
  }

  public update(time: number, delta: number): void {
    if (!this.active || this.hp <= 0) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;

    const moveLeft = this.cursors.left.isDown || this.keys.left.isDown;
    const moveRight = this.cursors.right.isDown || this.keys.right.isDown;
    const aimUp = this.cursors.up.isDown || this.keys.up.isDown;
    const aimDown = this.cursors.down.isDown || this.keys.down.isDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
      Phaser.Input.Keyboard.JustDown(this.keys.jumpAlt);
    const isFiring =
      this.keys.fire.isDown ||
      this.keys.fireAlt.isDown ||
      this.scene.input.activePointer.isDown;

    // Facing direction update
    if (moveLeft && !moveRight) {
      this.facingRight = false;
      this.setFlipX(true);
    } else if (moveRight && !moveLeft) {
      this.facingRight = true;
      this.setFlipX(false);
    }

    // Crouch logic (when on ground and holding down without moving fast, or slower crouch walk)
    if (onGround && aimDown) {
      if (!this.isCrouching) {
        this.isCrouching = true;
        body.setSize(26, 30);
        body.setOffset(5, 18);
        this.setScale(1, 0.72);
      }
    } else if (this.isCrouching) {
      this.isCrouching = false;
      body.setSize(26, 46);
      body.setOffset(5, 2);
      this.setScale(1, 1);
    }

    // Horizontal movement
    const effectiveSpeed = this.isCrouching ? this.speed * 0.45 : this.speed;
    if (moveLeft && !moveRight) {
      body.setVelocityX(-effectiveSpeed);
    } else if (moveRight && !moveLeft) {
      body.setVelocityX(effectiveSpeed);
    } else {
      body.setVelocityX(0);
    }

    // Jump
    if (jumpPressed && onGround) {
      if (this.isCrouching) {
        this.isCrouching = false;
        body.setSize(26, 46);
        body.setOffset(5, 2);
        this.setScale(1, 1);
      }
      body.setVelocityY(this.jumpVelocity);
    }

    // Compute 8-direction aim angle
    this.compute8DirectionAim(moveLeft, moveRight, aimUp, aimDown, onGround);

    // Update weapon / "arminha" overlay position and rotation
    this.updateWeaponVisual(delta);

    // Continuous firing with cadence cooldown
    this.fireCooldown = Math.max(0, this.fireCooldown - delta);
    if (isFiring && this.fireCooldown <= 0) {
      this.shootProjectile();
      this.fireCooldown = this.fireRateMs;
    }

    // Update held chair indicator
    const chairsHeld = ScoreManager.getInstance().getChairAmmo();
    this.chairIcon.setVisible(chairsHeld > 0);
    if (chairsHeld > 0) {
      this.chairIcon.setPosition(this.x, this.y - 36);
    }

    // Invulnerability blink effect
    if (time < this.invulnerableUntil) {
      this.setAlpha(Math.floor(time / 60) % 2 === 0 ? 0.4 : 1);
    } else {
      this.setAlpha(1);
    }
  }

  private compute8DirectionAim(
    left: boolean,
    right: boolean,
    up: boolean,
    down: boolean,
    onGround: boolean
  ): void {
    let dx = 0;
    let dy = 0;

    if (left) dx = -1;
    else if (right) dx = 1;

    if (up) dy = -1;
    else if (down && !onGround) {
      // Downward aiming in mid-air (classic Metal Slug downward/diagonal-down shot)
      dy = 1;
    } else if (down && onGround && (left || right)) {
      // Diagonal down-forward while crouch-moving or aiming
      dy = 0.35;
    }

    // If neither left/right nor up/down is held, aim horizontally in facing direction
    if (dx === 0 && dy === 0) {
      dx = this.facingRight ? 1 : -1;
    }

    this.aimAngle = Math.atan2(dy, dx);

    // Human-readable 8-direction label for HUD
    const deg = Math.round(Phaser.Math.RadToDeg(this.aimAngle));
    if (deg === 0) this.aimDirName = '→';
    else if (deg === 180 || deg === -180) this.aimDirName = '←';
    else if (deg === -90) this.aimDirName = '↑';
    else if (deg === 90) this.aimDirName = '↓';
    else if (deg < 0 && deg > -90) this.aimDirName = '↗';
    else if (deg < -90) this.aimDirName = '↖';
    else if (deg > 0 && deg < 90) this.aimDirName = '↘';
    else this.aimDirName = '↙';
  }

  private updateWeaponVisual(delta: number): void {
    const offsetY = this.isCrouching ? 6 : -2;
    const recoilOffset = this.muzzleFlashTimer > 0 ? -4 : 2;
    this.muzzleFlashTimer = Math.max(0, this.muzzleFlashTimer - delta);

    const armX = this.x + Math.cos(this.aimAngle) * (12 + recoilOffset);
    const armY = this.y + offsetY + Math.sin(this.aimAngle) * (12 + recoilOffset);

    this.armGraphic.setPosition(armX, armY);
    this.armGraphic.setRotation(this.aimAngle);
    this.armGraphic.setFlipY(Math.abs(this.aimAngle) > Math.PI / 2);

    if (this.isBolsonaroMode) {
      // Pulse scale slightly when shooting "arminha com a mão"
      const scale = this.muzzleFlashTimer > 0 ? 1.35 : 1.0;
      this.armGraphic.setScale(scale);
    }
  }

  private shootProjectile(): void {
    this.muzzleFlashTimer = 70;
    const spawnDist = 22;
    const spawnX = this.x + Math.cos(this.aimAngle) * spawnDist;
    const spawnY =
      this.y + (this.isCrouching ? 6 : -2) + Math.sin(this.aimAngle) * spawnDist;

    let projType: ProjectileType = 'bullet';
    let speed = 560;
    let damage = 14;
    let piercing = false;

    if (this.levelNumber === 3) {
      projType = 'ctps';
      speed = 460;
      damage = 24;
      piercing = true;
    } else if (this.isBolsonaroMode) {
      projType = 'arminha_laser';
      speed = 640;
      damage = 18;
    }

    this.projectilePool.spawn({
      x: spawnX,
      y: spawnY,
      vx: Math.cos(this.aimAngle) * speed,
      vy: Math.sin(this.aimAngle) * speed,
      type: projType,
      damage,
      isPlayerOwned: true,
      piercing,
      lifespan: 2000
    });
  }

  public isSpecialJustPressed(): boolean {
    return (
      Phaser.Input.Keyboard.JustDown(this.keys.special) ||
      Phaser.Input.Keyboard.JustDown(this.keys.specialAlt)
    );
  }

  public throwCaughtChair(): boolean {
    if (!ScoreManager.getInstance().consumeChairAmmo()) {
      return false;
    }

    const speed = 520;
    this.projectilePool.spawn({
      x: this.x + Math.cos(this.aimAngle) * 24,
      y: this.y - 6 + Math.sin(this.aimAngle) * 24,
      vx: Math.cos(this.aimAngle) * speed,
      vy: Math.sin(this.aimAngle) * speed - 60,
      type: 'chair_player',
      damage: 65,
      isPlayerOwned: true,
      piercing: true,
      spinSpeed: 16,
      lifespan: 2800
    });
    return true;
  }

  public takeDamage(amount: number, time: number): boolean {
    if (time < this.invulnerableUntil || this.hp <= 0) {
      return false;
    }
    this.hp = Math.max(0, this.hp - amount);
    this.invulnerableUntil = time + 950;

    // Flash tint
    this.setTintFill(0xff3333);
    this.scene.time.delayedCall(120, () => {
      if (this.active) this.clearTint();
    });

    return true;
  }

  public heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  public destroy(fromScene?: boolean): void {
    if (this.armGraphic) this.armGraphic.destroy();
    if (this.chairIcon) this.chairIcon.destroy();
    super.destroy(fromScene);
  }
}
