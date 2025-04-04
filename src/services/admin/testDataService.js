import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARTISTS } from '../../constants/artists';
import { TIERS } from '../../constants/tiers';
import { calculatePoints, getTierByPurchaseOrder } from '../pointsCalculator';
import { generateNFTDetails } from '../../utils/nftGenerator';

const EVENTS = {
  gidle: [
    'I-LAND 월드투어 기념 주화',
    '네버랜드 5주년 기념 주화',
    '퀸덤2 우승 기념 주화',
    '토마토소스 뮤직비디오 기념 주화',
    '아이들 팬미팅 한정판 주화'
  ],
  bibi: [
    '휴먼 앨범 발매 기념 주화',
    '아시아 투어 기념 주화',
    'BIBI UNIVERSE 콘서트 주화',
    '베스트 뮤지션 수상 기념 주화',
    'KAZINO 5억뷰 기념 주화'
  ],
  chanwon: [
    '미스터트롯 기념 주화',
    '첫 단독 콘서트 기념 주화',
    '국민가수 시즌1 주화',
    '신곡 우리 둘이 발매 기념 주화',
    '팬미팅 투어 한정판 주화'
  ]
};

/**
 * Fan 티어 NFT 생성 함수
 */
const createFanTierNFT = (artistId, memberId, eventName, imageIndex) => {
  const purchaseOrder = Math.floor(Math.random() * 4000) + 1000; // 1000-5000 범위
  const currentSales = purchaseOrder + Math.floor(Math.random() * 1000);
  
  // 멤버 ID에 이미지 인덱스 추가 (비비, 이찬원의 경우)
  const actualMemberId = (artistId === 'bibi' || artistId === 'chanwon') 
    ? `${memberId}${imageIndex + 1}`  // profile1, profile2 등으로 매핑
    : memberId;
  
  return {
    id: `test_${artistId}_fan_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    artistId,
    memberId: actualMemberId,
    name: `${eventName} NFT`,
    description: generateNFTDescription(artistId, eventName),
    tier: 'fan',
    initialPoints: TIERS.fan.initialPoints,
    currentPoints: TIERS.fan.initialPoints,
    initialSales: purchaseOrder,
    currentSales,
    createdAt: new Date().toISOString(),
    canFuse: true
  };
};

/**
 * NFT 설명 생성 함수
 */
const generateNFTDescription = (artistId, eventName) => {
  const artist = ARTISTS[artistId];
  const features = [
    '순은(99.9%) 소재에 특수 코팅 처리되어 있으며,',
    '24K 골드 도금 처리된 고급 합금 소재로,',
    '실버와 골드 투톤으로 제작되어 입체감이 돋보이며,',
    '홀로그램 특수 코팅이 적용된 티타늄 합금으로,'
  ];
  
  const designs = [
    '앞면에는 아티스트 로고, 뒷면에는 이벤트 엠블럼이 새겨져 있습니다.',
    '앞면에는 멤버들의 실루엣, 뒷면에는 기념 문구가 정교하게 새겨져 있습니다.',
    '양면에 홀로그래픽 효과가 적용된 아티스트 공식 엠블럼이 새겨져 있습니다.'
  ];
  
  const feature = features[Math.floor(Math.random() * features.length)];
  const design = designs[Math.floor(Math.random() * designs.length)];
  const limitedCount = Math.floor(Math.random() * 3000) + 2000;
  
  return `${eventName}을 기념하여 제작된 한정판 주화입니다. ${feature} ${design} 전 세계 ${limitedCount}개 한정 제작되었으며, 실물 주화 구매자에게만 제공되는 NFT입니다.`;
};

/**
 * 테스트 NFT 데이터 생성
 * 
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Object>} 결과 객체
 */
export const generateTestData = async (userId = 'user123') => {
  try {
    const nfts = [];
    
    // 각 아티스트별로 Fan 티어 NFT 생성
    Object.keys(ARTISTS).forEach(artistId => {
      const artist = ARTISTS[artistId];
      const events = EVENTS[artistId];
      
      // 각 아티스트별로 3개의 Fan 티어 NFT 생성
      for (let i = 0; i < 3; i++) {
        const memberId = artist.members[Math.floor(Math.random() * artist.members.length)];
        const eventName = events[Math.floor(Math.random() * events.length)];
        
        // 비비와 이찬원의 경우 순차적으로 다른 이미지 사용
        const actualMemberId = (artistId === 'bibi' || artistId === 'chanwon') 
          ? `${memberId}${i + 1}`  // profile1, profile2, profile3 순서대로 사용
          : memberId;
        
        const nft = {
          id: `test_${artistId}_fan_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
          artistId,
          memberId: actualMemberId,
          name: eventName,  // NFT 이름을 이벤트 이름으로 직접 사용
          description: generateNFTDescription(artistId, eventName),
          tier: 'fan',
          initialPoints: TIERS.fan.initialPoints,
          currentPoints: TIERS.fan.initialPoints,
          initialSales: Math.floor(Math.random() * 4000) + 1000,
          currentSales: Math.floor(Math.random() * 4000) + 1000,
          createdAt: new Date().toISOString(),
          canFuse: true
        };
        
        nfts.push(nft);
      }
    });
    
    // NFT 저장
    await AsyncStorage.setItem(`user_nfts_${userId}`, JSON.stringify(nfts));
    
    // 혜택 사용 내역 초기화
    const benefitUsage = {
      'gidle_fansign_1': {
        usedCount: 0,
        maxUses: 1,
        remainingUses: 1,
        lastUsedAt: null
      },
      'bibi_fansign_1': {
        usedCount: 0,
        maxUses: 1,
        remainingUses: 1,
        lastUsedAt: null
      },
      'chanwon_fansign_1': {
        usedCount: 0,
        maxUses: 1,
        remainingUses: 1,
        lastUsedAt: null
      }
    };
    
    await AsyncStorage.setItem(`benefit_usage_${userId}`, JSON.stringify(benefitUsage));
    
    // 활동 내역 초기화
    const activities = [];
    nfts.forEach(nft => {
      activities.push({
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        type: 'nft_acquisition',
        date: nft.createdAt,
        title: 'NFT 획득',
        detail: `${nft.name} (${TIERS[nft.tier].displayName} 티어)`
      });
    });
    
    await AsyncStorage.setItem(`user_activities_${userId}`, JSON.stringify(activities));
    
    return { success: true };
  } catch (error) {
    console.error('테스트 데이터 생성 오류:', error);
    return { success: false, error: error.message };
  }
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
    // 아티스트 정보 확인
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
    
    // 새 NFT 데이터 생성
    const nfts = [];
    const members = artist.members;
    
    // 티어별 NFT 개수 설정
    const tierCounts = {
      founders: 1,
      earlybird: 2,
      supporter: 3,
      fan: 3,
    };
    
    // 각 티어별로 NFT 생성
    Object.entries(tierCounts).forEach(([tier, count]) => {
      for (let i = 0; i < count; i++) {
        // 랜덤 멤버 선택
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
        const additionalSales = Math.floor(Math.random() * 10000);
        const currentSales = purchaseOrder + additionalSales;
        
        // 포인트 계산
        const currentPoints = calculatePoints(tier, purchaseOrder, currentSales);
        
        // NFT 이름 및 설명 생성
        const nftDetails = generateNFTDetails(artistId, member.id);
        
        // NFT 객체 생성
        nfts.push({
          id: `test_${artistId}_${tier}_${i}_${Date.now()}`,
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
        });
      }
    });
    
    // 기존 NFT와 새 NFT 합치기
    const allNFTs = [...existingNFTs, ...nfts];
    
    // NFT 저장
    await AsyncStorage.setItem(`user_nfts_${userId}`, JSON.stringify(allNFTs));
    
    // 혜택 사용 내역 가져오기
    const benefitUsageJson = await AsyncStorage.getItem(`benefit_usage_${userId}`);
    let benefitUsage = {};
    if (benefitUsageJson) {
      try {
        benefitUsage = JSON.parse(benefitUsageJson);
        // 해당 아티스트의 혜택 제거
        Object.keys(benefitUsage).forEach(key => {
          if (key.startsWith(artistId)) {
            delete benefitUsage[key];
          }
        });
      } catch (parseError) {
        console.error('혜택 사용 내역 파싱 오류:', parseError);
      }
    }
    
    // 해당 아티스트의 혜택 추가
    benefitUsage[`${artistId}_fansign_1`] = {
      usedCount: Math.floor(Math.random() * 3),
      maxUses: 5,
      remainingUses: 5 - Math.floor(Math.random() * 3),
      lastUsedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
    };
    
    // 혜택 사용 내역 저장
    await AsyncStorage.setItem(`benefit_usage_${userId}`, JSON.stringify(benefitUsage));
    
    return { success: true };
  } catch (error) {
    console.error('아티스트 테스트 데이터 생성 오류:', error);
    return { success: false, error: error.message };
  }
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
    const currentPoints = calculatePoints(tier, purchaseOrder, currentSales);
    
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
