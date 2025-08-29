"use server";

import { db } from "@/lib/db";

export const checkPaymentAvailability = async (paymentRef: string) => {
  return db.payment.findUnique({
    where: { paymentRef: paymentRef },
  });
};
