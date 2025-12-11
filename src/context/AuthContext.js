import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Uygulama başladığında kayıtlı kullanıcı var mı kontrol et
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (userData) {
        setUser(JSON.parse(userData));
        console.log('✅ Kullanıcı oturumu bulundu:', JSON.parse(userData).username);
      }
    } catch (error) {
      console.error('Kullanıcı kontrol hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      // Şimdilik basit bir kontrol (ileride API ile değiştirilecek)
      const storedUsers = await AsyncStorage.getItem('@users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const foundUser = users.find(
        u => u.username === username && u.password === password
      );

      if (foundUser) {
        // Şifreyi kaldır
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        await AsyncStorage.setItem('@user', JSON.stringify(userWithoutPassword));
        console.log('✅ Giriş başarılı:', userWithoutPassword.username);
        return { success: true };
      } else {
        return { success: false, error: 'Kullanıcı adı veya şifre hatalı' };
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      return { success: false, error: 'Bir hata oluştu' };
    }
  };

  const register = async (userData) => {
    try {
      const { username, email, password, fullName } = userData;

      // Mevcut kullanıcıları al
      const storedUsers = await AsyncStorage.getItem('@users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Kullanıcı adı kontrolü
      const existingUser = users.find(u => u.username === username || u.email === email);
      if (existingUser) {
        return { success: false, error: 'Bu kullanıcı adı veya email zaten kullanılıyor' };
      }

      // Yeni kullanıcı oluştur
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password,
        fullName,
        avatar: '👤',
        bio: '',
        friends: [],
        favorites: [],
        ratings: [],
        posts: [],
        createdAt: new Date().toISOString(),
      };

      // Kullanıcıyı kaydet
      users.push(newUser);
      await AsyncStorage.setItem('@users', JSON.stringify(users));

      // Otomatik giriş yap
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      await AsyncStorage.setItem('@user', JSON.stringify(userWithoutPassword));

      console.log('✅ Kayıt başarılı:', userWithoutPassword.username);
      return { success: true };
    } catch (error) {
      console.error('Kayıt hatası:', error);
      return { success: false, error: 'Bir hata oluştu' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
      console.log('✅ Çıkış yapıldı');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));

      // Users listesini de güncelle
      const storedUsers = await AsyncStorage.getItem('@users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        await AsyncStorage.setItem('@users', JSON.stringify(users));
      }

      console.log('✅ Profil güncellendi');
      return { success: true };
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      return { success: false, error: 'Güncelleme başarısız' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
