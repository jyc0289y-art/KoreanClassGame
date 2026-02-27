import BaseMapUIScene from './BaseMapUIScene.js';
import { gameState } from '../systems/GameState.js';

// ============================================================
// SeoulMetroScene — 서울 지하철 광역맵
//  실제 서울 지하철 노선도 기반
//  - 2호선(초록): 순환선
//  - 4호선(하늘): 명동~서울역
//  - AREX(주황): 인천공항~서울역
//  - 한강 표시
// ============================================================

export default class SeoulMetroScene extends BaseMapUIScene {
  constructor() { super('SeoulMetroScene'); }

  init(data) { this._initData = data || {}; }

  create() {
    const fromStation = this._initData?.fromStation || gameState.lastStation || 'incheon_airport';

    this.createMapUI({
      title_ko: '서울 지하철',
      title_ja: 'ソウル地下鉄',
      subtitle: 'Ch.1 초급 회화반 エリア',
      bgColor: 0x0a0a2e,
      fromStation,

      // 서울 외곽선 + 한강
      outlines: [
        // 서울 외곽 (산지 경계)
        {
          points: [
            [0.15, 0.20], [0.25, 0.12], [0.40, 0.10], [0.55, 0.12],
            [0.70, 0.15], [0.82, 0.22], [0.88, 0.35], [0.85, 0.50],
            [0.80, 0.65], [0.75, 0.75], [0.65, 0.82], [0.50, 0.85],
            [0.35, 0.82], [0.22, 0.75], [0.15, 0.65], [0.12, 0.50],
            [0.12, 0.35]
          ],
          color: 0x334466, alpha: 0.25, closed: true
        }
      ],

      // 한강
      waterAreas: [
        {
          points: [
            [0.08, 0.53], [0.20, 0.55], [0.35, 0.56], [0.50, 0.57],
            [0.65, 0.56], [0.80, 0.54], [0.92, 0.52],
            [0.92, 0.58], [0.80, 0.60], [0.65, 0.62], [0.50, 0.63],
            [0.35, 0.62], [0.20, 0.61], [0.08, 0.59]
          ],
          color: 0x1a3a6a, alpha: 0.5
        }
      ],

      // 노선
      routeLines: [
        // 2호선 (초록, 순환) — 강북 중심부
        {
          color: '#33A23D', width: 5, alpha: 0.8,
          points: [
            [0.25, 0.42], [0.30, 0.38], [0.35, 0.35],
            [0.42, 0.33], [0.50, 0.32], [0.58, 0.33],
            [0.65, 0.35], [0.72, 0.38], [0.75, 0.42],
            [0.76, 0.48], [0.73, 0.52],
            // 한강 남쪽
            [0.68, 0.68], [0.60, 0.72], [0.50, 0.73],
            [0.40, 0.72], [0.32, 0.68],
            [0.25, 0.60], [0.22, 0.52], [0.23, 0.46]
          ]
        },
        // 4호선 (하늘, 종단)
        {
          color: '#3DB7CC', width: 4, alpha: 0.7,
          points: [
            [0.42, 0.18], [0.44, 0.25], [0.46, 0.30],
            [0.48, 0.34], [0.50, 0.38], [0.52, 0.42]
          ]
        },
        // AREX (주황, 인천공항→서울역)
        {
          color: '#FF8C00', width: 4, alpha: 0.6,
          points: [
            [0.05, 0.48], [0.12, 0.46], [0.18, 0.44],
            [0.25, 0.42], [0.30, 0.38], [0.42, 0.33]
          ]
        },
        // 6호선 (갈색)
        {
          color: '#8B4513', width: 3, alpha: 0.5,
          points: [
            [0.22, 0.38], [0.26, 0.40], [0.30, 0.38]
          ]
        }
      ],

      // 역 노드
      nodes: [
        // AREX
        { id: 'incheon_airport', name_ko: '인천공항', name_ja: '仁川空港',
          x: 0.05, y: 0.48, color: '#FF8C00', unlockLevel: 0,
          targetScene: 'IncheonAirportScene',
          isCurrent: fromStation === 'incheon_airport' },

        // 2호선/AREX 환승
        { id: 'hongdae', name_ko: '홍대입구', name_ja: 'ホンデイック',
          x: 0.30, y: 0.38, color: '#33A23D', unlockLevel: 4,
          targetScene: 'SeoulHongdaeScene', isTransfer: true },

        // 2호선
        { id: 'sinchon', name_ko: '신촌', name_ja: 'シンチョン',
          x: 0.35, y: 0.35, color: '#33A23D', unlockLevel: 99 },

        // 4호선
        { id: 'seoul_station', name_ko: '서울역', name_ja: 'ソウル駅',
          x: 0.42, y: 0.33, color: '#3DB7CC', unlockLevel: 99,
          isTransfer: true },

        { id: 'myeongdong', name_ko: '명동', name_ja: 'ミョンドン',
          x: 0.50, y: 0.38, color: '#3DB7CC', unlockLevel: 4,
          targetScene: 'SeoulMyeongdongScene' },

        // 2호선
        { id: 'seongsu', name_ko: '성수', name_ja: 'ソンス',
          x: 0.72, y: 0.38, color: '#33A23D', unlockLevel: 6,
          targetScene: 'SeoulSeongsuScene' },

        // 2호선 (강남)
        { id: 'gangnam', name_ko: '강남', name_ja: 'カンナム',
          x: 0.60, y: 0.72, color: '#33A23D', unlockLevel: 5,
          targetScene: 'SeoulGangnamScene' },

        // 6호선
        { id: 'mangwon', name_ko: '망원', name_ja: 'マンウォン',
          x: 0.22, y: 0.38, color: '#8B4513', unlockLevel: 9 }
      ]
    });

    // 한강 라벨
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.add.text(w * 0.50, h * 0.57, '── 한강 / 漢江 ──', {
      fontSize: `${Math.round(9 * this.uiScale)}px`,
      color: '#3366aa', fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(3);
  }

  goBack() {
    const lastStation = gameState.lastStation;
    const stationSceneMap = {
      incheon_airport: 'IncheonAirportScene',
      hongdae: 'SeoulHongdaeScene',
      myeongdong: 'SeoulMyeongdongScene',
      gangnam: 'SeoulGangnamScene',
      seongsu: 'SeoulSeongsuScene'
    };
    const targetScene = stationSceneMap[lastStation] || 'IncheonAirportScene';

    this._isTransitioning = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start(targetScene, { fromStation: lastStation });
    });
  }
}
