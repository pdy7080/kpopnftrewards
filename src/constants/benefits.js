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
      type: 'fansign',
      title: '여자아이들 팬사인회',
      description: '2024 월드투어 기념 특별 팬사인회',
      image: require('../../assets/artists/gidle/group.jpg'),
      maxUses: 5,
      tiers: {
        fan: 1,
        supporter: 3,
        earlybird: 5,
        founders: 10
      }
    },
    {
      id: 'gidle_concert_1',
      type: 'concert',
      title: '2024 월드투어 티켓 예매',
      description: '티어별 선예매 시간 혜택',
      image: require('../../assets/artists/gidle/group.jpg'),
      tiers: {
        fan: 24,
        supporter: 48,
        earlybird: 72,
        founders: 96
      }
    },
    {
      id: 'gidle_exclusive_1',
      type: 'exclusive',
      title: '독점 콘텐츠',
      description: '미공개 비하인드 영상 및 포토',
      image: require('../../assets/artists/gidle/group.jpg'),
      tiers: {
        fan: 'basic',
        supporter: 'all',
        earlybird: 'all',
        founders: 'download'
      }
    }
  ],
  
  // 비비 혜택
  bibi: [
    {
      id: 'bibi_fansign_1',
      type: 'fansign',
      title: '비비 팬사인회',
      description: '신보 발매 기념 특별 팬사인회',
      image: require('../../assets/artists/bibi/profile.jpg'),
      maxUses: 5,
      tiers: {
        fan: 1,
        supporter: 3,
        earlybird: 5,
        founders: 10
      }
    },
    {
      id: 'bibi_concert_1',
      type: 'concert',
      title: '단독 콘서트 티켓 예매',
      description: '티어별 선예매 시간 혜택',
      image: require('../../assets/artists/bibi/bibi-concert.jpg'),
      tiers: {
        fan: 24,
        supporter: 48,
        earlybird: 72,
        founders: 96
      }
    },
    {
      id: 'bibi_exclusive_1',
      type: 'exclusive',
      title: '독점 콘텐츠',
      description: '미공개 녹음실 영상 및 포토',
      image: require('../../assets/artists/bibi/bibi.jpg'),
      tiers: {
        fan: 'basic',
        supporter: 'all',
        earlybird: 'all',
        founders: 'download'
      }
    }
  ],
  
  // 이찬원 혜택
  chanwon: [
    {
      id: 'chanwon_fansign_1',
      type: 'fansign',
      title: '이찬원 팬사인회',
      description: '이찬원과 함께하는 특별한 팬사인회에 참여할 수 있는 기회',
      image: require('../../assets/artists/chanwon/profile.jpg'),
      maxUses: 5,
      tiers: {
        fan: 0,
        supporter: 1,
        earlybird: 3,
        founders: 5
      }
    },
    {
      id: 'chanwon_concert_1',
      type: 'concert',
      title: '전국투어 콘서트 우선예매',
      description: '이찬원 전국투어 콘서트 티켓 우선 예매 권한',
      image: require('../../assets/artists/chanwon/chanwon2.jpg'),
      maxUses: 2,
      tiers: {
        fan: 0,
        supporter: 0,
        earlybird: 24,
        founders: 48
      }
    },
    {
      id: 'chanwon_exclusive_1',
      type: 'exclusive',
      title: '비하인드 영상',
      description: '이찬원 콘서트 비하인드 독점 영상 시청',
      image: require('../../assets/artists/chanwon/chanwon3.jpg'),
      maxUses: 999,
      tiers: {
        fan: 'basic',
        supporter: 'basic',
        earlybird: 'all',
        founders: 'download'
      }
    },
    {
      id: 'chanwon_exclusive_2',
      type: 'exclusive',
      title: '메이킹 포토',
      description: '앨범 재킷 촬영 메이킹 독점 사진',
      image: require('../../assets/artists/chanwon/chanwon2.jpg'),
      maxUses: 999,
      tiers: {
        fan: 'basic',
        supporter: 'basic',
        earlybird: 'all',
        founders: 'download'
      }
    },
    {
      id: 'chanwon_fansign_2',
      type: 'fansign',
      title: '온라인 팬미팅',
      description: '이찬원과 함께하는 프라이빗 온라인 팬미팅',
      image: require('../../assets/artists/chanwon/profile.jpg'),
      maxUses: 3,
      tiers: {
        fan: 0,
        supporter: 0,
        earlybird: 1,
        founders: 3
      }
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