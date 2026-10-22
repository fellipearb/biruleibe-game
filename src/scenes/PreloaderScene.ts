import Phaser from 'phaser';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloaderScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const loadingText = this.add
      .text(width / 2, height / 2, 'CARREGANDO PIXEL ART ESTILO METAL SLUG...', {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#ffcc00',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.generateAllPlaceholderTextures();
    this.createAnimations();

    loadingText.destroy();
    this.scene.start('MainMenuScene');
  }

  private drawOutlinedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    highlight?: string,
    shadow?: string
  ): void {
    // Neo-Geo style dark outline
    ctx.fillStyle = '#141013';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    // Base fill
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    // Top/Left Highlight
    if (highlight) {
      ctx.fillStyle = highlight;
      ctx.fillRect(x, y, w, Math.max(2, Math.floor(h * 0.22)));
    }
    // Bottom/Right Shadow
    if (shadow) {
      ctx.fillStyle = shadow;
      ctx.fillRect(x, y + Math.floor(h * 0.75), w, Math.ceil(h * 0.25));
    }
  }

  private generateAllPlaceholderTextures(): void {
    // 1. Ground and Platform textures (Chunky Metal Slug Cobblestone / Girder)
    this.makeCanvasTexture('ground_tile', 64, 64, (ctx) => {
      ctx.fillStyle = '#2d313b';
      ctx.fillRect(0, 0, 64, 64);
      // Curb top
      ctx.fillStyle = '#57606f';
      ctx.fillRect(0, 0, 64, 10);
      ctx.fillStyle = '#ffa502';
      ctx.fillRect(2, 3, 26, 6);
      ctx.fillRect(34, 3, 26, 6);
      // Asphalt stones & cracks
      ctx.fillStyle = '#1e2229';
      ctx.fillRect(0, 12, 64, 52);
      ctx.fillStyle = '#373e4c';
      ctx.fillRect(6, 18, 22, 12);
      ctx.fillRect(34, 22, 24, 12);
      ctx.fillRect(14, 38, 28, 14);
    });

    this.makeCanvasTexture('platform_tile', 140, 26, (ctx) => {
      this.drawOutlinedRect(ctx, 2, 2, 136, 22, '#636e72', '#b2bec3', '#2d3436');
      // Yellow/Black hazard stripes on top edge
      ctx.fillStyle = '#fdcb6e';
      for (let i = 6; i < 130; i += 18) {
        ctx.fillRect(i, 4, 10, 5);
      }
      // Rivets
      ctx.fillStyle = '#dfe6e9';
      for (let i = 12; i < 130; i += 28) {
        ctx.fillRect(i, 14, 4, 4);
      }
    });

    // 2. Player Soldier (Marco Rossi / Tarma Metal Slug Super-Deformed Chibi Proportions: 68x84)
    const drawSoldierFrame = (ctx: CanvasRenderingContext2D, stepOffset: number) => {
      // Heavy Combat Boots
      this.drawOutlinedRect(ctx, 14 - stepOffset, 64, 16, 16, '#3d271d', '#5c3c2e', '#1e130e');
      this.drawOutlinedRect(ctx, 36 + stepOffset, 64, 16, 16, '#3d271d', '#5c3c2e', '#1e130e');
      // Boot metallic buckles
      ctx.fillStyle = '#d2dae2';
      ctx.fillRect(18 - stepOffset, 68, 6, 4);
      ctx.fillRect(40 + stepOffset, 68, 6, 4);

      // Baggy Cargo Pants
      this.drawOutlinedRect(ctx, 16, 48, 34, 18, '#4b6584', '#778ca3', '#2f3542');

      // Tactical Camo Jacket + Pouches
      this.drawOutlinedRect(ctx, 12, 28, 42, 24, '#2ecc71', '#58d68d', '#1e8449');
      // Camo patches
      ctx.fillStyle = '#196f3d';
      ctx.fillRect(16, 32, 10, 8);
      ctx.fillRect(36, 38, 12, 8);
      // Brown ammo belt & pouches (Metal Slug vest)
      this.drawOutlinedRect(ctx, 12, 44, 42, 6, '#8d6e63', '#bcaaa4', '#4e342e');
      this.drawOutlinedRect(ctx, 18, 34, 8, 10, '#a1887f', '#d7ccc8', '#5d4037');
      this.drawOutlinedRect(ctx, 38, 34, 8, 10, '#a1887f', '#d7ccc8', '#5d4037');

      // Big Expressive Metal-Slug Head (SD proportion)
      this.drawOutlinedRect(ctx, 16, 6, 36, 24, '#f5cba7', '#fdebd0', '#dc7633');
      // FlutteringBandana tails behind head
      this.drawOutlinedRect(ctx, 4, 8 + stepOffset, 12, 7, '#009c3b', '#2ecc71', '#006400');
      this.drawOutlinedRect(ctx, 2, 14 - stepOffset, 12, 6, '#ffdf00', '#fff200', '#d4ac0d');

      // Spiky Messy Action Hero Hair + Headband
      this.drawOutlinedRect(ctx, 14, 2, 40, 8, '#6e2c00', '#a04000', '#3e1900');
      ctx.fillStyle = '#009c3b';
      ctx.fillRect(15, 7, 38, 4);
      ctx.fillStyle = '#ffdf00';
      ctx.fillRect(15, 11, 38, 3);

      // Badass Sunglasses & Grin
      ctx.fillStyle = '#111111';
      ctx.fillRect(28, 14, 22, 6);
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(32, 15, 5, 2);
      ctx.fillRect(42, 15, 5, 2);
      // Grin (white teeth)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(32, 23, 12, 4);
    };

    this.makeCanvasTexture('player_soldier', 68, 84, (ctx) => drawSoldierFrame(ctx, 0));
    this.makeCanvasTexture('player_soldier_walk', 68, 84, (ctx) => drawSoldierFrame(ctx, 4));

    // 3. Player Bolsonaro (Fase 5 - Metal Slug Caricature Style: 68x84)
    const drawBolsonaroFrame = (ctx: CanvasRenderingContext2D, stepOffset: number) => {
      // Dress Shoes
      this.drawOutlinedRect(ctx, 14 - stepOffset, 64, 16, 16, '#1e272e', '#485460', '#000000');
      this.drawOutlinedRect(ctx, 36 + stepOffset, 64, 16, 16, '#1e272e', '#485460', '#000000');

      // Navy Suit Pants
      this.drawOutlinedRect(ctx, 16, 48, 34, 18, '#192a56', '#273c75', '#0c152c');

      // Presidential Suit Torso
      this.drawOutlinedRect(ctx, 12, 28, 42, 24, '#273c75', '#40739e', '#192a56');
      // White Shirt & Blue Tie
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(28, 28, 12, 18);
      ctx.fillStyle = '#00a8ff';
      ctx.fillRect(32, 30, 5, 14);

      // Diagonal Faixa Presidencial (Verde-Amarela com Brasão)
      ctx.fillStyle = '#009c3b';
      ctx.fillRect(16, 28, 14, 6);
      ctx.fillRect(22, 34, 14, 6);
      ctx.fillRect(28, 40, 14, 6);
      ctx.fillStyle = '#ffdf00';
      ctx.fillRect(18, 31, 10, 4);
      ctx.fillRect(24, 37, 10, 4);
      ctx.fillRect(30, 43, 10, 4);

      // Big Expressive Caricature Head
      this.drawOutlinedRect(ctx, 16, 6, 36, 24, '#f5cba7', '#fdebd0', '#dc7633');
      // Side-parted hair
      this.drawOutlinedRect(ctx, 14, 2, 38, 8, '#5d4037', '#8d6e63', '#3e2723');
      // Eyes & eyebrows
      ctx.fillStyle = '#111111';
      ctx.fillRect(30, 13, 6, 5);
      ctx.fillRect(42, 13, 6, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(32, 14, 2, 2);
      ctx.fillRect(44, 14, 2, 2);
      // Wide grin
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(30, 22, 14, 4);
    };

    this.makeCanvasTexture('player_bolsonaro', 68, 84, (ctx) => drawBolsonaroFrame(ctx, 0));
    this.makeCanvasTexture('player_bolsonaro_walk', 68, 84, (ctx) => drawBolsonaroFrame(ctx, 4));

    // 4. Chunky Metal Slug Weapons: Heavy Machine Gun & "Arminha com a mão"
    this.makeCanvasTexture('weapon_rifle', 52, 22, (ctx) => {
      // Wooden stock
      this.drawOutlinedRect(ctx, 2, 8, 12, 10, '#8d6e63', '#bcaaa4', '#4e342e');
      // Heavy receiver & ammo drum
      this.drawOutlinedRect(ctx, 14, 4, 20, 12, '#2f3640', '#718093', '#1e272e');
      this.drawOutlinedRect(ctx, 20, 14, 10, 6, '#e1b12c', '#fbc531', '#c23616');
      // Thick barrel with heat vents
      this.drawOutlinedRect(ctx, 34, 6, 16, 8, '#57606f', '#a4b0be', '#2f3542');
      ctx.fillStyle = '#111';
      ctx.fillRect(37, 8, 3, 3);
      ctx.fillRect(43, 8, 3, 3);
    });

    this.makeCanvasTexture('weapon_arminha', 46, 28, (ctx) => {
      // Cuff of suit
      this.drawOutlinedRect(ctx, 2, 10, 10, 12, '#192a56', '#273c75', '#0c152c');
      // Big pixel hand making "arminha" 👉
      this.drawOutlinedRect(ctx, 12, 9, 16, 14, '#f5cba7', '#fdebd0', '#dc7633');
      // Extended index finger barrel
      this.drawOutlinedRect(ctx, 26, 10, 16, 7, '#f5cba7', '#fdebd0', '#dc7633');
      // Raised thumb hammer
      this.drawOutlinedRect(ctx, 16, 2, 8, 9, '#f5cba7', '#fdebd0', '#dc7633');
      // Glowing cyan/gold energy muzzle ring
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 3;
      ctx.strokeRect(38, 7, 6, 13);
    });

    // 5. Larger, High-Visibility Projectiles
    this.makeCanvasTexture('proj_bullet', 24, 12, (ctx) => {
      this.drawOutlinedRect(ctx, 2, 2, 20, 8, '#ff9f1a', '#fff200', '#e67e22');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(12, 4, 8, 4);
    });

    // Carteira de Trabalho (CTPS) - Bigger & Clearly Recognizable
    this.makeCanvasTexture('proj_ctps', 34, 26, (ctx) => {
      this.drawOutlinedRect(ctx, 2, 2, 30, 22, '#0984e3', '#74b9ff', '#0652dd');
      // Gold coat of arms in center
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(12, 6, 10, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 18, 20, 3);
    });

    // Laser da Arminha
    this.makeCanvasTexture('proj_laser', 30, 12, (ctx) => {
      this.drawOutlinedRect(ctx, 2, 2, 26, 8, '#00cec9', '#81ecec', '#00b894');
      ctx.fillStyle = '#fff200';
      ctx.fillRect(6, 4, 18, 4);
    });

    // Panfleto Vermelho
    this.makeCanvasTexture('proj_pamphlet', 24, 20, (ctx) => {
      this.drawOutlinedRect(ctx, 2, 2, 20, 16, '#eb2f06', '#ff6b6b', '#b71540');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 6, 12, 3);
      ctx.fillRect(6, 11, 9, 3);
    });

    // Projétil Inimigo / Metralhadora (Metal Slug Glowing Orb)
    this.makeCanvasTexture('proj_police', 20, 20, (ctx) => {
      ctx.fillStyle = '#141013';
      ctx.beginPath();
      ctx.arc(10, 10, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff3838';
      ctx.beginPath();
      ctx.arc(10, 10, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff200';
      ctx.beginPath();
      ctx.arc(8, 8, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Onda de Choque Musical (Glória Groove / Lula)
    this.makeCanvasTexture('proj_sonic', 38, 42, (ctx) => {
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#141013';
      ctx.beginPath();
      ctx.arc(14, 21, 15, -Math.PI / 2.1, Math.PI / 2.1);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ff00ff';
      ctx.beginPath();
      ctx.arc(14, 21, 15, -Math.PI / 2.1, Math.PI / 2.1);
      ctx.stroke();
      ctx.strokeStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(20, 21, 17, -Math.PI / 2.1, Math.PI / 2.1);
      ctx.stroke();
    });

    // Microfone Teleguiado (Erika Hilton)
    this.makeCanvasTexture('proj_mic', 30, 20, (ctx) => {
      this.drawOutlinedRect(ctx, 2, 5, 16, 10, '#fd79a8', '#ffb8b8', '#e84393');
      ctx.fillStyle = '#141013';
      ctx.beginPath();
      ctx.arc(21, 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(21, 10, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pão com Mortadela Explosivo (Boulos / Lula)
    this.makeCanvasTexture('proj_mortadela', 34, 28, (ctx) => {
      // Top & Bottom crusty bread roll
      this.drawOutlinedRect(ctx, 4, 4, 26, 9, '#e58e26', '#f8c291', '#b71540');
      this.drawOutlinedRect(ctx, 4, 16, 26, 8, '#e58e26', '#f8c291', '#b71540');
      // Thick folded pink mortadela layers
      this.drawOutlinedRect(ctx, 2, 11, 30, 7, '#fd79a8', '#ffcccc', '#e84393');
      // Lit fuse spark
      ctx.fillStyle = '#fff200';
      ctx.fillRect(15, 0, 5, 5);
    });

    // Cadeira do Datena (Inimigo - 40x40)
    this.makeCanvasTexture('proj_chair', 40, 40, (ctx) => {
      this.drawOutlinedRect(ctx, 8, 4, 22, 14, '#7f8fa6', '#dcdde1', '#353b48');
      this.drawOutlinedRect(ctx, 6, 18, 28, 7, '#c23616', '#e84118', '#8c7ae6');
      this.drawOutlinedRect(ctx, 8, 25, 5, 12, '#7f8fa6', '#dcdde1', '#353b48');
      this.drawOutlinedRect(ctx, 26, 25, 5, 12, '#7f8fa6', '#dcdde1', '#353b48');
    });

    // Cadeira Dourada Rebatida pelo Player (44x44)
    this.makeCanvasTexture('proj_chair_gold', 44, 44, (ctx) => {
      this.drawOutlinedRect(ctx, 8, 4, 26, 15, '#ffd700', '#fff200', '#e1b12c');
      this.drawOutlinedRect(ctx, 6, 19, 32, 8, '#00cec9', '#81ecec', '#00b894');
      this.drawOutlinedRect(ctx, 8, 27, 6, 14, '#ffd700', '#fff200', '#e1b12c');
      this.drawOutlinedRect(ctx, 29, 27, 6, 14, '#ffd700', '#fff200', '#e1b12c');
    });

    // 6. ENEMIES (All scaled up to rich Metal Slug proportions!)
    // Fase 1: Militante de Camiseta Vermelha (64x80)
    this.makeCanvasTexture('enemy_redshirt', 64, 80, (ctx) => {
      this.drawOutlinedRect(ctx, 16, 62, 14, 15, '#2f3640', '#57606f', '#1e272e');
      this.drawOutlinedRect(ctx, 34, 62, 14, 15, '#2f3640', '#57606f', '#1e272e');
      this.drawOutlinedRect(ctx, 16, 46, 32, 18, '#353b48', '#718093', '#1e272e');
      // Red T-shirt with white star
      this.drawOutlinedRect(ctx, 12, 26, 40, 22, '#e84118', '#ff6b6b', '#c23616');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(28, 32, 8, 8);
      // Big head + Red Cap
      this.drawOutlinedRect(ctx, 16, 6, 32, 22, '#f5cba7', '#fdebd0', '#dc7633');
      this.drawOutlinedRect(ctx, 14, 2, 38, 8, '#c23616', '#e84118', '#8b0000');
      ctx.fillStyle = '#111';
      ctx.fillRect(32, 13, 12, 4);
      ctx.fillRect(34, 21, 8, 3);
    });

    // Fase 1: Viatura da Polícia (132x70 - Chunky Metal Slug Armored Car)
    this.makeCanvasTexture('enemy_police_car', 132, 70, (ctx) => {
      // Main chassis
      this.drawOutlinedRect(ctx, 6, 26, 120, 30, '#f5f6fa', '#ffffff', '#dcdde1');
      // Cabin
      this.drawOutlinedRect(ctx, 28, 10, 72, 20, '#192a56', '#273c75', '#0c152c');
      // Windshield
      ctx.fillStyle = '#70a1ff';
      ctx.fillRect(34, 13, 26, 14);
      ctx.fillRect(66, 13, 26, 14);
      // Red & Blue Police stripe
      this.drawOutlinedRect(ctx, 12, 36, 108, 10, '#eb2f06', '#ff6b6b', '#b71540');
      // Siren lightbar
      this.drawOutlinedRect(ctx, 52, 2, 14, 8, '#ff0000', '#ff7675');
      this.drawOutlinedRect(ctx, 66, 2, 14, 8, '#0984e3', '#74b9ff');
      // Chunky tires with hubcaps
      this.drawOutlinedRect(ctx, 20, 48, 26, 20, '#1e272e', '#485460', '#000000');
      this.drawOutlinedRect(ctx, 86, 48, 26, 20, '#1e272e', '#485460', '#000000');
      ctx.fillStyle = '#dcdde1';
      ctx.fillRect(28, 54, 10, 8);
      ctx.fillRect(94, 54, 10, 8);
    });

    // Fase 1: Helicóptero da Polícia (136x72 - R-Shobu Metal Slug Style)
    this.makeCanvasTexture('enemy_police_heli', 136, 72, (ctx) => {
      // Tail boom
      this.drawOutlinedRect(ctx, 84, 24, 46, 14, '#2f3640', '#57606f', '#1e272e');
      // Main fuselage
      this.drawOutlinedRect(ctx, 20, 16, 72, 36, '#1e272e', '#485460', '#000000');
      // Bubble canopy
      this.drawOutlinedRect(ctx, 24, 20, 34, 22, '#00a8ff', '#70a1ff', '#0097e6');
      // Landing skids
      this.drawOutlinedRect(ctx, 22, 56, 68, 6, '#718093', '#dcdde1', '#2f3640');
      // Rotor mast & wide blade
      this.drawOutlinedRect(ctx, 50, 8, 10, 10, '#718093');
      this.drawOutlinedRect(ctx, 4, 2, 118, 6, '#dcdde1', '#ffffff', '#7f8fa6');
    });

    // Fase 1: Dançarino de Apoio (60x76)
    this.makeCanvasTexture('enemy_dancer', 60, 76, (ctx) => {
      this.drawOutlinedRect(ctx, 14, 58, 12, 15, '#00cec9', '#81ecec');
      this.drawOutlinedRect(ctx, 34, 58, 12, 15, '#00cec9', '#81ecec');
      this.drawOutlinedRect(ctx, 12, 26, 36, 32, '#e84393', '#fd79a8', '#b71540');
      this.drawOutlinedRect(ctx, 16, 6, 28, 22, '#e0ac69', '#f5cba7');
      this.drawOutlinedRect(ctx, 12, 2, 36, 8, '#ffd700', '#fff200');
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(22, 13, 18, 5);
    });

    // Fase 2: Robô Humanoide com Peruca Loira (66x84)
    this.makeCanvasTexture('enemy_blonde_robot', 66, 84, (ctx) => {
      // Heavy robotic legs
      this.drawOutlinedRect(ctx, 14, 62, 14, 18, '#57606f', '#a4b0be', '#2f3542');
      this.drawOutlinedRect(ctx, 36, 62, 14, 18, '#57606f', '#a4b0be', '#2f3542');
      // Chrome armored chest with power core
      this.drawOutlinedRect(ctx, 10, 28, 44, 34, '#7f8fa6', '#dcdde1', '#353b48');
      this.drawOutlinedRect(ctx, 24, 36, 16, 14, '#ff3838', '#ff9f1a', '#c23616');
      // Cyborg head with glowing red visor
      this.drawOutlinedRect(ctx, 16, 8, 34, 22, '#bdc3c7', '#ecf0f1', '#7f8c8d');
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(22, 15, 24, 6);
      // Giant Flamboyant Blonde Wig!
      this.drawOutlinedRect(ctx, 10, 2, 46, 10, '#fff200', '#ffffaa', '#e1b12c');
      this.drawOutlinedRect(ctx, 6, 8, 12, 24, '#fff200', '#ffffaa', '#e1b12c');
      this.drawOutlinedRect(ctx, 48, 8, 12, 24, '#fff200', '#ffffaa', '#e1b12c');
    });

    // Fase 2: Jato / Drone Caça (88x48)
    this.makeCanvasTexture('enemy_drone_jet', 88, 48, (ctx) => {
      // Swept wings
      this.drawOutlinedRect(ctx, 28, 4, 26, 40, '#8c7ae6', '#9c88ff', '#4834d4');
      // Fuselage
      this.drawOutlinedRect(ctx, 8, 16, 74, 16, '#6c5ce7', '#a29bfe', '#341f97');
      // Afterburner glow
      this.drawOutlinedRect(ctx, 2, 18, 10, 12, '#ff9f1a', '#fff200', '#eb2f06');
    });

    // Fase 3: Carro Popular com Escada no Teto (132x68)
    this.makeCanvasTexture('enemy_popular_car', 132, 68, (ctx) => {
      // Battered boxy body
      this.drawOutlinedRect(ctx, 6, 26, 120, 28, '#b33939', '#ff5252', '#702020');
      this.drawOutlinedRect(ctx, 26, 10, 74, 18, '#cd6133', '#ff793f', '#843b1c');
      ctx.fillStyle = '#81ecec';
      ctx.fillRect(32, 13, 28, 13);
      ctx.fillRect(66, 13, 28, 13);
      // Giant iconic Aluminum Ladder on the roof (velocidade máxima!)
      this.drawOutlinedRect(ctx, 14, 2, 104, 7, '#dfe6e9', '#ffffff', '#636e72');
      // Wheels
      this.drawOutlinedRect(ctx, 20, 46, 24, 18, '#1e272e', '#485460', '#000000');
      this.drawOutlinedRect(ctx, 86, 46, 24, 18, '#1e272e', '#485460', '#000000');
    });

    // Fase 3: Militante Ocupação Urbana (64x80)
    this.makeCanvasTexture('enemy_militant', 64, 80, (ctx) => {
      this.drawOutlinedRect(ctx, 16, 62, 14, 15, '#1e272e', '#485460');
      this.drawOutlinedRect(ctx, 34, 62, 14, 15, '#1e272e', '#485460');
      this.drawOutlinedRect(ctx, 16, 46, 32, 18, '#2d3436', '#636e72');
      this.drawOutlinedRect(ctx, 12, 26, 40, 22, '#b71540', '#eb2f06', '#6F1E51');
      this.drawOutlinedRect(ctx, 16, 6, 32, 22, '#f5cba7', '#fdebd0');
      this.drawOutlinedRect(ctx, 14, 2, 36, 8, '#eb2f06', '#ff6b6b');
      ctx.fillStyle = '#111';
      ctx.fillRect(28, 14, 16, 4);
    });

    // Fase 4: Clone do Datena com Cassetete/Cadeira (68x84)
    this.makeCanvasTexture('enemy_datena_clone', 68, 84, (ctx) => {
      this.drawOutlinedRect(ctx, 14, 64, 14, 16, '#1e272e', '#485460');
      this.drawOutlinedRect(ctx, 36, 64, 14, 16, '#1e272e', '#485460');
      // Stout TV Host Suit + Red Tie
      this.drawOutlinedRect(ctx, 8, 28, 46, 36, '#2f3640', '#57606f', '#1e272e');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(26, 28, 12, 22);
      ctx.fillStyle = '#e84118';
      ctx.fillRect(30, 30, 5, 20);
      // Big angry face
      this.drawOutlinedRect(ctx, 14, 6, 36, 24, '#f5cba7', '#fdebd0', '#dc7633');
      this.drawOutlinedRect(ctx, 14, 2, 36, 7, '#57606f', '#7f8fa6');
      // Heavy Baton held forward
      this.drawOutlinedRect(ctx, 52, 14, 10, 36, '#111111', '#485460', '#000000');
    });

    // 7. GIANT METAL SLUG STYLE BOSSES
    // Boss 1: Trio Elétrico da Glória Groove (220x150)
    this.makeCanvasTexture('boss_gloria_trio', 220, 150, (ctx) => {
      // Giant Armored Sound Truck Body
      this.drawOutlinedRect(ctx, 8, 42, 204, 82, '#8e44ad', '#9b59b6', '#5b2c6f');
      // Massive Speaker Wall ("Paredão de Som")
      this.drawOutlinedRect(ctx, 20, 52, 180, 62, '#1e272e', '#485460', '#000000');
      // 4 Giant Neon Subwoofers
      for (let sx = 45; sx <= 175; sx += 42) {
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(sx, 83, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(sx, 83, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      // Glória Groove on upper stage with golden cape
      this.drawOutlinedRect(ctx, 82, 4, 56, 38, '#ffd700', '#fff200', '#d4ac0d');
      this.drawOutlinedRect(ctx, 94, 10, 32, 30, '#e84393', '#fd79a8', '#b71540');
      // Giant Truck Tires
      this.drawOutlinedRect(ctx, 28, 114, 42, 32, '#1e272e', '#485460', '#000000');
      this.drawOutlinedRect(ctx, 150, 114, 42, 32, '#1e272e', '#485460', '#000000');
    });

    // Boss 2: Jato Executivo da Erika Hilton (204x96)
    this.makeCanvasTexture('boss_erika_jet', 204, 96, (ctx) => {
      // Tail fin
      this.drawOutlinedRect(ctx, 150, 4, 44, 34, '#e84393', '#fd79a8', '#b71540');
      // Main luxury supersonic fuselage
      this.drawOutlinedRect(ctx, 10, 32, 184, 40, '#fd79a8', '#ffcccc', '#e84393');
      // Gold royal trim stripe
      this.drawOutlinedRect(ctx, 24, 46, 156, 10, '#ffd700', '#fff200', '#d4ac0d');
      // Armored Glass Cockpit
      this.drawOutlinedRect(ctx, 26, 16, 62, 22, '#00cec9', '#81ecec', '#00b894');
      // Twin under-wing turbine pods
      this.drawOutlinedRect(ctx, 76, 68, 56, 20, '#2d3436', '#636e72', '#000000');
    });

    // Boss 3: Comandante Boulos (108x126)
    this.makeCanvasTexture('boss_boulos', 108, 126, (ctx) => {
      // Heavy boots
      this.drawOutlinedRect(ctx, 24, 96, 22, 26, '#1e272e', '#485460', '#000000');
      this.drawOutlinedRect(ctx, 62, 96, 22, 26, '#1e272e', '#485460', '#000000');
      // Jeans/Cargo pants
      this.drawOutlinedRect(ctx, 24, 72, 60, 26, '#2c3e50', '#34495e', '#1a252f');
      // Muscular Red Activist Jacket
      this.drawOutlinedRect(ctx, 16, 40, 76, 36, '#c0392b', '#e74c3c', '#922b21');
      // Big Boss Head + Thick Full Beard
      this.drawOutlinedRect(ctx, 26, 8, 56, 34, '#f5cba7', '#fdebd0', '#dc7633');
      this.drawOutlinedRect(ctx, 24, 24, 60, 18, '#2d3436', '#636e72', '#141013'); // Full Beard
      this.drawOutlinedRect(ctx, 24, 2, 60, 10, '#2d3436', '#636e72', '#141013'); // Hair
      // Angry Boss Eyes
      ctx.fillStyle = '#111111';
      ctx.fillRect(36, 16, 10, 6);
      ctx.fillRect(62, 16, 10, 6);
    });

    // Boss 4: Datena Supremo (112x130)
    this.makeCanvasTexture('boss_datena', 112, 130, (ctx) => {
      this.drawOutlinedRect(ctx, 26, 100, 22, 26, '#192a56', '#273c75', '#0c152c');
      this.drawOutlinedRect(ctx, 64, 100, 22, 26, '#192a56', '#273c75', '#0c152c');
      // Studio Shirt + Iconic Red Suspenders
      this.drawOutlinedRect(ctx, 16, 44, 80, 58, '#40739e', '#487eb0', '#273c75');
      this.drawOutlinedRect(ctx, 28, 44, 10, 56, '#e84118', '#ff6b6b', '#c23616');
      this.drawOutlinedRect(ctx, 74, 44, 10, 56, '#e84118', '#ff6b6b', '#c23616');
      // Giant Enraged Head
      this.drawOutlinedRect(ctx, 26, 10, 60, 36, '#f5cba7', '#fdebd0', '#dc7633');
      this.drawOutlinedRect(ctx, 26, 4, 60, 10, '#7f8fa6', '#dcdde1', '#353b48');
      // Holding a Metal Studio Chair ready to hurl!
      this.drawOutlinedRect(ctx, 2, 2, 26, 28, '#ffd700', '#fff200', '#e1b12c');
    });

    // Boss 5: Mecha-Lula Cúpula de Energia & Canhão Rotativo (196x196)
    this.makeCanvasTexture('boss_lula_dome', 196, 196, (ctx) => {
      // Heavy Metal Slug Mecha Base & Armor Plates
      this.drawOutlinedRect(ctx, 18, 106, 160, 76, '#b71540', '#eb2f06', '#6F1E51');
      // Golden Star / Core Emblem on Chassis
      this.drawOutlinedRect(ctx, 76, 122, 44, 44, '#ffd700', '#fff200', '#d4ac0d');
      // Armored Glass Energy Dome
      ctx.fillStyle = 'rgba(0, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(98, 102, 66, Math.PI, 0);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#00ffff';
      ctx.beginPath();
      ctx.arc(98, 102, 66, Math.PI, 0);
      ctx.stroke();

      // Lula Caricature piloting inside the dome (White hair, white beard, red suit)
      this.drawOutlinedRect(ctx, 68, 72, 60, 32, '#2f3640', '#57606f', '#1e272e');
      this.drawOutlinedRect(ctx, 72, 42, 52, 34, '#f5cba7', '#fdebd0', '#dc7633');
      // Fluffy White Hair & White Beard
      this.drawOutlinedRect(ctx, 68, 32, 60, 14, '#ecf0f1', '#ffffff', '#bdc3c7');
      this.drawOutlinedRect(ctx, 70, 62, 56, 18, '#ecf0f1', '#ffffff', '#bdc3c7');
      ctx.fillStyle = '#111111';
      ctx.fillRect(82, 50, 8, 6);
      ctx.fillRect(104, 50, 8, 6);
    });

    this.makeCanvasTexture('boss_lula_cannon', 150, 42, (ctx) => {
      this.drawOutlinedRect(ctx, 56, 8, 76, 26, '#2d3436', '#636e72', '#141013');
      this.drawOutlinedRect(ctx, 122, 4, 24, 34, '#eb2f06', '#ff6b6b', '#b71540');
      this.drawOutlinedRect(ctx, 68, 15, 46, 12, '#ffd700', '#fff200', '#d4ac0d');
    });
  }

  private createAnimations(): void {
    if (!this.anims.exists('soldier_run')) {
      this.anims.create({
        key: 'soldier_run',
        frames: [{ key: 'player_soldier' }, { key: 'player_soldier_walk' }],
        frameRate: 8,
        repeat: -1
      });
    }
    if (!this.anims.exists('bolsonaro_run')) {
      this.anims.create({
        key: 'bolsonaro_run',
        frames: [{ key: 'player_bolsonaro' }, { key: 'player_bolsonaro_walk' }],
        frameRate: 8,
        repeat: -1
      });
    }
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
