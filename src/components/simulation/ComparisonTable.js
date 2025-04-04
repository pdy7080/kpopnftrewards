// components/simulation/ComparisonTable.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * 비교 테이블 컴포넌트
 * 
 * @param {Array} headers - 헤더 제목 배열
 * @param {Array} rows - 행 데이터 배열
 * @param {number} highlightRowIndex - 강조할 행 인덱스
 * @param {string} highlightColor - 강조 색상
 * @param {object} style - 추가 스타일
 */
const ComparisonTable = ({ 
  headers = [], 
  rows = [], 
  highlightRowIndex = -1,
  highlightColor = COLORS.primary,
  style
}) => {
  // 데이터 검증
  if (headers.length === 0 || rows.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.noDataText}>데이터가 없습니다</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* 헤더 행 */}
          <View style={styles.headerRow}>
            {headers.map((header, index) => (
              <View 
                key={`header-${index}`} 
                style={[
                  styles.headerCell,
                  index === 0 && styles.firstColumn
                ]}
              >
                <Text style={styles.headerText}>{header}</Text>
              </View>
            ))}
          </View>
          
          {/* 데이터 행 */}
          {rows.map((row, rowIndex) => (
            <View 
              key={`row-${rowIndex}`} 
              style={[
                styles.dataRow,
                rowIndex === highlightRowIndex && { backgroundColor: `${highlightColor}15` },
                rowIndex % 2 === 1 && styles.alternateRow
              ]}
            >
              {row.map((cell, cellIndex) => (
                <View 
                  key={`cell-${rowIndex}-${cellIndex}`} 
                  style={[
                    styles.dataCell,
                    cellIndex === 0 && styles.firstColumn
                  ]}
                >
                  <Text 
                    style={[
                      styles.dataCellText,
                      rowIndex === highlightRowIndex && { fontWeight: 'bold' },
                      typeof cell === 'object' && cell.style
                    ]}
                  >
                    {typeof cell === 'object' ? cell.value : cell}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  noDataText: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  headerCell: {
    padding: 12,
    width: 100,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  firstColumn: {
    width: 120,
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
  },
  alternateRow: {
    backgroundColor: '#f9f9f9',
  },
  dataCell: {
    padding: 12,
    width: 100,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dataCellText: {
    textAlign: 'center',
  }
});

export default ComparisonTable;