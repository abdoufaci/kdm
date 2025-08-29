import { db } from "@/lib/db";
import { format } from "date-fns";

export const getTravelDistinctValues = async () => {
  const data = await db.travel.findMany({
    select: {
      duration: true,
      departDate: true,
      meccahMadinaDays: true,
    },
    distinct: ["duration", "departDate", "meccahMadinaDays"],
  });

  return {
    durations: data
      .map((data) => data.duration)
      .sort((a, b) => Number(b) - Number(a)),
    departDates: [
      ...new Set(
        data
          .map((data) => data.departDate)
          .sort((a, b) => a.getTime() - b.getTime())
          .map((departDate) => format(departDate, "dd/MM/yyyy"))
      ),
    ],
    distributions: data.map((data) => data.meccahMadinaDays),
  };
};
