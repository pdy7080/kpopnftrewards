import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARTISTS } from '../../constants/artists';
import { TIERS } from '../../constants/tiers';
import { NFT_THEMES } from '../../constants/nftThemes';
import { calculatePoints, getTierByPurchaseOrder } from '../pointsCalculator';
import { generateNFTDetails } from '../../utils/nftGenerator';
import { MEMBER_IMAGES } from '../../constants/memberImages';

// 테스트 데이터 생성을 위한 상수 정의
const EVENTS = {
  FAN_SIGNING: 'fan_signing',
  MEET_AND_GREET: 'meet_and_greet',
  CONCERT: 'concert',
  FAN_MEETING: 'fan_meeting'
};

// 아티스트별 이미지 매핑
const ARTIST_IMAGES = {
  gidle: [
    require('../../../assets/artists/gidle/group1.jpg'),
    require('../../../assets/artists/gidle/group2.jpg'),
    require('../../../assets/artists/gidle/group3.jpg')
  ],
  bibi: [
    require('../../../assets/artists/bibi/profile1.jpg'),
    require('../../../assets/artists/bibi/profile2.jpg'),
    require('../../../assets/artists/bibi/profile3.jpg')
  ],
  chanwon: [
    require('../../../assets/artists/chanwon/profile1.jpg'),
    require('../../../assets/artists/chanwon/profile2.jpg'),
    require('../../../assets/artists/chanwon/profile3.jpg')
  ]
};

// NFT 테마 데이터
// 이미 import { NFT_THEMES } 으로 가져왔으므로 아래 코드는 제거
// const NFT_THEMES = {
//   gidle: [ ... ],
//   bibi: [ ... ],
//   chanwon: [ ... ]
// };

// 주화 특징 설명
const COIN_FEATURES = [
  '순은(99.9%) 소재에 특수 코팅 처리되어 있으며,',
  '24K 골드 도금으로 제작되었으며,',
  '티타늄 합금으로 제작된 프리미엄 주화로,',
  '특수 홀로그램 효과가 적용된 주화로,'
];

// 주화 디자인 설명
const COIN_DESIGNS = [
  '앞면에는 이찬원의 공식 프로필 이미지, 뒷면에는 아티스트 로고가 정교하게 새겨져 있습니다.',
  '양면에 정교한 부조 디자인과 각인된 시리얼 넘버가 있습니다.',
  '회전시 다양한 각도에서 다른 디자인이 보이는 특수 기술이 적용되었습니다.',
  '야광 잉크로 디테일이 강조되어 어두운 곳에서도 빛납니다.',
];

// 발행 수량 및 희소성 설명
const COIN_RARITY = [
  '전 세계 1,000개 한정 제작되었으며,',
  '공식 팬클럽 회원만을 위한 한정판으로,',
  '해당 행사 참여자에게만 제공된 희소성 높은 아이템으로,',
  '첫 번째 시리즈 중 단 500개만 발행된 레어 아이템입니다.',
];

// 소장 가치 설명
const COIN_VALUE = [
  '역사적 순간을 기념하는 소중한 컬렉터블 아이템입니다.',
  '향후 희소가치가 높아질 것으로 예상되는 투자 가치가 있는 아이템입니다.',
  '팬이라면 반드시 소장해야 할 핵심 컬렉션 아이템입니다.',
  '아티스트의 커리어 중 가장 중요한 순간을 담은 기념 아이템입니다.',
];

// 티어별 포인트 계산 헬퍼 함수 (로컬에서만 사용)
const calculatePointsLocally = (tier, purchaseOrder, currentSales) => {
  // 티어별 초기 포인트
  const initialPoints = TIERS[tier].initialPoints;
  
  // 판매량 증가에 따른 포인트 계산
  const salesIncrease = currentSales - purchaseOrder;
  
  // 티어별 마일스톤 사이즈 (판매량 증가 단위)
  const milestoneSize = {
    founders: 100,
    earlybird: 100,
    supporter: 250,
    fan: 500
  }[tier];
  
  // 마일스톤 달성 횟수
  const milestoneCount = Math.floor(salesIncrease / milestoneSize);
  
  // 티어별 마일스톤당 포인트 증가량
  const pointsPerMilestone = {
    founders: 3,
    earlybird: 2,
    supporter: 1,
    fan: 0.5
  }[tier];
  
  // 추가 포인트 계산
  const additionalPoints = milestoneCount * pointsPerMilestone;
  
  // 최종 포인트 계산
  return initialPoints + additionalPoints;
};

// NFT 특성 상수
const NFT_CHARACTERISTICS = {
  RARITY: ['common', 'rare', 'epic', 'legendary'],
  SEASON: ['spring', 'summer', 'autumn', 'winter'],
  EDITION: ['standard', 'limited', 'special']
};

// 랜덤 요소 선택 함수
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// 랜덤 날짜 생성 함수 (최근 1년 내)
const getRandomDate = () => {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
};

// NFT 이벤트 목록 (각 아티스트별 3개씩 고정)
const NFT_EVENTS = {
  gidle: [
    '2025 월드투어 기념 주화',
    '데뷔 7주년 기념 주화',
    'QUEENDOM 우승 기념 주화'
  ],
  bibi: [
    '첫 월드투어 기념 주화',
    '정규 2집 발매 기념 주화',
    '첫 돔투어 기념 주화'
  ],
  chanwon: [
    '미스터트롯 기념 주화',
    '첫 단독 콘서트 기념 주화',
    '전국투어 기념 주화'
  ]
};

// NFT 생성 함수 수정
const createNFT = (artistId, eventIndex) => {
  const artist = ARTISTS[artistId];
  if (!artist) {
    console.error(`Invalid artist ID: ${artistId}`);
    return null;
  }
  
  // 이벤트 이름과 이미지 가져오기
  const eventName = NFT_EVENTS[artistId][eventIndex];
  const image = ARTIST_IMAGES[artistId][eventIndex];
  
  // 주화 설명 생성
  const coinFeature = getRandomElement(COIN_FEATURES);
  const coinDesign = getRandomElement(COIN_DESIGNS);
  const coinRarity = getRandomElement(COIN_RARITY);
  const coinValue = getRandomElement(COIN_VALUE);
  
  const description = `${coinFeature} ${coinDesign} ${coinRarity} ${coinValue}`;
  
  // Fan 티어로 고정
  const tier = 'fan';
  
  // 구매 순번 범위 설정 (Fan 티어: 1001-5000)
  const purchaseOrderMin = 1001;
  const purchaseOrderMax = 5000;
  
  const purchaseOrder = Math.floor(Math.random() * (purchaseOrderMax - purchaseOrderMin + 1)) + purchaseOrderMin;
  const additionalSales = Math.floor(Math.random() * 1000);
  const currentSales = purchaseOrder + additionalSales;
  
  return {
    id: `${artistId}_event_${eventIndex}_${Date.now()}`,
    artistId,
    name: `${eventName} NFT`,
    description,
    tier,
    initialPoints: TIERS[tier].initialPoints,
    currentPoints: calculatePointsLocally(tier, purchaseOrder, currentSales),
    initialSales: purchaseOrder,
    currentSales,
    image,
    createdAt: getRandomDate().toISOString(),
    canFuse: true
  };
};

/**
 * 특정 아티스트의 테스트 데이터 생성
 * 
 * @param {string} artistId - 아티스트 ID
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Object>} 결과 객체
 */
export const generateArtistTestData = async (artistId, userId = 'user123') => {
  try {
    const artist = ARTISTS[artistId];
    if (!artist) {
      return { success: false, error: '유효하지 않은 아티스트 ID입니다.' };
    }
    
    // 기존 NFT 데이터 가져오기
    const existingNFTsJson = await AsyncStorage.getItem(`user_nfts_${userId}`);
    let existingNFTs = [];
    if (existingNFTsJson) {
      try {
        existingNFTs = JSON.parse(existingNFTsJson);
        // 해당 아티스트의 NFT 제거
        existingNFTs = existingNFTs.filter(nft => nft.artistId !== artistId);
      } catch (parseError) {
        console.error('NFT 데이터 파싱 오류:', parseError);
      }
    }
    
    const nfts = [];
    
    // 3개의 이벤트 NFT 생성
    for (let i = 0; i < 3; i++) {
      const nft = createNFT(artistId, i);
      if (nft) {
        nfts.push(nft);
      }
    }
    
    // 새 NFT와 기존 NFT 합치기
    const updatedNFTs = [...existingNFTs, ...nfts];
    
    // AsyncStorage에 저장
    await AsyncStorage.setItem(`user_nfts_${userId}`, JSON.stringify(updatedNFTs));
    
    return { success: true, nfts: updatedNFTs, nftsCount: nfts.length };
  } catch (error) {
    console.error('테스트 데이터 생성 오류:', error);
    return { success: false, error: error.message };
  }
};

// 모든 아티스트의 테스트 데이터 생성 함수
export const generateAllArtistsTestData = async (userId = 'user123') => {
  try {
    const results = [];
    const artistIds = Object.keys(ARTISTS);
    
    // 각 아티스트별로 테스트 데이터 생성
    for (const artistId of artistIds) {
      const result = await generateArtistTestData(artistId, userId);
      results.push(result);
      
      if (!result.success) {
        console.error(`${ARTISTS[artistId].name} 테스트 데이터 생성 실패:`, result.error);
      }
    }
    
    const success = results.every(result => result.success);
    const totalNFTs = results.reduce((sum, result) => sum + (result.nftsCount || 0), 0);
    
    return { 
      success, 
      totalNFTs,
      message: `총 ${totalNFTs}개의 NFT가 생성되었습니다. (${artistIds.length}명의 아티스트)`
    };
  } catch (error) {
    console.error('전체 테스트 데이터 생성 오류:', error);
    return { success: false, error: error.message };
  }
};

// 모든 아티스트의 테스트 데이터를 한 번에 생성하는 함수
export const generateAllTestData = async (userId = 'user123') => {
  try {
    // 기존 데이터 초기화
    await AsyncStorage.removeItem(`user_nfts_${userId}`);
    
    // 모든 아티스트의 테스트 데이터 생성
    const result = await generateAllArtistsTestData(userId);
    
    return result;
  } catch (error) {
    console.error('전체 테스트 데이터 생성 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 테스트용 NFT 데이터 생성
 */
export const generateTestData = () => {
  const testData = [];
  const basePrice = 100000; // 기본 가격 100,000원
  const totalSupply = 1000; // 총 발행량
  
  EVENTS.forEach((event, eventIndex) => {
    // NFT 등급별 설정
    const grades = ['normal', 'rare', 'unique'];
    const gradeMultipliers = [1, 2, 5]; // 등급별 가격 배율
    const gradeSupplyRatios = [0.7, 0.25, 0.05]; // 등급별 발행량 비율
    
    grades.forEach((grade, gradeIndex) => {
      const supply = Math.floor(totalSupply * gradeSupplyRatios[gradeIndex]);
      const price = basePrice * gradeMultipliers[gradeIndex];
      const sold = Math.floor(supply * (0.8 - (0.2 * gradeIndex))); // 등급이 높을수록 판매량 감소
      
      testData.push({
        id: `${event.id}_${grade}`,
        name: `${event.name} - ${grade.toUpperCase()}`,
        description: event.description,
        image: `../../assets/artists/chanwon/chanwon${event.imageIndex}.jpg`,
        price: price,
        totalSupply: supply,
        sold: sold,
        artistId: 'chanwon',
        grade: grade,
        createdAt: new Date(2024, eventIndex, 1).toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  });
  
  return testData;
};

/**
 * 판매량 시뮬레이션을 위한 테스트 데이터 생성
 * 
 * @param {string} artistId - 아티스트 ID
 * @param {string} tier - NFT 티어
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Object>} 결과 객체
 */
export const generateSalesSimulationData = async (artistId, tier, userId = 'user123') => {
  try {
    // 아티스트 정보 확인
    const artist = ARTISTS[artistId];
    if (!artist) {
      return { success: false, error: '유효하지 않은 아티스트 ID입니다.' };
    }
    
    // 티어 정보 확인
    if (!TIERS[tier]) {
      return { success: false, error: '유효하지 않은 티어입니다.' };
    }
    
    // 기존 NFT 데이터 가져오기
    const existingNFTsJson = await AsyncStorage.getItem(`user_nfts_${userId}`);
    let existingNFTs = [];
    if (existingNFTsJson) {
      try {
        existingNFTs = JSON.parse(existingNFTsJson);
        // 해당 아티스트와 티어의 NFT 제거
        existingNFTs = existingNFTs.filter(nft => 
          !(nft.artistId === artistId && nft.tier === tier)
        );
      } catch (parseError) {
        console.error('NFT 데이터 파싱 오류:', parseError);
      }
    }
    
    // 랜덤 멤버 선택
    const members = artist.members;
    const member = members[Math.floor(Math.random() * members.length)];
    
    // 티어별 구매 순번 범위 설정
    let purchaseOrderMin, purchaseOrderMax;
    switch (tier) {
      case 'founders':
        purchaseOrderMin = 1;
        purchaseOrderMax = 100;
        break;
      case 'earlybird':
        purchaseOrderMin = 101;
        purchaseOrderMax = 500;
        break;
      case 'supporter':
        purchaseOrderMin = 501;
        purchaseOrderMax = 1000;
        break;
      default: // fan
        purchaseOrderMin = 1001;
        purchaseOrderMax = 5000;
        break;
    }
    
    // 랜덤 구매 순번 생성
    const purchaseOrder = Math.floor(
      Math.random() * (purchaseOrderMax - purchaseOrderMin + 1)
    ) + purchaseOrderMin;
    
    // 현재 판매량 설정 (구매 순번 + 랜덤 추가 판매량)
    const additionalSales = Math.floor(Math.random() * 1000);
    const currentSales = purchaseOrder + additionalSales;
    
    // 포인트 계산
    const currentPoints = calculatePointsLocally(tier, purchaseOrder, currentSales);
    
    // NFT 이름 및 설명 생성
    const nftDetails = generateNFTDetails(artistId, member.id);
    
    // NFT 객체 생성
    const nft = {
      id: `sim_${artistId}_${tier}_${Date.now()}`,
      artistId,
      memberId: member.id,
      name: nftDetails.name,
      description: nftDetails.description,
      tier,
      initialPoints: TIERS[tier].initialPoints,
      currentPoints,
      initialSales: purchaseOrder,
      currentSales,
      createdAt: new Date().toISOString(),
      canFuse: true
    };
    
    // 기존 NFT와 새 NFT 합치기
    const allNFTs = [...existingNFTs, nft];
    
    // NFT 저장
    await AsyncStorage.setItem(`user_nfts_${userId}`, JSON.stringify(allNFTs));
    
    return { success: true, nft };
  } catch (error) {
    console.error('판매량 시뮬레이션 데이터 생성 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 앱 데이터 초기화
 */
export const resetAppData = async () => {
  try {
    const keysToRemove = [
      'user_nfts_',
      'benefit_usage_',
      'user_activities_',
      'fusion_history_'
    ];
    
    const keys = await AsyncStorage.getAllKeys();
    const keysToDelete = keys.filter(key => 
      keysToRemove.some(pattern => key.includes(pattern))
    );
    
    if (keysToDelete.length > 0) {
      await AsyncStorage.multiRemove(keysToDelete);
    }
    
    return { success: true };
  } catch (error) {
    console.error('데이터 초기화 오류:', error);
    return { success: false, error: error.message };
  }
};
