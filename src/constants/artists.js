// constants/artists.js
export const ARTISTS = {
  gidle: {
    id: 'gidle',
    name: '여자아이들',
    description: '큐브 엔터테인먼트 소속의 5인조 걸그룹',
    logo: require('../assets/artists/gidle/logo.png'),
    groupImage: require('../assets/artists/gidle/group.jpg'),
    primaryColor: '#1A237E', // 네이비 블루
    secondaryColor: '#6A1B9A', // 퍼플
    accentColor: '#FFD700', // 골드
    members: [
      { id: 'miyeon', name: '미연', image: require('../assets/artists/gidle/members/miyeon.jpg') },
      { id: 'minnie', name: '민니', image: require('../assets/artists/gidle/members/minnie.jpg') },
      { id: 'soyeon', name: '소연', image: require('../assets/artists/gidle/members/soyeon.jpg') },
      { id: 'yuqi', name: '우기', image: require('../assets/artists/gidle/members/yuqi.jpg') },
      { id: 'shuhua', name: '슈화', image: require('../assets/artists/gidle/members/shuhua.jpg') }
    ]
  },
  bibi: {
    id: 'bibi',
    name: '비비',
    description: '매력적인 보컬과 독특한 음악 스타일의 솔로 아티스트',
    logo: require('../assets/artists/bibi/logo.png'),
    groupImage: require('../assets/artists/bibi/profile.jpg'),
    primaryColor: '#D32F2F', // 레드
    secondaryColor: '#212121', // 블랙
    accentColor: '#FFC107', // 골드
    members: [
      { id: 'bibi', name: '비비', image: require('../assets/artists/bibi/profile.jpg') }
    ]
  },
  chanwon: {
    id: 'chanwon',
    name: '이찬원',
    description: '감성적인 목소리와 친근한 매력의 트로트 가수',
    logo: require('../assets/artists/chanwon/logo.png'),
    groupImage: require('../assets/artists/chanwon/profile.jpg'),
    primaryColor: '#004D40', // 딥 그린
    secondaryColor: '#37474F', // 다크 블루그레이
    accentColor: '#FFB300', // 앰버
    members: [
      { id: 'chanwon', name: '이찬원', image: require('../assets/artists/chanwon/profile.jpg') }
    ]
  }
};