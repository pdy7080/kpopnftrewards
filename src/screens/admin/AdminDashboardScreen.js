// screens/admin/AdminDashboardScreen.js
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Image,
  BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { ARTISTS } from '../../constants/artists';
import { generateArtistTestData, generateAllTestData, resetAppData } from '../../services/admin/testDataService';
import { ROUTES } from '../../constants/navigation';

const AdminDashboardScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  // 뒤로가기 버튼 처리
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleGoBack();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );
  
  // 테스트 데이터 생성 처리 - 모든 아티스트
  const handleGenerateAllTestData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const result = await generateAllTestData();
      
      if (result.success) {
        Alert.alert(
          '성공', 
          result.message || '모든 아티스트의 테스트 데이터가 생성되었습니다.',
          [{ text: '확인', onPress: () => setIsLoading(false) }]
        );
      } else {
        throw new Error(result.error || '데이터 생성 실패');
      }
    } catch (error) {
      console.error('테스트 데이터 생성 오류:', error);
      Alert.alert(
        '오류', 
        `테스트 데이터 생성 중 오류가 발생했습니다: ${error.message}`,
        [{ text: '확인', onPress: () => setIsLoading(false) }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // 테스트 데이터 생성 처리 - 특정 아티스트
  const handleGenerateArtistTestData = async (artistId) => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const result = await generateArtistTestData(artistId);
      
      if (result.success) {
        Alert.alert(
          '성공', 
          `${ARTISTS[artistId].name}의 테스트 데이터가 생성되었습니다. (NFT ${result.nftsCount}개)`,
          [{ text: '확인', onPress: () => setIsLoading(false) }]
        );
      } else {
        throw new Error(result.error || '데이터 생성 실패');
      }
    } catch (error) {
      console.error('테스트 데이터 생성 오류:', error);
      Alert.alert(
        '오류', 
        `테스트 데이터 생성 중 오류가 발생했습니다: ${error.message}`,
        [{ text: '확인', onPress: () => setIsLoading(false) }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // 앱 데이터 초기화 처리
  const handleResetData = useCallback(() => {
    if (isLoading) return;
    
    Alert.alert(
      '데이터 초기화',
      '모든 NFT와 사용 내역이 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            
            try {
              const result = await resetAppData();
              
              if (result.success) {
                Alert.alert(
                  '성공', 
                  '모든 데이터가 초기화되었습니다.',
                  [{ text: '확인', onPress: () => setIsLoading(false) }]
                );
              } else {
                throw new Error(result.error || '데이터 초기화 실패');
              }
            } catch (error) {
              console.error('데이터 초기화 오류:', error);
              Alert.alert(
                '오류', 
                `데이터 초기화 중 오류가 발생했습니다: ${error.message}`,
                [{ text: '확인', onPress: () => setIsLoading(false) }]
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  }, [isLoading]);
  
  // 테스트 데이터 생성 처리
  const handleGenerateTestData = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const result = await generateAllTestData();
      
      if (result.success) {
        Alert.alert(
          '성공', 
          result.message || '테스트 데이터가 생성되었습니다.',
          [{ text: '확인', onPress: () => setIsLoading(false) }]
        );
      } else {
        throw new Error(result.error || '데이터 생성 실패');
      }
    } catch (error) {
      console.error('테스트 데이터 생성 오류:', error);
      Alert.alert(
        '오류', 
        `테스트 데이터 생성 중 오류가 발생했습니다: ${error.message}`,
        [{ text: '확인', onPress: () => setIsLoading(false) }]
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // 홈 화면으로 안전하게 이동
  const handleGoBack = () => {
    try {
      // 네비게이션 스택을 초기화하고 홈 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.ARTIST_SELECTION }],
      });
    } catch (error) {
      console.error('홈 화면으로 돌아가기 실패:', error);
      Alert.alert('오류', '홈 화면으로 돌아가는데 실패했습니다.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>관리자 대시보드</Text>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={handleGoBack}
          disabled={isLoading}
        >
          <Text style={styles.exitButtonText}>나가기</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관리자 기능</Text>
          <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>판매량-포인트 시뮬레이션</Text>
            
            {/* 아티스트별 시뮬레이션 메뉴 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('SalesSimulation', { artistId: 'gidle' })}
            >
              <Text style={styles.menuItemTitle}>여자아이들 NFT 시뮬레이션</Text>
              <Text style={styles.menuItemDescription}>
                여자아이들 NFT의 판매량에 따른 포인트 변화를 시뮬레이션합니다.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('SalesSimulation', { artistId: 'bibi' })}
            >
              <Text style={styles.menuItemTitle}>비비 NFT 시뮬레이션</Text>
              <Text style={styles.menuItemDescription}>
                비비 NFT의 판매량에 따른 포인트 변화를 시뮬레이션합니다.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('SalesSimulation', { artistId: 'chanwon' })}
            >
              <Text style={styles.menuItemTitle}>이찬원 NFT 시뮬레이션</Text>
              <Text style={styles.menuItemDescription}>
                이찬원 NFT의 판매량에 따른 포인트 변화를 시뮬레이션합니다.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.dangerMenuItem]}
              onPress={handleResetData}
            >
              <Text style={styles.menuItemTitle}>데이터 초기화</Text>
              <Text style={styles.menuItemDescription}>
                모든 NFT와 혜택 사용 내역을 삭제합니다.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>테스트 데이터 생성</Text>
          
          <View style={styles.artistGrid}>
            {Object.values(ARTISTS).map((artist) => (
              <TouchableOpacity
                key={artist.id}
                style={[styles.artistCard, isLoading && styles.disabledArtistCard]}
                onPress={() => handleGenerateArtistTestData(artist.id)}
                disabled={isLoading}
              >
                <Image 
                  source={artist.logo}
                  style={styles.artistLogo}
                  resizeMode="contain"
                />
                <Text style={styles.artistName}>{artist.name}</Text>
                <Text style={styles.artistActionText}>데이터 생성</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.allArtistsButton, isLoading && styles.disabledButton]}
            onPress={handleGenerateAllTestData}
            disabled={isLoading}
          >
            <Text style={styles.allArtistsButtonText}>모든 아티스트 데이터 생성</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
        disabled={isLoading}
      >
        <Text style={styles.backButtonText}>사용자 모드로 돌아가기</Text>
      </TouchableOpacity>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>처리 중...</Text>
        </View>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  exitButton: {
    padding: 8,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  menuContainer: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#666',
  },
  artistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  artistCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  artistLogo: {
    width: 120,
    height: 40,
    marginBottom: 8,
  },
  artistName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistActionText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  allArtistsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  allArtistsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  disabledArtistCard: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#ccc',
  },
  backButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerMenuItem: {
    backgroundColor: COLORS.error,
  },
});

export default AdminDashboardScreen;