"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const updateReservationRoom = async ({
  reservationId,
  room,
}: {
  room: string;
  reservationId: string;
}) => {
  const user = await currentUser();

  if (user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // await db.reservation.update({
  //   where: {
  //     id: reservationId,
  //   },
  //   data: {
  //     room,
  //   },
  // });

  revalidatePath("/");
};
