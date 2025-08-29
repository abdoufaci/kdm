"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const deleteUser = async (userId?: string) => {
  if (!userId) {
    throw new Error("User not found");
  }

  await db.user.delete({
    where: { id: userId },
  });

  revalidatePath("/");
};
