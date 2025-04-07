import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNFTContext } from '../contexts/NFTContext';
import { COLORS } from '../constants/colors';
import { ROUTES } from '../constants/navigation';

const { width } = Dimensions.get('window');
const MENU_ITEM_WIDTH = (width - 48) / 2;

const ArtistHomeScreen = ({ navigation, route }) => {
  const { selectedArtist, artistNFTs, syncNFTData } = useNFTContext();
  const [logoPressCount, setLogoPressCount] = useState(0);
  const [logoPressTimer, setLogoPressTimer] = useState(null);
  
  // 화면 진입 시 데이터 동기화
  useEffect(() => {
    const loadData = async () => {
      try {
        await syncNFTData();
      } catch (error) {
        console.error('데이터 동기화 오류:', error);
      }
    };
    
    loadData();
  }, [syncNFTData]);
  
  const handleMenuPress = useCallback((screenName) => {
    navigation.navigate(screenName);
  }, [navigation]);

  const handleChangeArtist = useCallback(() => {
    navigation.navigate(ROUTES.ARTIST_SELECTION);
  }, [navigation]);
  
  const handleLogoPress = useCallback(() => {
    // 로고 클릭 카운트 증가
    setLogoPressCount(prev => {
      const newCount = prev + 1;
      
      // 타이머 초기화
      if (logoPressTimer) {
        clearTimeout(logoPressTimer);
      }
      
      // 3초 후 카운트 리셋
      const timer = setTimeout(() => {
        setLogoPressCount(0);
      }, 3000);
      
      setLogoPressTimer(timer);
      
      // 5번 클릭 시 관리자 화면으로 이동
      if (newCount >= 5) {
        navigation.navigate(ROUTES.ADMIN);
        return 0; // 카운트 리셋
      }
      
      return newCount;
    });
  }, [navigation, logoPressTimer]);
  
  // NFT 컬렉션 메뉴 클릭 처리
  const handleNFTCollectionPress = useCallback(() => {
    if (artistNFTs.length === 0) {
      Alert.alert(
        '알림',
        '보유한 NFT가 없습니다. QR 스캔으로 NFT를 획득해보세요!',
        [
          { text: '취소', style: 'cancel' },
          { text: 'QR 스캔', onPress: () => handleMenuPress(ROUTES.QR_SCAN) }
        ]
      );
    } else {
      handleMenuPress(ROUTES.NFT_COLLECTION);
    }
  }, [artistNFTs, handleMenuPress]);
  
  // NFT 합성 메뉴 클릭 처리
  const handleNFTFusionPress = useCallback(() => {
    const fanNFTs = artistNFTs?.filter(nft => nft.tier === 'fan') || [];
    
    if (fanNFTs.length < 3) {
      Alert.alert(
        '알림',
        'NFT 합성을 위해서는 같은 티어의 NFT가 3개 이상 필요합니다.',
        [
          { text: '확인', style: 'cancel' },
          { 
            text: 'NFT 획득하기', 
            onPress: () => handleMenuPress(ROUTES.QR_SCAN) 
          }
        ]
      );
    } else {
      navigation.navigate('NFTFusion', {
        initialNFT: fanNFTs[0],
        availableNFTs: fanNFTs,
        artistId: selectedArtist?.id
      });
    }
  }, [artistNFTs, handleMenuPress, navigation, selectedArtist]);

  // 혜택 메뉴 클릭 처리
  const handleBenefitsPress = useCallback(() => {
    // 사용자의 최고 티어 NFT 찾기
    const highestTierNFT = artistNFTs.reduce((highest, current) => {
      if (!highest) return current;
      
      const tierOrder = ['fan', 'supporter', 'earlybird', 'founders'];
      const currentTierIndex = tierOrder.indexOf(current.tier);
      const highestTierIndex = tierOrder.indexOf(highest.tier);
      
      return currentTierIndex > highestTierIndex ? current : highest;
    }, null);
    
    navigation.navigate(ROUTES.BENEFITS, { nft: highestTierNFT });
  }, [artistNFTs, navigation]);

  // NFT 컬렉션 섹션 렌더링
  const renderNFTCollection = useCallback(() => {
    const nftCount = artistNFTs?.length || 0;
    
    return (
      <TouchableOpacity
        style={styles.section}
        onPress={() => navigation.navigate('NFTCollection')}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NFT 컬렉션</Text>
          <Text style={styles.sectionCount}>{nftCount}개</Text>
        </View>
        <View style={styles.nftPreview}>
          {artistNFTs?.slice(0, 3).map((nft, index) => (
            <View key={nft.id} style={styles.nftPreviewItem}>
              <Image
                source={nft.image || require('../assets/images/placeholder.png')}
                style={styles.nftPreviewImage}
              />
            </View>
          ))}
          {nftCount > 3 && (
            <View style={styles.nftPreviewMore}>
              <Text style={styles.nftPreviewMoreText}>+{nftCount - 3}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [artistNFTs, navigation]);

  // NFT 합성 버튼 렌더링
  const renderFusionButton = useCallback(() => {
    const fanNFTs = artistNFTs?.filter(nft => nft.tier === 'fan') || [];
    const canFuse = fanNFTs.length >= 3;
    
    const handleFusionPress = () => {
      if (canFuse) {
        navigation.navigate('NFTFusion', {
          initialNFT: fanNFTs[0],
          availableNFTs: fanNFTs,
          artistId: selectedArtist?.id
        });
      } else {
        Alert.alert(
          '합성 불가',
          '같은 티어의 NFT가 3개 이상 필요합니다.\nNFT를 더 수집해보세요!'
        );
      }
    };
    
    return (
      <TouchableOpacity
        style={[styles.fusionButton, !canFuse && styles.fusionButtonDisabled]}
        onPress={handleFusionPress}
        disabled={!canFuse}
      >
        <Text style={styles.fusionButtonText}>
          NFT 합성하기 {canFuse ? `(${fanNFTs.length}개)` : ''}
        </Text>
      </TouchableOpacity>
    );
  }, [artistNFTs, navigation, selectedArtist]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={handleLogoPress}
          activeOpacity={0.8}
        >
          <Image 
            source={selectedArtist?.logo} 
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.changeArtistButton}
          onPress={handleChangeArtist}
          activeOpacity={0.8}
        >
          <Text style={styles.changeArtistText}>아티스트 변경</Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always"
      >
        <Image 
          source={selectedArtist?.groupImage}
          style={styles.artistImage}
          resizeMode="cover"
        />

        <View style={styles.menuGrid}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleNFTCollectionPress}
            activeOpacity={0.8}
          >
            <Ionicons name="images" size={32} color={COLORS.primary} />
            <Text style={styles.menuTitle}>NFT 컬렉션</Text>
            <Text style={styles.menuDescription}>보유한 NFT 확인</Text>
            {artistNFTs.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{artistNFTs.length}개</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => handleMenuPress(ROUTES.QR_SCAN)}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code" size={32} color={COLORS.primary} />
            <Text style={styles.menuTitle}>QR 스캔</Text>
            <Text style={styles.menuDescription}>새로운 NFT 획득</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleNFTFusionPress}
            activeOpacity={0.8}
          >
            <Ionicons name="git-merge" size={32} color={COLORS.primary} />
            <Text style={styles.menuTitle}>NFT 합성</Text>
            <Text style={styles.menuDescription}>티어 업그레이드</Text>
            {artistNFTs.length >= 3 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>합성 가능</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleBenefitsPress}
            activeOpacity={0.8}
          >
            <Ionicons name="gift" size={32} color={COLORS.primary} />
            <Text style={styles.menuTitle}>혜택</Text>
            <Text style={styles.menuDescription}>팬사인회/콘서트</Text>
          </TouchableOpacity>
        </View>

        {renderNFTCollection()}
        {renderFusionButton()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    padding: 8,
  },
  logo: {
    width: 120,
    height: 40,
  },
  changeArtistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  changeArtistText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  artistImage: {
    width: width,
    height: width * 0.6,
    marginBottom: 24,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: MENU_ITEM_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  menuDescription: {
    color: '#ccc',
    fontSize: 12,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionCount: {
    color: '#ccc',
    fontSize: 12,
  },
  nftPreview: {
    flexDirection: 'row',
    marginTop: 8,
  },
  nftPreviewItem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  nftPreviewImage: {
    width: '100%',
    height: '100%',
  },
  nftPreviewMore: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nftPreviewMoreText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  fusionButtonDisabled: {
    opacity: 0.5,
  },
  fusionButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  fusionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ArtistHomeScreen; 