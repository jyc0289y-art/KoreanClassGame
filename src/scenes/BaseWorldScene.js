import Phaser from 'phaser';
import { gameState } from '../systems/GameState.js';
import { dataLoader } from '../systems/DataLoader.js';
import { CHARACTERS, PLAYER_SPEED, REF_WIDTH, METRO_SCENES } from '../constants.js';

export default class BaseWorldScene extends Phaser.Scene {
  constructor(key) {
    super({ key });
    this.worldWidth = 1600;
    this.worldHeight = 1200;
    this.npcs = [];
    this.interactableNPC = null;
    this.portals = [];
    this.buildingPositions = [];
    this.isTransitioning = false;
    this.portalLockMsgShown = false;

    // Minimap state
    this.minimapScale = 0;
    this.minimapExpanded = false;
    this.minimapExpandedZoom = 1;
    this.minimapMinZoom = 0.5;
    this.minimapMaxZoom = 3;

    // Camera pinch zoom — default 1.0 so scrollFactor=0 UI is pixel-perfect
    this.currentZoom = 1.0;
    this.minCameraZoom = 0.5;
    this.maxCameraZoom = 2.5;

    // UI references for resize
    this._uiElements = {};

    // Interact button state
    this._interactBtnVisible = false;
    this._npcHighlight = null;
    this._npcGraceTime = null;
  }

  // ── init: scene.start()에서 전달된 데이터 수신 ──────
  init(data) {
    this._initData = data || {};
  }

  // ── Helper: UI scale factor ──────────────────────────
  get uiScale() {
    const w = this.cameras.main.width;
    return Phaser.Math.Clamp(w / REF_WIDTH, 0.6, 2.0);
  }

  get hudHeight() {
    return Math.max(36, this.cameras.main.height * 0.065);
  }

  createWorld(config) {
    this.isTransitioning = false;
    this.portalLockMsgShown = false;
    this.portals = [];
    this.buildingPositions = [];
    this.npcs = [];

    // Reset state that persists across scene.restart() (constructor NOT called again)
    this._interactBtnVisible = false;
    this._npcHighlight = null;
    this._npcGraceTime = null;
    this._isSwitchingCharacter = false;
    this._switchDelayedCall = null;

    // Allow multiple overlapping interactives to receive input
    this.input.topOnly = false;

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    // 대형 통합맵은 createTerrainGraphics()를 별도 호출 — tilemap 스킵
    if (config.tiles !== '__terrain__') {
      this.createTilemap(config.tiles || 'grass');
    }

    // ── 맵 방문 기록 ──
    gameState.visitMap(this.scene.key);

    // ── 스폰 위치: fromStation/fromPlace 기반 또는 기본값 ──
    let spawnX = this._initData?.spawnX || config.startX || 400;
    let spawnY = this._initData?.spawnY || config.startY || 600;

    // 지하철역에서 돌아왔을 때 → 해당 역 근처에 스폰
    const fromStation = this._initData?.fromStation;
    if (fromStation && this.stationSpawnPoints?.[fromStation]) {
      spawnX = this.stationSpawnPoints[fromStation].x;
      spawnY = this.stationSpawnPoints[fromStation].y;
    }

    // 장소맵에서 나왔을 때 → 해당 건물 근처에 스폰 + 재진입 방지 면역
    const fromPlace = this._initData?.fromPlace;
    if (fromPlace && this.placeSpawnPoints?.[fromPlace]) {
      spawnX = this.placeSpawnPoints[fromPlace].x;
      spawnY = this.placeSpawnPoints[fromPlace].y;
      this._placeExitImmunityUntil = Date.now() + 500; // 500ms 재진입 방지
    }

    const charName = gameState.currentCharacter;
    this.player = this.physics.add.sprite(spawnX, spawnY, charName);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // Camera: zoom=1.0 by default so scrollFactor=0 UI is pixel-perfect in RESIZE mode
    // Users can still pinch/scroll to zoom in/out
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.currentZoom = 1.0;

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setZoom(this.currentZoom);

    if (config.npcs) this.createNPCs(config.npcs);
    if (config.buildings) this.createBuildings(config.buildings);

    this.createUI();
    this.setupControls();
    this.createInteractButton();
    this.createCharacterSwitchButton();
    this.createMinimap();
    this.setupPinchZoom();

    this.interactKey = this.input.keyboard.addKey('SPACE');

    // Handle viewport resize (RESIZE mode)
    this._resizeHandler = (gameSize) => {
      if (!this.scene.isActive()) return;
      this.handleResize(gameSize.width, gameSize.height);
    };
    this.scale.on('resize', this._resizeHandler);

    // Clean up resize listener on shutdown
    this.events.on('shutdown', () => {
      this.scale.off('resize', this._resizeHandler);
    });
  }

  // ── Tilemap (소형 씬용 — 공항, 인천 등) ──────────────
  createTilemap(type) {
    const tileSize = 32;
    const cols = Math.ceil(this.worldWidth / tileSize);
    const rows = Math.ceil(this.worldHeight / tileSize);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let tile = 'tile_grass';
        if ((y === Math.floor(rows / 2) || y === Math.floor(rows / 2) + 1) ||
            (x === Math.floor(cols / 4) && y > rows / 3) ||
            (x === Math.floor(cols * 3 / 4) && y > rows / 3)) {
          tile = 'tile_road';
        }
        if (type === 'airport' && y < 3) tile = 'tile_water';
        this.add.image(x * tileSize + 16, y * tileSize + 16, tile).setDepth(0);
      }
    }
  }

  // ── TerrainGraphics (대형 통합맵용 — 단일 Graphics 객체) ──
  createTerrainGraphics(config) {
    const g = this.add.graphics().setDepth(0);

    // 기본 지면
    g.fillStyle(config.baseColor || 0x2d5a1e, 1.0);
    g.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // 구역별 틴트
    if (config.zones) {
      config.zones.forEach(z => {
        g.fillStyle(z.color, z.alpha || 0.1);
        if (z.shape === 'polygon' && z.points) {
          g.beginPath();
          g.moveTo(z.points[0][0], z.points[0][1]);
          for (let i = 1; i < z.points.length; i++) {
            g.lineTo(z.points[i][0], z.points[i][1]);
          }
          g.closePath();
          g.fillPath();
        } else {
          if (z.radius) {
            g.fillRoundedRect(z.x, z.y, z.w, z.h, z.radius);
          } else {
            g.fillRect(z.x, z.y, z.w, z.h);
          }
        }
      });
    }

    // 수역 (한강, 하카타만 등)
    if (config.water) {
      config.water.forEach(w => {
        g.fillStyle(w.color || 0x1a3a6a, w.alpha || 1.0);
        if (w.points) {
          g.beginPath();
          g.moveTo(w.points[0][0], w.points[0][1]);
          for (let i = 1; i < w.points.length; i++) {
            g.lineTo(w.points[i][0], w.points[i][1]);
          }
          g.closePath();
          g.fillPath();
        } else {
          g.fillRect(w.x, w.y, w.w, w.h);
        }
      });
    }

    // 주요도로
    if (config.roads) {
      config.roads.forEach(r => {
        g.fillStyle(r.color || 0x555555, r.alpha || 0.7);
        g.fillRect(r.x, r.y, r.w, r.h);
        // 도로 가장자리 (인도)
        if (r.sidewalk !== false) {
          g.fillStyle(0xAAAAAA, 0.25);
          if (r.w > r.h) {
            // 수평 도로 → 위아래 인도
            g.fillRect(r.x, r.y - 8, r.w, 8);
            g.fillRect(r.x, r.y + r.h, r.w, 8);
          } else {
            // 수직 도로 → 좌우 인도
            g.fillRect(r.x - 8, r.y, 8, r.h);
            g.fillRect(r.x + r.w, r.y, 8, r.h);
          }
        }
      });
    }

    // 도로 위 그리드 패턴 (시각적 질감)
    const gridG = this.add.graphics().setDepth(0.1);
    gridG.lineStyle(1, 0x000000, 0.03);
    const gridSize = 64;
    for (let x = 0; x < this.worldWidth; x += gridSize) {
      gridG.moveTo(x, 0);
      gridG.lineTo(x, this.worldHeight);
    }
    for (let y = 0; y < this.worldHeight; y += gridSize) {
      gridG.moveTo(0, y);
      gridG.lineTo(this.worldWidth, y);
    }
    gridG.strokePath();

    return g;
  }

  // ── NPCs ─────────────────────────────────────────────
  createNPCs(npcList) {
    npcList.forEach(npcConfig => {
      const npc = this.physics.add.sprite(npcConfig.x, npcConfig.y, 'npc_' + (npcConfig.texture || 'hyunjeong'));
      npc.setImmovable(true);
      npc.setDepth(5);
      npc.npcData = npcConfig;

      // Larger overlap zone for easier proximity detection (especially with joystick)
      const zone = this.add.zone(npcConfig.x, npcConfig.y, 100, 100);
      this.physics.add.existing(zone, true);

      this.add.text(npcConfig.x, npcConfig.y - 24, npcConfig.name_ko, {
        fontSize: '10px', color: '#ffffff', backgroundColor: '#00000088', padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(15);

      if (npcConfig.hasMission) {
        const icon = this.add.image(npcConfig.x, npcConfig.y - 36, 'interact_icon').setDepth(15);
        this.tweens.add({ targets: icon, y: npcConfig.y - 42, duration: 600, yoyo: true, repeat: -1 });
        npc.missionIcon = icon;
      }

      this.physics.add.overlap(this.player, zone, () => {
        this.interactableNPC = npc;
      });

      // Direct tap-on-NPC interaction (mobile-friendly)
      npc.setInteractive({ useHandCursor: true });
      npc.on('pointerdown', () => {
        this.interactableNPC = npc;
        this.handleInteraction();
      });

      // Larger invisible tap zone around NPC (matches portal tap pattern)
      const tapZone = this.add.zone(npcConfig.x, npcConfig.y, 80, 80)
        .setInteractive({ useHandCursor: true }).setDepth(6);
      tapZone.on('pointerdown', () => {
        this.interactableNPC = npc;
        this.handleInteraction();
      });

      this.tweens.add({
        targets: npc, y: npcConfig.y - 3, duration: 1500 + Math.random() * 500,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });

      this.npcs.push(npc);
    });
  }

  // ── Buildings ────────────────────────────────────────
  createBuildings(buildings) {
    buildings.forEach(b => {
      this.add.image(b.x, b.y, b.texture || 'building_house').setDepth(2);
      this.add.text(b.x, b.y + 30, b.name_ko, {
        fontSize: '10px', color: '#ffffff', backgroundColor: '#333333aa', padding: { x: 3, y: 1 }
      }).setOrigin(0.5).setDepth(3);

      const collider = this.physics.add.staticImage(b.x, b.y, b.texture || 'building_house');
      this.physics.add.collider(this.player, collider);

      this.buildingPositions.push({ x: b.x, y: b.y });
    });
  }

  // ── Top HUD ──────────────────────────────────────────
  createUI() {
    const w = this.cameras.main.width;
    const hh = this.hudHeight;
    const s = this.uiScale;
    const fs = (px) => `${Math.round(px * s)}px`;

    const hudBg = this.add.rectangle(w / 2, 0, w, hh, 0x000000, 0.7)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    const charInfo = CHARACTERS[gameState.currentCharacter];
    const charLabel = this.add.text(10 * s, 4, `${charInfo.name_ko} Lv.${gameState.current.level}`, {
      fontSize: fs(12), color: charInfo.color, fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(101);

    const barW = Math.min(120 * s, w * 0.3);
    const expBarBg = this.add.rectangle(10 * s, hh * 0.52, barW, 7 * s, 0x333355)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.expBar = this.add.rectangle(10 * s, hh * 0.52, barW * gameState.expProgress, 7 * s, 0x00ff88)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.expText = this.add.text(10 * s, hh * 0.78, `EXP ${gameState.current.exp}/${gameState.expToNextLevel}`, {
      fontSize: fs(8), color: '#88cc88'
    }).setScrollFactor(0).setDepth(101);

    this.coinText = this.add.text(w - 10, 6, `💰 ${gameState.current.coins}`, {
      fontSize: fs(12), color: '#ffd700'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);

    const chapters = dataLoader.cache.chapters || [];
    const chapter = chapters.find(c => c.id === gameState.currentChapter);
    const chapterLabel = chapter ? this.add.text(w - 10, hh * 0.6, `${chapter.name} | ${chapter.cefr}`, {
      fontSize: fs(8), color: '#8888aa'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101) : null;

    const menuBtn = this.add.text(w / 2, 6, '☰ 메뉴', {
      fontSize: fs(11), color: '#aaaacc', backgroundColor: '#ffffff11', padding: { x: 8, y: 2 }
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this.showMenu());

    // Store for resize
    this._uiElements.hud = { hudBg, charLabel, expBarBg, barW, chapterLabel, menuBtn };
  }

  // ── Interact Button (💬) ─────────────────────────────
  createInteractButton() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const s = this.uiScale;
    const r = Math.max(30, Math.round(30 * s)); // Minimum 30px for mobile tap target

    this.interactBtn = this.add.container(w - 50 * s, h * 0.78);
    const bg = this.add.circle(0, 0, r, 0xff69b4, 0.8);
    const text = this.add.text(0, 0, '💬', { fontSize: `${Math.round(24 * s)}px` }).setOrigin(0.5);
    this.interactBtn.add([bg, text]);
    this.interactBtn.setScrollFactor(0).setDepth(100).setAlpha(0).setSize(r * 2.5, r * 2.5);

    // Make entire container interactive with expanded hit area
    this.interactBtn.setInteractive(
      new Phaser.Geom.Circle(0, 0, r * 1.25),
      Phaser.Geom.Circle.Contains
    );
    this.interactBtn.on('pointerdown', () => this.handleInteraction());
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.handleInteraction());
  }

  // ── Interact Button Show/Hide with Animation ──────────
  showInteractButton() {
    if (this._interactBtnVisible) return;
    this._interactBtnVisible = true;

    // Stop any existing hide tween
    if (this._interactBtnTween) this._interactBtnTween.stop();

    // Fade in
    this.tweens.add({
      targets: this.interactBtn, alpha: 1,
      duration: 200, ease: 'Quad.easeOut'
    });

    // Start pulsing
    this._interactPulseTween = this.tweens.add({
      targets: this.interactBtn,
      scaleX: { from: 1.0, to: 1.15 },
      scaleY: { from: 1.0, to: 1.15 },
      duration: 600, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  hideInteractButton() {
    if (!this._interactBtnVisible) return;
    this._interactBtnVisible = false;

    // Stop pulsing
    if (this._interactPulseTween) {
      this._interactPulseTween.stop();
      this.interactBtn.setScale(1);
    }

    // Fade out
    this._interactBtnTween = this.tweens.add({
      targets: this.interactBtn, alpha: 0,
      duration: 150, ease: 'Quad.easeIn'
    });
  }

  // ── Controls (Keyboard + Joystick) ──────────────────
  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey('W'),
      down: this.input.keyboard.addKey('S'),
      left: this.input.keyboard.addKey('A'),
      right: this.input.keyboard.addKey('D')
    };

    this.joystickActive = false;
    this.joystickVelocity = { x: 0, y: 0 };
    this.createJoystick();
  }

  createJoystick() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const s = this.uiScale;

    // Position: bottom-left with safe margins
    const jx = Math.max(60, w * 0.12);
    const jy = h - Math.max(60, h * 0.12);
    this._joystickCenter = { x: jx, y: jy };

    const baseScale = 1.8 * s;
    const thumbScale = 1.0 * s;
    const maxDist = Math.round(35 * s);
    this._joystickMaxDist = maxDist;

    // Joystick visuals
    this.joystickBase = this.add.image(jx, jy, 'joystick_base')
      .setScrollFactor(0).setDepth(100).setAlpha(0.5).setScale(baseScale);
    this.joystickThumb = this.add.image(jx, jy, 'joystick_thumb')
      .setScrollFactor(0).setDepth(101).setAlpha(0.7).setScale(thumbScale);

    // Large drag zone — high depth to ensure it receives input
    const dragSize = Math.round(120 * s);
    this.joystickZone = this.add.rectangle(jx, jy, dragSize, dragSize, 0xffffff, 0)
      .setScrollFactor(0).setDepth(250).setInteractive({ draggable: true, useHandCursor: true });

    this.joystickZone.on('dragstart', () => {
      this.joystickActive = true;
      this.joystickBase.setAlpha(0.8);
    });
    this.joystickZone.on('drag', (pointer) => {
      // Use pointer.x/y (screen coords) — NOT dragX/dragY which are world coords
      // and would break for scrollFactor=0 objects when camera scrolls
      const cx = this._joystickCenter.x;
      const cy = this._joystickCenter.y;
      const md = this._joystickMaxDist;
      const dx = pointer.x - cx;
      const dy = pointer.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > md) {
        this.joystickThumb.x = cx + (dx / dist) * md;
        this.joystickThumb.y = cy + (dy / dist) * md;
        this.joystickVelocity = { x: dx / dist, y: dy / dist };
      } else {
        this.joystickThumb.x = pointer.x;
        this.joystickThumb.y = pointer.y;
        this.joystickVelocity = dist > 5 ? { x: dx / md, y: dy / md } : { x: 0, y: 0 };
      }
    });
    this.joystickZone.on('dragend', () => {
      this.joystickActive = false;
      this.joystickBase.setAlpha(0.5);
      this.joystickThumb.x = this._joystickCenter.x;
      this.joystickThumb.y = this._joystickCenter.y;
      this.joystickVelocity = { x: 0, y: 0 };
    });

    // D-pad labels (subtle)
    const dd = Math.round(45 * s);
    this._joystickDirLabels = [
      { text: '▲', x: jx, y: jy - dd },
      { text: '▼', x: jx, y: jy + dd },
      { text: '◀', x: jx - dd, y: jy },
      { text: '▶', x: jx + dd, y: jy }
    ].map(d => this.add.text(d.x, d.y, d.text, {
      fontSize: `${Math.round(12 * s)}px`, color: '#ff69b4'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(99).setAlpha(0.2));
  }

  // ── Portals (Auto-teleport + Tap) ───────────────────
  createPortal(x, y, targetScene, requiredLevel, labelText) {
    const portal = this.add.container(x, y);
    const glow = this.add.circle(0, 0, 30, 0x00ff88, 0.3);
    const ring = this.add.circle(0, 0, 26, 0x00ff88, 0).setStrokeStyle(2, 0x00ff88);
    const innerRing = this.add.circle(0, 0, 18, 0x00ff88, 0).setStrokeStyle(1, 0x00ff88, 0.5);
    const label = this.add.text(0, -45, labelText, {
      fontSize: '10px', color: '#00ff88', align: 'center', backgroundColor: '#00000066', padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
    portal.add([glow, ring, innerRing, label]);
    portal.setDepth(5);

    this.tweens.add({
      targets: glow, alpha: { from: 0.2, to: 0.6 }, scaleX: { from: 0.9, to: 1.1 }, scaleY: { from: 0.9, to: 1.1 },
      duration: 1200, yoyo: true, repeat: -1
    });
    this.tweens.add({
      targets: innerRing, scaleX: { from: 0.6, to: 1.0 }, scaleY: { from: 0.6, to: 1.0 }, alpha: { from: 0.8, to: 0.1 },
      duration: 1500, repeat: -1
    });

    const locked = gameState.current.level < requiredLevel;
    if (locked) {
      label.setText(`🔒 Lv.${requiredLevel} 필요\nLv.${requiredLevel} 必要`);
      glow.setFillStyle(0xff4444, 0.2);
      ring.setStrokeStyle(2, 0xff4444);
      innerRing.setStrokeStyle(1, 0xff4444, 0.5);
      label.setColor('#ff4444');
    }

    const portalZone = this.add.zone(x, y, 50, 50);
    this.physics.add.existing(portalZone, true);

    this.physics.add.overlap(this.player, portalZone, () => {
      if (!locked && !this.isTransitioning) {
        this.isTransitioning = true;
        gameState.save();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => this.scene.start(targetScene));
      } else if (locked && !this.portalLockMsgShown) {
        this.showPortalLockedMsg(requiredLevel);
      }
    });

    const tapZone = this.add.zone(x, y, 80, 80).setInteractive({ useHandCursor: true });
    tapZone.on('pointerdown', () => {
      if (!locked && !this.isTransitioning) {
        this.isTransitioning = true;
        gameState.save();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => this.scene.start(targetScene));
      } else if (locked) {
        this.showPortalLockedMsg(requiredLevel);
      }
    });

    this.portals.push({ x, y, targetScene, requiredLevel, locked });
  }

  showPortalLockedMsg(requiredLevel) {
    if (this.portalLockMsgShown) return;
    this.portalLockMsgShown = true;
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const msg = this.add.text(w / 2, h / 2, `🔒 레벨 ${requiredLevel} 이상 필요!\nLv.${requiredLevel}以上が必要！`, {
      fontSize: `${Math.round(14 * this.uiScale)}px`, color: '#ff4444', backgroundColor: '#000000cc', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(500);
    this.time.delayedCall(2000, () => { msg.destroy(); this.portalLockMsgShown = false; });
  }

  // ── Subway Entrance (지하철역 입구) ────────────────
  createSubwayEntrance(x, y, metroSceneKey, stationId, labelKo, labelJa) {
    // 지하철역 건물 이미지
    this.add.image(x, y, 'building_subway').setDepth(2);

    // 역 이름 라벨
    const labelText = labelKo + (labelJa ? '\n' + labelJa : '');
    this.add.text(x, y + 36, labelText, {
      fontSize: '9px', color: '#00ff88', align: 'center',
      backgroundColor: '#00000088', padding: { x: 4, y: 2 }
    }).setOrigin(0.5, 0).setDepth(3);

    // 지하철 아이콘 + 깜빡임
    const icon = this.add.image(x, y - 34, 'icon_subway').setDepth(15);
    this.tweens.add({
      targets: icon, y: y - 38, duration: 800,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // 물리 충돌체
    const collider = this.physics.add.staticImage(x, y, 'building_subway');
    this.physics.add.collider(this.player, collider);
    this.buildingPositions.push({ x, y });

    // 상호작용 존 (자동 진입)
    const zone = this.add.zone(x, y + 30, 60, 40);
    this.physics.add.existing(zone, true);
    this.physics.add.overlap(this.player, zone, () => {
      if (!this.isTransitioning) {
        this.enterSubway(metroSceneKey, stationId);
      }
    });

    // 탭 존
    const tapZone = this.add.zone(x, y, 80, 70)
      .setInteractive({ useHandCursor: true }).setDepth(6);
    tapZone.on('pointerdown', () => {
      if (!this.isTransitioning) {
        this.enterSubway(metroSceneKey, stationId);
      }
    });
  }

  enterSubway(metroSceneKey, stationId) {
    this.isTransitioning = true;
    gameState.lastStation = stationId;
    gameState.save();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start(metroSceneKey, { fromStation: stationId });
    });
  }

  // ── Enterable Building (진입 가능한 건물) ──────────
  createEnterableBuilding(x, y, placeSceneKey, config) {
    /*
      config = {
        texture: 'building_house',
        name_ko: '유코 집',
        name_ja: 'ユコの家',
        requiredLevel: 0,       // 진입에 필요한 레벨 (0 = 항상)
        spawnX, spawnY           // 장소맵 내 시작 위치 (optional)
      }
    */
    const texture = config.texture || 'building_house';

    // 건물 이미지
    this.add.image(x, y, texture).setDepth(2);

    // 건물 이름
    const label = config.name_ko + (config.name_ja ? '\n' + config.name_ja : '');
    this.add.text(x, y + 30, label, {
      fontSize: '9px', color: '#ffffff', align: 'center',
      backgroundColor: '#333333aa', padding: { x: 3, y: 1 }
    }).setOrigin(0.5, 0).setDepth(3);

    // 진입 가능 표시 (문 아이콘)
    const doorIcon = this.add.text(x, y - 28, '🚪', {
      fontSize: '12px'
    }).setOrigin(0.5).setDepth(15);
    this.tweens.add({
      targets: doorIcon, y: y - 32, alpha: { from: 1, to: 0.5 },
      duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // 물리 충돌
    const collider = this.physics.add.staticImage(x, y, texture);
    this.physics.add.collider(this.player, collider);
    this.buildingPositions.push({ x, y });

    const locked = (config.requiredLevel || 0) > gameState.current.level;
    if (locked) {
      doorIcon.setText('🔒');
    }

    // 상호작용 존
    const zone = this.add.zone(x, y + 30, 60, 40);
    this.physics.add.existing(zone, true);
    this.physics.add.overlap(this.player, zone, () => {
      if (!this.isTransitioning && !locked) {
        // 장소맵에서 방금 나온 경우 500ms 면역 (즉시 재진입 방지)
        if (this._placeExitImmunityUntil && Date.now() < this._placeExitImmunityUntil) return;
        this.enterBuilding(placeSceneKey, config);
      }
    });

    // 탭 존
    const tapZone = this.add.zone(x, y, 80, 60)
      .setInteractive({ useHandCursor: true }).setDepth(6);
    tapZone.on('pointerdown', () => {
      if (this.isTransitioning) return;
      if (locked) {
        this.showPortalLockedMsg(config.requiredLevel);
      } else {
        this.enterBuilding(placeSceneKey, config);
      }
    });
  }

  enterBuilding(placeSceneKey, config) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    gameState.save();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start(placeSceneKey, {
        returnScene: this.scene.key,
        spawnX: config.spawnX,
        spawnY: config.spawnY
      });
    });
  }

  // ── International Departure Gate (국제선 탑승구) ──
  createDepartureGate(x, y, labelKo, labelJa) {
    // 탑승구 건물
    this.add.image(x, y, 'building_departure').setDepth(2);

    const label = labelKo + (labelJa ? '\n' + labelJa : '');
    this.add.text(x, y + 36, label, {
      fontSize: '9px', color: '#4682B4', align: 'center',
      backgroundColor: '#00000088', padding: { x: 4, y: 2 }
    }).setOrigin(0.5, 0).setDepth(3);

    // 비행기 아이콘
    const icon = this.add.image(x, y - 34, 'icon_airplane').setDepth(15);
    this.tweens.add({
      targets: icon, y: y - 38, duration: 800,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // 물리 충돌
    const collider = this.physics.add.staticImage(x, y, 'building_departure');
    this.physics.add.collider(this.player, collider);
    this.buildingPositions.push({ x, y });

    // 상호작용 존
    const zone = this.add.zone(x, y + 30, 80, 40);
    this.physics.add.existing(zone, true);
    this.physics.add.overlap(this.player, zone, () => {
      if (!this.isTransitioning) {
        this.enterInternationalMap();
      }
    });

    // 탭 존
    const tapZone = this.add.zone(x, y, 90, 70)
      .setInteractive({ useHandCursor: true }).setDepth(6);
    tapZone.on('pointerdown', () => {
      if (!this.isTransitioning) {
        this.enterInternationalMap();
      }
    });
  }

  enterInternationalMap() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    gameState.lastAirport = gameState.currentMap;
    gameState.save();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('InternationalMapScene', {
        fromAirport: gameState.lastAirport
      });
    });
  }

  // ── Character Switch Button ─────────────────────────
  createCharacterSwitchButton() {
    const s = this.uiScale;
    const hh = this.hudHeight;
    const chars = ['yuko', 'ami', 'rui'];
    const btnSize = Math.max(16, Math.round(13 * s)); // Minimum 16px for mobile
    const spacing = Math.max(36, Math.round(30 * s)); // Minimum 36px spacing

    // Use individual scrollFactor=0 objects instead of container
    // to avoid Phaser 3's known hit-testing bug with interactive children
    // inside scrollFactor=0 containers after camera scroll
    this._charSwitchElements = [];

    const baseX = 8 * s;
    const baseY = hh + 4;

    chars.forEach((name, i) => {
      const cd = CHARACTERS[name];
      const isActive = name === gameState.currentCharacter;
      const cx = baseX + i * spacing + btnSize;
      const cy = baseY + btnSize;
      const color = Phaser.Display.Color.HexStringToColor(cd.color).color;

      const ring = this.add.circle(cx, cy, btnSize, color, isActive ? 0.5 : 0.1)
        .setStrokeStyle(isActive ? 2 : 1, color, isActive ? 1 : 0.3)
        .setScrollFactor(0).setDepth(100);
      const sprite = this.add.image(cx, cy, name).setScale(0.7 * s)
        .setScrollFactor(0).setDepth(101);

      this._charSwitchElements.push(ring, sprite);

      if (isActive) {
        const indicator = this.add.circle(cx, cy + btnSize + 2, 2, 0x00ff88, 1)
          .setScrollFactor(0).setDepth(100);
        this._charSwitchElements.push(indicator);
      }

      // Hit zone — minimum 32×32 for mobile tap, each is a direct scene object
      const hitSize = Math.max(32, btnSize * 2);
      const hitZone = this.add.rectangle(cx, cy, hitSize, hitSize, 0xffffff, 0)
        .setScrollFactor(0).setDepth(102)
        .setInteractive({ useHandCursor: true });

      hitZone.on('pointerdown', () => {
        if (name !== gameState.currentCharacter && !this._isSwitchingCharacter) {
          this.switchCharacter(name);
        }
      });

      this._charSwitchElements.push(hitZone);
    });
  }

  switchCharacter(newChar) {
    // Guard: prevent double-tap causing multiple restarts
    if (this._isSwitchingCharacter) return;
    this._isSwitchingCharacter = true;

    // Cancel any pending switch
    if (this._switchDelayedCall) {
      this._switchDelayedCall.destroy();
      this._switchDelayedCall = null;
    }

    gameState.current.x = this.player.x;
    gameState.current.y = this.player.y;
    gameState.save();
    gameState.currentCharacter = newChar;
    this.cameras.main.flash(300, 255, 105, 180, true);

    // Use Phaser timer instead of setTimeout — auto-destroyed on scene shutdown
    this._switchDelayedCall = this.time.delayedCall(300, () => {
      this._switchDelayedCall = null;
      // 장소맵(BasePlaceScene)에서 캐릭터 전환 시 → 지역맵으로 복귀
      // (다른 캐릭터는 해당 장소에 간 적이 없으므로)
      if (this.returnScene) {
        this.scene.start(this.returnScene);
      } else {
        this.scene.restart();
      }
    });
  }

  // ── Minimap ─────────────────────────────────────────
  createMinimap() {
    const w = this.cameras.main.width;
    const s = this.uiScale;
    const hh = this.hudHeight;
    const mmWidth = Math.round(Math.min(130, w * 0.2));
    const mmHeight = Math.round(mmWidth * (this.worldHeight / this.worldWidth));
    this.minimapScale = mmWidth / this.worldWidth;

    const mmX = w - mmWidth - 8;
    const mmY = hh + 4;

    this.minimapContainer = this.add.container(mmX, mmY).setScrollFactor(0).setDepth(150);

    // Background
    const bg = this.add.rectangle(0, 0, mmWidth, mmHeight, 0x0a0a2e, 0.85)
      .setOrigin(0, 0).setStrokeStyle(1, 0xff69b4, 0.4);
    this.minimapContainer.add(bg);

    // Label
    this.minimapContainer.add(this.add.text(2, 1, 'MAP', {
      fontSize: `${Math.round(6 * s)}px`, color: '#ff69b4', fontStyle: 'bold'
    }));

    // Buildings
    this.buildingPositions.forEach(b => {
      this.minimapContainer.add(this.add.rectangle(
        b.x * this.minimapScale, b.y * this.minimapScale, 4, 3, 0x888888, 0.7
      ).setOrigin(0.5));
    });

    // Portals
    this.portals.forEach(p => {
      const color = p.locked ? 0xff4444 : 0x00ff88;
      const dot = this.add.circle(p.x * this.minimapScale, p.y * this.minimapScale, 3, color, 0.9);
      this.minimapContainer.add(dot);
      this.tweens.add({
        targets: dot, scaleX: { from: 0.8, to: 1.3 }, scaleY: { from: 0.8, to: 1.3 },
        alpha: { from: 0.9, to: 0.4 }, duration: 1000, yoyo: true, repeat: -1
      });
    });

    // NPC dots
    this.minimapNpcDots = [];
    this.npcs.forEach(npc => {
      const dot = this.add.circle(npc.x * this.minimapScale, npc.y * this.minimapScale, 2, 0xffa500, 0.8);
      this.minimapContainer.add(dot);
      this.minimapNpcDots.push({ dot, npc });
    });

    // Camera viewport rect
    this.minimapViewport = this.add.rectangle(0, 0, 20, 15, 0xffffff, 0.08)
      .setStrokeStyle(1, 0xffffff, 0.35).setOrigin(0.5);
    this.minimapContainer.add(this.minimapViewport);

    // Player dot
    const playerColor = Phaser.Display.Color.HexStringToColor(CHARACTERS[gameState.currentCharacter].color).color;
    this.minimapPlayerDot = this.add.circle(0, 0, 3, playerColor, 1);
    this.tweens.add({
      targets: this.minimapPlayerDot,
      scaleX: { from: 1, to: 1.5 }, scaleY: { from: 1, to: 1.5 },
      alpha: { from: 1, to: 0.6 }, duration: 800, yoyo: true, repeat: -1
    });
    this.minimapContainer.add(this.minimapPlayerDot);

    // Hit zone — MUST be last child so it's on top inside the container
    this.minimapHitZone = this.add.rectangle(0, 0, mmWidth, mmHeight, 0xffffff, 0)
      .setOrigin(0, 0).setInteractive({ useHandCursor: true });
    this.minimapContainer.add(this.minimapHitZone);
    this.minimapHitZone.on('pointerdown', () => this.toggleMinimapExpanded());

    // Store small-mode sizes
    this.minimapSmallX = mmX;
    this.minimapSmallY = mmY;
    this.minimapSmallW = mmWidth;
    this.minimapSmallH = mmHeight;
  }

  updateMinimap() {
    if (!this.minimapPlayerDot || !this.player) return;

    const scale = this.minimapExpanded
      ? (this.minimapSmallW * 2.5 / this.worldWidth) * this.minimapExpandedZoom
      : this.minimapScale;

    this.minimapPlayerDot.x = this.player.x * scale;
    this.minimapPlayerDot.y = this.player.y * scale;

    this.minimapNpcDots.forEach(({ dot, npc }) => {
      dot.x = npc.x * scale;
      dot.y = npc.y * scale;
    });

    const cam = this.cameras.main;
    const vpW = (cam.width / cam.zoom) * scale;
    const vpH = (cam.height / cam.zoom) * scale;
    this.minimapViewport.x = this.minimapPlayerDot.x;
    this.minimapViewport.y = this.minimapPlayerDot.y;
    this.minimapViewport.width = vpW;
    this.minimapViewport.height = vpH;
  }

  toggleMinimapExpanded() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    if (!this.minimapExpanded) {
      this.minimapExpanded = true;
      this.minimapExpandedZoom = 1;

      // Semi-transparent overlay — NO setInteractive to avoid blocking pinch
      this.minimapOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6)
        .setScrollFactor(0).setDepth(149);

      // Expand container
      const expandScale = Math.min(2.5, (Math.min(w, h) * 0.8) / this.minimapSmallW);
      this._expandScale = expandScale;
      const expandedW = this.minimapSmallW * expandScale;
      const expandedH = this.minimapSmallH * expandScale;
      this.minimapContainer.setPosition((w - expandedW) / 2, (h - expandedH) / 2);
      this.minimapContainer.setScale(expandScale);
      this.minimapContainer.setDepth(200);

      // Close button
      this.minimapCloseBtn = this.add.text(w / 2, (h + expandedH) / 2 + 16, '✕ 닫기 / 閉じる  (스크롤로 줌 / スクロールでズーム)', {
        fontSize: `${Math.round(10 * this.uiScale)}px`, color: '#aaaacc', backgroundColor: '#00000088', padding: { x: 10, y: 4 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive({ useHandCursor: true });
      this.minimapCloseBtn.on('pointerdown', () => this.toggleMinimapExpanded());

      // Zoom indicator
      this.minimapZoomText = this.add.text(w / 2, (h - expandedH) / 2 - 14, `🔍 x${this.minimapExpandedZoom.toFixed(1)}`, {
        fontSize: `${Math.round(10 * this.uiScale)}px`, color: '#ff69b4'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    } else {
      this.minimapExpanded = false;
      this.minimapExpandedZoom = 1;

      if (this.minimapOverlay) { this.minimapOverlay.destroy(); this.minimapOverlay = null; }
      if (this.minimapCloseBtn) { this.minimapCloseBtn.destroy(); this.minimapCloseBtn = null; }
      if (this.minimapZoomText) { this.minimapZoomText.destroy(); this.minimapZoomText = null; }

      this.minimapContainer.setPosition(this.minimapSmallX, this.minimapSmallY);
      this.minimapContainer.setScale(1);
      this.minimapContainer.setDepth(150);
    }
  }

  // ── Pinch Zoom (Camera + Minimap) ──────────────────
  setupPinchZoom() {
    // Use Phaser's pointer1/pointer2 (correct API for Phaser 3.x)
    let pinchStartDist = 0;
    let pinchStartZoom = 1;
    let isPinching = false;

    this.input.on('pointerdown', () => {
      const p1 = this.input.pointer1;
      const p2 = this.input.pointer2;
      if (p1.isDown && p2.isDown) {
        isPinching = true;
        pinchStartDist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        pinchStartZoom = this.minimapExpanded ? this.minimapExpandedZoom : this.cameras.main.zoom;
      }
    });

    this.input.on('pointermove', () => {
      if (!isPinching) return;
      const p1 = this.input.pointer1;
      const p2 = this.input.pointer2;
      if (!p1.isDown || !p2.isDown || pinchStartDist < 10) return;

      const currentDist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
      const ratio = currentDist / pinchStartDist;

      if (this.minimapExpanded) {
        this.minimapExpandedZoom = Phaser.Math.Clamp(pinchStartZoom * ratio, this.minimapMinZoom, this.minimapMaxZoom);
        const baseScale = this._expandScale || 2.5;
        this.minimapContainer.setScale(baseScale * this.minimapExpandedZoom);
        if (this.minimapZoomText) this.minimapZoomText.setText(`🔍 x${this.minimapExpandedZoom.toFixed(1)}`);
      } else {
        this.currentZoom = Phaser.Math.Clamp(pinchStartZoom * ratio, this.minCameraZoom, this.maxCameraZoom);
        this.cameras.main.setZoom(this.currentZoom);
      }
    });

    this.input.on('pointerup', () => {
      const p1 = this.input.pointer1;
      const p2 = this.input.pointer2;
      if (!p1.isDown || !p2.isDown) {
        isPinching = false;
        pinchStartDist = 0;
      }
    });

    // Mouse wheel zoom
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      const step = deltaY * 0.002;
      if (this.minimapExpanded) {
        this.minimapExpandedZoom = Phaser.Math.Clamp(
          this.minimapExpandedZoom - step, this.minimapMinZoom, this.minimapMaxZoom
        );
        const baseScale = this._expandScale || 2.5;
        this.minimapContainer.setScale(baseScale * this.minimapExpandedZoom);
        if (this.minimapZoomText) this.minimapZoomText.setText(`🔍 x${this.minimapExpandedZoom.toFixed(1)}`);
      } else {
        this.currentZoom = Phaser.Math.Clamp(this.currentZoom - step, this.minCameraZoom, this.maxCameraZoom);
        this.cameras.main.setZoom(this.currentZoom);
      }
    });
  }

  // ── Resize Handler ─────────────────────────────────
  handleResize(newW, newH) {
    if (!this.cameras || !this.cameras.main) return;

    const s = this.uiScale;
    const hh = this.hudHeight;

    // Update camera bounds
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.setZoom(this.currentZoom);

    // ── HUD bar ──
    const hud = this._uiElements.hud;
    if (hud) {
      hud.hudBg.setPosition(newW / 2, 0).setSize(newW, hh);
      if (hud.charLabel) hud.charLabel.setPosition(10 * s, 4);
      if (hud.expBarBg) hud.expBarBg.setPosition(10 * s, hh * 0.52);
      if (this.expBar) this.expBar.setPosition(10 * s, hh * 0.52);
      if (this.expText) this.expText.setPosition(10 * s, hh * 0.78);
      if (hud.chapterLabel) hud.chapterLabel.setPosition(newW - 10, hh * 0.6);
      if (hud.menuBtn) hud.menuBtn.setPosition(newW / 2, 6);
    }
    if (this.coinText) this.coinText.setPosition(newW - 10, 6);

    // ── Minimap (small mode) ──
    if (this.minimapContainer && !this.minimapExpanded) {
      const mmWidth = Math.round(Math.min(130, newW * 0.2));
      this.minimapSmallX = newW - mmWidth - 8;
      this.minimapContainer.setPosition(this.minimapSmallX, this.minimapSmallY);
    }

    // ── Interact button ──
    if (this.interactBtn) {
      this.interactBtn.setPosition(newW - 50 * s, newH * 0.78);
    }

    // ── Joystick ──
    if (this.joystickBase) {
      const jx = Math.max(60, newW * 0.12);
      const jy = newH - Math.max(60, newH * 0.12);
      this._joystickCenter = { x: jx, y: jy };
      this.joystickBase.setPosition(jx, jy);
      this.joystickThumb.setPosition(jx, jy);
      this.joystickZone.setPosition(jx, jy);
      if (this._joystickDirLabels) {
        const dd = Math.round(45 * s);
        const dirs = [
          { x: jx, y: jy - dd }, { x: jx, y: jy + dd },
          { x: jx - dd, y: jy }, { x: jx + dd, y: jy }
        ];
        this._joystickDirLabels.forEach((label, i) => label.setPosition(dirs[i].x, dirs[i].y));
      }
    }

    // ── Character switch ── (no action needed — individual scrollFactor=0 objects auto-position)
  }

  // ── Update ──────────────────────────────────────────
  update() {
    if (!this.player || !this.player.body) return;

    const speed = PLAYER_SPEED;
    let vx = 0, vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;

    if (vx === 0 && vy === 0 && this.joystickActive) {
      vx = this.joystickVelocity.x * speed;
      vy = this.joystickVelocity.y * speed;
    }

    this.player.body.setVelocity(vx, vy);
    if (vx !== 0 && vy !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // NPC interaction check (with highlight ring + grace period)
    if (this.interactableNPC) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.interactableNPC.x, this.interactableNPC.y
      );
      if (dist < 80) {
        this._npcGraceTime = null; // Reset grace timer
        this.showInteractButton();

        // NPC highlight ring
        if (!this._npcHighlight) {
          this._npcHighlight = this.add.circle(
            this.interactableNPC.x, this.interactableNPC.y,
            22, 0xff69b4, 0
          ).setStrokeStyle(2, 0xff69b4, 0.7).setDepth(4);
          this.tweens.add({
            targets: this._npcHighlight,
            scaleX: { from: 0.8, to: 1.3 }, scaleY: { from: 0.8, to: 1.3 },
            alpha: { from: 0.5, to: 0 },
            duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
          });
        }
        // Follow NPC bob animation
        if (this._npcHighlight) {
          this._npcHighlight.setPosition(this.interactableNPC.x, this.interactableNPC.y);
        }

        // Keyboard interaction (desktop)
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
          this.handleInteraction();
        }
      } else {
        // Grace period: keep NPC reference for 300ms after leaving range
        if (!this._npcGraceTime) {
          this._npcGraceTime = this.time.now;
        }
        if (this.time.now - this._npcGraceTime > 300) {
          this.hideInteractButton();
          this.interactableNPC = null;
          this._npcGraceTime = null;
          if (this._npcHighlight) {
            this._npcHighlight.destroy();
            this._npcHighlight = null;
          }
        }
      }
    } else {
      // Clean up if NPC reference was lost
      if (this._npcHighlight) {
        this._npcHighlight.destroy();
        this._npcHighlight = null;
      }
    }

    this.updateMinimap();
  }

  // ── Interaction Handler ─────────────────────────────
  handleInteraction() {
    if (!this.interactableNPC) return;
    const npcData = this.interactableNPC.npcData;

    if (npcData.hasMission) {
      this.scene.pause();
      const missions = dataLoader.getCachedMissions(gameState.currentChapter, gameState.currentLesson);
      this.scene.launch('MissionScene', { missions, returnScene: this.scene.key });
    } else if (npcData.hasDialogue) {
      this.scene.pause();
      const dialogue = dataLoader.getCachedDialogue(gameState.currentChapter, gameState.currentLesson);
      this.scene.launch('DialogueScene', { dialogue, returnScene: this.scene.key });
    } else {
      this.showSimpleDialogue(npcData);
    }
  }

  // ── Simple Dialogue Box ─────────────────────────────
  showSimpleDialogue(npcData) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const s = this.uiScale;
    const fs = (px) => `${Math.round(px * s)}px`;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.5).setScrollFactor(0).setDepth(200);
    const boxH = Math.round(100 * s);
    const box = this.add.rectangle(w / 2, h - boxH / 2 - 10, w - 20, boxH, 0x1a1a3e, 0.95)
      .setStrokeStyle(1, 0xff69b4, 0.5).setScrollFactor(0).setDepth(201);
    const name = this.add.text(20, h - boxH - 12, npcData.name_ko, {
      fontSize: fs(13), color: '#ff69b4', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(202);
    const text = this.add.text(20, h - boxH + 4, npcData.greeting_ko || '안녕하세요!', {
      fontSize: fs(12), color: '#ffffff', wordWrap: { width: w - 40 }, lineSpacing: 4
    }).setScrollFactor(0).setDepth(202);
    const jaText = this.add.text(20, h - boxH / 2 + 4, npcData.greeting_ja || 'こんにちは！', {
      fontSize: fs(10), color: '#aaaacc', wordWrap: { width: w - 40 }
    }).setScrollFactor(0).setDepth(202);
    const closeHint = this.add.text(w - 20, h - 18, '탭하여 닫기 / タップで閉じる', {
      fontSize: fs(9), color: '#666688'
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(202);

    const closeAll = () => { [overlay, box, name, text, jaText, closeHint].forEach(o => o.destroy()); };
    overlay.setInteractive().on('pointerdown', closeAll);
    box.setInteractive().on('pointerdown', closeAll);
  }

  // ── Menu Overlay ────────────────────────────────────
  showMenu() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const s = this.uiScale;
    const fs = (px) => `${Math.round(px * s)}px`;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setScrollFactor(0).setDepth(300);
    const panelW = Math.min(300, w * 0.85);
    const panelH = Math.min(380, h * 0.7);
    const panel = this.add.rectangle(w / 2, h / 2, panelW, panelH, 0x1a1a3e, 0.95)
      .setStrokeStyle(1, 0xff69b4, 0.5).setScrollFactor(0).setDepth(301);
    const title = this.add.text(w / 2, h / 2 - panelH * 0.38, '메뉴 / メニュー', {
      fontSize: fs(17), color: '#ff69b4', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

    const menuItems = [
      { text: '단어장 / 単語帳', action: () => { closeMenu(); this.scene.pause(); this.scene.launch('VocabularyScene', { returnScene: this.scene.key }); } },
      { text: '미션 / ミッション', action: () => { closeMenu(); this.scene.pause(); const missions = dataLoader.getCachedMissions(gameState.currentChapter, gameState.currentLesson); this.scene.launch('MissionScene', { missions, returnScene: this.scene.key }); } },
      { text: '상점 / ショップ', action: () => { closeMenu(); this.scene.pause(); this.scene.launch('ShopScene', { returnScene: this.scene.key }); } },
      { text: '챕터 선택 / チャプター', action: () => { closeMenu(); this.scene.start('ChapterSelectScene'); } },
      { text: '타이틀로 / タイトルへ', action: () => { closeMenu(); this.scene.start('TitleScene'); } }
    ];

    const elements = [overlay, panel, title];
    const itemSpacing = Math.round(42 * s);
    menuItems.forEach((item, i) => {
      const btn = this.add.text(w / 2, h / 2 - panelH * 0.2 + i * itemSpacing, item.text, {
        fontSize: fs(13), color: '#ffffff', backgroundColor: '#ff69b422', padding: { x: 30, y: 8 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#ff69b444' }));
      btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#ff69b422' }));
      btn.on('pointerdown', item.action);
      elements.push(btn);
    });

    const closeBtn = this.add.text(w / 2, h / 2 + panelH * 0.38, '✕ 닫기', {
      fontSize: fs(13), color: '#888888'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => closeMenu());
    elements.push(closeBtn);

    const closeMenu = () => elements.forEach(e => e.destroy());
    overlay.setInteractive().on('pointerdown', closeMenu);
  }

  // ── UI Update ───────────────────────────────────────
  updateUI() {
    const s = this.uiScale;
    const barW = Math.min(120 * s, this.cameras.main.width * 0.3);
    if (this.expBar) this.expBar.width = barW * gameState.expProgress;
    if (this.expText) this.expText.setText(`EXP ${gameState.current.exp}/${gameState.expToNextLevel}`);
    if (this.coinText) this.coinText.setText(`💰 ${gameState.current.coins}`);
  }

  // ── Scene Title Overlay ─────────────────────────────
  showSceneTitle(titleKo, titleJa, subtitle, accentColor = '#ff69b4') {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const s = this.uiScale;

    const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6).setScrollFactor(0).setDepth(500);
    const tko = this.add.text(w / 2, h / 2 - 30 * s, titleKo, {
      fontSize: `${Math.round(26 * s)}px`, color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
    const tja = this.add.text(w / 2, h / 2 + 10 * s, titleJa, {
      fontSize: `${Math.round(15 * s)}px`, color: accentColor
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
    const sub = this.add.text(w / 2, h / 2 + 32 * s, subtitle, {
      fontSize: `${Math.round(11 * s)}px`, color: '#aaaacc'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501);

    this.tweens.add({
      targets: [bg, tko, tja, sub], alpha: 0, delay: 2000, duration: 800,
      onComplete: () => { [bg, tko, tja, sub].forEach(o => o.destroy()); }
    });
  }
}
