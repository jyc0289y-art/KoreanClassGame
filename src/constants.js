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
