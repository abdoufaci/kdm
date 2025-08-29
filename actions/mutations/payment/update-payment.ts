"use server";

import { ManagePaymentformSchema } from "@/components/forms/manage-payment-form";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import z from "zod";

export const updatePayment = async ({
  data,
  paymentId,
}: {
  data: z.infer<typeof ManagePaymentformSchema>;
  paymentId: string;
}) => {
  await db.payment.update({
    where: { id: paymentId },
    data: {
      ...data,
    },
  });

  revalidatePath("/");
};
