// constants/benefits.js
import { TIERS } from './tiers';

/**
 * 혜택 유형 정의
 */
export const BENEFIT_TYPES = {
  FANSIGN: 'fansign',
  CONCERT: 'concert',
  EXCLUSIVE: 'exclusive',
  FANMEETING: 'fanmeeting'
};

/**
 * 아티스트별 혜택 정보
 */
export const ARTIST_BENEFITS = {
  // 여자아이들 혜택
  gidle: [
    {
      id: 'gidle_fansign_1',
      title: '여자아이들 팬사인회',
      description: '여자아이들과 함께하는 스페셜 팬사인회',
      type: BENEFIT_TYPES.FANSIGN,
      minTier: 'fan'
    },
    {
      id: 'gidle_concert_1',
      title: '여자아이들 콘서트 우선 예매',
      description: '월드투어 콘서트 우선 예매권',
      type: BENEFIT_TYPES.CONCERT,
      minTier: 'supporter'
    },
    {
      id: 'gidle_exclusive_1',
      title: '여자아이들 독점 콘텐츠',
      description: '미공개 비하인드 영상 및 사진',
      type: BENEFIT_TYPES.EXCLUSIVE,
      minTier: 'fan'
    }
  ],
  
  // 비비 혜택
  bibi: [
    {
      id: 'bibi_fansign_1',
      title: '비비 팬사인회',
      description: '비비와 함께하는 스페셜 팬사인회',
      type: BENEFIT_TYPES.FANSIGN,
      minTier: 'fan'
    },
    {
      id: 'bibi_concert_1',
      title: '비비 콘서트 우선 예매',
      description: '단독 콘서트 우선 예매권',
      type: BENEFIT_TYPES.CONCERT,
      minTier: 'supporter'
    },
    {
      id: 'bibi_exclusive_1',
      title: '비비 독점 콘텐츠',
      description: '미공개 라이브 클립 및 녹음 현장',
      type: BENEFIT_TYPES.EXCLUSIVE,
      minTier: 'fan'
    }
  ],
  
  // 이찬원 혜택
  chanwon: [
    {
      id: 'chanwon_fansign_1',
      title: '이찬원 팬사인회',
      description: '이찬원과 함께하는 스페셜 팬사인회',
      type: BENEFIT_TYPES.FANSIGN,
      minTier: 'fan'
    },
    {
      id: 'chanwon_concert_1',
      title: '이찬원 콘서트 우선 예매',
      description: '단독 콘서트 우선 예매권',
      type: BENEFIT_TYPES.CONCERT,
      minTier: 'supporter'
    },
    {
      id: 'chanwon_exclusive_1',
      title: '이찬원 독점 콘텐츠',
      description: '팬미팅 비하인드 및 녹음실 영상',
      type: BENEFIT_TYPES.EXCLUSIVE,
      minTier: 'fan'
    }
  ]
};

/**
 * 티어별 혜택 사용 횟수 정의
 */
export const TIER_BENEFITS = {
  // 팬사인회 응모 횟수
  [BENEFIT_TYPES.FANSIGN]: {
    fan: 1,
    supporter: 3,
    earlybird: 5,
    founders: 10
  },
  
  // 콘서트 우선 예매 시간
  [BENEFIT_TYPES.CONCERT]: {
    fan: 0,
    supporter: 12,
    earlybird: 24,
    founders: 48
  },
  
  // 독점 콘텐츠 접근 레벨
  [BENEFIT_TYPES.EXCLUSIVE]: {
    fan: 1,
    supporter: 2,
    earlybird: 3,
    founders: 4
  }
};

/**
 * 티어별 혜택 당첨 확률 증가율
 */
export const WINNING_MULTIPLIERS = {
  fan: 1,
  supporter: 2,
  earlybird: 3,
  founders: 5
};

/**
 * 아티스트별 모든 혜택 가져오기
 * 
 * @param {string} artistId - 아티스트 ID
 * @returns {Array} 혜택 배열
 */
export const getArtistBenefits = (artistId) => {
  return ARTIST_BENEFITS[artistId] || [];
};

/**
 * 혜택별 티어 사용 횟수 가져오기
 * 
 * @param {string} benefitType - 혜택 유형
 * @param {string} tier - 티어 ID
 * @returns {number} 사용 횟수
 */
export const getBenefitUsageByTier = (benefitType, tier) => {
  return TIER_BENEFITS[benefitType]?.[tier] || 0;
};