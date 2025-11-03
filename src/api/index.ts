import axios, { AxiosError } from "axios";
import env from "../utility/env";
import type { Pool } from "src/types";

const api = axios.create({
  baseURL: env.apiUrl,
});

function handleApiError(e: unknown): ApiError {
  const error = (e instanceof AxiosError && e?.response?.data) || e;
  const httpCode = e instanceof AxiosError && e.response?.status;

  return {
    state: "error",
    message:
      (error.code === "ERR_NETWORK" && "Network error") ||
      (httpCode && httpCode >= 400 && httpCode < 600 && "Server error") ||
      error?.details ||
      error?.message,
  };
}

interface ApiError {
  message: string;
  state: "error";
}

type AvailablePoolsSuccess = {
  state: "success";
  pools: Pool[];
};

type PoolByIdSuccess = {
  state: "success";
  pool: Pool;
};

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return fmt(d);
}

export async function getAvailablePools(): Promise<
  AvailablePoolsSuccess | ApiError
> {
  try {
    /*     const { data } = await api.get("/pools", {
      params: city ? { city } : undefined,
    });

    return {
      state: "success",
      pools: data.pools,
    }; */

    const demoImg =
      "https://t3.ftcdn.net/jpg/02/80/11/26/360_F_280112608_32mLVErazmuz6OLyrz2dK4MgBULBUCSO.jpg";

    await new Promise((r) => setTimeout(r, 500));

    return {
      state: "success",
      pools: [
        {
          id: "1",
          title: "Vila Sunce",
          city: "Mostar",
          capacity: 8,
          pricePerDay: 150,
          images: [
            demoImg,
            demoImg,
            demoImg,
            demoImg,
            "https://543677.fs1.hubspotusercontent-na1.net/hubfs/543677/0.pool-in-countryside-setting.jpg",
          ],
          availableDays: [addDays(1), addDays(3), addDays(7), addDays(10)],
          filters: {
            heated: true,
            petsAllowed: true,
          },
          description:
            "Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje. Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bda detaljniji ali nek ga ima da se zna staje i kakoje. Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje ida detaljniji ali nek ga ima da se zna staje i kakoje. Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje ida detaljniji ali nek ga ima da se zna staje i kakoje. Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje ida detaljniji ali nek ga ima da se zna staje i kakoje. Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje ida detaljniji ali nek ga ima da se zna staje i kakoje. Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje ida detaljniji ali nek ga ima da se zna staje i kakoje. Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje iazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.Ovo je opis bazena mozda detaljniji ali nek ga ima da se zna staje i kakoje.",
        },
        {
          id: "2",
          title: "Plavi Raj",
          city: "Sarajevo",
          capacity: 6,
          pricePerDay: 200,
          images: [demoImg],
          availableDays: [addDays(2), addDays(3), addDays(5), addDays(9)],
          filters: {
            heated: true,
            petsAllowed: true,
          },
        },
        {
          id: "3",
          title: "Jadranska Laguna",
          city: "Neum",
          capacity: 10,
          pricePerDay: 280,
          images: [demoImg],
          availableDays: [addDays(1), addDays(4), addDays(6), addDays(8)],
        },
        {
          id: "4",
          title: "Zeleni Brežuljak",
          city: "Banja Luka",
          capacity: 14,
          pricePerDay: 240,
          images: [demoImg],
          availableDays: [addDays(2), addDays(6), addDays(10), addDays(14)],
          filters: {
            heated: true,
            petsAllowed: true,
          },
        },
        {
          id: "5",
          title: "Mostarska Terasa",
          city: "Mostar",
          capacity: 9,
          pricePerDay: 190,
          images: [demoImg],
          availableDays: [addDays(3), addDays(4), addDays(11)],
        },
      ],
    };
  } catch (e) {
    return handleApiError(e);
  }
}

export async function getPoolById(
  id: string,
): Promise<PoolByIdSuccess | ApiError> {
  try {
    /*     const { data } = await api.get("/pool", {
      params: { id },
    });
    return { state: "success", pool: data }; */

    const all = await getAvailablePools();
    if (all.state === "error") return all;

    const found = all.pools.find((p) => p.id === id);
    if (!found) {
      return { state: "error", message: "Bazen nije pronađen." };
    }
    await new Promise((r) => setTimeout(r, 10));

    return { state: "success", pool: found };
  } catch (e) {
    return handleApiError(e);
  }
}
