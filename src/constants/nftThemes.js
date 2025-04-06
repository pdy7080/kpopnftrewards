// constants/nftThemes.js

// NFT 테마 및 이벤트 정의
export const NFT_THEMES = {
  WORLD_TOUR: {
    name: '월드투어 기념',
    description: '아티스트의 월드투어를 기념하여 제작된 한정판 기념주화입니다.',
    rarity: 'rare'
  },
  FAN_MEETING: {
    name: '팬미팅 한정판',
    description: '팬미팅 참석자들을 위해 특별히 제작된 기념주화입니다.',
    rarity: 'uncommon'
  },
  DEBUT: {
    name: '데뷔 기념',
    description: '아티스트의 데뷔를 기념하여 제작된 스페셜 에디션 기념주화입니다.',
    rarity: 'legendary'
  },
  COMEBACK: {
    name: '컴백 기념',
    description: '새로운 앨범 발매를 기념하여 제작된 기념주화입니다.',
    rarity: 'rare'
  },
  ALBUM: {
    name: '앨범 발매 기념',
    description: '앨범 발매를 기념하여 제작된 한정판 기념주화입니다.',
    rarity: 'uncommon'
  }
};

// NFT 설명 생성 함수
export const generateNFTDescription = (theme, artist, edition) => {
  const themeInfo = NFT_THEMES[theme];
  return `${artist}의 ${themeInfo.name} 기념주화 NFT입니다. ${themeInfo.description} 전 세계 ${edition}개 한정 제작되었으며, 실물 주화 구매자에게만 제공되는 특별한 NFT입니다.`;
};

// 아티스트별 이벤트 및 컨셉 데이터
export const NFT_THEMES_DATA = {
  gidle: [
    { name: "I-LAND 월드투어 기념 주화", desc: "여자아이들의 첫 월드투어 'I-LAND'를 기념하여 제작된 한정판 주화입니다." },
    { name: "네버랜드 5주년 기념 주화", desc: "데뷔 5주년을 맞이한 여자아이들의 성장을 기념하는 특별 제작 주화입니다." },
    { name: "퀸덤2 우승 기념 주화", desc: "Mnet '퀸덤2' 우승을 기념하여 제작된 트로피 형태의 기념 주화입니다." },
    { name: "토마토소스 뮤직비디오 기념 주화", desc: "1억뷰를 돌파한 '토마토소스' 뮤직비디오를 기념하는 특별 주화입니다." },
    { name: "여자아이들 팬미팅 한정판 주화", desc: "2025 글로벌 팬미팅을 기념하여 제작된 멤버별 시그니처가 새겨진 주화입니다." }
  ],
  bibi: [
    { name: "휴먼 앨범 발매 기념 주화", desc: "BIBI의 메이저 앨범 'HUMAN'의 발매를 기념하는 특별 디자인 주화입니다." },
    { name: "아시아 투어 기념 주화", desc: "BIBI의 첫 아시아 투어 'BIBI IN ASIA'를 기념하는 한정판 주화입니다." },
    { name: "BIBI UNIVERSE 콘서트 주화", desc: "BIBI의 첫 단독 콘서트 'BIBI UNIVERSE'를 기념하는 스페셜 에디션 주화입니다." },
    { name: "베스트 뮤지션 수상 기념 주화", desc: "2024 올해의 여성 아티스트상 수상을 기념하는 트로피 모티브 주화입니다." },
    { name: "KAZINO 5억뷰 기념 주화", desc: "히트곡 'KAZINO'의 5억뷰 달성을 기념하는 특별 주화입니다." }
  ],
  chanwon: [
    { name: "미스터트롯 기념 주화", desc: "미스터트롯 준우승을 기념하여 제작된 특별한 트로피 디자인 주화입니다." },
    { name: "첫 단독 콘서트 기념 주화", desc: "이찬원의 첫 전국 투어 단독 콘서트를 기념하는 한정판 주화입니다." },
    { name: "국민가수 시즌1 주화", desc: "국민가수 시즌1 출연을 기념하는 특별 제작 주화입니다." },
    { name: "신곡 '우리 둘이' 발매 기념 주화", desc: "히트곡 '우리 둘이' 발매를 기념하여 제작된 음표 모티브 주화입니다." },
    { name: "팬미팅 투어 한정판 주화", desc: "2025 전국 팬미팅 투어를 기념하는 시그니처 각인 주화입니다." }
  ]
}; 