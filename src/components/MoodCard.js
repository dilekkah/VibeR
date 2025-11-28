import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const MoodCard = ({ emoji, label, isSelected, onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        disabled && styles.cardDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles.emoji, disabled && styles.emojiDisabled]}>
        {emoji}
      </Text>
      <Text style={[
        styles.label,
        isSelected && styles.labelSelected,
        disabled && styles.labelDisabled,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    transform: [{ scale: 0.95 }],
  },
  cardDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emojiDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  labelSelected: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  labelDisabled: {
    color: '#999',
  },
});

export default MoodCard;
