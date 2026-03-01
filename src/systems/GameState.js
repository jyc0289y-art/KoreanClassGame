// ============================================================
// GameState — 게임 상태 관리 (싱글턴)
// ============================================================

export class GameState {
  constructor() {
    this.currentCharacter = 'yuko';
    this.characters = {
      yuko: { level: 1, exp: 0, coins: 50, x: 400, y: 400, map: 'fukuoka', completedMissions: [], unlockedChapters: ['ch00', 'ch01'] },
      ami: { level: 1, exp: 0, coins: 50, x: 400, y: 400, map: 'fukuoka', completedMissions: [], unlockedChapters: ['ch00', 'ch01'] },
      rui: { level: 1, exp: 0, coins: 50, x: 400, y: 400, map: 'fukuoka', completedMissions: [], unlockedChapters: ['ch00', 'ch01'] },
      tester: { level: 99, exp: 0, coins: 99999, x: 400, y: 400, map: 'fukuoka', completedMissions: [],
        unlockedChapters: ['ch00', 'ch01', 'ch02', 'ch03', 'ch04', 'ch05', 'ch06', 'ch07', 'ch08', 'ch09', 'ch10'] }
    };
    this.currentChapter = 'ch00';
    this.currentLesson = 'l01';
    this.settings = { language: 'dual', sfx: true, music: true };

    // ── 3계층 맵 시스템 상태 ──
    this.currentRegion = 'fukuoka';          // 'fukuoka' | 'seoul'
    this.currentMap = 'FukuokaYakuinScene';  // 현재 위치 씬 키
    this.lastStation = 'yakuin';             // 마지막 이용 역 (광역맵 복귀 시 표시)
    this.lastAirport = 'fukuoka_airport';    // 마지막 이용 공항 (국제맵 복귀 시 표시)
    this.visitedMaps = ['FukuokaYakuinScene']; // 방문한 맵 목록
    this.unlockedStations = ['yakuin', 'fukuoka_airport']; // 해금된 역 목록

    // ── 차량 시스템 상태 ──
    this.vehicleUsed = false;       // 차량 사용 이력
    this.vehicleTripCount = 0;      // 탑승 횟수 (업적용)
  }

  get current() { return this.characters[this.currentCharacter]; }
  get expToNextLevel() { return this.current.level * 100; }
  get expProgress() { return this.current.exp / this.expToNextLevel; }

  addExp(amount) {
    this.current.exp += amount;
    let leveledUp = false;
    while (this.current.exp >= this.expToNextLevel) {
      this.current.exp -= this.expToNextLevel;
      this.current.level++;
      leveledUp = true;
    }
    return leveledUp;
  }

  addCoins(amount) { this.current.coins += amount; }

  completeMission(missionId) {
    if (!this.current.completedMissions.includes(missionId)) {
      this.current.completedMissions.push(missionId);
      return true;
    }
    return false;
  }

  // ── 맵 이동 관련 ──
  visitMap(sceneKey) {
    this.currentMap = sceneKey;
    if (!this.visitedMaps.includes(sceneKey)) {
      this.visitedMaps.push(sceneKey);
    }
  }

  unlockStation(stationId) {
    if (!this.unlockedStations.includes(stationId)) {
      this.unlockedStations.push(stationId);
    }
  }

  setRegion(region) {
    this.currentRegion = region;
  }

  // ── 차량 시스템 ──
  canSelfDrive() {
    return this.current.level >= 6; // VEHICLE.SELF_DRIVE_LEVEL
  }

  canChauffeur() {
    return this.current.level >= 10; // VEHICLE.CHAUFFEUR_LEVEL
  }

  recordVehicleTrip() {
    this.vehicleUsed = true;
    this.vehicleTripCount++;
  }

  save() {
    try { localStorage.setItem('seoulink_save', JSON.stringify(this)); } catch (e) { /* ignore */ }
  }

  load() {
    try {
      const data = JSON.parse(localStorage.getItem('seoulink_save'));
      if (data) {
        // 기존 캐릭터 기본값 보존 (새로 추가된 캐릭터가 세이브에 없을 경우 대비)
        const defaults = { ...this.characters };
        Object.assign(this, data);
        // 세이브에 없는 캐릭터를 기본값으로 복원
        Object.keys(defaults).forEach(key => {
          if (!this.characters[key]) {
            this.characters[key] = defaults[key];
          }
        });
      }
    } catch (e) { /* ignore */ }
  }
}

// 싱글턴 인스턴스 — 모든 씬에서 import하여 사용
export const gameState = new GameState();
