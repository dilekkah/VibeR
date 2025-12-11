import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import DatabaseService from '../services/DatabaseService';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function FeedScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Postları ve kullanıcıları yükle
  const loadFeed = async () => {
    try {
      setLoading(true);

      // AsyncStorage'dan kullanıcı postlarını getir
      const storedPostsJson = await AsyncStorage.getItem('@feed_posts');
      const storedPosts = storedPostsJson ? JSON.parse(storedPostsJson) : [];

      // Tüm postları getir
      const allPosts = await DatabaseService.getAllPosts();

      // Kullanıcı bilgilerini getir
      const allUsers = await DatabaseService.getAllUsers();
      const usersMap = {};
      allUsers.forEach(u => {
        usersMap[u.id] = u;
      });

      // Kullanıcı bilgisini kullanıcı postlarına ekle
      const enrichedStoredPosts = storedPosts.map(post => ({
        ...post,
        // Eğer kullanıcı bilgisi yoksa mevcut user bilgisini ekle
        userName: post.userName || user?.name || 'Kullanıcı',
        userAvatar: post.userAvatar || user?.avatar || '👤',
      }));

      // Tüm postları birleştir ve tarihe göre sırala
      const combinedPosts = [...enrichedStoredPosts, ...allPosts].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setUsers(usersMap);
      setPosts(combinedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Feed yüklenemedi:', error);
      setLoading(false);
    }
  };

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

  // Ekrana her dönüldüğünde postları yenile
  useFocusEffect(
    React.useCallback(() => {
      loadFeed();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const toggleLike = async (postId) => {
    if (!user) return;

    // Optimistic update
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }

    // Database güncelle
    await DatabaseService.toggleLikePost(postId, user.id);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Text key={i} style={styles.starFull}>★</Text>);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Text key={i} style={styles.starHalf}>★</Text>);
      } else {
        stars.push(<Text key={i} style={styles.starEmpty}>★</Text>);
      }
    }
    return stars;
  };

  const renderPost = (post, index) => {
    const isLiked = likedPosts.includes(post.id);
    // Kullanıcı bilgisini users'dan al veya post'un kendi bilgisini kullan
    const postUser = users[post.userId] || {
      fullName: post.userName || 'Kullanıcı',
      avatar: post.userAvatar || '👤',
    };

    if (!postUser) return null;

    // Zaman farkını hesapla
    const getTimeAgo = (dateString) => {
      const now = new Date();
      const postDate = new Date(dateString);
      const diffMs = now - postDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins} dakika önce`;
      if (diffHours < 24) return `${diffHours} saat önce`;
      return `${diffDays} gün önce`;
    };

    return (
      <Animated.View
        key={post.id}
        style={[
          styles.postCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarEmoji}>{postUser.avatar || '👤'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{postUser.fullName}</Text>
              <Text style={styles.postTime}>{getTimeAgo(post.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.moodBadge}>
            <Text style={styles.moodEmoji}>{post.moodEmoji}</Text>
            <Text style={styles.moodText}>{post.mood}</Text>
          </View>
        </View>

        {/* Place Info */}
        <TouchableOpacity style={styles.placeInfo}>
          <View style={styles.placeIcon}>
            <Text style={styles.placeIconText}>📍</Text>
          </View>
          <View style={styles.placeDetails}>
            <Text style={styles.placeName}>{post.place}</Text>
            <View style={styles.placeRow}>
              <Text style={styles.placeType}>{post.placeType}</Text>
              <View style={styles.ratingRow}>
                {renderStars(post.rating)}
              </View>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Photo */}
        {post.photo && (
          <Image
            source={{ uri: post.photo }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        {/* Comment */}
        <Text style={styles.comment}>{post.comment}</Text>

        {/* Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(post.id)}
          >
            <Text style={[styles.actionIcon, isLiked && styles.actionIconActive]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
              {(post.likes?.length || 0) + (isLiked ? 1 : 0)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Yorum</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Paylaş</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Keşfet</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => navigation.navigate('CreatePost')}
            >
              <Text style={styles.createPostIcon}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}>
            <Text style={[styles.filterTabText, styles.filterTabTextActive]}>Tümü</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterTabText}>Takip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterTabText}>Yakın</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterTabText}>Popüler</Text>
          </TouchableOpacity>
        </View>

        {/* Posts */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1C1C1C"
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1C1C1C" />
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>Henüz gönderi yok</Text>
              <Text style={styles.emptyText}>İlk gönderiyi paylaşan sen ol!</Text>
            </View>
          ) : (
            posts.map((post, index) => renderPost(post, index))
          )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
  },
  createPostButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#5E17EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#5E17EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createPostIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerButton: {
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
  headerButtonIcon: {
    fontSize: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  filterTabActive: {
    backgroundColor: '#1C1C1C',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C7C7C',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  postTime: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  moodEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5F2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeIconText: {
    fontSize: 18,
  },
  placeDetails: {
    flex: 1,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeType: {
    fontSize: 12,
    color: '#7C7C7C',
    marginRight: 10,
  },
  ratingRow: {
    flexDirection: 'row',
  },
  starFull: {
    fontSize: 12,
    color: '#FFB800',
  },
  starHalf: {
    fontSize: 12,
    color: '#FFB800',
    opacity: 0.5,
  },
  starEmpty: {
    fontSize: 12,
    color: '#E5E2DD',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#A0A0A0',
  },
  postImage: {
    width: '100%',
    height: 280,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
  },
  comment: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 22,
    marginBottom: 14,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0EEEB',
    paddingTop: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  actionIconActive: {
    color: '#EF4444',
  },
  actionText: {
    fontSize: 13,
    color: '#7C7C7C',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7C7C7C',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
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