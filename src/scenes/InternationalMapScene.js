import BaseMapUIScene from './BaseMapUIScene.js';
import { gameState } from '../systems/GameState.js';

// ============================================================
// InternationalMapScene — 국제맵 (동아시아)
//  후쿠오카공항 ↔ 인천공항 이동
//  한반도 + 규슈 해안선 실루엣 렌더링
// ============================================================

export default class InternationalMapScene extends BaseMapUIScene {
  constructor() { super('InternationalMapScene'); }

  init(data) { this._initData = data || {}; }

  create() {
    const fromAirport = this._initData?.fromAirport || gameState.lastAirport;

    this.createMapUI({
      title_ko: '국제선 이동',
      title_ja: '国際線移動',
      subtitle: 'International Flight',
      bgColor: 0x05102a,
      fromStation: fromAirport === 'FukuokaAirportScene' ? 'fukuoka_airport' :
                   fromAirport === 'IncheonAirportScene' ? 'incheon_airport' : null,

      // 한반도 실루엣 (정규화 좌표)
      outlines: [
        // 한반도
        {
          points: [
            [0.28, 0.18], [0.32, 0.15], [0.36, 0.14], [0.38, 0.16],
            [0.39, 0.20], [0.40, 0.25], [0.38, 0.30], [0.36, 0.35],
            [0.34, 0.40], [0.32, 0.44], [0.30, 0.48], [0.28, 0.52],
            [0.27, 0.55], [0.28, 0.58], [0.30, 0.55], [0.32, 0.52],
            [0.34, 0.48], [0.36, 0.45], [0.38, 0.42], [0.40, 0.40],
            [0.42, 0.38], [0.43, 0.35], [0.42, 0.30], [0.40, 0.26],
            [0.38, 0.22], [0.36, 0.18], [0.34, 0.16], [0.32, 0.15]
          ],
          color: 0x445566, alpha: 0.5, closed: true
        },
        // 규슈 (일본)
        {
          points: [
            [0.58, 0.55], [0.62, 0.52], [0.66, 0.50], [0.70, 0.52],
            [0.72, 0.56], [0.74, 0.60], [0.72, 0.65], [0.68, 0.68],
            [0.64, 0.67], [0.60, 0.64], [0.58, 0.60]
          ],
          color: 0x445566, alpha: 0.5, closed: true
        },
        // 일본 본토 (시코쿠+혼슈 일부)
        {
          points: [
            [0.72, 0.42], [0.78, 0.38], [0.84, 0.35], [0.90, 0.33],
            [0.95, 0.32], [0.95, 0.40], [0.90, 0.42], [0.84, 0.44],
            [0.78, 0.46], [0.74, 0.48]
          ],
          color: 0x334455, alpha: 0.3, closed: true
        }
      ],

      // 바다
      waterAreas: [
        {
          points: [
            [0, 0], [1, 0], [1, 1], [0, 1]
          ],
          color: 0x05102a, alpha: 0.3
        }
      ],

      // 비행 경로
      routeLines: [
        {
          color: '#FFD700', width: 2, alpha: 0.4,
          points: [
            [0.32, 0.38], [0.38, 0.42], [0.44, 0.48],
            [0.50, 0.52], [0.56, 0.55], [0.62, 0.57]
          ]
        }
      ],

      // 공항 노드
      nodes: [
        {
          id: 'incheon_airport',
          name_ko: '인천국제공항', name_ja: '仁川国際空港',
          x: 0.30, y: 0.38,
          color: '#FF69B4', unlockLevel: 1,
          targetScene: 'IncheonAirportScene'
        },
        {
          id: 'fukuoka_airport',
          name_ko: '후쿠오카공항', name_ja: '福岡空港',
          x: 0.64, y: 0.58,
          color: '#FF8C00', unlockLevel: 0,
          targetScene: 'FukuokaAirportScene'
        }
      ]
    });

    // 비행기 아이콘 애니메이션 (두 공항 사이)
    this.addFlightAnimation();
  }

  addFlightAnimation() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const airplane = this.add.text(w * 0.47, h * 0.48, '✈️', {
      fontSize: '20px'
    }).setOrigin(0.5).setDepth(8);

    this.tweens.add({
      targets: airplane,
      x: { from: w * 0.32, to: w * 0.62 },
      y: { from: h * 0.38, to: h * 0.56 },
      duration: 4000, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  goBack() {
    // 마지막 공항으로 복귀
    const lastAirport = gameState.lastAirport || 'FukuokaAirportScene';
    this._isTransitioning = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start(lastAirport);
    });
  }
}
