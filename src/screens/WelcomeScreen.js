import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 56) / 5;

// Grid verileri
const GRID_DATA = [
  // Row 1
  [
    { type: 'dot', color: '#E5E2DD' },
    { type: 'pill', color: '#1C1C1C' },
    { type: 'image', color: '#A08060', emoji: '👩‍🎨', span: 3 },
    { type: 'dot', color: '#E5E2DD' },
  ],
  // Row 2
  [
    { type: 'image', color: '#6B5B95', emoji: '✨', span: 2 },
    { type: 'dot', color: '#E5E2DD' },
    { type: 'pill', color: '#E5E2DD' },
    { type: 'dot', color: '#1C1C1C' },
    { type: 'pill', color: '#E5E2DD' },
  ],
  // Row 3
  [
    { type: 'pill', color: '#E5E2DD' },
    { type: 'dot', color: '#E5E2DD' },
    { type: 'pill', color: '#1C1C1C' },
    { type: 'dot', color: '#E5E2DD' },
    { type: 'image', color: '#87CEEB', emoji: '🐟', span: 2 },
  ],
  // Row 4
  [
    { type: 'dot', color: '#E5E2DD' },
    { type: 'pill', color: '#1C1C1C' },
    { type: 'dot', color: '#E5E2DD' },
    { type: 'image', color: '#D4A5A5', emoji: '💑', span: 3 },
  ],
  // Row 5
  [
    { type: 'image', color: '#FF7F50', emoji: '🌅', span: 2 },
    { type: 'pill', color: '#E5E2DD' },
    { type: 'dot', color: '#E5E2DD' },
    { type: 'pill', color: '#1C1C1C' },
    { type: 'image', color: '#DDA0DD', emoji: '🎨', span: 1.5, rounded: true },
  ],
];

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonAnim = useRef(new Animated.Value(60)).current;
  const gridOpacity = useRef(new Animated.Value(0)).current;
  const gridScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Sıralı animasyonlar
    Animated.sequence([
      // Header fade in
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
      ]),
      // Grid fade in
      Animated.parallel([
        Animated.timing(gridOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(gridScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Button slide up
      Animated.spring(buttonAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderGridItem = (item, index) => {
    if (item.type === 'dot') {
      return (
        <View
          key={index}
          style={[
            styles.dotItem,
            { backgroundColor: item.color }
          ]}
        />
      );
    }

    if (item.type === 'pill') {
      return (
        <View
          key={index}
          style={[
            styles.pillItem,
            { backgroundColor: item.color }
          ]}
        />
      );
    }

    if (item.type === 'image') {
      return (
        <View
          key={index}
          style={[
            styles.imageItem,
            {
              backgroundColor: item.color,
              width: ITEM_SIZE * (item.span || 1) + 8 * ((item.span || 1) - 1),
              borderRadius: item.rounded ? 100 : 24,
            }
          ]}
        >
          <Text style={styles.imageEmoji}>{item.emoji}</Text>
        </View>
      );
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
            }
          ]}
        >
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>🎯</Text>
            </View>
            <Text style={styles.logoText}>VibeR</Text>
          </View>
          <Text style={styles.tagline}>RUH HALİNE GÖRE KEŞFET</Text>
        </Animated.View>

        {/* Grid */}
        <Animated.View
          style={[
            styles.gridWrapper,
            {
              opacity: gridOpacity,
              transform: [{ scale: gridScale }],
            }
          ]}
        >
          {GRID_DATA.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map((item, itemIndex) => renderGridItem(item, `${rowIndex}-${itemIndex}`))}
            </View>
          ))}
        </Animated.View>

        {/* Bottom */}
        <Animated.View
          style={[
            styles.bottom,
            {
              opacity: fadeAnim,
              transform: [{ translateY: buttonAnim }],
            }
          ]}
        >
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.mainButtonText}>Başla</Text>
          </TouchableOpacity>

          <View style={styles.linksRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.linkText}>Kayıt Ol</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.linkText}>Misafir Girişi</Text>
            </TouchableOpacity>
          </View>
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

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoIcon: {
    fontSize: 26,
  },
  logoText: {
    fontSize: 38,
    fontWeight: '700',
    color: '#1C1C1C',
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9C9C9C',
    letterSpacing: 4,
  },

  // Grid
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  dotItem: {
    width: ITEM_SIZE * 0.6,
    height: ITEM_SIZE * 0.9,
    borderRadius: 14,
  },
  pillItem: {
    width: ITEM_SIZE * 0.5,
    height: ITEM_SIZE * 1.2,
    borderRadius: 20,
  },
  imageItem: {
    height: ITEM_SIZE * 1.1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageEmoji: {
    fontSize: 36,
  },

  // Bottom
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  mainButton: {
    backgroundColor: '#1C1C1C',
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#1C1C1C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  mainButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9C9C9C',
  },
  separator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D8D8D8',
    marginHorizontal: 18,
  },
});