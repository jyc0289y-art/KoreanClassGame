import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// SeoulUnifiedScene — 서울 통합맵 (9600x7200)
//
//  실제 서울 지리 기반 레이아웃
//  ┌─────────────────────────────────────────────────────┐
//  │ 북한산/인왕산 (Y<600)                               │
//  │                                                     │
//  │ 홍대 (NW)          명동 (NC)          성수 (NE)     │
//  │ X:400-2800        X:3600-6000        X:6800-9200   │
//  │ Y:800-3400        Y:800-3400         Y:800-3400    │
//  │                                                     │
//  │  종로(Y≈1600)     세종대로(X≈4800)                  │
//  │                                                     │
//  ├═══════════ 한강 (Y:3600-4200) ══════════════════════┤
//  │  마포대교(X≈1600)  한남대교(X≈4800)  성수대교(X≈7500)│
//  │                                                     │
//  │               강남 (SC)                             │
//  │              X:3600-6000, Y:4600-6800               │
//  │  테헤란로(Y≈5400)  강남대로(X≈4800)                 │
//  └─────────────────────────────────────────────────────┘
// ============================================================

export default class SeoulUnifiedScene extends BaseWorldScene {
  constructor() { super('SeoulUnifiedScene'); }

  create() {
    this.worldWidth = 9600;
    this.worldHeight = 7200;
    gameState.setRegion('seoul');

    // ── 스폰 포인트: 지하철역에서 복귀 시 해당 역 근처 스폰 ──
    this.stationSpawnPoints = {
      hongdae:    { x: 1600, y: 3000 },
      myeongdong: { x: 4800, y: 2800 },
      seongsu:    { x: 8000, y: 2800 },
      gangnam:    { x: 4800, y: 5800 },
      // AREX에서 직접 올 경우
      incheon_airport: { x: 4800, y: 2800 }
    };

    // ── 장소맵에서 복귀 시 건물 근처 스폰 ──
    this.placeSpawnPoints = {
      OliveYoungScene:  { x: 4800, y: 1900 },
      HiKRGroundScene:  { x: 4200, y: 1500 },
      HotelScene:       { x: 5600, y: 2300 },
      RestaurantScene:  { x: 5200, y: 5500 }
    };

    this.createWorld({
      startX: 4800, startY: 2800,
      tiles: '__terrain__',  // createTerrainGraphics 사용 표시
      npcs: [],  // NPC는 아래에서 지역별로 배치
      buildings: []
    });

    // ── 지형 렌더링 (Graphics 기반) ──
    this.drawTerrain();

    // ── 지역별 건물 + NPC + 지하철역 배치 ──
    this.setupHongdaeDistrict();
    this.setupMyeongdongDistrict();
    this.setupSeongsuDistrict();
    this.setupGangnamDistrict();

    // ── 지역 라벨 ──
    this.addDistrictLabels();

    this.showSceneTitle('서울', 'ソウル · Seoul',
      'Ch.1-2 서울 통합맵', '#FF69B4');
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // ══════════════════════════════════════════════════════
  // 지형 렌더링
  // ══════════════════════════════════════════════════════
  drawTerrain() {
    this.createTerrainGraphics({
      baseColor: 0x2d5a1e,  // 기본 잔디

      zones: [
        // ── 산지대 (Y<600) ──
        { x: 0, y: 0, w: 9600, h: 600, color: 0x1a3a1a, alpha: 0.35 },

        // ── 홍대 구역 틴트 (보라) ──
        { x: 400, y: 800, w: 2400, h: 2600, color: 0xDA70D6, alpha: 0.06, radius: 30 },

        // ── 명동 구역 틴트 (핑크) ──
        { x: 3600, y: 800, w: 2400, h: 2600, color: 0xFF69B4, alpha: 0.05, radius: 30 },

        // ── 성수 구역 틴트 (시안) ──
        { x: 6800, y: 800, w: 2400, h: 2600, color: 0x00CED1, alpha: 0.05, radius: 30 },

        // ── 강남 구역 틴트 (골드) ──
        { x: 3600, y: 4600, w: 2400, h: 2200, color: 0xFFD700, alpha: 0.04, radius: 30 },

        // ── 한강 남안 평지 ──
        { x: 0, y: 4200, w: 9600, h: 400, color: 0x3a6a2a, alpha: 0.1 }
      ],

      water: [
        // ── 한강 본류 (서→동, 약간의 곡선) ──
        {
          points: [
            [0, 3600], [800, 3580], [1600, 3560], [2400, 3580],
            [3200, 3600], [4000, 3620], [4800, 3640], [5600, 3660],
            [6400, 3680], [7200, 3660], [8000, 3640], [8800, 3620], [9600, 3600],
            [9600, 4200], [8800, 4180], [8000, 4200], [7200, 4220],
            [6400, 4240], [5600, 4220], [4800, 4200], [4000, 4180],
            [3200, 4160], [2400, 4140], [1600, 4120], [800, 4140], [0, 4160]
          ],
          color: 0x1a3a6a, alpha: 1.0
        },
        // ── 한강 표면 하이라이트 ──
        {
          points: [
            [0, 3750], [2400, 3730], [4800, 3770], [7200, 3790], [9600, 3760],
            [9600, 3850], [7200, 3880], [4800, 3860], [2400, 3830], [0, 3850]
          ],
          color: 0x2a5a8a, alpha: 0.3
        }
      ],

      roads: [
        // ── 종로 (동서 대로, Y≈1600) ──
        { x: 400, y: 1576, w: 8800, h: 48, color: 0x555555, alpha: 0.7 },

        // ── 세종대로 / 강남대로 (남북 대로, X≈4800) ──
        { x: 4776, y: 600, w: 48, h: 3000, color: 0x555555, alpha: 0.7 },
        // 한강 남쪽 강남대로 연장
        { x: 4776, y: 4200, w: 48, h: 2600, color: 0x555555, alpha: 0.7 },

        // ── 테헤란로 (동서, Y≈5400, 강남 구역) ──
        { x: 3600, y: 5376, w: 2400, h: 48, color: 0x555555, alpha: 0.7 },

        // ── 홍대 내부도로 (남북) ──
        { x: 1576, y: 800, w: 48, h: 2200, color: 0x555555, alpha: 0.55 },
        // ── 홍대 내부도로 (동서) ──
        { x: 400, y: 1976, w: 2400, h: 40, color: 0x555555, alpha: 0.5 },

        // ── 명동길 (남북, 명동 구역) ──
        { x: 4776, y: 1000, w: 50, h: 1600, color: 0x888888, alpha: 0.55 },
        // ── 명동 동서도로 ──
        { x: 3800, y: 1800, w: 2000, h: 40, color: 0x555555, alpha: 0.5 },

        // ── 성수 내부도로 (남북) ──
        { x: 7976, y: 800, w: 48, h: 2200, color: 0x555555, alpha: 0.55 },
        // ── 성수 내부도로 (동서) ──
        { x: 6800, y: 1800, w: 2400, h: 40, color: 0x555555, alpha: 0.5 },

        // ── 강남 내부도로 (동서, K-Idol Road) ──
        { x: 3800, y: 5076, w: 2000, h: 40, color: 0x555555, alpha: 0.5 }
      ]
    });

    // ── 다리 3개 (한강 위) ──
    this.drawBridges();
  }

  drawBridges() {
    const g = this.add.graphics().setDepth(0.5);
    const s = this.uiScale;
    const bridgeColor = 0x888888;

    // 마포대교 (X≈1600)
    g.fillStyle(bridgeColor, 0.8);
    g.fillRect(1550, 3560, 100, 640);
    g.fillStyle(0xBBBBBB, 0.3);
    g.fillRect(1540, 3560, 10, 640);
    g.fillRect(1650, 3560, 10, 640);

    // 한남대교 (X≈4800)
    g.fillStyle(bridgeColor, 0.8);
    g.fillRect(4750, 3560, 100, 680);
    g.fillStyle(0xBBBBBB, 0.3);
    g.fillRect(4740, 3560, 10, 680);
    g.fillRect(4850, 3560, 10, 680);

    // 성수대교 (X≈7500)
    g.fillStyle(bridgeColor, 0.8);
    g.fillRect(7450, 3560, 100, 680);
    g.fillStyle(0xBBBBBB, 0.3);
    g.fillRect(7440, 3560, 10, 680);
    g.fillRect(7550, 3560, 10, 680);

    // 다리 라벨
    const labelStyle = {
      fontSize: `${Math.round(9 * s)}px`, color: '#aaaacc',
      backgroundColor: '#00000066', padding: { x: 4, y: 2 }
    };
    this.add.text(1600, 3900, '마포대교', labelStyle).setOrigin(0.5).setDepth(2);
    this.add.text(4800, 3900, '한남대교', labelStyle).setOrigin(0.5).setDepth(2);
    this.add.text(7500, 3900, '성수대교', labelStyle).setOrigin(0.5).setDepth(2);
  }

  // ══════════════════════════════════════════════════════
  // 홍대 구역 (NW: X:400-2800, Y:800-3400)
  // ══════════════════════════════════════════════════════
  setupHongdaeDistrict() {
    const ox = 400, oy = 800;  // 구역 원점 오프셋

    // NPC
    this.createNPCs([
      { x: ox + 1200, y: oy + 900, texture: 'mission_npc',
        name_ko: '버스킹 아티스트', name_ja: 'バスキングアーティスト', hasMission: true,
        greeting_ko: '안녕하세요! 홍대 버스킹에 오신 걸 환영해요!\n한국 노래 한 곡 들으실래요?',
        greeting_ja: 'こんにちは！ホンデバスキングへようこそ！\n韓国の歌を一曲聴きませんか？' },
      { x: ox + 600, y: oy + 1100, texture: 'shop',
        name_ko: '벽화 화가', name_ja: '壁画アーティスト',
        greeting_ko: '이 벽화 예쁘죠?\n홍대는 예술의 거리예요!',
        greeting_ja: 'この壁画きれいでしょ？\nホンデはアートの街ですよ！' },
      { x: ox + 1800, y: oy + 800, texture: 'shop',
        name_ko: '카페 직원', name_ja: 'カフェ店員',
        greeting_ko: '어서오세요! 수제 커피 드실래요?\n홍대 카페 거리는 유명해요~',
        greeting_ja: 'いらっしゃいませ！手作りコーヒーいかがですか？\nホンデカフェ通りは有名ですよ～' }
    ]);

    // 건물
    this.createBuildings([
      { x: ox + 400, y: oy + 600, texture: 'building_shop', name_ko: '빈티지 숍 / ヴィンテージ' },
      { x: ox + 1700, y: oy + 600, texture: 'building_cafe', name_ko: '카페 거리 / カフェ通り' },
      { x: ox + 800, y: oy + 1500, texture: 'building_shop', name_ko: '잡화점 / 雑貨店' },
      { x: ox + 1600, y: oy + 1500, texture: 'building_shop', name_ko: 'K-POP 굿즈샵' }
    ]);

    // 홍대입구역
    this.createSubwayEntrance(ox + 1200, oy + 2200, 'SeoulMetroScene', 'hongdae',
      '홍대입구역 🚇', 'ホンデイック駅');

    // 걷고싶은거리 오버레이
    const g = this.add.graphics().setDepth(0.5);
    g.fillStyle(0xDA70D6, 0.1);
    g.fillRect(ox + 300, oy + 700, 1800, 300);
    const s = this.uiScale;
    this.add.text(ox + 1200, oy + 690, '🎨 걷고싶은거리 / 歩きたい通り', {
      fontSize: `${Math.round(9 * s)}px`, color: '#DA70D6',
      backgroundColor: '#00000044', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(1);
  }

  // ══════════════════════════════════════════════════════
  // 명동 구역 (NC: X:3600-6000, Y:800-3400)
  // ══════════════════════════════════════════════════════
  setupMyeongdongDistrict() {
    const ox = 3600, oy = 800;

    // NPC
    this.createNPCs([
      { x: ox + 700, y: oy + 900, texture: 'shop',
        name_ko: '화장품 가게 직원', name_ja: 'コスメショップ店員',
        greeting_ko: '어서오세요! 명동 화장품 가게입니다.\n한국 화장품 추천해 드릴까요?',
        greeting_ja: 'いらっしゃいませ！明洞コスメショップです。\n韓国コスメをおすすめしましょうか？' },
      { x: ox + 1700, y: oy + 1100, texture: 'mission_npc',
        name_ko: '관광안내원', name_ja: '観光案内員', hasMission: true,
        greeting_ko: '명동에 오신 걸 환영해요!\n맛있는 음식도 많고, 볼거리도 많아요.',
        greeting_ja: '明洞へようこそ！\n美味しいお店もたくさんありますよ。' },
      { x: ox + 1200, y: oy + 600, texture: 'shop',
        name_ko: '길거리 음식', name_ja: '屋台フード',
        greeting_ko: '떡볶이, 호떡, 어묵 있어요~!\n맛보실래요?',
        greeting_ja: 'トッポッキ、ホットク、おでんありますよ～！\n味見しませんか？' }
    ]);

    // 진입 가능 건물
    this.createEnterableBuilding(ox + 1200, oy + 1000, 'OliveYoungScene', {
      texture: 'building_oliveyoung', name_ko: '올리브숲', name_ja: 'OLIVE BLOOM'
    });
    this.createEnterableBuilding(ox + 600, oy + 600, 'HiKRGroundScene', {
      texture: 'building_shop', name_ko: '하이코그라운드', name_ja: 'HiKO Ground'
    });
    this.createEnterableBuilding(ox + 2000, oy + 1500, 'HotelScene', {
      texture: 'building_house', name_ko: '게스트하우스', name_ja: 'ゲストハウス'
    });

    // 일반 건물
    this.createBuildings([
      { x: ox + 400, y: oy + 400, texture: 'building_shop', name_ko: '화장품 가게 / コスメ' },
      { x: ox + 1800, y: oy + 400, texture: 'building_shop', name_ko: '의류 매장 / アパレル' },
      { x: ox + 600, y: oy + 1500, texture: 'building_shop', name_ko: '기념품 가게 / お土産' },
      { x: ox + 1600, y: oy + 1800, texture: 'building_shop', name_ko: 'BU 편의점' }
    ]);

    // 명동역
    this.createSubwayEntrance(ox + 1200, oy + 2000, 'SeoulMetroScene', 'myeongdong',
      '명동역 🚇', '明洞駅');

    // 명동길 쇼핑거리 오버레이
    const g = this.add.graphics().setDepth(0.5);
    g.fillStyle(0xFF69B4, 0.08);
    g.fillRect(ox + 900, oy + 200, 600, 1800);
    // 인도
    g.fillStyle(0xAAAAAA, 0.25);
    g.fillRect(ox + 880, oy + 200, 20, 1800);
    g.fillRect(ox + 1500, oy + 200, 20, 1800);
  }

  // ══════════════════════════════════════════════════════
  // 성수 구역 (NE: X:6800-9200, Y:800-3400)
  // ══════════════════════════════════════════════════════
  setupSeongsuDistrict() {
    const ox = 6800, oy = 800;

    // NPC
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

    // 건물
    this.createBuildings([
      { x: ox + 600, y: oy + 500, texture: 'building_cafe', name_ko: '카페 / カフェ' },
      { x: ox + 1500, y: oy + 500, texture: 'building_shop', name_ko: '팝업스토어 / ポップアップ' },
      { x: ox + 800, y: oy + 1500, texture: 'building_shop', name_ko: '디자인 스튜디오' },
      { x: ox + 1800, y: oy + 1500, texture: 'building_cafe', name_ko: '디저트 카페' }
    ]);

    // 성수역
    this.createSubwayEntrance(ox + 1200, oy + 2000, 'SeoulMetroScene', 'seongsu',
      '성수역 🚇', 'ソンス駅');

    // 카페거리 구역 오버레이
    const g = this.add.graphics().setDepth(0.5);
    g.fillStyle(0x00CED1, 0.07);
    g.fillRoundedRect(ox + 300, oy + 300, 1400, 800, 20);
    const s = this.uiScale;
    this.add.text(ox + 1000, oy + 290, '☕ 카페 거리 / カフェ通り', {
      fontSize: `${Math.round(9 * s)}px`, color: '#00CED1',
      backgroundColor: '#00000044', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(1);
  }

  // ══════════════════════════════════════════════════════
  // 강남 구역 (SC: X:3600-6000, Y:4600-6800)
  // ══════════════════════════════════════════════════════
  setupGangnamDistrict() {
    const ox = 3600, oy = 4600;

    // NPC
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

    // 삼겹살 식당 (진입 가능)
    this.createEnterableBuilding(ox + 1600, oy + 800, 'RestaurantScene', {
      texture: 'building_restaurant', name_ko: '삼겹살 식당', name_ja: 'サムギョプサル食堂'
    });

    // 일반 건물
    this.createBuildings([
      { x: ox + 400, y: oy + 400, texture: 'building_shop', name_ko: '고엑스몰 / GOEXモール' },
      { x: ox + 1500, y: oy + 400, texture: 'building_shop', name_ko: '강남 스타일 조형물' },
      { x: ox + 600, y: oy + 1400, texture: 'building_shop', name_ko: '카페 / カフェ' }
    ]);

    // 강남역
    this.createSubwayEntrance(ox + 1200, oy + 1200, 'SeoulMetroScene', 'gangnam',
      '강남역 🚇', 'カンナム駅');

    // K-Idol Road 오버레이
    const g = this.add.graphics().setDepth(0.5);
    g.fillStyle(0xFFD700, 0.12);
    g.fillRect(ox + 400, oy + 450, 1600, 60);
    const s = this.uiScale;
    this.add.text(ox + 1200, oy + 440, '⭐ K-Idol Road ⭐', {
      fontSize: `${Math.round(10 * s)}px`, color: '#FFD700',
      backgroundColor: '#00000044', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(1);
  }

  // ══════════════════════════════════════════════════════
  // 지역 라벨
  // ══════════════════════════════════════════════════════
  addDistrictLabels() {
    const s = this.uiScale;
    const bigStyle = (color) => ({
      fontSize: `${Math.round(14 * s)}px`, color,
      fontStyle: 'bold', backgroundColor: '#00000066',
      padding: { x: 8, y: 4 }
    });
    const smallStyle = (color) => ({
      fontSize: `${Math.round(9 * s)}px`, color,
      backgroundColor: '#00000044', padding: { x: 4, y: 2 }
    });

    // 홍대
    this.add.text(1600, 850, '홍대 弘大', bigStyle('#DA70D6')).setOrigin(0.5).setDepth(3);
    this.add.text(1600, 900, 'ホンデ / Hongdae', smallStyle('#DA70D6')).setOrigin(0.5).setDepth(3);

    // 명동
    this.add.text(4800, 850, '명동 明洞', bigStyle('#FF69B4')).setOrigin(0.5).setDepth(3);
    this.add.text(4800, 900, 'ミョンドン / Myeongdong', smallStyle('#FF69B4')).setOrigin(0.5).setDepth(3);

    // 성수
    this.add.text(8000, 850, '성수동 聖水洞', bigStyle('#00CED1')).setOrigin(0.5).setDepth(3);
    this.add.text(8000, 900, 'ソンスドン / Seongsu', smallStyle('#00CED1')).setOrigin(0.5).setDepth(3);

    // 강남
    this.add.text(4800, 4650, '강남 江南', bigStyle('#FFD700')).setOrigin(0.5).setDepth(3);
    this.add.text(4800, 4700, 'カンナム / Gangnam', smallStyle('#FFD700')).setOrigin(0.5).setDepth(3);

    // 한강 라벨
    this.add.text(4800, 3900, '── 한강 / 漢江 / Han River ──', {
      fontSize: `${Math.round(11 * s)}px`, color: '#4488cc',
      fontStyle: 'italic', backgroundColor: '#00000044',
      padding: { x: 8, y: 3 }
    }).setOrigin(0.5).setDepth(3);

    // 주요도로 라벨
    this.add.text(4800, 1560, '종로 / 鍾路 / Jongno-ro →', smallStyle('#999999')).setOrigin(0.5).setDepth(2);
    this.add.text(4850, 3200, '세종대로↓', smallStyle('#999999')).setOrigin(0, 0.5).setDepth(2);
    this.add.text(4850, 4500, '강남대로↓', smallStyle('#999999')).setOrigin(0, 0.5).setDepth(2);
    this.add.text(4800, 5360, '테헤란로 / テヘラン路 →', smallStyle('#999999')).setOrigin(0.5).setDepth(2);

    // 산지대 라벨
    this.add.text(4800, 300, '🏔️ 북한산 / 北漢山', {
      fontSize: `${Math.round(10 * s)}px`, color: '#2a5a2a',
      backgroundColor: '#00000044', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(2);
  }
}
