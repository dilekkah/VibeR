import { RECOMMENDATIONS_DATABASE } from '../utils/recommendations';

class LocalRecommendationService {
  /**
   * Tüm önerileri getir
   */
  getAll() {
    return RECOMMENDATIONS_DATABASE;
  }

  /**
   * Mood'a göre öneri getir
   */
  getByMood(mood) {
    return RECOMMENDATIONS_DATABASE.filter(item =>
      item.moods?.includes(mood)
    );
  }

  /**
   * Birden fazla mood'a göre filtrele
   */
  getByMoods(moods) {
    if (!moods || moods.length === 0) {
      return RECOMMENDATIONS_DATABASE;
    }
    return RECOMMENDATIONS_DATABASE.filter(item =>
      moods.some(m => item.moods?.includes(m))
    );
  }

  /**
   * Arkadaş/eşlik durumuna göre filtrele
   */
  getByCompanion(companion) {
    return RECOMMENDATIONS_DATABASE.filter(item =>
      item.companions?.includes(companion)
    );
  }

  /**
   * Birden fazla companion'a göre filtrele
   */
  getByCompanions(companions) {
    if (!companions || companions.length === 0) {
      return RECOMMENDATIONS_DATABASE;
    }
    return RECOMMENDATIONS_DATABASE.filter(item =>
      companions.some(c => item.companions?.includes(c))
    );
  }

  /**
   * İhtiyaca göre filtrele
   */
  getByNeed(need) {
    return RECOMMENDATIONS_DATABASE.filter(item =>
      item.needs?.includes(need)
    );
  }

  /**
   * Birden fazla ihtiyaca göre filtrele
   */
  getByNeeds(needs) {
    if (!needs || needs.length === 0) {
      return RECOMMENDATIONS_DATABASE;
    }
    return RECOMMENDATIONS_DATABASE.filter(item =>
      needs.some(n => item.needs?.includes(n))
    );
  }

  /**
   * Kombine filtre (mood + companion + need)
   * En güçlü filtreleme metodu
   */
  getRecommendations({ moods = [], companions = [], needs = [], category = null }) {
    let results = RECOMMENDATIONS_DATABASE;

    // Mood filtresi
    if (moods.length > 0) {
      results = results.filter(item =>
        moods.some(m => item.moods?.includes(m))
      );
    }

    // Companion filtresi
    if (companions.length > 0) {
      results = results.filter(item =>
        companions.some(c => item.companions?.includes(c))
      );
    }

    // Need filtresi
    if (needs.length > 0) {
      results = results.filter(item =>
        needs.some(n => item.needs?.includes(n))
      );
    }

    // Kategori filtresi
    if (category) {
      results = results.filter(item => item.category === category);
    }

    return results;
  }

  /**
   * Kategoriye göre getir
   */
  getByCategory(category) {
    return RECOMMENDATIONS_DATABASE.filter(item =>
      item.category === category
    );
  }

  /**
   * Tüm kategorileri getir
   */
  getCategories() {
    const categories = [...new Set(RECOMMENDATIONS_DATABASE.map(item => item.category))];
    return categories.filter(Boolean);
  }

  /**
   * Kategori etiketlerini getir
   */
  getCategoryLabels() {
    const labels = {};
    RECOMMENDATIONS_DATABASE.forEach(item => {
      if (item.category && item.categoryLabel) {
        labels[item.category] = item.categoryLabel;
      }
    });
    return labels;
  }

  /**
   * Rastgele öneri getir
   */
  getRandomRecommendations(count = 5) {
    const shuffled = [...RECOMMENDATIONS_DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Mood'a göre rastgele öneri getir
   */
  getRandomByMood(mood, count = 5) {
    const filtered = this.getByMood(mood);
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Arama yap (title ve description içinde)
   */
  search(query) {
    if (!query || query.trim() === '') {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();

    return RECOMMENDATIONS_DATABASE.filter(item => {
      const titleMatch = item.title?.toLowerCase().includes(lowerQuery);
      const descMatch = item.description?.toLowerCase().includes(lowerQuery);
      const categoryMatch = item.categoryLabel?.toLowerCase().includes(lowerQuery);

      return titleMatch || descMatch || categoryMatch;
    });
  }

  /**
   * ID'ye göre tek öneri getir
   */
  getById(id) {
    return RECOMMENDATIONS_DATABASE.find(item => item.id === id);
  }

  /**
   * Index'e göre tek öneri getir
   */
  getByIndex(index) {
    return RECOMMENDATIONS_DATABASE[index];
  }

  /**
   * Toplam öneri sayısı
   */
  getCount() {
    return RECOMMENDATIONS_DATABASE.length;
  }

  /**
   * Mood istatistikleri
   */
  getMoodStats() {
    const stats = {};
    RECOMMENDATIONS_DATABASE.forEach(item => {
      item.moods?.forEach(mood => {
        stats[mood] = (stats[mood] || 0) + 1;
      });
    });
    return stats;
  }

  /**
   * Kategori istatistikleri
   */
  getCategoryStats() {
    const stats = {};
    RECOMMENDATIONS_DATABASE.forEach(item => {
      if (item.category) {
        stats[item.category] = (stats[item.category] || 0) + 1;
      }
    });
    return stats;
  }

  /**
   * Skor hesaplayarak en uygun önerileri getir
   * (mood, companion ve need eşleşme sayısına göre sıralar)
   */
  getSmartRecommendations({ moods = [], companions = [], needs = [] }, limit = 10) {
    const scored = RECOMMENDATIONS_DATABASE.map(item => {
      let score = 0;

      // Mood eşleşmeleri (+3 puan her eşleşme için)
      moods.forEach(m => {
        if (item.moods?.includes(m)) score += 3;
      });

      // Companion eşleşmeleri (+2 puan)
      companions.forEach(c => {
        if (item.companions?.includes(c)) score += 2;
      });

      // Need eşleşmeleri (+2 puan)
      needs.forEach(n => {
        if (item.needs?.includes(n)) score += 2;
      });

      return { ...item, score };
    });

    // Skora göre sırala ve limit kadar döndür
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Bugünün önerisi (günlük değişen)
   */
  getTodaysRecommendation() {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    const index = dayOfYear % RECOMMENDATIONS_DATABASE.length;
    return RECOMMENDATIONS_DATABASE[index];
  }

  /**
   * Popüler kategorilerdeki öneriler
   */
  getPopularByCategories(countPerCategory = 3) {
    const categories = this.getCategories();
    const result = {};

    categories.forEach(category => {
      const items = this.getByCategory(category);
      const shuffled = items.sort(() => 0.5 - Math.random());
      result[category] = shuffled.slice(0, countPerCategory);
    });

    return result;
  }
}

export default new LocalRecommendationService();