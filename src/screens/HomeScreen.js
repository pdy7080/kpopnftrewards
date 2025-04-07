// screens/HomeScreen.js
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
import { TIERS } from '../constants/tiers';
import { NFT_THEMES } from '../constants/nftThemes';
import { generateNFTDetails } from '../utils/nftGenerator';

// Context
import { useNFT } from '../contexts/NFTContext';

// 화면 너비 가져오기
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const HomeScreen = React.memo(({ navigation }) => {
  const { nfts, selectedArtist, setSelectedArtist } = useNFT();
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const logoPressCount = useRef(0);
  const lastLogoPressTime = useRef(0);
  
  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // 아티스트가 선택되지 않은 경우 아티스트 선택 화면으로 이동
  useEffect(() => {
    if (!selectedArtist) {
      navigation.replace('ArtistSelection');
    }
  }, [selectedArtist, navigation]);
  
  // NFT 필터링 및 로딩
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 선택된 아티스트의 NFT만 필터링
        const filtered = nfts.filter(nft => nft.artistId === selectedArtist?.id);
        
        if (isMounted.current) {
          setFilteredNFTs(filtered);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("NFT 로딩 오류:", err);
        if (isMounted.current) {
          setError("NFT를 불러오는 중 오류가 발생했습니다.");
          setIsLoading(false);
        }
      }
    };
    
    loadNFTs();
  }, [nfts, selectedArtist]);
  
  // 로고 탭 처리 (5번 연속 탭하면 관리자 화면으로 이동)
  const handleLogoPress = useCallback(() => {
    const now = Date.now();
    if (now - lastLogoPressTime.current > 3000) {
      logoPressCount.current = 0;
    }
    
    logoPressCount.current += 1;
    lastLogoPressTime.current = now;
    
    if (logoPressCount.current >= 5) {
      navigation.navigate('Admin');
      logoPressCount.current = 0;
    }
  }, [navigation]);
  
  // 아티스트 변경 버튼 처리
  const handleChangeArtist = useCallback(() => {
    navigation.navigate('ArtistSelection');
  }, [navigation]);
  
  // NFT 카드 선택 처리
  const handleNFTCardPress = useCallback((nft) => {
    navigation.navigate('NFTDetail', { nft });
  }, [navigation]);
  
  // 로딩 중 표시
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
  
  // 오류 발생 시 표시
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={handleLogoPress}
          activeOpacity={0.8}
        >
          <Image 
            source={require('../assets/images/logo.png')} 
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
        <View style={styles.content}>
          <Text style={styles.title}>{selectedArtist?.name} NFT 컬렉션</Text>
          
          {filteredNFTs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images" size={48} color="#666" />
              <Text style={styles.emptyText}>보유한 NFT가 없습니다</Text>
            </View>
          ) : (
            <View style={styles.nftGrid}>
              {filteredNFTs.map((nft) => (
                <TouchableOpacity
                  key={nft.id}
                  style={styles.nftCard}
                  onPress={() => handleNFTCardPress(nft)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={nft.image}
                    style={styles.nftImage}
                    resizeMode="cover"
                  />
                  <View style={styles.nftInfo}>
                    <Text style={styles.nftName} numberOfLines={1}>
                      {nft.name}
                    </Text>
                    <Text style={styles.nftArtist} numberOfLines={1}>
                      {selectedArtist?.name} - {nft.memberName}
                    </Text>
                    <View style={[styles.tierBadge, { backgroundColor: TIERS[nft.tier].color }]}>
                      <Text style={styles.tierText}>{TIERS[nft.tier].name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
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
    paddingBottom: 30,
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 16,
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nftCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  nftImage: {
    width: '100%',
    height: CARD_WIDTH,
  },
  nftInfo: {
    padding: 12,
  },
  nftName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nftArtist: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 8,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen;