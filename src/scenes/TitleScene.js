import Phaser from 'phaser';
import { CHARACTERS } from '../constants.js';
import { gameState } from '../systems/GameState.js';

export default class TitleScene extends Phaser.Scene {
  constructor() { super({ key: 'TitleScene' }); }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Background gradient
    this.add.rectangle(w / 2, h / 2, w, h, 0x0a0a2e);

    // Animated particles (stars)
    for (let i = 0; i < 40; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.8)
      );
      this.tweens.add({
        targets: star, alpha: { from: star.alpha, to: 0.1 },
        duration: Phaser.Math.Between(1000, 3000), yoyo: true, repeat: -1
      });
    }

    // Seoul skyline silhouette
    const skyline = this.add.graphics();
    skyline.fillStyle(0x1a1a3e, 0.6);
    // N Seoul Tower
    skyline.fillRect(w * 0.45, h * 0.35, 8, 80);
    skyline.fillTriangle(w * 0.45 + 4, h * 0.3, w * 0.45 - 8, h * 0.38, w * 0.45 + 16, h * 0.38);
    // Buildings
    const bx = [0.1, 0.2, 0.28, 0.35, 0.55, 0.62, 0.7, 0.78, 0.88];
    const bh = [60, 90, 50, 75, 85, 45, 95, 55, 70];
    bx.forEach((x, i) => {
      skyline.fillRect(w * x, h * 0.65 - bh[i], 30 + i * 3, bh[i] + h * 0.35);
    });

    // Title
    const titleY = h * 0.18;
    this.add.text(w / 2, titleY, '안녕, 서울', {
      fontSize: '42px', fontFamily: '"Noto Sans KR", sans-serif',
      color: '#ff69b4', fontStyle: 'bold',
      shadow: { offsetX: 2, offsetY: 2, color: '#ff69b466', blur: 8, fill: true }
    }).setOrigin(0.5);

    this.add.text(w / 2, titleY + 48, 'アンニョン、ソウル', {
      fontSize: '20px', fontFamily: '"Noto Sans JP", sans-serif', color: '#da70d6'
    }).setOrigin(0.5);

    this.add.text(w / 2, titleY + 76, '두근두근 서울 | ドキドキ・ソウル', {
      fontSize: '13px', fontFamily: '"Noto Sans KR", sans-serif', color: '#8888bb'
    }).setOrigin(0.5);

    // Character selection
    const charY = h * 0.52;
    this.add.text(w / 2, charY - 45, '캐릭터를 선택하세요 / キャラクターを選んでください', {
      fontSize: '13px', color: '#aaaacc'
    }).setOrigin(0.5);

    const chars = ['yuko', 'ami', 'rui'];
    const charData = CHARACTERS;
    const spacing = 110;
    const startX = w / 2 - spacing;

    chars.forEach((name, i) => {
      const cx = startX + i * spacing;
      const cd = charData[name];
      const isSelected = gameState.currentCharacter === name;

      // Selection ring
      const ring = this.add.circle(cx, charY, 30, Phaser.Display.Color.HexStringToColor(cd.color).color, isSelected ? 0.4 : 0.1);
      const border = this.add.circle(cx, charY, 30).setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(cd.color).color, isSelected ? 1 : 0.3);

      // Character sprite
      const sprite = this.add.image(cx, charY, name).setScale(1.5);

      // Name
      this.add.text(cx, charY + 38, cd.name_ko, {
        fontSize: '14px', fontFamily: '"Noto Sans KR", sans-serif', color: cd.color, fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(cx, charY + 54, cd.name_ja, {
        fontSize: '11px', fontFamily: '"Noto Sans JP", sans-serif', color: '#8888aa'
      }).setOrigin(0.5);

      // Make interactive
      const hitArea = this.add.rectangle(cx, charY, 80, 100, 0xffffff, 0).setInteractive({ useHandCursor: true });
      hitArea.on('pointerover', () => { ring.setAlpha(0.3); border.setAlpha(0.8); sprite.setScale(1.7); });
      hitArea.on('pointerout', () => {
        ring.setAlpha(isSelected ? 0.4 : 0.1);
        border.setAlpha(isSelected ? 1 : 0.3);
        sprite.setScale(1.5);
      });
      hitArea.on('pointerdown', () => {
        gameState.currentCharacter = name;
        this.cameras.main.flash(200, 255, 105, 180, true);
        setTimeout(() => this.scene.restart(), 300);
      });
    });

    // Character info
    const infoY = charY + 78;
    const cc = charData[gameState.currentCharacter];
    const infoStyle = { fontSize: '11px', color: '#aaaacc', lineSpacing: 4 };
    this.add.text(w / 2, infoY, `${cc.from} 출신 / ${cc.from_ja}出身 | ${cc.job_ko} / ${cc.job_ja}`, infoStyle).setOrigin(0.5);

    // Stats
    const statsY = infoY + 25;
    const cs = gameState.current;
    this.add.text(w / 2, statsY, `Lv.${cs.level}  EXP: ${cs.exp}/${gameState.expToNextLevel}  💰 ${cs.coins}`, {
      fontSize: '12px', color: '#ffd700'
    }).setOrigin(0.5);

    // Buttons
    const btnY = h * 0.82;
    this.createButton(w / 2, btnY, '게임 시작 / ゲームスタート', '#ff69b4', () => {
      this.cameras.main.fadeOut(500);
      const lvl = gameState.current.level;
      let targetScene = 'FukuokaScene';
      if (lvl >= 7) targetScene = 'SeoulCh2Scene';
      else if (lvl >= 4) targetScene = 'IncheonScene';
      gameState.currentChapter = lvl >= 4 ? 'ch01' : 'ch00';
      gameState.currentLesson = 'l01';
      setTimeout(() => this.scene.start(targetScene), 500);
    });

    this.createButton(w / 2, btnY + 50, '챕터 선택 / チャプター選択', '#da70d6', () => {
      this.scene.start('ChapterSelectScene');
    });

    // Version info
    this.add.text(w / 2, h - 20, 'SeouLink | SL Corporation | v3.0 Prototype', {
      fontSize: '9px', color: '#444466'
    }).setOrigin(0.5);

    // Fade in
    this.cameras.main.fadeIn(800);
  }

  createButton(x, y, text, color, callback) {
    const btn = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 260, 38, Phaser.Display.Color.HexStringToColor(color).color, 0.15)
      .setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(color).color, 0.5);
    const label = this.add.text(0, 0, text, {
      fontSize: '14px', fontFamily: '"Noto Sans KR", sans-serif', color: color
    }).setOrigin(0.5);
    btn.add([bg, label]);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => { bg.setFillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.3); });
    bg.on('pointerout', () => { bg.setFillStyle(Phaser.Display.Color.HexStringToColor(color).color, 0.15); });
    bg.on('pointerdown', callback);
    return btn;
  }
}
