// ============================================================
// MainMenuScene - Animated main menu with neon effects
// ============================================================
declare const Phaser: any;

export default class MainMenuScene extends Phaser.Scene {
  private particles: any[] = [];
  private bgGraphics!: any;
  private gridGraphics!: any;
  private demoRunner!: any;
  private runnerTrails: any[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.particles = [];
    this.runnerTrails = [];

    this.createAnimatedBackground(width, height);
    this.createDemoRunner(width, height);
    this.createLogo(width, height);
    this.createMenuButtons(width, height);
    this.createFloatingParticles(width, height);
    this.createBottomInfo(width, height);

    // Play menu music (simulated with oscillation effects)
    this.cameras.main.fadeIn(800, 0, 0, 0);
  }

  createAnimatedBackground(w: number, h: number) {
    // Deep space background
    this.bgGraphics = this.add.graphics();
    this.bgGraphics.fillGradientStyle(0x000011, 0x000033, 0x00001a, 0x000022, 1);
    this.bgGraphics.fillRect(0, 0, w, h);

    // Animated stars
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(0, h);
      const size = Phaser.Math.FloatBetween(0.5, 2.5);
      const star = this.add.graphics();
      star.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1));
      star.fillCircle(x, y, size);
      
      // Twinkling effect
      this.tweens.add({
        targets: star,
        alpha: { from: Phaser.Math.FloatBetween(0.1, 0.4), to: 1 },
        duration: Phaser.Math.Between(800, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
        ease: 'Sine.easeInOut'
      });
    }

    // Neon grid
    this.gridGraphics = this.add.graphics();
    this.drawNeonGrid(w, h);

    // Scrolling scanlines
    const scanlines = this.add.graphics();
    for (let y = 0; y < h; y += 4) {
      scanlines.lineStyle(1, 0x000000, 0.12);
      scanlines.lineBetween(0, y, w, y);
    }

    // Glowing horizon line
    const horizon = this.add.graphics();
    horizon.lineStyle(3, 0x00ffff, 0.6);
    horizon.lineBetween(0, h * 0.72, w, h * 0.72);
    horizon.lineStyle(1, 0x00ffff, 0.2);
    horizon.lineBetween(0, h * 0.72 + 4, w, h * 0.72 + 4);

    // Animated glow on horizon
    this.tweens.add({
      targets: horizon,
      alpha: { from: 0.5, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  drawNeonGrid(w: number, h: number) {
    this.gridGraphics.clear();
    const gridColor = 0x003366;
    const alpha = 0.35;
    
    // Perspective grid lines converging at horizon
    const horizonY = h * 0.72;
    const vp = { x: w / 2, y: horizonY };
    
    // Vertical perspective lines
    for (let i = -12; i <= 12; i++) {
      const bottomX = w / 2 + i * 80;
      this.gridGraphics.lineStyle(1, gridColor, alpha * (1 - Math.abs(i) / 14));
      this.gridGraphics.lineBetween(vp.x, vp.y, bottomX, h);
    }
    
    // Horizontal grid lines
    for (let j = 0; j < 8; j++) {
      const t = j / 8;
      const y = horizonY + (h - horizonY) * (t * t);
      this.gridGraphics.lineStyle(1, gridColor, alpha * (1 - j / 10));
      this.gridGraphics.lineBetween(0, y, w, y);
    }
  }

  createDemoRunner(w: number, h: number) {
    // Small animated cube running across the menu
    this.demoRunner = this.add.graphics();
    this.drawCube(this.demoRunner, 0, 0, 30, 0x00ffff, 0x003366);
    this.demoRunner.x = -50;
    this.demoRunner.y = h * 0.72 - 35;

    // Run animation
    this.tweens.add({
      targets: this.demoRunner,
      x: w + 50,
      duration: 4000,
      ease: 'Linear',
      repeat: -1,
      onUpdate: () => {
        this.demoRunner.rotation += 0.05;
        this.spawnTrail(this.demoRunner.x, this.demoRunner.y);
      }
    });
  }

  spawnTrail(x: number, y: number) {
    const trail = this.add.graphics();
    trail.fillStyle(0x00ffff, 0.5);
    trail.fillRect(-15, -15, 30, 30);
    trail.x = x;
    trail.y = y;
    trail.rotation = this.demoRunner.rotation;
    this.runnerTrails.push(trail);

    this.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        trail.destroy();
        const idx = this.runnerTrails.indexOf(trail);
        if (idx > -1) this.runnerTrails.splice(idx, 1);
      }
    });
  }

  drawCube(g: any, x: number, y: number, size: number, borderColor: number, fillColor: number) {
    g.clear();
    g.fillStyle(fillColor, 1);
    g.fillRoundedRect(x - size / 2, y - size / 2, size, size, 4);
    g.lineStyle(2.5, borderColor, 1);
    g.strokeRoundedRect(x - size / 2, y - size / 2, size, size, 4);
    g.fillStyle(borderColor, 0.6);
    g.fillCircle(x - size / 4, y - size / 4, 3);
    g.fillCircle(x + size / 4, y - size / 4, 3);
    g.fillCircle(x - size / 4, y + size / 4, 3);
    g.fillCircle(x + size / 4, y + size / 4, 3);
  }

  createLogo(w: number, h: number) {
    // Main logo background glow
    const glowRect = this.add.graphics();
    glowRect.fillStyle(0x00ffff, 0.05);
    glowRect.fillRoundedRect(w / 2 - 320, 60, 640, 160, 20);

    // ⚡ Logo text with layered glow effect
    const logoShadow = this.add.text(w / 2 + 4, 134, '⚡ NEONDASH ⚡', {
      fontSize: '80px',
      fontFamily: 'Arial Black',
      color: '#003366',
    }).setOrigin(0.5).setAlpha(0.6);

    const logo = this.add.text(w / 2, 130, '⚡ NEONDASH ⚡', {
      fontSize: '80px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      stroke: '#0044aa',
      strokeThickness: 6,
      shadow: { color: '#00ffff', blur: 40, fill: true }
    }).setOrigin(0.5);

    const subtitle = this.add.text(w / 2, 200, 'RHYTHM  PLATFORMER', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ff00ff',
      letterSpacing: 12,
      shadow: { color: '#ff00ff', blur: 10, fill: true }
    }).setOrigin(0.5);

    // Pulsing glow animation
    this.tweens.add({
      targets: logo,
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 1.03 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle color cycle
    this.tweens.add({
      targets: subtitle,
      alpha: { from: 0.7, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Version tag
    this.add.text(w - 20, h - 20, 'v1.0', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#334455'
    }).setOrigin(1, 1);
  }

  createMenuButtons(w: number, h: number) {
    const buttons = [
      { label: '▶  PLAY', scene: 'LevelSelectScene', color: '#00ffff', glow: 0x00ffff },
      { label: '🎨  CUSTOMIZE', scene: 'CustomizeScene', color: '#ff00ff', glow: 0xff00ff },
      { label: '🏆  CREDITS', scene: 'CreditsScene', color: '#ffaa00', glow: 0xffaa00 },
    ];

    const startY = h / 2 - 40;

    buttons.forEach((btn, i) => {
      const by = startY + i * 90;
      const bx = w / 2;

      // Button background
      const bg = this.add.graphics();
      bg.fillStyle(0x001133, 0.9);
      bg.fillRoundedRect(bx - 180, by - 28, 360, 56, 10);
      bg.lineStyle(2.5, Phaser.Display.Color.HexStringToColor(btn.color).color, 0.8);
      bg.strokeRoundedRect(bx - 180, by - 28, 360, 56, 10);

      // Shimmer overlay
      const shimmer = this.add.graphics();
      shimmer.fillStyle(0xffffff, 0.05);
      shimmer.fillRoundedRect(bx - 180, by - 28, 360, 20, { tl: 10, tr: 10, bl: 0, br: 0 });

      // Button text
      const text = this.add.text(bx, by, btn.label, {
        fontSize: '28px',
        fontFamily: 'Arial Black',
        color: btn.color,
        shadow: { color: btn.color, blur: 15, fill: true }
      }).setOrigin(0.5);

      // Hit zone
      const hitZone = this.add.rectangle(bx, by, 360, 56, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      hitZone.on('pointerover', () => {
        this.tweens.add({
          targets: [bg, text],
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150,
          ease: 'Power2'
        });
        bg.clear();
        bg.fillStyle(Phaser.Display.Color.HexStringToColor(btn.color).color, 0.15);
        bg.fillRoundedRect(bx - 180, by - 28, 360, 56, 10);
        bg.lineStyle(3, Phaser.Display.Color.HexStringToColor(btn.color).color, 1);
        bg.strokeRoundedRect(bx - 180, by - 28, 360, 56, 10);
        this.cameras.main.shake(50, 0.001);
      });

      hitZone.on('pointerout', () => {
        this.tweens.add({
          targets: [bg, text],
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2'
        });
        bg.clear();
        bg.fillStyle(0x001133, 0.9);
        bg.fillRoundedRect(bx - 180, by - 28, 360, 56, 10);
        bg.lineStyle(2.5, Phaser.Display.Color.HexStringToColor(btn.color).color, 0.8);
        bg.strokeRoundedRect(bx - 180, by - 28, 360, 56, 10);
      });

      hitZone.on('pointerdown', () => {
        this.cameras.main.shake(100, 0.008);
        this.cameras.main.flash(200, 0, 255, 255);
        this.time.delayedCall(250, () => {
          this.cameras.main.fadeOut(400, 0, 0, 0);
          this.time.delayedCall(400, () => {
            this.scene.start(btn.scene);
          });
        });
      });

      // Stagger entrance animation
      bg.setAlpha(0);
      text.setAlpha(0);
      this.tweens.add({
        targets: [bg, text, shimmer],
        alpha: 1,
        y: `+=${0}`,
        duration: 600,
        delay: 300 + i * 150,
        ease: 'Power2'
      });
    });
  }

  createFloatingParticles(w: number, h: number) {
    // Spawn floating neon particles continuously
    this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        if (!this.scene.isActive('MainMenuScene')) return;
        const colors = [0x00ffff, 0xff00ff, 0x00ff88, 0xffaa00, 0xff4488];
        const color = colors[Phaser.Math.Between(0, colors.length - 1)];
        const x = Phaser.Math.Between(0, w);
        const p = this.add.graphics();
        const size = Phaser.Math.Between(2, 5);
        p.fillStyle(color, 0.8);
        p.fillCircle(size, size, size);
        p.x = x;
        p.y = h + 10;

        this.tweens.add({
          targets: p,
          y: -20,
          x: x + Phaser.Math.Between(-80, 80),
          alpha: { from: 0.8, to: 0 },
          duration: Phaser.Math.Between(3000, 6000),
          ease: 'Power1',
          onComplete: () => p.destroy()
        });
      }
    });
  }

  createBottomInfo(w: number, h: number) {
    this.add.text(w / 2, h - 40, 'CLICK  /  SPACE  /  TAP  TO  JUMP', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#334466',
      letterSpacing: 4
    }).setOrigin(0.5);

    // Blinking cursor
    const cursor = this.add.text(w / 2, h - 20, '▼', {
      fontSize: '14px',
      color: '#00ffff'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: cursor,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  update() {
    // Slowly rotate grid for dynamic feel
    // (Re-draw with slight offset)
  }
}
