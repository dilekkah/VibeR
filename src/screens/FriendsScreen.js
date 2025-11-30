import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  TextInput,
  StatusBar,
} from 'react-native';

const SAMPLE_FRIENDS = [
  { id: '1', name: 'Ayşe Kaya', avatar: '👩', mood: '😊', status: 'Mutlu', lastSeen: 'Şimdi aktif' },
  { id: '2', name: 'Mehmet Yılmaz', avatar: '👨', mood: '⚡', status: 'Enerjik', lastSeen: '5 dk önce' },
  { id: '3', name: 'Zeynep Ak', avatar: '👩‍🦰', mood: '😌', status: 'Sakin', lastSeen: '1 saat önce' },
  { id: '4', name: 'Ali Demir', avatar: '👨‍🦱', mood: '🎉', status: 'Eğlenceli', lastSeen: '2 saat önce' },
  { id: '5', name: 'Fatma Şen', avatar: '👩‍🦳', mood: '💭', status: 'Düşünceli', lastSeen: 'Dün' },
];

const FRIEND_REQUESTS = [
  { id: '1', name: 'Cem Karaca', avatar: '👨‍🎤', mutualFriends: 5 },
  { id: '2', name: 'Selin Yıldız', avatar: '👩‍💼', mutualFriends: 3 },
];

export default function FriendsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState(SAMPLE_FRIENDS);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFriendCard = (friend) => (
    <TouchableOpacity key={friend.id} style={styles.friendCard}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarEmoji}>{friend.avatar}</Text>
        </View>
        <View style={styles.onlineIndicator} />
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.name}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.moodEmoji}>{friend.mood}</Text>
          <Text style={styles.statusText}>{friend.status}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.lastSeen}>{friend.lastSeen}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.messageButton}>
        <Text style={styles.messageIcon}>💬</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderRequestCard = (request) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.avatarBox}>
        <Text style={styles.avatarEmoji}>{request.avatar}</Text>
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.friendName}>{request.name}</Text>
        <Text style={styles.mutualFriends}>{request.mutualFriends} ortak arkadaş</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity style={styles.acceptButton}>
          <Text style={styles.acceptText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineButton}>
          <Text style={styles.declineText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Arkadaşlar</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Search */}
        <Animated.View
          style={[
            styles.searchContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Arkadaş ara..."
            placeholderTextColor="#A0A0A0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
              Arkadaşlarım
            </Text>
            <View style={[styles.tabBadge, activeTab === 'friends' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'friends' && styles.tabBadgeTextActive]}>
                {friends.length}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
              İstekler
            </Text>
            {FRIEND_REQUESTS.length > 0 && (
              <View style={[styles.tabBadge, styles.tabBadgeNew]}>
                <Text style={styles.tabBadgeTextNew}>{FRIEND_REQUESTS.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'friends' ? (
            <>
              <Text style={styles.sectionTitle}>Aktif Arkadaşlar</Text>
              {filteredFriends.map(renderFriendCard)}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Arkadaşlık İstekleri</Text>
              {FRIEND_REQUESTS.map(renderRequestCard)}
            </>
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
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1C',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  tabActive: {
    backgroundColor: '#1C1C1C',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C7C7C',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    marginLeft: 8,
    backgroundColor: '#F0EEEB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeNew: {
    backgroundColor: '#EF4444',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C7C7C',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  tabBadgeTextNew: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A0A0A0',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 14,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: '#7C7C7C',
  },
  dotSeparator: {
    fontSize: 13,
    color: '#D0D0D0',
    marginHorizontal: 6,
  },
  lastSeen: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageIcon: {
    fontSize: 18,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 14,
  },
  mutualFriends: {
    fontSize: 13,
    color: '#7C7C7C',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  acceptText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  declineButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0EEEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineText: {
    fontSize: 18,
    color: '#7C7C7C',
    fontWeight: '600',
  },
});