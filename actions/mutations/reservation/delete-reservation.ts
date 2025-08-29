"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const deleteReservation = async (reservationId?: string) => {
  if (!reservationId) {
    throw new Error("Reservation not found");
  }

  await db.reservation.delete({
    where: { id: reservationId },
  });

  revalidatePath("/");
};
