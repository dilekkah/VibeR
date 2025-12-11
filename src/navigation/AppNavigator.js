import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Ekranları import et
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MoodSelectionScreen from '../screens/MoodSelectionScreen';
import CompanionFilterScreen from '../screens/CompanionFilterScreen';
import NeedFilterScreen from '../screens/NeedFilterScreen';
import AmbientControlScreen from '../screens/AmbientControlScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import FriendsScreen from '../screens/FriendsScreen';
import MyRatingsScreen from '../screens/MyRatingsScreen';
import RatingScreen from '../screens/RatingScreen';
import RouteGeneratorScreen from '../screens/RouteGeneratorScreen';
import FeedScreen from '../screens/FeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LiveStatusScreen from '../screens/LiveStatusScreen';
import CreatePostScreen from '../screens/CreatePostScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Welcome"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          cardStyle: { backgroundColor: '#f8f9fa' },
        }}
      >
        {/* Auth Screens */}
        {!user ? (
          <>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            {/* Main App Screens */}
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Ruh Hali Haritası',
                headerShown: true
              }}
            />

            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: 'Profil' }}
            />

            <Stack.Screen
              name="MoodSelection"
              component={MoodSelectionScreen}
              options={{ title: 'Ruh Halini Seç' }}
            />

            <Stack.Screen
              name="CompanionFilter"
              component={CompanionFilterScreen}
              options={{ title: 'Kiminle?' }}
            />

            <Stack.Screen
              name="NeedFilter"
              component={NeedFilterScreen}
              options={{ title: 'Neye İhtiyacın Var?' }}
            />

            <Stack.Screen
              name="AmbientControl"
              component={AmbientControlScreen}
              options={{ title: 'Ortam Kontrolü' }}
            />

            <Stack.Screen
              name="Recommendation"
              component={RecommendationScreen}
              options={{ title: 'Öneriler' }}
            />

            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ title: 'Favoriler' }}
            />

            <Stack.Screen
              name="Friends"
              component={FriendsScreen}
              options={{ title: 'Arkadaşlar' }}
            />

            <Stack.Screen
              name="MyRatings"
              component={MyRatingsScreen}
              options={{ title: 'Değerlendirmelerim' }}
            />

            <Stack.Screen
              name="Rating"
              component={RatingScreen}
              options={{ title: 'Değerlendirme Yap' }}
            />

            <Stack.Screen
              name="RouteGenerator"
              component={RouteGeneratorScreen}
              options={{ title: 'Rota Oluştur' }}
            />

            <Stack.Screen
              name="Feed"
              component={FeedScreen}
              options={{ title: 'Akış' }}
            />

            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="LiveStatus"
              component={LiveStatusScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
