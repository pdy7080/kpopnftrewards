// components/benefit/BenefitCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import SafeImage from '../common/SafeImage';

/**
 * 혜택 카드 컴포넌트
 * 
 * @param {object} benefit - 혜택 객체
 * @param {function} onPress - 클릭 핸들러
 * @param {number} usedCount - 사용한 횟수
 * @param {number} maxUses - 최대 사용 가능 횟수
 * @param {boolean} disabled - 비활성화 여부
 * @param {object} style - 추가 스타일
 */
const BenefitCard = ({ 
  benefit,
  onPress,
  usedCount = 0, 
  maxUses = 0,
  disabled = false,
  style
}) => {
  // 남은 사용 횟수
  const remainingUses = Math.max(0, maxUses - usedCount);
  
  // 사용 가능 여부
  const isAvailable = !disabled && remainingUses > 0;
  
  // 혜택 이미지 가져오기
  const getBenefitImage = () => {
    try {
      // ID 형식이 artistId_type_number 형식으로 가정
      const [artistId, type] = benefit.id.split('_');
      
      switch (type) {
        case 'fansign':
          switch (artistId) {
            case 'gidle':
              return require('../../assets/benefits/gidle/fansign.jpg');
            case 'bibi':
              return require('../../assets/benefits/bibi/fansign.jpg');
            case 'chanwon':
              return require('../../assets/benefits/chanwon/fansign.jpg');
            default:
              return require('../../assets/images/placeholder.png');
          }
        case 'concert':
          switch (artistId) {
            case 'gidle':
              return require('../../assets/benefits/gidle/concert.jpg');
            case 'bibi':
              return require('../../assets/benefits/bibi/concert.jpg');
            case 'chanwon':
              return require('../../assets/benefits/chanwon/concert.jpg');
            default:
              return require('../../assets/images/placeholder.png');
          }
        case 'fanmeeting':
          switch (artistId) {
            case 'gidle':
              return require('../../assets/benefits/gidle/fanmeeting.jpg');
            case 'bibi':
              return require('../../assets/benefits/bibi/fanmeeting.jpg');
            case 'chanwon':
              return require('../../assets/benefits/chanwon/fanmeeting.jpg');
            default:
              return require('../../assets/images/placeholder.png');
          }
        default:
          return require('../../assets/images/placeholder.png');
      }
    } catch (error) {
      console.warn('Benefit image error:', error);
      return require('../../assets/images/placeholder.png');
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        disabled && styles.disabledContainer,
        style
      ]}
      onPress={onPress}
      disabled={!isAvailable}
      activeOpacity={0.8}
    >
      <SafeImage 
        source={getBenefitImage()}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.overlay} />
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {benefit.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {benefit.description}
        </Text>
        
        <View style={styles.usageInfo}>
          {maxUses > 0 ? (
            <Text style={[
              styles.usageText,
              !isAvailable && styles.disabledText
            ]}>
              남은 사용 횟수: {remainingUses}/{maxUses}
            </Text>
          ) : (
            <Text style={styles.usageText}>
              무제한 사용 가능
            </Text>
          )}
        </View>
        
        {!isAvailable && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>
              {disabled ? '사용 불가' : '사용 완료'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 3,
    margin: 8,
    height: 180,
  },
  disabledContainer: {
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 16,
  },
  usageInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    padding: 6,
    alignSelf: 'flex-start',
  },
  usageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#ccc',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  unavailableText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default BenefitCard;