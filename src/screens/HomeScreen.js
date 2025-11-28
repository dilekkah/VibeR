import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const FAVORITES_KEY = '@favorites';

export default function HomeScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const { theme, isDarkMode, toggleTheme } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadUser();
      loadFavoritesCount();
    }, [])
  );

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        setCurrentUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Kullanıcı yüklenemedi:', error);
    }
  };

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

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('currentUser');
            setCurrentUser(null);
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
      backgroundColor: theme.background,
    },
    content: {
      padding: 24,
      paddingTop: 16,
    },
    userCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 40,
      paddingHorizontal: 4,
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    userActions: {
      flexDirection: 'row',
      gap: 12,
    },
    profileButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.secondaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileIcon: {
      fontSize: 20,
    },
    logoutButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.secondaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoutIcon: {
      fontSize: 20,
      color: theme.textSecondary,
    },
    loginPrompt: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.secondaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 40,
    },
    loginPromptIcon: {
      fontSize: 24,
    },
    hero: {
      alignItems: 'center',
      marginBottom: 48,
      marginTop: 20,
    },
    heroGreeting: {
      fontSize: 22,
      fontWeight: '400',
      color: theme.textTertiary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    mainActions: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 32,
    },
    primaryCard: {
      flex: 1,
      backgroundColor: isDarkMode ? theme.primary : '#1a1a1a',
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 180,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    secondaryCard: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 180,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    cardIconContainer: {
      marginBottom: 16,
    },
    cardIcon: {
      fontSize: 48,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
    cardTitleDark: {
      color: theme.text,
    },
    featureGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    miniFeature: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      aspectRatio: 1,
      borderWidth: 1,
      borderColor: theme.border,
      position: 'relative',
    },
    miniIcon: {
      fontSize: 32,
    },
    badge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: theme.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    themeToggle: {
      position: 'absolute',
      top: 16,
      right: 24,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.secondaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    themeIcon: {
      fontSize: 24,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Theme Toggle Button */}
      <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
        <Text style={styles.themeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Kullanıcı Bilgisi */}
        {currentUser ? (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.profileIcon}>👤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutIcon}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loginPrompt}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.loginPromptIcon}>👤</Text>
          </TouchableOpacity>
        )}

        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroGreeting}>Hoş Geldin</Text>
          <Text style={styles.heroTitle}>Aradığın Mekanı Bulmaya Hazır Mısın?</Text>
        </View>

        {/* Ana Aksiyonlar */}
        <View style={styles.mainActions}>
          <TouchableOpacity
            style={styles.primaryCard}
            onPress={() => navigation.navigate('MoodSelection')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>✨</Text>
            </View>
            <Text style={styles.cardTitle}>Keşfet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryCard}
            onPress={() => navigation.navigate('AmbientControl')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>📍</Text>
            </View>
            <Text style={[styles.cardTitle, styles.cardTitleDark]}>Canlı Durum</Text>
          </TouchableOpacity>
        </View>

        {/* Alt Özellikler - İkon Grid */}
        <View style={styles.featureGrid}>
          <TouchableOpacity
            style={styles.miniFeature}
            onPress={() => navigation.navigate('Favorites')}
            activeOpacity={0.7}
          >
            <Text style={styles.miniIcon}>❤️</Text>
            {favoritesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{favoritesCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniFeature}
            onPress={() => navigation.navigate('Rating')}
            activeOpacity={0.7}
          >
            <Text style={styles.miniIcon}>⭐</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniFeature}
            onPress={() => navigation.navigate('Friends')}
            activeOpacity={0.7}
          >
            <Text style={styles.miniIcon}>👥</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.miniFeature}
            onPress={() => navigation.navigate('RouteGenerator')}
            activeOpacity={0.7}
          >
            <Text style={styles.miniIcon}>🗺️</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
