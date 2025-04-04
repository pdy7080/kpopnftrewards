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
  // 티어 설정 가져오기
  const tierConfig = TIERS[tier.toLowerCase()] || TIERS.fan;
  
  // 초기 포인트
  const initialPoints = tierConfig.initialPoints;
  
  // 판매량 증가분 계산
  const salesIncrease = Math.max(0, currentSales - initialSales);
  
  // 마일스톤 횟수 계산
  const milestoneSize = tier === 'fan' ? 500 : 100;
  const milestoneCount = Math.floor(salesIncrease / milestoneSize);
  
  // 티어별 포인트 증가율
  const pointsPerMilestone = 
    tier === 'founders' ? 3 :
    tier === 'earlybird' ? 2 :
    1;
  
  // 추가 포인트 계산
  const additionalPoints = milestoneCount * pointsPerMilestone;
  
  // 최종 포인트 반환 (소수점 한 자리까지)
  return Math.round((initialPoints + additionalPoints) * 10) / 10;
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