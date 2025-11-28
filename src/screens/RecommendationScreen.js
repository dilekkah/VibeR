import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRecommendations, filterByCategory } from '../utils/recommendations';
import FilterButton from '../components/FilterButton';

const FAVORITES_KEY = '@favorites';

const RecommendationScreen = ({ route, navigation }) => {  // navigation eklendi
  const { moods, companions, needs } = route.params;
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoritesJson) {
        setFavorites(JSON.parse(favoritesJson));
      }
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
    }
  };

  const isFavorite = (item) => {
    return favorites.some(fav => fav.title === item.title);
  };

  const toggleFavorite = async (item) => {
    try {
      let updatedFavorites;

      if (isFavorite(item)) {
        // Favorilerden çıkar
        updatedFavorites = favorites.filter(fav => fav.title !== item.title);
        Alert.alert('Başarılı', 'Favorilerden çıkarıldı');
      } else {
        // Favorilere ekle
        updatedFavorites = [...favorites, item];
        Alert.alert('Başarılı', 'Favorilere eklendi');
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Favori işlemi başarısız:', error);
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi');
    }
  };

  const allRecommendations = getRecommendations(moods, companions, needs);

  const filters = [
    { id: 'all', label: 'Tümü', icon: '🎯' },
    { id: 'place', label: 'Mekanlar', icon: '📍' },
    { id: 'activity', label: 'Aktiviteler', icon: '🎨' },
    { id: 'food', label: 'Yemek', icon: '🍽️' },
    { id: 'entertainment', label: 'Eğlence', icon: '🎭' },
  ];

  const filteredRecommendations = filterByCategory(allRecommendations, selectedFilter);

  // Rastgele mod kontrolü
  const isRandomMode =
    (moods && moods.includes('any')) ||
    (companions && companions.includes('any')) ||
    (needs && needs.includes('any'));

  const handleOpenLink = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error('Link açılamadı:', err)
      );
    }
  };

  const getMoodEmojis = () => {
    if (moods && moods.includes('any')) {
      return '🎲';
    }
    const emojiMap = {
      happy: '😊',
      sad: '😢',
      energetic: '⚡',
      tired: '😴',
      calm: '😌',
      anxious: '😰',
      excited: '🤩',
      romantic: '💕',
      creative: '🎨',
      social: '🎉',
      adventurous: '🗺️',
      nostalgic: '🕰️',
      focused: '🎯',
      playful: '🤹',
      reflective: '🤔',
      stressed: '😫',
      intellectual: '📖',
      curious: '🧐',
      inspired: '✨',
      contemplative: '🌅',
      artistic: '🎭',
      wild: '🦁',
      festive: '🎊',
      spontaneous: '🎲',
      peaceful: '☮️',
      zen: '🍵',
      spiritual: '🕉️',
      relaxed: '🧘',
      cozy: '🏠',
      melancholic: '🌧️',
      sentimental: '💭',
      dreamy: '☁️',
      motivated: '🔥',
      confident: '💪',
      ambitious: '🚀',
      determined: '🎖️',
      overwhelmed: '🌀',
      restless: '😣',
      mysterious: '🌙',
      sophisticated: '🎩',
      bohemian: '🌻',
      vintage: '📷',
      minimalist: '⬜',
      luxurious: '💎',
      indie: '🎸',
      foodie: '🍕',
    };
    return moods.map(mood => emojiMap[mood] || '❓').join(' ');
  };

  const getCompanionEmojis = () => {
    if (companions && companions.includes('any')) {
      return '🎲';
    }
    const emojiMap = {
      alone: '👤',
      partner: '👫',
      friends: '👥',
      family: '👨‍👩‍👧‍👦',
      colleagues: '💼',
      pet: '🐕',
    };
    return companions.map(comp => emojiMap[comp] || '❓').join(' ');
  };

  const getNeedEmojis = () => {
    if (needs && needs.includes('any')) {
      return '🎲';
    }
    if (needs && needs.includes('no-filter')) {
      return '-';
    }
    const emojiMap = {
      relax: '😌',
      fun: '🎉',
      exercise: '💪',
      socialize: '🗣️',
      learn: '📚',
      create: '🎨',
      explore: '🔍',
      eat: '🍽️',
      nature: '🌳',
      culture: '🎭',
      music: '🎵',
      shop: '🛍️',
    };
    return needs.map(need => emojiMap[need] || '❓').join(' ');
  };

  const renderRecommendation = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.category}>{item.categoryLabel}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item)}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorite(item) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
              <TouchableOpacity
        style={styles.ratingButton}
        onPress={() => navigation.navigate('Rating', { place: item })}
      >
        <Text style={styles.ratingIcon}>⭐</Text>
      </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => handleOpenLink(item.link)}
        activeOpacity={0.7}
      >
        <Text style={styles.description}>{item.description}</Text>
        {item.details && item.details.length > 0 && (
          <View style={styles.detailsContainer}>
            {item.details.map((detail, index) => (
              <Text key={index} style={styles.detail}>
                {detail}
              </Text>
            ))}
          </View>
        )}
        {item.link && (
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>📍 Google Maps te Aç</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isRandomMode ? '🎲 Rastgele Öneriler' : 'Senin İçin Öneriler'}
        </Text>
        <View style={styles.selectionSummary}>
          {isRandomMode && (
            <View style={styles.randomBadge}>
              <Text style={styles.randomBadgeText}>
                🎲 Sürpriz Mod Aktif
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ruh Hali:</Text>
            <Text style={styles.summaryValue}>{getMoodEmojis()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Kim ile:</Text>
            <Text style={styles.summaryValue}>{getCompanionEmojis()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>İhtiyaç:</Text>
            <Text style={styles.summaryValue}>{getNeedEmojis()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {filters.map((filter) => (
            <FilterButton
              key={filter.id}
              label={filter.label}
              icon={filter.icon}
              isSelected={selectedFilter === filter.id}
              onPress={() => setSelectedFilter(filter.id)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredRecommendations}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={renderRecommendation}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              Bu kombinasyon için öneri bulunamadı
            </Text>
            <Text style={styles.emptySubtext}>
              Farklı filtreler deneyin
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  selectionSummary: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
  },
  randomBadge: {
    backgroundColor: '#FFC107',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  randomBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginRight: 8,
    width: 80,
  },
  summaryValue: {
    fontSize: 20,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterList: {
    paddingHorizontal: 15,
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#888',
    textTransform: 'capitalize',
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  favoriteIcon: {
    fontSize: 28,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  linkContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  ratingButton: {
  padding: 8,
  marginRight: 4,
},
ratingIcon: {
  fontSize: 24,
},
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default RecommendationScreen;
