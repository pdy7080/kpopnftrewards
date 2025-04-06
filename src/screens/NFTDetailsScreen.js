import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { TIERS } from '../constants/tiers';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const NFTDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { nft } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (nft) {
      setIsLoading(false);
    }
  }, [nft]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleFusionPress = () => {
    if (!nft) {
      Alert.alert('오류', 'NFT 정보를 찾을 수 없습니다.');
      return;
    }
    navigation.navigate('NFTFusion', { 
      selectedNFT: nft,
      tier: nft.tier,
      artistId: nft.artistId
    });
  };

  // 이미지 소스 처리 함수
  const getImageSource = (nft) => {
    if (!nft || !nft.image) {
      return require('../assets/images/placeholder.png');
    }
    return nft.image;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>NFT 정보 로딩 중...</Text>
      </View>
    );
  }

  const tierData = TIERS[nft.tier];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {imageLoading && (
            <ActivityIndicator 
              style={styles.imageLoader} 
              size="large" 
              color={COLORS.primary} 
            />
          )}
          <Image 
            source={getImageSource(nft)}
            style={styles.nftImage}
            resizeMode="cover"
            onLoad={handleImageLoad}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.nftName}>{nft.name}</Text>
            <View style={[styles.tierBadge, { backgroundColor: tierData.color }]}>
              <Text style={styles.tierText}>{tierData.displayName}</Text>
            </View>
          </View>

          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>현재 포인트</Text>
            <Text style={styles.pointsValue}>{nft.currentPoints.toFixed(1)} P</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>NFT 설명</Text>
            <Text style={styles.descriptionText}>{nft.description}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>아티스트</Text>
              <Text style={styles.detailValue}>
                {nft.artistId === 'gidle' ? '여자아이들' : 
                 nft.artistId === 'bibi' ? '비비' : '이찬원'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>구매 순번</Text>
              <Text style={styles.detailValue}>{nft.initialSales}번</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>현재 판매량</Text>
              <Text style={styles.detailValue}>{nft.currentSales.toLocaleString()}개</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>생성일</Text>
              <Text style={styles.detailValue}>
                {new Date(nft.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {nft.canFuse && nft.tier !== 'founders' && (
            <TouchableOpacity
              style={[styles.fusionButton, { backgroundColor: tierData.color }]}
              onPress={handleFusionPress}
            >
              <Text style={styles.fusionButtonText}>합성하기</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  imageContainer: {
    width: width,
    height: width,
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
    marginLeft: -20,
    marginTop: -20,
  },
  infoContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nftName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tierText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  pointsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  pointsLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  descriptionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  detailsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  fusionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  fusionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NFTDetailsScreen; 