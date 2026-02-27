import BasePlaceScene from '../BasePlaceScene.js';

// ============================================================
// HotelScene — 게스트하우스/숙소 (800×700)
//
//  실제 서울 게스트하우스 레이아웃 참조:
//  ─ 좁은 입구 (1F): 프론트 데스크
//  ─ 1F: 공용 라운지 + 공용 주방
//  ─ 2F (상단): 객실 (트윈/도미토리/싱글)
//  ─ 좁고 긴 건물 구조 (서울 명동/종로 특징)
//  ─ 프론트에서 체크인, 여권 제시
//  ─ 한국어 회화 교재에서: 숙소 체크인/아웃 대화 학습
// ============================================================

export default class HotelScene extends BasePlaceScene {
  constructor() { super('HotelScene'); }

  create() {
    this.createPlace({
      worldWidth: 800, worldHeight: 700,
      startX: 400, startY: 640,
      tiles: 'floor_tile',
      returnScene: 'SeoulMyeongdongScene',
      title_ko: '게스트하우스', title_ja: 'ゲストハウス',
      subtitle: '명동 숙소',
      npcs: [
        { x: 400, y: 550, texture: 'shop', name_ko: '프론트 직원', name_ja: 'フロント',
          greeting_ko: '안녕하세요! 체크인 하시겠어요?\n여권을 보여 주세요.\n방은 2층 201호입니다!',
          greeting_ja: 'こんにちは！チェックインされますか？\nパスポートを見せてください。\nお部屋は2階201号室です！' },
        { x: 250, y: 370, texture: 'mission_npc', name_ko: '투숙객 (마이크)', name_ja: '宿泊客 (マイク)', hasMission: true,
          greeting_ko: '안녕! 나는 미국에서 왔어.\n너도 한국어 공부하러 왔어?\n같이 명동에서 밥 먹으러 갈래?',
          greeting_ja: 'Hi! アメリカから来たよ。\n君も韓国語を勉強しに来たの？\n一緒にミョンドンでご飯食べに行かない？' }
      ],
      buildings: []
    });

    this.addHotelDecor();
  }

  addHotelDecor() {
    const g = this.add.graphics().setDepth(1);

    // 층 구분
    g.lineStyle(2, 0xDEB887, 0.2);
    g.lineBetween(80, 320, 720, 320);
    this.add.text(400, 330, '── 1F 프론트 & 라운지 ──', {
      fontSize: '7px', color: '#DEB887',
      backgroundColor: '#00000055', padding: { x: 6, y: 2 }
    }).setOrigin(0.5).setDepth(2);
    this.add.text(400, 60, '── 2F 객실 ──', {
      fontSize: '7px', color: '#87CEEB',
      backgroundColor: '#00000055', padding: { x: 6, y: 2 }
    }).setOrigin(0.5).setDepth(2);

    // 프론트 데스크
    g.fillStyle(0x8B4513, 0.4);
    g.fillRoundedRect(280, 520, 240, 50, 6);
    g.lineStyle(2, 0xDEB887, 0.5);
    g.strokeRoundedRect(280, 520, 240, 50, 6);
    this.add.text(400, 510, '🏨 프론트 / Front Desk', {
      fontSize: '8px', color: '#DEB887', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(310, 535, '🔔', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);
    g.fillStyle(0x654321, 0.5);
    g.fillRect(460, 525, 40, 35);
    this.add.text(480, 535, '🔑🔑', { fontSize: '7px' }).setOrigin(0.5).setDepth(2);
    this.add.text(480, 550, '🔑🔑', { fontSize: '7px' }).setOrigin(0.5).setDepth(2);

    // 간판
    g.fillStyle(0xFF69B4, 0.15);
    g.fillRoundedRect(200, 600, 400, 35, 6);
    this.add.text(400, 612, '🏠 Seoul Stay Guesthouse', {
      fontSize: '9px', color: '#FF69B4', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // 공용 라운지
    g.fillStyle(0xDEB887, 0.08);
    g.fillRoundedRect(80, 400, 250, 150, 8);
    g.fillStyle(0x4169E1, 0.2);
    g.fillRoundedRect(100, 420, 100, 40, 8);
    g.fillRoundedRect(100, 480, 100, 40, 8);
    g.fillStyle(0x8B6914, 0.4);
    g.fillRoundedRect(220, 440, 80, 50, 6);
    g.fillStyle(0x333333, 0.5);
    g.fillRoundedRect(100, 380, 60, 30, 3);
    g.fillStyle(0x111111, 0.7);
    g.fillRect(105, 383, 50, 22);
    this.add.text(130, 375, '📺', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);
    this.add.text(260, 460, '📖🗺️', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);
    this.add.text(205, 395, '☕ 라운지 / ラウンジ', {
      fontSize: '6px', color: '#DEB887'
    }).setOrigin(0.5).setDepth(2);

    // 공용 주방
    g.fillStyle(0xC0C0C0, 0.08);
    g.fillRoundedRect(570, 400, 160, 150, 8);
    g.lineStyle(1, 0xC0C0C0, 0.2);
    g.strokeRoundedRect(570, 400, 160, 150, 8);
    g.fillStyle(0xC0C0C0, 0.4);
    g.fillRoundedRect(580, 420, 60, 30, 3);
    this.add.text(610, 430, '🚰', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);
    g.fillStyle(0x888888, 0.4);
    g.fillRoundedRect(660, 420, 50, 30, 3);
    this.add.text(685, 430, '📦', { fontSize: '7px' }).setOrigin(0.5).setDepth(2);
    g.fillStyle(0xE8E8E8, 0.5);
    g.fillRoundedRect(580, 470, 40, 60, 3);
    this.add.text(600, 495, '🧊', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);
    g.fillStyle(0x8B6914, 0.3);
    g.fillRoundedRect(640, 480, 70, 40, 4);
    g.fillStyle(0x4169E1, 0.2);
    g.fillCircle(655, 530, 8);
    g.fillCircle(695, 530, 8);
    this.add.text(650, 395, '🍳 공용주방 / 共用キッチン', {
      fontSize: '6px', color: '#888888'
    }).setOrigin(0.5).setDepth(2);

    // 계단
    g.fillStyle(0xC0C0C0, 0.15);
    g.fillRoundedRect(360, 340, 80, 60, 4);
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0xAAAAAA, 0.15);
      g.fillRect(365, 345 + i * 10, 70, 5);
    }
    this.add.text(400, 335, '🔼 계단', {
      fontSize: '6px', color: '#888888'
    }).setOrigin(0.5).setDepth(2);

    // 2F 복도
    g.fillStyle(0xBBBBBB, 0.06);
    g.fillRect(80, 180, 640, 40);

    // 201호 (트윈)
    g.fillStyle(0x87CEEB, 0.08);
    g.fillRoundedRect(80, 80, 200, 90, 8);
    g.lineStyle(1, 0x87CEEB, 0.3);
    g.strokeRoundedRect(80, 80, 200, 90, 8);
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRoundedRect(95, 95, 70, 50, 4);
    g.fillRoundedRect(195, 95, 70, 50, 4);
    g.fillStyle(0x87CEEB, 0.4);
    g.fillRoundedRect(100, 98, 25, 15, 3);
    g.fillRoundedRect(200, 98, 25, 15, 3);
    this.add.text(180, 75, '201호 (Twin) 🛏️🛏️', {
      fontSize: '6px', color: '#87CEEB'
    }).setOrigin(0.5).setDepth(2);

    // 202호 (도미토리)
    g.fillStyle(0x9370DB, 0.08);
    g.fillRoundedRect(300, 80, 200, 90, 8);
    g.lineStyle(1, 0x9370DB, 0.3);
    g.strokeRoundedRect(300, 80, 200, 90, 8);
    for (let i = 0; i < 2; i++) {
      g.fillStyle(0x8B4513, 0.3);
      g.fillRect(320 + i * 95, 95, 60, 55);
      g.fillStyle(0xFFFFFF, 0.25);
      g.fillRect(325 + i * 95, 98, 50, 22);
      g.fillRect(325 + i * 95, 125, 50, 22);
    }
    this.add.text(400, 75, '202호 (Dorm 4인) 🛏️', {
      fontSize: '6px', color: '#9370DB'
    }).setOrigin(0.5).setDepth(2);

    // 203호 (싱글)
    g.fillStyle(0xFFB6C1, 0.08);
    g.fillRoundedRect(520, 80, 180, 90, 8);
    g.lineStyle(1, 0xFFB6C1, 0.3);
    g.strokeRoundedRect(520, 80, 180, 90, 8);
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRoundedRect(540, 95, 80, 50, 4);
    g.fillStyle(0xFFB6C1, 0.4);
    g.fillRoundedRect(545, 98, 25, 15, 3);
    g.fillStyle(0x8B6914, 0.4);
    g.fillRect(640, 100, 40, 25);
    this.add.text(610, 75, '203호 (Single) 🛏️', {
      fontSize: '6px', color: '#FFB6C1'
    }).setOrigin(0.5).setDepth(2);

    // 공용 화장실/샤워
    g.fillStyle(0x87CEEB, 0.1);
    g.fillRoundedRect(80, 230, 200, 70, 6);
    g.lineStyle(1, 0x87CEEB, 0.2);
    g.strokeRoundedRect(80, 230, 200, 70, 6);
    for (let i = 0; i < 3; i++) {
      g.fillStyle(0xFFFFFF, 0.15);
      g.fillRoundedRect(95 + i * 60, 240, 45, 45, 4);
    }
    this.add.text(180, 225, '🚿 화장실/샤워 / シャワー', {
      fontSize: '6px', color: '#87CEEB'
    }).setOrigin(0.5).setDepth(2);

    // 세탁실
    g.fillStyle(0xC0C0C0, 0.1);
    g.fillRoundedRect(520, 230, 180, 70, 6);
    g.fillStyle(0xFFFFFF, 0.2);
    g.fillCircle(560, 270, 18);
    g.fillCircle(640, 270, 18);
    this.add.text(610, 225, '🧺 세탁실 / ランドリー', {
      fontSize: '6px', color: '#888888'
    }).setOrigin(0.5).setDepth(2);

    // 장식
    this.add.text(730, 500, '🪴', { fontSize: '14px' }).setOrigin(0.5).setDepth(2);
    this.add.text(80, 500, '🪴', { fontSize: '14px' }).setOrigin(0.5).setDepth(2);
    this.add.text(400, 485, '📶 WiFi: SeoulStay_5G\nPW: welcome2024', {
      fontSize: '5px', color: '#888888', align: 'center', lineSpacing: 2,
      backgroundColor: '#00000033', padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(2);
  }
}
