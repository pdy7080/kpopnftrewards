// app.js
import React from 'react';
import { 
  UIManager, 
  Platform, 
  LogBox,
  TouchableOpacity,
  View
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { NFTProvider } from './contexts/NFTContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// 경고 메시지 무시
LogBox.ignoreLogs([
  'Reanimated',
  'Reduced motion',
  'AsyncStorage',
  'VirtualizedLists'
]);

// 터치 이벤트 최적화를 위한 설정
if (TouchableOpacity) {
  TouchableOpacity.defaultProps = {
    ...TouchableOpacity.defaultProps,
    activeOpacity: 0.7,
    delayPressIn: 0
  };
}

// 레이아웃 애니메이션 활성화 (Android)
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NFTProvider>
          <NavigationContainer>
            <View style={{ flex: 1 }}>
              <AppNavigator />
            </View>
          </NavigationContainer>
        </NFTProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;