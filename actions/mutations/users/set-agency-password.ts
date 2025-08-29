"use server";

import { SetAgencyPasswordformSchema } from "@/components/forms/set-agency-password-form";
import { db } from "@/lib/db";
import z from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export const setAgencyPassword = async ({
  data,
  userId,
}: {
  data: z.infer<typeof SetAgencyPasswordformSchema>;
  userId?: string;
}) => {
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const hashedPassowrd = await bcrypt.hash(data.password!, 10);

  await db.user.update({
    where: { id: userId },
    data: {
      password: hashedPassowrd,
    },
  });

  revalidatePath("/");
};
