import { db } from "@/lib/db";

export const getTravelById = async (travelId: string) => {
  return await db.travel.findUnique({
    where: { id: travelId },
    include: {
      hotels: true,
    },
  });
};
