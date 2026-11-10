import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';

import { LoginScreen, RegisterScreen } from './screens/AuthScreens';
import MarketScreen from './screens/MarketScreen';
import TradeDetailScreen from './screens/TradeDetailScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Market" component={MarketScreen} options={{ title: 'Live Market' }} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} options={{ title: 'My Portfolio' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Trade Ledger' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen
                name="Root"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="TradeDetail"
                component={TradeDetailScreen}
                options={{ title: 'Execute Order' }}
              />
            </>
          ) : (
            <>
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
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}