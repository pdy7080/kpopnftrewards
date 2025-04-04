// services/nftService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTierByPurchaseOrder } from './pointsCalculator';
import { generateNFTDetails } from '../utils/nftGenerator';
import { TIERS } from '../constants/tiers';
import { ARTISTS } from '../constants/artists';
import { calculatePoints } from './pointsCalculator';

/**
 * 사용자의 모든 NFT 가져오기
 * 
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Array>} 사용자의 NFT 배열
 */
export const getUserNFTs = async (userId = 'user123') => {
  try {
    const nftsJson = await AsyncStorage.getItem(`user_nfts_${userId}`);
    return nftsJson ? JSON.parse(nftsJson) : [];
  } catch (error) {
    console.error('NFT 로드 오류:', error);
    return [];
  }
};

/**
 * 특정 아티스트의 NFT만 필터링
 * 
 * @param {string} artistId - 아티스트 ID
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Array>} 필터링된 NFT 배열
 */
export const getArtistNFTs = async (artistId, userId = 'user123') => {
  const allNFTs = await getUserNFTs(userId);
  return allNFTs.filter(nft => nft.artistId === artistId);
};

/**
 * NFT 추가
 * 
 * @param {Object} nft - 추가할 NFT 객체
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<boolean>} 성공 여부
 */
export const addNFT = async (nft, userId = 'user123') => {
  try {
    const nfts = await getUserNFTs(userId);
    nfts.push(nft);
    await AsyncStorage.setItem(`user_nfts_${userId}`, JSON.stringify(nfts));
    
    // 활동 내역 추가
    await addActivity({
      type: 'nft_acquisition',
      title: 'NFT 획득',
      detail: `${ARTISTS[nft.artistId]?.name || '아티스트'} ${nft.name || 'NFT'} (${TIERS[nft.tier]?.displayName || nft.tier} 티어)`,
      date: new Date().toISOString()
    }, userId);
    
    return true;
  } catch (error) {
    console.error('NFT 추가 오류:', error);
    return false;
  }
};

/**
 * NFT 제거
 * 
 * @param {string} nftId - 제거할 NFT ID
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<boolean>} 성공 여부
 */
export const removeNFT = async (nftId, userId = 'user123') => {
  try {
    const nfts = await getUserNFTs(userId);
    const updatedNfts = nfts.filter(nft => nft.id !== nftId);
    await AsyncStorage.setItem(`user_nfts_${userId}`, JSON.stringify(updatedNfts));
    return true;
  } catch (error) {
    console.error('NFT 제거 오류:', error);
    return false;
  }
};

/**
 * QR 코드 데이터로부터 NFT 생성
 */
export const createNFTFromQRData = async (qrData) => {
  try {
    const { artistId, memberId, purchaseOrder, eventName } = qrData;
    
    // 구매 순서에 따른 티어 결정
    const tier = getTierByPurchaseOrder(purchaseOrder);
    
    // 현재 판매량 설정 (구매 순번 + 랜덤 추가 판매량)
    const additionalSales = Math.floor(Math.random() * 10000);
    const currentSales = purchaseOrder + additionalSales;
    
    // 포인트 계산
    const currentPoints = calculatePoints(tier, purchaseOrder, currentSales);
    
    // NFT 객체 생성
    const nft = {
      id: `nft_${artistId}_${memberId}_${Date.now()}`,
      artistId,
      memberId,
      name: `${eventName} 기념 주화 NFT`,
      tier,
      initialPoints: TIERS[tier].initialPoints,
      currentPoints,
      initialSales: purchaseOrder,
      currentSales,
      createdAt: new Date().toISOString(),
      canFuse: true
    };
    
    // 기존 NFT 목록에 추가
    const savedNFTs = await AsyncStorage.getItem('user_nfts_user123');
    const nfts = savedNFTs ? JSON.parse(savedNFTs) : [];
    nfts.push(nft);
    await AsyncStorage.setItem('user_nfts_user123', JSON.stringify(nfts));
    
    // 활동 내역 추가
    const activity = {
      id: `activity_${Date.now()}`,
      type: 'nft_acquisition',
      date: new Date().toISOString(),
      title: 'NFT 획득',
      detail: `${nft.name} (${TIERS[tier].displayName} 티어)`
    };
    
    const savedActivities = await AsyncStorage.getItem('user_activities_user123');
    const activities = savedActivities ? JSON.parse(savedActivities) : [];
    activities.unshift(activity);
    await AsyncStorage.setItem('user_activities_user123', JSON.stringify(activities));
    
    return nft;
  } catch (error) {
    console.error('NFT 생성 오류:', error);
    throw error;
  }
};

/**
 * NFT 합성
 */
export const fuseNFTs = async (nfts) => {
  try {
    if (nfts.length !== 3) {
      throw new Error('NFT 3개가 필요합니다.');
    }
    
    const tier = nfts[0].tier;
    if (!nfts.every(nft => nft.tier === tier)) {
      throw new Error('같은 티어의 NFT만 합성할 수 있습니다.');
    }
    
    // 다음 티어 결정
    const tierOrder = ['fan', 'supporter', 'earlybird', 'founders'];
    const currentTierIndex = tierOrder.indexOf(tier);
    
    if (currentTierIndex === tierOrder.length - 1) {
      throw new Error('이미 최고 티어입니다.');
    }
    
    const nextTier = tierOrder[currentTierIndex + 1];
    
    // 새 NFT 생성
    const baseNFT = nfts[0];
    const newNFT = {
      id: `nft_fused_${Date.now()}`,
      artistId: baseNFT.artistId,
      memberId: baseNFT.memberId,
      name: `${baseNFT.name} (합성)`,
      tier: nextTier,
      initialPoints: TIERS[nextTier].initialPoints,
      currentPoints: TIERS[nextTier].initialPoints,
      initialSales: Math.min(...nfts.map(nft => nft.initialSales)),
      currentSales: Math.max(...nfts.map(nft => nft.currentSales)),
      createdAt: new Date().toISOString(),
      canFuse: true
    };
    
    // 기존 NFT 목록에서 합성된 NFT 제거하고 새 NFT 추가
    const savedNFTs = await AsyncStorage.getItem('user_nfts_user123');
    let userNFTs = savedNFTs ? JSON.parse(savedNFTs) : [];
    
    userNFTs = userNFTs.filter(nft => !nfts.some(fusedNFT => fusedNFT.id === nft.id));
    userNFTs.push(newNFT);
    
    await AsyncStorage.setItem('user_nfts_user123', JSON.stringify(userNFTs));
    
    // 활동 내역 추가
    const activity = {
      id: `activity_${Date.now()}`,
      type: 'nft_fusion',
      date: new Date().toISOString(),
      title: 'NFT 합성',
      detail: `${tier} 티어 NFT 3개 → ${nextTier} 티어 NFT 1개`
    };
    
    const savedActivities = await AsyncStorage.getItem('user_activities_user123');
    const activities = savedActivities ? JSON.parse(savedActivities) : [];
    activities.unshift(activity);
    await AsyncStorage.setItem('user_activities_user123', JSON.stringify(activities));
    
    return { success: true, newNFT };
  } catch (error) {
    console.error('NFT 합성 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 합성 내역 가져오기
 * 
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Array>} 합성 내역 배열
 */
export const getFusionHistory = async (userId = 'user123') => {
  try {
    const historyJson = await AsyncStorage.getItem(`fusion_history_${userId}`);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('합성 내역 로드 오류:', error);
    return [];
  }
};

/**
 * 활동 내역 추가
 * 
 * @param {Object} activity - 활동 내역 객체
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<boolean>} 성공 여부
 */
export const addActivity = async (activity, userId = 'user123') => {
  try {
    const activitiesJson = await AsyncStorage.getItem(`user_activities_${userId}`);
    const activities = activitiesJson ? JSON.parse(activitiesJson) : [];
    
    // 활동에 ID 추가
    const newActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // 새 활동을 배열 앞에 추가 (최신 활동이 먼저 표시되도록)
    activities.unshift(newActivity);
    
    // 최대 20개만 유지
    const trimmedActivities = activities.slice(0, 20);
    
    await AsyncStorage.setItem(`user_activities_${userId}`, JSON.stringify(trimmedActivities));
    return true;
  } catch (error) {
    console.error('활동 내역 추가 오류:', error);
    return false;
  }
};

/**
 * 사용자 활동 내역 가져오기
 * 
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @param {number} limit - 가져올 활동 수 (기본값: 10)
 * @returns {Promise<Array>} 활동 내역 배열
 */
export const getUserActivities = async (userId = 'user123', limit = 10) => {
  try {
    const activitiesJson = await AsyncStorage.getItem(`user_activities_${userId}`);
    const activities = activitiesJson ? JSON.parse(activitiesJson) : [];
    return activities.slice(0, limit);
  } catch (error) {
    console.error('활동 내역 로드 오류:', error);
    return [];
  }
};