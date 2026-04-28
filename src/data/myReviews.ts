export type MyReview = {
  id: string;
  restaurantName: string;
  category: string;
  date: string;
  content: string;
  likes: number;
  dislikes: number;
  imageUris?: string[];
};

export const myReviews: MyReview[] = [
  {
    id: 'review-1',
    restaurantName: '와이앤웍 용인직영점',
    category: '중식',
    date: '2026.04.20',
    content: '정말 맛있었어요! 특히 새우볶음밥이 일품이었습니다. 재방문 의사 100%',
    likes: 24,
    dislikes: 1,
    imageUris: ['https://www.figma.com/api/mcp/asset/144b83db-c3b6-4b3d-924e-7aed1e78c7f9'],
  },
  {
    id: 'review-2',
    restaurantName: '와이앤웍 용인직영점',
    category: '중식',
    date: '2026.04.22',
    content: '정말 맛있었어요! 항상 너무 맛있게 먹고있습니다!',
    likes: 30,
    dislikes: 1,
    imageUris: [
      'https://www.figma.com/api/mcp/asset/b17e71fa-087b-4274-9f60-c734edd8bdeb',
      'https://www.figma.com/api/mcp/asset/144b83db-c3b6-4b3d-924e-7aed1e78c7f9',
      'https://www.figma.com/api/mcp/asset/b17e71fa-087b-4274-9f60-c734edd8bdeb',
      'https://www.figma.com/api/mcp/asset/144b83db-c3b6-4b3d-924e-7aed1e78c7f9',
      'https://www.figma.com/api/mcp/asset/b17e71fa-087b-4274-9f60-c734edd8bdeb',
    ],
  },
  {
    id: 'review-3',
    restaurantName: '공탕 용산본점',
    category: '한식',
    date: '2026.04.18',
    content: '국물이 진하고 맛있어요. 다만 웨이팅이 좀 길었습니다.',
    likes: 18,
    dislikes: 3,
  },
  {
    id: 'review-4',
    restaurantName: '구름계란덮밥',
    category: '한식',
    date: '2026.03.15',
    content: '덮밥이 달콤하니 너무 맛있어요~~',
    likes: 18,
    dislikes: 3,
  },
];
