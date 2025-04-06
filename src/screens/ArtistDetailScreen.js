import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { styles } from '../styles/styles';

// Animated FlatList 생성
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const ArtistDetailScreen = () => {
  const navigation = useNavigation();
  const filteredNFTs = useSelector((state) => state.nfts.filteredNFTs);

  const renderNFTList = () => {
    return (
      <AnimatedFlatList
        data={filteredNFTs}
        keyExtractor={(item) => item.id}
        renderItem={renderNFTItem}
        numColumns={2}
        contentContainerStyle={styles.nftGrid}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
        initialNumToRender={4}
        ListEmptyComponent={renderEmptyState}
      />
    );
  };

  const renderNFTItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.nftCard}
        onPress={() => handleNFTPress(item)}
        activeOpacity={0.8}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
      >
        <View style={styles.nftImageContainer}>
          {/* ... existing code ... */}
        </View>
        <Text style={styles.nftName} numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text style={styles.nftPoints}>
          {item.currentPoints ? item.currentPoints.toFixed(1) : '0'} 포인트
        </Text>
      </TouchableOpacity>
    );
  };

  const handleNFTPress = (item) => {
    // Implement the logic to handle pressing an NFT
  };

  const renderEmptyState = () => {
    // Implement the logic to render an empty state
  };

  return (
    <View style={styles.container}>
      {/* ... existing code ... */}
    </View>
  );
};

export default ArtistDetailScreen; 