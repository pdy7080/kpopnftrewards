// screens/NFTDetailScreen.js
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Share,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Constants
import { TIERS } from '../constants/tiers';
import { ARTISTS } from '../constants/artists';
import { COLORS } from '../constants/colors';
import { updateNFT } from '../utils/storage';

// NFT 테마 데이터
const NFT_THEMES = {
  gidle: [
    { name: "I-LAND 월드투어 기념 주화", desc: "여자아이들의 첫 월드투어 'I-LAND'를 기념하여 제작된 한정판 주화입니다." },
    { name: "네버랜드 5주년 기념 주화", desc: "데뷔 5주년을 맞이한 여자아이들의 성장을 기념하는 특별 제작 주화입니다." },
    { name: "퀸덤2 우승 기념 주화", desc: "Mnet '퀸덤2' 우승을 기념하여 제작된 트로피 형태의 기념 주화입니다." },
    { name: "토마토소스 뮤직비디오 기념 주화", desc: "1억뷰를 돌파한 '토마토소스' 뮤직비디오를 기념하는 특별 주화입니다." },
    { name: "아이들 팬미팅 한정판 주화", desc: "2025 글로벌 팬미팅을 기념하여 제작된 멤버별 시그니처가 새겨진 주화입니다." }
  ],
  bibi: [
    { name: "휴먼 앨범 발매 기념 주화", desc: "BIBI의 메이저 앨범 'HUMAN'의 발매를 기념하는 특별 디자인 주화입니다." },
    { name: "아시아 투어 기념 주화", desc: "BIBI의 첫 아시아 투어 'BIBI IN ASIA'를 기념하는 한정판 주화입니다." },
    { name: "BIBI UNIVERSE 콘서트 주화", desc: "BIBI의 첫 단독 콘서트 'BIBI UNIVERSE'를 기념하는 스페셜 에디션 주화입니다." },
    { name: "베스트 뮤지션 수상 기념 주화", desc: "2024 올해의 여성 아티스트상 수상을 기념하는 트로피 모티브 주화입니다." },
    { name: "KAZINO 5억뷰 기념 주화", desc: "히트곡 'KAZINO'의 5억뷰 달성을 기념하는 특별 주화입니다." }
  ],
  chanwon: [
    { name: "미스터트롯 기념 주화", desc: "미스터트롯 준우승을 기념하여 제작된 특별한 트로피 디자인 주화입니다." },
    { name: "첫 단독 콘서트 기념 주화", desc: "이찬원의 첫 전국 투어 단독 콘서트를 기념하는 한정판 주화입니다." },
    { name: "국민가수 시즌1 주화", desc: "국민가수 시즌1 출연을 기념하는 특별 제작 주화입니다." },
    { name: "신곡 '우리 둘이' 발매 기념 주화", desc: "히트곡 '우리 둘이' 발매를 기념하여 제작된 음표 모티브 주화입니다." },
    { name: "팬미팅 투어 한정판 주화", desc: "2025 전국 팬미팅 투어를 기념하는 시그니처 각인 주화입니다." }
  ]
};

// 재질 및 특징 설명 배열
const COIN_FEATURES = [
  "순은(99.9%) 소재에 특수 코팅 처리되어 있으며,",
  "24K 골드 도금 처리된 고급 합금 소재로,",
  "실버와 골드 투톤으로 제작되어 입체감이 돋보이며,",
  "홀로그램 특수 코팅이 적용된 티타늄 합금으로,",
  "아티스트 시그니처가 레이저 각인된 한정판으로,"
];

// 디자인 설명 배열
const COIN_DESIGNS = [
  "앞면에는 아티스트 로고, 뒷면에는 이벤트 엠블럼이 새겨져 있습니다.",
  "앞면에는 멤버들의 실루엣, 뒷면에는 기념 문구가 정교하게 새겨져 있습니다.",
  "양면에 홀로그래픽 효과가 적용된 아티스트 공식 엠블럼이 새겨져 있습니다.",
  "앞면에는 아티스트 초상, 뒷면에는 이벤트 로고가 3D 엠보싱되어 있습니다.",
  "특수 에칭 기법으로 아티스트의 상징적인 이미지가 섬세하게 표현되어 있습니다."
];

// 발행 수량 및 희소성 설명 배열
const COIN_RARITY = [
  "전 세계 1,000개 한정 제작되었으며, 실물 주화 구매자에게만 제공되는 NFT입니다.",
  "국내외 3,000개 한정 생산된 공식 인증 주화의 디지털 소유권을 증명합니다.",
  "팬클럽 회원만을 위해 5,000개 한정 발행된 특별 에디션 주화입니다.",
  "공식 MD 한정판으로, 2,500개만 제작된 희소성 높은 컬렉터블 아이템입니다.",
  "이벤트 현장에서만 구매 가능했던 초희귀 주화로, 1,500개만 발행되었습니다."
];

// 소장 가치 설명 배열
const COIN_VALUE = [
  "아티스트의 중요한 발자취를 기념하는 소중한 컬렉터블 아이템입니다.",
  "K-POP 역사의 한 페이지를 간직할 수 있는 의미 있는 소장품입니다.",
  "팬이라면 놓칠 수 없는 아티스트 커리어의 상징적인 기념품입니다.",
  "시간이 지날수록 가치가 높아지는 특별한 컬렉션 아이템입니다.",
  "아티스트와 팬의 특별한 인연을 상징하는 프리미엄 기념 아이템입니다."
];

// 화면 너비 가져오기
const { width } = Dimensions.get('window');

const NFTDetailScreen = React.memo(({ route, navigation }) => {
  const { nft } = route.params;
  const [nftDetails, setNftDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const imageLoadError = useRef(false);
  
  // 아티스트 정보 가져오기
  const artist = useMemo(() => ARTISTS[nft.artistId], [nft.artistId]);
  const tierInfo = useMemo(() => TIERS[nft.tier], [nft.tier]);
  
  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 화면 포커스 시 이미지 에러 상태 초기화
  useFocusEffect(
    useCallback(() => {
      imageLoadError.current = false;
      return () => {
        imageLoadError.current = false;
      };
    }, [])
  );
  
  // NFT 세부 정보 생성
  useEffect(() => {
    const generateDetails = async () => {
      try {
        if (!isMounted.current) return;
        
        // NFT에 세부 정보가 없으면 생성
        if (!nft.name || !nft.description) {
          const details = generateNFTDetails(nft.artistId, nft.memberId);
          setNftDetails(details);
          
          // NFT 업데이트
          const updatedNFT = {
            ...nft,
            name: details.name,
            description: details.description
          };
          
          await updateNFT(updatedNFT);
        } else {
          setNftDetails({
            name: nft.name,
            description: nft.description
          });
        }
      } catch (error) {
        console.error('NFT 세부 정보 생성 오류:', error);
        setError('NFT 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    generateDetails();
  }, [nft]);
  
  // NFT 관련 이미지 가져오기
  const getMemberImage = useCallback(() => {
    if (imageLoadError.current) {
      return require('../assets/images/placeholder.png');
    }
    
    try {
      return getMemberImageByIds(nft.artistId, nft.memberId);
    } catch (error) {
      console.error('멤버 이미지 로드 오류:', error);
      imageLoadError.current = true;
      return require('../assets/images/placeholder.png');
    }
  }, [nft.artistId, nft.memberId]);
  
  // 프레임 이미지 가져오기
  const getFrameImage = useCallback(() => {
    try {
      switch(nft.tier) {
        case 'founders':
          return require('../assets/frames/founders.png');
        case 'earlybird':
          return require('../assets/frames/earlybird.png');
        case 'supporter':
          return require('../assets/frames/supporter.png');
        case 'fan':
        default:
          return require('../assets/frames/fan.png');
      }
    } catch (error) {
      console.error('프레임 이미지 로드 오류:', error);
      return null;
    }
  }, [nft.tier]);
  
  // 공유 기능
  const handleShare = useCallback(async () => {
    try {
      const message = `K-POP NFT 리워드: ${nftDetails?.name || nft.name}\n${artist.name} - ${nft.memberId}\n${tierInfo.displayName} 티어`;
      await Share.share({
        message,
        title: 'K-POP NFT 리워드 공유',
      });
    } catch (error) {
      Alert.alert('공유 오류', '공유 중 오류가 발생했습니다.');
    }
  }, [nftDetails, nft, artist, tierInfo]);
  
  // NFT 합성 화면으로 이동
  const handleFusion = useCallback(() => {
    navigation.navigate('NFTFusion', { preSelectedNFT: nft });
  }, [navigation, nft]);
  
  // 성장률 계산
  const growthRate = useMemo(() => {
    return ((nft.currentPoints - nft.initialPoints) / nft.initialPoints * 100).toFixed(1);
  }, [nft.currentPoints, nft.initialPoints]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={artist.primaryColor} />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[
      styles.container, 
      { backgroundColor: `${artist.primaryColor}10` }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={artist.primaryColor} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>NFT 세부 정보</Text>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color={artist.primaryColor} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.nftImageContainer}>
          <Image
            source={getMemberImage()}
            style={styles.nftImage}
            resizeMode="cover"
          />
          <Image
            source={getFrameImage()}
            style={styles.frameOverlay}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.nftName}>
          {nftDetails?.name || nft.name}
        </Text>
        <Text style={styles.artistName}>
          {artist.name} - {nft.memberId}
        </Text>
        
        <View style={styles.infoCard}>
          <View style={styles.tierInfoHeader}>
            <Text style={styles.cardTitle}>티어 정보</Text>
            <View 
              style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}
            >
              <Text style={styles.tierBadgeText}>{tierInfo.displayName}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>구매 순번:</Text>
            <Text style={styles.infoValue}>#{nft.initialSales}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>획득일:</Text>
            <Text style={styles.infoValue}>
              {new Date(nft.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>가치 정보</Text>
          
          <View style={styles.pointsContainer}>
            <Text style={styles.currentPoints}>{nft.currentPoints.toFixed(1)}</Text>
            <Text style={styles.pointsLabel}>포인트</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>초기 포인트:</Text>
            <Text style={styles.infoValue}>{nft.initialPoints.toFixed(1)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>성장률:</Text>
            <Text style={[
              styles.infoValue, 
              styles.growthRate, 
              { color: parseFloat(growthRate) > 0 ? COLORS.success : COLORS.error }
            ]}>
              {parseFloat(growthRate) > 0 ? '+' : ''}{growthRate}%
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>현재 판매량:</Text>
            <Text style={styles.infoValue}>
              {nft.currentSales ? nft.currentSales.toLocaleString() : '0'}개
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>초기 판매량:</Text>
            <Text style={styles.infoValue}>
              {nft.initialSales ? nft.initialSales.toLocaleString() : '0'}개
            </Text>
          </View>
        </View>
        
        <View style={styles.descriptionCard}>
          <Text style={styles.cardTitle}>주화 소개</Text>
          
          <Text style={styles.descriptionText}>
            {nftDetails?.description || nft.description}
          </Text>
        </View>
        
        <View style={styles.benefitsCard}>
          <Text style={styles.cardTitle}>주요 혜택</Text>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.benefitText}>
              팬사인회 {tierInfo.fansignCount || 1}회 응모 가능
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.benefitText}>
              콘서트 {tierInfo.earlyBookingHours || 0}시간 전 예매 권한
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.benefitText}>
              {nft.tier === 'founders' ? '모든 독점 콘텐츠 다운로드 가능' :
               nft.tier === 'earlybird' || nft.tier === 'supporter' ? '모든 독점 콘텐츠 시청 가능' :
               '기본 독점 콘텐츠 이용 가능'}
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.benefitText}>
              당첨 확률 {tierInfo.winRateMultiplier || 1}배 증가
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.fusionButton, { backgroundColor: tierInfo.color }]}
          onPress={handleFusion}
        >
          <Text style={styles.fusionButtonText}>NFT 합성하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
});

// NFT 세부 정보 생성 함수
const generateNFTDetails = (artistId, memberId) => {
  // 아티스트별 테마 배열에서 랜덤 선택
  const themes = NFT_THEMES[artistId] || NFT_THEMES.gidle;
  const themeIndex = Math.floor(Math.random() * themes.length);
  const theme = themes[themeIndex];
  
  // 각 설명 배열에서 랜덤 선택
  const featureIndex = Math.floor(Math.random() * COIN_FEATURES.length);
  const designIndex = Math.floor(Math.random() * COIN_DESIGNS.length);
  const rarityIndex = Math.floor(Math.random() * COIN_RARITY.length);
  const valueIndex = Math.floor(Math.random() * COIN_VALUE.length);
  
  // NFT 이름 생성
  const nftName = `${theme.name} NFT`;
  
  // NFT 설명 생성
  const nftDescription = `${theme.desc} ${COIN_FEATURES[featureIndex]} ${COIN_DESIGNS[designIndex]} ${COIN_RARITY[rarityIndex]} ${COIN_VALUE[valueIndex]}`;
  
  return {
    name: nftName,
    description: nftDescription
  };
};

// 멤버 이미지 가져오기
const getMemberImageByIds = (artistId, memberId) => {
  try {
    switch (artistId) {
      case 'gidle':
        switch (memberId) {
          case 'miyeon': return require('../assets/artists/gidle/members/miyeon.jpg');
          case 'minnie': return require('../assets/artists/gidle/members/minnie.jpg');
          case 'soyeon': return require('../assets/artists/gidle/members/soyeon.jpg');
          case 'yuqi': return require('../assets/artists/gidle/members/yuqi.jpg');
          case 'shuhua': return require('../assets/artists/gidle/members/shuhua.jpg');
          default: return require('../assets/artists/gidle/group.jpg');
        }
      case 'bibi':
        // 비비는 단독 아티스트이므로 멤버 ID가 없어도 항상 동일한 이미지 반환
        return require('../assets/artists/bibi/profile1.jpg');
      case 'chanwon':
        // 이찬원도 단독 아티스트이므로 멤버 ID가 없어도 항상 동일한 이미지 반환
        return require('../assets/artists/chanwon/profile1.jpg');
      default:
        return require('../assets/images/placeholder.png');
    }
  } catch (error) {
    console.error('멤버 이미지 로드 오류:', error);
    return require('../assets/images/placeholder.png');
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  infoContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  labelText: {
    fontSize: 16,
    color: '#888',
  },
  valueText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#ccc',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  nftImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
    height: 300,
  },
  nftImage: {
    width: '80%',
    height: '80%',
    borderRadius: 12,
    zIndex: 1,
  },
  frameOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    zIndex: 2,
  },
  nftName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.primary,
  },
  tierInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tierBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    fontWeight: 'bold',
  },
  pointsContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  currentPoints: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
  },
  growthRate: {
    fontWeight: 'bold',
  },
  descriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  benefitsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  fusionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    elevation: 3,
  },
  fusionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default NFTDetailScreen;