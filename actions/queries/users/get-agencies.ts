import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const getAgencies = async (
  currentPage: number,
  agenciesPerPage: number,
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
    DateTo.setDate(DateTo.getDate() + 1);
  }

  const users = await db.user.findMany({
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
    skip: agenciesPerPage * (currentPage - 1),
    take: agenciesPerPage,
  });

  return users;
};
