import BaseMapUIScene from './BaseMapUIScene.js';
import { gameState } from '../systems/GameState.js';

// ============================================================
// InternationalMapScene — 국제맵 (동아시아)
//  후쿠오카공항 ↔ 인천공항 이동
//  상세 해안선: 한반도(150+pts), 규슈(40+pts), 혼슈/시코쿠,
//  제주도, 대마도 포함
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

      // 상세 해안선 (정규화 좌표 0~1)
      outlines: [
        // ── 한반도 (서해안 → 남해안 → 동해안, 시계방향) ──
        {
          points: [
            // 북서쪽 (압록강 하구~황해도)
            [0.24, 0.08], [0.25, 0.10], [0.26, 0.12], [0.27, 0.13],
            [0.26, 0.15], [0.25, 0.17], [0.24, 0.19],
            // 서해안 (경기만~충남)
            [0.23, 0.21], [0.22, 0.23], [0.21, 0.25], [0.22, 0.27],
            [0.23, 0.28], [0.22, 0.30], [0.21, 0.32],
            // 인천 (서울 서쪽)
            [0.22, 0.33], [0.23, 0.34], [0.24, 0.35], [0.23, 0.36],
            // 충남~전북 서해안
            [0.22, 0.37], [0.21, 0.39], [0.20, 0.41], [0.19, 0.43],
            [0.20, 0.44], [0.21, 0.45], [0.20, 0.47],
            // 전남 서해안 (리아스식)
            [0.19, 0.49], [0.18, 0.51], [0.19, 0.52], [0.20, 0.53],
            [0.19, 0.55], [0.18, 0.56], [0.19, 0.57], [0.20, 0.58],
            // 전남 남해안 (다도해)
            [0.21, 0.59], [0.22, 0.60], [0.24, 0.61], [0.26, 0.62],
            [0.28, 0.61], [0.30, 0.60], [0.32, 0.59],
            // 남해안 (통영~부산)
            [0.34, 0.58], [0.36, 0.57], [0.37, 0.58], [0.38, 0.57],
            [0.39, 0.56], [0.40, 0.55], [0.41, 0.54],
            // 부산
            [0.42, 0.53], [0.43, 0.52], [0.44, 0.51],
            // 동해안 (부산→울산→포항)
            [0.44, 0.49], [0.43, 0.47], [0.43, 0.45], [0.44, 0.43],
            [0.44, 0.41], [0.43, 0.39], [0.43, 0.37],
            // 동해안 (삼척~강원)
            [0.44, 0.35], [0.44, 0.33], [0.43, 0.31], [0.43, 0.29],
            [0.44, 0.27], [0.44, 0.25], [0.43, 0.23],
            // 동해안 (금강산~원산)
            [0.43, 0.21], [0.42, 0.19], [0.41, 0.17], [0.40, 0.15],
            // 동해안 (함경도)
            [0.40, 0.13], [0.39, 0.11], [0.38, 0.09], [0.37, 0.08],
            // 북동쪽 (두만강 하구)
            [0.36, 0.06], [0.35, 0.05], [0.34, 0.04],
            // 북쪽 내륙 (압록~두만)
            [0.32, 0.04], [0.30, 0.05], [0.28, 0.06], [0.26, 0.07]
          ],
          color: 0x445566, alpha: 0.55, closed: true
        },

        // ── 규슈 (상세) ──
        {
          points: [
            // 북쪽 (기타큐슈~후쿠오카 하카타만)
            [0.62, 0.48], [0.63, 0.47], [0.65, 0.46], [0.67, 0.46],
            [0.69, 0.47], [0.70, 0.48],
            // 동쪽 (오이타)
            [0.71, 0.50], [0.72, 0.52], [0.73, 0.54], [0.74, 0.56],
            // 남동쪽 (미야자키)
            [0.74, 0.58], [0.73, 0.60], [0.73, 0.62], [0.72, 0.64],
            // 남쪽 (가고시마)
            [0.71, 0.66], [0.70, 0.68], [0.68, 0.69], [0.66, 0.70],
            // 남서쪽
            [0.64, 0.69], [0.62, 0.68], [0.61, 0.67],
            // 서쪽 (나가사키 반도)
            [0.59, 0.66], [0.57, 0.65], [0.56, 0.63], [0.55, 0.61],
            [0.56, 0.59], [0.57, 0.57],
            // 아리아케해 방면
            [0.58, 0.56], [0.57, 0.55], [0.56, 0.54],
            // 북서쪽 (사가)
            [0.57, 0.53], [0.58, 0.52], [0.59, 0.51], [0.60, 0.50],
            [0.61, 0.49]
          ],
          color: 0x445566, alpha: 0.55, closed: true
        },

        // ── 혼슈 (서쪽 일부 + 관서~관동) ──
        {
          points: [
            [0.70, 0.42], [0.72, 0.40], [0.74, 0.39], [0.76, 0.38],
            [0.78, 0.37], [0.80, 0.36], [0.82, 0.35], [0.84, 0.34],
            [0.86, 0.33], [0.88, 0.32], [0.90, 0.31], [0.92, 0.30],
            [0.94, 0.29], [0.96, 0.28], [0.98, 0.27],
            // 남쪽 해안
            [0.98, 0.38], [0.96, 0.39], [0.94, 0.40], [0.92, 0.41],
            [0.90, 0.42], [0.88, 0.42], [0.86, 0.43], [0.84, 0.43],
            [0.82, 0.44], [0.80, 0.44], [0.78, 0.45],
            [0.76, 0.45], [0.74, 0.46], [0.72, 0.46]
          ],
          color: 0x3a4a5a, alpha: 0.4, closed: true
        },

        // ── 시코쿠 ──
        {
          points: [
            [0.76, 0.48], [0.78, 0.47], [0.80, 0.47], [0.82, 0.48],
            [0.84, 0.49], [0.85, 0.51], [0.84, 0.53], [0.82, 0.54],
            [0.80, 0.54], [0.78, 0.53], [0.77, 0.51], [0.76, 0.50]
          ],
          color: 0x3a4a5a, alpha: 0.35, closed: true
        },

        // ── 제주도 ──
        {
          points: [
            [0.26, 0.65], [0.27, 0.64], [0.28, 0.63], [0.30, 0.63],
            [0.32, 0.63], [0.33, 0.64], [0.34, 0.65], [0.33, 0.66],
            [0.32, 0.67], [0.30, 0.67], [0.28, 0.67], [0.27, 0.66]
          ],
          color: 0x445566, alpha: 0.45, closed: true
        },

        // ── 대마도 (쓰시마) ──
        {
          points: [
            [0.52, 0.48], [0.53, 0.47], [0.54, 0.46], [0.55, 0.47],
            [0.55, 0.49], [0.54, 0.51], [0.53, 0.52], [0.52, 0.51],
            [0.51, 0.50]
          ],
          color: 0x3a4a5a, alpha: 0.35, closed: true
        }
      ],

      // 바다 배경
      waterAreas: [
        {
          points: [[0, 0], [1, 0], [1, 1], [0, 1]],
          color: 0x05102a, alpha: 0.3
        }
      ],

      // 비행 경로
      routeLines: [
        {
          color: '#FFD700', width: 2, alpha: 0.4,
          points: [
            [0.30, 0.34], [0.36, 0.38], [0.42, 0.44],
            [0.48, 0.48], [0.54, 0.52], [0.60, 0.55], [0.64, 0.56]
          ]
        }
      ],

      // 공항 노드
      nodes: [
        {
          id: 'incheon_airport',
          name_ko: '인천국제공항', name_ja: '仁川国際空港',
          x: 0.28, y: 0.34,
          color: '#FF69B4', unlockLevel: 1,
          targetScene: 'IncheonAirportScene'
        },
        {
          id: 'fukuoka_airport',
          name_ko: '후쿠오카공항', name_ja: '福岡空港',
          x: 0.66, y: 0.56,
          color: '#FF8C00', unlockLevel: 0,
          targetScene: 'FukuokaAirportScene'
        }
      ]
    });

    // 비행기 애니메이션
    this.addFlightAnimation();

    // 도시 라벨
    this.addCityLabels();
  }

  addFlightAnimation() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const airplane = this.add.text(w * 0.47, h * 0.46, '✈️', {
      fontSize: '20px'
    }).setOrigin(0.5).setDepth(8);

    this.tweens.add({
      targets: airplane,
      x: { from: w * 0.30, to: w * 0.64 },
      y: { from: h * 0.34, to: h * 0.56 },
      duration: 4000, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  addCityLabels() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const s = this.uiScale;
    const style = (color) => ({
      fontSize: `${Math.round(7 * s)}px`, color,
      backgroundColor: '#00000044', padding: { x: 3, y: 1 }
    });

    // 한국 도시
    this.add.text(w * 0.30, h * 0.30, '서울 Seoul', style('#FF69B4')).setOrigin(0.5).setDepth(5);
    this.add.text(w * 0.43, h * 0.52, '부산 Busan', style('#aaaacc')).setOrigin(0.5).setDepth(5);
    this.add.text(w * 0.30, h * 0.65, '제주 Jeju', style('#aaaacc')).setOrigin(0.5).setDepth(5);

    // 일본 도시
    this.add.text(w * 0.66, h * 0.52, '후쿠오카', style('#FF8C00')).setOrigin(0.5).setDepth(5);
    this.add.text(w * 0.90, h * 0.34, '오사카', style('#888888')).setOrigin(0.5).setDepth(5);
    this.add.text(w * 0.96, h * 0.28, '도쿄', style('#888888')).setOrigin(0.5).setDepth(5);

    // 해역 라벨
    this.add.text(w * 0.15, h * 0.45, '황해\n黄海', {
      fontSize: `${Math.round(8 * s)}px`, color: '#1a3a6a',
      fontStyle: 'italic', align: 'center'
    }).setOrigin(0.5).setDepth(3);

    this.add.text(w * 0.48, h * 0.42, '대한해협\n対馬海峡', {
      fontSize: `${Math.round(7 * s)}px`, color: '#1a3a6a',
      fontStyle: 'italic', align: 'center'
    }).setOrigin(0.5).setDepth(3);

    this.add.text(w * 0.53, h * 0.48, '쓰시마\n対馬', {
      fontSize: `${Math.round(6 * s)}px`, color: '#666688'
    }).setOrigin(0.5).setDepth(5);
  }

  goBack() {
    const lastAirport = gameState.lastAirport || 'FukuokaAirportScene';
    this._isTransitioning = true;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start(lastAirport);
    });
  }
}
