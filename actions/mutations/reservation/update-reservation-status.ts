"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReservationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const updateReservationStatus = async ({
  reservationId,
  status,
  oldStatus,
}: {
  reservationId: string;
  status: ReservationStatus;
  oldStatus: ReservationStatus;
}) => {
  const user = await currentUser();

  await db.reservation.update({
    where: { id: reservationId },
    data: {
      status,
      history: {
        create: {
          newStatus: status,
          oldStatus,
          userId: user?.id || "",
          type: "STATUS",
        },
      },
    },
  });

  revalidatePath("/");
};
