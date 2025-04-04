// navigation/navigationConfig.js
import { Platform } from 'react-native';
import { TransitionPresets } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';

/**
 * 스택 네비게이션 공통 설정
 */
export const stackNavigationConfig = {
  // 헤더 스타일
  headerStyle: {
    backgroundColor: COLORS.primary,
    elevation: 4, // Android용 그림자
    shadowOpacity: 0.3, // iOS용 그림자
  },
  headerTintColor: 'white',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  headerBackTitleVisible: false,
  headerTitleAlign: 'center',
  
  // 화면 전환 효과 (iOS와 비슷한 슬라이드)
  ...Platform.select({
    ios: {},
    android: TransitionPresets.SlideFromRightIOS
  }),
};

/**
 * 모달 네비게이션 공통 설정
 */
export const modalNavigationConfig = {
  // 모달 전환 효과 (아래에서 위로)
  ...TransitionPresets.ModalPresentationIOS,
  cardOverlayEnabled: true,
  headerShown: false,
};

/**
 * 탭 네비게이션 공통 설정
 */
export const tabNavigationConfig = {
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: '#777',
  tabBarLabelStyle: {
    fontSize: 12,
  },
  tabBarStyle: {
    backgroundColor: 'white',
    borderTopColor: '#eee',
    height: Platform.OS === 'ios' ? 90 : 60,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 5,
  },
  headerShown: false,
};

/**
 * NFT 상세 정보 화면 옵션
 */
export const nftDetailScreenOptions = {
  // 투명 헤더
  headerTransparent: true,
  headerTintColor: 'white',
  headerTitle: '',
};

/**
 * 스캔 화면 옵션
 */
export const scanScreenOptions = {
  headerShown: false,
};

/**
 * 모달 화면 옵션
 */
export const modalScreenOptions = {
  presentation: 'modal',
  headerShown: false,
};