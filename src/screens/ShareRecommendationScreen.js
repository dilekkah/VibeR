import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ShareRecommendationScreen = ({ route, navigation }) => {
  const { place } = route?.params || {};
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [message, setMessage] = useState('');
  const { theme } = useTheme();

  // Demo arkadaş listesi
  const friends = [
    { id: '1', name: 'Ayşe Yılmaz', status: 'online' },
    { id: '2', name: 'Mehmet Demir', status: 'offline' },
    { id: '3', name: 'Zeynep Kaya', status: 'online' },
    { id: '4', name: 'Can Öztürk', status: 'online' },
    { id: '5', name: 'Elif Şahin', status: 'offline' },
  ];

  const toggleFriend = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleShare = () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir arkadaş seçin');
      return;
    }

    Alert.alert(
      'Başarılı',
      `Öneri ${selectedFriends.length} arkadaşınıza gönderildi!`,
      [{ text: 'Tamam', onPress: () => navigation.goBack() }]
    );
  };

  const renderFriend = ({ item }) => {
    const isSelected = selectedFriends.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => toggleFriend(item.id)}
      >
        <View style={styles.friendAvatar}>
          <Text style={styles.friendAvatarText}>
            {item.name.charAt(0)}
          </Text>
          {item.status === 'online' && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, isSelected && styles.friendNameSelected]}>
            {item.name}
          </Text>
          <Text style={styles.friendStatus}>
            {item.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    placeTitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    messageContainer: {
      padding: 20,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    messageLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 10,
    },
    messageInput: {
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      padding: 14,
      fontSize: 15,
      minHeight: 80,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
      textAlignVertical: 'top',
    },
    friendsList: {
      flex: 1,
    },
    friendsListContent: {
      padding: 15,
    },
    friendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    friendItemSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.primary + '10',
    },
    friendAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
      position: 'relative',
    },
    friendAvatarText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#4CAF50',
      borderWidth: 2,
      borderColor: theme.cardBackground,
    },
    friendInfo: {
      flex: 1,
    },
    friendName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    friendNameSelected: {
      color: theme.primary,
    },
    friendStatus: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    checkmark: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    footer: {
      padding: 20,
      backgroundColor: theme.cardBackground,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    selectedCount: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 12,
      textAlign: 'center',
    },
    shareButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      padding: 18,
      alignItems: 'center',
    },
    shareButtonDisabled: {
      backgroundColor: theme.disabled,
    },
    shareButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Öneri Paylaş</Text>
        {place && <Text style={styles.placeTitle}>{place.title}</Text>}
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.messageLabel}>Mesaj Ekle (İsteğe Bağlı)</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Bu mekanı çok beğendim, birlikte gidelim!"
          placeholderTextColor={theme.placeholder}
          value={message}
          onChangeText={setMessage}
          multiline
        />
      </View>

      <FlatList
        style={styles.friendsList}
        contentContainerStyle={styles.friendsListContent}
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
      />

      <View style={styles.footer}>
        {selectedFriends.length > 0 && (
          <Text style={styles.selectedCount}>
            {selectedFriends.length} arkadaş seçildi
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.shareButton,
            selectedFriends.length === 0 && styles.shareButtonDisabled,
          ]}
          onPress={handleShare}
          disabled={selectedFriends.length === 0}
        >
          <Text style={styles.shareButtonText}>Gönder 📤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ShareRecommendationScreen;
