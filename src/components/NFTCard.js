import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { TIERS } from '../constants/tiers';
import { COLORS } from '../constants/colors';

export const NFTCard = ({ nft, onPress, style }) => {
  const tierInfo = TIERS[nft.tier];

  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: tierInfo.color }, style]} 
      onPress={() => onPress(nft)}
    >
      <Image 
        source={nft.image} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{nft.name}</Text>
        <View style={[styles.tierBadge, { backgroundColor: tierInfo.color }]}>
          <Text style={styles.tierText}>{tierInfo.name}</Text>
        </View>
        <Text style={styles.points}>{nft.currentPoints.toFixed(1)} P</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 220,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginHorizontal: 8,
    marginVertical: 12,
    overflow: 'hidden',
    borderWidth: 2,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 150,
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tierText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  points: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
}); 