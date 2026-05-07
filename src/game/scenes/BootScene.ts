// ============================================================
// BootScene - First scene that runs, sets up game globals
// ============================================================
declare const Phaser: any;

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load minimal assets needed for the loading screen
    this.createLoadingGraphics();
  }

  createLoadingGraphics() {
    // We'll create procedural graphics so no external assets needed for boot
    const graphics = this.add.graphics();
    
    // Animated neon background
    graphics.fillGradientStyle(0x000000, 0x000011, 0x000022, 0x000011, 1);
    graphics.fillRect(0, 0, 1280, 720);

    // Logo text
    const logo = this.add.text(640, 300, 'NEONDASH', {
      fontSize: '72px',
      fontFamily: 'Arial Black',
      color: '#00ffff',
      stroke: '#0088ff',
      strokeThickness: 6,
      shadow: { color: '#00ffff', blur: 30, fill: true }
    });
    logo.setOrigin(0.5);

    const sub = this.add.text(640, 390, 'Loading...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      alpha: 0.7
    });
    sub.setOrigin(0.5);

    // Pulse animation on logo
    this.tweens.add({
      targets: logo,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  create() {
    // Initialize save data in localStorage if not present
    this.initSaveData();
    
    // Transition to preload
    this.time.delayedCall(500, () => {
      this.scene.start('PreloadScene');
    });
  }

  initSaveData() {
    const defaultData = {
      unlockedLevels: [1],
      completedLevels: [],
      levelStats: {},
      deaths: 0,
      totalCoins: 0,
      achievements: [],
      cubeColor: '#00ffff',
      trailColor: '#ff00ff',
      selectedSkin: 'default',
      volume: 0.7,
      sfxVolume: 0.8,
      fullscreen: false,
    };

    const existing = localStorage.getItem('neonDashSave');
    if (!existing) {
      localStorage.setItem('neonDashSave', JSON.stringify(defaultData));
    } else {
      try {
        // Merge defaults with existing to handle new fields
        const parsed = JSON.parse(existing);
        const merged = { ...defaultData, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
        localStorage.setItem('neonDashSave', JSON.stringify(merged));
      } catch {
        // Recover from corrupted save data to avoid blocking scene startup
        localStorage.setItem('neonDashSave', JSON.stringify(defaultData));
      }
    }
  }
}
