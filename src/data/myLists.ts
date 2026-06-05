export type MyListRestaurant = {
  id: string;
  listItemId?: string;
  name: string;
  address: string;
  imageUri?: string;
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
