// screens/NFTCollectionScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNFTContext } from '../contexts/NFTContext';
import { COLORS } from '../constants/colors';
import { TIERS } from '../constants/tiers';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const NFTCollectionScreen = () => {
  const navigation = useNavigation();
  const { artistNFTs, selectedArtistId, syncNFTData } = useNFTContext();
  const [selectedTier, setSelectedTier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({});

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await syncNFTData();
      } catch (error) {
        console.error('NFT 로드 오류:', error);
        Alert.alert('오류', 'NFT 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [syncNFTData]);

  // NFT를 티어별로 그룹화하는 로직
  const groupedNFTs = useMemo(() => {
    return artistNFTs.reduce((acc, nft) => {
      if (!acc[nft.tier]) {
        acc[nft.tier] = [];
      }
      acc[nft.tier].push(nft);
      return acc;
    }, {});
  }, [artistNFTs]);

  const handleNFTPress = useCallback((nft) => {
    navigation.navigate('NFTDetails', { nft });
  }, [navigation]);

  const handleFusionPress = useCallback((nft) => {
    if (!nft) {
      Alert.alert('오류', 'NFT 정보를 찾을 수 없습니다.');
      return;
    }
    navigation.navigate('NFTFusion', { 
      selectedNFT: nft,
      tier: nft.tier,
      artistId: nft.artistId
    });
  }, [navigation]);

  const handleImageLoad = useCallback((nftId) => {
    setImageLoading(prev => ({
      ...prev,
      [nftId]: false
    }));
  }, []);

  const handleImageLoadStart = useCallback((nftId) => {
    setImageLoading(prev => ({
      ...prev,
      [nftId]: true
    }));
  }, []);

  // 이미지 소스 처리 함수
  const getImageSource = useCallback((nft) => {
    if (!nft || !nft.image) {
      return require('../assets/images/placeholder.png');
    }
    return nft.image;
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>NFT 로딩 중...</Text>
      </View>
    );
  }

  if (!artistNFTs.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            보유한 NFT가 없습니다.{'\n'}QR 스캔으로 NFT를 획득해보세요!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always"
      >
        {Object.entries(TIERS).map(([tier, tierData]) => {
          const tierNFTs = groupedNFTs[tier] || [];
          const isSelected = selectedTier === tier;
          
          return (
            <View key={tier} style={styles.tierSection}>
              <TouchableOpacity
                style={[
                  styles.tierHeader,
                  { backgroundColor: tierData.color + '20' },
                  isSelected && { backgroundColor: tierData.color + '40' }
                ]}
                onPress={() => setSelectedTier(isSelected ? null : tier)}
              >
                <View style={styles.tierInfo}>
                  <Text style={styles.tierTitle}>{tierData.displayName}</Text>
                  <Text style={styles.tierCount}>{tierNFTs.length}개 보유</Text>
                </View>
                <View style={[styles.tierBadge, { backgroundColor: tierData.color }]}>
                  <Text style={styles.tierBenefitText}>
                    {tierData.benefits?.fanSigning || 0}회 응모 가능
                  </Text>
                </View>
              </TouchableOpacity>
              
              {(isSelected || !selectedTier) && (
                <View style={styles.nftGrid}>
                  {tierNFTs.map((nft) => (
                    <TouchableOpacity
                      key={nft.id}
                      style={styles.nftCard}
                      onPress={() => handleNFTPress(nft)}
                    >
                      <View style={styles.imageContainer}>
                        {imageLoading[nft.id] && (
                          <ActivityIndicator 
                            style={styles.imageLoader} 
                            size="small" 
                            color={COLORS.primary} 
                          />
                        )}
                        <Image 
                          source={getImageSource(nft)}
                          style={styles.nftImage}
                          resizeMode="cover"
                          onLoadStart={() => handleImageLoadStart(nft.id)}
                          onLoad={() => handleImageLoad(nft.id)}
                        />
                      </View>
                      <View style={styles.nftInfo}>
                        <Text style={styles.nftName} numberOfLines={2}>
                          {nft.name}
                        </Text>
                        <Text style={styles.nftPoints}>
                          {nft.currentPoints.toFixed(1)} P
                        </Text>
                      </View>
                      {nft.canFuse && tierNFTs.length >= 3 && tier !== 'founders' && (
                        <TouchableOpacity
                          style={[styles.fusionButton, { backgroundColor: tierData.color }]}
                          onPress={() => handleFusionPress(nft)}
                        >
                          <Text style={styles.fusionButtonText}>합성하기</Text>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  tierSection: {
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  tierInfo: {
    flex: 1,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  tierCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tierBenefitText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  nftCard: {
    width: CARD_WIDTH,
    margin: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.2,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  nftImage: {
    width: '100%',
    height: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
  nftInfo: {
    padding: 12,
  },
  nftName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  nftPoints: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  fusionButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  fusionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default NFTCollectionScreen;