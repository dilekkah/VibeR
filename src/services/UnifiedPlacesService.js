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

      // 2. Local recommendations (HER ZAMAN EKLE - Google başarısız olsa bile)
      console.log('📚 Local database araması başlatılıyor...', { moods, companions, needs, category });

      let localResults = LocalRecommendationService.getRecommendations({
        moods,
        companions,
        needs,
        category,
      });

      console.log(`✅ Local database (ilk arama): ${localResults.length} öneri bulundu`);

      if (localResults.length === 0 && moods.length > 0) {
        // Filtreler çok katı ise sadece mood ile dene
        console.log('⚠️ Filtreler gevşetiliyor, sadece mood ile aranıyor...');
        const relaxedResults = LocalRecommendationService.getByMoods(moods);
        console.log(`📚 Gevşetilmiş arama: ${relaxedResults.length} sonuç`);
        localResults = [...localResults, ...relaxedResults];
      }

      console.log(`✅ Local database (toplam): ${localResults.length} öneri`);

      // 3. Birleştir ve deduplicate
      const combined = [...allResults, ...localResults];
      console.log(`🔄 Birleştirme: Google=${allResults.length} + Local=${localResults.length} = Toplam ${combined.length}`);

      // Google Places'den gelenler önce
      const sorted = combined.sort((a, b) => {
        if (a.source === 'Google Places' && b.source !== 'Google Places') return -1;
        if (a.source !== 'Google Places' && b.source === 'Google Places') return 1;
        return 0;
      });

      // 4. Makul bir limite düşür (Google + Local birlikte max 20-25 öneri)
      const MAX_RESULTS = 20;
      const limited = sorted.slice(0, MAX_RESULTS);

      if (sorted.length > MAX_RESULTS) {
        console.log(`✂️ Sonuçlar sınırlandırıldı: ${sorted.length} → ${limited.length} (max ${MAX_RESULTS})`);
      }

      return limited;

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

      // Limit uygula
      const MAX_CATEGORY_RESULTS = 20;
      const limited = results.slice(0, MAX_CATEGORY_RESULTS);

      if (results.length > MAX_CATEGORY_RESULTS) {
        console.log(`✂️ Kategori sonuçları sınırlandırıldı: ${results.length} → ${limited.length}`);
      }

      return limited;

    } catch (error) {
      console.error('❌ Category search hatası:', error);
      const fallback = LocalRecommendationService.getByCategory(category);
      return fallback.slice(0, 20); // Fallback'te de limit
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
   * Yakındaki tüm mekanları mesafeye göre sıralı getir
   */
  async getNearbyVenuesSortedByDistance(userLocation, radius = 5000) {
    try {
      const venues = [];

      // 1. Google Places'den gerçek mekanları al
      if (this.useGooglePlaces && GooglePlacesService.isAvailable() && userLocation) {
        console.log('🌍 Yakındaki mekanlar Google Places\'den aranıyor...');

        // Farklı tip mekanları ara
        const types = ['restaurant', 'cafe', 'park', 'museum', 'shopping_mall', 'bar'];

        for (const type of types) {
          try {
            const places = await GooglePlacesService.searchNearbyPlaces(
              userLocation.latitude,
              userLocation.longitude,
              type,
              radius
            );

            if (places && places.length > 0) {
              const formatted = this.formatGooglePlaces(places, null);
              venues.push(...formatted);
            }
          } catch (error) {
            console.error(`Tip ${type} için arama hatası:`, error);
          }
        }
      }

      // 2. Local database'den mekanları al (koordinatlı olanlar)
      const localVenues = LocalRecommendationService.getAll()
        .filter(venue => venue.latitude && venue.longitude);

      venues.push(...localVenues.map(venue => ({
        ...venue,
        location: {
          lat: venue.latitude,
          lng: venue.longitude
        }
      })));

      // 3. Her mekan için mesafe hesapla
      const venuesWithDistance = venues.map(venue => {
        const venueLat = venue.location?.lat || venue.latitude;
        const venueLng = venue.location?.lng || venue.longitude;

        if (!venueLat || !venueLng) {
          return { ...venue, distance: 999999 }; // Koordinatsız mekanlar en sona
        }

        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          venueLat,
          venueLng
        );

        return {
          ...venue,
          distance,
          latitude: venueLat,
          longitude: venueLng,
          name: venue.title || venue.name,
          address: venue.address || venue.description,
        };
      });

      // 4. Mesafeye göre sırala (yakından uzağa)
      const sorted = venuesWithDistance
        .filter(v => v.distance < 999999) // Koordinatsız mekanları filtrele
        .sort((a, b) => a.distance - b.distance);

      // 5. Tekrarlananları temizle (aynı isimli mekanlar)
      const unique = [];
      const seenNames = new Set();

      for (const venue of sorted) {
        const name = venue.name?.toLowerCase();
        if (name && !seenNames.has(name)) {
          seenNames.add(name);
          unique.push(venue);
        }
      }

      console.log(`✅ Toplam ${unique.length} benzersiz mekan bulundu ve mesafeye göre sıralandı`);
      return unique;

    } catch (error) {
      console.error('❌ Nearby venues hatası:', error);
      // Fallback: Sadece local data
      const localVenues = LocalRecommendationService.getAll()
        .filter(venue => venue.latitude && venue.longitude)
        .map(venue => ({
          ...venue,
          location: {
            lat: venue.latitude,
            lng: venue.longitude
          },
          name: venue.title || venue.name,
          distance: this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            venue.latitude,
            venue.longitude
          )
        }))
        .sort((a, b) => a.distance - b.distance);

      return localVenues;
    }
  }

  /**
   * İki nokta arası mesafe hesaplama (Haversine formülü)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // km cinsinden
  }

  toRad(value) {
    return (value * Math.PI) / 180;
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
