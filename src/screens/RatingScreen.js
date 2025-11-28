import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const RATINGS_KEY = '@ratings';

const RatingScreen = ({ route, navigation }) => {
  const { place } = route?.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({
    atmosphere: 0,
    service: 0,
    cleanliness: 0,
    price: 0,
  });
  const [allRatings, setAllRatings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadUser();
      loadRatings();
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

  const loadRatings = async () => {
    try {
      const ratingsJson = await AsyncStorage.getItem(RATINGS_KEY);
      if (ratingsJson) {
        const ratings = JSON.parse(ratingsJson);
        if (place) {
          setAllRatings(ratings.filter(r => r.placeTitle === place.title));
        } else {
          setAllRatings(ratings);
        }
      }
    } catch (error) {
      console.error('Değerlendirmeler yüklenemedi:', error);
    }
  };

  const handleStarPress = (value) => {
    setRating(value);
  };

  const handleCategoryRating = (category, value) => {
    setCategories({ ...categories, [category]: value });
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      Alert.alert('Hata', 'Değerlendirme yapmak için giriş yapmalısınız', [
        { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') },
        { text: 'İptal', style: 'cancel' },
      ]);
      return;
    }

    if (rating === 0) {
      Alert.alert('Hata', 'Lütfen bir puan verin');
      return;
    }

    setLoading(true);

    try {
      const newRating = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        placeTitle: place?.title || 'Genel Değerlendirme',
        rating,
        categories,
        comment,
        createdAt: new Date().toISOString(),
      };

      const ratingsJson = await AsyncStorage.getItem(RATINGS_KEY);
      const ratings = ratingsJson ? JSON.parse(ratingsJson) : [];
      ratings.push(newRating);
      await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));

      Alert.alert('Başarılı', 'Değerlendirmeniz kaydedildi!', [
        {
          text: 'Tamam',
          onPress: () => {
            setRating(0);
            setComment('');
            setCategories({
              atmosphere: 0,
              service: 0,
              cleanliness: 0,
              price: 0,
            });
            loadRatings();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Değerlendirme kaydedilemedi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, onPress, size = 40) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onPress(star)}>
            <Text style={[styles.star, { fontSize: size }]}>
              {star <= value ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const calculateAverageRating = () => {
    if (allRatings.length === 0) return 0;
    const sum = allRatings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / allRatings.length).toFixed(1);
  };

  const calculateCategoryAverage = (category) => {
    if (allRatings.length === 0) return 0;
    const sum = allRatings.reduce((acc, r) => acc + (r.categories[category] || 0), 0);
    return (sum / allRatings.length).toFixed(1);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    statsCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    statsContent: {
      alignItems: 'center',
      marginBottom: 20,
    },
    averageRating: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    averageNumber: {
      fontSize: 48,
      fontWeight: 'bold',
      color: theme.text,
      marginRight: 8,
    },
    averageStar: {
      fontSize: 40,
    },
    totalRatings: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    categoryAverages: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    categoryAvgItem: {
      width: '48%',
      backgroundColor: theme.secondaryBackground,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    categoryAvgLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    categoryAvgValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    formCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    formTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    star: {
      fontSize: 40,
    },
    categoryRatingItem: {
      marginBottom: 16,
    },
    categoryRatingLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    commentInput: {
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      padding: 16,
      fontSize: 15,
      minHeight: 100,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
    },
    submitButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    submitButtonDisabled: {
      backgroundColor: theme.disabled,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    allRatingsSection: {
      marginBottom: 20,
    },
    allRatingsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 16,
    },
    ratingCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    ratingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    ratingUserName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    ratingDate: {
      fontSize: 12,
      color: theme.textTertiary,
    },
    ratingStars: {
      flexDirection: 'row',
    },
    ratingComment: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    categoryRatings: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
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
  });

  const renderRatingItem = ({ item }) => (
    <View style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View>
          <Text style={styles.ratingUserName}>{item.userName}</Text>
          <Text style={styles.ratingDate}>
            {new Date(item.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <View style={styles.ratingStars}>
          {renderStars(item.rating, () => {}, 20)}
        </View>
      </View>
      {item.comment ? (
        <Text style={styles.ratingComment}>{item.comment}</Text>
      ) : null}
      {(item.categories.atmosphere > 0 ||
        item.categories.service > 0 ||
        item.categories.cleanliness > 0 ||
        item.categories.price > 0) && (
        <View style={styles.categoryRatings}>
          {item.categories.atmosphere > 0 && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Atmosfer</Text>
              <Text style={styles.categoryValue}>
                {item.categories.atmosphere} ⭐
              </Text>
            </View>
          )}
          {item.categories.service > 0 && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Hizmet</Text>
              <Text style={styles.categoryValue}>
                {item.categories.service} ⭐
              </Text>
            </View>
          )}
          {item.categories.cleanliness > 0 && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Temizlik</Text>
              <Text style={styles.categoryValue}>
                {item.categories.cleanliness} ⭐
              </Text>
            </View>
          )}
          {item.categories.price > 0 && (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Fiyat</Text>
              <Text style={styles.categoryValue}>
                {item.categories.price} ⭐
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {allRatings.length > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Genel Değerlendirme</Text>
            <View style={styles.statsContent}>
              <View style={styles.averageRating}>
                <Text style={styles.averageNumber}>
                  {calculateAverageRating()}
                </Text>
                <Text style={styles.averageStar}>⭐</Text>
              </View>
              <Text style={styles.totalRatings}>
                {allRatings.length} değerlendirme
              </Text>
            </View>

            <View style={styles.categoryAverages}>
              <View style={styles.categoryAvgItem}>
                <Text style={styles.categoryAvgLabel}>Atmosfer</Text>
                <Text style={styles.categoryAvgValue}>
                  {calculateCategoryAverage('atmosphere')} ⭐
                </Text>
              </View>
              <View style={styles.categoryAvgItem}>
                <Text style={styles.categoryAvgLabel}>Hizmet</Text>
                <Text style={styles.categoryAvgValue}>
                  {calculateCategoryAverage('service')} ⭐
                </Text>
              </View>
              <View style={styles.categoryAvgItem}>
                <Text style={styles.categoryAvgLabel}>Temizlik</Text>
                <Text style={styles.categoryAvgValue}>
                  {calculateCategoryAverage('cleanliness')} ⭐
                </Text>
              </View>
              <View style={styles.categoryAvgItem}>
                <Text style={styles.categoryAvgLabel}>Fiyat</Text>
                <Text style={styles.categoryAvgValue}>
                  {calculateCategoryAverage('price')} ⭐
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {place ? `${place.title} için değerlendirme` : 'Değerlendirme Yap'}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genel Puan</Text>
            {renderStars(rating, handleStarPress)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detaylı Değerlendirme</Text>

            <View style={styles.categoryRatingItem}>
              <Text style={styles.categoryRatingLabel}>Atmosfer</Text>
              {renderStars(
                categories.atmosphere,
                (value) => handleCategoryRating('atmosphere', value),
                30
              )}
            </View>

            <View style={styles.categoryRatingItem}>
              <Text style={styles.categoryRatingLabel}>Hizmet</Text>
              {renderStars(
                categories.service,
                (value) => handleCategoryRating('service', value),
                30
              )}
            </View>

            <View style={styles.categoryRatingItem}>
              <Text style={styles.categoryRatingLabel}>Temizlik</Text>
              {renderStars(
                categories.cleanliness,
                (value) => handleCategoryRating('cleanliness', value),
                30
              )}
            </View>

            <View style={styles.categoryRatingItem}>
              <Text style={styles.categoryRatingLabel}>Fiyat</Text>
              {renderStars(
                categories.price,
                (value) => handleCategoryRating('price', value),
                30
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yorumunuz (İsteğe Bağlı)</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Deneyiminizi paylaşın..."
              placeholderTextColor={theme.placeholder}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
            </Text>
          </TouchableOpacity>
        </View>

        {allRatings.length > 0 && (
          <View style={styles.allRatingsSection}>
            <Text style={styles.allRatingsTitle}>
              Tüm Değerlendirmeler ({allRatings.length})
            </Text>
            <FlatList
              data={allRatings}
              keyExtractor={(item) => item.id}
              renderItem={renderRatingItem}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RatingScreen;
