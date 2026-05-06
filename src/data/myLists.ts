export type MyListRestaurant = {
  id: string;
  name: string;
  address: string;
  ratings?: {
    taste: number;
    service: number;
    value: number;
  };
};

export type MyList = {
  id: string;
  title: string;
  isRepresentative: boolean;
  isPrivate: boolean;
  restaurantCount: number;
  accentColor: string;
  restaurants: MyListRestaurant[];
};

function createRestaurant(id: string, name: string, address: string): MyListRestaurant {
  return { id, name, address };
}

export const initialMyLists: MyList[] = [
  {
    id: 'my-list-1',
    title: '용인 맛집 투어',
    isRepresentative: true,
    isPrivate: false,
    restaurantCount: 5,
    accentColor: '#F46A67',
    restaurants: [
      createRestaurant(
        'ynw-yongin',
        '와이앤웍 용인직영점',
        '경기 용인시 처인구 명지로 60번길 15-29 102호',
      ),
      createRestaurant(
        'gongtang-yongsan',
        '공탕 용산본점',
        '서울 용산구 새창로 42길 18 1층',
      ),
      createRestaurant(
        'kintoto-yeokbuk',
        '킨토토 역북점',
        '경기 용인시 처인구 명지로 41 1층',
      ),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant(
        'jjambbonggwan-yeokbuk',
        '짬뽕관 용인역북점',
        '경기 용인시 처인구 역북동 756-18',
      ),
    ],
  },
  {
    id: 'my-list-2',
    title: '서울 중식당 베스트',
    isRepresentative: false,
    isPrivate: true,
    restaurantCount: 5,
    accentColor: '#56CDB5',
    restaurants: [
      createRestaurant(
        'gongtang-yongsan',
        '공탕 용산본점',
        '서울 용산구 새창로 42길 18 1층',
      ),
      createRestaurant(
        'ynw-yongin',
        '와이앤웍 용인직영점',
        '경기 용인시 처인구 명지로 60번길 15-29 102호',
      ),
      createRestaurant(
        'jjambbonggwan-yeokbuk',
        '짬뽕관 용인역북점',
        '경기 용인시 처인구 역북동 756-18',
      ),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant(
        'kintoto-yeokbuk',
        '킨토토 역북점',
        '경기 용인시 처인구 명지로 41 1층',
      ),
    ],
  },
  {
    id: 'my-list-3',
    title: '데이트 코스 맛집',
    isRepresentative: false,
    isPrivate: false,
    restaurantCount: 5,
    accentColor: '#8361C8',
    restaurants: [
      createRestaurant('misikhoegwan', '미식회관', '경기 용인시 수지구 현암로 148 2층'),
      createRestaurant(
        'gongtang-yongsan',
        '공탕 용산본점',
        '서울 용산구 새창로 42길 18 1층',
      ),
      createRestaurant(
        'ynw-yongin',
        '와이앤웍 용인직영점',
        '경기 용인시 처인구 명지로 60번길 15-29 102호',
      ),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant(
        'jjambbonggwan-yeokbuk',
        '짬뽕관 용인역북점',
        '경기 용인시 처인구 역북동 756-18',
      ),
    ],
  },
  {
    id: 'my-list-4',
    title: '혼밥하기 좋은 곳',
    isRepresentative: false,
    isPrivate: false,
    restaurantCount: 5,
    accentColor: '#F6B033',
    restaurants: [
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
      createRestaurant(
        'kintoto-yeokbuk',
        '킨토토 역북점',
        '경기 용인시 처인구 명지로 41 1층',
      ),
      createRestaurant(
        'jeju-dulle-guksu',
        '제주둘레국수',
        '경기 용인시 수지구 성복2로 119',
      ),
      createRestaurant(
        'jjambbonggwan-yeokbuk',
        '짬뽕관 용인역북점',
        '경기 용인시 처인구 역북동 756-18',
      ),
      createRestaurant(
        'ynw-yongin',
        '와이앤웍 용인직영점',
        '경기 용인시 처인구 명지로 60번길 15-29 102호',
      ),
    ],
  },
  {
    id: 'my-list-5',
    title: '회사 앞 퇴근 맛집',
    isRepresentative: false,
    isPrivate: true,
    restaurantCount: 5,
    accentColor: '#5D8DF4',
    restaurants: [
      createRestaurant(
        'ynw-yongin',
        '와이앤웍 용인직영점',
        '경기 용인시 처인구 명지로 60번길 15-29 102호',
      ),
      createRestaurant(
        'jjambbonggwan-yeokbuk',
        '짬뽕관 용인역북점',
        '경기 용인시 처인구 역북동 756-18',
      ),
      createRestaurant(
        'gongtang-yongsan',
        '공탕 용산본점',
        '서울 용산구 새창로 42길 18 1층',
      ),
      createRestaurant('misikhoegwan', '미식회관', '경기 용인시 수지구 현암로 148 2층'),
      createRestaurant(
        'jeju-dulle-guksu',
        '제주둘레국수',
        '경기 용인시 수지구 성복2로 119',
      ),
    ],
  },
  {
    id: 'my-list-6',
    title: '가족 외식 추천',
    isRepresentative: false,
    isPrivate: false,
    restaurantCount: 5,
    accentColor: '#E96DC0',
    restaurants: [
      createRestaurant(
        'jeju-dulle-guksu',
        '제주둘레국수',
        '경기 용인시 수지구 성복2로 119',
      ),
      createRestaurant('misikhoegwan', '미식회관', '경기 용인시 수지구 현암로 148 2층'),
      createRestaurant(
        'ynw-yongin',
        '와이앤웍 용인직영점',
        '경기 용인시 처인구 명지로 60번길 15-29 102호',
      ),
      createRestaurant(
        'gongtang-yongsan',
        '공탕 용산본점',
        '서울 용산구 새창로 42길 18 1층',
      ),
      createRestaurant('yooksim', '육심', '경기 용인시 처인구 금령로 88 1층'),
    ],
  },
];
