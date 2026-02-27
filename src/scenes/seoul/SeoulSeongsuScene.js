import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// SeoulSeongsuScene — 성수동 지역맵 (1600×1200)
//  카페거리, 팝업스토어, 트렌디한 거리
// ============================================================

export default class SeoulSeongsuScene extends BaseWorldScene {
  constructor() { super('SeoulSeongsuScene'); }

  create() {
    this.worldWidth = 1600;
    this.worldHeight = 1200;
    gameState.setRegion('seoul');

    this.createWorld({
      startX: 800, startY: 1000,
      tiles: 'grass',
      npcs: [
        { x: 600, y: 500, texture: 'mission_npc', name_ko: '팝업스토어 직원', name_ja: 'ポップアップストア店員', hasMission: true,
          greeting_ko: '성수동 팝업스토어에 오신 걸 환영해요!\n한정판 상품도 있어요!',
          greeting_ja: '聖水洞ポップアップストアへようこそ！\n限定商品もありますよ！' },
        { x: 1100, y: 400, texture: 'shop', name_ko: '카페 바리스타', name_ja: 'カフェバリスタ',
          greeting_ko: '성수동 카페에 오셨군요!\n수제 드립커피 한잔 하세요~',
          greeting_ja: '聖水洞カフェへようこそ！\nハンドドリップコーヒーいかがですか～' }
      ],
      buildings: [
        { x: 400, y: 300, texture: 'building_cafe', name_ko: '카페 / カフェ' },
        { x: 900, y: 300, texture: 'building_shop', name_ko: '팝업스토어 / ポップアップ' },
        { x: 600, y: 700, texture: 'building_shop', name_ko: '디자인 스튜디오' },
        { x: 1200, y: 700, texture: 'building_cafe', name_ko: '디저트 카페' }
      ]
    });

    // 성수역
    this.createSubwayEntrance(800, 1100, 'SeoulMetroScene', 'seongsu',
      '성수역 🚇', 'ソンス駅');

    this.addStreetOverlay();
    this.showSceneTitle('성수동', 'ソンスドン · 聖水洞',
      'Ch.1 트렌디 카페 거리', '#00CED1');
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  addStreetOverlay() {
    const g = this.add.graphics().setDepth(0.5);
    g.fillStyle(0x888888, 0.4);
    g.fillRect(700, 100, 80, 1000);
    g.fillRect(200, 500, 1200, 50);
    // 카페 거리 구역
    g.fillStyle(0x00CED1, 0.08);
    g.fillRoundedRect(250, 200, 600, 400, 20);
    const s = this.uiScale;
    this.add.text(550, 190, '☕ 카페 거리 / カフェ通り', {
      fontSize: `${Math.round(9 * s)}px`, color: '#00CED1',
      backgroundColor: '#00000044', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(1);
  }
}
