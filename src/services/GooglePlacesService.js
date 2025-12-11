import axios from 'axios';
import * as Location from 'expo-location';
import { GOOGLE_PLACES_API_KEY } from '@env';

/**
 * Google Places API Servisi
 * Gerçek mekan verileri için Google Places API kullanır
 */
class GooglePlacesService {
  constructor() {
    // API Key'i .env'den al
    this.apiKey = GOOGLE_PLACES_API_KEY || '';
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';

    if (this.apiKey) {
      console.log('✅ Google Places API key yüklendi');
    } else {
      console.log('⚠️ Google Places API key bulunamadı');
    }
  }

  /**
   * API key kontrolü
   */
  isAvailable() {
    return this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Aktivite türüne göre Google Places türleri
   */
  getPlaceTypes(activityType) {
    const typeMap = {
      food: ['restaurant', 'cafe', 'bakery', 'meal_takeaway'],
      coffee: ['cafe', 'coffee_shop'],
      culture: ['museum', 'art_gallery', 'library', 'tourist_attraction'],
      nature: ['park', 'natural_feature', 'campground'],
      shopping: ['shopping_mall', 'store', 'clothing_store', 'book_store'],
      entertainment: ['movie_theater', 'amusement_park', 'bowling_alley', 'night_club'],
    };

    return typeMap[activityType] || ['tourist_attraction'];
  }

  /**
   * Kullanıcının konumunu al
   */
  async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Konum izni verilmedi');
        // Default İstanbul koordinatları
        return {
          latitude: 41.0082,
          longitude: 28.9784,
        };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Konum alınamadı:', error);
      // Default İstanbul koordinatları
      return {
        latitude: 41.0082,
        longitude: 28.9784,
      };
    }
  }

  /**
   * Yakındaki mekanları ara (Nearby Search)
   */
  async searchNearbyPlaces(latitude, longitude, activityType, radius = 2000) {
    if (!this.isAvailable()) {
      console.log('⚠️ Google Places API key bulunamadı');
      return [];
    }

    try {
      const types = this.getPlaceTypes(activityType);
      const allResults = [];

      console.log(`🔍 Google Places arama başlatılıyor:`, {
        latitude,
        longitude,
        activityType,
        types,
        radius,
      });

      // Her tür için arama yap
      for (const type of types) {
        const url = `${this.baseUrl}/nearbysearch/json`;
        const params = {
          location: `${latitude},${longitude}`,
          radius,
          type,
          key: this.apiKey,
        };

        console.log(`📡 API İsteği gönderiliyor:`, { url, type, location: params.location, radius });

        const response = await axios.get(url, { params });

        console.log(`📥 API Yanıtı [${type}]:`, {
          status: response.data.status,
          results: response.data.results?.length || 0,
          error_message: response.data.error_message,
        });

        if (response.data.status === 'OK') {
          const places = response.data.results.slice(0, 5).map(place => ({
            id: `google_${place.place_id}`,
            name: place.name,
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            },
            address: place.vicinity,
            rating: place.rating || null,
            userRatingsTotal: place.user_ratings_total || 0,
            photos: place.photos ? [place.photos[0].photo_reference] : [],
            types: place.types,
            priceLevel: place.price_level || null,
            openNow: place.opening_hours?.open_now || null,
            placeId: place.place_id,
            source: 'Google Places',
          }));

          allResults.push(...places);
        } else if (response.data.status === 'ZERO_RESULTS') {
          console.log(`ℹ️ ${type} için sonuç bulunamadı`);
        } else {
          console.warn(`⚠️ ${type} için beklenmeyen status:`, response.data.status, response.data.error_message);
        }
      }

      console.log(`✅ Toplam ${allResults.length} mekan bulundu`);
      return allResults;
    } catch (error) {
      console.error('❌ Google Places API hatası:', error.message);
      if (error.response) {
        console.error('❌ API Hata Detayı:', {
          status: error.response.status,
          data: error.response.data,
        });
      }
      return [];
    }
  }

  /**
   * Mekan detaylarını al (Place Details)
   */
  async getPlaceDetails(placeId) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const url = `${this.baseUrl}/details/json`;
      const params = {
        place_id: placeId,
        fields: 'name,rating,formatted_phone_number,formatted_address,opening_hours,website,photos,reviews,price_level,geometry',
        key: this.apiKey,
      };

      const response = await axios.get(url, { params });

      if (response.data.status === 'OK') {
        const place = response.data.result;
        return {
          name: place.name,
          rating: place.rating,
          phone: place.formatted_phone_number,
          address: place.formatted_address,
          website: place.website,
          openingHours: place.opening_hours?.weekday_text || [],
          photos: place.photos?.map(p => p.photo_reference) || [],
          reviews: place.reviews || [],
          priceLevel: place.price_level,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
        };
      }

      return null;
    } catch (error) {
      console.error('Place Details hatası:', error.message);
      return null;
    }
  }

  /**
   * Fotoğraf URL'i oluştur
   */
  getPhotoUrl(photoReference, maxWidth = 400) {
    if (!this.isAvailable() || !photoReference) {
      return null;
    }

    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  /**
   * İki nokta arası mesafe hesapla (km)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(value) {
    return (value * Math.PI) / 180;
  }

  /**
   * Rota için optimize edilmiş mekanları bul
   */
  async findRouteStops(startLat, startLng, activityTypes, duration) {
    const results = [];
    const radius = this.calculateRadiusByDuration(duration);

    for (const activityType of activityTypes) {
      const places = await this.searchNearbyPlaces(startLat, startLng, activityType, radius);

      if (places.length > 0) {
        // En yüksek puanlı mekanı seç
        const bestPlace = places.sort((a, b) => {
          const scoreA = (a.rating || 0) * Math.log10((a.userRatingsTotal || 0) + 1);
          const scoreB = (b.rating || 0) * Math.log10((b.userRatingsTotal || 0) + 1);
          return scoreB - scoreA;
        })[0];

        results.push(bestPlace);
      }
    }

    return results;
  }

  /**
   * Süreye göre arama yarıçapı belirle
   */
  calculateRadiusByDuration(duration) {
    if (duration <= 2) return 1000; // 1 km
    if (duration <= 4) return 2000; // 2 km
    if (duration <= 6) return 3000; // 3 km
    return 5000; // 5 km
  }
}

export default new GooglePlacesService();
