// components/benefit/TierProgressBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TIERS } from '../../constants/tiers';
import { COLORS } from '../../constants/colors';

/**
 * 티어 진행 상태 표시 바 컴포넌트
 * 현재 티어와 다음 티어로의 진행 상황을 시각화합니다.
 */
const TierProgressBar = ({ 
  currentTier, 
  progress, 
  nextTier, 
  currentPoints, 
  requiredPoints 
}) => {
  const tierInfo = TIERS[currentTier] || TIERS.fan;
  const nextTierInfo = nextTier ? TIERS[nextTier] : null;
  
  // 진행률 퍼센트로 변환 (0~100)
  const progressPercent = Math.min(100, Math.max(0, progress * 100));
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.currentTierLabel}>현재 티어</Text>
          <Text style={[styles.currentTier, { color: tierInfo.color }]}>
            {tierInfo.displayName}
          </Text>
        </View>
        
        {nextTierInfo && (
          <View style={styles.pointsInfo}>
            <Text style={styles.currentPoints}>
              {currentPoints?.toFixed(1) || '0'} 포인트
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercent}%`, backgroundColor: tierInfo.color }
            ]} 
          />
        </View>
        
        {nextTierInfo ? (
          <Text style={styles.progressText}>
            다음 티어 ({nextTierInfo.displayName})까지 {requiredPoints?.toFixed(1) || '0'} 포인트 필요
          </Text>
        ) : (
          <Text style={styles.progressText}>최고 티어에 도달했습니다!</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTierLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  currentTier: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pointsInfo: {
    alignItems: 'flex-end',
  },
  currentPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  }
});

export default TierProgressBar;