export type Pool = {
  id: string;
  userId: string;
  title: string;
  city: string;
  capacity: number;
  images: string[];
  pricePerDay?: number | undefined; //ako je undefined cijena znaci da je po dogovoru ono
  description?: string | undefined;
  busyDays?: string[] | undefined; //ako undefined dodje znaci nema ukljucen kalenmdar dostupnosti
  filters?: {
    heated: boolean;
    petsAllowed: boolean;
  };
};

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
