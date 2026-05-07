// ============================================================
// NeonDash - Main Game Entry Point
// ============================================================
// This file initializes the Phaser 3 game instance and registers
// all scenes (Boot → Preload → MainMenu → LevelSelect → Game → UI)

import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MainMenuScene from './scenes/MainMenuScene';
import LevelSelectScene from './scenes/LevelSelectScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import GameOverScene from './scenes/GameOverScene';
import VictoryScene from './scenes/VictoryScene';
import CreditsScene from './scenes/CreditsScene';
import CustomizeScene from './scenes/CustomizeScene';

declare const Phaser: any;

export function initGame(containerId: string): any {
  const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: containerId,
    backgroundColor: '#000000',
    render: {
      pixelArt: false,
      antialias: true,
      antialiasGL: true,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 1800 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    scene: [
      BootScene,
      PreloadScene,
      MainMenuScene,
      LevelSelectScene,
      GameScene,
      UIScene,
      GameOverScene,
      VictoryScene,
      CreditsScene,
      CustomizeScene,
    ],
  };

  return new Phaser.Game(config);
}
