// components/simulation/ChartComponent.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

/**
 * 간단한 선 그래프 컴포넌트
 * 
 * @param {object} data - 차트 데이터 객체 
 * @param {number} width - 차트 너비
 * @param {number} height - 차트 높이
 * @param {number} padding - 패딩
 */
const ChartComponent = ({ 
  data, 
  width = Dimensions.get('window').width - 32, 
  height = 200,
  padding = 32
}) => {
  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>데이터가 없습니다</Text>
      </View>
    );
  }
  
  // 차트 영역 계산
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  // 최대/최소값 찾기
  const allValues = data.datasets.flatMap(dataset => dataset.data);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  
  // 값 범위가 너무 작으면 조정
  const valueRange = Math.max(maxValue - minValue, 1);
  
  // Y축 값 계산 (5개의 눈금)
  const yAxisValues = Array.from({ length: 5 }, (_, i) => 
    minValue + (valueRange / 4) * i
  );
  
  // 각 데이터셋에 대한 경로 생성
  const createPath = (dataset) => {
    const points = dataset.data.map((value, index) => {
      // x, y 좌표 계산
      const x = padding + (chartWidth / (dataset.data.length - 1)) * index;
      const y = height - padding - ((value - minValue) / valueRange) * chartHeight;
      return { x, y };
    });
    
    // SVG Path 문자열 생성
    let pathString = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathString += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return {
      path: pathString,
      points,
      color: dataset.color || COLORS.primary
    };
  };
  
  const pathData = data.datasets.map(createPath);
  
  return (
    <View style={[styles.container, { width, height }]}>
      {/* 그리드 라인 (배경) */}
      <Svg width={width} height={height}>
        {/* 수평선 */}
        {yAxisValues.map((value, index) => {
          const y = height - padding - (chartHeight / 4) * index;
          return (
            <Line 
              key={`h-line-${index}`}
              x1={padding} 
              y1={y} 
              x2={width - padding} 
              y2={y} 
              stroke="#e0e0e0" 
              strokeWidth="1" 
            />
          );
        })}
        
        {/* 수직선 */}
        {data.labels.map((_, index) => {
          const x = padding + (chartWidth / (data.labels.length - 1)) * index;
          return (
            <Line 
              key={`v-line-${index}`}
              x1={x} 
              y1={padding} 
              x2={x} 
              y2={height - padding} 
              stroke="#e0e0e0" 
              strokeWidth="1" 
            />
          );
        })}
        
        {/* Y축 라벨 */}
        {yAxisValues.map((value, index) => {
          const y = height - padding - (chartHeight / 4) * index;
          return (
            <SvgText 
              key={`y-label-${index}`}
              x={padding - 8} 
              y={y + 4} 
              fontSize="10" 
              fill="#666" 
              textAnchor="end"
            >
              {value.toFixed(1)}
            </SvgText>
          );
        })}
        
        {/* X축 라벨 */}
        {data.labels.map((label, index) => {
          const x = padding + (chartWidth / (data.labels.length - 1)) * index;
          return (
            <SvgText 
              key={`x-label-${index}`}
              x={x} 
              y={height - padding + 16} 
              fontSize="10" 
              fill="#666" 
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
        
        {/* 각 데이터셋의 라인 */}
        {pathData.map((dataset, datasetIndex) => (
          <React.Fragment key={`dataset-${datasetIndex}`}>
            <Path 
              d={dataset.path} 
              fill="none" 
              stroke={dataset.color} 
              strokeWidth={data.datasets[datasetIndex].strokeWidth || 2} 
              strokeDasharray={data.datasets[datasetIndex].strokeDashArray || ''} 
            />
            
            {/* 데이터 포인트 */}
            {dataset.points.map((point, pointIndex) => (
              <Circle 
                key={`point-${datasetIndex}-${pointIndex}`}
                cx={point.x} 
                cy={point.y} 
                r={(data.datasets[datasetIndex].strokeWidth || 2) + 1} 
                fill={dataset.color} 
              />
            ))}
          </React.Fragment>
        ))}
      </Svg>
      
      {/* 범례 */}
      {data.legend && (
        <View style={styles.legendContainer}>
          {data.legend.map((label, index) => (
            <View key={`legend-${index}`} style={styles.legendItem}>
              <View 
                style={[
                  styles.legendColor, 
                  { backgroundColor: data.datasets[index]?.color || COLORS.primary }
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 80,
    color: '#666',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  }
});

export default ChartComponent;