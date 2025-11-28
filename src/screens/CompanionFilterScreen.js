import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import MoodCard from '../components/MoodCard';

const CompanionFilterScreen = ({ route, navigation }) => {
  const { moods } = route.params;
  const [selectedCompanions, setSelectedCompanions] = useState([]);
  const [skipCompanion, setSkipCompanion] = useState(false);

  const companions = [
    { id: 'alone', emoji: '👤', label: 'Yalnız' },
    { id: 'partner', emoji: '💑', label: 'Eşle/Sevgili' },
    { id: 'friends', emoji: '👥', label: 'Arkadaşlar' },
    { id: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Aile' },
    { id: 'colleagues', emoji: '💼', label: 'İş Arkadaşları' },
    { id: 'pet', emoji: '🐕', label: 'Evcil Hayvan' },
  ];

  const handleCompanionSelect = (companionId) => {
    if (skipCompanion) {
      setSkipCompanion(false);
    }

    if (selectedCompanions.includes(companionId)) {
      setSelectedCompanions(selectedCompanions.filter(id => id !== companionId));
    } else {
      if (selectedCompanions.length < 2) {
        setSelectedCompanions([...selectedCompanions, companionId]);
      }
    }
  };

  const handleSkipCompanion = () => {
    setSkipCompanion(!skipCompanion);
    if (!skipCompanion) {
      setSelectedCompanions([]);
    }
  };

  const handleContinue = () => {
    if (skipCompanion || selectedCompanions.length > 0) {
      navigation.navigate('NeedFilter', {
        moods,
        companions: skipCompanion ? ['any'] : selectedCompanions,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Kiminle vakit geçireceksin?</Text>
          <Text style={styles.subtitle}>En fazla 2 seçenek seçebilirsin</Text>
          {selectedCompanions.length > 0 && !skipCompanion && (
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                {selectedCompanions.length}/2 seçildi
              </Text>
            </View>
          )}
        </View>

        {/* Farketmez Butonu */}
        <TouchableOpacity
          style={[styles.skipButton, skipCompanion && styles.skipButtonActive]}
          onPress={handleSkipCompanion}
        >
          <Text style={styles.skipIcon}>🎲</Text>
          <View style={styles.skipTextContainer}>
            <Text style={[styles.skipText, skipCompanion && styles.skipTextActive]}>
              Farketmez
            </Text>
            <Text style={[styles.skipSubtext, skipCompanion && styles.skipSubtextActive]}>
              Tüm seçeneklere açığım
            </Text>
          </View>
          {skipCompanion && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.companionsContainer}>
          {companions.map((companion) => (
            <MoodCard
              key={companion.id}
              emoji={companion.emoji}
              label={companion.label}
              isSelected={selectedCompanions.includes(companion.id)}
              onPress={() => handleCompanionSelect(companion.id)}
              disabled={skipCompanion || (!selectedCompanions.includes(companion.id) && selectedCompanions.length >= 2)}
            />
          ))}
        </View>

        {(selectedCompanions.length > 0 || skipCompanion) && (
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Devam Et →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectedCount: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  selectedCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  skipButtonActive: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
  },
  skipIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  skipTextContainer: {
    flex: 1,
  },
  skipText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  skipTextActive: {
    color: '#F57C00',
  },
  skipSubtext: {
    fontSize: 14,
    color: '#666',
  },
  skipSubtextActive: {
    color: '#F57C00',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  companionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CompanionFilterScreen;
