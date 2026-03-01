import BasePlaceScene from '../BasePlaceScene.js';

// ============================================================
// HiKOGroundScene — 하이코그라운드 (1000×900)
//
//  실제 배치 참조: HiKO Ground (종각역 부근, 5층)
//  ─ 1F (하단): 로비 + 대형 LED 월 (디지털 아트)
//  ─ 2F: K-POP 세트 6개 (아이돌 무대 재현)
//  ─ 3F: 한국 거리 풍경 재현 (포토존)
//  ─ 4F: 웰니스 동굴 (명상/한국 전통 체험)
//  ─ 5F (상단): 루프탑 카페 + 서울 전경
//
//  게임에서는 단일 맵에 5개 존을 상하 구분으로 표현
// ============================================================

export default class HiKOGroundScene extends BasePlaceScene {
  constructor() { super('HiKOGroundScene'); }

  create() {
    this.createPlace({
      worldWidth: 1000, worldHeight: 900,
      startX: 500, startY: 830,
      tiles: 'floor_tile',
      returnScene: 'SeoulUnifiedScene',
      title_ko: '하이코그라운드', title_ja: 'HiKO Ground',
      subtitle: 'K-Culture 체험 센터 (5F)',
      npcs: [
        { x: 300, y: 800, texture: 'mission_npc', name_ko: '하이코 직원', name_ja: 'HiKOスタッフ', hasMission: true,
          greeting_ko: '하이코그라운드에 오신 걸 환영해요!\nK-POP과 한류 문화를 체험해 보세요!\n5층까지 다양한 체험존이 있어요.',
          greeting_ja: 'HiKO Groundへようこそ！\nK-POPと韓流文化を体験してください！\n5階まで様々な体験ゾーンがあります。' },
        { x: 700, y: 430, texture: 'shop', name_ko: '포토존 안내', name_ja: 'フォトゾーン案内',
          greeting_ko: '여기서 사진 찍으면 예쁘게 나와요!\n한복 체험도 가능합니다~\nSNS에 올리면 인기 만점!',
          greeting_ja: 'ここで写真を撮ると綺麗に撮れますよ！\n韓服体験もできます～\nSNSに上げたら人気間違いなし！' },
        { x: 800, y: 100, texture: 'shop', name_ko: '카페 직원', name_ja: 'カフェスタッフ',
          greeting_ko: '루프탑 카페에 오신 걸 환영해요!\n서울 전경을 보면서 커피 한잔 하세요~',
          greeting_ja: 'ルーフトップカフェへようこそ！\nソウルの景色を見ながらコーヒーをどうぞ～' }
      ],
      buildings: []
    });

    this.addHiKODecor();
  }

  addHiKODecor() {
    const g = this.add.graphics().setDepth(1);

    // 층 구분선 + 라벨
    const floors = [
      { y: 740, label: '1F 로비 + LED Wall', color: '#4169E1' },
      { y: 580, label: '2F K-POP Stage', color: '#9370DB' },
      { y: 400, label: '3F 한국 거리 포토존', color: '#FF69B4' },
      { y: 240, label: '4F 웰니스 동굴', color: '#2E8B57' },
      { y: 60, label: '5F 루프탑 카페 ☕', color: '#FFD700' }
    ];
    floors.forEach((floor, i) => {
      if (i > 0) {
        g.lineStyle(2, 0x888888, 0.2);
        g.lineBetween(60, floor.y + 80, 940, floor.y + 80);
      }
      this.add.text(500, floor.y + 85, `── ${floor.label} ──`, {
        fontSize: '7px', color: floor.color, fontStyle: 'bold',
        backgroundColor: '#00000055', padding: { x: 6, y: 2 }
      }).setOrigin(0.5).setDepth(2);
    });

    // 1F: LED Wall
    g.fillStyle(0x4169E1, 0.15);
    g.fillRoundedRect(100, 760, 800, 60, 8);
    g.lineStyle(2, 0x4169E1, 0.4);
    g.strokeRoundedRect(100, 760, 800, 60, 8);
    for (let i = 0; i < 20; i++) {
      g.fillStyle(Phaser.Display.Color.HSVToRGB(i * 0.05, 0.7, 0.9).color, 0.2);
      g.fillRect(120 + i * 38, 768, 30, 44);
    }
    this.add.text(500, 755, '📺 Digital Media Wall', {
      fontSize: '8px', color: '#4169E1', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    g.fillStyle(0xFFFFFF, 0.2);
    g.fillRoundedRect(150, 830, 150, 30, 4);
    this.add.text(225, 828, '📋 안내 / Info', {
      fontSize: '6px', color: '#888888'
    }).setOrigin(0.5).setDepth(2);

    // 2F: K-POP 세트 6개
    const kpopSets = [
      { x: 150, y: 640, label: '아이돌\n무대', color: 0x9370DB },
      { x: 350, y: 640, label: '뮤직\n비디오', color: 0xFF69B4 },
      { x: 550, y: 640, label: '댄스\n스튜디오', color: 0x00CED1 },
      { x: 150, y: 720, label: '녹음\n부스', color: 0xFFD700 },
      { x: 350, y: 720, label: '드레스룸\n스타일링', color: 0xDA70D6 },
      { x: 550, y: 720, label: '인터뷰\n세트', color: 0x4682B4 }
    ];
    kpopSets.forEach(set => {
      g.fillStyle(set.color, 0.12);
      g.fillRoundedRect(set.x - 65, set.y - 30, 130, 60, 8);
      g.lineStyle(1, set.color, 0.3);
      g.strokeRoundedRect(set.x - 65, set.y - 30, 130, 60, 8);
      this.add.text(set.x, set.y, set.label, {
        fontSize: '6px', color: Phaser.Display.Color.IntegerToColor(set.color).rgba,
        align: 'center', lineSpacing: 2
      }).setOrigin(0.5).setDepth(2);
    });

    g.fillStyle(0x9370DB, 0.2);
    g.fillRoundedRect(700, 610, 200, 120, 12);
    g.lineStyle(2, 0x9370DB, 0.4);
    g.strokeRoundedRect(700, 610, 200, 120, 12);
    this.add.text(800, 600, '🎤 K-POP Stage', {
      fontSize: '9px', color: '#9370DB', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(800, 670, '🎤', { fontSize: '16px' }).setOrigin(0.5).setDepth(2);

    // 3F: 포토존
    g.fillStyle(0xFF69B4, 0.1);
    g.fillRoundedRect(100, 420, 250, 120, 10);
    g.lineStyle(1, 0xFF69B4, 0.2);
    g.strokeRoundedRect(100, 420, 250, 120, 10);
    g.fillStyle(0x8B4513, 0.3);
    g.fillTriangle(225, 430, 120, 470, 330, 470);
    this.add.text(225, 415, '🏠 한옥 마을 / 韓屋村', {
      fontSize: '7px', color: '#FF69B4'
    }).setOrigin(0.5).setDepth(2);

    g.fillStyle(0xDA70D6, 0.1);
    g.fillRoundedRect(400, 420, 200, 120, 10);
    this.add.text(500, 415, '👘 한복 체험 / 韓服体験', {
      fontSize: '7px', color: '#DA70D6'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(450, 470, '👗', { fontSize: '14px' }).setOrigin(0.5).setDepth(2);
    this.add.text(550, 470, '👘', { fontSize: '14px' }).setOrigin(0.5).setDepth(2);

    g.fillStyle(0xFF69B4, 0.08);
    g.fillRoundedRect(650, 420, 250, 120, 10);
    this.add.text(775, 415, '📸 서울 거리 / ソウルの街', {
      fontSize: '7px', color: '#FF69B4'
    }).setOrigin(0.5).setDepth(2);
    g.fillStyle(0x888888, 0.3);
    g.fillRect(700, 440, 5, 60);
    g.fillStyle(0xFFD700, 0.4);
    g.fillCircle(702, 438, 6);
    g.fillStyle(0x8B4513, 0.3);
    g.fillRoundedRect(730, 490, 60, 15, 3);

    // 4F: 웰니스 동굴
    g.fillStyle(0x2E8B57, 0.08);
    g.fillRoundedRect(100, 260, 800, 120, 15);
    g.fillStyle(0x1a1a2e, 0.15);
    g.fillRoundedRect(200, 270, 600, 100, 40);
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0x2E8B57, 0.2);
      g.fillCircle(280 + i * 110, 330, 20);
    }
    this.add.text(500, 255, '🧘 웰니스 동굴 / ウェルネスケーブ', {
      fontSize: '7px', color: '#2E8B57', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(200, 295, '🔔', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);
    this.add.text(800, 295, '🎐', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);

    // 5F: 루프탑 카페
    g.fillStyle(0xFFD700, 0.06);
    g.fillRoundedRect(100, 80, 800, 150, 10);
    [{ x: 200, y: 140 }, { x: 400, y: 140 }, { x: 600, y: 140 },
     { x: 300, y: 200 }, { x: 500, y: 200 }].forEach(t => {
      g.fillStyle(0x8B4513, 0.3);
      g.fillCircle(t.x, t.y, 18);
      g.fillStyle(0x654321, 0.2);
      g.fillCircle(t.x - 22, t.y, 8);
      g.fillCircle(t.x + 22, t.y, 8);
    });
    g.fillStyle(0x8B4513, 0.4);
    g.fillRoundedRect(700, 100, 160, 40, 6);
    this.add.text(780, 95, '☕ 카페 / カフェ', {
      fontSize: '7px', color: '#FFD700', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    g.fillStyle(0x87CEEB, 0.08);
    g.fillRect(100, 68, 800, 10);
    this.add.text(500, 70, '🏙️ Seoul Skyline View', {
      fontSize: '6px', color: '#87CEEB'
    }).setOrigin(0.5).setDepth(2);

    // 층간 계단
    g.fillStyle(0xC0C0C0, 0.1);
    g.fillRoundedRect(920, 100, 30, 750, 4);
    for (let i = 0; i < 30; i++) {
      g.fillStyle(0xAAAAAA, 0.1);
      g.fillRect(922, 110 + i * 25, 26, 10);
    }
    this.add.text(935, 450, '🔼\n🔽', {
      fontSize: '8px', align: 'center'
    }).setOrigin(0.5).setDepth(2);
  }
}
