import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LocalRecommendationService from '../services/LocalRecommendationService';

const FAVORITES_KEY = '@favorites';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [searchVisible, setSearchVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { isDarkMode, toggleTheme } = useTheme();

  // LocalRecommendationService'den veriler
  const [todaysPick, setTodaysPick] = useState(null);
  const [quickPicks, setQuickPicks] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      loadFavoritesCount();
      loadRecommendations();
    }, [])
  );

  const loadFavoritesCount = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoritesJson) {
        const favorites = JSON.parse(favoritesJson);
        setFavoritesCount(favorites.length);
      } else {
        setFavoritesCount(0);
      }
    } catch (error) {
      console.error('Favoriler sayısı yüklenemedi:', error);
    }
  };

  // LocalRecommendationService'den önerileri yükle
  const loadRecommendations = () => {
    try {
      // Bugünün önerisi
      const today = LocalRecommendationService.getTodaysRecommendation();
      setTodaysPick(today);

      // Rastgele 5 hızlı öneri
      const picks = LocalRecommendationService.getRandomRecommendations(5);
      setQuickPicks(picks);

      // Kategori istatistikleri
      const stats = LocalRecommendationService.getCategoryStats();
      setCategoryStats(stats);
    } catch (error) {
      console.error('Öneri yükleme hatası:', error);
    }
  };

  // Arama fonksiyonu
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const results = LocalRecommendationService.search(query);
      setSearchResults(results.slice(0, 10)); // İlk 10 sonuç
    } else {
      setSearchResults([]);
    }
  };

  // Arama sonucuna tıklama
  const handleSearchResultPress = (item) => {
    setSearchVisible(false);
    setSearchQuery('');
    setSearchResults([]);
    navigation.navigate('Recommendation', {
      moods: item.moods || [],
      companions: item.companions || [],
      needs: item.needs || [],
    });
  };

  // Popüler arama etiketine tıklama
  const handlePopularSearchPress = (tag) => {
    const results = LocalRecommendationService.search(tag);
    if (results.length > 0) {
      setSearchVisible(false);
      navigation.navigate('Recommendation', {
        moods: results[0].moods || [],
      });
    }
  };

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          try {
            // AuthContext'teki logout fonksiyonunu kullan
            // Gerekirse navigation.replace buradan kaldırılabilir
            navigation.replace('Welcome');
          } catch (error) {
            console.error('Çıkış hatası:', error);
          }
        },
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#0f0f0f' : '#fff',
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    menuButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
    },
    menuIcon: {
      fontSize: 24,
      color: isDarkMode ? '#fff' : '#000',
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
    },
    discoveringText: {
      fontSize: 12,
      color: '#ef4444',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 2,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    locationText: {
      fontSize: 20,
      fontWeight: '700',
      color: isDarkMode ? '#fff' : '#000',
    },
    searchButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchIcon: {
      fontSize: 24,
      color: isDarkMode ? '#fff' : '#000',
    },
    profileButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2C2C2C' : '#F0F0F0',
      borderRadius: 20,
    },
    profileIcon: {
      fontSize: 20,
    },
    scrollContent: {
      paddingBottom: 100,
    },

    // Bugünün Önerisi Section
    todaysPickSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    todaysPickCard: {
      backgroundColor: '#1C1C1C',
      borderRadius: 24,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    todaysPickHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    todaysPickBadge: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFB800',
      letterSpacing: 0.5,
    },
    todaysPickDate: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.5)',
    },
    todaysPickContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    todaysPickIconBox: {
      width: 60,
      height: 60,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    todaysPickIcon: {
      fontSize: 32,
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
    todaysPickCategory: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.6)',
    },
    todaysPickDesc: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
      lineHeight: 20,
      marginBottom: 16,
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

    // Quick Picks Section
    quickPicksSection: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDarkMode ? '#fff' : '#000',
    },
    viewAllButton: {
      paddingVertical: 4,
    },
    viewAllText: {
      fontSize: 14,
      color: '#ef4444',
      fontWeight: '600',
    },
    quickPicksScroll: {
      paddingLeft: 20,
    },
    quickPickCard: {
      width: 160,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 16,
      padding: 16,
      marginRight: 12,
    },
    quickPickIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    quickPickIcon: {
      fontSize: 22,
    },
    quickPickTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 4,
    },
    quickPickCategory: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
    },

    section: {
      marginBottom: 32,
    },
    placesScroll: {
      paddingLeft: 20,
    },
    placeCard: {
      width: 300,
      height: 420,
      borderRadius: 24,
      marginRight: 16,
      overflow: 'hidden',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      position: 'relative',
    },
    placeImage: {
      width: '100%',
      height: '100%',
      justifyContent: 'space-between',
      padding: 20,
      position: 'relative',
    },
    decorativeCircle: {
      position: 'absolute',
      borderRadius: 9999,
      opacity: 0.1,
    },
    decorativeCircle1: {
      width: 200,
      height: 200,
      top: -100,
      right: -50,
      backgroundColor: '#fff',
    },
    decorativeCircle2: {
      width: 150,
      height: 150,
      bottom: -75,
      left: -50,
      backgroundColor: '#fff',
    },
    decorativePattern: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0.05,
    },
    patternDot: {
      position: 'absolute',
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#fff',
    },
    saveButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255,255,255,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-end',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.5)',
    },
    saveIcon: {
      fontSize: 20,
    },
    placeContent: {
      gap: 16,
    },
    placeName: {
      fontSize: 28,
      fontWeight: '700',
      color: '#fff',
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    placeAuthor: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    authorAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#ef4444',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    authorName: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '500',
    },
    placeDescription: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 18,
    },
    placeTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
    },
    tagText: {
      fontSize: 12,
      color: '#fff',
      fontWeight: '500',
    },
    placeRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    ratingText: {
      fontSize: 13,
      color: '#fff',
      fontWeight: '600',
    },

    // Stats Section
    statsSection: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      width: '47%',
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
    },
    statEmoji: {
      fontSize: 28,
      marginBottom: 8,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
    },

    moodsSection: {
      paddingHorizontal: 20,
    },
    moodsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    moodCard: {
      width: 80,
      alignItems: 'center',
      gap: 8,
    },
    moodIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    moodEmoji: {
      fontSize: 32,
    },
    moodLabel: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
      fontWeight: '500',
      textAlign: 'center',
    },
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#0f0f0f' : '#fff',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
      justifyContent: 'space-around',
    },
    navItem: {
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
    },
    navIcon: {
      fontSize: 24,
    },
    navLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: isDarkMode ? '#666' : '#999',
    },
    navLabelActive: {
      color: '#ef4444',
    },
    searchOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDarkMode ? '#0f0f0f' : '#fff',
      zIndex: 100,
    },
    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      gap: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
    },
    searchTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      flex: 1,
    },
    searchInputContainer: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    searchInput: {
      height: 50,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 25,
      paddingHorizontal: 20,
      fontSize: 15,
      color: isDarkMode ? '#fff' : '#000',
    },
    searchContent: {
      paddingHorizontal: 20,
      flex: 1,
    },
    searchSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 16,
    },
    popularSearches: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 32,
    },
    searchTag: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    },
    searchTagText: {
      fontSize: 14,
      color: isDarkMode ? '#fff' : '#000',
      fontWeight: '500',
    },
    searchResultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
    },
    searchResultIcon: {
      fontSize: 24,
      marginRight: 14,
    },
    searchResultInfo: {
      flex: 1,
    },
    searchResultTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 2,
    },
    searchResultCategory: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
    },
    searchResultArrow: {
      fontSize: 18,
      color: isDarkMode ? '#666' : '#999',
    },
    recentSearchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
    },
    recentSearchText: {
      fontSize: 15,
      color: isDarkMode ? '#fff' : '#000',
      fontWeight: '500',
    },
    deleteIcon: {
      fontSize: 20,
      color: isDarkMode ? '#666' : '#999',
    },
    menuOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 200,
    },
    menuContainer: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '80%',
      backgroundColor: isDarkMode ? '#0f0f0f' : '#fff',
      zIndex: 201,
      paddingTop: 60,
    },
    menuHeader: {
      paddingHorizontal: 24,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
    },
    menuUserAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#ef4444',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    menuAvatarText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: '700',
    },
    menuUserName: {
      fontSize: 20,
      fontWeight: '700',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 4,
    },
    menuUserEmail: {
      fontSize: 14,
      color: isDarkMode ? '#999' : '#666',
    },
    menuItems: {
      paddingTop: 16,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      gap: 16,
    },
    menuItemIcon: {
      fontSize: 22,
      width: 32,
    },
    menuItemText: {
      fontSize: 16,
      fontWeight: '500',
      color: isDarkMode ? '#fff' : '#000',
    },
    menuItemLogout: {
      color: '#ef4444',
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
  });

  // Menu Overlay
  if (menuVisible) {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
        <SafeAreaView style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <View style={styles.menuUserAvatar}>
              <Text style={styles.menuAvatarText}>
                {user ? user.fullName.charAt(0).toUpperCase() : 'M'}
              </Text>
            </View>
            <Text style={styles.menuUserName}>
              {user ? user.fullName : 'Kullanıcı'}
            </Text>
            <Text style={styles.menuUserEmail}>
              {user ? user.email : 'email@example.com'}
            </Text>
          </View>

          <ScrollView style={styles.menuItems}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Favorites');
              }}
            >
              <Text style={styles.menuItemIcon}>❤️</Text>
              <Text style={styles.menuItemText}>Favorilerim</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('MoodSelection');
              }}
            >
              <Text style={styles.menuItemIcon}>📍</Text>
              <Text style={styles.menuItemText}>Mekanları Keşfet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Friends');
              }}
            >
              <Text style={styles.menuItemIcon}>👥</Text>
              <Text style={styles.menuItemText}>Arkadaşlarım</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('LiveStatus');
              }}
            >
              <Text style={styles.menuItemIcon}>📸</Text>
              <Text style={styles.menuItemText}>Canlı Durum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('RouteGenerator');
              }}
            >
              <Text style={styles.menuItemIcon}>🗺️</Text>
              <Text style={styles.menuItemText}>Rota Oluştur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('MyRatings');
              }}
            >
              <Text style={styles.menuItemIcon}>⭐</Text>
              <Text style={styles.menuItemText}>Değerlendirmelerim</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Text style={styles.menuItemIcon}>{isDarkMode ? '🌙' : '☀️'}</Text>
                <Text style={styles.menuItemText}>Karanlık Mod</Text>
              </View>
              <Text style={{ fontSize: 20, color: isDarkMode ? '#fff' : '#000' }}>
                {isDarkMode ? '✓' : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { marginTop: 16 }]}
              onPress={() => {
                setMenuVisible(false);
                handleLogout();
              }}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={[styles.menuItemText, styles.menuItemLogout]}>Çıkış Yap</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Search Overlay
  if (searchVisible) {
    return (
      <SafeAreaView style={styles.searchOverlay}>
        <View style={styles.searchHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSearchVisible(false);
              setSearchQuery('');
              setSearchResults([]);
            }}
          >
            <Text style={styles.searchIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.searchTitle}>Mekan Ara</Text>
        </View>

        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Mekan, kategori veya mood ara..."
            placeholderTextColor={isDarkMode ? '#666' : '#999'}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        </View>

        <ScrollView style={styles.searchContent}>
          {/* Arama Sonuçları */}
          {searchResults.length > 0 ? (
            <>
              <Text style={styles.searchSectionTitle}>
                Sonuçlar ({searchResults.length})
              </Text>
              {searchResults.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultItem}
                  onPress={() => handleSearchResultPress(item)}
                >
                  <Text style={styles.searchResultIcon}>{item.icon || '📍'}</Text>
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultTitle}>{item.title}</Text>
                    <Text style={styles.searchResultCategory}>
                      {item.categoryLabel || item.category}
                    </Text>
                  </View>
                  <Text style={styles.searchResultArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : searchQuery.length === 0 ? (
            <>
              <Text style={styles.searchSectionTitle}>Popüler Aramalar</Text>
              <View style={styles.popularSearches}>
                {['Romantik', 'Kahve', 'Brunch', 'Balık', 'Rooftop', 'Gece', 'Sakin', 'Eğlenceli'].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.searchTag}
                    onPress={() => handlePopularSearchPress(tag)}
                  >
                    <Text style={styles.searchTagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.searchSectionTitle}>Kategoriler</Text>
              <View style={styles.popularSearches}>
                {[
                  { label: 'Yemek', emoji: '🍽️' },
                  { label: 'Kafe', emoji: '☕' },
                  { label: 'Eğlence', emoji: '🎉' },
                  { label: 'Aktivite', emoji: '🎯' },
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat.label}
                    style={styles.searchTag}
                    onPress={() => handlePopularSearchPress(cat.label)}
                  >
                    <Text style={styles.searchTagText}>{cat.emoji} {cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
              <Text style={{
                fontSize: 16,
                color: isDarkMode ? '#666' : '#999',
                textAlign: 'center'
              }}>
                "{searchQuery}" için sonuç bulunamadı
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.discoveringText}>DISCOVERING</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>
                {user ? user.fullName : 'Mekanlar'}
              </Text>
              <Text style={{ fontSize: 16, color: isDarkMode ? '#fff' : '#000' }}>▼</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setSearchVisible(true)}
            >
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileIcon}>{user?.avatar || '👤'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bugünün Önerisi */}
        {todaysPick && (
          <View style={styles.todaysPickSection}>
            <View style={styles.todaysPickCard}>
              <View style={styles.todaysPickHeader}>
                <Text style={styles.todaysPickBadge}>⭐ GÜNÜN ÖNERİSİ</Text>
                <Text style={styles.todaysPickDate}>
                  {new Date().toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long'
                  })}
                </Text>
              </View>
              <View style={styles.todaysPickContent}>
                <View style={styles.todaysPickIconBox}>
                  <Text style={styles.todaysPickIcon}>{todaysPick.icon || '🎯'}</Text>
                </View>
                <View style={styles.todaysPickInfo}>
                  <Text style={styles.todaysPickTitle}>{todaysPick.title}</Text>
                  <Text style={styles.todaysPickCategory}>
                    {todaysPick.categoryLabel || todaysPick.category}
                  </Text>
                </View>
              </View>
              <Text style={styles.todaysPickDesc} numberOfLines={2}>
                {todaysPick.description}
              </Text>
              <TouchableOpacity
                style={styles.todaysPickButton}
                onPress={() => navigation.navigate('Recommendation', {
                  moods: todaysPick.moods || [],
                  companions: todaysPick.companions || [],
                  needs: todaysPick.needs || [],
                })}
              >
                <Text style={styles.todaysPickButtonText}>Keşfet</Text>
                <Text style={styles.todaysPickButtonIcon}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hızlı Öneriler */}
        {quickPicks.length > 0 && (
          <View style={styles.quickPicksSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hızlı Öneriler</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Recommendation', {})}
              >
                <Text style={styles.viewAllText}>Tümünü Gör</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPicksScroll}
            >
              {quickPicks.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickPickCard}
                  onPress={() => navigation.navigate('Recommendation', {
                    moods: item.moods || [],
                  })}
                >
                  <View style={styles.quickPickIconBox}>
                    <Text style={styles.quickPickIcon}>{item.icon || '📍'}</Text>
                  </View>
                  <Text style={styles.quickPickTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.quickPickCategory} numberOfLines={1}>
                    {item.categoryLabel || item.category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* İstatistikler */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Keşfet</Text>
          </View>
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate('Recommendation', {})}
            >
              <Text style={styles.statEmoji}>📍</Text>
              <Text style={styles.statNumber}>
                {LocalRecommendationService.getCount()}
              </Text>
              <Text style={styles.statLabel}>Toplam Mekan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => navigation.navigate('Favorites')}
            >
              <Text style={styles.statEmoji}>❤️</Text>
              <Text style={styles.statNumber}>{favoritesCount}</Text>
              <Text style={styles.statLabel}>Favori</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Explore Places Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Places</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('MoodSelection')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.placesScroll}
          >
            {/* Yeni Mekanlar Card */}
            <TouchableOpacity
              style={styles.placeCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('MoodSelection')}
            >
              <View style={[styles.placeImage, { backgroundColor: '#1a4d3c' }]}>
                <View style={[styles.decorativeCircle, styles.decorativeCircle1]} />
                <View style={[styles.decorativeCircle, styles.decorativeCircle2]} />

                <TouchableOpacity style={styles.saveButton}>
                  <Text style={styles.saveIcon}>🔖</Text>
                </TouchableOpacity>

                <View style={styles.placeContent}>
                  <Text style={styles.placeName}>Yeni Mekanlar</Text>

                  <View style={styles.placeAuthor}>
                    <View style={styles.authorAvatar}>
                      <Text style={styles.avatarText}>
                        {user ? user.fullName.charAt(0) : 'M'}
                      </Text>
                    </View>
                    <Text style={styles.authorName}>
                      {user ? user.fullName : 'Keşfet'}
                    </Text>
                  </View>

                  <Text style={styles.placeDescription}>
                    Şehrin en popüler mekanlarını keşfet. Ruh haline göre öneriler al.
                  </Text>

                  <View style={styles.placeTags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Trendy</Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Modern</Text>
                    </View>
                  </View>

                  <View style={styles.placeRating}>
                    <View style={styles.ratingBadge}>
                      <Text style={styles.ratingText}>
                        {LocalRecommendationService.getCount()}+ Mekan
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Canlı Durum Card */}
            <TouchableOpacity
              style={styles.placeCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('LiveStatus')}
            >
              <View style={[styles.placeImage, { backgroundColor: '#5d4037' }]}>
                <View style={[styles.decorativeCircle, styles.decorativeCircle1]} />
                <View style={[styles.decorativeCircle, styles.decorativeCircle2]} />

                <View style={{
                  position: 'absolute',
                  top: 30,
                  right: 30,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#4caf50',
                }} />

                <TouchableOpacity style={styles.saveButton}>
                  <Text style={styles.saveIcon}>🔖</Text>
                </TouchableOpacity>

                <View style={styles.placeContent}>
                  <Text style={styles.placeName}>Canlı Durum</Text>

                  <View style={styles.placeAuthor}>
                    <View style={styles.authorAvatar}>
                      <Text style={styles.avatarText}>📍</Text>
                    </View>
                    <Text style={styles.authorName}>Anlık Bilgiler</Text>
                  </View>

                  <Text style={styles.placeDescription}>
                    Mekanların anlık doluluk durumunu gör.
                  </Text>

                  <View style={styles.placeTags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Live</Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Real-time</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Moods Section */}
        <View style={[styles.section, styles.moodsSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Moods</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('MoodSelection')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.moodsGrid}>
            <TouchableOpacity
              style={styles.moodCard}
              onPress={() => navigation.navigate('Favorites')}
            >
              <View style={styles.moodIcon}>
                <Text style={styles.moodEmoji}>❤️</Text>
                {favoritesCount > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#ef4444',
                    borderRadius: 10,
                    minWidth: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                      {favoritesCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.moodLabel}>Favoriler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moodCard}
              onPress={() => navigation.navigate('MyRatings')}
            >
              <View style={styles.moodIcon}>
                <Text style={styles.moodEmoji}>⭐</Text>
              </View>
              <Text style={styles.moodLabel}>Değerlendir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moodCard}
              onPress={() => navigation.navigate('Friends')}
            >
              <View style={styles.moodIcon}>
                <Text style={styles.moodEmoji}>👥</Text>
              </View>
              <Text style={styles.moodLabel}>Arkadaşlar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moodCard}
              onPress={() => navigation.navigate('RouteGenerator')}
            >
              <View style={styles.moodIcon}>
                <Text style={styles.moodEmoji}>🗺️</Text>
              </View>
              <Text style={styles.moodLabel}>Rota</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, { color: '#ef4444' }]}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Feed')}
        >
          <Text style={styles.navIcon}>📄</Text>
          <Text style={styles.navLabel}>Akış</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('MoodSelection')}
        >
          <Text style={styles.navIcon}>📍</Text>
          <Text style={styles.navLabel}>Keşfet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Friends')}
        >
          <Text style={styles.navIcon}>👥</Text>
          <Text style={styles.navLabel}>Arkadaşlar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.navIcon}>🔖</Text>
          <Text style={styles.navLabel}>Kaydedilenler</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}