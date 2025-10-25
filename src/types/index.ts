export type Pool = {
  id: string;
  title: string;
  city: string;
  capacity: number;
  pricePerDay?: number;
  images: string[];
  availableDays?: string[];
  filters?: {
    heated: string;
    petsAllowed: string;
  }
};
