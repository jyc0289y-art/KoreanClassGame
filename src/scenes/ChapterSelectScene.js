import Phaser from 'phaser';
import { gameState } from '../systems/GameState.js';
import { dataLoader } from '../systems/DataLoader.js';

export default class ChapterSelectScene extends Phaser.Scene {
  constructor() { super({ key: 'ChapterSelectScene' }); }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.rectangle(w / 2, h / 2, w, h, 0x0a0a2e);
    this.add.text(w / 2, 30, '챕터 선택 / チャプター選択', {
      fontSize: '22px', color: '#ff69b4', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Back button
    this.add.text(20, 20, '← 돌아가기', { fontSize: '14px', color: '#aaaacc' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('TitleScene'));

    const chapters = dataLoader.cache.chapters || [];
    chapters.forEach((ch, i) => {
      const cy = 80 + i * 85;
      const isUnlocked = gameState.current.level >= ch.unlock_level || gameState.current.unlockedChapters.includes(ch.id);
      const alpha = isUnlocked ? 1 : 0.4;

      const card = this.add.rectangle(w / 2, cy + 20, w - 40, 70, isUnlocked ? 0x1a1a3e : 0x111128, 0.8)
        .setStrokeStyle(1, isUnlocked ? 0xff69b4 : 0x333355, 0.5)
        .setAlpha(alpha);

      this.add.text(30, cy, `${ch.id.toUpperCase()} | ${ch.cefr}`, {
        fontSize: '10px', color: isUnlocked ? '#ff69b4' : '#555577'
      });
      this.add.text(30, cy + 16, ch.name, {
        fontSize: '16px', color: isUnlocked ? '#ffffff' : '#666688', fontStyle: 'bold'
      });
      this.add.text(30, cy + 36, `${ch.name_ja} | ${ch.objective_ja}`, {
        fontSize: '11px', color: isUnlocked ? '#aaaacc' : '#444466'
      });
      this.add.text(w - 30, cy + 16, `${ch.lessons}과 | Lv.${ch.unlock_level}+`, {
        fontSize: '11px', color: isUnlocked ? '#ffd700' : '#444466'
      }).setOrigin(1, 0);

      if (isUnlocked) {
        this.add.text(w - 30, cy + 36, '▶', { fontSize: '16px', color: '#ff69b4' }).setOrigin(1, 0);
        card.setInteractive({ useHandCursor: true });
        card.on('pointerdown', () => {
          gameState.currentChapter = ch.id;
          gameState.currentLesson = 'l01';
          this.cameras.main.fadeOut(300);
          setTimeout(() => this.scene.start(ch.scene || 'FukuokaScene'), 300);
        });
      }
    });
  }
}
