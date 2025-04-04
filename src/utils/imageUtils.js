// utils/imageUtils.js
import { Image } from 'react-native';

/**
 * 이미지 사전 로딩 함수
 * @param {array} imageUrls - 이미지 경로 배열
 * @returns {Promise} - 모든 이미지 로드 완료 시 resolve
 */
export const preloadImages = (imageUrls) => {
  const promises = imageUrls.map(
    (uri) => Image.prefetch(uri).catch(err => console.warn(`Image prefetch error: ${err}`))
  );
  return Promise.all(promises);
};

/**
 * 이미지 에러 핸들러
 * @param {Error} error - 이미지 로드 에러
 */
export const handleImageError = (error) => {
  console.warn(`Image loading error: ${error}`);
};

/**
 * 아티스트 ID와 멤버 ID로 이미지 경로 결정
 * 
 * @param {string} artistId - 아티스트 ID
 * @param {string} memberId - 멤버 ID
 * @param {string} type - 이미지 유형 ('profile', 'logo', 'group')
 * @returns {object} - require로 가져온 이미지 경로
 */
export const getArtistImage = (artistId, memberId, type = 'profile') => {
  try {
    if (type === 'logo') {
      switch (artistId) {
        case 'gidle':
          return require('../assets/artists/gidle/logo.png');
        case 'bibi':
          return require('../assets/artists/bibi/logo.png');
        case 'chanwon':
          return require('../assets/artists/chanwon/logo.png');
        default:
          return require('../assets/images/placeholder.png');
      }
    } else if (type === 'group') {
      switch (artistId) {
        case 'gidle':
          return require('../assets/artists/gidle/group.jpg');
        case 'bibi':
          return require('../assets/artists/bibi/group.jpg');
        case 'chanwon':
          return require('../assets/artists/chanwon/group.jpg');
        default:
          return require('../assets/images/placeholder.png');
      }
    } else if (type === 'profile') {
      if (artistId === 'gidle') {
        switch (memberId) {
          case 'miyeon':
            return require('../assets/artists/gidle/members/miyeon.jpg');
          case 'minnie':
            return require('../assets/artists/gidle/members/minnie.jpg');
          case 'soyeon':
            return require('../assets/artists/gidle/members/soyeon.jpg');
          case 'yuqi':
            return require('../assets/artists/gidle/members/yuqi.jpg');
          case 'shuhua':
            return require('../assets/artists/gidle/members/shuhua.jpg');
          default:
            return require('../assets/artists/gidle/group.jpg');
        }
      } else if (artistId === 'bibi') {
        return require('../assets/artists/bibi/profile.jpg');
      } else if (artistId === 'chanwon') {
        return require('../assets/artists/chanwon/profile.jpg');
      }
    }
    
    return require('../assets/images/placeholder.png');
  } catch (error) {
    console.warn(`Image path error: ${error}`);
    return require('../assets/images/placeholder.png');
  }
};

/**
 * 티어에 따른 프레임 이미지 가져오기
 * 
 * @param {string} tier - 티어 ID
 * @returns {object} - require로 가져온 프레임 이미지 경로
 */
export const getTierFrame = (tier) => {
  try {
    switch (tier) {
      case 'fan':
        return require('../assets/frames/fan.png');
      case 'supporter':
        return require('../assets/frames/supporter.png');
      case 'earlybird':
        return require('../assets/frames/earlybird.png');
      case 'founders':
        return require('../assets/frames/founders.png');
      default:
        return require('../assets/frames/fan.png');
    }
  } catch (error) {
    console.warn(`Frame image path error: ${error}`);
    return require('../assets/frames/fan.png');
  }
};