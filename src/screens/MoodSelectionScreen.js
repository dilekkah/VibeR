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

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Mutlu', color: '#FFD93D' },
  { id: 'sad', emoji: '😢', label: 'Üzgün', color: '#6B7FD7' },
  { id: 'energetic', emoji: '⚡', label: 'Enerjik', color: '#FF6B6B' },
  { id: 'calm', emoji: '😌', label: 'Sakin', color: '#6BCB77' },
  { id: 'romantic', emoji: '💕', label: 'Romantik', color: '#FF8FB1' },
  { id: 'adventurous', emoji: '🎯', label: 'Maceracı', color: '#FF9F45' },
  { id: 'tired', emoji: '😴', label: 'Yorgun', color: '#A0A0A0' },
  { id: 'stressed', emoji: '😰', label: 'Stresli', color: '#E57373' },
  { id: 'social', emoji: '🎉', label: 'Sosyal', color: '#9C27B0' },
  { id: 'peaceful', emoji: '🧘', label: 'Huzurlu', color: '#4DB6AC' },
  { id: 'creative', emoji: '🎨', label: 'Yaratıcı', color: '#FF7043' },
  { id: 'hungry', emoji: '🍽️', label: 'Aç', color: '#8D6E63' },
];

export default function MoodSelectionScreen({ navigation }) {
  const [selectedMood, setSelectedMood] = useState(null);

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnims = useRef(MOODS.map(() => new Animated.Value(1))).current;

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

  const handleMoodSelect = (mood, index) => {
    setSelectedMood(mood.id);

    // Bounce animasyonu
    Animated.sequence([
      Animated.spring(scaleAnims[index], {
        toValue: 1.1,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = () => {
    if (!selectedMood) {
      return;
    }

    // CompanionFilterScreen'e git ve seçili mood'u gönder
    navigation.navigate('CompanionFilter', {
      selectedMood: selectedMood,
      moods: [selectedMood],
    });
  };

  // Direkt önerilere git (companion ve need atla)
  const handleSkipToRecommendations = () => {
    if (!selectedMood) {
      return;
    }

    navigation.navigate('Recommendation', {
      selectedMood: selectedMood,
      moods: [selectedMood],
      companions: [],
      needs: [],
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
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('Recommendation', {})}
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
            <Text style={styles.stepText}>Adım 1/3</Text>
            <Text style={styles.title}>Bugün nasıl hissediyorsun?</Text>
            <Text style={styles.subtitle}>
              Ruh haline göre sana en uygun mekanları önerelim
            </Text>
          </Animated.View>

          {/* Moods Grid */}
          <Animated.View
            style={[
              styles.moodsGrid,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {MOODS.map((mood, index) => (
              <TouchableOpacity
                key={mood.id}
                onPress={() => handleMoodSelect(mood, index)}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.moodCard,
                    selectedMood === mood.id && styles.moodCardSelected,
                    selectedMood === mood.id && { borderColor: mood.color },
                    { transform: [{ scale: scaleAnims[index] }] },
                  ]}
                >
                  <View
                    style={[
                      styles.moodEmojiBox,
                      selectedMood === mood.id && { backgroundColor: mood.color + '20' },
                    ]}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  </View>
                  <Text
                    style={[
                      styles.moodLabel,
                      selectedMood === mood.id && styles.moodLabelSelected,
                    ]}
                  >
                    {mood.label}
                  </Text>
                  {selectedMood === mood.id && (
                    <View style={[styles.checkBadge, { backgroundColor: mood.color }]}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                  )}
                </Animated.View>
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
          <TouchableOpacity
            style={styles.quickButton}
            onPress={handleSkipToRecommendations}
            disabled={!selectedMood}
          >
            <Text style={[styles.quickButtonText, !selectedMood && { opacity: 0.5 }]}>
              Hızlı Öneri Al
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedMood && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedMood}
          >
            <Text style={styles.continueButtonText}>Devam Et</Text>
            <Text style={styles.continueIcon}>→</Text>
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
    backgroundColor: '#1C1C1C',
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
    marginBottom: 32,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C7C7C',
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
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: (width - 52) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
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
  moodCardSelected: {
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.1,
    elevation: 4,
  },
  moodEmojiBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C7C7C',
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: '#1C1C1C',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
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
  quickButton: {
    alignItems: 'center',
    marginBottom: 12,
  },
  quickButtonText: {
    fontSize: 14,
    color: '#7C7C7C',
    fontWeight: '500',
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
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});