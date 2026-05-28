import { MyListRestaurant } from './myLists';

export type UserProfile = {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  followerCount?: string;
  followingCount?: string;
  honorPeriod?: string;
  honorTitle?: string;
  reliabilityGrade?: string;
  reliabilityScore?: number;
  reviewCount?: string;
  representativeListIsLiked?: boolean;
  representativeListId?: string;
  representativeListTitle: string;
  representativeAccentColor: string;
  representativeRestaurants: MyListRestaurant[];
  temperature?: string;
};

const createRestaurant = (id: string, name: string, address: string): MyListRestaurant => ({
  id,
  name,
  address,
});

export const userProfiles: UserProfile[] = [
  {
    id: 'following-1',
    nickname: '라면러버',
    temperature: '36.8도',
    followerCount: '214',
    reviewCount: '42',
    representativeListTitle: '용인 점심 맛집',
    representativeAccentColor: '#F46A67',
    representativeRestaurants: [
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
      createRestaurant('jjambbonggwan-yeokbuk', '짬뽕관 용인역북점', '경기 용인시 처인구 역북동 756-18'),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant('kintoto-yeokbuk', '킨토토 역북점', '경기 용인시 처인구 명지로 41 1층'),
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
    ],
  },
  {
    id: 'following-2',
    nickname: '맛집탐험가',
    temperature: '37.2도',
    followerCount: '531',
    reviewCount: '128',
    representativeListTitle: '서울 중식 베스트',
    representativeAccentColor: '#56CDB5',
    representativeRestaurants: [
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
      createRestaurant('jjambbonggwan-yeokbuk', '짬뽕관 용인역북점', '경기 용인시 처인구 역북동 756-18'),
      createRestaurant('misikhoegwan', '미식회관', '경기 용인시 수지구 성복로 148 2층'),
      createRestaurant('jeju-dulle-guksu', '제주둘레국수', '경기 용인시 수지구 신봉2로 119'),
    ],
  },
  {
    id: 'following-3',
    nickname: '분식왕',
    temperature: '36.5도',
    followerCount: '92',
    reviewCount: '91',
    representativeListTitle: '혼밥하기 좋은 곳',
    representativeAccentColor: '#8361C8',
    representativeRestaurants: [
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant('kintoto-yeokbuk', '킨토토 역북점', '경기 용인시 처인구 명지로 41 1층'),
      createRestaurant('jeju-dulle-guksu', '제주둘레국수', '경기 용인시 수지구 신봉2로 119'),
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
    ],
  },
  {
    id: 'following-4',
    nickname: '대치동맛도리',
    temperature: '37.5도',
    followerCount: '1,542',
    reviewCount: '1,542',
    representativeListTitle: '데이트 코스 맛집',
    representativeAccentColor: '#F6B033',
    representativeRestaurants: [
      createRestaurant('misikhoegwan', '미식회관', '경기 용인시 수지구 성복로 148 2층'),
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant('jeju-dulle-guksu', '제주둘레국수', '경기 용인시 수지구 신봉2로 119'),
    ],
  },
  {
    id: 'following-5',
    nickname: '마라탕중독',
    temperature: '36.9도',
    followerCount: '308',
    reviewCount: '881',
    representativeListTitle: '회사 앞 퇴근 맛집',
    representativeAccentColor: '#5D8DF4',
    representativeRestaurants: [
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
      createRestaurant('jjambbonggwan-yeokbuk', '짬뽕관 용인역북점', '경기 용인시 처인구 역북동 756-18'),
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
      createRestaurant('misikhoegwan', '미식회관', '경기 용인시 수지구 성복로 148 2층'),
      createRestaurant('jeju-dulle-guksu', '제주둘레국수', '경기 용인시 수지구 신봉2로 119'),
    ],
  },
  {
    id: 'follower-1',
    nickname: '가래떡살인마',
    temperature: '36.7도',
    followerCount: '127',
    reviewCount: '911',
    representativeListTitle: '국물 맛집 리스트',
    representativeAccentColor: '#E96DC0',
    representativeRestaurants: [
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
      createRestaurant('jeju-dulle-guksu', '제주둘레국수', '경기 용인시 수지구 신봉2로 119'),
      createRestaurant('jjambbonggwan-yeokbuk', '짬뽕관 용인역북점', '경기 용인시 처인구 역북동 756-18'),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
    ],
  },
  {
    id: 'follower-2',
    nickname: '배가고파요',
    temperature: '36.4도',
    followerCount: '88',
    reviewCount: '221',
    representativeListTitle: '가족 외식 추천',
    representativeAccentColor: '#F46A67',
    representativeRestaurants: [
      createRestaurant('jeju-dulle-guksu', '제주둘레국수', '경기 용인시 수지구 신봉2로 119'),
      createRestaurant('misikhoegwan', '미식회관', '경기 용인시 수지구 성복로 148 2층'),
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
    ],
  },
  {
    id: 'follower-3',
    nickname: '라면땅',
    temperature: '36.1도',
    followerCount: '19',
    reviewCount: '3',
    representativeListTitle: '분식 최애 리스트',
    representativeAccentColor: '#56CDB5',
    representativeRestaurants: [
      createRestaurant('jjambbonggwan-yeokbuk', '짬뽕관 용인역북점', '경기 용인시 처인구 역북동 756-18'),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant('kintoto-yeokbuk', '킨토토 역북점', '경기 용인시 처인구 명지로 41 1층'),
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
    ],
  },
  {
    id: 'follower-4',
    nickname: 'Junn',
    temperature: '37.0도',
    followerCount: '1,012',
    reviewCount: '2,911',
    representativeListTitle: '용인 맛집 투어',
    representativeAccentColor: '#8361C8',
    representativeRestaurants: [
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
      createRestaurant('kintoto-yeokbuk', '킨토토 역북점', '경기 용인시 처인구 명지로 41 1층'),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant('jjambbonggwan-yeokbuk', '짬뽕관 용인역북점', '경기 용인시 처인구 역북동 756-18'),
    ],
  },
  {
    id: 'follower-5',
    nickname: '지윤',
    temperature: '36.6도',
    followerCount: '73',
    reviewCount: '992',
    representativeListTitle: '카페 옆 밥집',
    representativeAccentColor: '#F6B033',
    representativeRestaurants: [
      createRestaurant('misikhoegwan', '미식회관', '경기 용인시 수지구 성복로 148 2층'),
      createRestaurant('jeju-dulle-guksu', '제주둘레국수', '경기 용인시 수지구 신봉2로 119'),
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
      createRestaurant('kintoto-yeokbuk', '킨토토 역북점', '경기 용인시 처인구 명지로 41 1층'),
    ],
  },
  {
    id: 'follower-6',
    nickname: '은소금',
    temperature: '36.3도',
    followerCount: '41',
    reviewCount: '115',
    representativeListTitle: '야식 저장소',
    representativeAccentColor: '#5D8DF4',
    representativeRestaurants: [
      createRestaurant('jjambbonggwan-yeokbuk', '짬뽕관 용인역북점', '경기 용인시 처인구 역북동 756-18'),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant('gongtang-yongsan', '공탕 용산본점', '서울 용산구 새창로 42길 18 1층'),
      createRestaurant('jeju-dulle-guksu', '제주둘레국수', '경기 용인시 수지구 신봉2로 119'),
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
    ],
  },
  {
    id: 'follower-7',
    nickname: '역북동라멘살인마',
    temperature: '37.1도',
    followerCount: '184',
    reviewCount: '632',
    representativeListTitle: '역북동 재방문 맛집',
    representativeAccentColor: '#E96DC0',
    representativeRestaurants: [
      createRestaurant('kintoto-yeokbuk', '킨토토 역북점', '경기 용인시 처인구 명지로 41 1층'),
      createRestaurant('jjambbonggwan-yeokbuk', '짬뽕관 용인역북점', '경기 용인시 처인구 역북동 756-18'),
      createRestaurant('ynw-yongin', '와이앤웍 용인직영점', '경기 용인시 처인구 명지로 60번길 15-29 102호'),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant('misikhoegwan', '미식회관', '경기 용인시 수지구 성복로 148 2층'),
    ],
  },
];
