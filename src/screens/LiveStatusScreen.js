import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import UnifiedPlacesService from '../services/UnifiedPlacesService';

const { width } = Dimensions.get('window');

export default function LiveStatusScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  useEffect(() => {
    initializeScreen();
  }, []);

  // Ekranı başlat - sadece konum izni
  const initializeScreen = async () => {
    try {
      // Sadece konum izni al
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

      if (locationStatus === 'granted') {
        await getCurrentLocationAndVenues();
      } else {
        Alert.alert(
          'Konum İzni Gerekli',
          'Yakındaki mekanları görmek için konum iznine ihtiyacımız var.',
          [{ text: 'Tamam' }]
        );
        setLoading(false);
      }
    } catch (error) {
      console.error('İzin alınırken hata:', error);
      Alert.alert('Hata', 'İzinler alınırken bir sorun oluştu.');
      setLoading(false);
    }
  };

  // Konumu al ve yakındaki mekanları getir
  const getCurrentLocationAndVenues = async () => {
    try {
      setLoading(true);

      // Mevcut konumu al
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userLocation = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };

      setLocation(userLocation);

      // Yakındaki mekanları getir
      await fetchNearbyVenues(userLocation);

    } catch (error) {
      console.error('Konum alınırken hata:', error);
      Alert.alert('Hata', 'Konum bilgisi alınamadı. Lütfen konum servislerinizin açık olduğundan emin olun.');
    } finally {
      setLoading(false);
    }
  };

  // Yakındaki mekanları getir ve mesafeye göre sırala
  const fetchNearbyVenues = async (userLocation) => {
    try {
      const unifiedService = UnifiedPlacesService;

      // Yakındaki mekanları mesafeye göre sıralı getir
      const venues = await unifiedService.getNearbyVenuesSortedByDistance(
        userLocation,
        5000 // 5km yarıçap
      );

      if (venues && venues.length > 0) {
        setNearbyVenues(venues);
      } else {
        Alert.alert('Bilgi', 'Yakınınızda mekan bulunamadı.');
        setNearbyVenues([]);
      }
    } catch (error) {
      console.error('Mekanlar getirilirken hata:', error);
      Alert.alert('Hata', 'Yakındaki mekanlar alınamadı.');
      setNearbyVenues([]);
    }
  };

  // Mesafeyi formatla
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  // Kamera ikonuna tıklandığında fotoğraf modal'ını aç
  const handleCameraPress = (venue) => {
    console.log('📷 Kamera butonuna tıklandı:', venue.name);
    setSelectedVenue(venue);
    setCapturedPhoto(null);
    setPhotoModalVisible(true);
    console.log('📷 Modal açılmalı, photoModalVisible:', true);
  };

  // Kamera ile çek
  const takePhoto = async () => {
    try {
      // Kamera izni al
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Kamera İzni Gerekli', 'Fotoğraf çekebilmek için kamera iznine ihtiyacımız var.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCapturedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Fotoğraf çekerken hata:', error);
      Alert.alert('Hata', 'Fotoğraf çekilemedi.');
    }
  };

  // Galeriden seç
  const pickFromGallery = async () => {
    try {
      // Medya kütüphanesi izni al
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Galeri İzni Gerekli', 'Galeriden fotoğraf seçebilmek için izin gerekli.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCapturedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Fotoğraf seçerken hata:', error);
      Alert.alert('Hata', 'Fotoğraf seçilemedi.');
    }
  };

  // Fotoğrafı paylaş
  const sharePhotoWithVenue = () => {
    if (!capturedPhoto) {
      Alert.alert('Fotoğraf Yok', 'Lütfen önce fotoğraf ekleyin.');
      return;
    }

    Alert.alert(
      'Başarılı!',
      `${selectedVenue.name} için fotoğraf eklendi ve paylaşıldı!`,
      [
        {
          text: 'Tamam',
          onPress: () => {
            setPhotoModalVisible(false);
            setCapturedPhoto(null);
            setSelectedVenue(null);
          },
        },
      ]
    );
  };

  // Yenile
  const handleRefresh = async () => {
    if (location) {
      await fetchNearbyVenues(location);
    } else {
      await getCurrentLocationAndVenues();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Yakındaki mekanlar aranıyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Canlı Durum</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshIcon}>↻</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Yakındaki Mekanlar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Yakındaki Mekanlar ({nearbyVenues.length})
            </Text>
            <Text style={styles.sectionSubtitle}>
              En yakından en uzağa sıralanmıştır
            </Text>

            {nearbyVenues.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>Yakınınızda mekan bulunamadı</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                  <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                </TouchableOpacity>
              </View>
            ) : (
              nearbyVenues.map((venue, index) => (
                <View
                  key={venue.id || index}
                  style={styles.venueCard}
                >
                  <View style={styles.venueHeader}>
                    <View style={styles.venueInfo}>
                      <Text style={styles.venueName}>{venue.name}</Text>
                      <Text style={styles.venueCategory}>{venue.categoryLabel || venue.category}</Text>
                      {venue.address && (
                        <Text style={styles.venueAddress}>{venue.address}</Text>
                      )}
                      <Text style={styles.distanceText}>
                        📍 {formatDistance(venue.distance)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.cameraButton}
                      onPress={() => handleCameraPress(venue)}
                    >
                      <Text style={styles.cameraIcon}>📷</Text>
                    </TouchableOpacity>
                  </View>
                  {venue.rating && (
                    <Text style={styles.ratingText}>⭐ {venue.rating}/5</Text>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Fotoğraf Modal */}
        <Modal
          visible={photoModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPhotoModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedVenue?.name}
                </Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setPhotoModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {capturedPhoto ? (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: capturedPhoto }} style={styles.photoPreview} />
                  <View style={styles.photoActions}>
                    <TouchableOpacity
                      style={styles.photoActionButton}
                      onPress={() => setCapturedPhoto(null)}
                    >
                      <Text style={styles.photoActionText}>🔄 Yeniden Çek</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.photoActionButton, styles.photoActionButtonPrimary]}
                      onPress={sharePhotoWithVenue}
                    >
                      <Text style={styles.photoActionTextPrimary}>✓ Paylaş</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.photoOptions}>
                  <TouchableOpacity
                    style={styles.photoOptionButton}
                    onPress={takePhoto}
                  >
                    <Text style={styles.photoOptionIcon}>�</Text>
                    <Text style={styles.photoOptionText}>Kamera ile Çek</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.photoOptionButton}
                    onPress={pickFromGallery}
                  >
                    <Text style={styles.photoOptionIcon}>🖼️</Text>
                    <Text style={styles.photoOptionText}>Galeriden Seç</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 28,
    color: '#007AFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  venueCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  venueInfo: {
    flex: 1,
    marginRight: 12,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  venueCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 6,
  },
  venueAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cameraIcon: {
    fontSize: 28,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#666',
  },
  photoOptions: {
    padding: 20,
  },
  photoOptionButton: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  photoOptionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  photoOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  photoPreviewContainer: {
    padding: 20,
  },
  photoPreview: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  photoActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  photoActionButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  photoActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  photoActionTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
