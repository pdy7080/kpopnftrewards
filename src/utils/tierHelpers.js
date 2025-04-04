import { TIERS } from '../constants/tiers';

/**
 * 현재 티어의 진행도를 계산하는 함수
 * @param {Object} nft - NFT 객체
 * @returns {Object} 티어 진행 정보
 */
export const calculateTierProgress = (nft) => {
  if (!nft) return { tier: 'fan', progress: 0, nextTier: 'supporter' };
  
  const tierOrder = ['fan', 'supporter', 'earlybird', 'founders'];
  const currentTierIndex = tierOrder.indexOf(nft.tier);
  
  // 이미 최고 티어인 경우
  if (currentTierIndex === tierOrder.length - 1) {
    return {
      tier: nft.tier,
      progress: 1,
      nextTier: null,
      points: nft.currentPoints,
      requiredPoints: 0
    };
  }
  
  const nextTier = tierOrder[currentTierIndex + 1];
  const currentTierMinPoints = TIERS[nft.tier].initialPoints;
  const nextTierMinPoints = TIERS[nextTier].initialPoints;
  const pointsRange = nextTierMinPoints - currentTierMinPoints;
  const earnedPoints = nft.currentPoints - currentTierMinPoints;
  const progress = Math.min(1, Math.max(0, earnedPoints / pointsRange));
  
  return {
    tier: nft.tier,
    progress,
    nextTier,
    points: nft.currentPoints,
    requiredPoints: nextTierMinPoints - nft.currentPoints
  };
};

/**
 * 가장 높은 티어의 NFT를 찾는 함수
 * @param {Array} nfts - NFT 배열
 * @returns {Object} 가장 높은 티어의 NFT
 */
export const getHighestTierNFT = (nfts) => {
  if (!nfts || nfts.length === 0) return null;
  
  const tierOrder = ['founders', 'earlybird', 'supporter', 'fan'];
  
  for (const tier of tierOrder) {
    const nft = nfts.find(n => n.tier === tier);
    if (nft) return nft;
  }
  
  return nfts[0];
};

/**
 * NFT 티어별 분류 함수
 * @param {Array} nfts - NFT 배열
 * @returns {Object} 티어별로 분류된 NFT
 */
export const groupNFTsByTier = (nfts) => {
  const grouped = {
    founders: [],
    earlybird: [],
    supporter: [],
    fan: []
  };
  
  nfts.forEach(nft => {
    if (grouped[nft.tier]) {
      grouped[nft.tier].push(nft);
    }
  });
  
  return grouped;
};

/**
 * 티어 업그레이드 가능 여부 확인 함수
 * @param {Array} nfts - 같은 티어의 NFT 배열
 * @returns {boolean} 업그레이드 가능 여부
 */
export const canUpgradeTier = (nfts) => {
  if (!nfts || nfts.length < 3) return false;
  
  const firstTier = nfts[0].tier;
  const allSameTier = nfts.every(nft => nft.tier === firstTier);
  const isNotMaxTier = firstTier !== 'founders';
  
  return allSameTier && isNotMaxTier;
};
