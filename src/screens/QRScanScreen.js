import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TEST_QR_CODES } from '../constants/testData';
import { createNFTFromQRData } from '../services/nftService';
import { COLORS } from '../constants/colors';
import { ROUTES } from '../constants/navigation';
import { useNFTContext } from '../contexts/NFTContext';

// Animated FlatList 생성
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export const QRScanScreen = ({ navigation }) => {
  const { createNFT } = useNFTContext();
  const [isScanning, setIsScanning] = useState(false);
  
  // QR 코드 데이터 처리
  const handleQRData = async (data) => {
    try {
      setIsScanning(true);
      
      // QR 코드 데이터 파싱
      const qrData = typeof data === 'string' ? JSON.parse(data) : data;
      
      // 데이터 유효성 검사
      if (!qrData.type || !qrData.tier || !qrData.artistId || !qrData.eventId) {
        throw new Error('유효하지 않은 QR 코드입니다.');
      }
      
      // NFT 생성
      const result = await createNFT({
        tier: qrData.tier,
        artistId: qrData.artistId,
        eventId: qrData.eventId
      });
      
      if (result.success) {
        // 성공 시 NFT 획득 성공 화면으로 이동
        navigation.replace(ROUTES.NFT_ACQUISITION_SUCCESS, {
          nft: result.nft
        });
      } else {
        throw new Error(result.error || 'NFT 생성에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', error.message);
    } finally {
      setIsScanning(false);
    }
  };
  
  // 테스트 QR 코드 선택
  const handleTestQRSelect = (qrCode) => {
    handleQRData(qrCode.data);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QR 코드 테스트</Text>
        <Text style={styles.subtitle}>
          테스트용 QR 코드를 선택하세요.
        </Text>
      </View>
      
      <View style={styles.testModeContainer}>
        <Text style={styles.testModeTitle}>테스트 QR 코드</Text>
        <Text style={styles.testModeDescription}>
          개발 중에는 테스트용 QR 코드를 선택할 수 있습니다.
        </Text>
        
        <AnimatedFlatList
          data={TEST_QR_CODES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.testQRButton}
              onPress={() => handleTestQRSelect(item)}
              disabled={isScanning}
            >
              <Text style={styles.testQRButtonText}>
                {JSON.parse(item.data).tier} 티어 NFT QR 코드
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.testQRList}
        />
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
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  testModeContainer: {
    flex: 1,
    padding: 16,
  },
  testModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary,
  },
  testModeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  testQRList: {
    paddingBottom: 16,
  },
  testQRButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  testQRButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  }
});
