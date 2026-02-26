import Phaser from 'phaser';
import { gameState } from '../systems/GameState.js';
import { dataLoader } from '../systems/DataLoader.js';

export default class ShopScene extends Phaser.Scene {
  constructor() { super({ key: 'ShopScene' }); }

  init(data) {
    this.returnScene = data.returnScene || 'TitleScene';
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Background
    this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e);

    // Header
    this.add.rectangle(w / 2, 35, w, 70, 0x16213e);
    this.add.text(w / 2, 20, '🏪 상점 / ショップ', {
      fontSize: '18px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);
    // BUG FIX: GameState.coins → gameState.current.coins
    this.add.text(w / 2, 45, `💰 ${gameState.current.coins} coins`, {
      fontSize: '12px', color: '#ffd700'
    }).setOrigin(0.5);

    // Back button
    this.add.text(15, 25, '← 돌아가기', { fontSize: '13px', color: '#88aaff' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.returnScene) {
          this.scene.stop();
          this.scene.resume(this.returnScene);
        } else {
          this.scene.start('TitleScene');
        }
      });

    // Load shop data from DataLoader
    const shopData = dataLoader.getCachedShopProducts();
    const categories = shopData.categories || [
      { icon: '📚', name_ko: '교재', name_ja: 'テキスト' },
      { icon: '🎁', name_ko: '굿즈', name_ja: 'グッズ' },
      { icon: '✈️', name_ko: '여행', name_ja: '旅行' },
      { icon: '🎓', name_ko: '강의', name_ja: '講義' },
      { icon: '🎮', name_ko: '아이템', name_ja: 'アイテム' }
    ];
    this.shopItems = shopData.items || {};

    this.activeCategory = 0;
    const tabY = 85;
    const tabWidth = w / categories.length;

    this.categoryTabs = categories.map((cat, i) => {
      const bg = this.add.rectangle(tabWidth * i + tabWidth / 2, tabY, tabWidth - 2, 35,
        i === 0 ? 0x4a4a8a : 0x2a2a4a)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.selectCategory(i));
      const label = this.add.text(tabWidth * i + tabWidth / 2, tabY, `${cat.icon}`, {
        fontSize: '14px', color: '#ffffff'
      }).setOrigin(0.5);
      return { bg, label, data: cat };
    });

    // Content area
    this.contentContainer = this.add.container(0, 0);
    this.showCategoryContent(0);
  }

  selectCategory(index) {
    this.activeCategory = index;
    this.categoryTabs.forEach((tab, i) => {
      tab.bg.setFillStyle(i === index ? 0x4a4a8a : 0x2a2a4a);
    });
    this.showCategoryContent(index);
  }

  showCategoryContent(index) {
    this.contentContainer.removeAll(true);
    const w = this.cameras.main.width;
    const startY = 120;

    const items = this.shopItems[index] || [];
    items.forEach((item, i) => {
      const y = startY + i * 90 + 45;
      const cardBg = this.add.rectangle(w / 2, y, w - 30, 80, 0x2a2a4a, 0.9).setStrokeStyle(1, 0x444477);
      const title = this.add.text(25, y - 25, item.title, { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' });
      const titleJa = this.add.text(25, y - 5, item.title_ja || '', { fontSize: '11px', color: '#aaaacc' });
      const desc = this.add.text(25, y + 15, item.desc || '', { fontSize: '10px', color: '#888888' });
      const priceBtn = this.add.rectangle(w - 60, y, 80, 30, 0x4488aa).setStrokeStyle(1, 0x66aacc)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.add.text(w / 2, y, '✨ 준비 중! / 準備中！', { fontSize: '12px', color: '#ffdd44' })
            .setOrigin(0.5).setDepth(10);
        });
      const priceLabel = this.add.text(w - 60, y, item.price, { fontSize: '11px', color: '#ffffff' }).setOrigin(0.5);
      this.contentContainer.add([cardBg, title, titleJa, desc, priceBtn, priceLabel]);
    });

    if (items.length === 0) {
      const empty = this.add.text(w / 2, startY + 100, '준비 중입니다!\n準備中です！', {
        fontSize: '16px', color: '#666666', align: 'center'
      }).setOrigin(0.5);
      this.contentContainer.add(empty);
    }
  }
}
