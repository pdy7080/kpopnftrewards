import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNFTContext } from '../contexts/NFTContext';
import { TEST_QR_CODES } from '../constants/testData';
import { ARTISTS } from '../constants/artists';
import { ROUTES } from '../constants/navigation';
import { COLORS } from '../constants/colors';
import { QRScanner } from '../components/scanner/QRScanner';

// 화면의 너비와 높이를 가져옵니다.
const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = height * 0.5; // 적절한 높이로 설정

const QRScanScreen = () => {
  const navigation = useNavigation();
  const { selectedArtist, createNFT } = useNFTContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScannerMode, setIsScannerMode] = useState(false);
  const [scannerError, setScannerError] = useState(null);

  // 화면 진입 시 선택된 아티스트 확인
  useEffect(() => {
    if (!selectedArtist) {
      Alert.alert(
        '아티스트 선택 필요',
        'QR 코드를 스캔하기 전에 아티스트를 선택해주세요.',
        [
          {
            text: '아티스트 선택하기',
            onPress: () => navigation.navigate(ROUTES.ARTIST_SELECTION)
          }
        ]
      );
    }
  }, [selectedArtist, navigation]);

  const handleQRData = useCallback(async (qrData) => {
    if (!selectedArtist) {
      Alert.alert('오류', '아티스트를 먼저 선택해주세요.');
      return;
    }

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
  }, [navigation, createNFT, selectedArtist]);

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
      case 'event4': return '기념굿즈구매';
      default: return '이벤트';
    }
  };

  // 스캐너 오류 처리
  const handleScannerError = (error) => {
    console.warn('스캐너 오류:', error);
    setScannerError(error);
    setIsScannerMode(false);
  };

  // 모드 전환
  const toggleMode = () => {
    setIsScannerMode(!isScannerMode);
    setScannerError(null);
  };

  // 테스트 QR 코드 목록 필터링 (선택된 아티스트의 QR 코드만 표시)
  const filteredQRCodes = TEST_QR_CODES.filter(qr => {
    const qrData = typeof qr.data === 'string' ? JSON.parse(qr.data) : qr.data;
    return qrData.artistId === selectedArtist?.id;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QR 코드 스캔</Text>
        <Text style={styles.subtitle}>
          {selectedArtist ? `${selectedArtist.name}의 QR 코드` : '아티스트를 선택해주세요'}
        </Text>
        
        <TouchableOpacity
          style={styles.modeToggleButton}
          onPress={toggleMode}
          disabled={isProcessing}
        >
          <Text style={styles.modeToggleButtonText}>
            {isScannerMode ? '테스트 모드로 전환' : '카메라 스캔 모드로 전환'}
          </Text>
        </TouchableOpacity>
      </View>

      {isScannerMode ? (
        <View style={styles.scannerContainer}>
          <QRScanner 
            onScan={handleQRData} 
            onError={handleScannerError}
          />
        </View>
      ) : (
        <View style={styles.testModeContainer}>
          <Text style={styles.testModeTitle}>테스트 QR 코드</Text>
          <Text style={styles.testModeDescription}>
            {selectedArtist 
              ? `${selectedArtist.name}의 테스트 QR 코드를 선택하세요` 
              : '아티스트를 선택해주세요'}
          </Text>
          
          {scannerError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>스캐너 오류: {scannerError}</Text>
            </View>
          )}
          
          <ScrollView style={styles.qrList}>
            {filteredQRCodes.length > 0 ? (
              filteredQRCodes.map((qr, index) => {
                const qrData = typeof qr.data === 'string' ? JSON.parse(qr.data) : qr.data;
                
                return (
                  <TouchableOpacity
                    key={qr.id || index}
                    style={styles.qrCard}
                    onPress={() => handleTestQRSelect(qr.data)}
                    disabled={isProcessing}
                  >
                    <View style={styles.qrCardContent}>
                      <Text style={styles.qrTitle}>{getEventName(qrData.eventId)}</Text>
                      <Text style={styles.qrArtist}>{getArtistName(qrData.artistId)}</Text>
                      {qrData.memberId && (
                        <Text style={styles.qrMember}>
                          멤버: {ARTISTS[qrData.artistId]?.members?.[qrData.memberId] || qrData.memberId}
                        </Text>
                      )}
                      <Text style={styles.qrDate}>{qrData.createdAt ? new Date(qrData.createdAt).toLocaleDateString() : '날짜 정보 없음'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedArtist 
                    ? `${selectedArtist.name}의 테스트 QR 코드가 없습니다.` 
                    : '아티스트를 선택해주세요.'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  modeToggleButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  modeToggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scannerContainer: {
    flex: 1,
  },
  testModeContainer: {
    flex: 1,
    padding: 20,
  },
  testModeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  testModeDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255,0,0,0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
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
    borderColor: 'rgba(255,255,255,0.2)',
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
  qrMember: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  qrDate: {
    fontSize: 14,
    color: '#aaa',
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
    textAlign: 'center',
  },
});

export default QRScanScreen;
