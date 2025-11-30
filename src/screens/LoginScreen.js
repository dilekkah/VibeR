import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Mini grid verileri (dekoratif)
const MINI_GRID = [
  [
    { type: 'dot', color: '#E5E2DD' },
    { type: 'pill', color: '#1C1C1C' },
    { type: 'dot', color: '#E5E2DD' },
  ],
  [
    { type: 'pill', color: '#E5E2DD' },
    { type: 'image', color: '#6B5B95', emoji: '🔐' },
    { type: 'pill', color: '#E5E2DD' },
  ],
  [
    { type: 'dot', color: '#E5E2DD' },
    { type: 'pill', color: '#1C1C1C' },
    { type: 'dot', color: '#E5E2DD' },
  ],
];

export default function LoginScreen({ navigation }) {
  // Tüm useState'ler en üstte ve koşulsuz olmalı
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Tüm useRef'ler
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const formAnim = useRef(new Animated.Value(30)).current;
  const buttonAnim = useRef(new Animated.Value(50)).current;
  const gridScale = useRef(new Animated.Value(0.8)).current;
  const gridRotate = useRef(new Animated.Value(0)).current;

  // useEffect
  useEffect(() => {
    Animated.sequence([
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
        Animated.spring(gridScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(formAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(gridRotate, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(gridRotate, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, gridScale, formAnim, buttonAnim, gridRotate]);

  // Normal fonksiyonlar (hook değil)
  const validateEmail = (emailValue) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailValue);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }

    setLoading(true);

    try {
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        navigation.replace('Home');
      } else {
        Alert.alert('Hata', 'E-posta veya şifre hatalı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const gridRotateInterpolate = gridRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });

  const renderMiniGridItem = (item, index) => {
    if (item.type === 'dot') {
      return (
        <View
          key={index}
          style={[styles.miniDot, { backgroundColor: item.color }]}
        />
      );
    }
    if (item.type === 'pill') {
      return (
        <View
          key={index}
          style={[styles.miniPill, { backgroundColor: item.color }]}
        />
      );
    }
    if (item.type === 'image') {
      return (
        <View
          key={index}
          style={[styles.miniImage, { backgroundColor: item.color }]}
        >
          <Text style={styles.miniEmoji}>{item.emoji}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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

              <View style={styles.logoRow}>
                <View style={styles.logoBox}>
                  <Text style={styles.logoIcon}>🎯</Text>
                </View>
                <Text style={styles.logoText}>VibeR</Text>
              </View>
            </Animated.View>

            {/* Decorative Mini Grid */}
            <Animated.View
              style={[
                styles.miniGridWrapper,
                {
                  opacity: fadeAnim,
                  transform: [
                    { scale: gridScale },
                    { rotate: gridRotateInterpolate },
                  ],
                },
              ]}
            >
              {MINI_GRID.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.miniGridRow}>
                  {row.map((item, itemIndex) =>
                    renderMiniGridItem(item, `${rowIndex}-${itemIndex}`)
                  )}
                </View>
              ))}
            </Animated.View>

            {/* Title */}
            <Animated.View
              style={[
                styles.titleSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.title}>Hoş Geldin!</Text>
              <Text style={styles.subtitle}>
                Hesabına giriş yap ve keşfetmeye başla
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: formAnim }],
                },
              ]}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'email' && styles.inputWrapperFocused,
                  ]}
                >
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ornek@email.com"
                    placeholderTextColor="#A0A0A0"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {validateEmail(email) && (
                    <Text style={styles.checkIcon}>✓</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Şifre</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'password' && styles.inputWrapperFocused,
                  ]}
                >
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#A0A0A0"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeIcon}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>Şifreni mi unuttun?</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Bottom Section */}
            <Animated.View
              style={[
                styles.bottomSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: buttonAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.mainButton, loading && styles.mainButtonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.85}
                disabled={loading}
              >
                <Text style={styles.mainButtonText}>
                  {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </Text>
                {!loading && <Text style={styles.buttonArrow}>→</Text>}
              </TouchableOpacity>

              <View style={styles.registerPrompt}>
                <Text style={styles.registerPromptText}>Hesabın yok mu?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={styles.registerLink}>Kayıt Ol</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.guestButton}
                onPress={() => navigation.navigate('Home')}
                activeOpacity={0.8}
              >
                <Text style={styles.guestButtonText}>
                  Misafir Olarak Devam Et
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 16,
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    letterSpacing: -1,
  },
  miniGridWrapper: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  miniGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  miniDot: {
    width: 20,
    height: 30,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  miniPill: {
    width: 16,
    height: 40,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  miniImage: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  miniEmoji: {
    fontSize: 28,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1C',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#7C7C7C',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1C',
    marginLeft: 4,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#F0EEEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: '#1C1C1C',
    shadowOpacity: 0.08,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1C',
    fontWeight: '500',
  },
  checkIcon: {
    fontSize: 16,
    color: '#10B981',
    marginLeft: 8,
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    fontSize: 13,
    color: '#7C7C7C',
    fontWeight: '500',
  },
  bottomSection: {
    marginTop: 'auto',
  },
  mainButton: {
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
  mainButtonDisabled: {
    opacity: 0.7,
  },
  mainButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  buttonArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '300',
    marginLeft: 8,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  registerPromptText: {
    fontSize: 14,
    color: '#7C7C7C',
    marginRight: 6,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E2DD',
  },
  dividerText: {
    fontSize: 12,
    color: '#A0A0A0',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  guestButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E2DD',
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C7C7C',
  },
});