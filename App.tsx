import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  MD3DarkTheme,
  PaperProvider,
  adaptNavigationTheme,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { RootStackParamList, MainTabParamList } from './types';

import { LoginScreen, RegisterScreen } from './screens/AuthScreens';
import MarketScreen from './screens/MarketScreen';
import TradeDetailScreen from './screens/TradeDetailScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

const { DarkTheme: PaperNavDarkTheme } = adaptNavigationTheme({
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDarkTheme = {
  ...NavigationDarkTheme,
  ...PaperNavDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...PaperNavDarkTheme.colors,
  },
};

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#38bdf8',
    secondary: '#10b981',
    error: '#f43f5e',
    background: '#090d16',
    surface: '#131b2e',
    surfaceVariant: '#1e293b',
    onSurface: '#f1f5f9',
    outline: '#334155',
  },
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#090d16',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#1e293b',
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: '#f8fafc',
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: '#0c1322',
          borderTopColor: '#1e293b',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'chart-timeline-variant';
          if (route.name === 'Market') iconName = 'chart-timeline-variant';
          else if (route.name === 'Portfolio') iconName = 'wallet-outline';
          else if (route.name === 'History') iconName = 'history';
          else if (route.name === 'Profile') iconName = 'account-circle-outline';
          return <MaterialCommunityIcons name={iconName} size={size + 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Market" component={MarketScreen} options={{ title: 'Markets' }} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} options={{ title: 'Portfolio' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Ledger' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Account' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  return (
    <PaperProvider theme={theme}>
     <StatusBar style="light" />
      <NavigationContainer theme={CombinedDarkTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#090d16' },
            headerTintColor: '#38bdf8',
            headerTitleStyle: { fontWeight: '700', color: '#f8fafc' },
            contentStyle: { backgroundColor: '#090d16' },
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="Root" component={MainTabs} options={{ headerShown: false }} />
              <Stack.Screen
                name="TradeDetail"
                component={TradeDetailScreen}
                options={{ title: 'Place Market Order' }}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}