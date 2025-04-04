// screens/NFTFusionScreen.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NFTCard from '../components/nft/NFTCard';
import { useNFTContext } from '../contexts/NFTContext';
import { TIERS } from '../constants/tiers';
import { COLORS } from '../constants/colors';
import { getNextTier } from '../utils/tierHelpers';
import { useFocusEffect } from '@react-navigation/native';

const NFTFusionScreen = React.memo(({ navigation, route }) => {
  const { userNFTs, fuseNFTs } = useNFTContext();
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);
  
  // 메모이제이션된 상태 관리
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [fusionState, setFusionState] = useState('select');
  const [fusionResult, setFusionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 뒤로가기 버튼 처리
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (fusionState === 'fusing') {
          Alert.alert(
            '알림',
            '합성이 진행 중입니다. 정말 취소하시겠습니까?',
            [
              { text: '취소', style: 'cancel' },
              { 
                text: '확인', 
                onPress: () => {
                  setFusionState('select');
                  setIsLoading(false);
                }
              }
            ]
          );
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [fusionState])
  );
  
  // 라우트에서 전달된 선택된 NFT 처리
  useEffect(() => {
    if (route.params?.preSelectedNFT) {
      handleNFTSelect(route.params.preSelectedNFT);
    }
    return () => {
      setSelectedNFTs([]);
      setSelectedTier(null);
      setFusionState('select');
      setFusionResult(null);
      setError(null);
    };
  }, [route.params]);
  
  // 메모이제이션된 콜백 함수들
  const handleNFTSelect = useCallback((nft) => {
    if (!isMounted.current) return;
    
    if (selectedNFTs.length >= 3) {
      Alert.alert('알림', 'NFT는 최대 3개까지 선택할 수 있습니다.');
      return;
    }
    
    if (selectedNFTs.some(selected => selected.id === nft.id)) {
      return;
    }
    
    if (selectedNFTs.length === 0) {
      setSelectedTier(nft.tier);
    } else if (nft.tier !== selectedTier) {
      Alert.alert('알림', '같은 티어의 NFT만 선택할 수 있습니다.');
      return;
    }
    
    setSelectedNFTs(prev => [...prev, nft]);
  }, [selectedNFTs, selectedTier]);

  const handleNFTDeselect = useCallback((nftId) => {
    if (!isMounted.current) return;
    
    setSelectedNFTs(prev => {
      const updated = prev.filter(nft => nft.id !== nftId);
      if (updated.length === 0) {
        setSelectedTier(null);
      }
      return updated;
    });
  }, []);

  // 메모이제이션된 필터링된 NFT 목록
  const filteredNFTs = useMemo(() => {
    if (!selectedTier) return userNFTs;
    return userNFTs.filter(nft => 
      nft.tier === selectedTier && 
      !selectedNFTs.some(selected => selected.id === nft.id)
    );
  }, [userNFTs, selectedTier, selectedNFTs]);

  // 메모이제이션된 합성 미리보기 계산
  const fusionPreview = useMemo(() => {
    if (selectedNFTs.length !== 3 || !selectedTier) return null;
    return calculateFusionPreview(selectedNFTs, selectedTier);
  }, [selectedNFTs, selectedTier]);
  
  // 합성 미리보기 계산
  const calculateFusionPreview = useCallback((nfts, tier) => {
    if (nfts.length !== 3 || !tier) return null;
    
    try {
      // 다음 티어 구하기
      const tierOrder = ['fan', 'supporter', 'earlybird', 'founders'];
      const currentTierIndex = tierOrder.indexOf(tier);
      
      // 이미 최고 티어인 경우
      if (currentTierIndex === tierOrder.length - 1) {
        return null;
      }
      
      const nextTierKey = tierOrder[currentTierIndex + 1];
      
      // 기준 NFT (첫 번째 선택된 NFT)
      const baseNFT = nfts[0];
      
      // 새 NFT의 예상 포인트
      const nextTierConfig = TIERS[nextTierKey];
      const initialPoints = nextTierConfig.initialPoints;
      
      // 혜택 변화 계산
      const benefitChanges = {
        fansignCount: {
          current: TIERS[tier].fansignCount || 0,
          next: TIERS[nextTierKey].fansignCount || 0
        },
        concertPreorder: {
          current: TIERS[tier].concertPreorder || 0,
          next: TIERS[nextTierKey].concertPreorder || 0
        },
        winMultiplier: {
          current: TIERS[tier].winningMultiplier || 1,
          next: TIERS[nextTierKey].winningMultiplier || 1
        }
      };
      
      return {
        currentTier: tier,
        nextTier: nextTierKey,
        currentPoints: baseNFT.currentPoints,
        nextPoints: initialPoints,
        pointsIncrease: initialPoints - baseNFT.currentPoints,
        benefitChanges
      };
    } catch (error) {
      console.error('Fusion preview calculation error:', error);
      return null;
    }
  }, []);
  
  // 합성 시작
  const handleStartFusion = async () => {
    if (!isMounted.current) return;
    
    if (selectedNFTs.length !== 3) {
      Alert.alert('알림', 'NFT 3개를 선택해야 합니다.');
      return;
    }

    try {
      setFusionState('fusing');
      setIsLoading(true);
      setError(null);

      // 합성 전 유효성 검사
      const validationResult = validateNFTsForFusion(selectedNFTs);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }

      // 타임아웃 설정
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          setError('합성 시간이 초과되었습니다. 다시 시도해주세요.');
          setFusionState('select');
          setIsLoading(false);
        }
      }, 30000); // 30초 타임아웃

      // 합성 진행
      const result = await fuseNFTs(selectedNFTs);
      
      if (!isMounted.current) return;
      
      if (result.success) {
        setFusionResult(result.newNFT);
        setFusionState('result');
      } else {
        throw new Error(result.error || '합성에 실패했습니다.');
      }
    } catch (error) {
      if (isMounted.current) {
        setError(error.message || '합성 과정에서 오류가 발생했습니다.');
        setFusionState('select');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    }
  };
  
  // NFT 유효성 검사 함수
  const validateNFTsForFusion = useCallback((nfts) => {
    try {
      if (nfts.length !== 3) {
        return { isValid: false, error: 'NFT 3개가 필요합니다.' };
      }

      const tier = nfts[0].tier;
      if (!nfts.every(nft => nft.tier === tier)) {
        return { isValid: false, error: '같은 티어의 NFT만 합성할 수 있습니다.' };
      }

      const tierOrder = ['fan', 'supporter', 'earlybird', 'founders'];
      const currentTierIndex = tierOrder.indexOf(tier);
      
      if (currentTierIndex === tierOrder.length - 1) {
        return { isValid: false, error: '이미 최고 티어입니다.' };
      }

      return { isValid: true };
    } catch (error) {
      console.error('NFT validation error:', error);
      return { isValid: false, error: 'NFT 유효성 검사 중 오류가 발생했습니다.' };
    }
  }, []);
  
  // 초기화
  const handleReset = useCallback(() => {
    if (!isMounted.current) return;
    setSelectedNFTs([]);
    setSelectedTier(null);
    setError(null);
  }, []);
  
  // 완료
  const handleComplete = useCallback(() => {
    if (!isMounted.current) return;
    navigation.navigate('Home');
  }, [navigation]);
  
  // 선택 화면
  const renderSelectScreen = () => (
    <View style={styles.container}>
      {/* 안내 텍스트 */}
      <Text style={styles.instructionText}>
        {selectedTier 
          ? `${TIERS[selectedTier].displayName} 티어 NFT 3개를 선택하여 합성하세요.`
          : '합성할 NFT를 선택하세요. 같은 티어 NFT 3개가 필요합니다.'
        }
      </Text>
      
      {/* 선택된 NFT 표시 영역 */}
      <View style={styles.selectedContainer}>
        <Text style={styles.selectedTitle}>선택된 NFT: {selectedNFTs.length}/3</Text>
        <View style={styles.selectedNFTs}>
          {selectedNFTs.map((nft) => (
            <View key={`selected-${nft.id}`} style={styles.selectedNFTContainer}>
              <NFTCard nft={nft} size="small" />
              <TouchableOpacity
                style={styles.deselectButton}
                onPress={() => handleNFTDeselect(nft.id)}
              >
                <Text style={styles.deselectButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          {/* 빈 슬롯 표시 */}
          {Array.from({ length: 3 - selectedNFTs.length }).map((_, index) => (
            <View key={`empty-${index}`} style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>NFT를 선택하세요</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* 합성 결과 미리보기 */}
      {selectedNFTs.length === 3 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>합성 결과 미리보기</Text>
          
          {fusionPreview ? (
            <>
              <View style={styles.tierComparisonContainer}>
                <View style={styles.currentTierContainer}>
                  <Text style={styles.tierName}>
                    {TIERS[fusionPreview.currentTier].displayName}
                  </Text>
                  <Text style={styles.tierPoints}>
                    {fusionPreview.currentPoints.toFixed(1)} 포인트
                  </Text>
                </View>
                
                <View style={styles.tierArrow}>
                  <Text style={styles.tierArrowText}>→</Text>
                </View>
                
                <View style={styles.nextTierContainer}>
                  <Text style={styles.tierName}>
                    {TIERS[fusionPreview.nextTier].displayName}
                  </Text>
                  <Text style={styles.tierPoints}>
                    {fusionPreview.nextPoints.toFixed(1)} 포인트
                    <Text style={styles.pointsIncrease}>
                      {` (+${fusionPreview.pointsIncrease.toFixed(1)})`}
                    </Text>
                  </Text>
                </View>
              </View>
              
              <Text style={styles.benefitsChangeTitle}>혜택 변화</Text>
              <View style={styles.benefitsChangeList}>
                <View style={styles.benefitChangeItem}>
                  <Text style={styles.benefitLabel}>팬사인회 응모 횟수:</Text>
                  <Text style={styles.benefitValue}>
                    {fusionPreview.benefitChanges.fansignCount.current}회 → 
                    {fusionPreview.benefitChanges.fansignCount.next}회
                  </Text>
                </View>
                
                <View style={styles.benefitChangeItem}>
                  <Text style={styles.benefitLabel}>콘서트 우선 예매:</Text>
                  <Text style={styles.benefitValue}>
                    {fusionPreview.benefitChanges.concertPreorder.current}시간 전 → 
                    {fusionPreview.benefitChanges.concertPreorder.next}시간 전
                  </Text>
                </View>
                
                <View style={styles.benefitChangeItem}>
                  <Text style={styles.benefitLabel}>당첨 가중치:</Text>
                  <Text style={styles.benefitValue}>
                    {fusionPreview.benefitChanges.winMultiplier.current}배 → 
                    {fusionPreview.benefitChanges.winMultiplier.next}배
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.previewPlaceholder}>
              {selectedNFTs.length < 3 
                ? `NFT ${3 - selectedNFTs.length}개 더 선택하세요` 
                : '이미 최고 티어입니다. 더 이상 합성할 수 없습니다.'}
            </Text>
          )}
        </View>
      )}
      
      {/* 선택 가능한 NFT 목록 */}
      <Text style={styles.availableTitle}>사용 가능한 NFT</Text>
      <FlatList
        data={filteredNFTs}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleNFTSelect(item)}
            disabled={selectedNFTs.length >= 3 || (selectedTier && item.tier !== selectedTier)}
          >
            <NFTCard 
              nft={item} 
              size="medium"
              isSelected={selectedNFTs.some(nft => nft.id === item.id)}
              onSelect={handleNFTSelect}
              onDeselect={() => handleNFTDeselect(item.id)}
              disabled={selectedTier && item.tier !== selectedTier}
            />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.nftList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {selectedTier 
              ? `${TIERS[selectedTier].displayName} 티어의 NFT가 부족합니다.`
              : '사용 가능한 NFT가 없습니다.'
            }
          </Text>
        }
      />
      
      {/* 하단 버튼 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          disabled={selectedNFTs.length === 0}
        >
          <Text style={styles.resetButtonText}>초기화</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.fusionButton,
            (selectedNFTs.length < 3 || !fusionPreview) && styles.disabledButton
          ]}
          disabled={selectedNFTs.length < 3 || !fusionPreview}
          onPress={handleStartFusion}
        >
          <Text style={styles.fusionButtonText}>
            {selectedNFTs.length === 3 
              ? fusionPreview 
                ? '합성하기' 
                : '합성 불가' 
              : `NFT ${3 - selectedNFTs.length}개 더 필요`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // 합성 중 화면
  const renderFusingScreen = () => (
    <View style={styles.fusingContainer}>
      <Text style={styles.fusingTitle}>NFT 합성 중...</Text>
      
      <View style={styles.animationContainer}>
        {/* 합성 애니메이션 - 실제 앱에선 Lottie 애니메이션 사용 */}
        <ActivityIndicator size="large" color={COLORS.primary} />
        
        <View style={styles.fusionNFTsContainer}>
          {selectedNFTs.map((nft, index) => (
            <View 
              key={`fusion-${nft.id}`} 
              style={[
                styles.fusionNFT,
                { transform: [{ rotate: `${index * 120}deg` }] }
              ]}
            >
              <NFTCard nft={nft} size="small" />
            </View>
          ))}
        </View>
      </View>
      
      <Text style={styles.fusingSubtitle}>
        {selectedTier && `${TIERS[selectedTier].displayName} 티어 NFT를 합성하여 상위 티어 NFT를 생성 중입니다...`}
      </Text>
    </View>
  );
  
  // 결과 화면
  const renderResultScreen = () => (
    <View style={styles.resultContainer}>
      <Text style={styles.resultTitle}>합성 성공!</Text>
      
      {/* 결과 NFT */}
      <View style={styles.resultNFTContainer}>
        <NFTCard nft={fusionResult} size="large" />
      </View>
      
      {/* 티어 업그레이드 정보 */}
      <View style={styles.upgradeInfo}>
        <Text style={styles.upgradeTitle}>티어 업그레이드!</Text>
        <View style={styles.tierComparison}>
          <View style={styles.oldTier}>
            <Text style={styles.tierName}>{TIERS[selectedTier].displayName}</Text>
            <Text style={styles.tierPoints}>{TIERS[selectedTier].initialPoints} 포인트</Text>
          </View>
          
          <Text style={styles.tierArrow}>→</Text>
          
          <View style={styles.newTier}>
            <Text style={styles.tierName}>{TIERS[fusionResult.tier].displayName}</Text>
            <Text style={styles.tierPoints}>{TIERS[fusionResult.tier].initialPoints} 포인트</Text>
          </View>
        </View>
      </View>
      
      {/* 새 혜택 정보 */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>새로운 혜택</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitLabel}>팬사인회 응모 횟수:</Text>
            <Text style={styles.benefitValue}>
              {TIERS[fusionResult.tier].fansignCount || 0}회
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitLabel}>콘서트 우선 예매:</Text>
            <Text style={styles.benefitValue}>
              {TIERS[fusionResult.tier].concertPreorder || 0}시간 전
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Text style={styles.benefitLabel}>당첨 가중치:</Text>
            <Text style={styles.benefitValue}>
              {TIERS[fusionResult.tier].winningMultiplier || 1}배
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleComplete}
      >
        <Text style={styles.completeButtonText}>완료</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeContainer}>
      {fusionState === 'select' && renderSelectScreen()}
      {fusionState === 'fusing' && renderFusingScreen()}
      {fusionState === 'result' && renderResultScreen()}
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
 safeContainer: {
   flex: 1,
   backgroundColor: '#f8f8f8',
 },
 container: {
   flex: 1,
   padding: 16,
 },
 instructionText: {
   fontSize: 16,
   marginBottom: 16,
   textAlign: 'center',
   color: '#333',
 },
 selectedContainer: {
   marginBottom: 16,
 },
 selectedTitle: {
   fontSize: 16,
   fontWeight: 'bold',
   marginBottom: 8,
 },
 selectedNFTs: {
   flexDirection: 'row',
   justifyContent: 'space-around',
   marginVertical: 8,
 },
 selectedNFTContainer: {
   position: 'relative',
 },
 deselectButton: {
   position: 'absolute',
   top: 0,
   right: 0,
   backgroundColor: COLORS.error,
   width: 24,
   height: 24,
   borderRadius: 12,
   justifyContent: 'center',
   alignItems: 'center',
   zIndex: 10,
 },
 deselectButtonText: {
   color: 'white',
   fontWeight: 'bold',
 },
 emptySlot: {
   width: 100,
   height: 140,
   borderWidth: 2,
   borderStyle: 'dashed',
   borderColor: '#ccc',
   borderRadius: 10,
   justifyContent: 'center',
   alignItems: 'center',
   padding: 8,
 },
 emptySlotText: {
   fontSize: 12,
   color: '#999',
   textAlign: 'center',
 },
 previewContainer: {
   backgroundColor: 'white',
   borderRadius: 12,
   padding: 16,
   marginBottom: 16,
   elevation: 2,
 },
 previewTitle: {
   fontSize: 16,
   fontWeight: 'bold',
   marginBottom: 12,
   color: COLORS.primary,
 },
 tierComparisonContainer: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   marginBottom: 16,
 },
 currentTierContainer: {
   flex: 2,
   alignItems: 'center',
 },
 tierArrow: {
   flex: 1,
   alignItems: 'center',
 },
 tierArrowText: {
   fontSize: 24,
   color: '#666',
 },
 nextTierContainer: {
   flex: 2,
   alignItems: 'center',
 },
 tierName: {
   fontSize: 16,
   fontWeight: 'bold',
   marginBottom: 4,
 },
 tierPoints: {
   fontSize: 14,
 },
 pointsIncrease: {
   color: COLORS.success,
 },
 benefitsChangeTitle: {
   fontSize: 14,
   fontWeight: 'bold',
   marginBottom: 8,
   marginTop: 8,
 },
 benefitsChangeList: {
   marginBottom: 8,
 },
 benefitChangeItem: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginBottom: 4,
 },
 benefitLabel: {
   fontSize: 12,
   color: '#666',
 },
 benefitValue: {
   fontSize: 12,
   fontWeight: 'bold',
 },
 previewPlaceholder: {
   textAlign: 'center',
   color: '#666',
   marginVertical: 16,
 },
 availableTitle: {
   fontSize: 16,
   fontWeight: 'bold',
   marginBottom: 8,
 },
 nftList: {
   paddingBottom: 80,
 },
 emptyText: {
   textAlign: 'center',
   marginVertical: 24,
   color: '#666',
 },
 buttonContainer: {
   flexDirection: 'row',
   position: 'absolute',
   bottom: 16,
   left: 16,
   right: 16,
 },
 resetButton: {
   flex: 1,
   backgroundColor: '#f0f0f0',
   paddingVertical: 12,
   marginRight: 8,
   borderRadius: 8,
   alignItems: 'center',
 },
 resetButtonText: {
   color: '#333',
   fontWeight: 'bold',
 },
 fusionButton: {
   flex: 2,
   backgroundColor: COLORS.primary,
   paddingVertical: 12,
   borderRadius: 8,
   alignItems: 'center',
 },
 fusionButtonText: {
   color: 'white',
   fontWeight: 'bold',
 },
 disabledButton: {
   backgroundColor: '#ccc',
 },
 
 // 합성 중 화면 스타일
 fusingContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   padding: 16,
 },
 fusingTitle: {
   fontSize: 24,
   fontWeight: 'bold',
   marginBottom: 32,
   color: COLORS.primary,
 },
 animationContainer: {
   width: 200,
   height: 200,
   justifyContent: 'center',
   alignItems: 'center',
   marginBottom: 32,
 },
 fusionNFTsContainer: {
   flexDirection: 'row',
   justifyContent: 'center',
   marginTop: 16,
 },
 fusionNFT: {
   margin: 8,
 },
 fusingSubtitle: {
   fontSize: 16,
   textAlign: 'center',
   color: '#666',
   marginHorizontal: 32,
 },
 
 // 결과 화면 스타일
 resultContainer: {
   flex: 1,
   padding: 16,
   alignItems: 'center',
 },
 resultTitle: {
   fontSize: 28,
   fontWeight: 'bold',
   color: COLORS.success,
   marginBottom: 24,
 },
 resultNFTContainer: {
   marginBottom: 24,
   alignItems: 'center',
 },
 upgradeInfo: {
   width: '100%',
   backgroundColor: 'white',
   borderRadius: 12,
   padding: 16,
   marginBottom: 16,
   elevation: 2,
 },
 upgradeTitle: {
   fontSize: 18,
   fontWeight: 'bold',
   marginBottom: 12,
   textAlign: 'center',
   color: COLORS.primary,
 },
 tierComparison: {
   flexDirection: 'row',
   justifyContent: 'space-around',
   alignItems: 'center',
 },
 oldTier: {
   alignItems: 'center',
 },
 newTier: {
   alignItems: 'center',
 },
 benefitsContainer: {
   width: '100%',
   backgroundColor: 'white',
   borderRadius: 12,
   padding: 16,
   marginBottom: 24,
   elevation: 2,
 },
 benefitsTitle: {
   fontSize: 18,
   fontWeight: 'bold',
   marginBottom: 12,
   color: COLORS.primary,
 },
 benefitsList: {},
 benefitItem: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginBottom: 8,
 },
 completeButton: {
   backgroundColor: COLORS.primary,
   paddingVertical: 12,
   paddingHorizontal: 48,
   borderRadius: 8,
 },
 completeButtonText: {
   color: 'white',
   fontWeight: 'bold',
   fontSize: 18,
 },
 loadingOverlay: {
   position: 'absolute',
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
   backgroundColor: 'rgba(0,0,0,0.3)',
   justifyContent: 'center',
   alignItems: 'center',
 }
});

export default NFTFusionScreen;