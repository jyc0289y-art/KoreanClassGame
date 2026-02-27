import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// SeoulMyeongdongScene — 명동 지역맵 (1600×1200)
//  명동길 직선 도로 중심, 올리브영, 쇼핑거리
// ============================================================

export default class SeoulMyeongdongScene extends BaseWorldScene {
  constructor() { super('SeoulMyeongdongScene'); }

  create() {
    this.worldWidth = 1600;
    this.worldHeight = 1200;
    gameState.setRegion('seoul');

    // ── 스폰 포인트: 지하철역/장소맵에서 복귀 시 해당 위치 근처 스폰 ──
    this.stationSpawnPoints = {
      myeongdong: { x: 800, y: 1050 }
    };
    this.placeSpawnPoints = {
      OliveYoungScene: { x: 800, y: 550 },
      HiKRGroundScene: { x: 600, y: 400 },
      HotelScene: { x: 1300, y: 800 }
    };

    this.createWorld({
      startX: 800, startY: 1000,
      tiles: 'grass',
      npcs: [
        { x: 500, y: 500, texture: 'shop', name_ko: '화장품 가게 직원', name_ja: 'コスメショップ店員',
          greeting_ko: '어서오세요! 명동 화장품 가게입니다.\n한국 화장품 추천해 드릴까요?',
          greeting_ja: 'いらっしゃいませ！明洞コスメショップです。\n韓国コスメをおすすめしましょうか？' },
        { x: 1100, y: 600, texture: 'mission_npc', name_ko: '관광안내원', name_ja: '観光案内員', hasMission: true,
          greeting_ko: '명동에 오신 걸 환영해요!\n맛있는 음식도 많고, 볼거리도 많아요.',
          greeting_ja: '明洞へようこそ！\n美味しいお店もたくさんありますよ。' },
        { x: 800, y: 300, texture: 'shop', name_ko: '길거리 음식', name_ja: '屋台フード',
          greeting_ko: '떡볶이, 호떡, 어묵 있어요~!\n맛보실래요?',
          greeting_ja: 'トッポッキ、ホットク、おでんありますよ～！\n味見しませんか？' }
      ],
      buildings: []
    });

    // 올리브영 (진입 가능)
    this.createEnterableBuilding(800, 450, 'OliveYoungScene', {
      texture: 'building_oliveyoung', name_ko: '올리브영', name_ja: 'OLIVE YOUNG'
    });

    // 하이커 그라운드 (진입 가능)
    this.createEnterableBuilding(600, 300, 'HiKRGroundScene', {
      texture: 'building_shop', name_ko: '하이커그라운드', name_ja: 'HiKR Ground'
    });

    // 게스트하우스 (진입 가능)
    this.createEnterableBuilding(1300, 700, 'HotelScene', {
      texture: 'building_house', name_ko: '게스트하우스', name_ja: 'ゲストハウス'
    });

    // 일반 건물
    this.createBuildings([
      { x: 300, y: 300, texture: 'building_shop', name_ko: '화장품 가게 / コスメ' },
      { x: 1200, y: 300, texture: 'building_shop', name_ko: '의류 매장 / アパレル' },
      { x: 400, y: 700, texture: 'building_shop', name_ko: '기념품 가게 / お土産' },
      { x: 1100, y: 800, texture: 'building_shop', name_ko: 'CU 편의점' }
    ]);

    // 명동역
    this.createSubwayEntrance(800, 1100, 'SeoulMetroScene', 'myeongdong',
      '명동역 🚇', '明洞駅');

    // 명동 거리 오버레이
    this.addStreetOverlay();

    this.showSceneTitle('명동', '明洞 · ミョンドン',
      'Ch.1 쇼핑 에리어', '#ff69b4');
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  addStreetOverlay() {
    const g = this.add.graphics().setDepth(0.5);
    // 명동길 (남북 직선 도로)
    g.fillStyle(0x888888, 0.5);
    g.fillRect(750, 100, 100, 1000);
    // 동서 도로
    g.fillRect(200, 500, 1200, 60);
    // 인도
    g.fillStyle(0xAAAAAA, 0.3);
    g.fillRect(730, 100, 20, 1000);
    g.fillRect(850, 100, 20, 1000);
  }
}
