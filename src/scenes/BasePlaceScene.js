import BaseWorldScene from './BaseWorldScene.js';
import { gameState } from '../systems/GameState.js';

// ============================================================
// BasePlaceScene — 실내/장소 워커블 맵 베이스
//  - BaseWorldScene 상속
//  - 작은 월드 크기 (800×600 또는 1000×800)
//  - 실내용 타일 (tile_floor_wood, tile_floor_tile, tile_wall)
//  - 출구 포털 → 원래 지역맵으로 복귀
//  - 미니맵 비활성화 (실내라 불필요)
//  - 카메라 줌 고정 (1.0)
// ============================================================

export default class BasePlaceScene extends BaseWorldScene {
  constructor(key) {
    super(key);
    this.returnScene = null;  // 원래 지역맵 키
    this.placeConfig = null;  // 장소 데이터
  }

  // ── init: scene.start()로 전달된 데이터 수신 ──
  init(data) {
    this.returnScene = data?.returnScene || null;
    this._initData = data;
  }

  // ── createPlace: 서브클래스에서 호출 ──
  createPlace(config) {
    /*
      config = {
        worldWidth, worldHeight,
        startX, startY,
        tiles: 'floor_wood' | 'floor_tile' | 'airport_floor',
        npcs: [...],
        buildings: [...] (optional — internal objects),
        returnScene: 'FukuokaYakuinScene',
        title_ko, title_ja, subtitle
      }
    */
    this.worldWidth = config.worldWidth || 800;
    this.worldHeight = config.worldHeight || 600;

    // Override return scene from init data or config
    this.returnScene = this._initData?.returnScene || config.returnScene;

    // Call parent createWorld (creates player, controls, HUD, etc.)
    this.createWorld({
      startX: config.startX || this.worldWidth / 2,
      startY: config.startY || this.worldHeight / 2,
      tiles: config.tiles || 'floor_wood',
      npcs: config.npcs || [],
      buildings: config.buildings || []
    });

    // Override: disable minimap for indoor scenes
    if (this.minimapContainer) {
      this.minimapContainer.setVisible(false);
    }

    // Override: fix camera zoom at 1.0 for indoor scenes
    this.currentZoom = 1.0;
    this.minCameraZoom = 1.0;
    this.maxCameraZoom = 1.0;
    this.cameras.main.setZoom(1.0);

    // Create exit door
    if (this.returnScene) {
      this.createExitDoor(config.exitX, config.exitY);
    }

    // Scene title
    if (config.title_ko) {
      this.showSceneTitle(config.title_ko, config.title_ja || '', config.subtitle || '');
    }
  }

  // ── Exit door: returns to parent local map ──
  createExitDoor(exitX, exitY) {
    const x = exitX || this.worldWidth / 2;
    const y = exitY || this.worldHeight - 20;

    // Door visual
    const door = this.add.container(x, y).setDepth(5);
    const doorBg = this.add.rectangle(0, 0, 40, 32, 0x8B4513, 0.8)
      .setStrokeStyle(2, 0xDEB887);
    const exitText = this.add.text(0, -24, '🚪 나가기 / 出る', {
      fontSize: '9px', color: '#00ff88',
      backgroundColor: '#00000066', padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
    const arrow = this.add.text(0, 3, '↓', {
      fontSize: '16px', color: '#00ff88'
    }).setOrigin(0.5);
    door.add([doorBg, exitText, arrow]);

    // Pulse animation
    this.tweens.add({
      targets: arrow, y: 8, duration: 800,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Exit zone (auto-teleport)
    const exitZone = this.add.zone(x, y, 60, 40);
    this.physics.add.existing(exitZone, true);
    this.physics.add.overlap(this.player, exitZone, () => {
      if (!this.isTransitioning) {
        this.exitPlace();
      }
    });

    // Tap zone
    const tapZone = this.add.zone(x, y, 80, 60)
      .setInteractive({ useHandCursor: true }).setDepth(6);
    tapZone.on('pointerdown', () => {
      if (!this.isTransitioning) {
        this.exitPlace();
      }
    });
  }

  // ── Exit: fade out and return ──
  exitPlace() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    gameState.save();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start(this.returnScene, {
        fromPlace: this.scene.key
      });
    });
  }

  // ── Override tilemap for indoor use ──
  createTilemap(type) {
    const tileSize = 32;
    const cols = Math.ceil(this.worldWidth / tileSize);
    const rows = Math.ceil(this.worldHeight / tileSize);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let tile;

        // Walls on edges
        if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
          tile = 'tile_wall';
        } else {
          // Floor based on type
          switch (type) {
            case 'floor_wood':
              tile = 'tile_floor_wood';
              break;
            case 'floor_tile':
              tile = 'tile_floor_tile';
              break;
            case 'airport_floor':
              tile = 'tile_airport_floor';
              break;
            default:
              tile = 'tile_floor_wood';
          }
        }

        this.add.image(x * tileSize + 16, y * tileSize + 16, tile).setDepth(0);
      }
    }

    // Add wall collision bounds (top, bottom, left, right walls)
    const wallThick = tileSize;
    const walls = [
      { x: this.worldWidth / 2, y: wallThick / 2, w: this.worldWidth, h: wallThick },       // top
      { x: this.worldWidth / 2, y: this.worldHeight - wallThick / 2, w: this.worldWidth, h: wallThick }, // bottom
      { x: wallThick / 2, y: this.worldHeight / 2, w: wallThick, h: this.worldHeight },       // left
      { x: this.worldWidth - wallThick / 2, y: this.worldHeight / 2, w: wallThick, h: this.worldHeight } // right
    ];
    walls.forEach(wall => {
      const w = this.add.rectangle(wall.x, wall.y, wall.w, wall.h, 0x000000, 0).setDepth(0);
      this.physics.add.existing(w, true);
      this.physics.add.collider(this.player, w);
    });
  }

  // ── Override: minimap disabled for place scenes ──
  createMinimap() {
    // Do nothing — minimap not needed for indoor scenes
  }

  updateMinimap() {
    // No-op
  }
}
