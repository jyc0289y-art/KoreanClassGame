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

    // ── 스폰 포인트: 지하철역에서 복귀 시 역 근처 스폰 ──
    this.stationSpawnPoints = {
      fukuoka_airport: { x: 800, y: 1050 }
    };

    // ── 위성뷰 스타일 지형 렌더링 ──
    this.createTerrainGraphics({
      baseColor: 0x4a8a3a,   // 공항 외부: 잔디/녹지
      landUse: [
        // 활주로 방향 (북쪽 상단)
        { x: 0, y: 0, w: 1600, h: 80, color: 0x3a3a3a },
        // 에이프런 (항공기 주기장)
        { x: 200, y: 80, w: 1200, h: 40, color: 0x505050 },
        // 터미널 건물 외벽 (전체)
        { x: 80, y: 120, w: 1440, h: 900, color: 0xd4cec6, radius: 10 },
        // 입국심사 구역 (상단)
        { x: 160, y: 140, w: 1280, h: 170, color: 0xc0c8d4 },
        // 도착 로비 (중앙)
        { x: 160, y: 320, w: 1280, h: 280, color: 0xe4e0dc },
        // Access Hall (상업 구역, 따뜻한 톤)
        { x: 130, y: 610, w: 1340, h: 300, color: 0xe8dcc8, radius: 8 },
        // 버스 플랫폼 (하단)
        { x: 160, y: 920, w: 1280, h: 90, color: 0xb8c8b8 },
        // 외부 도로/주차장 (남쪽)
        { x: 0, y: 1020, w: 1600, h: 180, color: 0x555555 },
        // 국내선 셔틀 (동쪽)
        { x: 1360, y: 380, w: 140, h: 220, color: 0xc0d0e0, radius: 6 },
      ],
      roads: [
        // 중앙 대형 통로 (남북)
        { x: 720, y: 310, w: 160, h: 600, color: 0xc0bab0, sidewalk: false },
        // 1F 동서 연결 통로
        { x: 160, y: 310, w: 1280, h: 20, color: 0xc0bab0, sidewalk: false },
        { x: 160, y: 600, w: 1280, h: 16, color: 0xc0bab0, sidewalk: false },
        // 외부 도로 (공항진입로)
        { x: 0, y: 1080, w: 1600, h: 80, color: 0x555555, type: 'major', sidewalkWidth: 10 },
        // 외부 도로 (중앙 진입)
        { x: 720, y: 1010, w: 160, h: 190, color: 0x555555, sidewalk: false },
      ],
      blocks: [
        // Access Hall 내 상점 구획 (Lawson, Tully's 등)
        { x: 180, y: 660, w: 250, h: 200, density: 'medium',
          palette: [0x0068B7, 0x4088c7, 0x6098d7, 0x3078b7], shadow: false },
        { x: 550, y: 700, w: 300, h: 180, density: 'medium',
          palette: [0xFF6600, 0xe87730, 0xd06020, 0xc85010], shadow: false },
        { x: 950, y: 640, w: 350, h: 220, density: 'medium',
          palette: [0x8B4513, 0x9B5523, 0x7B3503, 0xa06533], shadow: false },
      ],
      vegetation: [
        // 터미널 외부 녹지 (좌측)
        { type: 'park', x: 0, y: 120, w: 70, h: 900, density: 0.12, radiusRange: [5, 12] },
        // 터미널 외부 녹지 (우측)
        { type: 'park', x: 1530, y: 120, w: 70, h: 900, density: 0.12, radiusRange: [5, 12] },
        // 외부 가로수 (남쪽)
        { type: 'streetTrees', x: 80, y: 1020, dir: 'h', length: 1440, spacing: 55, radius: 7 },
        // 실내 관엽식물 (도착 로비)
        { type: 'streetTrees', x: 250, y: 480, dir: 'h', length: 400, spacing: 120, radius: 4 },
        { type: 'streetTrees', x: 950, y: 480, dir: 'h', length: 400, spacing: 120, radius: 4 },
      ]
    });

    this.createWorld({
      startX: 800, startY: 500,
      tiles: '__terrain__',
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
    const g = this.add.graphics().setDepth(1.8);
    const s = this.uiScale;

    // ── 터미널 외곽선 ──
    g.lineStyle(3, 0x4682B4, 0.5);
    g.strokeRoundedRect(80, 120, 1440, 900, 10);

    // ── 입국심사 구역 경계 ──
    g.lineStyle(1, 0x4682B4, 0.3);
    g.strokeRect(160, 140, 1280, 170);

    // ── Access Hall 경계 ──
    g.lineStyle(2, 0xFFD700, 0.35);
    g.strokeRoundedRect(130, 610, 1340, 300, 8);

    // Access Hall 내부 구획
    // 로손 (좌측)
    g.fillStyle(0x0068B7, 0.2);
    g.fillRoundedRect(200, 700, 180, 80, 6);
    g.lineStyle(1, 0x0068B7, 0.4);
    g.strokeRoundedRect(200, 700, 180, 80, 6);
    // Tully's (우측)
    g.fillStyle(0x8B4513, 0.2);
    g.fillRoundedRect(1000, 650, 250, 90, 6);
    g.lineStyle(1, 0x8B4513, 0.4);
    g.strokeRoundedRect(1000, 650, 250, 90, 6);
    // 요시노야 (중앙)
    g.fillStyle(0xFF6600, 0.18);
    g.fillRoundedRect(600, 760, 200, 70, 6);
    g.lineStyle(1, 0xFF6600, 0.4);
    g.strokeRoundedRect(600, 760, 200, 70, 6);
    // 환전소
    g.fillStyle(0xFFD700, 0.25);
    g.fillRoundedRect(440, 680, 120, 50, 4);
    g.lineStyle(1, 0xFFD700, 0.5);
    g.strokeRoundedRect(440, 680, 120, 50, 4);

    // ── 버스 정류장 ──
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x2E8B57, 0.3);
      g.fillRoundedRect(280 + i * 280, 938, 120, 40, 4);
      g.lineStyle(1, 0x2E8B57, 0.5);
      g.strokeRoundedRect(280 + i * 280, 938, 120, 40, 4);
    }

    // ── 국내선 셔틀 구역 경계 ──
    g.lineStyle(1, 0x4169E1, 0.4);
    g.strokeRoundedRect(1360, 380, 140, 220, 6);

    // ── 라벨 텍스트 ──
    const labelStyle = (color) => ({
      fontSize: `${Math.round(9 * s)}px`, color,
      backgroundColor: '#00000066', padding: { x: 5, y: 2 }
    });

    this.add.text(800, 220, '입국심사 / 入国審査', labelStyle('#4682B4')).setOrigin(0.5).setDepth(2);
    this.add.text(800, 420, '도착 로비 / 到着ロビー', {
      fontSize: `${Math.round(11 * s)}px`, color: '#ffffff',
      backgroundColor: '#00000066', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setDepth(2);

    // Access Hall 라벨
    this.add.text(800, 625, '── Access Hall (4,000㎡) ──', {
      fontSize: `${Math.round(10 * s)}px`, color: '#FFD700',
      backgroundColor: '#00000077', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(2);

    // 매장 라벨
    this.add.text(290, 690, '🏪 Lawson', {
      fontSize: `${Math.round(8 * s)}px`, color: '#4088c7'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(1125, 640, '☕ Tully\'s Coffee', {
      fontSize: `${Math.round(8 * s)}px`, color: '#a06533'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(700, 750, '🍚 吉野家', {
      fontSize: `${Math.round(8 * s)}px`, color: '#FF6600'
    }).setOrigin(0.5).setDepth(2);
    this.add.text(500, 670, '💱 両替', {
      fontSize: `${Math.round(8 * s)}px`, color: '#FFD700'
    }).setOrigin(0.5).setDepth(2);

    // 버스정류장
    this.add.text(800, 925, '🚌 バスプラットフォーム', labelStyle('#2E8B57')).setOrigin(0.5).setDepth(2);

    // 셔틀버스
    this.add.text(1430, 410, '🚌 국내선\nシャトル', {
      fontSize: `${Math.round(8 * s)}px`, color: '#4169E1', align: 'center'
    }).setOrigin(0.5).setDepth(2);

    // 3F / B2F 안내
    this.add.text(800, 60, '↑ 3F 출발층 (면세점 6,000㎡ / YAGURA) / 出発階', {
      fontSize: `${Math.round(10 * s)}px`, color: '#4682B4',
      backgroundColor: '#00000088', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(2);

    this.add.text(800, 1060, '↓ B2F 지하철 (福岡空港駅) / 地下鉄', {
      fontSize: `${Math.round(10 * s)}px`, color: '#2E8B57',
      backgroundColor: '#00000088', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(2);
  }
}
