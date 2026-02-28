# Phase 2~4 상세 실현 계획 — 오디오 시스템 중점

**작성일**: 2026-02-28
**기반**: Phaser 3.60+ 오디오 API 조사, 무료 리소스 조사, Web Speech API 한국어 지원 조사

---

## 1. 오디오 시스템 상세 설계 (Phase 2-A)

### 1-1. 아키텍처 개요

```
Game
 └── AudioManager (싱글턴, game.audioManager)
      ├── BGM 채널 — 씬별 배경음악 크로스페이드
      ├── SFX 채널 — UI/게임 효과음 (오디오 스프라이트)
      ├── TTS 채널 — 한국어 발음 재생
      └── Settings — localStorage 볼륨 영속 저장
```

**핵심 포인트**: Phaser 3의 `this.sound`는 **게임 전체 싱글턴**입니다. 씬 A에서 추가한 사운드를 씬 B에서 제어할 수 있으므로, BGM 크로스페이드가 자연스럽게 가능합니다.

### 1-2. Phaser 사운드 백엔드

| 백엔드 | 사용 조건 | 특징 |
|--------|----------|------|
| **WebAudioSoundManager** | 기본값 (Chrome, Safari, Edge) | 공간 오디오, per-sound gain, 빠른 SFX 재생 |
| **HTML5AudioSoundManager** | WebAudio 미지원 시 폴백 | `<audio>` 태그 기반, 동시 재생 제한 |
| **NoAudioSoundManager** | 오디오 비활성화 시 | no-op 스텁 (테스트용) |

Phaser가 자동 감지하므로 별도 설정 불필요.

### 1-3. 필요한 오디오 에셋 목록

#### BGM (배경음악) — 5~7트랙

| 키 | 사용 씬 | 분위기 | 길이 |
|----|---------|--------|------|
| `bgm-title` | TitleScene | 밝고 설레는 K-POP 풍 | 60~90초 루프 |
| `bgm-fukuoka` | 후쿠오카 지역맵/장소맵 | 차분한 일본 소도시 | 90~120초 루프 |
| `bgm-seoul` | 서울 지역맵/장소맵 | 활기찬 한국 도심 | 90~120초 루프 |
| `bgm-airport` | 공항 씬 | 여행 출발 기대감 | 60~90초 루프 |
| `bgm-quiz` | MissionScene | 집중/긴장감 | 60초 루프 |
| `bgm-dialogue` | DialogueScene | 잔잔한 대화 BGM | 90초 루프 |
| `bgm-shop` | ShopScene | 가벼운 쇼핑 BGM | 60초 루프 |

#### SFX (효과음) — 오디오 스프라이트 1개 (10~15개 효과)

| 마커 | 용도 | 길이 |
|------|------|------|
| `click` | 버튼 클릭 | 0.2초 |
| `hover` | 버튼 호버 | 0.1초 |
| `correct` | 정답 | 0.5초 |
| `wrong` | 오답 | 0.5초 |
| `levelup` | 레벨업 | 2초 |
| `coin` | 코인 획득 | 0.3초 |
| `door` | 건물 진입/퇴출 | 0.5초 |
| `metro` | 지하철 이동 | 1초 |
| `flight` | 비행 이동 | 1.5초 |
| `typewriter` | 대화 타자기 | 0.05초 |
| `page` | 단어장 넘기기 | 0.3초 |
| `achievement` | 업적 달성 | 1.5초 |

### 1-4. 무료 오디오 리소스 (CC0/CC-BY)

#### BGM 추천 소스

| 소스 | 라이선스 | 특징 |
|------|---------|------|
| **OpenGameArt.org** CC0 Music | CC0 (저작자표시 불필요) | RPG/앰비언트 루프 다수 |
| **itch.io** CC0 Music | CC0 | "16-Bit RPG Music" 37트랙 팩 등 |
| **Alkakrab** RPG Ambient Pack | Free/No Copyright | RPG 전용 25트랙 (라이트/다크/액션) |
| **Soundimage.org** Fantasy | Free + Attribution | 광범위한 판타지/RPG 라이브러리 |

#### SFX 추천 소스

| 소스 | 라이선스 | 특징 |
|------|---------|------|
| **OpenGameArt.org** 51 UI SFX | CC0 | 버튼, 스위치, 클릭 — 교육용 게임 UI에 적합 |
| **Kenney.nl** Game Assets | CC0 | 종합 게임 에셋 (오디오 팩 포함) |
| **Freesound.org** GameAudio Pack | CC (개별 확인) | 협업 데이터베이스, CC0 필터링 |

**라이선스 권장**: **CC0 우선 사용**. CC-BY 사용 시 `credits.json` 파일로 관리.

### 1-5. 파일 포맷 전략

```
assets/audio/
├── bgm/
│   ├── title.ogg + title.mp3        # OGG 우선 (Chrome/Firefox), MP3 폴백 (Safari)
│   ├── fukuoka.ogg + fukuoka.mp3
│   ├── seoul.ogg + seoul.mp3
│   └── ...
├── sfx/
│   ├── ui-sfx.json                   # 오디오 스프라이트 설정
│   ├── ui-sfx.ogg + ui-sfx.mp3      # 단일 파일에 모든 SFX 합침
│   └── (HTTP 요청 최소화)
└── tts/
    ├── ch00/ (단어별 파일)
    ├── ch01/
    └── ch02/
```

| 포맷 | 인코딩 | 브라우저 | 용도 |
|------|--------|---------|------|
| **OGG Vorbis** | q5 (~128kbps) | Chrome, Firefox, Edge | 1순위 |
| **MP3** | 128kbps | Safari, iOS | 폴백 |

**예상 총 용량**: BGM 7트랙 (~7MB) + SFX 스프라이트 (~500KB) + TTS 200단어 (~3MB) = **약 10~12MB**

### 1-6. AudioManager 구현 설계

```javascript
// src/managers/AudioManager.js — 핵심 구조

export default class AudioManager {
    constructor(game) {
        this.game = game;
        this.sound = game.sound;
        this.currentBGM = null;
        this.currentBGMKey = null;
        this.settings = this._loadFromLocalStorage();
        this._initTTS();  // Web Speech API 한국어 음성 탐색
    }

    // BGM 크로스페이드
    playBGM(key, fadeMs = 1000) { /* 현재 BGM fadeOut → 새 BGM fadeIn */ }
    stopBGM(fadeMs = 500) { /* fadeOut 후 destroy */ }

    // SFX (fire-and-forget)
    playSFX(key, config) { /* volume × sfxVolume로 재생 */ }

    // 볼륨 설정 (localStorage 영속)
    setMasterVolume(v) { }
    setBGMVolume(v) { }
    setSFXVolume(v) { }
    toggleMute() { }

    // TTS — 프리제너레이트 오디오 → Web Speech API 폴백
    speakKorean(text, rate = 0.9) {
        // 1. 캐시된 오디오 파일 확인 → 있으면 Phaser로 재생
        // 2. 없으면 Web Speech API로 재생
        // 3. BGM 볼륨 자동 덕킹 (30%로 감소)
    }
}
```

**등록 위치**: `BootScene.create()`에서 `this.game.audioManager = new AudioManager(this.game);`

### 1-7. 모바일 오디오 잠금 해제

iOS/Safari는 사용자 인터랙션 없이 오디오를 재생할 수 없습니다.

**해결책**: TitleScene의 "시작" 버튼 터치가 자동으로 오디오를 해제합니다.

```javascript
// 안전한 재생 패턴
if (!this.sound.locked) {
    this.bgm.play();
} else {
    this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
        this.bgm.play();
    });
}
```

Phaser 3.60+는 iOS에서 AudioContext가 "suspended" 상태가 될 때 자동으로 resume을 시도합니다 (이어폰 분리, 전화 수신 등).

---

## 2. 한국어 TTS(발음 재생) 상세 설계

### 2-1. 3가지 구현 옵션 비교

| | 옵션 A: Web Speech API | 옵션 B: 사전 녹음 파일 | 옵션 C: Cloud TTS |
|---|---|---|---|
| **비용** | 무료 | 무료 (도구) ~ 유료 (성우) | 무료 티어 후 유료 |
| **음질** | 기기 의존 (보통~양호) | 최상 (일관성) | 양호~최상 |
| **구현 난이도** | 낮음 | 중간 (파일 관리) | 중간 (API + 빌드) |
| **오프라인** | 일부 기기만 | 완전 지원 | 미지원 |
| **용량** | 0 | 10~20MB | 10~20MB |
| **일관성** | 기기마다 다름 | 완벽 | 거의 완벽 |

### 2-2. 권장 전략: 하이브리드 (B + A)

```
1순위: 사전 생성 오디오 (핵심 단어/문장)
  ↓ 파일 없으면
2순위: Web Speech API 실시간 TTS
  ↓ 음성 없으면
3순위: 텍스트만 표시 (조용한 폴백)
```

### 2-3. Web Speech API 한국어 지원 현황

| 플랫폼 | 한국어 음성 | 음질 | 비고 |
|--------|-----------|------|------|
| **Chrome (데스크톱)** | "Google Korean" (원격) | 양호 | 인터넷 필요, 비동기 로딩 |
| **Chrome (Android)** | 시스템 TTS | 가변 | Android TTS 설정 의존 |
| **Safari (macOS)** | "Yuna" (ko-KR) | 양호 | 로컬 음성, 사전 설치 |
| **Safari (iOS)** | "Yuna" (ko-KR) | 양호 | 사용자 인터랙션 필요 |
| **Edge (데스크톱)** | "Heami" 등 | 매우 양호 | 뉴럴 네트워크 기반 |
| **Firefox** | OS 음성만 | 가변 | 로컬 설치 음성만 사용 |

**주의사항**:
- Chrome은 15초 이상 긴 발화가 중단될 수 있음 → 짧은 단위로 분할
- Android는 언어 태그가 `ko_KR` (밑줄) 일 수 있음 → `/ko[-_]KR/` 정규식 사용
- iOS는 첫 발화 전 사용자 인터랙션 필수

### 2-4. 사전 생성 도구 (무료)

| 도구 | 한국어 지원 | 출력 포맷 | 특징 |
|------|-----------|----------|------|
| **ttsMP3.com** | ✅ 다수 음성 | MP3 | 무료, 웹 기반, 즉시 다운로드 |
| **TTSForge** | ✅ | MP3/WAV/OGG | 무료, 배치 처리 가능 |
| **FreeTTS** | ✅ | MP3 | 무료, 대량 변환 |
| **Google Cloud TTS** | ✅ 11개 음성 | MP3/WAV/OGG | 무료 티어: Standard 4M자/월, WaveNet 1M자/월 |

**Google Cloud TTS 한국어 음성**:

| 음성 | 유형 | 성별 | 음질 |
|------|------|------|------|
| ko-KR-Standard-A/B | Standard | 여성 | 보통 |
| ko-KR-Standard-C/D | Standard | 남성 | 보통 |
| ko-KR-Wavenet-A/B | WaveNet | 여성 | 양호 |
| ko-KR-Wavenet-C/D | WaveNet | 남성 | 양호 |
| ko-KR-Neural2-A/B/C | Neural2 | 여/남 | 최상 |

**용량 예상**: 단어 1개 (1~2초) ≈ 15~30KB (MP3), 문장 1개 (3~5초) ≈ 40~80KB
→ 단어 200개 + 문장 100개 ≈ **약 7~12MB** (OGG 압축 시 5~8MB)

### 2-5. TTS 파일 구조

```
public/assets/audio/tts/
├── ch00/
│   ├── ch00_w001.ogg  # 안녕하세요
│   ├── ch00_w001.mp3
│   ├── ch00_w002.ogg  # 감사합니다
│   └── ...
├── ch01/
│   ├── ch01_w001.ogg
│   └── ...
└── manifest.json      # 단어 → 파일 매핑
```

**manifest.json 구조**:
```json
{
  "안녕하세요": "ch00/ch00_w001",
  "감사합니다": "ch00/ch00_w002",
  "공항": "ch01/ch01_w001"
}
```

### 2-6. 게임 내 TTS 사용 위치

| 씬 | 사용 방식 |
|----|----------|
| **VocabularyScene** | 단어 카드에 스피커 아이콘 → 터치 시 발음 재생 |
| **DialogueScene** | 한국어 대사 옆 스피커 아이콘 → 터치 시 문장 읽기 |
| **MissionScene** | 발음 문제에서 정답 확인 시 자동 재생 |
| **WorldScene** | NPC 대화 시 한국어 부분 자동 재생 (옵션) |

---

## 3. 설정 메뉴 구현 설계 (Phase 2-B)

### 3-1. 설정 항목

```
[설정 / 設定]
├── 마스터 볼륨: ──●────── 80%
├── 배경음악:    ────●──── 50%
├── 효과음:      ──────●── 70%
├── 발음 재생:   ────────● 100%
├── 텍스트 속도: [느림] [보통●] [빠름] [즉시]
├── 발음 표시:   [항상●] [첫 등장만] [숨김]
├── 자동 발음:   [ON●] [OFF]
└── 세이브 초기화: [초기화] (확인 팝업)
```

### 3-2. 구현 파일

- `src/scenes/SettingsScene.js` — 새 씬 추가
- `src/main.js` — SettingsScene import/등록
- 각 씬의 메뉴 버튼에서 SettingsScene 호출

---

## 4. NPC 대화 트리거 연동 (Phase 2-C)

### 4-1. 현재 상태
- NPC가 맵에 배치되어 있음 (BaseWorldScene의 `createNPC()`)
- 플레이어 접근 시 말풍선 아이콘 표시
- **스페이스바/터치로 대화 시작** — 이 부분이 DialogueScene과 연동 필요

### 4-2. 구현 방향
```
NPC 접근 → 말풍선 아이콘 → 상호작용 키 →
  → DataLoader로 해당 NPC의 대화 데이터 로드
  → DialogueScene 오버레이 시작
  → 대화 완료 시 미션 자동 시작 (선택)
  → XP/코인 보상
```

### 4-3. NPC-레슨 매핑 (제안)

| NPC | 위치 | 연결 레슨 |
|-----|------|----------|
| 공항 안내원 | IncheonAirportScene | ch01_l01 |
| 올리브숲 직원 | OliveYoungScene | ch01_l04 |
| 유전식당 주인 | RestaurantScene | ch01_l06 |
| 하이코 직원 | HiKRGroundScene | ch01_l03 |
| K Campus 선생님 | KoreanAcademyScene | ch02 레슨들 |

---

## 5. Phase 3 상세 설계

### 5-1. 단어 숙련도 시스템 (SRS)

**간격반복(Spaced Repetition) 알고리즘**:

```javascript
// 숙련도 레벨별 복습 간격
const REVIEW_INTERVALS = {
    1: 0,        // 처음 → 즉시
    2: 1 * DAY,  // 1회 정답 → 1일 후
    3: 3 * DAY,  // 3회 정답 → 3일 후
    4: 7 * DAY,  // 5회 정답 → 7일 후
    5: 30 * DAY  // 연속 5회 → 30일 후
};
```

**저장 구조** (localStorage):
```json
{
  "wordMastery": {
    "ch01_w001": { "level": 3, "correctCount": 4, "lastReview": "2026-02-28", "nextReview": "2026-03-03" },
    "ch01_w002": { "level": 1, "correctCount": 0, "lastReview": null, "nextReview": null }
  }
}
```

**"오늘의 복습" 기능**:
- 게임 시작 시 `nextReview ≤ today`인 단어 자동 수집
- 복습 필요 단어가 있으면 알림 배지 표시
- 복습 퀴즈는 MissionScene 재활용 (word_match, fill_blank 유형)

### 5-2. 레슨 일시정지/재개

**저장 데이터**:
```json
{
  "pausedLesson": {
    "chapter": "ch01",
    "lesson": 5,
    "type": "dialogue",        // dialogue | mission
    "dialogueLine": 7,         // 대화 진행 위치
    "missionIndex": 3,         // 미션 진행 위치
    "missionScore": { "correct": 2, "total": 3 }
  }
}
```

**복귀 흐름**:
```
게임 시작 → pausedLesson 확인 →
  → "이어서 하시겠습니까? / 続きをしますか？" 팝업
  → [이어서] → 해당 위치부터 재개
  → [처음부터] → pausedLesson 삭제, 레슨 처음부터
```

---

## 6. Phase 4 상세 설계

### 6-1. 업적/배지 시스템

**구현 파일**: `src/systems/AchievementManager.js`

**업적 체크 시점**:
| 이벤트 | 체크 항목 |
|--------|----------|
| 레슨 완료 | 첫 레슨, 챕터 완료, 전체 완료 |
| 미션 완료 | 연속 정답, 만점, 총 정답 수 |
| 맵 방문 | 첫 방문, 모든 지구 방문, 모든 장소 방문 |
| 단어 숙련 | 마스터 단어 수 (10, 50, 100, 200) |
| 레벨업 | 특정 레벨 도달 |

**UI**: 업적 달성 시 화면 상단에 토스트 알림 + `sfx-achievement` 재생

### 6-2. 대화 분기 시스템

**데이터 구조 확장**:
```json
{
  "lines": [
    { "speaker": "yuko", "text_ko": "뭐 먹을까?", "text_ja": "何食べる？",
      "choices": [
        { "text_ko": "삼겹살 먹자!", "text_ja": "サムギョプサル食べよう！", "next": 5 },
        { "text_ko": "비빔밥 어때?", "text_ja": "ビビンバはどう？", "next": 8 }
      ]
    }
  ]
}
```

**DialogueScene 수정**: `choices` 필드 감지 시 선택지 버튼 2~3개 표시 → 선택에 따라 `next` 라인으로 점프

### 6-3. 빌드 최적화

```javascript
// vite.config.js 수정
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']  // Phaser를 별도 청크로 분리
        }
      }
    }
  }
});
```

**효과**: Phaser (~370KB gzip)가 별도 캐시 → 게임 로직 변경 시 Phaser 재다운로드 불필요

---

## 7. 전체 구현 타임라인

```
Phase 1 (현재 진행 중) ─────────────────────
│ ✅ 레거시 씬 삭제 완료
│ ⬜ ch02 콘텐츠 제작 (대화 11 + 미션 77 + 단어장)
│
Phase 2 ────────────────────────────────────
│ [2-A] AudioManager 싱글턴 구현
│       ├─ BootScene에서 오디오 에셋 프리로드
│       ├─ BGM 크로스페이드 (씬 전환 시)
│       ├─ SFX 오디오 스프라이트 (UI 효과음)
│       └─ TTS 하이브리드 (사전생성 + Web Speech API)
│ [2-B] SettingsScene 구현 (볼륨 슬라이더, 설정 영속)
│ [2-C] NPC → DialogueScene 트리거 연동
│
Phase 3 ────────────────────────────────────
│ [3-A] ch03 콘텐츠 제작
│ [3-B] 단어 숙련도 시스템 (SRS 알고리즘)
│ [3-C] 레슨 일시정지/재개
│
Phase 4 ────────────────────────────────────
│ [4-A] 업적/배지 시스템
│ [4-B] 대화 분기 (선택지)
│ [4-C] TTS 사전생성 오디오 대량 제작
│ [4-D] Vite manualChunks 빌드 최적화
│ [4-E] README.md + 기본 테스트
```

---

## 8. 오디오 구현 체크리스트 (Phase 2-A 실행용)

### Step 1: 에셋 준비
- [ ] CC0 BGM 5~7트랙 다운로드 (OpenGameArt / itch.io)
- [ ] CC0 SFX 10~15개 다운로드
- [ ] `audiosprite` 도구로 SFX 오디오 스프라이트 생성
- [ ] OGG + MP3 듀얼 포맷 변환 (ffmpeg)
- [ ] `public/assets/audio/` 디렉토리 구조 생성

### Step 2: AudioManager 코드
- [ ] `src/managers/AudioManager.js` 작성
- [ ] BootScene에서 오디오 프리로드 추가
- [ ] BootScene.create()에서 AudioManager 초기화
- [ ] TitleScene에서 모바일 오디오 잠금 해제 처리

### Step 3: 씬별 BGM 연동
- [ ] TitleScene → `bgm-title`
- [ ] 후쿠오카 맵들 → `bgm-fukuoka`
- [ ] 서울 맵들 → `bgm-seoul`
- [ ] 공항 씬들 → `bgm-airport`
- [ ] DialogueScene → `bgm-dialogue`
- [ ] MissionScene → `bgm-quiz`
- [ ] ShopScene → `bgm-shop`

### Step 4: SFX 연동
- [ ] 모든 버튼 클릭 → `sfx-click`
- [ ] 정답/오답 → `sfx-correct` / `sfx-wrong`
- [ ] 레벨업 → `sfx-levelup`
- [ ] 코인 획득 → `sfx-coin`
- [ ] 대화 타자기 → `sfx-typewriter`
- [ ] 건물 진입/퇴출 → `sfx-door`

### Step 5: TTS 연동
- [ ] ttsMP3.com으로 ch00/ch01 핵심 단어 50개 사전 생성
- [ ] VocabularyScene에 스피커 아이콘 + TTS 연동
- [ ] Web Speech API 폴백 구현
- [ ] BGM 덕킹 (TTS 재생 시 볼륨 30%로)

### Step 6: 설정 메뉴
- [ ] SettingsScene 구현
- [ ] 볼륨 슬라이더 UI
- [ ] localStorage 영속 저장
- [ ] TitleScene/HUD에 설정 버튼 추가

---

*이 보고서는 Phaser 3.60+ 공식 문서, Web Speech API MDN 문서, Google Cloud TTS 문서, 무료 오디오 리소스 사이트를 기반으로 작성되었습니다.*
