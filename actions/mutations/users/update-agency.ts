"use server";

import { ManageAgencyformSchema } from "@/components/forms/manage-agency-form";
import z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteEverythingFile } from "../delete-everthing-file";

export const updateAgency = async ({
  data: { address, email, name, phone, username, image, password },
  userId,
  imagesToDelete,
}: {
  data: z.infer<typeof ManageAgencyformSchema>;
  userId?: string;
  imagesToDelete: {
    id: string;
    type: string;
  }[];
}) => {
  if (!userId) {
    throw new Error("User not found");
  }

  let hashedPassowrd: string | undefined = undefined;

  if (password) {
    hashedPassowrd = await bcrypt.hash(password, 10);
  }

  if (!!imagesToDelete.length) {
    await deleteEverythingFile(imagesToDelete[0]);
  }

  await db.user.update({
    where: { id: userId },
    data: {
      email,
      username,
      image,
      address,
      name,
      password: hashedPassowrd,
      phone,
    },
  });

  revalidatePath("/");
};
