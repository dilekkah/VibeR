import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import GooglePlacesService from '../services/GooglePlacesService';
import { GOOGLE_PLACES_API_KEY } from '@env';

const { width } = Dimensions.get('window');

const DURATION_OPTIONS = [
  { value: 2, label: '2 Saat', emoji: '⚡' },
  { value: 4, label: '4 Saat', emoji: '☀️' },
  { value: 6, label: '6 Saat', emoji: '🌅' },
  { value: 8, label: 'Tam Gün', emoji: '🌙' },
];

const ACTIVITY_TYPES = [
  { id: 'food', label: 'Yemek', emoji: '🍽️', color: '#FF6B6B' },
  { id: 'coffee', label: 'Kahve', emoji: '☕', color: '#8B4513' },
  { id: 'culture', label: 'Kültür', emoji: '🏛️', color: '#6B5B95' },
  { id: 'nature', label: 'Doğa', emoji: '🌳', color: '#2ECC71' },
  { id: 'shopping', label: 'Alışveriş', emoji: '🛍️', color: '#E91E63' },
  { id: 'entertainment', label: 'Eğlence', emoji: '🎮', color: '#9C27B0' },
];

const TRANSPORT_OPTIONS = [
  { id: 'walk', label: 'Yürüyüş', emoji: '🚶' },
  { id: 'public', label: 'Toplu Taşıma', emoji: '🚇' },
  { id: 'car', label: 'Araba', emoji: '🚗' },
  { id: 'bike', label: 'Bisiklet', emoji: '🚴' },
];

export default function RouteGeneratorScreen({ navigation }) {
  const [duration, setDuration] = useState(4);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [transport, setTransport] = useState('walk');
  const [generating, setGenerating] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [generatedRoute, setGeneratedRoute] = useState(null);

  // Yeni state'ler - Konum girişi için
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const toggleActivity = (id) => {
    setSelectedActivities(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedActivities.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir aktivite türü seçin');
      return;
    }

    if (!useCurrentLocation && (!startLocation.trim() || !endLocation.trim())) {
      Alert.alert('Uyarı', 'Lütfen başlangıç ve bitiş noktalarını girin');
      return;
    }

    setGenerating(true);

    try {
      let startCoords, endCoords;

      if (useCurrentLocation) {
        // Mevcut konumu kullan
        const userLocation = await GooglePlacesService.getCurrentLocation();
        startCoords = userLocation;
        endCoords = userLocation; // Circular route
        console.log('📍 Mevcut konum kullanılıyor:', userLocation);
      } else {
        // Girilen konumları geocode et
        console.log('🔍 Konumlar aranıyor:', { startLocation, endLocation });

        startCoords = await geocodeLocation(startLocation);

        if (!startCoords) {
          setGenerating(false);
          return;
        }

        endCoords = await geocodeLocation(endLocation);

        if (!endCoords) {
          setGenerating(false);
          return;
        }

        console.log('✅ Konumlar bulundu:', { startCoords, endCoords });
      }

      // Rota üzerindeki ara noktalarda mekanları bul
      const routePlaces = await findPlacesAlongRoute(
        startCoords,
        endCoords,
        selectedActivities,
        duration
      );

      console.log(`✅ ${routePlaces.length} mekan bulundu`);

      if (routePlaces.length === 0) {
        // API key yoksa veya sonuç bulunamadıysa mock data kullan
        console.log('ℹ️ Gerçek mekan bulunamadı, örnek veriler kullanılıyor');
        const mockRoute = {
          duration,
          activities: selectedActivities,
          transport,
          isReal: false,
          stops: selectedActivities.map((actId, index) => {
            const activity = ACTIVITY_TYPES.find(a => a.id === actId);
            return {
              id: index + 1,
              title: `${activity.emoji} ${activity.label}`,
              time: `${9 + index * 2}:00`,
              location: `Örnek Mekan ${index + 1}`,
              address: 'Konum bilgisi yok',
              duration: `${Math.floor(duration / selectedActivities.length)} saat`,
              color: activity.color,
              rating: null,
            };
          }),
        };
        setGeneratedRoute(mockRoute);
      } else {
        // Gerçek mekanlarla rota oluştur
        const realRoute = {
          duration,
          activities: selectedActivities,
          transport,
          isReal: true,
          stops: routePlaces.map((place, index) => {
            const activity = ACTIVITY_TYPES.find(a =>
              selectedActivities.includes(a.id)
            ) || ACTIVITY_TYPES[index % ACTIVITY_TYPES.length];

            const timePerStop = Math.floor(duration / routePlaces.length);
            const startHour = 9 + (index * timePerStop);

            return {
              id: place.placeId || `place_${index}`,
              title: place.name,
              time: `${startHour}:00`,
              location: place.address || 'Adres bilgisi yok',
              address: place.address,
              duration: `~${timePerStop} saat`,
              color: activity.color,
              rating: place.rating,
              emoji: activity.emoji,
              lat: place.location.lat,
              lng: place.location.lng,
              photos: place.photos,
            };
          }),
        };
        setGeneratedRoute(realRoute);
      }

      setGenerating(false);
      setShowRoute(true);
    } catch (error) {
      console.error('Rota oluşturma hatası:', error);
      setGenerating(false);
      Alert.alert('Hata', 'Rota oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Fallback koordinatlar - API çalışmadığında
  const getFallbackCoordinates = (locationName) => {
    const locations = {
      'taksim': { latitude: 41.0369, longitude: 28.9850, name: 'Taksim' },
      'taksim meydanı': { latitude: 41.0369, longitude: 28.9850, name: 'Taksim Meydanı' },
      'kadıköy': { latitude: 40.9909, longitude: 29.0265, name: 'Kadıköy' },
      'kadıköy iskelesi': { latitude: 40.9909, longitude: 29.0265, name: 'Kadıköy İskelesi' },
      'beşiktaş': { latitude: 41.0426, longitude: 29.0073, name: 'Beşiktaş' },
      'beşiktaş çarşı': { latitude: 41.0426, longitude: 29.0073, name: 'Beşiktaş Çarşı' },
      'fatih': { latitude: 41.0192, longitude: 28.9496, name: 'Fatih' },
      'sultanahmet': { latitude: 41.0054, longitude: 28.9768, name: 'Sultanahmet' },
      'şişli': { latitude: 41.0602, longitude: 28.9874, name: 'Şişli' },
      'bakırköy': { latitude: 40.9800, longitude: 28.8731, name: 'Bakırköy' },
      'üsküdar': { latitude: 41.0224, longitude: 29.0138, name: 'Üsküdar' },
      'beyoğlu': { latitude: 41.0351, longitude: 28.9788, name: 'Beyoğlu' },
      'galata': { latitude: 41.0259, longitude: 28.9740, name: 'Galata' },
      'ortaköy': { latitude: 41.0555, longitude: 29.0264, name: 'Ortaköy' },
      'bebek': { latitude: 41.0781, longitude: 29.0417, name: 'Bebek' },
    };

    const searchKey = locationName.toLowerCase().trim()
      .replace(/,.*$/, '') // "Taksim, İstanbul" -> "Taksim"
      .replace(/\s+istanbul$/i, ''); // "Taksim Istanbul" -> "Taksim"

    // Tam eşleşme ara
    if (locations[searchKey]) {
      return locations[searchKey];
    }

    // Kısmi eşleşme ara
    for (const [key, value] of Object.entries(locations)) {
      if (searchKey.includes(key) || key.includes(searchKey)) {
        return value;
      }
    }

    return null;
  };

  // Geocoding fonksiyonu - Adres → Koordinat
  // Google Places Find Place (Text Search) kullanarak
  const geocodeLocation = async (address) => {
    try {
      // API key'i direkt kullan
      const apiKey = GOOGLE_PLACES_API_KEY || 'AIzaSyDCVXj6k7qDLPADwpvH3Sw_WQsMTYvlG_I';

      if (!apiKey) {
        console.warn('⚠️ Google Places API key bulunamadı');
        Alert.alert('Uyarı', 'API key yapılandırılmamış');
        return null;
      }

      console.log(`🔍 Konum aranıyor: "${address}"`);

      // Places API - Find Place kullan (Geocoding API yerine)
      const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(address)}&inputtype=textquery&fields=geometry,name,formatted_address&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      console.log(`📡 Places API yanıt:`, {
        status: data.status,
        candidates: data.candidates?.length || 0,
      });

      if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
        const place = data.candidates[0];
        const coords = {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        };
        console.log(`✅ Konum bulundu: ${place.name}`, coords);
        return coords;
      } else if (data.status === 'ZERO_RESULTS') {
        Alert.alert(
          'Konum Bulunamadı',
          `"${address}" için sonuç bulunamadı.\n\nÖrnek: "Taksim, İstanbul" veya "Kadıköy İskelesi"`
        );
        return null;
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('API Hatası:', data.error_message);

        // Fallback: Bilinen şehir isimlerini koordinatlara çevir
        const fallbackCoords = getFallbackCoordinates(address);
        if (fallbackCoords) {
          console.log(`✅ Fallback koordinat kullanıldı: ${address}`, fallbackCoords);
          return fallbackCoords;
        }

        Alert.alert(
          'API Kısıtlaması',
          'Google Cloud Console\'da "Places API" ve "Geocoding API" aktif değil.\n\nŞimdilik mevcut konumunuzu kullanın veya bilinen şehir isimlerini deneyin:\n• Taksim\n• Kadıköy\n• Beşiktaş'
        );
        return null;
      } else {
        console.error('Places API hatası:', data.status, data.error_message);
        Alert.alert('Hata', 'Konum aranırken hata oluştu');
        return null;
      }
    } catch (error) {
      console.error('Konum arama hatası:', error);
      Alert.alert('Hata', 'Ağ bağlantısı hatası');
      return null;
    }
  };

  // Rota üzerinde mekanları bul
  const findPlacesAlongRoute = async (start, end, activities, duration) => {
    const allPlaces = [];

    // Başlangıç ve bitiş arasındaki mesafeyi hesapla
    const distance = GooglePlacesService.calculateDistance(
      start.latitude,
      start.longitude,
      end.latitude,
      end.longitude
    );

    console.log(`📏 Rota mesafesi: ${distance.toFixed(2)} km`);

    // Rota boyunca ara noktalar oluştur (her aktivite için)
    const numStops = activities.length;
    const placesPerStop = Math.max(1, Math.floor(duration / numStops));

    for (let i = 0; i < numStops; i++) {
      // Rota boyunca eşit aralıklarla nokta belirle
      const ratio = (i + 1) / (numStops + 1);
      const waypoint = {
        latitude: start.latitude + (end.latitude - start.latitude) * ratio,
        longitude: start.longitude + (end.longitude - start.longitude) * ratio,
      };

      console.log(`🎯 Ara nokta ${i + 1}:`, waypoint);

      // Bu noktada mekanları ara
      const activityType = activities[i];
      const radius = distance < 5 ? 1000 : distance < 10 ? 2000 : 3000;

      const places = await GooglePlacesService.searchNearbyPlaces(
        waypoint.latitude,
        waypoint.longitude,
        activityType,
        radius
      );

      if (places.length > 0) {
        // En iyi mekanları ekle
        allPlaces.push(...places.slice(0, placesPerStop));
      }
    }

    return allPlaces;
  };

  // Eğer rota oluşturulduysa göster
  if (showRoute && generatedRoute) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowRoute(false)}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Rotanız Hazır 🎉</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.routeSummary}>
              <Text style={styles.routeSummaryTitle}>Rota Özeti</Text>
              <Text style={styles.routeSummaryText}>
                ⏱️ Süre: {generatedRoute.duration} saat
              </Text>
              <Text style={styles.routeSummaryText}>
                📍 Durak Sayısı: {generatedRoute.stops.length}
              </Text>
              <Text style={styles.routeSummaryText}>
                🚶 Ulaşım: {TRANSPORT_OPTIONS.find(t => t.id === generatedRoute.transport)?.label}
              </Text>
            </View>

            {generatedRoute.isReal && (
              <View style={styles.realDataBadge}>
                <Text style={styles.realDataText}>✅ Gerçek Mekanlar</Text>
              </View>
            )}

            {generatedRoute.stops.map((stop, index) => (
              <View key={stop.id} style={styles.routeStop}>
                <View style={[styles.stopNumber, { backgroundColor: stop.color }]}>
                  <Text style={styles.stopNumberText}>{stop.emoji || (index + 1)}</Text>
                </View>
                <View style={styles.stopDetails}>
                  <Text style={styles.stopTitle}>{stop.title}</Text>
                  {stop.rating && (
                    <Text style={styles.stopRating}>⭐ {stop.rating} / 5</Text>
                  )}
                  <Text style={styles.stopTime}>🕐 {stop.time}</Text>
                  <Text style={styles.stopLocation}>📍 {stop.location}</Text>
                  <Text style={styles.stopDuration}>⏱️ {stop.duration}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => {
                setShowRoute(false);
                setSelectedActivities([]);
              }}
            >
              <Text style={styles.generateButtonText}>Yeni Rota Oluştur</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rota Oluştur</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.heroIconBox}>
              <Text style={styles.heroIcon}>🗺️</Text>
            </View>
            <Text style={styles.heroTitle}>Günlük Rotanı Planla</Text>
            <Text style={styles.heroSubtitle}>
              Tercihlerine göre özelleştirilmiş bir gün planı oluşturalım
            </Text>
          </Animated.View>

          {/* Location Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Rota Konumu</Text>
            <Text style={styles.sectionSubtitle}>Nereden nereye gidiyorsun?</Text>

            {/* Toggle: Mevcut Konum / Özel Konum */}
            <View style={styles.locationToggle}>
              <TouchableOpacity
                style={[
                  styles.locationToggleButton,
                  useCurrentLocation && styles.locationToggleButtonActive,
                ]}
                onPress={() => setUseCurrentLocation(true)}
              >
                <Text
                  style={[
                    styles.locationToggleText,
                    useCurrentLocation && styles.locationToggleTextActive,
                  ]}
                >
                  📍 Mevcut Konumum
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.locationToggleButton,
                  !useCurrentLocation && styles.locationToggleButtonActive,
                ]}
                onPress={() => setUseCurrentLocation(false)}
              >
                <Text
                  style={[
                    styles.locationToggleText,
                    !useCurrentLocation && styles.locationToggleTextActive,
                  ]}
                >
                  🎯 Özel Rota
                </Text>
              </TouchableOpacity>
            </View>

            {/* Özel Konum Girişi */}
            {!useCurrentLocation && (
              <View style={styles.locationInputs}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>🚀 Başlangıç</Text>
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Örn: Taksim, İstanbul"
                    placeholderTextColor="#A0A0A0"
                    value={startLocation}
                    onChangeText={setStartLocation}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>🏁 Bitiş</Text>
                  <TextInput
                    style={styles.locationInput}
                    placeholder="Örn: Kadıköy, İstanbul"
                    placeholderTextColor="#A0A0A0"
                    value={endLocation}
                    onChangeText={setEndLocation}
                  />
                </View>
                <View style={styles.routeInfoBox}>
                  <Text style={styles.routeInfoIcon}>💡</Text>
                  <Text style={styles.routeInfoText}>
                    Başlangıç ve bitiş noktaları arasında en iyi rotayı oluşturacağız!
                  </Text>
                </View>
                <View style={styles.exampleBox}>
                  <Text style={styles.exampleTitle}>Örnek Adresler:</Text>
                  <Text style={styles.exampleText}>• Taksim Meydanı, İstanbul</Text>
                  <Text style={styles.exampleText}>• Kadıköy İskelesi, İstanbul</Text>
                  <Text style={styles.exampleText}>• Beşiktaş Çarşı, İstanbul</Text>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Duration Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Süre</Text>
            <Text style={styles.sectionSubtitle}>Ne kadar zamanın var?</Text>

            <View style={styles.optionsGrid}>
              {DURATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.durationCard,
                    duration === option.value && styles.durationCardSelected,
                  ]}
                  onPress={() => setDuration(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.durationEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.durationLabel,
                      duration === option.value && styles.durationLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Activities Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Aktiviteler</Text>
            <Text style={styles.sectionSubtitle}>Ne yapmak istersin?</Text>

            <View style={styles.activitiesGrid}>
              {ACTIVITY_TYPES.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityCard,
                    selectedActivities.includes(activity.id) && {
                      backgroundColor: activity.color,
                      borderColor: activity.color,
                    },
                  ]}
                  onPress={() => toggleActivity(activity.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                  <Text
                    style={[
                      styles.activityLabel,
                      selectedActivities.includes(activity.id) && styles.activityLabelSelected,
                    ]}
                  >
                    {activity.label}
                  </Text>
                  {selectedActivities.includes(activity.id) && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Transport Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Ulaşım</Text>
            <Text style={styles.sectionSubtitle}>Nasıl hareket edeceksin?</Text>

            <View style={styles.transportRow}>
              {TRANSPORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.transportCard,
                    transport === option.id && styles.transportCardSelected,
                  ]}
                  onPress={() => setTransport(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.transportEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.transportLabel,
                      transport === option.id && styles.transportLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Summary */}
          <Animated.View
            style={[
              styles.summaryCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.summaryTitle}>Özet</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Süre:</Text>
              <Text style={styles.summaryValue}>{duration} saat</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Aktiviteler:</Text>
              <Text style={styles.summaryValue}>
                {selectedActivities.length > 0
                  ? selectedActivities.map(id =>
                    ACTIVITY_TYPES.find(a => a.id === id)?.emoji
                  ).join(' ')
                  : 'Seçilmedi'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ulaşım:</Text>
              <Text style={styles.summaryValue}>
                {TRANSPORT_OPTIONS.find(t => t.id === transport)?.emoji}{' '}
                {TRANSPORT_OPTIONS.find(t => t.id === transport)?.label}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Generate Button */}
        <Animated.View
          style={[
            styles.bottomSection,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            activeOpacity={0.85}
            disabled={generating}
          >
            <Text style={styles.generateButtonText}>
              {generating ? 'Rota Oluşturuluyor...' : 'Rotayı Oluştur'}
            </Text>
            {!generating && <Text style={styles.generateIcon}>🚀</Text>}
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  backIcon: {
    fontSize: 22,
    color: '#1C1C1C',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#7C7C7C',
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7C7C7C',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationCard: {
    width: (width - 60) / 4,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  durationCardSelected: {
    backgroundColor: '#1C1C1C',
  },
  durationEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C7C7C',
  },
  durationLabelSelected: {
    color: '#FFFFFF',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityCard: {
    width: (width - 52) / 3,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F0EEEB',
    position: 'relative',
  },
  activityEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  activityLabelSelected: {
    color: '#FFFFFF',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 12,
    color: '#1C1C1C',
    fontWeight: '700',
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transportCard: {
    width: (width - 60) / 4,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  transportCardSelected: {
    backgroundColor: '#1C1C1C',
  },
  transportEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  transportLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C7C7C',
    textAlign: 'center',
  },
  transportLabelSelected: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7C7C7C',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F7F5F2',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#1C1C1C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generateIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  routeSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  routeSummaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 16,
  },
  routeSummaryText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  routeStop: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stopNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stopNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stopDetails: {
    flex: 1,
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 6,
  },
  stopTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  stopLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  stopDuration: {
    fontSize: 13,
    color: '#666',
  },
  stopRating: {
    fontSize: 13,
    color: '#FFA500',
    fontWeight: '600',
    marginBottom: 3,
  },
  realDataBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  realDataText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  locationToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0EEEB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  locationToggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  locationToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C7C7C',
  },
  locationToggleTextActive: {
    color: '#1C1C1C',
  },
  locationInputs: {
    gap: 12,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  locationInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1C1C1C',
    borderWidth: 2,
    borderColor: '#F0EEEB',
  },
  routeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  routeInfoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  routeInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  exampleBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  exampleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
});