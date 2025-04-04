// contexts/AppContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, storeData, getSelectedArtist, setSelectedArtist } from '../services/storageService';
import { ARTISTS } from '../constants/artists';

// 앱 컨텍스트 생성
const AppContext = createContext();

// 컨텍스트 훅
export const useAppContext = () => useContext(AppContext);

// 제공자 컴포넌트
export const AppProvider = ({ children }) => {
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState({
    showAdminIcon: false,
    autoReset: false,
    theme: 'default'
  });
  
  // 컴포넌트 마운트 시 앱 데이터 로드
  useEffect(() => {
    const loadAppData = async () => {
      setIsLoading(true);
      
      try {
        // 선택된 아티스트 로드
        const artistId = await getSelectedArtist();
        if (artistId && ARTISTS[artistId]) {
          setSelectedArtistId(artistId);
        }
        
        // 앱 설정 로드
        const settings = await getData('app_settings');
        if (settings) {
          setAppSettings(settings);
        }
      } catch (error) {
        console.error('앱 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppData();
  }, []);
  
  // 아티스트 선택 변경
  const changeSelectedArtist = async (artistId) => {
    try {
      const success = await setSelectedArtist(artistId);
      if (success) {
        setSelectedArtistId(artistId);
      }
      return success;
    } catch (error) {
      console.error('아티스트 변경 오류:', error);
      return false;
    }
  };
  
  // 관리자 모드 토글
  const toggleAdminMode = () => {
    setIsAdmin(prev => !prev);
  };
  
  // 앱 설정 업데이트
  const updateAppSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...appSettings, ...newSettings };
      await storeData('app_settings', updatedSettings);
      setAppSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('설정 업데이트 오류:', error);
      return false;
    }
  };
  
  // 제공할 값
  const value = {
    selectedArtistId,
    isAdmin,
    isLoading,
    appSettings,
    changeSelectedArtist,
    toggleAdminMode,
    updateAppSettings
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};