import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NFTCard } from '../components/NFTCard';
import { COLORS } from '../constants/colors';
import { TIERS } from '../constants/tiers';

const NFTAcquisitionSuccessScreen = ({ navigation, route }) => {
  const { nft } = route.params;
  const tierInfo = TIERS[nft.tier];
  
  // 애니메이션 값
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    // 카드 스케일 애니메이션
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
    
    // 텍스트 페이드인 애니메이션
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { opacity: opacityAnim }]}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
        </Animated.View>
        
        <Animated.Text style={[styles.title, { opacity: opacityAnim }]}>
          축하합니다!
        </Animated.Text>
        
        <Animated.Text style={[styles.subtitle, { opacity: opacityAnim }]}>
          새로운 NFT를 획득했습니다
        </Animated.Text>
        
        <Animated.View style={[styles.nftContainer, { transform: [{ scale: scaleAnim }] }]}>
          <NFTCard nft={nft} size="large" />
        </Animated.View>
        
        <Animated.View style={[styles.infoContainer, { opacity: opacityAnim }]}>
          <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
            <Text style={styles.tierBadgeText}>{tierInfo.displayName} 티어</Text>
          </View>
          
          <Text style={styles.pointsText}>초기 포인트: {nft.currentPoints.toFixed(1)}</Text>
          
          <Text style={styles.benefitTitle}>주요 혜택</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="star" size={16} color={tierInfo.color} />
            <Text style={styles.benefitText}>
              팬사인회 {tierInfo.fansignCount || 1}회 응모 가능
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="time" size={16} color={tierInfo.color} />
            <Text style={styles.benefitText}>
              콘서트 {tierInfo.concertPreorder || 0}시간 전 예매
            </Text>
          </View>
        </Animated.View>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: tierInfo.color }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  nftContainer: {
    marginBottom: 24,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    elevation: 2,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  tierBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default NFTAcquisitionSuccessScreen; 