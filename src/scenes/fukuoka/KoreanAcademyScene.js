import BasePlaceScene from '../BasePlaceScene.js';

// ============================================================
// KoreanAcademyScene — K Campus Tokyo 텐진교 (1000×800)
//
//  실제 배치 참조: K Campus (韓国語レッスン)
//  ─ 상업 빌딩 8F 한 층 전체
//  ─ 엘리베이터 홀 → 리셉션 (입구)
//  ─ 복도를 따라 5~8개 교실 (컬러별 이름)
//  ─ 각 교실: 4~8명 소규모 (테이블+의자)
//  ─ 리셉션 옆: 대기 라운지, 한국 문화 게시판
//  ─ 복도 끝: 교재 판매 코너, 휴게실
// ============================================================

export default class KoreanAcademyScene extends BasePlaceScene {
  constructor() { super('KoreanAcademyScene'); }

  create() {
    this.createPlace({
      worldWidth: 1000, worldHeight: 800,
      startX: 500, startY: 730,
      tiles: 'floor_tile',
      returnScene: 'FukuokaUnifiedScene',
      title_ko: '한국어 학원', title_ja: 'K Campus 天神校',
      subtitle: '8F 한국어 교실',
      npcs: [
        // 한국어 선생님 (메인 교실)
        { x: 500, y: 200, texture: 'academy', name_ko: '한국어 선생님', name_ja: '韓国語の先生', hasMission: true,
          greeting_ko: '안녕하세요! 오늘은 한글의 자음과 모음을 배워볼까요?\n가, 나, 다, 라... 하나씩 따라해 보세요!',
          greeting_ja: 'こんにちは！今日はハングルの子音と母音を学んでみましょうか？\nカ、ナ、タ、ラ…一つずつ繰り返してみましょう！' },
        // 리셉션 직원
        { x: 250, y: 650, texture: 'shop', name_ko: '리셉션', name_ja: 'レセプション',
          greeting_ko: 'K Campus 텐진교에 오신 걸 환영합니다!\n수업 예약은 되어 있으세요?',
          greeting_ja: 'K Campus天神校へようこそ！\nレッスンのご予約はされていますか？' }
      ],
      buildings: []
    });

    this.addAcademyDecor();
  }

  addAcademyDecor() {
    const g = this.add.graphics().setDepth(1);

    // ══════════════════════════════════════
    // 엘리베이터 홀 + 리셉션 (하단)
    // ══════════════════════════════════════

    // 엘리베이터 문 (입구 근처)
    g.fillStyle(0xC0C0C0, 0.5);
    g.fillRect(470, 720, 60, 40);
    g.lineStyle(1, 0x888888, 0.5);
    g.strokeRect(470, 720, 60, 40);
    g.lineBetween(500, 720, 500, 760);  // 문 중앙선
    this.add.text(500, 710, '🔼 EV', {
      fontSize: '7px', color: '#888888'
    }).setOrigin(0.5).setDepth(2);

    // 리셉션 데스크 (좌측)
    g.fillStyle(0xFF69B4, 0.2);
    g.fillRoundedRect(120, 620, 250, 80, 8);
    g.fillStyle(0xFFFFFF, 0.3);
    g.fillRoundedRect(140, 640, 210, 40, 6);
    g.lineStyle(2, 0xFF69B4, 0.4);
    g.strokeRoundedRect(120, 620, 250, 80, 8);

    this.add.text(245, 615, '📋 리셉션 / レセプション', {
      fontSize: '8px', color: '#FF69B4', fontStyle: 'bold',
      backgroundColor: '#00000044', padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(2);

    // K Campus 로고
    this.add.text(245, 660, 'K Campus', {
      fontSize: '10px', color: '#FF69B4', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // 대기 라운지 (우측)
    g.fillStyle(0xDA70D6, 0.08);
    g.fillRoundedRect(550, 620, 200, 80, 6);
    // 소파
    g.fillStyle(0xDA70D6, 0.2);
    g.fillRoundedRect(570, 640, 80, 35, 6);
    g.fillRoundedRect(660, 640, 70, 35, 6);
    // 잡지 테이블
    g.fillStyle(0x8B6914, 0.3);
    g.fillCircle(640, 660, 15);

    this.add.text(650, 615, '☕ 대기실 / 待合', {
      fontSize: '7px', color: '#DA70D6'
    }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 한국 문화 게시판 (리셉션 위 벽)
    // ══════════════════════════════════════
    g.fillStyle(0xFFD700, 0.15);
    g.fillRoundedRect(100, 560, 300, 40, 4);
    this.add.text(250, 570, '🇰🇷 한국 문화 게시판 / 韓国文化掲示板', {
      fontSize: '7px', color: '#FFD700'
    }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 중앙 복도
    // ══════════════════════════════════════
    g.fillStyle(0xBBBBBB, 0.08);
    g.fillRect(400, 80, 200, 500);

    // ══════════════════════════════════════
    // 교실들 (좌측 3개 + 우측 3개, 컬러별)
    // ══════════════════════════════════════

    // ── 좌측 교실들 ──
    const leftRooms = [
      { y: 100, color: 0xFF69B4, label: '핑크교실\nPink Room', hasBlackboard: true },
      { y: 280, color: 0x4169E1, label: '블루교실\nBlue Room', hasBlackboard: false },
      { y: 440, color: 0x32CD32, label: '그린교실\nGreen Room', hasBlackboard: false }
    ];

    leftRooms.forEach(room => {
      // 교실 벽
      g.fillStyle(room.color, 0.08);
      g.fillRoundedRect(80, room.y, 310, 150, 8);
      g.lineStyle(1, room.color, 0.3);
      g.strokeRoundedRect(80, room.y, 310, 150, 8);

      // 라벨
      this.add.text(235, room.y - 5, room.label, {
        fontSize: '6px', color: Phaser.Display.Color.IntegerToColor(room.color).rgba,
        align: 'center', lineSpacing: 1
      }).setOrigin(0.5).setDepth(2);

      if (room.hasBlackboard) {
        // 칠판 (이 방이 메인 교실)
        g.fillStyle(0x2F4F2F, 0.7);
        g.fillRect(110, room.y + 15, 250, 40);
        g.lineStyle(2, 0x8B4513, 0.6);
        g.strokeRect(110, room.y + 15, 250, 40);

        // 칠판 글씨
        this.add.text(235, room.y + 25, 'ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ', {
          fontSize: '10px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2);
        this.add.text(235, room.y + 42, 'ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ', {
          fontSize: '9px', color: '#FFD700'
        }).setOrigin(0.5).setDepth(2);

        // 교탁
        g.fillStyle(0x6A5ACD, 0.4);
        g.fillRoundedRect(180, room.y + 65, 110, 25, 4);
      }

      // 학생 테이블 (2×2)
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const tx = 120 + col * 140;
          const ty = room.y + (room.hasBlackboard ? 100 : 50) + row * 55;
          g.fillStyle(0x8B6914, 0.4);
          g.fillRoundedRect(tx, ty, 90, 30, 3);
          // 의자
          g.fillStyle(room.color, 0.2);
          g.fillCircle(tx + 25, ty + 40, 8);
          g.fillCircle(tx + 65, ty + 40, 8);
        }
      }
    });

    // ── 우측 교실들 ──
    const rightRooms = [
      { y: 100, color: 0xFFD700, label: '옐로교실\nYellow Room' },
      { y: 280, color: 0xDA70D6, label: '퍼플교실\nPurple Room' },
      { y: 440, color: 0xFF8C00, label: '오렌지교실\nOrange Room' }
    ];

    rightRooms.forEach(room => {
      g.fillStyle(room.color, 0.08);
      g.fillRoundedRect(610, room.y, 310, 150, 8);
      g.lineStyle(1, room.color, 0.3);
      g.strokeRoundedRect(610, room.y, 310, 150, 8);

      this.add.text(765, room.y - 5, room.label, {
        fontSize: '6px', color: Phaser.Display.Color.IntegerToColor(room.color).rgba,
        align: 'center', lineSpacing: 1
      }).setOrigin(0.5).setDepth(2);

      // 학생 테이블 (2×2)
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          const tx = 640 + col * 140;
          const ty = room.y + 40 + row * 55;
          g.fillStyle(0x8B6914, 0.4);
          g.fillRoundedRect(tx, ty, 90, 30, 3);
          g.fillStyle(room.color, 0.2);
          g.fillCircle(tx + 25, ty + 40, 8);
          g.fillCircle(tx + 65, ty + 40, 8);
        }
      }

      // 화이트보드
      g.fillStyle(0xFFFFFF, 0.4);
      g.fillRect(640, room.y + 10, 200, 25);
      g.lineStyle(1, 0xBBBBBB, 0.4);
      g.strokeRect(640, room.y + 10, 200, 25);
    });

    // ══════════════════════════════════════
    // 교재 판매 코너 (복도 끝 상단 우측)
    // ══════════════════════════════════════
    g.fillStyle(0xFF69B4, 0.08);
    g.fillRoundedRect(800, 600, 120, 80, 6);
    g.fillStyle(0x8B4513, 0.4);
    g.fillRect(810, 620, 20, 50);
    g.fillRect(850, 620, 20, 50);
    g.fillRect(890, 620, 20, 50);
    this.add.text(860, 610, '📚 교재', {
      fontSize: '6px', color: '#FF69B4'
    }).setOrigin(0.5).setDepth(2);

    // ══════════════════════════════════════
    // 복도 바닥 라인
    // ══════════════════════════════════════
    g.lineStyle(1, 0xDDDDDD, 0.1);
    for (let i = 0; i < 10; i++) {
      g.lineBetween(400, 100 + i * 50, 600, 100 + i * 50);
    }
  }
}
