import Phaser from 'phaser';
import { gameState } from '../systems/GameState.js';
import { dataLoader } from '../systems/DataLoader.js';
import { CHARACTERS, PLAYER_SPEED } from '../constants.js';

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
    this.minimapPinchStartDist = 0;
    this.minimapPinchStartZoom = 1;

    // Camera pinch zoom
    this.cameraPinchStartDist = 0;
    this.cameraPinchStartZoom = 1.5;
    this.currentZoom = 1.5;
    this.minCameraZoom = 0.7;
    this.maxCameraZoom = 2.5;
  }

  createWorld(config) {
    this.isTransitioning = false;
    this.portalLockMsgShown = false;
    this.portals = [];
    this.buildingPositions = [];
    this.npcs = [];

    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.createTilemap(config.tiles || 'grass');

    const charName = gameState.currentCharacter;
    this.player = this.physics.add.sprite(config.startX || 400, config.startY || 600, charName);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

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
  }

  // ── Tilemap ──────────────────────────────────────────
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

  // ── NPCs ─────────────────────────────────────────────
  createNPCs(npcList) {
    npcList.forEach(npcConfig => {
      const npc = this.physics.add.sprite(npcConfig.x, npcConfig.y, 'npc_' + (npcConfig.texture || 'hyunjeong'));
      npc.setImmovable(true);
      npc.setDepth(5);
      npc.npcData = npcConfig;

      const zone = this.add.zone(npcConfig.x, npcConfig.y, 60, 60);
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

    this.add.rectangle(w / 2, 0, w, 50, 0x000000, 0.7).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    const charInfo = CHARACTERS[gameState.currentCharacter];
    this.add.text(10, 5, `${charInfo.name_ko} Lv.${gameState.current.level}`, {
      fontSize: '12px', color: charInfo.color, fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(101);

    this.add.rectangle(10, 25, 120, 8, 0x333355).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.expBar = this.add.rectangle(10, 25, 120 * gameState.expProgress, 8, 0x00ff88).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.expText = this.add.text(10, 35, `EXP ${gameState.current.exp}/${gameState.expToNextLevel}`, {
      fontSize: '9px', color: '#88cc88'
    }).setScrollFactor(0).setDepth(101);

    this.coinText = this.add.text(w - 10, 8, `💰 ${gameState.current.coins}`, {
      fontSize: '13px', color: '#ffd700'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);

    const chapters = dataLoader.cache.chapters || [];
    const chapter = chapters.find(c => c.id === gameState.currentChapter);
    if (chapter) {
      this.add.text(w - 10, 28, `${chapter.name} | ${chapter.cefr}`, {
        fontSize: '9px', color: '#8888aa'
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
    }

    const menuBtn = this.add.text(w / 2, 8, '☰ 메뉴', {
      fontSize: '12px', color: '#aaaacc', backgroundColor: '#ffffff11', padding: { x: 8, y: 2 }
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this.showMenu());
  }

  // ── Interact Button (💬) ─────────────────────────────
  createInteractButton() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.interactBtn = this.add.container(w - 50, h - 120);
    const bg = this.add.circle(0, 0, 28, 0xff69b4, 0.8);
    const text = this.add.text(0, 0, '💬', { fontSize: '22px' }).setOrigin(0.5);
    this.interactBtn.add([bg, text]);
    this.interactBtn.setScrollFactor(0).setDepth(100).setAlpha(0).setSize(56, 56);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.handleInteraction());
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
    const h = this.cameras.main.height;
    const jx = 70, jy = h - 80;

    // Bigger, more visible joystick
    this.joystickBase = this.add.image(jx, jy, 'joystick_base')
      .setScrollFactor(0).setDepth(100).setAlpha(0.6).setScale(2.0);
    this.joystickThumb = this.add.image(jx, jy, 'joystick_thumb')
      .setScrollFactor(0).setDepth(101).setAlpha(0.8).setScale(1.2);

    // Much larger drag zone for easier mobile use
    const dragSize = 140;
    const joystickZone = this.add.rectangle(jx, jy, dragSize, dragSize, 0xffffff, 0)
      .setScrollFactor(0).setDepth(102).setInteractive({ draggable: true });

    joystickZone.on('dragstart', () => {
      this.joystickActive = true;
      this.joystickBase.setAlpha(0.8);
    });
    joystickZone.on('drag', (pointer, dragX, dragY) => {
      const dx = dragX - jx;
      const dy = dragY - jy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 40;

      if (dist > maxDist) {
        this.joystickThumb.x = jx + (dx / dist) * maxDist;
        this.joystickThumb.y = jy + (dy / dist) * maxDist;
        this.joystickVelocity = { x: dx / dist, y: dy / dist };
      } else {
        this.joystickThumb.x = dragX;
        this.joystickThumb.y = dragY;
        this.joystickVelocity = dist > 5 ? { x: dx / maxDist, y: dy / maxDist } : { x: 0, y: 0 };
      }
    });
    joystickZone.on('dragend', () => {
      this.joystickActive = false;
      this.joystickBase.setAlpha(0.6);
      this.joystickThumb.x = jx;
      this.joystickThumb.y = jy;
      this.joystickVelocity = { x: 0, y: 0 };
    });

    // D-pad direction labels around joystick
    const dirs = [
      { text: '▲', x: jx, y: jy - 55 },
      { text: '▼', x: jx, y: jy + 55 },
      { text: '◀', x: jx - 55, y: jy },
      { text: '▶', x: jx + 55, y: jy }
    ];
    dirs.forEach(d => {
      this.add.text(d.x, d.y, d.text, {
        fontSize: '14px', color: '#ff69b4', alpha: 0.3
      }).setOrigin(0.5).setScrollFactor(0).setDepth(99).setAlpha(0.25);
    });
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

    // Pulsing animation
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

    // Physics overlap zone — auto-teleport when player walks in
    const portalZone = this.add.zone(x, y, 50, 50);
    this.physics.add.existing(portalZone, true);

    this.physics.add.overlap(this.player, portalZone, () => {
      if (!locked && !this.isTransitioning) {
        this.isTransitioning = true;
        gameState.save();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        setTimeout(() => this.scene.start(targetScene), 500);
      } else if (locked && !this.portalLockMsgShown) {
        this.showPortalLockedMsg(requiredLevel);
      }
    });

    // Tap zone (bigger clickable area)
    const tapZone = this.add.zone(x, y, 80, 80).setInteractive({ useHandCursor: true });
    tapZone.on('pointerdown', () => {
      if (!locked && !this.isTransitioning) {
        this.isTransitioning = true;
        gameState.save();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        setTimeout(() => this.scene.start(targetScene), 500);
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
      fontSize: '16px', color: '#ff4444', backgroundColor: '#000000cc', padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(500);
    setTimeout(() => { msg.destroy(); this.portalLockMsgShown = false; }, 2000);
  }

  // ── Character Switch Button ─────────────────────────
  createCharacterSwitchButton() {
    const chars = ['yuko', 'ami', 'rui'];

    this.charSwitchContainer = this.add.container(10, 52).setScrollFactor(0).setDepth(100);

    chars.forEach((name, i) => {
      const cd = CHARACTERS[name];
      const isActive = name === gameState.currentCharacter;
      const btnX = i * 34;
      const color = Phaser.Display.Color.HexStringToColor(cd.color).color;

      const ring = this.add.circle(btnX + 14, 14, 14, color, isActive ? 0.5 : 0.1)
        .setStrokeStyle(isActive ? 2 : 1, color, isActive ? 1 : 0.3);
      const sprite = this.add.image(btnX + 14, 14, name).setScale(0.8);

      // Active indicator
      if (isActive) {
        const indicator = this.add.circle(btnX + 14, 28, 2, 0x00ff88, 1);
        this.charSwitchContainer.add(indicator);
      }

      const hitZone = this.add.rectangle(btnX + 14, 14, 30, 30, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });

      hitZone.on('pointerdown', () => {
        if (name !== gameState.currentCharacter) {
          this.switchCharacter(name);
        }
      });

      this.charSwitchContainer.add([ring, sprite, hitZone]);
    });
  }

  switchCharacter(newChar) {
    // Save current position
    gameState.current.x = this.player.x;
    gameState.current.y = this.player.y;
    gameState.save();

    // Switch character
    gameState.currentCharacter = newChar;

    // Flash and restart
    this.cameras.main.flash(300, 255, 105, 180, true);
    setTimeout(() => this.scene.restart(), 300);
  }

  // ── Minimap ─────────────────────────────────────────
  createMinimap() {
    const w = this.cameras.main.width;
    const mmWidth = 110;
    const mmHeight = Math.round(mmWidth * (this.worldHeight / this.worldWidth));
    this.minimapScale = mmWidth / this.worldWidth;

    const mmX = w - mmWidth - 8;
    const mmY = 54;

    // Container (small mode)
    this.minimapContainer = this.add.container(mmX, mmY).setScrollFactor(0).setDepth(150);

    // Background
    const bg = this.add.rectangle(0, 0, mmWidth, mmHeight, 0x0a0a2e, 0.85)
      .setOrigin(0, 0).setStrokeStyle(1, 0xff69b4, 0.4);
    this.minimapContainer.add(bg);

    // Label
    const mapLabel = this.add.text(2, 2, 'MAP', {
      fontSize: '7px', color: '#ff69b4', fontStyle: 'bold'
    });
    this.minimapContainer.add(mapLabel);

    // Buildings (gray squares)
    this.buildingPositions.forEach(b => {
      const dot = this.add.rectangle(
        b.x * this.minimapScale, b.y * this.minimapScale,
        4, 3, 0x888888, 0.7
      ).setOrigin(0.5);
      this.minimapContainer.add(dot);
    });

    // Portals (green/red circles)
    this.portals.forEach(p => {
      const color = p.locked ? 0xff4444 : 0x00ff88;
      const dot = this.add.circle(
        p.x * this.minimapScale, p.y * this.minimapScale,
        3, color, 0.9
      );
      this.minimapContainer.add(dot);
      // Portal pulse
      this.tweens.add({
        targets: dot, scaleX: { from: 0.8, to: 1.3 }, scaleY: { from: 0.8, to: 1.3 },
        alpha: { from: 0.9, to: 0.4 }, duration: 1000, yoyo: true, repeat: -1
      });
    });

    // NPC dots (orange)
    this.minimapNpcDots = [];
    this.npcs.forEach(npc => {
      const dot = this.add.circle(
        npc.x * this.minimapScale, npc.y * this.minimapScale,
        2, 0xffa500, 0.8
      );
      this.minimapContainer.add(dot);
      this.minimapNpcDots.push({ dot, npc });
    });

    // Camera viewport rectangle
    this.minimapViewport = this.add.rectangle(0, 0, 20, 15, 0xffffff, 0.08)
      .setStrokeStyle(1, 0xffffff, 0.35).setOrigin(0.5);
    this.minimapContainer.add(this.minimapViewport);

    // Player dot (largest, colored)
    const playerColor = Phaser.Display.Color.HexStringToColor(
      CHARACTERS[gameState.currentCharacter].color
    ).color;
    this.minimapPlayerDot = this.add.circle(0, 0, 3, playerColor, 1);
    // Player pulse
    this.tweens.add({
      targets: this.minimapPlayerDot,
      scaleX: { from: 1, to: 1.5 }, scaleY: { from: 1, to: 1.5 },
      alpha: { from: 1, to: 0.6 }, duration: 800, yoyo: true, repeat: -1
    });
    this.minimapContainer.add(this.minimapPlayerDot);

    // Tap minimap to expand
    const hitZone = this.add.rectangle(0, 0, mmWidth, mmHeight, 0xffffff, 0)
      .setOrigin(0, 0).setInteractive({ useHandCursor: true });
    this.minimapContainer.add(hitZone);
    hitZone.on('pointerdown', () => this.toggleMinimapExpanded());

    // Store original position for toggle
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

    // Player position
    this.minimapPlayerDot.x = this.player.x * scale;
    this.minimapPlayerDot.y = this.player.y * scale;

    // NPC positions
    this.minimapNpcDots.forEach(({ dot, npc }) => {
      dot.x = npc.x * scale;
      dot.y = npc.y * scale;
    });

    // Camera viewport
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
      // Expand minimap to center
      this.minimapExpanded = true;
      this.minimapExpandedZoom = 1;

      // Overlay background
      this.minimapOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6)
        .setScrollFactor(0).setDepth(149).setInteractive();
      this.minimapOverlay.on('pointerdown', () => this.toggleMinimapExpanded());

      // Move container to center
      const expandedW = this.minimapSmallW * 2.5;
      const expandedH = this.minimapSmallH * 2.5;
      this.minimapContainer.setPosition(
        (w - expandedW) / 2,
        (h - expandedH) / 2
      );
      this.minimapContainer.setScale(2.5);
      this.minimapContainer.setDepth(200);

      // Close button
      this.minimapCloseBtn = this.add.text(w / 2, h / 2 + expandedH / 2 + 20, '✕ 닫기 / 閉じる  (핀치로 줌 / ピンチでズーム)', {
        fontSize: '11px', color: '#aaaacc', backgroundColor: '#00000088', padding: { x: 10, y: 4 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive({ useHandCursor: true });
      this.minimapCloseBtn.on('pointerdown', () => this.toggleMinimapExpanded());

      // Zoom indicator
      this.minimapZoomText = this.add.text(w / 2, (h - expandedH) / 2 - 15, `🔍 x${this.minimapExpandedZoom.toFixed(1)}`, {
        fontSize: '11px', color: '#ff69b4'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    } else {
      // Collapse back to corner
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
    this.input.on('pointerdown', () => {
      const activePointers = this.input.manager.pointers.filter(p => p.isDown);
      if (activePointers.length >= 2) {
        const p1 = activePointers[0];
        const p2 = activePointers[1];
        const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);

        if (this.minimapExpanded) {
          this.minimapPinchStartDist = dist;
          this.minimapPinchStartZoom = this.minimapExpandedZoom;
        } else {
          this.cameraPinchStartDist = dist;
          this.cameraPinchStartZoom = this.cameras.main.zoom;
        }
      }
    });

    this.input.on('pointermove', () => {
      const activePointers = this.input.manager.pointers.filter(p => p.isDown);
      if (activePointers.length >= 2) {
        const p1 = activePointers[0];
        const p2 = activePointers[1];
        const currentDist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);

        if (this.minimapExpanded && this.minimapPinchStartDist > 0) {
          // Pinch zoom on expanded minimap
          const ratio = currentDist / this.minimapPinchStartDist;
          this.minimapExpandedZoom = Phaser.Math.Clamp(
            this.minimapPinchStartZoom * ratio,
            this.minimapMinZoom, this.minimapMaxZoom
          );
          this.minimapContainer.setScale(2.5 * this.minimapExpandedZoom);
          if (this.minimapZoomText) {
            this.minimapZoomText.setText(`🔍 x${this.minimapExpandedZoom.toFixed(1)}`);
          }
        } else if (!this.minimapExpanded && this.cameraPinchStartDist > 0) {
          // Pinch zoom on camera
          const ratio = currentDist / this.cameraPinchStartDist;
          this.currentZoom = Phaser.Math.Clamp(
            this.cameraPinchStartZoom * ratio,
            this.minCameraZoom, this.maxCameraZoom
          );
          this.cameras.main.setZoom(this.currentZoom);
        }
      }
    });

    this.input.on('pointerup', () => {
      const activePointers = this.input.manager.pointers.filter(p => p.isDown);
      if (activePointers.length < 2) {
        this.cameraPinchStartDist = 0;
        this.minimapPinchStartDist = 0;
      }
    });

    // Mouse wheel zoom (for desktop testing)
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      if (this.minimapExpanded) {
        this.minimapExpandedZoom = Phaser.Math.Clamp(
          this.minimapExpandedZoom - deltaY * 0.001,
          this.minimapMinZoom, this.minimapMaxZoom
        );
        this.minimapContainer.setScale(2.5 * this.minimapExpandedZoom);
        if (this.minimapZoomText) {
          this.minimapZoomText.setText(`🔍 x${this.minimapExpandedZoom.toFixed(1)}`);
        }
      } else {
        this.currentZoom = Phaser.Math.Clamp(
          this.currentZoom - deltaY * 0.001,
          this.minCameraZoom, this.maxCameraZoom
        );
        this.cameras.main.setZoom(this.currentZoom);
      }
    });
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

    // NPC interaction check
    if (this.interactableNPC) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.interactableNPC.x, this.interactableNPC.y
      );
      if (dist < 50) {
        this.interactBtn.setAlpha(1);
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
          this.handleInteraction();
        }
      } else {
        this.interactBtn.setAlpha(0);
        this.interactableNPC = null;
      }
    }

    // Update minimap
    this.updateMinimap();
  }

  // ── Interaction Handler ─────────────────────────────
  handleInteraction() {
    if (!this.interactableNPC) return;
    const npcData = this.interactableNPC.npcData;

    if (npcData.hasMission) {
      this.scene.pause();
      const missions = dataLoader.getCachedMissions(gameState.currentChapter, gameState.currentLesson);
      this.scene.launch('MissionScene', {
        missions: missions,
        returnScene: this.scene.key
      });
    } else if (npcData.hasDialogue) {
      this.scene.pause();
      const dialogue = dataLoader.getCachedDialogue(gameState.currentChapter, gameState.currentLesson);
      this.scene.launch('DialogueScene', {
        dialogue: dialogue,
        returnScene: this.scene.key
      });
    } else {
      this.showSimpleDialogue(npcData);
    }
  }

  // ── Simple Dialogue Box ─────────────────────────────
  showSimpleDialogue(npcData) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.5).setScrollFactor(0).setDepth(200);
    const box = this.add.rectangle(w / 2, h - 80, w - 20, 120, 0x1a1a3e, 0.95)
      .setStrokeStyle(1, 0xff69b4, 0.5).setScrollFactor(0).setDepth(201);
    const name = this.add.text(25, h - 130, npcData.name_ko, {
      fontSize: '14px', color: '#ff69b4', fontStyle: 'bold'
    }).setScrollFactor(0).setDepth(202);
    const text = this.add.text(25, h - 108, npcData.greeting_ko || '안녕하세요!', {
      fontSize: '13px', color: '#ffffff', wordWrap: { width: w - 50 }, lineSpacing: 4
    }).setScrollFactor(0).setDepth(202);
    const jaText = this.add.text(25, h - 68, npcData.greeting_ja || 'こんにちは！', {
      fontSize: '11px', color: '#aaaacc', wordWrap: { width: w - 50 }
    }).setScrollFactor(0).setDepth(202);
    const closeHint = this.add.text(w - 25, h - 40, '탭하여 닫기 / タップで閉じる', {
      fontSize: '10px', color: '#666688'
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(202);

    const closeAll = () => { [overlay, box, name, text, jaText, closeHint].forEach(o => o.destroy()); };
    overlay.setInteractive().on('pointerdown', closeAll);
    box.setInteractive().on('pointerdown', closeAll);
  }

  // ── Menu Overlay ────────────────────────────────────
  showMenu() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setScrollFactor(0).setDepth(300);
    const panel = this.add.rectangle(w / 2, h / 2, 280, 370, 0x1a1a3e, 0.95)
      .setStrokeStyle(1, 0xff69b4, 0.5).setScrollFactor(0).setDepth(301);
    const title = this.add.text(w / 2, h / 2 - 140, '메뉴 / メニュー', {
      fontSize: '18px', color: '#ff69b4', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);

    const menuItems = [
      { text: '단어장 / 単語帳', action: () => { closeMenu(); this.scene.pause(); this.scene.launch('VocabularyScene', { returnScene: this.scene.key }); } },
      { text: '미션 / ミッション', action: () => { closeMenu(); this.scene.pause(); const missions = dataLoader.getCachedMissions(gameState.currentChapter, gameState.currentLesson); this.scene.launch('MissionScene', { missions: missions, returnScene: this.scene.key }); } },
      { text: '상점 / ショップ', action: () => { closeMenu(); this.scene.pause(); this.scene.launch('ShopScene', { returnScene: this.scene.key }); } },
      { text: '챕터 선택 / チャプター', action: () => { closeMenu(); this.scene.start('ChapterSelectScene'); } },
      { text: '타이틀로 / タイトルへ', action: () => { closeMenu(); this.scene.start('TitleScene'); } }
    ];

    const elements = [overlay, panel, title];
    menuItems.forEach((item, i) => {
      const btn = this.add.text(w / 2, h / 2 - 70 + i * 50, item.text, {
        fontSize: '14px', color: '#ffffff', backgroundColor: '#ff69b422', padding: { x: 40, y: 10 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#ff69b444' }));
      btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#ff69b422' }));
      btn.on('pointerdown', item.action);
      elements.push(btn);
    });

    const closeBtn = this.add.text(w / 2, h / 2 + 130, '✕ 닫기', {
      fontSize: '14px', color: '#888888'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => closeMenu());
    elements.push(closeBtn);

    const closeMenu = () => elements.forEach(e => e.destroy());
    overlay.setInteractive().on('pointerdown', closeMenu);
  }

  // ── UI Update ───────────────────────────────────────
  updateUI() {
    if (this.expBar) this.expBar.width = 120 * gameState.expProgress;
    if (this.expText) this.expText.setText(`EXP ${gameState.current.exp}/${gameState.expToNextLevel}`);
    if (this.coinText) this.coinText.setText(`💰 ${gameState.current.coins}`);
  }

  // ── Scene Title Overlay ─────────────────────────────
  showSceneTitle(titleKo, titleJa, subtitle, accentColor = '#ff69b4') {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6).setScrollFactor(0).setDepth(500);
    const tko = this.add.text(w / 2, h / 2 - 30, titleKo, {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
    const tja = this.add.text(w / 2, h / 2 + 10, titleJa, {
      fontSize: '16px', color: accentColor
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
    const sub = this.add.text(w / 2, h / 2 + 35, subtitle, {
      fontSize: '12px', color: '#aaaacc'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501);

    this.tweens.add({
      targets: [bg, tko, tja, sub], alpha: 0, delay: 2000, duration: 800,
      onComplete: () => { [bg, tko, tja, sub].forEach(o => o.destroy()); }
    });
  }
}
