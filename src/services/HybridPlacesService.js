import OverpassService from './OverpassService';
import FoursquareService from './FoursquareService';

/**
 * Hibrit Sistem: Overpass (ücretsiz) + Foursquare (opsiyonel)
 * .env dosyası olmasa bile çalışır!
 */
class HybridPlacesService {
  constructor() {
    this.useOverpass = true; // Her zaman aktif
    this.useFoursquare = FoursquareService.isAvailable(); // .env varsa aktif

    if (this.useFoursquare) {
      console.log('✅ Foursquare API aktif');
    } else {
      console.log('ℹ️ Sadece OpenStreetMap kullanılıyor (Ücretsiz & Sınırsız)');
    }
  }

  /**
   * Yakındaki mekanları ara - İki kaynaktan da çek
   */
  async searchNearbyPlaces(latitude, longitude, radius, moods) {
    const results = [];

    try {
      // 1. Overpass (OpenStreetMap) - Tamamen ücretsiz
      if (this.useOverpass) {
        console.log('🔍 Overpass API ile aranıyor...');
        const amenities = OverpassService.getMoodBasedAmenities(moods);
        const overpassResults = await OverpassService.searchNearbyPlaces(
          latitude,
          longitude,
          radius,
          amenities
        );
        results.push(...overpassResults);
        console.log(`✅ Overpass: ${overpassResults.length} mekan bulundu`);
      }

      // 2. Foursquare - Sadece .env varsa
      if (this.useFoursquare) {
        console.log('🔍 Foursquare API ile aranıyor...');
        const categories = FoursquareService.getMoodBasedCategories(moods);
        const foursquareResults = await FoursquareService.searchNearbyPlaces(
          latitude,
          longitude,
          radius,
          categories
        );
        results.push(...foursquareResults);
        console.log(`✅ Foursquare: ${foursquareResults.length} mekan bulundu`);
      }

      // 3. Duplikaları temizle
      const uniquePlaces = this.removeDuplicates(results);

      // 4. Mesafeye göre sırala
      return uniquePlaces.sort((a, b) =>
        parseFloat(a.distance) - parseFloat(b.distance)
      );

    } catch (error) {
      console.error('HybridPlacesService error:', error);
      return results;
    }
  }

  /**
   * Mekan detayı
   */
  async getPlaceDetails(placeId, source = 'overpass') {
    try {
      if (source === 'foursquare' && this.useFoursquare) {
        return await FoursquareService.getPlaceDetails(placeId);
      }

      return null;
    } catch (error) {
      console.error('getPlaceDetails error:', error);
      return null;
    }
  }

  /**
   * Duplikaları temizle
   */
  removeDuplicates(places) {
    const uniqueMap = new Map();

    places.forEach(place => {
      const normalizedName = this.normalizeName(place.title);

      if (uniqueMap.has(normalizedName)) {
        const existing = uniqueMap.get(normalizedName);
        if (place.rating > existing.rating) {
          uniqueMap.set(normalizedName, place);
        }
      } else {
        uniqueMap.set(normalizedName, place);
      }
    });

    return Array.from(uniqueMap.values());
  }

  /**
   * İsim normalizasyonu
   */
  normalizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
  }

  /**
   * İsim ile arama
   */
  async searchByName(name, latitude, longitude, radius = 5000) {
    const results = [];

    if (this.useOverpass) {
      const overpassResults = await OverpassService.searchByName(
        name,
        latitude,
        longitude,
        radius
      );
      results.push(...overpassResults);
    }

    return this.removeDuplicates(results);
  }

  /**
   * Popüler mekanları getir
   */
  async getPopularPlaces(latitude, longitude, radius = 3000) {
    if (this.useFoursquare) {
      const categories = ['13003', '13065', '10041'];
      return await FoursquareService.searchNearbyPlaces(
        latitude,
        longitude,
        radius,
        categories
      );
    }

    return await OverpassService.searchNearbyPlaces(
      latitude,
      longitude,
      radius,
      ['cafe', 'restaurant', 'bar']
    );
  }

  /**
   * Fotoğraf URL'i al
   */
  getPhotoUrl(place) {
    if (place.photoUrl) {
      return place.photoUrl;
    }
    return null;
  }
}

export default new HybridPlacesService();
