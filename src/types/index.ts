export type Pool = {
  id: string;
  userId: string;
  title: string;
  city: string;
  capacity: number;
  images: string[];
  isVisible: boolean;
  pricePerDay?: number;
  description?: string;
  busyDays?: string[];
  filters?: { heated: boolean; petsAllowed: boolean };
  owner?: { name: string; avatarUrl: string, mobileNumber: string }
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  avatarUrl?: string;
};
