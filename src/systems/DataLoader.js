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
      shopProducts: null
    };
  }

  async loadChapters() {
    if (this.cache.chapters) return this.cache.chapters;
    const resp = await fetch('./data/chapters/chapter_list.json');
    this.cache.chapters = await resp.json();
    return this.cache.chapters;
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

  // 부팅 시 필수 데이터 프리로드
  async preloadEssentials() {
    const chapters = await this.loadChapters();
    await Promise.all([
      this.loadVocabulary('ch00'),
      this.loadMissions('ch00', 'l01'),
      this.loadDialogue('ch00', 'l01'),
      this.loadVocabulary('ch01'),
      this.loadMissions('ch01', 'l01'),
      this.loadDialogue('ch01', 'l01'),
      this.loadShopProducts()
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
