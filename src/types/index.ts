export type Pool = {
  id: string;
  title: string;
  city: string;
  capacity: number;
  images: string[];
  pricePerDay?: number | undefined;
  description?: string | undefined;
  availableDays?: string[] | undefined;
  filters?: {
    heated: boolean;
    petsAllowed: boolean;
  };
};
//stvari koje dodju undefined znaci da ih nema tj. ne koriste se
