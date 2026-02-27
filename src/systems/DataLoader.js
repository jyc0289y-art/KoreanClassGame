// ============================================================
// DataLoader — fetch() 기반 JSON 데이터 로더
// ============================================================

class DataLoaderClass {
  constructor() {
    this.cache = {
      chapters: null,
      vocabulary: {},
      missions: {},
      dialogues: {},
      shopProducts: null,
      maps: {},     // 맵 설정 데이터 캐시
      places: {}    // 장소 설정 데이터 캐시
    };
  }

  async loadChapters() {
    if (this.cache.chapters) return this.cache.chapters;
    try {
      const resp = await fetch('./data/chapters/chapter_list.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      this.cache.chapters = await resp.json();
      return this.cache.chapters;
    } catch (e) {
      console.warn('Chapter list not found, using defaults:', e.message);
      this.cache.chapters = [];
      return this.cache.chapters;
    }
  }

  async loadVocabulary(chapterId) {
    if (this.cache.vocabulary[chapterId]) return this.cache.vocabulary[chapterId];
    try {
      const resp = await fetch(`./data/vocabulary/${chapterId}_vocabulary.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      this.cache.vocabulary[chapterId] = data;
      return data;
    } catch (e) {
      console.warn(`Vocabulary not found for ${chapterId}, falling back to ch00`);
      if (chapterId !== 'ch00') return this.loadVocabulary('ch00');
      return { chapter: chapterId, words: [] };
    }
  }

  async loadMissions(chapterId, lessonId) {
    const key = `${chapterId}_${lessonId}`;
    if (this.cache.missions[key]) return this.cache.missions[key];
    try {
      const resp = await fetch(`./data/missions/${key}_missions.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      this.cache.missions[key] = data;
      return data;
    } catch (e) {
      console.warn(`Missions not found for ${key}, falling back to ch00_l01`);
      if (key !== 'ch00_l01') return this.loadMissions('ch00', 'l01');
      return [];
    }
  }

  async loadDialogue(chapterId, lessonId) {
    const key = `${chapterId}_${lessonId}`;
    if (this.cache.dialogues[key]) return this.cache.dialogues[key];
    try {
      const resp = await fetch(`./data/dialogues/${key}_dialogue.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      this.cache.dialogues[key] = data;
      return data;
    } catch (e) {
      console.warn(`Dialogue not found for ${key}, falling back to ch00_l01`);
      if (key !== 'ch00_l01') return this.loadDialogue('ch00', 'l01');
      return { scene_title_ko: '', scene_title_ja: '', lines: [] };
    }
  }

  async loadShopProducts() {
    if (this.cache.shopProducts) return this.cache.shopProducts;
    try {
      const resp = await fetch('./data/shop/products.json');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      this.cache.shopProducts = await resp.json();
      return this.cache.shopProducts;
    } catch (e) {
      console.warn('Shop products not found');
      return { categories: [], items: {} };
    }
  }

  // ── 맵 설정 데이터 로드 (광역맵/지역맵) ──
  async loadMapConfig(mapId) {
    if (this.cache.maps[mapId]) return this.cache.maps[mapId];
    try {
      const resp = await fetch(`./data/maps/${mapId}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      this.cache.maps[mapId] = data;
      return data;
    } catch (e) {
      console.warn(`Map config not found: ${mapId}`);
      return null;
    }
  }

  // ── 장소 설정 데이터 로드 (장소맵) ──
  async loadPlaceConfig(placeId) {
    if (this.cache.places[placeId]) return this.cache.places[placeId];
    try {
      const resp = await fetch(`./data/places/${placeId}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      this.cache.places[placeId] = data;
      return data;
    } catch (e) {
      console.warn(`Place config not found: ${placeId}`);
      return null;
    }
  }

  getCachedMapConfig(mapId) {
    return this.cache.maps[mapId] || null;
  }

  getCachedPlaceConfig(placeId) {
    return this.cache.places[placeId] || null;
  }

  // 부팅 시 필수 데이터 프리로드
  async preloadEssentials() {
    const chapters = await this.loadChapters();
    const ch00Lessons = ['l01','l02','l03','l04','l05','l06','l07','l08'];
    const ch01Lessons = ['l01','l02','l03','l04','l05','l06','l07','l08','l09','l10'];
    await Promise.all([
      this.loadVocabulary('ch00'),
      this.loadVocabulary('ch01'),
      this.loadShopProducts(),
      ...ch00Lessons.map(l => this.loadMissions('ch00', l)),
      ...ch00Lessons.map(l => this.loadDialogue('ch00', l)),
      ...ch01Lessons.map(l => this.loadMissions('ch01', l)),
      ...ch01Lessons.map(l => this.loadDialogue('ch01', l))
    ]);
    return chapters;
  }

  // 동기적 캐시 getter (preload 완료 후 안전하게 사용)
  getCachedMissions(chapterId, lessonId) {
    return this.cache.missions[`${chapterId}_${lessonId}`] || this.cache.missions['ch00_l01'] || [];
  }

  getCachedDialogue(chapterId, lessonId) {
    return this.cache.dialogues[`${chapterId}_${lessonId}`] || this.cache.dialogues['ch00_l01'] || { lines: [] };
  }

  getCachedVocabulary(chapterId) {
    return this.cache.vocabulary[chapterId] || this.cache.vocabulary['ch00'] || { words: [] };
  }

  getCachedShopProducts() {
    return this.cache.shopProducts || { categories: [], items: {} };
  }
}

// 싱글턴 인스턴스
export const dataLoader = new DataLoaderClass();
