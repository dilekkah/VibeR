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

const AMBIENT_OPTIONS = [
  { id: 'quiet', emoji: '🤫', label: 'Sessiz', description: 'Huzurlu ve sakin' },
  { id: 'moderate', emoji: '🎵', label: 'Orta', description: 'Hafif müzik' },
  { id: 'lively', emoji: '🎉', label: 'Canlı', description: 'Enerjik ortam' },
  { id: 'outdoor', emoji: '🌳', label: 'Açık Hava', description: 'Doğa ile iç içe' },
  { id: 'cozy', emoji: '🕯️', label: 'Samimi', description: 'Sıcak atmosfer' },
  { id: 'modern', emoji: '✨', label: 'Modern', description: 'Şık ve minimal' },
];

export default function AmbientControlScreen({ navigation, route }) {
  const [selectedAmbient, setSelectedAmbient] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
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

  const handleSelect = (id) => {
    setSelectedAmbient(id);
  };

  const handleContinue = () => {
    if (selectedAmbient) {
      navigation.navigate('Recommendation', {
        ...route.params,
        ambient: selectedAmbient,
      });
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Ortam Tercihi</Text>
            <Text style={styles.headerSubtitle}>Adım 3/4</Text>
          </View>
          <View style={styles.headerRight} />
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </Animated.View>

        <ScrollView
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
            <View style={styles.iconBox}>
              <Text style={styles.iconEmoji}>🎭</Text>
            </View>
            <Text style={styles.title}>Nasıl bir ortam{'\n'}istiyorsun?</Text>
            <Text style={styles.subtitle}>
              Tercihine göre mekan önerileri sunacağız
            </Text>
          </Animated.View>

          {/* Options Grid */}
          <Animated.View
            style={[
              styles.optionsGrid,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {AMBIENT_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedAmbient === option.id && styles.optionCardSelected,
                ]}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.optionIconBox,
                    selectedAmbient === option.id && styles.optionIconBoxSelected,
                  ]}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedAmbient === option.id && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
                {selectedAmbient === option.id && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </ScrollView>

        {/* Bottom Button */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedAmbient && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedAmbient}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Devam Et</Text>
            <Text style={styles.buttonArrow}>→</Text>
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
    paddingTop: 12,
    paddingBottom: 16,
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
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7C7C7C',
    marginTop: 2,
  },
  headerRight: {
    width: 44,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E2DD',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1C1C1C',
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1C',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#7C7C7C',
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: (width - 56) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F0EEEB',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: '#1C1C1C',
    backgroundColor: '#FAFAF9',
  },
  optionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F7F5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIconBoxSelected: {
    backgroundColor: '#1C1C1C',
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#1C1C1C',
  },
  optionDescription: {
    fontSize: 12,
    color: '#7C7C7C',
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
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
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: '#F7F5F2',
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
    opacity: 0.4,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  buttonArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});