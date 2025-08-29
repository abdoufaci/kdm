"use server";

import { ManageTravelformSchema } from "@/components/forms/manage-travel-form";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import z from "zod";
import ShortUniqueId from "short-unique-id";

export const addTravel = async (
  data: z.infer<typeof ManageTravelformSchema>
) => {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const uid = new ShortUniqueId({ length: 10 });

  const ref = uid.rnd();
  const meccahMadinaDays = `${data.madinaDays} مدينة - ${data.meccahDays} مكة`;
  const {
    meccahDays,
    madinaDays,
    madinaHotels,
    meccahHotels,
    prices,
    ...rest
  } = data;
  const restData = rest;

  const hotels = [
    ...madinaHotels.map((hotel) => ({ id: hotel.id })),
    ...meccahHotels.map((hotel) => ({ id: hotel.id })),
  ];

  await db.travel.create({
    data: {
      ...restData,
      meccahMadinaDays,
      userId: user.id || "",
      ref,
      hotels: {
        connect: hotels,
      },
      prices: {
        createMany: {
          data: prices.map(({ id, ...price }) => price),
        },
      },
    },
  });

  revalidatePath("/");
};
