// services/benefitService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARTIST_BENEFITS } from '../constants/benefits';

/**
 * 아티스트의 혜택 목록 가져오기
 */
export const getArtistBenefits = (artistId) => {
  return ARTIST_BENEFITS[artistId] || [];
};

/**
 * 혜택 사용 내역 가져오기
 */
export const getBenefitUsage = async () => {
  try {
    const userId = 'user123'; // 시연용 고정 사용자 ID
    const usage = await AsyncStorage.getItem(`benefit_usage_${userId}`);
    return usage ? JSON.parse(usage) : {};
  } catch (error) {
    console.error('혜택 사용 내역 로드 오류:', error);
    return {};
  }
};

/**
 * 혜택 사용하기
 */
export const useBenefit = async (benefitId) => {
  try {
    const userId = 'user123'; // 시연용 고정 사용자 ID
    const key = `benefit_usage_${userId}`;
    
    // 현재 사용 내역 가져오기
    const currentUsage = await getBenefitUsage();
    
    // 해당 혜택의 사용 내역 업데이트
    const benefitUsage = currentUsage[benefitId] || {
      usedCount: 0,
      maxUses: 5,
      remainingUses: 5,
      lastUsedAt: null
    };
    
    // 남은 횟수 확인
    if (benefitUsage.remainingUses <= 0) {
      throw new Error('더 이상 사용할 수 없는 혜택입니다.');
    }
    
    // 사용 내역 업데이트
    benefitUsage.usedCount += 1;
    benefitUsage.remainingUses -= 1;
    benefitUsage.lastUsedAt = new Date().toISOString();
    
    // 저장
    const updatedUsage = {
      ...currentUsage,
      [benefitId]: benefitUsage
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(updatedUsage));
    
    return {
      success: true,
      usage: benefitUsage
    };
  } catch (error) {
    console.error('혜택 사용 오류:', error);
    return {
      success: false,
      error: error.message || '혜택 사용 중 오류가 발생했습니다.'
    };
  }
};

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
 * 사용자의 혜택 사용 내역 가져오기
 * 
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Object>} 혜택 사용 내역 객체
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