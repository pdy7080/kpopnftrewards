// app.js
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 네비게이션
import AppNavigator from './navigation/AppNavigator';

// 컨텍스트
import { AppProvider } from './contexts/AppContext';
import { UserProvider } from './contexts/UserContext';
import { NFTProvider } from './contexts/NFTContext';

// 상수
import { COLORS } from './constants/colors';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <AppProvider>
        <UserProvider>
          <NFTProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </NFTProvider>
        </UserProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
};

export default App;