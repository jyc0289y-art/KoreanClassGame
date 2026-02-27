import BaseMapUIScene from './BaseMapUIScene.js';
import { gameState } from '../systems/GameState.js';

// ============================================================
// FukuokaMetroScene — 후쿠오카 지하철 광역맵
//  실제 후쿠오카 지하철 3개 노선 기반
//  - 공항선(주황): 메이노하마~후쿠오카공항
//  - 하코자키선(파랑): 나카스~카이즈카
//  - 나나쿠마선(녹색): 하시모토~하카타
// ============================================================

export default class FukuokaMetroScene extends BaseMapUIScene {
  constructor() { super('FukuokaMetroScene'); }

  init(data) {
    this._initData = data || {};
  }

  create() {
    const fromStation = this._initData?.fromStation || gameState.lastStation || 'yakuin';

    this.createMapUI({
      title_ko: '후쿠오카 지하철',
      title_ja: '福岡市地下鉄',
      subtitle: 'Ch.0 한글반 エリア',
      bgColor: 0x0a0a2e,
      fromStation,

      // 하카타만 해안선 윤곽 (정규화 좌표: 0~1)
      outlines: [
        {
          points: [
            [0.05, 0.25], [0.15, 0.18], [0.25, 0.15], [0.35, 0.13],
            [0.45, 0.12], [0.55, 0.13], [0.65, 0.15], [0.75, 0.18],
            [0.85, 0.22], [0.92, 0.28], [0.95, 0.35]
          ],
          color: 0x334488, alpha: 0.4, closed: false
        }
      ],

      // 바다 영역 (북쪽)
      waterAreas: [
        {
          points: [
            [0, 0], [1, 0], [1, 0.35], [0.95, 0.35],
            [0.92, 0.28], [0.85, 0.22], [0.75, 0.18],
            [0.65, 0.15], [0.55, 0.13], [0.45, 0.12],
            [0.35, 0.13], [0.25, 0.15], [0.15, 0.18],
            [0.05, 0.25], [0, 0.3]
          ],
          color: 0x0a1a3a, alpha: 0.5
        }
      ],

      // 노선
      routeLines: [
        // 공항선 (주황) — 서→동 횡단
        {
          color: '#FF8C00', width: 5, alpha: 0.85,
          points: [
            [0.08, 0.45], [0.15, 0.43], [0.22, 0.42], [0.28, 0.42],
            [0.33, 0.43], [0.38, 0.42], [0.42, 0.40], [0.48, 0.42],
            [0.55, 0.43], [0.60, 0.42], [0.67, 0.43], [0.74, 0.45],
            [0.88, 0.48]
          ]
        },
        // 하코자키선 (파랑) — 나카스에서 북동쪽
        {
          color: '#4169E1', width: 4, alpha: 0.7,
          points: [
            [0.55, 0.43], [0.58, 0.38], [0.62, 0.35],
            [0.66, 0.33], [0.70, 0.32], [0.75, 0.31], [0.80, 0.30]
          ]
        },
        // 나나쿠마선 (녹색) — 남서→중앙
        {
          color: '#2E8B57', width: 4, alpha: 0.7,
          points: [
            [0.12, 0.85], [0.18, 0.78], [0.24, 0.72],
            [0.30, 0.66], [0.35, 0.62], [0.40, 0.58],
            [0.43, 0.55], [0.45, 0.52], [0.47, 0.48],
            [0.48, 0.44], [0.67, 0.43]
          ]
        }
      ],

      // 역 노드
      nodes: [
        // ── 공항선 주요역 ──
        { id: 'meinohama', name_ko: '메이노하마', name_ja: '姪浜',
          x: 0.08, y: 0.45, color: '#FF8C00', unlockLevel: 99, lineId: 'airport' },
        { id: 'tenjin', name_ko: '텐진', name_ja: '天神',
          x: 0.48, y: 0.42, color: '#FF8C00', unlockLevel: 2,
          isTransfer: true, lineId: 'airport' },
        { id: 'nakasu', name_ko: '나카스카와바타', name_ja: '中洲川端',
          x: 0.55, y: 0.43, color: '#FF8C00', unlockLevel: 99,
          isTransfer: true, lineId: 'airport' },
        { id: 'hakata', name_ko: '하카타', name_ja: '博多',
          x: 0.67, y: 0.43, color: '#FF8C00', unlockLevel: 2,
          isTransfer: true, lineId: 'airport' },
        { id: 'fukuoka_airport', name_ko: '후쿠오카공항', name_ja: '福岡空港',
          x: 0.88, y: 0.48, color: '#FF8C00', unlockLevel: 1,
          targetScene: 'FukuokaAirportScene', lineId: 'airport' },

        // ── 나나쿠마선 주요역 ──
        { id: 'yakuin', name_ko: '야쿠인', name_ja: '薬院',
          x: 0.45, y: 0.52, color: '#2E8B57', unlockLevel: 0,
          targetScene: 'FukuokaYakuinScene', lineId: 'nanakuma',
          isCurrent: fromStation === 'yakuin' },
        { id: 'tenjin_minami', name_ko: '텐진미나미', name_ja: '天神南',
          x: 0.48, y: 0.44, color: '#2E8B57', unlockLevel: 99,
          lineId: 'nanakuma' }
      ]
    });
  }

  goBack() {
    // 마지막 지역맵으로 복귀
    const lastStation = gameState.lastStation || 'yakuin';
    const stationSceneMap = {
      yakuin: 'FukuokaYakuinScene',
      fukuoka_airport: 'FukuokaAirportScene'
    };
    const targetScene = stationSceneMap[lastStation] || 'FukuokaYakuinScene';

    this._isTransitioning = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start(targetScene, { fromStation: lastStation });
    });
  }
}
