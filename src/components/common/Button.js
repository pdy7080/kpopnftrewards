// components/common/Button.js
import React from 'react';
import { 
  TouchableOpacity, 
  TouchableNativeFeedback,
  Text, 
  View, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * 공통 버튼 컴포넌트
 * 
 * @param {string} title - 버튼 텍스트
 * @param {function} onPress - 클릭 핸들러
 * @param {string} type - 버튼 타입 ('primary', 'secondary', 'danger', 'outline', 'text')
 * @param {string} size - 버튼 크기 ('small', 'medium', 'large')
 * @param {boolean} disabled - 비활성화 여부
 * @param {boolean} fullWidth - 전체 너비 사용 여부
 * @param {object} style - 추가 스타일
 * @param {object} textStyle - 텍스트 추가 스타일
 * @param {ReactNode} icon - 아이콘 컴포넌트
 * @param {string} iconPosition - 아이콘 위치 ('left', 'right')
 */
const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  size = 'medium', 
  disabled = false, 
  fullWidth = false,
  style, 
  textStyle,
  icon,
  iconPosition = 'left'
}) => {
  // 버튼 타입에 따른 스타일
  const getTypeStyle = () => {
    switch (type) {
      case 'primary':
        return {
          backgroundColor: COLORS.primary,
          borderColor: COLORS.primary,
          textColor: 'white'
        };
      case 'secondary':
        return {
          backgroundColor: COLORS.secondary,
          borderColor: COLORS.secondary,
          textColor: 'white'
        };
      case 'danger':
        return {
          backgroundColor: COLORS.error,
          borderColor: COLORS.error,
          textColor: 'white'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: COLORS.primary,
          textColor: COLORS.primary
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: COLORS.primary
        };
      default:
        return {
          backgroundColor: COLORS.primary,
          borderColor: COLORS.primary,
          textColor: 'white'
        };
    }
  };
  
  // 버튼 크기에 따른 스타일
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: 12
        };
      case 'large':
        return {
          paddingVertical: 14,
          paddingHorizontal: 24,
          fontSize: 16
        };
      default: // medium
        return {
          paddingVertical: 10,
          paddingHorizontal: 18,
          fontSize: 14
        };
    }
  };
  
  const typeStyle = getTypeStyle();
  const sizeStyle = getSizeStyle();
  
  // 플랫폼별 버튼 구현 (Android는 리플 효과 사용)
  const ButtonComponent = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;
  
  // 버튼 내용 렌더링
  const renderButtonContent = () => (
    <View style={[
      styles.button,
      { 
        backgroundColor: disabled ? '#ccc' : typeStyle.backgroundColor,
        borderColor: disabled ? '#ccc' : typeStyle.borderColor,
        paddingVertical: sizeStyle.paddingVertical,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        width: fullWidth ? '100%' : 'auto'
      },
      style
    ]}>
      {icon && iconPosition === 'left' && (
        <View style={styles.iconLeft}>{icon}</View>
      )}
      
      <Text style={[
        styles.text,
        { 
          color: disabled ? '#999' : typeStyle.textColor,
          fontSize: sizeStyle.fontSize
        },
        textStyle
      ]}>
        {title}
      </Text>
      
      {icon && iconPosition === 'right' && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );
  
  if (Platform.OS === 'android') {
    return (
      <ButtonComponent
        background={TouchableNativeFeedback.Ripple(typeStyle.textColor, false)}
        onPress={onPress}
        disabled={disabled}
        useForeground
      >
        {renderButtonContent()}
      </ButtonComponent>
    );
  }
  
  return (
    <ButtonComponent
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={fullWidth ? styles.fullWidth : {}}
    >
      {renderButtonContent()}
    </ButtonComponent>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  }
});

export default Button;