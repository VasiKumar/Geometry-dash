// ============================================================
// PreloadScene - Generates all procedural game assets
// ============================================================
declare const Phaser: any;
const VISUAL_PROGRESS_DELAY_MS = 35;
const COMPLETION_DISPLAY_DELAY_MS = 250;

type DestroyableTimer = {
  destroy: () => void;
};

export default class PreloadScene extends Phaser.Scene {
  private loadingBar!: any;
  private loadingText!: any;
  private progressBox!: any;
  private visualProgress = 0;
  private visualProgressTimer?: DestroyableTimer;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    this.createLoadingUI();
    this.startVisualProgress();
    this.generateTextures();
    
    // Track loading progress
    this.load.on('progress', (value: number) => {
      this.visualProgress = Math.max(this.visualProgress, Math.floor(value * 100));
      this.updateVisualProgress();
    });
  }

  createLoadingUI() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Animated background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000022, 0x000044, 0x000022, 0x000000, 1);
    bg.fillRect(0, 0, width, height);

    // Neon grid lines
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x003366, 0.4);
    for (let x = 0; x < width; x += 60) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 60) {
      grid.lineBetween(0, y, width, y);
    }

    // Title
    const title = this.add.text(cx, cy - 120, '⚡ NEONDASH ⚡', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      stroke: '#0044aa',
      strokeThickness: 8,
      shadow: { color: '#00ffff', blur: 40, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      alpha: { from: 0.8, to: 1 },
      scaleX: { from: 0.98, to: 1.02 },
      scaleY: { from: 0.98, to: 1.02 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(cx, cy - 50, 'RHYTHM PLATFORMER', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ff00ff',
      letterSpacing: 8
    }).setOrigin(0.5);

    // Loading bar background
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x111133, 1);
    this.progressBox.fillRoundedRect(cx - 260, cy + 30, 520, 30, 6);
    this.progressBox.lineStyle(2, 0x00ffff, 0.8);
    this.progressBox.strokeRoundedRect(cx - 260, cy + 30, 520, 30, 6);

    // Loading bar fill
    this.loadingBar = this.add.graphics();
    this.loadingBar.fillGradientStyle(0x00ffff, 0xff00ff, 0x00ffff, 0xff00ff, 1);
    this.loadingBar.fillRect(cx - 256, cy + 34, 512, 22);
    this.loadingBar.scaleX = 0;

    this.loadingText = this.add.text(cx, cy + 80, 'Loading... 0%', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaff'
    }).setOrigin(0.5);

    // Animated particles
    for (let i = 0; i < 20; i++) {
      this.time.delayedCall(i * 150, () => this.spawnParticle(width, height));
    }
  }

  startVisualProgress() {
    this.visualProgress = 0;
    this.visualProgressTimer = this.time.addEvent({
      delay: VISUAL_PROGRESS_DELAY_MS,
      loop: true,
      callback: () => {
        if (this.visualProgress < 99) {
          this.visualProgress += 1;
          this.updateVisualProgress();
        }
      }
    });
  }

  updateVisualProgress() {
    const pct = Phaser.Math.Clamp(this.visualProgress, 0, 100);
    this.loadingBar.scaleX = pct / 100;
    this.loadingText.setText(`Loading... ${pct}%`);
  }

  spawnParticle(w: number, h: number) {
    const p = this.add.graphics();
    const x = Phaser.Math.Between(50, w - 50);
    const y = Phaser.Math.Between(50, h - 50);
    const size = Phaser.Math.Between(2, 6);
    const colors = [0x00ffff, 0xff00ff, 0x00ff88, 0xffaa00];
    const col = colors[Phaser.Math.Between(0, colors.length - 1)];
    p.fillStyle(col, 0.8);
    p.fillCircle(x, y, size);
    this.tweens.add({
      targets: p,
      alpha: 0,
      y: y - 60,
      duration: Phaser.Math.Between(1500, 3000),
      ease: 'Power2',
      onComplete: () => p.destroy()
    });
  }

  generateTextures() {
    // Generate all game textures procedurally using canvas
    this.generateCubeTexture();
    this.generateSpikeTexture();
    this.generatePlatformTexture();
    this.generateGroundTexture();
    this.generatePortalTextures();
    this.generateCoinTexture();
    this.generateCheckpointTexture();
    this.generateParticleTextures();
    this.generateBackgroundTextures();
    this.generateUITextures();
    this.generateMovingPlatformTexture();
    this.generateOrb();
  }

  generateCubeTexture() {
    // Main player cube - neon with inner glow
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const size = 40;
    
    // Outer glow
    g.fillStyle(0x00ffff, 0.15);
    g.fillRoundedRect(-8, -8, size + 16, size + 16, 8);
    
    // Cube body gradient effect
    g.fillStyle(0x003366, 1);
    g.fillRoundedRect(0, 0, size, size, 4);
    
    // Neon border
    g.lineStyle(3, 0x00ffff, 1);
    g.strokeRoundedRect(0, 0, size, size, 4);
    
    // Inner cross design
    g.lineStyle(1.5, 0x00ffff, 0.6);
    g.lineBetween(size/2, 4, size/2, size-4);
    g.lineBetween(4, size/2, size-4, size/2);
    
    // Corner accents
    g.fillStyle(0x00ffff, 1);
    g.fillCircle(8, 8, 2);
    g.fillCircle(size-8, 8, 2);
    g.fillCircle(8, size-8, 2);
    g.fillCircle(size-8, size-8, 2);
    
    g.generateTexture('cube', size, size);
    g.destroy();
  }

  generateSpikeTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Spike body - sharp triangle
    g.fillStyle(0xff4400, 1);
    g.fillTriangle(20, 0, 40, 40, 0, 40);
    
    // Neon outline
    g.lineStyle(2, 0xff8800, 1);
    g.strokeTriangle(20, 0, 40, 40, 0, 40);
    
    // Glow tip
    g.fillStyle(0xffff00, 1);
    g.fillCircle(20, 3, 3);
    
    g.generateTexture('spike', 40, 40);
    g.destroy();

    // Small spike variant
    const g2 = this.make.graphics({ x: 0, y: 0, add: false });
    g2.fillStyle(0xff4400, 1);
    g2.fillTriangle(15, 0, 30, 30, 0, 30);
    g2.lineStyle(2, 0xff8800, 1);
    g2.strokeTriangle(15, 0, 30, 30, 0, 30);
    g2.fillStyle(0xffff00, 0.9);
    g2.fillCircle(15, 3, 2);
    g2.generateTexture('spike_small', 30, 30);
    g2.destroy();

    // Big spike
    const g3 = this.make.graphics({ x: 0, y: 0, add: false });
    g3.fillStyle(0xff2200, 1);
    g3.fillTriangle(30, 0, 60, 60, 0, 60);
    g3.lineStyle(3, 0xff6600, 1);
    g3.strokeTriangle(30, 0, 60, 60, 0, 60);
    g3.fillStyle(0xffff00, 1);
    g3.fillCircle(30, 4, 4);
    g3.generateTexture('spike_big', 60, 60);
    g3.destroy();
  }

  generatePlatformTexture() {
    // Standard platform
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x1a3355, 1);
    g.fillRect(0, 0, 200, 20);
    g.lineStyle(2, 0x00aaff, 0.9);
    g.strokeRect(0, 0, 200, 20);
    g.fillStyle(0x00aaff, 0.4);
    g.fillRect(4, 4, 192, 4);
    g.generateTexture('platform', 200, 20);
    g.destroy();
  }

  generateMovingPlatformTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x1a4422, 1);
    g.fillRect(0, 0, 160, 20);
    g.lineStyle(2, 0x00ff88, 0.9);
    g.strokeRect(0, 0, 160, 20);
    g.fillStyle(0x00ff88, 0.4);
    g.fillRect(4, 4, 152, 4);
    // Arrow indicator
    g.fillStyle(0x00ff88, 0.8);
    g.fillTriangle(75, 4, 85, 10, 75, 16);
    g.generateTexture('platform_moving', 160, 20);
    g.destroy();
  }

  generateGroundTexture() {
    // Ground tile
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x0a1a33, 1);
    g.fillRect(0, 0, 40, 40);
    g.lineStyle(1, 0x002266, 1);
    g.strokeRect(0, 0, 40, 40);
    g.fillStyle(0x003399, 0.3);
    g.fillRect(2, 2, 36, 8);
    g.generateTexture('ground', 40, 40);
    g.destroy();
  }

  generatePortalTextures() {
    // Jump portal (double jump)
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x00ff88, 0.2);
    g.fillCircle(25, 50, 25);
    g.lineStyle(3, 0x00ff88, 1);
    g.strokeCircle(25, 50, 23);
    g.fillStyle(0x00ff88, 0.8);
    g.fillCircle(25, 50, 10);
    // Arrow up
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(25, 35, 33, 48, 17, 48);
    g.generateTexture('portal_jump', 50, 100);
    g.destroy();

    // Gravity portal (flip)
    const g2 = this.make.graphics({ x: 0, y: 0, add: false });
    g2.fillStyle(0xff00ff, 0.2);
    g2.fillCircle(25, 50, 25);
    g2.lineStyle(3, 0xff00ff, 1);
    g2.strokeCircle(25, 50, 23);
    g2.fillStyle(0xff00ff, 0.8);
    g2.fillCircle(25, 50, 10);
    g2.fillStyle(0xffffff, 1);
    g2.fillTriangle(25, 65, 33, 52, 17, 52);
    g2.generateTexture('portal_gravity', 50, 100);
    g2.destroy();

    // Speed portal
    const g3 = this.make.graphics({ x: 0, y: 0, add: false });
    g3.fillStyle(0xffaa00, 0.2);
    g3.fillCircle(25, 50, 25);
    g3.lineStyle(3, 0xffaa00, 1);
    g3.strokeCircle(25, 50, 23);
    g3.fillStyle(0xffaa00, 0.8);
    g3.fillCircle(25, 50, 10);
    g3.fillStyle(0xffffff, 1);
    g3.fillTriangle(15, 50, 30, 40, 30, 60);
    g3.fillTriangle(25, 50, 40, 40, 40, 60);
    g3.generateTexture('portal_speed', 50, 100);
    g3.destroy();
  }

  generateCoinTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer glow
    g.fillStyle(0xffdd00, 0.2);
    g.fillCircle(15, 15, 15);
    // Coin
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(15, 15, 11);
    g.fillStyle(0xffee44, 1);
    g.fillCircle(15, 15, 8);
    g.lineStyle(2, 0xff8800, 1);
    g.strokeCircle(15, 15, 11);
    // Star inside
    g.fillStyle(0xff8800, 0.8);
    g.fillCircle(15, 15, 3);
    g.generateTexture('coin', 30, 30);
    g.destroy();
  }

  generateCheckpointTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Flag pole
    g.fillStyle(0xaaaaaa, 1);
    g.fillRect(10, 0, 4, 60);
    // Flag
    g.fillStyle(0x00ff88, 1);
    g.fillTriangle(14, 5, 35, 15, 14, 25);
    g.lineStyle(2, 0x00ffaa, 1);
    g.strokeTriangle(14, 5, 35, 15, 14, 25);
    g.generateTexture('checkpoint', 40, 60);
    g.destroy();
  }

  generateParticleTextures() {
    // Generic circle particle
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();

    // Star particle
    const g2 = this.make.graphics({ x: 0, y: 0, add: false });
    g2.fillStyle(0xffffff, 1);
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 6 : 3;
      const a = (i * Math.PI * 2) / 10 - Math.PI / 2;
      pts.push(6 + r * Math.cos(a));
      pts.push(6 + r * Math.sin(a));
    }
    g2.fillPoints(
      pts.reduce((acc: any[], v, i) => {
        if (i % 2 === 0) acc.push({ x: pts[i], y: pts[i + 1] });
        return acc;
      }, []),
      true
    );
    g2.generateTexture('star_particle', 12, 12);
    g2.destroy();

    // Square particle
    const g3 = this.make.graphics({ x: 0, y: 0, add: false });
    g3.fillStyle(0xffffff, 1);
    g3.fillRect(0, 0, 6, 6);
    g3.generateTexture('square_particle', 6, 6);
    g3.destroy();
  }

  generateBackgroundTextures() {
    // Background themes as gradients
    const themes = [
      { key: 'bg_easy', c1: 0x000033, c2: 0x000066, c3: 0x001155, c4: 0x000022 },
      { key: 'bg_normal', c1: 0x001a00, c2: 0x003300, c3: 0x002200, c4: 0x000d00 },
      { key: 'bg_hard', c1: 0x1a0000, c2: 0x330011, c3: 0x220008, c4: 0x0d0000 },
      { key: 'bg_harder', c1: 0x0d0022, c2: 0x1a0044, c3: 0x0d0033, c4: 0x060011 },
      { key: 'bg_insane', c1: 0x220011, c2: 0x440022, c3: 0x330019, c4: 0x11000b },
      { key: 'bg_demon', c1: 0x110000, c2: 0x220000, c3: 0x1a0000, c4: 0x080000 },
    ];

    themes.forEach(t => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillGradientStyle(t.c1, t.c2, t.c3, t.c4, 1);
      g.fillRect(0, 0, 1280, 720);
      g.generateTexture(t.key, 1280, 720);
      g.destroy();
    });
  }

  generateUITextures() {
    // Button texture
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x001133, 1);
    g.fillRoundedRect(0, 0, 200, 50, 8);
    g.lineStyle(2, 0x00aaff, 1);
    g.strokeRoundedRect(0, 0, 200, 50, 8);
    g.generateTexture('btn_normal', 200, 50);
    g.destroy();

    // Panel texture
    const g2 = this.make.graphics({ x: 0, y: 0, add: false });
    g2.fillStyle(0x000a1a, 0.95);
    g2.fillRoundedRect(0, 0, 400, 300, 12);
    g2.lineStyle(2, 0x0044aa, 0.8);
    g2.strokeRoundedRect(0, 0, 400, 300, 12);
    g2.generateTexture('panel', 400, 300);
    g2.destroy();
  }

  generateOrb() {
    // Orb for jump boost on platforms
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffff00, 0.3);
    g.fillCircle(15, 15, 15);
    g.fillStyle(0xffff00, 1);
    g.fillCircle(15, 15, 10);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(11, 11, 4);
    g.lineStyle(2, 0xffaa00, 1);
    g.strokeCircle(15, 15, 13);
    g.generateTexture('orb', 30, 30);
    g.destroy();
  }

  create() {
    if (this.visualProgressTimer) {
      this.visualProgressTimer.destroy();
      this.visualProgressTimer = undefined;
    }
    this.visualProgress = 100;
    this.updateVisualProgress();
    this.time.delayedCall(COMPLETION_DISPLAY_DELAY_MS, () => this.scene.start('MainMenuScene'));
  }
}
