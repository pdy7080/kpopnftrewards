// screens/BenefitsScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Animated,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNFTContext } from '../contexts/NFTContext';
import { COLORS } from '../constants/colors';
import { TIERS } from '../constants/tiers';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ROUTES } from '../constants/navigation';

// Animated FlatList 생성
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// 혜택 사용 내역을 저장할 키
const BENEFIT_USAGE_KEY = 'benefit_usage';

const BenefitsScreen = ({ navigation }) => {
  const { userNFTs } = useNFTContext();
  const route = useRoute();
  const selectedNFT = route.params?.nft;
  
  // 사용자의 최고 티어 확인
  const getUserHighestTier = () => {
    if (!userNFTs || userNFTs.length === 0) return null;
    
    const tierOrder = ['founders', 'earlybird', 'supporter', 'fan'];
    let highestTier = 'fan';
    
    userNFTs.forEach(nft => {
      const tierIndex = tierOrder.indexOf(nft.tier);
      const highestTierIndex = tierOrder.indexOf(highestTier);
      
      if (tierIndex < highestTierIndex) {
        highestTier = nft.tier;
      }
    });
    
    return highestTier;
  };

  const userHighestTier = getUserHighestTier();
  // 초기 선택 티어를 사용자의 최고 티어로 설정
  const [selectedTier, setSelectedTier] = useState(userHighestTier || 'all');
  const [benefitUsage, setBenefitUsage] = useState({});
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // 혜택 사용 내역 로드
  useEffect(() => {
    const loadBenefitUsage = async () => {
      try {
        const usageData = await AsyncStorage.getItem(BENEFIT_USAGE_KEY);
        if (usageData) {
          setBenefitUsage(JSON.parse(usageData));
        }
      } catch (error) {
        console.error('혜택 사용 내역 로드 실패:', error);
      }
    };
    
    loadBenefitUsage();
  }, []);

  // 혜택 사용 내역 저장
  const saveBenefitUsage = async (newUsage) => {
    try {
      await AsyncStorage.setItem(BENEFIT_USAGE_KEY, JSON.stringify(newUsage));
      setBenefitUsage(newUsage);
    } catch (error) {
      console.error('혜택 사용 내역 저장 실패:', error);
    }
  };

  // 혜택 데이터
  const benefits = [
    {
      id: 'fansign',
      title: '팬사인회 응모',
      icon: 'person',
      tiers: {
        fan: { count: 1, description: '1회 응모 가능' },
        supporter: { count: 3, description: '3회 응모 가능' },
        earlybird: { count: 5, description: '5회 응모 가능' },
        founders: { count: 10, description: '10회 응모 가능' }
      }
    },
    {
      id: 'concert',
      title: '콘서트 응모',
      icon: 'musical-notes',
      tiers: {
        fan: { count: 1, description: '1회 응모 가능' },
        supporter: { count: 3, description: '3회 응모 가능' },
        earlybird: { count: 5, description: '5회 응모 가능' },
        founders: { count: 10, description: '10회 응모 가능' }
      }
    },
    {
      id: 'content',
      title: '독점 콘텐츠',
      icon: 'play-circle',
      tiers: {
        fan: { access: 'basic', description: '기본 콘텐츠' },
        supporter: { access: 'premium', description: '프리미엄 콘텐츠' },
        earlybird: { access: 'vip', description: 'VIP 콘텐츠' },
        founders: { access: 'all', description: '모든 콘텐츠' }
      }
    }
  ];

  // 혜택 사용 횟수 확인
  const getBenefitUsageCount = (benefitId, tier) => {
    const key = `${benefitId}_${tier}`;
    return benefitUsage[key] || 0;
  };

  // 혜택 사용 가능 여부 확인
  const isBenefitAvailable = (benefit, tier) => {
    if (!userHighestTier) return false;
    
    const tierOrder = ['founders', 'earlybird', 'supporter', 'fan'];
    const userTierIndex = tierOrder.indexOf(userHighestTier);
    const benefitTierIndex = tierOrder.indexOf(tier);
    
    if (userTierIndex < benefitTierIndex) return false;
    
    // 티어 정보가 존재하는지 확인
    if (!benefit.tiers || !benefit.tiers[tier]) return false;
    
    // 팬사인회와 콘서트는 횟수 제한이 있음
    if (benefit.id === 'fansign' || benefit.id === 'concert') {
      const maxCount = benefit.tiers[tier].count || 0;
      const usedCount = getBenefitUsageCount(benefit.id, tier);
      return usedCount < maxCount;
    }
    
    return true;
  };

  // 혜택 신청 처리
  const handleApplyBenefit = (benefit, tier) => {
    if (benefit.id === 'fansign') {
      navigation.navigate(ROUTES.FANSIGN_APPLICATION, {
        tier,
        maxUses: benefit.tiers[tier]?.count || 0,
        usedCount: getBenefitUsageCount(benefit.id, tier)
      });
    } else if (benefit.id === 'concert') {
      navigation.navigate(ROUTES.CONCERT_APPLICATION, {
        tier,
        maxUses: benefit.tiers[tier]?.count || 0,
        usedCount: getBenefitUsageCount(benefit.id, tier)
      });
    } else {
      setSelectedBenefit({ benefit, tier });
      setShowApplyModal(true);
    }
  };

  // 혜택 신청 확인
  const confirmApplyBenefit = () => {
    if (!selectedBenefit) return;
    
    const { benefit, tier } = selectedBenefit;
    const key = `${benefit.id}_${tier}`;
    const currentCount = getBenefitUsageCount(benefit.id, tier);
    
    // 사용 횟수 증가
    const newUsage = {
      ...benefitUsage,
      [key]: currentCount + 1
    };
    
    saveBenefitUsage(newUsage);
    setShowApplyModal(false);
    
    Alert.alert(
      '신청 완료',
      `${benefit.title} 혜택이 신청되었습니다.`,
      [{ text: '확인' }]
    );
  };

  // 현재 티어 정보 렌더링
  const renderCurrentTierInfo = () => {
    if (!userHighestTier) {
      return (
        <View style={styles.currentTierContainer}>
          <Text style={styles.currentTierTitle}>보유한 NFT가 없습니다</Text>
          <Text style={styles.currentTierDescription}>QR 스캔으로 NFT를 획득해보세요!</Text>
        </View>
      );
    }

    const tierInfo = TIERS[userHighestTier] || TIERS.fan;
    
    return (
      <View style={[styles.currentTierContainer, { backgroundColor: tierInfo.color + '10' }]}>
        <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
          <Text style={styles.tierBadgeText}>{tierInfo.displayName}</Text>
        </View>
        <Text style={styles.currentTierTitle}>현재 티어: {tierInfo.displayName}</Text>
        <Text style={styles.currentTierDescription}>{tierInfo.description}</Text>
      </View>
    );
  };

  // 티어 필터 렌더링
  const renderTierFilter = () => {
    const tiers = [
      { id: 'all', name: '전체', color: COLORS.primary },
      { id: 'founders', name: '파운더스', color: TIERS.founders?.color || '#FFD700' },
      { id: 'earlybird', name: '얼리버드', color: TIERS.earlybird?.color || '#FF9800' },
      { id: 'supporter', name: '서포터', color: TIERS.supporter?.color || '#4CAF50' },
      { id: 'fan', name: '팬', color: TIERS.fan?.color || '#2196F3' }
    ];

    return (
      <View style={styles.tierFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tiers.map(tier => (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.tierFilterButton,
                { borderColor: tier.color },
                selectedTier === tier.id && { backgroundColor: tier.color }
              ]}
              onPress={() => setSelectedTier(tier.id)}
            >
              <Text
                style={[
                  styles.tierFilterText,
                  { color: tier.color },
                  selectedTier === tier.id && { color: 'white' }
                ]}
              >
                {tier.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // 혜택 카드 렌더링
  const renderBenefitCard = ({ item: benefit }) => {
    const tier = selectedTier === 'all' ? userHighestTier : selectedTier;
    const isAvailable = isBenefitAvailable(benefit, tier);
    const tierInfo = TIERS[tier] || TIERS.fan; // 기본값으로 fan 티어 사용
    const usedCount = getBenefitUsageCount(benefit.id, tier);
    const maxCount = benefit.tiers[tier]?.count || 0;
    
    return (
      <View style={styles.benefitCard} key={benefit.id}>
        <View style={styles.benefitHeader}>
          <Ionicons name={benefit.icon} size={24} color={tierInfo.color} />
          <Text style={styles.benefitTitle}>{benefit.title}</Text>
        </View>
        
        <Text style={styles.benefitDescription}>
          {benefit.tiers[tier]?.description || '해당 티어에서 이용할 수 없는 혜택입니다.'}
        </Text>
        
        {(benefit.id === 'fansign' || benefit.id === 'concert') && (
          <View style={styles.usageInfo}>
            <Text style={styles.usageText}>
              사용: {usedCount} / {maxCount}회
            </Text>
            <Text style={[styles.remainingText, { color: tierInfo.color }]}>
              남은 횟수: {maxCount - usedCount}회
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[
            styles.applyButton,
            { backgroundColor: isAvailable ? tierInfo.color : '#ccc' }
          ]}
          onPress={() => handleApplyBenefit(benefit, tier)}
          disabled={!isAvailable}
        >
          <Text style={styles.applyButtonText}>
            {isAvailable ? '신청하기' : '이용 불가'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>혜택</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        {renderCurrentTierInfo()}
        {renderTierFilter()}
        
        <View style={styles.benefitsContainer}>
          {benefits.map(benefit => renderBenefitCard({ item: benefit }))}
        </View>
      </ScrollView>
      
      <Modal
        visible={showApplyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>혜택 신청</Text>
            <Text style={styles.modalDescription}>
              {selectedBenefit?.benefit.title} 혜택을 신청하시겠습니까?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowApplyModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmApplyBenefit}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  currentTierContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  tierBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  currentTierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  currentTierDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tierFilterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tierFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 2,
  },
  tierFilterText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  benefitsContainer: {
    padding: 16,
  },
  benefitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  usageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  usageText: {
    fontSize: 12,
    color: '#666',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  applyButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default BenefitsScreen;