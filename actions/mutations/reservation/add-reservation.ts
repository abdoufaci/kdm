"use server";

import { ManageReservationformSchema } from "@/components/forms/manage-reservation-form";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import z from "zod";
import ShortUniqueId from "short-unique-id";

export const addReservation = async ({
  data,
  travelId,
  currentSavedSpots,
  availabelSpots,
}: {
  data: z.infer<typeof ManageReservationformSchema>;
  travelId?: string;
  currentSavedSpots: number;
  availabelSpots: number;
}) => {
  if (!travelId) {
    throw new Error("Travel not found");
  }

  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { rooms } = data;

  const savedSpots =
    currentSavedSpots +
    rooms.reduce(
      (acc, room) =>
        acc + room.members.filter((member) => member.type === "ADULT").length,
      0
    );

  if (availabelSpots - savedSpots < 0) {
    return { error: "أماكن متوفرة غير كافية" };
  }

  const uid = new ShortUniqueId({ length: 10 });
  const ref = uid.rnd();

  await db.$transaction(async (tx) => {
    // Step 1: Create the reservation with rooms
    const updatedTravel = await tx.travel.update({
      where: { id: travelId },
      data: {
        reservations: {
          //@ts-ignore
          create: {
            ref,
            userId: user.id || "",
            reservationRooms: {
              //@ts-ignore
              create: rooms.map(
                ({ meccahHotel, madinaHotel, roomType, members }) => ({
                  roomType,
                  meccahHotelId: meccahHotel?.id,
                  madinaHotelId: madinaHotel?.id,
                  reservationMembers: {
                    create: members.map((member) => ({
                      id: member.id,
                      name: member.name,
                      type: member.type,
                      dob: member.dob,
                      sex: member.sex,
                      foodIclusions: member.foodIclusions,
                      passport: member.passport,
                      passportNumber: member.passportNumber,
                      passportExpiryDate: member.passportExpiryDate,
                    })),
                  },
                })
              ),
            },
          },
        },
      },
      include: {
        reservations: {
          include: {
            reservationRooms: {
              include: {
                reservationMembers: true,
              },
            },
          },
        },
      },
    });

    return updatedTravel;
  });

  revalidatePath("/");
};
