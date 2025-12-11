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
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [focusedInput, setFocusedInput] = useState(null);

  // Animasyonlar
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const formAnim = useRef(new Animated.Value(30)).current;
  const buttonAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0.5)).current;

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
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step === 1 ? 0.5 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const validateEmail = (emailValue) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailValue);
  };

  const handleNext = () => {
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Lütfen adınızı girin');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Hata', 'Lütfen kullanıcı adınızı girin');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!fullName || !username || !email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        fullName,
        username,
        email,
        password,
      });

      if (result.success) {
        Alert.alert('Hoş Geldin! 🎉', `${fullName}, hesabın başarıyla oluşturuldu!`, [
          { text: 'Başla' }, // Navigation otomatik olarak yapılacak
        ]);
      } else {
        Alert.alert('Hata', result.error || 'Kayıt başarısız');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir sorun oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Zayıf', color: '#EF4444', widthPercent: '33%' };
    if (password.length < 10) return { label: 'Orta', color: '#F59E0B', widthPercent: '66%' };
    return { label: 'Güçlü', color: '#10B981', widthPercent: '100%' };
  };

  const strength = getPasswordStrength();

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => (step === 1 ? navigation.goBack() : setStep(1))}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>

              {/* Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={[styles.progressLabel, step === 1 && styles.progressLabelActive]}>
                    Bilgiler
                  </Text>
                  <Text style={[styles.progressLabel, step === 2 && styles.progressLabelActive]}>
                    Güvenlik
                  </Text>
                </View>
              </View>
            </Animated.View>

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
                <Text style={styles.iconEmoji}>{step === 1 ? '👤' : '🔐'}</Text>
              </View>
              <Text style={styles.title}>
                {step === 1 ? 'Hesap Oluştur' : 'Şifreni Belirle'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1
                  ? 'Seni tanıyalım, hemen başlayalım'
                  : 'Hesabını güvende tutmak için güçlü bir şifre seç'}
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
              {step === 1 ? (
                <View style={styles.form}>
                  {/* Name Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Ad Soyad</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedInput === 'fullName' && styles.inputWrapperFocused,
                      ]}
                    >
                      <Text style={styles.inputIcon}>👤</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Adınız Soyadınız"
                        placeholderTextColor="#A0A0A0"
                        value={fullName}
                        onChangeText={setFullName}
                        onFocus={() => setFocusedInput('fullName')}
                        onBlur={() => setFocusedInput(null)}
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                      {fullName.length > 0 && <Text style={styles.checkIcon}>✓</Text>}
                    </View>
                  </View>

                  {/* Username Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedInput === 'username' && styles.inputWrapperFocused,
                      ]}
                    >
                      <Text style={styles.inputIcon}>@</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="kullaniciadi"
                        placeholderTextColor="#A0A0A0"
                        value={username}
                        onChangeText={setUsername}
                        onFocus={() => setFocusedInput('username')}
                        onBlur={() => setFocusedInput(null)}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      {username.length > 0 && <Text style={styles.checkIcon}>✓</Text>}
                    </View>
                  </View>

                  {/* Email Input */}
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
                      {validateEmail(email) && <Text style={styles.checkIcon}>✓</Text>}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.form}>
                  {/* Password Input */}
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
                        placeholder="En az 6 karakter"
                        placeholderTextColor="#A0A0A0"
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                      </TouchableOpacity>
                    </View>
                    {/* Password Strength */}
                    {strength && (
                      <View style={styles.strengthContainer}>
                        <View style={styles.strengthBar}>
                          <View
                            style={[
                              styles.strengthFill,
                              { width: strength.widthPercent, backgroundColor: strength.color },
                            ]}
                          />
                        </View>
                        <Text style={[styles.strengthLabel, { color: strength.color }]}>
                          {strength.label}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Confirm Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Şifre Tekrar</Text>
                    <View
                      style={[
                        styles.inputWrapper,
                        focusedInput === 'confirm' && styles.inputWrapperFocused,
                      ]}
                    >
                      <Text style={styles.inputIcon}>🔐</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Şifrenizi tekrar girin"
                        placeholderTextColor="#A0A0A0"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setFocusedInput('confirm')}
                        onBlur={() => setFocusedInput(null)}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                      </TouchableOpacity>
                    </View>
                    {confirmPassword.length > 0 && password === confirmPassword && (
                      <Text style={styles.matchText}>✓ Şifreler eşleşiyor</Text>
                    )}
                  </View>
                </View>
              )}
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
              {/* Main Button */}
              <TouchableOpacity
                style={[styles.mainButton, loading && styles.mainButtonDisabled]}
                onPress={step === 1 ? handleNext : handleRegister}
                activeOpacity={0.85}
                disabled={loading}
              >
                <Text style={styles.mainButtonText}>
                  {loading ? 'Oluşturuluyor...' : step === 1 ? 'Devam Et' : 'Hesap Oluştur'}
                </Text>
                {!loading && <Text style={styles.buttonArrow}>→</Text>}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginPrompt}>
                <Text style={styles.loginPromptText}>Zaten hesabın var mı?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Giriş Yap</Text>
                </TouchableOpacity>
              </View>

              {/* Terms */}
              <Text style={styles.termsText}>
                Devam ederek <Text style={styles.termsLink}>Kullanım Şartları</Text> ve{' '}
                <Text style={styles.termsLink}>Gizlilik Politikası</Text>'nı kabul etmiş olursun.
              </Text>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 20,
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
  progressContainer: {
    flex: 1,
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
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0A0A0',
    letterSpacing: 0.5,
  },
  progressLabelActive: {
    color: '#1C1C1C',
  },

  // Title Section
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
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#7C7C7C',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  // Form
  formContainer: {
    flex: 1,
  },
  form: {},
  inputGroup: {
    marginBottom: 20,
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

  // Password Strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E2DD',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 10,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  matchText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
    marginTop: 8,
  },

  // Bottom Section
  bottomSection: {
    marginTop: 32,
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
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#7C7C7C',
    marginRight: 6,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1C',
  },
  termsText: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#7C7C7C',
    fontWeight: '600',
  },
});