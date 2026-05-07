// ============================================================
// VictoryScene - Level complete celebration screen
// ============================================================
declare const Phaser: any;
import { LEVELS, getSaveData } from '../managers/LevelData';

export default class VictoryScene extends Phaser.Scene {
  private levelId = 1;
  private deaths = 0;
  private coins = 0;
  private completionTime = 0;
  private confettiTimer: any;

  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: any) {
    this.levelId = data?.levelId || 1;
    this.deaths = data?.deaths || 0;
    this.coins = data?.coins || 0;
    this.completionTime = data?.time || 0;
  }

  create() {
    const { width, height } = this.scale;
    const level = LEVELS.find(l => l.id === this.levelId) || LEVELS[0];
    const save = getSaveData();

    this.cameras.main.fadeIn(800, 0, 0, 0);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000022, 0x001133, 0x000022, 0x000011, 1);
    bg.fillRect(0, 0, width, height);

    // Stars rain
    this.startConfetti(width, height);

    // ── Main Panel ──
    const panelW = 700;
    const panelH = 480;
    const panelX = width / 2 - panelW / 2;
    const panelY = height / 2 - panelH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x000a22, 0.97);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 20);
    panel.lineStyle(3, Phaser.Display.Color.HexStringToColor(level.color1).color, 0.9);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 20);
    panel.lineStyle(1, Phaser.Display.Color.HexStringToColor(level.color1).color, 0.3);
    panel.strokeRoundedRect(panelX - 4, panelY - 4, panelW + 8, panelH + 8, 22);

    // ── LEVEL COMPLETE title ──
    const titleGlow = this.add.text(width / 2 + 3, panelY + 53, '⚡ LEVEL COMPLETE ⚡', {
      fontSize: '44px',
      fontFamily: 'Arial Black',
      color: '#003366',
    }).setOrigin(0.5);

    const title = this.add.text(width / 2, panelY + 50, '⚡ LEVEL COMPLETE ⚡', {
      fontSize: '44px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      shadow: { color: '#00ffff', blur: 30, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: { from: 0.9, to: 1 },
      scaleY: { from: 0.9, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 800,
      ease: 'Back.easeOut'
    });

    // Level name
    const nameText = this.add.text(width / 2, panelY + 100, `${this.levelId}. ${level.name}`, {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: level.color1,
      shadow: { color: level.color1, blur: 15, fill: true }
    }).setOrigin(0.5);

    // Difficulty
    this.add.text(width / 2, panelY + 130, level.difficulty, {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: level.diffColor,
      letterSpacing: 6
    }).setOrigin(0.5);

    // ── Stats ──
    const statY = panelY + 180;
    this.createStat(width / 2 - 180, statY, '💀 DEATHS', this.deaths.toString(), this.deaths === 0 ? '#00ff88' : '#ff4444');
    this.createStat(width / 2, statY, '⭐ COINS', `${this.coins}/${level.coins}`, '#ffcc00');
    this.createStat(width / 2 + 180, statY, '⏱ TIME', this.formatTime(this.completionTime), '#00aaff');

    // ── Stars ──
    const starY = panelY + 270;
    const maxStars = level.stars;
    const earnedStars = this.deaths <= 3 ? maxStars : this.deaths <= 10 ? Math.max(1, maxStars - 1) : 1;

    this.add.text(width / 2, starY - 20, 'RATING', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#334466', letterSpacing: 4
    }).setOrigin(0.5);

    for (let i = 0; i < 3; i++) {
      const sx = width / 2 - 40 + i * 40;
      const filled = i < earnedStars;
      const star = this.add.text(sx, starY + 10, filled ? '⭐' : '☆', {
        fontSize: '36px',
        color: filled ? '#ffdd00' : '#334455'
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: star,
        alpha: 1,
        scaleX: { from: 2, to: 1 },
        scaleY: { from: 2, to: 1 },
        delay: 600 + i * 200,
        duration: 400,
        ease: 'Back.easeOut'
      });
    }

    // ── Achievement check ──
    if (this.deaths === 0) {
      const badge = this.add.text(width / 2, starY + 70, '🏆 PERFECT RUN!', {
        fontSize: '20px',
        fontFamily: 'Arial Black',
        color: '#ffdd00',
        shadow: { color: '#ffaa00', blur: 15, fill: true }
      }).setOrigin(0.5);

      this.tweens.add({
        targets: badge,
        scaleX: { from: 0, to: 1 },
        scaleY: { from: 0, to: 1 },
        delay: 1400,
        duration: 500,
        ease: 'Back.easeOut'
      });
    }

    // ── Buttons ──
    const btnY = panelY + panelH - 60;
    this.createVictoryBtn(width / 2 - 180, btnY, '↩  RETRY', '#ffaa00', () => {
      this.stopConfetti();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('GameScene', { levelId: this.levelId });
        this.scene.launch('UIScene', { levelId: this.levelId });
      });
    });

    const nextId = this.levelId + 1;
    const nextUnlocked = (save.unlockedLevels || [1]).includes(nextId) || nextId <= 2;

    if (nextId <= LEVELS.length) {
      this.createVictoryBtn(width / 2, btnY, '▶  NEXT LEVEL', '#00ff88', () => {
        this.stopConfetti();
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
          this.scene.start('GameScene', { levelId: nextId });
          this.scene.launch('UIScene', { levelId: nextId });
        });
      });
    }

    this.createVictoryBtn(width / 2 + 180, btnY, '≡  LEVELS', '#00aaff', () => {
      this.stopConfetti();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('LevelSelectScene'));
    });
  }

  createStat(x: number, y: number, label: string, value: string, color: string) {
    const bg = this.add.graphics();
    bg.fillStyle(0x001133, 0.8);
    bg.fillRoundedRect(x - 80, y - 30, 160, 70, 10);
    bg.lineStyle(1.5, Phaser.Display.Color.HexStringToColor(color).color, 0.5);
    bg.strokeRoundedRect(x - 80, y - 30, 160, 70, 10);

    this.add.text(x, y - 12, label, {
      fontSize: '11px', fontFamily: 'Arial Black', color: '#aaaaaa', letterSpacing: 1
    }).setOrigin(0.5);

    this.add.text(x, y + 16, value, {
      fontSize: '26px', fontFamily: 'Arial Black', color: color,
      shadow: { color: color, blur: 10, fill: true }
    }).setOrigin(0.5);
  }

  createVictoryBtn(x: number, y: number, label: string, color: string, callback: () => void) {
    const colInt = Phaser.Display.Color.HexStringToColor(color).color;
    const bg = this.add.graphics();
    bg.fillStyle(0x001133, 0.95);
    bg.fillRoundedRect(x - 120, y - 22, 240, 44, 10);
    bg.lineStyle(2, colInt, 0.9);
    bg.strokeRoundedRect(x - 120, y - 22, 240, 44, 10);

    const text = this.add.text(x, y, label, {
      fontSize: '18px', fontFamily: 'Arial Black', color: color
    }).setOrigin(0.5);

    const zone = this.add.rectangle(x, y, 240, 44, 0, 0).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(colInt, 0.2);
      bg.fillRoundedRect(x - 120, y - 22, 240, 44, 10);
      bg.lineStyle(2.5, colInt, 1);
      bg.strokeRoundedRect(x - 120, y - 22, 240, 44, 10);
      this.tweens.add({ targets: text, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x001133, 0.95);
      bg.fillRoundedRect(x - 120, y - 22, 240, 44, 10);
      bg.lineStyle(2, colInt, 0.9);
      bg.strokeRoundedRect(x - 120, y - 22, 240, 44, 10);
      this.tweens.add({ targets: text, scaleX: 1, scaleY: 1, duration: 100 });
    });

    zone.on('pointerdown', callback);
  }

  startConfetti(w: number, h: number) {
    const colors = [0x00ffff, 0xff00ff, 0x00ff88, 0xffaa00, 0xff4488, 0xffffff, 0xffdd00];

    this.confettiTimer = this.time.addEvent({
      delay: 80,
      loop: true,
      callback: () => {
        if (!this.scene.isActive('VictoryScene')) return;
        for (let i = 0; i < 3; i++) {
          const col = colors[Phaser.Math.Between(0, colors.length - 1)];
          const x = Phaser.Math.Between(0, w);
          const p = this.add.graphics();
          const size = Phaser.Math.Between(4, 12);

          if (Math.random() > 0.5) {
            p.fillStyle(col, 1);
            p.fillRect(-size / 2, -size / 2, size, size);
          } else {
            p.fillStyle(col, 1);
            p.fillCircle(0, 0, size / 2);
          }

          p.x = x;
          p.y = -10;
          p.rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);

          this.tweens.add({
            targets: p,
            y: h + 20,
            x: x + Phaser.Math.Between(-80, 80),
            rotation: Phaser.Math.FloatBetween(-5, 5),
            alpha: { from: 1, to: 0.3 },
            duration: Phaser.Math.Between(1500, 3000),
            ease: 'Power1',
            onComplete: () => p.destroy()
          });
        }
      }
    });
  }

  stopConfetti() {
    if (this.confettiTimer) {
      this.confettiTimer.destroy();
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
