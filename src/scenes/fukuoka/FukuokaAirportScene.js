import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// FukuokaAirportScene — 후쿠오카공항 국제선 터미널
//  2025년 3월 리뉴얼 그랜드오픈 기반 (1600×1200)
//
//  실제 배치 참조:
//  ─ 1F 도착층: 입국장 → 도착로비(중앙) → Access Hall(남쪽, 4000㎡)
//  ─ Access Hall: 로손(Lawson), 요시노야, Tully's Coffee, 안내소, 환전소
//  ─ 버스 플랫폼: 남쪽 가장자리 (국내선 셔틀, 시내버스)
//  ─ 3F 출발층: 체크인카운터, 면세점(6000㎡), YAGURA, 하카타 푸드홀
//  ─ 탑승 게이트: 50A~59번 (3F)
//  ─ B2F: 지하철 후쿠오카공항역 (공항선)
//  ─ 국내선↔국제선 연결 셔틀버스: 동쪽
// ============================================================

export default class FukuokaAirportScene extends BaseWorldScene {
  constructor() { super('FukuokaAirportScene'); }

  create() {
    this.worldWidth = 1600;
    this.worldHeight = 1200;

    gameState.setRegion('fukuoka');

    this.createWorld({
      startX: 800, startY: 500,
      tiles: 'airport',
      npcs: [
        // ── 도착 로비 안내소 ──
        { x: 800, y: 350, texture: 'shop', name_ko: '안내소', name_ja: '案内所',
          greeting_ko: '후쿠오카 국제공항에 오신 걸 환영합니다!\n무엇을 도와드릴까요?',
          greeting_ja: '福岡国際空港へようこそ！\n何かお手伝いしましょうか？' },

        // ── Access Hall 환전소 ──
        { x: 500, y: 700, texture: 'shop', name_ko: '환전소', name_ja: '両替所',
          greeting_ko: '환전하시겠어요?\n원화, 달러, 유로 다 가능합니다.',
          greeting_ja: '両替されますか？\nウォン、ドル、ユーロ対応しています。' },

        // ── Access Hall 로손 직원 ──
        { x: 300, y: 750, texture: 'shop', name_ko: '로손 (Lawson)', name_ja: 'ローソン',
          greeting_ko: '어서오세요! 로손입니다.\n삼각김밥, 음료수 있습니다~',
          greeting_ja: 'いらっしゃいませ！ローソンです。\nおにぎり、飲み物ございます～' },

        // ── Access Hall Tully's Coffee ──
        { x: 1100, y: 700, texture: 'shop', name_ko: "Tully's Coffee", name_ja: 'タリーズコーヒー',
          greeting_ko: '카페 들르셨어요?\n비행 전에 따뜻한 커피 한잔 어때요?',
          greeting_ja: 'カフェにお立ち寄りですか？\nフライト前に温かいコーヒーはいかがですか？' },

        // ── Access Hall 요시노야 ──
        { x: 700, y: 800, texture: 'shop', name_ko: '요시노야', name_ja: '吉野家',
          greeting_ko: '요시노야입니다! 규동 드시고 가세요~',
          greeting_ja: '吉野家です！牛丼いかがですか～' },

        // ── 버스 안내 ──
        { x: 800, y: 950, texture: 'shop', name_ko: '버스 안내', name_ja: 'バス案内',
          greeting_ko: '공항 버스 안내소입니다.\n하카타역, 텐진까지 버스 운행 중이에요.',
          greeting_ja: '空港バス案内所です。\n博多駅、天神までバス運行中です。' },

        // ── 국내선 셔틀 안내 (동쪽) ──
        { x: 1400, y: 500, texture: 'shop', name_ko: '셔틀버스', name_ja: 'シャトルバス',
          greeting_ko: '국내선 터미널행 무료 셔틀버스입니다.\n약 10분 간격으로 운행합니다.',
          greeting_ja: '国内線ターミナル行き無料シャトルバスです。\n約10分間隔で運行しています。' }
      ],
      buildings: [
        // 입국장 (상단 좌우)
        { x: 400, y: 200, texture: 'building_airport', name_ko: '입국장 / 入国ゲート' },
        { x: 1200, y: 200, texture: 'building_airport', name_ko: '입국장 / 入国ゲート' }
      ]
    });

    // ── 3F 국제선 탑승구역 → 국제맵 ──
    this.createDepartureGate(800, 100,
      '3F 국제선 출발 / 出発', '3F 国際線搭乗口');

    // ── B2F 지하철역 → 후쿠오카 광역맵 ──
    this.createSubwayEntrance(800, 1100, 'FukuokaMetroScene', 'fukuoka_airport',
      '지하철역 (B2F) 🚇', '地下鉄駅 (福岡空港駅)');

    // ── 공항 내부 상세 오버레이 ──
    this.addAirportOverlay();

    this.showSceneTitle('후쿠오카 국제공항', '福岡国際空港',
      '국제선 터미널 1F 도착층', '#4682B4');

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  addAirportOverlay() {
    const g = this.add.graphics().setDepth(0.5);
    const s = this.uiScale;

    // ── 터미널 건물 외곽 ──
    g.fillStyle(0xD4D4D4, 0.12);
    g.fillRoundedRect(100, 130, 1400, 950, 15);
    g.lineStyle(2, 0x4682B4, 0.25);
    g.strokeRoundedRect(100, 130, 1400, 950, 15);

    // ── 입국심사/도착 게이트 구역 (상단) ──
    g.fillStyle(0x4682B4, 0.08);
    g.fillRoundedRect(200, 150, 1200, 150, 8);

    // ── 도착 로비 (중앙 개방 공간) ──
    g.fillStyle(0xFFFFFF, 0.05);
    g.fillRoundedRect(200, 320, 1200, 250, 8);

    // ── Access Hall (남쪽, 큰 상업 구역) ──
    g.fillStyle(0xFFD700, 0.06);
    g.fillRoundedRect(150, 620, 1300, 280, 12);
    g.lineStyle(1, 0xFFD700, 0.2);
    g.strokeRoundedRect(150, 620, 1300, 280, 12);

    // Access Hall 내부 구획
    // 로손 (좌측)
    g.fillStyle(0x0068B7, 0.12);
    g.fillRoundedRect(200, 700, 180, 80, 6);
    // Tully's (우측)
    g.fillStyle(0x8B4513, 0.12);
    g.fillRoundedRect(1000, 650, 250, 90, 6);
    // 요시노야 (중앙)
    g.fillStyle(0xFF6600, 0.10);
    g.fillRoundedRect(600, 760, 200, 70, 6);
    // 환전소 (중앙좌측)
    g.fillStyle(0xFFD700, 0.15);
    g.fillRoundedRect(440, 680, 120, 50, 4);

    // ── 버스 플랫폼 (남쪽 하단) ──
    g.fillStyle(0x2E8B57, 0.08);
    g.fillRoundedRect(200, 920, 1200, 80, 6);
    // 버스 정류장 표시
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x2E8B57, 0.2);
      g.fillRoundedRect(280 + i * 280, 940, 120, 40, 4);
    }

    // ── 국내선 셔틀 (동쪽) ──
    g.fillStyle(0x4169E1, 0.1);
    g.fillRoundedRect(1350, 420, 120, 180, 8);

    // ── 중앙 통로 ──
    g.fillStyle(0xBBBBBB, 0.08);
    g.fillRect(720, 300, 160, 600);

    // ── 라벨 텍스트 ──
    const labelStyle = (color) => ({
      fontSize: `${Math.round(8 * s)}px`, color,
      backgroundColor: '#00000044', padding: { x: 4, y: 2 }
    });

    this.add.text(800, 220, '입국심사 / 入国審査', labelStyle('#4682B4')).setOrigin(0.5).setDepth(2);
    this.add.text(800, 420, '도착 로비 / 到着ロビー', {
      fontSize: `${Math.round(10 * s)}px`, color: '#ffffff',
      backgroundColor: '#00000044', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(2);

    // Access Hall 라벨
    this.add.text(800, 635, '── Access Hall (4,000㎡) ──', {
      fontSize: `${Math.round(9 * s)}px`, color: '#FFD700',
      backgroundColor: '#00000055', padding: { x: 8, y: 3 }
    }).setOrigin(0.5).setDepth(2);

    // 매장 라벨
    this.add.text(290, 690, '🏪 Lawson', {
      fontSize: `${Math.round(7 * s)}px`, color: '#0068B7'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(1125, 640, '☕ Tully\'s Coffee', {
      fontSize: `${Math.round(7 * s)}px`, color: '#8B4513'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(700, 750, '🍚 吉野家', {
      fontSize: `${Math.round(7 * s)}px`, color: '#FF6600'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(500, 670, '💱 両替', {
      fontSize: `${Math.round(7 * s)}px`, color: '#FFD700'
    }).setOrigin(0.5).setDepth(2);

    // 버스정류장
    this.add.text(800, 925, '🚌 버스 플랫폼 / バスプラットフォーム', labelStyle('#2E8B57')).setOrigin(0.5).setDepth(2);

    // 셔틀버스
    this.add.text(1410, 410, '🚌 국내선\nシャトル', {
      fontSize: `${Math.round(7 * s)}px`, color: '#4169E1', align: 'center'
    }).setOrigin(0.5).setDepth(2);

    // 3F / B2F 안내
    this.add.text(800, 80, '↑ 3F 출발층 (면세점 6,000㎡ / YAGURA) / 出発階', {
      fontSize: `${Math.round(9 * s)}px`, color: '#4682B4',
      backgroundColor: '#00000066', padding: { x: 8, y: 3 }
    }).setOrigin(0.5).setDepth(1);

    this.add.text(800, 1060, '↓ B2F 지하철 (福岡空港駅) / 地下鉄', {
      fontSize: `${Math.round(9 * s)}px`, color: '#2E8B57',
      backgroundColor: '#00000066', padding: { x: 8, y: 3 }
    }).setOrigin(0.5).setDepth(1);
  }
}
