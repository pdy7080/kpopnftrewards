// app.js
import React, { useEffect } from 'react';
import * as Updates from 'expo-updates';
import { 
  UIManager, 
  Platform, 
  LogBox,
  TouchableOpacity,
  View,
  Alert
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

// 업데이트 확인 함수
async function checkUpdates() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      Alert.alert(
        "업데이트 알림",
        "새로운 버전이 있습니다. 업데이트하시겠습니까?",
        [
          {
            text: "나중에",
            style: "cancel"
          },
          {
            text: "업데이트",
            onPress: async () => {
              try {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              } catch (error) {
                Alert.alert("오류", "업데이트 중 문제가 발생했습니다.");
              }
            }
          }
        ]
      );
    }
  } catch (error) {
    console.log('업데이트 확인 중 오류:', error);
  }
}

const App = () => {
  useEffect(() => {
    checkUpdates();
  }, []);

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