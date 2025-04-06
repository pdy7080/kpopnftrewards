// ArtistSelectionScreen.js
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNFTContext } from '../contexts/NFTContext';
import { ARTISTS } from '../constants/artists';
import { COLORS } from '../constants/colors';
import { ROUTES } from '../constants/navigation';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = height * 0.6;
const SPACING = 20;

// 애니메이션 FlatList 생성
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const ArtistSelectionScreen = ({ navigation }) => {
  const { setSelectedArtist } = useNFTContext();
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleSelectArtist = useCallback((artistId) => {
    setSelectedArtistId(artistId);
  }, []);

  const handleStart = useCallback(async () => {
    if (!selectedArtistId) {
      Alert.alert('알림', '아티스트를 선택해주세요.');
      return;
    }

    try {
      await setSelectedArtist(selectedArtistId);
      navigation.replace(ROUTES.ARTIST_HOME, { 
        artistId: selectedArtistId,
        artist: ARTISTS[selectedArtistId]
      });
    } catch (error) {
      console.error('아티스트 선택 오류:', error);
      Alert.alert('오류', '아티스트 선택 중 오류가 발생했습니다.');
    }
  }, [selectedArtistId, setSelectedArtist, navigation]);

  const renderArtistCard = useCallback(({ item: artist, index }) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.artistCard,
            selectedArtistId === artist.id && styles.selectedCard
          ]}
          onPress={() => handleSelectArtist(artist.id)}
          activeOpacity={0.8}
        >
          <Image 
            source={artist.logo} 
            style={styles.artistLogo}
            resizeMode="contain"
          />
          <Image 
            source={artist.groupImage} 
            style={styles.artistImage}
            resizeMode="cover"
          />
          <View style={styles.artistInfo}>
            <Text style={styles.artistName}>{artist.name}</Text>
            <Text style={styles.artistDescription}>{artist.description}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [selectedArtistId, handleSelectArtist, scrollX]);

  const keyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback((data, index) => ({
    length: CARD_WIDTH,
    offset: CARD_WIDTH * index,
    index,
  }), []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>K-POP NFT 리워드</Text>
        <Text style={styles.subtitle}>아티스트를 선택하세요</Text>
      </View>

      <AnimatedFlatList
        ref={flatListRef}
        data={Object.values(ARTISTS)}
        renderItem={renderArtistCard}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        getItemLayout={getItemLayout}
        initialScrollIndex={0}
        snapToAlignment="center"
        pagingEnabled
      />

      <TouchableOpacity
        style={[
          styles.startButton,
          !selectedArtistId && styles.startButtonDisabled
        ]}
        onPress={handleStart}
        disabled={!selectedArtistId}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>시작하기</Text>
      </TouchableOpacity>
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
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
  },
  flatListContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    paddingVertical: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: SPACING / 2,
  },
  artistCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
  },
  artistLogo: {
    height: 60,
    width: '70%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  artistImage: {
    width: '100%',
    height: CARD_HEIGHT * 0.5,
    marginBottom: 10,
  },
  artistInfo: {
    padding: 16,
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  artistDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  startButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ArtistSelectionScreen;