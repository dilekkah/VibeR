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

const COMPANIONS = [
  { id: 'alone', emoji: '🧘', label: 'Yalnız', description: 'Kendi başıma vakit geçirmek istiyorum' },
  { id: 'partner', emoji: '💑', label: 'Sevgili', description: 'Partnerimle romantik bir zaman' },
  { id: 'friends', emoji: '👥', label: 'Arkadaşlar', description: 'Arkadaşlarımla eğlenmek istiyorum' },
  { id: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Aile', description: 'Ailemle güzel vakit geçirmek' },
  { id: 'business', emoji: '💼', label: 'İş', description: 'İş görüşmesi veya toplantı' },
  { id: 'date', emoji: '🌹', label: 'İlk Buluşma', description: 'Etkileyici bir mekan arıyorum' },
];

export default function CompanionFilterScreen({ route, navigation }) {
  // MoodSelectionScreen'den gelen veriler
  const { selectedMood, moods = [] } = route.params || {};

  const [selectedCompanion, setSelectedCompanion] = useState(null);

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

  const handleContinue = () => {
    // NeedFilterScreen'e git ve tüm seçimleri gönder
    navigation.navigate('NeedFilter', {
      selectedMood: selectedMood,
      moods: moods,
      selectedCompanion: selectedCompanion,
      companions: selectedCompanion ? [selectedCompanion] : [],
    });
  };

  // Direkt önerilere git
  const handleSkipToRecommendations = () => {
    navigation.navigate('Recommendation', {
      selectedMood: selectedMood,
      moods: moods,
      selectedCompanion: selectedCompanion,
      companions: selectedCompanion ? [selectedCompanion] : [],
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
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkipToRecommendations}
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
            <Text style={styles.stepText}>Adım 2/3</Text>
            <Text style={styles.title}>Kiminle olacaksın?</Text>
            <Text style={styles.subtitle}>
              Yanında kim olacak? Ona göre mekan önerelim
            </Text>
          </Animated.View>

          {/* Companions List */}
          <Animated.View
            style={[
              styles.companionsList,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {COMPANIONS.map((companion) => (
              <TouchableOpacity
                key={companion.id}
                style={[
                  styles.companionCard,
                  selectedCompanion === companion.id && styles.companionCardSelected,
                ]}
                onPress={() => setSelectedCompanion(companion.id)}
                activeOpacity={0.7}
              >
                <View style={styles.companionLeft}>
                  <View
                    style={[
                      styles.companionEmojiBox,
                      selectedCompanion === companion.id && styles.companionEmojiBoxSelected,
                    ]}
                  >
                    <Text style={styles.companionEmoji}>{companion.emoji}</Text>
                  </View>
                  <View style={styles.companionInfo}>
                    <Text
                      style={[
                        styles.companionLabel,
                        selectedCompanion === companion.id && styles.companionLabelSelected,
                      ]}
                    >
                      {companion.label}
                    </Text>
                    <Text style={styles.companionDesc}>{companion.description}</Text>
                  </View>
                </View>
                {selectedCompanion === companion.id && (
                  <View style={styles.checkCircle}>
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
          <TouchableOpacity
            style={styles.quickButton}
            onPress={handleSkipToRecommendations}
          >
            <Text style={styles.quickButtonText}>Bu adımı atla</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedCompanion && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedCompanion}
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
  companionsList: {
    gap: 12,
  },
  companionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  companionCardSelected: {
    borderColor: '#1C1C1C',
    backgroundColor: '#FAFAFA',
  },
  companionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companionEmojiBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  companionEmojiBoxSelected: {
    backgroundColor: '#1C1C1C',
  },
  companionEmoji: {
    fontSize: 26,
  },
  companionInfo: {
    flex: 1,
  },
  companionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  companionLabelSelected: {
    color: '#1C1C1C',
  },
  companionDesc: {
    fontSize: 13,
    color: '#7C7C7C',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 14,
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