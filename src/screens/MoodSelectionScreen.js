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

const MoodSelectionScreen = ({ navigation }) => {
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [skipMood, setSkipMood] = useState(false);

  const moods = [
    // Temel Duygular
    { id: 'happy', emoji: '😊', label: 'Mutlu' },
    { id: 'sad', emoji: '😔', label: 'Üzgün' },
    { id: 'energetic', emoji: '⚡', label: 'Enerjik' },
    { id: 'tired', emoji: '😴', label: 'Yorgun' },
    { id: 'calm', emoji: '😌', label: 'Sakin' },
    { id: 'anxious', emoji: '😰', label: 'Endişeli' },
    { id: 'excited', emoji: '🤩', label: 'Heyecanlı' },
    { id: 'romantic', emoji: '💕', label: 'Romantik' },

    // Yaratıcı ve Entelektüel
    { id: 'creative', emoji: '🎨', label: 'Yaratıcı' },
    { id: 'intellectual', emoji: '📖', label: 'Entelektüel' },
    { id: 'curious', emoji: '🧐', label: 'Meraklı' },
    { id: 'inspired', emoji: '✨', label: 'İlhamlı' },
    { id: 'focused', emoji: '🎯', label: 'Odaklı' },
    { id: 'contemplative', emoji: '🌅', label: 'Derin Düşünceli' },
    { id: 'reflective', emoji: '🤔', label: 'Düşünceli' },
    { id: 'artistic', emoji: '🎭', label: 'Artistik' },

    // Sosyal ve Eğlenceli
    { id: 'social', emoji: '🎉', label: 'Sosyal' },
    { id: 'playful', emoji: '🤹', label: 'Eğlenceli' },
    { id: 'wild', emoji: '🦁', label: 'Vahşi/Çılgın' },
    { id: 'festive', emoji: '🎊', label: 'Şenlikli' },
    { id: 'spontaneous', emoji: '🎲', label: 'Spontane' },
    { id: 'adventurous', emoji: '🗺️', label: 'Maceracı' },

    // Huzur ve İç Dünya
    { id: 'peaceful', emoji: '☮️', label: 'Huzurlu' },
    { id: 'zen', emoji: '🍵', label: 'Zen' },
    { id: 'spiritual', emoji: '🕉️', label: 'Ruhani' },
    { id: 'relaxed', emoji: '🧘', label: 'Rahat' },
    { id: 'cozy', emoji: '🏠', label: 'Sıcak/Samimi' },
    { id: 'melancholic', emoji: '🌧️', label: 'Melankolik' },

    // Nostalji ve Anılar
    { id: 'nostalgic', emoji: '🕰️', label: 'Nostaljik' },
    { id: 'sentimental', emoji: '💭', label: 'Duygusal' },
    { id: 'dreamy', emoji: '☁️', label: 'Hayalperest' },

    // Motivasyon ve Güç
    { id: 'motivated', emoji: '🔥', label: 'Motive' },
    { id: 'confident', emoji: '💪', label: 'Kendinden Emin' },
    { id: 'ambitious', emoji: '🚀', label: 'Hırslı' },
    { id: 'determined', emoji: '🎖️', label: 'Kararlı' },

    // Stres ve Gerginlik
    { id: 'stressed', emoji: '😫', label: 'Stresli' },
    { id: 'overwhelmed', emoji: '🌀', label: 'Bunalmış' },
    { id: 'restless', emoji: '😣', label: 'Huzursuz' },

    // Diğer
    { id: 'mysterious', emoji: '🌙', label: 'Gizemli' },
    { id: 'sophisticated', emoji: '🎩', label: 'Sofistike' },
    { id: 'bohemian', emoji: '🌻', label: 'Bohem' },
    { id: 'vintage', emoji: '📷', label: 'Vintage' },
    { id: 'minimalist', emoji: '⬜', label: 'Minimalist' },
    { id: 'luxurious', emoji: '💎', label: 'Lüks' },
    { id: 'indie', emoji: '🎸', label: 'İndie' },
    { id: 'foodie', emoji: '🍕', label: 'Gurme' },
  ];

  const handleMoodSelect = (moodId) => {
    if (skipMood) {
      setSkipMood(false);
    }

    if (selectedMoods.includes(moodId)) {
      setSelectedMoods(selectedMoods.filter(id => id !== moodId));
    } else {
      if (selectedMoods.length < 5) {
        setSelectedMoods([...selectedMoods, moodId]);
      }
    }
  };

  const handleSkipMood = () => {
    setSkipMood(!skipMood);
    if (!skipMood) {
      setSelectedMoods([]);
    }
  };

  const handleContinue = () => {
    if (skipMood || selectedMoods.length > 0) {
      navigation.navigate('CompanionFilter', {
        moods: skipMood ? ['any'] : selectedMoods
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Bugün nasıl hissediyorsun?</Text>
          <Text style={styles.subtitle}>
            En fazla 5 ruh hali seçebilirsin
          </Text>
          {selectedMoods.length > 0 && !skipMood && (
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                {selectedMoods.length}/5 seçildi
              </Text>
            </View>
          )}
        </View>

        {/* Farketmez Butonu */}
        <TouchableOpacity
          style={[styles.skipMoodButton, skipMood && styles.skipMoodButtonActive]}
          onPress={handleSkipMood}
        >
          <Text style={styles.skipMoodIcon}>🎲</Text>
          <View style={styles.skipMoodTextContainer}>
            <Text style={[styles.skipMoodText, skipMood && styles.skipMoodTextActive]}>
              Farketmez
            </Text>
            <Text style={[styles.skipMoodSubtext, skipMood && styles.skipMoodSubtextActive]}>
              Rastgele öneriler göster
            </Text>
          </View>
          {skipMood && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.moodsContainer}>
          {moods.map((mood) => (
            <MoodCard
              key={mood.id}
              emoji={mood.emoji}
              label={mood.label}
              isSelected={selectedMoods.includes(mood.id)}
              onPress={() => handleMoodSelect(mood.id)}
              disabled={skipMood || (!selectedMoods.includes(mood.id) && selectedMoods.length >= 5)}
            />
          ))}
        </View>

        {(selectedMoods.length > 0 || skipMood) && (
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
    flexGrow: 1,
    padding: 20,
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
  skipMoodButton: {
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
  skipMoodButtonActive: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
  },
  skipMoodIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  skipMoodTextContainer: {
    flex: 1,
  },
  skipMoodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  skipMoodTextActive: {
    color: '#F57C00',
  },
  skipMoodSubtext: {
    fontSize: 14,
    color: '#666',
  },
  skipMoodSubtextActive: {
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
  moodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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

export default MoodSelectionScreen;
