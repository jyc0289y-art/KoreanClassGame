import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// FukuokaUnifiedScene v3 — 실제 지리 기반 후쿠오카 통합맵 (9600×7200)
//
//  실제 지도를 참조한 하카타만 곡선 해안, 나카가와 곡선,
//  무로미강, 오호리공원, 25개 랜드마크, 5개 구역
//  ~640px/km (15km × 11.25km)
// ============================================================

export default class FukuokaUnifiedScene extends BaseWorldScene {
  constructor() { super('FukuokaUnifiedScene'); }

  create() {
    this.worldWidth = 9600;
    this.worldHeight = 7200;
    gameState.setRegion('fukuoka');

    // ── 5개 구역 경계 정의 ──
    this._districts = [
      { id: 'tenjin', name: '텐진 天神', sub: 'テンジン · Tenjin', color: '#FF8C00',
        x: 2600, y: 1800, w: 1800, h: 1800 },
      { id: 'hakata', name: '하카타 博多', sub: 'ハカタ · Hakata', color: '#CD5C5C',
        x: 5400, y: 1800, w: 2400, h: 2400 },
      { id: 'yakuin', name: '야쿠인 薬院', sub: 'ヤクイン · Yakuin', color: '#2E8B57',
        x: 2600, y: 4000, w: 1800, h: 2200 },
      { id: 'nakasu', name: '나카스 中洲', sub: 'ナカス · Nakasu', color: '#DA70D6',
        x: 4450, y: 2000, w: 350, h: 2200 },
      { id: 'seaside', name: '시사이드 모모치', sub: 'シーサイド · Seaside Momochi', color: '#4169E1',
        x: 1000, y: 1200, w: 1600, h: 1800 },
      { id: 'hakata_port', name: '하카타항 博多港', sub: 'ハカタ港 · Hakata Port', color: '#4682B4',
        x: 5800, y: 600, w: 1400, h: 800 }
    ];
    this._lastWelcomeDistrict = null;

    // ── 스폰 포인트 ──
    this.stationSpawnPoints = {
      yakuin:          { x: 3400, y: 5200 },
      tenjin:          { x: 3400, y: 2600 },
      tenjin_minami:   { x: 3400, y: 3400 },
      hakata:          { x: 6400, y: 2800 },
      nakasu:          { x: 4550, y: 3000 },
      seaside:         { x: 1800, y: 1800 },
      fukuoka_airport: { x: 7300, y: 5400 }
    };

    this.placeSpawnPoints = {
      YukoHouseScene:      { x: 3000, y: 5300 },
      AmiHouseScene:       { x: 3300, y: 5100 },
      RuiHouseScene:       { x: 3600, y: 5300 },
      BookstoreScene:      { x: 4000, y: 4700 },
      KoreanAcademyScene:  { x: 3000, y: 4700 }
    };

    this.createWorld({
      startX: 3400, startY: 5000,
      tiles: '__terrain__',
      npcs: [],
      buildings: []
    });

    // ── 지형 렌더링 (v3) ──
    this.drawTerrain();

    // ── 나카가와 다리 ──
    this.drawBridges();

    // ── 5개 구역 건물 + NPC + 지하철역 ──
    this.setupSeasideDistrict();
    this.setupTenjinDistrict();
    this.setupNakasuDistrict();
    this.setupHakataDistrict();
    this.setupYakuinDistrict();
    this.setupHakataPortDistrict();
    this.setupNokonoshimaDistrict();
    this.setupMinamiArea();

    // Phase 6C: 공항 안내원
    this.createNPCs([
      { x: 7300, y: 5200, texture: 'shop',
        name_ko: '공항 안내원', name_ja: '空港案内員',
        greeting_ko: '후쿠오카 공항에 오신 걸 환영합니다!\n지하철로 하카타역까지 5분이에요!',
        greeting_ja: '福岡空港へようこそ！\n地下鉄で博多駅まで5分です！' },
    ]);

    // ── 지역 라벨 ──
    this.addDistrictLabels();

    this.showSceneTitle('후쿠오카', '福岡 · Fukuoka', 'Ch.0 한글반 에리어 (실제 지리)', '#88ff88');
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // ── update: 구역 전환 감지 ──
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
        // ── 해안 녹지 ──
        { x: 0, y: 1050, w: 9600, h: 200, color: 0x9aaa8a, alpha: 0.6, border: false },
        // ── 하카타항 항만 ──
        { x: 5800, y: 800, w: 1400, h: 600, color: 0x999999, alpha: 0.6, border: false },
        // ── 하카타항 화물 구역 ──
        { x: 6800, y: 700, w: 800, h: 500, color: 0x888888, alpha: 0.5, border: false },
        // ── 노코노시마 (바다 위 섬, 실제 3.95km²) ──
        { x: 400, y: 100, w: 1600, h: 1150, color: 0x4a8a4a, alpha: 0.9, border: false },
        // ── 모모치 해변 모래사장 ──
        { x: 1100, y: 960, w: 1000, h: 100, color: 0xd4c4a0, alpha: 0.5, border: false },
        // ── 시사이드 모모치 (돌출 반도) ──
        { x: 1000, y: 1100, w: 1600, h: 1900, color: 0xa0b8c0, alpha: 1.0 },
        // ── 오호리공원 주변 녹지 (텐진 서쪽 인접) ──
        { x: 2100, y: 2500, w: 1000, h: 800, color: 0x5a9a5a, alpha: 0.8, border: false },
        // ── 텐진 상업 ──
        { x: 2600, y: 1800, w: 1800, h: 1800, color: 0xbcaa98, alpha: 1.0 },
        // ── 나카스 섬 (나카가와-하카타강 사이) ──
        { x: 4450, y: 2000, w: 350, h: 2200, color: 0xb8a0b0, alpha: 1.0 },
        // ── 하카타 역전 ──
        { x: 5400, y: 1800, w: 2400, h: 2400, color: 0xb0a8a0, alpha: 1.0 },
        // ── 야쿠인 주거 ──
        { x: 2600, y: 4000, w: 1800, h: 2200, color: 0x90a880, alpha: 1.0 },
        // ── 하카타 남부 ──
        { x: 5400, y: 4200, w: 2400, h: 1800, color: 0x8a9a7a, alpha: 0.7, border: false },
        // ── 양강 사이 일반 (텐진~하카타 이어주는 구간) ──
        { x: 4100, y: 1100, w: 1500, h: 6100, color: 0x8a9a7a, alpha: 0.5, border: false },
        // ── 남부 주택가 ──
        { x: 0, y: 5800, w: 9600, h: 1400, color: 0x88a078, alpha: 0.7, border: false },
        // ── 동쪽 외곽 (공항 방면) ──
        { x: 7800, y: 1200, w: 1800, h: 6000, color: 0x88a078, alpha: 0.6, border: false },
        // ── 공항 에어리어 ──
        { x: 6800, y: 3800, w: 2200, h: 3400, color: 0x98a088, alpha: 0.7, border: false },
        // ── 서쪽 외곽 ──
        { x: 0, y: 1200, w: 1000, h: 6000, color: 0x88a078, alpha: 0.6, border: false },
      ],

      water: [
        // ── 하카타만 — 깊은 바다 (크레센트 강화) ──
        {
          points: [
            [0,0],[9600,0],[9600,500],
            [9200,530],[8800,560],[8400,600],[8000,650],
            [7600,690],[7200,720],[6800,750],[6400,790],
            [6000,800],[5600,790],[5200,780],[4800,780],
            [4400,770],[4000,740],[3600,710],[3200,690],
            [2800,670],[2400,650],[2000,630],[1600,600],
            [1200,590],[800,580],[400,570],[0,560]
          ],
          color: 0x0a2040, alpha: 1.0
        },
        // ── 하카타만 — 얕은 바다 ──
        {
          points: [
            [0,560],[400,570],[800,580],[1200,590],
            [1600,600],[2000,630],[2400,650],[2800,670],
            [3200,690],[3600,710],[4000,740],[4400,770],
            [4800,780],[5200,780],[5600,790],[6000,800],
            [6400,790],[6800,750],[7200,720],[7600,690],
            [8000,650],[8400,600],[8800,560],[9200,530],[9600,500],
            [9600,880],[9200,910],[8800,940],[8400,970],
            [8000,1010],[7600,1050],[7200,1080],[6800,1100],
            [6400,1120],[6000,1130],[5600,1130],[5200,1120],
            [4800,1120],[4400,1110],[4000,1090],[3600,1060],
            [3200,1040],[2800,1020],[2400,1000],[2000,980],
            // 모모치 반도 돌출 (y값 낮게)
            [1800,940],[1600,920],[1400,910],[1200,930],
            [800,950],[400,940],[0,930]
          ],
          color: 0x1a4a7a, alpha: 1.0
        },
        // ── 하카타만 — 모래사장/서프 ──
        {
          points: [
            [0,930],[400,940],[800,950],[1200,930],
            [1400,910],[1600,920],[1800,940],[2000,980],
            [2400,1000],[2800,1020],[3200,1040],[3600,1060],
            [4000,1090],[4400,1110],[4800,1120],[5200,1120],
            [5600,1130],[6000,1130],[6400,1120],[6800,1100],
            [7200,1080],[7600,1050],[8000,1010],[8400,970],
            [8800,940],[9200,910],[9600,880],
            [9600,930],[9200,960],[8800,990],[8400,1020],
            [8000,1060],[7600,1100],[7200,1130],[6800,1150],
            [6400,1170],[6000,1180],[5600,1180],[5200,1170],
            [4800,1170],[4400,1160],[4000,1140],[3600,1110],
            [3200,1090],[2800,1070],[2400,1050],[2000,1030],
            [1800,1000],[1600,980],[1400,970],[1200,990],
            [800,1000],[400,990],[0,980]
          ],
          color: 0xd4c4a0, alpha: 0.4
        },

        // ── 나카가와 (那珂川) — 서쪽 강 (나카스 서쪽 경계, 하카타만까지 연결) ──
        {
          points: [
            [4250,920],[4270,1000],[4280,1100],[4290,1600],[4280,2000],[4270,2400],
            [4260,2800],[4250,3200],[4260,3600],[4270,4000],
            [4290,4400],[4310,4800],[4330,5200],[4350,5600],
            [4370,6000],[4390,6400],[4400,6800],[4410,7200],
            [4560,7200],[4550,6800],[4540,6400],[4520,6000],
            [4500,5600],[4480,5200],[4460,4800],[4440,4400],
            [4420,4000],[4410,3600],[4400,3200],[4410,2800],
            [4420,2400],[4430,2000],[4440,1600],[4450,1100],
            [4460,1000],[4500,920]
          ],
          color: 0x2a5a8a, alpha: 1.0,
          bank: { width: 12, color: 0x999999, alpha: 0.5 }
        },
        // 나카가와 수면 하이라이트
        {
          points: [
            [4280,1000],[4310,1600],[4310,2400],[4300,3600],[4320,4800],[4370,6000],[4400,7200],
            [4540,7200],[4500,6000],[4460,4800],[4440,3600],[4450,2400],[4440,1600],[4470,1000]
          ],
          color: 0x4a8aba, alpha: 0.2
        },

        // ── 하카타강 (博多川) — 동쪽 강 (나카스 동쪽 경계, 하카타만까지 연결) ──
        {
          points: [
            [4650,950],[4670,1050],[4700,1200],[4710,1600],[4710,2000],[4720,2400],[4730,2800],
            [4740,3200],[4750,3600],[4760,4000],[4780,4400],
            [4800,4800],[4820,5200],[4840,5600],[4860,6000],
            [4880,6400],[4900,6800],[4910,7200],
            [5050,7200],[5040,6800],[5020,6400],
            [5000,6000],[4980,5600],[4960,5200],[4940,4800],
            [4920,4400],[4900,4000],[4890,3600],[4880,3200],
            [4870,2800],[4860,2400],[4850,2000],[4840,1600],
            [4840,1200],[4830,1050],[4800,950]
          ],
          color: 0x2a5a8a, alpha: 0.95,
          bank: { width: 10, color: 0x999999, alpha: 0.5 }
        },
        // 하카타강 수면 하이라이트
        {
          points: [
            [4680,1100],[4720,1700],[4730,2800],[4750,3600],[4800,4800],[4860,6000],[4900,7200],
            [5030,7200],[4960,6000],[4940,4800],[4890,3600],[4870,2800],[4830,1700],[4810,1100]
          ],
          color: 0x4a8aba, alpha: 0.15
        },

        // ── 무로미강 (室見川) — 서쪽 ──
        {
          points: [
            [1400,7200],[1410,6400],[1420,5600],[1430,4800],
            [1440,4000],[1450,3200],[1440,2400],[1420,1800],[1400,1100],
            [1500,1100],[1520,1800],[1540,2400],[1550,3200],
            [1540,4000],[1530,4800],[1520,5600],[1510,6400],[1500,7200]
          ],
          color: 0x2a5a8a, alpha: 0.9,
          bank: { width: 10, color: 0x7a8a5a, alpha: 0.4 }
        },

        // ── 오호리공원 호수 (大濠公園) — 텐진 서쪽 인접으로 북쪽 시프트 ──
        {
          points: [
            [2200,2900],[2250,2700],[2400,2600],[2600,2580],
            [2800,2600],[2950,2700],[3000,2900],
            [2950,3100],[2800,3200],[2600,3220],
            [2400,3200],[2250,3100]
          ],
          color: 0x2a6a9a, alpha: 0.9,
          bank: { width: 10, color: 0x5a8a5a, alpha: 0.5 }
        },
      ],

      roads: [
        // === 간선도로 (major 160px) ===
        // 쇼와도리 昭和通り (E-W)
        { x: 200, y: 2920, w: 9200, h: 160, color: 0x606060, type: 'major' },
        // 와타나베도리 渡辺通り (N-S)
        { x: 3320, y: 1100, w: 160, h: 6100, color: 0x606060, type: 'major' },
        // 다이하쿠도리 大博通り (N-S)
        { x: 6120, y: 1100, w: 160, h: 6100, color: 0x606060, type: 'major' },
        // 메이지도리 明治通り (E-W)
        { x: 2200, y: 2320, w: 5500, h: 160, color: 0x606060, type: 'major' },
        // 국도3호선 (N-S, 동쪽)
        { x: 7720, y: 1100, w: 160, h: 6100, color: 0x606060, type: 'major' },

        // === 중로 (medium 100px) ===
        // 히에도리 日枝通り (E-W)
        { x: 2600, y: 3550, w: 1600, h: 100, color: 0x686868, type: 'medium' },
        // 하카타 에키마에도리 (N-S)
        { x: 5700, y: 1100, w: 100, h: 3200, color: 0x686868, type: 'medium' },
        // 텐진키타도리 (E-W)
        { x: 2600, y: 1950, w: 1800, h: 100, color: 0x686868, type: 'medium' },
        // 모모치도리 (E-W, 해안가)
        { x: 600, y: 1550, w: 2200, h: 100, color: 0x686868, type: 'medium' },
        // 니시테츠 고가 (E-W, 텐진)
        { x: 2800, y: 2720, w: 1600, h: 100, color: 0x686868, type: 'medium' },
        // 하카타역 동쪽 도로 (N-S)
        { x: 6700, y: 1100, w: 100, h: 3200, color: 0x686868, type: 'medium' },
        // 하카타역 앞 도로 (E-W)
        { x: 5400, y: 2520, w: 2400, h: 100, color: 0x686868, type: 'medium' },

        // === 소로 (60px) ===
        // 텐진 내부
        { x: 2900, y: 1800, w: 60, h: 1800, color: 0x707070 },
        { x: 3800, y: 1800, w: 60, h: 1800, color: 0x707070 },
        { x: 2600, y: 2200, w: 1800, h: 60, color: 0x707070 },
        { x: 2600, y: 3200, w: 1800, h: 60, color: 0x707070 },
        // 하카타 내부
        { x: 5800, y: 1800, w: 60, h: 2400, color: 0x707070 },
        { x: 6400, y: 1800, w: 60, h: 2400, color: 0x707070 },
        { x: 7200, y: 1800, w: 60, h: 2400, color: 0x707070 },
        { x: 5400, y: 3400, w: 2400, h: 60, color: 0x707070 },
        // 야쿠인 내부
        { x: 3000, y: 4000, w: 60, h: 2200, color: 0x707070 },
        { x: 3800, y: 4000, w: 60, h: 2200, color: 0x707070 },
        { x: 2600, y: 4600, w: 1800, h: 60, color: 0x707070 },
        { x: 2600, y: 5200, w: 1800, h: 60, color: 0x707070 },
        { x: 2600, y: 5800, w: 1800, h: 60, color: 0x707070 },
        // 나카스 내부 (좁은 섬)
        { x: 4550, y: 2200, w: 40, h: 2000, color: 0x707070 },
        // 시사이드 내부
        { x: 1600, y: 1200, w: 60, h: 1800, color: 0x707070 },
        { x: 2200, y: 1200, w: 60, h: 800, color: 0x707070 },
        { x: 1000, y: 2000, w: 1600, h: 60, color: 0x707070 },
        // 남부 연결
        { x: 4400, y: 4400, w: 60, h: 2800, color: 0x707070 },
        // 공항 접근로 (국도3호에서 공항까지)
        { x: 7720, y: 4200, w: 160, h: 1200, color: 0x606060, type: 'medium' },
        // 공항 터미널 앞 도로 (E-W)
        { x: 7050, y: 5400, w: 800, h: 80, color: 0x686868, type: 'medium' },
        // Phase 6C: 화물터미널 연결 도로
        { x: 6300, y: 4200, w: 60, h: 1200, color: 0x686868 },
      ],

      crosswalks: [
        // 기존
        { x: 3320, y: 2910, w: 160, dir: 'v' },
        { x: 6120, y: 2910, w: 160, dir: 'v' },
        { x: 3320, y: 2310, w: 160, dir: 'v' },
        { x: 5700, y: 2310, w: 100, dir: 'v' },
        // 텐진
        { x: 3320, y: 2510, w: 160, dir: 'h' },
        { x: 3320, y: 2710, w: 60, dir: 'h' },
        { x: 3800, y: 2910, w: 60, dir: 'v' },
        { x: 3600, y: 2510, w: 60, dir: 'v' },
        // 하카타
        { x: 6120, y: 2710, w: 160, dir: 'h' },
        { x: 6120, y: 2510, w: 60, dir: 'h' },
        { x: 5400, y: 3510, w: 100, dir: 'v' },
        { x: 5700, y: 2510, w: 100, dir: 'h' },
        // 나카스
        { x: 4460, y: 2510, w: 60, dir: 'h' },
        { x: 4460, y: 3910, w: 60, dir: 'h' },
        // 야쿠인
        { x: 3320, y: 4710, w: 100, dir: 'h' },
        { x: 3320, y: 5210, w: 60, dir: 'h' },
        { x: 3320, y: 4210, w: 60, dir: 'h' },
        { x: 7720, y: 2510, w: 160, dir: 'h' },
      ],

      blocks: [
        // 시사이드 모모치
        { x: 1020, y: 1120, w: 560, h: 760, density: 'low',
          palette: [0xa0b0c0, 0x98a8b8, 0xb0c0d0] },
        { x: 1620, y: 1120, w: 560, h: 760, density: 'medium',
          palette: [0xa0b0c0, 0x98a8b8, 0xa8b8c8] },
        { x: 1020, y: 2020, w: 1160, h: 560, density: 'low',
          palette: [0x98a8b8, 0xa0b0c0] },

        // 텐진
        { x: 2620, y: 1820, w: 260, h: 360, density: 'high',
          palette: [0xb8a890, 0xc0b0a0, 0xa8a090, 0xb0a898], tallBuildings: true },
        { x: 2920, y: 1820, w: 860, h: 360, density: 'high',
          palette: [0xb8a890, 0xc0b0a0, 0xa8a090], tallBuildings: true },
        { x: 3820, y: 1820, w: 560, h: 360, density: 'high',
          palette: [0xb8a890, 0xc0b0a0], tallBuildings: true },
        { x: 2620, y: 2280, w: 1560, h: 400, density: 'high',
          palette: [0xb0a088, 0xa89880, 0xb8a890], tallBuildings: true },
        { x: 2620, y: 2760, w: 680, h: 440, density: 'high',
          palette: [0xc0b8a8, 0xb8b0a0, 0xc8c0b0, 0xd0c8b8] },
        { x: 3360, y: 2760, w: 1020, h: 440, density: 'high',
          palette: [0xc0b8a8, 0xb8b0a0, 0xc8c0b0] },
        { x: 2620, y: 3280, w: 1760, h: 260, density: 'medium',
          palette: [0xa89880, 0xb0a088] },

        // 나카스 (섬)
        { x: 4460, y: 2100, w: 320, h: 1000, density: 'high',
          palette: [0xb098b0, 0xa890a0, 0xc0a8b8, 0xb8a0a8], tallBuildings: true },
        { x: 4460, y: 3200, w: 320, h: 800, density: 'medium',
          palette: [0xa890a0, 0xb098b0, 0xb8a0a8], tallBuildings: true },

        // 하카타
        { x: 5420, y: 1820, w: 360, h: 680, density: 'high',
          palette: [0xa8a0a0, 0xb0a8a0, 0xb8b0a8, 0xa0a098], tallBuildings: true },
        { x: 5820, y: 1820, w: 560, h: 680, density: 'high',
          palette: [0xa8a0a0, 0xb0a8a0, 0xb8b0a8], tallBuildings: true },
        { x: 6440, y: 1820, w: 240, h: 680, density: 'high',
          palette: [0xa8a0a0, 0xb0a8a0] },
        { x: 6720, y: 1820, w: 460, h: 680, density: 'medium',
          palette: [0xa8a0a0, 0xb0a8a0] },
        { x: 5420, y: 2640, w: 2360, h: 560, density: 'high',
          palette: [0xa89898, 0xb0a0a0, 0xa8a0a0, 0xb8b0a8], tallBuildings: true },
        { x: 5420, y: 3260, w: 2360, h: 680, density: 'high',
          palette: [0xa89898, 0xb0a0a0, 0xb8b0a8] },
        { x: 5420, y: 4000, w: 2360, h: 400, density: 'low',
          palette: [0xa09890, 0x989088] },

        // 야쿠인
        { x: 2620, y: 4020, w: 360, h: 560, density: 'low',
          palette: [0x90a080, 0x88a078, 0x98a888, 0x80a070] },
        { x: 3020, y: 4020, w: 760, h: 560, density: 'low',
          palette: [0x90a080, 0x88a078, 0x98a888] },
        { x: 3820, y: 4020, w: 560, h: 560, density: 'low',
          palette: [0x90a080, 0x88a078] },
        { x: 2620, y: 4680, w: 1760, h: 500, density: 'low',
          palette: [0x88a078, 0x80a070, 0x90a080] },
        { x: 2620, y: 5280, w: 1760, h: 500, density: 'low',
          palette: [0x88a078, 0x80a070] },
        { x: 2620, y: 5880, w: 1760, h: 300, density: 'low',
          palette: [0x85a075, 0x7a9868] },

        // ── 남부 주거 블록 ──
        { x: 3600, y: 5800, w: 800, h: 600, density: 'low', style: 'residential',
          palette: [0x88a078, 0x80a070] },
        { x: 4800, y: 6000, w: 700, h: 500, density: 'low', style: 'residential',
          palette: [0x88a078, 0x80a070] },
        // ── 서부 블록 ──
        { x: 300, y: 2600, w: 500, h: 600, density: 'low', style: 'residential',
          palette: [0x88a078, 0x80a070] },
      ],

      vegetation: [
        // 오호리 공원 (텐진 서쪽, 북쪽 시프트)
        { type: 'park', x: 2100, y: 2500, w: 1000, h: 800 },
        // 텐진중앙공원
        { type: 'park', x: 3700, y: 2900, w: 400, h: 300 },
        // 케고공원
        { type: 'park', x: 3500, y: 2100, w: 300, h: 200 },
        // 쇼와도리 가로수
        { type: 'streetTrees', x: 250, y: 2900, dir: 'h', length: 9100, spacing: 100, radius: 8 },
        { type: 'streetTrees', x: 250, y: 3100, dir: 'h', length: 9100, spacing: 100, radius: 8 },
        // 와타나베도리 가로수
        { type: 'streetTrees', x: 3300, y: 1150, dir: 'v', length: 5900, spacing: 100, radius: 8 },
        { type: 'streetTrees', x: 3500, y: 1150, dir: 'v', length: 5900, spacing: 100, radius: 8 },
        // 다이하쿠도리 가로수
        { type: 'streetTrees', x: 6100, y: 1150, dir: 'v', length: 5900, spacing: 100, radius: 8 },
        { type: 'streetTrees', x: 6300, y: 1150, dir: 'v', length: 5900, spacing: 100, radius: 8 },
        // 메이지도리 가로수
        { type: 'streetTrees', x: 2250, y: 2300, dir: 'h', length: 5400, spacing: 100, radius: 8 },
        { type: 'streetTrees', x: 2250, y: 2500, dir: 'h', length: 5400, spacing: 100, radius: 8 },
        // 나카가와변 녹지 (서쪽 강 양안)
        { type: 'riverbank', x: 4280, y: 1150, dir: 'v', length: 6000 },
        { type: 'riverbank', x: 4560, y: 1150, dir: 'v', length: 6000 },
        // 하카타강변 녹지 (동쪽 강 양안)
        { type: 'riverbank', x: 4680, y: 1700, dir: 'v', length: 5500 },
        { type: 'riverbank', x: 5060, y: 1700, dir: 'v', length: 5500 },
        // 무로미강변 녹지
        { type: 'riverbank', x: 1380, y: 1150, dir: 'v', length: 6000 },
        { type: 'riverbank', x: 1520, y: 1150, dir: 'v', length: 6000 },
        // 야쿠인 소규모 녹지
        { type: 'park', x: 2800, y: 5600, w: 600, h: 400 },
        // 해안선 공원
        { type: 'park', x: 1200, y: 1000, w: 800, h: 150 },
        { type: 'park', x: 6000, y: 1100, w: 800, h: 150 },
        // 노코노시마 녹지
        { type: 'park', x: 500, y: 200, w: 1400, h: 950 },
        // 시사이드 모모치 해변 공원
        { type: 'park', x: 1100, y: 1000, w: 1000, h: 300 },
        // 마이즈루 공원 (오호리 동쪽, 후쿠오카성터)
        { type: 'park', x: 2400, y: 2000, w: 600, h: 500 },
        // 공항 주변 녹지
        { type: 'park', x: 7050, y: 4900, w: 300, h: 250 },
        { type: 'park', x: 8200, y: 5000, w: 350, h: 300 },
      ],

      // ── 후쿠오카공항 (도심 3km, 단일 활주로 16/34, 국내+국제 터미널) ──
      airport: {
        x: 6800, y: 3800, w: 2200, h: 3400,
        runways: [{
          x: 7800, y: 3900, length: 1790, width: 55,
          heading: 'ns', numbers: ['16', '34']
        }],
        taxiways: [
          // 활주로→국내선 터미널 연결
          { points: [[7773, 5200], [7500, 5200]], width: 25 },
          { points: [[7773, 5500], [7500, 5500]], width: 25 },
          // 활주로→국제선 터미널 연결
          { points: [[7773, 5800], [7500, 5800]], width: 25 },
          // 활주로 남단 전환 유도로
          { points: [[7800, 5520], [7900, 5520], [7900, 5350], [7800, 5350]], width: 20 },
        ],
        terminals: [
          { x: 7100, y: 5050, w: 450, h: 180, gates: 'east', name: '国内線\n국내선' },
          { x: 7100, y: 5600, w: 380, h: 150, gates: 'east', name: '国際線\n국제선' },
          { x: 7900, y: 5800, w: 300, h: 120, gates: 'west', name: '貨物\n화물' }
        ],
        apron: [
          { x: 7550, y: 5000, w: 220, h: 300 },
          { x: 7550, y: 5550, w: 220, h: 220 },
          { x: 7800, y: 5600, w: 180, h: 200 }
        ],
        tower: { x: 7500, y: 5400 },
        parking: { x: 7050, y: 5280, w: 200, h: 280 }
      },
    });
  }

  // ══════════════════════════════════════════════════════
  // 다리: 나카가와 3개 + 하카타강 3개
  // ══════════════════════════════════════════════════════
  drawBridges() {
    const g = this.add.graphics().setDepth(0.5);

    // Y → X 보간 유틸
    const iX = (pts, y) => {
      for (let i = 0; i < pts.length - 1; i++) {
        if (y >= pts[i][0] && y <= pts[i+1][0]) {
          const t = (y - pts[i][0]) / (pts[i+1][0] - pts[i][0]);
          return pts[i][1] + t * (pts[i+1][1] - pts[i][1]);
        }
      }
      return pts[pts.length - 1][1];
    };

    // 나카가와 (서쪽 강) 양안 보간 데이터
    const nakaW = [
      [1100,4300],[1600,4290],[2000,4280],[2400,4270],
      [2800,4260],[3200,4250],[3600,4260],[4000,4270],
      [4400,4290],[4800,4310],[5200,4330],[5600,4350],
      [6000,4370],[6400,4390],[6800,4400],[7200,4410]
    ];
    const nakaE = [
      [1100,4450],[1600,4440],[2000,4430],[2400,4420],
      [2800,4410],[3200,4400],[3600,4410],[4000,4420],
      [4400,4440],[4800,4460],[5200,4480],[5600,4500],
      [6000,4520],[6400,4540],[6800,4550],[7200,4560]
    ];

    // 하카타강 (동쪽 강) 양안 보간 데이터
    const hakW = [
      [1600,4700],[2000,4710],[2400,4720],[2800,4730],
      [3200,4740],[3600,4750],[4000,4760],[4400,4780],
      [4800,4800],[5200,4820],[5600,4840],[6000,4860],
      [6400,4880],[6800,4900],[7200,4910]
    ];
    const hakE = [
      [1600,4840],[2000,4850],[2400,4860],[2800,4870],
      [3200,4880],[3600,4890],[4000,4900],[4400,4920],
      [4800,4940],[5200,4960],[5600,4980],[6000,5000],
      [6400,5020],[6800,5040],[7200,5050]
    ];

    const drawBridge = (lX, rX, y, n, k) => {
      const h = 60;
      g.fillStyle(0x000000, 0.15);
      g.fillRect(lX + 3, y - h/2 + 3, rX - lX, h);
      g.fillStyle(0x707070, 0.9);
      g.fillRect(lX, y - h/2, rX - lX, h);
      g.fillStyle(0x999999, 0.6);
      g.fillRect(lX, y - h/2, rX - lX, 4);
      g.fillRect(lX, y + h/2 - 4, rX - lX, 4);
      // 난간 (다리 양쪽)
      g.lineStyle(2, 0x555555, 0.5);
      g.lineBetween(lX, y - h/2, rX, y - h/2);
      g.lineBetween(lX, y + h/2, rX, y + h/2);
      // 기둥 (40px 간격)
      for (let px = lX; px < rX; px += 40) {
        g.fillStyle(0x666666, 0.6);
        g.fillRect(px, y - h/2 - 2, 3, 4);
        g.fillRect(px, y + h/2 - 2, 3, 4);
      }
      // 중앙선
      g.lineStyle(2, 0xffffff, 0.2);
      for (let dx = lX; dx < rX; dx += 25) {
        g.lineBetween(dx, y, Math.min(dx + 12, rX), y);
      }
      this.add.text((lX + rX) / 2, y - 8, n, {
        fontSize: '8px', color: '#ffffff', backgroundColor: '#00000088', padding: { x: 2, y: 1 }
      }).setOrigin(0.5).setDepth(3);
      this.add.text((lX + rX) / 2, y + 8, k, {
        fontSize: '7px', color: '#aaaaaa', backgroundColor: '#00000066', padding: { x: 2, y: 1 }
      }).setOrigin(0.5).setDepth(3);
    };

    // 나카가와 다리 3개
    [
      { y: 2320, n: '天神橋', k: '텐진바시' },
      { y: 2920, n: '西大橋', k: '니시오오하시' },
      { y: 3800, n: '春吉橋', k: '하루요시바시' },
    ].forEach(b => {
      drawBridge(iX(nakaW, b.y) - 15, iX(nakaE, b.y) + 15, b.y, b.n, b.k);
    });

    // 하카타강 다리 3개
    [
      { y: 2320, n: '明治橋', k: '메이지바시' },
      { y: 2920, n: '昭和橋', k: '쇼와바시' },
      { y: 3800, n: '住吉橋', k: '스미요시바시' },
    ].forEach(b => {
      drawBridge(iX(hakW, b.y) - 15, iX(hakE, b.y) + 15, b.y, b.n, b.k);
    });
  }

  // ══════════════════════════════════════════════════════
  // 시사이드 모모치 구역 (NW: X:1000-2600, Y:1200-3000)
  // ══════════════════════════════════════════════════════
  setupSeasideDistrict() {
    this.createNPCs([
      { x: 1800, y: 1800, texture: 'mission_npc',
        name_ko: '후쿠오카타워 안내원', name_ja: '福岡タワー案内員', hasMission: true,
        greeting_ko: '후쿠오카타워에 오신 걸 환영해요!\n234m 높이에서 시내를 한눈에!',
        greeting_ja: '福岡タワーへようこそ！\n234mの高さから市内を一望！' },
      { x: 1600, y: 1400, texture: 'shop',
        name_ko: '비치 안내원', name_ja: 'ビーチ案内員',
        greeting_ko: '시사이드 모모치 해변이에요!\n여기서 바다를 즐기세요~',
        greeting_ja: 'シーサイドももち海浜公園です！\nここで海を楽しんで～' },
    ]);
    this.createBuildings([
      { x: 1800, y: 1800, texture: 'building_tower', name_ko: '후쿠오카타워 / 福岡タワー' },
      { x: 1400, y: 2200, texture: 'building_shop', name_ko: 'PayPay돔 / PayPayドーム' },
      { x: 1500, y: 2000, texture: 'building_shop', name_ko: 'BOSS E·ZO / ボスイーゾ' },
      { x: 2000, y: 2400, texture: 'building_shop', name_ko: '후쿠오카시 박물관 / 福岡市博物館' },
      { x: 1600, y: 1400, texture: 'building_shop', name_ko: '모모치 해변 / ももちビーチ' },
    ]);
    // Phase 6C: 추가 NPC
    this.createNPCs([
      { x: 2000, y: 2000, texture: 'shop',
        name_ko: '해양과학관 직원', name_ja: 'マリンワールド職員',
        greeting_ko: '마린월드에 오신 걸 환영해요!\n돌고래 쇼가 3시에 시작해요!',
        greeting_ja: 'マリンワールドへようこそ！\nイルカショーが3時に始まります！' },
    ]);
  }

  // ══════════════════════════════════════════════════════
  // 텐진 구역 (W: X:2600-4400, Y:1800-3600)
  // ══════════════════════════════════════════════════════
  setupTenjinDistrict() {
    this.createNPCs([
      { x: 3200, y: 2600, texture: 'shop',
        name_ko: '텐진 안내원', name_ja: '天神案内員',
        greeting_ko: '텐진에 오신 걸 환영해요!\n쇼핑과 먹거리가 가득한 거리예요.',
        greeting_ja: '天神へようこそ！\nショッピングとグルメが満載の街です。' },
      { x: 3400, y: 2400, texture: 'mission_npc',
        name_ko: '백화점 직원', name_ja: 'デパート店員', hasMission: true,
        greeting_ko: '백화점에 오셨어요?\n한국 화장품도 있어요!',
        greeting_ja: 'デパートへようこそ！\n韓国コスメもありますよ！' },
      { x: 3200, y: 2200, texture: 'shop',
        name_ko: '택시 기사', name_ja: 'タクシー運転手',
        greeting_ko: '텐진에서 택시 타실래요?\n어디든 모셔다 드릴게요!',
        greeting_ja: '天神からタクシーですか？\nどこでもお連れしますよ！' },
      { x: 3800, y: 2600, texture: 'shop',
        name_ko: '쇼핑 가이드', name_ja: 'ショッピングガイド',
        greeting_ko: '텐진 쇼핑 가이드예요!\n텐진 지하가가 유명해요~',
        greeting_ja: '天神ショッピングガイドです！\n天神地下街が有名ですよ～' },
    ]);
    this.createBuildings([
      { x: 3200, y: 2600, texture: 'building_shop', name_ko: '텐진 지하가 / 天神地下街' },
      { x: 3400, y: 2400, texture: 'building_shop', name_ko: '텐진코어/솔라리아 / 天神コア' },
      { x: 3600, y: 2800, texture: 'building_shop', name_ko: '아크로스 후쿠오카 / アクロス福岡' },
      { x: 3600, y: 2200, texture: 'building_shop', name_ko: '케고공원 / 警固公園' },
      { x: 3800, y: 3000, texture: 'building_shop', name_ko: '텐진중앙공원 / 天神中央公園' },
      { x: 2400, y: 2900, texture: 'building_shop', name_ko: '오호리공원 / 大濠公園' },
      // 추가 랜드마크
      { x: 3600, y: 2300, texture: 'building_shop', name_ko: '솔라리아 / ソラリアプラザ' },
      { x: 3000, y: 2400, texture: 'building_shop', name_ko: '다이마루 / 大丸百貨店' },
      { x: 3200, y: 2200, texture: 'building_shop', name_ko: '미츠코시 / 三越' },
      { x: 2300, y: 2800, texture: 'building_shop', name_ko: '후쿠오카 미술관 / 福岡市美術館' },
      // 마이즈루 공원 + 후쿠오카 성터
      { x: 2600, y: 2200, texture: 'building_shop', name_ko: '마이즈루공원 / 舞鶴公園' },
      { x: 2800, y: 2000, texture: 'building_shop', name_ko: '후쿠오카성터 / 福岡城跡' },
      // 오호리 보트장
      { x: 2200, y: 3100, texture: 'building_shop', name_ko: '오호리 보트장 / 大濠ボートハウス' },
    ]);
    // Phase 6C: 추가 NPC
    this.createNPCs([
      { x: 3600, y: 2400, texture: 'shop',
        name_ko: '텐진 미용사', name_ja: '天神の美容師',
        greeting_ko: '헤어 스타일 바꿔보실래요? (ヘアスタイル変えてみませんか？)\n텐진 지하상가 구경하셨어요?',
        greeting_ja: 'ヘアスタイル変えてみませんか？\n天神地下街見ましたか？' },
    ]);
    this.createSubwayEntrance(3400, 2600, 'FukuokaMetroScene', 'tenjin',
      '텐진역 🚇', '天神駅');
  }

  // ══════════════════════════════════════════════════════
  // 나카스 구역 (섬: X:4450-4700, Y:2000-4200)
  // ══════════════════════════════════════════════════════
  setupNakasuDistrict() {
    this.createNPCs([
      { x: 4560, y: 3000, texture: 'mission_npc',
        name_ko: '야타이 사장님', name_ja: '屋台の親父', hasMission: true,
        greeting_ko: '나카스 야타이에 오신 걸 환영해요!\n라멘 한 그릇 드세요~',
        greeting_ja: '中洲屋台へようこそ！\nラーメン一杯いかがですか～' },
      { x: 4580, y: 2500, texture: 'shop',
        name_ko: '포장마차 아주머니', name_ja: '屋台のおばちゃん',
        greeting_ko: '어서오세요! 오뎅이랑 소주 있어요~\n야타이에서 즐기세요!',
        greeting_ja: 'いらっしゃい！おでんとお酒ありますよ～\n屋台で楽しんで！' },
      { x: 4540, y: 3500, texture: 'mission_npc',
        name_ko: '바텐더', name_ja: 'バーテンダー', hasMission: true,
        greeting_ko: '나카스의 밤은 아직 시작이에요!\n뭘 드릴까요?',
        greeting_ja: '中洲の夜はまだまだこれから！\n何にしますか？' },
    ]);
    this.createBuildings([
      { x: 4560, y: 3000, texture: 'building_restaurant', name_ko: '나카스 야타이 / 中洲屋台' },
      { x: 4560, y: 2400, texture: 'building_shop', name_ko: '하카타좌 / 博多座' },
      { x: 4560, y: 2700, texture: 'building_shop', name_ko: '하카타 리버레인 / リバレイン' },
      { x: 4560, y: 3300, texture: 'building_shop', name_ko: '아시아미술관 / アジア美術館' },
      { x: 4580, y: 2200, texture: 'building_restaurant', name_ko: '야타이거리(북) / 屋台通り(北)' },
      { x: 4540, y: 3600, texture: 'building_restaurant', name_ko: '야타이거리(남) / 屋台通り(南)' },
      { x: 4560, y: 3900, texture: 'building_shop', name_ko: '나카스 클럽거리 / 中洲クラブ通り' },
    ]);
    this.createSubwayEntrance(4560, 3100, 'FukuokaMetroScene', 'nakasu',
      '나카스카와바타역 🚇', '中洲川端駅');
  }

  // ══════════════════════════════════════════════════════
  // 하카타 구역 (E: X:5400-7800, Y:1800-4200)
  // ══════════════════════════════════════════════════════
  setupHakataDistrict() {
    this.createNPCs([
      { x: 5600, y: 3600, texture: 'shop',
        name_ko: '라멘 사장님', name_ja: 'ラーメン店主',
        greeting_ko: '하카타 라멘 드셔보세요!\n돈코츠 라멘이 제일 유명해요~',
        greeting_ja: '博多ラーメンいかがですか！\n豚骨ラーメンが一番有名ですよ～' },
      { x: 6400, y: 2800, texture: 'mission_npc',
        name_ko: '하카타역 안내원', name_ja: '博多駅案内員', hasMission: true,
        greeting_ko: '하카타역에 오신 걸 환영합니다!\n쇼핑몰과 먹거리가 많아요.',
        greeting_ja: '博多駅へようこそ！\nショッピングモールとグルメがたくさんあります。' },
      { x: 6400, y: 3200, texture: 'shop',
        name_ko: '역무원', name_ja: '駅員',
        greeting_ko: '하카타역에 오신 걸 환영해요!\n하카타-텐진은 지하철로 5분!',
        greeting_ja: '博多駅へようこそ！\n博多-天神は地下鉄で5分！' },
    ]);
    this.createBuildings([
      { x: 6400, y: 2800, texture: 'building_station', name_ko: '하카타역 / 博多駅' },
      { x: 6600, y: 2800, texture: 'building_shop', name_ko: '하카타역 동쪽 광장 / 博多駅東' },
      { x: 5400, y: 3600, texture: 'building_shop', name_ko: '캐널시티 하카타 / キャナルシティ' },
      { x: 5600, y: 3600, texture: 'building_restaurant', name_ko: '라멘스타디움 / ラーメンスタジアム' },
      { x: 5200, y: 3200, texture: 'building_shop', name_ko: '쿠시다신사 / 櫛田神社' },
      { x: 5400, y: 3000, texture: 'building_shop', name_ko: '하카타 마치야 / 博多町家' },
      { x: 6500, y: 1400, texture: 'building_shop', name_ko: '마린메세 후쿠오카 / マリンメッセ' },
      { x: 6800, y: 1600, texture: 'building_tower', name_ko: '하카타 포트타워 / 博多ポートタワー' },
      // 추가 랜드마크
      { x: 6000, y: 4200, texture: 'building_shop', name_ko: '⛩ 스미요시신사 / 住吉神社' },
      { x: 5800, y: 2400, texture: 'building_shop', name_ko: '⛩ 토초지 / 東長寺' },
      { x: 4800, y: 3200, texture: 'building_restaurant', name_ko: '🍜 이치란 본점 / 一蘭本店' },
    ]);
    this.createNPCs([
      ...[], // (기존 NPC 유지)
      { x: 4800, y: 3300, texture: 'shop',
        name_ko: '이치란 점원', name_ja: '一蘭店員',
        greeting_ko: '이치란 라멘에 오신 걸 환영해요!\n주문은 칸막이 자리에서 해주세요~',
        greeting_ja: '一蘭ラーメンへようこそ！\nご注文は味集中カウンターでどうぞ～' },
    ]);
    // Phase 6C: 추가 NPC
    this.createNPCs([
      { x: 6600, y: 3000, texture: 'shop',
        name_ko: '호텔 컨시어지', name_ja: 'ホテルコンシェルジュ',
        greeting_ko: '하카타역에서 가까운 호텔이에요 (博多駅に近いホテルです)\n하카타 라멘 맛집 추천해 드릴까요?',
        greeting_ja: '博多駅に近いホテルです\n博多ラーメンの名店おすすめしましょうか？' },
    ]);
    this.createSubwayEntrance(6400, 3000, 'FukuokaMetroScene', 'hakata',
      '하카타역 🚇', '博多駅');
  }

  // ══════════════════════════════════════════════════════
  // 야쿠인 구역 (SW: X:2600-4400, Y:4000-6200)
  //   게임 시작 지점 — 캐릭터 집 + 학원 + 서점
  // ══════════════════════════════════════════════════════
  setupYakuinDistrict() {
    this.createNPCs([
      { x: 3300, y: 5000, texture: 'ami',
        name_ko: '아미', name_ja: 'アミ', hasDialogue: true,
        greeting_ko: '유코야! 한글 공부 시작하자!\nBTX 가사 읽고 싶지 않아?',
        greeting_ja: 'ユコ！ハングル勉強始めよう！\nBTXの歌詞読みたくない？' },
      { x: 3600, y: 5100, texture: 'rui',
        name_ko: '루이', name_ja: 'ルイ', hasDialogue: true,
        greeting_ko: '한국어 교재 샀어!\n같이 공부할까?',
        greeting_ja: '韓国語テキスト買ったよ！\n一緒に勉強する？' },
      { x: 3000, y: 4500, texture: 'mission_npc',
        name_ko: '한국어 선생님', name_ja: '韓国語の先生', hasMission: true,
        greeting_ko: '안녕하세요! 한글을 배워 볼까요?\n자음과 모음부터 시작해요!',
        greeting_ja: 'こんにちは！ハングルを学んでみましょうか？\n子音と母音から始めましょう！' },
      { x: 4000, y: 4500, texture: 'mission_npc',
        name_ko: '서점 직원', name_ja: '書店員', hasMission: true,
        greeting_ko: '한국어 교재 찾으세요?\n초보자용 교재가 여기 있어요!',
        greeting_ja: '韓国語テキストをお探しですか？\n初心者用テキストはこちらです！' },
      { x: 3400, y: 4800, texture: 'shop',
        name_ko: '편의점 점원', name_ja: 'コンビニ店員',
        greeting_ko: '어서오세요! 필요하신 거 있으세요?',
        greeting_ja: 'いらっしゃいませ！何かお探しですか？' },
    ]);

    // 진입 가능 건물
    this.createEnterableBuilding(3000, 5200, 'YukoHouseScene', {
      texture: 'building_house', name_ko: '유코 집', name_ja: 'ユコの家'
    });
    this.createEnterableBuilding(3300, 5000, 'AmiHouseScene', {
      texture: 'building_house', name_ko: '아미 집', name_ja: 'アミの家'
    });
    this.createEnterableBuilding(3600, 5200, 'RuiHouseScene', {
      texture: 'building_house', name_ko: '루이 집', name_ja: 'ルイの家'
    });
    this.createEnterableBuilding(4000, 4600, 'BookstoreScene', {
      texture: 'building_shop', name_ko: '서점', name_ja: '書店（紀野丸）'
    });
    this.createEnterableBuilding(3000, 4600, 'KoreanAcademyScene', {
      texture: 'building_academy', name_ko: '한국어 학원', name_ja: '韓国語教室'
    });

    this.createBuildings([
      { x: 3400, y: 4700, texture: 'building_shop', name_ko: '편의점 / コンビニ' },
      // 추가 랜드마크
      { x: 3400, y: 5000, texture: 'building_shop', name_ko: '야쿠인역 플라자 / 薬院駅ビル' },
      { x: 3800, y: 5600, texture: 'building_shop', name_ko: '이온몰 / イオンモール' },
    ]);

    // Phase 6C: 추가 NPC
    this.createNPCs([
      { x: 3600, y: 4800, texture: 'shop',
        name_ko: '카페 마스터', name_ja: 'カフェマスター',
        greeting_ko: '오늘의 스페셜 커피 드셔보세요! (今日のスペシャルコーヒーどうぞ！)\n야쿠인은 카페 거리로 유명해요',
        greeting_ja: '今日のスペシャルコーヒーどうぞ！\n薬院はカフェ通りで有名です' },
    ]);
    this.createSubwayEntrance(3400, 5200, 'FukuokaMetroScene', 'yakuin',
      '야쿠인역 🚇', '薬院駅');
  }

  // ══════════════════════════════════════════════════════
  // 하카타항 구역 (N: X:5800-7200, Y:600-1400)
  // ══════════════════════════════════════════════════════
  setupHakataPortDistrict() {
    this.createNPCs([
      { x: 6600, y: 900, texture: 'shop',
        name_ko: '페리 직원', name_ja: 'フェリー係員',
        greeting_ko: '부산행 카멜리아호 타실 건가요?\n3시간이면 부산이에요!',
        greeting_ja: '釜山行きカメリア号にお乗りですか？\n3時間で釜山です！' },
      { x: 6000, y: 1100, texture: 'shop',
        name_ko: '항만 안내원', name_ja: '港案内員',
        greeting_ko: '하카타항에 오신 걸 환영해요!\n국제터미널은 이쪽이에요~',
        greeting_ja: '博多港へようこそ！\n国際ターミナルはこちらです～' },
    ]);
    this.createBuildings([
      { x: 6200, y: 1000, texture: 'building_station', name_ko: '하카타항 국제터미널 / 博多港国際ターミナル' },
      { x: 6600, y: 800, texture: 'building_shop', name_ko: '부산행 페리터미널 / 釜山行きフェリー' },
      { x: 5900, y: 1200, texture: 'building_shop', name_ko: '크루즈선 터미널 / クルーズターミナル' },
      { x: 6000, y: 1000, texture: 'building_shop', name_ko: '베이사이드 플레이스 / ベイサイドプレイス' },
    ]);

    // ── Phase 6C: 하카타항 확장 ──
    this.createNPCs([
      { x: 6400, y: 1100, texture: 'shop',
        name_ko: '항구 경비원', name_ja: '港警備員',
        greeting_ko: '하카타항에 오신 걸 환영합니다! (博多港へようこそ！)\n이 항구는 부산행 페리가 출발해요 (この港から釜山行きフェリーが出ます)',
        greeting_ja: '博多港へようこそ！\nこの港から釜山行きフェリーが出ます。税関申告しましたか？' },
      { x: 5900, y: 1000, texture: 'shop',
        name_ko: '수산시장 아저씨', name_ja: '魚市場のおじさん',
        greeting_ko: '오늘 아침 잡은 신선한 생선이에요! (今朝獲れた新鮮な魚です！)\n참치회 드셔보세요! (マグロの刺身食べてみてください！)',
        greeting_ja: '今朝獲れた新鮮な魚です！\nマグロの刺身食べてみてください！' },
      { x: 6800, y: 1000, texture: 'shop',
        name_ko: '관광버스 가이드', name_ja: '観光バスガイド',
        greeting_ko: '하카타항 크루즈 투어 어떠세요? (博多港クルーズツアーいかがですか？)\n노코노시마 행 페리가 곧 출발해요!',
        greeting_ja: '博多港クルーズツアーいかがですか？\n能古島行きフェリーがまもなく出発します！' },
    ]);
    this.createBuildings([
      { x: 5800, y: 900, texture: 'building_shop', name_ko: '수산시장 / 魚市場' },
      { x: 6200, y: 800, texture: 'building_shop', name_ko: '세관 / 税関' },
      { x: 6800, y: 800, texture: 'building_shop', name_ko: '화물터미널 / 貨物ターミナル' },
      { x: 6400, y: 1200, texture: 'building_shop', name_ko: '해양박물관 / 海洋博物館' },
    ]);
  }

  // ══════════════════════════════════════════════════════
  // 노코노시마 콘텐츠
  // ══════════════════════════════════════════════════════
  setupNokonoshimaDistrict() {
    this.createNPCs([
      { x: 1100, y: 600, texture: 'shop',
        name_ko: '노코노시마 농부', name_ja: '能古島の農夫',
        greeting_ko: '꽃공원에 오셨어요? 계절마다 다른 꽃이 피어요!\n노코노시마는 후쿠오카에서 페리로 10분이에요',
        greeting_ja: '花公園にいらしたんですか？季節ごとに違う花が咲きますよ！\n能古島は福岡からフェリーで10分です' },
    ]);
    this.createBuildings([
      { x: 800, y: 400, texture: 'building_shop', name_ko: '노코노시마 꽃공원 / 能古島花公園' },
      { x: 1400, y: 500, texture: 'building_shop', name_ko: '능고신사 / 能古神社' },
      { x: 1200, y: 800, texture: 'building_shop', name_ko: '전망대 / 展望台' },
    ]);

    // 페리 라벨
    this.add.text(3000, 500, '🚢 페리 10분 / フェリー10分', {
      fontSize: '14px', fontFamily: 'monospace',
      color: '#4488cc', backgroundColor: '#00000066',
      padding: { x: 6, y: 3 }
    }).setDepth(5).setOrigin(0.5);
  }

  // ══════════════════════════════════════════════════════
  // 남부/서부 구역 보강
  // ══════════════════════════════════════════════════════
  setupMinamiArea() {
    // 남부 NPC
    this.createNPCs([
      { x: 4000, y: 6200, texture: 'shop',
        name_ko: '미나미 주민', name_ja: '南区の住民',
        greeting_ko: '이 동네는 조용하고 살기 좋아요 (この街は静かで住みやすいです)\n근처에 좋은 라멘집이 있어요!',
        greeting_ja: 'この街は静かで住みやすいです\n近くにいいラーメン屋がありますよ' },
      { x: 5000, y: 6500, texture: 'shop',
        name_ko: '학생', name_ja: '学生',
        greeting_ko: '학교 끝나고 놀러 왔어요! (学校終わって遊びに来ました)\n이 공원에서 자주 놀아요',
        greeting_ja: '学校終わって遊びに来ました！\nこの公園でよく遊びます' },
    ]);
    // 서부 NPC
    this.createNPCs([
      { x: 600, y: 3000, texture: 'shop',
        name_ko: '니시 어부', name_ja: '西の漁師',
        greeting_ko: '무로미강에서 낚시해요 (室見川で釣りしてます)\n서쪽 해안은 석양이 예뻐요',
        greeting_ja: '室見川で釣りしてます\n西の海岸は夕日がきれいです' },
    ]);
    // 남부 건물
    this.createBuildings([
      { x: 3800, y: 6000, texture: 'building_shop', name_ko: '편의점 / コンビニ' },
      { x: 5200, y: 6300, texture: 'building_shop', name_ko: '남부초등학교 / 南部小学校' },
    ]);
    // 서부 건물
    this.createBuildings([
      { x: 500, y: 2800, texture: 'building_shop', name_ko: '해산물가게 / 海鮮物店' },
    ]);
  }

  // ══════════════════════════════════════════════════════
  // 라벨 시스템 — 구역, 수역, 도로 표지판
  // ══════════════════════════════════════════════════════
  addDistrictLabels() {
    const s = this.uiScale;
    const ds = (c) => ({ fontSize: `${Math.round(16*s)}px`, color: c, fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 10, y: 5 } });
    const ss = (c) => ({ fontSize: `${Math.round(10*s)}px`, color: c, backgroundColor: '#00000066', padding: { x: 6, y: 3 } });
    const st = { fontSize: `${Math.round(9*s)}px`, color: '#ffffff', backgroundColor: '#2255aa', padding: { x: 6, y: 3 } };

    // 구역 라벨
    [[1800,1160,4],[3500,1860,0],[4570,2060,3],[6600,1860,1],[3500,4060,2],[6400,660,5]]
    .forEach(([x,y,i]) => {
      const d = this._districts[i];
      this.add.text(x, y, d.name, ds(d.color)).setOrigin(0.5).setDepth(3);
      this.add.text(x, y + 30, d.sub, ss(d.color)).setOrigin(0.5).setDepth(3);
    });

    // 하카타만 라벨
    this.add.text(4800, 400, '── 하카타만 · 博多湾 · Hakata Bay ──', {
      fontSize: `${Math.round(12*s)}px`, color: '#5588bb',
      fontStyle: 'italic', backgroundColor: '#00000066', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(3);

    // 하카타항 라벨
    this.add.text(6400, 900, '⚓ 博多港 · 하카타항 · Hakata Port', {
      fontSize: `${Math.round(10*s)}px`, color: '#4682B4',
      fontStyle: 'bold', backgroundColor: '#00000088', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(3);

    // 노코노시마 라벨
    this.add.text(1200, 650, '🏝️ 能古島 / 노코노시마', {
      fontSize: `${Math.round(9*s)}px`, color: '#3a7a3a',
      backgroundColor: '#00000066', padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(3);

    // 수역 라벨
    [[4370,2500,'那珂川 · 나카가와'],[4770,2500,'博多川 · 하카타강'],[1450,3500,'室見川 · 무로미강'],[2600,2850,'大濠公園 · 오호리공원']].forEach(([x,y,t]) => {
      this.add.text(x, y, t, {
        fontSize: `${Math.round(10*s)}px`, color: '#5588bb',
        fontStyle: 'italic', backgroundColor: '#00000066', padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(3);
    });

    // 모모치 해변 라벨
    this.add.text(1500, 1050, 'ももちビーチ / 모모치해변', {
      fontSize: `${Math.round(9*s)}px`, color: '#4a8acc',
      fontStyle: 'italic', backgroundColor: '#00000066', padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(3);

    // 공항 라벨
    this.add.text(7400, 4200, '✈ 福岡空港 · 후쿠오카공항', {
      fontSize: `${Math.round(12*s)}px`, color: '#4a6a8a',
      fontStyle: 'bold', backgroundColor: '#ffffffcc', padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setDepth(3);

    // 산/외곽 라벨
    this.add.text(8500, 5500, '→ 다자이후 / 太宰府方面', {
      fontSize: `${Math.round(10*s)}px`, color: '#6a6a6a',
      fontStyle: 'italic', backgroundColor: '#00000044', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(3);

    // 거리 표지판
    [[2000,2910,'昭和通り / 쇼와도리 →'],[7500,2910,'← 昭和通り / 쇼와도리'],
     [3450,1500,'↑ 渡辺通り / 와타나베도리'],[6250,1500,'↑ 大博通り / 다이하쿠도리'],
     [3200,2310,'明治通り / 메이지도리 →'],[6500,2310,'← 明治通り / 메이지도리'],
     [7850,2000,'↑ 国道3号 / 국도3호'],[5830,1500,'↑ 駅前通り / 에키마에도리'],
     [1500,1540,'← モモチ通り / 모모치도리'],[3200,3540,'日枝通り / 히에도리 →']
    ].forEach(([x,y,t]) => {
      this.add.text(x, y, t, st).setOrigin(0.5).setDepth(15);
    });
  }
}
