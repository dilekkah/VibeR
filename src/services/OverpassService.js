import axios from 'axios';

/**
 * OpenStreetMap Overpass API - Tamamen ücretsiz ve sınırsız
 */
class OverpassService {
  constructor() {
    this.baseUrl = 'https://overpass-api.de/api/interpreter';
  }

  /**
   * Ruh haline göre OSM amenity türlerini döndür
   */
  getMoodBasedAmenities(moods) {
    const amenityMap = {
      happy: ['cafe', 'restaurant', 'bar', 'pub', 'ice_cream'],
      sad: ['cafe', 'library', 'park', 'theatre', 'cinema'],
      energetic: ['gym', 'sports_centre', 'stadium', 'bicycle_rental'],
      relaxed: ['cafe', 'park', 'spa', 'garden', 'bench'],
      social: ['restaurant', 'bar', 'pub', 'cafe', 'nightclub'],
      creative: ['library', 'arts_centre', 'theatre', 'museum', 'gallery'],
      focused: ['library', 'cafe', 'coworking_space'],
      romantic: ['restaurant', 'cafe', 'cinema', 'theatre', 'park']
    };

    const amenities = new Set();
    moods.forEach(mood => {
      if (amenityMap[mood]) {
        amenityMap[mood].forEach(a => amenities.add(a));
      }
    });

    return Array.from(amenities);
  }

  /**
   * Yakındaki mekanları ara
   */
  async searchNearbyPlaces(latitude, longitude, radius = 1000, amenities = []) {
    try {
      const amenityFilter = amenities.length > 0
        ? amenities.map(a => `node["amenity"="${a}"]`).join(';')
        : 'node["amenity"]';

      const query = `
        [out:json][timeout:25];
        (
          ${amenityFilter}(around:${radius},${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await axios.post(this.baseUrl, query, {
        headers: { 'Content-Type': 'text/plain' }
      });

      return this.parseOverpassResponse(response.data);
    } catch (error) {
      console.error('Overpass API hatası:', error);
      return [];
    }
  }

  /**
   * İsme göre mekan ara
   */
  async searchByName(name, latitude, longitude, radius = 5000) {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["name"~"${name}",i](around:${radius},${latitude},${longitude});
          way["name"~"${name}",i](around:${radius},${latitude},${longitude});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await axios.post(this.baseUrl, query, {
        headers: { 'Content-Type': 'text/plain' }
      });

      return this.parseOverpassResponse(response.data);
    } catch (error) {
      console.error('Overpass isim araması hatası:', error);
      return [];
    }
  }

  /**
   * Overpass API yanıtını parse et
   */
  parseOverpassResponse(data) {
    if (!data || !data.elements) return [];

    return data.elements
      .filter(element => element.tags && element.tags.name)
      .map(element => ({
        id: `osm_${element.id}`,
        name: element.tags.name,
        location: {
          lat: element.lat,
          lng: element.lon
        },
        address: this.buildAddress(element.tags),
        category: element.tags.amenity || element.tags.shop || 'place',
        rating: null,
        photos: [],
        description: element.tags.description || '',
        source: 'OpenStreetMap'
      }));
  }

  /**
   * OSM tags'lerinden adres oluştur
   */
  buildAddress(tags) {
    const parts = [];

    if (tags['addr:street']) {
      parts.push(tags['addr:street']);
      if (tags['addr:housenumber']) {
        parts[parts.length - 1] += ` ${tags['addr:housenumber']}`;
      }
    }

    if (tags['addr:city']) {
      parts.push(tags['addr:city']);
    }

    if (tags['addr:postcode']) {
      parts.push(tags['addr:postcode']);
    }

    return parts.join(', ') || 'Adres bilgisi yok';
  }
}

export default new OverpassService();
