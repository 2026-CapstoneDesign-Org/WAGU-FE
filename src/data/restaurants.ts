export type RestaurantMenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
};

export type Restaurant = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  imageUri?: string;
  photoUris?: string[];
  reviewCount?: string;
  address?: string;
  openingHours?: string;
  phone?: string;
  features?: string;
  menuItems?: RestaurantMenuItem[];
};

const chineseMenuItems: RestaurantMenuItem[] = [
  {
    id: 'menu-1',
    name: '짜장면',
    description:
      '진하게 볶아낸 춘장이 면에 착 감기며 고소함이 퍼져 부드럽게 어우러진 짜장면',
    price: '7,500원',
  },
  {
    id: 'menu-2',
    name: '매운 짜장면',
    description: '짜장 소스가 달콤하게 퍼지다가 뚫고 나오는 청양의 알싸함',
    price: '8,500원',
  },
  {
    id: 'menu-3',
    name: '삼선간짜장',
    description: '짜장 속 탱탱한 오징어와 새우가 입안에서 탁 터지는 맛',
    price: '9,500원',
  },
  {
    id: 'menu-4',
    name: '매운고추짬뽕',
    description:
      '입안을 휘감는 매운 향과 불향의 진한 여운, 처음엔 시원하게, 끝엔 얼얼하게',
    price: '11,000원',
  },
];

const westernMenuItems: RestaurantMenuItem[] = [
  {
    id: 'menu-1',
    name: '트러플 크림 파스타',
    description: '트러플 향이 은은하게 번지는 부드러운 크림 파스타',
    price: '16,000원',
  },
  {
    id: 'menu-2',
    name: '부라타 샐러드',
    description: '상큼한 토마토와 부라타 치즈가 어우러진 시그니처 샐러드',
    price: '15,000원',
  },
  {
    id: 'menu-3',
    name: '채끝 스테이크',
    description: '육즙 가득한 채끝을 미디엄 레어로 구워낸 대표 메뉴',
    price: '34,000원',
  },
];

const koreanMenuItems: RestaurantMenuItem[] = [
  {
    id: 'menu-1',
    name: '고기국수',
    description: '진한 사골 육수에 부드러운 수육이 올라간 제주식 국수',
    price: '9,500원',
  },
  {
    id: 'menu-2',
    name: '비빔국수',
    description: '새콤달콤한 양념이 매력적인 매콤한 제주식 비빔국수',
    price: '9,000원',
  },
  {
    id: 'menu-3',
    name: '돔베고기',
    description: '두툼하게 썬 제주식 삶은 돼지고기 한 접시',
    price: '18,000원',
  },
];

const PHOTO_URI_1 = 'https://picsum.photos/seed/wagu-photo-1/1200/1200';
const PHOTO_URI_2 = 'https://picsum.photos/seed/wagu-photo-2/1200/1200';
const PHOTO_URI_3 = 'https://picsum.photos/seed/wagu-photo-3/1200/1200';
const PHOTO_URI_4 = 'https://picsum.photos/seed/wagu-photo-4/1200/1200';

const ynwPhotoUris = [
  PHOTO_URI_1,
  PHOTO_URI_2,
  PHOTO_URI_3,
  PHOTO_URI_4,
  PHOTO_URI_1,
  PHOTO_URI_2,
  PHOTO_URI_3,
  PHOTO_URI_4,
  PHOTO_URI_1,
  PHOTO_URI_2,
  PHOTO_URI_3,
  PHOTO_URI_4,
  PHOTO_URI_1,
  PHOTO_URI_2,
  PHOTO_URI_3,
  PHOTO_URI_4,
  PHOTO_URI_1,
  PHOTO_URI_2,
  PHOTO_URI_3,
  PHOTO_URI_4,
  PHOTO_URI_1,
];

const gongtangPhotoUris = [
  PHOTO_URI_2,
  PHOTO_URI_1,
  PHOTO_URI_3,
  PHOTO_URI_2,
  PHOTO_URI_1,
  PHOTO_URI_3,
];

const misikhoegwanPhotoUris = [
  PHOTO_URI_4,
  PHOTO_URI_1,
  PHOTO_URI_4,
  PHOTO_URI_2,
  PHOTO_URI_4,
];

const jejuPhotoUris = [
  PHOTO_URI_2,
  PHOTO_URI_1,
  PHOTO_URI_2,
  PHOTO_URI_3,
];

export const restaurants: Restaurant[] = [
  {
    id: 'ynw-yongin',
    name: '와이앤웍 용인직영점',
    shortName: '와이앤웍',
    category: '중식',
    imageUri: PHOTO_URI_1,
    photoUris: ynwPhotoUris,
    reviewCount: '3,643',
    address: '경기 용인시 처인구 명지로60번길 15-29 102호',
    openingHours: '브레이크타임 · 17:00에 영업 시작',
    phone: '0507-1494-0341',
    features: '포장, 배달, 무선 인터넷, 예약, 남/녀 화장실 구분, 단체 이용 가능',
    menuItems: chineseMenuItems,
  },
  {
    id: 'gongtang-yongsan',
    name: '공탕 용산본점',
    shortName: '공탕',
    category: '한식',
    photoUris: gongtangPhotoUris,
    reviewCount: '1,284',
    address: '서울 용산구 한강대로 42길 18 1층',
    openingHours: '매일 10:30 - 21:00',
    phone: '02-6012-1184',
    features: '포장, 혼밥, 무선 인터넷',
    menuItems: koreanMenuItems,
  },
  {
    id: 'kintoto-yeokbuk',
    name: '킨토토 역북점',
    shortName: '킨토토',
    category: '일식',
    photoUris: [PHOTO_URI_3, PHOTO_URI_1, PHOTO_URI_3],
    reviewCount: '842',
    address: '경기 용인시 처인구 명지로 41 1층',
    openingHours: '매일 11:00 - 21:00',
    phone: '031-555-1704',
    features: '포장, 배달, 주차',
  },
  {
    id: 'yooksim',
    name: '육심',
    shortName: '육심',
    category: '한식',
    photoUris: [PHOTO_URI_2, PHOTO_URI_1],
    reviewCount: '736',
    address: '경기 용인시 처인구 금령로 88 1층',
    openingHours: '매일 11:30 - 22:00',
    phone: '031-449-0213',
    features: '단체 이용 가능, 예약, 주차',
  },
  {
    id: 'jjambbonggwan-yeokbuk',
    name: '짬뽕관 용인역북점',
    shortName: '짬뽕관',
    category: '중식',
    imageUri: PHOTO_URI_3,
    photoUris: [PHOTO_URI_3, PHOTO_URI_1, PHOTO_URI_3, PHOTO_URI_2],
    reviewCount: '1,512',
    address: '경기 용인시 처인구 역북동 756-18',
    openingHours: '매일 11:00 - 21:30',
    phone: '031-332-2250',
    features: '포장, 배달, 주차, 단체 이용 가능',
    menuItems: chineseMenuItems,
  },
  {
    id: 'misikhoegwan',
    name: '미식회관',
    shortName: '미식회관',
    category: '양식',
    imageUri: PHOTO_URI_4,
    photoUris: misikhoegwanPhotoUris,
    reviewCount: '2,148',
    address: '경기 용인시 수지구 현암로 148 2층',
    openingHours: '매일 11:30 - 22:00',
    phone: '0507-1380-2214',
    features: '예약, 포장, 무선 인터넷, 주차, 남/녀 화장실 구분',
    menuItems: westernMenuItems,
  },
  {
    id: 'jeju-dulle-guksu',
    name: '제주둘레국수',
    shortName: '제주둘레국수',
    category: '한식',
    imageUri: 'https://www.figma.com/api/mcp/asset/b17e71fa-087b-4274-9f60-c734edd8bdeb',
    photoUris: jejuPhotoUris,
    reviewCount: '954',
    address: '경기 용인시 수지구 풍덕천로 119',
    openingHours: '매일 10:00 - 20:00',
    phone: '031-555-0192',
    features: '포장, 유아의자, 대기공간, 무선 인터넷',
    menuItems: koreanMenuItems,
  },
  {
    id: 'jeongseong-sikdang',
    name: '정성식당',
    shortName: '정성식당',
    category: '한식',
    reviewCount: '668',
    address: '경기 수원시 영통구 광교중앙로 140',
    openingHours: '매일 11:00 - 21:00',
    phone: '031-222-7814',
    features: '포장, 예약, 무선 인터넷',
  },
  {
    id: 'sodamjeong',
    name: '소담정',
    shortName: '소담정',
    category: '한식',
    reviewCount: '522',
    address: '경기 성남시 분당구 돌마로 75',
    openingHours: '매일 11:30 - 21:30',
    phone: '031-717-0211',
    features: '포장, 주차',
  },
  {
    id: 'ongi-siktak',
    name: '온기식탁',
    shortName: '온기식탁',
    category: '양식',
    reviewCount: '431',
    address: '경기 용인시 수지구 신봉1로 84',
    openingHours: '매일 11:00 - 21:00',
    phone: '031-264-4102',
    features: '예약, 포장, 무선 인터넷',
    menuItems: westernMenuItems,
  },
  {
    id: 'yullimgak',
    name: '유림각',
    shortName: '유림각',
    category: '중식',
    imageUri: PHOTO_URI_2,
    photoUris: [PHOTO_URI_2, PHOTO_URI_3, PHOTO_URI_1],
    reviewCount: '487',
    address: '경기 용인시 처인구 금령로 72 1층',
    openingHours: '매일 11:00 - 21:00',
    phone: '031-334-1188',
    features: '포장, 배달, 무선 인터넷, 단체 이용 가능',
    menuItems: chineseMenuItems,
  },
];
