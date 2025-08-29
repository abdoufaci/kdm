"use server";

import { ManagePaymentformSchema } from "@/components/forms/manage-payment-form";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import z from "zod";

export const addPayment = async ({
  data,
}: {
  data: z.infer<typeof ManagePaymentformSchema>;
}) => {
  const user = await currentUser();

  const reservation = await db.reservation.findUnique({
    where: { ref: data.reservationRef },
    include: {
      payments: true,
      reservationRooms: {
        include: {
          reservationMembers: true,
          madinaHotel: true,
          meccahHotel: true,
        },
      },
      user: true,
      travel: {
        include: {
          reservations: {
            include: {
              reservationRooms: {
                include: {
                  reservationMembers: true,
                  madinaHotel: true,
                  meccahHotel: true,
                },
              },
            },
          },
          hotels: true,
          prices: {
            include: {
              hotel: true,
            },
          },
        },
      },
    },
  });

  const total =
    reservation?.reservationRooms.reduce((acc, room) => {
      const target = reservation.travel.prices.find(
        (price) => price.hotelId === room.meccahHotelId
      );
      return (
        acc +
        Number(
          room.roomType === "DOUBLE"
            ? target?.double
            : room.roomType === "TRIPLE"
              ? target?.triple
              : room.roomType === "QUADRUPLE"
                ? target?.quadruple
                : target?.quintuple
        ) +
        room.reservationMembers
          .filter((member) => !!member.foodIclusions)
          .reduce((acc) => acc + Number(target?.food), 0)
      );
    }, 0) || 0;
  const totalPayments =
    reservation?.payments.reduce((acc, curr) => acc + Number(curr.amount), 0) ||
    0;

  await db.reservation.update({
    where: { ref: data.reservationRef },
    data: {
      history: {
        create: {
          amount: data.amount,
          userId: user?.id || "",
          type: "PAYMENT",
        },
      },
      status: "CONFIRMED",
      paymentStatus:
        totalPayments + Number(data.amount) >= total ? "COMPLETED" : "PENDING",
      payments: {
        create: {
          amount: data.amount,
          paymentRef: data.paymentRef,
          userId: user?.id || "",
        },
      },
    },
  });

  revalidatePath("/");
};
