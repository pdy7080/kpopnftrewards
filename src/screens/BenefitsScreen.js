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

// Animated FlatList 생성
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// 혜택 사용 내역을 저장할 키
const BENEFIT_USAGE_KEY = 'benefit_usage';

const BenefitsScreen = ({ navigation }) => {
  const { userNFTs } = useNFTContext();
  const route = useRoute();
  const selectedNFT = route.params?.nft;
  const [selectedTier, setSelectedTier] = useState(selectedNFT?.tier || 'all');
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

  // 사용자의 최고 티어 확인
  const getUserHighestTier = () => {
    if (!userNFTs || userNFTs.length === 0) return null;
    
    const tiers = ['fan', 'supporter', 'earlybird', 'founders'];
    let highestTier = 'fan';
    
    userNFTs.forEach(nft => {
      const tierIndex = tiers.indexOf(nft.tier);
      const highestTierIndex = tiers.indexOf(highestTier);
      
      if (tierIndex > highestTierIndex) {
        highestTier = nft.tier;
      }
    });
    
    return highestTier;
  };

  const userHighestTier = getUserHighestTier();

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
      title: '콘서트 우선 예매',
      icon: 'musical-notes',
      tiers: {
        fan: { time: 0, description: '일반 예매' },
        supporter: { time: 12, description: '12시간 전 예매' },
        earlybird: { time: 24, description: '24시간 전 예매' },
        founders: { time: 48, description: '48시간 전 예매' }
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
      navigation.navigate('FansignApplication', {
        tier,
        maxUses: benefit.tiers[tier].count,
        usedCount: getBenefitUsageCount(benefit.id, tier)
      });
    } else if (benefit.id === 'concert') {
      navigation.navigate('ConcertApplication', {
        tier,
        maxUses: benefit.tiers[tier].count,
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
    
    const tierInfo = TIERS[userHighestTier];
    
    return (
      <View style={[styles.currentTierContainer, { borderColor: tierInfo.color }]}>
        <View style={styles.currentTierHeader}>
          <View style={styles.currentTierInfo}>
            <Text style={styles.currentTierLabel}>현재 티어</Text>
            <Text style={[styles.currentTierTitle, { color: tierInfo.color }]}>
              {tierInfo.displayName}
            </Text>
          </View>
          <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
            <Text style={styles.tierBadgeText}>{tierInfo.displayName}</Text>
          </View>
        </View>
        <Text style={styles.currentTierDescription}>
          {tierInfo.description}
        </Text>
      </View>
    );
  };

  const renderTierFilter = useCallback(() => (
    <View style={styles.tierFilterContainer}>
      <ScrollView 
        horizontal 
        style={styles.tierFilter}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tierFilterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedTier === 'all' && styles.filterButtonSelected
          ]}
          onPress={() => setSelectedTier('all')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedTier === 'all' && styles.filterButtonTextSelected
          ]}>전체 보기</Text>
        </TouchableOpacity>

        {Object.entries(TIERS).map(([tier, tierInfo]) => (
          <TouchableOpacity
            key={tier}
            style={[
              styles.filterButton,
              selectedTier === tier && styles.filterButtonSelected,
              { borderColor: tierInfo.color }
            ]}
            onPress={() => setSelectedTier(tier)}
          >
            <Text style={[
              styles.filterButtonText,
              { color: tierInfo.color },
              selectedTier === tier && styles.filterButtonTextSelected
            ]}>{tierInfo.displayName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ), [selectedTier]);

  const renderBenefitItem = useCallback(({ item: benefit }) => (
    <View style={styles.benefitCard}>
      <View style={styles.benefitHeader}>
        <View style={styles.benefitIconContainer}>
          <Ionicons name={benefit.icon} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.benefitTitleContainer}>
          <Text style={styles.benefitTitle}>{benefit.title}</Text>
          <Text style={styles.benefitSubtitle}>{benefit.description}</Text>
        </View>
      </View>

      <View style={styles.tierBenefits}>
        {Object.entries(TIERS).map(([tier, tierInfo]) => {
          if (!benefit.tiers || !benefit.tiers[tier]) return null;
          
          const isAvailable = isBenefitAvailable(benefit, tier);
          const usedCount = getBenefitUsageCount(benefit.id, tier);
          const maxCount = benefit.tiers[tier].count || 0;
          const remainingCount = maxCount - usedCount;

          if (selectedTier !== 'all' && selectedTier !== tier) return null;

          return (
            <View 
              key={tier}
              style={[
                styles.tierBenefit,
                { borderColor: tierInfo.color },
                isAvailable && { backgroundColor: tierInfo.color + '10' }
              ]}
            >
              <View style={styles.tierBenefitHeader}>
                <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
                  <Text style={styles.tierBadgeText}>{tierInfo.displayName}</Text>
                </View>
                {isAvailable && (
                  <View style={[styles.availableBadge, { backgroundColor: tierInfo.color }]}>
                    <Text style={styles.availableText}>사용 가능</Text>
                  </View>
                )}
              </View>

              <Text style={styles.benefitDescription}>
                {benefit.tiers[tier].description}
              </Text>
              
              {(benefit.id === 'fansign' || benefit.id === 'concert') && (
                <View style={styles.usageContainer}>
                  <View style={styles.usageProgress}>
                    <View 
                      style={[
                        styles.usageProgressBar,
                        { 
                          width: `${(usedCount / maxCount) * 100}%`,
                          backgroundColor: tierInfo.color
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.usageInfo}>
                    <Text style={styles.usageText}>
                      사용: {usedCount} / {maxCount}회
                    </Text>
                    <Text style={[styles.remainingText, { color: tierInfo.color }]}>
                      남은 횟수: {remainingCount}회
                    </Text>
                  </View>
                </View>
              )}
              
              {isAvailable && (
                <TouchableOpacity
                  style={[styles.applyButton, { backgroundColor: tierInfo.color }]}
                  onPress={() => handleApplyBenefit(benefit, tier)}
                >
                  <Text style={styles.applyButtonText}>신청하기</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  ), [selectedTier, userNFTs, benefitUsage]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>NFT 혜택</Text>
        <View style={styles.placeholder} />
      </View>

      {renderCurrentTierInfo()}
      {renderTierFilter()}

      <AnimatedFlatList
        data={benefits}
        renderItem={renderBenefitItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
      
      {/* 혜택 신청 모달 */}
      <Modal
        visible={showApplyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>혜택 신청</Text>
            {selectedBenefit && (
              <>
                <Text style={styles.modalText}>
                  {selectedBenefit.benefit.title} 혜택을 신청하시겠습니까?
                </Text>
                <Text style={styles.modalDetailText}>
                  티어: {TIERS[selectedBenefit.tier].displayName}
                </Text>
                <Text style={styles.modalDetailText}>
                  {selectedBenefit.benefit.tiers[selectedBenefit.tier].description}
                </Text>
              </>
            )}
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
                <Text style={styles.confirmButtonText}>신청</Text>
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
  currentTierContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    elevation: 2,
  },
  currentTierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTierInfo: {
    flex: 1,
  },
  currentTierLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentTierTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentTierDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tierBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tierFilterContainer: {
    backgroundColor: 'white',
    marginBottom: 8,
  },
  tierFilter: {
    paddingVertical: 12,
  },
  tierFilterContent: {
    paddingHorizontal: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 8,
  },
  filterButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextSelected: {
    color: 'white',
  },
  content: {
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
    marginBottom: 16,
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitTitleContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  benefitSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  tierBenefits: {
    gap: 12,
  },
  tierBenefit: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tierBenefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  usageContainer: {
    marginBottom: 12,
  },
  usageProgress: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginBottom: 8,
  },
  usageProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  usageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    paddingVertical: 8,
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
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default BenefitsScreen;