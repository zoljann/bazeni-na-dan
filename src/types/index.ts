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

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | undefined; //ako je undefined postavi mu neki default avatarUrl na frontu
  mobileNumber: string;
  role: 'host' | 'admin'; //treba li mi i za šta
  pools: Pool[];
};
