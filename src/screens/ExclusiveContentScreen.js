// screens/ExclusiveContentScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNFTContext } from '../contexts/NFTContext';
import SafeImage from '../components/common/SafeImage';
import { COLORS } from '../constants/colors';
import { ARTISTS } from '../constants/artists';
import { formatDate } from '../utils/formatters';

// 독점 콘텐츠 목록 (실제로는 API에서 가져옴)
const EXCLUSIVE_CONTENTS = {
  // 여자아이들 콘텐츠
  gidle: [
    {
      id: 'gidle_1',
      title: '미연 솔로 트랙 비하인드',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      thumbnail: 'miyeon_behind',
      type: 'video',
      duration: '5:32',
      minTier: 'fan'
    },
    {
      id: 'gidle_2',
      title: '우기 안무 연습 영상',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      thumbnail: 'yuqi_dance',
      type: 'video',
      duration: '3:45',
      minTier: 'supporter'
    },
    {
      id: 'gidle_3',
      title: '소연 작곡 과정 비하인드',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      thumbnail: 'soyeon_compose',
      type: 'video',
      duration: '10:21',
      minTier: 'earlybird'
    },
    {
      id: 'gidle_4',
      title: '팬미팅 비하인드 포토',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      thumbnail: 'fanmeeting_photo',
      type: 'photo',
      photoCount: 24,
      minTier: 'fan'
    },
    {
      id: 'gidle_5',
      title: '민니 ASMR',
      date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      thumbnail: 'minnie_asmr',
      type: 'audio',
      duration: '15:00',
      minTier: 'supporter'
    },
    {
      id: 'gidle_6',
      title: '신곡 녹음 현장',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      thumbnail: 'recording',
      type: 'video',
      duration: '8:17',
      minTier: 'founders'
    }
  ],
  
  // 비비 콘텐츠
  bibi: [
    {
      id: 'bibi_1',
      title: '신곡 작업 비하인드',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      thumbnail: 'bibi_song',
      type: 'video',
      duration: '7:12',
      minTier: 'fan'
    },
    {
      id: 'bibi_2',
      title: '커버 라이브',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      thumbnail: 'bibi_cover',
      type: 'audio',
      duration: '4:30',
      minTier: 'supporter'
    },
    {
      id: 'bibi_3',
      title: 'MV 촬영 비하인드',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      thumbnail: 'bibi_mv',
      type: 'video',
      duration: '9:45',
      minTier: 'earlybird'
    }
  ],
  
  // 이찬원 콘텐츠
  chanwon: [
    {
      id: 'chanwon_1',
      title: '팬미팅 비하인드',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      thumbnail: 'chanwon_fanmeeting',
      type: 'video',
      duration: '6:24',
      minTier: 'fan'
    },
    {
      id: 'chanwon_2',
      title: '미공개 라이브 클립',
      date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      thumbnail: 'chanwon_live',
      type: 'video',
      duration: '5:18',
      minTier: 'supporter'
    },
{
       id: 'chanwon_3',
       title: '녹음실 비하인드',
       date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
       thumbnail: 'chanwon_recording',
       type: 'video',
       duration: '7:53',
       minTier: 'earlybird'
     }
   ]
 };

const ExclusiveContentScreen = ({ navigation, route }) => {
 const { userNFTs, artistNFTs, selectedArtistId } = useNFTContext();
 
 // 현재 아티스트 ID
 const [artistId, setArtistId] = useState(route.params?.artistId || selectedArtistId);
 
 // 필터링 상태
 const [filterByTier, setFilterByTier] = useState('all');
 
 // 로딩 상태
 const [isLoading, setIsLoading] = useState(false);
 
 // 사용자 최고 티어 확인
 const highestTier = React.useMemo(() => {
   const nfts = artistNFTs.filter(nft => nft.artistId === artistId);
   
   if (nfts.length === 0) return null;
   
   const tierOrder = { founders: 3, earlybird: 2, supporter: 1, fan: 0 };
   
   // 가장 높은 티어의 NFT 찾기
   return nfts.reduce((highest, nft) => {
     if (!highest) return nft.tier;
     return tierOrder[nft.tier] > tierOrder[highest] ? nft.tier : highest;
   }, null);
 }, [artistNFTs, artistId]);
 
 // 필터링된 콘텐츠 목록
 const filteredContents = React.useMemo(() => {
   const contents = EXCLUSIVE_CONTENTS[artistId] || [];
   
   if (filterByTier === 'all') {
     return contents;
   } else {
     return contents.filter(content => content.minTier === filterByTier);
   }
 }, [artistId, filterByTier]);
 
 // 티어에 따라 접근 가능한지 확인
 const hasAccessToContent = (contentMinTier) => {
   if (!highestTier) return false;
   
   const tierOrder = { founders: 3, earlybird: 2, supporter: 1, fan: 0 };
   return tierOrder[highestTier] >= tierOrder[contentMinTier];
 };
 
 // 콘텐츠 선택 처리
 const handleContentPress = (content) => {
   if (!hasAccessToContent(content.minTier)) {
     const requiredTier = content.minTier.charAt(0).toUpperCase() + content.minTier.slice(1);
     Alert.alert('접근 제한', `이 콘텐츠는 ${requiredTier} 티어 이상만 볼 수 있습니다.`);
     return;
   }
   
   // 실제로는 콘텐츠 상세 페이지로 이동
   Alert.alert('콘텐츠 재생', `"${content.title}" 콘텐츠를 재생합니다.`);
 };
 
 // 콘텐츠 아이템 렌더링
 const renderContentItem = ({ item }) => {
   const hasAccess = hasAccessToContent(item.minTier);
   
   return (
     <TouchableOpacity
       style={[
         styles.contentItem,
         !hasAccess && styles.lockedContentItem
       ]}
       onPress={() => handleContentPress(item)}
       activeOpacity={0.8}
     >
       <View style={styles.thumbnailContainer}>
         <SafeImage
           source={require('../assets/images/placeholder.png')}
           style={styles.thumbnail}
         />
         
         <View style={styles.contentTypeContainer}>
           {item.type === 'video' && (
             <View style={styles.durationTag}>
               <Ionicons name="play" size={12} color="white" />
               <Text style={styles.durationText}>{item.duration}</Text>
             </View>
           )}
           {item.type === 'audio' && (
             <View style={styles.durationTag}>
               <Ionicons name="musical-notes" size={12} color="white" />
               <Text style={styles.durationText}>{item.duration}</Text>
             </View>
           )}
           {item.type === 'photo' && (
             <View style={styles.durationTag}>
               <Ionicons name="images" size={12} color="white" />
               <Text style={styles.durationText}>{item.photoCount}장</Text>
             </View>
           )}
         </View>
         
         {!hasAccess && (
           <View style={styles.lockOverlay}>
             <Ionicons name="lock-closed" size={24} color="white" />
             <Text style={styles.lockText}>{item.minTier} 티어 이상</Text>
           </View>
         )}
       </View>
       
       <View style={styles.contentInfo}>
         <Text style={styles.contentTitle} numberOfLines={2}>{item.title}</Text>
         <Text style={styles.contentDate}>{formatDate(item.date)}</Text>
       </View>
     </TouchableOpacity>
   );
 };
 
 // 아티스트 정보
 const artistInfo = ARTISTS[artistId] || {};
 
 return (
   <SafeAreaView style={styles.container}>
     <View style={styles.header}>
       <TouchableOpacity 
         style={styles.backButton}
         onPress={() => navigation.goBack()}
       >
         <Ionicons name="arrow-back" size={24} color="#333" />
       </TouchableOpacity>
       
       <Text style={styles.title}>독점 콘텐츠</Text>
       
       <View style={{ width: 32 }} />
     </View>
     
     {/* 아티스트 선택 */}
     {Object.keys(ARTISTS).length > 1 && (
       <View style={styles.artistSelectorContainer}>
         <ScrollView 
           horizontal 
           showsHorizontalScrollIndicator={false}
           contentContainerStyle={styles.artistButtons}
         >
           {Object.entries(ARTISTS).map(([id, artist]) => (
             <TouchableOpacity
               key={id}
               style={[
                 styles.artistButton,
                 artistId === id && { 
                   backgroundColor: artist.primaryColor,
                   borderColor: artist.primaryColor
                 }
               ]}
               onPress={() => setArtistId(id)}
             >
               <Text style={[
                 styles.artistButtonText,
                 artistId === id && { color: 'white' }
               ]}>
                 {artist.name}
               </Text>
             </TouchableOpacity>
           ))}
         </ScrollView>
       </View>
     )}
     
     {/* 티어 필터 */}
     <View style={styles.filterContainer}>
       <ScrollView 
         horizontal 
         showsHorizontalScrollIndicator={false}
         contentContainerStyle={styles.filterOptions}
       >
         <TouchableOpacity
           style={[
             styles.filterOption,
             filterByTier === 'all' && styles.filterOptionSelected
           ]}
           onPress={() => setFilterByTier('all')}
         >
           <Text style={[
             styles.filterOptionText,
             filterByTier === 'all' && styles.filterOptionTextSelected
           ]}>
             전체
           </Text>
         </TouchableOpacity>
         
         <TouchableOpacity
           style={[
             styles.filterOption,
             filterByTier === 'fan' && styles.filterOptionSelected
           ]}
           onPress={() => setFilterByTier('fan')}
         >
           <Text style={[
             styles.filterOptionText,
             filterByTier === 'fan' && styles.filterOptionTextSelected
           ]}>
             Fan
           </Text>
         </TouchableOpacity>
         
         <TouchableOpacity
           style={[
             styles.filterOption,
             filterByTier === 'supporter' && styles.filterOptionSelected
           ]}
           onPress={() => setFilterByTier('supporter')}
         >
           <Text style={[
             styles.filterOptionText,
             filterByTier === 'supporter' && styles.filterOptionTextSelected
           ]}>
             Supporter
           </Text>
         </TouchableOpacity>
         
         <TouchableOpacity
           style={[
             styles.filterOption,
             filterByTier === 'earlybird' && styles.filterOptionSelected
           ]}
           onPress={() => setFilterByTier('earlybird')}
         >
           <Text style={[
             styles.filterOptionText,
             filterByTier === 'earlybird' && styles.filterOptionTextSelected
           ]}>
             Early Bird
           </Text>
         </TouchableOpacity>
         
         <TouchableOpacity
           style={[
             styles.filterOption,
             filterByTier === 'founders' && styles.filterOptionSelected
           ]}
           onPress={() => setFilterByTier('founders')}
         >
           <Text style={[
             styles.filterOptionText,
             filterByTier === 'founders' && styles.filterOptionTextSelected
           ]}>
             Founders
           </Text>
         </TouchableOpacity>
       </ScrollView>
     </View>
     
     {/* 콘텐츠 목록 */}
     {isLoading ? (
       <View style={styles.loadingContainer}>
         <ActivityIndicator size="large" color={COLORS.primary} />
         <Text style={styles.loadingText}>콘텐츠 로딩 중...</Text>
       </View>
     ) : (
       <FlatList
         data={filteredContents}
         renderItem={renderContentItem}
         keyExtractor={item => item.id}
         numColumns={2}
         contentContainerStyle={styles.contentList}
         ListEmptyComponent={
           <View style={styles.emptyContainer}>
             <Text style={styles.emptyText}>
               {filterByTier !== 'all'
                 ? `${filterByTier} 티어 콘텐츠가 없습니다.`
                 : '독점 콘텐츠가 없습니다.'}
             </Text>
           </View>
         }
       />
     )}
     
     {/* 티어 정보 */}
     {!highestTier && (
       <View style={styles.noTierContainer}>
         <Text style={styles.noTierText}>
           독점 콘텐츠를 보려면 NFT가 필요합니다.
         </Text>
       </View>
     )}
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
 artistSelectorContainer: {
   backgroundColor: 'white',
   paddingVertical: 12,
   elevation: 2,
 },
 artistButtons: {
   paddingHorizontal: 16,
 },
 artistButton: {
   paddingHorizontal: 16,
   paddingVertical: 8,
   borderRadius: 20,
   borderWidth: 1,
   borderColor: '#ddd',
   marginRight: 8,
 },
 artistButtonText: {
   fontSize: 14,
   color: '#666',
 },
 filterContainer: {
   backgroundColor: 'white',
   paddingVertical: 12,
   marginTop: 8,
   elevation: 1,
 },
 filterOptions: {
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
   backgroundColor: COLORS.primary,
   borderColor: COLORS.primary,
 },
 filterOptionText: {
   fontSize: 14,
   color: '#666',
 },
 filterOptionTextSelected: {
   color: 'white',
 },
 loadingContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
 loadingText: {
   marginTop: 16,
   color: '#666',
 },
 contentList: {
   padding: 8,
 },
 contentItem: {
   flex: 1,
   margin: 8,
   backgroundColor: 'white',
   borderRadius: 12,
   overflow: 'hidden',
   elevation: 2,
   maxWidth: '47%',
 },
 lockedContentItem: {
   opacity: 0.8,
 },
 thumbnailContainer: {
   position: 'relative',
   height: 120,
 },
 thumbnail: {
   width: '100%',
   height: '100%',
 },
 contentTypeContainer: {
   position: 'absolute',
   bottom: 8,
   right: 8,
 },
 durationTag: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: 'rgba(0,0,0,0.7)',
   paddingHorizontal: 6,
   paddingVertical: 2,
   borderRadius: 4,
 },
 durationText: {
   color: 'white',
   fontSize: 10,
   marginLeft: 2,
 },
 lockOverlay: {
   ...StyleSheet.absoluteFillObject,
   backgroundColor: 'rgba(0,0,0,0.5)',
   justifyContent: 'center',
   alignItems: 'center',
 },
 lockText: {
   color: 'white',
   fontSize: 12,
   marginTop: 4,
 },
 contentInfo: {
   padding: 10,
 },
 contentTitle: {
   fontSize: 14,
   fontWeight: 'bold',
   marginBottom: 4,
 },
 contentDate: {
   fontSize: 10,
   color: '#666',
 },
 emptyContainer: {
   flex: 1,
   padding: 32,
   alignItems: 'center',
 },
 emptyText: {
   color: '#666',
   textAlign: 'center',
 },
 noTierContainer: {
   position: 'absolute',
   bottom: 0,
   left: 0,
   right: 0,
   padding: 16,
   backgroundColor: 'rgba(0,0,0,0.8)',
 },
 noTierText: {
   color: 'white',
   textAlign: 'center',
 }
});

export default ExclusiveContentScreen;