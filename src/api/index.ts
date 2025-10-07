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
            "https://leisurepoolscanada.ca/wp-content/uploads/2020/06/best-type-of-swimming-pool-for-my-home_2.jpg",
            "https://media.istockphoto.com/id/1825000760/photo/swimming-pool-underwater.jpg?s=612x612&w=0&k=20&c=dv0Rwh7oQmjUBmyWriv2lHLq03u_noDfr5nG8ydxJGU=",
          ],
        },
        {
          id: "2",
          title:
            "Oaza MirAAA A A AAAAAAAAAA NEKA TAMO MIRA NEMAM POJMA KOJE MIRA S A AA  A ASAAS a",
          city: "Sarajevo",
          capacity: 12,
          pricePerDay: 220,
          images: [demoImg],
        },
        {
          id: "3",
          title: "Plavi Raj",
          city: "Tuzla  a a a a a aasassasssi",
          capacity: 6,
          images: [demoImg],
        },
        {
          id: "4",
          title: "Jadranska Laguna",
          city: "Neum",
          capacity: 10,
          pricePerDay: 280,
          images: [demoImg],
        },
        {
          id: "5",
          title: "Zeleni Brežuljak",
          city: "Banja Luka",
          capacity: 14,
          pricePerDay: 240,
          images: [demoImg],
        },
        {
          id: "6",
          title: "Kamenita Bašta",
          city: "Konjic",
          capacity: 5,
          images: [demoImg],
        },
        {
          id: "7",
          title: "Mostarska Terasa",
          city: "Mostar",
          capacity: 9,
          pricePerDay: 190,
          images: [demoImg],
        },
        {
          id: "8",
          title: "Rimski Izvor",
          city: "Ilidža",
          capacity: 7,
          pricePerDay: 170,
          images: [demoImg],
        },
        {
          id: "9",
          title: "Mala Laguna",
          city: "Zenica",
          capacity: 4,
          images: [demoImg],
        },
      ],
    };
  } catch (e) {
    return handleApiError(e);
  }
}
