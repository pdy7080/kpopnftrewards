import React, { useCallback, useEffect } from 'react';
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
    navigation.navigate(ROUTES.HOME);
  }, [navigation]);
  
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
    if (artistNFTs.length < 3) {
      Alert.alert(
        '알림',
        'NFT 합성을 위해서는 최소 3개의 NFT가 필요합니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: 'NFT 컬렉션', onPress: () => handleMenuPress(ROUTES.NFT_COLLECTION) }
        ]
      );
    } else {
      handleMenuPress(ROUTES.NFT_FUSION);
    }
  }, [artistNFTs, handleMenuPress]);

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
            onPress={() => handleMenuPress(ROUTES.BENEFITS)}
            activeOpacity={0.8}
          >
            <Ionicons name="gift" size={32} color={COLORS.primary} />
            <Text style={styles.menuTitle}>혜택</Text>
            <Text style={styles.menuDescription}>팬사인회/콘서트</Text>
          </TouchableOpacity>
        </View>
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
});

export default ArtistHomeScreen; 