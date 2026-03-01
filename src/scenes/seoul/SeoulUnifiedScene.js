import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// SeoulUnifiedScene v3 — 실제 지리 기반 서울 통합맵 (14400×10800)
//
//  실제 지도를 참조한 한강 S-커브, 산악 지형, 14개 다리,
//  주요 도로망, 50개 랜드마크, 8개 구역
//  ~400px/km (36km × 27km)
// ============================================================

export default class SeoulUnifiedScene extends BaseWorldScene {
  constructor() { super('SeoulUnifiedScene'); }

  create() {
    this.worldWidth = 14400;
    this.worldHeight = 10800;
    gameState.setRegion('seoul');

    // ── 8개 구역 경계 정의 ──
    this._districts = [
      { id: 'hongdae', name: '홍대/마포 弘大', sub: 'ホンデ · Hongdae', color: '#DA70D6',
        x: 1200, y: 2400, w: 2800, h: 2400 },
      { id: 'jongno', name: '종로/광화문 鍾路', sub: 'チョンノ · Jongno', color: '#FFD700',
        x: 4500, y: 1500, w: 4000, h: 1700 },
      { id: 'myeongdong', name: '명동/남산 明洞', sub: 'ミョンドン · Myeongdong', color: '#FF69B4',
        x: 5800, y: 3200, w: 2200, h: 1600 },
      { id: 'itaewon', name: '이태원/용산 梨泰院', sub: 'イテウォン · Itaewon', color: '#FF8C00',
        x: 5200, y: 4200, w: 2300, h: 800 },
      { id: 'yeouido', name: '여의도 汝矣島', sub: 'ヨイド · Yeouido', color: '#4169E1',
        x: 2600, y: 5000, w: 1600, h: 700 },
      { id: 'gangnam', name: '강남/서초 江南', sub: 'カンナム · Gangnam', color: '#00CED1',
        x: 5500, y: 5800, w: 4000, h: 2700 },
      { id: 'seongsu', name: '성수/뚝섬 聖水', sub: 'ソンス · Seongsu', color: '#32CD32',
        x: 8500, y: 2500, w: 3000, h: 2500 },
      { id: 'jamsil', name: '잠실/송파 蠶室', sub: 'チャムシル · Jamsil', color: '#FF4500',
        x: 9500, y: 5800, w: 3000, h: 3200 }
    ];
    this._lastWelcomeDistrict = null;

    // ── 스폰 포인트 ──
    this.stationSpawnPoints = {
      hongdae:    { x: 2800, y: 3800 },
      jongno:     { x: 6000, y: 2600 },
      myeongdong: { x: 6600, y: 3800 },
      itaewon:    { x: 6400, y: 4500 },
      gangnam:    { x: 7000, y: 6800 },
      seongsu:    { x: 9500, y: 3500 },
      jamsil:     { x: 10800, y: 7000 },
      yeouido:    { x: 3400, y: 5400 },
      incheon_airport: { x: 6000, y: 2800 }
    };

    this.placeSpawnPoints = {
      OliveYoungScene:  { x: 6600, y: 3500 },
      HiKRGroundScene:  { x: 6200, y: 3300 },
      HotelScene:       { x: 7000, y: 3600 },
      RestaurantScene:  { x: 7200, y: 6600 }
    };

    this.createWorld({
      startX: 6000, startY: 2800,
      tiles: '__terrain__',
      npcs: [],
      buildings: []
    });

    // ── 지형 렌더링 (v3) ──
    this.drawTerrain();

    // ── 다리 14개 ──
    this.drawBridges();

    // ── 8개 구역 건물 + NPC + 지하철역 ──
    this.setupHongdaeDistrict();
    this.setupJongnoDistrict();
    this.setupMyeongdongDistrict();
    this.setupItaewonDistrict();
    this.setupYeouidoDistrict();
    this.setupGangnamDistrict();
    this.setupSeongsuDistrict();
    this.setupJamsilDistrict();

    // ── 지역 라벨 ──
    this.addDistrictLabels();

    this.showSceneTitle('서울', 'ソウル · Seoul', 'Ch.1-2 서울 통합맵 (실제 지리)', '#FF69B4');
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  update() {
    super.update();
    if (!this.player || !this.player.body) return;
    const px = this.player.x, py = this.player.y;
    for (const d of this._districts) {
      if (px >= d.x && px <= d.x + d.w && py >= d.y && py <= d.y + d.h) {
        this.showDistrictWelcome(d.name, d.sub, d.color);
        break;
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // 지형 렌더링 v3 — 실제 지리 기반
  // ══════════════════════════════════════════════════════
  drawTerrain() {
    this.createTerrainGraphics({
      baseColor: 0x7a9a6a,

      landUse: [
        // ── 산악 지형 ──
        { x: 3500, y: 0, w: 4500, h: 1200, color: 0x1a4a1a, alpha: 1.0, border: false },
        { x: 4500, y: 900, w: 2300, h: 1300, color: 0x2a5a2a, alpha: 0.9, border: false },
        { x: 6200, y: 3400, w: 1400, h: 1200, color: 0x2a6a2a, alpha: 0.85, border: false },
        { x: 12500, y: 1800, w: 1900, h: 3000, color: 0x1a4a1a, alpha: 0.9, border: false },
        { x: 4000, y: 9000, w: 2000, h: 1800, color: 0x1a4a1a, alpha: 0.9, border: false },
        { x: 0, y: 0, w: 3500, h: 800, color: 0x2a5a2a, alpha: 0.8, border: false },
        { x: 8000, y: 0, w: 4500, h: 1000, color: 0x2a5a2a, alpha: 0.8, border: false },
        { x: 12500, y: 0, w: 1900, h: 1800, color: 0x2a5a2a, alpha: 0.8, border: false },
        { x: 0, y: 800, w: 1200, h: 4000, color: 0x3a6a3a, alpha: 0.6, border: false },
        { x: 0, y: 7000, w: 2000, h: 3800, color: 0x3a6a3a, alpha: 0.7, border: false },
        { x: 12000, y: 8000, w: 2400, h: 2800, color: 0x3a6a3a, alpha: 0.6, border: false },
        { x: 0, y: 9500, w: 4000, h: 1300, color: 0x3a7a3a, alpha: 0.5, border: false },
        { x: 6000, y: 9500, w: 6000, h: 1300, color: 0x3a7a3a, alpha: 0.5, border: false },

        // ── 한강 둔치 ──
        { x: 0, y: 4750, w: 14400, h: 250, color: 0x6aaa5a, alpha: 0.7, border: false },
        { x: 0, y: 5600, w: 14400, h: 250, color: 0x6aaa5a, alpha: 0.7, border: false },

        // ── 구역별 토지용도 ──
        { x: 1200, y: 2400, w: 2800, h: 1600, color: 0xb8a8b8, alpha: 1.0 },
        { x: 1200, y: 4000, w: 2800, h: 800, color: 0x8a9a80, alpha: 0.9 },
        { x: 4500, y: 1500, w: 4000, h: 1700, color: 0xc0b8a8, alpha: 1.0 },
        { x: 5800, y: 3200, w: 2200, h: 1600, color: 0xc0b0b0, alpha: 1.0 },
        { x: 5200, y: 4200, w: 2300, h: 800, color: 0xb8a898, alpha: 1.0 },
        { x: 2600, y: 5050, w: 1600, h: 650, color: 0xb0b0a8, alpha: 1.0 },
        { x: 5500, y: 5800, w: 4000, h: 2700, color: 0xb0b0a8, alpha: 1.0 },
        { x: 8500, y: 2500, w: 3000, h: 1800, color: 0xa09890, alpha: 1.0 },
        { x: 8500, y: 4300, w: 3000, h: 700, color: 0xb0a088, alpha: 0.9 },
        { x: 9500, y: 5800, w: 3000, h: 3200, color: 0xb0a8a0, alpha: 1.0 },

        // ── 강북/강남 일반 도시 ──
        { x: 1200, y: 1200, w: 3300, h: 1200, color: 0x8a9a7a, alpha: 0.7, border: false },
        { x: 8500, y: 1200, w: 4000, h: 1300, color: 0x8a9a7a, alpha: 0.7, border: false },
        { x: 2000, y: 5800, w: 3500, h: 3000, color: 0x8a9a7a, alpha: 0.6, border: false },
        { x: 9500, y: 9000, w: 3000, h: 1800, color: 0x8a9a7a, alpha: 0.5, border: false },
      ],

      water: [
        // ── 한강 본류 S-커브 ──
        {
          points: [
            [0,5000],[800,4950],[1600,4920],[2400,5050],
            [3200,5200],[3800,5150],[4400,5050],[4800,4900],
            [5400,4820],[5800,4800],[6400,4850],[6800,4950],
            [7400,5100],[7800,5200],[8400,5350],[8800,5400],
            [9400,5480],[10000,5500],[10600,5450],[11200,5380],
            [11800,5320],[12400,5280],[13000,5220],[14400,5150],
            [14400,5600],[13000,5670],[12400,5730],[11800,5770],
            [11200,5830],[10600,5900],[10000,5950],[9400,5930],
            [8800,5850],[8400,5800],[7800,5650],[7400,5550],
            [6800,5400],[6400,5300],[5800,5250],[5400,5270],
            [4800,5350],[4400,5500],[3800,5600],[3200,5650],
            [2400,5500],[1600,5370],[800,5400],[0,5450]
          ],
          color: 0x2a5a8a, alpha: 1.0,
          bank: { width: 25, color: 0x8a7a5a, alpha: 0.6 }
        },
        { points: [
            [0,5150],[3200,5350],[6400,5000],[9600,5600],[14400,5350],
            [14400,5420],[9600,5670],[6400,5080],[3200,5430],[0,5230]
          ], color: 0x4a8aba, alpha: 0.25 },

        // ── 여의도 북수로 ──
        { points: [
            [2400,5050],[2600,5020],[3200,5000],[3800,5010],[4200,5050],
            [4200,5100],[3800,5060],[3200,5050],[2600,5070],[2400,5100]
          ], color: 0x2a5a8a, alpha: 0.9 },

        // ── 탄천 ──
        { points: [
            [9150,10800],[9200,9800],[9250,9000],[9300,8200],
            [9350,7400],[9380,6600],[9400,5900],
            [9500,5900],[9480,6600],[9450,7400],
            [9400,8200],[9350,9000],[9300,9800],[9250,10800]
          ], color: 0x2a5a8a, alpha: 1.0,
          bank: { width: 15, color: 0x7a8a5a, alpha: 0.5 } },

        // ── 중랑천 ──
        { points: [
            [10450,0],[10500,800],[10550,1600],[10600,2400],
            [10650,3200],[10700,4000],[10750,4800],[10800,5200],
            [10900,5200],[10850,4800],[10800,4000],
            [10750,3200],[10700,2400],[10650,1600],[10600,800],[10550,0]
          ], color: 0x2a5a8a, alpha: 1.0,
          bank: { width: 12, color: 0x7a8a5a, alpha: 0.5 } },

        // ── 양재천 ──
        { points: [
            [6800,9000],[7200,8600],[7600,8200],[8000,7800],
            [8400,7200],[8800,6800],[9000,6500],
            [9060,6540],[8860,6840],[8460,7240],
            [8060,7840],[7660,8240],[7260,8640],[6860,9040]
          ], color: 0x3a6a9a, alpha: 0.9,
          bank: { width: 8, color: 0x7a8a5a, alpha: 0.4 } },

        // ── 청계천 ──
        { points: [
            [5800,2700],[6400,2720],[7000,2740],[7600,2760],
            [8200,2790],[8800,2820],[9400,2860],[10000,2900],[10500,2950],
            [10500,2990],[10000,2940],[9400,2900],[8800,2860],
            [8200,2830],[7600,2800],[7000,2780],[6400,2760],[5800,2740]
          ], color: 0x4a7aaa, alpha: 0.8,
          bank: { width: 6, color: 0x8a9a6a, alpha: 0.4 } },

        // ── 안양천 ──
        { points: [
            [2500,10800],[2450,9800],[2400,8800],[2350,7800],
            [2300,6800],[2250,5800],[2200,5400],
            [2300,5400],[2350,5800],[2400,6800],
            [2450,7800],[2500,8800],[2550,9800],[2600,10800]
          ], color: 0x2a5a8a, alpha: 0.9,
          bank: { width: 10, color: 0x7a8a5a, alpha: 0.5 } },

        // ── 석촌호수 ──
        { points: [
            [10300,7400],[10500,7350],[10700,7400],[10800,7500],
            [10700,7700],[10500,7800],[10300,7700],[10200,7500]
          ], color: 0x3a6a9a, alpha: 0.9 },
      ],

      roads: [
        // === 간선도로 (major 160px) ===
        { x: 4500, y: 2720, w: 5500, h: 160, color: 0x606060, type: 'major' },
        { x: 5720, y: 2000, w: 160, h: 2500, color: 0x606060, type: 'major' },
        { x: 6920, y: 5800, w: 160, h: 3200, color: 0x606060, type: 'major' },
        { x: 6500, y: 6720, w: 3500, h: 160, color: 0x606060, type: 'major' },
        { x: 11000, y: 3120, w: 3400, h: 160, color: 0x606060, type: 'major' },
        { x: 8500, y: 7120, w: 3500, h: 160, color: 0x606060, type: 'major' },
        // === 중로 (medium 100px) ===
        { x: 5000, y: 3120, w: 5000, h: 100, color: 0x686868, type: 'medium' },
        { x: 5000, y: 3520, w: 5000, h: 100, color: 0x686868, type: 'medium' },
        { x: 7720, y: 5500, w: 100, h: 1500, color: 0x686868, type: 'medium' },
        { x: 10420, y: 5800, w: 100, h: 3200, color: 0x686868, type: 'medium' },
        { x: 2720, y: 2500, w: 100, h: 2300, color: 0x686868, type: 'medium' },
        { x: 6420, y: 3000, w: 100, h: 1200, color: 0x686868, type: 'medium' },
        { x: 5500, y: 4120, w: 2000, h: 100, color: 0x686868, type: 'medium' },
        { x: 5520, y: 3600, w: 100, h: 1200, color: 0x686868, type: 'medium' },
        { x: 9000, y: 8420, w: 3000, h: 100, color: 0x686868, type: 'medium' },
        // === 소로 (60px) ===
        { x: 1200, y: 3200, w: 2800, h: 60, color: 0x707070 },
        { x: 1200, y: 3800, w: 2800, h: 60, color: 0x707070 },
        { x: 1800, y: 2400, w: 60, h: 2400, color: 0x707070 },
        { x: 3200, y: 2400, w: 60, h: 2400, color: 0x707070 },
        { x: 5200, y: 2000, w: 60, h: 1200, color: 0x707070 },
        { x: 6800, y: 1500, w: 60, h: 1700, color: 0x707070 },
        { x: 7800, y: 1500, w: 60, h: 1700, color: 0x707070 },
        { x: 4500, y: 2200, w: 4000, h: 60, color: 0x707070 },
        { x: 5800, y: 3800, w: 2200, h: 60, color: 0x707070 },
        { x: 6800, y: 3200, w: 60, h: 1600, color: 0x707070 },
        { x: 5500, y: 6200, w: 4000, h: 60, color: 0x707070 },
        { x: 5500, y: 7600, w: 4000, h: 60, color: 0x707070 },
        { x: 6200, y: 5800, w: 60, h: 2700, color: 0x707070 },
        { x: 8200, y: 5800, w: 60, h: 2700, color: 0x707070 },
        { x: 8800, y: 5800, w: 60, h: 2700, color: 0x707070 },
        { x: 8500, y: 3200, w: 3000, h: 60, color: 0x707070 },
        { x: 8500, y: 4000, w: 3000, h: 60, color: 0x707070 },
        { x: 9800, y: 2500, w: 60, h: 2500, color: 0x707070 },
        { x: 9500, y: 6800, w: 3000, h: 60, color: 0x707070 },
        { x: 9500, y: 7800, w: 3000, h: 60, color: 0x707070 },
        { x: 11200, y: 5800, w: 60, h: 3200, color: 0x707070 },
      ],

      crosswalks: [
        { x: 5720, y: 2710, w: 160, dir: 'v' },
        { x: 6920, y: 6710, w: 160, dir: 'v' },
        { x: 2720, y: 2710, w: 100, dir: 'v' },
        { x: 6420, y: 3110, w: 100, dir: 'v' },
      ],

      blocks: [
        // 홍대
        { x: 1220, y: 2420, w: 560, h: 760, density: 'medium', palette: [0xb098c0, 0xc0a0b0, 0xa8a0c0, 0xb8a8a0] },
        { x: 1820, y: 2420, w: 880, h: 760, density: 'medium', palette: [0xb098c0, 0xc0a0b0, 0xa8a0c0] },
        { x: 2840, y: 2420, w: 1140, h: 760, density: 'medium', palette: [0xb098c0, 0xa898b0, 0xc0a0a0] },
        { x: 1220, y: 3280, w: 1480, h: 500, density: 'low', palette: [0x9a8a7a, 0xa89888, 0x8a8878] },
        { x: 2840, y: 3280, w: 1140, h: 500, density: 'low', palette: [0x9a8a7a, 0xa89888] },
        { x: 1220, y: 3880, w: 2760, h: 900, density: 'low', palette: [0x8a9a7a, 0x9a8a7a] },
        // 종로
        { x: 4520, y: 1520, w: 660, h: 660, density: 'high', palette: [0xc8b8a0, 0xb8a890, 0xd0c0a8] },
        { x: 5240, y: 1520, w: 1500, h: 660, density: 'high', palette: [0xc8b8a0, 0xb8a890, 0xd0c0a8, 0xc0b098] },
        { x: 6880, y: 1520, w: 900, h: 660, density: 'high', palette: [0xc0b098, 0xb8a890] },
        { x: 7840, y: 1520, w: 640, h: 660, density: 'medium', palette: [0xb0a888, 0xa89880] },
        { x: 4520, y: 2280, w: 3960, h: 400, density: 'medium', palette: [0xb8a890, 0xc0b098, 0xa89880] },
        // 명동
        { x: 5820, y: 3240, w: 580, h: 540, density: 'high', palette: [0xc0a8a8, 0xb8a0a0, 0xd0b0b0] },
        { x: 6440, y: 3240, w: 580, h: 540, density: 'high', palette: [0xc0a8a8, 0xb8a0a0, 0xd0b0b0, 0xb8b0a8] },
        { x: 5820, y: 3880, w: 2160, h: 900, density: 'medium', palette: [0xb8a8a0, 0xa89890, 0xc0b0a8] },
        // 강남
        { x: 5520, y: 5820, w: 680, h: 880, density: 'low', palette: [0xb0b0b0, 0xc0c0c0, 0xa8a8a8] },
        { x: 6280, y: 5820, w: 620, h: 880, density: 'low', palette: [0xb0b0b0, 0xc0c0c0] },
        { x: 7100, y: 5820, w: 600, h: 880, density: 'low', palette: [0xb0b0b0, 0xa8a8a8] },
        { x: 7760, y: 5820, w: 420, h: 880, density: 'medium', palette: [0xb0b0a8, 0xa8a8a0, 0xc0c0b8] },
        { x: 8260, y: 5820, w: 520, h: 880, density: 'medium', palette: [0xb0b0a8, 0xa8a8a0] },
        { x: 8860, y: 5820, w: 620, h: 880, density: 'medium', palette: [0xb0b0a8, 0xa8a8a0] },
        { x: 5520, y: 6900, w: 3960, h: 780, density: 'medium', palette: [0xb0b0a8, 0xa8a8a0, 0xb8b8b0] },
        { x: 5520, y: 7680, w: 3960, h: 800, density: 'low', palette: [0x98a890, 0x90a088] },
        // 성수
        { x: 8520, y: 2520, w: 1260, h: 660, density: 'medium', palette: [0x908880, 0xa09890, 0x989088] },
        { x: 9840, y: 2520, w: 1640, h: 660, density: 'medium', palette: [0x908880, 0xa09890, 0x887870] },
        { x: 8520, y: 3280, w: 2960, h: 700, density: 'medium', palette: [0xb09878, 0xa89070, 0xc0a888] },
        { x: 8520, y: 4080, w: 2960, h: 900, density: 'low', palette: [0xa09070, 0xb0a080] },
        // 잠실
        { x: 9520, y: 5820, w: 880, h: 960, density: 'medium', palette: [0xa8a0a0, 0xb0a8a0, 0xb8b0a8] },
        { x: 10480, y: 5820, w: 700, h: 960, density: 'medium', palette: [0xa8a0a0, 0xb0a8a0] },
        { x: 11240, y: 5820, w: 1240, h: 960, density: 'low', palette: [0xa09890, 0xb0a8a0] },
        { x: 9520, y: 6880, w: 2960, h: 880, density: 'medium', palette: [0xa89898, 0xb0a0a0, 0xa8a0a0] },
        { x: 9520, y: 7880, w: 2960, h: 1100, density: 'low', palette: [0x989088, 0xa09890] },
      ],

      vegetation: [
        { type: 'park', x: 3500, y: 0, w: 4500, h: 1100, density: 0.5, radiusRange: [15, 35] },
        { type: 'park', x: 4600, y: 1000, w: 2200, h: 1100, density: 0.35, radiusRange: [12, 28] },
        { type: 'park', x: 6300, y: 3500, w: 1200, h: 1000, density: 0.4, radiusRange: [14, 30] },
        { type: 'park', x: 12600, y: 1900, w: 1700, h: 2800, density: 0.4, radiusRange: [15, 32] },
        { type: 'park', x: 4100, y: 9100, w: 1800, h: 1600, density: 0.4, radiusRange: [15, 32] },
        { type: 'park', x: 9000, y: 3600, w: 600, h: 500, density: 0.35, radiusRange: [12, 25] },
        { type: 'park', x: 11800, y: 7600, w: 800, h: 700, density: 0.3, radiusRange: [12, 25] },
        { type: 'park', x: 3100, y: 5150, w: 500, h: 300, density: 0.3, radiusRange: [10, 20] },
        { type: 'streetTrees', x: 4550, y: 2700, dir: 'h', length: 5400, spacing: 120, radius: 8 },
        { type: 'streetTrees', x: 4550, y: 2900, dir: 'h', length: 5400, spacing: 120, radius: 8 },
        { type: 'streetTrees', x: 5700, y: 2050, dir: 'v', length: 2400, spacing: 100, radius: 9 },
        { type: 'streetTrees', x: 5900, y: 2050, dir: 'v', length: 2400, spacing: 100, radius: 9 },
        { type: 'streetTrees', x: 6900, y: 5850, dir: 'v', length: 3100, spacing: 100, radius: 9 },
        { type: 'streetTrees', x: 7100, y: 5850, dir: 'v', length: 3100, spacing: 100, radius: 9 },
        { type: 'streetTrees', x: 6550, y: 6700, dir: 'h', length: 3400, spacing: 80, radius: 7 },
        { type: 'streetTrees', x: 6550, y: 6900, dir: 'h', length: 3400, spacing: 80, radius: 7 },
        { type: 'streetTrees', x: 2700, y: 2550, dir: 'v', length: 2200, spacing: 80, radius: 8 },
        { type: 'streetTrees', x: 2840, y: 2550, dir: 'v', length: 2200, spacing: 80, radius: 8 },
        { type: 'riverbank', x: 0, y: 4800, dir: 'h', length: 14400 },
        { type: 'riverbank', x: 0, y: 5650, dir: 'h', length: 14400 },
        { type: 'riverbank', x: 5800, y: 2680, dir: 'h', length: 4700 },
        { type: 'riverbank', x: 9350, y: 5950, dir: 'v', length: 4800 },
      ],
    });
  }

  // ══════════════════════════════════════════════════════
  // 한강 다리 14개 — 서→동
  // ══════════════════════════════════════════════════════
  drawBridges() {
    const g = this.add.graphics().setDepth(0.5);

    const hanN = [
      [0,5000],[800,4950],[1600,4920],[2400,5050],[3200,5200],[3800,5150],
      [4400,5050],[4800,4900],[5400,4820],[5800,4800],[6400,4850],[6800,4950],
      [7400,5100],[7800,5200],[8400,5350],[8800,5400],[9400,5480],[10000,5500],
      [10600,5450],[11200,5380],[14400,5150]
    ];
    const hanS = [
      [0,5450],[800,5400],[1600,5370],[2400,5500],[3200,5650],[3800,5600],
      [4400,5500],[4800,5350],[5400,5270],[5800,5250],[6400,5300],[6800,5400],
      [7400,5550],[7800,5650],[8400,5800],[8800,5850],[9400,5930],[10000,5950],
      [10600,5900],[11200,5830],[14400,5600]
    ];

    const iY = (pts, x) => {
      for (let i = 0; i < pts.length - 1; i++) {
        if (x >= pts[i][0] && x <= pts[i+1][0]) {
          const t = (x - pts[i][0]) / (pts[i+1][0] - pts[i][0]);
          return pts[i][1] + t * (pts[i+1][1] - pts[i][1]);
        }
      }
      return pts[pts.length-1][1];
    };

    [
      { x: 1800, n: '성산대교', j: '城山大橋' },
      { x: 2400, n: '양화대교', j: '楊花大橋' },
      { x: 3200, n: '서강대교', j: '西江大橋' },
      { x: 3800, n: '마포대교', j: '麻浦大橋' },
      { x: 4600, n: '원효대교', j: '元曉大橋' },
      { x: 5200, n: '한강대교', j: '漢江大橋' },
      { x: 5800, n: '동작대교', j: '銅雀大橋' },
      { x: 6400, n: '반포대교', j: '盤浦大橋' },
      { x: 7200, n: '한남대교', j: '漢南大橋' },
      { x: 7800, n: '동호대교', j: '東湖大橋' },
      { x: 8600, n: '성수대교', j: '聖水大橋' },
      { x: 9200, n: '영동대교', j: '永東大橋' },
      { x: 9800, n: '청담대교', j: '清潭大橋' },
      { x: 10600, n: '잠실대교', j: '蠶室大橋' },
    ].forEach(b => {
      const tY = iY(hanN, b.x) - 20;
      const bY = iY(hanS, b.x) + 20;
      const w = 140;
      g.fillStyle(0x000000, 0.15);
      g.fillRect(b.x - w/2 + 6, tY + 6, w, bY - tY);
      g.fillStyle(0x707070, 0.9);
      g.fillRect(b.x - w/2, tY, w, bY - tY);
      g.fillStyle(0x999999, 0.6);
      g.fillRect(b.x - w/2, tY, 6, bY - tY);
      g.fillRect(b.x + w/2 - 6, tY, 6, bY - tY);
      g.lineStyle(2, 0xffffff, 0.2);
      for (let dy = tY; dy < bY; dy += 40) {
        g.lineBetween(b.x, dy, b.x, Math.min(dy+20, bY));
      }
      this.add.text(b.x, (tY+bY)/2-8, b.n, {
        fontSize: '10px', color: '#ffffff', backgroundColor: '#00000088', padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(3);
      this.add.text(b.x, (tY+bY)/2+8, b.j, {
        fontSize: '8px', color: '#aaaaaa', backgroundColor: '#00000066', padding: { x: 3, y: 1 }
      }).setOrigin(0.5).setDepth(3);
    });
  }

  // ══════════════════════════════════════════════════════
  // 구역별 배치
  // ══════════════════════════════════════════════════════

  setupHongdaeDistrict() {
    this.createNPCs([
      { x: 2800, y: 3500, texture: 'mission_npc', name_ko: '버스킹 아티스트', name_ja: 'バスキングアーティスト', hasMission: true,
        greeting_ko: '안녕하세요! 홍대 버스킹에 오신 걸 환영해요!\n한국 노래 한 곡 들으실래요?',
        greeting_ja: 'こんにちは！ホンデバスキングへようこそ！\n韓国の歌を一曲聴きませんか？' },
      { x: 2600, y: 2800, texture: 'shop', name_ko: '연남동 카페 직원', name_ja: '延南洞カフェ店員',
        greeting_ko: '연남동 경의선숲길 산책하셨어요?\n커피 한 잔 하세요~',
        greeting_ja: '延南洞キョンウィソンスプキル散歩しましたか？\nコーヒーいかがですか～' },
    ]);
    this.createBuildings([
      { x: 2800, y: 3200, texture: 'building_shop', name_ko: '홍대 거리 / ホンデ通り' },
      { x: 2600, y: 2600, texture: 'building_cafe', name_ko: '연남동 숲길 / 延南洞' },
      { x: 1800, y: 2800, texture: 'building_shop', name_ko: '월드컵경기장 / W杯' },
      { x: 3400, y: 3000, texture: 'building_shop', name_ko: 'K-POP 굿즈샵' },
    ]);
    this.createSubwayEntrance(2800, 3800, 'SeoulMetroScene', 'hongdae', '홍대입구역 🚇', 'ホンデイック駅');
  }

  setupJongnoDistrict() {
    this.createNPCs([
      { x: 5800, y: 2600, texture: 'mission_npc', name_ko: '광화문 해설사', name_ja: '光化門ガイド', hasMission: true,
        greeting_ko: '광화문광장에 오신 걸 환영해요!\n세종대왕과 이순신 장군 동상이 있어요.',
        greeting_ja: '光化門広場へようこそ！\n世宗大王と李舜臣将軍の像がありますよ。' },
      { x: 6000, y: 2400, texture: 'shop', name_ko: '인사동 장인', name_ja: '仁寺洞の匠人',
        greeting_ko: '인사동에서 전통 공예품 구경하세요!',
        greeting_ja: '仁寺洞で伝統工芸品をご覧ください！' },
      { x: 8200, y: 2900, texture: 'mission_npc', name_ko: 'DDP 안내원', name_ja: 'DDPガイド', hasMission: true,
        greeting_ko: 'DDP 동대문디자인플라자예요!',
        greeting_ja: 'DDP東大門デザインプラザです！' },
    ]);
    this.createBuildings([
      { x: 5600, y: 2000, texture: 'building_shop', name_ko: '경복궁 / 景福宮' },
      { x: 5800, y: 2600, texture: 'building_shop', name_ko: '광화문광장 / 光化門' },
      { x: 6200, y: 1800, texture: 'building_shop', name_ko: '북촌한옥마을 / 北村' },
      { x: 6600, y: 1900, texture: 'building_shop', name_ko: '창덕궁 / 昌德宮' },
      { x: 6000, y: 2400, texture: 'building_shop', name_ko: '인사동 / 仁寺洞' },
      { x: 7000, y: 2400, texture: 'building_shop', name_ko: '종묘 / 宗廟' },
      { x: 7200, y: 2800, texture: 'building_shop', name_ko: '광장시장 / 広蔵市場' },
      { x: 5800, y: 3000, texture: 'building_shop', name_ko: '덕수궁 / 德壽宮' },
      { x: 6800, y: 2000, texture: 'building_shop', name_ko: '창경궁 / 昌慶宮' },
      { x: 8200, y: 2800, texture: 'building_shop', name_ko: 'DDP / 東大門' },
      { x: 6000, y: 1900, texture: 'building_shop', name_ko: '삼청동 / 三清洞' },
      { x: 7200, y: 2200, texture: 'building_shop', name_ko: '이화마을/대학로' },
    ]);
    this.createSubwayEntrance(6000, 2600, 'SeoulMetroScene', 'jongno', '종로/광화문역 🚇', '鍾路/光化門駅');
  }

  setupMyeongdongDistrict() {
    this.createNPCs([
      { x: 6600, y: 3400, texture: 'shop', name_ko: '화장품 가게 직원', name_ja: 'コスメショップ店員',
        greeting_ko: '어서오세요! 명동 화장품 가게입니다.',
        greeting_ja: 'いらっしゃいませ！明洞コスメショップです。' },
      { x: 6800, y: 3800, texture: 'mission_npc', name_ko: 'N서울타워 안내원', name_ja: 'Nソウルタワー案内員', hasMission: true,
        greeting_ko: 'N서울타워에서 서울 전경을 볼 수 있어요!',
        greeting_ja: 'Nソウルタワーからソウルの全景が見られます！' },
    ]);
    this.createEnterableBuilding(6600, 3500, 'OliveYoungScene', { texture: 'building_oliveyoung', name_ko: '올리브숲', name_ja: 'OLIVE BLOOM' });
    this.createEnterableBuilding(6200, 3300, 'HiKRGroundScene', { texture: 'building_shop', name_ko: '하이코그라운드', name_ja: 'HiKO Ground' });
    this.createEnterableBuilding(7000, 3600, 'HotelScene', { texture: 'building_house', name_ko: '게스트하우스', name_ja: 'ゲストハウス' });
    this.createBuildings([
      { x: 6800, y: 3800, texture: 'building_tower', name_ko: 'N서울타워 / Nソウルタワー' },
      { x: 6600, y: 3400, texture: 'building_shop', name_ko: '명동 쇼핑거리 / 明洞' },
      { x: 6500, y: 3400, texture: 'building_shop', name_ko: '명동성당 / 明洞聖堂' },
      { x: 5800, y: 3700, texture: 'building_shop', name_ko: '남대문시장 / 南大門' },
      { x: 5600, y: 4000, texture: 'building_station', name_ko: '서울역 / ソウル駅' },
    ]);
    this.createSubwayEntrance(6600, 3800, 'SeoulMetroScene', 'myeongdong', '명동역 🚇', '明洞駅');
  }

  setupItaewonDistrict() {
    this.createNPCs([
      { x: 6400, y: 4400, texture: 'mission_npc', name_ko: '이태원 안내원', name_ja: 'イテウォンガイド', hasMission: true,
        greeting_ko: '이태원에 오신 걸 환영해요!',
        greeting_ja: 'イテウォンへようこそ！' },
    ]);
    this.createBuildings([
      { x: 6400, y: 4400, texture: 'building_shop', name_ko: '이태원 거리 / 梨泰院' },
      { x: 5800, y: 4500, texture: 'building_shop', name_ko: '전쟁기념관 / 戦争記念館' },
      { x: 6200, y: 4700, texture: 'building_shop', name_ko: '국립중앙박물관' },
      { x: 5400, y: 4600, texture: 'building_shop', name_ko: '용산전자상가' },
    ]);
    this.createSubwayEntrance(6400, 4500, 'SeoulMetroScene', 'itaewon', '이태원역 🚇', '梨泰院駅');
  }

  setupYeouidoDistrict() {
    this.createNPCs([
      { x: 3400, y: 5300, texture: 'shop', name_ko: 'IFC 안내원', name_ja: 'IFC案内員',
        greeting_ko: '여의도 IFC몰에 오신 걸 환영해요!',
        greeting_ja: '汝矣島IFCモールへようこそ！' },
    ]);
    this.createBuildings([
      { x: 2900, y: 5200, texture: 'building_shop', name_ko: '국회의사당 / 国会' },
      { x: 3400, y: 5300, texture: 'building_shop', name_ko: '여의도 IFC' },
      { x: 2800, y: 5500, texture: 'building_tower', name_ko: '63빌딩 / 63ビル' },
      { x: 3000, y: 5400, texture: 'building_shop', name_ko: 'KBS 방송국' },
      { x: 3200, y: 5600, texture: 'building_shop', name_ko: '여의도 한강공원' },
    ]);
    this.createSubwayEntrance(3400, 5400, 'SeoulMetroScene', 'yeouido', '여의도역 🚇', '汝矣島駅');
  }

  setupGangnamDistrict() {
    this.createNPCs([
      { x: 7000, y: 6800, texture: 'mission_npc', name_ko: 'K-Idol 안내원', name_ja: 'K-Idolガイド', hasMission: true,
        greeting_ko: 'K-Idol Road에 오신 걸 환영해요!',
        greeting_ja: 'K-Idol Roadへようこそ！' },
      { x: 7200, y: 6600, texture: 'shop', name_ko: '삼겹살 사장님', name_ja: 'サムギョプサル店主',
        greeting_ko: '어서오세요! 맛있는 삼겹살 있어요~',
        greeting_ja: 'いらっしゃいませ！美味しいサムギョプサルありますよ～' },
    ]);
    this.createEnterableBuilding(7200, 6600, 'RestaurantScene', { texture: 'building_restaurant', name_ko: '삼겹살 식당', name_ja: 'サムギョプサル食堂' });
    this.createBuildings([
      { x: 9200, y: 6800, texture: 'building_shop', name_ko: 'COEX몰 / COEXモール' },
      { x: 7800, y: 6200, texture: 'building_shop', name_ko: '가로수길 / カロスキル' },
      { x: 8000, y: 6000, texture: 'building_shop', name_ko: '압구정/청담 / 狎鷗亭' },
      { x: 9200, y: 7000, texture: 'building_shop', name_ko: '코엑스 아쿠아리움' },
      { x: 8600, y: 6600, texture: 'building_shop', name_ko: '선릉/정릉 / 宣靖陵' },
      { x: 4800, y: 6000, texture: 'building_shop', name_ko: '노량진 수산시장' },
    ]);
    this.createSubwayEntrance(7000, 6800, 'SeoulMetroScene', 'gangnam', '강남역 🚇', 'カンナム駅');
  }

  setupSeongsuDistrict() {
    this.createNPCs([
      { x: 9500, y: 3500, texture: 'mission_npc', name_ko: '팝업스토어 직원', name_ja: 'ポップアップストア店員', hasMission: true,
        greeting_ko: '성수동 팝업스토어에 오신 걸 환영해요!',
        greeting_ja: '聖水洞ポップアップストアへようこそ！' },
    ]);
    this.createBuildings([
      { x: 9500, y: 3500, texture: 'building_shop', name_ko: '성수동 카페거리 / 聖水カフェ' },
      { x: 9200, y: 3800, texture: 'building_shop', name_ko: '서울숲 / ソウルの森' },
      { x: 9500, y: 5000, texture: 'building_shop', name_ko: '뚝섬 한강공원' },
    ]);
    this.createSubwayEntrance(9500, 3500, 'SeoulMetroScene', 'seongsu', '성수역 🚇', 'ソンス駅');
  }

  setupJamsilDistrict() {
    this.createNPCs([
      { x: 10800, y: 6800, texture: 'mission_npc', name_ko: '롯데월드 안내원', name_ja: 'ロッテワールド案内員', hasMission: true,
        greeting_ko: '롯데월드에 오신 걸 환영해요!',
        greeting_ja: 'ロッテワールドへようこそ！' },
    ]);
    this.createBuildings([
      { x: 10800, y: 6800, texture: 'building_tower', name_ko: '롯데월드타워 / ロッテタワー' },
      { x: 11000, y: 7200, texture: 'building_shop', name_ko: '롯데월드 / ロッテワールド' },
      { x: 10500, y: 7600, texture: 'building_shop', name_ko: '석촌호수 / 石村湖' },
      { x: 12000, y: 7800, texture: 'building_shop', name_ko: '올림픽공원 / Olympic' },
      { x: 10600, y: 7000, texture: 'building_shop', name_ko: '잠실야구장 / 蠶室' },
    ]);
    this.createSubwayEntrance(10800, 7000, 'SeoulMetroScene', 'jamsil', '잠실역 🚇', 'チャムシル駅');
  }

  // ══════════════════════════════════════════════════════
  // 라벨 시스템
  // ══════════════════════════════════════════════════════
  addDistrictLabels() {
    const s = this.uiScale;
    const ds = (c) => ({ fontSize: `${Math.round(16*s)}px`, color: c, fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 10, y: 5 } });
    const ss = (c) => ({ fontSize: `${Math.round(10*s)}px`, color: c, backgroundColor: '#00000066', padding: { x: 6, y: 3 } });
    const st = { fontSize: `${Math.round(9*s)}px`, color: '#ffffff', backgroundColor: '#2255aa', padding: { x: 6, y: 3 } };

    // 구역
    [[2600,2450,0],[6500,1550,1],[6900,3250,2],[6400,4250,3],[3400,5060,4],[7500,5850,5],[10000,2550,6],[11000,5850,7]]
    .forEach(([x,y,i]) => {
      const d = this._districts[i];
      this.add.text(x, y, d.name, ds(d.color)).setOrigin(0.5).setDepth(3);
      this.add.text(x, y+30, d.sub, ss(d.color)).setOrigin(0.5).setDepth(3);
    });

    // 한강
    this.add.text(7200, 5200, '── 한강 · 漢江 · Han River ──', {
      fontSize: `${Math.round(14*s)}px`, color: '#6aabdd', fontStyle: 'italic',
      backgroundColor: '#00000066', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(3);

    // 산
    [[5800,400,'🏔️ 북한산 · 北漢山'],[6800,3600,'🏔️ 남산 · 南山'],[13400,3000,'🏔️ 아차산'],[5000,9800,'🏔️ 관악산']].forEach(([x,y,t]) => {
      this.add.text(x, y, t, { fontSize: `${Math.round(11*s)}px`, color: '#3a6a3a', backgroundColor: '#00000044', padding: { x: 6, y: 3 } }).setOrigin(0.5).setDepth(3);
    });

    // 하천
    [[8200,2750,'청계천 · 清渓川'],[9350,7200,'탄천 · 炭川'],[10700,3000,'중랑천 · 中浪川'],[2350,7500,'안양천 · 安養川'],[8000,8000,'양재천 · 良才川']].forEach(([x,y,t]) => {
      this.add.text(x, y, t, { fontSize: `${Math.round(9*s)}px`, color: '#5588bb', fontStyle: 'italic', backgroundColor: '#00000066', padding: { x: 4, y: 2 } }).setOrigin(0.5).setDepth(3);
    });

    // 거리표지판
    [[6000,2710,'종로 Jongno-ro →'],[8500,2710,'← 종로 Jongno-ro'],[5850,2500,'↑ 세종대로'],[7050,6400,'↑ 강남대로'],
     [7500,6710,'테헤란로 Teheran-ro →'],[6200,3110,'을지로 Euljiro →'],[6200,3510,'퇴계로 Toegyero →'],
     [2850,3000,'↑ 홍대거리'],[6550,3300,'↑ 명동길'],[6200,4110,'이태원로 →'],[12000,3110,'천호대로 →'],
     [9500,7110,'올림픽로 →'],[10000,8410,'위례성대로 →']].forEach(([x,y,t]) => {
      this.add.text(x, y, t, st).setOrigin(0.5).setDepth(15);
    });
  }
}
