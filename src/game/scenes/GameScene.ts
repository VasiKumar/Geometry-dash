// ============================================================
// GameScene - Core gameplay scene
// ============================================================
declare const Phaser: any;
import { LEVELS, LevelConfig, getSaveData, setSaveData } from '../managers/LevelData';

export default class GameScene extends Phaser.Scene {
  // Player
  private player!: any;
  private playerTrails: any[] = [];
  private lastTrailTime = 0;

  // Physics groups
  private groundGroup!: any;
  private obstacleGroup!: any;
  private platformGroup!: any;
  private portalGroup!: any;
  private coinGroup!: any;
  private checkpointGroup!: any;
  private orbGroup!: any;

  // Level state
  private levelConfig!: LevelConfig;
  private levelId = 1;
  private scrollX = 0;
  private scrollSpeed = 300;
  private isGameOver = false;
  private isVictory = false;
  private isPaused = false;
  private gravityFlipped = false;
  private canDoubleJump = false;
  private hasDoubleJumped = false;
  private isOnGround = false;
  private deaths = 0;
  private coinsCollected: number[] = [];
  private checkpointReached = false;
  private checkpointX = 0;
  private checkpointScrollX = 0;
  private bestProgress = 0;
  private startTime = 0;

  // Visual
  private bgGraphics!: any;
  private fgGraphics!: any;
  private groundGraphics!: any;
  private particleEmitter: any = null;
  private beatTimer = 0;
  private bpm = 130;
  private beatInterval = 0;
  private neonPulse = 0;
  private bgObjects: any[] = [];
  private movingPlatforms: { obj: any, baseY: number, amp: number, spd: number, phase: number }[] = [];

  // UI references (via events)
  private progressPct = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: any) {
    this.levelId = data?.levelId || 1;
    this.isGameOver = false;
    this.isVictory = false;
    this.isPaused = false;
    this.gravityFlipped = false;
    this.canDoubleJump = false;
    this.hasDoubleJumped = false;
    this.isOnGround = false;
    this.deaths = 0;
    this.coinsCollected = [];
    this.checkpointReached = false;
    this.checkpointX = 0;
    this.checkpointScrollX = 0;
    this.bestProgress = 0;
    this.bgObjects = [];
    this.movingPlatforms = [];
    this.playerTrails = [];
  }

  create() {
    const { width, height } = this.scale;

    // Get level config
    this.levelConfig = LEVELS.find(l => l.id === this.levelId) || LEVELS[0];
    this.scrollSpeed = this.levelConfig.baseSpeed;
    this.bpm = this.levelConfig.bpm;
    this.beatInterval = 60000 / this.bpm;
    this.beatTimer = 0;
    this.scrollX = 0;
    this.startTime = this.time.now;

    // World bounds
    this.physics.world.setBounds(0, 0, this.levelConfig.length + width, height);

    // Background
    this.createBackground(width, height);

    // Ground
    this.createGround(width, height);

    // Obstacles
    this.createObstacles(height);

    // Player
    this.createPlayer(width, height);

    // Camera
    this.cameras.main.setBounds(0, 0, this.levelConfig.length + width, height);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(100, 200);

    // Controls
    this.input.keyboard.on('keydown-SPACE', () => this.handleJump());
    this.input.keyboard.on('keydown-UP', () => this.handleJump());
    this.input.keyboard.on('keydown-W', () => this.handleJump());
    this.input.keyboard.on('keydown-ENTER', () => this.handleJump());
    this.input.on('pointerdown', () => this.handleJump());

    // Pause
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard.on('keydown-P', () => this.togglePause());

    // Fade in
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Save data
    const save = getSaveData();
    this.deaths = save.deaths || 0;

    // Start UI
    this.events.emit('levelStart', {
      levelName: this.levelConfig.name,
      difficulty: this.levelConfig.difficulty,
      diffColor: this.levelConfig.diffColor
    });
  }

  // ─── BACKGROUND ───────────────────────────────────────────
  createBackground(w: number, _h: number) {
    const h = this.scale.height;
    // Sky gradient
    this.bgGraphics = this.add.graphics().setScrollFactor(0);
    this.drawBackground(w, h);

    // Parallax layers
    const colors = [
      Phaser.Display.Color.HexStringToColor(this.levelConfig.color1).color,
      Phaser.Display.Color.HexStringToColor(this.levelConfig.color2).color,
    ];

    // Distant background elements (buildings/pillars)
    for (let i = 0; i < 12; i++) {
      const obj = this.add.graphics();
      const x = i * 240 + Phaser.Math.Between(-40, 40);
      const bh = Phaser.Math.Between(80, 260);
      const bw = Phaser.Math.Between(20, 50);
      const col = colors[i % 2];
      obj.fillStyle(col, 0.08);
      obj.fillRect(0, 0, bw, bh);
      obj.lineStyle(1, col, 0.2);
      obj.strokeRect(0, 0, bw, bh);
      obj.x = x;
      obj.y = h - 60 - bh;
      obj.setScrollFactor(0.15);
      this.bgObjects.push(obj);

      // Window dots
      for (let wy = 10; wy < bh - 10; wy += 20) {
        for (let wx = 5; wx < bw - 5; wx += 14) {
          if (Math.random() > 0.4) {
            const wLight = this.add.graphics();
            wLight.fillStyle(col, 0.4);
            wLight.fillRect(0, 0, 5, 8);
            wLight.x = x + wx;
            wLight.y = h - 60 - bh + wy;
            wLight.setScrollFactor(0.15);
            this.bgObjects.push(wLight);
          }
        }
      }
    }

    // Mid-ground grid
    const grid = this.add.graphics().setScrollFactor(0.3);
    const gc = Phaser.Display.Color.HexStringToColor(this.levelConfig.color1).color;
    grid.lineStyle(1, gc, 0.12);
    for (let x = 0; x < w * 5; x += 60) grid.lineBetween(x, 0, x, h);
    for (let y = 0; y < h; y += 60) grid.lineBetween(0, y, w * 5, y);
    this.bgObjects.push(grid);

    // Stars
    for (let i = 0; i < 60; i++) {
      const star = this.add.graphics().setScrollFactor(0.05);
      star.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 0.9));
      star.fillCircle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h * 0.6),
        Phaser.Math.FloatBetween(0.5, 2)
      );
      this.bgObjects.push(star);
    }

    // Ground graphics layer
    this.groundGraphics = this.add.graphics();
  }

  drawBackground(w: number, h: number) {
    this.bgGraphics.clear();
    const c1 = Phaser.Display.Color.HexStringToColor(this.levelConfig.color1);
    const darkCol = Phaser.Display.Color.GetColor(
      Math.floor(c1.r * 0.06), Math.floor(c1.g * 0.06), Math.floor(c1.b * 0.06)
    );
    this.bgGraphics.fillGradientStyle(0x000000, 0x000000, darkCol, darkCol, 1);
    this.bgGraphics.fillRect(0, 0, w, h);
  }

  // ─── GROUND ───────────────────────────────────────────────
  createGround(w: number, h: number) {
    this.groundGroup = this.physics.add.staticGroup();

    const groundY = h - 40;
    const tileSize = 40;
    const totalTiles = Math.ceil((this.levelConfig.length + w * 2) / tileSize);

    for (let i = 0; i < totalTiles; i++) {
      const tile = this.groundGroup.create(i * tileSize + tileSize / 2, groundY + 20, 'ground');
      tile.setImmovable(true);
      tile.refreshBody();
    }

    // Ceiling (for gravity flip sections)
    for (let i = 0; i < totalTiles; i++) {
      const tile = this.groundGroup.create(i * tileSize + tileSize / 2, -20, 'ground');
      tile.setImmovable(true);
      tile.refreshBody();
    }
  }

  // ─── OBSTACLES ────────────────────────────────────────────
  createObstacles(height: number) {
    this.obstacleGroup = this.physics.add.staticGroup();
    this.platformGroup = this.physics.add.staticGroup();
    this.portalGroup = this.physics.add.staticGroup();
    this.coinGroup = this.physics.add.staticGroup();
    this.checkpointGroup = this.physics.add.staticGroup();
    this.orbGroup = this.physics.add.staticGroup();

    const groundY = height - 40;

    this.levelConfig.obstacles.forEach((obs, idx) => {
      const obsY = obs.y ? groundY + obs.y : groundY - 20;

      switch (obs.type) {
        case 'spike':
        case 'spike_small':
        case 'spike_big': {
          const key = obs.type;
          const s = this.obstacleGroup.create(obs.x, groundY - (key === 'spike_big' ? 30 : key === 'spike' ? 20 : 15), key);
          s.setImmovable(true);
          s.refreshBody();
          // Add glow effect with graphics
          break;
        }

        case 'platform': {
          const pY = obs.y ? groundY + obs.y : groundY - 140;
          const pl = this.platformGroup.create(obs.x, pY, 'platform');
          pl.setImmovable(true);
          pl.refreshBody();
          break;
        }

        case 'platform_moving': {
          const mpY = obs.y ? groundY + obs.y : groundY - 140;
          const mp = this.platformGroup.create(obs.x, mpY, 'platform_moving');
          mp.setImmovable(true);
          mp.refreshBody();
          this.movingPlatforms.push({
            obj: mp,
            baseY: mpY,
            amp: obs.moveY || 60,
            spd: obs.moveSpeed || 2,
            phase: idx * 0.5
          });
          break;
        }

        case 'portal_jump':
        case 'portal_gravity':
        case 'portal_speed': {
          const portalY = groundY - 50;
          const p = this.portalGroup.create(obs.x, portalY, obs.type);
          p.setImmovable(true);
          p.refreshBody();
          p.portalType = obs.type;
          break;
        }

        case 'coin': {
          const cy = obs.y ? groundY + obs.y : groundY - 80;
          const c = this.coinGroup.create(obs.x, cy, 'coin');
          c.setImmovable(true);
          c.refreshBody();
          c.coinId = idx;
          break;
        }

        case 'checkpoint': {
          if (this.levelConfig.hasCheckpoint) {
            const cp = this.checkpointGroup.create(obs.x, groundY - 30, 'checkpoint');
            cp.setImmovable(true);
            cp.refreshBody();
            this.checkpointX = obs.x;
          }
          break;
        }

        case 'orb': {
          const orbY = obs.y ? groundY + obs.y : groundY - 140;
          const o = this.orbGroup.create(obs.x, orbY, 'orb');
          o.setImmovable(true);
          o.refreshBody();
          break;
        }
      }
    });
  }

  // ─── PLAYER ───────────────────────────────────────────────
  createPlayer(_w: number, h: number) {
    const groundY = h - 40;
    const startX = this.checkpointReached ? this.checkpointX : 120;
    const startScrollX = this.checkpointReached ? this.checkpointScrollX : 0;

    this.player = this.physics.add.sprite(startX, groundY - 40, 'cube');
    this.player.setCollideWorldBounds(false);
    this.player.setGravityY(0);
    this.player.setDepth(10);

    // Apply saved cube color tint
    const save = getSaveData();
    const cubeColor = save.cubeColor || '#00ffff';
    const colorInt = Phaser.Display.Color.HexStringToColor(cubeColor).color;
    this.player.setTint(colorInt);

    // Collisions
    this.physics.add.collider(this.player, this.groundGroup, () => {
      if (!this.gravityFlipped) {
        this.isOnGround = true;
        this.hasDoubleJumped = false;
      }
    });

    this.physics.add.collider(this.player, this.platformGroup, (player: any, _platform: any) => {
      if (!this.gravityFlipped && player.body.touching.down) {
        this.isOnGround = true;
        this.hasDoubleJumped = false;
      }
    });

    // Obstacle death
    this.physics.add.overlap(this.player, this.obstacleGroup, () => {
      if (!this.isGameOver) this.playerDie();
    });

    // Portal overlaps
    this.physics.add.overlap(this.player, this.portalGroup, (_p: any, portal: any) => {
      this.handlePortal(portal.portalType);
    });

    // Coin collection
    this.physics.add.overlap(this.player, this.coinGroup, (_p: any, coin: any) => {
      if (!this.coinsCollected.includes(coin.coinId)) {
        this.coinsCollected.push(coin.coinId);
        this.collectCoin(coin);
      }
    });

    // Checkpoint
    this.physics.add.overlap(this.player, this.checkpointGroup, (_p: any, cp: any) => {
      if (!this.checkpointReached) {
        this.checkpointReached = true;
        this.checkpointX = this.player.x;
        this.checkpointScrollX = this.scrollX;
        this.showCheckpointEffect();
      }
    });

    // Orb
    this.physics.add.overlap(this.player, this.orbGroup, (_p: any, orb: any) => {
      this.activateOrb(orb);
    });

    // Set scroll position if respawning at checkpoint
    if (this.checkpointReached && startScrollX > 0) {
      this.cameras.main.scrollX = startScrollX;
    }
  }

  // ─── CONTROLS ─────────────────────────────────────────────
  handleJump() {
    if (this.isGameOver || this.isVictory || this.isPaused) return;

    if (this.isOnGround) {
      this.doJump();
      this.isOnGround = false;
    } else if (this.canDoubleJump && !this.hasDoubleJumped) {
      this.doJump();
      this.hasDoubleJumped = true;
      this.spawnDoubleJumpEffect();
    }
  }

  doJump() {
    const jumpVel = this.gravityFlipped ? 800 : -800;
    this.player.setVelocityY(jumpVel);
    this.spawnJumpParticles();

    // Jump sound effect (visual representation since no audio files)
    this.cameras.main.shake(30, 0.003);
  }

  togglePause() {
    if (this.isGameOver || this.isVictory) return;
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.events.emit('gamePaused');
    } else {
      this.physics.resume();
      this.events.emit('gameResumed');
    }
  }

  // ─── PORTALS ──────────────────────────────────────────────
  handlePortal(type: string) {
    switch (type) {
      case 'portal_jump':
        this.canDoubleJump = true;
        this.showPortalEffect('#00ff88');
        break;
      case 'portal_gravity':
        this.flipGravity();
        this.showPortalEffect('#ff00ff');
        break;
      case 'portal_speed':
        this.scrollSpeed = Math.min(this.scrollSpeed + 80, 700);
        this.showPortalEffect('#ffaa00');
        break;
    }
  }

  flipGravity() {
    this.gravityFlipped = !this.gravityFlipped;
    const grav = this.gravityFlipped ? -1800 : 1800;
    this.player.body.setGravityY(grav - 1800); // offset world gravity
    this.physics.world.gravity.y = this.gravityFlipped ? -1800 : 1800;
    this.cameras.main.shake(150, 0.01);
    this.cameras.main.flash(100, 255, 0, 255);
  }

  showPortalEffect(color: string) {
    const col = Phaser.Display.Color.HexStringToColor(color).color;
    this.cameras.main.flash(200, 0, 255, 200, false);

    for (let i = 0; i < 15; i++) {
      const p = this.add.graphics();
      p.fillStyle(col, 0.9);
      p.fillCircle(0, 0, Phaser.Math.Between(3, 8));
      p.x = this.player.x;
      p.y = this.player.y;

      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-80, 80),
        y: p.y + Phaser.Math.Between(-80, 80),
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 600,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  // ─── COINS ────────────────────────────────────────────────
  collectCoin(coin: any) {
    // Spawn collection particles
    for (let i = 0; i < 10; i++) {
      const p = this.add.graphics();
      p.fillStyle(0xffcc00, 1);
      p.fillCircle(0, 0, 4);
      p.x = coin.x;
      p.y = coin.y;

      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-50, 50),
        y: p.y + Phaser.Math.Between(-60, -10),
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }

    // Score popup
    const popup = this.add.text(coin.x, coin.y - 30, '+COIN!', {
      fontSize: '16px',
      fontFamily: 'Arial Black',
      color: '#ffcc00',
      shadow: { color: '#ff8800', blur: 10, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: popup.y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => popup.destroy()
    });

    coin.destroy();
    this.events.emit('coinCollected', this.coinsCollected.length);
  }

  // ─── ORB ──────────────────────────────────────────────────
  activateOrb(orb: any) {
    const vel = this.gravityFlipped ? 700 : -700;
    this.player.setVelocityY(vel);
    this.isOnGround = false;

    // Flash effect
    const flash = this.add.graphics();
    flash.fillStyle(0xffff00, 0.8);
    flash.fillCircle(orb.x, orb.y, 30);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });
  }

  // ─── CHECKPOINT ───────────────────────────────────────────
  showCheckpointEffect() {
    const x = this.player.x;
    const y = this.player.y;

    const flash = this.add.graphics();
    flash.fillStyle(0x00ff88, 0.5);
    flash.fillCircle(x, y, 60);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 2, scaleY: 2, duration: 500, onComplete: () => flash.destroy() });

    const text = this.add.text(x, y - 60, '✓ CHECKPOINT!', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#00ff88',
      shadow: { color: '#00ff88', blur: 15, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: text.y - 50,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }

  // ─── DEATH ────────────────────────────────────────────────
  playerDie() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.deaths++;

    // Save death count
    const save = getSaveData();
    save.deaths = this.deaths;
    setSaveData(save);

    // Explosion effect
    this.spawnDeathExplosion();

    // Slow motion then restart
    this.time.timeScale = 0.3;

    // Screen flash red
    this.cameras.main.flash(300, 255, 50, 50);
    this.cameras.main.shake(300, 0.02);

    // Hide player
    this.player.setVisible(false);
    this.player.body.enable = false;

    this.time.delayedCall(800, () => {
      this.time.timeScale = 1;

      // Notify UI
      this.events.emit('playerDied', this.deaths);

      // Restart from checkpoint or beginning
      this.time.delayedCall(500, () => {
        this.cameras.main.fade(400, 0, 0, 0);
        this.time.delayedCall(400, () => {
          this.scene.restart({ levelId: this.levelId });
        });
      });
    });
  }

  spawnDeathExplosion() {
    const x = this.player.x;
    const y = this.player.y;
    const colors = [0xff4400, 0xff8800, 0xffff00, 0xff0000, 0xffffff];

    for (let i = 0; i < 30; i++) {
      const p = this.add.graphics();
      const col = colors[Phaser.Math.Between(0, colors.length - 1)];
      const size = Phaser.Math.Between(3, 10);
      p.fillStyle(col, 1);
      p.fillRect(-size / 2, -size / 2, size, size);
      p.x = x;
      p.y = y;
      p.rotation = Phaser.Math.FloatBetween(0, Math.PI * 2);

      this.tweens.add({
        targets: p,
        x: x + Phaser.Math.Between(-150, 150),
        y: y + Phaser.Math.Between(-150, 100),
        rotation: Phaser.Math.FloatBetween(-5, 5),
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: Phaser.Math.Between(400, 900),
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }

    // Big flash
    const flash = this.add.graphics();
    flash.fillStyle(0xffffff, 1);
    flash.fillCircle(x, y, 60);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 3, scaleY: 3, duration: 400, onComplete: () => flash.destroy() });
  }

  // ─── PARTICLES ────────────────────────────────────────────
  spawnJumpParticles() {
    const colors = [
      Phaser.Display.Color.HexStringToColor(this.levelConfig.color1).color,
      Phaser.Display.Color.HexStringToColor(this.levelConfig.color2).color,
    ];

    for (let i = 0; i < 6; i++) {
      const p = this.add.graphics();
      p.fillStyle(colors[i % 2], 0.8);
      p.fillRect(-3, -3, 6, 6);
      p.x = this.player.x + Phaser.Math.Between(-10, 10);
      p.y = this.player.y + 20;

      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-30, 30),
        y: p.y + Phaser.Math.Between(10, 40),
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 400,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  spawnDoubleJumpEffect() {
    for (let i = 0; i < 12; i++) {
      const p = this.add.graphics();
      const angle = (i / 12) * Math.PI * 2;
      const dist = 40;
      const col = Phaser.Display.Color.HexStringToColor(this.levelConfig.color1).color;
      p.fillStyle(col, 1);
      p.fillCircle(0, 0, 4);
      p.x = this.player.x;
      p.y = this.player.y;

      this.tweens.add({
        targets: p,
        x: p.x + Math.cos(angle) * dist,
        y: p.y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  spawnPlayerTrail() {
    const now = this.time.now;
    if (now - this.lastTrailTime < 60) return;
    this.lastTrailTime = now;

    const save = getSaveData();
    const trailColor = save.trailColor || '#ff00ff';
    const col = Phaser.Display.Color.HexStringToColor(trailColor).color;

    const trail = this.add.graphics();
    trail.fillStyle(col, 0.6);
    trail.fillRect(-18, -18, 36, 36);
    trail.x = this.player.x;
    trail.y = this.player.y;
    trail.rotation = this.player.rotation;
    trail.setDepth(9);

    this.playerTrails.push(trail);

    this.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        trail.destroy();
        const idx = this.playerTrails.indexOf(trail);
        if (idx > -1) this.playerTrails.splice(idx, 1);
      }
    });
  }

  // ─── UPDATE ───────────────────────────────────────────────
  update(_time: number, delta: number) {
    if (this.isGameOver || this.isVictory || this.isPaused) return;

    const dt = delta / 1000;

    // Rotate player while airborne
    if (!this.isOnGround) {
      this.player.rotation += this.gravityFlipped ? -0.08 : 0.08;
    } else {
      // Snap to nearest 90°
      const target = Math.round(this.player.rotation / (Math.PI / 2)) * (Math.PI / 2);
      this.player.rotation += (target - this.player.rotation) * 0.3;
    }

    // Move player forward
    this.player.x += this.scrollSpeed * dt;

    // Spawn trail
    this.spawnPlayerTrail();

    // Reset ground status each frame
    this.isOnGround = false;

    // Update moving platforms
    this.movingPlatforms.forEach(mp => {
      mp.phase += dt * mp.spd;
      const newY = mp.baseY + Math.sin(mp.phase) * mp.amp;
      mp.obj.y = newY;
      mp.obj.refreshBody();
    });

    // Check if player fell off ground
    const { height } = this.scale;
    if (this.player.y > height + 100 || this.player.y < -100) {
      this.playerDie();
      return;
    }

    // Check victory
    if (this.player.x >= this.levelConfig.length) {
      this.triggerVictory();
      return;
    }

    // Progress
    this.progressPct = (this.player.x / this.levelConfig.length) * 100;
    if (this.progressPct > this.bestProgress) {
      this.bestProgress = this.progressPct;
    }
    this.events.emit('progressUpdate', this.progressPct);

    // Beat effects
    this.beatTimer += delta;
    if (this.beatTimer >= this.beatInterval) {
      this.beatTimer = 0;
      this.onBeat();
    }

    // Neon pulse
    this.neonPulse += dt * 3;
    this.updateNeonEffects();
  }

  onBeat() {
    // Pulse camera zoom slightly on beat
    this.tweens.add({
      targets: this.cameras.main,
      zoom: { from: 1.015, to: 1 },
      duration: this.beatInterval * 0.4,
      ease: 'Power2'
    });

    // Spawn beat particle at player
    const col = Phaser.Display.Color.HexStringToColor(this.levelConfig.color1).color;
    const ring = this.add.graphics();
    ring.lineStyle(3, col, 0.8);
    ring.strokeCircle(this.player.x, this.player.y, 20);
    ring.setDepth(5);

    this.tweens.add({
      targets: ring,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: this.beatInterval * 0.8,
      ease: 'Power2',
      onComplete: () => ring.destroy()
    });
  }

  updateNeonEffects() {
    // Slight alpha pulse on ground tiles
    const pulse = 0.7 + 0.3 * Math.sin(this.neonPulse);
    // Could update shader uniforms here if using WebGL pipeline
  }

  // ─── VICTORY ──────────────────────────────────────────────
  triggerVictory() {
    if (this.isVictory) return;
    this.isVictory = true;

    // Celebration particles
    for (let i = 0; i < 50; i++) {
      this.time.delayedCall(i * 40, () => this.spawnVictoryParticle());
    }

    // Save progress
    const save = getSaveData();
    if (!save.completedLevels) save.completedLevels = [];
    if (!save.completedLevels.includes(this.levelId)) {
      save.completedLevels.push(this.levelId);
    }
    if (!save.levelStats) save.levelStats = {};
    save.levelStats[this.levelId] = {
      bestProgress: 100,
      coins: this.coinsCollected.length,
      time: Math.floor((this.time.now - this.startTime) / 1000),
    };
    save.totalCoins = (save.totalCoins || 0) + this.coinsCollected.length;

    // Unlock next level
    const nextId = this.levelId + 1;
    if (!save.unlockedLevels) save.unlockedLevels = [1];
    if (!save.unlockedLevels.includes(nextId) && nextId <= LEVELS.length) {
      save.unlockedLevels.push(nextId);
    }
    setSaveData(save);

    // Transition to victory scene
    this.time.delayedCall(1500, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.stop('UIScene');
        this.scene.start('VictoryScene', {
          levelId: this.levelId,
          deaths: this.deaths,
          coins: this.coinsCollected.length,
          time: Math.floor((this.time.now - this.startTime) / 1000),
        });
      });
    });
  }

  spawnVictoryParticle() {
    const { width, height } = this.scale;
    const colors = [0x00ffff, 0xff00ff, 0x00ff88, 0xffaa00, 0xff4488, 0xffffff];
    const col = colors[Phaser.Math.Between(0, colors.length - 1)];

    const p = this.add.graphics();
    p.fillStyle(col, 1);
    p.fillRect(-5, -5, 10, 10);
    p.x = this.player.x + Phaser.Math.Between(-200, 200);
    p.y = height;
    p.setScrollFactor(0);

    this.tweens.add({
      targets: p,
      y: Phaser.Math.Between(-50, height * 0.7),
      x: p.x + Phaser.Math.Between(-100, 100),
      rotation: Phaser.Math.FloatBetween(-5, 5),
      alpha: 0,
      duration: Phaser.Math.Between(1000, 2000),
      ease: 'Power2',
      onComplete: () => p.destroy()
    });
  }
}
