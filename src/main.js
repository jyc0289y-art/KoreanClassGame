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

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a0a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 320, height: 480 },
    max: { width: 600, height: 900 }
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

const game = new Phaser.Game(config);
