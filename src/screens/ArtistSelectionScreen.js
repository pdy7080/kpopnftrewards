// ArtistSelectionScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  FlatList,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ARTISTS } from '../constants/artists';
import { COLORS } from '../constants/colors';
import { ROUTES } from '../constants/navigation';

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width;
const ITEM_HEIGHT = height * 0.7;
const SPACING = 0;

const ArtistSelectionScreen = ({ navigation }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const renderArtistCard = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp'
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp'
    });

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedArtist(item.id)}
      >
        <Animated.View
          style={[
            styles.artistCard,
            {
              transform: [{ scale }],
              opacity
            }
          ]}
        >
          <Image
            source={item.groupImage}
            style={styles.artistImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <Image
              source={item.logo}
              style={styles.artistLogo}
              resizeMode="contain"
            />
            <Text style={styles.artistDescription}>{item.description}</Text>
          </LinearGradient>

          {selectedArtist === item.id && (
            <View style={[styles.selectedOverlay, { borderColor: item.primaryColor }]}>
              <Text style={[styles.selectedText, { color: item.primaryColor }]}>선택됨</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const handleStart = () => {
    if (selectedArtist) {
      navigation.replace(ROUTES.HOME, { artistId: selectedArtist });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>K-POP NFT 리워드</Text>
        <Text style={styles.subtitle}>아티스트를 선택하세요</Text>
      </View>

      <Animated.FlatList
        data={Object.values(ARTISTS)}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        snapToAlignment="center"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={renderArtistCard}
        contentContainerStyle={styles.flatListContent}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !selectedArtist && styles.startButtonDisabled
          ]}
          onPress={handleStart}
          disabled={!selectedArtist}
        >
          <Text style={styles.startButtonText}>
            {selectedArtist ? '시작하기' : '아티스트를 선택해주세요'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  flatListContent: {
    paddingHorizontal: 0,
  },
  artistCard: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginHorizontal: SPACING,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    elevation: 5,
  },
  artistImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  artistLogo: {
    width: '70%',
    height: 60,
    marginBottom: 16,
  },
  artistDescription: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderRadius: 24,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 16,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  footer: {
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#333',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ArtistSelectionScreen;