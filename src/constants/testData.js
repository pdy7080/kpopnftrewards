// constants/testData.js
export const TEST_NFT_DATA = {
  gidle: [
    {
      id: 'gidle_nft_1',
      name: '2024 월드투어 기념 플래티넘 주화 NFT',
      artistId: 'gidle',
      memberId: 'miyeon',
      tier: 'fan',
      image: require('../assets/artists/gidle/members/miyeon.jpg'),
      initialPoints: 5,
      currentPoints: 5,
      initialSales: 1000,
      currentSales: 1500
    },
    {
      id: 'gidle_nft_2',
      name: '데뷔 5주년 기념 골드 주화 NFT',
      artistId: 'gidle',
      memberId: 'soyeon',
      tier: 'fan',
      image: require('../assets/artists/gidle/members/soyeon.jpg'),
      initialPoints: 5,
      currentPoints: 5,
      initialSales: 1200,
      currentSales: 1800
    },
    {
      id: 'gidle_nft_3',
      name: '퀸덤2 우승 기념 실버 주화 NFT',
      artistId: 'gidle',
      memberId: 'yuqi',
      tier: 'fan',
      image: require('../assets/artists/gidle/members/yuqi.jpg'),
      initialPoints: 5,
      currentPoints: 5,
      initialSales: 800,
      currentSales: 1200
    }
  ],
  bibi: [
    {
      id: 'bibi_nft_1',
      name: '첫 단독 콘서트 기념 플래티넘 주화 NFT',
      artistId: 'bibi',
      memberId: 'bibi',
      tier: 'fan',
      image: require('../assets/artists/bibi/profile1.jpg'),
      initialPoints: 5,
      currentPoints: 5,
      initialSales: 900,
      currentSales: 1400
    },
    {
      id: 'bibi_nft_2',
      name: 'BIBI VENGEANCE 앨범 기념 골드 주화 NFT',
      artistId: 'bibi',
      memberId: 'bibi',
      tier: 'fan',
      image: require('../assets/artists/bibi/profile2.jpg'),
      initialPoints: 5,
      currentPoints: 5,
      initialSales: 1100,
      currentSales: 1600
    },
    {
      id: 'bibi_nft_3',
      name: '아시아 투어 기념 실버 주화 NFT',
      artistId: 'bibi',
      memberId: 'bibi',
      tier: 'fan',
      image: require('../assets/artists/bibi/profile.jpg'),
      initialPoints: 5,
      currentPoints: 5,
      initialSales: 700,
      currentSales: 1000
    }
  ],
  chanwon: [
    {
      id: 'chanwon_nft_1',
      name: '미스터트롯2 우승 기념 플래티넘 주화 NFT',
      artistId: 'chanwon',
      memberId: 'chanwon',
      tier: 'fan',
      image: require('../assets/artists/chanwon/profile1.jpg'),
      initialPoints: 5,
      currentPoints: 5
    },
    {
      id: 'chanwon_nft_2',
      name: '전국투어 기념 골드 주화 NFT',
      artistId: 'chanwon',
      memberId: 'chanwon',
      tier: 'fan',
      image: require('../assets/artists/chanwon/profile2.jpg'),
      initialPoints: 5,
      currentPoints: 5
    },
    {
      id: 'chanwon_nft_3',
      name: '데뷔 3주년 기념 실버 주화 NFT',
      artistId: 'chanwon',
      memberId: 'chanwon',
      tier: 'fan',
      image: require('../assets/artists/chanwon/profile3.jpg'),
      initialPoints: 5,
      currentPoints: 5
    }
  ]
};

export const TEST_QR_CODES = [
  // 여자아이들
  {
    name: '여자아이들 - 2024 월드투어 기념 플래티넘 주화 NFT',
    data: JSON.stringify({
      artistId: 'gidle',
      memberId: 'miyeon',
      tier: 'fan',
      purchaseOrder: 1500
    })
  },
  {
    name: '여자아이들 - 데뷔 5주년 기념 골드 주화 NFT',
    data: JSON.stringify({
      artistId: 'gidle',
      memberId: 'soyeon',
      tier: 'fan',
      purchaseOrder: 1600
    })
  },
  {
    name: '여자아이들 - 퀸덤2 우승 기념 실버 주화 NFT',
    data: JSON.stringify({
      artistId: 'gidle',
      memberId: 'yuqi',
      tier: 'fan',
      purchaseOrder: 1700
    })
  },
  
  // 비비
  {
    name: '비비 - 첫 단독 콘서트 기념 플래티넘 주화 NFT',
    data: JSON.stringify({
      artistId: 'bibi',
      memberId: 'bibi',
      tier: 'fan',
      purchaseOrder: 1500
    })
  },
  {
    name: '비비 - BIBI VENGEANCE 앨범 기념 골드 주화 NFT',
    data: JSON.stringify({
      artistId: 'bibi',
      memberId: 'bibi',
      tier: 'fan',
      purchaseOrder: 1600
    })
  },
  {
    name: '비비 - 아시아 투어 기념 실버 주화 NFT',
    data: JSON.stringify({
      artistId: 'bibi',
      memberId: 'bibi',
      tier: 'fan',
      purchaseOrder: 1700
    })
  },
  
  // 이찬원
  {
    name: '이찬원 - 미스터트롯2 우승 기념 플래티넘 주화 NFT',
    data: JSON.stringify({
      artistId: 'chanwon',
      memberId: 'chanwon',
      tier: 'fan',
      purchaseOrder: 1500
    })
  },
  {
    name: '이찬원 - 전국투어 기념 골드 주화 NFT',
    data: JSON.stringify({
      artistId: 'chanwon',
      memberId: 'chanwon',
      tier: 'fan',
      purchaseOrder: 1600
    })
  },
  {
    name: '이찬원 - 데뷔 3주년 기념 실버 주화 NFT',
    data: JSON.stringify({
      artistId: 'chanwon',
      memberId: 'chanwon',
      tier: 'fan',
      purchaseOrder: 1700
    })
  }
];