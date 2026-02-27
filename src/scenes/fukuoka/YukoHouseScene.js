import BasePlaceScene from '../BasePlaceScene.js';

// ============================================================
// YukoHouseScene — 유코의 집 (야쿠인 1K 아파트) (800×600)
//
//  실제 일본 1K 아파트 레이아웃 참조:
//  ─ 현관(玄関): 하단 중앙 (신발장)
//  ─ 좁은 복도/주방: 현관에서 위로 올라가며 (냉장고, 가스레인지, 싱크대)
//  ─ 욕실/화장실(ユニットバス): 복도 좌측 (유닛배스)
//  ─ 메인 방 (6~8畳): 상단 개방 공간 (침대, 책상, TV)
//  ─ 베란다(ベランダ): 최상단 (빨래건조대)
//
//  유코 캐릭터 테마: K-POP 오타쿠, 한국어 교재, 한국 드라마
// ============================================================

export default class YukoHouseScene extends BasePlaceScene {
  constructor() { super('YukoHouseScene'); }

  create() {
    this.createPlace({
      worldWidth: 800, worldHeight: 600,
      startX: 400, startY: 540,
      tiles: 'floor_wood',
      returnScene: 'FukuokaYakuinScene',
      title_ko: '유코의 방', title_ja: 'ユコの部屋',
      subtitle: '야쿠인 1K 아파트',
      npcs: [],
      buildings: []
    });

    this.addApartmentLayout();
  }

  addApartmentLayout() {
    const g = this.add.graphics().setDepth(1);

    // ══════════════════════════════════════
    // 현관 (玄関) — 하단 중앙
    // ══════════════════════════════════════
    g.fillStyle(0x8B6914, 0.4);
    g.fillRect(340, 510, 120, 50);  // 현관 바닥 (타다키)
    g.lineStyle(1, 0xDEB887, 0.5);
    g.strokeRect(340, 510, 120, 50);

    // 신발장 (좌측)
    g.fillStyle(0x654321, 0.6);
    g.fillRoundedRect(350, 520, 40, 35, 3);
    this.add.text(370, 515, '👟', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);

    // 우산꽂이
    this.add.text(440, 530, '☂️', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 좁은 복도 + 키친 — 현관 위
    // ══════════════════════════════════════
    g.fillStyle(0x555555, 0.2);
    g.fillRect(340, 350, 120, 160);  // 복도 영역

    // 가스레인지 + 싱크대 (우측 벽)
    g.fillStyle(0xC0C0C0, 0.5);
    g.fillRoundedRect(430, 370, 25, 60, 2);  // 싱크대
    g.fillStyle(0x333333, 0.6);
    g.fillRoundedRect(430, 440, 25, 40, 2);  // 가스레인지
    this.add.text(442, 395, '🚰', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);
    this.add.text(442, 455, '🔥', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);

    // 냉장고 (좌측 벽)
    g.fillStyle(0xE8E8E8, 0.6);
    g.fillRoundedRect(345, 380, 30, 50, 3);
    this.add.text(360, 400, '🧊', { fontSize: '9px' }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 욕실/화장실 (ユニットバス) — 복도 좌측
    // ══════════════════════════════════════
    g.fillStyle(0x87CEEB, 0.15);
    g.fillRoundedRect(200, 370, 120, 120, 6);
    g.lineStyle(1, 0x87CEEB, 0.3);
    g.strokeRoundedRect(200, 370, 120, 120, 6);

    // 욕조
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRoundedRect(210, 380, 50, 80, 10);
    // 세면대
    g.fillStyle(0xFFFFFF, 0.4);
    g.fillRoundedRect(275, 380, 30, 25, 4);
    // 화장실
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRoundedRect(275, 430, 30, 30, 4);

    this.add.text(260, 365, '🚿 욕실', {
      fontSize: '7px', color: '#87CEEB'
    }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 메인 방 (6畳) — 상단 넓은 공간
    // ══════════════════════════════════════
    g.fillStyle(0xDEB887, 0.08);
    g.fillRect(100, 60, 600, 280);
    g.lineStyle(1, 0x8B6914, 0.15);
    g.strokeRect(100, 60, 600, 280);

    // ── 침대 (좌측) ──
    g.fillStyle(0xFF69B4, 0.25);
    g.fillRoundedRect(110, 80, 130, 90, 8);
    g.fillStyle(0xFFB6C1, 0.5);
    g.fillRoundedRect(115, 85, 50, 35, 6);  // 베개 (핑크)
    this.add.text(175, 135, '🛏️', { fontSize: '12px' }).setOrigin(0.5).setDepth(2);

    // 이불 패턴 (한글 패턴)
    this.add.text(165, 100, 'ㅎ', {
      fontSize: '12px', color: '#FF69B4', alpha: 0.3
    }).setOrigin(0.5).setDepth(2);

    // ── 책상 + 한국어 교재 (우측 벽) ──
    g.fillStyle(0x8B6914, 0.5);
    g.fillRoundedRect(530, 80, 160, 70, 4);
    // 의자
    g.fillStyle(0xFF69B4, 0.3);
    g.fillCircle(610, 175, 15);

    this.add.text(610, 75, '📚 한국어 교재 / 韓国語テキスト', {
      fontSize: '7px', color: '#ff69b4', backgroundColor: '#00000066',
      padding: { x: 3, y: 1 }
    }).setOrigin(0.5).setDepth(2);

    // 교재 표현 (책상 위)
    const bookColors = [0xFF69B4, 0xDA70D6, 0x4169E1];
    bookColors.forEach((color, i) => {
      g.fillStyle(color, 0.6);
      g.fillRect(545 + i * 25, 90, 20, 30);
    });

    // 노트북 PC
    g.fillStyle(0xC0C0C0, 0.5);
    g.fillRoundedRect(625, 95, 50, 35, 3);
    g.fillStyle(0x333333, 0.6);
    g.fillRoundedRect(630, 98, 40, 22, 2);  // 화면
    this.add.text(650, 108, '▶', {
      fontSize: '6px', color: '#FF69B4'
    }).setOrigin(0.5).setDepth(2);

    // ── K-POP 포스터들 (벽면 상단) ──
    const posterColors = [0xFF69B4, 0x9370DB, 0xDA70D6];
    const posterLabels = ['♪ K-POP', '💜 아이돌', '🎵 BTX'];
    posterColors.forEach((color, i) => {
      g.fillStyle(color, 0.35);
      g.fillRect(270 + i * 90, 45, 70, 50);
      g.lineStyle(1, 0xFFFFFF, 0.2);
      g.strokeRect(270 + i * 90, 45, 70, 50);
      this.add.text(305 + i * 90, 65, posterLabels[i], {
        fontSize: '7px', color: '#ffffff'
      }).setOrigin(0.5).setDepth(2);
    });

    // ── TV + K-Drama DVD 선반 (좌측 벽 아래) ──
    g.fillStyle(0x333333, 0.6);
    g.fillRoundedRect(110, 200, 80, 50, 3);  // TV
    g.fillStyle(0x111111, 0.8);
    g.fillRect(115, 205, 70, 35);  // 화면
    this.add.text(150, 220, '📺', {
      fontSize: '10px'
    }).setOrigin(0.5).setDepth(2);

    // DVD 선반
    g.fillStyle(0x4a4a4a, 0.5);
    g.fillRect(110, 260, 80, 15);
    g.fillRect(110, 280, 80, 15);
    this.add.text(150, 255, '📀 K-Drama', {
      fontSize: '6px', color: '#da70d6'
    }).setOrigin(0.5).setDepth(2);

    // ── 작은 테이블 + 쿠션 (방 중앙) ──
    g.fillStyle(0x8B6914, 0.4);
    g.fillRoundedRect(330, 200, 100, 60, 6);
    // 쿠션
    g.fillStyle(0xFF69B4, 0.2);
    g.fillCircle(350, 280, 12);
    g.fillCircle(410, 280, 12);

    // 위에 한국 과자
    this.add.text(380, 215, '🍫🍵', {
      fontSize: '8px'
    }).setOrigin(0.5).setDepth(2);

    // ── 옷장 (우측 벽 아래) ──
    g.fillStyle(0xDEB887, 0.5);
    g.fillRoundedRect(630, 200, 50, 100, 4);
    g.lineStyle(1, 0x8B6914, 0.4);
    g.strokeRoundedRect(630, 200, 50, 100, 4);
    // 문 손잡이
    g.fillStyle(0xFFD700, 0.6);
    g.fillCircle(672, 250, 3);
    this.add.text(655, 195, '👗', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 베란다 (ベランダ) — 최상단
    // ══════════════════════════════════════
    g.fillStyle(0x87CEEB, 0.08);
    g.fillRect(100, 35, 600, 20);
    g.lineStyle(1, 0xAAAAAA, 0.3);
    g.lineBetween(100, 55, 700, 55);

    // 빨래건조대
    this.add.text(250, 42, '👕👖', {
      fontSize: '7px', alpha: 0.5
    }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 방 구획 벽 표시 (복도 <-> 방 경계)
    // ══════════════════════════════════════
    g.lineStyle(2, 0x8B6914, 0.3);
    g.lineBetween(100, 340, 340, 340);
    g.lineBetween(460, 340, 700, 340);
    // 문 (개방)
    g.lineStyle(1, 0xDEB887, 0.4);
    g.lineBetween(340, 340, 340, 380);
  }
}
