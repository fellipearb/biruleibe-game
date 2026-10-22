import Phaser from 'phaser';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const loadingText = this.add
      .text(width / 2, height / 2, 'GERANDO ASSETS PIXEL ART SATÍRICOS...', {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ffcc00',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.generateAllPlaceholderTextures();

    loadingText.destroy();
    this.scene.start('MainMenuScene');
  }

  private generateAllPlaceholderTextures(): void {
    // 1. Ground and Platform textures
    this.makeCanvasTexture('ground_tile', 64, 64, (ctx) => {
      ctx.fillStyle = '#2b2d38';
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(0, 4, 28, 5);
      ctx.fillRect(36, 4, 24, 5);
      ctx.fillStyle = '#1f2029';
      ctx.fillRect(0, 14, 64, 50);
    });

    this.makeCanvasTexture('platform_tile', 120, 22, (ctx) => {
      ctx.fillStyle = '#5c4033';
      ctx.fillRect(0, 0, 120, 22);
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(0, 0, 120, 6);
      ctx.strokeStyle = '#222';
      ctx.strokeRect(1, 1, 118, 20);
    });

    // 2. Player Soldier (Jaqueta Camuflada - Fases 1 a 4)
    this.makeCanvasTexture('player_soldier', 36, 48, (ctx) => {
      // Boots & Legs
      ctx.fillStyle = '#1b2618';
      ctx.fillRect(8, 36, 8, 12);
      ctx.fillRect(20, 36, 8, 12);
      // Camo Jacket torso
      ctx.fillStyle = '#3b6e28';
      ctx.fillRect(6, 18, 24, 19);
      ctx.fillStyle = '#244718';
      ctx.fillRect(8, 20, 7, 6);
      ctx.fillRect(19, 25, 8, 7);
      ctx.fillStyle = '#8b7d3a';
      ctx.fillRect(14, 19, 6, 5);
      // Head & Sunglasses
      ctx.fillStyle = '#f2c197';
      ctx.fillRect(10, 4, 16, 14);
      // Bandana verde-amarela
      ctx.fillStyle = '#009c3b';
      ctx.fillRect(9, 3, 18, 4);
      ctx.fillStyle = '#ffdf00';
      ctx.fillRect(9, 6, 18, 2);
      // Aviator shades
      ctx.fillStyle = '#111';
      ctx.fillRect(16, 9, 10, 4);
    });

    // 3. Player Bolsonaro (Fase 5 - Terno, Faixa Presidencial)
    this.makeCanvasTexture('player_bolsonaro', 36, 48, (ctx) => {
      // Legs (dark blue suit)
      ctx.fillStyle = '#16243b';
      ctx.fillRect(8, 36, 8, 12);
      ctx.fillRect(20, 36, 8, 12);
      // Suit Jacket
      ctx.fillStyle = '#1f3354';
      ctx.fillRect(6, 18, 24, 19);
      // White shirt & tie
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(15, 18, 6, 10);
      ctx.fillStyle = '#009c3b';
      ctx.fillRect(10, 18, 14, 4);
      ctx.fillStyle = '#ffdf00';
      ctx.fillRect(12, 22, 14, 4);
      // Head & Hair
      ctx.fillStyle = '#f3c6a0';
      ctx.fillRect(10, 5, 16, 13);
      ctx.fillStyle = '#5a4632';
      ctx.fillRect(9, 2, 18, 5);
      ctx.fillStyle = '#111';
      ctx.fillRect(20, 9, 4, 3);
    });

    // 4. Weapons: Rifle & "Arminha com a mão"
    this.makeCanvasTexture('weapon_rifle', 26, 10, (ctx) => {
      ctx.fillStyle = '#222';
      ctx.fillRect(0, 2, 22, 5);
      ctx.fillStyle = '#555';
      ctx.fillRect(14, 1, 12, 3);
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(0, 4, 7, 5);
    });

    this.makeCanvasTexture('weapon_arminha', 24, 14, (ctx) => {
      // Hand making finger-gun gesture ("arminha com a mão" 👉)
      ctx.fillStyle = '#f3c6a0';
      ctx.fillRect(2, 4, 12, 8);
      ctx.fillRect(14, 5, 9, 4); // Index finger barrel
      ctx.fillRect(6, 0, 4, 5); // Thumb hammer
      ctx.strokeStyle = '#00ffff';
      ctx.strokeRect(13, 4, 10, 5);
    });

    // 5. Projectiles
    this.makeCanvasTexture('proj_bullet', 14, 8, (ctx) => {
      ctx.fillStyle = '#ffee00';
      ctx.fillRect(0, 1, 12, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 2, 6, 4);
    });

    // Carteira de Trabalho (CTPS azul com brasão dourado - Fase 3 & 5)
    this.makeCanvasTexture('proj_ctps', 20, 16, (ctx) => {
      ctx.fillStyle = '#0055cc';
      ctx.fillRect(1, 1, 18, 14);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(1, 1, 18, 14);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(7, 4, 6, 6);
    });

    // Laser da Arminha (Fase 5)
    this.makeCanvasTexture('proj_laser', 18, 8, (ctx) => {
      ctx.fillStyle = '#00ffcc';
      ctx.fillRect(0, 1, 18, 6);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(3, 2, 12, 4);
    });

    // Panfleto Vermelho (Fase 1 & 3)
    this.makeCanvasTexture('proj_pamphlet', 14, 12, (ctx) => {
      ctx.fillStyle = '#ee2222';
      ctx.fillRect(1, 1, 12, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, 3, 8, 2);
      ctx.fillRect(3, 7, 6, 2);
    });

    // Projétil Policial / Metralhadora
    this.makeCanvasTexture('proj_police', 12, 12, (ctx) => {
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(6, 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(4, 4, 4, 4);
    });

    // Onda de Choque Musical (Glória Groove / Lula)
    this.makeCanvasTexture('proj_sonic', 24, 28, (ctx) => {
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(8, 14, 10, -Math.PI / 2.2, Math.PI / 2.2);
      ctx.stroke();
      ctx.strokeStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(12, 14, 12, -Math.PI / 2.2, Math.PI / 2.2);
      ctx.stroke();
    });

    // Microfone Teleguiado (Erika Hilton)
    this.makeCanvasTexture('proj_mic', 18, 12, (ctx) => {
      ctx.fillStyle = '#ff66cc';
      ctx.fillRect(2, 3, 10, 6);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(13, 6, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pão com Mortadela Explosivo (Boulos / Lula)
    this.makeCanvasTexture('proj_mortadela', 20, 18, (ctx) => {
      // Bread top & bottom
      ctx.fillStyle = '#d28b36';
      ctx.fillRect(2, 2, 16, 6);
      ctx.fillRect(2, 11, 16, 5);
      // Pink mortadela filling
      ctx.fillStyle = '#ff5599';
      ctx.fillRect(1, 7, 18, 5);
      // Explosive spark on top
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(9, 0, 3, 3);
    });

    // Cadeira do Datena (Inimigo)
    this.makeCanvasTexture('proj_chair', 24, 24, (ctx) => {
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 3;
      // Chair backrest, seat, and legs
      ctx.strokeRect(5, 3, 12, 10);
      ctx.fillStyle = '#8b2222';
      ctx.fillRect(4, 12, 16, 4);
      ctx.strokeRect(5, 14, 14, 8);
    });

    // Cadeira Dourada Rebatida pelo Player
    this.makeCanvasTexture('proj_chair_gold', 26, 26, (ctx) => {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.strokeRect(5, 3, 14, 10);
      ctx.fillStyle = '#00ffcc';
      ctx.fillRect(4, 12, 18, 5);
      ctx.strokeRect(5, 15, 16, 8);
    });

    // 6. Enemies
    // Fase 1: Camiseta Vermelha
    this.makeCanvasTexture('enemy_redshirt', 32, 46, (ctx) => {
      ctx.fillStyle = '#222';
      ctx.fillRect(8, 34, 6, 12);
      ctx.fillRect(18, 34, 6, 12);
      ctx.fillStyle = '#d91b1b';
      ctx.fillRect(5, 16, 22, 19);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(13, 21, 6, 6); // Star emblem
      ctx.fillStyle = '#e5b887';
      ctx.fillRect(9, 4, 14, 12);
      ctx.fillStyle = '#d91b1b';
      ctx.fillRect(8, 2, 16, 4);
    });

    // Fase 1: Viatura da Polícia
    this.makeCanvasTexture('enemy_police_car', 76, 40, (ctx) => {
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(4, 14, 68, 20);
      ctx.fillStyle = '#1c2d5a';
      ctx.fillRect(16, 4, 42, 14);
      ctx.fillStyle = '#cc0000';
      ctx.fillRect(10, 20, 56, 6);
      // Siren lights
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(30, 0, 8, 4);
      ctx.fillStyle = '#0055ff';
      ctx.fillRect(38, 0, 8, 4);
      // Wheels
      ctx.fillStyle = '#111';
      ctx.fillRect(12, 30, 14, 10);
      ctx.fillRect(50, 30, 14, 10);
    });

    // Fase 1: Helicóptero da Polícia
    this.makeCanvasTexture('enemy_police_heli', 72, 38, (ctx) => {
      ctx.fillStyle = '#222f3e';
      ctx.fillRect(14, 10, 44, 20);
      ctx.fillRect(48, 14, 22, 8);
      ctx.fillStyle = '#70a1ff';
      ctx.fillRect(16, 12, 16, 12);
      // Rotor blade
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(2, 2, 68, 4);
      ctx.fillRect(34, 4, 4, 6);
    });

    // Fase 1: Dançarino de Apoio
    this.makeCanvasTexture('enemy_dancer', 28, 44, (ctx) => {
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(6, 16, 16, 18);
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(7, 34, 5, 10);
      ctx.fillRect(16, 34, 5, 10);
      ctx.fillStyle = '#e0ac69';
      ctx.fillRect(8, 4, 12, 12);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(6, 2, 16, 4);
    });

    // Fase 2: Robô Humanoide com Peruca Loira
    this.makeCanvasTexture('enemy_blonde_robot', 32, 48, (ctx) => {
      // Metallic body
      ctx.fillStyle = '#7f8fa6';
      ctx.fillRect(6, 16, 20, 20);
      ctx.fillStyle = '#353b48';
      ctx.fillRect(8, 36, 6, 12);
      ctx.fillRect(18, 36, 6, 12);
      // Glowing red robot eyes
      ctx.fillStyle = '#dcdde1';
      ctx.fillRect(8, 5, 16, 12);
      ctx.fillStyle = '#ff0033';
      ctx.fillRect(10, 9, 12, 3);
      // flamboyant Blonde Wig
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(5, 0, 22, 7);
      ctx.fillRect(4, 4, 5, 12);
      ctx.fillRect(23, 4, 5, 12);
    });

    // Fase 2: Jato / Drone
    this.makeCanvasTexture('enemy_drone_jet', 46, 26, (ctx) => {
      ctx.fillStyle = '#6c5ce7';
      ctx.fillRect(4, 8, 38, 10);
      ctx.fillStyle = '#a29bfe';
      ctx.fillRect(16, 2, 14, 22);
      ctx.fillStyle = '#ff7675';
      ctx.fillRect(0, 10, 8, 6);
    });

    // Fase 3: Carro Popular em Disparada
    this.makeCanvasTexture('enemy_popular_car', 70, 36, (ctx) => {
      ctx.fillStyle = '#b33939';
      ctx.fillRect(4, 12, 62, 16);
      ctx.fillStyle = '#cd6133';
      ctx.fillRect(16, 3, 36, 12);
      // Escada no teto (clássico carro popular rápido!)
      ctx.fillStyle = '#dfe6e9';
      ctx.fillRect(10, 0, 48, 3);
      ctx.fillStyle = '#111';
      ctx.fillRect(12, 26, 12, 10);
      ctx.fillRect(46, 26, 12, 10);
    });

    // Fase 3: Militante Ocupação
    this.makeCanvasTexture('enemy_militant', 30, 46, (ctx) => {
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(7, 34, 6, 12);
      ctx.fillRect(17, 34, 6, 12);
      ctx.fillStyle = '#b71540';
      ctx.fillRect(5, 16, 20, 18);
      ctx.fillStyle = '#fad390';
      ctx.fillRect(8, 4, 14, 12);
      ctx.fillStyle = '#e55039';
      ctx.fillRect(6, 1, 18, 5);
    });

    // Fase 4: Clone do Datena com Cassetete
    this.makeCanvasTexture('enemy_datena_clone', 34, 48, (ctx) => {
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(8, 35, 6, 13);
      ctx.fillRect(18, 35, 6, 13);
      // Dark Suit & Red Tie
      ctx.fillStyle = '#2f3640';
      ctx.fillRect(6, 16, 20, 20);
      ctx.fillStyle = '#c23616';
      ctx.fillRect(14, 17, 4, 12);
      // Head
      ctx.fillStyle = '#f1c27d';
      ctx.fillRect(8, 4, 16, 12);
      // Baton/Cassetete in hand
      ctx.fillStyle = '#111';
      ctx.fillRect(25, 10, 6, 20);
    });

    // 7. BOSSES
    // Boss 1: Trio Elétrico da Glória Groove
    this.makeCanvasTexture('boss_gloria_trio', 136, 92, (ctx) => {
      // Giant sound truck body
      ctx.fillStyle = '#8e44ad';
      ctx.fillRect(6, 24, 124, 54);
      // Speaker wall ("Paredão de Som")
      ctx.fillStyle = '#111';
      ctx.fillRect(14, 30, 108, 40);
      ctx.fillStyle = '#ff00ff';
      for (let sx = 24; sx <= 104; sx += 26) {
        ctx.beginPath();
        ctx.arc(sx, 50, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      // Glória Groove on top stage
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(54, 2, 28, 22);
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(58, 8, 20, 16);
      // Wheels
      ctx.fillStyle = '#222';
      ctx.fillRect(20, 74, 22, 18);
      ctx.fillRect(92, 74, 22, 18);
    });

    // Boss 2: Jato Executivo da Erika Hilton
    this.makeCanvasTexture('boss_erika_jet', 124, 56, (ctx) => {
      // Sleek Pink/Gold Luxury Jet
      ctx.fillStyle = '#fd79a8';
      ctx.fillRect(10, 18, 104, 22);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(26, 24, 80, 6);
      // Cockpit glass
      ctx.fillStyle = '#00cec9';
      ctx.fillRect(18, 10, 32, 12);
      // Tail fin
      ctx.fillStyle = '#e84393';
      ctx.fillRect(92, 2, 24, 18);
    });

    // Boss 3: Comandante Boulos
    this.makeCanvasTexture('boss_boulos', 58, 72, (ctx) => {
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(14, 50, 12, 22);
      ctx.fillRect(32, 50, 12, 22);
      // Olive/Red activist vest
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(10, 24, 38, 28);
      // Head with beard
      ctx.fillStyle = '#eac086';
      ctx.fillRect(16, 4, 26, 20);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(16, 15, 26, 9); // Full beard
      ctx.fillRect(15, 2, 28, 5); // Hair
    });

    // Boss 4: Datena Supremo
    this.makeCanvasTexture('boss_datena', 60, 74, (ctx) => {
      ctx.fillStyle = '#192a56';
      ctx.fillRect(14, 52, 12, 22);
      ctx.fillRect(34, 52, 12, 22);
      // Suspenders & Studio Shirt
      ctx.fillStyle = '#40739e';
      ctx.fillRect(10, 24, 40, 29);
      ctx.fillStyle = '#c23616';
      ctx.fillRect(16, 24, 5, 28);
      ctx.fillRect(39, 24, 5, 28);
      // Head
      ctx.fillStyle = '#f1c27d';
      ctx.fillRect(16, 4, 28, 20);
      // Holding a raised studio chair overhead
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 0, 16, 16);
    });

    // Boss 5: Mecha-Lula Cúpula de Energia & Canhão Rotativo
    this.makeCanvasTexture('boss_lula_dome', 116, 116, (ctx) => {
      // Metallic Mecha Base
      ctx.fillStyle = '#b71540';
      ctx.fillRect(16, 62, 84, 42);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(46, 70, 24, 24);
      // Glass Energy Dome
      ctx.fillStyle = 'rgba(0, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(58, 56, 38, Math.PI, 0);
      ctx.fill();
      // Lula silhouette inside dome (white hair + beard)
      ctx.fillStyle = '#f1c27d';
      ctx.fillRect(44, 30, 28, 24);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(42, 24, 32, 8); // White hair
      ctx.fillRect(44, 44, 28, 10); // White beard
    });

    this.makeCanvasTexture('boss_lula_cannon', 96, 28, (ctx) => {
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(36, 6, 56, 16);
      ctx.fillStyle = '#eb2f06';
      ctx.fillRect(78, 4, 18, 20);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(44, 10, 30, 8);
    });
  }

  private makeCanvasTexture(
    key: string,
    width: number,
    height: number,
    drawFn: (ctx: CanvasRenderingContext2D) => void
  ): void {
    if (this.textures.exists(key)) {
      this.textures.remove(key);
    }
    const canvasTex = this.textures.createCanvas(key, width, height);
    if (!canvasTex) return;
    const ctx = canvasTex.getContext();
    drawFn(ctx);
    canvasTex.refresh();
  }
}
