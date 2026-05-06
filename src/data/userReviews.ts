import { MyReview } from './myReviews';

export const userReviewsByUserId: Record<string, MyReview[]> = {
  'following-1': [
    {
      id: 'user-following-1-review-1',
      restaurantName: '와이앤웍 용인직영점',
      category: '중식',
      date: '2026.04.26',
      content: '짬뽕이 진하고 불향이 잘 살아있어서 재방문 의사 있어요.',
      likes: 14,
      dislikes: 1,
      imageUris: ['https://picsum.photos/seed/user-review-1/1200/1200'],
    },
    {
      id: 'user-following-1-review-2',
      restaurantName: '짬뽕관 용인역북점',
      category: '중식',
      date: '2026.04.18',
      content: '해장할 때 생각나는 스타일이에요. 국물이 꽤 시원합니다.',
      likes: 9,
      dislikes: 0,
    },
  ],
  'following-2': [
    {
      id: 'user-following-2-review-1',
      restaurantName: '공탕 용산본점',
      category: '한식',
      date: '2026.04.20',
      content: '국물이 진하고 고기도 부드러워서 점심 한 끼로 만족스러웠어요.',
      likes: 22,
      dislikes: 2,
      imageUris: ['https://picsum.photos/seed/user-review-2/1200/1200'],
    },
  ],
  'follower-4': [
    {
      id: 'user-follower-4-review-1',
      restaurantName: '미식회관',
      category: '양식',
      date: '2026.04.23',
      content: '분위기가 좋아서 데이트 코스로 추천하고 싶은 곳입니다.',
      likes: 31,
      dislikes: 1,
      imageUris: [
        'https://picsum.photos/seed/user-review-3/1200/1200',
        'https://picsum.photos/seed/user-review-4/1200/1200',
      ],
    },
    {
      id: 'user-follower-4-review-2',
      restaurantName: '제주둘레국수',
      category: '한식',
      date: '2026.04.11',
      content: '국수 면발이 탱글해서 가볍게 먹기 좋았어요.',
      likes: 12,
      dislikes: 0,
    },
  ],
};
