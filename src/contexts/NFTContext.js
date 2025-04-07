// contexts/NFTContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateArtistTestData, generateAllArtistsTestData } from '../services/admin/testDataService';
import { ARTISTS } from '../constants/artists';
import { MEMBER_IMAGES } from '../constants/memberImages';

const NFTContext = createContext();

export const NFTProvider = ({ children }) => {
  const [userNFTs, setUserNFTs] = useState([]);
  const [artistNFTs, setArtistNFTs] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const userId = 'user123'; // 테스트용 고정 사용자 ID

  // NFT 이미지 가져오기 함수
  const getNFTImage = useCallback((artistId, memberId) => {
    try {
      const artistImages = MEMBER_IMAGES[artistId];
      if (!artistImages) {
        console.warn('아티스트 이미지를 찾을 수 없음:', artistId);
        return require('../assets/images/placeholder.png');
      }

      const memberImage = artistImages[memberId];
      if (!memberImage) {
        console.warn('멤버 이미지를 찾을 수 없음:', memberId);
        return artistImages.group || require('../assets/images/placeholder.png');
      }

      return memberImage;
    } catch (error) {
      console.error('이미지 로드 오류:', error);
      return require('../assets/images/placeholder.png');
    }
  }, []);

  // 아티스트 선택 처리 함수
  const changeSelectedArtist = useCallback(async (artistId) => {
    try {
      await AsyncStorage.setItem('selected_artist', artistId);
      setSelectedArtistId(artistId);
      setSelectedArtist(ARTISTS[artistId]);
    } catch (error) {
      console.error('아티스트 선택 오류:', error);
    }
  }, []);

  // NFT 데이터 동기화 함수
  const syncNFTData = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(`user_nfts_${userId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // 이미지 정보 추가
        const nftsWithImages = parsedData.map(nft => ({
          ...nft,
          image: getNFTImage(nft.artistId, nft.memberId)
        }));
        setUserNFTs(nftsWithImages);
        
        // 선택된 아티스트의 NFT만 필터링
        if (selectedArtistId) {
          const filteredNFTs = nftsWithImages.filter(nft => nft.artistId === selectedArtistId);
          setArtistNFTs(filteredNFTs);
        }
      } else {
        setUserNFTs([]);
        setArtistNFTs([]);
      }
      return true;
    } catch (error) {
      console.error('NFT 데이터 동기화 오류:', error);
      return false;
    }
  }, [userId, selectedArtistId, getNFTImage]);

  // 선택된 아티스트 변경 시 NFT 필터링
  useEffect(() => {
    if (selectedArtistId && userNFTs.length > 0) {
      const filtered = userNFTs.filter(nft => nft.artistId === selectedArtistId);
      setArtistNFTs(filtered);
    } else {
      setArtistNFTs([]);
    }
  }, [selectedArtistId, userNFTs]);

  // 초기 데이터 로드
  useEffect(() => {
    if (!isInitialized) {
      syncNFTData();
      setIsInitialized(true);
    }
  }, [isInitialized, syncNFTData]);

  // NFT 데이터 리셋 함수
  const resetNFTData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(`user_nfts_${userId}`);
      setUserNFTs([]);
      setArtistNFTs([]);
      return true;
    } catch (error) {
      console.error('NFT 데이터 초기화 오류:', error);
      return false;
    }
  }, [userId]);

  // NFT 데이터 업데이트 함수
  const updateNFTData = useCallback(async (newNFTs) => {
    try {
      await AsyncStorage.setItem(`user_nfts_${userId}`, JSON.stringify(newNFTs));
      setUserNFTs(newNFTs);
      
      // 선택된 아티스트의 NFT만 필터링
      if (selectedArtistId) {
        const filteredNFTs = newNFTs.filter(nft => nft.artistId === selectedArtistId);
        setArtistNFTs(filteredNFTs);
      }
      return true;
    } catch (error) {
      console.error('NFT 데이터 업데이트 오류:', error);
      return false;
    }
  }, [userId, selectedArtistId]);

  // 테스트 데이터 생성 함수
  const generateTestData = useCallback(async () => {
    try {
      // 기존 데이터 초기화
      await resetNFTData();
      
      // 각 아티스트별로 3개의 FAN 티어 NFT 생성
      const testNFTs = [];
      const artists = ['gidle', 'bibi', 'chanwon'];
      
      artists.forEach(artistId => {
        for (let i = 0; i < 3; i++) {
          const nft = {
            id: `nft_${artistId}_${Date.now()}_${i}`,
            artistId,
            name: `${artistId.toUpperCase()} FAN NFT #${i + 1}`,
            tier: 'fan',
            image: require('../assets/images/placeholder.png'),
            currentPoints: 10.0,
            initialPoints: 10.0,
            initialSales: 1000,
            currentSales: 1000,
            createdAt: new Date().toISOString(),
            canFuse: true,
            description: `${artistId.toUpperCase()} FAN 티어 NFT입니다.`
          };
          testNFTs.push(nft);
        }
      });
      
      // 새로운 NFT 데이터 저장
      await updateNFTData(testNFTs);
      return true;
    } catch (error) {
      console.error('테스트 데이터 생성 오류:', error);
      return false;
    }
  }, [resetNFTData, updateNFTData]);

  const value = {
    userNFTs,
    artistNFTs,
    selectedArtistId,
    selectedArtist,
    setSelectedArtist: changeSelectedArtist,
    isLoading,
    syncNFTData,
    resetNFTData,
    updateNFTData,
    getNFTImage
  };

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  );
};

export const useNFTContext = () => {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error('useNFTContext must be used within a NFTProvider');
  }
  return context;
};