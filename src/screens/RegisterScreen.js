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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
// LinearGradient kullanmıyoruz - isteğe bağlı
// import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const { theme } = useTheme();

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;
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
  }, []);

  useEffect(() => {
    // Progress bar animasyonu
    Animated.timing(progressAnim, {
      toValue: step === 1 ? 0.5 : 1,
      duration: 400,
      useNativeDriver: false,
    }).start();

    // Adım geçiş animasyonu
    Animated.sequence([
      Animated.timing(stepAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(stepAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleNext = () => {
    if (!name || !email) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
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
    ]).start(() => {
      setStep(2);
    });
  };

  const handleRegister = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
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

      const existingUser = users.find((u) => u.email === email);
      if (existingUser) {
        Alert.alert('Hata', 'Bu e-posta adresi zaten kayıtlı');
        setLoading(false);
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));

      // Başarılı kayıt animasyonu
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Alert.alert('Başarılı', 'Hesabınız oluşturuldu!', [
          { text: 'Tamam', onPress: () => navigation.replace('Home') },
        ]);
      });
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
    },
    progressContainer: {
      position: 'absolute',
      top: 60,
      left: 24,
      right: 24,
      zIndex: 10,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 2,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    stepText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    stepTextActive: {
      color: theme.primary,
    },
    header: {
      alignItems: 'center',
      marginBottom: 48,
      marginTop: 80,
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
      textAlign: 'center',
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
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 10,
    },
    backButton: {
      flex: 1,
      backgroundColor: theme.secondaryBackground,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.border,
    },
    backButtonText: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '700',
    },
    nextButton: {
      flex: 2,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    nextButtonSolid: {
      backgroundColor: theme.primary,
      padding: 20,
      alignItems: 'center',
    },
    registerButton: {
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    registerButtonSolid: {
      backgroundColor: theme.primary,
      padding: 20,
      alignItems: 'center',
    },
    gradientButton: {
      padding: 20,
      alignItems: 'center',
      borderRadius: 16,
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    loginPrompt: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      padding: 16,
      backgroundColor: theme.secondaryBackground,
      borderRadius: 12,
    },
    loginPromptText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    loginLink: {
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
    passwordStrength: {
      marginTop: 8,
      marginLeft: 4,
    },
    strengthText: {
      fontSize: 12,
      fontWeight: '600',
    },
    strengthWeak: {
      color: theme.error || '#EF4444',
    },
    strengthMedium: {
      color: '#F59E0B',
    },
    strengthStrong: {
      color: '#10B981',
    },
  });

  const getPasswordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { text: 'Zayıf', style: styles.strengthWeak };
    if (password.length < 10) return { text: 'Orta', style: styles.strengthMedium };
    return { text: 'Güçlü', style: styles.strengthStrong };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <SafeAreaView style={styles.container}>
      {/* Dekoratif arka plan daireleri */}
      <View style={[styles.decorativeCircle, styles.circle1]} />
      <View style={[styles.decorativeCircle, styles.circle2]} />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: progressWidth },
            ]}
          />
        </View>
        <View style={styles.stepIndicator}>
          <Text style={[styles.stepText, step === 1 && styles.stepTextActive]}>
            Kişisel Bilgiler
          </Text>
          <Text style={[styles.stepText, step === 2 && styles.stepTextActive]}>
            Güvenlik
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <Text style={styles.logoText}>✨</Text>
              </Animated.View>
              <Text style={styles.title}>Hesap Oluştur</Text>
              <Text style={styles.subtitle}>
                {step === 1 ? 'Kendini tanıtalım' : 'Hesabını güvenli tut'}
              </Text>
            </View>

            <Animated.View
              style={[
                styles.form,
                {
                  transform: [{ translateX: stepAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  })}],
                },
              ]}
            >
              {step === 1 ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Ad Soyad</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.input, name && styles.inputFocused]}
                        placeholder="Ahmet Yılmaz"
                        placeholderTextColor={theme.placeholder}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        autoCorrect={false}
                        autoComplete="name"
                        textContentType="name"
                        spellCheck={false}
                        smartQuotes={false}
                        smartDashes={false}
                      />
                    </View>
                  </View>

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
                      />
                    </View>
                  </View>

                  <Animated.View style={{ transform: [{ scale: buttonPressAnim }] }}>
                    <TouchableOpacity
                      style={[styles.nextButton, styles.nextButtonSolid]}
                      onPress={handleNext}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.buttonText}>İleri →</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Şifre</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.input, password && styles.inputFocused]}
                        placeholder="En az 6 karakter"
                        placeholderTextColor={theme.placeholder}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="password-new"
                        textContentType="newPassword"
                        spellCheck={false}
                        smartQuotes={false}
                        smartDashes={false}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🔒'}</Text>
                      </TouchableOpacity>
                    </View>
                    {passwordStrength && (
                      <View style={styles.passwordStrength}>
                        <Text style={[styles.strengthText, passwordStrength.style]}>
                          {passwordStrength.text}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Şifre Tekrar</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={[styles.input, confirmPassword && styles.inputFocused]}
                        placeholder="Şifrenizi tekrar girin"
                        placeholderTextColor={theme.placeholder}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="password-new"
                        textContentType="newPassword"
                        spellCheck={false}
                        smartQuotes={false}
                        smartDashes={false}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '🔒'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setStep(1)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.backButtonText}>← Geri</Text>
                    </TouchableOpacity>

                    <Animated.View style={[{ flex: 2 }, { transform: [{ scale: buttonPressAnim }] }]}>
                      <TouchableOpacity
                        style={[styles.registerButton, styles.registerButtonSolid]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buttonText}>
                          {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </>
              )}

              <View style={styles.loginPrompt}>
                <Text style={styles.loginPromptText}>Zaten hesabın var mı? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Giriş Yap</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
