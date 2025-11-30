import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  TextInput,
  Alert,
  StatusBar,
  Dimensions,
  Share,
} from 'react-native';

const { width } = Dimensions.get('window');

const SHARE_PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', emoji: '💬', color: '#25D366' },
  { id: 'instagram', label: 'Instagram', emoji: '📸', color: '#E4405F' },
  { id: 'twitter', label: 'Twitter', emoji: '🐦', color: '#1DA1F2' },
  { id: 'copy', label: 'Kopyala', emoji: '📋', color: '#7C7C7C' },
];

const QUICK_MESSAGES = [
  'Bu mekanı çok beğendim! 🌟',
  'Mutlaka denemelisin! 👌',
  'Harika bir keşif! ✨',
  'Favorilerime eklendi! ❤️',
];

export default function ShareRecommendationScreen({ route, navigation }) {
  const { place } = route.params || {};

  const [message, setMessage] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [focusedInput, setFocusedInput] = useState(false);

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

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

  const handleQuickMessage = (msg) => {
    setMessage(msg);
  };

  const handleShare = async () => {
    const shareMessage = `${message}\n\n📍 ${place?.name || 'Harika Mekan'}\n🎯 MoodMap ile keşfedildi`;

    try {
      await Share.share({
        message: shareMessage,
        title: 'MoodMap Önerisi',
      });

      Alert.alert('Paylaşıldı! 🎉', 'Önerin başarıyla paylaşıldı');
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paylaş</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Place Preview */}
          <Animated.View
            style={[
              styles.placePreview,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.placeIconBox}>
              <Text style={styles.placeIcon}>📍</Text>
            </View>
            <View style={styles.placeContent}>
              <Text style={styles.placeName}>{place?.name || 'Harika Mekan'}</Text>
              <Text style={styles.placeCategory}>{place?.category || 'Kategori'}</Text>
            </View>
            <View style={styles.shareIconBox}>
              <Text style={styles.shareIcon}>🔗</Text>
            </View>
          </Animated.View>

          {/* Message Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Mesajın</Text>
            <Text style={styles.sectionSubtitle}>Arkadaşlarına ne söylemek istersin?</Text>

            <View
              style={[
                styles.messageWrapper,
                focusedInput && styles.messageWrapperFocused,
              ]}
            >
              <TextInput
                style={styles.messageInput}
                placeholder="Mesajını yaz..."
                placeholderTextColor="#A0A0A0"
                value={message}
                onChangeText={setMessage}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Quick Messages */}
            <View style={styles.quickMessages}>
              {QUICK_MESSAGES.map((msg, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickMessageChip,
                    message === msg && styles.quickMessageChipSelected,
                  ]}
                  onPress={() => handleQuickMessage(msg)}
                >
                  <Text
                    style={[
                      styles.quickMessageText,
                      message === msg && styles.quickMessageTextSelected,
                    ]}
                  >
                    {msg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Platforms Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Platform Seç</Text>
            <Text style={styles.sectionSubtitle}>Nerede paylaşmak istersin?</Text>

            <View style={styles.platformsGrid}>
              {SHARE_PLATFORMS.map((platform) => (
                <TouchableOpacity
                  key={platform.id}
                  style={[
                    styles.platformCard,
                    selectedPlatform === platform.id && {
                      backgroundColor: platform.color,
                      borderColor: platform.color,
                    },
                  ]}
                  onPress={() => setSelectedPlatform(platform.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.platformEmoji}>{platform.emoji}</Text>
                  <Text
                    style={[
                      styles.platformLabel,
                      selectedPlatform === platform.id && styles.platformLabelSelected,
                    ]}
                  >
                    {platform.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Preview */}
          <Animated.View
            style={[
              styles.previewCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.previewTitle}>Önizleme</Text>
            <View style={styles.previewContent}>
              <Text style={styles.previewMessage}>
                {message || 'Mesajın burada görünecek...'}
              </Text>
              <View style={styles.previewDivider} />
              <Text style={styles.previewPlace}>📍 {place?.name || 'Harika Mekan'}</Text>
              <Text style={styles.previewBadge}>🎯 MoodMap ile keşfedildi</Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Share Button */}
        <Animated.View
          style={[
            styles.bottomSection,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={styles.shareButtonText}>Paylaş</Text>
            <Text style={styles.shareButtonIcon}>🚀</Text>
          </TouchableOpacity>
        </Animated.View>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  placePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  placeIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeIcon: {
    fontSize: 24,
  },
  placeContent: {
    flex: 1,
    marginLeft: 14,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 2,
  },
  placeCategory: {
    fontSize: 13,
    color: '#7C7C7C',
  },
  shareIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 18,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7C7C7C',
    marginBottom: 16,
  },
  messageWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F0EEEB',
    minHeight: 100,
    marginBottom: 16,
  },
  messageWrapperFocused: {
    borderColor: '#1C1C1C',
  },
  messageInput: {
    fontSize: 15,
    color: '#1C1C1C',
    lineHeight: 22,
  },
  quickMessages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickMessageChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E2DD',
  },
  quickMessageChipSelected: {
    backgroundColor: '#1C1C1C',
    borderColor: '#1C1C1C',
  },
  quickMessageText: {
    fontSize: 13,
    color: '#7C7C7C',
    fontWeight: '500',
  },
  quickMessageTextSelected: {
    color: '#FFFFFF',
  },
  platformsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  platformCard: {
    width: (width - 60) / 4,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F0EEEB',
  },
  platformEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  platformLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C7C7C',
  },
  platformLabelSelected: {
    color: '#FFFFFF',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C7C7C',
    marginBottom: 12,
  },
  previewContent: {
    backgroundColor: '#F7F5F2',
    borderRadius: 14,
    padding: 16,
  },
  previewMessage: {
    fontSize: 15,
    color: '#1C1C1C',
    lineHeight: 22,
    marginBottom: 12,
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#E5E2DD',
    marginBottom: 12,
  },
  previewPlace: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  previewBadge: {
    fontSize: 12,
    color: '#7C7C7C',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F7F5F2',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: '#1C1C1C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  shareButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButtonIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
});