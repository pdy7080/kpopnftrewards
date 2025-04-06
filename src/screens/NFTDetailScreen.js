// screens/NFTDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { useNFTContext } from '../contexts/NFTContext';
import { COLORS, SIZES } from '../constants/colors';
import { ROUTES } from '../constants/navigation';
import { ARTISTS } from '../constants/artists';
import { TIERS } from '../constants/tiers';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NFTDetailScreen = ({ route }) => {
  const { nft } = route.params;
  const navigation = useNavigation();
  const { selectedArtist, selectedNFT, setSelectedNFT } = useNFTContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const artist = ARTISTS[selectedArtist];
  const tier = TIERS[nft.tier];
  const member = artist.members.find(m => m.id === nft.memberId);

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
  };

  const handleLongPress = () => {
    Alert.alert(
      'NFT 정보',
      '이 NFT는 2025년 한류 아티스트들의 특별한 순간을 기념하는 기념주화입니다.',
      [{ text: '확인' }]
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value
    };
  });

  const handleFusion = () => {
    if (!nft.canFuse) {
      Alert.alert('알림', '이 NFT는 현재 융합할 수 없습니다.');
      return;
    }
    setSelectedNFT(nft);
    navigation.navigate(ROUTES.NFT_FUSION);
  };

  const handleBack = () => {
    opacity.value = withTiming(0, {}, () => {
      navigation.goBack();
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[artist.primaryColor, artist.secondaryColor]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NFT 상세정보</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View style={[styles.nftCard, animatedStyle]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            onLongPress={handleLongPress}
            style={styles.nftImageContainer}
          >
            <Image
              source={nft.image}
              style={styles.nftImage}
              resizeMode="cover"
            />
            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>{tier.name}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.nftInfo}>
            <Text style={styles.nftName}>{nft.name}</Text>
            <Text style={styles.artistName}>{artist.name}</Text>
            {member && (
              <Text style={styles.memberName}>{member.name}</Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>초기 포인트</Text>
              <Text style={styles.statValue}>{nft.initialPoints}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>현재 포인트</Text>
              <Text style={styles.statValue}>{nft.currentPoints}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>초기 판매량</Text>
              <Text style={styles.statValue}>{nft.initialSales}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>현재 판매량</Text>
              <Text style={styles.statValue}>{nft.currentSales}</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>NFT 설명</Text>
            <Text style={styles.description}>{nft.description}</Text>
          </View>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>티어 혜택</Text>
            <View style={styles.benefitsList}>
              {tier.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <MaterialIcons name="check-circle" size={20} color={artist.accentColor} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.fusionButton, !nft.canFuse && styles.disabledButton]}
            onPress={handleFusion}
            disabled={!nft.canFuse}
          >
            <Text style={styles.fusionButtonText}>
              {nft.canFuse ? 'NFT 융합하기' : '융합 불가'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  nftCard: {
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  nftImageContainer: {
    width: '100%',
    height: SCREEN_WIDTH - 32,
    position: 'relative',
  },
  nftImage: {
    width: '100%',
    height: '100%',
  },
  tierBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  nftInfo: {
    padding: 16,
  },
  nftName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  artistName: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    width: '50%',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  descriptionContainer: {
    padding: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  benefitsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  fusionButton: {
    margin: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  fusionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NFTDetailScreen;