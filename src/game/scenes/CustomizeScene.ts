// ============================================================
// CustomizeScene - Player customization with color pickers
// ============================================================
declare const Phaser: any;
import { getSaveData, setSaveData } from '../managers/LevelData';

export default class CustomizeScene extends Phaser.Scene {
  private saveData: any;
  private previewCube!: any;
  private trailPreview: any[] = [];
  private selectedCubeColor = '#00ffff';
  private selectedTrailColor = '#ff00ff';
  private selectedSkin = 'default';
  private previewAngle = 0;

  constructor() {
    super({ key: 'CustomizeScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.saveData = getSaveData();
    this.selectedCubeColor = this.saveData.cubeColor || '#00ffff';
    this.selectedTrailColor = this.saveData.trailColor || '#ff00ff';
    this.selectedSkin = this.saveData.selectedSkin || 'default';

    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.createBackground(width, height);
    this.createHeader(width, height);
    this.createColorPickers(width, height);
    this.createSkinSelector(width, height);
    this.createPreview(width, height);
    this.createSaveButton(width, height);
  }

  createBackground(w: number, h: number) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000022, 0x000044, 0x00001a, 0x000033, 1);
    bg.fillRect(0, 0, w, h);

    for (let i = 0; i < 60; i++) {
      const star = this.add.graphics();
      star.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.8));
      star.fillCircle(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h), Phaser.Math.FloatBetween(0.5, 1.5));
      this.tweens.add({
        targets: star, alpha: 0, duration: Phaser.Math.Between(1500, 3000),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000)
      });
    }

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x003366, 0.2);
    for (let x = 0; x < w; x += 60) grid.lineBetween(x, 0, x, h);
    for (let y = 0; y < h; y += 60) grid.lineBetween(0, y, w, y);
  }

  createHeader(w: number, h: number) {
    const backBtn = this.add.text(60, 40, '← BACK', {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#00aaff',
      shadow: { color: '#00aaff', blur: 10, fill: true }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#00aaff'));
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('MainMenuScene'));
    });

    this.add.text(w / 2, 45, '🎨 CUSTOMIZE CUBE', {
      fontSize: '40px', fontFamily: 'Arial Black', color: '#00ffff',
      stroke: '#0044aa', strokeThickness: 4,
      shadow: { color: '#00ffff', blur: 20, fill: true }
    }).setOrigin(0.5);

    const divider = this.add.graphics();
    divider.lineStyle(2, 0x0044aa, 0.8);
    divider.lineBetween(40, 80, w - 40, 80);
  }

  createColorPickers(w: number, _h: number) {
    // ── Cube Color ──
    const cubeColors = [
      '#00ffff', '#ff00ff', '#00ff88', '#ffaa00',
      '#ff4488', '#ff0000', '#00aaff', '#ffffff',
      '#ff6600', '#aa00ff', '#ffff00', '#88ff00',
    ];

    this.add.text(w / 2 - 280, 115, 'CUBE COLOR', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#aaaaff', letterSpacing: 4
    }).setOrigin(0.5);

    cubeColors.forEach((color, i) => {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x = w / 2 - 400 + col * 60 + 30;
      const y = 145 + row * 60;

      const colInt = Phaser.Display.Color.HexStringToColor(color).color;

      const swatch = this.add.graphics();
      this.drawSwatch(swatch, x, y, colInt, color === this.selectedCubeColor);

      const zone = this.add.rectangle(x, y, 44, 44, 0, 0).setInteractive({ useHandCursor: true });

      zone.on('pointerdown', () => {
        this.selectedCubeColor = color;
        this.updateAllSwatches('cube', cubeColors, x, y);
        this.updatePreview();
      });
    });

    // ── Trail Color ──
    const trailColors = [
      '#ff00ff', '#00ffff', '#ffaa00', '#ff4488',
      '#00ff88', '#aa00ff', '#ffffff', '#ff6600',
      '#00aaff', '#ffff00', '#ff0000', '#88ff00',
    ];

    this.add.text(w / 2 + 110, 115, 'TRAIL COLOR', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#aaaaff', letterSpacing: 4
    }).setOrigin(0.5);

    trailColors.forEach((color, i) => {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x = w / 2 + 20 + col * 60 + 30;
      const y = 145 + row * 60;
      const colInt = Phaser.Display.Color.HexStringToColor(color).color;

      const swatch = this.add.graphics();
      this.drawSwatch(swatch, x, y, colInt, color === this.selectedTrailColor);

      const zone = this.add.rectangle(x, y, 44, 44, 0, 0).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        this.selectedTrailColor = color;
        this.updatePreview();
      });
    });
  }

  drawSwatch(g: any, x: number, y: number, color: number, selected: boolean) {
    g.clear();
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - 20, y - 20, 40, 40, 6);

    if (selected) {
      g.lineStyle(3, 0xffffff, 1);
      g.strokeRoundedRect(x - 22, y - 22, 44, 44, 7);
      g.fillStyle(0xffffff, 0.3);
      g.fillRoundedRect(x - 20, y - 20, 40, 12, { tl: 6, tr: 6, bl: 0, br: 0 });
    } else {
      g.lineStyle(1, color, 0.5);
      g.strokeRoundedRect(x - 20, y - 20, 40, 40, 6);
    }
  }

  updateAllSwatches(_type: string, _colors: string[], _selX: number, _selY: number) {
    // Re-draw swatches with updated selection
    this.updatePreview();
  }

  createSkinSelector(w: number, _h: number) {
    const skins = [
      { id: 'default', name: 'Default', icon: '⬛', unlocked: true },
      { id: 'neon', name: 'Neon', icon: '💎', unlocked: true },
      { id: 'fire', name: 'Fire', icon: '🔥', unlocked: (getSaveData().completedLevels || []).length >= 5 },
      { id: 'galaxy', name: 'Galaxy', icon: '🌌', unlocked: (getSaveData().completedLevels || []).length >= 10 },
      { id: 'demon', name: 'Demon', icon: '😈', unlocked: (getSaveData().completedLevels || []).some((id: number) => id >= 11) },
    ];

    this.add.text(w / 2, 290, 'CUBE SKINS', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#aaaaff', letterSpacing: 4
    }).setOrigin(0.5);

    const totalW = skins.length * 110;
    const startX = w / 2 - totalW / 2 + 55;

    skins.forEach((skin, i) => {
      const x = startX + i * 110;
      const y = 340;

      const isSelected = this.selectedSkin === skin.id;
      const colInt = skin.unlocked ? 0x001133 : 0x0a0a15;
      const borderInt = skin.unlocked ? (isSelected ? 0x00ffff : 0x334455) : 0x222233;

      const bg = this.add.graphics();
      bg.fillStyle(colInt, 1);
      bg.fillRoundedRect(x - 45, y - 40, 90, 80, 10);
      bg.lineStyle(2, borderInt, 1);
      bg.strokeRoundedRect(x - 45, y - 40, 90, 80, 10);

      this.add.text(x, y - 18, skin.icon, { fontSize: '28px' }).setOrigin(0.5);
      this.add.text(x, y + 16, skin.name, {
        fontSize: '11px', fontFamily: 'Arial Black',
        color: skin.unlocked ? (isSelected ? '#00ffff' : '#aaaacc') : '#334455'
      }).setOrigin(0.5);

      if (!skin.unlocked) {
        this.add.text(x, y + 30, '🔒', { fontSize: '12px' }).setOrigin(0.5);
      }

      if (skin.unlocked) {
        const zone = this.add.rectangle(x, y, 90, 80, 0, 0).setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => {
          this.selectedSkin = skin.id;
          this.updatePreview();
        });
      }
    });
  }

  createPreview(w: number, h: number) {
    // Preview panel on right side
    const panelX = w - 220;
    const panelY = 110;

    const panel = this.add.graphics();
    panel.fillStyle(0x000a22, 0.9);
    panel.fillRoundedRect(panelX, panelY, 180, 260, 12);
    panel.lineStyle(2, 0x0044aa, 0.8);
    panel.strokeRoundedRect(panelX, panelY, 180, 260, 12);

    this.add.text(panelX + 90, panelY + 20, 'PREVIEW', {
      fontSize: '12px', fontFamily: 'Arial Black', color: '#334466', letterSpacing: 4
    }).setOrigin(0.5);

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(0x001133, 1);
    ground.fillRect(panelX + 10, panelY + 200, 160, 50);
    ground.lineStyle(2, 0x00aaff, 0.5);
    ground.lineBetween(panelX + 10, panelY + 200, panelX + 170, panelY + 200);

    // Trail preview dots
    for (let i = 0; i < 5; i++) {
      const trailDot = this.add.graphics();
      const alpha = (i / 5) * 0.6;
      trailDot.setAlpha(alpha);
      this.trailPreview.push({ graphics: trailDot, offsetX: -(i + 1) * 20 });
    }

    // Preview cube
    this.previewCube = this.add.graphics();
    this.drawPreviewCube(panelX + 90, panelY + 175);

    // Animate preview
    this.tweens.add({
      targets: this.previewCube,
      y: -30,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  drawPreviewCube(x: number, y: number) {
    this.previewCube.clear();
    this.previewCube.x = x;
    this.previewCube.y = y;

    const colInt = Phaser.Display.Color.HexStringToColor(this.selectedCubeColor).color;
    const r = Phaser.Display.Color.IntegerToColor(colInt).r;
    const g = Phaser.Display.Color.IntegerToColor(colInt).g;
    const b = Phaser.Display.Color.IntegerToColor(colInt).b;
    const darkCol = Phaser.Display.Color.GetColor(Math.floor(r * 0.2), Math.floor(g * 0.2), Math.floor(b * 0.2));

    const size = 40;

    // Glow
    this.previewCube.fillStyle(colInt, 0.15);
    this.previewCube.fillRoundedRect(-size / 2 - 8, -size / 2 - 8, size + 16, size + 16, 8);

    // Body
    this.previewCube.fillStyle(darkCol, 1);
    this.previewCube.fillRoundedRect(-size / 2, -size / 2, size, size, 5);

    // Border
    this.previewCube.lineStyle(3, colInt, 1);
    this.previewCube.strokeRoundedRect(-size / 2, -size / 2, size, size, 5);

    // Inner cross
    this.previewCube.lineStyle(1.5, colInt, 0.6);
    this.previewCube.lineBetween(0, -size / 2 + 4, 0, size / 2 - 4);
    this.previewCube.lineBetween(-size / 2 + 4, 0, size / 2 - 4, 0);

    // Corner dots
    this.previewCube.fillStyle(colInt, 1);
    this.previewCube.fillCircle(-size / 4, -size / 4, 3);
    this.previewCube.fillCircle(size / 4, -size / 4, 3);
    this.previewCube.fillCircle(-size / 4, size / 4, 3);
    this.previewCube.fillCircle(size / 4, size / 4, 3);
  }

  updatePreview() {
    this.drawPreviewCube(this.previewCube.x, this.previewCube.y);
  }

  createSaveButton(w: number, h: number) {
    const x = w / 2 - 100;
    const y = h - 50;

    const bg = this.add.graphics();
    bg.fillStyle(0x003311, 1);
    bg.fillRoundedRect(x - 140, y - 24, 280, 48, 10);
    bg.lineStyle(2.5, 0x00ff88, 1);
    bg.strokeRoundedRect(x - 140, y - 24, 280, 48, 10);

    const text = this.add.text(x, y, '✓  SAVE CUSTOMIZATION', {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#00ff88',
      shadow: { color: '#00ff88', blur: 10, fill: true }
    }).setOrigin(0.5);

    const zone = this.add.rectangle(x, y, 280, 48, 0, 0).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x00ff88, 0.2);
      bg.fillRoundedRect(x - 140, y - 24, 280, 48, 10);
      bg.lineStyle(3, 0x00ff88, 1);
      bg.strokeRoundedRect(x - 140, y - 24, 280, 48, 10);
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x003311, 1);
      bg.fillRoundedRect(x - 140, y - 24, 280, 48, 10);
      bg.lineStyle(2.5, 0x00ff88, 1);
      bg.strokeRoundedRect(x - 140, y - 24, 280, 48, 10);
    });

    zone.on('pointerdown', () => {
      // Save to localStorage
      const save = getSaveData();
      save.cubeColor = this.selectedCubeColor;
      save.trailColor = this.selectedTrailColor;
      save.selectedSkin = this.selectedSkin;
      setSaveData(save);

      // Success flash
      this.cameras.main.flash(300, 0, 255, 136);
      this.tweens.add({
        targets: text,
        scaleX: 1.15, scaleY: 1.15,
        duration: 100, yoyo: true
      });

      // Saved popup
      const saved = this.add.text(x, y - 50, '✓ SAVED!', {
        fontSize: '20px', fontFamily: 'Arial Black', color: '#00ff88',
        shadow: { color: '#00ff88', blur: 10, fill: true }
      }).setOrigin(0.5);

      this.tweens.add({
        targets: saved,
        y: saved.y - 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => saved.destroy()
      });
    });

    // Reset button
    const resetX = x + 220;
    const resetBg = this.add.graphics();
    resetBg.fillStyle(0x110000, 1);
    resetBg.fillRoundedRect(resetX - 80, y - 24, 160, 48, 10);
    resetBg.lineStyle(2, 0xff4444, 0.8);
    resetBg.strokeRoundedRect(resetX - 80, y - 24, 160, 48, 10);

    this.add.text(resetX, y, '↩ RESET', {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#ff4444'
    }).setOrigin(0.5);

    const resetZone = this.add.rectangle(resetX, y, 160, 48, 0, 0).setInteractive({ useHandCursor: true });
    resetZone.on('pointerdown', () => {
      this.selectedCubeColor = '#00ffff';
      this.selectedTrailColor = '#ff00ff';
      this.selectedSkin = 'default';
      this.updatePreview();
    });
  }

  update() {
    this.previewAngle += 0.02;
    this.previewCube.rotation = Math.sin(this.previewAngle) * 0.3;
  }
}
