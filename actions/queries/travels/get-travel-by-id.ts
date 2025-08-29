import { db } from "@/lib/db";

export const getTravelById = async (travelId: string) => {
  return await db.travel.findUnique({
    where: { id: travelId },
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
      hotels: true,
      prices: {
        include: {
          hotel: true,
        },
      },
    },
  });
};
