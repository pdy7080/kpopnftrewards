import { COLORS } from './colors';

export const TIERS = {
  fan: {
    name: 'Fan',
    displayName: 'Fan',
    color: '#8BC34A',
    initialPoints: 5,
    benefits: {
      fanSigning: 1,      // 팬사인회 응모 횟수
      concertPriority: 0,  // 콘서트 우선 예매 시간 (시간)
      exclusiveContent: false, // 독점 콘텐츠 접근 권한
      winningChance: 1     // 당첨 확률 배수
    },
    description: '기본적인 팬 혜택을 제공하는 티어입니다.',
    icon: 'star-outline'
  },
  supporter: {
    name: 'Supporter',
    displayName: 'Supporter',
    color: '#03A9F4',
    initialPoints: 10,
    benefits: {
      fanSigning: 3,
      concertPriority: 12,
      exclusiveContent: false,
      winningChance: 2
    },
    description: '더 많은 팬사인회 기회와 콘서트 우선 예매 혜택을 제공합니다.',
    icon: 'star-half'
  },
  earlybird: {
    name: 'Early Bird',
    displayName: 'Early Bird',
    color: '#7E57C2',
    initialPoints: 20,
    benefits: {
      fanSigning: 5,
      concertPriority: 24,
      exclusiveContent: true,
      winningChance: 3
    },
    description: '독점 콘텐츠 접근 권한과 높은 당첨 확률을 제공합니다.',
    icon: 'star'
  },
  founders: {
    name: 'Founders',
    displayName: 'Founders',
    color: '#F9A825',
    initialPoints: 30,
    benefits: {
      fanSigning: 10,
      concertPriority: 48,
      exclusiveContent: true,
      winningChance: 5
    },
    description: '최고의 혜택과 특별한 경험을 제공하는 프리미엄 티어입니다.',
    icon: 'diamond'
  }
};

// 티어 업그레이드 경로
export const TIER_UPGRADE_PATH = {
  fan: 'supporter',
  supporter: 'earlybird',
  earlybird: 'founders'
};

// 티어 이름 상수 (이전 코드와의 호환성을 위해 유지)
export const TIER_NAMES = {
  FAN: 'fan',
  SUPPORTER: 'supporter',
  EARLY_BIRD: 'earlybird',
  FOUNDERS: 'founders'
};

// 티어 색상 (이전 코드와의 호환성을 위해 유지)
export const TIER_COLORS = {
  [TIER_NAMES.FAN]: TIERS.fan.color,
  [TIER_NAMES.SUPPORTER]: TIERS.supporter.color,
  [TIER_NAMES.EARLY_BIRD]: TIERS.earlybird.color,
  [TIER_NAMES.FOUNDERS]: TIERS.founders.color
};

// 티어 포인트 (이전 코드와의 호환성을 위해 유지)
export const TIER_POINTS = {
  [TIER_NAMES.FAN]: TIERS.fan.initialPoints,
  [TIER_NAMES.SUPPORTER]: TIERS.supporter.initialPoints,
  [TIER_NAMES.EARLY_BIRD]: TIERS.earlybird.initialPoints,
  [TIER_NAMES.FOUNDERS]: TIERS.founders.initialPoints
};

// 티어 혜택 (이전 코드와의 호환성을 위해 유지)
export const TIER_BENEFITS = {
  [TIER_NAMES.FAN]: TIERS.fan.benefits,
  [TIER_NAMES.SUPPORTER]: TIERS.supporter.benefits,
  [TIER_NAMES.EARLY_BIRD]: TIERS.earlybird.benefits,
  [TIER_NAMES.FOUNDERS]: TIERS.founders.benefits
};

// 티어 설명 (이전 코드와의 호환성을 위해 유지)
export const TIER_DESCRIPTIONS = {
  [TIER_NAMES.FAN]: TIERS.fan.description,
  [TIER_NAMES.SUPPORTER]: TIERS.supporter.description,
  [TIER_NAMES.EARLY_BIRD]: TIERS.earlybird.description,
  [TIER_NAMES.FOUNDERS]: TIERS.founders.description
};

// 티어 아이콘 (이전 코드와의 호환성을 위해 유지)
export const TIER_ICONS = {
  [TIER_NAMES.FAN]: TIERS.fan.icon,
  [TIER_NAMES.SUPPORTER]: TIERS.supporter.icon,
  [TIER_NAMES.EARLY_BIRD]: TIERS.earlybird.icon,
  [TIER_NAMES.FOUNDERS]: TIERS.founders.icon
};
