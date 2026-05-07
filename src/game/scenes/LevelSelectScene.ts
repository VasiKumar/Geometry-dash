// ============================================================
// LevelSelectScene - Beautiful level selection with scroll
// ============================================================
declare const Phaser: any;
import { LEVELS, getSaveData, isLevelUnlocked, getLevelProgress } from '../managers/LevelData';

export default class LevelSelectScene extends Phaser.Scene {
  private currentPage = 0;
  private levelsPerPage = 10;
  private saveData: any;

  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create() {
    this.saveData = getSaveData();
    const { width, height } = this.scale;

    this.createBackground(width, height);
    this.createHeader(width, height);
    this.createLevelGrid(width, height);
    this.createNavigation(width, height);

    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  createBackground(w: number, h: number) {
    // Deep space gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000022, 0x000044, 0x00001a, 0x000033, 1);
    bg.fillRect(0, 0, w, h);

    // Animated stars
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(0, h);
      const star = this.add.graphics();
      star.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 0.9));
      star.fillCircle(x, y, Phaser.Math.FloatBetween(0.5, 1.5));
      this.tweens.add({
        targets: star,
        alpha: 0,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }

    // Scanlines
    const scan = this.add.graphics();
    for (let y = 0; y < h; y += 4) {
      scan.lineStyle(1, 0x000000, 0.1);
      scan.lineBetween(0, y, w, y);
    }
  }

  createHeader(w: number, h: number) {
    // Back button
    const backBtn = this.add.text(60, 40, '← BACK', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#00aaff',
      shadow: { color: '#00aaff', blur: 10, fill: true }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#00aaff'));
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('MainMenuScene'));
    });

    // Title
    this.add.text(w / 2, 45, '⚡ SELECT LEVEL ⚡', {
      fontSize: '40px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      stroke: '#0044aa',
      strokeThickness: 4,
      shadow: { color: '#00ffff', blur: 20, fill: true }
    }).setOrigin(0.5);

    // Stats
    const completed = (this.saveData.completedLevels || []).length;
    const total = LEVELS.length;
    this.add.text(w / 2, 85, `${completed}/${total} Completed  •  Deaths: ${this.saveData.deaths || 0}  •  Coins: ${this.saveData.totalCoins || 0}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaaaff',
      letterSpacing: 2
    }).setOrigin(0.5);

    // Divider
    const divider = this.add.graphics();
    divider.lineStyle(2, 0x0044aa, 0.8);
    divider.lineBetween(40, 110, w - 40, 110);
  }

  createLevelGrid(w: number, h: number) {
    const cols = 5;
    const rows = 4;
    const cardW = 220;
    const cardH = 120;
    const gapX = 24;
    const gapY = 20;
    const startX = (w - (cols * cardW + (cols - 1) * gapX)) / 2;
    const startY = 130;

    const pageStart = this.currentPage * this.levelsPerPage;
    const pageEnd = Math.min(pageStart + this.levelsPerPage, LEVELS.length);

    for (let i = pageStart; i < pageEnd; i++) {
      const level = LEVELS[i];
      const localIdx = i - pageStart;
      const col = localIdx % cols;
      const row = Math.floor(localIdx / cols);
      const cx = startX + col * (cardW + gapX) + cardW / 2;
      const cy = startY + row * (cardH + gapY) + cardH / 2;

      this.createLevelCard(cx, cy, cardW, cardH, level, i);
    }
  }

  createLevelCard(cx: number, cy: number, cw: number, ch: number, level: any, idx: number) {
    const unlocked = isLevelUnlocked(level.id);
    const completed = (this.saveData.completedLevels || []).includes(level.id);
    const progress = getLevelProgress(level.id);

    const borderCol = unlocked
      ? Phaser.Display.Color.HexStringToColor(level.color1).color
      : 0x334455;

    // Card background
    const card = this.add.graphics();
    card.fillStyle(unlocked ? 0x001133 : 0x0a0a15, 0.95);
    card.fillRoundedRect(cx - cw / 2, cy - ch / 2, cw, ch, 10);
    card.lineStyle(unlocked ? 2.5 : 1, borderCol, unlocked ? 1 : 0.3);
    card.strokeRoundedRect(cx - cw / 2, cy - ch / 2, cw, ch, 10);

    if (completed) {
      // Completion glow
      card.lineStyle(1, 0x00ff88, 0.4);
      card.strokeRoundedRect(cx - cw / 2 - 3, cy - ch / 2 - 3, cw + 6, ch + 6, 12);
    }

    // Level number badge
    const numBg = this.add.graphics();
    numBg.fillStyle(borderCol, 0.3);
    numBg.fillCircle(cx - cw / 2 + 22, cy - ch / 2 + 18, 16);

    this.add.text(cx - cw / 2 + 22, cy - ch / 2 + 18, `${level.id}`, {
      fontSize: '14px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5);

    if (!unlocked) {
      // Lock icon
      this.add.text(cx, cy, '🔒', { fontSize: '32px' }).setOrigin(0.5);
      this.add.text(cx, cy + 30, 'LOCKED', {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#334455',
        letterSpacing: 3
      }).setOrigin(0.5);
      return;
    }

    // Level name
    this.add.text(cx, cy - 22, level.name, {
      fontSize: '15px',
      fontFamily: 'Arial Black',
      color: level.color1,
      shadow: { color: level.color1, blur: 8, fill: true }
    }).setOrigin(0.5);

    // Difficulty badge
    const diffBg = this.add.graphics();
    diffBg.fillStyle(Phaser.Display.Color.HexStringToColor(level.diffColor).color, 0.25);
    diffBg.fillRoundedRect(cx - 55, cy - 5, 110, 22, 6);

    this.add.text(cx, cy + 6, level.difficulty.toUpperCase(), {
      fontSize: '11px',
      fontFamily: 'Arial Black',
      color: level.diffColor,
      letterSpacing: 2
    }).setOrigin(0.5);

    // Stars
    const maxStars = level.stars;
    const earnedStars = completed ? maxStars : 0;
    for (let s = 0; s < maxStars; s++) {
      const filled = s < earnedStars;
      this.add.text(cx - (maxStars - 1) * 10 + s * 20, cy + 30, filled ? '⭐' : '☆', {
        fontSize: '14px',
        color: filled ? '#ffdd00' : '#334455'
      }).setOrigin(0.5);
    }

    // Progress bar
    if (progress > 0 && !completed) {
      const barW = cw - 30;
      const barX = cx - barW / 2;
      const barY = cy + ch / 2 - 18;
      const progBar = this.add.graphics();
      progBar.fillStyle(0x001a33, 1);
      progBar.fillRect(barX, barY, barW, 8);
      progBar.fillStyle(Phaser.Display.Color.HexStringToColor(level.color1).color, 1);
      progBar.fillRect(barX, barY, barW * (progress / 100), 8);

      this.add.text(cx + barW / 2 + 5, barY + 4, `${Math.floor(progress)}%`, {
        fontSize: '9px',
        fontFamily: 'Arial',
        color: level.color1
      }).setOrigin(0, 0.5);
    }

    if (completed) {
      this.add.text(cx + cw / 2 - 14, cy - ch / 2 + 14, '✓', {
        fontSize: '16px',
        color: '#00ff88',
        shadow: { color: '#00ff88', blur: 8, fill: true }
      }).setOrigin(0.5);
    }

    // Click to play
    const hitZone = this.add.rectangle(cx, cy, cw, ch, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    hitZone.on('pointerover', () => {
      this.tweens.add({ targets: card, scaleX: 1.04, scaleY: 1.04, duration: 120 });
    });

    hitZone.on('pointerout', () => {
      this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 120 });
    });

    hitZone.on('pointerdown', () => {
      this.cameras.main.flash(200, 0, 200, 255);
      this.cameras.main.shake(100, 0.005);
      this.time.delayedCall(200, () => {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
          this.scene.start('GameScene', { levelId: level.id });
          this.scene.launch('UIScene', { levelId: level.id });
        });
      });
    });

    // Entrance animation
    card.setAlpha(0);
    this.tweens.add({
      targets: card,
      alpha: 1,
      delay: idx * 50,
      duration: 300
    });
  }

  createNavigation(w: number, h: number) {
    const totalPages = Math.ceil(LEVELS.length / this.levelsPerPage);
    
    if (totalPages <= 1) return;

    const prevBtn = this.add.text(w / 2 - 80, h - 40, '◀ PREV', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: this.currentPage > 0 ? '#00ffff' : '#334455'
    }).setOrigin(0.5);

    const pageText = this.add.text(w / 2, h - 40, `${this.currentPage + 1} / ${totalPages}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aaaaff'
    }).setOrigin(0.5);

    const nextBtn = this.add.text(w / 2 + 80, h - 40, 'NEXT ▶', {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: this.currentPage < totalPages - 1 ? '#00ffff' : '#334455'
    }).setOrigin(0.5);

    if (this.currentPage > 0) {
      prevBtn.setInteractive({ useHandCursor: true });
      prevBtn.on('pointerdown', () => {
        this.currentPage--;
        this.scene.restart();
      });
    }

    if (this.currentPage < totalPages - 1) {
      nextBtn.setInteractive({ useHandCursor: true });
      nextBtn.on('pointerdown', () => {
        this.currentPage++;
        this.scene.restart();
      });
    }
  }
}
