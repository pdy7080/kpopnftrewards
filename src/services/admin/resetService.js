// services/admin/resetService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeAllWithPrefix } from '../storageService';

/**
 * 앱 데이터 초기화
 * 
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Object>} 결과 객체
 */
export const resetAppData = async (userId = 'user123') => {
  try {
    // 초기화할 키 패턴 목록
    const keysToRemove = [
      `user_nfts_${userId}`,
      `benefit_usage_${userId}`,
      `user_activities_${userId}`,
      `fusion_history_${userId}`,
      `user_profile_${userId}`
    ];
    
    // 키 삭제
    await AsyncStorage.multiRemove(keysToRemove);
    
    return { success: true };
  } catch (error) {
    console.error('데이터 초기화 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 모든 사용자 데이터 초기화
 * 
 * @returns {Promise<Object>} 결과 객체
 */
export const resetAllUserData = async () => {
  try {
    // 사용자 관련 데이터 접두사
    const prefixes = [
      'user_nfts_',
      'benefit_usage_',
      'user_activities_',
      'fusion_history_',
      'user_profile_'
    ];
    
    // 모든 접두사에 대해 데이터 삭제
    const removePromises = prefixes.map(prefix => removeAllWithPrefix(prefix));
    await Promise.all(removePromises);
    
    return { success: true };
  } catch (error) {
    console.error('모든 사용자 데이터 초기화 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 특정 아티스트 관련 데이터만 초기화
 * 
 * @param {string} artistId - 아티스트 ID
 * @param {string} userId - 사용자 ID (기본값: 'user123')
 * @returns {Promise<Object>} 결과 객체
 */
export const resetArtistData = async (artistId, userId = 'user123') => {
  try {
    // NFT 데이터 가져오기
    const nftsJson = await AsyncStorage.getItem(`user_nfts_${userId}`);
    if (nftsJson) {
      const nfts = JSON.parse(nftsJson);
      
      // 해당 아티스트 NFT 필터링
      const filteredNFTs = nfts.filter(nft => nft.artistId !== artistId);
      
      // 필터링된 NFT 저장
      await AsyncStorage.setItem(`user_nfts_${userId}`, JSON.stringify(filteredNFTs));
    }
    
    // 혜택 사용 내역 가져오기
    const usageJson = await AsyncStorage.getItem(`benefit_usage_${userId}`);
    if (usageJson) {
      const usage = JSON.parse(usageJson);
      
      // 해당 아티스트 혜택 필터링
      const filteredUsage = {};
      Object.entries(usage).forEach(([key, value]) => {
        if (!key.startsWith(artistId)) {
          filteredUsage[key] = value;
        }
      });
      
      // 필터링된 혜택 사용 내역 저장
      await AsyncStorage.setItem(`benefit_usage_${userId}`, JSON.stringify(filteredUsage));
    }
    
    // 선택된 아티스트가 초기화 대상이면 초기화
    const selectedArtistJson = await AsyncStorage.getItem('selected_artist');
    if (selectedArtistJson) {
      const selectedArtist = JSON.parse(selectedArtistJson);
      if (selectedArtist === artistId) {
        await AsyncStorage.removeItem('selected_artist');
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('아티스트 데이터 초기화 오류:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 앱 설정 초기화
 * 
 * @returns {Promise<Object>} 결과 객체
 */
export const resetAppSettings = async () => {
  try {
    await AsyncStorage.removeItem('app_settings');
    return { success: true };
  } catch (error) {
    console.error('앱 설정 초기화 오류:', error);
    return { success: false, error: error.message };
  }
};