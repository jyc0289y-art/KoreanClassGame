import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// FukuokaUnifiedScene v2 — 위성사진 스타일 후쿠오카 통합맵 (6400x4800)
//
//  Google Maps 위성뷰를 연상시키는 스타일화된 도시 맵
//  하카타만 + 나카가와 + 3개 구역 (텐진/하카타/야쿠인)
// ============================================================

export default class FukuokaUnifiedScene extends BaseWorldScene {
  constructor() { super('FukuokaUnifiedScene'); }

  create() {
    this.worldWidth = 6400;
    this.worldHeight = 4800;
    gameState.setRegion('fukuoka');

    // ── 구역 경계 정의 (구역 전환 감지용) ──
    this._districts = [
      { id: 'tenjin', name: '텐진 天神', sub: 'Tenjin', color: '#FF8C00',
        x: 1200, y: 1000, w: 1800, h: 1400 },
      { id: 'hakata', name: '하카타 博多', sub: 'Hakata', color: '#CD5C5C',
        x: 3800, y: 1200, w: 1800, h: 1600 },
      { id: 'yakuin', name: '야쿠인 薬院', sub: 'Yakuin', color: '#2E8B57',
        x: 1200, y: 2600, w: 1800, h: 1600 }
    ];
    this._lastWelcomeDistrict = null;

    // ── 스폰 포인트 ──
    this.stationSpawnPoints = {
      yakuin:          { x: 2400, y: 3700 },
      tenjin:          { x: 2200, y: 1700 },
      tenjin_minami:   { x: 2200, y: 2200 },
      hakata:          { x: 4600, y: 1900 },
      fukuoka_airport: { x: 4600, y: 1900 }
    };

    this.placeSpawnPoints = {
      YukoHouseScene:      { x: 1600, y: 3500 },
      AmiHouseScene:       { x: 1900, y: 3400 },
      RuiHouseScene:       { x: 2200, y: 3500 },
      BookstoreScene:      { x: 2600, y: 2900 },
      KoreanAcademyScene:  { x: 1600, y: 3000 }
    };

    this.createWorld({
      startX: 2400, startY: 3400,
      tiles: '__terrain__',
      npcs: [],
      buildings: []
    });

    // ── 지형 렌더링 (v2) ──
    this.drawTerrain();

    // ── 지역별 배치 ──
    this.setupTenjinDistrict();
    this.setupHakataDistrict();
    this.setupYakuinDistrict();

    // ── 지역 라벨 ──
    this.addDistrictLabels();

    this.showSceneTitle('후쿠오카', '福岡 · Fukuoka', 'Ch.0 한글반 에리어', '#88ff88');
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
      baseColor: 0x7a9a6a,  // 일반 녹지

      // ── 토지용도 구역 ──
      landUse: [
        // 텐진 상업 (일본식 콘크리트+주황 틴트)
        { x: 1200, y: 1000, w: 1800, h: 1400, color: 0xbcaa98, alpha: 1.0 },
        // 하카타 역전 (콘크리트)
        { x: 3800, y: 1200, w: 1800, h: 1600, color: 0xb0a8a0, alpha: 1.0 },
        // 야쿠인 주거 (조용한 녹회)
        { x: 1200, y: 2600, w: 1800, h: 1600, color: 0x90a880, alpha: 1.0 },
        // 남부 주택가 (일반)
        { x: 0, y: 3800, w: 6400, h: 1000, color: 0x88a078, alpha: 0.8, border: false },
        // 나카강 양안 일반 도시
        { x: 3000, y: 800, w: 800, h: 4000, color: 0x8a9a7a, alpha: 0.7, border: false },
        // 하카타 동쪽 일반
        { x: 5600, y: 1000, w: 800, h: 3000, color: 0x88a078, alpha: 0.6, border: false },
      ],

      // ── 수역 ──
      water: [
        // 하카타만 (북쪽 바다) — 3중 레이어
        // 깊은 바다
        {
          points: [
            [0, 0], [6400, 0], [6400, 500],
            [6000, 530], [5600, 560], [5200, 580], [4800, 600],
            [4400, 610], [4000, 620], [3600, 625], [3200, 620],
            [2800, 610], [2400, 590], [2000, 560], [1600, 540],
            [1200, 520], [800, 510], [400, 500], [0, 490]
          ],
          color: 0x0a2040, alpha: 1.0
        },
        // 얕은 바다 (해안선 부근)
        {
          points: [
            [0, 490], [400, 500], [800, 510], [1200, 520],
            [1600, 540], [2000, 560], [2400, 590], [2800, 610],
            [3200, 620], [3600, 625], [4000, 620], [4400, 610],
            [4800, 600], [5200, 580], [5600, 560], [6000, 530], [6400, 500],
            [6400, 700], [6000, 730], [5600, 760], [5200, 780],
            [4800, 800], [4400, 810], [4000, 820], [3600, 820],
            [3200, 810], [2800, 800], [2400, 780], [2000, 760],
            [1600, 740], [1200, 720], [800, 700], [400, 690], [0, 680]
          ],
          color: 0x1a4a7a, alpha: 1.0
        },
        // 해안선 하이라이트 (파도/모래)
        {
          points: [
            [0, 680], [400, 690], [800, 700], [1200, 720],
            [1600, 740], [2000, 760], [2400, 780], [2800, 800],
            [3200, 810], [3600, 820], [4000, 820], [4400, 810],
            [4800, 800], [5200, 780], [5600, 760], [6000, 730], [6400, 700],
            [6400, 730], [6000, 760], [5600, 790], [5200, 810],
            [4800, 830], [4400, 840], [4000, 850], [3600, 850],
            [3200, 840], [2800, 830], [2400, 810], [2000, 790],
            [1600, 770], [1200, 750], [800, 730], [400, 720], [0, 710]
          ],
          color: 0xd4c4a0, alpha: 0.4  // 모래사장
        },

        // 나카가와 (X≈3400, 120px 폭)
        {
          points: [
            [3340, 820], [3350, 1200], [3355, 1600], [3360, 2000],
            [3365, 2400], [3370, 2800], [3375, 3200], [3380, 3600],
            [3385, 4000], [3390, 4400], [3395, 4800],
            [3465, 4800], [3460, 4400], [3455, 4000], [3450, 3600],
            [3445, 3200], [3440, 2800], [3435, 2400], [3430, 2000],
            [3425, 1600], [3420, 1200], [3410, 820]
          ],
          color: 0x2a5a8a, alpha: 1.0,
          bank: { width: 10, color: 0x999999, alpha: 0.5 }
        }
      ],

      // ── 도로 네트워크 ──
      roads: [
        // === 대로 (160px) ===
        // 쇼와도리 (동서)
        { x: 200, y: 1920, w: 6000, h: 160, color: 0x606060, type: 'major' },
        // 다이하쿠도리 (남북)
        { x: 4520, y: 720, w: 160, h: 4080, color: 0x606060, type: 'major' },
        // 와타나베도리 (남북)
        { x: 2320, y: 720, w: 160, h: 4080, color: 0x606060, type: 'major' },

        // === 중로 (100px) ===
        // 텐진 동서 내부
        { x: 1200, y: 1450, w: 1100, h: 100, color: 0x686868, type: 'medium' },
        // 하카타역 앞 동서
        { x: 3800, y: 1550, w: 1800, h: 100, color: 0x686868, type: 'medium' },

        // === 소로 (60px) ===
        // 텐진 내부 소로 (남북)
        { x: 1700, y: 1000, w: 60, h: 1400, color: 0x707070 },
        { x: 2700, y: 1000, w: 60, h: 1400, color: 0x707070 },
        // 텐진 내부 소로 (동서)
        { x: 1200, y: 1200, w: 1100, h: 60, color: 0x707070 },
        // 하카타 내부 소로
        { x: 4200, y: 1200, w: 60, h: 1600, color: 0x707070 },
        { x: 5100, y: 1200, w: 60, h: 1600, color: 0x707070 },
        { x: 3800, y: 2200, w: 1800, h: 60, color: 0x707070 },
        // 야쿠인 내부 소로 (동서)
        { x: 1200, y: 3100, w: 1100, h: 60, color: 0x707070 },
        { x: 1200, y: 3600, w: 1100, h: 60, color: 0x707070 },
        // 야쿠인 내부 소로 (남북)
        { x: 1700, y: 2600, w: 60, h: 1600, color: 0x707070 },
      ],

      // ── 횡단보도 ──
      crosswalks: [
        // 쇼와도리x와타나베도리
        { x: 2320, y: 1910, w: 160, dir: 'v' },
        // 쇼와도리x다이하쿠도리
        { x: 4520, y: 1910, w: 160, dir: 'v' },
      ],

      // ── 시가지 블록 ──
      blocks: [
        // 텐진 (일본식 정돈된 상업)
        { x: 1220, y: 1020, w: 460, h: 170, density: 'high',
          palette: [0xb8a890, 0xc0b0a0, 0xa8a090, 0xb0a898] },
        { x: 1780, y: 1020, w: 900, h: 170, density: 'high',
          palette: [0xb8a890, 0xc0b0a0, 0xa8a090] },
        { x: 1220, y: 1270, w: 460, h: 170, density: 'high',
          palette: [0xb8a890, 0xc0b0a0, 0xa8a090] },
        { x: 1780, y: 1270, w: 900, h: 170, density: 'medium',
          palette: [0xb0a088, 0xa89880] },
        { x: 1220, y: 1560, w: 1460, h: 350, density: 'medium',
          palette: [0xb0a088, 0xa89880, 0xb8a890] },

        // 하카타 (역 주변, 밀집)
        { x: 3820, y: 1220, w: 360, h: 320, density: 'high',
          palette: [0xa8a0a0, 0xb0a8a0, 0xb8b0a8, 0xa0a098] },
        { x: 4280, y: 1220, w: 800, h: 320, density: 'high',
          palette: [0xa8a0a0, 0xb0a8a0, 0xb8b0a8] },
        { x: 5180, y: 1220, w: 400, h: 320, density: 'medium',
          palette: [0xa8a0a0, 0xb0a8a0] },
        { x: 3820, y: 1660, w: 360, h: 520, density: 'medium',
          palette: [0xa89898, 0xb0a0a0] },
        { x: 4280, y: 1660, w: 800, h: 520, density: 'medium',
          palette: [0xa89898, 0xb0a0a0, 0xa8a0a0] },
        { x: 3820, y: 2270, w: 1760, h: 520, density: 'low',
          palette: [0xa09890, 0x989088] },

        // 야쿠인 (주택가, 저밀도)
        { x: 1220, y: 2620, w: 460, h: 460, density: 'low',
          palette: [0x90a080, 0x88a078, 0x98a888, 0x80a070] },
        { x: 1780, y: 2620, w: 520, h: 460, density: 'low',
          palette: [0x90a080, 0x88a078, 0x98a888] },
        { x: 1220, y: 3170, w: 460, h: 410, density: 'low',
          palette: [0x88a078, 0x80a070, 0x90a080] },
        { x: 1780, y: 3170, w: 520, h: 410, density: 'low',
          palette: [0x88a078, 0x80a070] },
        { x: 1220, y: 3670, w: 1080, h: 520, density: 'low',
          palette: [0x85a075, 0x7a9868] },
      ],

      // ── 식생 ──
      vegetation: [
        // 쇼와도리 가로수
        { type: 'streetTrees', x: 250, y: 1900, dir: 'h', length: 5900, spacing: 100, radius: 8 },
        { type: 'streetTrees', x: 250, y: 2100, dir: 'h', length: 5900, spacing: 100, radius: 8 },
        // 와타나베도리 가로수
        { type: 'streetTrees', x: 2300, y: 750, dir: 'v', length: 4000, spacing: 100, radius: 8 },
        { type: 'streetTrees', x: 2500, y: 750, dir: 'v', length: 4000, spacing: 100, radius: 8 },
        // 다이하쿠도리 가로수
        { type: 'streetTrees', x: 4500, y: 750, dir: 'v', length: 4000, spacing: 100, radius: 8 },
        { type: 'streetTrees', x: 4700, y: 750, dir: 'v', length: 4000, spacing: 100, radius: 8 },
        // 야쿠인 소규모 녹지
        { type: 'park', x: 1400, y: 3800, w: 400, h: 300, density: 0.25, radiusRange: [10, 22] },
        // 나카강변 녹지
        { type: 'riverbank', x: 3320, y: 850, dir: 'v', length: 3900 },
        { type: 'riverbank', x: 3480, y: 850, dir: 'v', length: 3900 },
        // 해안선 공원
        { type: 'park', x: 800, y: 720, w: 800, h: 200, density: 0.3, radiusRange: [8, 18] },
        { type: 'park', x: 4800, y: 840, w: 600, h: 160, density: 0.3, radiusRange: [8, 18] },
      ],
    });
  }

  // ══════════════════════════════════════════════════════
  // 텐진 구역 (W: X:1200-3000, Y:1000-2400)
  // ══════════════════════════════════════════════════════
  setupTenjinDistrict() {
    const ox = 1200, oy = 1000;

    this.createNPCs([
      { x: ox + 900, y: oy + 600, texture: 'shop',
        name_ko: '텐진 안내원', name_ja: '天神案内員',
        greeting_ko: '텐진에 오신 걸 환영해요!\n쇼핑과 먹거리가 가득한 거리예요.',
        greeting_ja: '天神へようこそ！\nショッピングとグルメが満載の街です。' },
      { x: ox + 1500, y: oy + 800, texture: 'mission_npc',
        name_ko: '백화점 직원', name_ja: 'デパート店員', hasMission: true,
        greeting_ko: '백화점에 오셨어요?\n한국 화장품도 있어요!',
        greeting_ja: 'デパートへようこそ！\n韓国コスメもありますよ！' }
    ]);

    this.createBuildings([
      { x: ox + 400, y: oy + 400, texture: 'building_shop', name_ko: '텐진 지하가 / 天神地下街' },
      { x: ox + 1400, y: oy + 400, texture: 'building_shop', name_ko: '백화점 / デパート' },
      { x: ox + 900, y: oy + 1000, texture: 'building_cafe', name_ko: '카페 / カフェ' },
      { x: ox + 400, y: oy + 1000, texture: 'building_shop', name_ko: '약국 / ドラッグストア' }
    ]);

    this.createSubwayEntrance(ox + 1000, oy + 700, 'FukuokaMetroScene', 'tenjin',
      '텐진역 🚇', '天神駅');
  }

  // ══════════════════════════════════════════════════════
  // 하카타 구역 (E: X:3800-5600, Y:1200-2800)
  // ══════════════════════════════════════════════════════
  setupHakataDistrict() {
    const ox = 3800, oy = 1200;

    this.createNPCs([
      { x: ox + 900, y: oy + 500, texture: 'shop',
        name_ko: '라멘 사장님', name_ja: 'ラーメン店主',
        greeting_ko: '하카타 라멘 드셔보세요!\n돈코츠 라멘이 제일 유명해요~',
        greeting_ja: '博多ラーメンいかがですか！\n豚骨ラーメンが一番有名ですよ～' },
      { x: ox + 1500, y: oy + 800, texture: 'mission_npc',
        name_ko: '하카타역 안내원', name_ja: '博多駅案内員', hasMission: true,
        greeting_ko: '하카타역에 오신 걸 환영합니다!\n쇼핑몰과 먹거리가 많아요.',
        greeting_ja: '博多駅へようこそ！\nショッピングモールとグルメがたくさんあります。' }
    ]);

    this.createBuildings([
      { x: ox + 600, y: oy + 300, texture: 'building_shop', name_ko: '하카타역 / 博多駅' },
      { x: ox + 1400, y: oy + 300, texture: 'building_shop', name_ko: '아뮤 / AMU PLAZA' },
      { x: ox + 400, y: oy + 1000, texture: 'building_restaurant', name_ko: '라멘 거리 / ラーメン通り' },
      { x: ox + 1200, y: oy + 1000, texture: 'building_shop', name_ko: '캐널시티 / キャナルシティ' }
    ]);

    this.createSubwayEntrance(ox + 800, oy + 700, 'FukuokaMetroScene', 'hakata',
      '하카타역 🚇', '博多駅');
  }

  // ══════════════════════════════════════════════════════
  // 야쿠인 구역 (SW: X:1200-3000, Y:2600-4200)
  // ══════════════════════════════════════════════════════
  setupYakuinDistrict() {
    const ox = 1200, oy = 2600;

    this.createNPCs([
      { x: ox + 700, y: oy + 800, texture: 'ami',
        name_ko: '아미', name_ja: 'アミ', hasDialogue: true,
        greeting_ko: '유코야! 한글 공부 시작하자!\nBTX 가사 읽고 싶지 않아?',
        greeting_ja: 'ユコ！ハングル勉強始めよう！\nBTXの歌詞読みたくない？' },
      { x: ox + 1000, y: oy + 900, texture: 'rui',
        name_ko: '루이', name_ja: 'ルイ', hasDialogue: true,
        greeting_ko: '한국어 교재 샀어!\n같이 공부할까?',
        greeting_ja: '韓国語テキスト買ったよ！\n一緒に勉強する？' },
      { x: ox + 450, y: oy + 350, texture: 'mission_npc',
        name_ko: '한국어 선생님', name_ja: '韓国語の先生', hasMission: true,
        greeting_ko: '안녕하세요! 한글을 배워 볼까요?\n자음과 모음부터 시작해요!',
        greeting_ja: 'こんにちは！ハングルを学んでみましょうか？\n子音と母音から始めましょう！' },
      { x: ox + 1450, y: oy + 250, texture: 'mission_npc',
        name_ko: '서점 직원', name_ja: '書店員', hasMission: true,
        greeting_ko: '한국어 교재 찾으세요?\n초보자용 교재가 여기 있어요!',
        greeting_ja: '韓国語テキストをお探しですか？\n初心者用テキストはこちらです！' },
      { x: ox + 900, y: oy + 500, texture: 'shop',
        name_ko: '편의점 점원', name_ja: 'コンビニ店員',
        greeting_ko: '어서오세요! 필요하신 거 있으세요?',
        greeting_ja: 'いらっしゃいませ！何かお探しですか？' }
    ]);

    this.createEnterableBuilding(ox + 400, oy + 900, 'YukoHouseScene', {
      texture: 'building_house', name_ko: '유코 집', name_ja: 'ユコの家'
    });
    this.createEnterableBuilding(ox + 700, oy + 700, 'AmiHouseScene', {
      texture: 'building_house', name_ko: '아미 집', name_ja: 'アミの家'
    });
    this.createEnterableBuilding(ox + 1000, oy + 900, 'RuiHouseScene', {
      texture: 'building_house', name_ko: '루이 집', name_ja: 'ルイの家'
    });
    this.createEnterableBuilding(ox + 1400, oy + 300, 'BookstoreScene', {
      texture: 'building_shop', name_ko: '서점', name_ja: '書店（紀野丸）'
    });
    this.createEnterableBuilding(ox + 400, oy + 400, 'KoreanAcademyScene', {
      texture: 'building_academy', name_ko: '한국어 학원', name_ja: '韓国語教室'
    });

    this.createBuildings([
      { x: ox + 900, y: oy + 400, texture: 'building_shop', name_ko: '편의점 / コンビニ' }
    ]);

    this.createSubwayEntrance(ox + 1200, oy + 1200, 'FukuokaMetroScene', 'yakuin',
      '야쿠인역 🚇', '薬院駅');
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
    this.add.text(2100, 1060, '텐진 天神', districtStyle('#FF8C00')).setOrigin(0.5).setDepth(3);
    this.add.text(2100, 1120, 'Tenjin', subStyle('#FF8C00')).setOrigin(0.5).setDepth(3);

    this.add.text(4700, 1260, '하카타 博多', districtStyle('#CD5C5C')).setOrigin(0.5).setDepth(3);
    this.add.text(4700, 1320, 'Hakata', subStyle('#CD5C5C')).setOrigin(0.5).setDepth(3);

    this.add.text(2100, 2660, '야쿠인 薬院', districtStyle('#2E8B57')).setOrigin(0.5).setDepth(3);
    this.add.text(2100, 2720, 'Yakuin', subStyle('#2E8B57')).setOrigin(0.5).setDepth(3);

    // 하카타만 라벨
    this.add.text(3200, 350, '── 하카타만 · 博多湾 · Hakata Bay ──', {
      fontSize: `${Math.round(12 * s)}px`, color: '#5588bb',
      fontStyle: 'italic', backgroundColor: '#00000066', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(3);

    // 나카강 라벨
    this.add.text(3420, 2400, '那珂川', {
      fontSize: `${Math.round(10 * s)}px`, color: '#5588bb',
      fontStyle: 'italic', backgroundColor: '#00000066', padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(3);

    // 거리 표지판 (파란색)
    this.add.text(1800, 1910, '昭和通り / 쇼와도리 →', streetStyle).setOrigin(0.5).setDepth(15);
    this.add.text(5200, 1910, '← 昭和通り / 쇼와도리', streetStyle).setOrigin(0.5).setDepth(15);
    this.add.text(4650, 1200, '↑ 大博通り', streetStyle).setOrigin(0, 0.5).setDepth(15);
    this.add.text(2450, 1200, '↑ 渡辺通り', streetStyle).setOrigin(0, 0.5).setDepth(15);
  }
}
