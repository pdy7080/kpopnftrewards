import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ImageWithFallback = ({
  source,
  fallbackSource = require('../../../assets/images/placeholder.png'),
  style,
  resizeMode = 'cover',
  onError,
  onLoad,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 컴포넌트 마운트 시 로딩 상태 초기화
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [source]);
  
  const handleError = (error) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError(error);
    }
  };
  
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };
  
  if (hasError) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Image
          source={fallbackSource}
          style={[styles.fallbackImage, style]}
          resizeMode={resizeMode}
          {...props}
        />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[
          styles.image,
          isLoading && styles.loading,
          style
        ]}
        resizeMode={resizeMode}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loading: {
    opacity: 0.5,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
  },
}); 