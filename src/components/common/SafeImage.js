// components/common/SafeImage.js
import React, { useState } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * 안전한 이미지 로딩 컴포넌트
 * 로딩, 에러 상태를 처리하고 대체 이미지를 표시합니다.
 */
const SafeImage = ({ 
  source, 
  style, 
  resizeMode = 'cover',
  fallbackSource = require('../../assets/images/placeholder.png'),
  showLoader = true,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <View style={[{ position: 'relative', overflow: 'hidden' }, style]}>
      {!hasError ? (
        <Image
          source={source}
          style={[
            { width: '100%', height: '100%' },
            style
          ]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      ) : (
        <Image
          source={fallbackSource}
          style={[
            { width: '100%', height: '100%' },
            style
          ]}
          resizeMode={resizeMode}
          {...props}
        />
      )}
      
      {isLoading && showLoader && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(240, 240, 240, 0.5)'
        }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

export default SafeImage;