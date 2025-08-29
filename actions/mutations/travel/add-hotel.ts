"use server";

import { db } from "@/lib/db";
import { HotelLocation } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const addHotel = async ({
  location,
  name,
}: {
  name: string;
  location: HotelLocation;
}) => {
  const hotel = await db.hotel.create({
    data: {
      name,
      location,
    },
  });
  revalidatePath("/");

  return hotel;
};
