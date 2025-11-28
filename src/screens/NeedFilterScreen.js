import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const NeedFilterScreen = ({ route, navigation }) => {
  const { moods, companions } = route.params;
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [skipNeed, setSkipNeed] = useState(false);

  const needs = [
    { id: 'relax', emoji: '😌', label: 'Rahatlamak' },
    { id: 'fun', emoji: '🎉', label: 'Eğlenmek' },
    { id: 'exercise', emoji: '💪', label: 'Hareket Etmek' },
    { id: 'socialize', emoji: '🗣️', label: 'Sosyalleşmek' },
    { id: 'learn', emoji: '📚', label: 'Öğrenmek' },
    { id: 'create', emoji: '🎨', label: 'Yaratmak' },
    { id: 'explore', emoji: '🔍', label: 'Keşfetmek' },
    { id: 'eat', emoji: '🍽️', label: 'Yemek Yemek' },
    { id: 'nature', emoji: '🌳', label: 'Doğada Olmak' },
    { id: 'culture', emoji: '🎭', label: 'Kültür Sanat' },
    { id: 'music', emoji: '🎵', label: 'Müzik' },
    { id: 'shop', emoji: '🛍️', label: 'Alışveriş' },
  ];

  const handleNeedSelect = (needId) => {
    if (skipNeed) {
      setSkipNeed(false);
    }

    if (selectedNeeds.includes(needId)) {
      setSelectedNeeds(selectedNeeds.filter(id => id !== needId));
    } else {
      if (selectedNeeds.length < 3) {
        setSelectedNeeds([...selectedNeeds, needId]);
      }
    }
  };

  const handleSkipNeed = () => {
    setSkipNeed(!skipNeed);
    if (!skipNeed) {
      setSelectedNeeds([]);
    }
  };

  const handleContinue = () => {
    navigation.navigate('Recommendation', {
      moods,
      companions,
      needs: skipNeed ? ['any'] : (selectedNeeds.length > 0 ? selectedNeeds : ['no-filter']),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Neye ihtiyacın var?</Text>
          <Text style={styles.subtitle}>
            {selectedNeeds.length > 0 && !skipNeed
              ? `En fazla 3 seçenek (${selectedNeeds.length}/3 seçildi)`
              : 'İsteğe bağlı'}
          </Text>
        </View>

        {/* Farketmez Butonu */}
        <TouchableOpacity
          style={[styles.skipButton, skipNeed && styles.skipButtonActive]}
          onPress={handleSkipNeed}
        >
          <Text style={styles.skipIcon}>🎲</Text>
          <View style={styles.skipTextContainer}>
            <Text style={[styles.skipText, skipNeed && styles.skipTextActive]}>
              Farketmez
            </Text>
            <Text style={[styles.skipSubtext, skipNeed && styles.skipSubtextActive]}>
              Sürpriz öneriler göster
            </Text>
          </View>
          {skipNeed && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.needsContainer}>
          {needs.map((need) => (
            <TouchableOpacity
              key={need.id}
              style={[
                styles.needCard,
                selectedNeeds.includes(need.id) && styles.needCardSelected,
                (skipNeed || (!selectedNeeds.includes(need.id) && selectedNeeds.length >= 3)) && styles.needCardDisabled,
              ]}
              onPress={() => handleNeedSelect(need.id)}
              disabled={skipNeed || (!selectedNeeds.includes(need.id) && selectedNeeds.length >= 3)}
            >
              <Text style={styles.needEmoji}>{need.emoji}</Text>
              <Text
                style={[
                  styles.needLabel,
                  selectedNeeds.includes(need.id) && styles.needLabelSelected,
                ]}
              >
                {need.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Önerileri Gör →</Text>
        </TouchableOpacity>
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
    textAlign: 'center',
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
  needsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  needCard: {
    width: '47%',
    aspectRatio: 1.5,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  needCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  needCardDisabled: {
    opacity: 0.5,
  },
  needEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  needLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  needLabelSelected: {
    color: '#007AFF',
    fontWeight: 'bold',
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

export default NeedFilterScreen;
