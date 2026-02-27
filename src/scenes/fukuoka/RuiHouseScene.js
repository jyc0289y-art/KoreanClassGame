import BasePlaceScene from '../BasePlaceScene.js';

// ============================================================
// RuiHouseScene — 루이의 집 (야쿠인 1K 아파트) (800×600)
//
//  실제 일본 1K 아파트 레이아웃 (유코/아미와 동일 구조)
//  루이 캐릭터 테마: YouTuber, 한국 음식 마니아, 카메라 장비
//  ─ 시안(cyan) + 화이트 컬러 테마
//  ─ 촬영 장비 (카메라, 조명, 삼각대)
//  ─ 한국 음식 포스터 / 먹방 관련
//  ─ 올리브영 쇼핑백
// ============================================================

export default class RuiHouseScene extends BasePlaceScene {
  constructor() { super('RuiHouseScene'); }

  create() {
    this.createPlace({
      worldWidth: 800, worldHeight: 600,
      startX: 400, startY: 540,
      tiles: 'floor_wood',
      returnScene: 'FukuokaYakuinScene',
      title_ko: '루이의 방', title_ja: 'ルイの部屋',
      subtitle: 'YouTuber Studio & K-Food ファン',
      npcs: [],
      buildings: []
    });

    this.addApartmentLayout();
  }

  addApartmentLayout() {
    const g = this.add.graphics().setDepth(1);

    // ══════════════════════════════════════
    // 현관 (玄関)
    // ══════════════════════════════════════
    g.fillStyle(0x8B6914, 0.4);
    g.fillRect(340, 510, 120, 50);
    g.lineStyle(1, 0xDEB887, 0.5);
    g.strokeRect(340, 510, 120, 50);

    g.fillStyle(0x654321, 0.6);
    g.fillRoundedRect(350, 520, 40, 35, 3);
    this.add.text(370, 515, '👟', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);
    // 올리브영 쇼핑백
    this.add.text(430, 525, '🛍️', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);
    this.add.text(430, 545, 'OY', {
      fontSize: '5px', color: '#00A651'
    }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 복도 + 키친 (한국 음식 재료 가득)
    // ══════════════════════════════════════
    g.fillStyle(0x555555, 0.2);
    g.fillRect(340, 350, 120, 160);

    g.fillStyle(0xC0C0C0, 0.5);
    g.fillRoundedRect(430, 370, 25, 60, 2);
    g.fillStyle(0x333333, 0.6);
    g.fillRoundedRect(430, 440, 25, 40, 2);
    this.add.text(442, 395, '🚰', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);
    this.add.text(442, 455, '🔥', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);

    // 냉장고 (한국 식재료)
    g.fillStyle(0xE8E8E8, 0.6);
    g.fillRoundedRect(345, 380, 30, 50, 3);
    this.add.text(360, 390, '🥬', { fontSize: '7px' }).setOrigin(0.5).setDepth(2);
    this.add.text(360, 410, '🌶️', { fontSize: '7px' }).setOrigin(0.5).setDepth(2);

    // 주방 선반 (한국 조미료)
    this.add.text(442, 375, '🫙', { fontSize: '6px' }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 욕실
    // ══════════════════════════════════════
    g.fillStyle(0x00CED1, 0.08);
    g.fillRoundedRect(200, 370, 120, 120, 6);
    g.lineStyle(1, 0x00CED1, 0.3);
    g.strokeRoundedRect(200, 370, 120, 120, 6);

    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRoundedRect(210, 380, 50, 80, 10);
    g.fillStyle(0xFFFFFF, 0.4);
    g.fillRoundedRect(275, 380, 30, 25, 4);
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRoundedRect(275, 430, 30, 30, 4);

    this.add.text(260, 365, '🚿 욕실', {
      fontSize: '7px', color: '#00CED1'
    }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 메인 방 — YouTube 스튜디오 + K-Food 테마
    // ══════════════════════════════════════
    g.fillStyle(0xDEB887, 0.08);
    g.fillRect(100, 60, 600, 280);

    // ── 침대 (좌측, 시안 테마) ──
    g.fillStyle(0x00CED1, 0.25);
    g.fillRoundedRect(110, 80, 130, 90, 8);
    g.fillStyle(0x66DDDD, 0.5);
    g.fillRoundedRect(115, 85, 50, 35, 6);

    // ── YouTube 촬영 데스크 (우측 — 메인 공간) ──
    g.fillStyle(0x333333, 0.4);
    g.fillRoundedRect(480, 80, 200, 100, 6);

    // 모니터 2대
    g.fillStyle(0x111111, 0.7);
    g.fillRoundedRect(495, 85, 80, 50, 3);  // 메인 모니터
    g.fillStyle(0x00CED1, 0.3);
    g.fillRect(500, 90, 70, 38);  // 화면 (편집중)
    g.fillStyle(0x111111, 0.7);
    g.fillRoundedRect(590, 95, 60, 40, 3);  // 서브 모니터
    g.fillStyle(0x00CED1, 0.2);
    g.fillRect(594, 99, 52, 28);

    this.add.text(540, 75, '📹 YouTube Studio', {
      fontSize: '7px', color: '#00CED1', backgroundColor: '#00000066',
      padding: { x: 3, y: 1 }
    }).setOrigin(0.5).setDepth(2);

    // 의자
    g.fillStyle(0x00CED1, 0.3);
    g.fillCircle(540, 200, 15);

    // ── 카메라 장비 코너 (우측 하단) ──
    // 삼각대 + 카메라
    g.fillStyle(0x333333, 0.5);
    g.fillRect(640, 200, 8, 80);  // 삼각대
    g.fillStyle(0x444444, 0.6);
    g.fillRoundedRect(625, 195, 40, 30, 4);  // 카메라 본체
    this.add.text(645, 185, '📷', { fontSize: '12px' }).setOrigin(0.5).setDepth(2);

    // 링 라이트
    g.lineStyle(3, 0xFFFFFF, 0.3);
    g.strokeCircle(580, 250, 20);
    g.fillStyle(0xFFFF00, 0.1);
    g.fillCircle(580, 250, 18);
    this.add.text(580, 250, '💡', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);

    // ── 한국 음식 포스터 (벽면) ──
    const foodPosters = [
      { x: 270, emoji: '🍗', label: '치킨' },
      { x: 350, emoji: '🥘', label: '김치찌개' },
      { x: 430, emoji: '🥩', label: '삼겹살' }
    ];
    foodPosters.forEach(p => {
      g.fillStyle(0xCD5C5C, 0.3);
      g.fillRect(p.x, 42, 65, 50);
      g.lineStyle(1, 0xFFFFFF, 0.15);
      g.strokeRect(p.x, 42, 65, 50);
      this.add.text(p.x + 33, 55, p.emoji, {
        fontSize: '12px'
      }).setOrigin(0.5).setDepth(2);
      this.add.text(p.x + 33, 80, p.label, {
        fontSize: '6px', color: '#ffcccc'
      }).setOrigin(0.5).setDepth(2);
    });

    // ── 먹방 관련 (테이블) ──
    g.fillStyle(0x8B6914, 0.4);
    g.fillRoundedRect(280, 200, 100, 60, 6);

    // 한국 라면, 김치
    this.add.text(310, 215, '🍜', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);
    this.add.text(350, 215, '🥢', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);
    this.add.text(330, 240, '먹방 prep', {
      fontSize: '5px', color: '#CD5C5C'
    }).setOrigin(0.5).setDepth(2);

    // 쿠션
    g.fillStyle(0x00CED1, 0.2);
    g.fillCircle(300, 280, 12);
    g.fillStyle(0xCD5C5C, 0.2);
    g.fillCircle(360, 280, 12);

    // ── 한국어 교재 (침대 옆 스탠드) ──
    g.fillStyle(0x8B6914, 0.4);
    g.fillRect(110, 185, 50, 20);
    g.fillStyle(0xFF69B4, 0.5);
    g.fillRect(115, 188, 15, 14);  // 한국어 책
    g.fillStyle(0x4169E1, 0.5);
    g.fillRect(133, 188, 15, 14);
    this.add.text(135, 210, '📖', { fontSize: '7px' }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 베란다
    // ══════════════════════════════════════
    g.fillStyle(0x87CEEB, 0.08);
    g.fillRect(100, 35, 600, 20);
    g.lineStyle(1, 0xAAAAAA, 0.3);
    g.lineBetween(100, 55, 700, 55);
    this.add.text(250, 42, '👕🧢', {
      fontSize: '7px', alpha: 0.5
    }).setOrigin(0.5).setDepth(2);

    // ── 방 구획 벽 ──
    g.lineStyle(2, 0x8B6914, 0.3);
    g.lineBetween(100, 340, 340, 340);
    g.lineBetween(460, 340, 700, 340);
  }
}
