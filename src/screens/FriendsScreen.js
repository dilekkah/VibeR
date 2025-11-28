import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const FRIENDS_KEY = '@friends';

const FriendsScreen = ({ navigation }) => {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadFriends();
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

  const loadFriends = async () => {
    try {
      const friendsJson = await AsyncStorage.getItem(FRIENDS_KEY);
      if (friendsJson) {
        setFriends(JSON.parse(friendsJson));
      }
    } catch (error) {
      console.error('Arkadaşlar yüklenemedi:', error);
    }
  };

  const handleAddFriend = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Hata', 'Lütfen bir kullanıcı adı girin');
      return;
    }

    const newFriend = {
      id: Date.now().toString(),
      name: searchQuery,
      status: 'online',
      mutualFriends: Math.floor(Math.random() * 20),
    };

    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(updatedFriends));
    setSearchQuery('');
    Alert.alert('Başarılı', `${searchQuery} arkadaş listenize eklendi!`);
  };

  const handleRemoveFriend = (friendId, friendName) => {
    Alert.alert(
      'Arkadaşı Çıkar',
      `${friendName} arkadaş listenizden çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: async () => {
            const updatedFriends = friends.filter(f => f.id !== friendId);
            setFriends(updatedFriends);
            await AsyncStorage.setItem(FRIENDS_KEY, JSON.stringify(updatedFriends));
          },
        },
      ]
    );
  };

  const renderFriend = ({ item }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
        {item.status === 'online' && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendMutual}>
          {item.mutualFriends} ortak arkadaş
        </Text>
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => Alert.alert('Mesaj', `${item.name}'e mesaj gönder`)}
        >
          <Text style={styles.messageIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFriend(item.id, item.name)}
        >
          <Text style={styles.removeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
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
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    searchInput: {
      flex: 1,
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      padding: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
    },
    addButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
    },
    listContent: {
      padding: 15,
    },
    friendCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    friendAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      position: 'relative',
    },
    friendAvatarText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#4CAF50',
      borderWidth: 2,
      borderColor: theme.cardBackground,
    },
    friendInfo: {
      flex: 1,
    },
    friendName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    friendMutual: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    friendActions: {
      flexDirection: 'row',
      gap: 8,
    },
    messageButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    messageIcon: {
      fontSize: 20,
    },
    removeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.error + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeIcon: {
      fontSize: 20,
      color: theme.error,
      fontWeight: 'bold',
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
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Arkadaşlarım</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Kullanıcı adı ara..."
            placeholderTextColor={theme.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👋</Text>
            <Text style={styles.emptyText}>
              Henüz arkadaş eklemediniz
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default FriendsScreen;
