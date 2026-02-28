import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// IncheonAirportScene — 인천국제공항 제1여객터미널 1F 도착층
//  공식 홈페이지 층별 지도 기반 (2000×1200)
//
//  실제 배치 참조:
//  ─ Gate A(동쪽, x≈1700) ~ Gate F(서쪽, x≈200)
//  ─ 입국심사장은 게이트 뒤편(상단)
//  ─ 수하물 수취대 → 세관 → 도착 로비(중앙~하단)
//  ─ 환전소: 출구 4번(Gate C~D 사이), 6번, 9번, 11번
//  ─ 로밍센터/USIM: Gate F 근처 서쪽
//  ─ BU 편의점: Gate B~C 사이, Gate E~F 사이
//  ─ 안내데스크: Gate C, D 부근 중앙
//  ─ 버스매표소: 출구 4번, 9번 부근
//  ─ B1F 교통센터(공항철도 AREX): 하단 중앙
//  ─ 3F 출발층(체크인/면세): 상단
// ============================================================

export default class IncheonAirportScene extends BaseWorldScene {
  constructor() { super('IncheonAirportScene'); }

  create() {
    this.worldWidth = 2000;
    this.worldHeight = 1200;

    gameState.setRegion('seoul');

    // ── 스폰 포인트: 공항철도역에서 복귀 시 역 근처 스폰 ──
    this.stationSpawnPoints = {
      incheon_airport: { x: 1000, y: 1050 }
    };

    // ── 위성뷰 스타일 지형 렌더링 ──
    this.createTerrainGraphics({
      baseColor: 0x4a8a3a,   // 공항 외부: 잔디/녹지
      landUse: [
        // 공항 외부 도로/주차장 영역 (남쪽)
        { x: 0, y: 1050, w: 2000, h: 150, color: 0x555555 },
        // 활주로 방향 (북쪽 상단)
        { x: 0, y: 0, w: 2000, h: 80, color: 0x3a3a3a },
        // 터미널 건물 외벽 (전체)
        { x: 60, y: 80, w: 1880, h: 960, color: 0xd8d0c8, radius: 12 },
        // 입국심사 구역 (상단 — 밝은 회색)
        { x: 120, y: 100, w: 1760, h: 230, color: 0xc8d0d8 },
        // 수하물 수취 (입국심사 아래)
        { x: 200, y: 350, w: 1600, h: 120, color: 0xc0c0c0 },
        // 세관 통과 (띠 형태)
        { x: 250, y: 480, w: 1500, h: 50, color: 0xb8d0b8 },
        // 도착 로비 (밝은 개방 공간)
        { x: 120, y: 540, w: 1760, h: 380, color: 0xe8e4e0 },
        // B1F 교통센터 (하단 오렌지 틴트)
        { x: 600, y: 940, w: 800, h: 120, color: 0xe0d0b0, radius: 8 },
        // 외부 버스정류장 (좌)
        { x: 80, y: 1060, w: 300, h: 80, color: 0x6a8a6a },
        // 외부 택시승강장 (우)
        { x: 1620, y: 1060, w: 300, h: 80, color: 0x7a7a6a },
      ],
      roads: [
        // 중앙 대형 통로 (남북)
        { x: 920, y: 330, w: 160, h: 650, color: 0xbcb8b0, sidewalk: false },
        // 1F 동서 연결 통로 (상)
        { x: 120, y: 330, w: 1760, h: 30, color: 0xc0bab0, sidewalk: false },
        // 1F 동서 연결 통로 (하)
        { x: 120, y: 530, w: 1760, h: 20, color: 0xc0bab0, sidewalk: false },
        // 외부 도로 (공항진입로)
        { x: 0, y: 1100, w: 2000, h: 80, color: 0x555555, type: 'major', sidewalkWidth: 12 },
        // 외부 도로 (중앙 진입)
        { x: 920, y: 1040, w: 160, h: 160, color: 0x555555, sidewalk: false },
      ],
      blocks: [
        // 면세점 구역 시뮬레이션 (게이트 뒤 작은 상점 블록)
        { x: 150, y: 120, w: 300, h: 180, density: 'high',
          palette: [0xb0b8c8, 0xa0a8b8, 0xc0c8d8, 0x98a0b0], shadow: false },
        { x: 800, y: 120, w: 400, h: 180, density: 'high',
          palette: [0xb0b8c8, 0xa0a8b8, 0xc0c8d8, 0x98a0b0], shadow: false },
        { x: 1550, y: 120, w: 300, h: 180, density: 'high',
          palette: [0xb0b8c8, 0xa0a8b8, 0xc0c8d8, 0x98a0b0], shadow: false },
      ],
      vegetation: [
        // 터미널 외부 녹지 (좌측)
        { type: 'park', x: 0, y: 80, w: 50, h: 960, density: 0.15, radiusRange: [6, 14] },
        // 터미널 외부 녹지 (우측)
        { type: 'park', x: 1950, y: 80, w: 50, h: 960, density: 0.15, radiusRange: [6, 14] },
        // 외부 녹지대 (남쪽)
        { type: 'streetTrees', x: 100, y: 1050, dir: 'h', length: 1800, spacing: 60, radius: 8 },
        // 실내 화분/식물 (도착 로비)
        { type: 'streetTrees', x: 200, y: 700, dir: 'h', length: 600, spacing: 150, radius: 5 },
        { type: 'streetTrees', x: 1200, y: 700, dir: 'h', length: 600, spacing: 150, radius: 5 },
      ]
    });

    this.createWorld({
      startX: 1000, startY: 800,
      tiles: '__terrain__',
      npcs: [
        // ── Gate D 부근: 이현정 (입국 안내) ──
        { x: 900, y: 450, texture: 'hyunjeong', name_ko: '이현정', name_ja: 'ヒョンジョン', hasMission: true,
          greeting_ko: '안녕하세요! 한국에 오신 걸 환영합니다!\n입국 심사를 도와드릴게요.\n여권과 입국신고서를 준비해 주세요.',
          greeting_ja: 'こんにちは！韓国へようこそ！\n入国審査のお手伝いをしますね。\nパスポートと入国申告書をご用意ください。' },

        // ── 출구 4번 부근: 환전소 (Gate C~D 사이) ──
        { x: 1050, y: 650, texture: 'shop', name_ko: '환전소 (4번 출구)', name_ja: '両替所 (出口4)',
          greeting_ko: '환전소입니다. 엔화를 원화로 바꿔 드립니다.\n오늘 환율은 100엔 = 900원입니다.\n공항 환율이니 시내가 더 유리해요!',
          greeting_ja: '両替所です。円をウォンに換えます。\n本日のレートは100円＝900ウォンです。\n空港レートなので市内の方がお得ですよ！' },

        // ── B1F 교통센터 부근: T-Pass 판매 ──
        { x: 1000, y: 1000, texture: 'mission_npc', name_ko: 'T-Pass 판매', name_ja: 'T-Pass販売', hasMission: true,
          greeting_ko: '티패스 카드 사시겠어요?\n교통카드가 있으면 지하철, 버스 다 쓸 수 있어요!\n카드 가격은 4,000원이에요.',
          greeting_ja: 'T-Passカードを買いますか？\n交通カードがあれば地下鉄もバスも使えますよ！\nカード代は4,000ウォンです。' },

        // ── 도착 로비 중앙: 김유석 ──
        { x: 700, y: 750, texture: 'yuseok', name_ko: '김유석', name_ja: 'ユソク',
          greeting_ko: '어, 일본에서 오셨어요? 혹시 길 잃으셨어요?\n서울까지 같이 가실래요?\n공항철도 타면 서울역까지 43분이에요!',
          greeting_ja: 'あ、日本から来たんですか？もしかして道に迷いましたか？\nソウルまで一緒に行きませんか？\n空港鉄道で仁川空港からソウル駅まで43分ですよ！' },

        // ── Gate F(서쪽) 부근: 로밍센터 / USIM ──
        { x: 300, y: 550, texture: 'shop', name_ko: '로밍센터 / USIM', name_ja: 'ローミング / USIM',
          greeting_ko: '해외 로밍 서비스 필요하세요?\n한국 유심도 판매하고 있어요!\neSIM도 설정해 드릴 수 있어요.',
          greeting_ja: '海外ローミングサービスが必要ですか？\n韓国SIMも販売しています！\neSIMの設定もできますよ。' },

        // ── 안내데스크 (중앙) ──
        { x: 1200, y: 550, texture: 'shop', name_ko: '안내데스크', name_ja: '案内デスク',
          greeting_ko: '인천공항 안내데스크입니다.\n무엇을 도와드릴까요?\n서울 가는 교통편을 안내해 드릴게요.',
          greeting_ja: '仁川空港案内デスクです。\n何かお手伝いしましょうか？\nソウルへの交通手段をご案内します。' },

        // ── Gate B~C 사이: BU 편의점 ──
        { x: 1400, y: 600, texture: 'shop', name_ko: 'BU 편의점', name_ja: 'BU コンビニ',
          greeting_ko: '어서오세요! BU입니다.\n삼각김밥, 음료수 다 있어요~\n한국 과자도 있어요!',
          greeting_ja: 'いらっしゃいませ！BUです。\nおにぎり、飲み物何でもありますよ〜\n韓国のお菓子もありますよ！' },

        // ── 버스매표소 (출구 9번 부근) ──
        { x: 500, y: 800, texture: 'shop', name_ko: '버스매표소', name_ja: 'バス券売所',
          greeting_ko: '공항버스 매표소입니다.\n서울 시내행 6001번, 6015번 버스가\n자주 있어요.',
          greeting_ja: '空港バス券売所です。\nソウル市内行き6001番、6015番バスが\n頻繁に出ています。' }
      ],
      buildings: [
        // ── 게이트 건물들 (동→서 배치) ──
        { x: 1750, y: 200, texture: 'building_airport', name_ko: 'A 게이트 / Gate A' },
        { x: 1500, y: 200, texture: 'building_airport', name_ko: 'B 게이트 / Gate B' },
        { x: 1200, y: 200, texture: 'building_airport', name_ko: 'C 게이트 / Gate C' },
        { x: 900, y: 200, texture: 'building_airport', name_ko: 'D 게이트 / Gate D' },
        { x: 600, y: 200, texture: 'building_airport', name_ko: 'E 게이트 / Gate E' },
        { x: 300, y: 200, texture: 'building_airport', name_ko: 'F 게이트 / Gate F' }
      ]
    });

    // ── 공항철도역(AREX) → 서울 광역맵 ──
    this.createSubwayEntrance(1000, 1100, 'SeoulMetroScene', 'incheon_airport',
      '공항철도역 (AREX) 🚇', '空港鉄道駅 (AREX)');

    // ── 3F 국제선 탑승구역 → 국제맵 ──
    this.createDepartureGate(1000, 100,
      '3F 국제선 출발 / 出発', '3F 国際線搭乗口');

    // ── 공항 내부 상세 오버레이 ──
    this.addAirportOverlay();

    this.showSceneTitle('인천국제공항', '仁川国際空港',
      '제1여객터미널 1F 도착층', '#ff69b4');

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  addAirportOverlay() {
    const g = this.add.graphics().setDepth(1.8);
    const s = this.uiScale;

    // ── 터미널 외곽선 ──
    g.lineStyle(3, 0x4682B4, 0.5);
    g.strokeRoundedRect(60, 80, 1880, 960, 12);

    // ── 입국심사 구역 경계 ──
    g.lineStyle(1, 0x4682B4, 0.3);
    g.strokeRect(120, 100, 1760, 230);

    // ── 수하물 컨베이어 벨트 ──
    for (let i = 0; i < 5; i++) {
      const bx = 320 + i * 290;
      g.fillStyle(0x666666, 0.4);
      g.fillRoundedRect(bx, 385, 200, 55, 20);
      g.lineStyle(1, 0x888888, 0.5);
      g.strokeRoundedRect(bx, 385, 200, 55, 20);
    }

    // ── 세관 통과 라인 ──
    g.lineStyle(2, 0x2E8B57, 0.4);
    g.lineBetween(250, 505, 1750, 505);
    g.lineBetween(250, 530, 1750, 530);

    // ── 환전소 부스 ──
    const exchangePositions = [
      { x: 1050, y: 620 },
      { x: 600, y: 620 }
    ];
    exchangePositions.forEach(pos => {
      g.fillStyle(0xFFD700, 0.25);
      g.fillRoundedRect(pos.x - 35, pos.y - 12, 70, 24, 4);
      g.lineStyle(1, 0xFFD700, 0.5);
      g.strokeRoundedRect(pos.x - 35, pos.y - 12, 70, 24, 4);
    });

    // ── B1F 교통센터 경계 ──
    g.lineStyle(2, 0xFF8C00, 0.4);
    g.strokeRoundedRect(600, 940, 800, 120, 8);

    // ── 라벨 텍스트들 ──
    const labelStyle = (color) => ({
      fontSize: `${Math.round(9 * s)}px`, color: color,
      backgroundColor: '#00000066', padding: { x: 5, y: 2 }
    });

    // 게이트 라벨 (동→서)
    const gates = [
      { x: 1750, label: 'Gate A' }, { x: 1500, label: 'Gate B' },
      { x: 1200, label: 'Gate C' }, { x: 900, label: 'Gate D' },
      { x: 600, label: 'Gate E' }, { x: 300, label: 'Gate F' }
    ];
    gates.forEach(gate => {
      this.add.text(gate.x, 160, gate.label, {
        fontSize: `${Math.round(10 * s)}px`, color: '#4682B4', fontStyle: 'bold',
        backgroundColor: '#00000044', padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(2);
    });

    // 구역 라벨
    this.add.text(1000, 300, '입국심사 / 入国審査', labelStyle('#4682B4')).setOrigin(0.5).setDepth(2);
    this.add.text(1000, 410, '수하물 수취 / 手荷物受取', labelStyle('#888888')).setOrigin(0.5).setDepth(2);
    this.add.text(1000, 508, '세관 / 税関', labelStyle('#2E8B57')).setOrigin(0.5).setDepth(2);

    // 도착로비
    this.add.text(1000, 570, '── 도착 로비 / 到着ロビー ──', {
      fontSize: `${Math.round(11 * s)}px`, color: '#ffffff',
      backgroundColor: '#00000066', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(2);

    // 출구 번호 표시
    const exits = [
      { x: 1700, y: 900, num: '1' }, { x: 1500, y: 900, num: '2-3' },
      { x: 1200, y: 900, num: '4-5' }, { x: 900, y: 900, num: '6-7' },
      { x: 600, y: 900, num: '8-9' }, { x: 300, y: 900, num: '10-14' }
    ];
    exits.forEach(exit => {
      this.add.text(exit.x, exit.y, `🚪 ${exit.num}`, {
        fontSize: `${Math.round(9 * s)}px`, color: '#cccccc'
      }).setOrigin(0.5).setDepth(2);
    });

    // 3F / B1F 안내
    this.add.text(1000, 60, '↑ 3F 출발층 (체크인/면세) / 出発階', {
      fontSize: `${Math.round(11 * s)}px`, color: '#4682B4',
      backgroundColor: '#00000088', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(2);

    this.add.text(1000, 1150, '↓ B1F 교통센터 (AREX 공항철도) / 交通センター', {
      fontSize: `${Math.round(11 * s)}px`, color: '#FF8C00',
      backgroundColor: '#00000088', padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(2);

    // 택시/버스 정류장 (외부)
    this.add.text(200, 1080, '🚌 버스정류장', labelStyle('#00ff88')).setOrigin(0.5).setDepth(2);
    this.add.text(1770, 1080, '🚕 택시승강장', labelStyle('#FFD700')).setOrigin(0.5).setDepth(2);

    // BU 편의점
    this.add.text(1400, 580, '🏪 BU', {
      fontSize: `${Math.round(8 * s)}px`, color: '#9370DB'
    }).setOrigin(0.5).setDepth(2);

    // 환전소 표시
    exchangePositions.forEach(pos => {
      this.add.text(pos.x, pos.y - 22, '💱', {
        fontSize: `${Math.round(11 * s)}px`
      }).setOrigin(0.5).setDepth(2);
    });
  }
}
