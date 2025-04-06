// screens/NFTFusionScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Constants
import { COLORS } from '../constants/colors';
import { ARTISTS } from '../constants/artists';
import { TIERS } from '../constants/tiers';
import { NFT_THEMES } from '../constants/nftThemes';
import { generateNFTDetails } from '../utils/nftGenerator';

// Context
import { useNFTContext } from '../contexts/NFTContext';

// 화면 너비 가져오기
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const NFTFusionScreen = React.memo(({ route, navigation }) => {
  const { selectedNFT } = route.params;
  const { artistNFTs, selectedArtist, updateNFTData, userNFTs } = useNFTContext();
  const [availableNFTs, setAvailableNFTs] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  
  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // NFT 필터링 및 로딩
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!artistNFTs) {
          throw new Error("NFT 데이터를 불러올 수 없습니다.");
        }
        
        // 선택된 아티스트의 NFT만 필터링하고, 이미 선택된 NFT는 제외
        const filtered = artistNFTs.filter(nft => 
          nft.artistId === selectedArtist?.id && 
          nft.id !== selectedNFT?.id &&
          nft.tier === selectedNFT?.tier &&
          nft.tier !== 'founders' // founders 티어는 합성 불가
        );
        
        if (isMounted.current) {
          setAvailableNFTs(filtered);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("NFT 로딩 오류:", err);
        if (isMounted.current) {
          setError("NFT를 불러오는 중 오류가 발생했습니다.");
          setIsLoading(false);
        }
      }
    };
    
    loadNFTs();
  }, [artistNFTs, selectedArtist, selectedNFT]);
  
  // NFT 선택 처리
  const handleSelectNFT = useCallback((nft) => {
    setSelectedNFTs(prev => {
      // 이미 선택된 NFT인 경우 제거
      if (prev.some(selected => selected.id === nft.id)) {
        return prev.filter(selected => selected.id !== nft.id);
      }
      
      // 최대 3개까지만 선택 가능
      if (prev.length >= 3) {
        Alert.alert(
          "선택 제한",
          "최대 3개의 NFT만 선택할 수 있습니다.",
          [{ text: "확인" }]
        );
        return prev;
      }
      
      return [...prev, nft];
    });
  }, []);
  
  // NFT 합성 시작
  const handleStartFusion = useCallback(() => {
    if (selectedNFTs.length < 2) {
      Alert.alert(
        "합성 불가",
        "최소 2개의 NFT를 선택해야 합니다.",
        [{ text: "확인" }]
      );
      return;
    }
    
    Alert.alert(
      "NFT 합성",
      "선택한 NFT들을 합성하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "합성",
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // 합성할 NFT 목록 생성 (선택된 NFT + 추가 선택된 NFT들)
              const fusionNFTs = [selectedNFT, ...selectedNFTs];
              
              // 현재 티어에서 다음 티어로 업그레이드
              const currentTier = selectedNFT.tier;
              const tierOrder = ['fan', 'supporter', 'earlybird'];
              const currentTierIndex = tierOrder.indexOf(currentTier);
              
              if (currentTierIndex === -1 || currentTierIndex === tierOrder.length - 1) {
                Alert.alert("합성 불가", "이미 최고 티어이거나 합성할 수 없는 티어입니다.");
                setIsLoading(false);
                return;
              }
              
              const nextTier = tierOrder[currentTierIndex + 1];
              
              // 기존 NFT들의 평균 포인트 계산
              const averagePoints = fusionNFTs.reduce((sum, nft) => sum + nft.currentPoints, 0) / fusionNFTs.length;
              
              // 새로운 NFT의 초기 포인트 계산 (평균 포인트 + 티어 보너스)
              const tierBonus = {
                supporter: 1.5,  // 50% 보너스
                earlybird: 2,   // 100% 보너스
                founders: 3     // 200% 보너스
              };
              
              const initialPoints = averagePoints * (tierBonus[nextTier] || 1);
              
              // 새로운 NFT 생성
              const newNFT = {
                id: `nft_${Date.now()}`,
                artistId: selectedArtist?.id,
                memberId: selectedNFT.memberId,
                name: `${selectedArtist?.name || ''} ${TIERS[nextTier].name} NFT`,
                tier: nextTier,
                image: selectedNFT.image,
                currentPoints: Number(initialPoints.toFixed(1)),
                initialPoints: Number(initialPoints.toFixed(1)),
                initialSales: selectedNFT.initialSales,
                currentSales: selectedNFT.currentSales,
                createdAt: new Date().toISOString(),
                canFuse: nextTier !== 'founders',
                description: `${selectedArtist?.name || ''} ${TIERS[nextTier].name} NFT입니다.`,
                fusionHistory: {
                  parentNFTs: fusionNFTs.map(nft => ({
                    id: nft.id,
                    name: nft.name,
                    tier: nft.tier
                  })),
                  fusionDate: new Date().toISOString()
                }
              };
              
              // 기존 NFT 목록에서 합성된 NFT 제거
              const updatedNFTs = userNFTs.filter(nft => 
                !fusionNFTs.some(fusionNft => fusionNft.id === nft.id)
              );
              
              // 새 NFT 추가
              const finalNFTs = [...updatedNFTs, newNFT];
              
              // NFT 데이터 업데이트
              await updateNFTData(finalNFTs);
              
              Alert.alert(
                "합성 성공",
                `${TIERS[nextTier].name} NFT가 생성되었습니다!\n현재 포인트: ${newNFT.currentPoints.toFixed(1)}`,
                [
                  { 
                    text: "확인", 
                    onPress: () => navigation.navigate('NFTDetails', { nft: newNFT })
                  }
                ]
              );
            } catch (error) {
              console.error("NFT 합성 오류:", error);
              Alert.alert("오류", "NFT 합성 중 오류가 발생했습니다.");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  }, [selectedNFTs, selectedNFT, selectedArtist, userNFTs, updateNFTData, navigation]);
  
  // 로딩 중 표시
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>NFT를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // 오류 발생 시 표시
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>NFT 합성</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always"
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>선택된 NFT</Text>
            <View style={styles.selectedNFTs}>
              {selectedNFT && (
                <View style={styles.nftCard}>
                  <Image
                    source={selectedNFT.image}
                    style={styles.nftImage}
                    resizeMode="cover"
                  />
                  <View style={styles.nftInfo}>
                    <Text style={styles.nftName} numberOfLines={1}>
                      {selectedNFT.name}
                    </Text>
                    <Text style={styles.nftArtist} numberOfLines={1}>
                      {selectedArtist?.name} - {selectedNFT.memberName}
                    </Text>
                    <View style={[styles.tierBadge, { backgroundColor: TIERS[selectedNFT.tier].color }]}>
                      <Text style={styles.tierText}>{TIERS[selectedNFT.tier].name}</Text>
                    </View>
                  </View>
                </View>
              )}
              {selectedNFTs.map((nft) => (
                <View key={nft.id} style={styles.nftCard}>
                  <Image
                    source={nft.image}
                    style={styles.nftImage}
                    resizeMode="cover"
                  />
                  <View style={styles.nftInfo}>
                    <Text style={styles.nftName} numberOfLines={1}>
                      {nft.name}
                    </Text>
                    <Text style={styles.nftArtist} numberOfLines={1}>
                      {selectedArtist?.name} - {nft.memberName}
                    </Text>
                    <View style={[styles.tierBadge, { backgroundColor: TIERS[nft.tier].color }]}>
                      <Text style={styles.tierText}>{TIERS[nft.tier].name}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>선택 가능한 NFT</Text>
            {availableNFTs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="images" size={48} color="#666" />
                <Text style={styles.emptyText}>선택 가능한 NFT가 없습니다</Text>
              </View>
            ) : (
              <View style={styles.nftGrid}>
                {availableNFTs.map((nft) => (
                  <TouchableOpacity
                    key={nft.id}
                    style={[
                      styles.nftCard,
                      selectedNFTs.some(selected => selected.id === nft.id) && styles.selectedCard
                    ]}
                    onPress={() => handleSelectNFT(nft)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={nft.image}
                      style={styles.nftImage}
                      resizeMode="cover"
                    />
                    <View style={styles.nftInfo}>
                      <Text style={styles.nftName} numberOfLines={1}>
                        {nft.name}
                      </Text>
                      <Text style={styles.nftArtist} numberOfLines={1}>
                        {selectedArtist?.name} - {nft.memberName}
                      </Text>
                      <View style={[styles.tierBadge, { backgroundColor: TIERS[nft.tier].color }]}>
                        <Text style={styles.tierText}>{TIERS[nft.tier].name}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.fusionButton,
            selectedNFTs.length < 1 && styles.disabledButton
          ]}
          onPress={handleStartFusion}
          disabled={selectedNFTs.length < 1}
          activeOpacity={0.8}
        >
          <Text style={styles.fusionButtonText}>
            NFT 합성하기 ({selectedNFTs.length + 1}/3)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectedNFTs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 16,
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nftCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  nftImage: {
    width: '100%',
    height: CARD_WIDTH,
  },
  nftInfo: {
    padding: 12,
  },
  nftName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nftArtist: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  fusionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  fusionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NFTFusionScreen;