// utils/validators.js

/**
 * 이메일 유효성 검사
 * 
 * @param {string} email - 검사할 이메일
 * @returns {boolean} 유효 여부
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 휴대폰 번호 유효성 검사 (한국 번호)
 * 
 * @param {string} phone - 검사할 휴대폰 번호
 * @returns {boolean} 유효 여부
 */
export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

/**
 * 필수 입력값 검사
 * 
 * @param {string} value - 검사할 값
 * @returns {boolean} 유효 여부
 */
export const isRequired = (value) => {
  return value !== undefined && value !== null && value.trim() !== '';
};

/**
 * 최소 길이 검사
 * 
 * @param {string} value - 검사할 값
 * @param {number} minLength - 최소 길이
 * @returns {boolean} 유효 여부
 */
export const hasMinLength = (value, minLength) => {
  return value !== undefined && value !== null && value.length >= minLength;
};

/**
 * 최대 길이 검사
 * 
 * @param {string} value - 검사할 값
 * @param {number} maxLength - 최대 길이
 * @returns {boolean} 유효 여부
 */
export const hasMaxLength = (value, maxLength) => {
  return value !== undefined && value !== null && value.length <= maxLength;
};

/**
 * 숫자 값 검사
 * 
 * @param {string|number} value - 검사할 값
 * @returns {boolean} 유효 여부
 */
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * 정수 값 검사
 * 
 * @param {string|number} value - 검사할 값
 * @returns {boolean} 유효 여부
 */
export const isInteger = (value) => {
  return Number.isInteger(Number(value));
};

/**
 * 값 범위 검사
 * 
 * @param {number} value - 검사할 값
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {boolean} 유효 여부
 */
export const isInRange = (value, min, max) => {
  const numValue = Number(value);
  return !isNaN(numValue) && numValue >= min && numValue <= max;
};

/**
 * 문자열 패턴 검사
 * 
* @param {string} value - 검사할 값
* @param {RegExp} pattern - 정규식 패턴
* @returns {boolean} 유효 여부
*/
export const matchesPattern = (value, pattern) => {
 return pattern.test(value);
};

/**
* URL 유효성 검사
* 
* @param {string} url - 검사할 URL
* @returns {boolean} 유효 여부
*/
export const isValidUrl = (url) => {
 try {
   new URL(url);
   return true;
 } catch (error) {
   return false;
 }
};

/**
* 날짜 유효성 검사
* 
* @param {string|Date} date - 검사할 날짜
* @returns {boolean} 유효 여부
*/
export const isValidDate = (date) => {
 if (!date) return false;
 
 const d = new Date(date);
 return !isNaN(d.getTime());
};

/**
* 미래 날짜 검사
* 
* @param {string|Date} date - 검사할 날짜
* @returns {boolean} 유효 여부
*/
export const isFutureDate = (date) => {
 if (!isValidDate(date)) return false;
 
 const d = new Date(date);
 const now = new Date();
 
 return d > now;
};

/**
* 비밀번호 복잡성 검사
* - 최소 8자 이상
* - 대문자, 소문자, 숫자, 특수문자 중 3가지 이상 포함
* 
* @param {string} password - 검사할 비밀번호
* @returns {boolean} 유효 여부
*/
export const isStrongPassword = (password) => {
 if (!password || password.length < 8) return false;
 
 let complexity = 0;
 
 // 대문자 포함 여부
 if (/[A-Z]/.test(password)) complexity++;
 
 // 소문자 포함 여부
 if (/[a-z]/.test(password)) complexity++;
 
 // 숫자 포함 여부
 if (/[0-9]/.test(password)) complexity++;
 
 // 특수문자 포함 여부
 if (/[^A-Za-z0-9]/.test(password)) complexity++;
 
 return complexity >= 3;
};

/**
* 객체 필수 속성 검사
* 
* @param {Object} obj - 검사할 객체
* @param {Array} requiredProps - 필수 속성 배열
* @returns {boolean} 유효 여부
*/
export const hasRequiredProps = (obj, requiredProps) => {
 if (!obj || typeof obj !== 'object') return false;
 
 return requiredProps.every(prop => 
   obj.hasOwnProperty(prop) && obj[prop] !== undefined && obj[prop] !== null
 );
};

/**
* 여러 유효성 검사 규칙 적용
* 
* @param {string} value - 검사할 값
* @param {Array} rules - 검사 규칙 함수 배열
* @returns {boolean} 모든 규칙 통과 여부
*/
export const validateWithRules = (value, rules) => {
 return rules.every(rule => rule(value));
};

/**
* 폼 데이터 유효성 검사
* 
* @param {Object} formData - 검사할 폼 데이터
* @param {Object} validationRules - 필드별 검사 규칙
* @returns {Object} { isValid, errors }
*/
export const validateForm = (formData, validationRules) => {
 const errors = {};
 let isValid = true;
 
 Object.entries(validationRules).forEach(([field, rules]) => {
   const value = formData[field];
   
   // 각 필드의 규칙 검사
   const fieldErrors = rules
     .map(rule => {
       const { validate, message } = rule;
       return validate(value) ? null : message;
     })
     .filter(Boolean);
   
   if (fieldErrors.length > 0) {
     errors[field] = fieldErrors;
     isValid = false;
   }
 });
 
 return { isValid, errors };
};