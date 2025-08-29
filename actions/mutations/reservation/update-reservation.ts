"use server";

import { ManageReservationformSchema } from "@/components/forms/manage-reservation-form";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import z from "zod";
import { deleteEverythingFile } from "../delete-everthing-file";

export const updateReservation = async ({
  data,
  reservationId,
  imagesToDelete,
}: {
  data: z.infer<typeof ManageReservationformSchema>;
  reservationId?: string;
  imagesToDelete: {
    id: string;
    type: string;
  }[];
}) => {
  if (!reservationId) {
    throw new Error("Reservation not found");
  }

  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!!imagesToDelete.length) {
    imagesToDelete.map(async (image) => {
      await deleteEverythingFile(image);
    });
  }

  const { meccahHotel, madinaHotel, members } = data;

  await db.reservation.update({
    where: { id: reservationId },
    data: {
      reservationMembers: {
        updateMany: members.map(({ id, ...member }) => ({
          where: { id: id },
          data: member,
        })),
      },
    },
  });

  revalidatePath("/");
};
