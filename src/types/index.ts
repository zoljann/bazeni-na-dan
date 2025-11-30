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
  filters?: {
    heated: boolean;
    petsAllowed: boolean;
    partyAllowed: boolean;
    wiFi: boolean;
    bbq: boolean;
  };
  owner?: { name: string; avatarUrl: string; mobileNumber: string };
  visibleUntil: string;
  checkIn?: string;
  checkOut?: string;
  rulesDescription?: string;
  views?: number;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt: string;
  publishedPoolsCount?: number;
};
