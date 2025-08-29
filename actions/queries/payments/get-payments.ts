import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ExtendedUser } from "@/types/next-auth";

export const getPayments = async ({
  user,
  searchParams,
  currentPage,
  paymentsPerPage,
}: {
  user?: ExtendedUser;
  searchParams: Promise<{ [key: string]: string | undefined }>;
  currentPage: number;
  paymentsPerPage?: number;
}) => {
  const { agency, search } = await searchParams;

  return await db.payment.findMany({
    where: {
      ...(search && {
        OR: [
          {
            paymentRef: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            reservationRef: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            reservation: {
              travel: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
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
        ],
      }),
      ...(agency && {
        userId: agency,
      }),
      ...(user?.role === "USER" && {
        userId: user.id || "",
      }),
    },
    include: {
      user: true,
      reservation: {
        include: {
          payments: true,
          reservationRooms: {
            include: {
              reservationMembers: true,
            },
          },
          travel: {
            include: {
              prices: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(paymentsPerPage && {
      skip: paymentsPerPage * (currentPage - 1),
      take: paymentsPerPage,
    }),
  });
};
