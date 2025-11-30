import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const NEEDS = [
  { id: 'eat', emoji: '🍽️', label: 'Yemek', description: 'Bir şeyler yemek istiyorum' },
  { id: 'drink', emoji: '🍸', label: 'İçecek', description: 'Kahve, kokteyl veya içecek' },
  { id: 'relax', emoji: '🧘', label: 'Rahatlamak', description: 'Dinlenmek ve sakinleşmek' },
  { id: 'fun', emoji: '🎉', label: 'Eğlenmek', description: 'Aktif ve eğlenceli aktivite' },
  { id: 'explore', emoji: '🗺️', label: 'Keşfetmek', description: 'Yeni yerler görmek' },
  { id: 'work', emoji: '💻', label: 'Çalışmak', description: 'Çalışmaya uygun mekan' },
  { id: 'culture', emoji: '🎭', label: 'Kültür', description: 'Müze, sergi, tiyatro' },
  { id: 'nature', emoji: '🌳', label: 'Doğa', description: 'Açık hava ve yeşillik' },
  { id: 'shop', emoji: '🛍️', label: 'Alışveriş', description: 'Alışveriş yapmak' },
  { id: 'sport', emoji: '⚽', label: 'Spor', description: 'Spor aktivitesi' },
];

export default function NeedFilterScreen({ route, navigation }) {
  // Önceki ekranlardan gelen veriler
  const {
    selectedMood,
    moods = [],
    selectedCompanion,
    companions = []
  } = route.params || {};

  const [selectedNeeds, setSelectedNeeds] = useState([]);

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
  }, []);

  const toggleNeed = (needId) => {
    setSelectedNeeds(prev => {
      if (prev.includes(needId)) {
        return prev.filter(id => id !== needId);
      }
      return [...prev, needId];
    });
  };

  const handleShowRecommendations = () => {
    // RecommendationScreen'e tüm filtreleri gönder
    navigation.navigate('Recommendation', {
      selectedMood: selectedMood,
      moods: moods,
      selectedCompanion: selectedCompanion,
      companions: companions,
      selectedNeeds: selectedNeeds,
      needs: selectedNeeds,
    });
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
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleShowRecommendations}
          >
            <Text style={styles.skipText}>Atla</Text>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <Animated.View
            style={[
              styles.titleSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.stepText}>Adım 3/3</Text>
            <Text style={styles.title}>Ne yapmak istiyorsun?</Text>
            <Text style={styles.subtitle}>
              Birden fazla seçenek işaretleyebilirsin
            </Text>
          </Animated.View>

          {/* Selection Summary */}
          <Animated.View
            style={[
              styles.summaryCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.summaryTitle}>Seçimlerin</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mod:</Text>
              <Text style={styles.summaryValue}>{selectedMood || 'Seçilmedi'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Eşlik:</Text>
              <Text style={styles.summaryValue}>{selectedCompanion || 'Seçilmedi'}</Text>
            </View>
          </Animated.View>

          {/* Needs Grid */}
          <Animated.View
            style={[
              styles.needsGrid,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {NEEDS.map((need) => (
              <TouchableOpacity
                key={need.id}
                style={[
                  styles.needCard,
                  selectedNeeds.includes(need.id) && styles.needCardSelected,
                ]}
                onPress={() => toggleNeed(need.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.needEmojiBox,
                    selectedNeeds.includes(need.id) && styles.needEmojiBoxSelected,
                  ]}
                >
                  <Text style={styles.needEmoji}>{need.emoji}</Text>
                </View>
                <Text
                  style={[
                    styles.needLabel,
                    selectedNeeds.includes(need.id) && styles.needLabelSelected,
                  ]}
                >
                  {need.label}
                </Text>
                {selectedNeeds.includes(need.id) && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </ScrollView>

        {/* Bottom Section */}
        <Animated.View
          style={[
            styles.bottomSection,
            { opacity: fadeAnim },
          ]}
        >
          {selectedNeeds.length > 0 && (
            <Text style={styles.selectedCount}>
              {selectedNeeds.length} seçim yapıldı
            </Text>
          )}

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleShowRecommendations}
          >
            <Text style={styles.continueButtonText}>
              Önerileri Göster
            </Text>
            <Text style={styles.continueIcon}>🎯</Text>
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
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E2DD',
    borderRadius: 2,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#7C7C7C',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  titleSection: {
    marginBottom: 24,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#7C7C7C',
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C7C7C',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7C7C7C',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
    textTransform: 'capitalize',
  },
  needsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  needCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  needCardSelected: {
    borderColor: '#1C1C1C',
    backgroundColor: '#FAFAFA',
  },
  needEmojiBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  needEmojiBoxSelected: {
    backgroundColor: '#1C1C1C',
  },
  needEmoji: {
    fontSize: 28,
  },
  needLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
    textAlign: 'center',
  },
  needLabelSelected: {
    color: '#1C1C1C',
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F7F5F2',
    borderTopWidth: 1,
    borderTopColor: '#E5E2DD',
  },
  selectedCount: {
    textAlign: 'center',
    fontSize: 13,
    color: '#7C7C7C',
    marginBottom: 12,
  },
  continueButton: {
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
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
});