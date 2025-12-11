import GooglePlacesService from './GooglePlacesService';
import LocalRecommendationService from './LocalRecommendationService';

/**
 * Unified Places Service
 * Google Places API + Local Database'i birleştirir
 * API başarısız olursa local data'ya fallback yapar
 */
class UnifiedPlacesService {
  constructor() {
    this.useGooglePlaces = true; // Google Places öncelikli
    this.cacheTimeout = 5 * 60 * 1000; // 5 dakika cache
    this.cache = {};
  }

  /**
   * Mood'a göre mekan öner (Hybrid: Google + Local)
   */
  async getByMood(mood, userLocation = null) {
    try {
      // 1. Önce Google Places'den gerçek mekanları dene
      if (this.useGooglePlaces && GooglePlacesService.isAvailable() && userLocation) {
        console.log('🌍 Google Places\'den gerçek mekanlar aranıyor...');

        // Mood'u aktivite türüne çevir
        const activityType = this.moodToActivityType(mood);

        const googlePlaces = await GooglePlacesService.searchNearbyPlaces(
          userLocation.latitude,
          userLocation.longitude,
          activityType,
          3000 // 3km radius
        );

        if (googlePlaces && googlePlaces.length > 0) {
          console.log(`✅ Google Places'den ${googlePlaces.length} mekan bulundu`);

          // Google Places sonuçlarını formatla
          return this.formatGooglePlaces(googlePlaces, mood);
        } else {
          console.log('⚠️ Google Places\'den sonuç gelmedi, local data kullanılıyor');
        }
      }

      // 2. Google Places başarısız olursa veya kullanılamazsa local data
      console.log('📚 Local database kullanılıyor...');
      return LocalRecommendationService.getByMood(mood);

    } catch (error) {
      console.error('❌ UnifiedPlacesService hatası:', error);
      // Hata durumunda local data'ya düş
      return LocalRecommendationService.getByMood(mood);
    }
  }

  /**
   * Kombine filtreler (Mood + Companion + Need)
   */
  async getRecommendations({ moods = [], companions = [], needs = [], category = null }, userLocation = null) {
    try {
      const allResults = [];

      // 1. Google Places'den gerçek mekanlar
      if (this.useGooglePlaces && GooglePlacesService.isAvailable() && userLocation && moods.length > 0) {
        console.log('🌍 Google Places ile arama yapılıyor...');

        for (const mood of moods) {
          const activityType = this.moodToActivityType(mood);
          const places = await GooglePlacesService.searchNearbyPlaces(
            userLocation.latitude,
            userLocation.longitude,
            activityType,
            2000
          );

          if (places && places.length > 0) {
            const formatted = this.formatGooglePlaces(places, mood);
            allResults.push(...formatted);
          }
        }

        console.log(`✅ Google Places: ${allResults.length} mekan bulundu`);
      }

      // 2. Local recommendations (her zaman ekle)
      const localResults = LocalRecommendationService.getRecommendations({
        moods,
        companions,
        needs,
        category,
      });

      console.log(`📚 Local database: ${localResults.length} öneri bulundu`);

      // 3. Birleştir ve deduplicate
      const combined = [...allResults, ...localResults];

      // Google Places'den gelenler önce
      const sorted = combined.sort((a, b) => {
        if (a.source === 'Google Places' && b.source !== 'Google Places') return -1;
        if (a.source !== 'Google Places' && b.source === 'Google Places') return 1;
        return 0;
      });

      return sorted;

    } catch (error) {
      console.error('❌ Unified Recommendations hatası:', error);
      // Fallback: Sadece local data
      return LocalRecommendationService.getRecommendations({
        moods,
        companions,
        needs,
        category,
      });
    }
  }

  /**
   * Kategori bazlı arama
   */
  async getByCategory(category, userLocation = null) {
    try {
      const results = [];

      // Google Places
      if (this.useGooglePlaces && GooglePlacesService.isAvailable() && userLocation) {
        const activityType = this.categoryToActivityType(category);
        const places = await GooglePlacesService.searchNearbyPlaces(
          userLocation.latitude,
          userLocation.longitude,
          activityType,
          2000
        );

        if (places && places.length > 0) {
          const formatted = this.formatGooglePlaces(places, null);
          results.push(...formatted);
        }
      }

      // Local data
      const localResults = LocalRecommendationService.getByCategory(category);
      results.push(...localResults);

      return results;

    } catch (error) {
      console.error('❌ Category search hatası:', error);
      return LocalRecommendationService.getByCategory(category);
    }
  }

  /**
   * Rastgele öneriler (hybrid)
   */
  async getRandomRecommendations(count = 5, userLocation = null) {
    try {
      const results = [];

      // Google Places'den birkaç random mekan
      if (this.useGooglePlaces && GooglePlacesService.isAvailable() && userLocation) {
        const randomTypes = ['cafe', 'food', 'culture'];
        const randomType = randomTypes[Math.floor(Math.random() * randomTypes.length)];

        const places = await GooglePlacesService.searchNearbyPlaces(
          userLocation.latitude,
          userLocation.longitude,
          randomType,
          3000
        );

        if (places && places.length > 0) {
          const formatted = this.formatGooglePlaces(places.slice(0, 2), null);
          results.push(...formatted);
        }
      }

      // Kalan sayı kadar local'den al
      const remainingCount = count - results.length;
      if (remainingCount > 0) {
        const localResults = LocalRecommendationService.getRandomRecommendations(remainingCount);
        results.push(...localResults);
      }

      return results.slice(0, count);

    } catch (error) {
      console.error('❌ Random recommendations hatası:', error);
      return LocalRecommendationService.getRandomRecommendations(count);
    }
  }

  /**
   * Google Places formatını local format'a çevir
   */
  formatGooglePlaces(places, mood = null) {
    return places.map(place => ({
      id: place.id,
      title: place.name,
      description: place.address || 'Google Places\'den gerçek mekan',
      category: this.inferCategory(place.types),
      categoryLabel: this.inferCategoryLabel(place.types),
      icon: this.getIconForTypes(place.types),
      moods: mood ? [mood] : this.inferMoods(place.types),
      companions: ['alone', 'partner', 'friends', 'family'],
      needs: this.inferNeeds(place.types),
      link: `https://www.google.com/maps/place/?q=place_id:${place.placeId}`,
      details: [
        `📍 ${place.address}`,
        place.rating ? `⭐ ${place.rating}/5` : '',
        place.priceLevel ? `💰 ${this.getPriceLevelText(place.priceLevel)}` : '',
      ].filter(Boolean),
      rating: place.rating,
      photos: place.photos,
      source: 'Google Places',
      placeId: place.placeId,
      location: place.location,
    }));
  }

  /**
   * Mood'u Google Places activity type'a çevir
   */
  moodToActivityType(mood) {
    const moodMap = {
      happy: 'entertainment',
      relaxed: 'cafe',
      energetic: 'shopping',
      romantic: 'food',
      peaceful: 'nature',
      social: 'cafe',
      inspired: 'culture',
      cozy: 'cafe',
      adventurous: 'entertainment',
      nostalgic: 'culture',
    };

    return moodMap[mood] || 'cafe';
  }

  /**
   * Category'yi activity type'a çevir
   */
  categoryToActivityType(category) {
    const categoryMap = {
      food: 'food',
      cafe: 'coffee',
      place: 'cafe',
      activity: 'entertainment',
      entertainment: 'entertainment',
      culture: 'culture',
      nature: 'nature',
      shopping: 'shopping',
    };

    return categoryMap[category] || 'cafe';
  }

  /**
   * Google Places types'dan kategori tahmin et
   */
  inferCategory(types) {
    if (!types || types.length === 0) return 'place';

    if (types.some(t => ['restaurant', 'food', 'meal_takeaway', 'meal_delivery'].includes(t))) {
      return 'food';
    }
    if (types.some(t => ['cafe', 'coffee_shop'].includes(t))) {
      return 'cafe';
    }
    if (types.some(t => ['museum', 'art_gallery', 'library'].includes(t))) {
      return 'activity';
    }
    if (types.some(t => ['park', 'natural_feature'].includes(t))) {
      return 'activity';
    }
    if (types.some(t => ['shopping_mall', 'store'].includes(t))) {
      return 'activity';
    }
    if (types.some(t => ['movie_theater', 'night_club', 'bar'].includes(t))) {
      return 'entertainment';
    }

    return 'place';
  }

  inferCategoryLabel(types) {
    const category = this.inferCategory(types);
    const labels = {
      food: 'Restoran',
      cafe: 'Kafe',
      place: 'Mekan',
      activity: 'Aktivite',
      entertainment: 'Eğlence',
    };
    return labels[category] || 'Mekan';
  }

  getIconForTypes(types) {
    if (!types || types.length === 0) return '📍';

    if (types.some(t => ['restaurant', 'food'].includes(t))) return '🍽️';
    if (types.some(t => ['cafe', 'coffee_shop'].includes(t))) return '☕';
    if (types.some(t => ['museum', 'art_gallery'].includes(t))) return '🎨';
    if (types.some(t => ['park', 'natural_feature'].includes(t))) return '🌳';
    if (types.some(t => ['shopping_mall', 'store'].includes(t))) return '🛍️';
    if (types.some(t => ['movie_theater', 'night_club'].includes(t))) return '🎉';
    if (types.some(t => ['bar', 'liquor_store'].includes(t))) return '🍷';

    return '📍';
  }

  inferMoods(types) {
    const moods = ['social', 'relaxed'];

    if (types.some(t => ['cafe', 'coffee_shop'].includes(t))) {
      moods.push('cozy', 'peaceful');
    }
    if (types.some(t => ['restaurant', 'food'].includes(t))) {
      moods.push('happy', 'romantic');
    }
    if (types.some(t => ['bar', 'night_club'].includes(t))) {
      moods.push('energetic', 'adventurous');
    }
    if (types.some(t => ['museum', 'art_gallery'].includes(t))) {
      moods.push('inspired', 'contemplative');
    }
    if (types.some(t => ['park', 'natural_feature'].includes(t))) {
      moods.push('peaceful', 'relaxed');
    }

    return [...new Set(moods)];
  }

  inferNeeds(types) {
    const needs = [];

    if (types.some(t => ['restaurant', 'cafe', 'food'].includes(t))) {
      needs.push('eat', 'relax');
    }
    if (types.some(t => ['bar', 'night_club'].includes(t))) {
      needs.push('socialize', 'fun');
    }
    if (types.some(t => ['gym', 'park'].includes(t))) {
      needs.push('exercise', 'relax');
    }
    if (types.some(t => ['museum', 'library'].includes(t))) {
      needs.push('learn', 'relax');
    }
    if (types.some(t => ['shopping_mall', 'store'].includes(t))) {
      needs.push('shop');
    }

    return needs.length > 0 ? needs : ['relax', 'socialize'];
  }

  getPriceLevelText(level) {
    const prices = ['Ekonomik', 'Uygun', 'Orta', 'Yüksek', 'Lüks'];
    return prices[level] || 'Orta';
  }

  /**
   * Google Places kullanımını aç/kapat
   */
  setUseGooglePlaces(use) {
    this.useGooglePlaces = use;
    console.log(`Google Places ${use ? 'aktif' : 'pasif'}`);
  }

  /**
   * Durum kontrolü
   */
  async checkStatus() {
    const status = {
      googlePlacesAvailable: GooglePlacesService.isAvailable(),
      googlePlacesActive: this.useGooglePlaces,
      localDatabaseSize: LocalRecommendationService.getCount(),
    };

    console.log('🔍 Unified Places Service Durumu:', status);
    return status;
  }
}

export default new UnifiedPlacesService();
