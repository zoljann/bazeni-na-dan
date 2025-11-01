export type Pool = {
  id: string;
  title: string;
  city: string;
  capacity: number;
  pricePerDay?: number;
  description: string;
  images: string[];
  availableDays?: string[];
  filters?: {
    heated: boolean;
    petsAllowed: boolean;
  };
};
