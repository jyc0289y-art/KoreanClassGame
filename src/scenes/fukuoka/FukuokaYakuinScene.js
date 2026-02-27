import BaseWorldScene from '../BaseWorldScene.js';
import { gameState } from '../../systems/GameState.js';

// ============================================================
// FukuokaYakuinScene — 후쿠오카 야쿠인 지역맵 (Ch.0 메인)
//  실제 야쿠인 지역 거리 구조 기반 (2400×1800)
//  - 북쪽: 텐진 방면 도로
//  - 남쪽: 주택가 (유코·아미·루이 집)
//  - 중앙: 상업지역 (편의점)
//  - 북동쪽: 서점 (키노쿠니야)
//  - 서쪽: 한국어 학원
//  - 동남쪽: 야쿠인역 (지하철 진입점)
// ============================================================

export default class FukuokaYakuinScene extends BaseWorldScene {
  constructor() { super('FukuokaYakuinScene'); }

  create() {
    this.worldWidth = 2400;
    this.worldHeight = 1800;

    gameState.setRegion('fukuoka');

    // ── 스폰 포인트: 지하철역/장소맵에서 복귀 시 해당 위치 근처 스폰 ──
    this.stationSpawnPoints = {
      yakuin: { x: 1900, y: 1250 }
    };
    this.placeSpawnPoints = {
      YukoHouseScene: { x: 400, y: 1500 },
      AmiHouseScene: { x: 700, y: 1400 },
      RuiHouseScene: { x: 1000, y: 1500 },
      BookstoreScene: { x: 1600, y: 700 },
      KoreanAcademyScene: { x: 500, y: 800 }
    };

    this.createWorld({
      startX: 1200, startY: 1000,
      tiles: 'grass',
      npcs: [
        // 아미 (야쿠인 주택가)
        { x: 750, y: 1350, texture: 'ami', name_ko: '아미', name_ja: 'アミ', hasDialogue: true,
          greeting_ko: '유코야! 한글 공부 시작하자!\nBTS 가사 읽고 싶지 않아?',
          greeting_ja: 'ユコ！ハングル勉強始めよう！\nBTSの歌詞読みたくない？' },
        // 루이 (야쿠인 주택가)
        { x: 1050, y: 1450, texture: 'rui', name_ko: '루이', name_ja: 'ルイ', hasDialogue: true,
          greeting_ko: '한국어 교재 샀어!\n같이 공부할까?',
          greeting_ja: '韓国語テキスト買ったよ！\n一緒に勉強する？' },
        // 한국어 선생님 (학원 앞)
        { x: 550, y: 750, texture: 'mission_npc', name_ko: '한국어 선생님', name_ja: '韓国語の先生', hasMission: true,
          greeting_ko: '안녕하세요! 한글을 배워 볼까요?\n자음과 모음부터 시작해요!',
          greeting_ja: 'こんにちは！ハングルを学んでみましょうか？\n子音と母音から始めましょう！' },
        // 서점 직원 (서점 앞)
        { x: 1650, y: 650, texture: 'mission_npc', name_ko: '서점 직원', name_ja: '書店員', hasMission: true,
          greeting_ko: '한국어 교재 찾으세요?\n초보자용 교재가 여기 있어요!',
          greeting_ja: '韓国語テキストをお探しですか？\n初心者用テキストはこちらです！' },
        // 편의점 점원 (중앙 상업지역)
        { x: 1250, y: 950, texture: 'shop', name_ko: '편의점 점원', name_ja: 'コンビニ店員',
          greeting_ko: '어서오세요! 필요하신 거 있으세요?',
          greeting_ja: 'いらっしゃいませ！何かお探しですか？' }
      ],
      buildings: []  // 건물은 아래에서 진입 가능 건물로 배치
    });

    // ── 진입 가능 건물 ──
    // 유코 집
    this.createEnterableBuilding(400, 1400, 'YukoHouseScene', {
      texture: 'building_house', name_ko: '유코 집', name_ja: 'ユコの家'
    });
    // 아미 집
    this.createEnterableBuilding(700, 1300, 'AmiHouseScene', {
      texture: 'building_house', name_ko: '아미 집', name_ja: 'アミの家'
    });
    // 루이 집
    this.createEnterableBuilding(1000, 1400, 'RuiHouseScene', {
      texture: 'building_house', name_ko: '루이 집', name_ja: 'ルイの家'
    });
    // 서점 (키노쿠니야)
    this.createEnterableBuilding(1600, 600, 'BookstoreScene', {
      texture: 'building_shop', name_ko: '서점', name_ja: '書店（紀伊國屋）'
    });
    // 한국어 학원
    this.createEnterableBuilding(500, 700, 'KoreanAcademyScene', {
      texture: 'building_academy', name_ko: '한국어 학원', name_ja: '韓国語教室'
    });
    // 편의점 (진입 불가, 일반 건물)
    this.createBuildings([
      { x: 1200, y: 900, texture: 'building_shop', name_ko: '편의점 / コンビニ' }
    ]);

    // ── 야쿠인역 (지하철 진입) ──
    this.createSubwayEntrance(1900, 1300, 'FukuokaMetroScene', 'yakuin',
      '야쿠인역 🚇', '薬院駅');

    // ── 지역맵 타일: 도로 패턴 ──
    this.addRoadOverlay();

    // ── 씬 타이틀 ──
    this.showSceneTitle('야쿠인', '薬院 · 福岡',
      'Ch.0 한글반 — ハングル班', '#88ff88');

    // 페이드 인
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // ── 도로 오버레이: 실제 야쿠인 거리 패턴 반영 ──
  addRoadOverlay() {
    const g = this.add.graphics().setDepth(0.5);
    const roadColor = 0x666666;
    const roadAlpha = 0.6;
    const roadW = 48;

    g.fillStyle(roadColor, roadAlpha);

    // 동서 주요 도로 (메인 스트리트)
    g.fillRect(0, 900 - roadW / 2, this.worldWidth, roadW);      // 중앙 수평
    g.fillRect(0, 500 - roadW / 2, this.worldWidth, roadW);      // 상단 수평

    // 남북 주요 도로
    g.fillRect(1200 - roadW / 2, 0, roadW, this.worldHeight);    // 중앙 수직
    g.fillRect(600 - roadW / 2, 400, roadW, this.worldHeight - 400); // 좌측 수직

    // 보도 (인도)
    g.fillStyle(0xAAAAAA, 0.3);
    g.fillRect(0, 900 + roadW / 2, this.worldWidth, 16);
    g.fillRect(0, 900 - roadW / 2 - 16, this.worldWidth, 16);
    g.fillRect(0, 500 + roadW / 2, this.worldWidth, 12);
    g.fillRect(0, 500 - roadW / 2 - 12, this.worldWidth, 12);
  }
}
