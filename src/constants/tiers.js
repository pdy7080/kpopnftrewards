import { COLORS } from './colors';

export const TIERS = {
  fan: {
    name: 'Fan',
    color: '#8BC34A',
    benefits: {
      fanSign: 1, // 팬사인회 응모 횟수
      concertPreorder: 0, // 콘서트 선예매 시간(시간)
      exclusiveContent: false, // 독점 콘텐츠 접근
      winningRate: 1 // 당첨 확률 배수
    },
    description: '기본 티어로, 기념주화 NFT의 초기 등급입니다.',
    fusionRequirement: 3 // 합성에 필요한 NFT 개수
  },
  supporter: {
    name: 'Supporter',
    color: '#03A9F4',
    benefits: {
      fanSign: 3,
      concertPreorder: 24,
      exclusiveContent: true,
      winningRate: 2
    },
    description: 'Fan 티어 NFT 3개를 합성하여 얻을 수 있는 중급 티어입니다.',
    fusionRequirement: 3
  },
  early_bird: {
    name: 'Early Bird',
    color: '#7E57C2',
    benefits: {
      fanSign: 5,
      concertPreorder: 36,
      exclusiveContent: true,
      winningRate: 3
    },
    description: 'Supporter 티어 NFT 3개를 합성하여 얻을 수 있는 고급 티어입니다.',
    fusionRequirement: 3
  },
  founders: {
    name: 'Founders',
    color: '#F9A825',
    benefits: {
      fanSign: 10,
      concertPreorder: 48,
      exclusiveContent: true,
      winningRate: 5
    },
    description: 'Early Bird 티어 NFT 3개를 합성하여 얻을 수 있는 최고급 티어입니다.',
    fusionRequirement: null // 최고 티어는 더 이상 합성 불가
  }
};

// 다음 티어 정보 가져오기
export const getNextTier = (currentTier) => {
  const tierOrder = ['fan', 'supporter', 'early_bird', 'founders'];
  const currentIndex = tierOrder.indexOf(currentTier);
  return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
};

// 티어별 포인트 보너스 계산
export const getTierPointsBonus = (tier) => {
  const bonusRates = {
    fan: 1,
    supporter: 1.5,
    early_bird: 2,
    founders: 3
  };
  return bonusRates[tier] || 1;
};

// 티어 업그레이드 경로
export const TIER_UPGRADE_PATH = {
  fan: 'supporter',
  supporter: 'early_bird',
  early_bird: 'founders'
};

// 티어 이름 상수 (이전 코드와의 호환성을 위해 유지)
export const TIER_NAMES = {
  FAN: 'fan',
  SUPPORTER: 'supporter',
  EARLY_BIRD: 'early_bird',
  FOUNDERS: 'founders'
};

// 티어 색상 (이전 코드와의 호환성을 위해 유지)
export const TIER_COLORS = {
  [TIER_NAMES.FAN]: TIERS.fan.color,
  [TIER_NAMES.SUPPORTER]: TIERS.supporter.color,
  [TIER_NAMES.EARLY_BIRD]: TIERS.early_bird.color,
  [TIER_NAMES.FOUNDERS]: TIERS.founders.color
};

// 티어 포인트 (이전 코드와의 호환성을 위해 유지)
export const TIER_POINTS = {
  [TIER_NAMES.FAN]: TIERS.fan.initialPoints,
  [TIER_NAMES.SUPPORTER]: TIERS.supporter.initialPoints,
  [TIER_NAMES.EARLY_BIRD]: TIERS.early_bird.initialPoints,
  [TIER_NAMES.FOUNDERS]: TIERS.founders.initialPoints
};

// 티어 혜택 (이전 코드와의 호환성을 위해 유지)
export const TIER_BENEFITS = {
  [TIER_NAMES.FAN]: TIERS.fan.benefits,
  [TIER_NAMES.SUPPORTER]: TIERS.supporter.benefits,
  [TIER_NAMES.EARLY_BIRD]: TIERS.early_bird.benefits,
  [TIER_NAMES.FOUNDERS]: TIERS.founders.benefits
};

// 티어 설명 (이전 코드와의 호환성을 위해 유지)
export const TIER_DESCRIPTIONS = {
  [TIER_NAMES.FAN]: TIERS.fan.description,
  [TIER_NAMES.SUPPORTER]: TIERS.supporter.description,
  [TIER_NAMES.EARLY_BIRD]: TIERS.early_bird.description,
  [TIER_NAMES.FOUNDERS]: TIERS.founders.description
};

// 티어 아이콘 (이전 코드와의 호환성을 위해 유지)
export const TIER_ICONS = {
  [TIER_NAMES.FAN]: TIERS.fan.icon,
  [TIER_NAMES.SUPPORTER]: TIERS.supporter.icon,
  [TIER_NAMES.EARLY_BIRD]: TIERS.early_bird.icon,
  [TIER_NAMES.FOUNDERS]: TIERS.founders.icon
};
