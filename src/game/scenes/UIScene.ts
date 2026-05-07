// ============================================================
// UIScene - HUD overlay running parallel to GameScene
// ============================================================
declare const Phaser: any;
import { LEVELS, getSaveData } from '../managers/LevelData';

export default class UIScene extends Phaser.Scene {
  private progressBar!: any;
  private progressFill!: any;
  private progressText!: any;
  private deathText!: any;
  private coinText!: any;
  private levelNameText!: any;
  private difficultyText!: any;
  private pauseOverlay!: any;
  private pauseContainer!: any;
  private levelId = 1;
  private isPaused = false;
  private beatTimer = 0;
  private levelConfig: any;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: any) {
    this.levelId = data?.levelId || 1;
    this.levelConfig = LEVELS.find((l: any) => l.id === this.levelId) || LEVELS[0];
  }

  create() {
    const { width, height } = this.scale;
    const gameScene = this.scene.get('GameScene');

    // Listen to game events
    gameScene.events.on('progressUpdate', (pct: number) => this.updateProgress(pct));
    gameScene.events.on('playerDied', (deaths: number) => this.updateDeaths(deaths));
    gameScene.events.on('coinCollected', (count: number) => this.updateCoins(count));
    gameScene.events.on('gamePaused', () => this.showPauseMenu());
    gameScene.events.on('gameResumed', () => this.hidePauseMenu());
    gameScene.events.on('levelStart', (data: any) => this.showLevelBanner(data));

    this.createHUD(width, height);
    this.createPauseMenu(width, height);
  }

  createHUD(w: number, h: number) {
    const color1 = this.levelConfig?.color1 || '#00ffff';
    const colInt = Phaser.Display.Color.HexStringToColor(color1).color;

    // ── Progress Bar ──
    const barW = w * 0.6;
    const barX = (w - barW) / 2;
    const barY = 12;

    // Background
    this.progressBar = this.add.graphics();
    this.progressBar.fillStyle(0x001133, 0.9);
    this.progressBar.fillRoundedRect(barX, barY, barW, 18, 6);
    this.progressBar.lineStyle(1.5, colInt, 0.7);
    this.progressBar.strokeRoundedRect(barX, barY, barW, 18, 6);

    // Fill
    this.progressFill = this.add.graphics();
    this.progressFill.fillGradientStyle(colInt, colInt, colInt, colInt, 1);
    this.progressFill.fillRoundedRect(barX + 2, barY + 2, 1, 14, 4);

    // Percentage text
    this.progressText = this.add.text(w / 2, barY + 9, '0%', {
      fontSize: '11px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      shadow: { color: '#000000', blur: 4, fill: true }
    }).setOrigin(0.5);

    // Start/End markers
    this.add.text(barX - 5, barY + 9, '▶', { fontSize: '10px', color: '#00ff88' }).setOrigin(1, 0.5);
    this.add.text(barX + barW + 5, barY + 9, '✓', { fontSize: '10px', color: '#ffaa00' }).setOrigin(0, 0.5);

    // ── Death Counter ──
    this.deathText = this.add.text(20, 45, '💀 0', {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#ff4444',
      shadow: { color: '#ff0000', blur: 8, fill: true }
    });

    // ── Coin Counter ──
    this.coinText = this.add.text(20, 70, '⭐ 0/' + this.levelConfig?.coins, {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#ffcc00',
      shadow: { color: '#ff8800', blur: 8, fill: true }
    });

    // ── Level Name ──
    this.levelNameText = this.add.text(w - 20, 45, `Level ${this.levelId}: ${this.levelConfig?.name || ''}`, {
      fontSize: '14px',
      fontFamily: 'Arial Black',
      color: color1,
      shadow: { color: color1, blur: 10, fill: true }
    }).setOrigin(1, 0);

    // ── Difficulty badge ──
    const diffColor = this.levelConfig?.diffColor || '#ffffff';
    this.difficultyText = this.add.text(w - 20, 65, this.levelConfig?.difficulty || '', {
      fontSize: '12px',
      fontFamily: 'Arial Black',
      color: diffColor,
    }).setOrigin(1, 0);

    // ── BPM indicator ──
    this.add.text(w / 2, barY + 34, `♪ ${this.levelConfig?.bpm || 0} BPM`, {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#334466',
      letterSpacing: 2
    }).setOrigin(0.5);

    // ── Pause hint ──
    this.add.text(w - 20, h - 20, 'ESC / P = Pause', {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#334455'
    }).setOrigin(1, 1);
  }

  showLevelBanner(data: any) {
    const { width, height } = this.scale;

    const banner = this.add.container(width / 2, height / 2 - 40);

    const bg = this.add.graphics();
    bg.fillStyle(0x000022, 0.85);
    bg.fillRoundedRect(-280, -50, 560, 100, 12);
    bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(data.diffColor || '#00ffff').color, 0.9);
    bg.strokeRoundedRect(-280, -50, 560, 100, 12);

    const title = this.add.text(0, -14, data.levelName || 'Level', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      shadow: { color: '#00ffff', blur: 20, fill: true }
    }).setOrigin(0.5);

    const diff = this.add.text(0, 24, `● ${data.difficulty || 'Easy'} ●`, {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: data.diffColor || '#00ff88',
      letterSpacing: 4
    }).setOrigin(0.5);

    banner.add([bg, title, diff]);
    banner.setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      y: height / 2 - 50,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(1800, () => {
          this.tweens.add({
            targets: banner,
            alpha: 0,
            y: height / 2 - 90,
            duration: 500,
            onComplete: () => banner.destroy()
          });
        });
      }
    });
  }

  updateProgress(pct: number) {
    const { width } = this.scale;
    const barW = width * 0.6;
    const barX = (width - barW) / 2;
    const color1 = this.levelConfig?.color1 || '#00ffff';
    const colInt = Phaser.Display.Color.HexStringToColor(color1).color;

    this.progressFill.clear();

    const fillW = Math.max(4, (barW - 4) * (pct / 100));

    // Gradient from color1 to color2
    const col2Int = Phaser.Display.Color.HexStringToColor(this.levelConfig?.color2 || '#ff00ff').color;
    this.progressFill.fillGradientStyle(colInt, col2Int, colInt, col2Int, 1);
    this.progressFill.fillRoundedRect(barX + 2, 14, fillW, 14, 4);

    // Glow tip
    this.progressFill.fillStyle(0xffffff, 0.8);
    this.progressFill.fillCircle(barX + 2 + fillW, 21, 5);

    this.progressText.setText(`${Math.floor(pct)}%`);

    // Pulse bar on high progress
    if (pct > 80) {
      this.progressBar.setAlpha(0.7 + 0.3 * Math.sin(this.time.now / 200));
    }
  }

  updateDeaths(deaths: number) {
    this.deathText.setText(`💀 ${deaths}`);
    this.tweens.add({
      targets: this.deathText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  }

  updateCoins(count: number) {
    this.coinText.setText(`⭐ ${count}/${this.levelConfig?.coins || 0}`);
    this.tweens.add({
      targets: this.coinText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 120,
      yoyo: true
    });
  }

  // ─── PAUSE MENU ───────────────────────────────────────────
  createPauseMenu(w: number, h: number) {
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x000000, 0.75);
    this.pauseOverlay.fillRect(0, 0, w, h);
    this.pauseOverlay.setVisible(false);

    this.pauseContainer = this.add.container(w / 2, h / 2);
    this.pauseContainer.setVisible(false);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000a22, 0.98);
    panel.fillRoundedRect(-200, -160, 400, 320, 16);
    panel.lineStyle(2.5, 0x00aaff, 0.9);
    panel.strokeRoundedRect(-200, -160, 400, 320, 16);

    const title = this.add.text(0, -120, '⏸ PAUSED', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      shadow: { color: '#00ffff', blur: 15, fill: true }
    }).setOrigin(0.5);

    const resumeBtn = this.createPauseBtn(0, -40, '▶  RESUME', '#00ff88', () => {
      const gameScene = this.scene.get('GameScene') as any;
      gameScene.togglePause();
    });

    const restartBtn = this.createPauseBtn(0, 30, '↩  RESTART', '#ffaa00', () => {
      this.hidePauseMenu();
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('GameScene', { levelId: this.levelId });
      this.scene.launch('UIScene', { levelId: this.levelId });
    });

    const quitBtn = this.createPauseBtn(0, 100, '✕  QUIT', '#ff4444', () => {
      this.hidePauseMenu();
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('LevelSelectScene');
    });

    this.pauseContainer.add([panel, title, ...resumeBtn, ...restartBtn, ...quitBtn]);
  }

  createPauseBtn(x: number, y: number, label: string, color: string, callback: () => void): any[] {
    const colInt = Phaser.Display.Color.HexStringToColor(color).color;
    const bg = this.add.graphics();
    bg.fillStyle(0x001133, 1);
    bg.fillRoundedRect(x - 150, y - 22, 300, 44, 8);
    bg.lineStyle(2, colInt, 0.8);
    bg.strokeRoundedRect(x - 150, y - 22, 300, 44, 8);

    const text = this.add.text(x, y, label, {
      fontSize: '22px',
      fontFamily: 'Arial Black',
      color: color
    }).setOrigin(0.5);

    const zone = this.add.rectangle(x, y, 300, 44, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(colInt, 0.2);
      bg.fillRoundedRect(x - 150, y - 22, 300, 44, 8);
      bg.lineStyle(2.5, colInt, 1);
      bg.strokeRoundedRect(x - 150, y - 22, 300, 44, 8);
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x001133, 1);
      bg.fillRoundedRect(x - 150, y - 22, 300, 44, 8);
      bg.lineStyle(2, colInt, 0.8);
      bg.strokeRoundedRect(x - 150, y - 22, 300, 44, 8);
    });

    zone.on('pointerdown', callback);

    return [bg, text, zone];
  }

  showPauseMenu() {
    this.isPaused = true;
    this.pauseOverlay.setVisible(true);
    this.pauseContainer.setVisible(true);
    this.pauseContainer.setAlpha(0);
    this.tweens.add({
      targets: this.pauseContainer,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }

  hidePauseMenu() {
    this.isPaused = false;
    this.tweens.add({
      targets: this.pauseContainer,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.pauseOverlay.setVisible(false);
        this.pauseContainer.setVisible(false);
      }
    });
  }

  update() {
    // Animate beat pulse on progress fill border
    this.beatTimer += 16;
  }
}
