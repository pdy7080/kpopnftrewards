// components/NFTCard.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TIERS } from '../../constants/tiers';
import { COLORS } from '../../constants/colors';
import { ImageWithFallback } from '../common/ImageWithFallback';

const NFTCard = ({ 
  nft, 
  onSelect, 
  onDeselect, 
  isSelected = false,
  size = 'medium',
  disabled = false,
  style
}) => {
  // 로딩 상태 관리
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasImageError, setHasImageError] = useState(false);
  
  // NFT가 없는 경우 빈 컴포넌트 반환
  if (!nft) return null;

  // 티어 정보
  const tierInfo = TIERS[nft.tier] || TIERS.fan;
  
  // 카드 크기 설정
  const cardSize = useMemo(() => {
    return {
      small: { width: 100, height: 140 },
      medium: { width: 140, height: 200 },
      large: { width: 180, height: 250 }
    }[size];
  }, [size]);
  
  // 이미지 로딩 완료 핸들러
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };
  
  // 이미지 로딩 에러 핸들러
  const handleImageError = () => {
    setIsImageLoading(false);
    setHasImageError(true);
  };
  
  // 멤버 이미지 가져오기
  const getMemberImage = useMemo(() => {
    try {
      // NFT 객체에 image 속성이 있으면 그것을 사용
      if (nft.image) {
        return nft.image;
      }
      
      // 이미지 경로가 이미 문자열로 제공된 경우 (imagePath 사용)
      if (nft.imagePath) {
        // 개발 중에는 require가 문자열을 받을 수 없으므로 미리 정의된 이미지 사용
        return require('../../assets/images/placeholder.png');
      }
      
      // 아티스트별 이미지 매핑
      if (nft.artistId === 'gidle') {
        switch (nft.memberId) {
          case 'miyeon': return require('../../assets/artists/gidle/members/miyeon.jpg');
          case 'minnie': return require('../../assets/artists/gidle/members/minnie.jpg');
          case 'soyeon': return require('../../assets/artists/gidle/members/soyeon.jpg');
          case 'yuqi': return require('../../assets/artists/gidle/members/yuqi.jpg');
          case 'shuhua': return require('../../assets/artists/gidle/members/shuhua.jpg');
          default: return require('../../assets/artists/gidle/members/miyeon.jpg');
        }
      } else if (nft.artistId === 'bibi') {
        return require('../../assets/artists/bibi/profile.jpg');
      } else if (nft.artistId === 'chanwon') {
        return require('../../assets/artists/chanwon/profile.jpg');
      }
      
      // 기본 이미지
      return require('../../assets/images/placeholder.png');
    } catch (error) {
      console.error('멤버 이미지 로드 오류:', error, nft);
      return require('../../assets/images/placeholder.png');
    }
  }, [nft.image, nft.imagePath, nft.artistId, nft.memberId]);
  
  // 프레임 이미지 가져오기
  const getFrameImage = useMemo(() => {
    try {
      // NFT 객체에 frameImage 속성이 있으면 그것을 사용
      if (nft.frameImage) {
        return nft.frameImage;
      }
      
      // 티어별 프레임 이미지 반환
      switch(nft.tier) {
        case 'founders': return require('../../assets/frames/founders.png');
        case 'earlybird': return require('../../assets/frames/earlybird.png');
        case 'supporter': return require('../../assets/frames/supporter.png');
        case 'fan': 
        default: return require('../../assets/frames/fan.png');
      }
    } catch (error) {
      console.error('프레임 이미지 로드 오류:', error, nft);
      return require('../../assets/frames/fan.png');
    }
  }, [nft.frameImage, nft.tier]);
  
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
        disabled && styles.disabledCard,
        style
      ]}
      onPress={handlePress}
      disabled={disabled && !isSelected}
      activeOpacity={0.8}
      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
    >
      {/* 프레임 */}
      <Image
        source={getFrameImage}
        style={[styles.frame, cardSize]}
        resizeMode="cover"
      />
      
      {/* 로딩 인디케이터 */}
      {isImageLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
      
      {/* 멤버/아티스트 이미지 */}
      <ImageWithFallback
        source={getMemberImage}
        style={[
          styles.memberImage,
          hasImageError && styles.errorImage
        ]}
        resizeMode="cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {/* 정보 영역 */}
      <View style={styles.infoContainer}>
        <Text style={styles.tierName}>{tierInfo.displayName}</Text>
        <Text style={styles.pointsText}>
          {nft.currentPoints ? nft.currentPoints.toFixed(1) : '0.0'} P
        </Text>
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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 8,
    elevation: 3,
    backgroundColor: 'white',
  },
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  memberImage: {
    width: '85%',
    height: '85%',
    alignSelf: 'center',
    marginTop: '7.5%',
    borderRadius: 8,
    zIndex: 1,
  },
  errorImage: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 3,
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
    zIndex: 4,
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

export default NFTCard;