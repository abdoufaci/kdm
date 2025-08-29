"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const deleteTravel = async (travelId?: string) => {
  if (!travelId) {
    throw new Error("Travel not found");
  }

  await db.travel.delete({
    where: { id: travelId },
  });

  revalidatePath("/");
};
