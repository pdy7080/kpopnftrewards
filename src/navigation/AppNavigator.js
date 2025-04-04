// AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';
import { ROUTES, SCREEN_TITLES } from '../constants/navigation';

// 메인 화면
import ArtistSelectionScreen from '../screens/ArtistSelectionScreen';
import HomeScreen from '../screens/HomeScreen';
import NFTDetailScreen from '../screens/NFTDetailScreen';
import NFTCollectionScreen from '../screens/NFTCollectionScreen';
import NFTFusionScreen from '../screens/NFTFusionScreen';
import QRScanScreen from '../screens/QRScanScreen';
import NFTAcquisitionSuccessScreen from '../screens/NFTAcquisitionSuccessScreen';
import BenefitsScreen from '../screens/BenefitsScreen';
import FansignApplicationScreen from '../screens/FansignApplicationScreen';
import ConcertTicketScreen from '../screens/ConcertTicketScreen';
import ExclusiveContentScreen from '../screens/ExclusiveContentScreen';

// 관리자 화면
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* 메인 화면들 */}
      <Stack.Group>
        <Stack.Screen
          name={ROUTES.ARTIST_SELECTION}
          component={ArtistSelectionScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.ARTIST_SELECTION],
          }}
        />
        <Stack.Screen
          name={ROUTES.HOME}
          component={HomeScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.HOME],
          }}
        />
        <Stack.Screen
          name={ROUTES.NFT_DETAIL}
          component={NFTDetailScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.NFT_DETAIL],
          }}
        />
        <Stack.Screen
          name={ROUTES.NFT_COLLECTION}
          component={NFTCollectionScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.NFT_COLLECTION],
          }}
        />
        <Stack.Screen
          name={ROUTES.NFT_FUSION}
          component={NFTFusionScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.NFT_FUSION],
          }}
        />
        <Stack.Screen
          name={ROUTES.QR_SCAN}
          component={QRScanScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.QR_SCAN],
          }}
        />
        <Stack.Screen
          name={ROUTES.NFT_ACQUISITION_SUCCESS}
          component={NFTAcquisitionSuccessScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.NFT_ACQUISITION_SUCCESS],
          }}
        />
        <Stack.Screen
          name={ROUTES.BENEFITS}
          component={BenefitsScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.BENEFITS],
          }}
        />
        <Stack.Screen
          name={ROUTES.FANSIGN_APPLICATION}
          component={FansignApplicationScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.FANSIGN_APPLICATION],
          }}
        />
        <Stack.Screen
          name={ROUTES.CONCERT_TICKET}
          component={ConcertTicketScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.CONCERT_TICKET],
          }}
        />
        <Stack.Screen
          name={ROUTES.EXCLUSIVE_CONTENT}
          component={ExclusiveContentScreen}
          options={{
            title: SCREEN_TITLES[ROUTES.EXCLUSIVE_CONTENT],
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