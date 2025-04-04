// screens/admin/SalesSimulationScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Animated, 
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NFTCard } from '../../components/NFTCard';
import { COLORS } from '../../constants/colors';
import { TIERS } from '../../constants/tiers';
import { ARTISTS } from '../../constants/artists';

// 화면 너비 가져오기
const { width } = Dimensions.get('window');

// 간단한 선 그래프 컴포넌트
const LineChart = ({ data, width, height, paddingVertical = 20, paddingHorizontal = 40 }) => {
  if (!data || data.length === 0) return null;
  
  // 그래프 사용 가능 영역 계산
  const chartWidth = width - (paddingHorizontal * 2);
  const chartHeight = height - (paddingVertical * 2);
  
  // 데이터 최대/최소값 찾기
  const minValue = Math.min(...data.datasets.map(ds => Math.min(...ds.data)));
  const maxValue = Math.max(...data.datasets.map(ds => Math.max(...ds.data)));
  
  // 데이터셋 렌더링
  const renderLine = (dataset, index) => {
    const points = dataset.data.map((value, i) => {
      // x, y 좌표 계산
      const x = (chartWidth / (dataset.data.length - 1)) * i + paddingHorizontal;
      const y = chartHeight - ((value - minValue) / (maxValue - minValue) * chartHeight) + paddingVertical;
      return { x, y };
    });
    
    // SVG 경로 생성
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    // 선 색상
    const color = typeof dataset.color === 'function' ? dataset.color() : dataset.color || '#000';
    
    return (
      <View key={`line-${index}`} style={[styles.lineContainer, { position: 'absolute' }]}>
        <View style={[
          styles.line, 
          { 
            borderColor: color,
            borderWidth: dataset.strokeWidth || 2,
            borderStyle: dataset.strokeDashArray?.length > 0 ? 'dashed' : 'solid'
          }
        ]}>
          {/* 라인을 그리기 위한 SVG가 아니라 View를 사용한 간단한 구현 */}
          {points.map((point, i) => (
            <View 
              key={`point-${index}-${i}`}
              style={[
                styles.dataPoint,
                {
                  left: point.x - paddingHorizontal,
                  top: point.y - paddingVertical,
                  backgroundColor: color,
                  width: (dataset.strokeWidth || 2) + 4, 
                  height: (dataset.strokeWidth || 2) + 4
                }
              ]}
            />
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <View style={[styles.chartContainer, { width, height }]}>
      {/* 수평 그리드 라인 */}
      <View style={styles.gridContainer}>
        {[0, 1, 2, 3, 4].map(i => (
          <View 
            key={`grid-${i}`} 
            style={[
              styles.gridLine, 
              { 
                top: paddingVertical + (chartHeight / 4) * i,
                width: chartWidth
              }
            ]} 
          />
        ))}
      </View>
      
      {/* 데이터셋 */}
      {data.datasets.map(renderLine)}
      
      {/* X축 라벨 */}
      <View style={[styles.xAxis, { top: height - paddingVertical + 10 }]}>
        {data.labels.map((label, i) => (
          <Text 
            key={`label-${i}`} 
            style={[
              styles.axisLabel, 
              { 
                left: paddingHorizontal + (chartWidth / (data.labels.length - 1)) * i - 20
              }
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
      
      {/* Y축 라벨 */}
      <View style={styles.yAxis}>
        {[0, 1, 2, 3, 4].map(i => {
          const value = minValue + ((maxValue - minValue) / 4) * (4 - i);
          return (
            <Text 
              key={`y-label-${i}`} 
              style={[
                styles.axisLabel, 
                { 
                  top: paddingVertical + (chartHeight / 4) * i - 10,
                  left: paddingHorizontal - 35
                }
              ]}
            >
              {value.toFixed(1)}
            </Text>
          );
        })}
      </View>
      
      {/* 범례 */}
      {data.legend && (
        <View style={styles.legendContainer}>
          {data.legend.map((label, i) => (
            <View key={`legend-${i}`} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { 
                    backgroundColor: typeof data.datasets[i]?.color === 'function' 
                      ? data.datasets[i].color() 
                      : data.datasets[i]?.color || '#000'
                  }
                ]} 
              />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// 티어별 프레임 이미지 매핑
const TIER_FRAMES = {
  fan: require('../../assets/frames/fan.png'),
  supporter: require('../../assets/frames/supporter.png'),
  earlybird: require('../../assets/frames/earlybird.png'),
  founders: require('../../assets/frames/founders.png'),
};

// 아티스트별 멤버 이미지 매핑
const MEMBER_IMAGES = {
  gidle: {
    miyeon: require('../../assets/artists/gidle/members/miyeon.jpg'),
    minnie: require('../../assets/artists/gidle/members/minnie.jpg'),
    soyeon: require('../../assets/artists/gidle/members/soyeon.jpg'),
    yuqi: require('../../assets/artists/gidle/members/yuqi.jpg'),
    shuhua: require('../../assets/artists/gidle/members/shuhua.jpg'),
  },
  bibi: {
    bibi: require('../../assets/artists/bibi/profile.jpg'),
    bibi1: require('../../assets/artists/bibi/profile.jpg'),
    bibi2: require('../../assets/artists/bibi/profile.jpg'),
    bibi3: require('../../assets/artists/bibi/profile.jpg'),
  },
  chanwon: {
    chanwon: require('../../assets/artists/chanwon/profile.jpg'),
    chanwon1: require('../../assets/artists/chanwon/profile.jpg'),
    chanwon2: require('../../assets/artists/chanwon/profile.jpg'),
    chanwon3: require('../../assets/artists/chanwon/profile.jpg'),
  },
};

const SalesSimulationScreen = ({ navigation }) => {
  // 사용자 NFT 목록
  const [userNFTs, setUserNFTs] = useState([]);
  // 선택된 NFT
  const [selectedNFT, setSelectedNFT] = useState(null);
  // NFT 선택기 모달 표시 여부
  const [showNFTSelector, setShowNFTSelector] = useState(false);
  // 판매량 입력값
  const [salesInput, setSalesInput] = useState('');
  // 시뮬레이션 결과
  const [simulationResult, setSimulationResult] = useState(null);
  // 애니메이션 값
  const pointsAnim = useRef(new Animated.Value(0)).current;
  // 티어별 비교 데이터
  const [tierComparisonData, setTierComparisonData] = useState([]);
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  
  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadUserNFTs();
  }, []);
  
  // 선택된 NFT가 변경될 때 판매량 입력값 초기화
  useEffect(() => {
    if (selectedNFT) {
      setSalesInput(selectedNFT.currentSales.toString());
      pointsAnim.setValue(selectedNFT.currentPoints);
    }
  }, [selectedNFT]);
  
  // 사용자 NFT 로드
  const loadUserNFTs = async () => {
    setIsLoading(true);
    try {
      const userId = 'user123'; // 시연용 고정 사용자 ID
      const nftsJson = await AsyncStorage.getItem(`user_nfts_${userId}`);
      
      if (nftsJson) {
        const nfts = JSON.parse(nftsJson);
        setUserNFTs(nfts);
        
        // 선택된 NFT가 없으면 첫 번째 NFT 선택
        if (!selectedNFT && nfts.length > 0) {
          const foundersNFT = nfts.find(nft => nft.tier === 'founders');
          const earlyBirdNFT = nfts.find(nft => nft.tier === 'earlybird');
          
          // Founders 티어 우선, 그 다음 Early Bird 티어, 없으면 첫 번째 NFT
          const nftToSelect = foundersNFT || earlyBirdNFT || nfts[0];
          setSelectedNFT(nftToSelect);
          setSalesInput(nftToSelect.currentSales.toString());
          pointsAnim.setValue(nftToSelect.currentPoints);
        }
      } else {
        setUserNFTs([]);
      }
    } catch (error) {
      console.error('NFT 로드 오류:', error);
      Alert.alert('오류', 'NFT 데이터를 로드하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // NFT 선택 처리
  const handleSelectNFT = (nft) => {
    setSelectedNFT(nft);
    setShowNFTSelector(false);
    setSimulationResult(null);
  };
  
  // 판매량 입력 처리
  const handleSalesInputChange = (text) => {
    // 숫자만 입력 가능
    if (/^\d*$/.test(text)) {
      setSalesInput(text);
    }
  };
  
  // 판매량 증가 버튼 처리
  const handleSalesIncrement = (amount) => {
    const currentSales = parseInt(salesInput) || (selectedNFT?.currentSales || 0);
    setSalesInput((currentSales + amount).toString());
  };
  
  // 티어별 포인트 상승률 계산
  const calculateTierPointsIncrease = (tier, initialSales, currentSales, newSales) => {
    // 티어별 설정
    const tierConfig = TIERS[tier];
    const milestoneSize = tier === 'fan' ? 500 : 100;
    const pointsPerMilestone = 
      tier === 'founders' ? 3 :
      tier === 'earlybird' ? 2 :
      tier === 'supporter' ? 1 :
      0.5;
    
    // 현재 포인트 계산
    const currentSalesIncrease = Math.max(0, currentSales - initialSales);
    const currentMilestoneCount = Math.floor(currentSalesIncrease / milestoneSize);
    const currentAdditionalPoints = currentMilestoneCount * pointsPerMilestone;
    const currentPoints = tierConfig.initialPoints + currentAdditionalPoints;
    
    // 새 포인트 계산
    const newSalesIncrease = Math.max(0, newSales - initialSales);
    const newMilestoneCount = Math.floor(newSalesIncrease / milestoneSize);
    const newAdditionalPoints = newMilestoneCount * pointsPerMilestone;
    const newPoints = tierConfig.initialPoints + newAdditionalPoints;
    
    return {
      initialPoints: tierConfig.initialPoints,
      currentPoints,
      newPoints,
      increase: newPoints - currentPoints,
      growthRate: ((newPoints - currentPoints) / currentPoints * 100).toFixed(1)
    };
  };
  
  // 시뮬레이션 실행
  const runSimulation = () => {
    if (!selectedNFT) return;
    
    const newSales = parseInt(salesInput) || selectedNFT.currentSales;
    
    // 판매량이 현재 판매량과 같으면 시뮬레이션 불필요
    if (newSales === selectedNFT.currentSales) {
      return;
    }
    
    // 티어별 비교 데이터 생성
    const comparisonData = Object.keys(TIERS).map(tier => {
      const result = calculateTierPointsIncrease(
        tier, 
        selectedNFT.initialSales, 
        selectedNFT.currentSales, 
        newSales
      );
      
      return {
        tier,
        name: TIERS[tier].displayName,
        initialPoints: result.initialPoints,
        currentPoints: result.currentPoints,
        newPoints: result.newPoints,
        increase: result.increase,
        growthRate: result.growthRate,
        color: TIERS[tier].color,
        isSelected: tier === selectedNFT.tier
      };
    });
    
    setTierComparisonData(comparisonData);
    
    // 현재 선택된 티어의 결과
    const selectedTierResult = comparisonData.find(item => item.tier === selectedNFT.tier);
    
    // 시뮬레이션 결과 설정
    setSimulationResult({
      initialSales: selectedNFT.currentSales,
      newSales,
      initialPoints: selectedTierResult.currentPoints,
      newPoints: selectedTierResult.newPoints,
      pointsIncrease: selectedTierResult.increase,
      growthRate: selectedTierResult.growthRate
    });
    
    // 포인트 애니메이션
    Animated.timing(pointsAnim, {
      toValue: selectedTierResult.newPoints,
      duration: 1500,
      useNativeDriver: false
    }).start();
  };
  
  // 차트 데이터 생성
  const getChartData = () => {
    if (!selectedNFT || !tierComparisonData.length) return null;
    
    // 판매량 범위 (현재 ~ 새 판매량 또는 현재 + 10000)
    const startSales = selectedNFT.currentSales;
    const endSales = simulationResult ? simulationResult.newSales : startSales + 10000;
    
    // 판매량 포인트 5개 생성
    const salesPoints = [];
    const step = Math.ceil((endSales - startSales) / 4);
    
    for (let i = 0; i <= 4; i++) {
      salesPoints.push(startSales + (i * step));
    }
    
    // 티어별 데이터셋 생성
    const datasets = Object.keys(TIERS).map(tier => {
      // 각 판매량 지점에서의 포인트 계산
      const pointsData = salesPoints.map(sales => 
        calculateTierPointsIncrease(
          tier,
          selectedNFT.initialSales,
          selectedNFT.currentSales,
          sales
        ).newPoints
      );
      
      return {
        data: pointsData,
        color: TIERS[tier].color,
        strokeWidth: tier === selectedNFT.tier ? 3 : 1,
        strokeDashArray: tier === selectedNFT.tier ? [] : [5, 5]
      };
    });
    
    return {
      labels: salesPoints.map(sales => `${Math.floor(sales / 1000)}K`),
      datasets,
      legend: Object.keys(TIERS).map(tier => TIERS[tier].displayName)
    };
  };
  
  // 현재 포인트 값을 고정으로 표시하기 위해 애니메이션 제거
  const renderCurrentPoints = (points) => {
    return points.toFixed(1);
  };

  // NFT 카드 렌더링 함수
  const renderNFTCard = (nft) => {
    const artist = ARTISTS[nft.artistId];
    const tierInfo = TIERS[nft.tier];
    
    // 아티스트별 이미지 선택
    let memberImage;
    if (nft.artistId === 'gidle') {
      // 여자아이들의 경우 멤버 이미지 사용
      const member = artist.members.find(m => m.id === nft.memberId) || artist.members[0];
      memberImage = member.image;
    } else if (nft.artistId === 'bibi') {
      // 비비의 경우 프로필 이미지 사용
      memberImage = artist.groupImage;
    } else if (nft.artistId === 'chanwon') {
      // 이찬원의 경우 프로필 이미지 사용
      memberImage = artist.groupImage;
    }
    
    // 티어별 프레임 이미지 선택
    const frameImage = TIER_FRAMES[nft.tier];
    
    // 아티스트별 설명 텍스트
    let description = nft.description;
    if (!description) {
      if (nft.artistId === 'gidle') {
        description = '여자아이들의 특별한 순간을 기념하는 한정판 주화 NFT입니다.';
      } else if (nft.artistId === 'bibi') {
        description = '비비의 독특한 음악 세계를 담은 한정판 주화 NFT입니다.';
      } else if (nft.artistId === 'chanwon') {
        description = '이찬원의 감성적인 트로트 음악과 국민가수로서의 성장을 담은 한정판 주화 NFT입니다.';
      }
    }
    
    return (
      <View style={styles.nftCardContainer}>
        <View style={styles.nftImageContainer}>
          <Image 
            source={memberImage}
            style={styles.nftImage}
            resizeMode="cover"
          />
          <Image 
            source={frameImage}
            style={styles.nftFrame}
            resizeMode="contain"
          />
        </View>
        <View style={styles.nftInfo}>
          <Text style={styles.nftName}>{nft.name}</Text>
          <Text style={styles.nftDescription}>{description}</Text>
          <Text style={styles.nftTier}>
            {tierInfo.displayName} 티어
          </Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsLabel}>현재 포인트:</Text>
            <Text style={styles.pointsValue}>{renderCurrentPoints(nft.currentPoints)}</Text>
          </View>
        </View>
      </View>
    );
  };

  // NFT 선택 모달을 아티스트별로 그룹화하여 표시하는 함수
  const renderGroupedNFTSelector = () => {
    // 아티스트별로 NFT 그룹화
    const groupedNFTs = {};
    userNFTs.forEach(nft => {
      if (!groupedNFTs[nft.artistId]) {
        groupedNFTs[nft.artistId] = [];
      }
      groupedNFTs[nft.artistId].push(nft);
    });
    
    return (
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>NFT 선택</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowNFTSelector(false)}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.nftSelectorScrollView}>
          {Object.keys(groupedNFTs).map(artistId => {
            const artist = ARTISTS[artistId];
            const artistNFTs = groupedNFTs[artistId];
            
            return (
              <View key={artistId} style={styles.artistGroup}>
                <View style={styles.artistHeader}>
                  <Text style={styles.artistName}>{artist.name}</Text>
                </View>
                
                {artistNFTs.map(nft => (
                  <TouchableOpacity
                    key={nft.id}
                    style={[
                      styles.nftSelectorItem,
                      selectedNFT?.id === nft.id && styles.selectedNFTItem
                    ]}
                    onPress={() => handleSelectNFT(nft)}
                  >
                    <View style={styles.nftSelectorInfo}>
                      <Text style={styles.nftSelectorName}>{nft.name}</Text>
                      <Text style={styles.nftSelectorTier}>
                        {TIERS[nft.tier].displayName} 티어
                      </Text>
                      <Text style={styles.nftSelectorPoints}>
                        현재 포인트: {nft.currentPoints.toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.nftSelectorArrow}>
                      <Text style={styles.nftSelectorArrowText}>→</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>판매량-포인트 시뮬레이션</Text>
          <Text style={styles.headerSubtitle}>NFT 가치 성장 메커니즘 시연</Text>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>NFT 데이터 로딩 중...</Text>
          </View>
        ) : userNFTs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>시뮬레이션할 NFT가 없습니다.</Text>
            <Text style={styles.emptySubtext}>먼저 테스트 데이터를 생성해주세요.</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>돌아가기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* NFT 선택 영역 */}
            <View style={styles.nftSelectContainer}>
              {selectedNFT && renderNFTCard(selectedNFT)}
              
              <TouchableOpacity
                style={styles.changeNFTButton}
                onPress={() => setShowNFTSelector(true)}
              >
                <Text style={styles.changeNFTButtonText}>NFT 변경</Text>
              </TouchableOpacity>
            </View>
            
            {/* 판매량 시뮬레이션 영역 */}
            <View style={styles.simulationContainer}>
              <Text style={styles.sectionTitle}>판매량 설정</Text>
              
              <View style={styles.salesInputContainer}>
                <Text style={styles.salesInputLabel}>판매량:</Text>
                <TextInput
                  style={styles.salesInput}
                  value={salesInput}
                  onChangeText={handleSalesInputChange}
                  keyboardType="numeric"
                  placeholder="판매량 입력"
                />
                <Text style={styles.salesInputUnit}>개</Text>
              </View>
              
              <View style={styles.incrementButtonsRow}>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => handleSalesIncrement(1000)}
                >
                  <Text style={styles.incrementButtonText}>+1,000</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => handleSalesIncrement(5000)}
                >
                  <Text style={styles.incrementButtonText}>+5,000</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => handleSalesIncrement(10000)}
                >
                  <Text style={styles.incrementButtonText}>+10,000</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.simulateButton}
                onPress={runSimulation}
              >
                <Text style={styles.simulateButtonText}>시뮬레이션 실행</Text>
              </TouchableOpacity>
            </View>
            
            {/* 시뮬레이션 결과 */}
            {simulationResult && (
              <View style={styles.resultContainer}>
                <Text style={styles.sectionTitle}>시뮬레이션 결과</Text>
                
                <View style={styles.resultCard}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>판매량 변화:</Text>
                    <Text style={styles.resultValue}>
                      {simulationResult.initialSales.toLocaleString()} → {simulationResult.newSales.toLocaleString()}개
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>포인트 변화:</Text>
                    <Text style={styles.resultValue}>
                      {simulationResult.initialPoints.toFixed(1)} → {simulationResult.newPoints.toFixed(1)}
                      <Text style={styles.pointsIncrease}>
                        {` (+${simulationResult.pointsIncrease.toFixed(1)})`}
                      </Text>
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>성장률:</Text>
                    <Text style={[
                      styles.resultValue,
                      { color: parseFloat(simulationResult.growthRate) > 0 ? COLORS.success : COLORS.error }
                    ]}>
                      {simulationResult.growthRate}%
                    </Text>
                  </View>
                </View>
                
                {/* 티어별 비교 표 */}
                <Text style={styles.tableTitle}>티어별 포인트 비교</Text>
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderCell}>티어</Text>
                    <Text style={styles.tableHeaderCell}>초기 포인트</Text>
                    <Text style={styles.tableHeaderCell}>새 포인트</Text>
                    <Text style={styles.tableHeaderCell}>증가율</Text>
                  </View>
                  
                  {tierComparisonData.map(item => (
                    <View 
                      key={item.tier}
                      style={[
                        styles.tableRow,
                        item.isSelected && { backgroundColor: item.color + '20' }
                      ]}
                    >
                      <Text style={[
                        styles.tableCell,
                        item.isSelected && { fontWeight: 'bold', color: item.color }
                      ]}>
                        {item.name}
                      </Text>
                      <Text style={[
                        styles.tableCell,
                        item.isSelected && { fontWeight: 'bold' }
                      ]}>
                        {item.currentPoints.toFixed(1)}
                      </Text>
                      <Text style={[
                        styles.tableCell,
                        item.isSelected && { fontWeight: 'bold' }
                      ]}>
                        {item.newPoints.toFixed(1)}
                      </Text>
                      <Text style={[
                        styles.tableCell,
                        { color: parseFloat(item.growthRate) > 0 ? COLORS.success : COLORS.error },
                        item.isSelected && { fontWeight: 'bold' }
                      ]}>
                        {item.growthRate}%
                      </Text>
                    </View>
                  ))}
                </View>
                
                {/* 비즈니스 인사이트 */}
                <View style={styles.insightsContainer}>
                  <Text style={styles.insightsTitle}>비즈니스 인사이트</Text>
                  
                  <View style={styles.insightItem}>
                    <Text style={styles.insightHeader}>초기 구매자 보상</Text>
                    <Text style={styles.insightText}>
                      Founders 티어(1~100번)는 일반 Fan 티어(1000번 이후)보다 
                      동일한 판매량 증가에도 최대 15배 높은 포인트 성장률을 가집니다.
                    </Text>
                  </View>
                  
                  <View style={styles.insightItem}>
                    <Text style={styles.insightHeader}>자발적 홍보 유도</Text>
                    <Text style={styles.insightText}>
                      NFT 가치가 판매량과 연동되어 자동 상승함으로써, 
                      팬들이 자발적으로 굿즈를 홍보하도록 동기를 부여합니다.
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* NFT 선택 모달 */}
      <Modal
        visible={showNFTSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNFTSelector(false)}
      >
        <View style={styles.modalContainer}>
          {renderGroupedNFTSelector()}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  backButton: {
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nftCardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
  },
  nftImageContainer: {
    width: 150,
    height: 150,
    position: 'relative',
    marginRight: 16,
  },
  nftFrame: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  nftImage: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: '5%',
  },
  nftInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nftName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nftDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic'
  },
  nftTier: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: '#666',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  changeNFTButton: {
    backgroundColor: COLORS.primary + '20',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  changeNFTButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  salesInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  salesInputLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  salesInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  salesInputUnit: {
    fontSize: 16,
    marginLeft: 8,
  },
  incrementButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  incrementButton: {
    backgroundColor: COLORS.primary + '20',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  incrementButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  simulateButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  simulateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsIncrease: {
    color: COLORS.success,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chartWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  axisLabel: {
    position: 'absolute',
    fontSize: 12,
    color: '#666',
    width: 50,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  insightsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightItem: {
    marginBottom: 16,
  },
  insightHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  nftSelectorList: {
    padding: 16,
  },
  nftSelectorItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  selectedNFTItem: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  nftSelectorInfo: {
    flex: 1,
  },
  nftSelectorName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nftSelectorArtist: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  nftSelectorTier: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  nftSelectorPoints: {
    fontSize: 12,
    color: '#666',
  },
  nftSelectorArrow: {
    padding: 4,
  },
  nftSelectorArrowText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  nftSelectorHeader: {
    padding: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    marginBottom: 16,
  },
  nftSelectorHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  nftSelectorSeparator: {
    height: 8,
  },
  artistGroup: {
    marginBottom: 24,
  },
  artistHeader: {
    padding: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    marginBottom: 12,
  },
  artistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  nftSelectorScrollView: {
    flex: 1,
  },
});

export default SalesSimulationScreen;