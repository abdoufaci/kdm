"use server";

import { ManageReservationformSchema } from "@/components/forms/manage-reservation-form";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import z from "zod";
import ShortUniqueId from "short-unique-id";

export const addReservation = async ({
  data,
  travelId,
  currentAvailabelSports,
}: {
  data: z.infer<typeof ManageReservationformSchema>;
  travelId?: string;
  currentAvailabelSports: number;
}) => {
  if (!travelId) {
    throw new Error("Travel not found");
  }

  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { meccahHotel, madinaHotel, members } = data;

  const availabelSpots =
    currentAvailabelSports -
    members.filter((member) => member.type !== "BABY").length;

  if (availabelSpots < 0) {
    return { error: "Places disponibles insuffisantes" };
  }

  const uid = new ShortUniqueId({ length: 10 });
  const ref = uid.rnd();

  await db.travel.update({
    where: { id: travelId },
    data: {
      availabelSpots: String(availabelSpots),
      reservations: {
        create: {
          ref,
          meccahHotelId: meccahHotel.id,
          madinaHotelId: madinaHotel?.id,
          userId: user.id || "",
          reservationMembers: {
            createMany: {
              //@ts-ignore
              data: members.map(({ id, ...member }) => member),
            },
          },
        },
      },
    },
  });

  revalidatePath("/");
};
