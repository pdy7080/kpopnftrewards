/**
 * 날짜를 포맷팅하는 함수
 * 
 * @param {Date|string} date - 포맷팅할 날짜
 * @param {string} format - 포맷 문자열 (기본값: 'YYYY-MM-DD')
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDate = (date, format) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  // format이 문자열이 아닌 경우 기본값 사용
  const dateFormat = typeof format === 'string' ? format : 'YYYY-MM-DD';
  
  try {
    return dateFormat
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  } catch (error) {
    console.warn('날짜 포맷팅 오류:', error);
    return `${year}-${month}-${day}`;
  }
};

/**
 * 날짜를 상대적 시간으로 포맷팅하는 함수
 * 
 * @param {Date|string} date - 포맷팅할 날짜
 * @returns {string} 상대적 시간 문자열 (예: "3시간 전", "2일 전")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diff = now - d;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
};

/**
 * 날짜를 한국어로 포맷팅하는 함수
 * 
 * @param {Date|string} date - 포맷팅할 날짜
 * @returns {string} 한국어 날짜 문자열 (예: "2024년 3월 15일")
 */
export const formatKoreanDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 날짜를 요일과 함께 포맷팅하는 함수
 * 
 * @param {Date|string} date - 포맷팅할 날짜
 * @returns {string} 요일이 포함된 날짜 문자열 (예: "2024-03-15 (금)")
 */
export const formatDateWithDay = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = days[d.getDay()];
  
  return `${formatDate(date)} (${dayOfWeek})`;
};
