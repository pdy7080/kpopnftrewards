import AsyncStorage from '@react-native-async-storage/async-storage';

// 선택한 아티스트 저장
export const setSelectedArtist = async (artistId) => {
  try {
    await AsyncStorage.setItem('selectedArtist', artistId);
    return true;
  } catch (error) {
    console.error('아티스트 저장 오류:', error);
    return false;
  }
};

// 선택한 아티스트 가져오기
export const getSelectedArtist = async () => {
  try {
    const artistId = await AsyncStorage.getItem('selectedArtist');
    return artistId;
  } catch (error) {
    console.error('아티스트 불러오기 오류:', error);
    return null;
  }
};

// NFT 데이터 저장
export const saveNFTs = async (nfts) => {
  try {
    await AsyncStorage.setItem('userNFTs', JSON.stringify(nfts));
    return true;
  } catch (error) {
    console.error('NFT 저장 오류:', error);
    return false;
  }
};

// NFT 데이터 가져오기
export const getNFTs = async () => {
  try {
    const nftsJson = await AsyncStorage.getItem('userNFTs');
    return nftsJson ? JSON.parse(nftsJson) : [];
  } catch (error) {
    console.error('NFT 불러오기 오류:', error);
    return [];
  }
};

// NFT 추가
export const addNFT = async (nft) => {
  try {
    const nfts = await getNFTs();
    nfts.push(nft);
    await saveNFTs(nfts);
    return true;
  } catch (error) {
    console.error('NFT 추가 오류:', error);
    return false;
  }
};

// NFT 업데이트
export const updateNFT = async (updatedNFT) => {
  try {
    const nfts = await getNFTs();
    const index = nfts.findIndex(nft => nft.id === updatedNFT.id);
    if (index !== -1) {
      nfts[index] = updatedNFT;
      await saveNFTs(nfts);
      return true;
    }
    return false;
  } catch (error) {
    console.error('NFT 업데이트 오류:', error);
    return false;
  }
};

// NFT 삭제
export const deleteNFT = async (nftId) => {
  try {
    const nfts = await getNFTs();
    const filteredNFTs = nfts.filter(nft => nft.id !== nftId);
    await saveNFTs(filteredNFTs);
    return true;
  } catch (error) {
    console.error('NFT 삭제 오류:', error);
    return false;
  }
};

// 혜택 사용 내역 저장
export const saveBenefitUsage = async (benefitUsage) => {
  try {
    await AsyncStorage.setItem('benefitUsage', JSON.stringify(benefitUsage));
    return true;
  } catch (error) {
    console.error('혜택 사용 내역 저장 오류:', error);
    return false;
  }
};

// 혜택 사용 내역 가져오기
export const getBenefitUsage = async () => {
  try {
    const benefitUsageJson = await AsyncStorage.getItem('benefitUsage');
    return benefitUsageJson ? JSON.parse(benefitUsageJson) : {};
  } catch (error) {
    console.error('혜택 사용 내역 불러오기 오류:', error);
    return {};
  }
};

// 활동 내역 저장
export const saveActivities = async (activities) => {
  try {
    await AsyncStorage.setItem('userActivities', JSON.stringify(activities));
    return true;
  } catch (error) {
    console.error('활동 내역 저장 오류:', error);
    return false;
  }
};

// 활동 내역 가져오기
export const getActivities = async () => {
  try {
    const activitiesJson = await AsyncStorage.getItem('userActivities');
    return activitiesJson ? JSON.parse(activitiesJson) : [];
  } catch (error) {
    console.error('활동 내역 불러오기 오류:', error);
    return [];
  }
};

// 활동 내역 추가
export const addActivity = async (activity) => {
  try {
    const activities = await getActivities();
    activities.unshift(activity); // 최신 활동을 앞에 추가
    await saveActivities(activities);
    return true;
  } catch (error) {
    console.error('활동 내역 추가 오류:', error);
    return false;
  }
}; 