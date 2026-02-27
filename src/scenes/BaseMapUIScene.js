import Phaser from 'phaser';
import { gameState } from '../systems/GameState.js';
import { REF_WIDTH } from '../constants.js';

// ============================================================
// BaseMapUIScene — 광역맵 / 국제맵 UI 선택 화면 베이스
//  - 워커블이 아닌 UI 선택 화면
//  - 배경에 지도 윤곽을 Graphics로 렌더링
//  - 노드(역/공항)를 원형 버튼으로 배치
//  - 선택 시 확인 팝업 → 전환 애니메이션 → scene.start()
//  - 레벨 게이팅, 현재 위치 표시
// ============================================================

export default class BaseMapUIScene extends Phaser.Scene {
  constructor(key) {
    super({ key });
    this.nodes = [];       // { id, x, y, config, gfx, locked }
    this.lines = [];       // drawn route lines
    this.selectedNode = null;
    this._uiElements = [];
    this._isTransitioning = false;
  }

  // ── Helper: UI scale factor ──
  get uiScale() {
    const w = this.cameras.main.width;
    return Phaser.Math.Clamp(w / REF_WIDTH, 0.6, 2.0);
  }

  // ── Main initialization — subclass calls this from create() ──
  createMapUI(config) {
    /*
      config = {
        title_ko, title_ja, subtitle,
        bgColor: 0x0a0a2e,
        outlines: [ { points: [[x,y],...], color, alpha, closed } ],  // 지도 윤곽
        waterAreas: [ { points: [[x,y],...], color, alpha } ],        // 바다/강
        routeLines: [ { points: [[x,y],...], color, width, dash } ],  // 노선
        nodes: [
          { id, name_ko, name_ja, x, y, color,
            targetScene, unlockLevel, lineId,
            isCurrent, isTransfer }
        ],
        fromStation   // 진입 시 어느 역에서 왔는지
      }
    */
    this._isTransitioning = false;
    this.nodes = [];
    this._uiElements = [];

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const s = this.uiScale;

    // ── Background ──
    this.add.rectangle(w / 2, h / 2, w, h, config.bgColor || 0x0a0a2e).setDepth(0);

    // ── Map Outlines (land mass silhouettes) ──
    if (config.outlines) {
      config.outlines.forEach(outline => {
        this.drawMapPath(outline.points, outline.color || 0x334466,
          outline.alpha || 0.3, outline.closed !== false, 2, w, h);
      });
    }

    // ── Water Areas ──
    if (config.waterAreas) {
      config.waterAreas.forEach(area => {
        this.drawFilledArea(area.points, area.color || 0x1a2a4a,
          area.alpha || 0.4, w, h);
      });
    }

    // ── Route Lines ──
    if (config.routeLines) {
      config.routeLines.forEach(route => {
        this.drawRouteLine(route, w, h);
      });
    }

    // ── Station / Airport Nodes ──
    if (config.nodes) {
      config.nodes.forEach(nodeConfig => {
        this.createNode(nodeConfig, w, h, s);
      });
    }

    // ── Title bar ──
    this.createTitleBar(config, w, h, s);

    // ── Back button ──
    this.createBackButton(w, h, s);

    // ── Current location indicator ──
    const currentStation = config.fromStation || gameState.lastStation;
    if (currentStation) {
      const currentNode = this.nodes.find(n => n.id === currentStation);
      if (currentNode) {
        this.createCurrentIndicator(currentNode, s);
      }
    }

    // ── Resize handler ──
    this._resizeHandler = (gameSize) => {
      if (!this.scene.isActive()) return;
      // Rebuild entire UI on resize for simplicity
      this.scene.restart(this._lastConfig);
    };
    this.scale.on('resize', this._resizeHandler);
    this._lastConfig = config;

    this.events.on('shutdown', () => {
      this.scale.off('resize', this._resizeHandler);
    });

    // ── Entry animation ──
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  // ── Draw geographic outline path ──
  drawMapPath(points, color, alpha, closed, lineWidth, canvasW, canvasH) {
    if (!points || points.length < 2) return;
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(lineWidth || 2, color, alpha);
    g.beginPath();

    const scaled = points.map(p => [p[0] * canvasW, p[1] * canvasH]);
    g.moveTo(scaled[0][0], scaled[0][1]);
    for (let i = 1; i < scaled.length; i++) {
      g.lineTo(scaled[i][0], scaled[i][1]);
    }
    if (closed) g.closePath();
    g.strokePath();
    return g;
  }

  // ── Draw filled area (water/land) ──
  drawFilledArea(points, color, alpha, canvasW, canvasH) {
    if (!points || points.length < 3) return;
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(color, alpha);
    g.beginPath();

    const scaled = points.map(p => [p[0] * canvasW, p[1] * canvasH]);
    g.moveTo(scaled[0][0], scaled[0][1]);
    for (let i = 1; i < scaled.length; i++) {
      g.lineTo(scaled[i][0], scaled[i][1]);
    }
    g.closePath();
    g.fillPath();
    return g;
  }

  // ── Draw route line (subway line, flight path) ──
  drawRouteLine(route, canvasW, canvasH) {
    if (!route.points || route.points.length < 2) return;
    const g = this.add.graphics().setDepth(2);
    const w = route.width || 4;
    const color = typeof route.color === 'string'
      ? Phaser.Display.Color.HexStringToColor(route.color).color
      : (route.color || 0xffffff);

    g.lineStyle(w, color, route.alpha || 0.8);
    g.beginPath();

    const scaled = route.points.map(p => [p[0] * canvasW, p[1] * canvasH]);
    g.moveTo(scaled[0][0], scaled[0][1]);

    if (route.smooth && scaled.length >= 3) {
      // Draw smooth curve through points
      for (let i = 1; i < scaled.length - 1; i++) {
        const xc = (scaled[i][0] + scaled[i + 1][0]) / 2;
        const yc = (scaled[i][1] + scaled[i + 1][1]) / 2;
        g.lineTo(scaled[i][0], scaled[i][1]);
      }
      g.lineTo(scaled[scaled.length - 1][0], scaled[scaled.length - 1][1]);
    } else {
      for (let i = 1; i < scaled.length; i++) {
        g.lineTo(scaled[i][0], scaled[i][1]);
      }
    }
    g.strokePath();

    // Dashed overlay if specified
    if (route.dash) {
      g.lineStyle(w, color, 0.3);
      // Simple dashed effect overlay
    }

    this.lines.push(g);
    return g;
  }

  // ── Create a station/airport node ──
  createNode(nodeConfig, canvasW, canvasH, s) {
    const nx = nodeConfig.x * canvasW;
    const ny = nodeConfig.y * canvasH;
    const color = typeof nodeConfig.color === 'string'
      ? Phaser.Display.Color.HexStringToColor(nodeConfig.color).color
      : (nodeConfig.color || 0xffffff);

    const locked = gameState.current.level < (nodeConfig.unlockLevel || 0);
    const nodeRadius = Math.max(14, Math.round(12 * s));
    const hitRadius = Math.max(22, Math.round(22 * s)); // 44px minimum hit target

    // Outer glow
    const glow = this.add.circle(nx, ny, nodeRadius + 4, color, locked ? 0.05 : 0.15)
      .setDepth(3);

    // Node circle
    const circle = this.add.circle(nx, ny, nodeRadius, locked ? 0x333333 : color, locked ? 0.3 : 0.8)
      .setStrokeStyle(2, locked ? 0x555555 : color, locked ? 0.5 : 1)
      .setDepth(4);

    // Transfer station: double ring
    if (nodeConfig.isTransfer) {
      this.add.circle(nx, ny, nodeRadius - 4, 0x000000, 0)
        .setStrokeStyle(1.5, locked ? 0x555555 : 0xffffff, locked ? 0.3 : 0.6)
        .setDepth(4);
    }

    // Lock icon or station name
    const labelY = ny + nodeRadius + 8 * s;
    const labelFontSize = `${Math.max(9, Math.round(9 * s))}px`;

    if (locked) {
      this.add.text(nx, ny, '🔒', {
        fontSize: `${Math.round(10 * s)}px`
      }).setOrigin(0.5).setDepth(5);

      this.add.text(nx, labelY, `Lv.${nodeConfig.unlockLevel}`, {
        fontSize: labelFontSize, color: '#666666', align: 'center'
      }).setOrigin(0.5, 0).setDepth(5);
    } else {
      // Station name label
      this.add.text(nx, labelY, nodeConfig.name_ko || '', {
        fontSize: labelFontSize, color: '#ffffff',
        align: 'center', backgroundColor: '#00000066',
        padding: { x: 3, y: 1 }
      }).setOrigin(0.5, 0).setDepth(5);

      // Japanese name below
      if (nodeConfig.name_ja) {
        this.add.text(nx, labelY + 14 * s, nodeConfig.name_ja, {
          fontSize: `${Math.max(7, Math.round(7 * s))}px`,
          color: '#8888aa', align: 'center'
        }).setOrigin(0.5, 0).setDepth(5);
      }
    }

    // Pulse animation for unlocked nodes
    if (!locked) {
      this.tweens.add({
        targets: glow,
        scaleX: { from: 1.0, to: 1.3 }, scaleY: { from: 1.0, to: 1.3 },
        alpha: { from: 0.15, to: 0.05 },
        duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    }

    // Hit zone
    const hitZone = this.add.circle(nx, ny, hitRadius, 0xffffff, 0)
      .setDepth(10).setInteractive({ useHandCursor: !locked });

    hitZone.on('pointerdown', () => {
      if (this._isTransitioning) return;
      if (locked) {
        this.showLockedMessage(nodeConfig);
      } else {
        this.showConfirmPopup(nodeConfig, nx, ny, color);
      }
    });

    // Hover effect
    hitZone.on('pointerover', () => {
      if (!locked) circle.setFillStyle(color, 1.0);
    });
    hitZone.on('pointerout', () => {
      if (!locked) circle.setFillStyle(color, 0.8);
    });

    const nodeObj = { id: nodeConfig.id, x: nx, y: ny, config: nodeConfig, gfx: { circle, glow, hitZone }, locked };
    this.nodes.push(nodeObj);
    return nodeObj;
  }

  // ── Current location indicator (blinking pink dot) ──
  createCurrentIndicator(node, s) {
    const indicator = this.add.circle(node.x, node.y, 6, 0xff69b4, 1).setDepth(6);
    this.tweens.add({
      targets: indicator,
      scaleX: { from: 1.0, to: 1.5 }, scaleY: { from: 1.0, to: 1.5 },
      alpha: { from: 1, to: 0.3 },
      duration: 600, yoyo: true, repeat: -1
    });

    const label = this.add.text(node.x, node.y - 20 * s, '📍현재 위치', {
      fontSize: `${Math.max(8, Math.round(8 * s))}px`,
      color: '#ff69b4', backgroundColor: '#000000aa',
      padding: { x: 3, y: 1 }
    }).setOrigin(0.5, 1).setDepth(6);
  }

  // ── Title bar ──
  createTitleBar(config, w, h, s) {
    const fs = (px) => `${Math.round(px * s)}px`;
    const barH = Math.max(50, 50 * s);

    this.add.rectangle(w / 2, 0, w, barH, 0x000000, 0.7)
      .setOrigin(0.5, 0).setDepth(50);

    this.add.text(w / 2, 6 * s, config.title_ko || '', {
      fontSize: fs(14), color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setDepth(51);

    if (config.title_ja) {
      this.add.text(w / 2, 24 * s, config.title_ja, {
        fontSize: fs(10), color: '#ff69b4'
      }).setOrigin(0.5, 0).setDepth(51);
    }

    if (config.subtitle) {
      this.add.text(w / 2, 38 * s, config.subtitle, {
        fontSize: fs(8), color: '#8888aa'
      }).setOrigin(0.5, 0).setDepth(51);
    }

    // Level indicator (right side)
    this.add.text(w - 10, 8 * s, `Lv.${gameState.current.level}`, {
      fontSize: fs(11), color: '#ffd700'
    }).setOrigin(1, 0).setDepth(51);
  }

  // ── Back button ──
  createBackButton(w, h, s) {
    const fs = (px) => `${Math.round(px * s)}px`;
    const btn = this.add.text(10, 8 * s, '← 돌아가기', {
      fontSize: fs(11), color: '#aaaacc',
      backgroundColor: '#ffffff11', padding: { x: 8, y: 4 }
    }).setDepth(51).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      if (this._isTransitioning) return;
      this.goBack();
    });

    btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#ffffff22' }));
    btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#ffffff11' }));
  }

  // ── Subclass override: where to go back ──
  goBack() {
    // Default: go back to the station scene that brought us here
    const lastMap = gameState.currentMap;
    if (lastMap) {
      this._isTransitioning = true;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start(lastMap, { fromStation: gameState.lastStation });
      });
    }
  }

  // ── Confirm popup ──
  showConfirmPopup(nodeConfig, nx, ny, color) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const s = this.uiScale;
    const fs = (px) => `${Math.round(px * s)}px`;

    // Overlay
    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.5)
      .setDepth(100).setInteractive();

    // Popup box
    const boxW = Math.min(280 * s, w * 0.85);
    const boxH = Math.round(120 * s);
    const box = this.add.rectangle(w / 2, h / 2, boxW, boxH, 0x1a1a3e, 0.95)
      .setStrokeStyle(2, color, 0.8).setDepth(101);

    // Station name
    const nameTxt = this.add.text(w / 2, h / 2 - 30 * s,
      `${nodeConfig.name_ko || ''}${nodeConfig.name_ja ? '\n' + nodeConfig.name_ja : ''}`, {
      fontSize: fs(14), color: '#ffffff', fontStyle: 'bold', align: 'center'
    }).setOrigin(0.5).setDepth(102);

    // Confirm text
    const confirmTxt = this.add.text(w / 2, h / 2 + 2 * s,
      '이동하시겠습니까? / 移動しますか？', {
      fontSize: fs(10), color: '#aaaacc', align: 'center'
    }).setOrigin(0.5).setDepth(102);

    // Buttons
    const btnW = Math.round(80 * s);
    const btnH = Math.round(30 * s);
    const btnY = h / 2 + 35 * s;

    const okBtn = this.add.text(w / 2 - 50 * s, btnY, '이동 / GO', {
      fontSize: fs(12), color: '#ffffff', backgroundColor: '#00aa44',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setDepth(102).setInteractive({ useHandCursor: true });

    const cancelBtn = this.add.text(w / 2 + 50 * s, btnY, '취소', {
      fontSize: fs(12), color: '#888888', backgroundColor: '#333333',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5).setDepth(102).setInteractive({ useHandCursor: true });

    const elements = [overlay, box, nameTxt, confirmTxt, okBtn, cancelBtn];
    const destroyAll = () => elements.forEach(e => e.destroy());

    cancelBtn.on('pointerdown', destroyAll);
    overlay.on('pointerdown', destroyAll);

    okBtn.on('pointerdown', () => {
      destroyAll();
      this.navigateToNode(nodeConfig);
    });
  }

  // ── Navigate to selected node ──
  navigateToNode(nodeConfig) {
    if (this._isTransitioning || !nodeConfig.targetScene) return;
    this._isTransitioning = true;

    gameState.lastStation = nodeConfig.id;
    gameState.save();

    // Transition animation
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start(nodeConfig.targetScene, { fromStation: nodeConfig.id });
    });
  }

  // ── Locked node message ──
  showLockedMessage(nodeConfig) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const s = this.uiScale;

    const msg = this.add.text(w / 2, h * 0.8,
      `🔒 레벨 ${nodeConfig.unlockLevel} 이상 필요!\nLv.${nodeConfig.unlockLevel}以上が必要！`, {
      fontSize: `${Math.round(12 * s)}px`, color: '#ff4444',
      backgroundColor: '#000000cc', padding: { x: 16, y: 8 }, align: 'center'
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: msg, alpha: 0, delay: 1500, duration: 500,
      onComplete: () => msg.destroy()
    });
  }
}
