// components/common/Header.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

/**
 * 공통 헤더 컴포넌트
 * 
 * @param {string} title - 헤더 제목
 * @param {boolean} showBack - 뒤로가기 버튼 표시 여부
 * @param {function} onBackPress - 뒤로가기 버튼 클릭 핸들러 (지정하지 않으면 기본 뒤로가기)
 * @param {ReactNode} rightComponent - 오른쪽에 표시할 컴포넌트
 * @param {string} backgroundColor - 배경색 (기본값: COLORS.primary)
 * @param {string} textColor - 텍스트 색상 (기본값: white)
 */
const Header = ({ 
  title, 
  showBack = false, 
  onBackPress, 
  rightComponent, 
  backgroundColor = COLORS.primary, 
  textColor = 'white' 
}) => {
  const navigation = useNavigation();
  
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };
  
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      
      <View style={styles.rightContainer}>
        {rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 3,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  }
});

export default Header;