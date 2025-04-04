// screens/FansignApplicationScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNFTContext } from '../contexts/NFTContext';
import SafeImage from '../components/common/SafeImage';
import { getBenefitUsageById, useBenefit } from '../services/benefitService';
import { COLORS } from '../constants/colors';
import { ARTISTS } from '../constants/artists';

const FansignApplicationScreen = ({ navigation, route }) => {
  const { benefit } = route.params;
  const { userNFTs, artistNFTs } = useNFTContext();
  
  // 폼 입력 상태
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    preferredMember: '',
    message: ''
  });
  
  // 혜택 사용 내역
  const [usageData, setUsageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // 입력 변경 처리
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // 폼 제출 처리
  const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.name.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.');
      return;
    }
    
    if (!formData.phone.trim()) {
      Alert.alert('오류', '연락처를 입력해주세요.');
      return;
    }
    
    if (!formData.preferredMember.trim()) {
      Alert.alert('오류', '선호하는 멤버를 입력해주세요.');
      return;
    }
    
    // 사용 가능한 횟수 확인
    if (usageData && usageData.usedCount >= usageData.maxUses && usageData.maxUses > 0) {
      Alert.alert('오류', '사용 가능한 횟수를 모두 소진했습니다.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 혜택 사용 API 호출
      const result = await useBenefit(benefit.id, formData);
      
      if (result.success) {
        // 사용 내역 업데이트
        setUsageData(result.usage);
        
        // 성공 메시지
        Alert.alert(
          '응모 완료',
          '팬사인회 응모가 완료되었습니다.',
          [{ text: '확인', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('오류', result.error || '응모 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('응모 오류:', error);
      Alert.alert('오류', '응모 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 아티스트 정보
  const artistInfo = ARTISTS[benefit.artistId] || {};
  
  // 아티스트 멤버 목록
  const members = artistInfo.members || [];
  
  // 혜택 이미지 가져오기
  const getBenefitImage = () => {
    try {
      if (benefit.artistId === 'gidle') {
        return require('../assets/benefits/gidle/fansign.jpg');
      } else if (benefit.artistId === 'bibi') {
        return require('../assets/benefits/bibi/fansign.jpg');
      } else if (benefit.artistId === 'chanwon') {
        return require('../assets/benefits/chanwon/fansign.jpg');
      }
      return require('../assets/images/placeholder.png');
    } catch (error) {
      console.warn('혜택 이미지 오류:', error);
      return require('../assets/images/placeholder.png');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.title}>팬사인회 응모</Text>
        
        <View style={{ width: 32 }} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.scrollContainer}>
          {/* 혜택 정보 */}
          <View style={styles.benefitInfoContainer}>
            <SafeImage
              source={getBenefitImage()}
              style={styles.benefitImage}
            />
            
            <View style={styles.benefitOverlay}>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </View>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>사용 내역 로딩 중...</Text>
            </View>
          ) : (
            <>
              {/* 응모 정보 */}
              <View style={styles.usageInfoContainer}>
                <View style={styles.usageInfo}>
                  <Text style={styles.usageInfoText}>남은 응모 횟수</Text>
                  <Text style={styles.usageCount}>
                    {usageData.maxUses > 0 
                      ? `${usageData.maxUses - usageData.usedCount}/${usageData.maxUses}회`
                      : '무제한'}
                  </Text>
                </View>
                
                {usageData.lastUsedAt && (
                  <Text style={styles.lastUsedText}>
                    마지막 응모: {new Date(usageData.lastUsedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
              
              {/* 응모 양식 */}
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>응모 양식</Text>
                
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>이름</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    placeholder="이름을 입력하세요"
                  />
                </View>
                
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>연락처</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    placeholder="연락처를 입력하세요"
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>선호하는 멤버</Text>
                  {members.length > 1 ? (
                    <View style={styles.memberOptions}>
                      {members.map(member => (
                        <TouchableOpacity
                          key={member.id}
                          style={[
                            styles.memberOption,
                            formData.preferredMember === member.id && {
                              backgroundColor: artistInfo.primaryColor,
                              borderColor: artistInfo.primaryColor
                            }
                          ]}
                          onPress={() => handleInputChange('preferredMember', member.id)}
                        >
                          <Text style={[
                            styles.memberOptionText,
                            formData.preferredMember === member.id && { color: 'white' }
                          ]}>
                            {member.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <TextInput
                      style={styles.textInput}
                      value={formData.preferredMember}
                      onChangeText={(text) => handleInputChange('preferredMember', text)}
                      placeholder="선호하는 멤버를 입력하세요"
                    />
                  )}
                </View>
                
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>응원 메시지 (선택)</Text>
                  <TextInput
                    style={[styles.textInput, styles.messageInput]}
                    value={formData.message}
                    onChangeText={(text) => handleInputChange('message', text)}
                    placeholder="응원 메시지를 입력하세요"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>
        
        {/* 제출 버튼 */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isLoading || isSubmitting) && styles.disabledButton,
              !isLoading && !isSubmitting && { backgroundColor: artistInfo.primaryColor || COLORS.primary }
            ]}
            onPress={handleSubmit}
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>응모하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  benefitInfoContainer: {
    position: 'relative',
    height: 180,
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
    marginBottom: 8,
  },
  benefitDescription: {
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
  lastUsedText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  memberOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  memberOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  memberOptionText: {
    fontSize: 14,
    color: '#666',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButtonContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default FansignApplicationScreen;