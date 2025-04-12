import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARTISTS } from '../../constants/artists';
import { TIERS } from '../../constants/tiers';
import { NFT_THEMES } from '../../constants/nftThemes';
import { calculatePoints, getTierByPurchaseOrder } from '../pointsCalculator';
import { generateNFTDetails } from '../../utils/nftGenerator';
import { MEMBER_IMAGES } from '../../constants/memberImages';
import { NFT_EVENTS } from '../../constants/nftThemes';
import { getUserNFTs } from '../nftService';

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

// 아티스트별 NFT 데이터
const ARTIST_NFT_DATA = {
  gidle: {
    members: ['miyeon', 'minnie', 'soyeon', 'yuqi', 'shuhua'],
    events: [
      '토마토소스 뮤직비디오 기념주화',
      'I-LAND 월드투어 기념주화',
      '네버랜드 5주년 기념주화',
      '퀸덤2 우승 기념주화'
    ],
    basePoints: {
      fan: 5,
      supporter: 10,
      earlybird: 20,
      founders: 30
    }
  },
  bibi: {
    members: ['bibi', 'bibi1', 'bibi2'],
    events: [
      '휴먼 앨범 발매 기념주화',
      '아시아 투어 기념주화',
      'BIBI UNIVERSE 콘서트 주화',
      'KAZINO 5억뷰 기념주화'
    ],
    basePoints: {
      fan: 5,
      supporter: 10,
      earlybird: 20,
      founders: 30
    }
  },
  chanwon: {
    members: ['chanwon', 'chanwon1', 'chanwon2'],
    events: [
      '미스터트롯 기념주화',
      '첫 단독 콘서트 기념주화',
      '국민가수 시즌1 주화',
      '신곡 우리 둘이 발매 기념주화'
    ],
    basePoints: {
      fan: 5,
      supporter: 10,
      earlybird: 20,
      founders: 30
    }
  }
};

// 랜덤 요소 선택 함수
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// 상수 정의
const DEFAULT_USER_ID = 'user123';
const NFT_STORAGE_KEY = (userId = DEFAULT_USER_ID) => `user_nfts_${userId}`;

// NFT 생성 함수 수정
const createNFT = (artistId, eventIndex, tier = 'fan', memberIndex = 0) => {
  try {
    const artist = ARTISTS[artistId];
    const artistData = ARTIST_NFT_DATA[artistId];
    
    if (!artist || !artistData) {
      console.error(`Invalid artist ID: ${artistId}`);
      return null;
    }
    
    // 티어별 구매 순번 범위 (Fan 티어만 사용)
    const purchaseOrderRange = { min: 1, max: 5000 };
    
    // 구매 순번 생성
    const initialSales = Math.floor(
      Math.random() * (purchaseOrderRange.max - purchaseOrderRange.min + 1)
    ) + purchaseOrderRange.min;
    
    // 현재 판매량 설정 (구매 순번 + 랜덤 추가 판매량)
    const additionalSales = Math.floor(Math.random() * 10000);
    const currentSales = initialSales + additionalSales;
    
    // 이벤트 정보
    const events = artistData.events;
    const event = events[eventIndex % events.length];
    
    // 멤버 선택
    const members = artistData.members;
    if (!members || members.length === 0) {
      throw new Error(`No members found for artist: ${artistId}`);
    }
    
    const memberId = members[memberIndex % members.length];
    
    // 설명 생성
    const coinFeature = getRandomElement(COIN_FEATURES);
    const coinDesign = getRandomElement(COIN_DESIGNS);
    const coinRarity = getRandomElement(COIN_RARITY);
    const coinValue = getRandomElement(COIN_VALUE);
    const description = `${coinFeature} ${coinDesign} ${coinRarity} ${coinValue}`;
    
    // 포인트 계산
    const basePoints = artistData.basePoints[tier];
    if (typeof basePoints !== 'number') {
      throw new Error(`Invalid basePoints for tier ${tier}`);
    }
    
    const currentPoints = calculatePoints(tier, initialSales, currentSales);
    
    // NFT ID 생성
    const nftId = `${artistId}_${event.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    
    // 이미지 경로 설정
    let image;
    if (memberId === 'group') {
      // 그룹 이미지
      image = require(`../../../assets/artists/${artistId}/group.jpg`);
    } else {
      // 멤버 이미지
      image = require(`../../../assets/artists/${artistId}/members/${memberId}.jpg`);
    }
    
    return {
      id: nftId,
      artistId,
      memberId,
      name: `${artist.name} ${memberId === 'group' ? '' : ARTISTS[artistId].members.find(m => m.id === memberId)?.name || ''} - ${event}`,
      description,
      tier,
      initialPoints: basePoints,
      currentPoints,
      initialSales,
      currentSales,
      image,
      createdAt: new Date().toISOString(),
      canFuse: true,
      fusionCount: 0  // 결합 횟수 추적을 위한 필드 추가
    };
  } catch (error) {
    console.error('NFT 생성 중 오류:', error);
    return null;
  }
};

// NFT 티어 순서 정의
const TIER_PROGRESSION = {
  fan: 'supporter',
  supporter: 'earlybird',
  earlybird: 'founders'
};

/**
 * NFT 결합 가능 여부 확인
 * @param {Array} nfts - 결합하려는 NFT 배열
 * @returns {Object} 결합 가능 여부와 에러 메시지
 */
const validateNFTFusion = (nfts) => {
  if (nfts.length !== 3) {
    return { canFuse: false, error: '3개의 NFT가 필요합니다.' };
  }

  const firstNFT = nfts[0];
  const sameTier = nfts.every(nft => nft.tier === firstNFT.tier);
  if (!sameTier) {
    return { canFuse: false, error: '같은 티어의 NFT만 결합할 수 있습니다.' };
  }

  const sameArtist = nfts.every(nft => nft.artistId === firstNFT.artistId);
  if (!sameArtist) {
    return { canFuse: false, error: '같은 아티스트의 NFT만 결합할 수 있습니다.' };
  }

  if (!TIER_PROGRESSION[firstNFT.tier]) {
    return { canFuse: false, error: '더 이상 상위 티어로 결합할 수 없습니다.' };
  }

  return { canFuse: true };
};

/**
 * NFT 결합 실행
 * @param {Array} nftIds - 결합할 NFT ID 배열
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 결합 결과
 */
export const fuseNFTs = async (nftIds, userId = DEFAULT_USER_ID) => {
  try {
    // 기존 NFT 데이터 가져오기
    const nftsJson = await AsyncStorage.getItem(NFT_STORAGE_KEY(userId));
    if (!nftsJson) {
      return { success: false, error: 'NFT 데이터가 없습니다.' };
    }

    const allNFTs = JSON.parse(nftsJson);
    const nftsToFuse = nftIds.map(id => allNFTs.find(nft => nft.id === id));

    // 결합 가능 여부 확인
    const { canFuse, error } = validateNFTFusion(nftsToFuse);
    if (!canFuse) {
      return { success: false, error };
    }

    const baseNFT = nftsToFuse[0];
    const nextTier = TIER_PROGRESSION[baseNFT.tier];
    
    // 새로운 NFT 생성
    const fusedNFT = {
      ...baseNFT,
      id: `${baseNFT.artistId}_fused_${Date.now()}`,
      tier: nextTier,
      initialPoints: ARTIST_NFT_DATA[baseNFT.artistId].basePoints[nextTier],
      fusionCount: Math.max(...nftsToFuse.map(nft => nft.fusionCount)) + 1,
      createdAt: new Date().toISOString(),
      parentNFTs: nftIds
    };

    // 기존 NFT 제거 및 새로운 NFT 추가
    const updatedNFTs = [
      ...allNFTs.filter(nft => !nftIds.includes(nft.id)),
      fusedNFT
    ];

    // 저장
    await AsyncStorage.setItem(NFT_STORAGE_KEY(userId), JSON.stringify(updatedNFTs));

    // 결합 히스토리 저장
    const fusionHistoryKey = `fusion_history_${userId}`;
    const historyJson = await AsyncStorage.getItem(fusionHistoryKey);
    const history = historyJson ? JSON.parse(historyJson) : [];
    history.push({
      timestamp: new Date().toISOString(),
      parentNFTs: nftIds,
      resultNFT: fusedNFT.id,
      tier: nextTier
    });
    await AsyncStorage.setItem(fusionHistoryKey, JSON.stringify(history));

    return { 
      success: true, 
      fusedNFT,
      message: `${baseNFT.artistId} NFT가 성공적으로 ${nextTier} 티어로 결합되었습니다.`
    };
  } catch (error) {
    console.error('NFT 결합 오류:', error);
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
    const artist = ARTISTS[artistId];
    if (!artist) {
      return { success: false, error: '유효하지 않은 아티스트 ID입니다.' };
    }
    
    // 기존 NFT 데이터 가져오기
    const existingNFTs = await getUserNFTs(userId);
    
    // 새로 생성할 NFT 배열
    const newNFTs = [];
    
    // 각 티어별로 NFT 생성
    const tiers = ['fan', 'supporter', 'earlybird', 'founders'];
    tiers.forEach((tier, tierIndex) => {
      // 각 이벤트별로 NFT 생성
      for (let eventIndex = 0; eventIndex < 3; eventIndex++) {
        // 멤버별 NFT 생성
        const artistData = ARTIST_NFT_DATA[artistId];
        if (artistData && artistData.members) {
          artistData.members.forEach((memberId, memberIndex) => {
            const nft = createNFT(artistId, eventIndex, tier, memberIndex);
            if (nft) {
              newNFTs.push(nft);
            }
          });
          
          // 그룹 NFT 생성 (각 티어별로 1개씩)
          if (tierIndex === 0) { // fan 티어에만 그룹 NFT 생성
            const groupNFT = createNFT(artistId, eventIndex, tier, 'group');
            if (groupNFT) {
              newNFTs.push(groupNFT);
            }
          }
        }
      }
    });
    
    // 기존 NFT와 새로 생성한 NFT 합치기
    const updatedNFTs = [...existingNFTs, ...newNFTs];
    
    // NFT 데이터 저장
    await AsyncStorage.setItem(NFT_STORAGE_KEY(userId), JSON.stringify(updatedNFTs));
    
    return { 
      success: true, 
      message: `${artist.name}의 테스트 데이터가 생성되었습니다.`, 
      nftsCount: newNFTs.length 
    };
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

// 테스트 데이터 생성 함수 수정
export const generateTestData = async (userId = DEFAULT_USER_ID) => {
  try {
    const nfts = [];
    let nftIndex = 0;
    
    // 각 아티스트별로 NFT 생성
    Object.keys(ARTIST_NFT_DATA).forEach(artistId => {
      // 각 티어별 NFT 생성
      Object.keys(TIERS).forEach((tier, tierIndex) => {
        // 각 이벤트별 NFT 생성 (티어당 1개)
        const eventIndex = Math.floor(Math.random() * ARTIST_NFT_DATA[artistId].events.length);
        
        // 각 아티스트의 멤버/이미지 목록
        const members = ARTIST_NFT_DATA[artistId].members;
        
        // 순차적으로 다른 멤버/이미지 선택 (tierIndex를 사용하여 다른 이미지 선택)
        const memberIndex = tierIndex % members.length;
        const memberId = members[memberIndex];
        
        console.log(`Creating NFT for ${artistId} with memberId: ${memberId}, tier: ${tier}, memberIndex: ${memberIndex}`);
        
        const nft = createNFT(artistId, eventIndex, tier, memberIndex);
        if (nft) {
          nfts.push(nft);
          console.log(`Created NFT for ${artistId} with memberId: ${memberId}, tier: ${tier}`);
        } else {
          console.error(`Failed to create NFT for artist: ${artistId}, tier: ${tier}`);
        }
      });
    });

    if (nfts.length === 0) {
      throw new Error('No NFTs were created');
    }

    // NFT 데이터 저장
    await AsyncStorage.setItem(NFT_STORAGE_KEY(userId), JSON.stringify(nfts));

    return { 
      success: true, 
      nfts,
      message: `총 ${nfts.length}개의 NFT가 생성되었습니다.`
    };
  } catch (error) {
    console.error('테스트 데이터 생성 오류:', error);
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
export const generateSalesSimulationData = async (artistId, tier, userId = DEFAULT_USER_ID) => {
  try {
    // 기존 NFT 데이터 가져오기
    const existingNFTsJson = await AsyncStorage.getItem(NFT_STORAGE_KEY(userId));
    let existingNFTs = [];
    try {
      if (existingNFTsJson) {
        existingNFTs = JSON.parse(existingNFTsJson);
      }
    } catch (error) {
      console.error('기존 NFT 데이터 파싱 오류:', error);
    }

    // 새로운 NFT 생성
    const eventIndex = Math.floor(Math.random() * ARTIST_NFT_DATA[artistId].events.length);
    const memberIndex = Math.floor(Math.random() * ARTIST_NFT_DATA[artistId].members.length);
    const nft = createNFT(artistId, eventIndex, tier, memberIndex);
    
    if (!nft) {
      return { success: false, error: 'NFT 생성 실패' };
    }

    // 기존 NFT와 새 NFT 합치기
    const allNFTs = [...existingNFTs, nft];
    
    // 저장
    await AsyncStorage.setItem(NFT_STORAGE_KEY(userId), JSON.stringify(allNFTs));
    
    return { success: true, nft };
  } catch (error) {
    console.error('시뮬레이션 데이터 생성 오류:', error);
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
