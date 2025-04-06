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
    if (!artistNFTs) return {};
    
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
    
    // 같은 티어의 NFT가 3개 이상 있는지 확인
    const sameTierNFTs = artistNFTs.filter(
      artistNft => artistNft.tier === nft.tier && artistNft.id !== nft.id
    );
    
    if (sameTierNFTs.length < 2) {
      Alert.alert('합성 불가', '같은 티어의 NFT가 충분하지 않아 합성할 수 없습니다.');
      return;
    }
    
    navigation.navigate('NFTFusion', { 
      selectedNFT: nft,
      tier: nft.tier,
      artistId: nft.artistId
    });
  }, [artistNFTs, navigation]);

  const handleImageLoadStart = useCallback((nftId) => {
    setImageLoading(prev => ({ ...prev, [nftId]: true }));
  }, []);

  const handleImageLoad = useCallback((nftId) => {
    setImageLoading(prev => ({ ...prev, [nftId]: false }));
  }, []);

  const getImageSource = useCallback((nft) => {
    if (!nft || !nft.image) {
      return require('../assets/images/placeholder.png');
    }
    return nft.image;
  }, []);

  // NFT 카드 렌더링 부분 수정
  const renderNFTCard = useCallback((nft) => {
    const tierData = TIERS[nft.tier];
    
    return (
      <TouchableOpacity
        key={nft.id}
        style={[
          styles.nftCard,
          { borderColor: tierData.color }
        ]}
        onPress={() => handleNFTPress(nft)}
        activeOpacity={0.8}
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
            {nft.currentPoints ? nft.currentPoints.toFixed(1) : '0.0'} P
          </Text>
        </View>
        {nft.canFuse && groupedNFTs[nft.tier]?.length >= 3 && nft.tier !== 'founders' && (
          <TouchableOpacity
            style={[styles.fusionButton, { backgroundColor: tierData.color }]}
            onPress={() => handleFusionPress(nft)}
          >
            <Text style={styles.fusionButtonText}>합성하기</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }, [handleNFTPress, imageLoading, getImageSource, handleImageLoadStart, handleImageLoad, handleFusionPress, groupedNFTs]);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tierFilter}>
          <TouchableOpacity
            style={[
              styles.tierButton,
              !selectedTier && styles.selectedTierButton
            ]}
            onPress={() => setSelectedTier(null)}
          >
            <Text style={[
              styles.tierButtonText,
              !selectedTier && styles.selectedTierButtonText
            ]}>전체</Text>
          </TouchableOpacity>
          
          {Object.entries(TIERS).map(([tier, tierData]) => {
            const isSelected = selectedTier === tier;
            const tierNFTs = groupedNFTs[tier] || [];
            
            return (
              <TouchableOpacity
                key={tier}
                style={[
                  styles.tierButton,
                  isSelected && styles.selectedTierButton,
                  { borderColor: tierData.color }
                ]}
                onPress={() => setSelectedTier(isSelected ? null : tier)}
              >
                <Text style={[
                  styles.tierButtonText,
                  isSelected && styles.selectedTierButtonText,
                  { color: isSelected ? COLORS.white : tierData.color }
                ]}>{tierData.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {Object.entries(TIERS).map(([tier, tierData]) => {
          const isSelected = selectedTier === null || selectedTier === tier;
          const tierNFTs = groupedNFTs[tier] || [];
          
          if (!isSelected || tierNFTs.length === 0) return null;
          
          return (
            <View key={tier} style={styles.tierSection}>
              <View style={styles.tierHeader}>
                <Text style={styles.tierTitle}>{tierData.name}</Text>
                <Text style={styles.tierCount}>{tierNFTs.length}개</Text>
              </View>
              
              <View style={styles.nftGrid}>
                {tierNFTs.map(renderNFTCard)}
              </View>
            </View>
          );
        })}
        
        {artistNFTs.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>보유한 NFT가 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tierFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tierButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTierButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tierButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTierButtonText: {
    color: COLORS.white,
  },
  tierSection: {
    marginBottom: 24,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tierCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nftCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
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
    width: CARD_WIDTH,
    height: CARD_WIDTH,
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
    fontWeight: '500',
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