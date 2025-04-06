// contexts/NFTContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TIERS } from '../constants/tiers';
import { TEST_NFT_DATA } from '../constants/testData';
import { NFT_THEMES } from '../constants/nftThemes';
import { ARTISTS } from '../constants/artists';
import { MEMBER_IMAGES } from '../constants/memberImages';

// NFT 컨텍스트 생성
const NFTContext = createContext();

// 컨텍스트 훅
export const useNFTContext = () => useContext(NFTContext);

// 제공자 컴포넌트
export const NFTProvider = ({ children }) => {
  const [userNFTs, setUserNFTs] = useState([]);
  const [artistNFTs, setArtistNFTs] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
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
          setSelectedArtist(ARTISTS[savedArtistId]);
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
    if (selectedArtistId) {
      const artistNFTs = userNFTs.filter(nft => nft.artistId === selectedArtistId);
      setArtistNFTs(artistNFTs);
    } else {
      setArtistNFTs([]);
    }
  }, [selectedArtistId, userNFTs]);
  
  // 모든 사용자 NFT 불러오기
  const loadUserNFTs = useCallback(async () => {
    try {
      const savedNFTs = await AsyncStorage.getItem('user_nfts_user123');
      if (savedNFTs) {
        const parsedNFTs = JSON.parse(savedNFTs);
        setUserNFTs(parsedNFTs);
      } else {
        // 저장된 NFT가 없으면 테스트 데이터 사용
        const allTestNFTs = Object.entries(TEST_NFT_DATA).flatMap(([artistId, nfts]) =>
          nfts.map(nft => ({
            ...nft,
            image: nft.image // 이미지 경로는 TEST_NFT_DATA에서 직접 가져옴
          }))
        );
        setUserNFTs(allTestNFTs);
      }
    } catch (error) {
      console.error('NFT 로드 오류:', error);
      const allTestNFTs = Object.entries(TEST_NFT_DATA).flatMap(([artistId, nfts]) =>
        nfts.map(nft => ({
          ...nft,
          image: nft.image // 이미지 경로는 TEST_NFT_DATA에서 직접 가져옴
        }))
      );
      setUserNFTs(allTestNFTs);
    }
  }, []);
  
  // 데이터 동기화 함수
  const syncNFTData = useCallback(async () => {
    try {
      const savedNFTs = await AsyncStorage.getItem('user_nfts_user123');
      const savedActivities = await AsyncStorage.getItem('user_activities_user123');
      const savedBenefitUsage = await AsyncStorage.getItem('benefit_usage_user123');

      if (savedNFTs) {
        const parsedNFTs = JSON.parse(savedNFTs);
        setUserNFTs(parsedNFTs);
      } else {
        const allTestNFTs = Object.entries(TEST_NFT_DATA).flatMap(([artistId, nfts]) =>
          nfts.map(nft => ({
            ...nft,
            image: nft.image // 이미지 경로는 TEST_NFT_DATA에서 직접 가져옴
          }))
        );
        setUserNFTs(allTestNFTs);
        await AsyncStorage.setItem('user_nfts_user123', JSON.stringify(allTestNFTs));
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
      const allTestNFTs = Object.entries(TEST_NFT_DATA).flatMap(([artistId, nfts]) =>
        nfts.map(nft => ({
          ...nft,
          image: nft.image // 이미지 경로는 TEST_NFT_DATA에서 직접 가져옴
        }))
      );
      setUserNFTs(allTestNFTs);
    }
  }, []);
  
  // 선택된 아티스트 변경
  const changeSelectedArtist = useCallback(async (artistId) => {
    try {
      await AsyncStorage.setItem('selected_artist', artistId);
      setSelectedArtistId(artistId);
      setSelectedArtist(ARTISTS[artistId]);
    } catch (error) {
      console.error('아티스트 변경 오류:', error);
    }
  }, []);
  
  // 새 NFT 추가
  const addNewNFT = useCallback(async (nft) => {
    try {
      const updatedNFTs = [...userNFTs, nft];
      await AsyncStorage.setItem('user_nfts_user123', JSON.stringify(updatedNFTs));
      setUserNFTs(updatedNFTs);
      
      if (selectedArtistId && nft.artistId === selectedArtistId) {
        setArtistNFTs(prev => [...prev, nft]);
      }
    } catch (error) {
      console.error('NFT 추가 오류:', error);
    }
  }, [userNFTs, selectedArtistId]);
  
  // NFT 제거
  const removeExistingNFT = useCallback(async (nftId) => {
    try {
      const updatedNFTs = userNFTs.filter(nft => nft.id !== nftId);
      await AsyncStorage.setItem('user_nfts_user123', JSON.stringify(updatedNFTs));
      setUserNFTs(updatedNFTs);
      
      if (selectedArtistId) {
        setArtistNFTs(prev => prev.filter(nft => nft.id !== nftId));
      }
    } catch (error) {
      console.error('NFT 제거 오류:', error);
    }
  }, [userNFTs, selectedArtistId]);
  
  // NFT 합성
  const fuseSelectedNFTs = useCallback(async (nfts) => {
    try {
      const nftIds = nfts.map(nft => nft.id);
      const remainingNFTs = userNFTs.filter(nft => !nftIds.includes(nft.id));
      
      const baseTier = nfts[0].tier;
      const tierOrder = ['fan', 'supporter', 'earlybird', 'founders'];
      const currentTierIndex = tierOrder.indexOf(baseTier);
      const nextTier = tierOrder[currentTierIndex + 1];
      
      if (!nextTier) {
        throw new Error('이미 최고 티어입니다.');
      }

      // 새 NFT 생성
      const artistId = nfts[0].artistId;
      const memberId = nfts[0].memberId;
      const themes = NFT_THEMES[artistId];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      
      const newNFT = {
        id: `fused_${Date.now()}`,
        artistId,
        memberId,
        name: randomTheme.name + ' NFT',
        description: randomTheme.desc,
        tier: nextTier,
        initialPoints: TIERS[nextTier].initialPoints,
        currentPoints: TIERS[nextTier].initialPoints,
        initialSales: Math.min(...nfts.map(n => n.initialSales || 0)),
        currentSales: Math.max(...nfts.map(n => n.currentSales || 0)),
        image: ARTISTS[artistId].members.find(m => m.id === memberId)?.image,
        createdAt: new Date().toISOString(),
        canFuse: true
      };
      
      const updatedNFTs = [...remainingNFTs, newNFT];
      await AsyncStorage.setItem('user_nfts_user123', JSON.stringify(updatedNFTs));
      setUserNFTs(updatedNFTs);
      
      if (selectedArtistId) {
        setArtistNFTs(prev => {
          const filtered = prev.filter(nft => !nftIds.includes(nft.id));
          return [...filtered, newNFT];
        });
      }
      
      return { success: true, newNFT };
    } catch (error) {
      console.error('NFT 합성 오류:', error);
      return { success: false, error: error.message };
    }
  }, [userNFTs, selectedArtistId]);
  
  // NFT 합성 함수 (컨텍스트에서 제공)
  const fuseNFTs = useCallback(async (nfts) => {
    return await fuseSelectedNFTs(nfts);
  }, [fuseSelectedNFTs]);
  
  // 혜택 사용 내역 불러오기
  const loadBenefitUsage = useCallback(async () => {
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
  }, []);
  
  // 혜택 사용 내역 업데이트
  const updateBenefitUsage = useCallback(async (benefitId, usageData) => {
    try {
      const updatedUsage = { ...benefitUsage, [benefitId]: usageData };
      await AsyncStorage.setItem('benefit_usage_user123', JSON.stringify(updatedUsage));
      setBenefitUsage(updatedUsage);
    } catch (error) {
      console.error('혜택 사용 내역 업데이트 오류:', error);
    }
  }, [benefitUsage]);
  
  // 활동 내역 불러오기
  const loadActivities = useCallback(async () => {
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
  }, []);
  
  // 활동 내역 추가
  const addActivity = useCallback(async (activity) => {
    try {
      const updatedActivities = [activity, ...activities];
      await AsyncStorage.setItem('user_activities_user123', JSON.stringify(updatedActivities));
      setActivities(updatedActivities);
    } catch (error) {
      console.error('활동 내역 추가 오류:', error);
    }
  }, [activities]);

  // Context value 객체
  const value = {
    userNFTs,
    artistNFTs,
    selectedArtistId,
    selectedArtist,
    isLoading,
    benefitUsage,
    activities,
    setSelectedArtistId: changeSelectedArtist,
    addNewNFT,
    removeExistingNFT,
    fuseNFTs,
    syncNFTData,
    loadUserNFTs,
    loadBenefitUsage,
    nfts: userNFTs,
    setSelectedArtist: changeSelectedArtist,
    loadActivities,
    updateBenefitUsage,
    addActivity
  };

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  );
};

export default NFTProvider;