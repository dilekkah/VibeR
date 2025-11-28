import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import MoodSelectionScreen from './src/screens/MoodSelectionScreen';
import CompanionFilterScreen from './src/screens/CompanionFilterScreen';
import NeedFilterScreen from './src/screens/NeedFilterScreen';
import RecommendationScreen from './src/screens/RecommendationScreen';
import AmbientControlScreen from './src/screens/AmbientControlScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import RatingScreen from './src/screens/RatingScreen';

// Yeni Ekranlar
import ProfileScreen from './src/screens/ProfileScreen';
import RouteGeneratorScreen from './src/screens/RouteGeneratorScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import ShareRecommendationScreen from './src/screens/ShareRecommendationScreen';
import MyRatingsScreen from './src/screens/MyRatingsScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const { theme } = useTheme();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('currentUser');
      if (userJson) {
        setInitialRoute('Home');
      } else {
        setInitialRoute('Welcome');
      }
    } catch (error) {
      console.error('Kullanıcı kontrolü hatası:', error);
      setInitialRoute('Welcome');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Giriş Yap',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            title: 'Hesap Oluştur',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Ana Sayfa',
            headerBackTitle: 'Geri',
            headerLeft: null,
          }}
        />
        <Stack.Screen
          name="MoodSelection"
          component={MoodSelectionScreen}
          options={{
            title: 'Ruh Hali Seçimi',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="CompanionFilter"
          component={CompanionFilterScreen}
          options={{
            title: 'Sosyal Tercih',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="NeedFilter"
          component={NeedFilterScreen}
          options={{
            title: 'İhtiyaç Filtresi',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="Recommendation"
          component={RecommendationScreen}
          options={{
            title: 'Öneriler',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="AmbientControl"
          component={AmbientControlScreen}
          options={{
            title: 'Gerçek Zamanlı Bilgi',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'Favorilerim',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="Rating"
          component={RatingScreen}
          options={{
            title: 'Değerlendirme',
            headerBackTitle: 'Geri',
          }}
        />

        {/* YENİ EKRANLAR */}
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profilim',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="RouteGenerator"
          component={RouteGeneratorScreen}
          options={{
            title: 'Rota Oluştur',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="Friends"
          component={FriendsScreen}
          options={{
            title: 'Arkadaşlarım',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="ShareRecommendation"
          component={ShareRecommendationScreen}
          options={{
            title: 'Öneri Gönder',
            headerBackTitle: 'Geri',
          }}
        />
        <Stack.Screen
          name="MyRatings"
          component={MyRatingsScreen}
          options={{
            title: 'Değerlendirmelerim',
            headerBackTitle: 'Geri',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
