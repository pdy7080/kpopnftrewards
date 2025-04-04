// components/common/LoadingIndicator.js
import React from 'react';
import { 
  View, 
  ActivityIndicator, 
  Text, 
  StyleSheet, 
  Modal 
} from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * 로딩 인디케이터 컴포넌트
 * 
 * @param {boolean} loading - 로딩 표시 여부
 * @param {string} color - 로딩 인디케이터 색상 (기본값: primary)
 * @param {string} message - 로딩 메시지
 * @param {boolean} overlay - 배경 오버레이 표시 여부
 * @param {boolean} fullScreen - 전체 화면 표시 여부
 */
const LoadingIndicator = ({ 
  loading = false, 
  color = COLORS.primary, 
  message, 
  overlay = false,
  fullScreen = false
}) => {
  if (!loading) return null;
  
  const loadingContent = (
    <View style={[
      styles.container,
      overlay && styles.overlayContainer,
      !overlay && !fullScreen && styles.inlineContainer
    ]}>
      <View style={styles.loaderWrapper}>
        <ActivityIndicator size="large" color={color} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
  
  if (fullScreen || overlay) {
    return (
      <Modal
        transparent={true}
        visible={loading}
        animationType="fade"
      >
        {loadingContent}
      </Modal>
    );
  }
  
  return loadingContent;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
  },
  inlineContainer: {
    padding: 16,
  },
  loaderWrapper: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  }
});

export default LoadingIndicator;