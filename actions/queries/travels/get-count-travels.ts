import { db } from "@/lib/db";
import { ExtendedUser } from "@/types/next-auth";
import { Prisma } from "@prisma/client";

export const getTravelsCount = async (
  searchParams: Promise<{ [key: string]: string | undefined }>,
  user?: ExtendedUser
) => {
  const { distribution, duration, date, search } = await searchParams;

  let defaultDate: Date | null = null;
  let startOfDay: Date | null = null;
  let endOfDay: Date | null = null;
  if (date) {
    defaultDate = new Date(date);
    startOfDay = new Date(defaultDate);
    endOfDay = new Date(defaultDate);
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay.setHours(23, 59, 59, 999);
  }

  return await db.travel.count({
    where: {
      ...(user?.role === "USER" && {
        availabelSpots: {
          not: "0",
        },
      }),
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            ref: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
      ...(distribution && {
        meccahMadinaDays: distribution,
      }),
      ...(duration && {
        duration,
      }),
      ...(date &&
        startOfDay &&
        endOfDay && {
          departDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
