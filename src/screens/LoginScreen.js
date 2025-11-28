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
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
// LinearGradient kullanmıyoruz - isteğe bağlı
// import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonPressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sayfa açılış animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo rotasyon animasyonu
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    // Buton press animasyonu
    Animated.sequence([
      Animated.timing(buttonPressAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonPressAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    try {
      const usersJson = await AsyncStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];

      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));

        // Başarılı giriş animasyonu
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Alert.alert('Başarılı', 'Giriş yapıldı!', [
            { text: 'Tamam', onPress: () => navigation.replace('Home') },
          ]);
        });
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

  const handleInputFocus = () => {
    Animated.spring(inputFocusAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handleInputBlur = () => {
    Animated.spring(inputFocusAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: theme.shadowColor || '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    logoText: {
      fontSize: 48,
      color: '#fff',
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    form: {
      width: '100%',
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      backgroundColor: theme.inputBackground,
      borderRadius: 16,
      padding: 18,
      paddingRight: 50,
      fontSize: 16,
      borderWidth: 2,
      borderColor: theme.border,
      color: theme.text,
      shadowColor: theme.shadowColor || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    inputFocused: {
      borderColor: theme.primary,
      shadowOpacity: 0.15,
    },
    eyeButton: {
      position: 'absolute',
      right: 16,
      top: 18,
    },
    eyeIcon: {
      fontSize: 24,
    },
    loginButton: {
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 10,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    loginButtonSolid: {
      backgroundColor: theme.primary,
      padding: 20,
      alignItems: 'center',
    },
    gradientButton: {
      padding: 20,
      alignItems: 'center',
      borderRadius: 16,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    registerPrompt: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      padding: 16,
      backgroundColor: theme.secondaryBackground,
      borderRadius: 12,
    },
    registerPromptText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    registerLink: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: 'bold',
    },
    decorativeCircle: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: theme.primary,
      opacity: 0.05,
    },
    circle1: {
      top: -100,
      right: -100,
    },
    circle2: {
      bottom: -80,
      left: -80,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Dekoratif arka plan daireleri */}
      <View style={[styles.decorativeCircle, styles.circle1]} />
      <View style={[styles.decorativeCircle, styles.circle2]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ rotate: logoRotateInterpolate }],
                },
              ]}
            >
              <Text style={styles.logoText}>🎯</Text>
            </Animated.View>
            <Text style={styles.title}>Hoş Geldin!</Text>
            <Text style={styles.subtitle}>Hesabına giriş yap</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-posta</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, email && styles.inputFocused]}
                  placeholder="ornek@email.com"
                  placeholderTextColor={theme.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  spellCheck={false}
                  smartQuotes={false}
                  smartDashes={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Şifre</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, password && styles.inputFocused]}
                  placeholder="********"
                  placeholderTextColor={theme.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  spellCheck={false}
                  smartQuotes={false}
                  smartDashes={false}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🔒'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View style={{ transform: [{ scale: buttonPressAnim }] }}>
              <TouchableOpacity
                style={[styles.loginButton, styles.loginButtonSolid]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.registerPrompt}>
              <Text style={styles.registerPromptText}>Hesabın yok mu? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Hesap Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
