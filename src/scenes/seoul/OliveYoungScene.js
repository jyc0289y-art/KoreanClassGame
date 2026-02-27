import BasePlaceScene from '../BasePlaceScene.js';

// ============================================================
// OliveYoungScene — 올리브숲 명동 플래그십 (1000×800)
//
//  실제 배치 참조: OLIVE BLOOM 명동 플래그십 스토어
//  ─ 2층 구조 (게임에서는 한 맵에 상하 구분)
//  ─ 1F (하단): 스킨케어, 선크림, 클렌저, 마스크팩 + 계산대
//  ─ 2F (상단): 메이크업, 향수, K-뷰티 서비스 라운지
//  ─ 중앙: 계단/에스컬레이터
//  ─ 올리브숲 브랜드 컬러: #00A651 (녹색)
//  ─ 명동점 특징: 관광객 특화, 면세 가능, 다국어 직원
// ============================================================

export default class OliveYoungScene extends BasePlaceScene {
  constructor() { super('OliveYoungScene'); }

  create() {
    this.createPlace({
      worldWidth: 1000, worldHeight: 800,
      startX: 500, startY: 730,
      tiles: 'floor_tile',
      returnScene: 'SeoulMyeongdongScene',
      title_ko: '올리브숲', title_ja: 'OLIVE BLOOM',
      subtitle: '명동 플래그십 스토어',
      npcs: [
        // 1F 직원
        { x: 350, y: 650, texture: 'mission_npc', name_ko: '올리브숲 직원', name_ja: 'OB店員', hasMission: true,
          greeting_ko: '올리브숲에 오신 걸 환영합니다!\n오늘의 추천 상품을 소개해 드릴게요!\n마스크팩 1+1 행사 중이에요~',
          greeting_ja: 'OLIVE BLOOMへようこそ！\n今日のおすすめ商品をご紹介します！\nマスクパック1+1セール中です～' },
        // 2F 뷰티 컨설턴트
        { x: 700, y: 200, texture: 'shop', name_ko: '뷰티 컨설턴트', name_ja: 'ビューティーコンサルタント',
          greeting_ko: '피부 타입에 맞는 화장품 추천해 드릴게요!\n어떤 피부 고민이 있으세요?',
          greeting_ja: 'お肌のタイプに合った化粧品をおすすめしますよ！\nどんなお肌の悩みがありますか？' }
      ],
      buildings: []
    });

    this.addStoreDecor();
  }

  addStoreDecor() {
    const g = this.add.graphics().setDepth(1);

    // 매장 전체 배경
    g.fillStyle(0x00A651, 0.04);
    g.fillRect(50, 40, 900, 720);

    // 층 구분선
    g.lineStyle(3, 0x00A651, 0.3);
    g.lineBetween(80, 410, 920, 410);

    this.add.text(500, 420, '── 1F 스킨케어 / スキンケア ──', {
      fontSize: '8px', color: '#00A651', fontStyle: 'bold',
      backgroundColor: '#00000055', padding: { x: 8, y: 3 }
    }).setOrigin(0.5).setDepth(2);

    this.add.text(500, 55, '── 2F 메이크업 & 향수 / メイクアップ & 香水 ──', {
      fontSize: '8px', color: '#DA70D6', fontStyle: 'bold',
      backgroundColor: '#00000055', padding: { x: 8, y: 3 }
    }).setOrigin(0.5).setDepth(2);

    // 중앙 계단
    g.fillStyle(0xC0C0C0, 0.2);
    g.fillRoundedRect(440, 350, 120, 120, 6);
    g.lineStyle(2, 0xC0C0C0, 0.3);
    g.strokeRoundedRect(440, 350, 120, 120, 6);
    for (let i = 0; i < 6; i++) {
      g.fillStyle(0xAAAAAA, 0.15);
      g.fillRect(450, 360 + i * 18, 100, 8);
    }
    this.add.text(500, 340, '🔼🔽 계단 / 階段', {
      fontSize: '7px', color: '#888888'
    }).setOrigin(0.5).setDepth(2);

    // ── 1F 스킨케어 진열대 ──
    const skincareShelves = [
      { x: 100, label: '클렌저\nクレンザー', color: 0x87CEEB },
      { x: 240, label: '토너/로션\nトナー', color: 0x00CED1 },
      { x: 380, label: '세럼\nセラム', color: 0xFFB6C1 }
    ];
    skincareShelves.forEach(shelf => {
      g.fillStyle(0xFFFFFF, 0.2);
      g.fillRoundedRect(shelf.x, 450, 50, 200, 4);
      g.lineStyle(1, 0xDDDDDD, 0.3);
      g.strokeRoundedRect(shelf.x, 450, 50, 200, 4);
      for (let j = 0; j < 4; j++) {
        g.fillStyle(shelf.color, 0.4 + j * 0.1);
        g.fillRoundedRect(shelf.x + 5, 460 + j * 48, 40, 38, 2);
      }
      this.add.text(shelf.x + 25, 440, shelf.label, {
        fontSize: '5px', color: '#888888', align: 'center', lineSpacing: 1
      }).setOrigin(0.5).setDepth(2);
    });

    // 마스크팩 1+1 특설
    g.fillStyle(0xFF69B4, 0.08);
    g.fillRoundedRect(600, 500, 300, 120, 8);
    g.lineStyle(1, 0xFF69B4, 0.2);
    g.strokeRoundedRect(600, 500, 300, 120, 8);
    this.add.text(750, 490, '🎉 마스크팩 1+1 / マスクパック', {
      fontSize: '7px', color: '#FF69B4', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xFF69B4, 0.3 + i * 0.08);
      g.fillRoundedRect(620 + i * 52, 515, 42, 35, 3);
    }

    // 선크림
    g.fillStyle(0xFFD700, 0.1);
    g.fillRoundedRect(600, 555, 300, 55, 6);
    this.add.text(750, 570, '☀️ 선크림 / 日焼け止め', {
      fontSize: '6px', color: '#FFD700'
    }).setOrigin(0.5).setDepth(2);

    // 계산대 (4대)
    g.fillStyle(0x00A651, 0.3);
    g.fillRoundedRect(200, 680, 400, 50, 6);
    g.lineStyle(2, 0x00A651, 0.4);
    g.strokeRoundedRect(200, 680, 400, 50, 6);
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0xFFFFFF, 0.2);
      g.fillRoundedRect(220 + i * 95, 690, 75, 30, 3);
    }
    this.add.text(400, 675, '💳 계산대 / レジ (Tax-Free)', {
      fontSize: '8px', color: '#00A651', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // ── 2F 메이크업 진열대 ──
    const makeupShelves = [
      { x: 100, label: '립스틱\nリップ', color: 0xFF1493 },
      { x: 240, label: '파운데이션\nファンデ', color: 0xDEB887 },
      { x: 380, label: '아이섀도\nアイシャドウ', color: 0xBA55D3 }
    ];
    makeupShelves.forEach(shelf => {
      g.fillStyle(0xFFFFFF, 0.2);
      g.fillRoundedRect(shelf.x, 80, 50, 200, 4);
      g.lineStyle(1, 0xDDDDDD, 0.3);
      g.strokeRoundedRect(shelf.x, 80, 50, 200, 4);
      for (let j = 0; j < 4; j++) {
        g.fillStyle(shelf.color, 0.4 + j * 0.1);
        g.fillRoundedRect(shelf.x + 5, 90 + j * 48, 40, 38, 2);
      }
      this.add.text(shelf.x + 25, 72, shelf.label, {
        fontSize: '5px', color: '#888888', align: 'center', lineSpacing: 1
      }).setOrigin(0.5).setDepth(2);
    });

    // 향수 코너
    g.fillStyle(0xDA70D6, 0.08);
    g.fillRoundedRect(600, 80, 300, 130, 10);
    g.lineStyle(1, 0xDA70D6, 0.2);
    g.strokeRoundedRect(600, 80, 300, 130, 10);
    this.add.text(750, 72, '🌸 향수 / 香水', {
      fontSize: '8px', color: '#DA70D6', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    for (let i = 0; i < 6; i++) {
      g.fillStyle(0xDA70D6, 0.3 + i * 0.08);
      g.fillRoundedRect(620 + i * 44, 100, 30, 45, 4);
      g.fillStyle(0xFFD700, 0.5);
      g.fillRect(628 + i * 44, 96, 14, 6);
    }

    // K-뷰티 서비스 라운지
    g.fillStyle(0xFF69B4, 0.06);
    g.fillRoundedRect(600, 230, 300, 150, 10);
    g.lineStyle(1, 0xFF69B4, 0.15);
    g.strokeRoundedRect(600, 230, 300, 150, 10);
    for (let i = 0; i < 3; i++) {
      g.fillStyle(0xFFFFFF, 0.2);
      g.fillRoundedRect(630 + i * 85, 270, 50, 60, 6);
      g.fillStyle(0xFFFFFF, 0.4);
      g.fillCircle(655 + i * 85, 260, 12);
    }
    this.add.text(750, 225, '💄 뷰티 라운지 / ビューティーラウンジ', {
      fontSize: '7px', color: '#FF69B4',
      backgroundColor: '#00000044', padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(2);

    // OLIVE BLOOM 로고
    this.add.text(500, 755, 'OLIVE BLOOM ★ Flagship Store', {
      fontSize: '8px', color: '#00A651', fontStyle: 'bold',
      backgroundColor: '#00000066', padding: { x: 10, y: 3 }
    }).setOrigin(0.5).setDepth(2);
  }
}
