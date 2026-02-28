import Phaser from 'phaser';
import { CHARACTERS, HOBIS } from '../constants.js';
import { gameState } from '../systems/GameState.js';

export default class TitleScene extends Phaser.Scene {
  constructor() { super({ key: 'TitleScene' }); }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // ── HOBIS dark background ──
    this.add.rectangle(w / 2, h / 2, w, h, HOBIS.BG_HEX);

    // Scanline grid pattern
    const grid = this.add.graphics();
    grid.lineStyle(1, HOBIS.BORDER_HEX, 0.08);
    for (let y = 0; y < h; y += 30) grid.lineBetween(0, y, w, y);
    for (let x = 0; x < w; x += 30) grid.lineBetween(x, 0, x, h);

    // ── Animated particles (cyan/green alternating) ──
    for (let i = 0; i < 40; i++) {
      const isCyan = i % 2 === 0;
      const star = this.add.circle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        Phaser.Math.Between(1, 2),
        isCyan ? HOBIS.CYAN_HEX : HOBIS.GREEN_HEX,
        Phaser.Math.FloatBetween(0.15, 0.5)
      );
      this.tweens.add({
        targets: star, alpha: { from: star.alpha, to: 0.05 },
        duration: Phaser.Math.Between(1000, 3000), yoyo: true, repeat: -1
      });
    }

    // ── Seoul skyline silhouette (HOBIS panel color) ──
    const skyline = this.add.graphics();
    skyline.fillStyle(HOBIS.PANEL_HEX, 0.5);
    // N Seoul Tower
    skyline.fillRect(w * 0.45, h * 0.35, 8, 80);
    skyline.fillTriangle(w * 0.45 + 4, h * 0.3, w * 0.45 - 8, h * 0.38, w * 0.45 + 16, h * 0.38);
    // Buildings
    const bx = [0.1, 0.2, 0.28, 0.35, 0.55, 0.62, 0.7, 0.78, 0.88];
    const bh = [60, 90, 50, 75, 85, 45, 95, 55, 70];
    bx.forEach((x, i) => {
      skyline.fillRect(w * x, h * 0.65 - bh[i], 30 + i * 3, bh[i] + h * 0.35);
    });
    // Neon edge highlights on skyline
    const skylineEdge = this.add.graphics();
    skylineEdge.lineStyle(1, HOBIS.CYAN_HEX, 0.1);
    bx.forEach((x, i) => {
      const bw = 30 + i * 3;
      const by = h * 0.65 - bh[i];
      skylineEdge.lineBetween(w * x, by, w * x + bw, by);
    });

    // ── Title ──
    const titleY = h * 0.18;
    this.add.text(w / 2, titleY, '안녕, 서울', {
      fontSize: '42px', fontFamily: HOBIS.FONT_KR,
      color: HOBIS.CYAN, fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 0, color: '#00f7ff44', blur: 12, fill: true }
    }).setOrigin(0.5);

    this.add.text(w / 2, titleY + 48, 'ANNYEONG, SEOUL', {
      fontSize: '16px', fontFamily: HOBIS.FONT_HEADER, color: HOBIS.GREEN,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff3344', blur: 8, fill: true }
    }).setOrigin(0.5);

    // Tagline with dashed separator
    const tagY = titleY + 76;
    const tagLine = this.add.graphics();
    tagLine.lineStyle(1, HOBIS.BORDER_HEX, 0.4);
    tagLine.lineBetween(w * 0.2, tagY - 6, w * 0.8, tagY - 6);
    this.add.text(w / 2, tagY + 2, '두근두근 서울 | ドキドキ・ソウル', {
      fontSize: '12px', fontFamily: HOBIS.FONT_MONO, color: HOBIS.MUTED
    }).setOrigin(0.5);

    // ── Character selection ──
    const charY = h * 0.50;
    this.add.text(w / 2, charY - 50, '── OPERATOR SELECT ──', {
      fontSize: '11px', fontFamily: HOBIS.FONT_HEADER, color: HOBIS.CYAN,
      shadow: { offsetX: 0, offsetY: 0, color: '#00f7ff22', blur: 6, fill: true }
    }).setOrigin(0.5);
    this.add.text(w / 2, charY - 35, 'オペレーター選択', {
      fontSize: '10px', fontFamily: HOBIS.FONT_JP, color: HOBIS.MUTED
    }).setOrigin(0.5);

    const chars = ['yuko', 'ami', 'rui', 'tester'];
    const charData = CHARACTERS;
    const spacing = 85;
    const startX = w / 2 - spacing * 1.5;

    chars.forEach((name, i) => {
      const cx = startX + i * spacing;
      const cd = charData[name];
      const isSelected = gameState.currentCharacter === name;
      const charColor = Phaser.Display.Color.HexStringToColor(cd.color).color;

      // Selection ring — cyan glow when selected, muted when not
      const ring = this.add.circle(cx, charY, 30,
        isSelected ? HOBIS.CYAN_HEX : HOBIS.PANEL_HEX,
        isSelected ? 0.25 : 0.15
      );
      const border = this.add.circle(cx, charY, 30).setStrokeStyle(
        isSelected ? 2 : 1,
        isSelected ? HOBIS.CYAN_HEX : HOBIS.BORDER_HEX,
        isSelected ? 0.8 : 0.3
      );

      // Character sprite
      const sprite = this.add.image(cx, charY, name).setScale(1.5);

      // Character name — neon colored
      this.add.text(cx, charY + 38, cd.name_ko, {
        fontSize: '14px', fontFamily: HOBIS.FONT_KR, color: cd.color, fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(cx, charY + 54, cd.name_ja, {
        fontSize: '10px', fontFamily: HOBIS.FONT_JP, color: HOBIS.MUTED
      }).setOrigin(0.5);

      // Interactive hit area
      const hitArea = this.add.rectangle(cx, charY, 80, 100, 0xffffff, 0).setInteractive({ useHandCursor: true });
      hitArea.on('pointerover', () => {
        ring.setAlpha(0.3);
        ring.setFillStyle(HOBIS.CYAN_HEX, 0.3);
        border.setStrokeStyle(2, HOBIS.CYAN_HEX, 0.8);
        sprite.setScale(1.7);
      });
      hitArea.on('pointerout', () => {
        ring.setAlpha(isSelected ? 0.25 : 0.15);
        ring.setFillStyle(isSelected ? HOBIS.CYAN_HEX : HOBIS.PANEL_HEX, isSelected ? 0.25 : 0.15);
        border.setStrokeStyle(isSelected ? 2 : 1, isSelected ? HOBIS.CYAN_HEX : HOBIS.BORDER_HEX, isSelected ? 0.8 : 0.3);
        sprite.setScale(1.5);
      });
      hitArea.on('pointerdown', () => {
        gameState.currentCharacter = name;
        this.cameras.main.flash(200, 0, 247, 255, true);
        setTimeout(() => this.scene.restart(), 300);
      });
    });

    // ── Character info ──
    const infoY = charY + 76;
    const cc = charData[gameState.currentCharacter];
    this.add.text(w / 2, infoY - 5, '── OPERATOR INTEL ──', {
      fontSize: '9px', fontFamily: HOBIS.FONT_HEADER, color: HOBIS.CYAN
    }).setOrigin(0.5);
    this.add.text(w / 2, infoY + 12, `${cc.from} 출신 / ${cc.from_ja}出身 | ${cc.job_ko} / ${cc.job_ja}`, {
      fontSize: '10px', fontFamily: HOBIS.FONT_MONO, color: HOBIS.MUTED, lineSpacing: 4
    }).setOrigin(0.5);

    // ── Stats (green) ──
    const statsY = infoY + 32;
    const cs = gameState.current;
    this.add.text(w / 2, statsY, `Lv.${cs.level}  EXP: ${cs.exp}/${gameState.expToNextLevel}  ⬡ ${cs.coins}`, {
      fontSize: '12px', fontFamily: HOBIS.FONT_MONO, color: HOBIS.GREEN,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff3322', blur: 4, fill: true }
    }).setOrigin(0.5);

    // ── Buttons ──
    const btnY = h * 0.82;
    this.createButton(w / 2, btnY, '▶ DEPLOY / ゲームスタート', HOBIS.GREEN, () => {
      this.cameras.main.fadeOut(500);
      const lvl = gameState.current.level;

      let targetScene = gameState.currentMap || 'FukuokaYakuinScene';
      if (!gameState.visitedMaps || gameState.visitedMaps.length <= 1) {
        if (lvl >= 4) {
          targetScene = 'IncheonAirportScene';
          gameState.currentChapter = 'ch01';
        } else {
          targetScene = 'FukuokaYakuinScene';
          gameState.currentChapter = 'ch00';
        }
      }

      gameState.currentLesson = 'l01';
      gameState.save();
      setTimeout(() => this.scene.start(targetScene), 500);
    });

    this.createButton(w / 2, btnY + 50, '◆ CHAPTER SELECT / チャプター選択', HOBIS.CYAN, () => {
      this.scene.start('ChapterSelectScene');
    });

    // ── Version info ──
    this.add.text(w / 2, h - 20, 'SeouLink | SL Corporation | v3.0 Prototype', {
      fontSize: '9px', fontFamily: HOBIS.FONT_MONO, color: HOBIS.BORDER
    }).setOrigin(0.5);

    // ── Corner brackets (HOBIS signature) ──
    this.drawCornerBrackets(10, 10, w - 20, h - 20, HOBIS.CYAN_HEX, 0.15);

    // Fade in
    this.cameras.main.fadeIn(800);
  }

  createButton(x, y, text, color, callback) {
    const colorHex = Phaser.Display.Color.HexStringToColor(color).color;
    const btn = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 270, 38, colorHex, 0.08)
      .setStrokeStyle(1, colorHex, 0.5);
    const label = this.add.text(0, 0, text, {
      fontSize: '13px', fontFamily: HOBIS.FONT_MONO, color: color
    }).setOrigin(0.5);
    btn.add([bg, label]);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(colorHex, 0.2);
      bg.setStrokeStyle(1, colorHex, 0.9);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(colorHex, 0.08);
      bg.setStrokeStyle(1, colorHex, 0.5);
    });
    bg.on('pointerdown', callback);
    return btn;
  }

  drawCornerBrackets(x, y, w, h, color, alpha) {
    const g = this.add.graphics();
    const len = 12;
    g.lineStyle(1, color, alpha);
    // Top-left
    g.lineBetween(x, y, x + len, y);
    g.lineBetween(x, y, x, y + len);
    // Top-right
    g.lineBetween(x + w, y, x + w - len, y);
    g.lineBetween(x + w, y, x + w, y + len);
    // Bottom-left
    g.lineBetween(x, y + h, x + len, y + h);
    g.lineBetween(x, y + h, x, y + h - len);
    // Bottom-right
    g.lineBetween(x + w, y + h, x + w - len, y + h);
    g.lineBetween(x + w, y + h, x + w, y + h - len);
  }
}
