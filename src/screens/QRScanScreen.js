import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNFTContext } from '../contexts/NFTContext';
import { TEST_QR_CODES } from '../constants/testData';
import { ARTISTS } from '../constants/artists';
import { ROUTES } from '../constants/navigation';

// 화면의 너비와 높이를 가져옵니다.
const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = height * 0.5; // 적절한 높이로 설정

const QRScanScreen = () => {
  const navigation = useNavigation();
  const { selectedArtist, createNFT } = useNFTContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQRData = useCallback(async (qrData) => {
    try {
      setIsProcessing(true);
      
      // QR 데이터 파싱
      let parsedData;
      try {
        parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      } catch (error) {
        throw new Error('유효하지 않은 QR 코드 데이터입니다.');
      }
      
      // 필수 필드 검증
      if (!parsedData.artistId || !parsedData.eventId) {
        throw new Error('QR 코드에 필요한 정보가 누락되었습니다.');
      }
      
      // 아티스트 검증
      if (!ARTISTS[parsedData.artistId]) {
        throw new Error('유효하지 않은 아티스트입니다.');
      }
      
      // NFT 생성 (티어는 항상 'fan'으로 설정)
      const nftData = {
        ...parsedData,
        tier: 'fan' // 항상 'fan' 티어로 설정
      };
      
      const result = await createNFT(nftData);
      
      if (result.success) {
        // 성공 화면으로 이동
        navigation.navigate(ROUTES.NFT_ACQUISITION_SUCCESS, {
          nft: result.nft,
          message: 'NFT가 성공적으로 발급되었습니다!'
        });
      } else {
        throw new Error(result.error || 'NFT 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', error.message || 'QR 코드 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  }, [navigation, createNFT]);

  const handleTestQRSelect = useCallback((qrData) => {
    if (isProcessing) return;
    handleQRData(qrData);
  }, [handleQRData, isProcessing]);

  // 아티스트 이름 매핑
  const getArtistName = (artistId) => {
    return ARTISTS[artistId]?.name || artistId;
  };

  // 이벤트 이름 매핑
  const getEventName = (eventId) => {
    switch (eventId) {
      case 'event1': return '2025 월드투어';
      case 'event2': return '단독 콘서트';
      case 'event3': return '전국투어';
      default: return '이벤트';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>테스트 QR 코드</Text>
      <Text style={styles.subtitle}>
        {selectedArtist ? `${selectedArtist.name}의 테스트 QR 코드` : '아티스트를 선택해주세요'}
      </Text>
      
      <ScrollView style={styles.qrList}>
        {TEST_QR_CODES.map((qr, index) => {
          const qrData = typeof qr.data === 'string' ? JSON.parse(qr.data) : qr.data;
          const isCurrentArtist = qrData.artistId === selectedArtist?.id;
          
          return (
            <TouchableOpacity
              key={qr.id}
              style={[
                styles.qrCard,
                isCurrentArtist && styles.selectedCard
              ]}
              onPress={() => handleTestQRSelect(qr.data)}
              disabled={isProcessing || !isCurrentArtist}
            >
              <View style={styles.qrCardContent}>
                <Text style={styles.qrTitle}>{getEventName(qrData.eventId)}</Text>
                <Text style={styles.qrArtist}>{getArtistName(qrData.artistId)}</Text>
                <Text style={styles.qrDate}>{qrData.date || '날짜 정보 없음'}</Text>
                <Text style={styles.qrLocation}>{qrData.location || '장소 정보 없음'}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrList: {
    flex: 1,
  },
  qrCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  qrCardContent: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  qrArtist: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 4,
  },
  qrDate: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  qrLocation: {
    fontSize: 14,
    color: '#aaa',
  },
});

export default QRScanScreen;
