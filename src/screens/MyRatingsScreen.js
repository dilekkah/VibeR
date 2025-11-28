import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const RATINGS_KEY = '@ratings';

const MyRatingsScreen = ({ navigation }) => {
  const [myRatings, setMyRatings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadUserAndRatings();
    }, [])
  );

  const loadUserAndRatings = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        setCurrentUser(user);

        const ratingsJson = await AsyncStorage.getItem(RATINGS_KEY);
        if (ratingsJson) {
          const allRatings = JSON.parse(ratingsJson);
          const userRatings = allRatings.filter(r => r.userId === user.id);
          setMyRatings(userRatings);
        }
      }
    } catch (error) {
      console.error('Veriler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = (ratingId) => {
    Alert.alert(
      'Değerlendirmeyi Sil',
      'Bu değerlendirmeyi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const ratingsJson = await AsyncStorage.getItem(RATINGS_KEY);
              if (ratingsJson) {
                const allRatings = JSON.parse(ratingsJson);
                const updatedRatings = allRatings.filter(r => r.id !== ratingId);
                await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(updatedRatings));
                setMyRatings(myRatings.filter(r => r.id !== ratingId));
                Alert.alert('Başarılı', 'Değerlendirme silindi');
              }
            } catch (error) {
              Alert.alert('Hata', 'Değerlendirme silinemedi');
            }
          },
        },
      ]
    );
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.star}>
            {star <= rating ? '⭐' : '☆'}
          </Text>
        ))}
      </View>
    );
  };

  const renderRating = ({ item }) => (
    <View style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View style={styles.ratingHeaderLeft}>
          <Text style={styles.placeTitle}>{item.placeTitle}</Text>
          <Text style={styles.ratingDate}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        {renderStars(item.rating)}
      </View>

      {item.comment && (
        <Text style={styles.comment}>{item.comment}</Text>
      )}

      {(item.categories.atmosphere > 0 ||
        item.categories.service > 0 ||
        item.categories.cleanliness > 0 ||
        item.categories.price > 0) && (
        <View style={styles.categoriesContainer}>
          {item.categories.atmosphere > 0 && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Atmosfer</Text>
              <Text style={styles.categoryValue}>{item.categories.atmosphere} ⭐</Text>
            </View>
          )}
          {item.categories.service > 0 && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Hizmet</Text>
              <Text style={styles.categoryValue}>{item.categories.service} ⭐</Text>
            </View>
          )}
          {item.categories.cleanliness > 0 && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Temizlik</Text>
              <Text style={styles.categoryValue}>{item.categories.cleanliness} ⭐</Text>
            </View>
          )}
          {item.categories.price > 0 && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Fiyat</Text>
              <Text style={styles.categoryValue}>{item.categories.price} ⭐</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteRating(item.id)}
      >
        <Text style={styles.deleteButtonText}>🗑️ Sil</Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
    },
    ratingCard: {
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
    ratingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    ratingHeaderLeft: {
      flex: 1,
      marginRight: 12,
    },
    placeTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    ratingDate: {
      fontSize: 13,
      color: theme.textTertiary,
    },
    starsContainer: {
      flexDirection: 'row',
    },
    star: {
      fontSize: 18,
    },
    comment: {
      fontSize: 15,
      color: theme.textSecondary,
      lineHeight: 22,
      marginBottom: 12,
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    categoryItem: {
      backgroundColor: theme.secondaryBackground,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginRight: 6,
    },
    categoryValue: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.text,
    },
    deleteButton: {
      backgroundColor: theme.error + '15',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.error + '30',
    },
    deleteButtonText: {
      color: theme.error,
      fontSize: 14,
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
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Değerlendirmeler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⭐ Değerlendirmelerim</Text>
        <Text style={styles.headerSubtitle}>
          {myRatings.length} değerlendirme
        </Text>
      </View>

      <FlatList
        data={myRatings}
        keyExtractor={(item) => item.id}
        renderItem={renderRating}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>
              Henüz değerlendirme yapmadınız
            </Text>
            <Text style={styles.emptySubtext}>
              Ziyaret ettiğiniz mekanları değerlendirin
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default MyRatingsScreen;
