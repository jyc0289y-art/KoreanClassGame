import BasePlaceScene from '../BasePlaceScene.js';

// ============================================================
// AmiHouseScene — 아미의 집 (야쿠인 1K 아파트) (800×600)
//
//  실제 일본 1K 아파트 레이아웃 (유코와 동일 구조)
//  아미 캐릭터 테마: BTS 열성팬(ARMY), K-Beauty 오타쿠
//  ─ 보라색 + 핑크 컬러 테마
//  ─ BTS 포스터/굿즈 다수
//  ─ 화장대 + 한국 화장품 컬렉션
//  ─ 아미밤(ARMY Bomb), 포토카드 컬렉션
// ============================================================

export default class AmiHouseScene extends BasePlaceScene {
  constructor() { super('AmiHouseScene'); }

  create() {
    this.createPlace({
      worldWidth: 800, worldHeight: 600,
      startX: 400, startY: 540,
      tiles: 'floor_wood',
      returnScene: 'FukuokaYakuinScene',
      title_ko: '아미의 방', title_ja: 'アミの部屋',
      subtitle: 'K-Beauty & BTS Collection',
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
    this.add.text(370, 515, '👠', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);
    // BTS 굿즈 쇼핑백
    this.add.text(435, 530, '🛍️', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 복도 + 키친
    // ══════════════════════════════════════
    g.fillStyle(0x555555, 0.2);
    g.fillRect(340, 350, 120, 160);

    // 싱크대 + 가스레인지
    g.fillStyle(0xC0C0C0, 0.5);
    g.fillRoundedRect(430, 370, 25, 60, 2);
    g.fillStyle(0x333333, 0.6);
    g.fillRoundedRect(430, 440, 25, 40, 2);
    this.add.text(442, 395, '🚰', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);
    this.add.text(442, 455, '🔥', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);

    // 냉장고 (한국 음식 마그넷)
    g.fillStyle(0xE8E8E8, 0.6);
    g.fillRoundedRect(345, 380, 30, 50, 3);
    this.add.text(360, 390, '🧲', { fontSize: '7px' }).setOrigin(0.5).setDepth(2);
    this.add.text(360, 410, '🇰🇷', { fontSize: '7px' }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 욕실 (유닛배스)
    // ══════════════════════════════════════
    g.fillStyle(0xDA70D6, 0.08);
    g.fillRoundedRect(200, 370, 120, 120, 6);
    g.lineStyle(1, 0xDA70D6, 0.3);
    g.strokeRoundedRect(200, 370, 120, 120, 6);

    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRoundedRect(210, 380, 50, 80, 10);
    g.fillStyle(0xFFFFFF, 0.4);
    g.fillRoundedRect(275, 380, 30, 25, 4);
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRoundedRect(275, 430, 30, 30, 4);

    this.add.text(260, 365, '🚿 욕실', {
      fontSize: '7px', color: '#DA70D6'
    }).setOrigin(0.5).setDepth(2);

    // 한국 스킨케어 제품 (욕실 선반)
    this.add.text(220, 465, '🧴🧴', {
      fontSize: '7px'
    }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 메인 방 (6畳) — BTS + K-Beauty 테마
    // ══════════════════════════════════════
    g.fillStyle(0xDEB887, 0.08);
    g.fillRect(100, 60, 600, 280);

    // ── 침대 (좌측, 보라색 테마) ──
    g.fillStyle(0x9370DB, 0.3);
    g.fillRoundedRect(110, 80, 130, 90, 8);
    g.fillStyle(0xDA70D6, 0.5);
    g.fillRoundedRect(115, 85, 50, 35, 6);  // 보라 베개
    // BTS 이불
    this.add.text(175, 115, '💜', {
      fontSize: '14px', alpha: 0.4
    }).setOrigin(0.5).setDepth(2);

    // ── 화장대 + K-Beauty 컬렉션 (우측 벽) ──
    g.fillStyle(0xFFB6C1, 0.3);
    g.fillRoundedRect(530, 80, 160, 90, 6);
    // 거울
    g.fillStyle(0xFFFFFF, 0.4);
    g.fillRoundedRect(560, 68, 100, 10, 4);
    // 화장품들
    const cosmeticColors = [0xFF69B4, 0xDA70D6, 0xFFB6C1, 0xFF1493, 0xBA55D3];
    cosmeticColors.forEach((color, i) => {
      g.fillStyle(color, 0.7);
      g.fillRoundedRect(545 + i * 28, 95, 12, 25, 2);
    });

    this.add.text(610, 75, '💄 K-Beauty Collection', {
      fontSize: '7px', color: '#DA70D6', backgroundColor: '#00000066',
      padding: { x: 3, y: 1 }
    }).setOrigin(0.5).setDepth(2);

    // 의자 (핑크)
    g.fillStyle(0xDA70D6, 0.3);
    g.fillCircle(610, 195, 15);

    // ── BTS 포스터 (벽면) ──
    // 대형 BTS 포스터
    g.fillStyle(0x9370DB, 0.4);
    g.fillRect(270, 42, 90, 70);
    g.lineStyle(2, 0xDA70D6, 0.5);
    g.strokeRect(270, 42, 90, 70);
    this.add.text(315, 70, '💜 BTS\nBeyond\nThe Scene', {
      fontSize: '7px', color: '#ffffff', align: 'center', lineSpacing: 1
    }).setOrigin(0.5).setDepth(2);

    // 앨범 포스터
    g.fillStyle(0xDA70D6, 0.35);
    g.fillRect(380, 42, 60, 50);
    this.add.text(410, 62, '🎵 Album', {
      fontSize: '6px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(2);

    // 콘서트 포스터
    g.fillStyle(0x9370DB, 0.35);
    g.fillRect(460, 42, 60, 50);
    this.add.text(490, 62, '🎤 Concert', {
      fontSize: '6px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(2);

    // ── BTS 굿즈 선반 (좌측 벽) ──
    g.fillStyle(0x4a4a4a, 0.5);
    g.fillRect(110, 200, 100, 15);
    g.fillRect(110, 225, 100, 15);
    g.fillRect(110, 250, 100, 15);

    // 아미밤
    this.add.text(130, 195, '💡', { fontSize: '10px' }).setOrigin(0.5).setDepth(2);
    // 포토카드
    this.add.text(170, 195, '🃏', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);
    this.add.text(150, 220, '💜 ARMY Goods', {
      fontSize: '6px', color: '#9370DB'
    }).setOrigin(0.5).setDepth(2);
    // CD 컬렉션
    this.add.text(150, 245, '💿💿💿', {
      fontSize: '6px'
    }).setOrigin(0.5).setDepth(2);

    // ── 작은 테이블 + 쿠션 ──
    g.fillStyle(0x8B6914, 0.4);
    g.fillRoundedRect(330, 200, 100, 60, 6);
    g.fillStyle(0x9370DB, 0.2);
    g.fillCircle(350, 280, 12);  // 보라 쿠션
    g.fillStyle(0xDA70D6, 0.2);
    g.fillCircle(410, 280, 12);  // 핑크 쿠션

    // 한국 과자 + 아미밤
    this.add.text(365, 215, '🍪', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);
    this.add.text(400, 215, '📱', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);

    // ── 옷장 ──
    g.fillStyle(0xDEB887, 0.5);
    g.fillRoundedRect(630, 200, 50, 100, 4);
    g.lineStyle(1, 0x8B6914, 0.4);
    g.strokeRoundedRect(630, 200, 50, 100, 4);
    g.fillStyle(0xDA70D6, 0.6);
    g.fillCircle(672, 250, 3);
    this.add.text(655, 195, '👗', { fontSize: '8px' }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 베란다
    // ══════════════════════════════════════
    g.fillStyle(0x87CEEB, 0.08);
    g.fillRect(100, 35, 600, 20);
    g.lineStyle(1, 0xAAAAAA, 0.3);
    g.lineBetween(100, 55, 700, 55);
    this.add.text(250, 42, '👚👗', {
      fontSize: '7px', alpha: 0.5
    }).setOrigin(0.5).setDepth(2);

    // ── 방 구획 벽 ──
    g.lineStyle(2, 0x8B6914, 0.3);
    g.lineBetween(100, 340, 340, 340);
    g.lineBetween(460, 340, 700, 340);
  }
}
