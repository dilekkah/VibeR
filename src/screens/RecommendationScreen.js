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
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalRecommendationService from '../services/LocalRecommendationService';

const { width } = Dimensions.get('window');

const CATEGORY_FILTERS = [
  { id: 'all', label: 'Tümü', emoji: '✨' },
  { id: 'food', label: 'Yemek', emoji: '🍽️' },
  { id: 'cafe', label: 'Kafe', emoji: '☕' },
  { id: 'place', label: 'Mekan', emoji: '📍' },
  { id: 'activity', label: 'Aktivite', emoji: '🎯' },
  { id: 'entertainment', label: 'Eğlence', emoji: '🎉' },
];

export default function RecommendationScreen({ route, navigation }) {
  // Route'dan gelen tüm olası parametreler
  const {
    selectedMood,
    selectedMoods,
    mood,
    moods = [],
    selectedCompanion,
    companion,
    companions = [],
    selectedNeeds,
    selectedNeed,
    need,
    needs = [],
  } = route.params || {};

  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [todaysPick, setTodaysPick] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    moods: [],
    companions: [],
    needs: [],
  });

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Gelen parametreleri birleştir
    const moodFilters = [
      ...(moods || []),
      ...(selectedMoods || []),
      selectedMood,
      mood,
    ].filter(Boolean);

    const companionFilters = [
      ...(companions || []),
      selectedCompanion,
      companion,
    ].filter(Boolean);

    const needFilters = [
      ...(needs || []),
      ...(selectedNeeds || []),
      selectedNeed,
      need,
    ].filter(Boolean);

    // Unique değerler al
    const uniqueMoods = [...new Set(moodFilters)];
    const uniqueCompanions = [...new Set(companionFilters)];
    const uniqueNeeds = [...new Set(needFilters)];

    setActiveFilters({
      moods: uniqueMoods,
      companions: uniqueCompanions,
      needs: uniqueNeeds,
    });

    console.log('Gelen Filtreler:', {
      moods: uniqueMoods,
      companions: uniqueCompanions,
      needs: uniqueNeeds,
    });

    loadRecommendations(uniqueMoods, uniqueCompanions, uniqueNeeds);

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
  }, [route.params]);

  useEffect(() => {
    filterByCategory();
  }, [selectedCategory, recommendations]);

  const loadRecommendations = (moodFilters = [], companionFilters = [], needFilters = []) => {
    setLoading(true);

    try {
      let results = [];

      console.log('Filtreler uygulanıyor:', {
        moodFilters,
        companionFilters,
        needFilters,
      });

      // Eğer herhangi bir filtre varsa akıllı öneri kullan
      if (moodFilters.length > 0 || companionFilters.length > 0 || needFilters.length > 0) {
        // Akıllı öneriler (skorlama ile)
        results = LocalRecommendationService.getSmartRecommendations({
          moods: moodFilters,
          companions: companionFilters,
          needs: needFilters,
        }, 100);

        console.log('Akıllı öneri sonuçları:', results.length);

        // Eğer akıllı öneri sonuç vermezse, sadece mood filtresi dene
        if (results.length === 0 && moodFilters.length > 0) {
          results = LocalRecommendationService.getByMoods(moodFilters);
          console.log('Sadece mood filtresi sonuçları:', results.length);
        }

        // Hala sonuç yoksa kombinasyonları gevşet
        if (results.length === 0) {
          results = LocalRecommendationService.getRecommendations({
            moods: moodFilters,
            companions: [],
            needs: [],
          });
          console.log('Gevşetilmiş filtre sonuçları:', results.length);
        }
      }

      // Hala sonuç yoksa rastgele öneriler
      if (results.length === 0) {
        results = LocalRecommendationService.getRandomRecommendations(50);
        console.log('Rastgele öneriler:', results.length);
      }

      setRecommendations(results);
      setFilteredRecommendations(results);

      // Bugünün önerisini al
      const today = LocalRecommendationService.getTodaysRecommendation();
      setTodaysPick(today);

      console.log('Toplam yüklenen öneri:', results.length);
    } catch (error) {
      console.error('Öneri yükleme hatası:', error);
      // Hata durumunda rastgele öneriler göster
      const fallback = LocalRecommendationService.getRandomRecommendations(30);
      setRecommendations(fallback);
      setFilteredRecommendations(fallback);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = () => {
    if (selectedCategory === 'all') {
      setFilteredRecommendations(recommendations);
    } else {
      const filtered = recommendations.filter(
        item => item.category === selectedCategory
      );
      setFilteredRecommendations(filtered);
    }
  };

  const handleOpenLink = (link) => {
    if (link) {
      Linking.openURL(link).catch(err =>
        console.error('Link açılamadı:', err)
      );
    } else {
      Alert.alert('Bilgi', 'Bu mekan için harita linki bulunmuyor.');
    }
  };

  const handleAddToFavorites = async (item) => {
    try {
      const favoritesJson = await AsyncStorage.getItem('@favorites');
      const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];

      // Zaten favorilerde mi kontrol et
      const exists = favorites.find(f => f.title === item.title);
      if (exists) {
        Alert.alert('Bilgi', 'Bu mekan zaten favorilerinizde!');
        return;
      }

      favorites.push({
        ...item,
        id: Date.now().toString(),
        addedAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem('@favorites', JSON.stringify(favorites));
      Alert.alert('Başarılı', 'Favorilere eklendi! ❤️');
    } catch (error) {
      console.error('Favori ekleme hatası:', error);
      Alert.alert('Hata', 'Favorilere eklenirken bir hata oluştu.');
    }
  };

  const handleRefresh = () => {
    loadRecommendations(
      activeFilters.moods,
      activeFilters.companions,
      activeFilters.needs
    );
  };

  const renderFilterBadges = () => {
    const allFilters = [
      ...activeFilters.moods.map(m => ({ type: 'mood', value: m })),
      ...activeFilters.companions.map(c => ({ type: 'companion', value: c })),
      ...activeFilters.needs.map(n => ({ type: 'need', value: n })),
    ];

    if (allFilters.length === 0) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeFiltersScroll}
        >
          {allFilters.map((filter, index) => (
            <View key={`${filter.type}-${filter.value}-${index}`} style={styles.activeFilterBadge}>
              <Text style={styles.activeFilterText}>{filter.value}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              setActiveFilters({ moods: [], companions: [], needs: [] });
              loadRecommendations([], [], []);
            }}
          >
            <Text style={styles.clearFiltersText}>✕ Temizle</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderRecommendationCard = (item, index) => (
    <Animated.View
      key={`${item.title}-${index}`}
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Skor badge (eğer varsa) */}
      {item.score && item.score > 0 && (
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>
            {Math.min(Math.round((item.score / 7) * 100), 100)}% Eşleşme
          </Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <Text style={styles.cardIcon}>{item.icon || '📍'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardCategory}>{item.categoryLabel || item.category}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleAddToFavorites(item)}
        >
          <Text style={styles.favoriteIcon}>❤️</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.cardDescription} numberOfLines={3}>
        {item.description}
      </Text>

      {/* Detaylar */}
      {item.details && item.details.length > 0 && (
        <View style={styles.detailsContainer}>
          {item.details.slice(0, 3).map((detail, idx) => (
            <Text key={idx} style={styles.detailText} numberOfLines={1}>
              {detail}
            </Text>
          ))}
        </View>
      )}

      {/* Mood etiketleri */}
      {item.moods && item.moods.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.moods.slice(0, 4).map((moodTag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{moodTag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Aksiyon butonları */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleOpenLink(item.link)}
        >
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionText}>Haritada Aç</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButtonPrimary}
          onPress={() => navigation.navigate('Rating', { place: item })}
        >
          <Text style={styles.actionIconPrimary}>⭐</Text>
          <Text style={styles.actionTextPrimary}>Değerlendir</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Öneriler</Text>
            <Text style={styles.headerSubtitle}>
              {filteredRecommendations.length} sonuç bulundu
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Aktif Filtreler */}
        {renderFilterBadges()}

        {/* Kategori Filtreleri */}
        <Animated.View
          style={[
            styles.filterContainer,
            { opacity: fadeAnim },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {CATEGORY_FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedCategory === filter.id && styles.filterChipSelected,
                ]}
                onPress={() => setSelectedCategory(filter.id)}
              >
                <Text style={styles.filterEmoji}>{filter.emoji}</Text>
                <Text
                  style={[
                    styles.filterLabel,
                    selectedCategory === filter.id && styles.filterLabelSelected,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1C1C1C" />
            <Text style={styles.loadingText}>Öneriler yükleniyor...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Bugünün Önerisi */}
            {todaysPick && selectedCategory === 'all' && activeFilters.moods.length === 0 && (
              <Animated.View
                style={[
                  styles.todaysPickCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.todaysPickHeader}>
                  <Text style={styles.todaysPickBadge}>⭐ Günün Önerisi</Text>
                </View>
                <View style={styles.todaysPickContent}>
                  <Text style={styles.todaysPickIcon}>{todaysPick.icon || '🎯'}</Text>
                  <View style={styles.todaysPickInfo}>
                    <Text style={styles.todaysPickTitle}>{todaysPick.title}</Text>
                    <Text style={styles.todaysPickDesc} numberOfLines={2}>
                      {todaysPick.description}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.todaysPickButton}
                  onPress={() => handleOpenLink(todaysPick.link)}
                >
                  <Text style={styles.todaysPickButtonText}>Haritada Aç</Text>
                  <Text style={styles.todaysPickButtonIcon}>→</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Öneri Listesi */}
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((item, index) =>
                renderRecommendationCard(item, index)
              )
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Sonuç Bulunamadı</Text>
                <Text style={styles.emptyText}>
                  Bu kriterlere uygun öneri bulunamadı. Filtreleri değiştirmeyi deneyin.
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => {
                    setSelectedCategory('all');
                    setActiveFilters({ moods: [], companions: [], needs: [] });
                    loadRecommendations([], [], []);
                  }}
                >
                  <Text style={styles.emptyButtonText}>Tüm Önerileri Gör</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7C7C7C',
    marginTop: 2,
  },
  refreshButton: {
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
  refreshIcon: {
    fontSize: 20,
  },
  // Aktif Filtreler
  activeFiltersContainer: {
    paddingBottom: 8,
  },
  activeFiltersScroll: {
    paddingHorizontal: 20,
  },
  activeFilterBadge: {
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clearFiltersButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Kategori Filtreleri
  filterContainer: {
    paddingBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  filterChipSelected: {
    backgroundColor: '#1C1C1C',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C7C7C',
  },
  filterLabelSelected: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#7C7C7C',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  // Bugünün Önerisi
  todaysPickCard: {
    backgroundColor: '#1C1C1C',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  todaysPickHeader: {
    marginBottom: 14,
  },
  todaysPickBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFB800',
    letterSpacing: 0.5,
  },
  todaysPickContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  todaysPickIcon: {
    fontSize: 40,
    marginRight: 14,
  },
  todaysPickInfo: {
    flex: 1,
  },
  todaysPickTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  todaysPickDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  todaysPickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
  },
  todaysPickButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  todaysPickButtonIcon: {
    fontSize: 16,
    color: '#1C1C1C',
    marginLeft: 6,
  },
  // Öneri Kartları
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  scoreBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 26,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 2,
    paddingRight: 60,
  },
  cardCategory: {
    fontSize: 12,
    color: '#7C7C7C',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 18,
  },
  cardDescription: {
    fontSize: 14,
    color: '#5C5C5C',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsContainer: {
    backgroundColor: '#F7F5F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#5C5C5C',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  tag: {
    backgroundColor: '#F0EEEB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#7C7C7C',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F5F2',
    borderRadius: 12,
    paddingVertical: 12,
    marginRight: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    paddingVertical: 12,
    marginLeft: 8,
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  actionIconPrimary: {
    fontSize: 14,
    marginRight: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  actionTextPrimary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Boş Durum
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#7C7C7C',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#1C1C1C',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});