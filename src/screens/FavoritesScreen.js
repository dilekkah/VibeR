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

const { width } = Dimensions.get('window');

const SAMPLE_FAVORITES = [
  { id: 1, name: 'Cafe Milano', category: 'Kafe', emoji: '☕', rating: 4.8, mood: '😊' },
  { id: 2, name: 'Sunset Restaurant', category: 'Restoran', emoji: '🍽️', rating: 4.6, mood: '🥰' },
  { id: 3, name: 'City Park', category: 'Park', emoji: '🌳', rating: 4.9, mood: '😌' },
  { id: 4, name: 'Art Gallery', category: 'Müze', emoji: '🎨', rating: 4.7, mood: '🤔' },
];

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState(SAMPLE_FAVORITES);
  const [activeFilter, setActiveFilter] = useState('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const filters = [
    { id: 'all', label: 'Tümü' },
    { id: 'cafe', label: 'Kafe' },
    { id: 'restaurant', label: 'Restoran' },
    { id: 'park', label: 'Park' },
  ];

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
          <Text style={styles.headerTitle}>Favorilerim</Text>
          <View style={styles.headerRight}>
            <Text style={styles.countBadge}>{favorites.length}</Text>
          </View>
        </Animated.View>

        {/* Filters */}
        <Animated.View
          style={[
            styles.filterContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  activeFilter === filter.id && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Favorites List */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {favorites.length > 0 ? (
              favorites.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.favoriteCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.favoriteIconBox}>
                    <Text style={styles.favoriteEmoji}>{item.emoji}</Text>
                  </View>
                  <View style={styles.favoriteInfo}>
                    <Text style={styles.favoriteName}>{item.name}</Text>
                    <Text style={styles.favoriteCategory}>{item.category}</Text>
                  </View>
                  <View style={styles.favoriteRight}>
                    <View style={styles.ratingBox}>
                      <Text style={styles.ratingStar}>⭐</Text>
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <Text style={styles.moodEmoji}>{item.mood}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBox}>
                  <Text style={styles.emptyIcon}>❤️</Text>
                </View>
                <Text style={styles.emptyTitle}>Henüz favorin yok</Text>
                <Text style={styles.emptySubtitle}>
                  Beğendiğin mekanları favorilere ekle
                </Text>
              </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
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
    alignItems: 'flex-end',
  },
  countBadge: {
    backgroundColor: '#1C1C1C',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },

  // Filters
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#E5E2DD',
  },
  filterChipActive: {
    backgroundColor: '#1C1C1C',
    borderColor: '#1C1C1C',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C7C7C',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Favorite Card
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  favoriteIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  favoriteEmoji: {
    fontSize: 26,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  favoriteCategory: {
    fontSize: 13,
    color: '#7C7C7C',
  },
  favoriteRight: {
    alignItems: 'flex-end',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingStar: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  moodEmoji: {
    fontSize: 18,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7C7C7C',
    textAlign: 'center',
  },
});