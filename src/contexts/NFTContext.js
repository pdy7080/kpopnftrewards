// contexts/NFTContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getUserNFTs, 
  getArtistNFTs, 
  addNFT,
  removeNFT,
  fuseNFTs 
} from '../services/nftService';

// NFT 컨텍스트 생성
const NFTContext = createContext();

// 컨텍스트 훅
export const useNFTContext = () => useContext(NFTContext);

// 제공자 컴포넌트
export const NFTProvider = ({ children }) => {
  const [userNFTs, setUserNFTs] = useState([]);
  const [artistNFTs, setArtistNFTs] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [benefitUsage, setBenefitUsage] = useState({});
  const [activities, setActivities] = useState([]);
  
  // 초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      try {
        await syncNFTData();
        const savedArtistId = await AsyncStorage.getItem('selected_artist');
        if (savedArtistId) {
          setSelectedArtistId(savedArtistId);
        }
      } catch (error) {
        console.error('초기 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);
  
  // 선택된 아티스트가 변경되면 해당 아티스트의 NFT 필터링
  useEffect(() => {
    if (selectedArtistId && userNFTs.length > 0) {
      const filteredNFTs = userNFTs.filter(nft => nft.artistId === selectedArtistId);
      setArtistNFTs(filteredNFTs);
    } else {
      setArtistNFTs([]);
    }
  }, [selectedArtistId, userNFTs]);
  
  // 모든 사용자 NFT 불러오기
  const loadUserNFTs = async () => {
    try {
      const savedNFTs = await AsyncStorage.getItem('user_nfts_user123');
      if (savedNFTs) {
        const parsedNFTs = JSON.parse(savedNFTs);
        // 데이터 유효성 검사
        const validNFTs = parsedNFTs.filter(nft => 
          nft.id && 
          nft.artistId && 
          nft.tier && 
          typeof nft.currentPoints === 'number'
        );
        setUserNFTs(validNFTs);
      } else {
        setUserNFTs([]);
      }
    } catch (error) {
      console.error('NFT 로드 오류:', error);
      setUserNFTs([]);
    }
  };
  
  // 데이터 동기화 함수 추가
  const syncNFTData = async () => {
    try {
      const savedNFTs = await AsyncStorage.getItem('user_nfts_user123');
      const savedActivities = await AsyncStorage.getItem('user_activities_user123');
      const savedBenefitUsage = await AsyncStorage.getItem('benefit_usage_user123');

      if (savedNFTs) {
        const parsedNFTs = JSON.parse(savedNFTs);
        setUserNFTs(parsedNFTs);
      }

      if (savedActivities) {
        const parsedActivities = JSON.parse(savedActivities);
        setActivities(parsedActivities);
      }

      if (savedBenefitUsage) {
        const parsedBenefitUsage = JSON.parse(savedBenefitUsage);
        setBenefitUsage(parsedBenefitUsage);
      }
    } catch (error) {
      console.error('데이터 동기화 오류:', error);
    }
  };
  
  // 선택된 아티스트 변경
  const changeSelectedArtist = async (artistId) => {
    try {
      await AsyncStorage.setItem('selected_artist', artistId);
      setSelectedArtistId(artistId);
    } catch (error) {
      console.error('아티스트 변경 오류:', error);
    }
  };
  
  // 새 NFT 추가
  const addNewNFT = async (nft) => {
    try {
      const updatedNFTs = [...userNFTs, nft];
      await AsyncStorage.setItem('user_nfts_user123', JSON.stringify(updatedNFTs));
      setUserNFTs(updatedNFTs);
    } catch (error) {
      console.error('NFT 추가 오류:', error);
    }
  };
  
  // NFT 제거
  const removeExistingNFT = async (nftId) => {
    try {
      const updatedNFTs = userNFTs.filter(nft => nft.id !== nftId);
      await AsyncStorage.setItem('user_nfts_user123', JSON.stringify(updatedNFTs));
      setUserNFTs(updatedNFTs);
    } catch (error) {
      console.error('NFT 제거 오류:', error);
    }
  };
  
  // NFT 합성
  const fuseSelectedNFTs = async (nfts) => {
    try {
      // 기존 NFT 제거
      const nftIds = nfts.map(nft => nft.id);
      const remainingNFTs = userNFTs.filter(nft => !nftIds.includes(nft.id));
      
      // 새로운 NFT 생성 (상위 티어)
      const baseTier = nfts[0].tier;
      const tierOrder = ['fan', 'supporter', 'earlybird', 'founders'];
      const currentTierIndex = tierOrder.indexOf(baseTier);
      const nextTier = tierOrder[currentTierIndex + 1];
      
      if (!nextTier) {
        throw new Error('이미 최고 티어입니다.');
      }
      
      // 새 NFT 생성
      const newNFT = {
        id: `fused_${Date.now()}`,
        artistId: nfts[0].artistId,
        memberId: nfts[0].memberId,
        name: nfts[0].name,
        tier: nextTier,
        initialPoints: TIERS[nextTier].initialPoints,
        currentPoints: TIERS[nextTier].initialPoints,
        initialSales: Math.min(...nfts.map(n => n.initialSales)),
        currentSales: Math.max(...nfts.map(n => n.currentSales)),
        createdAt: new Date().toISOString(),
        canFuse: true
      };
      
      // 업데이트된 NFT 목록 저장
      const updatedNFTs = [...remainingNFTs, newNFT];
      await AsyncStorage.setItem('user_nfts_user123', JSON.stringify(updatedNFTs));
      setUserNFTs(updatedNFTs);
      
      return { success: true, newNFT };
    } catch (error) {
      console.error('NFT 합성 오류:', error);
      return { success: false, error: error.message };
    }
  };
  
  // 혜택 사용 내역 불러오기
  const loadBenefitUsage = async () => {
    try {
      const savedUsage = await AsyncStorage.getItem('benefit_usage_user123');
      if (savedUsage) {
        const parsedUsage = JSON.parse(savedUsage);
        setBenefitUsage(parsedUsage);
      }
    } catch (error) {
      console.error('혜택 사용 내역 로드 오류:', error);
      setBenefitUsage({});
    }
  };
  
  // 혜택 사용 내역 업데이트
  const updateBenefitUsage = async (benefitId, usageData) => {
    try {
      const updatedUsage = { ...benefitUsage, [benefitId]: usageData };
      await AsyncStorage.setItem('benefit_usage_user123', JSON.stringify(updatedUsage));
      setBenefitUsage(updatedUsage);
    } catch (error) {
      console.error('혜택 사용 내역 업데이트 오류:', error);
    }
  };
  
  // 활동 내역 불러오기
  const loadActivities = async () => {
    try {
      const savedActivities = await AsyncStorage.getItem('user_activities_user123');
      if (savedActivities) {
        const parsedActivities = JSON.parse(savedActivities);
        setActivities(parsedActivities);
      }
    } catch (error) {
      console.error('활동 내역 로드 오류:', error);
      setActivities([]);
    }
  };
  
  // 활동 내역 추가
  const addActivity = async (activity) => {
    try {
      const updatedActivities = [activity, ...activities];
      await AsyncStorage.setItem('user_activities_user123', JSON.stringify(updatedActivities));
      setActivities(updatedActivities);
    } catch (error) {
      console.error('활동 내역 추가 오류:', error);
    }
  };
  
  return (
    <NFTContext.Provider
      value={{
        userNFTs,
        artistNFTs,
        selectedArtistId,
        isLoading,
        benefitUsage,
        activities,
        setSelectedArtistId: changeSelectedArtist,
        loadUserNFTs,
        addNewNFT,
        removeExistingNFT,
        fuseSelectedNFTs,
        loadBenefitUsage,
        updateBenefitUsage,
        loadActivities,
        addActivity
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};