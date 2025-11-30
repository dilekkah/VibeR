import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const DURATION_OPTIONS = [
  { value: 2, label: '2 Saat', emoji: '⚡' },
  { value: 4, label: '4 Saat', emoji: '☀️' },
  { value: 6, label: '6 Saat', emoji: '🌅' },
  { value: 8, label: 'Tam Gün', emoji: '🌙' },
];

const ACTIVITY_TYPES = [
  { id: 'food', label: 'Yemek', emoji: '🍽️', color: '#FF6B6B' },
  { id: 'coffee', label: 'Kahve', emoji: '☕', color: '#8B4513' },
  { id: 'culture', label: 'Kültür', emoji: '🏛️', color: '#6B5B95' },
  { id: 'nature', label: 'Doğa', emoji: '🌳', color: '#2ECC71' },
  { id: 'shopping', label: 'Alışveriş', emoji: '🛍️', color: '#E91E63' },
  { id: 'entertainment', label: 'Eğlence', emoji: '🎮', color: '#9C27B0' },
];

const TRANSPORT_OPTIONS = [
  { id: 'walk', label: 'Yürüyüş', emoji: '🚶' },
  { id: 'public', label: 'Toplu Taşıma', emoji: '🚇' },
  { id: 'car', label: 'Araba', emoji: '🚗' },
  { id: 'bike', label: 'Bisiklet', emoji: '🚴' },
];

export default function RouteGeneratorScreen({ navigation }) {
  const [duration, setDuration] = useState(4);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [transport, setTransport] = useState('walk');
  const [generating, setGenerating] = useState(false);

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

  const toggleActivity = (id) => {
    setSelectedActivities(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (selectedActivities.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir aktivite türü seçin');
      return;
    }

    setGenerating(true);

    // Simüle edilmiş rota oluşturma
    setTimeout(() => {
      setGenerating(false);
      Alert.alert(
        'Rota Hazır! 🎉',
        `${duration} saatlik ${selectedActivities.length} aktiviteli rotanız oluşturuldu!`,
        [
          { text: 'Görüntüle', onPress: () => navigation.goBack() },
        ]
      );
    }, 2000);
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
          <Text style={styles.headerTitle}>Rota Oluştur</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.heroIconBox}>
              <Text style={styles.heroIcon}>🗺️</Text>
            </View>
            <Text style={styles.heroTitle}>Günlük Rotanı Planla</Text>
            <Text style={styles.heroSubtitle}>
              Tercihlerine göre özelleştirilmiş bir gün planı oluşturalım
            </Text>
          </Animated.View>

          {/* Duration Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Süre</Text>
            <Text style={styles.sectionSubtitle}>Ne kadar zamanın var?</Text>

            <View style={styles.optionsGrid}>
              {DURATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.durationCard,
                    duration === option.value && styles.durationCardSelected,
                  ]}
                  onPress={() => setDuration(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.durationEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.durationLabel,
                      duration === option.value && styles.durationLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Activities Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Aktiviteler</Text>
            <Text style={styles.sectionSubtitle}>Ne yapmak istersin?</Text>

            <View style={styles.activitiesGrid}>
              {ACTIVITY_TYPES.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityCard,
                    selectedActivities.includes(activity.id) && {
                      backgroundColor: activity.color,
                      borderColor: activity.color,
                    },
                  ]}
                  onPress={() => toggleActivity(activity.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                  <Text
                    style={[
                      styles.activityLabel,
                      selectedActivities.includes(activity.id) && styles.activityLabelSelected,
                    ]}
                  >
                    {activity.label}
                  </Text>
                  {selectedActivities.includes(activity.id) && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Transport Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Ulaşım</Text>
            <Text style={styles.sectionSubtitle}>Nasıl hareket edeceksin?</Text>

            <View style={styles.transportRow}>
              {TRANSPORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.transportCard,
                    transport === option.id && styles.transportCardSelected,
                  ]}
                  onPress={() => setTransport(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.transportEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.transportLabel,
                      transport === option.id && styles.transportLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Summary */}
          <Animated.View
            style={[
              styles.summaryCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.summaryTitle}>Özet</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Süre:</Text>
              <Text style={styles.summaryValue}>{duration} saat</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Aktiviteler:</Text>
              <Text style={styles.summaryValue}>
                {selectedActivities.length > 0
                  ? selectedActivities.map(id =>
                    ACTIVITY_TYPES.find(a => a.id === id)?.emoji
                  ).join(' ')
                  : 'Seçilmedi'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ulaşım:</Text>
              <Text style={styles.summaryValue}>
                {TRANSPORT_OPTIONS.find(t => t.id === transport)?.emoji}{' '}
                {TRANSPORT_OPTIONS.find(t => t.id === transport)?.label}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Generate Button */}
        <Animated.View
          style={[
            styles.bottomSection,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            activeOpacity={0.85}
            disabled={generating}
          >
            <Text style={styles.generateButtonText}>
              {generating ? 'Rota Oluşturuluyor...' : 'Rotayı Oluştur'}
            </Text>
            {!generating && <Text style={styles.generateIcon}>🚀</Text>}
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#7C7C7C',
    textAlign: 'center',
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
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationCard: {
    width: (width - 60) / 4,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  durationCardSelected: {
    backgroundColor: '#1C1C1C',
  },
  durationEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C7C7C',
  },
  durationLabelSelected: {
    color: '#FFFFFF',
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityCard: {
    width: (width - 52) / 3,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F0EEEB',
    position: 'relative',
  },
  activityEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  activityLabelSelected: {
    color: '#FFFFFF',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 12,
    color: '#1C1C1C',
    fontWeight: '700',
  },
  transportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transportCard: {
    width: (width - 60) / 4,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  transportCardSelected: {
    backgroundColor: '#1C1C1C',
  },
  transportEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  transportLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7C7C7C',
    textAlign: 'center',
  },
  transportLabelSelected: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7C7C7C',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F7F5F2',
  },
  generateButton: {
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
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generateIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
});