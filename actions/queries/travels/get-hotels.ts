import { db } from "@/lib/db";

export const getHotels = async () => {
  return await db.hotel.findMany();
};
