import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARTISTS } from '../../constants/artists';
import { TIERS } from '../../constants/tiers';
import { NFT_THEMES } from '../../constants/nftThemes';
import { calculatePoints, getTierByPurchaseOrder } from '../pointsCalculator';
import { generateNFTDetails } from '../../utils/nftGenerator';

// 테스트 데이터 생성을 위한 상수 정의
const EVENTS = [
  {
    id: 'chanwon_debut',
    name: '이찬원 데뷔 기념 NFT',
    description: '이찬원의 데뷔를 기념하는 특별한 NFT 컬렉션',
    imageIndex: 1
  },
  {
    id: 'chanwon_concert',
    name: '이찬원 전국투어 콘서트 기념 NFT',
    description: '이찬원의 첫 전국투어 콘서트를 기념하는 특별한 NFT',
    imageIndex: 2
  },
  {
    id: 'chanwon_album',
    name: '이찬원 정규 1집 발매 기념 NFT',
    description: '이찬원의 첫 정규앨범 발매를 기념하는 특별한 NFT',
    imageIndex: 3
  }
];

// 이찬원 이미지 매핑
const ARTIST_IMAGES = {
  chanwon: [
    require('../../../assets/artists/chanwon/profile.jpg'),
    require('../../../assets/artists/chanwon/chanwon2.jpg'),
    require('../../../assets/artists/chanwon/chanwon3.jpg')
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
    description: generateNFTDescription(eventName),
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
const generateNFTDescription = (eventName) => {
  const feature = COIN_FEATURES[Math.floor(Math.random() * COIN_FEATURES.length)];
  const design = COIN_DESIGNS[Math.floor(Math.random() * COIN_DESIGNS.length)];
  const limitedCount = Math.floor(Math.random() * 3000) + 2000;
  
  return `${eventName}을 기념하여 제작된 한정판 주화입니다. ${feature} ${design} 전 세계 ${limitedCount}개 한정 제작되었으며, 실물 주화 구매자에게만 제공되는 NFT입니다.`;
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
        const currentPoints = calculatePointsLocally(tier, purchaseOrder, currentSales);
        
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
