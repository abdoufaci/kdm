"use server";

import { db } from "@/lib/db";

export const checkReservationAvailability = async (reservationRef: string) => {
  return db.reservation.findUnique({
    where: { ref: reservationRef },
  });
};
