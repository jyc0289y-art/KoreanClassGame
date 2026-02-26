import BaseWorldScene from './BaseWorldScene.js';

export default class FukuokaScene extends BaseWorldScene {
  constructor() { super('FukuokaScene'); }

  create() {
    this.worldWidth = 1600;
    this.worldHeight = 1200;

    this.createWorld({
      startX: 800, startY: 600,
      tiles: 'grass',
      npcs: [
        { x: 400, y: 400, texture: 'ami', name_ko: '아미', name_ja: 'アミ', hasDialogue: true,
          greeting_ko: '유코야! 한글 공부 시작하자!\nBTS 가사 읽고 싶지 않아?',
          greeting_ja: 'ユコ！ハングル勉強始めよう！\nBTSの歌詞読みたくない？' },
        { x: 600, y: 300, texture: 'rui', name_ko: '루이', name_ja: 'ルイ', hasDialogue: true,
          greeting_ko: '한국어 교재 샀어!\n같이 공부할까?',
          greeting_ja: '韓国語テキスト買ったよ！\n一緒に勉強する？' },
        { x: 1000, y: 500, texture: 'mission_npc', name_ko: '한국어 선생님', name_ja: '韓国語の先生', hasMission: true,
          greeting_ko: '안녕하세요! 한글을 배워 볼까요?\n자음과 모음부터 시작해요!',
          greeting_ja: 'こんにちは！ハングルを学んでみましょうか？\n子音と母音から始めましょう！' },
        { x: 1200, y: 800, texture: 'mission_npc', name_ko: '서점 직원', name_ja: '書店員', hasMission: true,
          greeting_ko: '한국어 교재 찾으세요?\n초보자용 교재가 여기 있어요!',
          greeting_ja: '韓国語テキストをお探しですか？\n初心者用テキストはこちらです！' }
      ],
      buildings: [
        { x: 200, y: 150, texture: 'building_house', name_ko: '유코 집 / ユコの家' },
        { x: 500, y: 150, texture: 'building_house', name_ko: '아미 집 / アミの家' },
        { x: 800, y: 150, texture: 'building_house', name_ko: '루이 집 / ルイの家' },
        { x: 1100, y: 350, texture: 'building_shop', name_ko: '서점 / 書店' },
        { x: 300, y: 700, texture: 'building_academy', name_ko: '한국어 학원 / 韓国語教室' },
        { x: 800, y: 900, texture: 'building_shop', name_ko: '편의점 / コンビニ' }
      ]
    });

    // Portal to Incheon (requires level 2+)
    this.createPortal(1450, 600, 'IncheonScene', 2, '✈ 인천공항으로!\n仁川空港へ！');

    this.showSceneTitle('후쿠오카', '福岡', 'Ch.0 한글반 — ハングル班', '#88ff88');
  }
}
