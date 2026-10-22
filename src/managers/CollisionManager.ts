import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Projectile, ProjectilePool } from '../entities/Projectile';
import { ScoreManager } from './ScoreManager';

export class CollisionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private enemiesGroup: Phaser.Physics.Arcade.Group;
  private playerProjectiles: ProjectilePool;
  private enemyProjectiles: ProjectilePool;
  private getBoss: () => Boss | null;
  private onFloatingText: (x: number, y: number, text: string, color?: string) => void;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    platforms: Phaser.Physics.Arcade.StaticGroup,
    enemiesGroup: Phaser.Physics.Arcade.Group,
    playerProjectiles: ProjectilePool,
    enemyProjectiles: ProjectilePool,
    getBoss: () => Boss | null,
    onFloatingText: (x: number, y: number, text: string, color?: string) => void
  ) {
    this.scene = scene;
    this.player = player;
    this.platforms = platforms;
    this.enemiesGroup = enemiesGroup;
    this.playerProjectiles = playerProjectiles;
    this.enemyProjectiles = enemyProjectiles;
    this.getBoss = getBoss;
    this.onFloatingText = onFloatingText;

    this.setupColliders();
  }

  private setupColliders(): void {
    const physics = this.scene.physics;

    // Solid world collisions
    physics.add.collider(this.player, this.platforms);
    physics.add.collider(this.enemiesGroup, this.platforms);

    // Enemy parabolic projectiles (e.g. Mortadela bomb) hitting ground
    physics.add.collider(
      this.enemyProjectiles,
      this.platforms,
      (obj1) => {
        const proj = obj1 as Projectile;
        if (!proj.active) return;
        if (proj.projType === 'mortadela_bomb') {
          this.triggerMortadelaExplosion(proj.x, proj.y, proj.explosiveRadius || 60, proj.damage);
        }
        proj.deactivate();
      }
    );

    // Player projectiles hitting Enemies
    physics.add.overlap(
      this.playerProjectiles,
      this.enemiesGroup,
      (projObj, enemyObj) => {
        const proj = projObj as Projectile;
        const enemy = enemyObj as Enemy;
        if (!proj.active || !enemy.active) return;

        if (proj.hitTargets.has(enemy)) return;
        proj.hitTargets.add(enemy);

        const killed = enemy.takeDamage(proj.damage);
        if (killed) {
          ScoreManager.getInstance().addScore(enemy.scoreValue);
          this.onFloatingText(enemy.x, enemy.y - 20, `+${enemy.scoreValue}`, '#ffff00');
        }

        if (!proj.piercing) {
          proj.deactivate();
        }
      }
    );

    // Player projectiles vs Enemy projectiles (Chair deflection & catching!)
    physics.add.overlap(
      this.playerProjectiles,
      this.enemyProjectiles,
      (pProjObj, eProjObj) => {
        const pProj = pProjObj as Projectile;
        const eProj = eProjObj as Projectile;
        if (!pProj.active || !eProj.active) return;

        // Thrown player chair smashes through any enemy projectiles!
        if (pProj.projType === 'chair_player') {
          eProj.deactivate();
          this.onFloatingText(eProj.x, eProj.y, 'REBATIDO!', '#00ffcc');
          return;
        }

        // Shooting an enemy chair lets you capture it to throw back with [E]/[C]!
        if (eProj.catchable && eProj.projType === 'chair_enemy') {
          eProj.deactivate();
          if (!pProj.piercing) pProj.deactivate();
          ScoreManager.getInstance().addChairAmmo(1);
          this.onFloatingText(
            this.player.x,
            this.player.y - 45,
            'CADEIRA PEGA! [E/C]',
            '#ffd700'
          );
        }
      }
    );

    // Enemy projectiles hitting Player
    physics.add.overlap(
      this.player,
      this.enemyProjectiles,
      (playerObj, projObj) => {
        const player = playerObj as Player;
        const proj = projObj as Projectile;
        if (!player.active || !proj.active) return;

        if (proj.projType === 'mortadela_bomb') {
          this.triggerMortadelaExplosion(proj.x, proj.y, proj.explosiveRadius || 60, proj.damage);
          proj.deactivate();
          return;
        }

        player.takeDamage(proj.damage, this.scene.time.now);
        proj.deactivate();
      }
    );

    // Enemies contact damage with Player
    physics.add.overlap(
      this.player,
      this.enemiesGroup,
      (playerObj, enemyObj) => {
        const player = playerObj as Player;
        const enemy = enemyObj as Enemy;
        if (!player.active || !enemy.active) return;

        player.takeDamage(enemy.contactDamage, this.scene.time.now);
      }
    );
  }

  public update(): void {
    const boss = this.getBoss();

    // Check active boss collisions dynamically
    if (boss && boss.active && !boss.isDefeated) {
      this.scene.physics.collide(boss, this.platforms);

      // Player projectiles hitting Boss
      this.scene.physics.overlap(
        this.playerProjectiles,
        boss,
        (bossOrProj1, bossOrProj2) => {
          const proj = (
            bossOrProj1 instanceof Projectile ? bossOrProj1 : bossOrProj2
          ) as Projectile;
          if (!proj || !proj.active || boss.isDefeated) return;

          if (proj.hitTargets.has(boss)) return;
          proj.hitTargets.add(boss);

          const defeated = boss.takeDamage(proj.damage);
          if (proj.projType === 'chair_player') {
            this.onFloatingText(boss.x, boss.y - 40, 'CADEIRADA CRÍTICA! -65', '#ffdd00');
            this.scene.cameras.main.shake(160, 0.01);
          }

          if (defeated) {
            ScoreManager.getInstance().addScore(boss.scoreValue);
            this.onFloatingText(
              boss.x,
              boss.y - 30,
              `CHEFE DERROTADO! +${boss.scoreValue}`,
              '#00ff88'
            );
          }

          if (!proj.piercing) {
            proj.deactivate();
          }
        }
      );

      // Boss contact damage with Player
      this.scene.physics.overlap(this.player, boss, () => {
        if (this.player.active && !boss.isDefeated) {
          this.player.takeDamage(boss.contactDamage, this.scene.time.now);
        }
      });
    }

    // Handle Player [E] / [C] Special Key: Catch nearby flying chair OR throw held chair!
    if (this.player.active && this.player.isSpecialJustPressed()) {
      let caughtNearChair = false;
      const children = this.enemyProjectiles.getChildren() as Projectile[];

      for (const proj of children) {
        if (
          proj.active &&
          proj.catchable &&
          Phaser.Math.Distance.Between(this.player.x, this.player.y, proj.x, proj.y) <= 115
        ) {
          proj.deactivate();
          ScoreManager.getInstance().addChairAmmo(1);
          caughtNearChair = true;
          this.onFloatingText(
            this.player.x,
            this.player.y - 42,
            'PEGOU A CADEIRA!',
            '#00ffcc'
          );
          break;
        }
      }

      // Immediately hurl chair if player has chair ammo (or just caught one!)
      if (ScoreManager.getInstance().getChairAmmo() > 0) {
        this.player.throwCaughtChair();
        if (!caughtNearChair) {
          this.onFloatingText(
            this.player.x,
            this.player.y - 42,
            'TOMA CADEIRADA!',
            '#ffcc00'
          );
        }
      }
    }
  }

  private triggerMortadelaExplosion(
    x: number,
    y: number,
    radius: number,
    damage: number
  ): void {
    const circle = this.scene.add.circle(x, y, radius, 0xff66aa, 0.65);
    circle.setStrokeStyle(3, 0xffcc00);
    circle.setDepth(28);

    this.scene.tweens.add({
      targets: circle,
      scale: 1.35,
      alpha: 0,
      duration: 260,
      onComplete: () => circle.destroy()
    });

    if (
      this.player.active &&
      Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) <= radius
    ) {
      this.player.takeDamage(damage, this.scene.time.now);
    }
  }
}
