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
import NFTCard from '../../components/nft/NFTCard';
import { COLORS } from '../../constants/colors';
import { TIERS } from '../../constants/tiers';
import { ARTISTS } from '../../constants/artists';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useNFTContext } from '../../contexts/NFTContext';

// Animated FlatList 생성
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// 화면 너비 가져오기
const { width } = Dimensions.get('window');

// 간단한 선 그래프 컴포넌트
const LineChartComponent = ({ data, width, height, paddingVertical = 20, paddingHorizontal = 40 }) => {
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

// 아티스트별 멤버 이미지 매핑 수정
const MEMBER_IMAGES = {
  gidle: {
    miyeon: require('../../assets/artists/gidle/members/miyeon.jpg'),
    minnie: require('../../assets/artists/gidle/members/minnie.jpg'),
    soyeon: require('../../assets/artists/gidle/members/soyeon.jpg'),
    yuqi: require('../../assets/artists/gidle/members/yuqi.jpg'),
    shuhua: require('../../assets/artists/gidle/members/shuhua.jpg'),
    group: require('../../assets/artists/gidle/group.jpg')
  },
  bibi: {
    bibi: require('../../assets/artists/bibi/profile.jpg'),
    bibi1: require('../../assets/artists/bibi/profile1.jpg'),
    bibi2: require('../../assets/artists/bibi/profile2.jpg'),
    bibi3: require('../../assets/artists/bibi/profile3.jpg'),
  },
  chanwon: {
    chanwon: require('../../assets/artists/chanwon/profile.jpg'),
    chanwon1: require('../../assets/artists/chanwon/profile1.jpg'),
    chanwon2: require('../../assets/artists/chanwon/profile2.jpg'),
    chanwon3: require('../../assets/artists/chanwon/profile3.jpg'),
  }
};

// NFT 이벤트 데이터
const NFT_EVENTS = {
  gidle: [
    '토마토소스 뮤직비디오 기념주화',
    'I-LAND 월드투어 기념주화',
    '네버랜드 5주년 기념주화',
    '퀸덤2 우승 기념주화'
  ],
  bibi: [
    '휴먼 앨범 발매 기념주화',
    '아시아 투어 기념주화',
    'BIBI UNIVERSE 콘서트 주화',
    'KAZINO 5억뷰 기념주화'
  ],
  chanwon: [
    '미스터트롯 기념주화',
    '첫 단독 콘서트 기념주화',
    '국민가수 시즌1 주화',
    '신곡 우리 둘이 발매 기념주화'
  ]
};

// NFT 이름 생성 함수 수정
const getNFTName = (artistId, eventIndex = 0) => {
  const events = NFT_EVENTS[artistId] || NFT_EVENTS.gidle;
  return `${events[eventIndex % events.length]} NFT`;
};

const SalesSimulationScreen = ({ navigation, route }) => {
  const { userNFTs } = useNFTContext();
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [salesInput, setSalesInput] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const [tierComparisonData, setTierComparisonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNFTSelector, setShowNFTSelector] = useState(false);
  
  // 현재 선택된 아티스트의 NFT만 필터링
  const currentArtistId = route.params?.artistId || 'gidle';
  const filteredNFTs = userNFTs.filter(nft => nft.artistId === currentArtistId);
  
  useEffect(() => {
    if (filteredNFTs.length > 0 && !selectedNFT) {
      const initialNFT = filteredNFTs[0];
      setSelectedNFT(initialNFT);
      setSalesInput(initialNFT.initialSales?.toString() || '0');
      pointsAnim.setValue(initialNFT.currentPoints || 0);
    }
    setIsLoading(false);
  }, [filteredNFTs]);
  
  // NFT 이미지 가져오기 함수 수정
  const getNFTImage = () => {
    try {
      // NFT가 없는 경우
      if (!selectedNFT) {
        console.warn('선택된 NFT가 없음');
        return require('../../assets/images/placeholder.png');
      }

      // artistId 검증
      if (!selectedNFT.artistId) {
        console.warn('아티스트 ID가 없음:', selectedNFT);
        return require('../../assets/images/placeholder.png');
      }

      // 아티스트 이미지 매핑 검증
      const artistImages = MEMBER_IMAGES[selectedNFT.artistId];
      if (!artistImages) {
        console.warn('아티스트 이미지 매핑을 찾을 수 없음:', selectedNFT.artistId);
        return require('../../assets/images/placeholder.png');
      }

      // memberId 검증
      if (!selectedNFT.memberId) {
        console.warn('멤버 ID가 없음. 그룹 이미지 사용:', selectedNFT);
        return artistImages.group;
      }

      // 멤버 이미지 검증
      const memberImage = artistImages[selectedNFT.memberId];
      if (!memberImage) {
        console.warn('멤버 이미지를 찾을 수 없음. 그룹 이미지 사용:', {
          artistId: selectedNFT.artistId,
          memberId: selectedNFT.memberId,
          availableMembers: Object.keys(artistImages)
        });
        return artistImages.group;
      }

      return memberImage;
    } catch (error) {
      console.error('이미지 로드 오류:', error, selectedNFT);
      return require('../../assets/images/placeholder.png');
    }
  };

  // 프레임 이미지 가져오기 함수 수정
  const getFrameImage = () => {
    try {
      if (!selectedNFT) return TIER_FRAMES.fan;
      return TIER_FRAMES[selectedNFT.tier] || TIER_FRAMES.fan;
    } catch (error) {
      console.warn('프레임 이미지 로드 오류:', error);
      return TIER_FRAMES.fan;
    }
  };
  
  // 티어별 포인트 상승률 계산 함수 수정
  const calculateTierPointsIncrease = (tier, initialSales, currentSales, newSales) => {
    // 기본값 설정
    initialSales = initialSales || 0;
    currentSales = currentSales || 0;
    newSales = newSales || 0;

    // 티어별 설정
    const basePoints = TIERS[tier].initialPoints || 0;
    const milestoneSize = tier === 'fan' ? 500 : 100;
    
    // 티어별 포인트 증가율 차별화
    const pointsPerMilestone = 
      tier === 'founders' ? 3 :    // Founders: 가장 높은 성장률
      tier === 'earlybird' ? 2 :   // Early Bird: 중상위 성장률
      tier === 'supporter' ? 1 :   // Supporter: 중위 성장률
      0.5;                         // Fan: 기본 성장률

    // 추가 보너스 포인트 (티어별 차등)
    const tierBonus = 
      tier === 'founders' ? 0.5 :   // Founders: 50% 추가 보너스
      tier === 'earlybird' ? 0.3 :  // Early Bird: 30% 추가 보너스
      tier === 'supporter' ? 0.2 :  // Supporter: 20% 추가 보너스
      0.1;                          // Fan: 10% 추가 보너스
    
    // 현재 포인트 계산
    const currentSalesIncrease = Math.max(0, currentSales - initialSales);
    const currentMilestoneCount = Math.floor(currentSalesIncrease / milestoneSize);
    const currentAdditionalPoints = currentMilestoneCount * pointsPerMilestone;
    const currentBonusPoints = currentAdditionalPoints * tierBonus;
    const currentPoints = basePoints + currentAdditionalPoints + currentBonusPoints;
    
    // 새 포인트 계산
    const newSalesIncrease = Math.max(0, newSales - initialSales);
    const newMilestoneCount = Math.floor(newSalesIncrease / milestoneSize);
    const newAdditionalPoints = newMilestoneCount * pointsPerMilestone;
    const newBonusPoints = newAdditionalPoints * tierBonus;
    const newPoints = basePoints + newAdditionalPoints + newBonusPoints;

    // 성장률 계산 (0으로 나누기 방지)
    const growthRate = currentPoints > 0 
      ? ((newPoints - currentPoints) / currentPoints * 100).toFixed(1)
      : '0.0';
    
    return {
      initialPoints: basePoints,
      currentPoints: Number(currentPoints.toFixed(1)),
      newPoints: Number(newPoints.toFixed(1)),
      increase: Number((newPoints - currentPoints).toFixed(1)),
      growthRate,
      milestoneCount: newMilestoneCount,
      bonusPoints: Number(newBonusPoints.toFixed(1))
    };
  };
  
  // 시뮬레이션 실행 함수 수정
  const runSimulation = () => {
    if (!selectedNFT) return;
    
    const newSales = parseInt(salesInput) || 0;
    const currentSales = selectedNFT.currentSales || 0;
    const initialSales = selectedNFT.initialSales || 0;
    
    // 판매량이 현재 판매량과 같으면 시뮬레이션 불필요
    if (newSales === currentSales) {
      return;
    }
    
    // 티어별 비교 데이터 생성
    const comparisonData = Object.keys(TIERS).map(tier => {
      const result = calculateTierPointsIncrease(
        tier,
        initialSales,
        currentSales,
        newSales
      );
      
      return {
        tier,
        name: TIERS[tier].name,
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
    
    if (selectedTierResult) {
      setSimulationResult({
        initialSales: currentSales,
        newSales,
        initialPoints: selectedTierResult.initialPoints,
        newPoints: selectedTierResult.newPoints,
        pointsIncrease: selectedTierResult.increase,
        growthRate: selectedTierResult.growthRate,
        milestoneCount: selectedTierResult.milestoneCount,
        bonusPoints: selectedTierResult.bonusPoints
      });
      
      // 포인트 애니메이션
      Animated.timing(pointsAnim, {
        toValue: selectedTierResult.newPoints,
        duration: 1500,
        useNativeDriver: false
      }).start();
    }
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

  // 시뮬레이션 결과 표시 컴포넌트 추가
  const SimulationInsights = ({ result, tierData }) => {
    if (!result) return null;

    return (
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>투자 가치 분석</Text>
        
        <View style={styles.insightItem}>
          <Text style={styles.insightHeader}>초기 구매자 보상</Text>
          <Text style={styles.insightText}>
            {`Founders 티어는 Fan 티어 대비 ${(tierData.find(t => t.tier === 'founders').growthRate / tierData.find(t => t.tier === 'fan').growthRate).toFixed(1)}배 높은 성장률을 보입니다.`}
          </Text>
        </View>
        
        <View style={styles.insightItem}>
          <Text style={styles.insightHeader}>마일스톤 달성</Text>
          <Text style={styles.insightText}>
            {`현재까지 ${result.milestoneCount}개의 마일스톤을 달성했으며, 추가 보너스 포인트 ${result.bonusPoints}P가 적립되었습니다.`}
          </Text>
        </View>
        
        <View style={styles.insightItem}>
          <Text style={styles.insightHeader}>장기 투자 가치</Text>
          <Text style={styles.insightText}>
            판매량이 증가할수록 NFT의 가치가 자동으로 상승하며, 상위 티어일수록 더 높은 성장률을 보입니다.
          </Text>
        </View>
      </View>
    );
  };

  // NFT 선택 모달에서도 필터링된 NFT 사용
  const renderNFTSelector = () => (
    <Modal
      visible={showNFTSelector}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowNFTSelector(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {currentArtistId === 'gidle' ? '여자아이들' :
             currentArtistId === 'bibi' ? '비비' : '이찬원'} NFT 선택
          </Text>
          
          <FlatList
            data={filteredNFTs}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.nftSelectItem}
                onPress={() => {
                  setSelectedNFT(item);
                  setSalesInput(item.initialSales?.toString() || '0');
                  setShowNFTSelector(false);
                }}
              >
                <NFTCard nft={item} size="small" />
              </TouchableOpacity>
            )}
          />
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowNFTSelector(false)}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedNFT) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>시뮬레이션할 NFT가 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>판매량-포인트 시뮬레이션</Text>
        
        <View style={styles.nftContainer}>
          <LinearGradient
            colors={[TIERS[selectedNFT.tier].color + '40', TIERS[selectedNFT.tier].color + '80']}
            style={styles.nftGradient}
          >
            <View style={styles.nftCard}>
              <View style={styles.nftImageContainer}>
                <Image source={getFrameImage()} style={styles.frameImage} />
                <Image source={getNFTImage()} style={styles.nftImage} />
              </View>
              
              <View style={styles.nftInfo}>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>
                    {TIERS[selectedNFT.tier].name}
                  </Text>
                </View>
                
                <Text style={styles.nftTitle}>
                  {selectedNFT.name || `${
                    selectedNFT.artistId === 'gidle' ? '여자아이들' :
                    selectedNFT.artistId === 'bibi' ? '비비' : '이찬원'
                  } ${selectedNFT.memberId}`}
                </Text>
                
                <Text style={styles.nftSubtitle}>
                  구매 순번: #{selectedNFT.initialSales || selectedNFT.purchaseOrder || 0}
                </Text>
                
                <Text style={styles.pointsText}>
                  현재 포인트: {(selectedNFT.currentPoints || 0).toFixed(1)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.simulationContainer}>
          <Text style={styles.sectionTitle}>판매량 설정</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={salesInput}
              onChangeText={text => setSalesInput(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="판매량 입력"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputUnit}>개</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.incrementButton}
              onPress={() => setSalesInput(((parseInt(salesInput) || 0) + 1000).toString())}
            >
              <Text style={styles.buttonText}>+1,000</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.incrementButton}
              onPress={() => setSalesInput(((parseInt(salesInput) || 0) + 5000).toString())}
            >
              <Text style={styles.buttonText}>+5,000</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.incrementButton}
              onPress={() => setSalesInput(((parseInt(salesInput) || 0) + 10000).toString())}
            >
              <Text style={styles.buttonText}>+10,000</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.simulateButton}
            onPress={runSimulation}
          >
            <Text style={styles.simulateButtonText}>시뮬레이션 실행</Text>
          </TouchableOpacity>
        </View>

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

            <SimulationInsights 
              result={simulationResult}
              tierData={tierComparisonData}
            />
            
            <View style={styles.pointsHistoryContainer}>
              <Text style={styles.sectionTitle}>포인트 변경 내역</Text>
              
              <View style={styles.pointsHistoryCard}>
                <View style={styles.pointsHistoryRow}>
                  <Text style={styles.pointsHistoryLabel}>구매 순번:</Text>
                  <Text style={styles.pointsHistoryValue}>#{selectedNFT.initialSales || selectedNFT.purchaseOrder || 0}</Text>
                </View>
                
                <View style={styles.pointsHistoryRow}>
                  <Text style={styles.pointsHistoryLabel}>초기 포인트:</Text>
                  <Text style={styles.pointsHistoryValue}>{selectedNFT.initialPoints.toFixed(1)} P</Text>
                </View>
                
                <View style={styles.pointsHistoryRow}>
                  <Text style={styles.pointsHistoryLabel}>현재 판매량:</Text>
                  <Text style={styles.pointsHistoryValue}>{selectedNFT.currentSales.toLocaleString()}개</Text>
                </View>
                
                <View style={styles.pointsHistoryRow}>
                  <Text style={styles.pointsHistoryLabel}>현재 포인트:</Text>
                  <Text style={styles.pointsHistoryValue}>{selectedNFT.currentPoints.toFixed(1)} P</Text>
                </View>
                
                {simulationResult && (
                  <>
                    <View style={styles.pointsHistoryDivider} />
                    
                    <View style={styles.pointsHistoryRow}>
                      <Text style={styles.pointsHistoryLabel}>시뮬레이션 판매량:</Text>
                      <Text style={styles.pointsHistoryValue}>{simulationResult.newSales.toLocaleString()}개</Text>
                    </View>
                    
                    <View style={styles.pointsHistoryRow}>
                      <Text style={styles.pointsHistoryLabel}>시뮬레이션 포인트:</Text>
                      <Text style={styles.pointsHistoryValue}>{simulationResult.newPoints.toFixed(1)} P</Text>
                    </View>
                    
                    <View style={styles.pointsHistoryRow}>
                      <Text style={styles.pointsHistoryLabel}>포인트 증가:</Text>
                      <Text style={[styles.pointsHistoryValue, { color: COLORS.success }]}>
                        +{simulationResult.pointsIncrease.toFixed(1)} P
                      </Text>
                    </View>
                    
                    <View style={styles.pointsHistoryRow}>
                      <Text style={styles.pointsHistoryLabel}>성장률:</Text>
                      <Text style={[styles.pointsHistoryValue, { color: COLORS.success }]}>
                        {simulationResult.growthRate}%
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      {renderNFTSelector()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    margin: 20,
    marginBottom: 16,
  },
  nftContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  nftGradient: {
    borderRadius: 20,
    padding: 2,
  },
  nftCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
  },
  nftImageContainer: {
    width: 100,
    height: 140,
    position: 'relative',
    marginRight: 16,
  },
  frameImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  nftImage: {
    width: '90%',
    height: '90%',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: '5%',
  },
  nftInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tierBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tierText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  nftTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nftSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  simulationContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  inputUnit: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  incrementButton: {
    flex: 1,
    backgroundColor: COLORS.primary + '20',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  simulateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  simulateButtonText: {
    color: 'white',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  nftSelectItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsHistoryContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  pointsHistoryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pointsHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pointsHistoryLabel: {
    fontSize: 14,
    color: '#666',
  },
  pointsHistoryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  pointsHistoryDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
});

export default SalesSimulationScreen;