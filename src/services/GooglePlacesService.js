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
   * Sadece yemek/içecek mekanları için optimize edildi
   */
  getPlaceTypes(activityType) {
    const typeMap = {
      food: ['restaurant', 'meal_delivery', 'meal_takeaway'],
      coffee: ['cafe', 'bakery'],
      drinks: ['bar', 'night_club'],
      breakfast: ['cafe', 'bakery'],
      lunch: ['restaurant'],
      dinner: ['restaurant', 'meal_delivery'],
      dessert: ['bakery', 'cafe'],
    };

    return typeMap[activityType] || ['restaurant', 'cafe'];
  }

  /**
   * Uygun olmayan mekanları filtrele
   */
  isValidPlace(place) {
    const name = place.name?.toLowerCase() || '';
    const types = place.types || [];

    // Kabul edilmeyen türler
    const blacklistedTypes = [
      'lodging', 'hotel', 'real_estate_agency', 'moving_company',
      'storage', 'car_rental', 'car_repair', 'car_wash', 'gas_station',
      'atm', 'bank', 'post_office', 'hospital', 'pharmacy',
      'school', 'university', 'gym', 'spa', 'beauty_salon',
      'hair_care', 'laundry', 'convenience_store', 'supermarket'
    ];

    // Blacklist'te olan tür varsa reddet
    if (types.some(type => blacklistedTypes.includes(type))) {
      return false;
    }

    // İsimde bu kelimeler varsa reddet
    const blacklistedKeywords = [
      'hotel', 'motel', 'apart', 'residence', 'hostel',
      'pharmacy', 'eczane', 'hospital', 'hastane', 'klinik',
      'market', 'supermarket', 'migros', 'carrefour', 'şok',
      'bank', 'banka', 'atm', 'post', 'ptt',
      'otopark', 'parking', 'benzin', 'gas station'
    ];

    if (blacklistedKeywords.some(keyword => name.includes(keyword))) {
      return false;
    }

    return true;
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
          // Sadece uygun mekanları al
          const places = response.data.results
            .filter(place => this.isValidPlace(place))
            .slice(0, 5)
            .map(place => ({
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

          console.log(`✅ ${type} için ${places.length} uygun mekan filtrelendi`);
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
   * Her aktivite için en iyi 2-3 mekan döndürür
   */
  async findRouteStops(startLat, startLng, activityTypes, duration) {
    const results = [];
    const radius = this.calculateRadiusByDuration(duration);

    // Her aktivite için kaç mekan alınacak (toplam süreye göre)
    const placesPerActivity = duration >= 6 ? 3 : duration >= 4 ? 2 : 1;

    console.log(`🎯 Her aktivite için ${placesPerActivity} mekan aranıyor (toplam ${duration} saat)`);

    for (const activityType of activityTypes) {
      const places = await this.searchNearbyPlaces(startLat, startLng, activityType, radius);

      if (places.length > 0) {
        // En yüksek puanlı mekanları seç
        const sortedPlaces = places.sort((a, b) => {
          const scoreA = (a.rating || 0) * Math.log10((a.userRatingsTotal || 0) + 1);
          const scoreB = (b.rating || 0) * Math.log10((b.userRatingsTotal || 0) + 1);
          return scoreB - scoreA;
        });

        // İlk N mekanı al
        const selectedPlaces = sortedPlaces.slice(0, placesPerActivity);
        results.push(...selectedPlaces);

        console.log(`✅ ${activityType}: ${selectedPlaces.length} mekan eklendi`);
      }
    }

    console.log(`📍 Toplam ${results.length} mekan bulundu`);
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
