// HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Constants & Utils
import { ARTISTS } from '../constants/artists';
import { TIERS, TIER_UPGRADE_PATH } from '../constants/tiers';
import { COLORS } from '../constants/colors';
import { TEST_NFT_DATA } from '../constants/testData';
import { ROUTES } from '../constants/navigation';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - (CARD_MARGIN * 4)) / 3;
const LOGO_TAP_TIMEOUT = 3000; // 3초 이내에 탭해야 함

const HomeScreen = ({ route, navigation }) => {
  const { artistId } = route?.params || {};
  
  // 로고 탭 카운터 추가
  const [logoTapCount, setLogoTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  
  // 화면 포커스 시 로고 탭 카운터 초기화
  useFocusEffect(
    useCallback(() => {
      setLogoTapCount(0);
      setLastTapTime(0);
      return () => {
        setLogoTapCount(0);
        setLastTapTime(0);
      };
    }, [])
  );
  
  // artistId가 없는 경우 아티스트 선택 화면으로 이동
  useEffect(() => {
    if (!artistId) {
      navigation.replace(ROUTES.ARTIST_SELECTION);
    }
  }, [artistId, navigation]);

  const [nfts, setNfts] = useState([]);
  const [userTier, setUserTier] = useState('earlybird');
  const [userPoints, setUserPoints] = useState(138);
  const [recentActivities, setRecentActivities] = useState([
    { type: 'nft', title: 'NFT 획득: 미연 Founders', date: '2023.04.01' },
    { type: 'benefit', title: '팬사인회 응모 완료', date: '2023.04.03' }
  ]);
  
  const artist = ARTISTS[artistId];
  const tierInfo = TIERS[userTier];

  useEffect(() => {
    // 해당 아티스트의 NFT 데이터만 필터링
    const artistNfts = TEST_NFT_DATA[artistId] || [];
    setNfts(artistNfts);
  }, [artistId]);

  // 로고 탭 처리 함수
  const handleLogoPress = useCallback(() => {
    const currentTime = Date.now();
    
    // 마지막 탭으로부터 3초가 지났으면 카운터 초기화
    if (currentTime - lastTapTime > LOGO_TAP_TIMEOUT) {
      setLogoTapCount(1);
      setLastTapTime(currentTime);
      return;
    }
    
    // 탭 카운트 증가
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    setLastTapTime(currentTime);
    
    // 5번 탭하면 관리자 모드로 진입
    if (newCount >= 5) {
      setLogoTapCount(0);
      setLastTapTime(0);
      console.log('Navigating to Admin screen...');
      try {
        // 중첩 네비게이터로 이동
        navigation.navigate('Admin', {
          screen: 'AdminDashboard'
        });
      } catch (error) {
        console.error('관리자 모드 진입 오류:', error);
        Alert.alert('오류', '관리자 모드 진입에 실패했습니다.');
      }
    }
  }, [logoTapCount, lastTapTime, navigation]);

  const renderNftCard = (nft) => (
    <TouchableOpacity 
      key={nft.id}
      style={styles.nftCard}
      onPress={() => navigation.navigate('NFTDetail', { nft })}
      activeOpacity={0.7}
    >
      <Image 
        source={nft.image}
        style={styles.nftImage}
        resizeMode="cover"
      />
      <View style={styles.nftInfo}>
        <Text style={styles.nftName} numberOfLines={1}>{nft.name}</Text>
        <Text style={[styles.nftTier, { color: TIERS[nft.tier].color }]}>{TIERS[nft.tier].displayName}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleChangeArtist = () => {
    navigation.replace('ArtistSelection');
  };

  const renderTierProgressBar = () => {
    const nextTier = TIER_UPGRADE_PATH[userTier];
    const currentTierPoints = tierInfo.initialPoints;
    const nextTierPoints = nextTier ? TIERS[nextTier].initialPoints : currentTierPoints * 2;
    const progress = (userPoints - currentTierPoints) / (nextTierPoints - currentTierPoints);
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(progress * 100, 100)}%`,
                backgroundColor: tierInfo.color
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {nextTier ? `${userPoints} / ${nextTierPoints} 포인트` : `${userPoints} 포인트`}
        </Text>
      </View>
    );
  };

  const renderActivityItem = (activity, index) => (
    <View key={index} style={styles.activityItem}>
      <View style={styles.activityIconContainer}>
        <Ionicons 
          name={activity.type === 'nft' ? 'cube-outline' : 'gift-outline'} 
          size={20} 
          color={COLORS.primary} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityDate}>{activity.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleLogoPress} activeOpacity={0.7}>
            <Image 
              source={artist.logo}
              style={styles.artistLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.artistName}>{artist.name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.changeArtistButton}
          onPress={handleChangeArtist}
          activeOpacity={0.7}
        >
          <Text style={styles.changeArtistText}>다른 아티스트 선택</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* 티어 정보 섹션 */}
        <View style={styles.section}>
          <View style={[styles.tierCard, { borderColor: tierInfo.color }]}>
            <View style={styles.tierHeader}>
              <Ionicons name={tierInfo.icon} size={24} color={tierInfo.color} />
              <Text style={[styles.tierName, { color: tierInfo.color }]}>{tierInfo.displayName} 티어</Text>
            </View>
            <Text style={styles.pointsText}>{userPoints} 포인트</Text>
            {renderTierProgressBar()}
          </View>
        </View>

        {/* NFT 컬렉션 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>NFT 컬렉션</Text>
            <TouchableOpacity onPress={() => navigation.navigate('NFTCollection')} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>모두 보기 {'>'} </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.nftGrid}>
            {nfts.slice(0, 3).map(renderNftCard)}
          </View>
        </View>

        {/* 주요 기능 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주요 기능</Text>
          <View style={styles.functionGrid}>
            <TouchableOpacity 
              style={[styles.functionCard, { backgroundColor: artist.primaryColor }]}
              onPress={() => navigation.navigate('QRScan')}
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code-outline" size={32} color="white" />
              <Text style={styles.functionTitle}>QR 스캔</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.functionCard, { backgroundColor: artist.secondaryColor }]}
              onPress={() => navigation.navigate('NFTFusion')}
              activeOpacity={0.7}
            >
              <Ionicons name="git-merge-outline" size={32} color="white" />
              <Text style={styles.functionTitle}>NFT 합성</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.functionCard, { backgroundColor: artist.accentColor }]}
              onPress={() => navigation.navigate('Benefits')}
              activeOpacity={0.7}
            >
              <Ionicons name="gift-outline" size={32} color="white" />
              <Text style={styles.functionTitle}>혜택</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 최근 활동 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          <View style={styles.activitiesContainer}>
            {recentActivities.map(renderActivityItem)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  artistName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  changeArtistButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeArtistText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  tierCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  pointsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nftCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  nftImage: {
    width: '100%',
    height: CARD_WIDTH,
  },
  nftInfo: {
    padding: 8,
  },
  nftName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  nftTier: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  functionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  functionCard: {
    width: (width - 48) / 3,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  functionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  activitiesContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#aaa',
  },
});

export default HomeScreen;