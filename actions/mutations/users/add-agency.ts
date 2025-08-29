"use server";

import bcrypt from "bcryptjs";
import { ManageAgencyformSchema } from "@/components/forms/manage-agency-form";
import z from "zod";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const addAgency = async ({
  email,
  name,
  password,
  phone,
  username,
  image,
  address,
}: z.infer<typeof ManageAgencyformSchema>) => {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }
  const hashedPassowrd = await bcrypt.hash(password!, 10);

  const user = await db.user.create({
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

  return { success: user };
};
