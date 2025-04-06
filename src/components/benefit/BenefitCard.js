// components/benefit/BenefitCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

/**
 * 혜택 카드 컴포넌트
 * 
 * @param {object} benefit - 혜택 객체
 * @param {function} onPress - 클릭 핸들러
 * @param {object} usageInfo - 사용 정보
 * @param {boolean} disabled - 비활성화 여부
 * @param {object} style - 추가 스타일
 */
const BenefitCard = ({ 
  benefit,
  onPress,
  usageInfo = {},
  disabled = false,
  style
}) => {
  const { usedCount = 0, maxUses = 0 } = usageInfo;
  
  // 남은 사용 횟수
  const remainingUses = Math.max(0, maxUses - usedCount);
  
  // 사용 가능 여부
  const isAvailable = !disabled && remainingUses > 0;
  
  // 혜택 타입에 따른 아이콘 가져오기
  const getBenefitIcon = () => {
    switch (benefit.type) {
      case 'fansign':
        return 'create-outline';
      case 'concert':
        return 'ticket-outline';
      case 'fanmeeting':
        return 'people-outline';
      case 'exclusive':
        return 'videocam-outline';
      default:
        return 'gift-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabledContainer]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Image
        source={benefit.image}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={getBenefitIcon()} size={24} color="white" />
          </View>
          {!isAvailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>사용 불가</Text>
            </View>
          )}
        </View>
        
        <View style={styles.info}>
          <Text style={styles.title}>{benefit.title}</Text>
          <Text style={styles.description}>{benefit.description}</Text>
          
          {maxUses > 0 && (
            <View style={styles.usageContainer}>
              <Text style={styles.usageText}>
                남은 횟수: {remainingUses}/{maxUses}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  image: {
    width: '100%',
    height: 160,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableBadge: {
    backgroundColor: COLORS.error + '80',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  info: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  usageContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  usageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BenefitCard;