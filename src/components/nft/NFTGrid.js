// components/nft/NFTGrid.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import NFTCard from './NFTCard';
import { COLORS } from '../../constants/colors';
import { TIERS } from '../../constants/tiers';
import { ARTISTS } from '../../constants/artists';
import NFTFrame from './NFTFrame';

// Animated FlatList 생성
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * NFT 그리드 컴포넌트
 * 
 * @param {Array} nfts - NFT 객체 배열
 * @param {function} onNFTPress - NFT 선택 시 호출할 함수
 * @param {string} emptyMessage - NFT가 없을 때 표시할 메시지
 * @param {number} numColumns - 열 수 (기본값: 2)
 * @param {string} size - NFT 카드 크기 ('small', 'medium', 'large')
 * @param {Array} selectedNFTs - 선택된 NFT의 ID 배열 (다중 선택 지원)
 * @param {function} onNFTSelect - NFT 선택 핸들러 (다중 선택용)
 * @param {function} onNFTDeselect - NFT 선택 해제 핸들러 (다중 선택용)
 * @param {boolean} selectionMode - 선택 모드 활성화 여부
 * @param {object} style - 추가 스타일
 */
const NFTGrid = ({ 
  nfts = [], 
  onNFTPress, 
  emptyMessage = '보유한 NFT가 없습니다.',
  numColumns = 2,
  size = 'medium',
  selectedNFTs = [],
  onNFTSelect,
  onNFTDeselect,
  selectionMode = false,
  style 
}) => {
  // NFT 아이템 렌더링
  const renderNFTItem = ({ item }) => {
    const isSelected = selectedNFTs.includes(item.id);
    
    return (
      <TouchableOpacity
        onPress={() => {
          if (selectionMode) {
            if (isSelected) {
              onNFTDeselect && onNFTDeselect(item.id);
            } else {
              onNFTSelect && onNFTSelect(item);
            }
          } else {
            onNFTPress && onNFTPress(item);
          }
        }}
        style={styles.nftItem}
      >
        <NFTCard 
          nft={item} 
          size={size} 
          isSelected={isSelected}
        />
      </TouchableOpacity>
    );
  };
  
  // NFT가 없을 때 렌더링할 컴포넌트
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );
  
  return (
    <AnimatedFlatList
      data={nfts}
      renderItem={renderNFTItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        nfts.length === 0 && styles.emptyContentContainer,
        style
      ]}
      ListEmptyComponent={renderEmptyComponent}
      columnWrapperStyle={nfts.length > 0 ? styles.columnWrapper : null}
      removeClippedSubviews={true}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={5}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-evenly',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nftItem: {
    margin: 8,
  }
});

export default NFTGrid;