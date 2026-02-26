import Phaser from 'phaser';
import { gameState } from '../systems/GameState.js';
import { dataLoader } from '../systems/DataLoader.js';

export default class VocabularyScene extends Phaser.Scene {
  constructor() { super({ key: 'VocabularyScene' }); }

  init(data) { this.returnScene = data.returnScene; this.wordIndex = 0; }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const vocabData = dataLoader.getCachedVocabulary(gameState.currentChapter);
    const words = vocabData.words || [];

    this.add.rectangle(w / 2, h / 2, w, h, 0x0a0a2e);

    this.add.text(w / 2, 15, '📖 단어장 / 単語帳', {
      fontSize: '18px', color: '#ff69b4', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(w - 15, 10, '✕', { fontSize: '20px', color: '#888888' })
      .setOrigin(1, 0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { this.scene.resume(this.returnScene); this.scene.stop(); });

    // Word card
    this.cardContainer = this.add.container(0, 0);
    this.words = words;
    this.showWord();

    // Navigation
    this.add.text(30, h - 40, '◀ 이전', { fontSize: '14px', color: '#aaaacc' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { this.wordIndex = Math.max(0, this.wordIndex - 1); this.showWord(); });

    this.add.text(w - 30, h - 40, '다음 ▶', { fontSize: '14px', color: '#aaaacc' })
      .setOrigin(1, 0).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { this.wordIndex = Math.min(words.length - 1, this.wordIndex + 1); this.showWord(); });

    this.progressText = this.add.text(w / 2, h - 35, '', { fontSize: '11px', color: '#666688' }).setOrigin(0.5);
  }

  showWord() {
    this.cardContainer.removeAll(true);
    if (!this.words.length) return;

    const word = this.words[this.wordIndex];
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.progressText?.setText(`${this.wordIndex + 1} / ${this.words.length}`);

    // Card background
    const card = this.add.rectangle(w / 2, h / 2 - 20, w - 30, h - 120, 0x1a1a3e, 0.9)
      .setStrokeStyle(1, 0xff69b4, 0.3);
    this.cardContainer.add(card);

    // Category & Level
    const badge = this.add.text(w / 2, 55, `${word.category} | ${word.level} | ${word.pos}`, {
      fontSize: '10px', color: '#888888', backgroundColor: '#ffffff11', padding: { x: 8, y: 2 }
    }).setOrigin(0.5);
    this.cardContainer.add(badge);

    // Korean word (large)
    const korean = this.add.text(w / 2, 100, word.korean, {
      fontSize: '36px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.cardContainer.add(korean);

    // Pronunciation
    const pron = this.add.text(w / 2, 140, word.pronunciation, {
      fontSize: '16px', color: '#88cc88'
    }).setOrigin(0.5);
    this.cardContainer.add(pron);

    // Japanese
    const japanese = this.add.text(w / 2, 175, word.japanese, {
      fontSize: '22px', color: '#ff69b4'
    }).setOrigin(0.5);
    this.cardContainer.add(japanese);

    // Divider
    const divider = this.add.rectangle(w / 2, 205, w - 80, 1, 0x333366);
    this.cardContainer.add(divider);

    // Nuance
    const nuance = this.add.text(w / 2, 225, word.nuance.replace('\\n', '\n'), {
      fontSize: '11px', color: '#aaaacc', wordWrap: { width: w - 60 }, align: 'center', lineSpacing: 3
    }).setOrigin(0.5, 0);
    this.cardContainer.add(nuance);

    // Example
    const exY = 285;
    const exLabel = this.add.text(25, exY, '💬 예문 / 例文:', { fontSize: '10px', color: '#ffd700' });
    const exKo = this.add.text(25, exY + 18, word.example_ko, { fontSize: '13px', color: '#ffffff', wordWrap: { width: w - 50 } });
    const exPron = this.add.text(25, exY + 38, word.example_pronunciation, { fontSize: '10px', color: '#88aa88', wordWrap: { width: w - 50 } });
    const exJa = this.add.text(25, exY + 55, word.example_ja, { fontSize: '11px', color: '#bbbbdd', wordWrap: { width: w - 50 } });
    this.cardContainer.add([exLabel, exKo, exPron, exJa]);
  }
}
