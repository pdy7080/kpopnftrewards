// screens/BenefitsScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNFTContext } from '../contexts/NFTContext';
import { COLORS } from '../constants/colors';
import { TIERS } from '../constants/tiers';

// Animated FlatList 생성
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const BenefitsScreen = ({ navigation }) => {
  const { userNFTs } = useNFTContext();
  const [selectedTier, setSelectedTier] = useState('all');

  // 사용자의 최고 티어 확인
  const getUserHighestTier = () => {
    if (!userNFTs || userNFTs.length === 0) return null;
    
    const tiers = ['fan', 'supporter', 'earlybird', 'founders'];
    let highestTier = 'fan';
    
    userNFTs.forEach(nft => {
      const tierIndex = tiers.indexOf(nft.tier);
      const highestTierIndex = tiers.indexOf(highestTier);
      
      if (tierIndex > highestTierIndex) {
        highestTier = nft.tier;
      }
    });
    
    return highestTier;
  };

  const userHighestTier = getUserHighestTier();

  // 혜택 데이터
  const benefits = [
    {
      id: 'fansign',
      title: '팬사인회 응모',
      icon: 'person',
      tiers: {
        fan: { count: 1, description: '1회 응모 가능' },
        supporter: { count: 3, description: '3회 응모 가능' },
        earlybird: { count: 5, description: '5회 응모 가능' },
        founders: { count: 10, description: '10회 응모 가능' }
      }
    },
    {
      id: 'concert',
      title: '콘서트 우선 예매',
      icon: 'musical-notes',
      tiers: {
        fan: { time: 0, description: '일반 예매' },
        supporter: { time: 12, description: '12시간 전 예매' },
        earlybird: { time: 24, description: '24시간 전 예매' },
        founders: { time: 48, description: '48시간 전 예매' }
      }
    },
    {
      id: 'content',
      title: '독점 콘텐츠',
      icon: 'play-circle',
      tiers: {
        fan: { access: 'basic', description: '기본 콘텐츠' },
        supporter: { access: 'premium', description: '프리미엄 콘텐츠' },
        earlybird: { access: 'vip', description: 'VIP 콘텐츠' },
        founders: { access: 'all', description: '모든 콘텐츠' }
      }
    }
  ];

  const renderTierFilter = useCallback(() => (
    <View style={styles.tierFilterContainer}>
      <ScrollView 
        horizontal 
        style={styles.tierFilter}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tierFilterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedTier === 'all' && styles.filterButtonSelected
          ]}
          onPress={() => setSelectedTier('all')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedTier === 'all' && styles.filterButtonTextSelected
          ]}>전체 보기</Text>
        </TouchableOpacity>

        {Object.entries(TIERS).map(([tier, tierInfo]) => (
          <TouchableOpacity
            key={tier}
            style={[
              styles.filterButton,
              selectedTier === tier && styles.filterButtonSelected,
              { borderColor: tierInfo.color }
            ]}
            onPress={() => setSelectedTier(tier)}
          >
            <Text style={[
              styles.filterButtonText,
              { color: tierInfo.color },
              selectedTier === tier && styles.filterButtonTextSelected
            ]}>{tierInfo.displayName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ), [selectedTier]);

  const renderBenefitItem = useCallback(({ item: benefit }) => (
    <View style={styles.benefitCard}>
      <View style={styles.benefitHeader}>
        <Ionicons name={benefit.icon} size={24} color={COLORS.primary} />
        <Text style={styles.benefitTitle}>{benefit.title}</Text>
      </View>

      <View style={styles.tierBenefits}>
        {Object.entries(TIERS).map(([tier, tierInfo]) => {
          const isAvailable = userHighestTier && 
            ['founders', 'earlybird', 'supporter', 'fan'].indexOf(userHighestTier) >= 
            ['founders', 'earlybird', 'supporter', 'fan'].indexOf(tier);

          if (selectedTier !== 'all' && selectedTier !== tier) return null;

          return (
            <View 
              key={tier}
              style={[
                styles.tierBenefit,
                { borderColor: tierInfo.color },
                isAvailable && { backgroundColor: tierInfo.color + '10' }
              ]}
            >
              <Text style={[styles.tierName, { color: tierInfo.color }]}>
                {tierInfo.displayName}
              </Text>
              <Text style={styles.benefitDescription}>
                {benefit.tiers[tier].description}
              </Text>
              {isAvailable && (
                <View style={[styles.availableBadge, { backgroundColor: tierInfo.color }]}>
                  <Text style={styles.availableText}>사용 가능</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  ), [selectedTier, userNFTs]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>NFT 혜택</Text>
        <View style={styles.placeholder} />
      </View>

      {renderTierFilter()}

      <AnimatedFlatList
        data={benefits}
        renderItem={renderBenefitItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
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
  tierFilterContainer: {
    backgroundColor: 'white',
    marginBottom: 8,
  },
  tierFilter: {
    paddingVertical: 12,
  },
  tierFilterContent: {
    paddingHorizontal: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 8,
  },
  filterButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
  },
  filterButtonTextSelected: {
    color: 'white',
  },
  content: {
    padding: 16,
  },
  benefitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tierBenefits: {
    gap: 12,
  },
  tierBenefit: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  tierName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
  },
  availableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BenefitsScreen;