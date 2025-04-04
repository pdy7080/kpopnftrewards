import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TEST_QR_CODES } from '../constants/testData';
import { createNFTFromQRData } from '../services/nftService';
import { COLORS } from '../constants/colors';
import { useFocusEffect } from '@react-navigation/native';

const QRScanScreen = React.memo(({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);

  // 화면 포커스 시 상태 초기화
  useFocusEffect(
    useCallback(() => {
      setError(null);
      setSelectedQR(null);
      setIsLoading(false);
    }, [])
  );

  // QR 코드 선택 처리
  const handleTestQRSelect = useCallback(async (testNFT) => {
    try {
      setSelectedQR(testNFT.id);
      setIsLoading(true);
      setError(null);

      // NFT 생성 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // NFT 획득 성공 화면으로 이동
      navigation.navigate('NFTAcquisitionSuccess', { nft: testNFT });
    } catch (error) {
      console.error('QR 스캔 오류:', error);
      setError('QR 코드 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setSelectedQR(null);
    }
  }, [navigation]);

  // 테스트 QR 코드 목록 메모이제이션
  const testQRCodes = useMemo(() => TEST_QR_CODES, []);

  // QR 코드 아이템 렌더링
  const renderQRItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.testQRItem,
        selectedQR === item.id && styles.selectedQRItem
      ]}
      onPress={() => handleTestQRSelect(item)}
      disabled={isLoading}
    >
      <View style={styles.qrIconContainer}>
        <Ionicons 
          name="qr-code" 
          size={24} 
          color={selectedQR === item.id ? COLORS.primary : COLORS.primary} 
        />
      </View>
      <View style={styles.qrInfoContainer}>
        <Text style={styles.qrName}>{item.name}</Text>
        <Text style={styles.qrDescription}>
          {selectedQR === item.id ? '처리 중...' : '클릭하여 NFT 획득'}
        </Text>
      </View>
      {isLoading && selectedQR === item.id ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={selectedQR === item.id ? COLORS.primary : '#999'} 
        />
      )}
    </TouchableOpacity>
  ), [selectedQR, isLoading, handleTestQRSelect]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={isLoading ? '#999' : '#333'} 
          />
        </TouchableOpacity>
        <Text style={styles.title}>QR 코드 스캔</Text>
        <View style={styles.backButton} />
      </View>
      
      {/* 안내 메시지 */}
      <View style={styles.messageContainer}>
        <Ionicons name="information-circle" size={24} color={COLORS.primary} />
        <Text style={styles.messageText}>
          현재 테스트 모드입니다. 실제 QR 스캔은 앱 빌드 후 사용 가능합니다.
        </Text>
      </View>
      
      {/* 에러 메시지 */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* 테스트 QR 코드 목록 */}
      <View style={styles.testModeContainer}>
        <Text style={styles.testModeTitle}>테스트 QR 코드 선택</Text>
        <Text style={styles.testModeDescription}>
          테스트를 위한 가상 QR 코드를 선택하세요
        </Text>
        
        <FlatList
          data={testQRCodes}
          keyExtractor={(item) => `qr-${item.id}`}
          renderItem={renderQRItem}
          contentContainerStyle={styles.testQRList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
});

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
    padding: 8,
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  messageText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.error,
  },
  testModeContainer: {
    flex: 1,
    padding: 16,
  },
  testModeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  testModeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  testQRList: {
    paddingBottom: 16,
  },
  testQRItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  selectedQRItem: {
    backgroundColor: COLORS.primary + '05',
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  qrIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  qrInfoContainer: {
    flex: 1,
  },
  qrName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  qrDescription: {
    fontSize: 12,
    color: '#666',
  }
});

export default QRScanScreen;
