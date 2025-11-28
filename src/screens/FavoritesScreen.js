import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const FAVORITES_KEY = '@favorites';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoritesJson) {
        setFavorites(JSON.parse(favoritesJson));
      }
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (item) => {
    Alert.alert(
      'Favorilerden Çıkar',
      `${item.title} favorilerden çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedFavorites = favorites.filter(
                fav => fav.title !== item.title
              );
              await AsyncStorage.setItem(
                FAVORITES_KEY,
                JSON.stringify(updatedFavorites)
              );
              setFavorites(updatedFavorites);
            } catch (error) {
              console.error('Favori çıkarılamadı:', error);
              Alert.alert('Hata', 'Favori çıkarılırken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleOpenLink = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error('Link açılamadı:', err)
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    header: {
      backgroundColor: theme.cardBackground,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    listContent: {
      padding: 15,
      paddingBottom: 30,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 15,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardContent: {
      marginBottom: 12,
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
      color: theme.text,
      marginBottom: 4,
    },
    category: {
      fontSize: 14,
      color: theme.textTertiary,
      textTransform: 'capitalize',
    },
    ratingButton: {
      padding: 8,
      marginLeft: 8,
    },
    ratingIcon: {
      fontSize: 24,
    },
    description: {
      fontSize: 15,
      color: theme.textSecondary,
      lineHeight: 22,
      marginBottom: 12,
    },
    detailsContainer: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    detail: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 6,
      lineHeight: 20,
    },
    linkContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    linkText: {
      fontSize: 14,
      color: theme.accent,
      fontWeight: '600',
    },
    removeButton: {
      backgroundColor: theme.error + '15',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.error + '30',
    },
    removeButtonText: {
      color: theme.error,
      fontSize: 14,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      color: theme.textSecondary,
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.textTertiary,
      textAlign: 'center',
      marginBottom: 24,
    },
    exploreButton: {
      backgroundColor: theme.accent,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    exploreButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  const renderFavorite = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handleOpenLink(item.link)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.categoryIcon}>{item.icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.category}>{item.categoryLabel}</Text>
          </View>

          <TouchableOpacity
            style={styles.ratingButton}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('Rating', { place: item });
            }}
          >
            <Text style={styles.ratingIcon}>⭐</Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.linkText}>📍 Google Maps'te Aç →</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item)}
      >
        <Text style={styles.removeButtonText}>🗑️ Çıkar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Favoriler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>❤️ Favorilerim</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} favori mekan
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        renderItem={renderFavorite}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💔</Text>
            <Text style={styles.emptyText}>Henüz favori eklemediniz</Text>
            <Text style={styles.emptySubtext}>
              Öneriler sayfasından beğendiğiniz mekanları favorilere ekleyin
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.exploreButtonText}>Keşfet ✨</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default FavoritesScreen;
