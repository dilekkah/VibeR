import axios from 'axios';

// .env dosyasından oku (eğer varsa)
let FOURSQUARE_API_KEY = null;

try {
  // React Native Dotenv ile oku
  const env = require('@env');
  FOURSQUARE_API_KEY = env.FOURSQUARE_API_KEY;
} catch (error) {
  console.log('⚠️ .env dosyası bulunamadı, sadece OpenStreetMap kullanılacak');
}

class FoursquareService {
  constructor() {
    this.baseUrl = 'https://api.foursquare.com/v3/places';
    this.apiKey = FOURSQUARE_API_KEY;
  }

  /**
   * API key var mı kontrol et
   */
  isAvailable() {
    return !!this.apiKey && this.apiKey !== 'undefined';
  }

  /**
   * Yakındaki mekanları ara
   */
  async searchNearbyPlaces(latitude, longitude, radius = 5000, categories = null) {
    if (!this.isAvailable()) {
      console.log('ℹ️ Foursquare API key yok, atlanıyor');
      return [];
    }

    try {
      const params = {
        ll: `${latitude},${longitude}`,
        radius: radius,
        limit: 50,
      };

      if (categories) {
        params.categories = categories.join(',');
      }

      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json',
        },
        params,
      });

      if (response.data && response.data.results) {
        return response.data.results.map(place => 
          this.formatPlace(place, latitude, longitude)
        );
      }

      return [];
    } catch (error) {
      console.error('Foursquare searchNearbyPlaces error:', error.message);
      return [];
    }
  }

  /**
   * Mekan detayı
   */
  async getPlaceDetails(fsqId) {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/${fsqId}`, {
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json',
        },
        params: {
          fields: 'fsq_id,name,location,categories,rating,price,hours,photos,tips',
        },
      });

      if (response.data) {
        return this.formatPlaceDetails(response.data);
      }

      return null;
    } catch (error) {
      console.error('Foursquare getPlaceDetails error:', error.message);
      return null;
    }
  }

  /**
   * Fotoğraf URL'i
   */
  getPhotoUrl(photo, size = '300x300') {
    if (!photo || !photo.prefix || !photo.suffix) return null;
    return `${photo.prefix}${size}${photo.suffix}`;
  }

  /**
   * Ruh haline göre kategoriler
   */
  getMoodBasedCategories(moods) {
    const moodCategoryMap = {
      happy: ['13065', '13003', '16032'], // Cafe, Restaurant, Park
      sad: ['13065', '10027', '16032'], // Cafe, Library, Park
      energetic: ['10018', '10041', '13003'], // Nightclub, Bar, Restaurant
      tired: ['13065', '16032', '17069'], // Cafe, Park, Spa
      calm: ['10027', '16032', '10025'], // Library, Park, Museum
      romantic: ['13003', '13065', '10026'], // Restaurant, Cafe, Theater
      creative: ['10025', '10027', '13065'], // Museum, Library, Cafe
      social: ['10041', '13003', '10018'], // Bar, Restaurant, Nightclub
      foodie: ['13003', '13065', '13002'], // Restaurant, Cafe, Fast Food
    };

    let categories = new Set();
    
    if (moods.includes('any')) {
      return ['13003', '13065', '10041', '16032', '10025'];
    }

    moods.forEach(mood => {
      if (moodCategoryMap[mood]) {
        moodCategoryMap[mood].forEach(cat => categories.add(cat));
      }
    });

    return Array.from(categories).slice(0, 8);
  }

  /**
   * Place formatla
   */
  formatPlace(place, userLat, userLon) {
    const category = this.getCategoryFromFSQ(place.categories?.[0]?.name);
    const distance = this.calculateDistance(
      userLat, 
      userLon, 
      place.geocodes.main.latitude, 
      place.geocodes.main.longitude
    );

    return {
      id: place.fsq_id,
      title: place.name,
      description: place.location.formatted_address || '',
      latitude: place.geocodes.main.latitude,
      longitude: place.geocodes.main.longitude,
      distance: distance,
      category: category,
      categoryLabel: this.getCategoryLabel(category),
      icon: this.getCategoryIcon(category),
      rating: place.rating || 0,
      totalRatings: place.stats?.total_ratings || 0,
      priceLevel: place.price || 0,
      categories: place.categories,
      link: `https://foursquare.com/v/${place.fsq_id}`,
      details: this.generateDetailsArray(place, distance),
      photoUrl: place.photos?.[0] ? this.getPhotoUrl(place.photos[0]) : null,
    };
  }

  formatPlaceDetails(place) {
    return {
      ...this.formatPlace(place, 0, 0),
      hours: place.hours?.display || 'Bilinmiyor',
      tips: place.tips?.map(tip => tip.text) || [],
      photos: place.photos?.map(photo => this.getPhotoUrl(photo, '800x800')) || [],
    };
  }

  getCategoryFromFSQ(categoryName) {
    if (!categoryName) return 'place';
    
    const lower = categoryName.toLowerCase();
    if (lower.includes('restaurant') || lower.includes('food')) return 'food';
    if (lower.includes('cafe') || lower.includes('coffee')) return 'food';
    if (lower.includes('bar') || lower.includes('club')) return 'entertainment';
    if (lower.includes('museum') || lower.includes('gallery')) return 'activity';
    if (lower.includes('park')) return 'activity';
    
    return 'place';
  }

  getCategoryLabel(category) {
    const labels = {
      food: 'Yemek & İçecek',
      entertainment: 'Eğlence',
      activity: 'Aktivite',
      place: 'Mekan',
    };
    return labels[category] || 'Mekan';
  }

  getCategoryIcon(category) {
    const icons = {
      food: '🍽️',
      entertainment: '🎭',
      activity: '🎨',
      place: '📍',
    };
    return icons[category] || '📍';
  }

  generateDetailsArray(place, distance) {
    const details = [];

    details.push(`📍 ${distance} km uzaklıkta`);

    if (place.rating) {
      details.push(`⭐ ${place.rating}/10 (${place.stats?.total_ratings || 0} değerlendirme)`);
    }

    if (place.price) {
      const price = '€'.repeat(place.price);
      details.push(`💰 Fiyat: ${price}`);
    }

    if (place.location.formatted_address) {
      details.push(`📍 ${place.location.formatted_address}`);
    }

    return details;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  }
}

export default new FoursquareService();
