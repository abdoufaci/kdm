import { db } from "@/lib/db";
import { format } from "date-fns";

export const getReservationValues = async (travelId?: string) => {
  const data = await db.travel.findMany({
    where: {
      reservations: {
        some: {},
      },
    },
    select: {
      departDate: true,
    },
    distinct: ["duration", "departDate", "meccahMadinaDays"],
  });

  const agencies = await db.user.findMany({
    where: {
      reservations: {
        some: {
          ...(travelId && {
            travelId,
          }),
        },
      },
    },
  });

  return {
    agencies,
    departDates: [
      ...new Set(
        data
          .map((data) => data.departDate)
          .sort((a, b) => a.getTime() - b.getTime())
          .map((departDate) => format(departDate, "dd/MM/yyyy"))
      ),
    ],
  };
};
