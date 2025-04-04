// services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 데이터 저장
 * 
 * @param {string} key - 저장 키
 * @param {any} value - 저장할 값
 * @returns {Promise<boolean>} 성공 여부
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`데이터 저장 오류 (${key}):`, error);
    return false;
  }
};

/**
 * 데이터 가져오기
 * 
 * @param {string} key - 저장 키
 * @returns {Promise<any>} 저장된 값 또는 null
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`데이터 로드 오류 (${key}):`, error);
    return null;
  }
};

/**
 * 데이터 삭제
 * 
 * @param {string} key - 삭제할 키
 * @returns {Promise<boolean>} 성공 여부
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`데이터 삭제 오류 (${key}):`, error);
    return false;
  }
};

/**
 * 여러 데이터 저장
 * 
 * @param {Array} keyValuePairs - [키, 값] 쌍의 배열
 * @returns {Promise<boolean>} 성공 여부
 */
export const storeMultipleData = async (keyValuePairs) => {
  try {
    const pairs = keyValuePairs.map(([key, value]) => {
      return [key, JSON.stringify(value)];
    });
    
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('다중 데이터 저장 오류:', error);
    return false;
  }
};

/**
 * 여러 데이터 가져오기
 * 
 * @param {Array} keys - 가져올 키 배열
 * @returns {Promise<Object>} 키-값 쌍의 객체
 */
export const getMultipleData = async (keys) => {
  try {
    const result = await AsyncStorage.multiGet(keys);
    return result.reduce((acc, [key, value]) => {
      acc[key] = value ? JSON.parse(value) : null;
      return acc;
    }, {});
  } catch (error) {
    console.error('다중 데이터 로드 오류:', error);
    return {};
  }
};

/**
 * 여러 데이터 삭제
 * 
 * @param {Array} keys - 삭제할 키 배열
 * @returns {Promise<boolean>} 성공 여부
 */
export const removeMultipleData = async (keys) => {
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('다중 데이터 삭제 오류:', error);
    return false;
  }
};

/**
 * 접두사가 일치하는 모든 키 가져오기
 * 
 * @param {string} prefix - 키 접두사
 * @returns {Promise<Array>} 키 배열
 */
export const getAllKeysWithPrefix = async (prefix) => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter(key => key.startsWith(prefix));
  } catch (error) {
    console.error('키 필터링 오류:', error);
    return [];
  }
};

/**
 * 접두사가 일치하는 모든 데이터 삭제
 * 
 * @param {string} prefix - 키 접두사
 * @returns {Promise<boolean>} 성공 여부
 */
export const removeAllWithPrefix = async (prefix) => {
  try {
    const keys = await getAllKeysWithPrefix(prefix);
    if (keys.length > 0) {
      await AsyncStorage.multiRemove(keys);
    }
    return true;
  } catch (error) {
    console.error('접두사 데이터 삭제 오류:', error);
    return false;
  }
};

/**
 * 선택된 아티스트 저장
 * 
 * @param {string} artistId - 아티스트 ID
 * @returns {Promise<boolean>} 성공 여부
 */
export const setSelectedArtist = async (artistId) => {
  try {
    await AsyncStorage.setItem('selected_artist', artistId);
    return true;
  } catch (error) {
    console.error('선택된 아티스트 저장 오류:', error);
    return false;
  }
};

/**
 * 선택된 아티스트 가져오기
 * 
 * @returns {Promise<string|null>} 아티스트 ID 또는 null
 */
export const getSelectedArtist = async () => {
  try {
    const artistId = await AsyncStorage.getItem('selected_artist');
    return artistId;
  } catch (error) {
    console.error('선택된 아티스트 로드 오류:', error);
    return null;
  }
};