import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import UnifiedPlacesService from '../services/UnifiedPlacesService';

export default function CreatePostScreen({ navigation }) {
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const [rating, setRating] = useState(0);
  const [location, setLocation] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [showVenuePicker, setShowVenuePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Konum izni al ve yakındaki mekanları getir
  const requestLocationPermission = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const locationResult = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const userLocation = {
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
        };

        setLocation(userLocation);
        await fetchNearbyVenues(userLocation);
      }
    } catch (error) {
      console.error('Konum alınırken hata:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Yakındaki mekanları getir
  const fetchNearbyVenues = async (userLocation) => {
    try {
      const venues = await UnifiedPlacesService.getNearbyVenuesSortedByDistance(
        userLocation,
        2000 // 2km
      );
      setNearbyVenues(venues.slice(0, 10)); // İlk 10 mekan
    } catch (error) {
      console.error('Mekanlar alınırken hata:', error);
    }
  };

  // Fotoğraf çek
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Kamera kullanmak için izin vermeniz gerekiyor.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Fotoğraf çekerken hata:', error);
      Alert.alert('Hata', 'Fotoğraf çekilemedi.');
    }
  };

  // Galeriden seç
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeriye erişim için izin vermeniz gerekiyor.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Fotoğraf seçerken hata:', error);
      Alert.alert('Hata', 'Fotoğraf seçilemedi.');
    }
  };

  // Mekan seç
  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue);
    setShowVenuePicker(false);
  };

  // Rating seç
  const handleRatingSelect = (value) => {
    setRating(value);
  };

  // Gönderiyi kaydet
  const handleCreatePost = async () => {
    if (!note.trim() && !photo && !selectedVenue) {
      Alert.alert('Eksik Bilgi', 'Lütfen en az bir not, fotoğraf veya mekan ekleyin.');
      return;
    }

    try {
      setLoading(true);

      // Yeni gönderi oluştur (FeedScreen formatında)
      const newPost = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.fullName,
        userAvatar: user.avatar || '👤',
        userEmail: user.email,
        comment: note.trim(),
        note: note.trim(),
        photo: photo,
        rating: rating,
        place: selectedVenue ? (selectedVenue.name || selectedVenue.title) : 'Bilinmeyen Yer',
        placeType: selectedVenue ? (selectedVenue.categoryLabel || selectedVenue.category || 'Mekan') : 'Mekan',
        venue: selectedVenue ? {
          name: selectedVenue.name || selectedVenue.title,
          address: selectedVenue.address,
          category: selectedVenue.categoryLabel || selectedVenue.category,
        } : null,
        location: location,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        mood: 'Harika',
        moodEmoji: '😊',
        likes: 0,
        likeCount: 0,
        comments: [],
        commentCount: 0,
      };

      // AsyncStorage'a kaydet
      const postsKey = '@feed_posts';
      const existingPostsJson = await AsyncStorage.getItem(postsKey);
      const existingPosts = existingPostsJson ? JSON.parse(existingPostsJson) : [];
      const updatedPosts = [newPost, ...existingPosts];
      await AsyncStorage.setItem(postsKey, JSON.stringify(updatedPosts));

      Alert.alert('Başarılı!', 'Gönderin paylaşıldı.', [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Gönderi oluşturulurken hata:', error);
      Alert.alert('Hata', 'Gönderi oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Gönderi</Text>
          <TouchableOpacity
            style={[styles.postButton, (!note.trim() && !photo && !selectedVenue) && styles.postButtonDisabled]}
            onPress={handleCreatePost}
            disabled={loading || (!note.trim() && !photo && !selectedVenue)}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>Paylaş</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Not Alanı */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Not</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Düşüncelerini paylaş..."
              placeholderTextColor="#999"
              multiline
              value={note}
              onChangeText={setNote}
              maxLength={500}
            />
            <Text style={styles.charCount}>{note.length}/500</Text>
          </View>

          {/* Fotoğraf Alanı */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📷 Fotoğraf</Text>
            {photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => setPhoto(null)}
                >
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                  <Text style={styles.photoButtonIcon}>📷</Text>
                  <Text style={styles.photoButtonText}>Fotoğraf Çek</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton} onPress={pickFromGallery}>
                  <Text style={styles.photoButtonIcon}>🖼️</Text>
                  <Text style={styles.photoButtonText}>Galeriden Seç</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Puan Alanı */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Puan</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={styles.starButton}
                  onPress={() => handleRatingSelect(star)}
                >
                  <Text style={[styles.star, star <= rating && styles.starFilled]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.ratingText}>
                {rating > 0 ? `${rating}/5` : 'Puan ver'}
              </Text>
            </View>
          </View>

          {/* Konum/Mekan Alanı */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Konum</Text>

            {loadingLocation ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Konum alınıyor...</Text>
              </View>
            ) : selectedVenue ? (
              <View style={styles.selectedVenue}>
                <View style={styles.venueInfo}>
                  <Text style={styles.venueName}>{selectedVenue.name || selectedVenue.title}</Text>
                  <Text style={styles.venueCategory}>{selectedVenue.categoryLabel || selectedVenue.category}</Text>
                  {selectedVenue.address && (
                    <Text style={styles.venueAddress}>{selectedVenue.address}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.changeVenueButton}
                  onPress={() => setShowVenuePicker(true)}
                >
                  <Text style={styles.changeVenueText}>Değiştir</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectVenueButton}
                onPress={() => setShowVenuePicker(true)}
                disabled={!location}
              >
                <Text style={styles.selectVenueIcon}>📍</Text>
                <Text style={styles.selectVenueText}>
                  {location ? 'Mekan Seç' : 'Konum alınıyor...'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Mekan Seçici */}
            {showVenuePicker && nearbyVenues.length > 0 && (
              <View style={styles.venuePicker}>
                <View style={styles.venuePickerHeader}>
                  <Text style={styles.venuePickerTitle}>Yakındaki Mekanlar</Text>
                  <TouchableOpacity onPress={() => setShowVenuePicker(false)}>
                    <Text style={styles.venuePickerClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.venueList} nestedScrollEnabled>
                  {nearbyVenues.map((venue, index) => (
                    <TouchableOpacity
                      key={venue.id || index}
                      style={styles.venueItem}
                      onPress={() => handleVenueSelect(venue)}
                    >
                      <Text style={styles.venueItemName}>{venue.name || venue.title}</Text>
                      <Text style={styles.venueItemCategory}>{venue.categoryLabel || venue.category}</Text>
                      {venue.distance && (
                        <Text style={styles.venueItemDistance}>
                          {venue.distance < 1
                            ? `${Math.round(venue.distance * 1000)} m`
                            : `${venue.distance.toFixed(1)} km`}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>
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
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  photoButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  photoContainer: {
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  starButton: {
    marginRight: 8,
  },
  star: {
    fontSize: 32,
    color: '#ddd',
  },
  starFilled: {
    color: '#FFD700',
  },
  ratingText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  selectVenueButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  selectVenueIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  selectVenueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedVenue: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  venueCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 12,
    color: '#666',
  },
  changeVenueButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  changeVenueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  venuePicker: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 300,
  },
  venuePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  venuePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  venuePickerClose: {
    fontSize: 24,
    color: '#666',
  },
  venueList: {
    maxHeight: 250,
  },
  venueItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  venueItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  venueItemCategory: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  venueItemDistance: {
    fontSize: 12,
    color: '#999',
  },
});
