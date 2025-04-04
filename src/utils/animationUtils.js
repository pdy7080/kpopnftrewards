// utils/animationUtils.js
import { Animated, Easing } from 'react-native';

/**
 * 값 애니메이션 함수
 * 
 * @param {Animated.Value} animatedValue - 애니메이션할 값
 * @param {number} toValue - 목표 값
 * @param {number} duration - 애니메이션 시간 (ms)
 * @param {function} easing - 이징 함수 (기본값: Easing.out(Easing.ease))
 * @param {function} callback - 애니메이션 완료 후 콜백
 * @returns {Animated.CompositeAnimation} 애니메이션 객체
 */
export const animateValue = (
  animatedValue,
  toValue,
  duration = 300,
  easing = Easing.out(Easing.ease),
  callback = () => {}
) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: false,
    callback
  });
};

/**
 * 페이드 인 애니메이션
 * 
 * @param {Animated.Value} opacity - 투명도 값
 * @param {number} duration - 애니메이션 시간 (ms)
 * @param {function} callback - 애니메이션 완료 후 콜백
 * @returns {Animated.CompositeAnimation} 애니메이션 객체
 */
export const fadeIn = (opacity, duration = 300, callback = () => {}) => {
  return Animated.timing(opacity, {
    toValue: 1,
    duration,
    useNativeDriver: true,
    callback
  });
};

/**
 * 페이드 아웃 애니메이션
 * 
 * @param {Animated.Value} opacity - 투명도 값
 * @param {number} duration - 애니메이션 시간 (ms)
 * @param {function} callback - 애니메이션 완료 후 콜백
 * @returns {Animated.CompositeAnimation} 애니메이션 객체
 */
export const fadeOut = (opacity, duration = 300, callback = () => {}) => {
  return Animated.timing(opacity, {
    toValue: 0,
    duration,
    useNativeDriver: true,
    callback
  });
};

/**
 * 슬라이드 인 애니메이션
 * 
 * @param {Animated.Value} position - 위치 값
 * @param {number} fromValue - 시작 위치
 * @param {number} toValue - 목표 위치
 * @param {number} duration - 애니메이션 시간 (ms)
 * @param {function} callback - 애니메이션 완료 후 콜백
 * @returns {Animated.CompositeAnimation} 애니메이션 객체
 */
export const slideIn = (position, fromValue, toValue, duration = 300, callback = () => {}) => {
  position.setValue(fromValue);
  
  return Animated.timing(position, {
    toValue,
    duration,
    useNativeDriver: true,
    callback
  });
};

/**
 * 순차적 애니메이션 (staggered)
 * 
 * @param {Array} items - 애니메이션할 항목 배열
 * @param {function} createAnimatedValue - 애니메이션 값 생성 함수
 * @param {function} createAnimation - 애니메이션 생성 함수
 * @param {number} staggerDelay - 항목 간 지연 시간 (ms)
 * @param {function} callback - 애니메이션 완료 후 콜백
 * @returns {Animated.CompositeAnimation} 애니메이션 객체
 */
export const staggeredAnimation = (
  items,
  createAnimatedValue,
  createAnimation,
  staggerDelay = 50,
  callback = () => {}
) => {
  const animations = items.map((item, index) => {
    const animatedValue = createAnimatedValue();
    return {
      animatedValue,
      animation: createAnimation(animatedValue, item, index)
    };
  });
  
  return {
    animatedValues: animations.map(a => a.animatedValue),
    start: () => {
      Animated.stagger(
        staggerDelay,
        animations.map(a => a.animation)
      ).start(callback);
    }
  };
};

/**
 * 반복 애니메이션
 * 
 * @param {Animated.Value} animatedValue - 애니메이션할 값
 * @param {Object} config - 애니메이션 구성 객체
 * @param {number} iterations - 반복 횟수 (기본값: -1, 무한 반복)
 * @returns {Animated.CompositeAnimation} 애니메이션 객체
 */
export const repeatAnimation = (animatedValue, config, iterations = -1) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        ...config,
        toValue: 1,
        useNativeDriver: config.useNativeDriver !== undefined ? config.useNativeDriver : true
      }),
      Animated.timing(animatedValue, {
        ...config,
        toValue: 0,
        useNativeDriver: config.useNativeDriver !== undefined ? config.useNativeDriver : true
      })
    ]),
    { iterations }
  );
};

/**
 * 카운터 애니메이션 (숫자 카운팅)
 * 
 * @param {Animated.Value} animatedValue - 애니메이션할 값
 * @param {number} fromValue - 시작 값
 * @param {number} toValue - 목표 값
 * @param {number} duration - 애니메이션 시간 (ms)
 * @param {number} decimalPlaces - 소수점 자릿수
 * @returns {Object} 애니메이션 및 값 인터폴레이션 객체
 */
export const countAnimation = (
  animatedValue,
  fromValue,
  toValue,
  duration = 1000,
  decimalPlaces = 0
) => {
  animatedValue.setValue(fromValue);
  
  // 보간된 문자열 값
  const interpolatedString = animatedValue.interpolate({
    inputRange: [fromValue, toValue],
    outputRange: [fromValue.toFixed(decimalPlaces), toValue.toFixed(decimalPlaces)]
  });
  
  // 애니메이션 객체
  const animation = Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: false
  });
  
  return {
    animation,
    interpolatedString
  };
};