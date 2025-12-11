import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Simple Database Service
 * AsyncStorage kullanarak basit bir database yönetimi
 */
class DatabaseService {
  // Keys
  static KEYS = {
    USERS: '@users',
    CURRENT_USER: '@user',
    POSTS: '@posts',
    FAVORITES: '@favorites',
    RATINGS: '@ratings',
    FRIENDS: '@friends',
  };

  /**
   * Tüm kullanıcıları getir
   */
  static async getAllUsers() {
    try {
      const usersJson = await AsyncStorage.getItem(this.KEYS.USERS);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Kullanıcılar getirilemedi:', error);
      return [];
    }
  }

  /**
   * Kullanıcıyı ID ile getir
   */
  static async getUserById(userId) {
    try {
      const users = await this.getAllUsers();
      return users.find(u => u.id === userId) || null;
    } catch (error) {
      console.error('Kullanıcı getirilemedi:', error);
      return null;
    }
  }

  /**
   * Kullanıcıyı username ile getir
   */
  static async getUserByUsername(username) {
    try {
      const users = await this.getAllUsers();
      return users.find(u => u.username === username) || null;
    } catch (error) {
      console.error('Kullanıcı getirilemedi:', error);
      return null;
    }
  }

  /**
   * Kullanıcı güncelle
   */
  static async updateUser(userId, updates) {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() };
        await AsyncStorage.setItem(this.KEYS.USERS, JSON.stringify(users));

        // Eğer güncel kullanıcı ise onu da güncelle
        const currentUser = await this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          await AsyncStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
        }

        return { success: true, user: users[userIndex] };
      }

      return { success: false, error: 'Kullanıcı bulunamadı' };
    } catch (error) {
      console.error('Kullanıcı güncellenemedi:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Güncel kullanıcıyı getir
   */
  static async getCurrentUser() {
    try {
      const userJson = await AsyncStorage.getItem(this.KEYS.CURRENT_USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Güncel kullanıcı getirilemedi:', error);
      return null;
    }
  }

  /**
   * Tüm postları getir
   */
  static async getAllPosts() {
    try {
      const postsJson = await AsyncStorage.getItem(this.KEYS.POSTS);
      return postsJson ? JSON.parse(postsJson) : [];
    } catch (error) {
      console.error('Postlar getirilemedi:', error);
      return [];
    }
  }

  /**
   * Kullanıcının postlarını getir
   */
  static async getUserPosts(userId) {
    try {
      const posts = await this.getAllPosts();
      return posts.filter(p => p.userId === userId);
    } catch (error) {
      console.error('Kullanıcı postları getirilemedi:', error);
      return [];
    }
  }

  /**
   * Yeni post ekle
   */
  static async createPost(postData) {
    try {
      const posts = await this.getAllPosts();
      const newPost = {
        id: Date.now().toString(),
        ...postData,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };

      posts.unshift(newPost); // En başa ekle
      await AsyncStorage.setItem(this.KEYS.POSTS, JSON.stringify(posts));

      return { success: true, post: newPost };
    } catch (error) {
      console.error('Post oluşturulamadı:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Post'u beğen/beğeniyi kaldır
   */
  static async toggleLikePost(postId, userId) {
    try {
      const posts = await this.getAllPosts();
      const postIndex = posts.findIndex(p => p.id === postId);

      if (postIndex !== -1) {
        const post = posts[postIndex];
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
          post.likes.push(userId); // Beğen
        } else {
          post.likes.splice(likeIndex, 1); // Beğeniyi kaldır
        }

        posts[postIndex] = post;
        await AsyncStorage.setItem(this.KEYS.POSTS, JSON.stringify(posts));

        return { success: true, post };
      }

      return { success: false, error: 'Post bulunamadı' };
    } catch (error) {
      console.error('Like toggle başarısız:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Favorileri getir
   */
  static async getFavorites(userId) {
    try {
      const favoritesJson = await AsyncStorage.getItem(`${this.KEYS.FAVORITES}_${userId}`);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Favoriler getirilemedi:', error);
      return [];
    }
  }

  /**
   * Favorilere ekle/çıkar
   */
  static async toggleFavorite(userId, place) {
    try {
      const favorites = await this.getFavorites(userId);
      const index = favorites.findIndex(f => f.id === place.id);

      if (index === -1) {
        favorites.push(place);
      } else {
        favorites.splice(index, 1);
      }

      await AsyncStorage.setItem(`${this.KEYS.FAVORITES}_${userId}`, JSON.stringify(favorites));
      return { success: true, favorites };
    } catch (error) {
      console.error('Favori toggle başarısız:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Kullanıcının arkadaşlarını getir
   */
  static async getFriends(userId) {
    try {
      const user = await this.getUserById(userId);
      return user?.friends || [];
    } catch (error) {
      console.error('Arkadaşlar getirilemedi:', error);
      return [];
    }
  }

  /**
   * Arkadaş ekle
   */
  static async addFriend(userId, friendId) {
    try {
      const user = await this.getUserById(userId);
      const friend = await this.getUserById(friendId);

      if (!user || !friend) {
        return { success: false, error: 'Kullanıcı bulunamadı' };
      }

      // Her iki kullanıcının da arkadaş listesine ekle
      if (!user.friends) user.friends = [];
      if (!friend.friends) friend.friends = [];

      if (!user.friends.includes(friendId)) {
        user.friends.push(friendId);
        await this.updateUser(userId, { friends: user.friends });
      }

      if (!friend.friends.includes(userId)) {
        friend.friends.push(userId);
        await this.updateUser(friendId, { friends: friend.friends });
      }

      return { success: true };
    } catch (error) {
      console.error('Arkadaş eklenemedi:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Veritabanını temizle (Development için)
   */
  static async clearDatabase() {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.USERS,
        this.KEYS.CURRENT_USER,
        this.KEYS.POSTS,
        this.KEYS.FAVORITES,
        this.KEYS.RATINGS,
        this.KEYS.FRIENDS,
      ]);
      console.log('✅ Veritabanı temizlendi');
      return { success: true };
    } catch (error) {
      console.error('Veritabanı temizlenemedi:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Veritabanı istatistikleri
   */
  static async getStats() {
    try {
      const users = await this.getAllUsers();
      const posts = await this.getAllPosts();

      return {
        totalUsers: users.length,
        totalPosts: posts.length,
        users: users.map(u => ({
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          postsCount: posts.filter(p => p.userId === u.id).length,
          friendsCount: u.friends?.length || 0,
        })),
      };
    } catch (error) {
      console.error('İstatistikler getirilemedi:', error);
      return null;
    }
  }
}

export default DatabaseService;
