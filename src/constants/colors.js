export const COLORS = {
  primary: '#6200EA',
  secondary: '#03DAC6',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  white: '#FFFFFF',
  black: '#000000',
  text: '#212121',
  textSecondary: '#757575',
  background: '#F5F5F5',
  
  // 아티스트별 테마 컬러
  gidle: {
    primary: '#1A237E',
    secondary: '#6A1B9A',
    accent: '#FFD700',
  },
  bibi: {
    primary: '#D32F2F',
    secondary: '#212121',
    accent: '#FFC107',
  },
  chanwon: {
    primary: '#004D40',
    secondary: '#37474F',
    accent: '#FFB300',
  },
  
  // 티어별 컬러
  tiers: {
    fan: '#8BC34A',
    supporter: '#03A9F4',
    earlybird: '#7E57C2',
    founders: '#F9A825',
  },
};

export const SIZES = {
  // 전역 사이즈
  base: 8,
  font: 14,
  radius: 12,
  padding: 16,
  
  // 폰트 사이즈
  h1: 30,
  h2: 24,
  h3: 18,
  h4: 16,
  body1: 16,
  body2: 14,
  body3: 12,
  body4: 10,
  
  // 앱 사이즈
  width: '100%',
  height: '100%',
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold' },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold' },
  h3: { fontSize: SIZES.h3, fontWeight: 'bold' },
  h4: { fontSize: SIZES.h4, fontWeight: 'bold' },
  body1: { fontSize: SIZES.body1 },
  body2: { fontSize: SIZES.body2 },
  body3: { fontSize: SIZES.body3 },
  body4: { fontSize: SIZES.body4 },
};
