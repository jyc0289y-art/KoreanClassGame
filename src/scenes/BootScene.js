import Phaser from 'phaser';
import { gameState } from '../systems/GameState.js';
import { dataLoader } from '../systems/DataLoader.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.rectangle(w / 2, h / 2, w, h, 0x0a0a2e);
    this.add.text(w / 2, h / 2 - 60, '🇰🇷 안녕, 서울', { fontSize: '28px', fontFamily: '"Noto Sans KR", sans-serif', color: '#ff69b4', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(w / 2, h / 2 - 25, 'アンニョン、ソウル', { fontSize: '16px', fontFamily: '"Noto Sans JP", sans-serif', color: '#da70d6' }).setOrigin(0.5);

    const barBg = this.add.rectangle(w / 2, h / 2 + 30, 300, 20, 0x222244, 0.8).setOrigin(0.5);
    const bar = this.add.rectangle(w / 2 - 148, h / 2 + 30, 0, 16, 0xff69b4).setOrigin(0, 0.5);
    const loadText = this.add.text(w / 2, h / 2 + 60, 'Loading...', { fontSize: '14px', color: '#8888aa' }).setOrigin(0.5);

    this.load.on('progress', (val) => { bar.width = 296 * val; });
    this.load.on('complete', () => { loadText.setText('Ready!'); });

    this.generateTextures();

    // JSON 데이터 비동기 로딩 시작
    this.dataLoadPromise = dataLoader.preloadEssentials();
  }

  generateTextures() {
    const g = this.make.graphics({ add: false });

    // Player sprites
    ['yuko', 'ami', 'rui'].forEach((name, i) => {
      const colors = [0xff69b4, 0xda70d6, 0x00ced1];
      g.clear();
      g.fillStyle(colors[i], 1);
      g.fillCircle(16, 16, 14);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 10, 4);
      g.fillStyle(0x333333, 1);
      g.fillCircle(14, 9, 1.5);
      g.fillCircle(18, 9, 1.5);
      g.lineStyle(1, 0x333333);
      g.beginPath();
      g.arc(16, 12, 3, 0.1, Math.PI - 0.1);
      g.strokePath();
      g.generateTexture(name, 32, 32);
    });

    // NPC sprites
    const npcColors = { hyunjeong: 0xffa500, yuseok: 0x4169e1, cheoiseok: 0x32cd32, shop: 0xffd700, academy: 0x9370db, mission_npc: 0xff6347, ami: 0xda70d6, rui: 0x00ced1 };
    Object.entries(npcColors).forEach(([name, color]) => {
      g.clear();
      g.fillStyle(color, 1);
      g.fillRoundedRect(4, 2, 24, 28, 4);
      g.fillStyle(0xffeedd, 1);
      g.fillCircle(16, 10, 7);
      g.fillStyle(0x333333, 1);
      g.fillCircle(14, 9, 1.5);
      g.fillCircle(18, 9, 1.5);
      if (name === 'shop') {
        g.fillStyle(0xffd700, 1);
        g.fillTriangle(16, 0, 10, 8, 22, 8);
      }
      g.generateTexture('npc_' + name, 32, 32);
    });

    // Buildings
    const buildings = [
      { name: 'building_airport', color: 0x4a6fa5, w: 96, h: 64 },
      { name: 'building_shop', color: 0xdaa520, w: 64, h: 48 },
      { name: 'building_academy', color: 0x6a5acd, w: 80, h: 56 },
      { name: 'building_house', color: 0xcd853f, w: 56, h: 48 },
      { name: 'building_station', color: 0x228b22, w: 72, h: 48 }
    ];
    buildings.forEach(b => {
      g.clear();
      g.fillStyle(b.color, 1);
      g.fillRoundedRect(2, 8, b.w - 4, b.h - 10, 6);
      g.fillStyle(0xdeb887, 1);
      g.fillTriangle(b.w / 2, 0, 0, 12, b.w, 12);
      g.fillStyle(0x8B4513, 1);
      g.fillRect(b.w / 2 - 8, b.h - 20, 16, 20);
      g.fillStyle(0x87ceeb, 1);
      for (let i = 0; i < 2; i++) {
        g.fillRect(b.w * 0.2 + i * b.w * 0.4, 20, 12, 10);
      }
      g.generateTexture(b.name, b.w, b.h);
    });

    // UI elements
    g.clear();
    g.fillStyle(0xff69b4, 1);
    g.fillCircle(24, 24, 22);
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(24, 24, 18);
    g.generateTexture('joystick_base', 48, 48);

    g.clear();
    g.fillStyle(0xff69b4, 1);
    g.fillCircle(12, 12, 10);
    g.generateTexture('joystick_thumb', 24, 24);

    // Interaction indicator
    g.clear();
    g.fillStyle(0xffff00, 1);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0x333333, 1);
    g.fillRect(6, 3, 4, 7);
    g.fillCircle(8, 13, 2);
    g.generateTexture('interact_icon', 16, 16);

    // Tile textures
    const tiles = [
      { name: 'tile_grass', color: 0x4a8c3f },
      { name: 'tile_road', color: 0x888888 },
      { name: 'tile_water', color: 0x4a8cb8 },
      { name: 'tile_sand', color: 0xdec67a }
    ];
    tiles.forEach(t => {
      g.clear();
      g.fillStyle(t.color, 1);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(Phaser.Display.Color.IntegerToColor(t.color).brighten(10).color, 0.3);
      g.fillRect(4, 4, 8, 8);
      g.fillRect(20, 16, 8, 8);
      g.generateTexture(t.name, 32, 32);
    });

    g.destroy();
  }

  create() {
    gameState.load();
    this.dataLoadPromise.then(() => {
      setTimeout(() => this.scene.start('TitleScene'), 500);
    }).catch(err => {
      console.error('Failed to load game data:', err);
      setTimeout(() => this.scene.start('TitleScene'), 500);
    });
  }
}
