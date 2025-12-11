import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Ekranları import et
import HomeScreen from '../screens/HomeScreen';
import MoodSelectionScreen from '../screens/MoodSelectionScreen';
import CompanionFilterScreen from '../screens/CompanionFilterScreen';
import NeedFilterScreen from '../screens/NeedFilterScreen';
import AmbientControlScreen from '../screens/AmbientControlScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import FriendsScreen from '../screens/FriendsScreen';
import MyRatingsScreen from '../screens/MyRatingsScreen';
import RouteGeneratorScreen from '../screens/RouteGeneratorScreen';
import FeedScreen from '../screens/FeedScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
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
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Ruh Hali Haritası',
            headerShown: true
          }}
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
          name="RouteGenerator"
          component={RouteGeneratorScreen}
          options={{ title: 'Rota Oluştur' }}
        />

        <Stack.Screen
          name="Feed"
          component={FeedScreen}
          options={{ title: 'Akış' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
