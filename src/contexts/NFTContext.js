// contexts/NFTContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateArtistTestData, generateAllArtistsTestData } from '../services/admin/testDataService';
import { ARTISTS } from '../constants/artists';

const NFTContext = createContext();

export const NFTProvider = ({ children }) => {
  const [userNFTs, setUserNFTs] = useState([]);
  const [artistNFTs, setArtistNFTs] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const userId = 'user123'; // 테스트용 고정 사용자 ID

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
      setIsLoading(true);
      
      // 저장된 NFT 데이터 불러오기
      const storedNFTsJson = await AsyncStorage.getItem(`user_nfts_${userId}`);
      let nfts = [];
      
      if (storedNFTsJson) {
        try {
          nfts = JSON.parse(storedNFTsJson);
        } catch (parseError) {
          console.error('NFT 데이터 파싱 오류:', parseError);
        }
      }

      // NFT가 없는 경우에만 테스트 데이터 생성
      if (nfts.length === 0) {
        const result = await generateAllArtistsTestData(userId);
        if (result.success) {
          const newStoredNFTsJson = await AsyncStorage.getItem(`user_nfts_${userId}`);
          if (newStoredNFTsJson) {
            nfts = JSON.parse(newStoredNFTsJson);
          }
        } else {
          console.error('테스트 데이터 생성 실패:', result.error);
        }
      }

      // 저장된 선택된 아티스트 불러오기
      const savedArtistId = await AsyncStorage.getItem('selected_artist');
      if (savedArtistId && ARTISTS[savedArtistId]) {
        setSelectedArtistId(savedArtistId);
        setSelectedArtist(ARTISTS[savedArtistId]);
        
        // 선택된 아티스트의 NFT만 필터링
        const artistNFTs = nfts.filter(nft => nft.artistId === savedArtistId);
        setArtistNFTs(artistNFTs);
      }

      setUserNFTs(nfts);
      setIsInitialized(true);
      
      return { success: true, nfts };
    } catch (error) {
      console.error('NFT 데이터 동기화 오류:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    }
  }, [isInitialized, syncNFTData]);

  // NFT 데이터 리셋 함수
  const resetNFTData = useCallback(async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem(`user_nfts_${userId}`);
      await AsyncStorage.removeItem('selected_artist');
      setUserNFTs([]);
      setArtistNFTs([]);
      setSelectedArtistId(null);
      setSelectedArtist(null);
      setIsInitialized(false);
      await syncNFTData();
    } catch (error) {
      console.error('NFT 데이터 리셋 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [syncNFTData]);

  // NFT 데이터 업데이트 함수
  const updateNFTData = useCallback(async (newNFTs) => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem(`user_nfts_${userId}`, JSON.stringify(newNFTs));
      setUserNFTs(newNFTs);
      if (selectedArtistId) {
        const filtered = newNFTs.filter(nft => nft.artistId === selectedArtistId);
        setArtistNFTs(filtered);
      }
    } catch (error) {
      console.error('NFT 데이터 업데이트 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedArtistId]);

  const value = {
    userNFTs,
    artistNFTs,
    selectedArtistId,
    selectedArtist,
    setSelectedArtist: changeSelectedArtist,
    isLoading,
    syncNFTData,
    resetNFTData,
    updateNFTData
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