import BaseWorldScene from './BaseWorldScene.js';

export default class IncheonScene extends BaseWorldScene {
  constructor() { super('IncheonScene'); }

  create() {
    this.worldWidth = 1600;
    this.worldHeight = 1200;

    this.createWorld({
      startX: 200, startY: 900,
      tiles: 'airport',
      npcs: [
        { x: 400, y: 400, texture: 'hyunjeong', name_ko: '이현정', name_ja: 'ヒョンジョン', hasMission: true,
          greeting_ko: '안녕하세요! 한국에 오신 걸 환영합니다!\n환전이나 교통편 안내해 드릴까요?',
          greeting_ja: 'こんにちは！韓国へようこそ！\n両替や交通案内をしましょうか？' },
        { x: 800, y: 350, texture: 'shop', name_ko: '환전소', name_ja: '両替所',
          greeting_ko: '환전소입니다. 엔화를 원화로 바꿔 드립니다.',
          greeting_ja: '両替所です。円をウォンに換えます。' },
        { x: 1200, y: 500, texture: 'mission_npc', name_ko: 'T-money 판매', name_ja: 'T-money販売', hasMission: true,
          greeting_ko: '티머니 카드 사시겠어요?\n교통카드가 있으면 편해요!',
          greeting_ja: 'T-moneyカードを買いますか？\n交通カードがあると便利ですよ！' },
        { x: 600, y: 800, texture: 'yuseok', name_ko: '김유석', name_ja: 'ユソク',
          greeting_ko: '어, 일본에서 오셨어요? 혹시 길 잃으셨어요?\n서울까지 같이 가실래요?',
          greeting_ja: 'あ、日本から来たんですか？もしかして道に迷いましたか？\nソウルまで一緒に行きませんか？' }
      ],
      buildings: [
        { x: 400, y: 200, texture: 'building_airport', name_ko: '입국장 / 入国場' },
        { x: 800, y: 200, texture: 'building_airport', name_ko: '안내 데스크 / 案内デスク' },
        { x: 1200, y: 200, texture: 'building_station', name_ko: '공항철도역 / 空港鉄道駅' },
        { x: 300, y: 600, texture: 'building_shop', name_ko: '편의점 / コンビニ' },
        { x: 1000, y: 700, texture: 'building_station', name_ko: '택시 승강장 / タクシー乗り場' }
      ]
    });

    // Portal back to Fukuoka (always available)
    this.createPortal(100, 1050, 'FukuokaScene', 0, '✈ 후쿠오카로!\n福岡に戻る');

    // Scene title overlay
    this.showSceneTitle('인천국제공항', '仁川国際空港', 'Ch.1 초급 회화반', '#ff69b4');
  }
}
