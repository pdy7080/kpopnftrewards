// contexts/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getData, storeData } from '../services/storageService';
import { getUserActivities } from '../services/nftService';
import { TIERS } from '../constants/tiers';

// 사용자 컨텍스트 생성
const UserContext = createContext();

// 컨텍스트 훅
export const useUserContext = () => useContext(UserContext);

// 제공자 컴포넌트
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState('user123'); // 시연용 고정 사용자 ID
  const [userProfile, setUserProfile] = useState({
    name: '팬',
    profileImage: null
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 컴포넌트 마운트 시 사용자 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      
      try {
        // 사용자 프로필 로드
        const profile = await getData(`user_profile_${userId}`);
        if (profile) {
          setUserProfile(profile);
        }
        
        // 최근 활동 로드
        const activities = await getUserActivities(userId, 5);
        setRecentActivities(activities);
      } catch (error) {
        console.error('사용자 데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [userId]);
  
  // 프로필 업데이트
  const updateProfile = async (newProfile) => {
    try {
      const updatedProfile = { ...userProfile, ...newProfile };
      await storeData(`user_profile_${userId}`, updatedProfile);
      setUserProfile(updatedProfile);
      return true;
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      return false;
    }
  };
  
  // 최근 활동 새로고침
  const refreshActivities = async () => {
    try {
      const activities = await getUserActivities(userId, 5);
      setRecentActivities(activities);
      return true;
    } catch (error) {
      console.error('활동 새로고침 오류:', error);
      return false;
    }
  };
  
  // 제공할 값
  const value = {
    userId,
    userProfile,
    recentActivities,
    isLoading,
    updateProfile,
    refreshActivities
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};