import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function MyRatingsScreen({ navigation }) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
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

  const loadRatings = async () => {
    try {
      setLoading(true);

      // Feed posts'tan kullanıcının değerlendirmelerini çek
      const postsJson = await AsyncStorage.getItem('@feed_posts');
      const allPosts = postsJson ? JSON.parse(postsJson) : [];

      // Sadece bu kullanıcının postlarını filtrele ve dönüştür
      const userRatings = allPosts
        .filter(post => post.userId === user?.id)
        .map(post => ({
          placeName: post.place || post.venue?.name || 'Mekan',
          overallRating: post.rating || 0,
          rating: post.rating || 0,
          comment: post.note || post.comment || '',
          createdAt: post.timestamp || post.createdAt || new Date().toISOString(),
          date: post.timestamp || post.createdAt || new Date().toISOString(),
          placeType: post.placeType || post.venue?.category || '',
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRatings(userRatings);
    } catch (error) {
      console.error('Değerlendirmeler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ekrana her dönüldüğünde değerlendirmeleri yenile
  useFocusEffect(
    React.useCallback(() => {
      loadRatings();
    }, [user])
  );

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
          <Text style={styles.headerTitle}>Değerlendirmelerim</Text>
          <View style={styles.headerRight} />
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Section */}
          <Animated.View
            style={[
              styles.statsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Text style={styles.statEmoji}>⭐</Text>
              </View>
              <Text style={styles.statValue}>{ratings.length}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Text style={styles.statEmoji}>📊</Text>
              </View>
              <Text style={styles.statValue}>
                {ratings.length > 0
                  ? (
                    ratings.reduce((sum, r) => sum + (r.overallRating || r.rating || 0), 0) /
                    ratings.length
                  ).toFixed(1)
                  : '0'}
              </Text>
              <Text style={styles.statLabel}>Ortalama</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Text style={styles.statEmoji}>🏆</Text>
              </View>
              <Text style={styles.statValue}>
                {ratings.filter((r) => r.overallRating === 5).length}
              </Text>
              <Text style={styles.statLabel}>5 Yıldız</Text>
            </View>
          </Animated.View>

          {/* Ratings List */}
          <Animated.View
            style={[
              styles.ratingsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Tüm Değerlendirmeler</Text>

            {loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>⏳</Text>
                <Text style={styles.emptyText}>Yükleniyor...</Text>
              </View>
            ) : ratings.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📝</Text>
                <Text style={styles.emptyTitle}>Henüz değerlendirme yok</Text>
                <Text style={styles.emptyText}>
                  Mekanları ziyaret ettikten sonra değerlendirebilirsin
                </Text>
              </View>
            ) : (
              ratings.map((item, index) => (
                <View key={index} style={styles.ratingCard}>
                  <View style={styles.ratingHeader}>
                    <View style={styles.placeIconBox}>
                      <Text style={styles.placeEmoji}>📍</Text>
                    </View>
                    <View style={styles.placeInfo}>
                      <Text style={styles.placeName}>
                        {item.placeName || 'Mekan'}
                      </Text>
                      <Text style={styles.placeDate}>
                        {formatDate(item.createdAt || item.date)}
                      </Text>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeText}>{item.overallRating || item.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.starsText}>{renderStars(item.overallRating || item.rating)}</Text>
                  {item.comment && (
                    <Text style={styles.commentText}>"{item.comment}"</Text>
                  )}
                </View>
              ))
            )}
          </Animated.View>
        </ScrollView>
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
    paddingTop: 12,
    paddingBottom: 16,
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
  headerRight: {
    width: 44,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  statLabel: {
    fontSize: 11,
    color: '#7C7C7C',
    fontWeight: '500',
    marginTop: 2,
  },
  ratingsSection: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 16,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeEmoji: {
    fontSize: 20,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  placeDate: {
    fontSize: 12,
    color: '#7C7C7C',
    marginTop: 2,
  },
  ratingBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  starsText: {
    fontSize: 16,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#7C7C7C',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#7C7C7C',
    textAlign: 'center',
  },
});