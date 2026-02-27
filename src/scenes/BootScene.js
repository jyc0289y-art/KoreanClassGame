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
      { name: 'tile_sand', color: 0xdec67a },
      // ── 새 타일 (실내/공항/인도) ──
      { name: 'tile_floor_wood', color: 0x8B6914 },
      { name: 'tile_floor_tile', color: 0xC8C8C8 },
      { name: 'tile_airport_floor', color: 0xD4D4D4 },
      { name: 'tile_wall', color: 0x555555 },
      { name: 'tile_sidewalk', color: 0xAAAAAA }
    ];
    tiles.forEach(t => {
      g.clear();
      g.fillStyle(t.color, 1);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(Phaser.Display.Color.IntegerToColor(t.color).brighten(10).color, 0.3);
      g.fillRect(4, 4, 8, 8);
      g.fillRect(20, 16, 8, 8);
      // 나무 바닥 추가 디테일
      if (t.name === 'tile_floor_wood') {
        g.lineStyle(1, 0x6B4914, 0.3);
        g.lineBetween(0, 10, 32, 10);
        g.lineBetween(0, 22, 32, 22);
      }
      // 타일 바닥 격자
      if (t.name === 'tile_floor_tile' || t.name === 'tile_airport_floor') {
        g.lineStyle(1, 0x999999, 0.2);
        g.lineBetween(16, 0, 16, 32);
        g.lineBetween(0, 16, 32, 16);
      }
      // 벽 패턴
      if (t.name === 'tile_wall') {
        g.fillStyle(0x444444, 1);
        g.fillRect(0, 0, 32, 4);
        g.fillRect(0, 28, 32, 4);
      }
      g.generateTexture(t.name, 32, 32);
    });

    // ── 새 건물 텍스처 ──
    const newBuildings = [
      { name: 'building_subway', color: 0x2E8B57, w: 72, h: 56, icon: 'M' },
      { name: 'building_restaurant', color: 0xCD5C5C, w: 64, h: 48, icon: '🍴' },
      { name: 'building_cafe', color: 0x8B4513, w: 56, h: 48, icon: '☕' },
      { name: 'building_oliveyoung', color: 0x00A651, w: 64, h: 48, icon: 'OY' },
      { name: 'building_departure', color: 0x4682B4, w: 80, h: 56, icon: '✈' },
      { name: 'building_tower', color: 0xFF4500, w: 48, h: 80, icon: 'T' }
    ];
    newBuildings.forEach(b => {
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
      // 지하철역은 녹색 띠
      if (b.name === 'building_subway') {
        g.fillStyle(0x00ff88, 0.4);
        g.fillRect(2, b.h - 8, b.w - 4, 6);
      }
      g.generateTexture(b.name, b.w, b.h);
    });

    // ── UI 아이콘 텍스처 ──
    // 지하철 아이콘 (초록 원 + M)
    g.clear();
    g.fillStyle(0x2E8B57, 1);
    g.fillCircle(12, 12, 11);
    g.fillStyle(0xffffff, 1);
    g.fillRect(5, 6, 3, 12);   // M 좌측
    g.fillRect(16, 6, 3, 12);  // M 우측
    g.fillRect(8, 6, 2, 8);    // M 중앙좌
    g.fillRect(13, 6, 2, 8);   // M 중앙우
    g.generateTexture('icon_subway', 24, 24);

    // 비행기 아이콘
    g.clear();
    g.fillStyle(0x4682B4, 1);
    g.fillCircle(12, 12, 11);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(12, 3, 6, 18, 18, 18); // 비행기 실루엣
    g.fillRect(9, 16, 6, 4);
    g.generateTexture('icon_airplane', 24, 24);

    // 출구 아이콘
    g.clear();
    g.fillStyle(0x00ff88, 1);
    g.fillRect(8, 4, 8, 16);   // 화살표 몸통
    g.fillTriangle(12, 22, 4, 14, 20, 14); // 화살표 머리
    g.generateTexture('icon_exit', 24, 24);

    g.destroy();
  }

  create() {
    gameState.load();
    const goTitle = () => {
      if (this.scene.isActive()) {
        setTimeout(() => this.scene.start('TitleScene'), 500);
      }
    };
    if (this.dataLoadPromise) {
      this.dataLoadPromise.then(goTitle).catch(err => {
        console.error('Failed to load game data:', err);
        goTitle();
      });
    } else {
      // HMR reload — preload wasn't called, load data now
      dataLoader.preloadEssentials().then(goTitle).catch(err => {
        console.error('Failed to load game data:', err);
        goTitle();
      });
    }
    // Safety timeout: always proceed after 5s
    setTimeout(() => goTitle(), 5000);
  }
}
