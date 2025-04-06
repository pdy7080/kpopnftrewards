// constants/testData.js
import { TIERS } from './tiers';

export const TEST_NFT_DATA = {
  gidle: [
    {
      id: 'gidle_fan_1',
      name: '2025년 월드투어 기념 황동 기념주화 NFT',
      artistId: 'gidle',
      memberId: 'miyeon',
      tier: 'fan',
      initialPoints: TIERS.fan.initialPoints,
      currentPoints: TIERS.fan.initialPoints,
      initialSales: 1200,
      currentSales: 1800,
      canFuse: true,
      image: require('../../assets/artists/gidle/members/miyeon.jpg'),
      description: '여자아이들 2025년 월드투어를 기념하는 황동 기념주화 NFT입니다. 미연 멤버의 특별한 디자인이 적용되었습니다. 월드투어의 화려한 무대를 담아낸 한정판 주화입니다.'
    },
    {
      id: 'gidle_fan_2',
      name: '2025년 신곡 \'Queen\' 발매 기념 실버 기념주화 NFT',
      artistId: 'gidle',
      memberId: 'soyeon',
      tier: 'fan',
      initialPoints: TIERS.fan.initialPoints,
      currentPoints: TIERS.fan.initialPoints,
      initialSales: 1000,
      currentSales: 1500,
      canFuse: true,
      image: require('../../assets/artists/gidle/members/soyeon.jpg'),
      description: '여자아이들의 신곡 \'Queen\'의 발매를 기념하는 실버 기념주화 NFT입니다. 소연 멤버가 작사, 작곡한 곡을 기념하는 특별한 디자인이 적용되었습니다.'
    },
    {
      id: 'gidle_fan_3',
      name: '2025년 데뷔 7주년 기념 골드 기념주화 NFT',
      artistId: 'gidle',
      memberId: 'yuqi',
      tier: 'fan',
      initialPoints: TIERS.fan.initialPoints,
      currentPoints: TIERS.fan.initialPoints,
      initialSales: 800,
      currentSales: 1200,
      canFuse: true,
      image: require('../../assets/artists/gidle/members/yuqi.jpg'),
      description: '여자아이들의 데뷔 7주년을 기념하는 골드 기념주화 NFT입니다. 우기 멤버의 특별한 디자인이 적용되었으며, 7년간의 여정을 담아낸 의미있는 주화입니다.'
    }
  ],
  bibi: [
    {
      id: 'bibi_fan_1',
      name: '2025년 월드투어 \'BIBI WORLD\' 기념 황동 기념주화 NFT',
      artistId: 'bibi',
      memberId: 'bibi',
      tier: 'fan',
      initialPoints: TIERS.fan.initialPoints,
      currentPoints: TIERS.fan.initialPoints,
      initialSales: 1100,
      currentSales: 1600,
      canFuse: true,
      image: require('../../assets/artists/bibi/profile.jpg'),
      description: '비비의 첫 월드투어 \'BIBI WORLD\'를 기념하는 황동 기념주화 NFT입니다. 전 세계 20개 도시 투어를 기념하는 특별한 디자인이 적용되었습니다.'
    },
    {
      id: 'bibi_fan_2',
      name: '2025년 정규 2집 \'NOIR\' 발매 기념 실버 기념주화 NFT',
      artistId: 'bibi',
      memberId: 'bibi',
      tier: 'fan',
      initialPoints: TIERS.fan.initialPoints,
      currentPoints: TIERS.fan.initialPoints,
      initialSales: 900,
      currentSales: 1400,
      canFuse: true,
      image: require('../../assets/artists/bibi/bibi.jpg'),
      description: '비비의 정규 2집 \'NOIR\' 발매를 기념하는 실버 기념주화 NFT입니다. 앨범의 콘셉트를 반영한 신비로운 디자인이 특징입니다.'
    },
    {
      id: 'bibi_fan_3',
      name: '2025년 첫 돔투어 기념 골드 기념주화 NFT',
      artistId: 'bibi',
      memberId: 'bibi',
      tier: 'fan',
      initialPoints: TIERS.fan.initialPoints,
      currentPoints: TIERS.fan.initialPoints,
      initialSales: 700,
      currentSales: 1000,
      canFuse: true,
      image: require('../../assets/artists/bibi/bibi-concert.jpg'),
      description: '비비의 첫 일본 돔투어를 기념하는 골드 기념주화 NFT입니다. 5대 돔 투어의 성공을 기념하는 특별한 디자인이 적용되었습니다.'
    }
  ],
  chanwon: [
    {
      id: 'chanwon_fan_1',
      name: '2025년 아시아투어 기념 황동 기념주화 NFT',
      artistId: 'chanwon',
      memberId: 'chanwon',
      tier: 'fan',
      initialPoints: TIERS.fan.initialPoints,
      currentPoints: TIERS.fan.initialPoints,
      initialSales: 900,
      currentSales: 1400,
      canFuse: true,
      image: require('../../assets/artists/chanwon/profile.jpg'),
      description: '이찬원의 첫 아시아투어를 기념하는 황동 기념주화 NFT입니다. 10개국 15개 도시 투어의 시작을 기념하는 특별한 디자인이 적용되었습니다.'
    },
    {
      id: 'chanwon_fan_2',
      name: '2025년 정규앨범 \'찬원의 계절\' 발매 기념 실버 기념주화 NFT',
      artistId: 'chanwon',
      memberId: 'chanwon',
      tier: 'fan',
      initialPoints: TIERS.fan.initialPoints,
      currentPoints: TIERS.fan.initialPoints,
      initialSales: 800,
      currentSales: 1200,
      canFuse: true,
      image: require('../../assets/artists/chanwon/chanwon2.jpg'),
      description: '이찬원의 첫 정규앨범 \'찬원의 계절\' 발매를 기념하는 실버 기념주화 NFT입니다. 4계절의 감성을 담은 특별한 디자인이 적용되었습니다.'
    },
    {
      id: 'chanwon_fan_3',
      name: '2025년 데뷔 5주년 기념 골드 기념주화 NFT',
      artistId: 'chanwon',
      memberId: 'chanwon',
      tier: 'fan',
      initialPoints: TIERS.fan.initialPoints,
      currentPoints: TIERS.fan.initialPoints,
      initialSales: 600,
      currentSales: 900,
      canFuse: true,
      image: require('../../assets/artists/chanwon/chanwon3.jpg'),
      description: '이찬원의 데뷔 5주년을 기념하는 골드 기념주화 NFT입니다. 5년간의 음악 여정을 담은 특별한 디자인이 적용되었습니다.'
    }
  ]
};

export const TEST_ARTISTS = [
  {
    id: 'gidle',
    name: '여자아이들',
    logo: require('../../assets/artists/gidle/logo.png'),
    description: '큐브 엔터테인먼트 소속의 5인조 걸그룹',
    members: ['미연', '민니', '소연', '우기', '슈화'],
    debutDate: '2018-05-02',
    fandomName: '네버랜드',
    socialLinks: {
      twitter: 'https://twitter.com/G_I_DLE',
      instagram: 'https://www.instagram.com/g_i_dle/',
      youtube: 'https://www.youtube.com/c/GIDLE'
    }
  },
  {
    id: 'bibi',
    name: '비비',
    logo: require('../../assets/artists/bibi/logo.png'),
    description: '매력적인 보컬과 독특한 음악 스타인',
    members: ['비비'],
    debutDate: '2019-04-18',
    fandomName: '비비즈',
    socialLinks: {
      twitter: 'https://twitter.com/nakedbibi',
      instagram: 'https://www.instagram.com/bibicallherbibi/',
      youtube: 'https://www.youtube.com/c/BIBI'
    }
  },
  {
    id: 'chanwon',
    name: '이찬원',
    logo: require('../../assets/artists/chanwon/logo.png'),
    description: '감성적인 목소리와 친근한 매력의 트로트 가수',
    members: ['이찬원'],
    debutDate: '2021-01-01',
    fandomName: '찬원이',
    socialLinks: {
      twitter: 'https://twitter.com/chanwon_lee',
      instagram: 'https://www.instagram.com/chanwon_lee/',
      youtube: 'https://www.youtube.com/c/이찬원'
    }
  }
];

export const TEST_EVENTS = [
  {
    id: 'event1',
    artistId: 'gidle',
    name: '여자아이들 2025 월드투어',
    type: 'concert',
    date: '2025-06-15',
    location: '서울 올림픽체조경기장',
    description: '여자아이들 2025 월드투어 서울 공연',
    ticketPrice: '99000',
    maxTickets: 12000
  },
  {
    id: 'event2',
    artistId: 'bibi',
    name: '비비 단독 콘서트',
    type: 'concert',
    date: '2025-05-18',
    location: '서울 올림픽공원 올림픽홀',
    description: '비비 2025 단독 콘서트',
    ticketPrice: '89000',
    maxTickets: 5000
  },
  {
    id: 'event3',
    artistId: 'chanwon',
    name: '이찬원 전국투어',
    type: 'concert',
    date: '2025-04-20',
    location: '서울 세종문화회관 대극장',
    description: '이찬원 2025 전국투어 서울 공연',
    ticketPrice: '79000',
    maxTickets: 3000
  }
];

export const TEST_NFTS = [
  // 여자아이들 NFT
  {
    id: 'nft1',
    artistId: 'gidle',
    tier: 'fan',
    eventId: 'event1',
    image: require('../../assets/artists/gidle/group.jpg'),
    createdAt: '2024-03-15T10:00:00Z',
    currentPoints: 100,
    totalPoints: 1000,
    benefits: {
      fansignCount: 1,
      concertPreorder: 24,
      winningMultiplier: 1
    }
  },
  {
    id: 'nft2',
    artistId: 'gidle',
    tier: 'supporter',
    eventId: 'event1',
    image: require('../../assets/artists/gidle/group.jpg'),
    createdAt: '2024-03-15T11:00:00Z',
    currentPoints: 500,
    totalPoints: 2000,
    benefits: {
      fansignCount: 2,
      concertPreorder: 48,
      winningMultiplier: 1.5
    }
  },
  {
    id: 'nft3',
    artistId: 'gidle',
    tier: 'earlybird',
    eventId: 'event1',
    image: require('../../assets/artists/gidle/group.jpg'),
    createdAt: '2024-03-15T12:00:00Z',
    currentPoints: 1000,
    totalPoints: 3000,
    benefits: {
      fansignCount: 3,
      concertPreorder: 72,
      winningMultiplier: 2
    }
  },
  
  // 비비 NFT
  {
    id: 'nft4',
    artistId: 'bibi',
    tier: 'fan',
    eventId: 'event2',
    image: require('../../assets/artists/bibi/profile.jpg'),
    createdAt: '2024-03-16T10:00:00Z',
    currentPoints: 100,
    totalPoints: 1000,
    benefits: {
      fansignCount: 1,
      concertPreorder: 24,
      winningMultiplier: 1
    }
  },
  {
    id: 'nft5',
    artistId: 'bibi',
    tier: 'supporter',
    eventId: 'event2',
    image: require('../../assets/artists/bibi/bibi.jpg'),
    createdAt: '2024-03-16T11:00:00Z',
    currentPoints: 500,
    totalPoints: 2000,
    benefits: {
      fansignCount: 2,
      concertPreorder: 48,
      winningMultiplier: 1.5
    }
  },
  {
    id: 'nft6',
    artistId: 'bibi',
    tier: 'earlybird',
    eventId: 'event2',
    image: require('../../assets/artists/bibi/bibi-concert.jpg'),
    createdAt: '2024-03-16T12:00:00Z',
    currentPoints: 1000,
    totalPoints: 3000,
    benefits: {
      fansignCount: 3,
      concertPreorder: 72,
      winningMultiplier: 2
    }
  },
  
  // 이찬원 NFT
  {
    id: 'nft7',
    artistId: 'chanwon',
    tier: 'fan',
    eventId: 'event3',
    image: require('../../assets/artists/chanwon/profile.jpg'),
    createdAt: '2024-03-17T10:00:00Z',
    currentPoints: 100,
    totalPoints: 1000,
    benefits: {
      fansignCount: 1,
      concertPreorder: 24,
      winningMultiplier: 1
    }
  },
  {
    id: 'nft8',
    artistId: 'chanwon',
    tier: 'supporter',
    eventId: 'event3',
    image: require('../../assets/artists/chanwon/chanwon2.jpg'),
    createdAt: '2024-03-17T11:00:00Z',
    currentPoints: 500,
    totalPoints: 2000,
    benefits: {
      fansignCount: 2,
      concertPreorder: 48,
      winningMultiplier: 1.5
    }
  },
  {
    id: 'nft9',
    artistId: 'chanwon',
    tier: 'earlybird',
    eventId: 'event3',
    image: require('../../assets/artists/chanwon/chanwon3.jpg'),
    createdAt: '2024-03-17T12:00:00Z',
    currentPoints: 1000,
    totalPoints: 3000,
    benefits: {
      fansignCount: 3,
      concertPreorder: 72,
      winningMultiplier: 2
    }
  }
];

export const TEST_QR_CODES = [
  {
    id: 'qr1',
    data: JSON.stringify({
      type: 'nft',
      tier: 'fan',
      artistId: 'gidle',
      eventId: 'event1'
    })
  },
  {
    id: 'qr2',
    data: JSON.stringify({
      type: 'nft',
      tier: 'supporter',
      artistId: 'gidle',
      eventId: 'event1'
    })
  },
  {
    id: 'qr3',
    data: JSON.stringify({
      type: 'nft',
      tier: 'earlybird',
      artistId: 'gidle',
      eventId: 'event1'
    })
  },
  {
    id: 'qr4',
    data: JSON.stringify({
      type: 'nft',
      tier: 'fan',
      artistId: 'bibi',
      eventId: 'event2'
    })
  },
  {
    id: 'qr5',
    data: JSON.stringify({
      type: 'nft',
      tier: 'supporter',
      artistId: 'bibi',
      eventId: 'event2'
    })
  },
  {
    id: 'qr6',
    data: JSON.stringify({
      type: 'nft',
      tier: 'fan',
      artistId: 'chanwon',
      eventId: 'event3'
    })
  },
  {
    id: 'qr7',
    data: JSON.stringify({
      type: 'nft',
      tier: 'supporter',
      artistId: 'chanwon',
      eventId: 'event3'
    })
  },
  {
    id: 'qr8',
    data: JSON.stringify({
      type: 'nft',
      tier: 'earlybird',
      artistId: 'chanwon',
      eventId: 'event3'
    })
  }
];