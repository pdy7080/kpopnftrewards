import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

// 개발 환경에서는 BarCodeScanner를 임포트하지 않음
let BarCodeScanner;
if (process.env.NODE_ENV === 'production') {
  try {
    BarCodeScanner = require('expo-barcode-scanner').BarCodeScanner;
  } catch (error) {
    console.warn('expo-barcode-scanner 모듈을 로드할 수 없습니다:', error);
  }
}

export const QRScanner = ({ onScan }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isTestMode, setIsTestMode] = useState(true);

  useEffect(() => {
    // 개발 환경에서는 권한 요청을 건너뜀
    if (process.env.NODE_ENV === 'production' && BarCodeScanner) {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    } else {
      setHasPermission(true); // 개발 환경에서는 항상 true로 설정
    }
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    try {
      const parsedData = JSON.parse(data);
      onScan(parsedData);
    } catch (error) {
      Alert.alert('오류', '유효하지 않은 QR 코드입니다.');
    }
  };

  // 개발 환경에서는 테스트 모드 UI를 표시
  if (process.env.NODE_ENV !== 'production' || !BarCodeScanner) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.testModeContainer}>
          <Text style={styles.testModeTitle}>QR 스캐너 테스트 모드</Text>
          <Text style={styles.testModeDescription}>
            개발 환경에서는 실제 카메라 대신 테스트 모드를 사용합니다.
          </Text>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              // 테스트용 QR 코드 데이터
              const testData = {
                type: 'nft',
                tier: 'fan',
                artistId: 'gidle',
                eventId: 'event1'
              };
              onScan(testData);
            }}
          >
            <Text style={styles.testButtonText}>테스트 QR 코드 스캔</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.modeToggleButton}
            onPress={() => setIsTestMode(!isTestMode)}
          >
            <Text style={styles.modeToggleButtonText}>
              {isTestMode ? '카메라 모드로 전환' : '테스트 모드로 전환'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 프로덕션 환경에서의 실제 스캐너 UI
  if (hasPermission === null) {
    return <Text>카메라 권한을 요청 중입니다...</Text>;
  }
  if (hasPermission === false) {
    return <Text>카메라 접근 권한이 없습니다.</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainButtonText}>다시 스캔</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
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
  },
  modeToggleButtonText: {
    color: '#333',
    fontSize: 16,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 32,
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
}); 