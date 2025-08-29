"use server";

import { db } from "@/lib/db";

export const checkUsernameAvailability = async (username: string) => {
  return db.user.findUnique({
    where: { username },
  });
};
