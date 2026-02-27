import BasePlaceScene from '../BasePlaceScene.js';

// ============================================================
// RestaurantScene — 한국 삼겹살 식당 (900×700)
//
//  실제 한국 고깃집 레이아웃 참조:
//  ─ 입구: 레지 카운터 + 메뉴판 (하단)
//  ─ 홀: 불판 테이블 5석 (후드/배기 시스템)
//  ─ 테이블 위: 중앙 불판(그릴), 양쪽에 반찬 그릇
//  ─ 좌측 벽: 밑반찬 셀프바 (김치, 파절이, 마늘, 쌈장)
//  ─ 우측 벽: 음료 냉장고 (소주, 맥주, 콜라)
//  ─ 안쪽: 주방 (오픈 키친 스타일)
//  ─ 특징: 천장 후드 배기, 앞치마 대여, 가위/집게
// ============================================================

export default class RestaurantScene extends BasePlaceScene {
  constructor() { super('RestaurantScene'); }

  create() {
    this.createPlace({
      worldWidth: 900, worldHeight: 700,
      startX: 450, startY: 630,
      tiles: 'floor_tile',
      returnScene: 'SeoulGangnamScene',
      title_ko: '삼겹살 식당', title_ja: 'サムギョプサル食堂',
      subtitle: '강남 고기 맛집 🥩',
      npcs: [
        { x: 450, y: 120, texture: 'mission_npc', name_ko: '사장님', name_ja: '店主', hasMission: true,
          greeting_ko: '어서오세요! 삼겹살 드시러 오셨죠?\n불판에 바로 구워 드릴게요!\n소주도 한잔 하시겠어요?',
          greeting_ja: 'いらっしゃいませ！サムギョプサルですね？\n鉄板で焼きたてをお出しします！\n焼酎も一杯いかがですか？' },
        { x: 200, y: 400, texture: 'shop', name_ko: '직원', name_ja: '店員',
          greeting_ko: '앞치마 드릴게요! 옷에 냄새 안 배게요.\n가위랑 집게도 여기 있어요~',
          greeting_ja: 'エプロンをどうぞ！服に匂いがつきませんよ。\nハサミとトングもここにあります～' }
      ],
      buildings: []
    });

    this.addRestaurantDecor();
  }

  addRestaurantDecor() {
    const g = this.add.graphics().setDepth(1);

    // 레지 카운터
    g.fillStyle(0x8B4513, 0.5);
    g.fillRoundedRect(650, 580, 150, 50, 6);
    g.lineStyle(1, 0xDEB887, 0.4);
    g.strokeRoundedRect(650, 580, 150, 50, 6);
    this.add.text(725, 575, '💰 계산 / レジ', {
      fontSize: '7px', color: '#DEB887'
    }).setOrigin(0.5).setDepth(2);

    // 메뉴판
    g.fillStyle(0xCD5C5C, 0.5);
    g.fillRoundedRect(650, 500, 150, 65, 6);
    g.lineStyle(2, 0xFFD700, 0.4);
    g.strokeRoundedRect(650, 500, 150, 65, 6);
    this.add.text(725, 495, '📋 메뉴 / メニュー', {
      fontSize: '7px', color: '#FFD700', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(725, 515, '삼겹살 (200g) 16,000₩', {
      fontSize: '6px', color: '#ffdddd'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(725, 528, '목살 (200g) 17,000₩', {
      fontSize: '6px', color: '#ffdddd'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(725, 541, '된장찌개 8,000₩ / 냉면 9,000₩', {
      fontSize: '5px', color: '#ffcccc'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(725, 554, '소주 5,000₩ / 맥주 5,000₩', {
      fontSize: '5px', color: '#ffcccc'
    }).setOrigin(0.5).setDepth(2);

    // 불판 테이블 (5석)
    const tables = [
      { x: 250, y: 250 }, { x: 500, y: 250 },
      { x: 250, y: 430 }, { x: 500, y: 430 }, { x: 750, y: 330 }
    ];
    tables.forEach(t => {
      g.fillStyle(0x8B6914, 0.5);
      g.fillRoundedRect(t.x - 70, t.y - 35, 140, 90, 8);
      g.lineStyle(1, 0xDEB887, 0.3);
      g.strokeRoundedRect(t.x - 70, t.y - 35, 140, 90, 8);
      // 불판
      g.fillStyle(0x333333, 0.7);
      g.fillCircle(t.x, t.y, 25);
      g.fillStyle(0xFF4500, 0.25);
      g.fillCircle(t.x, t.y, 20);
      g.fillStyle(0xFF6347, 0.15);
      g.fillCircle(t.x, t.y, 14);
      // 후드
      g.lineStyle(3, 0x888888, 0.2);
      g.lineBetween(t.x - 25, t.y - 45, t.x - 25, t.y - 70);
      g.lineBetween(t.x + 25, t.y - 45, t.x + 25, t.y - 70);
      g.lineBetween(t.x - 25, t.y - 70, t.x + 25, t.y - 70);
      // 반찬 그릇
      const sideColors = [0x228B22, 0xCD5C5C, 0xFFD700, 0xFF69B4];
      sideColors.forEach((c, i) => {
        g.fillStyle(c, 0.4);
        g.fillCircle(t.x - 50 + (i % 2) * 18, t.y - 15 + Math.floor(i / 2) * 22, 6);
        g.fillCircle(t.x + 38 + (i % 2) * 18, t.y - 15 + Math.floor(i / 2) * 22, 6);
      });
      // 의자
      g.fillStyle(0x4169E1, 0.25);
      g.fillCircle(t.x - 25, t.y + 65, 10);
      g.fillCircle(t.x + 25, t.y + 65, 10);
    });

    // 밑반찬 셀프바
    g.fillStyle(0x228B22, 0.1);
    g.fillRoundedRect(60, 180, 50, 280, 6);
    g.lineStyle(1, 0x228B22, 0.3);
    g.strokeRoundedRect(60, 180, 50, 280, 6);
    this.add.text(85, 170, '🥬 반찬\nセルフバー', {
      fontSize: '6px', color: '#228B22', align: 'center', lineSpacing: 2
    }).setOrigin(0.5).setDepth(2);
    const banchan = [
      { y: 200, emoji: '🥬', label: '김치' }, { y: 240, emoji: '🧅', label: '파절이' },
      { y: 280, emoji: '🧄', label: '마늘' }, { y: 320, emoji: '🫙', label: '쌈장' },
      { y: 360, emoji: '🥗', label: '쌈채소' }, { y: 400, emoji: '🌶️', label: '고추' }
    ];
    banchan.forEach(b => {
      g.fillStyle(0x228B22, 0.2);
      g.fillRoundedRect(65, b.y, 40, 30, 4);
      this.add.text(85, b.y + 10, b.emoji, { fontSize: '8px' }).setOrigin(0.5).setDepth(2);
      this.add.text(85, b.y + 25, b.label, { fontSize: '4px', color: '#228B22' }).setOrigin(0.5).setDepth(2);
    });

    // 음료 냉장고
    g.fillStyle(0x4682B4, 0.15);
    g.fillRoundedRect(810, 250, 45, 200, 6);
    g.lineStyle(1, 0x87CEEB, 0.3);
    g.strokeRoundedRect(810, 250, 45, 200, 6);
    this.add.text(832, 240, '🧊 음료', { fontSize: '6px', color: '#87CEEB' }).setOrigin(0.5).setDepth(2);
    [{ y: 270, e: '🍶', l: '소주' }, { y: 310, e: '🍺', l: '맥주' },
     { y: 350, e: '🥤', l: '콜라' }, { y: 390, e: '💧', l: '물' }].forEach(d => {
      g.fillStyle(0x4682B4, 0.2);
      g.fillRoundedRect(815, d.y, 35, 30, 3);
      this.add.text(832, d.y + 10, d.e, { fontSize: '7px' }).setOrigin(0.5).setDepth(2);
      this.add.text(832, d.y + 24, d.l, { fontSize: '4px', color: '#87CEEB' }).setOrigin(0.5).setDepth(2);
    });

    // 주방
    g.fillStyle(0xC0C0C0, 0.1);
    g.fillRoundedRect(200, 60, 500, 70, 8);
    g.lineStyle(2, 0xC0C0C0, 0.3);
    g.strokeRoundedRect(200, 60, 500, 70, 8);
    g.fillStyle(0x888888, 0.3);
    g.fillRect(220, 75, 60, 35);
    g.fillRect(300, 75, 80, 35);
    g.fillRect(400, 75, 60, 35);
    g.fillRect(480, 75, 80, 35);
    g.fillRect(580, 75, 80, 35);
    this.add.text(450, 55, '🍳 주방 / 厨房', {
      fontSize: '8px', color: '#888888', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // 앞치마 걸이
    this.add.text(120, 560, '👔 앞치마\nエプロン', {
      fontSize: '6px', color: '#888888', align: 'center', lineSpacing: 2
    }).setOrigin(0.5).setDepth(2);
    g.fillStyle(0x888888, 0.2);
    g.fillRoundedRect(95, 570, 50, 40, 4);
  }
}
