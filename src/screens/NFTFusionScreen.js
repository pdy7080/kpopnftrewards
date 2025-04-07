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
import { TIERS, getNextTier, getTierPointsBonus } from '../constants/tiers';
import { NFT_THEMES, generateNFTDescription } from '../constants/nftThemes';
import { generateNFTDetails } from '../utils/nftGenerator';

// 티어별 이미지 임포트
const tierImages = {
  fan: require('../../assets/tiers/fan.png'),
  supporter: require('../../assets/tiers/supporter.png'),
  earlybird: require('../../assets/tiers/earlybird.png'),
  founders: require('../../assets/tiers/founders.png')
};

// Context
import { useNFTContext } from '../contexts/NFTContext';

// 화면 너비 가져오기
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const NFTFusionScreen = React.memo(({ route, navigation }) => {
  const { artistNFTs, selectedArtist, updateNFTData } = useNFTContext();
  const [selectedNFTs, setSelectedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availableNFTs, setAvailableNFTs] = useState([]);
  const isMounted = useRef(true);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 초기 NFT 설정
  useEffect(() => {
    const initialNFT = route.params?.initialNFT;
    if (initialNFT) {
      setSelectedNFTs([initialNFT]);
    }
  }, [route.params]);

  // 사용 가능한 NFT 필터링
  useEffect(() => {
    if (!artistNFTs || !selectedArtist) return;

    // Fan 티어 NFT만 필터링
    const fanNFTs = artistNFTs.filter(nft => 
      nft.tier === 'fan' && 
      !selectedNFTs.some(selected => selected.id === nft.id)
    );

    setAvailableNFTs(fanNFTs);
  }, [artistNFTs, selectedArtist, selectedNFTs]);

  const handleSelectNFT = useCallback((nft) => {
    if (selectedNFTs.length >= 3) {
      Alert.alert('알림', '최대 3개의 NFT만 선택할 수 있습니다.');
      return;
    }
    setSelectedNFTs(prev => [...prev, nft]);
  }, [selectedNFTs]);

  const handleDeselectNFT = useCallback((nft) => {
    setSelectedNFTs(prev => prev.filter(item => item.id !== nft.id));
  }, []);

  const handleStartFusion = useCallback(async () => {
    if (selectedNFTs.length < 3) {
      Alert.alert('알림', '3개의 NFT를 선택해주세요.');
      return;
    }

    // 모든 NFT가 같은 티어인지 확인
    const currentTier = selectedNFTs[0].tier;
    if (!selectedNFTs.every(nft => nft.tier === currentTier)) {
      Alert.alert('알림', '같은 티어의 NFT만 합성할 수 있습니다.');
      return;
    }

    // 다음 티어 확인
    const nextTier = getNextTier(currentTier);
    if (!nextTier) {
      Alert.alert('알림', '이미 최고 티어입니다. 더 이상 합성할 수 없습니다.');
      return;
    }

    try {
      setIsLoading(true);

      // 포인트 계산 (기존 포인트의 평균 * 티어별 보너스)
      const averagePoints = selectedNFTs.reduce((sum, nft) => 
        sum + (nft.currentPoints || 0), 0
      ) / selectedNFTs.length;
      const tierBonus = getTierPointsBonus(nextTier);
      const initialPoints = averagePoints * tierBonus;

      // 랜덤 이벤트 선택
      const themeKeys = Object.keys(NFT_THEMES);
      const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
      const themeInfo = NFT_THEMES[randomTheme];

      // 새로운 NFT 생성
      const newNFT = {
        id: `nft_${selectedArtist.id}_${Date.now()}`,
        artistId: selectedArtist.id,
        name: `${selectedArtist.name} ${themeInfo.name} ${TIERS[nextTier].name} NFT`,
        tier: nextTier,
        image: tierImages[nextTier],
        imageUri: tierImages[nextTier],
        currentPoints: Number(initialPoints.toFixed(1)),
        initialPoints: Number(initialPoints.toFixed(1)),
        createdAt: new Date().toISOString(),
        canFuse: TIERS[nextTier].fusionRequirement !== null,
        description: generateNFTDescription(randomTheme, selectedArtist.name, 100),
        benefits: TIERS[nextTier].benefits
      };

      // 기존 NFT 목록에서 선택된 NFT들 제거하고 새 NFT 추가
      const updatedNFTs = artistNFTs.filter(nft => 
        !selectedNFTs.some(selected => selected.id === nft.id)
      );
      updatedNFTs.push(newNFT);

      // NFT 데이터 업데이트
      await updateNFTData(updatedNFTs);

      // 혜택 정보 문자열 생성
      const benefitsText = Object.entries(newNFT.benefits)
        .map(([key, value]) => {
          switch(key) {
            case 'fanSign': return `팬사인회 응모 ${value}회`;
            case 'concertPreorder': return `콘서트 ${value}시간 선예매`;
            case 'exclusiveContent': return value ? '독점 콘텐츠 접근 가능' : '';
            case 'winningRate': return `당첨 확률 ${value}배`;
            default: return '';
          }
        })
        .filter(text => text)
        .join('\n');

      Alert.alert(
        '합성 성공',
        `${TIERS[nextTier].name} NFT가 생성되었습니다!\n\n` +
        `현재 포인트: ${newNFT.currentPoints.toFixed(1)}\n\n` +
        `획득한 혜택:\n${benefitsText}`,
        [{ text: '확인', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('NFT 합성 오류:', error);
      Alert.alert('오류', 'NFT 합성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedNFTs, artistNFTs, selectedArtist, updateNFTData, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>NFT 합성 중...</Text>
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
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>NFT 합성</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>선택된 NFT ({selectedNFTs.length}/3)</Text>
            <View style={styles.selectedNFTsContainer}>
              {selectedNFTs.map((nft) => (
                <TouchableOpacity
                  key={nft.id}
                  style={styles.selectedNFTCard}
                  onPress={() => handleDeselectNFT(nft)}
                >
                  <Image
                    source={nft.image}
                    style={styles.selectedNFTImage}
                    resizeMode="cover"
                  />
                  <View style={styles.selectedNFTOverlay}>
                    <Ionicons name="close-circle" size={24} color="#fff" />
                  </View>
                  <View style={styles.selectedNFTInfo}>
                    <Text style={styles.selectedNFTName} numberOfLines={1}>{nft.name}</Text>
                    <Text style={styles.selectedNFTPoints}>{nft.currentPoints?.toFixed(1) || '0.0'} P</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {Array(3 - selectedNFTs.length).fill(null).map((_, index) => (
                <View key={`empty-${index}`} style={[styles.selectedNFTCard, styles.emptyCard]}>
                  <View style={styles.emptyCardContent}>
                    <Ionicons name="add-circle-outline" size={32} color="#666" />
                    <Text style={styles.emptyCardText}>NFT 선택</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>선택 가능한 NFT</Text>
            <View style={styles.availableNFTsGrid}>
              {availableNFTs.map((nft) => (
                <TouchableOpacity
                  key={nft.id}
                  style={styles.availableNFTCard}
                  onPress={() => handleSelectNFT(nft)}
                >
                  <Image
                    source={nft.image}
                    style={styles.availableNFTImage}
                    resizeMode="cover"
                  />
                  <View style={styles.availableNFTInfo}>
                    <Text style={styles.availableNFTName} numberOfLines={1}>{nft.name}</Text>
                    <Text style={styles.availableNFTPoints}>{nft.currentPoints?.toFixed(1) || '0.0'} P</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.fusionButton,
          selectedNFTs.length < 3 && styles.fusionButtonDisabled
        ]}
        onPress={handleStartFusion}
        disabled={selectedNFTs.length < 3}
      >
        <Text style={styles.fusionButtonText}>
          NFT 합성하기 ({selectedNFTs.length}/3)
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
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
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 24,
  },
  selectedNFTsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectedNFTCard: {
    flex: 1,
    aspectRatio: 0.75,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  selectedNFTImage: {
    width: '100%',
    height: '70%',
  },
  selectedNFTOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  selectedNFTInfo: {
    padding: 12,
    justifyContent: 'space-between',
    height: '30%',
  },
  selectedNFTName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedNFTPoints: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    borderStyle: 'dashed',
  },
  emptyCardContent: {
    alignItems: 'center',
    gap: 8,
  },
  emptyCardText: {
    color: '#666',
    fontSize: 14,
  },
  availableNFTsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  availableNFTCard: {
    width: '31%',
    aspectRatio: 0.75,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  availableNFTImage: {
    width: '100%',
    height: '70%',
  },
  availableNFTInfo: {
    padding: 8,
    height: '30%',
    justifyContent: 'space-between',
  },
  availableNFTName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  availableNFTPoints: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  fusionButton: {
    backgroundColor: COLORS.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fusionButtonDisabled: {
    backgroundColor: '#2A2A2A',
  },
  fusionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
});

export default NFTFusionScreen;