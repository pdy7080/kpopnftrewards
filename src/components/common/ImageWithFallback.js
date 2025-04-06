import React, { useState } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../../constants/colors';

export const ImageWithFallback = ({
  source,
  fallbackSource = require('../../../assets/images/placeholder.png'),
  style,
  resizeMode = 'cover',
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleError = (error) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError(error);
    }
  };
  
  const handleLoad = () => {
    setIsLoading(false);
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
          <Text style={styles.loadingText}>로딩 중...</Text>
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
  loadingText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
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