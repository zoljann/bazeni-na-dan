export type Pool = {
  id: string;
  userId: string;
  title: string;
  city: string;
  capacity: number;
  images: string[];
  pricePerDay?: number;
  description?: string;
  busyDays?: string[];
  filters?: { heated: boolean; petsAllowed: boolean };
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  avatarUrl?: string;
};
