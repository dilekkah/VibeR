import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const RATING_EMOJIS = [
  { value: 1, emoji: '😞', label: 'Kötü' },
  { value: 2, emoji: '😕', label: 'Fena Değil' },
  { value: 3, emoji: '😊', label: 'İyi' },
  { value: 4, emoji: '😄', label: 'Çok İyi' },
  { value: 5, emoji: '🤩', label: 'Mükemmel' },
];

const ASPECTS = [
  { key: 'atmosphere', label: 'Atmosfer', emoji: '🌟' },
  { key: 'service', label: 'Hizmet', emoji: '👨‍🍳' },
  { key: 'price', label: 'Fiyat', emoji: '💰' },
  { key: 'location', label: 'Konum', emoji: '📍' },
];

export default function RatingScreen({ route, navigation }) {
  const { place } = route.params || {};

  const [overallRating, setOverallRating] = useState(0);
  const [aspectRatings, setAspectRatings] = useState({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnims = useRef(RATING_EMOJIS.map(() => new Animated.Value(1))).current;

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

  const handleRatingPress = (value, index) => {
    setOverallRating(value);

    // Bounce animasyonu
    Animated.sequence([
      Animated.spring(scaleAnims[index], {
        toValue: 1.3,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAspectRating = (key, value) => {
    setAspectRatings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      Alert.alert('Uyarı', 'Lütfen genel bir puan verin');
      return;
    }

    setLoading(true);
    try {
      const ratingsJson = await AsyncStorage.getItem('userRatings');
      const ratings = ratingsJson ? JSON.parse(ratingsJson) : [];

      const newRating = {
        id: Date.now().toString(),
        placeId: place?.id,
        placeName: place?.name || 'Bilinmeyen Mekan',
        placeCategory: place?.category,
        overallRating,
        aspectRatings,
        comment,
        createdAt: new Date().toISOString(),
      };

      ratings.push(newRating);
      await AsyncStorage.setItem('userRatings', JSON.stringify(ratings));

      Alert.alert(
        'Teşekkürler! 🎉',
        'Değerlendirmen başarıyla kaydedildi',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Değerlendirme kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Değerlendir</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Place Card */}
          <Animated.View
            style={[
              styles.placeCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.placeIconBox}>
              <Text style={styles.placeIcon}>📍</Text>
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place?.name || 'Mekan Adı'}</Text>
              <Text style={styles.placeCategory}>{place?.category || 'Kategori'}</Text>
            </View>
          </Animated.View>

          {/* Overall Rating */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Genel Değerlendirme</Text>
            <Text style={styles.sectionSubtitle}>Bu mekanı nasıl buldun?</Text>

            <View style={styles.ratingRow}>
              {RATING_EMOJIS.map((item, index) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => handleRatingPress(item.value, index)}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.ratingItem,
                      overallRating === item.value && styles.ratingItemSelected,
                      { transform: [{ scale: scaleAnims[index] }] },
                    ]}
                  >
                    <Text style={styles.ratingEmoji}>{item.emoji}</Text>
                    <Text
                      style={[
                        styles.ratingLabel,
                        overallRating === item.value && styles.ratingLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Aspect Ratings */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Detaylı Değerlendirme</Text>
            <Text style={styles.sectionSubtitle}>Her özelliği ayrı puanla</Text>

            {ASPECTS.map((aspect) => (
              <View key={aspect.key} style={styles.aspectRow}>
                <View style={styles.aspectInfo}>
                  <Text style={styles.aspectEmoji}>{aspect.emoji}</Text>
                  <Text style={styles.aspectLabel}>{aspect.label}</Text>
                </View>
                <View style={styles.aspectStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleAspectRating(aspect.key, star)}
                    >
                      <Text
                        style={[
                          styles.star,
                          (aspectRatings[aspect.key] || 0) >= star && styles.starFilled,
                        ]}
                      >
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Comment */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Yorum</Text>
            <Text style={styles.sectionSubtitle}>Deneyimini paylaş (isteğe bağlı)</Text>

            <View
              style={[
                styles.commentWrapper,
                focusedInput && styles.commentWrapperFocused,
              ]}
            >
              <TextInput
                style={styles.commentInput}
                placeholder="Bu mekan hakkında ne düşünüyorsun?"
                placeholderTextColor="#A0A0A0"
                value={comment}
                onChangeText={setComment}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </Animated.View>
        </ScrollView>

        {/* Submit Button */}
        <Animated.View
          style={[
            styles.bottomSection,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Kaydediliyor...' : 'Değerlendirmeyi Kaydet'}
            </Text>
            {!loading && <Text style={styles.submitIcon}>✓</Text>}
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
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  placeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  placeIcon: {
    fontSize: 28,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  placeCategory: {
    fontSize: 14,
    color: '#7C7C7C',
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
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    minWidth: (width - 60) / 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  ratingItemSelected: {
    backgroundColor: '#1C1C1C',
  },
  ratingEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  ratingLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C7C7C',
  },
  ratingLabelSelected: {
    color: '#FFFFFF',
  },
  aspectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  aspectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aspectEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  aspectLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  aspectStars: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 22,
    color: '#E5E2DD',
    marginLeft: 4,
  },
  starFilled: {
    color: '#FFB800',
  },
  commentWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F0EEEB',
    minHeight: 120,
  },
  commentWrapperFocused: {
    borderColor: '#1C1C1C',
  },
  commentInput: {
    fontSize: 15,
    color: '#1C1C1C',
    lineHeight: 22,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F7F5F2',
  },
  submitButton: {
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});