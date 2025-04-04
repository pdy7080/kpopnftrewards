// screens/BenefitsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNFTContext } from '../contexts/NFTContext';
import BenefitCard from '../components/benefit/BenefitCard';
import TierProgressBar from '../components/benefit/TierProgressBar';
import { getArtistBenefits, getBenefitUsage } from '../services/benefitService';
import { calculateTierProgress } from '../utils/tierHelpers';
import { COLORS } from '../constants/colors';
import { TIERS } from '../constants/tiers';
import { ARTISTS } from '../constants/artists';
import { TEST_NFT_DATA } from '../constants/testData';

const BenefitsScreen = ({ navigation, route }) => {
  const { userNFTs, artistNFTs, selectedArtistId } = useNFTContext();
  
  // 현재 아티스트 ID
  const [artistId, setArtistId] = useState(route.params?.artistId || selectedArtistId);
  
  // 혜택 데이터
  const [benefits, setBenefits] = useState([]);
  const [benefitUsage, setBenefitUsage] = useState({});
  
  // 티어 프로그레스 데이터
  const [tierProgress, setTierProgress] = useState(null);
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (artistId) {
      loadBenefits(artistId);
    }
  }, [artistId]);
  
  // 혜택 데이터 로드
  const loadBenefits = async (artistId) => {
    setIsLoading(true);
    
    try {
      // 해당 아티스트의 혜택 목록 가져오기
      const artistBenefits = getArtistBenefits(artistId);
      setBenefits(artistBenefits);
      
      // 혜택 사용 내역 가져오기
      const usage = await getBenefitUsage();
      setBenefitUsage(usage);
      
      // 티어 프로그레스 계산
      const nfts = artistNFTs.filter(nft => nft.artistId === artistId);
      
      if (nfts.length > 0) {
        // 가장 높은 티어의 NFT 찾기
        const tierOrder = { founders: 3, earlybird: 2, supporter: 1, fan: 0 };
        
        const highestTierNFT = nfts.reduce((prev, current) => {
          return (tierOrder[current.tier] > tierOrder[prev.tier]) ? current : prev;
        });
        
        // 티어 진행률 계산
        const progress = calculateTierProgress(highestTierNFT.tier, highestTierNFT.currentPoints);
        setTierProgress(progress);
      } else {
        // 테스트 데이터에서 NFT 가져오기
        const testNfts = TEST_NFT_DATA[artistId] || [];
        if (testNfts.length > 0) {
          // 가장 높은 티어의 NFT 찾기
          const tierOrder = { founders: 3, earlybird: 2, supporter: 1, fan: 0 };
          
          const highestTierNFT = testNfts.reduce((prev, current) => {
            return (tierOrder[current.tier] > tierOrder[prev.tier]) ? current : prev;
          });
          
          // 티어 진행률 계산
          const progress = {
            tier: highestTierNFT.tier,
            progress: 0.5,
            nextTier: 'supporter',
            points: highestTierNFT.currentPoints,
            requiredPoints: 10
          };
          setTierProgress(progress);
        } else {
          setTierProgress(null);
        }
      }
    } catch (error) {
      console.error('혜택 데이터 로드 오류:', error);
      
      // 오류 발생 시 기본 티어 프로그레스 설정
      setTierProgress({
        tier: 'fan',
        progress: 0.5,
        nextTier: 'supporter',
        points: 5,
        requiredPoints: 10
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 혜택 선택 처리
  const handleBenefitPress = (benefit) => {
    // 혜택 유형에 따라 다른 화면으로 이동
    switch (benefit.type) {
      case 'fansign':
        navigation.navigate('FansignApplication', { benefit });
        break;
      case 'concert':
        navigation.navigate('ConcertTicket', { benefit });
        break;
      default:
        // 기본적으로 해당 혜택의 상세 화면으로 이동
        navigation.navigate('BenefitDetail', { benefit });
    }
  };
  
  // 아티스트 정보
  const artistInfo = ARTISTS[artistId] || {};
  
  // 혜택 카드 렌더링
  const renderBenefitCard = ({ item }) => (
    <BenefitCard
      benefit={item}
      tierProgress={tierProgress}
      usage={benefitUsage[item.id] || 0}
      onPress={() => handleBenefitPress(item)}
    />
  );
  
  // 팬사인회 응모 버튼
  const handleFansignPress = () => {
    navigation.navigate('FansignApplication');
  };
  
  // 콘서트 예매 버튼
  const handleConcertPress = () => {
    navigation.navigate('ConcertTicket');
  };
  
  // 독점 콘텐츠 버튼
  const handleExclusiveContentPress = () => {
    navigation.navigate('ExclusiveContent');
  };
  
  // 로딩 중 표시
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>혜택 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 티어 정보 */}
        {tierProgress && (
          <View style={styles.tierContainer}>
            <Text style={styles.tierTitle}>현재 티어: {TIERS[tierProgress.tier]?.displayName || 'Fan'}</Text>
            <TierProgressBar progress={tierProgress.progress} />
            <Text style={styles.tierPoints}>
              {tierProgress.points} 포인트 / {tierProgress.nextTier ? `${tierProgress.requiredPoints} 포인트 필요` : '최고 티어'}
            </Text>
          </View>
        )}
        
        {/* 혜택 목록 */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>사용 가능한 혜택</Text>
          
          {benefits.length > 0 ? (
            <FlatList
              data={benefits}
              renderItem={renderBenefitCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="gift-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>사용 가능한 혜택이 없습니다</Text>
              <Text style={styles.emptySubText}>NFT를 획득하여 혜택을 받으세요</Text>
            </View>
          )}
        </View>
        
        {/* 빠른 액세스 버튼 */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: artistInfo.primaryColor }]}
            onPress={handleFansignPress}
          >
            <Ionicons name="create-outline" size={24} color="white" />
            <Text style={styles.quickActionText}>팬사인회 응모</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: artistInfo.secondaryColor }]}
            onPress={handleConcertPress}
          >
            <Ionicons name="ticket-outline" size={24} color="white" />
            <Text style={styles.quickActionText}>콘서트 예매</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: artistInfo.accentColor }]}
            onPress={handleExclusiveContentPress}
          >
            <Ionicons name="videocam-outline" size={24} color="white" />
            <Text style={styles.quickActionText}>독점 콘텐츠</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  tierContainer: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tierPoints: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  benefitsContainer: {
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 1,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 32,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
  },
  quickActionText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default BenefitsScreen;