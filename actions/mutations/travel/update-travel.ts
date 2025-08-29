"use server";

import { ManageTravelformSchema } from "@/components/forms/manage-travel-form";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import z from "zod";
import ShortUniqueId from "short-unique-id";
import { HotelLocation } from "@prisma/client";

export const updateTravel = async ({
  data,
  travelId,
  hotelsToRemove,
}: {
  data: z.infer<typeof ManageTravelformSchema>;
  travelId?: string;
  hotelsToRemove: {
    name: string;
    location: HotelLocation;
    id: string;
  }[];
}) => {
  if (!travelId) {
    throw new Error("travel not found");
  }
  const meccahMadinaDays = `${data.madinaDays} مدينة - ${data.meccahDays} مكة`;
  const {
    meccahDays,
    madinaDays,
    meccahHotels,
    madinaHotels,
    prices,
    ...rest
  } = data;

  const hotels = [
    ...madinaHotels.map((hotel) => ({ id: hotel.id })),
    ...meccahHotels.map((hotel) => ({ id: hotel.id })),
  ];

  await db.travel.update({
    where: { id: travelId },
    data: {
      ...rest,
      meccahMadinaDays,
      hotels: {
        connect: hotels,
        disconnect: hotelsToRemove.map((hotel) => ({ id: hotel.id })),
      },
      prices: {
        deleteMany: {},
        createMany: {
          data: prices.map(({ id, ...price }) => price),
        },
      },
    },
  });

  revalidatePath("/");
};
