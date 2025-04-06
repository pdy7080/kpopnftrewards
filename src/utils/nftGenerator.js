// utils/nftGenerator.js
import { NFT_THEMES } from '../constants/nftThemes';

// 재질 및 특징 설명 배열
const COIN_FEATURES = [
  "순은(99.9%) 소재에 특수 코팅 처리되어 있으며,",
  "24K 골드 도금 처리된 고급 합금 소재로,",
  "실버와 골드 투톤으로 제작되어 입체감이 돋보이며,",
  "홀로그램 특수 코팅이 적용된 티타늄 합금으로,",
  "아티스트 시그니처가 레이저 각인된 한정판으로,"
];

// 디자인 설명 배열
const COIN_DESIGNS = [
  "앞면에는 아티스트 로고, 뒷면에는 이벤트 엠블럼이 새겨져 있습니다.",
  "앞면에는 멤버들의 실루엣, 뒷면에는 기념 문구가 정교하게 새겨져 있습니다.",
  "양면에 홀로그래픽 효과가 적용된 아티스트 공식 엠블럼이 새겨져 있습니다.",
  "앞면에는 아티스트 초상, 뒷면에는 이벤트 로고가 3D 엠보싱되어 있습니다.",
  "특수 에칭 기법으로 아티스트의 상징적인 이미지가 섬세하게 표현되어 있습니다."
];

// 발행 수량 및 희소성 설명 배열
const COIN_RARITY = [
  "전 세계 1,000개 한정 제작되었으며, 실물 주화 구매자에게만 제공되는 NFT입니다.",
  "국내외 3,000개 한정 생산된 공식 인증 주화의 디지털 소유권을 증명합니다.",
  "팬클럽 회원만을 위해 5,000개 한정 발행된 특별 에디션 주화입니다.",
  "공식 MD 한정판으로, 2,500개만 제작된 희소성 높은 컬렉터블 아이템입니다.",
  "이벤트 현장에서만 구매 가능했던 초희귀 주화로, 1,500개만 발행되었습니다."
];

// 소장 가치 설명 배열
const COIN_VALUE = [
  "아티스트의 중요한 발자취를 기념하는 소중한 컬렉터블 아이템입니다.",
  "K-POP 역사의 한 페이지를 간직할 수 있는 의미 있는 소장품입니다.",
  "팬이라면 놓칠 수 없는 아티스트 커리어의 상징적인 기념품입니다.",
  "시간이 지날수록 가치가 높아지는 특별한 컬렉션 아이템입니다.",
  "아티스트와 팬의 특별한 인연을 상징하는 프리미엄 기념 아이템입니다."
];

/**
 * NFT 이름 및 설명 생성 함수
 * @param {string} artistId - 아티스트 ID
 * @param {string} memberId - 멤버 ID
 * @returns {object} - name, description 속성을 가진 객체
 */
export const generateNFTDetails = (artistId, memberId) => {
  // 아티스트별 테마 배열에서 랜덤 선택
  const themes = NFT_THEMES[artistId] || NFT_THEMES.gidle;
  const themeIndex = Math.floor(Math.random() * themes.length);
  const theme = themes[themeIndex];
  
  // 각 설명 배열에서 랜덤 선택
  const featureIndex = Math.floor(Math.random() * COIN_FEATURES.length);
  const designIndex = Math.floor(Math.random() * COIN_DESIGNS.length);
  const rarityIndex = Math.floor(Math.random() * COIN_RARITY.length);
  const valueIndex = Math.floor(Math.random() * COIN_VALUE.length);
  
  // NFT 이름 생성
  const nftName = `${theme.name} NFT`;
  
  // NFT 설명 생성
  const nftDescription = `${theme.desc} ${COIN_FEATURES[featureIndex]} ${COIN_DESIGNS[designIndex]} ${COIN_RARITY[rarityIndex]} ${COIN_VALUE[valueIndex]}`;
  
  return {
    name: nftName,
    description: nftDescription
  };
};

/**
 * NFT 설명을 단락으로 분리하는 함수
 * @param {string} description - NFT 설명 텍스트
 * @returns {string[]} - 단락으로 분리된 설명 배열
 */
export const formatNFTDescription = (description) => {
  // 기존 설명을 의미 단위로 분리
  const parts = description.split('.');
  
  // 정리된 단락
  const paragraphs = [];
  
  // 이벤트 설명
  if (parts[0]) {
    paragraphs.push(parts[0] + '.');
  }
  
  // 주화 특징 설명
  const featuresDesc = parts.slice(1, 3).join('.');
  if (featuresDesc) {
    paragraphs.push(featuresDesc);
  }
  
  // 희소성 및 가치 설명
  const valueDesc = parts.slice(3).join('.');
  if (valueDesc) {
    paragraphs.push(valueDesc);
  }
  
  return paragraphs.length > 0 ? paragraphs : ["이 기념 주화 NFT는 K-POP 아티스트의 특별한 순간을 기념하는 디지털 소장품입니다."];
};