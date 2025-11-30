import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default değerlerle context oluştur
const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => { },
  theme: null,
  isLoading: true,
});

// Güvenli useTheme hook - hata fırlatmaz
export const useTheme = () => {
  const context = useContext(ThemeContext);
  // Context yoksa default değerler döndür
  if (!context) {
    console.warn('useTheme: ThemeProvider bulunamadı, default değerler kullanılıyor');
    return {
      isDarkMode: false,
      toggleTheme: () => { },
      theme: lightTheme,
      isLoading: false,
    };
  }
  return context;
};

// Light Theme Colors
export const lightTheme = {
  // Backgrounds
  background: '#FAFAFA',
  cardBackground: '#FFFFFF',
  secondaryBackground: '#F8F9FA',
  inputBackground: '#FFFFFF',

  // Text
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // Primary Colors
  primary: '#6B46C1',
  primaryLight: '#F8F4FF',

  // Accent Colors
  accent: '#007AFF',
  accentLight: '#E3F2FD',

  // Status Colors
  success: '#4CAF50',
  error: '#FF3B30',
  warning: '#FFC107',

  // Borders & Dividers
  border: '#E0E0E0',
  divider: '#F0F0F0',

  // Shadows
  shadowColor: '#000000',

  // Other
  placeholder: '#999999',
  disabled: '#9CA3AF',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Feed Screen için ek renkler
  storyBorder: '#ef4444',
  storyBorderViewed: '#cccccc',
  likesText: '#1A1A1A',
  tagBackground: '#f5f5f5',
  tagText: '#ef4444',
  ratingBackground: '#fbbf24',
  priceText: '#4ade80',
  categoryBadgeBg: 'rgba(0,0,0,0.7)',
};

// Dark Theme Colors
export const darkTheme = {
  // Backgrounds
  background: '#000000',
  cardBackground: '#1A1A1A',
  secondaryBackground: '#0A0A0A',
  inputBackground: '#2C2C2C',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',

  // Primary Colors
  primary: '#8B6FD1',
  primaryLight: '#2A1F3D',

  // Accent Colors
  accent: '#0A84FF',
  accentLight: '#1C3A52',

  // Status Colors
  success: '#5DD879',
  error: '#FF453A',
  warning: '#FFD60A',

  // Borders & Dividers
  border: '#333333',
  divider: '#1A1A1A',

  // Shadows
  shadowColor: '#000000',

  // Other
  placeholder: '#808080',
  disabled: '#6B6B6B',
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Feed Screen için ek renkler
  storyBorder: '#ef4444',
  storyBorderViewed: '#444444',
  likesText: '#FFFFFF',
  tagBackground: '#1a1a1a',
  tagText: '#ef4444',
  ratingBackground: '#fbbf24',
  priceText: '#4ade80',
  categoryBadgeBg: 'rgba(0,0,0,0.85)',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('themeMode', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;