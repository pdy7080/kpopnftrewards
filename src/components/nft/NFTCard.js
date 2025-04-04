// components/NFTCard.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TIERS } from '../../constants/tiers';
import { COLORS } from '../../constants/colors';

export const NFTCard = ({ 
  nft, 
  onSelect, 
  onDeselect, 
  isSelected = false,
  size = 'medium',
  disabled = false
}) => {
  // NFT가 없는 경우 빈 컴포넌트 반환
  if (!nft) return null;

  // 티어 정보
  const tierInfo = TIERS[nft.tier] || TIERS.fan;
  
  // 카드 크기 설정
  const cardSize = {
    small: { width: 100, height: 140 },
    medium: { width: 140, height: 200 },
    large: { width: 180, height: 250 }
  }[size];
  
  // 멤버 이미지 가져오기
  const getMemberImage = () => {
    try {
      // 티어와 아티스트에 따라 적절한 경로 생성
      return getImagePath(nft.artistId, nft.memberId);
    } catch (error) {
      console.error('이미지 로드 오류:', error);
      return require('../../assets/images/placeholder.png');
    }
  };
  
  // 프레임 이미지 가져오기
  const getFrameImage = () => {
    try {
      switch(nft.tier) {
        case 'founders':
          return require('../../assets/frames/founders.png');
        case 'earlybird':
          return require('../../assets/frames/earlybird.png');
        case 'supporter':
          return require('../../assets/frames/supporter.png');
        case 'fan':
        default:
          return require('../../assets/frames/fan.png');
      }
    } catch (error) {
      console.error('프레임 이미지 로드 오류:', error);
      return null;
    }
  };
  
  // 선택 처리
  const handlePress = () => {
    if (disabled) return;
    
    if (isSelected) {
      onDeselect && onDeselect(nft.id);
    } else {
      onSelect && onSelect(nft);
    }
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        cardSize,
        isSelected && styles.selectedCard,
        disabled && styles.disabledCard
      ]}
      onPress={handlePress}
      disabled={disabled && !isSelected}
      activeOpacity={0.8}
    >
      {/* 프레임 */}
      <Image
        source={getFrameImage()}
        style={[styles.frame, cardSize]}
        resizeMode="cover"
      />
      
      {/* 멤버/아티스트 이미지 */}
      <Image
        source={getMemberImage()}
        style={styles.memberImage}
        resizeMode="cover"
      />
      
      {/* 정보 영역 */}
      <View style={[styles.infoContainer, { backgroundColor: `${tierInfo.color}CC` }]}>
        <Text style={styles.tierName}>{tierInfo.displayName}</Text>
        <Text style={styles.pointsText}>{nft.currentPoints.toFixed(1)} P</Text>
      </View>
      
      {/* 선택 상태 오버레이 */}
      {isSelected && (
        <View style={styles.selectedOverlay}>
          <View style={styles.checkmarkBadge}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

// 아티스트 및 멤버별 이미지 경로 가져오기
const getImagePath = (artistId, memberId) => {
  switch (artistId) {
    case 'gidle':
      switch (memberId) {
        case 'miyeon': return require('../../assets/artists/gidle/members/miyeon.jpg');
        case 'minnie': return require('../../assets/artists/gidle/members/minnie.jpg');
        case 'soyeon': return require('../../assets/artists/gidle/members/soyeon.jpg');
        case 'yuqi': return require('../../assets/artists/gidle/members/yuqi.jpg');
        case 'shuhua': return require('../../assets/artists/gidle/members/shuhua.jpg');
        default: return require('../../assets/artists/gidle/group.jpg');
      }
    case 'bibi':
      return require('../../assets/artists/bibi/profile.jpg');
    case 'chanwon':
      return require('../../assets/artists/chanwon/profile.jpg');
    default:
      return require('../../assets/images/placeholder.png');
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 8,
    elevation: 3,
  },
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  memberImage: {
    width: '85%',
    height: '80%',
    alignSelf: 'center',
    marginTop: '10%',
    borderRadius: 8,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  pointsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 10,
  },
  checkmarkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledCard: {
    opacity: 0.5,
  }
});