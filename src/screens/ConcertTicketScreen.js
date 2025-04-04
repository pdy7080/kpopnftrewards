// screens/ConcertTicketScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNFTContext } from '../contexts/NFTContext';
import SafeImage from '../components/common/SafeImage';
import { getBenefitUsageById, useBenefit } from '../services/benefitService';
import { COLORS } from '../constants/colors';
import { ARTISTS } from '../constants/artists';
import { formatDate } from '../utils/formatters';

const ConcertTicketScreen = ({ navigation, route }) => {
  const { benefit } = route.params;
  const { userNFTs, artistNFTs } = useNFTContext();
  
  // 혜택 사용 내역
  const [usageData, setUsageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  
  // 콘서트 정보 (실제로는 API에서 가져오거나 benefit 객체에 포함)
  const [concertInfo, setConcertInfo] = useState({
    title: `${ARTISTS[benefit.artistId]?.name || '아티스트'} 콘서트`,
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 한 달 뒤
    location: '올림픽 체조경기장',
    ticketPrice: '88,000원 ~ 132,000원',
    description: '월드 투어의 일환으로 진행되는 특별 공연입니다. 최신 앨범의 수록곡들과 히트곡 무대를 선보일 예정입니다.',
    reservationOpenDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 일주일 뒤
  });
  
  // 컴포넌트 마운트 시 혜택 사용 내역 로드
  useEffect(() => {
    const loadUsageData = async () => {
      setIsLoading(true);
      try {
        const data = await getBenefitUsageById(benefit.id);
        setUsageData(data);
      } catch (error) {
        console.error('혜택 사용 내역 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsageData();
  }, [benefit.id]);
  
  // 구매 가능한 상위 티어 NFT 확인
  const eligibleNFTs = artistNFTs.filter(nft => {
    // supporter 티어 이상부터 콘서트 티켓 혜택 사용 가능
    return ['supporter', 'earlybird', 'founders'].includes(nft.tier);
  });
  
  // 예매 처리
  const handleReservation = async () => {
    // 사용 가능한 횟수 확인
    if (usageData && usageData.usedCount >= usageData.maxUses && usageData.maxUses > 0) {
      Alert.alert('오류', '사용 가능한 횟수를 모두 소진했습니다.');
      return;
    }
    
    // 티어 확인
    if (eligibleNFTs.length === 0) {
      Alert.alert('알림', 'Supporter 티어 이상의 NFT가 필요합니다.');
      return;
    }
    
    setIsReserving(true);
    
    try {
      // 혜택 사용 API 호출
      const result = await useBenefit(benefit.id, {
        ticketType: '일반석',
        quantity: 1,
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        // 사용 내역 업데이트
        setUsageData(result.usage);
        
        // 성공 메시지
        Alert.alert(
          '예매 완료',
          '콘서트 티켓 우선 예매가 완료되었습니다.',
          [{ text: '확인', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('오류', result.error || '예매 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('예매 오류:', error);
      Alert.alert('오류', '예매 중 오류가 발생했습니다.');
    } finally {
      setIsReserving(false);
    }
  };
  
  // 혜택 이미지 가져오기
  const getBenefitImage = () => {
    try {
      if (benefit.artistId === 'gidle') {
        return require('../assets/benefits/gidle/concert.jpg');
      } else if (benefit.artistId === 'bibi') {
        return require('../assets/benefits/bibi/concert.jpg');
      } else if (benefit.artistId === 'chanwon') {
        return require('../assets/benefits/chanwon/concert.jpg');
      }
      return require('../assets/images/placeholder.png');
    } catch (error) {
      console.warn('혜택 이미지 오류:', error);
      return require('../assets/images/placeholder.png');
    }
  };
  
  // 아티스트 정보
  const artistInfo = ARTISTS[benefit.artistId] || {};
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.title}>콘서트 우선 예매</Text>
        
        <View style={{ width: 32 }} />
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {/* 콘서트 정보 */}
        <View style={styles.benefitInfoContainer}>
          <SafeImage
            source={getBenefitImage()}
            style={styles.benefitImage}
          />
          
          <View style={styles.benefitOverlay}>
            <Text style={styles.benefitTitle}>{concertInfo.title}</Text>
            <Text style={styles.concertDate}>{formatDate(concertInfo.date)}</Text>
            <Text style={styles.concertLocation}>{concertInfo.location}</Text>
          </View>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>사용 내역 로딩 중...</Text>
          </View>
        ) : (
          <>
            {/* 혜택 정보 */}
            <View style={styles.usageInfoContainer}>
              <View style={styles.usageInfo}>
                <Text style={styles.usageInfoText}>남은 예매 횟수</Text>
                <Text style={styles.usageCount}>
                  {usageData.maxUses > 0 
                    ? `${usageData.maxUses - usageData.usedCount}/${usageData.maxUses}회`
                    : '무제한'}
                </Text>
              </View>
              
              <View style={styles.reservationTimeInfo}>
                <Text style={styles.reservationTimeTitle}>우선 예매 시간</Text>
                <Text style={styles.reservationTimeValue}>
                  일반 예매보다 {eligibleNFTs.length > 0 
                    ? `${Math.max(...eligibleNFTs.map(nft => {
                        switch (nft.tier) {
                          case 'founders': return 48;
                          case 'earlybird': return 24;
                          case 'supporter': return 12;
                          default: return 0;
                        }
                      }))}시간`
                    : '0시간'} 먼저 예매 가능
                </Text>
              </View>
              
              {usageData.lastUsedAt && (
                <Text style={styles.lastUsedText}>
                  마지막 사용: {new Date(usageData.lastUsedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
            
            {/* 콘서트 상세 정보 */}
            <View style={styles.concertDetailsContainer}>
              <Text style={styles.sectionTitle}>콘서트 정보</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>공연명</Text>
                <Text style={styles.infoValue}>{concertInfo.title}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>공연 일시</Text>
                <Text style={styles.infoValue}>{formatDate(concertInfo.date, true)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>공연 장소</Text>
                <Text style={styles.infoValue}>{concertInfo.location}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>티켓 가격</Text>
                <Text style={styles.infoValue}>{concertInfo.ticketPrice}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>일반 예매 오픈</Text>
                <Text style={styles.infoValue}>{formatDate(concertInfo.reservationOpenDate, true)}</Text>
              </View>
              
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>공연 소개</Text>
                <Text style={styles.descriptionText}>{concertInfo.description}</Text>
              </View>
            </View>
            
            {/* 티어별 혜택 비교 */}
            <View style={styles.tierBenefitsContainer}>
              <Text style={styles.sectionTitle}>티어별 우선 예매 시간</Text>
              
              <View style={styles.tierBenefitRow}>
                <Text style={styles.tierLabel}>Fan 티어</Text>
                <Text style={styles.tierValue}>일반 예매와 동일</Text>
              </View>
              
              <View style={styles.tierBenefitRow}>
                <Text style={styles.tierLabel}>Supporter 티어</Text>
                <Text style={styles.tierValue}>12시간 전 예매</Text>
              </View>
              
              <View style={styles.tierBenefitRow}>
                <Text style={styles.tierLabel}>Early Bird 티어</Text>
                <Text style={styles.tierValue}>24시간 전 예매</Text>
              </View>
              
              <View style={styles.tierBenefitRow}>
                <Text style={styles.tierLabel}>Founders 티어</Text>
                <Text style={styles.tierValue}>48시간 전 예매</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      
      {/* 예매 버튼 */}
      <View style={styles.reserveButtonContainer}>
        <TouchableOpacity
          style={[
            styles.reserveButton,
            (isLoading || isReserving || eligibleNFTs.length === 0) && styles.disabledButton,
            !isLoading && !isReserving && eligibleNFTs.length > 0 && { backgroundColor: artistInfo.primaryColor || COLORS.primary }
          ]}
          onPress={handleReservation}
          disabled={isLoading || isReserving || eligibleNFTs.length === 0}
        >
          {isReserving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.reserveButtonText}>
              {eligibleNFTs.length > 0 ? '우선 예매하기' : 'Supporter 티어 이상 필요'}
            </Text>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  benefitInfoContainer: {
    position: 'relative',
    height: 200,
  },
  benefitImage: {
    width: '100%',
    height: '100%',
  },
  benefitOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  benefitTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  concertDate: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  concertLocation: {
    color: 'white',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
  usageInfoContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  usageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  usageCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  reservationTimeInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  reservationTimeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reservationTimeValue: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  lastUsedText: {
    marginTop: 12,
    fontSize: 12,
    color: '#666',
  },
  concertDetailsContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tierBenefitsContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    marginBottom: 100,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  tierBenefitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tierValue: {
    fontSize: 14,
    color: COLORS.primary,
  },
  reserveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reserveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  reserveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default ConcertTicketScreen;