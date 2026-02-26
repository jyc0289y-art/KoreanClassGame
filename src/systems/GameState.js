// ============================================================
// GameState — 게임 상태 관리 (싱글턴)
// ============================================================

export class GameState {
  constructor() {
    this.currentCharacter = 'yuko';
    this.characters = {
      yuko: { level: 1, exp: 0, coins: 50, x: 400, y: 400, map: 'fukuoka', completedMissions: [], unlockedChapters: ['ch00', 'ch01'] },
      ami: { level: 1, exp: 0, coins: 50, x: 400, y: 400, map: 'fukuoka', completedMissions: [], unlockedChapters: ['ch00', 'ch01'] },
      rui: { level: 1, exp: 0, coins: 50, x: 400, y: 400, map: 'fukuoka', completedMissions: [], unlockedChapters: ['ch00', 'ch01'] }
    };
    this.currentChapter = 'ch00';
    this.currentLesson = 'l01';
    this.settings = { language: 'dual', sfx: true, music: true };
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

  save() {
    try { localStorage.setItem('seoulink_save', JSON.stringify(this)); } catch (e) { /* ignore */ }
  }

  load() {
    try {
      const data = JSON.parse(localStorage.getItem('seoulink_save'));
      if (data) Object.assign(this, data);
    } catch (e) { /* ignore */ }
  }
}

// 싱글턴 인스턴스 — 모든 씬에서 import하여 사용
export const gameState = new GameState();
