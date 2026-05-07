// ============================================================
// GameOverScene - Death screen (not currently used - inline death)
// ============================================================
declare const Phaser: any;

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(_data: any) {}

  create() {
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, height / 2, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#ff4444'
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }
}
