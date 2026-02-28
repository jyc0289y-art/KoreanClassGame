import Phaser from 'phaser';
import { gameState } from '../systems/GameState.js';
import { dataLoader } from '../systems/DataLoader.js';
import { HOBIS } from '../constants.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // HOBIS dark background
    this.add.rectangle(w / 2, h / 2, w, h, HOBIS.BG_HEX);

    // Scanline grid pattern
    const grid = this.add.graphics();
    grid.lineStyle(1, HOBIS.BORDER_HEX, 0.15);
    for (let y = 0; y < h; y += 40) grid.lineBetween(0, y, w, y);
    for (let x = 0; x < w; x += 40) grid.lineBetween(x, 0, x, h);

    this.add.text(w / 2, h / 2 - 60, '안녕, 서울', {
      fontSize: '28px', fontFamily: HOBIS.FONT_KR, color: HOBIS.CYAN, fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add.text(w / 2, h / 2 - 25, 'ANNYEONG, SEOUL', {
      fontSize: '14px', fontFamily: HOBIS.FONT_HEADER, color: HOBIS.GREEN
    }).setOrigin(0.5);

    // HOBIS-style loading bar
    this.add.rectangle(w / 2, h / 2 + 30, 302, 22, HOBIS.BORDER_HEX, 0.6).setOrigin(0.5);
    const barBg = this.add.rectangle(w / 2, h / 2 + 30, 300, 20, HOBIS.INPUT_HEX, 0.8).setOrigin(0.5);
    const bar = this.add.rectangle(w / 2 - 148, h / 2 + 30, 0, 16, HOBIS.GREEN_HEX).setOrigin(0, 0.5);
    const loadText = this.add.text(w / 2, h / 2 + 60, 'LOADING...', {
      fontSize: '12px', fontFamily: HOBIS.FONT_MONO, color: HOBIS.MUTED
    }).setOrigin(0.5);

    this.load.on('progress', (val) => { bar.width = 296 * val; });
    this.load.on('complete', () => { loadText.setText('SYSTEM READY'); loadText.setColor(HOBIS.GREEN); });

    this.generateTextures();

    // JSON 데이터 비동기 로딩 시작
    this.dataLoadPromise = dataLoader.preloadEssentials();
  }

  generateTextures() {
    const g = this.make.graphics({ add: false });

    // Player sprites — HOBIS neon + cyan visor
    const playerData = [
      { name: 'yuko', body: 0xff3366 },
      { name: 'ami', body: 0xcc44ff },
      { name: 'rui', body: 0x00ffcc }
    ];
    playerData.forEach(({ name, body }) => {
      g.clear();
      // Body circle
      g.fillStyle(body, 1);
      g.fillCircle(16, 16, 14);
      // Dark inner
      g.fillStyle(0x111418, 0.3);
      g.fillCircle(16, 16, 10);
      // Face area
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 10, 4);
      // Eyes
      g.fillStyle(0x111418, 1);
      g.fillCircle(14, 9, 1.5);
      g.fillCircle(18, 9, 1.5);
      // HOBIS cyan visor line
      g.fillStyle(HOBIS.CYAN_HEX, 0.9);
      g.fillRect(10, 8, 12, 2);
      // Mouth
      g.lineStyle(1, 0x333333);
      g.beginPath();
      g.arc(16, 12, 3, 0.1, Math.PI - 0.1);
      g.strokePath();
      g.generateTexture(name, 32, 32);
    });

    // Tester character — gold with cyan visor
    g.clear();
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(16, 16, 14);
    g.lineStyle(2, HOBIS.CYAN_HEX, 0.8);
    g.strokeCircle(16, 16, 14);
    g.fillStyle(0x111418, 0.3);
    g.fillCircle(16, 16, 10);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 10, 4);
    g.fillStyle(0x111418, 1);
    g.fillCircle(14, 9, 1.5);
    g.fillCircle(18, 9, 1.5);
    // Cyan visor
    g.fillStyle(HOBIS.CYAN_HEX, 0.9);
    g.fillRect(10, 8, 12, 2);
    // Star mouth for tester
    g.fillStyle(0xff8c00, 1);
    g.fillTriangle(16, 11, 13, 16, 19, 16);
    g.generateTexture('tester', 32, 32);

    // NPC sprites — dark body + neon accent + cyan visor
    const npcColors = {
      hyunjeong: 0xffa500, yuseok: 0x4169e1, cheoiseok: 0x32cd32,
      shop: 0xffcc00, academy: 0x9370db, mission_npc: 0xff6347,
      ami: 0xcc44ff, rui: 0x00ffcc
    };
    Object.entries(npcColors).forEach(([name, color]) => {
      g.clear();
      // Dark body with neon accent
      g.fillStyle(HOBIS.PANEL_HEX, 1);
      g.fillRoundedRect(4, 2, 24, 28, 4);
      g.lineStyle(1, color, 0.6);
      g.strokeRoundedRect(4, 2, 24, 28, 4);
      // Face
      g.fillStyle(0xffeedd, 1);
      g.fillCircle(16, 10, 7);
      // Eyes
      g.fillStyle(0x333333, 1);
      g.fillCircle(14, 9, 1.5);
      g.fillCircle(18, 9, 1.5);
      // Cyan visor
      g.fillStyle(HOBIS.CYAN_HEX, 0.7);
      g.fillRect(10, 8, 12, 2);
      // Shop hat
      if (name === 'shop') {
        g.fillStyle(0xffcc00, 1);
        g.fillTriangle(16, 0, 10, 8, 22, 8);
      }
      g.generateTexture('npc_' + name, 32, 32);
    });

    // Buildings — dark body + neon outline (HOBIS style)
    const buildings = [
      { name: 'building_airport', neon: HOBIS.CYAN_HEX, w: 96, h: 64 },
      { name: 'building_shop', neon: 0xffcc00, w: 64, h: 48 },
      { name: 'building_academy', neon: 0x9370db, w: 80, h: 56 },
      { name: 'building_house', neon: 0xff8844, w: 56, h: 48 },
      { name: 'building_station', neon: HOBIS.GREEN_HEX, w: 72, h: 48 }
    ];
    buildings.forEach(b => {
      g.clear();
      // Dark body
      g.fillStyle(HOBIS.PANEL_HEX, 1);
      g.fillRoundedRect(2, 8, b.w - 4, b.h - 10, 4);
      // Neon outline
      g.lineStyle(1, b.neon, 0.6);
      g.strokeRoundedRect(2, 8, b.w - 4, b.h - 10, 4);
      // Roof — dark with neon edge
      g.fillStyle(0x1a1a2e, 1);
      g.fillTriangle(b.w / 2, 0, 0, 12, b.w, 12);
      g.lineStyle(1, b.neon, 0.4);
      g.lineBetween(0, 12, b.w, 12);
      // Door — dark
      g.fillStyle(0x0a0a0c, 1);
      g.fillRect(b.w / 2 - 8, b.h - 20, 16, 20);
      // Windows — cyan glow
      g.fillStyle(HOBIS.CYAN_HEX, 0.3);
      for (let i = 0; i < 2; i++) {
        g.fillRect(b.w * 0.2 + i * b.w * 0.4, 20, 12, 10);
      }
      g.generateTexture(b.name, b.w, b.h);
    });

    // UI elements — HOBIS cyan joystick
    g.clear();
    g.fillStyle(HOBIS.CYAN_HEX, 0.3);
    g.fillCircle(24, 24, 22);
    g.lineStyle(1, HOBIS.CYAN_HEX, 0.5);
    g.strokeCircle(24, 24, 22);
    g.fillStyle(HOBIS.CYAN_HEX, 0.15);
    g.fillCircle(24, 24, 18);
    g.generateTexture('joystick_base', 48, 48);

    g.clear();
    g.fillStyle(HOBIS.CYAN_HEX, 0.7);
    g.fillCircle(12, 12, 10);
    g.lineStyle(1, HOBIS.CYAN_HEX, 0.9);
    g.strokeCircle(12, 12, 10);
    g.generateTexture('joystick_thumb', 24, 24);

    // Interaction indicator — cyan style
    g.clear();
    g.fillStyle(HOBIS.CYAN_HEX, 0.8);
    g.fillCircle(8, 8, 8);
    g.fillStyle(HOBIS.BG_HEX, 1);
    g.fillRect(6, 3, 4, 7);
    g.fillCircle(8, 13, 2);
    g.generateTexture('interact_icon', 16, 16);

    // Tile textures
    const tiles = [
      { name: 'tile_grass', color: 0x4a8c3f },
      { name: 'tile_road', color: 0x888888 },
      { name: 'tile_water', color: 0x4a8cb8 },
      { name: 'tile_sand', color: 0xdec67a },
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
      if (t.name === 'tile_floor_wood') {
        g.lineStyle(1, 0x6B4914, 0.3);
        g.lineBetween(0, 10, 32, 10);
        g.lineBetween(0, 22, 32, 22);
      }
      if (t.name === 'tile_floor_tile' || t.name === 'tile_airport_floor') {
        g.lineStyle(1, 0x999999, 0.2);
        g.lineBetween(16, 0, 16, 32);
        g.lineBetween(0, 16, 32, 16);
      }
      if (t.name === 'tile_wall') {
        g.fillStyle(0x444444, 1);
        g.fillRect(0, 0, 32, 4);
        g.fillRect(0, 28, 32, 4);
      }
      g.generateTexture(t.name, 32, 32);
    });

    // New buildings — dark body + neon outline
    const newBuildings = [
      { name: 'building_subway', neon: HOBIS.CYAN_HEX, w: 72, h: 56 },
      { name: 'building_restaurant', neon: 0xff6644, w: 64, h: 48 },
      { name: 'building_cafe', neon: 0xcc8844, w: 56, h: 48 },
      { name: 'building_oliveyoung', neon: HOBIS.GREEN_HEX, w: 64, h: 48 },
      { name: 'building_departure', neon: HOBIS.CYAN_HEX, w: 80, h: 56 },
      { name: 'building_tower', neon: 0xff4400, w: 48, h: 80 }
    ];
    newBuildings.forEach(b => {
      g.clear();
      // Dark body
      g.fillStyle(HOBIS.PANEL_HEX, 1);
      g.fillRoundedRect(2, 8, b.w - 4, b.h - 10, 4);
      // Neon outline
      g.lineStyle(1, b.neon, 0.6);
      g.strokeRoundedRect(2, 8, b.w - 4, b.h - 10, 4);
      // Roof
      g.fillStyle(0x1a1a2e, 1);
      g.fillTriangle(b.w / 2, 0, 0, 12, b.w, 12);
      g.lineStyle(1, b.neon, 0.4);
      g.lineBetween(0, 12, b.w, 12);
      // Door
      g.fillStyle(0x0a0a0c, 1);
      g.fillRect(b.w / 2 - 8, b.h - 20, 16, 20);
      // Windows — cyan glow
      g.fillStyle(HOBIS.CYAN_HEX, 0.3);
      for (let i = 0; i < 2; i++) {
        g.fillRect(b.w * 0.2 + i * b.w * 0.4, 20, 12, 10);
      }
      // Subway cyan strip
      if (b.name === 'building_subway') {
        g.fillStyle(HOBIS.CYAN_HEX, 0.4);
        g.fillRect(2, b.h - 8, b.w - 4, 6);
      }
      g.generateTexture(b.name, b.w, b.h);
    });

    // UI Icons — HOBIS cyan
    // Subway icon
    g.clear();
    g.fillStyle(HOBIS.CYAN_HEX, 1);
    g.fillCircle(12, 12, 11);
    g.fillStyle(HOBIS.BG_HEX, 1);
    g.fillRect(5, 6, 3, 12);
    g.fillRect(16, 6, 3, 12);
    g.fillRect(8, 6, 2, 8);
    g.fillRect(13, 6, 2, 8);
    g.generateTexture('icon_subway', 24, 24);

    // Airplane icon
    g.clear();
    g.fillStyle(HOBIS.CYAN_HEX, 1);
    g.fillCircle(12, 12, 11);
    g.fillStyle(HOBIS.BG_HEX, 1);
    g.fillTriangle(12, 3, 6, 18, 18, 18);
    g.fillRect(9, 16, 6, 4);
    g.generateTexture('icon_airplane', 24, 24);

    // Exit icon
    g.clear();
    g.fillStyle(HOBIS.GREEN_HEX, 1);
    g.fillRect(8, 4, 8, 16);
    g.fillTriangle(12, 22, 4, 14, 20, 14);
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
      dataLoader.preloadEssentials().then(goTitle).catch(err => {
        console.error('Failed to load game data:', err);
        goTitle();
      });
    }
    setTimeout(() => goTitle(), 5000);
  }
}
