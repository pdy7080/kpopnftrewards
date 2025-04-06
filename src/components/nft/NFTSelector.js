// components/nft/NFTSelector.js
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NFTCard from './NFTCard';
import Button from '../common/Button';
import { COLORS } from '../../constants/colors';
import { TIERS } from '../../constants/tiers';

// Animated FlatList 생성
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

/**
 * NFT 선택 모달 컴포넌트
 * 
 * @param {boolean} visible - 모달 표시 여부
 * @param {function} onClose - 모달 닫기 핸들러
 * @param {Array} nfts - NFT 객체 배열
 * @param {Array} selectedNFTs - 선택된 NFT ID 배열
 * @param {function} onSelect - NFT 선택 완료 시 호출할 함수
 * @param {number} maxSelection - 최대 선택 가능 NFT 수 (기본값: 1)
 * @param {boolean} requireSameTier - 동일 티어 NFT만 선택 가능한지 여부
 * @param {string} title - 모달 제목
 */
const NFTSelector = ({ 
  visible, 
  onClose, 
  nfts = [], 
  selectedNFTs = [], 
  onSelect,
  maxSelection = 1,
  requireSameTier = false,
  title = 'NFT 선택'
}) => {
  // 로컬 선택 상태
  const [localSelectedNFTs, setLocalSelectedNFTs] = useState(selectedNFTs);
  // 현재 선택된 티어 (첫 번째 선택된 NFT의 티어)
  const [selectedTier, setSelectedTier] = useState(null);
  
  // 컴포넌트 마운트 시 선택 상태 초기화
  React.useEffect(() => {
    if (visible) {
      setLocalSelectedNFTs(selectedNFTs);
      
      if (requireSameTier && selectedNFTs.length > 0) {
        const firstNFT = nfts.find(nft => nft.id === selectedNFTs[0]);
        if (firstNFT) {
          setSelectedTier(firstNFT.tier);
        }
      } else {
        setSelectedTier(null);
      }
    }
  }, [visible, selectedNFTs, nfts, requireSameTier]);
  
  // NFT 필터링 (선택된 티어에 따라)
  const filteredNFTs = useCallback(() => {
    if (!requireSameTier || !selectedTier) return nfts;
    return nfts.filter(nft => nft.tier === selectedTier);
  }, [nfts, selectedTier, requireSameTier]);
  
  // NFT 선택 토글
  const toggleNFTSelection = (nft) => {
    // 이미 선택된 NFT인지 확인
    const isSelected = localSelectedNFTs.includes(nft.id);
    
    if (isSelected) {
      // 선택 해제
      const updatedSelection = localSelectedNFTs.filter(id => id !== nft.id);
      setLocalSelectedNFTs(updatedSelection);
      
      // 모든 선택이 해제되면 선택된 티어도 초기화
      if (requireSameTier && updatedSelection.length === 0) {
        setSelectedTier(null);
      }
    } else {
      // 최대 선택 수 확인
      if (localSelectedNFTs.length >= maxSelection) {
        return;
      }
      
      // 첫 선택 시 티어 설정
      if (requireSameTier && localSelectedNFTs.length === 0) {
        setSelectedTier(nft.tier);
      }
      
      // 동일 티어 확인
      if (requireSameTier && selectedTier && nft.tier !== selectedTier) {
        return;
      }
      
      // 선택 추가
      setLocalSelectedNFTs([...localSelectedNFTs, nft.id]);
    }
  };
  
  // 선택 완료
  const handleConfirm = () => {
    onSelect && onSelect(localSelectedNFTs);
    onClose();
  };
  
  // NFT 아이템 렌더링
  const renderNFTItem = ({ item }) => {
    const isSelected = localSelectedNFTs.includes(item.id);
    const isDisabled = requireSameTier && selectedTier && item.tier !== selectedTier;
    
    return (
      <TouchableOpacity
        style={styles.nftItem}
        onPress={() => toggleNFTSelection(item)}
        disabled={isDisabled && !isSelected}
      >
        <NFTCard 
          nft={item} 
          size="small" 
          isSelected={isSelected}
          disabled={isDisabled && !isSelected}
        />
        
        <View style={styles.nftInfo}>
          <Text style={styles.nftName} numberOfLines={1}>
            {item.name || `${item.artistId} ${item.memberId} NFT`}
          </Text>
          <Text style={[styles.tierText, { color: TIERS[item.tier]?.color || '#999' }]}>
            {TIERS[item.tier]?.displayName || item.tier}
          </Text>
          <Text style={styles.pointsText}>
            {item.currentPoints?.toFixed(1) || 0} 포인트
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // 모달 컨텐츠
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionText}>
              선택됨: {localSelectedNFTs.length}/{maxSelection}
            </Text>
            
            {requireSameTier && selectedTier && (
              <Text style={styles.tierSelectionText}>
                <Text style={{color: TIERS[selectedTier]?.color || COLORS.primary}}>
                  {TIERS[selectedTier]?.displayName || selectedTier} 티어
                </Text> NFT만 선택 가능합니다
              </Text>
            )}
          </View>
          
          <AnimatedFlatList
            data={filteredNFTs()}
            renderItem={renderNFTItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.nftList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {requireSameTier && selectedTier
                  ? `${TIERS[selectedTier]?.displayName || selectedTier} 티어 NFT가 없습니다`
                  : '선택 가능한 NFT가 없습니다'}
              </Text>
            }
          />
          
          <View style={styles.buttons}>
            <Button 
              title="취소" 
              type="outline" 
              onPress={onClose} 
              style={styles.button}
            />
            <Button 
              title="선택 완료" 
              onPress={handleConfirm} 
              disabled={localSelectedNFTs.length === 0}
              style={styles.button}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
 modalContainer: {
   flex: 1,
   backgroundColor: 'rgba(0, 0, 0, 0.5)',
   justifyContent: 'center',
   alignItems: 'center',
 },
 modalContent: {
   width: '90%',
   maxHeight: '80%',
   backgroundColor: 'white',
   borderRadius: 12,
   overflow: 'hidden',
   elevation: 5,
 },
 header: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   padding: 16,
   borderBottomWidth: 1,
   borderBottomColor: '#eee',
 },
 title: {
   fontSize: 18,
   fontWeight: 'bold',
 },
 closeButton: {
   padding: 4,
 },
 selectionInfo: {
   padding: 12,
   backgroundColor: '#f9f9f9',
   borderBottomWidth: 1,
   borderBottomColor: '#eee',
 },
 selectionText: {
   fontSize: 14,
   fontWeight: 'bold',
 },
 tierSelectionText: {
   fontSize: 12,
   marginTop: 4,
   color: '#666',
 },
 nftList: {
   padding: 12,
 },
 nftItem: {
   flexDirection: 'row',
   alignItems: 'center',
   marginBottom: 12,
   backgroundColor: 'white',
   borderRadius: 8,
   padding: 8,
   elevation: 1,
 },
 nftInfo: {
   flex: 1,
   marginLeft: 12,
 },
 nftName: {
   fontSize: 14,
   fontWeight: 'bold',
   marginBottom: 4,
 },
 tierText: {
   fontSize: 12,
   marginBottom: 2,
 },
 pointsText: {
   fontSize: 12,
   color: '#666',
 },
 emptyText: {
   textAlign: 'center',
   color: '#666',
   padding: 24,
 },
 buttons: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   padding: 16,
   borderTopWidth: 1,
   borderTopColor: '#eee',
 },
 button: {
   flex: 1,
   marginHorizontal: 8,
 }
});

export default NFTSelector;