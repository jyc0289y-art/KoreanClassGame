import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// SeoulUnifiedScene v2 — 위성사진 스타일 서울 통합맵 (9600x7200)
//
//  Google Maps 위성뷰를 연상시키는 스타일화된 도시 맵
//  토지용도별 색상 + 넓은 도로 + 시가지 블록 + 가로수 + 한강
// ============================================================

export default class SeoulUnifiedScene extends BaseWorldScene {
  constructor() { super('SeoulUnifiedScene'); }

  create() {
    this.worldWidth = 9600;
    this.worldHeight = 7200;
    gameState.setRegion('seoul');

    // ── 구역 경계 정의 (구역 전환 감지용) ──
    this._districts = [
      { id: 'hongdae', name: '홍대 弘大', sub: 'ホンデ · Hongdae', color: '#DA70D6',
        x: 400, y: 800, w: 2400, h: 2600 },
      { id: 'myeongdong', name: '명동 明洞', sub: 'ミョンドン · Myeongdong', color: '#FF69B4',
        x: 3600, y: 800, w: 2400, h: 2600 },
      { id: 'seongsu', name: '성수동 聖水洞', sub: 'ソンス · Seongsu', color: '#00CED1',
        x: 6800, y: 800, w: 2400, h: 2600 },
      { id: 'gangnam', name: '강남 江南', sub: 'カンナム · Gangnam', color: '#FFD700',
        x: 3600, y: 4600, w: 2400, h: 2200 }
    ];
    this._lastWelcomeDistrict = null;

    // ── 스폰 포인트 ──
    this.stationSpawnPoints = {
      hongdae:    { x: 1600, y: 3080 },
      myeongdong: { x: 4800, y: 2880 },
      seongsu:    { x: 8000, y: 2880 },
      gangnam:    { x: 4800, y: 5880 },
      incheon_airport: { x: 4800, y: 2800 }
    };

    this.placeSpawnPoints = {
      OliveYoungScene:  { x: 4800, y: 1900 },
      HiKRGroundScene:  { x: 4200, y: 1500 },
      HotelScene:       { x: 5600, y: 2300 },
      RestaurantScene:  { x: 5200, y: 5500 }
    };

    this.createWorld({
      startX: 4800, startY: 2800,
      tiles: '__terrain__',
      npcs: [],
      buildings: []
    });

    // ── 지형 렌더링 (v2) ──
    this.drawTerrain();

    // ── 지역별 건물 + NPC + 지하철역 배치 ──
    this.setupHongdaeDistrict();
    this.setupMyeongdongDistrict();
    this.setupSeongsuDistrict();
    this.setupGangnamDistrict();

    // ── 지역 라벨 ──
    this.addDistrictLabels();

    this.showSceneTitle('서울', 'ソウル · Seoul', 'Ch.1-2 서울 통합맵', '#FF69B4');
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
  // 지형 렌더링 v2
  // ══════════════════════════════════════════════════════
  drawTerrain() {
    this.createTerrainGraphics({
      baseColor: 0x7a9a6a,  // 일반 녹지 (도시 외곽)

      // ── 토지용도 구역 (불투명, 확실한 색상 차이) ──
      landUse: [
        // 산지대 (Y<600) — 짙은 초록
        { x: 0, y: 0, w: 9600, h: 600, color: 0x2a5a2a, alpha: 1.0, border: false },
        // 산지→시가지 그라데이션
        { x: 0, y: 600, w: 9600, h: 200, color: 0x4a7a4a, alpha: 0.7, border: false },

        // ── 홍대 ──
        // 홍대 상업 (밝은 콘크리트 + 보라 틴트)
        { x: 400, y: 1000, w: 2400, h: 1600, color: 0xb8a8b8, alpha: 1.0 },
        // 홍대 주거 (녹회색)
        { x: 400, y: 2600, w: 2400, h: 800, color: 0x8a9a80, alpha: 1.0 },

        // ── 명동 ──
        // 명동 상업 (밝은 콘크리트 + 핑크 틴트)
        { x: 3600, y: 1000, w: 2400, h: 1800, color: 0xc0b0b0, alpha: 1.0 },
        // 명동 북쪽 (남산 방면 녹지)
        { x: 3600, y: 800, w: 2400, h: 200, color: 0x5a8a5a, alpha: 0.8 },

        // ── 성수 ──
        // 성수 산업지구 (그레이)
        { x: 6800, y: 1000, w: 2400, h: 1200, color: 0xa09890, alpha: 1.0 },
        // 성수 카페거리 (벽돌 베이지)
        { x: 6800, y: 2200, w: 2400, h: 1200, color: 0xb0a088, alpha: 1.0 },

        // ── 한강 둔치 ──
        { x: 0, y: 3400, w: 9600, h: 200, color: 0x6aaa5a, alpha: 1.0, border: false },
        { x: 0, y: 4200, w: 9600, h: 200, color: 0x6aaa5a, alpha: 1.0, border: false },

        // ── 강남 ──
        // 강남 상업 (모던 그레이)
        { x: 3600, y: 4600, w: 2400, h: 1400, color: 0xb0b0a8, alpha: 1.0 },
        // 강남 주거 (고급 녹지)
        { x: 3600, y: 6000, w: 2400, h: 800, color: 0x8aa880, alpha: 1.0 },

        // ── 빈 공간: 지역 사이 일반 도시 ──
        { x: 2800, y: 800, w: 800, h: 2600, color: 0x8a9a7a, alpha: 0.8, border: false },
        { x: 6000, y: 800, w: 800, h: 2600, color: 0x8a9a7a, alpha: 0.8, border: false },
      ],

      // ── 수역 ──
      water: [
        // 한강 본류 (곡선)
        {
          points: [
            [0, 3600], [800, 3580], [1600, 3560], [2400, 3580],
            [3200, 3600], [4000, 3620], [4800, 3640], [5600, 3660],
            [6400, 3680], [7200, 3660], [8000, 3640], [8800, 3620], [9600, 3600],
            [9600, 4200], [8800, 4180], [8000, 4200], [7200, 4220],
            [6400, 4240], [5600, 4220], [4800, 4200], [4000, 4180],
            [3200, 4160], [2400, 4140], [1600, 4120], [800, 4140], [0, 4160]
          ],
          color: 0x2a5a8a, alpha: 1.0,
          bank: { width: 15, color: 0x8a7a5a, alpha: 0.6 }
        },
        // 한강 표면 하이라이트
        {
          points: [
            [0, 3720], [2400, 3700], [4800, 3740], [7200, 3760], [9600, 3730],
            [9600, 3820], [7200, 3850], [4800, 3830], [2400, 3800], [0, 3820]
          ],
          color: 0x4a8aba, alpha: 0.3
        },
        // 한강 파문
        {
          points: [
            [0, 3850], [3200, 3870], [6400, 3890], [9600, 3860],
            [9600, 3870], [6400, 3900], [3200, 3880], [0, 3860]
          ],
          color: 0xffffff, alpha: 0.04
        }
      ],

      // ── 도로 네트워크 (대폭 확대) ──
      roads: [
        // === 대로 (160px) ===
        // 종로 (동서 대로)
        { x: 400, y: 1520, w: 8800, h: 160, color: 0x606060, type: 'major' },
        // 세종대로 (남북) — 한강 북쪽
        { x: 4720, y: 600, w: 160, h: 2960, color: 0x606060, type: 'major' },
        // 강남대로 (남북) — 한강 남쪽
        { x: 4720, y: 4400, w: 160, h: 2400, color: 0x606060, type: 'major' },
        // 테헤란로 (동서)
        { x: 3600, y: 5320, w: 2400, h: 140, color: 0x606060, type: 'major' },

        // === 중로 (100px) ===
        // 홍대 걷고싶은거리 (남북)
        { x: 1550, y: 1000, w: 100, h: 1600, color: 0x686868, type: 'medium' },
        // 명동길 (남북)
        { x: 4350, y: 1000, w: 100, h: 1800, color: 0x686868, type: 'medium' },
        // 성수 카페로 (동서)
        { x: 6800, y: 2150, w: 2400, h: 100, color: 0x686868, type: 'medium' },
        // K-Idol Road (동서, 강남)
        { x: 3800, y: 5030, w: 2000, h: 80, color: 0x686868, type: 'medium' },

        // === 소로 (60px, 구역 내부) ===
        // 홍대 동서 소로
        { x: 400, y: 1900, w: 2400, h: 60, color: 0x707070 },
        { x: 400, y: 2400, w: 2400, h: 60, color: 0x707070 },
        // 홍대 남북 소로
        { x: 900, y: 1000, w: 60, h: 2600, color: 0x707070 },
        { x: 2200, y: 1000, w: 60, h: 2600, color: 0x707070 },

        // 명동 동서 소로
        { x: 3600, y: 1400, w: 2400, h: 60, color: 0x707070 },
        { x: 3600, y: 2200, w: 2400, h: 60, color: 0x707070 },
        // 명동 남북 소로
        { x: 5200, y: 1000, w: 60, h: 1800, color: 0x707070 },

        // 성수 동서 소로
        { x: 6800, y: 1400, w: 2400, h: 60, color: 0x707070 },
        { x: 6800, y: 2900, w: 2400, h: 60, color: 0x707070 },
        // 성수 남북 소로
        { x: 7600, y: 1000, w: 60, h: 2400, color: 0x707070 },
        { x: 8600, y: 1000, w: 60, h: 2400, color: 0x707070 },

        // 강남 동서 소로
        { x: 3600, y: 5700, w: 2400, h: 60, color: 0x707070 },
        // 강남 남북 소로
        { x: 4100, y: 4600, w: 60, h: 2200, color: 0x707070 },
        { x: 5400, y: 4600, w: 60, h: 2200, color: 0x707070 },
      ],

      // ── 횡단보도 (주요 교차로) ──
      crosswalks: [
        // 종로x세종대로
        { x: 4720, y: 1510, w: 160, dir: 'v' },
        { x: 4710, y: 1680, h: 160, dir: 'h' },
        // 종로x홍대거리
        { x: 1550, y: 1510, w: 100, dir: 'v' },
        // 종로x성수
        { x: 7600, y: 1510, w: 60, dir: 'v' },
        // 강남대로x테헤란로
        { x: 4720, y: 5310, w: 160, dir: 'v' },
      ],

      // ── 시가지 블록 (필러 건물) ──
      blocks: [
        // 홍대 (컬러풀, 중밀도)
        { x: 420, y: 1020, w: 480, h: 480, density: 'medium',
          palette: [0xb098c0, 0xc0a0b0, 0xa8a0c0, 0xb8a8a0] },
        { x: 970, y: 1020, w: 560, h: 480, density: 'medium',
          palette: [0xb098c0, 0xc0a0b0, 0xa8a0c0, 0xb8a8a0] },
        { x: 1660, y: 1020, w: 520, h: 480, density: 'medium',
          palette: [0xb098c0, 0xc0a0b0, 0xa8a0c0, 0xd0a8c0] },
        { x: 420, y: 1690, w: 1100, h: 500, density: 'medium',
          palette: [0xb098c0, 0xa898b0, 0xc0a0a0] },
        { x: 1660, y: 1690, w: 1120, h: 500, density: 'medium',
          palette: [0xb098c0, 0xa898b0, 0xc0a0a0] },
        { x: 420, y: 1970, w: 2360, h: 410, density: 'low',
          palette: [0x9a8a7a, 0xa89888, 0x8a8878] },
        { x: 420, y: 2470, w: 2360, h: 120, density: 'low',
          palette: [0x9a8a7a, 0xa89888, 0x8a8878] },

        // 명동 (고밀도 상업)
        { x: 3620, y: 1020, w: 710, h: 360, density: 'high',
          palette: [0xc0a8a8, 0xb8a0a0, 0xd0b0b0, 0xb8b0a8] },
        { x: 4460, y: 1020, w: 710, h: 360, density: 'high',
          palette: [0xc0a8a8, 0xb8a0a0, 0xd0b0b0, 0xb8b0a8] },
        { x: 5270, y: 1020, w: 710, h: 360, density: 'high',
          palette: [0xc0a8a8, 0xb8a0a0, 0xd0b0b0] },
        { x: 3620, y: 1470, w: 710, h: 710, density: 'high',
          palette: [0xc8b0a8, 0xb8a8a0, 0xc0b8b0] },
        { x: 4460, y: 1470, w: 710, h: 710, density: 'high',
          palette: [0xc8b0a8, 0xb8a8a0, 0xc0b8b0] },
        { x: 3620, y: 2270, w: 2360, h: 520, density: 'medium',
          palette: [0xb8a8a0, 0xa89890] },

        // 성수 (산업 창고형)
        { x: 6820, y: 1020, w: 760, h: 360, density: 'medium',
          palette: [0x908880, 0xa09890, 0x989088, 0x887870] },
        { x: 7680, y: 1020, w: 900, h: 360, density: 'medium',
          palette: [0x908880, 0xa09890, 0x887870] },
        { x: 8680, y: 1020, w: 500, h: 360, density: 'low',
          palette: [0x908880, 0xa09890] },
        { x: 6820, y: 1470, w: 2360, h: 670, density: 'medium',
          palette: [0x988878, 0xa89080, 0x908070] },
        // 성수 카페거리 (벽돌톤)
        { x: 6820, y: 2260, w: 2360, h: 620, density: 'medium',
          palette: [0xb09878, 0xa89070, 0xc0a888, 0xb8a080] },
        { x: 6820, y: 2970, w: 2360, h: 430, density: 'low',
          palette: [0xa09070, 0xb0a080] },

        // 강남 (모던 고층, 넓은 간격)
        { x: 3620, y: 4620, w: 460, h: 400, density: 'low',
          palette: [0xb0b0b0, 0xc0c0c0, 0xa8a8a8, 0xb8b8b8] },
        { x: 4170, y: 4620, w: 530, h: 400, density: 'low',
          palette: [0xb0b0b0, 0xc0c0c0, 0xa8a8a8] },
        { x: 4900, y: 4620, w: 480, h: 400, density: 'low',
          palette: [0xb0b0b0, 0xc0c0c0, 0xa8a8a8] },
        { x: 5470, y: 4620, w: 510, h: 400, density: 'low',
          palette: [0xb0b0b0, 0xc0c0c0] },
        { x: 3620, y: 5130, w: 1060, h: 560, density: 'medium',
          palette: [0xb0b0a8, 0xa8a8a0, 0xc0c0b8] },
        { x: 4900, y: 5470, w: 1080, h: 550, density: 'medium',
          palette: [0xb0b0a8, 0xa8a8a0] },
        { x: 3620, y: 5780, w: 2360, h: 480, density: 'low',
          palette: [0x98a890, 0x90a088, 0xa0a898] },
      ],

      // ── 식생 (가로수, 공원, 강변) ──
      vegetation: [
        // 홍대 가로수
        { type: 'streetTrees', x: 430, y: 1050, dir: 'v', length: 2500, spacing: 80, radius: 8 },
        { type: 'streetTrees', x: 2770, y: 1050, dir: 'v', length: 2500, spacing: 80, radius: 8 },
        // 명동 가로수
        { type: 'streetTrees', x: 3630, y: 1050, dir: 'v', length: 2200, spacing: 70, radius: 8 },
        { type: 'streetTrees', x: 5970, y: 1050, dir: 'v', length: 2200, spacing: 70, radius: 8 },
        // 성수 가로수
        { type: 'streetTrees', x: 6830, y: 1050, dir: 'v', length: 2300, spacing: 90, radius: 9 },
        // 종로 가로수
        { type: 'streetTrees', x: 450, y: 1500, dir: 'h', length: 8700, spacing: 120, radius: 8 },
        { type: 'streetTrees', x: 450, y: 1700, dir: 'h', length: 8700, spacing: 120, radius: 8 },
        // 세종대로 가로수
        { type: 'streetTrees', x: 4700, y: 650, dir: 'v', length: 2800, spacing: 100, radius: 9 },
        { type: 'streetTrees', x: 4900, y: 650, dir: 'v', length: 2800, spacing: 100, radius: 9 },
        // 강남대로 가로수
        { type: 'streetTrees', x: 4700, y: 4450, dir: 'v', length: 2300, spacing: 100, radius: 9 },
        { type: 'streetTrees', x: 4900, y: 4450, dir: 'v', length: 2300, spacing: 100, radius: 9 },
        // 테헤란로 가로수
        { type: 'streetTrees', x: 3620, y: 5300, dir: 'h', length: 2350, spacing: 80, radius: 7 },
        { type: 'streetTrees', x: 3620, y: 5480, dir: 'h', length: 2350, spacing: 80, radius: 7 },

        // 한강 둔치 녹지
        { type: 'riverbank', x: 0, y: 3420, dir: 'h', length: 9600 },
        { type: 'riverbank', x: 0, y: 4220, dir: 'h', length: 9600 },

        // 산지대 나무
        { type: 'park', x: 0, y: 0, w: 9600, h: 500, density: 0.5, radiusRange: [15, 35] },

        // 홍대 주거지 소규모 녹지
        { type: 'park', x: 600, y: 2650, w: 400, h: 300, density: 0.2, radiusRange: [10, 20] },
        // 강남 녹지
        { type: 'park', x: 3700, y: 6100, w: 500, h: 400, density: 0.25, radiusRange: [12, 25] },
      ],
    });

    // ── 다리 3개 ──
    this.drawBridges();
  }

  drawBridges() {
    const g = this.add.graphics().setDepth(0.5);

    const drawBridge = (x, topY, botY, label) => {
      const w = 160;
      // 그림자
      g.fillStyle(0x000000, 0.15);
      g.fillRect(x - w / 2 + 6, topY + 6, w, botY - topY);
      // 도로면
      g.fillStyle(0x707070, 0.9);
      g.fillRect(x - w / 2, topY, w, botY - topY);
      // 가장자리
      g.fillStyle(0x999999, 0.6);
      g.fillRect(x - w / 2, topY, 8, botY - topY);
      g.fillRect(x + w / 2 - 8, topY, 8, botY - topY);
      // 중앙선 (점선)
      g.lineStyle(2, 0xffffff, 0.2);
      const cx = x;
      for (let dy = topY; dy < botY; dy += 40) {
        g.lineBetween(cx, dy, cx, Math.min(dy + 20, botY));
      }
      // 라벨
      this.add.text(x, (topY + botY) / 2, label, {
        fontSize: '10px', color: '#cccccc',
        backgroundColor: '#00000066', padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(3);
    };

    drawBridge(1600, 3560, 4160, '마포대교');
    drawBridge(4800, 3560, 4200, '한남대교');
    drawBridge(7500, 3560, 4220, '성수대교');
  }

  // ══════════════════════════════════════════════════════
  // 홍대 구역 (NW: X:400-2800, Y:800-3400)
  // ══════════════════════════════════════════════════════
  setupHongdaeDistrict() {
    const ox = 400, oy = 800;

    this.createNPCs([
      { x: ox + 1200, y: oy + 900, texture: 'mission_npc',
        name_ko: '버스킹 아티스트', name_ja: 'バスキングアーティスト', hasMission: true,
        greeting_ko: '안녕하세요! 홍대 버스킹에 오신 걸 환영해요!\n한국 노래 한 곡 들으실래요?',
        greeting_ja: 'こんにちは！ホンデバスキングへようこそ！\n韓国の歌を一曲聴きませんか？' },
      { x: ox + 600, y: oy + 1400, texture: 'shop',
        name_ko: '벽화 화가', name_ja: '壁画アーティスト',
        greeting_ko: '이 벽화 예쁘죠?\n홍대는 예술의 거리예요!',
        greeting_ja: 'この壁画きれいでしょ？\nホンデはアートの街ですよ！' },
      { x: ox + 1800, y: oy + 700, texture: 'shop',
        name_ko: '카페 직원', name_ja: 'カフェ店員',
        greeting_ko: '어서오세요! 수제 커피 드실래요?\n홍대 카페 거리는 유명해요~',
        greeting_ja: 'いらっしゃいませ！手作りコーヒーいかがですか？\nホンデカフェ通りは有名ですよ～' }
    ]);

    this.createBuildings([
      { x: ox + 400, y: oy + 500, texture: 'building_shop', name_ko: '빈티지 숍 / ヴィンテージ' },
      { x: ox + 1700, y: oy + 500, texture: 'building_cafe', name_ko: '카페 거리 / カフェ通り' },
      { x: ox + 800, y: oy + 1600, texture: 'building_shop', name_ko: '잡화점 / 雑貨店' },
      { x: ox + 1600, y: oy + 1600, texture: 'building_shop', name_ko: 'K-POP 굿즈샵' }
    ]);

    this.createSubwayEntrance(ox + 1200, oy + 2200, 'SeoulMetroScene', 'hongdae',
      '홍대입구역 🚇', 'ホンデイック駅');
  }

  // ══════════════════════════════════════════════════════
  // 명동 구역 (NC: X:3600-6000, Y:800-3400)
  // ══════════════════════════════════════════════════════
  setupMyeongdongDistrict() {
    const ox = 3600, oy = 800;

    this.createNPCs([
      { x: ox + 700, y: oy + 900, texture: 'shop',
        name_ko: '화장품 가게 직원', name_ja: 'コスメショップ店員',
        greeting_ko: '어서오세요! 명동 화장품 가게입니다.\n한국 화장품 추천해 드릴까요?',
        greeting_ja: 'いらっしゃいませ！明洞コスメショップです。\n韓国コスメをおすすめしましょうか？' },
      { x: ox + 1700, y: oy + 1100, texture: 'mission_npc',
        name_ko: '관광안내원', name_ja: '観光案内員', hasMission: true,
        greeting_ko: '명동에 오신 걸 환영해요!\n맛있는 음식도 많고, 볼거리도 많아요.',
        greeting_ja: '明洞へようこそ！\n美味しいお店もたくさんありますよ。' },
      { x: ox + 1200, y: oy + 500, texture: 'shop',
        name_ko: '길거리 음식', name_ja: '屋台フード',
        greeting_ko: '떡볶이, 호떡, 어묵 있어요~!\n맛보실래요?',
        greeting_ja: 'トッポッキ、ホットク、おでんありますよ～！\n味見しませんか？' }
    ]);

    this.createEnterableBuilding(ox + 1200, oy + 1000, 'OliveYoungScene', {
      texture: 'building_oliveyoung', name_ko: '올리브숲', name_ja: 'OLIVE BLOOM'
    });
    this.createEnterableBuilding(ox + 600, oy + 600, 'HiKRGroundScene', {
      texture: 'building_shop', name_ko: '하이코그라운드', name_ja: 'HiKO Ground'
    });
    this.createEnterableBuilding(ox + 2000, oy + 1500, 'HotelScene', {
      texture: 'building_house', name_ko: '게스트하우스', name_ja: 'ゲストハウス'
    });

    this.createBuildings([
      { x: ox + 400, y: oy + 400, texture: 'building_shop', name_ko: '화장품 가게 / コスメ' },
      { x: ox + 1800, y: oy + 400, texture: 'building_shop', name_ko: '의류 매장 / アパレル' },
      { x: ox + 600, y: oy + 1500, texture: 'building_shop', name_ko: '기념품 가게 / お土産' },
      { x: ox + 1600, y: oy + 1800, texture: 'building_shop', name_ko: 'BU 편의점' }
    ]);

    this.createSubwayEntrance(ox + 1200, oy + 2000, 'SeoulMetroScene', 'myeongdong',
      '명동역 🚇', '明洞駅');
  }

  // ══════════════════════════════════════════════════════
  // 성수 구역 (NE: X:6800-9200, Y:800-3400)
  // ══════════════════════════════════════════════════════
  setupSeongsuDistrict() {
    const ox = 6800, oy = 800;

    this.createNPCs([
      { x: ox + 800, y: oy + 900, texture: 'mission_npc',
        name_ko: '팝업스토어 직원', name_ja: 'ポップアップストア店員', hasMission: true,
        greeting_ko: '성수동 팝업스토어에 오신 걸 환영해요!\n한정판 상품도 있어요!',
        greeting_ja: '聖水洞ポップアップストアへようこそ！\n限定商品もありますよ！' },
      { x: ox + 1700, y: oy + 800, texture: 'shop',
        name_ko: '카페 바리스타', name_ja: 'カフェバリスタ',
        greeting_ko: '성수동 카페에 오셨군요!\n수제 드립커피 한잔 하세요~',
        greeting_ja: '聖水洞カフェへようこそ！\nハンドドリップコーヒーいかがですか～' }
    ]);

    this.createBuildings([
      { x: ox + 600, y: oy + 500, texture: 'building_cafe', name_ko: '카페 / カフェ' },
      { x: ox + 1500, y: oy + 500, texture: 'building_shop', name_ko: '팝업스토어 / ポップアップ' },
      { x: ox + 800, y: oy + 1500, texture: 'building_shop', name_ko: '디자인 스튜디오' },
      { x: ox + 1800, y: oy + 1500, texture: 'building_cafe', name_ko: '디저트 카페' }
    ]);

    this.createSubwayEntrance(ox + 1200, oy + 2000, 'SeoulMetroScene', 'seongsu',
      '성수역 🚇', 'ソンス駅');
  }

  // ══════════════════════════════════════════════════════
  // 강남 구역 (SC: X:3600-6000, Y:4600-6800)
  // ══════════════════════════════════════════════════════
  setupGangnamDistrict() {
    const ox = 3600, oy = 4600;

    this.createNPCs([
      { x: ox + 800, y: oy + 600, texture: 'mission_npc',
        name_ko: 'K-Idol 안내원', name_ja: 'K-Idolガイド', hasMission: true,
        greeting_ko: 'K-Idol Road에 오신 걸 환영해요!\nK-POP 스타들의 핸드프린팅이 있어요!',
        greeting_ja: 'K-Idol Roadへようこそ！\nK-POPスターのハンドプリントがありますよ！' },
      { x: ox + 1800, y: oy + 1000, texture: 'shop',
        name_ko: '삼겹살 사장님', name_ja: 'サムギョプサル店主',
        greeting_ko: '어서오세요! 맛있는 삼겹살 있어요~\n한국에서 꼭 먹어봐야 해요!',
        greeting_ja: 'いらっしゃいませ！美味しいサムギョプサルありますよ～\n韓国で必ず食べるべきです！' }
    ]);

    this.createEnterableBuilding(ox + 1600, oy + 800, 'RestaurantScene', {
      texture: 'building_restaurant', name_ko: '삼겹살 식당', name_ja: 'サムギョプサル食堂'
    });

    this.createBuildings([
      { x: ox + 400, y: oy + 400, texture: 'building_shop', name_ko: '고엑스몰 / GOEXモール' },
      { x: ox + 1500, y: oy + 400, texture: 'building_shop', name_ko: '강남 스타일 조형물' },
      { x: ox + 600, y: oy + 1400, texture: 'building_shop', name_ko: '카페 / カフェ' }
    ]);

    this.createSubwayEntrance(ox + 1200, oy + 1200, 'SeoulMetroScene', 'gangnam',
      '강남역 🚇', 'カンナム駅');
  }

  // ══════════════════════════════════════════════════════
  // 지역 라벨 + 거리 표지판
  // ══════════════════════════════════════════════════════
  addDistrictLabels() {
    const s = this.uiScale;
    const districtStyle = (color) => ({
      fontSize: `${Math.round(16 * s)}px`, color, fontStyle: 'bold',
      backgroundColor: '#000000aa', padding: { x: 10, y: 5 }
    });
    const subStyle = (color) => ({
      fontSize: `${Math.round(10 * s)}px`, color,
      backgroundColor: '#00000066', padding: { x: 6, y: 3 }
    });
    const streetStyle = {
      fontSize: `${Math.round(9 * s)}px`, color: '#ffffff',
      backgroundColor: '#2255aa', padding: { x: 6, y: 3 }
    };

    // 구역 라벨
    this.add.text(1600, 860, '홍대 弘大', districtStyle('#DA70D6')).setOrigin(0.5).setDepth(3);
    this.add.text(1600, 920, 'ホンデ · Hongdae', subStyle('#DA70D6')).setOrigin(0.5).setDepth(3);

    this.add.text(4800, 860, '명동 明洞', districtStyle('#FF69B4')).setOrigin(0.5).setDepth(3);
    this.add.text(4800, 920, 'ミョンドン · Myeongdong', subStyle('#FF69B4')).setOrigin(0.5).setDepth(3);

    this.add.text(8000, 860, '성수동 聖水洞', districtStyle('#00CED1')).setOrigin(0.5).setDepth(3);
    this.add.text(8000, 920, 'ソンスドン · Seongsu', subStyle('#00CED1')).setOrigin(0.5).setDepth(3);

    this.add.text(4800, 4660, '강남 江南', districtStyle('#FFD700')).setOrigin(0.5).setDepth(3);
    this.add.text(4800, 4720, 'カンナム · Gangnam', subStyle('#FFD700')).setOrigin(0.5).setDepth(3);

    // 한강 라벨
    this.add.text(4800, 3880, '── 한강 · 漢江 · Han River ──', {
      fontSize: `${Math.round(12 * s)}px`, color: '#6aabdd',
      fontStyle: 'italic', backgroundColor: '#00000066', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(3);

    // 거리 표지판 (파란색 배경, 실제 한국 거리 표지판 스타일)
    this.add.text(2000, 1510, '종로 Jongno-ro →', streetStyle).setOrigin(0.5).setDepth(15);
    this.add.text(6000, 1510, '← 종로 Jongno-ro', streetStyle).setOrigin(0.5).setDepth(15);
    this.add.text(4850, 1200, '↑ 세종대로', streetStyle).setOrigin(0, 0.5).setDepth(15);
    this.add.text(4850, 4500, '↓ 강남대로', streetStyle).setOrigin(0, 0.5).setDepth(15);
    this.add.text(4400, 5310, '테헤란로 Teheran-ro →', streetStyle).setOrigin(0.5).setDepth(15);
    this.add.text(1550, 1250, '↑ 걷고싶은거리', streetStyle).setOrigin(0.5).setDepth(15);
    this.add.text(4350, 1250, '↑ 명동길', streetStyle).setOrigin(0.5).setDepth(15);
    this.add.text(8000, 2140, '← 카페 거리 →', streetStyle).setOrigin(0.5).setDepth(15);

    // 산지대 라벨
    this.add.text(4800, 300, '🏔️ 북한산 · 北漢山', {
      fontSize: `${Math.round(11 * s)}px`, color: '#3a6a3a',
      backgroundColor: '#00000044', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(3);
  }
}
