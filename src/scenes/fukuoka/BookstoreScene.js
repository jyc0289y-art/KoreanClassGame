import BasePlaceScene from '../BasePlaceScene.js';

// ============================================================
// BookstoreScene — 키노마루 하카타점 (1000×700)
//
//  실제 배치 참조: 紀野丸書店 博多店 (JR博多シティ 6F)
//  ─ 매장 면적: 약 3,300㎡ (1,000평)
//  ─ 입구 근처: 잡지 코너 + 신간 디스플레이
//  ─ 중앙: 장르별 서가 (소설, 실용서, 만화 등)
//  ─ 안쪽: 외국어 학습 코너 (한국어 교재 집중 배치)
//  ─ 우측 안쪽: 문구/스테이셔너리 코너
//  ─ 입구 옆: Cafe de Ciel (카페)
//  ─ 계산대: 입구 근처 중앙
// ============================================================

export default class BookstoreScene extends BasePlaceScene {
  constructor() { super('BookstoreScene'); }

  create() {
    this.createPlace({
      worldWidth: 1000, worldHeight: 700,
      startX: 500, startY: 620,
      tiles: 'floor_tile',
      returnScene: 'FukuokaYakuinScene',
      title_ko: '키노마루 서점', title_ja: '紀野丸書店 博多店',
      subtitle: 'JR博多シティ 6F',
      npcs: [
        // 한국어 코너 직원
        { x: 800, y: 250, texture: 'mission_npc', name_ko: '서점 직원', name_ja: '書店員', hasMission: true,
          greeting_ko: '한국어 교재 코너에 오신 걸 환영합니다!\n초급용 교재부터 TOPIK 대비 교재까지\n다양하게 준비되어 있어요.',
          greeting_ja: '韓国語テキストコーナーへようこそ！\n初級テキストからTOPIK対策まで\n幅広くご用意しています。' },
        // 카페 직원
        { x: 200, y: 550, texture: 'shop', name_ko: 'Cafe de Ciel', name_ja: 'カフェ・ド・シエル',
          greeting_ko: '카페 드 시엘입니다!\n커피 마시면서 책 읽으세요~',
          greeting_ja: 'カフェ・ド・シエルです！\nコーヒーを飲みながら読書をどうぞ～' }
      ],
      buildings: []
    });

    this.addBookstoreDecor();
  }

  addBookstoreDecor() {
    const g = this.add.graphics().setDepth(1);

    // ══════════════════════════════════════
    // 매장 바닥 구역 표시
    // ══════════════════════════════════════
    g.fillStyle(0xF5F5DC, 0.05);
    g.fillRect(50, 40, 900, 580);

    // ══════════════════════════════════════
    // 입구 근처: 잡지 코너 + 신간 (하단 좌측)
    // ══════════════════════════════════════
    // 잡지 래크 (입구 바로 옆)
    g.fillStyle(0xDEB887, 0.4);
    g.fillRect(80, 530, 100, 15);
    g.fillRect(80, 550, 100, 15);
    g.fillRect(80, 570, 100, 15);

    // 잡지 컬러
    const magColors = [0xFF6347, 0x4169E1, 0xFFD700, 0x32CD32, 0xDA70D6];
    magColors.forEach((c, i) => {
      g.fillStyle(c, 0.5);
      g.fillRect(85 + i * 18, 532, 14, 10);
    });
    this.add.text(130, 520, '📰 잡지 / 雑誌', {
      fontSize: '7px', color: '#8B6914'
    }).setOrigin(0.5).setDepth(2);

    // 신간 디스플레이 테이블
    g.fillStyle(0xDEB887, 0.5);
    g.fillRoundedRect(300, 530, 200, 60, 6);
    this.add.text(400, 525, '📚 신간 / 新刊', {
      fontSize: '7px', color: '#CD5C5C', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    // 새 책들
    for (let i = 0; i < 6; i++) {
      g.fillStyle(Phaser.Display.Color.HSVToRGB(i * 0.15, 0.6, 0.8).color, 0.6);
      g.fillRect(310 + i * 30, 545, 22, 30);
    }

    // ══════════════════════════════════════
    // 계산대 (입구 근처 중앙)
    // ══════════════════════════════════════
    g.fillStyle(0x555555, 0.5);
    g.fillRoundedRect(530, 540, 200, 45, 4);
    g.lineStyle(1, 0x888888, 0.4);
    g.strokeRoundedRect(530, 540, 200, 45, 4);
    this.add.text(630, 535, '📖 계산대 / レジ', {
      fontSize: '8px', color: '#aaaaaa', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    // 레지 표시
    for (let i = 0; i < 3; i++) {
      g.fillStyle(0x333333, 0.4);
      g.fillRect(555 + i * 60, 555, 40, 20);
    }

    // ══════════════════════════════════════
    // 중앙: 장르별 서가 (세로로 길게)
    // ══════════════════════════════════════
    const aisles = [
      { x: 130, label: '소설\n小説', color: 0x4169E1 },
      { x: 280, label: '실용서\n実用書', color: 0x2E8B57 },
      { x: 430, label: '만화\nコミック', color: 0xFF6347 },
      { x: 580, label: 'IT/비즈\nIT/ビジネス', color: 0x4682B4 }
    ];

    aisles.forEach(aisle => {
      // 서가 (길게)
      g.fillStyle(0x8B4513, 0.5);
      g.fillRect(aisle.x, 100, 30, 380);
      g.fillRect(aisle.x + 70, 100, 30, 380);

      // 책들 (양쪽 서가에)
      for (let j = 0; j < 6; j++) {
        const by = 110 + j * 60;
        g.fillStyle(aisle.color, 0.4 + Math.random() * 0.3);
        g.fillRect(aisle.x + 3, by, 24, 48);
        g.fillStyle(aisle.color, 0.3 + Math.random() * 0.3);
        g.fillRect(aisle.x + 73, by, 24, 48);
      }

      // 라벨
      this.add.text(aisle.x + 50, 85, aisle.label, {
        fontSize: '6px', color: '#888888', align: 'center', lineSpacing: 1
      }).setOrigin(0.5).setDepth(2);
    });

    // ══════════════════════════════════════
    // 한국어/외국어 학습 코너 (우측 안쪽, 강조)
    // ══════════════════════════════════════
    g.fillStyle(0xFF69B4, 0.1);
    g.fillRoundedRect(720, 80, 230, 380, 10);
    g.lineStyle(2, 0xFF69B4, 0.3);
    g.strokeRoundedRect(720, 80, 230, 380, 10);

    this.add.text(835, 65, '🇰🇷 한국어 코너 / 韓国語コーナー', {
      fontSize: '9px', color: '#ff69b4', fontStyle: 'bold',
      backgroundColor: '#00000066', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(2);

    // 한국어 교재 서가
    const koreanBooks = [
      { y: 100, label: '초급 / 初級', color: 0x32CD32 },
      { y: 180, label: '중급 / 中級', color: 0x4169E1 },
      { y: 260, label: 'TOPIK 대비', color: 0xFFD700 },
      { y: 340, label: '회화 / 会話', color: 0xFF69B4 }
    ];

    koreanBooks.forEach(section => {
      g.fillStyle(0x8B4513, 0.5);
      g.fillRect(740, section.y, 25, 65);
      g.fillRect(870, section.y, 25, 65);

      // 책들
      for (let i = 0; i < 3; i++) {
        g.fillStyle(section.color, 0.5 + i * 0.1);
        g.fillRect(743, section.y + 5 + i * 20, 19, 16);
        g.fillStyle(section.color, 0.4 + i * 0.1);
        g.fillRect(873, section.y + 5 + i * 20, 19, 16);
      }

      this.add.text(835, section.y + 30, section.label, {
        fontSize: '6px', color: '#ff69b4', backgroundColor: '#00000044',
        padding: { x: 2, y: 1 }
      }).setOrigin(0.5).setDepth(2);
    });

    // ══════════════════════════════════════
    // 문구 코너 (우측 하단)
    // ══════════════════════════════════════
    g.fillStyle(0xFFD700, 0.08);
    g.fillRoundedRect(750, 480, 190, 80, 6);
    this.add.text(845, 475, '✏️ 문구 / 文具', {
      fontSize: '7px', color: '#FFD700'
    }).setOrigin(0.5).setDepth(2);

    // 펜, 노트 진열
    g.fillStyle(0xDEB887, 0.4);
    g.fillRect(760, 500, 160, 12);
    g.fillRect(760, 520, 160, 12);
    g.fillRect(760, 540, 160, 12);

    // ══════════════════════════════════════
    // Cafe de Ciel (입구 옆 좌측)
    // ══════════════════════════════════════
    g.fillStyle(0x8B4513, 0.15);
    g.fillRoundedRect(70, 480, 200, 120, 8);
    g.lineStyle(1, 0x8B4513, 0.3);
    g.strokeRoundedRect(70, 480, 200, 120, 8);

    // 카페 테이블
    g.fillStyle(0x8B4513, 0.4);
    g.fillCircle(120, 530, 18);
    g.fillCircle(210, 530, 18);

    // 의자
    g.fillStyle(0x654321, 0.3);
    g.fillCircle(100, 555, 8);
    g.fillCircle(140, 555, 8);
    g.fillCircle(190, 555, 8);
    g.fillCircle(230, 555, 8);

    this.add.text(170, 475, '☕ Cafe de Ciel', {
      fontSize: '8px', color: '#8B4513', fontStyle: 'bold',
      backgroundColor: '#00000044', padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(2);
  }
}
