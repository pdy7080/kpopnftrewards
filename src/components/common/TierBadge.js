// components/common/TierBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TIERS } from '../../constants/tiers';

/**
 * 티어 뱃지 컴포넌트
 * 티어의 이름과 배경색을 표시합니다.
 */
const TierBadge = ({ tier, size = 'medium', style }) => {
  const tierInfo = TIERS[tier] || TIERS.fan;
  
  // 크기별 스타일 계산
  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      fontSize: 10
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 12
    },
    large: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      fontSize: 14
    }
  };
  
  const selectedSize = sizeStyles[size] || sizeStyles.medium;
  
  return (
    <View style={[
      styles.badge,
      { backgroundColor: tierInfo.color },
      { 
        paddingHorizontal: selectedSize.paddingHorizontal, 
        paddingVertical: selectedSize.paddingVertical,
        borderRadius: selectedSize.borderRadius
      },
      style
    ]}>
      <Text style={[
        styles.text,
        { fontSize: selectedSize.fontSize }
      ]}>
        {tierInfo.displayName}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default TierBadge;