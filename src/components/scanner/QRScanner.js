import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import * as ExpoBarCodeScanner from 'expo-barcode-scanner';

export const QRScanner = ({ onScan, onError }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [scannerError, setScannerError] = useState(null);

  useEffect(() => {
    initializeScanner();
  }, []);

  const initializeScanner = async () => {
    try {
      const { status } = await ExpoBarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      setScannerError(null);
    } catch (error) {
      console.warn('스캐너 초기화 오류:', error);
      setScannerError(error.message);
      setHasPermission(false);
      if (onError) {
        onError(error.message);
      }
    }
  };

  const validateQRData = (data) => {
    try {
      const parsedData = JSON.parse(data);
      const requiredFields = ['type', 'tier', 'artistId', 'eventId', 'purchaseOrder', 'title', 'description'];
      
      // 필수 필드 검증
      const missingFields = requiredFields.filter(field => !parsedData[field]);
      if (missingFields.length > 0) {
        throw new Error(`누락된 필드: ${missingFields.join(', ')}`);
      }

      // NFT 타입 검증
      if (parsedData.type !== 'nft') {
        throw new Error('유효하지 않은 NFT 타입입니다.');
      }

      // 티어 검증
      if (parsedData.tier !== 'fan') {
        throw new Error('유효하지 않은 티어입니다.');
      }

      return parsedData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('유효하지 않은 QR 코드 형식입니다.');
      }
      throw error;
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    try {
      // QR 코드 데이터 검증
      const validatedData = validateQRData(data);
      
      // 검증된 데이터로 NFT 생성 시도
      onScan(validatedData);
    } catch (error) {
      Alert.alert('QR 코드 오류', error.message, [
        { 
          text: '다시 시도', 
          onPress: () => setScanned(false) 
        }
      ]);
    }
  };

  // 테스트 모드 UI
  if (isTestMode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.testModeContainer}>
          <Text style={styles.testModeTitle}>QR 스캐너 테스트 모드</Text>
          <Text style={styles.testModeDescription}>
            테스트 모드에서는 샘플 QR 코드를 사용합니다.
          </Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              // 테스트용 QR 코드 데이터
              const testData = {
                type: 'nft',
                tier: 'fan',
                artistId: 'gidle',
                eventId: 'event4',
                purchaseOrder: 1,
                title: '여자아이들 기념굿즈구매 기념 플래티넘 주화 NFT',
                description: '여자아이들 기념굿즈구매를 기념하는 플래티넘 기념주화 NFT입니다. 그룹 전체의 특별한 디자인이 적용되었습니다.',
                createdAt: new Date().toISOString()
              };
              handleBarCodeScanned({ type: 'qr', data: JSON.stringify(testData) });
            }}
          >
            <Text style={styles.testButtonText}>테스트 QR 코드 스캔</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.modeToggleButton}
            onPress={() => setIsTestMode(false)}
          >
            <Text style={styles.modeToggleButtonText}>
              카메라 모드로 전환
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 스캐너 오류 UI
  if (scannerError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.testModeContainer}>
          <Text style={styles.testModeTitle}>스캐너 오류</Text>
          <Text style={styles.testModeDescription}>
            스캐너 오류: {scannerError}
          </Text>
          
          <TouchableOpacity
            style={styles.retryButton}
            onPress={initializeScanner}
          >
            <Text style={styles.retryButtonText}>스캐너 다시 시도</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.modeToggleButton}
            onPress={() => setIsTestMode(true)}
          >
            <Text style={styles.modeToggleButtonText}>
              테스트 모드로 전환
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 카메라 권한 상태 처리
  if (hasPermission === null) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>카메라 권한을 요청 중입니다...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>카메라 접근 권한이 없습니다.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={initializeScanner}
        >
          <Text style={styles.retryButtonText}>권한 다시 요청</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.modeToggleButton}
          onPress={() => setIsTestMode(true)}
        >
          <Text style={styles.modeToggleButtonText}>
            테스트 모드로 전환
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 실제 스캐너 UI
  return (
    <View style={styles.container}>
      <ExpoBarCodeScanner.BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.scanText}>QR 코드를 스캔 영역 안에 맞춰주세요</Text>
      </View>
      {scanned && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainButtonText}>다시 스캔</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={styles.testModeButton}
        onPress={() => setIsTestMode(true)}
      >
        <Text style={styles.testModeButtonText}>테스트 모드로 전환</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  testModeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  testModeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.primary,
  },
  testModeDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  testButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modeToggleButton: {
    backgroundColor: '#ddd',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  modeToggleButtonText: {
    color: '#333',
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: 'white',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 32,
    left: 32,
    right: 32,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanAgainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testModeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 32,
    right: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  testModeButtonText: {
    color: 'white',
    fontSize: 14,
  },
}); 