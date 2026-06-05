export type RestaurantMenuItem = {
  description?: string;
  id: string;
  name: string;
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
  externalPlaceId?: string;
  externalSearchQuery?: string;
  isExternalFallback?: boolean;
  source?: string;
};
