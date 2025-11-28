import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const FAVORITES_KEY = '@favorites';

export default function RouteGeneratorScreen({ navigation }) {
  const { theme } = useTheme();
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [selectedTime, setSelectedTime] = useState('fullday'); // halfday, fullday, evening
  const [generatedRoute, setGeneratedRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  // İstanbul'daki popüler mekanlar (genişletilebilir)
  const allPlaces = [
    // Kahve & Cafe
    {
      id: 1,
      name: 'Kronotrop Coffee',
      category: 'cafe',
      district: 'Karaköy',
      duration: 45,
      icon: '☕',
      description: 'Özel kahve deneyimi',
      bestTime: ['morning', 'afternoon']
    },
    {
      id: 2,
      name: 'Petra Roasting Co.',
      category: 'cafe',
      district: 'Gayrettepe',
      duration: 40,
      icon: '☕',
      description: 'Çalışma dostu, kaliteli kahve',
      bestTime: ['morning', 'afternoon']
    },
    {
      id: 3,
      name: 'MOC Bomontiada',
      category: 'cafe',
      district: 'Bomonti',
      duration: 60,
      icon: '☕',
      description: 'Modern, enerjik ortam',
      bestTime: ['morning', 'afternoon', 'evening']
    },

    // Yemek
    {
      id: 4,
      name: 'Çiya Sofrası',
      category: 'restaurant',
      district: 'Kadıköy',
      duration: 90,
      icon: '🍽️',
      description: 'Geleneksel Anadolu mutfağı',
      bestTime: ['lunch', 'dinner']
    },
    {
      id: 5,
      name: 'Karaköy Lokantası',
      category: 'restaurant',
      district: 'Karaköy',
      duration: 75,
      icon: '🍽️',
      description: 'Modern İstanbul mutfağı',
      bestTime: ['lunch', 'dinner']
    },
    {
      id: 6,
      name: 'Neolokal',
      category: 'restaurant',
      district: 'Karaköy',
      duration: 120,
      icon: '🍽️',
      description: 'Fine dining, Türk mutfağı',
      bestTime: ['lunch', 'dinner']
    },
    {
      id: 7,
      name: 'Mangerie',
      category: 'restaurant',
      district: 'Nişantaşı',
      duration: 90,
      icon: '🍽️',
      description: 'Fransız mutfağı',
      bestTime: ['lunch', 'dinner']
    },

    // Gezilecek Yerler
    {
      id: 8,
      name: 'Galata Kulesi',
      category: 'attraction',
      district: 'Galata',
      duration: 60,
      icon: '🏰',
      description: 'Tarihi kule ve manzara',
      bestTime: ['morning', 'afternoon', 'evening']
    },
    {
      id: 9,
      name: 'Ortaköy Camii',
      category: 'attraction',
      district: 'Ortaköy',
      duration: 45,
      icon: '🕌',
      description: 'Boğaz manzaralı cami',
      bestTime: ['morning', 'afternoon']
    },
    {
      id: 10,
      name: 'İstiklal Caddesi',
      category: 'attraction',
      district: 'Beyoğlu',
      duration: 120,
      icon: '🚶',
      description: 'Alışveriş ve gezinti',
      bestTime: ['afternoon', 'evening']
    },
    {
      id: 11,
      name: 'Dolmabahçe Sarayı',
      category: 'attraction',
      district: 'Beşiktaş',
      duration: 90,
      icon: '🏛️',
      description: 'Osmanlı sarayı',
      bestTime: ['morning', 'afternoon']
    },
    {
      id: 12,
      name: 'Moda Sahili',
      category: 'attraction',
      district: 'Kadıköy',
      duration: 60,
      icon: '🌊',
      description: 'Sahil yürüyüşü',
      bestTime: ['morning', 'afternoon', 'evening']
    },

    // Müze & Kültür
    {
      id: 13,
      name: 'İstanbul Modern',
      category: 'museum',
      district: 'Karaköy',
      duration: 120,
      icon: '🎨',
      description: 'Modern sanat müzesi',
      bestTime: ['morning', 'afternoon']
    },
    {
      id: 14,
      name: 'Pera Müzesi',
      category: 'museum',
      district: 'Beyoğlu',
      duration: 90,
      icon: '🎨',
      description: 'Sanat ve sergi alanı',
      bestTime: ['morning', 'afternoon']
    },
    {
      id: 15,
      name: 'SALT Galata',
      category: 'museum',
      district: 'Galata',
      duration: 75,
      icon: '📚',
      description: 'Kültür ve araştırma merkezi',
      bestTime: ['morning', 'afternoon']
    },

    // Bar & Eğlence
    {
      id: 16,
      name: 'Mikla',
      category: 'bar',
      district: 'Beyoğlu',
      duration: 120,
      icon: '🍸',
      description: 'Rooftop bar, muhteşem manzara',
      bestTime: ['evening']
    },
    {
      id: 17,
      name: '360 Istanbul',
      category: 'bar',
      district: 'Beyoğlu',
      duration: 120,
      icon: '🍸',
      description: '360 derece şehir manzarası',
      bestTime: ['evening']
    },
    {
      id: 18,
      name: 'Babylon',
      category: 'bar',
      district: 'Bomonti',
      duration: 180,
      icon: '🎵',
      description: 'Canlı müzik performansları',
      bestTime: ['evening']
    },

    // Tatlı & Atıştırmalık
    {
      id: 19,
      name: 'Şekerci Cafer Erol',
      category: 'dessert',
      district: 'Kadıköy',
      duration: 30,
      icon: '🍰',
      description: 'Geleneksel tatlılar',
      bestTime: ['afternoon', 'evening']
    },
    {
      id: 20,
      name: 'Midpoint',
      category: 'dessert',
      district: 'Nişantaşı',
      duration: 45,
      icon: '🍰',
      description: 'Modern pastane',
      bestTime: ['afternoon', 'evening']
    },

    // Alışveriş
    {
      id: 21,
      name: 'Kapalıçarşı',
      category: 'shopping',
      district: 'Fatih',
      duration: 90,
      icon: '🛍️',
      description: 'Tarihi çarşı',
      bestTime: ['morning', 'afternoon']
    },
    {
      id: 22,
      name: 'Kanyon AVM',
      category: 'shopping',
      district: 'Levent',
      duration: 120,
      icon: '🛍️',
      description: 'Modern alışveriş merkezi',
      bestTime: ['afternoon', 'evening']
    }
  ];

  const timeSlots = [
    { id: 'halfday', label: '4 Saat', icon: '⏰', duration: 240 },
    { id: 'fullday', label: 'Tam Gün', icon: '☀️', duration: 480 },
    { id: 'evening', label: 'Akşam', icon: '🌙', duration: 240 },
  ];

  const generateSmartRoute = () => {
    if (!startLocation.trim() || !endLocation.trim()) {
      Alert.alert('Hata', 'Lütfen başlangıç ve bitiş noktalarını girin');
      return;
    }

    setLoading(true);

    // Seçilen süreye göre mekan sayısı belirleme
    const selectedSlot = timeSlots.find(slot => slot.id === selectedTime);
    const totalMinutes = selectedSlot.duration;

    // Rastgele mekanlar seç (gerçek uygulamada konum bazlı filtreleme yapılır)
    let selectedPlaces = [];
    let currentTime = 0;

    // Zaman dilimine göre kategorileri filtrele
    let availablePlaces = [...allPlaces];

    if (selectedTime === 'evening') {
      availablePlaces = availablePlaces.filter(p =>
        p.bestTime.includes('evening')
      );
    }

    // Önce kahve ile başla (sabah/öğleden sonra için)
    if (selectedTime !== 'evening') {
      const cafes = availablePlaces.filter(p => p.category === 'cafe');
      if (cafes.length > 0) {
        const randomCafe = cafes[Math.floor(Math.random() * cafes.length)];
        selectedPlaces.push(randomCafe);
        currentTime += randomCafe.duration;
        availablePlaces = availablePlaces.filter(p => p.id !== randomCafe.id);
      }
    }

    // Sonra bir gezilecek yer veya müze ekle
    if (currentTime < totalMinutes - 120) {
      const attractions = availablePlaces.filter(p =>
        p.category === 'attraction' || p.category === 'museum'
      );
      if (attractions.length > 0) {
        const randomAttraction = attractions[Math.floor(Math.random() * attractions.length)];
        selectedPlaces.push(randomAttraction);
        currentTime += randomAttraction.duration;
        availablePlaces = availablePlaces.filter(p => p.id !== randomAttraction.id);
      }
    }

    // Yemek ekle
    if (currentTime < totalMinutes - 90) {
      const restaurants = availablePlaces.filter(p => p.category === 'restaurant');
      if (restaurants.length > 0) {
        const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
        selectedPlaces.push(randomRestaurant);
        currentTime += randomRestaurant.duration;
        availablePlaces = availablePlaces.filter(p => p.id !== randomRestaurant.id);
      }
    }

    // Akşam için bar/eğlence ekle
    if (selectedTime === 'evening' || selectedTime === 'fullday') {
      if (currentTime < totalMinutes - 90) {
        const bars = availablePlaces.filter(p => p.category === 'bar');
        if (bars.length > 0) {
          const randomBar = bars[Math.floor(Math.random() * bars.length)];
          selectedPlaces.push(randomBar);
          currentTime += randomBar.duration;
        }
      }
    } else {
      // Tatlı ile bitir
      if (currentTime < totalMinutes - 30) {
        const desserts = availablePlaces.filter(p => p.category === 'dessert');
        if (desserts.length > 0) {
          const randomDessert = desserts[Math.floor(Math.random() * desserts.length)];
          selectedPlaces.push(randomDessert);
          currentTime += randomDessert.duration;
        }
      }
    }

    setGeneratedRoute({
      places: selectedPlaces,
      totalDuration: currentTime,
      startLocation,
      endLocation,
    });

    setLoading(false);
  };

  const addToFavorites = async (place) => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];

      const placeData = {
        title: place.name,
        icon: place.icon,
        categoryLabel: place.category,
        description: place.description,
        details: [
          `📍 ${place.district}`,
          `⏱️ ${place.duration} dakika`,
        ],
        link: `https://www.google.com/maps/search/${encodeURIComponent(place.name + ' ' + place.district)}`,
      };

      favorites.push(placeData);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      Alert.alert('Başarılı', `${place.name} favorilere eklendi!`);
    } catch (error) {
      Alert.alert('Hata', 'Favorilere eklenirken bir hata oluştu');
    }
  };

  const openInMaps = () => {
    if (!generatedRoute) return;

    const locations = [
      startLocation,
      ...generatedRoute.places.map(p => `${p.name}, ${p.district}`),
      endLocation
    ];

    const encodedLocations = locations.map(loc =>
      encodeURIComponent(loc.trim())
    ).join('/');

    const googleMapsUrl = `https://www.google.com/maps/dir/${encodedLocations}`;

    Linking.openURL(googleMapsUrl).catch(err => {
      console.error('URL açılamadı:', err);
      Alert.alert('Hata', 'Google Maps açılamadı');
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.cardBackground,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: theme.textSecondary,
      lineHeight: 22,
    },
    content: {
      flex: 1,
    },
    formSection: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 15,
      fontSize: 16,
      backgroundColor: theme.inputBackground,
      borderColor: theme.border,
      color: theme.text,
    },
    timeSelector: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 20,
    },
    timeButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.border,
      backgroundColor: theme.cardBackground,
      alignItems: 'center',
    },
    timeButtonActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + '15',
    },
    timeIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    timeLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    timeLabelActive: {
      color: theme.primary,
    },
    generateButton: {
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.primary,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    generateButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    routeSection: {
      padding: 20,
    },
    routeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    routeTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    routeDuration: {
      fontSize: 14,
      color: theme.textSecondary,
      backgroundColor: theme.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    locationInfo: {
      backgroundColor: theme.secondaryBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    locationIcon: {
      fontSize: 20,
      marginRight: 10,
    },
    locationText: {
      fontSize: 14,
      color: theme.text,
      flex: 1,
    },
    placeCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    placeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    placeHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    placeNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    placeNumberText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    placeInfo: {
      flex: 1,
    },
    placeName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 2,
    },
    placeDistrict: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    placeIcon: {
      fontSize: 32,
    },
    placeDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    placeDuration: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: '600',
    },
    placeActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
    },
    favoriteButton: {
      backgroundColor: theme.primary + '10',
      borderColor: theme.primary + '30',
    },
    favoriteButtonText: {
      color: theme.primary,
      fontSize: 13,
      fontWeight: '600',
    },
    ratingButton: {
      backgroundColor: theme.accent + '10',
      borderColor: theme.accent + '30',
    },
    ratingButtonText: {
      color: theme.accent,
      fontSize: 13,
      fontWeight: '600',
    },
    openMapsButton: {
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.accent,
      marginTop: 20,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    openMapsButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    resetButton: {
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.secondaryBackground,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    resetButtonText: {
      color: theme.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Günlük Gezi Planı</Text>
        <Text style={styles.subtitle}>
          Başlangıç ve bitiş noktanızı girin, size özel bir gezi rotası oluşturalım
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!generatedRoute ? (
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>📍 Başlangıç Noktası</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Taksim, Kadıköy, Beşiktaş..."
                placeholderTextColor={theme.placeholder}
                value={startLocation}
                onChangeText={setStartLocation}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>🏁 Bitiş Noktası</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Karaköy, Nişantaşı, Ortaköy..."
                placeholderTextColor={theme.placeholder}
                value={endLocation}
                onChangeText={setEndLocation}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>⏰ Gezi Süresi</Text>
              <View style={styles.timeSelector}>
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeButton,
                      selectedTime === slot.id && styles.timeButtonActive,
                    ]}
                    onPress={() => setSelectedTime(slot.id)}
                  >
                    <Text style={styles.timeIcon}>{slot.icon}</Text>
                    <Text
                      style={[
                        styles.timeLabel,
                        selectedTime === slot.id && styles.timeLabelActive,
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateSmartRoute}
              disabled={loading}
            >
              <Text style={styles.generateButtonText}>
                {loading ? '⏳ Oluşturuluyor...' : '✨ Rota Oluştur'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.routeSection}>
            <View style={styles.routeHeader}>
              <Text style={styles.routeTitle}>🎯 Rotanız Hazır!</Text>
              <Text style={styles.routeDuration}>
                ~{Math.floor(generatedRoute.totalDuration / 60)} saat
              </Text>
            </View>

            <View style={styles.locationInfo}>
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>🚀</Text>
                <Text style={styles.locationText}>{generatedRoute.startLocation}</Text>
              </View>
              <View style={styles.locationRow}>
                <Text style={styles.locationIcon}>🏁</Text>
                <Text style={styles.locationText}>{generatedRoute.endLocation}</Text>
              </View>
            </View>

            {generatedRoute.places.map((place, index) => (
              <View key={place.id} style={styles.placeCard}>
                <View style={styles.placeHeader}>
                  <View style={styles.placeHeaderLeft}>
                    <View style={styles.placeNumber}>
                      <Text style={styles.placeNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.placeInfo}>
                      <Text style={styles.placeName}>{place.name}</Text>
                      <Text style={styles.placeDistrict}>📍 {place.district}</Text>
                    </View>
                  </View>
                  <Text style={styles.placeIcon}>{place.icon}</Text>
                </View>

                <Text style={styles.placeDescription}>{place.description}</Text>
                <Text style={styles.placeDuration}>⏱️ {place.duration} dakika</Text>

                <View style={styles.placeActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.favoriteButton]}
                    onPress={() => addToFavorites(place)}
                  >
                    <Text style={styles.favoriteButtonText}>❤️ Favorile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.ratingButton]}
                    onPress={() => navigation.navigate('Rating', {
                      place: {
                        title: place.name,
                        id: place.id
                      }
                    })}
                  >
                    <Text style={styles.ratingButtonText}>⭐ Değerlendir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.openMapsButton} onPress={openInMaps}>
              <Text style={styles.openMapsButtonText}>
                🗺️ Haritada Aç
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setGeneratedRoute(null);
                setStartLocation('');
                setEndLocation('');
              }}
            >
              <Text style={styles.resetButtonText}>🔄 Yeni Rota Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
