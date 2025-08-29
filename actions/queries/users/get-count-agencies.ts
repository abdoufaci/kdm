import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const getAgenciesCount = async (
  searchParams: Promise<{ [key: string]: string | undefined }>
) => {
  let DateFrom: Date | null = null;
  let DateTo: Date | null = null;

  const { dateFrom, dateTo, search } = await searchParams;

  if (dateFrom) {
    DateFrom = new Date(dateFrom);
  }

  if (dateTo) {
    DateTo = new Date(dateTo);
  }

  return await db.user.count({
    where: {
      role: "USER",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(DateFrom &&
        DateTo && {
          createdAt: {
            gte: DateFrom,
            lte: DateTo,
          },
        }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
