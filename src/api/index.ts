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
          images: [demoImg],
          availableDays: [addDays(1), addDays(3), addDays(7), addDays(10)],
        },
        {
          id: "2",
          title: "Plavi Raj",
          city: "Sarajevo",
          capacity: 6,
          pricePerDay: 200,
          images: [demoImg],
          availableDays: [addDays(2), addDays(3), addDays(5), addDays(9)],
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
