import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import ChapterSelectScene from './scenes/ChapterSelectScene.js';
import FukuokaScene from './scenes/FukuokaScene.js';
import IncheonScene from './scenes/IncheonScene.js';
import DialogueScene from './scenes/DialogueScene.js';
import MissionScene from './scenes/MissionScene.js';
import VocabularyScene from './scenes/VocabularyScene.js';
import ShopScene from './scenes/ShopScene.js';

// Destroy previous instance on HMR reload
if (window.__PHASER_GAME__) {
  window.__PHASER_GAME__.destroy(true);
  window.__PHASER_GAME__ = null;
  // Clear any leftover canvases
  const container = document.getElementById('game-container');
  if (container) container.innerHTML = '';
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0a0a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    activePointers: 3
  },
  scene: [
    BootScene,
    TitleScene,
    ChapterSelectScene,
    FukuokaScene,
    IncheonScene,
    DialogueScene,
    MissionScene,
    VocabularyScene,
    ShopScene
  ]
};

window.__PHASER_GAME__ = new Phaser.Game(config);

// Vite HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (window.__PHASER_GAME__) {
      window.__PHASER_GAME__.destroy(true);
      window.__PHASER_GAME__ = null;
      const container = document.getElementById('game-container');
      if (container) container.innerHTML = '';
    }
  });
  import.meta.hot.accept();
}
