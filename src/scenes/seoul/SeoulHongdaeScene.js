import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// SeoulHongdaeScene — 홍대 지역맵 (1600×1200)
//  홍대 걷고싶은거리, 버스킹, 벽화
// ============================================================

export default class SeoulHongdaeScene extends BaseWorldScene {
  constructor() { super('SeoulHongdaeScene'); }

  create() {
    this.worldWidth = 1600;
    this.worldHeight = 1200;
    gameState.setRegion('seoul');

    this.createWorld({
      startX: 800, startY: 1000,
      tiles: 'grass',
      npcs: [
        { x: 800, y: 500, texture: 'mission_npc', name_ko: '버스킹 아티스트', name_ja: 'バスキングアーティスト', hasMission: true,
          greeting_ko: '안녕하세요! 홍대 버스킹에 오신 걸 환영해요!\n한국 노래 한 곡 들으실래요?',
          greeting_ja: 'こんにちは！ホンデバスキングへようこそ！\n韓国の歌を一曲聴きませんか？' },
        { x: 400, y: 600, texture: 'shop', name_ko: '벽화 화가', name_ja: '壁画アーティスト',
          greeting_ko: '이 벽화 예쁘죠?\n홍대는 예술의 거리예요!',
          greeting_ja: 'この壁画きれいでしょ？\nホンデはアートの街ですよ！' },
        { x: 1200, y: 400, texture: 'shop', name_ko: '카페 직원', name_ja: 'カフェ店員',
          greeting_ko: '어서오세요! 수제 커피 드실래요?\n홍대 카페 거리는 유명해요~',
          greeting_ja: 'いらっしゃいませ！手作りコーヒーいかがですか？\nホンデカフェ通りは有名ですよ～' }
      ],
      buildings: [
        { x: 300, y: 300, texture: 'building_shop', name_ko: '빈티지 숍 / ヴィンテージショップ' },
        { x: 1100, y: 300, texture: 'building_cafe', name_ko: '카페 거리 / カフェ通り' },
        { x: 600, y: 700, texture: 'building_shop', name_ko: '잡화점 / 雑貨店' },
        { x: 1000, y: 700, texture: 'building_shop', name_ko: 'K-POP 굿즈샵' }
      ]
    });

    // 홍대입구역
    this.createSubwayEntrance(800, 1100, 'SeoulMetroScene', 'hongdae',
      '홍대입구역 🚇', 'ホンデイック駅');

    this.addStreetOverlay();
    this.showSceneTitle('홍대', 'ホンデ · 弘大',
      'Ch.1 예술과 카페의 거리', '#DA70D6');
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  addStreetOverlay() {
    const g = this.add.graphics().setDepth(0.5);
    // 걷고싶은거리
    g.fillStyle(0xDA70D6, 0.12);
    g.fillRect(300, 400, 1000, 250);
    // 도로
    g.fillStyle(0x888888, 0.4);
    g.fillRect(700, 100, 80, 1000);
    g.fillRect(200, 600, 1200, 50);

    const s = this.uiScale;
    this.add.text(800, 390, '🎨 걷고싶은거리 / 歩きたい通り', {
      fontSize: `${Math.round(9 * s)}px`, color: '#DA70D6',
      backgroundColor: '#00000044', padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setDepth(1);
  }
}
