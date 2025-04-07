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
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const NFTDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [imageLoading, setImageLoading] = useState(true);
  const nft = route.params?.nft;
  const tierData = TIERS[nft?.tier || 'fan'];

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getImageSource = (nft) => {
    if (!nft?.image) {
      return require('../assets/images/placeholder.png');
    }
    return nft.image;
  };

  if (!nft) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>NFT 정보를 불러올 수 없습니다.</Text>
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
              <Text style={styles.tierText}>{tierData.name}</Text>
            </View>
          </View>

          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>현재 포인트</Text>
            <Text style={styles.pointsValue}>
              {(nft.currentPoints || 0).toFixed(1)} P
            </Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>NFT 설명</Text>
            <Text style={styles.descriptionText}>{nft.description || '설명이 없습니다.'}</Text>
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>티어 혜택</Text>
            <View style={styles.benefitsList}>
              {Object.entries(tierData.benefits).map(([key, value], index) => {
                let benefitText = '';
                switch(key) {
                  case 'fanSign':
                    benefitText = `팬사인회 응모 ${value}회`;
                    break;
                  case 'concertPreorder':
                    benefitText = `콘서트 ${value}시간 선예매`;
                    break;
                  case 'exclusiveContent':
                    benefitText = value ? '독점 콘텐츠 접근 가능' : '';
                    break;
                  case 'winningRate':
                    benefitText = `당첨 확률 ${value}배`;
                    break;
                }
                if (!benefitText) return null;
                return (
                  <View key={index} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color={tierData.color} />
                    <Text style={styles.benefitText}>{benefitText}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {nft.canFuse && (
            <TouchableOpacity
              style={[styles.fusionButton, { backgroundColor: tierData.color }]}
              onPress={() => navigation.navigate('Benefits', { nft })}
            >
              <Text style={styles.fusionButtonText}>혜택 바로가기</Text>
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
  benefitsContainer: {
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
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
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