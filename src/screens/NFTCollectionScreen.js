// screens/NFTCollectionScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNFTContext } from '../contexts/NFTContext';
import { NFTCard } from '../components/NFTCard';
import { COLORS } from '../constants/colors';
import { TIERS } from '../constants/tiers';
import { ARTISTS } from '../constants/artists';

const NFTCollectionScreen = ({ navigation, route }) => {
  const { userNFTs, artistNFTs, selectedArtistId, loadUserNFTs, loadArtistNFTs } = useNFTContext();
  
  // 현재 아티스트 ID
  const [artistId, setArtistId] = useState(route.params?.artistId || selectedArtistId);
  
  // 필터링 상태
  const [selectedTier, setSelectedTier] = useState('all');
  const [filterByArtist, setFilterByArtist] = useState(artistId || 'all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' 또는 'list'
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  
  // 컴포넌트 마운트 시 NFT 데이터 로드
  useEffect(() => {
    const loadNFTs = async () => {
      setIsLoading(true);
      await loadUserNFTs();
      
      if (artistId) {
        await loadArtistNFTs(artistId);
      }
      
      setIsLoading(false);
    };
    
    loadNFTs();
  }, [artistId]);
  
  // NFT를 티어별로 그룹화
  const groupedNFTs = React.useMemo(() => {
    const nfts = artistId ? artistNFTs : userNFTs;
    const groups = {
      founders: [],
      earlybird: [],
      supporter: [],
      fan: []
    };
    
    nfts.forEach(nft => {
      if (groups.hasOwnProperty(nft.tier)) {
        groups[nft.tier].push(nft);
      }
    });
    
    return groups;
  }, [userNFTs, artistNFTs, artistId]);
  
  // NFT 선택 처리
  const handleNFTPress = (nft) => {
    navigation.navigate('NFTDetail', { nft });
  };
  
  // 티어 섹션 렌더링
  const renderTierSection = (tier) => {
    const nfts = groupedNFTs[tier];
    if (!nfts || (selectedTier !== 'all' && selectedTier !== tier)) return null;
    
    const tierInfo = TIERS[tier];
    
    return (
      <View key={tier} style={styles.tierSection}>
        <View style={[styles.tierHeader, { backgroundColor: tierInfo.color + '20' }]}>
          <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
            <Text style={styles.tierBadgeText}>{tierInfo.displayName}</Text>
          </View>
          <Text style={styles.tierCount}>{nfts.length}개 보유</Text>
        </View>
        
        {nfts.length > 0 ? (
          <FlatList
            data={nfts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <NFTCard
                nft={item}
                size="medium"
                onPress={() => handleNFTPress(item)}
                style={styles.nftCard}
              />
            )}
            contentContainerStyle={styles.nftList}
          />
        ) : (
          <View style={styles.emptyTierContainer}>
            <Text style={styles.emptyTierText}>
              {tier === 'fan' 
                ? 'QR 스캔으로 Fan 티어 NFT를 획득하세요!' 
                : `Fan 티어 NFT 3개를 합성하여 ${tierInfo.displayName} 티어로 업그레이드하세요!`}
            </Text>
          </View>
        )}
        
        {nfts.length >= 3 && tier !== 'founders' && (
          <TouchableOpacity
            style={[styles.fusionButton, { backgroundColor: tierInfo.color }]}
            onPress={() => navigation.navigate('NFTFusion', { preSelectedTier: tier })}
          >
            <Ionicons name="git-merge-outline" size={16} color="white" />
            <Text style={styles.fusionButtonText}>
              {tierInfo.displayName} 티어 NFT 합성하기
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
        
        <Text style={styles.title}>NFT 컬렉션</Text>
        
        <TouchableOpacity 
          style={styles.viewToggleButton}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons 
            name={viewMode === 'grid' ? 'list' : 'grid'} 
            size={24} 
            color="#333" 
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {/* 필터 */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedTier === 'all' && styles.filterOptionSelected
              ]}
              onPress={() => setSelectedTier('all')}
            >
              <Text style={[
                styles.filterOptionText,
                selectedTier === 'all' && styles.filterOptionTextSelected
              ]}>전체</Text>
            </TouchableOpacity>
            
            {Object.entries(TIERS).map(([tier, info]) => (
              <TouchableOpacity
                key={tier}
                style={[
                  styles.filterOption,
                  selectedTier === tier && styles.filterOptionSelected,
                  { borderColor: info.color }
                ]}
                onPress={() => setSelectedTier(tier)}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedTier === tier && styles.filterOptionTextSelected,
                  { color: info.color }
                ]}>{info.displayName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* 필터 옵션 */}
        {Object.keys(ARTISTS).length > 1 && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>아티스트:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.artistFilters}
            >
              <TouchableOpacity 
                style={[
                  styles.filterOption,
                  filterByArtist === 'all' && styles.filterOptionSelected
                ]}
                onPress={() => setFilterByArtist('all')}
              >
                <Text style={[
                  styles.filterOptionText,
                  filterByArtist === 'all' && styles.filterOptionTextSelected
                ]}>
                  전체
                </Text>
              </TouchableOpacity>
              
              {Object.entries(ARTISTS).map(([id, artist]) => (
                <TouchableOpacity 
                  key={id}
                  style={[
                    styles.filterOption,
                    filterByArtist === id && styles.filterOptionSelected,
                    filterByArtist === id && { borderColor: artist.primaryColor }
                  ]}
                  onPress={() => setFilterByArtist(id)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filterByArtist === id && styles.filterOptionTextSelected,
                    filterByArtist === id && { color: artist.primaryColor }
                  ]}>
                    {artist.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* NFT 목록 */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>NFT 로딩 중...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {/* Founders 티어 */}
            {renderTierSection('founders')}
            
            {/* Early Bird 티어 */}
            {renderTierSection('earlybird')}
            
            {/* Supporter 티어 */}
            {renderTierSection('supporter')}
            
            {/* Fan 티어 */}
            {renderTierSection('fan')}
          </ScrollView>
        )}
      </ScrollView>
      
      {/* 하단 버튼 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.fusionButton}
          onPress={() => navigation.navigate('NFTFusion')}
        >
          <Ionicons name="git-merge-outline" size={20} color="white" />
          <Text style={styles.fusionButtonText}>NFT 합성하기</Text>
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
  viewToggleButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    elevation: 2,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  filterOptionSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  filterOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  artistFilters: {
    paddingVertical: 8,
  },
  content: {
    flex: 1,
  },
  tierSection: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tierBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tierCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  nftList: {
    paddingRight: 16,
  },
  nftCard: {
    marginRight: 12,
  },
  emptyTierContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTierText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  fusionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  fusionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  }
});

export default NFTCollectionScreen;