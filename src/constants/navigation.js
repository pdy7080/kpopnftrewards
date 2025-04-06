/**
 * 네비게이션 라우트 상수
 */
export const ROUTES = {
  // 메인 화면
  ARTIST_SELECTION: 'ArtistSelection',
  ARTIST_HOME: 'ArtistHome',
  HOME: 'Home',
  NFT_DETAIL: 'NFTDetail',
  NFT_COLLECTION: 'NFTCollection',
  NFT_FUSION: 'NFTFusion',
  QR_SCAN: 'QRScan',
  NFT_ACQUISITION_SUCCESS: 'NFTAcquisitionSuccess',
  BENEFITS: 'Benefits',
  FANSIGN_APPLICATION: 'FansignApplication',
  CONCERT_TICKET: 'ConcertTicket',
  EXCLUSIVE_CONTENT: 'ExclusiveContent',
  
  // 관리자 화면
  ADMIN: 'Admin',
  ADMIN_DASHBOARD: 'AdminDashboard',
  SALES_SIMULATION: 'SalesSimulation'
};

/**
 * 화면 제목 상수
 */
export const SCREEN_TITLES = {
  [ROUTES.ARTIST_SELECTION]: '아티스트 선택',
  [ROUTES.ARTIST_HOME]: '아티스트 홈',
  [ROUTES.HOME]: '홈',
  [ROUTES.NFT_DETAIL]: 'NFT 상세정보',
  [ROUTES.NFT_COLLECTION]: 'NFT 컬렉션',
  [ROUTES.NFT_FUSION]: 'NFT 합성',
  [ROUTES.QR_SCAN]: 'QR 스캔',
  [ROUTES.NFT_ACQUISITION_SUCCESS]: 'NFT 획득 성공',
  [ROUTES.BENEFITS]: '혜택',
  [ROUTES.FANSIGN_APPLICATION]: '팬사인회 응모',
  [ROUTES.CONCERT_TICKET]: '콘서트 티켓',
  [ROUTES.EXCLUSIVE_CONTENT]: '독점 콘텐츠',
  [ROUTES.ADMIN]: '관리자 모드',
  [ROUTES.ADMIN_DASHBOARD]: '관리자 대시보드',
  [ROUTES.SALES_SIMULATION]: '판매량-포인트 시뮬레이션'
};
