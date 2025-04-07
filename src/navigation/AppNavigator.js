// AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';
import { COLORS } from '../constants/colors';
import { ROUTES, SCREEN_TITLES } from '../constants/navigation';

// 메인 화면
import ArtistSelectionScreen from '../screens/ArtistSelectionScreen';
import ArtistHomeScreen from '../screens/ArtistHomeScreen';
import HomeScreen from '../screens/HomeScreen';
import NFTDetailScreen from '../screens/NFTDetailScreen';
import NFTDetailsScreen from '../screens/NFTDetailsScreen';
import NFTCollectionScreen from '../screens/NFTCollectionScreen';
import NFTFusionScreen from '../screens/NFTFusionScreen';
import { QRScanScreen } from '../screens/QRScanScreen';
import NFTAcquisitionSuccessScreen from '../screens/NFTAcquisitionSuccessScreen';
import BenefitsScreen from '../screens/BenefitsScreen';
import FansignApplicationScreen from '../screens/FansignApplicationScreen';
import ConcertApplicationScreen from '../screens/ConcertApplicationScreen';
import ConcertTicketScreen from '../screens/ConcertTicketScreen';
import ExclusiveContentScreen from '../screens/ExclusiveContentScreen';

// 관리자 화면
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();

const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: COLORS.background,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: COLORS.white,
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  cardStyle: { backgroundColor: COLORS.background },
  headerBackTitleVisible: false,
  gestureEnabled: Platform.OS === 'ios',
  animationEnabled: true,
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
      initialRouteName={ROUTES.ARTIST_SELECTION}
    >
      {/* 메인 화면들 */}
      <Stack.Group>
        <Stack.Screen
          name={ROUTES.ARTIST_SELECTION}
          component={ArtistSelectionScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.ARTIST_SELECTION],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.ARTIST_HOME}
          component={ArtistHomeScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.ARTIST_HOME],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.HOME}
          component={HomeScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.HOME],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.NFT_DETAIL}
          component={NFTDetailScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.NFT_DETAIL],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="NFTDetails"
          component={NFTDetailsScreen}
          options={{
            title: 'NFT 상세정보',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name={ROUTES.NFT_COLLECTION}
          component={NFTCollectionScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.NFT_COLLECTION],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.NFT_FUSION}
          component={NFTFusionScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.NFT_FUSION],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.QR_SCAN}
          component={QRScanScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.QR_SCAN],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.NFT_ACQUISITION_SUCCESS}
          component={NFTAcquisitionSuccessScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.NFT_ACQUISITION_SUCCESS],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.BENEFITS}
          component={BenefitsScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.BENEFITS],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.FANSIGN_APPLICATION}
          component={FansignApplicationScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.FANSIGN_APPLICATION],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.CONCERT_APPLICATION}
          component={ConcertApplicationScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.CONCERT_APPLICATION],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.CONCERT_TICKET}
          component={ConcertTicketScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.CONCERT_TICKET],
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.EXCLUSIVE_CONTENT}
          component={ExclusiveContentScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.EXCLUSIVE_CONTENT],
            headerShown: false,
          }}
        />
      </Stack.Group>

      {/* 관리자 화면 */}
      <Stack.Screen
        name="Admin"
        component={AdminNavigator}
        options={{
          headerShown: false,
          gestureEnabled: false,
          animationEnabled: true
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;