// services/pointsCalculator.js
import { TIERS } from '../constants/tiers';

/**
 * 판매량에 따른 NFT 포인트 계산
 * 
 * @param {string} tier - NFT 티어 ('fan', 'supporter', 'earlybird', 'founders')
 * @param {number} initialSales - 구매 순번 (초기 판매량)
 * @param {number} currentSales - 현재 판매량
 * @returns {number} 계산된 포인트
 */
export const calculatePoints = (tier, initialSales, currentSales) => {
  // 기본값 설정
  initialSales = initialSales || 0;
  currentSales = currentSales || 0;

  // 티어별 기본 포인트
  const basePoints = TIERS[tier].initialPoints || 0;
  
  // 판매량 증가분 계산
  const salesIncrease = Math.max(0, currentSales - initialSales);
  
  // 티어별 마일스톤 사이즈 (판매량 증가 단위)
  const milestoneSize = tier === 'fan' ? 500 : 100;
  
  // 마일스톤 달성 횟수
  const milestoneCount = Math.floor(salesIncrease / milestoneSize);
  
  // 티어별 마일스톤당 포인트 증가량
  const pointsPerMilestone = 
    tier === 'founders' ? 3 :    // Founders: 가장 높은 성장률
    tier === 'earlybird' ? 2 :   // Early Bird: 중상위 성장률
    tier === 'supporter' ? 1 :   // Supporter: 중위 성장률
    0.5;                         // Fan: 기본 성장률

  // 추가 보너스 포인트 (티어별 차등)
  const tierBonus = 
    tier === 'founders' ? 0.5 :   // Founders: 50% 추가 보너스
    tier === 'earlybird' ? 0.3 :  // Early Bird: 30% 추가 보너스
    tier === 'supporter' ? 0.2 :  // Supporter: 20% 추가 보너스
    0.1;                          // Fan: 10% 추가 보너스
  
  // 추가 포인트 계산
  const additionalPoints = milestoneCount * pointsPerMilestone;
  const bonusPoints = additionalPoints * tierBonus;
  
  // 최종 포인트 계산 (소수점 한 자리까지)
  return Number((basePoints + additionalPoints + bonusPoints).toFixed(1));
};

/**
 * 구매 순서에 따른 티어 결정
 * 
 * @param {number} purchaseOrder - 구매 순번
 * @returns {string} 티어 ID
 */
export const getTierByPurchaseOrder = (purchaseOrder) => {
  if (purchaseOrder <= 100) return 'founders';
  if (purchaseOrder <= 500) return 'earlybird';
  if (purchaseOrder <= 1000) return 'supporter';
  return 'fan';
};

/**
 * 티어 비교 - tier1이 tier2보다 높은지 확인
 * 
 * @param {string} tier1 - 비교할 티어
 * @param {string} tier2 - 기준 티어
 * @returns {boolean} tier1이 tier2보다 높으면 true
 */
export const isHigherTier = (tier1, tier2) => {
  const tierOrder = { fan: 0, supporter: 1, earlybird: 2, founders: 3 };
  return tierOrder[tier1] > tierOrder[tier2];
};

/**
 * 티어별 포인트 상승률 계산
 * 
 * @param {string} tier - 티어
 * @param {number} initialSales - 초기 판매량
 * @param {number} currentSales - 현재 판매량
 * @param {number} newSales - 새 판매량
 * @returns {object} 상승 정보 객체
 */
export const calculateTierPointsIncrease = (tier, initialSales, currentSales, newSales) => {
  // 현재 포인트
  const currentPoints = calculatePoints(tier, initialSales, currentSales);
  
  // 새 포인트
  const newPoints = calculatePoints(tier, initialSales, newSales);
  
  // 증가분
  const increase = newPoints - currentPoints;
  
  // 성장률 계산
  const growthRate = currentPoints > 0 
    ? (increase / currentPoints * 100).toFixed(1) 
    : '0.0';
  
  return {
    tier,
    currentPoints,
    newPoints,
    increase,
    growthRate
  };
};