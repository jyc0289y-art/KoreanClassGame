// ============================================================
// 안녕, 서울 — 게임 상수 및 정적 데이터
// ============================================================

// 캐릭터 데이터 (모든 씬에서 참조, 크기 작음)
export const CHARACTERS = {
  yuko: { name_ko: '유코', name_ja: 'ユコ', color: '#ff69b4', age: 28, from: '후쿠오카', from_ja: '福岡', job_ko: '패션잡지 기자', job_ja: 'ファッション誌記者', hobby_ko: 'K-POP·K-드라마 마니아', hobby_ja: 'K-POP・K-ドラマ好き', story_branch: 'business' },
  ami: { name_ko: '아미', name_ja: 'アミ', color: '#da70d6', age: 27, from: '후쿠오카', from_ja: '福岡', job_ko: '미용사', job_ja: '美容師', hobby_ko: 'K-뷰티·BTS 팬', hobby_ja: 'K-ビューティー・BTSファン', story_branch: 'fandom' },
  rui: { name_ko: '루이', name_ja: 'ルイ', color: '#00ced1', age: 26, from: '후쿠오카', from_ja: '福岡', job_ko: '유튜버/먹방 크리에이터', job_ja: 'YouTuber/モッパンクリエイター', hobby_ko: '올리브영 탐험가', hobby_ja: 'オリーブヤング探検家', story_branch: 'media' }
};

// NPC 데이터
export const NPCS = {
  hyunjeong: { name_ko: '이현정', name_ja: 'イ・ヒョンジョン', color: '#ffa500', role_ko: '간호사 / 요리 고수', role_ja: '看護師・料理上手' },
  yuseok: { name_ko: '김유석', name_ja: 'キム・ユソク', color: '#4169e1', role_ko: 'AI 앱 개발자', role_ja: 'AIアプリ開発者' },
  cheoiseok: { name_ko: '최석', name_ja: 'チェソク', color: '#32cd32', role_ko: '사업가', role_ja: '事業家' }
};

// 게임 설정 상수
export const GAME_WIDTH = 400;      // 참조 해상도 (RESIZE 모드에서는 초기값)
export const GAME_HEIGHT = 600;     // 참조 해상도
export const REF_WIDTH = 400;       // UI 스케일링 기준 폭
export const REF_HEIGHT = 600;      // UI 스케일링 기준 높이
export const PLAYER_SPEED = 200;
export const DEFAULT_WORLD_WIDTH = 1600;
export const DEFAULT_WORLD_HEIGHT = 1200;

// ── 3계층 맵 시스템 상수 ──

// 지역맵 크기 (워커블 월드)
export const MAP_SIZES = {
  YAKUIN:        { w: 2400, h: 1800 },  // 후쿠오카 야쿠인 (확장)
  AIRPORT:       { w: 1600, h: 1200 },  // 공항 맵
  INCHEON:       { w: 2000, h: 1200 },  // 인천공항
  SEOUL_DEFAULT: { w: 1600, h: 1200 },  // 서울 기본 지역맵
  SEOUL_LARGE:   { w: 2400, h: 1800 },  // 서울 대형 지역맵
};

// 장소맵 크기 (실내)
export const PLACE_SIZES = {
  SMALL:  { w: 800,  h: 600 },   // 집, 식당 등
  MEDIUM: { w: 1000, h: 600 },   // 서점, 올리브영 등
  LARGE:  { w: 1000, h: 800 },   // 학원, 하이커그라운드 등
};

// 지역 상수
export const REGIONS = {
  FUKUOKA: 'fukuoka',
  SEOUL: 'seoul'
};

// 광역맵 씬 키 매핑
export const METRO_SCENES = {
  fukuoka: 'FukuokaMetroScene',
  seoul: 'SeoulMetroScene'
};

// 건물 색상 테마
export const BUILDING_COLORS = {
  subway:      0x2E8B57,  // 지하철역 입구
  restaurant:  0xCD5C5C,  // 음식점
  cafe:        0x8B4513,  // 카페
  hospital:    0xFFFFFF,  // 병원
  police:      0x4169E1,  // 경찰서
  cinema:      0x8B0000,  // 영화관
  oliveyoung:  0x00A651,  // 올리브영
  tower:       0xFF4500,  // N서울타워
  departure:   0x4682B4,  // 국제선 탑승구
  house:       0xCD853F,  // 일반 집
  shop:        0xDAA520,  // 상점
  academy:     0x6A5ACD,  // 학원
  airport:     0x4A6FA5,  // 공항
  station:     0x228B22,  // 역
};
