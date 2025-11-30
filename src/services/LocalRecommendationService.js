// recommendations.js'den hem veritabanını hem de fonksiyonları import et
import { RECOMMENDATIONS_DATABASE, getRecommendations, filterByCategory } from '../utils/recommendations';

// Güvenlik kontrolü - eğer undefined gelirse boş dizi kullan
const DATABASE = RECOMMENDATIONS_DATABASE || [];

class LocalRecommendationService {
  /**
   * Tüm önerileri getir
   */
  getAll() {
    return DATABASE;
  }

  /**
   * Mood'a göre öneri getir
   */
  getByMood(mood) {
    if (!mood || DATABASE.length === 0) return [];
    return DATABASE.filter(item =>
      item.moods?.includes(mood)
    );
  }

  /**
   * Birden fazla mood'a göre filtrele
   */
  getByMoods(moods) {
    if (!moods || moods.length === 0 || DATABASE.length === 0) {
      return DATABASE;
    }
    return DATABASE.filter(item =>
      moods.some(m => item.moods?.includes(m))
    );
  }

  /**
   * Arkadaş/eşlik durumuna göre filtrele
   */
  getByCompanion(companion) {
    if (!companion || DATABASE.length === 0) return [];
    return DATABASE.filter(item =>
      item.companions?.includes(companion)
    );
  }

  /**
   * Birden fazla companion'a göre filtrele
   */
  getByCompanions(companions) {
    if (!companions || companions.length === 0 || DATABASE.length === 0) {
      return DATABASE;
    }
    return DATABASE.filter(item =>
      companions.some(c => item.companions?.includes(c))
    );
  }

  /**
   * İhtiyaca göre filtrele
   */
  getByNeed(need) {
    if (!need || DATABASE.length === 0) return [];
    return DATABASE.filter(item =>
      item.needs?.includes(need)
    );
  }

  /**
   * Birden fazla ihtiyaca göre filtrele
   */
  getByNeeds(needs) {
    if (!needs || needs.length === 0 || DATABASE.length === 0) {
      return DATABASE;
    }
    return DATABASE.filter(item =>
      needs.some(n => item.needs?.includes(n))
    );
  }

  /**
   * Kombine filtre (mood + companion + need)
   * recommendations.js'deki fonksiyonu kullan
   */
  getRecommendations({ moods = [], companions = [], needs = [], category = null }) {
    // recommendations.js'deki getRecommendations fonksiyonunu kullan
    let results = getRecommendations(moods, companions, needs);

    // Kategori filtresi
    if (category) {
      results = filterByCategory(results, category);
    }

    return results;
  }

  /**
   * Kategoriye göre getir
   */
  getByCategory(category) {
    if (!category || DATABASE.length === 0) return [];
    return DATABASE.filter(item =>
      item.category === category
    );
  }

  /**
   * Tüm kategorileri getir
   */
  getCategories() {
    if (DATABASE.length === 0) return [];
    const categories = [...new Set(DATABASE.map(item => item.category))];
    return categories.filter(Boolean);
  }

  /**
   * Kategori etiketlerini getir
   */
  getCategoryLabels() {
    const labels = {};
    DATABASE.forEach(item => {
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
    if (DATABASE.length === 0) return [];
    const shuffled = [...DATABASE].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Mood'a göre rastgele öneri getir
   */
  getRandomByMood(mood, count = 5) {
    const filtered = this.getByMood(mood);
    if (filtered.length === 0) return [];
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Arama yap (title ve description içinde)
   */
  search(query) {
    if (!query || query.trim() === '' || DATABASE.length === 0) {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();

    return DATABASE.filter(item => {
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
    if (DATABASE.length === 0) return null;
    return DATABASE.find(item => item.id === id);
  }

  /**
   * Index'e göre tek öneri getir
   */
  getByIndex(index) {
    if (DATABASE.length === 0) return null;
    return DATABASE[index];
  }

  /**
   * Toplam öneri sayısı
   */
  getCount() {
    return DATABASE.length;
  }

  /**
   * Mood istatistikleri
   */
  getMoodStats() {
    const stats = {};
    DATABASE.forEach(item => {
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
    DATABASE.forEach(item => {
      if (item.category) {
        stats[item.category] = (stats[item.category] || 0) + 1;
      }
    });
    return stats;
  }

  /**
   * Skor hesaplayarak en uygun önerileri getir
   */
  getSmartRecommendations({ moods = [], companions = [], needs = [] }, limit = 10) {
    if (DATABASE.length === 0) return [];

    // recommendations.js'deki getRecommendations fonksiyonunu kullan
    // Bu fonksiyon zaten skorlama yapıyor
    const results = getRecommendations(moods, companions, needs);

    // Limit uygula
    return results.slice(0, limit);
  }

  /**
   * Bugünün önerisi (günlük değişen)
   */
  getTodaysRecommendation() {
    if (DATABASE.length === 0) return null;

    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    const index = dayOfYear % DATABASE.length;
    return DATABASE[index];
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