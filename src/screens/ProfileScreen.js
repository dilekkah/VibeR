import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useTheme } from '../context/ThemeContext';

const FAVORITES_KEY = '@favorites';
const RATINGS_KEY = '@ratings';

const ProfileScreen = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [stats, setStats] = useState({
    favorites: 0,
    ratings: 0,
    visits: 0,
  });
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadStats();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
        setEditedName(user.name);
        setProfileImage(user.profileImage || null);
      }
    } catch (error) {
      console.error('Profil yüklenemedi:', error);
    }
  };

  const loadStats = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      const ratingsJson = await AsyncStorage.getItem(RATINGS_KEY);
      const userJson = await AsyncStorage.getItem('currentUser');

      const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
      const ratings = ratingsJson ? JSON.parse(ratingsJson) : [];
      const user = userJson ? JSON.parse(userJson) : null;

      const userRatings = user
        ? ratings.filter((r) => r.userId === user.id)
        : [];

      setStats({
        favorites: favorites.length,
        ratings: userRatings.length,
        visits: userRatings.length + favorites.length,
      });
    } catch (error) {
      console.error('İstatistikler yüklenemedi:', error);
    }
  };

  const handleImagePick = () => {
    Alert.alert(
      'Profil Fotoğrafı',
      'Fotoğraf nereden seçilsin?',
      [
        {
          text: 'Kamera',
          onPress: () => {
            launchCamera(
              {
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 400,
                maxWidth: 400,
              },
              (response) => {
                if (response.assets && response.assets[0]) {
                  handleImageResponse(response.assets[0].uri);
                }
              }
            );
          },
        },
        {
          text: 'Galeri',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 400,
                maxWidth: 400,
              },
              (response) => {
                if (response.assets && response.assets[0]) {
                  handleImageResponse(response.assets[0].uri);
                }
              }
            );
          },
        },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  const handleImageResponse = async (uri) => {
    setProfileImage(uri);
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        user.profileImage = uri;
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Profil fotoğrafı kaydedilemedi:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        user.name = editedName;
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        setIsEditing(false);
        Alert.alert('Başarılı', 'Profiliniz güncellendi!');
      }
    } catch (error) {
      console.error('Profil güncellenemedi:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu');
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
    header: {
      backgroundColor: theme.primary,
      paddingTop: 40,
      paddingBottom: 80,
      alignItems: 'center',
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.secondaryBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: '#fff',
    },
    profileImagePlaceholder: {
      fontSize: 48,
    },
    image: {
      width: 120,
      height: 120,
      borderRadius: 60,
    },
    editImageButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.accent,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: '#fff',
    },
    editImageIcon: {
      fontSize: 18,
    },
    nameContainer: {
      alignItems: 'center',
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 4,
    },
    nameInput: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 8,
      padding: 10,
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      minWidth: 200,
    },
    email: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
    },
    editButton: {
      marginTop: 12,
      paddingHorizontal: 20,
      paddingVertical: 8,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#fff',
    },
    editButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      marginTop: -40,
    },
    statsCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      marginHorizontal: 20,
      padding: 24,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      marginBottom: 20,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    menuSection: {
      paddingHorizontal: 20,
    },
    menuItem: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 18,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    menuIcon: {
      fontSize: 24,
      marginRight: 16,
      width: 30,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    menuArrow: {
      fontSize: 18,
      color: theme.textTertiary,
    },
    logoutButton: {
      backgroundColor: theme.error + '15',
      borderRadius: 12,
      padding: 18,
      marginTop: 20,
      marginHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.error + '30',
    },
    logoutIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.error,
    },
  });

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: theme.textSecondary }}>
            Profil bilgileri yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.image} />
              ) : (
                <Text style={styles.profileImagePlaceholder}>👤</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={handleImagePick}
            >
              <Text style={styles.editImageIcon}>📷</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nameContainer}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
              />
            ) : (
              <Text style={styles.name}>{currentUser.name}</Text>
            )}
            <Text style={styles.email}>{currentUser.email}</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? '✓ Kaydet' : '✎ Düzenle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.favorites}</Text>
                <Text style={styles.statLabel}>Favori</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.ratings}</Text>
                <Text style={styles.statLabel}>Değerlendirme</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.visits}</Text>
                <Text style={styles.statLabel}>Ziyaret</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Favorites')}
            >
              <Text style={styles.menuIcon}>❤️</Text>
              <Text style={styles.menuText}>Favorilerim</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('MyRatings')}
            >
              <Text style={styles.menuIcon}>⭐</Text>
              <Text style={styles.menuText}>Değerlendirmelerim</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Friends')}
            >
              <Text style={styles.menuIcon}>👥</Text>
              <Text style={styles.menuText}>Arkadaşlarım</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('RouteGenerator')}
            >
              <Text style={styles.menuIcon}>🗺️</Text>
              <Text style={styles.menuText}>Rota Oluştur</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
