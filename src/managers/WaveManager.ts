import Phaser from 'phaser';
import { Player } from '../entities/Player';
import {
  BlondeRobotEnemy,
  DatenaCloneEnemy,
  DroneJetEnemy,
  Enemy,
  EnemyKind,
  OccupierMilitantEnemy,
  PoliceHazardEnemy,
  PopularCarEnemy,
  RedShirtEnemy
} from '../entities/Enemy';
import {
  Boss,
  BoulosBoss,
  DatenaSupremoBoss,
  ErikaHiltonJetBoss,
  GloriaGrooveBoss,
  LulaFinalBoss
} from '../entities/Boss';
import { ProjectilePool } from '../entities/Projectile';

export interface WaveDefinition {
  triggerX: number;
  lockRightX: number;
  isBossWave: boolean;
  spawns: Array<{
    kind: EnemyKind | 'random_all';
    offsetX: number;
    y: number;
    delayMs: number;
  }>;
}

export class WaveManager {
  private scene: Phaser.Scene;
  private levelNumber: number;
  private player: Player;
  private enemiesGroup: Phaser.Physics.Arcade.Group;
  private enemyProjectiles: ProjectilePool;
  private waves: WaveDefinition[] = [];
  private currentWaveIndex: number = 0;
  private waveActive: boolean = false;
  private pendingSpawns: number = 0;
  private activeBoss: Boss | null = null;
  private levelCompleted: boolean = false;
  private onWaveUnlockedCallback?: () => void;
  private onBossSpawnedCallback?: (boss: Boss) => void;
  private onLevelVictoryCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    levelNumber: number,
    player: Player,
    enemiesGroup: Phaser.Physics.Arcade.Group,
    enemyProjectiles: ProjectilePool,
    callbacks: {
      onWaveUnlocked?: () => void;
      onBossSpawned?: (boss: Boss) => void;
      onLevelVictory?: () => void;
    }
  ) {
    this.scene = scene;
    this.levelNumber = levelNumber;
    this.player = player;
    this.enemiesGroup = enemiesGroup;
    this.enemyProjectiles = enemyProjectiles;
    this.onWaveUnlockedCallback = callbacks.onWaveUnlocked;
    this.onBossSpawnedCallback = callbacks.onBossSpawned;
    this.onLevelVictoryCallback = callbacks.onLevelVictory;

    this.waves = this.buildWavesForLevel(levelNumber);
    this.updateCameraLock(960);
  }

  private buildWavesForLevel(level: number): WaveDefinition[] {
    if (level === 1) {
      return [
        {
          triggerX: 280,
          lockRightX: 960,
          isBossWave: false,
          spawns: [
            { kind: 'red_shirt', offsetX: 820, y: 410, delayMs: 100 },
            { kind: 'red_shirt', offsetX: 900, y: 410, delayMs: 600 },
            { kind: 'police_car', offsetX: 920, y: 420, delayMs: 1100 },
            { kind: 'red_shirt', offsetX: 140, y: 410, delayMs: 1400 }
          ]
        },
        {
          triggerX: 1050,
          lockRightX: 1760,
          isBossWave: false,
          spawns: [
            { kind: 'police_heli', offsetX: 1550, y: 140, delayMs: 100 },
            { kind: 'red_shirt', offsetX: 1650, y: 410, delayMs: 400 },
            { kind: 'red_shirt', offsetX: 1720, y: 410, delayMs: 900 },
            { kind: 'police_car', offsetX: 1700, y: 420, delayMs: 1500 }
          ]
        },
        {
          triggerX: 1850,
          lockRightX: 2560,
          isBossWave: true,
          spawns: []
        }
      ];
    } else if (level === 2) {
      return [
        {
          triggerX: 280,
          lockRightX: 960,
          isBossWave: false,
          spawns: [
            { kind: 'blonde_robot', offsetX: 860, y: 410, delayMs: 100 },
            { kind: 'blonde_robot', offsetX: 920, y: 410, delayMs: 550 },
            { kind: 'drone_jet', offsetX: 820, y: 130, delayMs: 800 },
            { kind: 'blonde_robot', offsetX: 120, y: 410, delayMs: 1300 }
          ]
        },
        {
          triggerX: 1050,
          lockRightX: 1760,
          isBossWave: false,
          spawns: [
            { kind: 'drone_jet', offsetX: 1520, y: 125, delayMs: 100 },
            { kind: 'drone_jet', offsetX: 1680, y: 155, delayMs: 600 },
            { kind: 'blonde_robot', offsetX: 1700, y: 410, delayMs: 400 },
            { kind: 'blonde_robot', offsetX: 1740, y: 410, delayMs: 1100 }
          ]
        },
        {
          triggerX: 1850,
          lockRightX: 2560,
          isBossWave: true,
          spawns: []
        }
      ];
    } else if (level === 3) {
      return [
        {
          triggerX: 280,
          lockRightX: 960,
          isBossWave: false,
          spawns: [
            { kind: 'occupier_militant', offsetX: 650, y: 410, delayMs: 100 },
            { kind: 'popular_car', offsetX: 910, y: 420, delayMs: 500 },
            { kind: 'occupier_militant', offsetX: 830, y: 410, delayMs: 900 },
            { kind: 'occupier_militant', offsetX: 480, y: 410, delayMs: 1400 }
          ]
        },
        {
          triggerX: 1050,
          lockRightX: 1760,
          isBossWave: false,
          spawns: [
            { kind: 'popular_car', offsetX: 1700, y: 420, delayMs: 100 },
            { kind: 'occupier_militant', offsetX: 1420, y: 410, delayMs: 400 },
            { kind: 'occupier_militant', offsetX: 1620, y: 410, delayMs: 850 },
            { kind: 'popular_car', offsetX: 1120, y: 420, delayMs: 1400 }
          ]
        },
        {
          triggerX: 1850,
          lockRightX: 2560,
          isBossWave: true,
          spawns: []
        }
      ];
    } else if (level === 4) {
      return [
        {
          triggerX: 280,
          lockRightX: 960,
          isBossWave: false,
          spawns: [
            { kind: 'datena_clone', offsetX: 840, y: 410, delayMs: 100 },
            { kind: 'datena_clone', offsetX: 920, y: 410, delayMs: 500 },
            { kind: 'datena_clone', offsetX: 150, y: 410, delayMs: 950 },
            { kind: 'datena_clone', offsetX: 880, y: 410, delayMs: 1400 }
          ]
        },
        {
          triggerX: 1050,
          lockRightX: 1760,
          isBossWave: false,
          spawns: [
            { kind: 'datena_clone', offsetX: 1620, y: 410, delayMs: 100 },
            { kind: 'datena_clone', offsetX: 1700, y: 410, delayMs: 450 },
            { kind: 'datena_clone', offsetX: 1120, y: 410, delayMs: 850 },
            { kind: 'datena_clone', offsetX: 1730, y: 410, delayMs: 1250 },
            { kind: 'datena_clone', offsetX: 1350, y: 410, delayMs: 1650 }
          ]
        },
        {
          triggerX: 1850,
          lockRightX: 2560,
          isBossWave: true,
          spawns: []
        }
      ];
    } else {
      // Fase 5: Confronto Final - Ondas rápidas aleatórias de todos os inimigos das fases anteriores + Chefe Final Lula
      return [
        {
          triggerX: 260,
          lockRightX: 960,
          isBossWave: false,
          spawns: [
            { kind: 'random_all', offsetX: 850, y: 410, delayMs: 100 },
            { kind: 'random_all', offsetX: 910, y: 410, delayMs: 450 },
            { kind: 'random_all', offsetX: 160, y: 410, delayMs: 800 },
            { kind: 'random_all', offsetX: 880, y: 410, delayMs: 1150 },
            { kind: 'random_all', offsetX: 780, y: 140, delayMs: 1500 }
          ]
        },
        {
          triggerX: 1050,
          lockRightX: 1760,
          isBossWave: false,
          spawns: [
            { kind: 'random_all', offsetX: 1650, y: 410, delayMs: 100 },
            { kind: 'random_all', offsetX: 1710, y: 410, delayMs: 400 },
            { kind: 'random_all', offsetX: 1140, y: 410, delayMs: 750 },
            { kind: 'random_all', offsetX: 1580, y: 135, delayMs: 1100 },
            { kind: 'random_all', offsetX: 1730, y: 410, delayMs: 1450 },
            { kind: 'random_all', offsetX: 1200, y: 410, delayMs: 1800 }
          ]
        },
        {
          triggerX: 1850,
          lockRightX: 2560,
          isBossWave: true,
          spawns: []
        }
      ];
    }
  }

  public update(): void {
    if (this.levelCompleted || this.currentWaveIndex >= this.waves.length) return;

    const currentWave = this.waves[this.currentWaveIndex];

    if (!this.waveActive) {
      if (this.player.x >= currentWave.triggerX) {
        this.startWave(currentWave);
      }
      return;
    }

    // Check if current wave is cleared
    if (currentWave.isBossWave) {
      if (this.activeBoss && this.activeBoss.isDefeated) {
        this.levelCompleted = true;
        if (this.onLevelVictoryCallback) {
          this.onLevelVictoryCallback();
        }
      }
    } else {
      const activeEnemies = this.enemiesGroup.countActive(true);
      if (this.pendingSpawns === 0 && activeEnemies === 0) {
        this.waveActive = false;
        this.currentWaveIndex++;

        // Unlock camera to the next wave's lock boundary
        const nextWave = this.waves[this.currentWaveIndex];
        if (nextWave) {
          this.updateCameraLock(nextWave.lockRightX);
          if (this.onWaveUnlockedCallback) {
            this.onWaveUnlockedCallback();
          }
        }
      }
    }
  }

  private startWave(wave: WaveDefinition): void {
    this.waveActive = true;
    const cam = this.scene.cameras.main;

    // Lock left and right camera bounds for Boss Arena or right bound for regular wave
    if (wave.isBossWave) {
      const arenaLeft = wave.lockRightX - 960;
      cam.setBounds(arenaLeft, 0, 960, 540);
      this.scene.physics.world.setBounds(arenaLeft, 0, 960, 500);
      this.spawnBossForLevel(wave.lockRightX - 150);
    } else {
      this.updateCameraLock(wave.lockRightX);
      this.pendingSpawns = wave.spawns.length;

      for (const s of wave.spawns) {
        this.scene.time.delayedCall(s.delayMs, () => {
          if (!this.scene || !this.player.active) return;
          this.spawnEnemy(s.kind, s.offsetX, s.y);
          this.pendingSpawns = Math.max(0, this.pendingSpawns - 1);
        });
      }
    }
  }

  private spawnEnemy(
    kindOrRandom: EnemyKind | 'random_all',
    x: number,
    y: number
  ): void {
    let kind: EnemyKind;
    if (kindOrRandom === 'random_all') {
      const pool: EnemyKind[] = [
        'red_shirt',
        'police_car',
        'police_heli',
        'blonde_robot',
        'drone_jet',
        'popular_car',
        'occupier_militant',
        'datena_clone'
      ];
      kind = pool[Phaser.Math.Between(0, pool.length - 1)];
    } else {
      kind = kindOrRandom;
    }

    let enemy: Enemy;
    switch (kind) {
      case 'red_shirt':
        enemy = new RedShirtEnemy(this.scene, x, 395, this.player, this.enemyProjectiles);
        break;
      case 'police_car':
        enemy = new PoliceHazardEnemy(
          this.scene,
          x,
          415,
          false,
          this.player,
          this.enemyProjectiles
        );
        break;
      case 'police_heli':
        enemy = new PoliceHazardEnemy(
          this.scene,
          x,
          125,
          true,
          this.player,
          this.enemyProjectiles
        );
        break;
      case 'blonde_robot':
        enemy = new BlondeRobotEnemy(
          this.scene,
          x,
          395,
          this.player,
          this.enemyProjectiles
        );
        break;
      case 'drone_jet':
        enemy = new DroneJetEnemy(
          this.scene,
          x,
          125,
          this.player,
          this.enemyProjectiles
        );
        break;
      case 'popular_car':
        enemy = new PopularCarEnemy(
          this.scene,
          x,
          415,
          this.player,
          this.enemyProjectiles
        );
        break;
      case 'occupier_militant':
        enemy = new OccupierMilitantEnemy(
          this.scene,
          x,
          395,
          this.player,
          this.enemyProjectiles
        );
        break;
      case 'datena_clone':
      default:
        enemy = new DatenaCloneEnemy(
          this.scene,
          x,
          395,
          this.player,
          this.enemyProjectiles
        );
        break;
    }

    this.enemiesGroup.add(enemy);
  }

  private spawnBossForLevel(spawnX: number): void {
    let boss: Boss;
    if (this.levelNumber === 1) {
      boss = new GloriaGrooveBoss(
        this.scene,
        spawnX,
        375,
        this.player,
        this.enemyProjectiles,
        this.enemiesGroup
      );
    } else if (this.levelNumber === 2) {
      boss = new ErikaHiltonJetBoss(
        this.scene,
        spawnX,
        145,
        this.player,
        this.enemyProjectiles,
        this.enemiesGroup
      );
    } else if (this.levelNumber === 3) {
      boss = new BoulosBoss(
        this.scene,
        spawnX,
        382,
        this.player,
        this.enemyProjectiles,
        this.enemiesGroup
      );
    } else if (this.levelNumber === 4) {
      boss = new DatenaSupremoBoss(
        this.scene,
        spawnX,
        382,
        this.player,
        this.enemyProjectiles,
        this.enemiesGroup
      );
    } else {
      boss = new LulaFinalBoss(
        this.scene,
        spawnX,
        235,
        this.player,
        this.enemyProjectiles,
        this.enemiesGroup
      );
    }

    this.activeBoss = boss;
    if (this.onBossSpawnedCallback) {
      this.onBossSpawnedCallback(boss);
    }
  }

  private updateCameraLock(maxRightX: number): void {
    this.scene.cameras.main.setBounds(0, 0, maxRightX, 540);
    this.scene.physics.world.setBounds(0, 0, maxRightX, 500);
  }

  public getActiveBoss(): Boss | null {
    return this.activeBoss;
  }
}
