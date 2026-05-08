import { ReviewMediaItem } from '../types/reviews';

export type RestaurantReview = {
  id: string;
  restaurantName: string;
  authorName: string;
  isFollowing?: boolean;
  isOwner?: boolean;
  date: string;
  content: string;
  likes: number;
  dislikes: number;
  media?: ReviewMediaItem[];
  imageUris?: string[];
};

export const restaurantReviews: RestaurantReview[] = [
  {
    id: 'ynw-review-1',
    restaurantName: '와이앤웍 용인직영점',
    authorName: '김민지',
    isFollowing: false,
    date: '2026.04.10',
    content:
      '짜장면이 정말 맛있어요. 면도 쫄깃하고 고기도 넉넉하게 들어 있어서 다음에도 다시 올 것 같아요. 탕수육도 바삭하고 소스가 달지 않아서 좋았습니다.',
    likes: 24,
    dislikes: 2,
    imageUris: [
      'https://www.figma.com/api/mcp/asset/144b83db-c3b6-4b3d-924e-7aed1e78c7f9',
      'https://www.figma.com/api/mcp/asset/b17e71fa-087b-4274-9f60-c734edd8bdeb',
      'https://www.figma.com/api/mcp/asset/3179bae2-ce11-4d8b-8780-3d3f5836ab3e',
    ],
  },
  {
    id: 'ynw-review-2',
    restaurantName: '와이앤웍 용인직영점',
    authorName: '이서윤',
    isFollowing: true,
    date: '2026.04.08',
    content:
      '매운 짬뽕 먹었는데 국물이 칼칼하니 맛있었어요. 양도 넉넉하고 재료도 신선했습니다. 다만 조금 더 뜨거우면 좋겠어요.',
    likes: 18,
    dislikes: 1,
  },
  {
    id: 'ynw-review-3',
    restaurantName: '와이앤웍 용인직영점',
    authorName: '감자',
    isFollowing: false,
    date: '2026.04.01',
    content:
      '짬뽕이 생각보다 자극적이지 않고 깔끔해서 좋았어요. 탕수육이랑 같이 시키면 조합이 정말 괜찮습니다.',
    likes: 24,
    dislikes: 2,
    imageUris: [
      'https://www.figma.com/api/mcp/asset/144b83db-c3b6-4b3d-924e-7aed1e78c7f9',
      'https://www.figma.com/api/mcp/asset/b17e71fa-087b-4274-9f60-c734edd8bdeb',
      'https://www.figma.com/api/mcp/asset/3179bae2-ce11-4d8b-8780-3d3f5836ab3e',
    ],
  },
  {
    id: 'ynw-review-4',
    restaurantName: '와이앤웍 용인직영점',
    authorName: '먹래용',
    isFollowing: true,
    date: '2026.03.28',
    content:
      '탕수육이 기대 이상으로 바삭하고 소스가 너무 세지 않아서 좋았습니다. 짜장면이랑 같이 시키면 조합이 좋아요.',
    likes: 11,
    dislikes: 0,
  },
  {
    id: 'ynw-review-5',
    restaurantName: '와이앤웍 용인직영점',
    authorName: '짬뽕사랑',
    isFollowing: false,
    date: '2026.03.20',
    content:
      '해물 짬뽕 재료가 신선하고 불향도 좋아서 만족했어요. 매장도 깔끔해서 가족끼리 가기에도 괜찮았습니다.',
    likes: 29,
    dislikes: 3,
    imageUris: [
      'https://www.figma.com/api/mcp/asset/3179bae2-ce11-4d8b-8780-3d3f5836ab3e',
      'https://www.figma.com/api/mcp/asset/144b83db-c3b6-4b3d-924e-7aed1e78c7f9',
    ],
  },
  {
    id: 'gongtang-review-1',
    restaurantName: '공탕 용산본점',
    authorName: '공탕러버',
    isFollowing: false,
    date: '2026.04.12',
    content:
      '국밥이 진하고 고기가 부드러워요. 밥 양도 많아서 든든하게 한 끼 하기 좋았습니다.',
    likes: 15,
    dislikes: 1,
  },
  {
    id: 'misik-review-1',
    restaurantName: '미식회관',
    authorName: '양식덕후',
    isFollowing: true,
    date: '2026.04.06',
    content:
      '파스타가 꾸덕하고 플레이팅이 좋아서 데이트 장소로도 괜찮았어요.',
    likes: 21,
    dislikes: 0,
  },
  {
    id: 'jeju-review-1',
    restaurantName: '제주둘레국수',
    authorName: '국수매니아',
    isFollowing: false,
    date: '2026.04.03',
    content:
      '고기국수 국물이 진하고 깔끔해요. 돔베고기랑 같이 먹으면 더 좋습니다.',
    likes: 12,
    dislikes: 0,
  },
];
