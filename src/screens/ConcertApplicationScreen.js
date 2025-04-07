import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TIERS } from '../constants/tiers';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConcertApplicationScreen = ({ navigation, route }) => {
  const { tier, maxUses, usedCount } = route.params;
  const tierInfo = TIERS[tier];
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredSeat: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('오류', '이름을 입력해주세요.');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('오류', '연락처를 입력해주세요.');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('오류', '이메일을 입력해주세요.');
      return false;
    }
    if (!formData.preferredSeat.trim()) {
      Alert.alert('오류', '선호 좌석을 입력해주세요.');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 응모 데이터 저장
      const applicationData = {
        ...formData,
        tier,
        appliedAt: new Date().toISOString(),
      };
      
      // 응모 내역 저장
      const applications = await AsyncStorage.getItem('concert_applications');
      const applicationsArray = applications ? JSON.parse(applications) : [];
      applicationsArray.push(applicationData);
      await AsyncStorage.setItem('concert_applications', JSON.stringify(applicationsArray));
      
      // 사용 횟수 업데이트
      const benefitUsage = await AsyncStorage.getItem('benefit_usage');
      const usageData = benefitUsage ? JSON.parse(benefitUsage) : {};
      const key = `concert_${tier}`;
      usageData[key] = (usageData[key] || 0) + 1;
      await AsyncStorage.setItem('benefit_usage', JSON.stringify(usageData));
      
      Alert.alert(
        '신청 완료',
        '콘서트 응모가 완료되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('응모 저장 오류:', error);
      Alert.alert('오류', '응모 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
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
        <Text style={styles.title}>콘서트 응모</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.tierInfo, { backgroundColor: tierInfo.color + '10' }]}>
          <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
            <Text style={styles.tierBadgeText}>{tierInfo.displayName}</Text>
          </View>
          <Text style={styles.tierDescription}>
            {tierInfo.description}
          </Text>
          <View style={styles.usageInfo}>
            <Text style={styles.usageText}>
              사용: {usedCount} / {maxUses}회
            </Text>
            <Text style={[styles.remainingText, { color: tierInfo.color }]}>
              남은 횟수: {maxUses - usedCount}회
            </Text>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="이름을 입력하세요"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>연락처</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="연락처를 입력하세요"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>선호 좌석</Text>
            <TextInput
              style={styles.input}
              value={formData.preferredSeat}
              onChangeText={(value) => handleInputChange('preferredSeat', value)}
              placeholder="선호하는 좌석을 입력하세요"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>메시지</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.message}
              onChangeText={(value) => handleInputChange('message', value)}
              placeholder="멤버에게 전하고 싶은 메시지를 입력하세요"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: tierInfo.color }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? '제출 중...' : '응모하기'}
          </Text>
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
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  tierInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  tierBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tierDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  usageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  usageText: {
    fontSize: 12,
    color: '#666',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ConcertApplicationScreen; 