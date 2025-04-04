// services/benefitService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addActivity } from './nftService';

/**
 * 혜택 목록 정의
 */
export const BENEFITS = {
  // 여자아이들 혜택
  'gidle_fansign_1': {
    id: 'gidle_fansign_1',
    title: '여자아이들 팬사인회',
    description: '여자아이들과 함께하는 스페셜 팬사인회',
    type: 'fansign',
    artistId: 'gidle',
    minTier: 'fan' // fan 티어부터 사용 가능
  },
  'gidle_concert_1': {
    id: 'gidle_concert_1',
    title: '여자아이들 콘서트 티켓',
    description: '월드투어 콘서트 우선 예매권',
    type: 'concert',
    artistId: 'gidle',
    minTier: 'supporter' // supporter 티어부터 사용 가능
  },
  
  // 비비 혜택
  'bibi_fansign_1': {
    id: 'bibi_fansign_1',
    title: '비비 팬사인회',
    description: '비비와 함께하는 스페셜 팬사인회',
    type: 'fansign',
    artistId: 'bibi',
    minTier: 'fan'
  },
  'bibi_concert_1': {
    id: 'bibi_concert_1',
    title: '비비 콘서트 티켓',
    description: '단독 콘서트 우선 예매권',
    type: 'concert',
    artistId: 'bibi',
    minTier: 'supporter'
  },
  
  // 이찬원 혜택
  'chanwon_fansign_1': {
    id: 'chanwon_fansign_1',
    title: '이찬원 팬사인회',
    description: '이찬원과 함께하는 스페셜 팬사인회',
    type: 'fansign',
    artistId: 'chanwon',
    minTier: 'fan'
  },
  'chanwon_concert_1': {
    id: 'chanwon_concert_1',
    title: '이찬원 콘서트 티켓',
    description: '단독 콘서트 우선 예매권',
    type: 'concert',
    artistId: 'chanwon',
    minTier: 'supporter'
  }
};

/**
 * 아티스트별 혜택 가져오기
 * 
 * @param {string} artistId - 아티스트 ID
 * @returns {Array} 해당 아티스트의 혜택 배열
 */
export const getArtistBenefits = (artistId) => {
  return Object.values(BENEFITS).filter(benefit => benefit.artistId === artistId);
};

/**
 * 사용자의 혜택 사용 내역 가져오기
 * 
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Object>} 혜택 사용 내역 객체
 */
export const getBenefitUsage = async (userId = 'user123') => {
  try {
    const usageJson = await AsyncStorage.getItem(`benefit_usage_${userId}`);
    return usageJson ? JSON.parse(usageJson) : {};
  } catch (error) {
    console.error('혜택 사용 내역 로드 오류:', error);
    return {};
  }
};

/**
 * 특정 혜택의 사용 내역 가져오기
 * 
 * @param {string} benefitId - 혜택 ID
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Object>} 해당 혜택의 사용 내역
 */
export const getBenefitUsageById = async (benefitId, userId = 'user123') => {
  try {
    const usageData = await getBenefitUsage(userId);
    return usageData[benefitId] || { usedCount: 0, maxUses: 0, remainingUses: 0, usageHistory: [] };
  } catch (error) {
    console.error('혜택 사용 내역 로드 오류:', error);
    return { usedCount: 0, maxUses: 0, remainingUses: 0, usageHistory: [] };
  }
};

/**
 * 혜택 사용
 * 
 * @param {string} benefitId - 혜택 ID
 * @param {Object} applicationData - 신청 데이터
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Object>} 결과 객체
 */
export const useBenefit = async (benefitId, applicationData, userId = 'user123') => {
  try {
    // 혜택 정보 가져오기
    const benefit = BENEFITS[benefitId];
    if (!benefit) {
      throw new Error('존재하지 않는 혜택입니다.');
    }
    
    // 현재 사용 내역 가져오기
    const usageData = await getBenefitUsage(userId);
    const currentUsage = usageData[benefitId] || { 
      usedCount: 0, 
      maxUses: 0, 
      remainingUses: 0,
      usageHistory: [] 
    };
    
    // 사용 횟수 확인
    if (currentUsage.usedCount >= currentUsage.maxUses && currentUsage.maxUses > 0) {
      return { 
        success: false, 
        error: '사용 가능한 횟수를 모두 소진했습니다.' 
      };
    }
    
    // 새 사용 기록 생성
    const newUsage = {
      ...currentUsage,
      usedCount: currentUsage.usedCount + 1,
      remainingUses: currentUsage.maxUses > 0 ? currentUsage.maxUses - (currentUsage.usedCount + 1) : 0,
      lastUsedAt: new Date().toISOString(),
      usageHistory: [
        ...currentUsage.usageHistory,
        {
          timestamp: new Date().toISOString(),
          data: applicationData
        }
      ]
    };
    
    // 사용 내역 업데이트
    usageData[benefitId] = newUsage;
    await AsyncStorage.setItem(`benefit_usage_${userId}`, JSON.stringify(usageData));
    
    // 활동 내역 추가
    await addActivity({
      type: 'benefit_use',
      title: '혜택 사용',
      detail: benefit.title,
      date: new Date().toISOString()
    }, userId);
    
    return { 
      success: true, 
      usage: newUsage 
    };
  } catch (error) {
    console.error('혜택 사용 오류:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * 티어에 따른 혜택 최대 사용 횟수 설정
 * 
 * @param {string} tierId - 티어 ID
 * @param {string} benefitId - 혜택 ID
 * @returns {number} 최대 사용 횟수
 */
export const getMaxUsesByTier = (tierId, benefitId) => {
  // 혜택 유형별 기본값
  const defaultValues = {
'fansign': {
       'fan': 1,
       'supporter': 3,
       'earlybird': 5,
       'founders': 10
     },
     'concert': {
       'fan': 0,
       'supporter': 1,
       'earlybird': 2,
       'founders': 3
     }
   };
   
   // 혜택 ID에서 유형 추출 (benefitId 형식: artistId_type_number)
   const parts = benefitId.split('_');
   const type = parts.length > 1 ? parts[1] : '';
   
   // 혜택 유형에 따른 값 반환
   if (type && defaultValues[type] && defaultValues[type][tierId]) {
     return defaultValues[type][tierId];
   }
   
   // 기본값
   return 0;
 };