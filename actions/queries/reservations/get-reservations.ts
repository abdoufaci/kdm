import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ExtendedUser } from "@/types/next-auth";

export const getReservations = async ({
  travelId,
  user,
  searchParams,
  currentPage,
  reservationsPerPage,
}: {
  travelId?: string;
  user?: ExtendedUser;
  searchParams: Promise<{ [key: string]: string | undefined }>;
  currentPage: number;
  reservationsPerPage?: number;
}) => {
  let DateFrom: Date | null = null;
  let DateTo: Date | null = null;

  const { dateFrom, dateTo, agency, search, date } = await searchParams;

  if (dateFrom) {
    DateFrom = new Date(dateFrom);
  }

  if (dateTo) {
    DateTo = new Date(dateTo);
    DateTo.setDate(DateTo.getDate() + 1);
  }

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

  return await db.reservation.findMany({
    where: {
      ...(search && {
        OR: [
          {
            ref: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            travel: {
              ref: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            user: {
              username: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            meccahHotel: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            madinaHotel: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            reservationMembers: {
              some: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            reservationMembers: {
              some: {
                passportNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      }),
      ...(date &&
        startOfDay &&
        endOfDay && {
          departDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        }),
      ...(DateFrom &&
        DateTo && {
          createdAt: {
            gte: DateFrom,
            lte: DateTo,
          },
        }),
      ...(agency && {
        userId: agency,
      }),
      ...(travelId && {
        travelId,
      }),
      ...(user?.role === "USER" && {
        userId: user.id || "",
      }),
    },
    include: {
      reservationMembers: true,
      ...(user?.role === "ADMIN" && {
        user: true,
      }),
      travel: {
        include: { hotels: true },
      },
      madinaHotel: true,
      meccahHotel: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(reservationsPerPage && {
      skip: reservationsPerPage * (currentPage - 1),
      take: reservationsPerPage,
    }),
  });
};
