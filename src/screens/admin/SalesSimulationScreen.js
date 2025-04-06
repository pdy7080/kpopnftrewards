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
  },
  chanwon: {
    chanwon: require('../../assets/artists/chanwon/profile.jpg'),
  },
};

// NFT 이름 생성
const getNFTName = (artistId, memberId) => {
  const events = {
    gidle: [
      'I-LAND 월드투어 기념 주화',
      '네버랜드 5주년 기념 주화',
      '퀸덤2 우승 기념 주화',
      '토마토소스 뮤직비디오 기념 주화',
    ],
    bibi: [
      '휴먼 앨범 발매 기념 주화',
      '아시아 투어 기념 주화',
      'BIBI UNIVERSE 콘서트 주화',
      'KAZINO 5억뷰 기념 주화',
    ],
    chanwon: [
      '미스터트롯 기념 주화',
      '첫 단독 콘서트 기념 주화',
      '국민가수 시즌1 주화',
      '신곡 우리 둘이 발매 기념 주화',
    ],
  };

  const eventList = events[artistId] || events.gidle;
  const randomIndex = Math.floor(Math.random() * eventList.length);
  return `${eventList[randomIndex]} NFT`;
};

const SalesSimulationScreen = ({ navigation }) => {
  const { userNFTs } = useNFTContext();
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [salesInput, setSalesInput] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const pointsAnim = useRef(new Animated.Value(0)).current;
  const [tierComparisonData, setTierComparisonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (userNFTs.length > 0 && !selectedNFT) {
      setSelectedNFT(userNFTs[0]);
      setSalesInput(userNFTs[0].currentSales.toString());
    }
  }, [userNFTs]);
  
  // NFT 이미지 가져오기
  const getNFTImage = () => {
    if (!selectedNFT) return require('../../assets/images/placeholder.png');
    
    try {
      return MEMBER_IMAGES[selectedNFT.artistId]?.[selectedNFT.memberId] || 
             require('../../assets/images/placeholder.png');
    } catch (error) {
      console.error('NFT 이미지 로드 오류:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>판매량-포인트 시뮬레이션</Text>
        
        {selectedNFT && (
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
                      {TIERS[selectedNFT.tier].displayName}
                    </Text>
                  </View>
                  
                  <Text style={styles.nftTitle}>
                    {selectedNFT.artistId === 'gidle' ? '여자아이들' :
                     selectedNFT.artistId === 'bibi' ? '비비' : '이찬원'}
                    {' - '}
                    {getNFTName(selectedNFT.artistId, selectedNFT.memberId)}
                  </Text>
                  
                  <Text style={styles.nftSubtitle}>
                    구매 순번: #{selectedNFT.initialSales}
                  </Text>
                  
                  <Animated.Text style={styles.pointsText}>
                    현재 포인트: {selectedNFT.currentPoints.toFixed(1)}
                  </Animated.Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

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
      </ScrollView>
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
});

export default SalesSimulationScreen;