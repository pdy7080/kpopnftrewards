// contexts/NFTContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateArtistTestData, generateAllArtistsTestData } from '../services/admin/testDataService';
import { ARTISTS } from '../constants/artists';
import { TIERS } from '../constants/tiers';
import { getTierFrame } from '../utils/imageUtils';

const NFTContext = createContext();

export const useNFT = () => {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error('useNFT must be used within an NFTProvider');
  }
  return context;
};

// 이전 코드와의 호환성을 위해 useNFTContext도 유지
export const useNFTContext = () => {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error('useNFTContext must be used within a NFTProvider');
  }
  return context;
};

export const NFTProvider = ({ children }) => {
  const [userNFTs, setUserNFTs] = useState([]);
  const [artistNFTs, setArtistNFTs] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const userId = 'user123'; // 테스트용 고정 사용자 ID

  // NFT 이미지 가져오기 함수
  const getNFTImage = useCallback((artistId) => {
    try {
      // 아티스트 정보 가져오기
      const artist = ARTISTS[artistId];
      if (!artist) {
        console.warn('아티스트를 찾을 수 없음:', artistId);
        return require('../assets/images/placeholder.png');
      }
      
      // 아티스트 그룹 이미지 반환
      return artist.groupImage;
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
        setUserNFTs(parsedData);
        
        // 선택된 아티스트의 NFT만 필터링
        if (selectedArtistId) {
          const filteredNFTs = parsedData.filter(nft => nft.artistId === selectedArtistId);
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
  }, [userId, selectedArtistId]);

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
            id: `nft_${artistId}_fan_${Date.now()}_${i}`,
            artistId,
            name: `${ARTISTS[artistId].name} 팬 NFT #${i + 1}`,
            tier: 'fan',
            image: ARTISTS[artistId].groupImage,
            currentPoints: 10.0,
            initialPoints: 10.0,
            initialSales: 1000,
            currentSales: 1000,
            createdAt: new Date().toISOString(),
            canFuse: true,
            description: `${ARTISTS[artistId].name}의 팬 티어 NFT입니다.`
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

  // QR 코드 데이터로부터 NFT 생성 함수
  const createNFT = useCallback(async (qrData) => {
    try {
      const { artistId, eventId, purchaseOrder } = qrData;
      
      // 아티스트 정보 가져오기
      const artist = ARTISTS[artistId];
      if (!artist) {
        throw new Error('유효하지 않은 아티스트입니다.');
      }
      
      // 이벤트 정보 가져오기
      const eventName = eventId === 'event1' ? '2025 월드투어' : 
                        eventId === 'event2' ? '단독 콘서트' : 
                        eventId === 'event3' ? '전국투어' : '이벤트';
      
      // 티어 정보 가져오기 (항상 'fan' 티어 사용)
      const tierInfo = TIERS['fan'];
      
      // 판매량 설정 (구매순번 기반)
      const initialSales = purchaseOrder || Math.floor(Math.random() * 1000) + 500;
      const currentSales = initialSales + Math.floor(Math.random() * 500);
      
      // 포인트 계산
      const basePoints = tierInfo.initialPoints || 10.0;
      const currentPoints = basePoints + (currentSales - initialSales) * 0.01;
      
      // NFT 객체 생성
      const nft = {
        id: `nft_${artistId}_fan_${Date.now()}`,
        artistId,
        name: `${artist.name} ${eventName} 기념 NFT`,
        tier: 'fan',
        image: artist.groupImage,
        frameImage: getTierFrame('fan'),
        currentPoints: Number(currentPoints.toFixed(2)),
        initialPoints: basePoints,
        initialSales,
        currentSales,
        purchaseOrder: purchaseOrder || initialSales, // 구매순번 추가
        createdAt: new Date().toISOString(),
        canFuse: true,
        description: `${artist.name}의 ${eventName}을 기념하는 팬 티어 NFT입니다.`
      };
      
      // 기존 NFT 목록에 추가
      const currentNFTs = [...userNFTs, nft];
      await updateNFTData(currentNFTs);
      
      return {
        success: true,
        nft
      };
    } catch (error) {
      console.error('NFT 생성 오류:', error);
      return {
        success: false,
        error: error.message || 'NFT 생성 중 오류가 발생했습니다.'
      };
    }
  }, [userNFTs, updateNFTData]);

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
    getNFTImage,
    createNFT,
    nfts: userNFTs
  };

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  );
};