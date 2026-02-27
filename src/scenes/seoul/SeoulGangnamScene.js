import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// SeoulGangnamScene — 강남 지역맵 (1600×1200)
//  강남대로, K-Idol Road, 삼겹살 식당
// ============================================================

export default class SeoulGangnamScene extends BaseWorldScene {
  constructor() { super('SeoulGangnamScene'); }

  create() {
    this.worldWidth = 1600;
    this.worldHeight = 1200;
    gameState.setRegion('seoul');

    // ── 스폰 포인트: 지하철역/장소맵에서 복귀 시 해당 위치 근처 스폰 ──
    this.stationSpawnPoints = {
      gangnam: { x: 800, y: 1050 }
    };
    this.placeSpawnPoints = {
      RestaurantScene: { x: 1200, y: 600 }
    };

    this.createWorld({
      startX: 800, startY: 1000,
      tiles: 'grass',
      npcs: [
        { x: 600, y: 400, texture: 'mission_npc', name_ko: 'K-Idol 안내원', name_ja: 'K-Idolガイド', hasMission: true,
          greeting_ko: 'K-Idol Road에 오신 걸 환영해요!\nK-POP 스타들의 핸드프린팅이 있어요!',
          greeting_ja: 'K-Idol Roadへようこそ！\nK-POPスターのハンドプリントがありますよ！' },
        { x: 1200, y: 600, texture: 'shop', name_ko: '삼겹살 사장님', name_ja: 'サムギョプサル店主',
          greeting_ko: '어서오세요! 맛있는 삼겹살 있어요~\n한국에서 꼭 먹어봐야 해요!',
          greeting_ja: 'いらっしゃいませ！美味しいサムギョプサルありますよ～\n韓国で必ず食べるべきです！' }
      ],
      buildings: []
    });

    // 삼겹살 식당 (진입 가능)
    this.createEnterableBuilding(1200, 500, 'RestaurantScene', {
      texture: 'building_restaurant', name_ko: '삼겹살 식당', name_ja: 'サムギョプサル食堂'
    });

    // 일반 건물
    this.createBuildings([
      { x: 300, y: 300, texture: 'building_shop', name_ko: '고엑스몰 / GOEXモール' },
      { x: 900, y: 300, texture: 'building_shop', name_ko: '강남 스타일 조형물' },
      { x: 400, y: 700, texture: 'building_shop', name_ko: '카페 / カフェ' }
    ]);

    // 강남역
    this.createSubwayEntrance(800, 1100, 'SeoulMetroScene', 'gangnam',
      '강남역 🚇', 'カンナム駅');

    this.addStreetOverlay();
    this.showSceneTitle('강남', 'カンナム · 江南',
      'Ch.1 K-Idol 거리 & 맛집', '#FFD700');
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  addStreetOverlay() {
    const g = this.add.graphics().setDepth(0.5);
    // 강남대로
    g.fillStyle(0x888888, 0.5);
    g.fillRect(700, 100, 120, 1000);
    // K-Idol Road
    g.fillStyle(0xFFD700, 0.15);
    g.fillRect(300, 350, 800, 60);
    // 별 장식
    const s = this.uiScale;
    this.add.text(700, 340, '⭐ K-Idol Road ⭐', {
      fontSize: `${Math.round(10 * s)}px`, color: '#FFD700',
      backgroundColor: '#00000044', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(1);
  }
}
