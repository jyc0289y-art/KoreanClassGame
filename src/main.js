import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

// ── 기존 씬 ──
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import ChapterSelectScene from './scenes/ChapterSelectScene.js';
import DialogueScene from './scenes/DialogueScene.js';
import MissionScene from './scenes/MissionScene.js';
import VocabularyScene from './scenes/VocabularyScene.js';
import ShopScene from './scenes/ShopScene.js';

// ── Layer 1: 국제맵 ──
import InternationalMapScene from './scenes/InternationalMapScene.js';

// ── Layer 2: 광역맵 ──
import FukuokaMetroScene from './scenes/FukuokaMetroScene.js';
import SeoulMetroScene from './scenes/SeoulMetroScene.js';

// ── Layer 3a: 통합 지역맵 ──
import FukuokaUnifiedScene from './scenes/fukuoka/FukuokaUnifiedScene.js';
import SeoulUnifiedScene from './scenes/seoul/SeoulUnifiedScene.js';

// ── Layer 3a: 공항맵 (독립) ──
import FukuokaAirportScene from './scenes/fukuoka/FukuokaAirportScene.js';
import IncheonAirportScene from './scenes/incheon/IncheonAirportScene.js';

// ── Layer 3b: 후쿠오카 장소맵 ──
import YukoHouseScene from './scenes/fukuoka/YukoHouseScene.js';
import AmiHouseScene from './scenes/fukuoka/AmiHouseScene.js';
import RuiHouseScene from './scenes/fukuoka/RuiHouseScene.js';
import BookstoreScene from './scenes/fukuoka/BookstoreScene.js';
import KoreanAcademyScene from './scenes/fukuoka/KoreanAcademyScene.js';

// ── Layer 3b: 서울 장소맵 ──
import OliveYoungScene from './scenes/seoul/OliveYoungScene.js';
import RestaurantScene from './scenes/seoul/RestaurantScene.js';
import HiKRGroundScene from './scenes/seoul/HiKRGroundScene.js';
import HotelScene from './scenes/seoul/HotelScene.js';

// Destroy previous instance on HMR reload
if (window.__PHASER_GAME__) {
  window.__PHASER_GAME__.destroy(true);
  window.__PHASER_GAME__ = null;
  // Clear any leftover canvases
  const container = document.getElementById('game-container');
  if (container) container.innerHTML = '';
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0a0a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    activePointers: 3
  },
  scene: [
    // ── Boot & UI ──
    BootScene,
    TitleScene,
    ChapterSelectScene,

    // ── Layer 1: 국제맵 ──
    InternationalMapScene,

    // ── Layer 2: 광역맵 ──
    FukuokaMetroScene,
    SeoulMetroScene,

    // ── Layer 3a: 통합 지역맵 ──
    FukuokaUnifiedScene,
    SeoulUnifiedScene,

    // ── Layer 3a: 공항맵 (독립) ──
    FukuokaAirportScene,
    IncheonAirportScene,

    // ── Layer 3b: 장소맵 (후쿠오카) ──
    YukoHouseScene,
    AmiHouseScene,
    RuiHouseScene,
    BookstoreScene,
    KoreanAcademyScene,

    // ── Layer 3b: 장소맵 (서울) ──
    OliveYoungScene,
    RestaurantScene,
    HiKRGroundScene,
    HotelScene,

    // ── Overlay 씬 ──
    DialogueScene,
    MissionScene,
    VocabularyScene,
    ShopScene
  ]
};

window.__PHASER_GAME__ = new Phaser.Game(config);

// Vite HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (window.__PHASER_GAME__) {
      window.__PHASER_GAME__.destroy(true);
      window.__PHASER_GAME__ = null;
      const container = document.getElementById('game-container');
      if (container) container.innerHTML = '';
    }
  });
  import.meta.hot.accept();
}
