// ============================================================
// CreditsScene - Cinematic credits with animations
// ============================================================
declare const Phaser: any;
import { getSaveData } from '../managers/LevelData';

export default class CreditsScene extends Phaser.Scene {
  private creditsContainer!: any;
  private scrollTween: any;

  constructor() {
    super({ key: 'CreditsScene' });
  }

  create() {
    const { width, height } = this.scale;
    const save = getSaveData();

    this.cameras.main.fadeIn(800, 0, 0, 0);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000011, 0x000033, 0x00001a, 0x000022, 1);
    bg.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 150; i++) {
      const star = this.add.graphics();
      star.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.8));
      star.fillCircle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.5, 2)
      );
      this.tweens.add({
        targets: star,
        alpha: 0,
        duration: Phaser.Math.Between(1500, 4000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000)
      });
    }

    // Top gradient overlay
    const topGrad = this.add.graphics();
    topGrad.fillGradientStyle(0x000011, 0x000011, 0x000011, 0x000011, 1, 1, 0, 0);
    topGrad.fillRect(0, 0, width, 80);
    topGrad.setDepth(10);

    const bottomGrad = this.add.graphics();
    bottomGrad.fillGradientStyle(0x000011, 0x000011, 0x000011, 0x000011, 0, 0, 1, 1);
    bottomGrad.fillRect(0, height - 80, width, 80);
    bottomGrad.setDepth(10);

    // Back button
    const backBtn = this.add.text(60, 40, '← BACK', {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#00aaff',
      shadow: { color: '#00aaff', blur: 10, fill: true }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(11);

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#00aaff'));
    backBtn.on('pointerdown', () => {
      if (this.scrollTween) this.scrollTween.stop();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => this.scene.start('MainMenuScene'));
    });

    // Stats panel
    this.createStatsPanel(width, save);

    // Credits content
    this.creditsContainer = this.add.container(width / 2, height + 100);
    this.buildCreditsContent(width);

    // Achievement section
    this.createAchievements(width, height, save);
  }

  createStatsPanel(w: number, save: any) {
    const completed = (save.completedLevels || []).length;
    const pct = Math.floor((completed / 20) * 100);

    const panel = this.add.graphics();
    panel.fillStyle(0x001133, 0.85);
    panel.fillRoundedRect(w / 2 - 280, 70, 560, 80, 10);
    panel.lineStyle(2, 0x0044aa, 0.7);
    panel.strokeRoundedRect(w / 2 - 280, 70, 560, 80, 10);

    const stats = [
      { label: 'LEVELS', value: `${completed}/20`, color: '#00ffff' },
      { label: 'DEATHS', value: String(save.deaths || 0), color: '#ff4444' },
      { label: 'COINS', value: String(save.totalCoins || 0), color: '#ffcc00' },
      { label: 'COMPLETION', value: `${pct}%`, color: '#00ff88' },
    ];

    stats.forEach((stat, i) => {
      const x = w / 2 - 200 + i * 135;
      this.add.text(x, 95, stat.label, {
        fontSize: '10px', fontFamily: 'Arial Black', color: '#334466', letterSpacing: 2
      }).setOrigin(0.5);

      this.add.text(x, 118, stat.value, {
        fontSize: '22px', fontFamily: 'Arial Black', color: stat.color,
        shadow: { color: stat.color, blur: 8, fill: true }
      }).setOrigin(0.5);
    });
  }

  buildCreditsContent(w: number) {
    const sections: { title?: string; items?: string[]; color?: string; big?: boolean; gap?: number }[] = [
      { title: '⚡ NEONDASH ⚡', color: '#00ffff', big: true },
      { title: 'RHYTHM PLATFORMER', color: '#ff00ff' },
      { gap: 40 },
      { title: 'GAME DESIGN', color: '#00ffff' },
      { items: ['NeonDash Team', 'Level Architecture', 'Gameplay Systems', 'Difficulty Balancing'] },
      { gap: 30 },
      { title: 'PROGRAMMING', color: '#ff00ff' },
      { items: ['Phaser 3 Game Engine', 'Physics Engine: Arcade', 'Rendering: WebGL/Canvas', 'UI & Scene System'] },
      { gap: 30 },
      { title: 'VISUAL DESIGN', color: '#00ff88' },
      { items: ['Neon Aesthetic Design', 'Particle Systems', 'Procedural Textures', 'Animation Systems'] },
      { gap: 30 },
      { title: 'MUSIC & AUDIO', color: '#ffaa00' },
      { items: ['Synthwave BPM Sync', 'Beat Detection System', 'Dynamic Audio Layers', 'Rhythm Mechanics'] },
      { gap: 30 },
      { title: 'LEVELS', color: '#ff4488' },
      { items: [
        'Level 01: Neon Genesis (Easy)',
        'Level 02: Cyber Grid (Easy)',
        'Level 03: Electric Storm (Normal)',
        'Level 04: Digital Horizon (Normal)',
        'Level 05: Plasma Surge (Hard)',
        'Level 06: Void Circuit (Hard)',
        'Level 07: Quantum Break (Harder)',
        'Level 08: Stellar Collapse (Harder)',
        'Level 09: Hypernova (Insane)',
        'Level 10: Dark Matter (Insane)',
        'Level 11: Inferno Gate (Demon)',
        'Level 12: Void Reaper (Demon)',
        'Level 13: Abyss Protocol (Extreme Demon)',
        'Level 14: Singularity (Extreme Demon)',
        'Level 15: OMEGA CORE (Extreme Demon)',
        'Level 16: Shadow Realm (Demon)',
        'Level 17: Neural Storm (Insane)',
        'Level 18: Crystal Cave (Harder)',
        'Level 19: Lava Fields (Hard)',
        'Level 20: Rainbow Road (Secret)',
      ]},
      { gap: 30 },
      { title: 'TECHNOLOGY', color: '#aaaaff' },
      { items: ['Built with Phaser 3.86', 'React + TypeScript', 'Vite Build System', 'WebGL Rendering'] },
      { gap: 40 },
      { title: 'THANK YOU FOR PLAYING!', color: '#ffdd00', big: true },
      { title: '⚡ Keep Dashing! ⚡', color: '#00ffff' },
      { gap: 60 },
    ];

    let currentY = 0;
    const items: any[] = [];

    sections.forEach(section => {
      if (section.gap) {
        currentY += section.gap;
        return;
      }

      if (section.title) {
        const col = section.color || '#ffffff';
        const size = section.big ? '38px' : '22px';
        const t = this.add.text(0, currentY, section.title, {
          fontSize: size,
          fontFamily: 'Arial Black',
          color: col,
          shadow: { color: col, blur: 15, fill: true }
        }).setOrigin(0.5);
        items.push(t);
        currentY += section.big ? 60 : 40;

        // Underline for section titles
        if (!section.big) {
          const line = this.add.graphics();
          line.lineStyle(1, Phaser.Display.Color.HexStringToColor(col).color, 0.5);
          line.lineBetween(-150, currentY - 15, 150, currentY - 15);
          items.push(line);
        }
      }

      if (section.items) {
        section.items.forEach(item => {
          const t = this.add.text(0, currentY, item, {
            fontSize: '16px', fontFamily: 'Arial', color: '#aaaacc'
          }).setOrigin(0.5);
          items.push(t);
          currentY += 26;
        });
      }
    });

    this.creditsContainer.add(items);

    // Scroll animation
    const { height } = this.scale;
    const totalHeight = currentY + height;
    const duration = totalHeight * 12; // Speed of scroll

    this.scrollTween = this.tweens.add({
      targets: this.creditsContainer,
      y: -currentY,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.cameras.main.fadeOut(800, 0, 0, 0);
        this.time.delayedCall(800, () => this.scene.start('MainMenuScene'));
      }
    });
  }

  createAchievements(w: number, h: number, save: any) {
    // Achievement system shown in credits
    const achievements = [
      { name: 'First Steps', desc: 'Complete Level 1', unlocked: (save.completedLevels || []).includes(1), icon: '🎮' },
      { name: 'Survivor', desc: 'Complete any level with 0 deaths', unlocked: false, icon: '💎' },
      { name: 'Coin Hunter', desc: 'Collect 10+ coins', unlocked: (save.totalCoins || 0) >= 10, icon: '⭐' },
      { name: 'Demon Slayer', desc: 'Complete a Demon level', unlocked: (save.completedLevels || []).some((id: number) => id >= 11 && id <= 12), icon: '😈' },
      { name: 'Legend', desc: 'Complete OMEGA CORE', unlocked: (save.completedLevels || []).includes(15), icon: '🏆' },
    ];

    // These show briefly then scroll with content
  }
}
